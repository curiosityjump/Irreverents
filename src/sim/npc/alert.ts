// The area alert, the call that raises it and the task of those who answer
// (Step 4, slice 2). Writeup: docs/mechanisms/npc-response.md, "Calling for help".
import type { Content } from '../../content/types.ts';
import type { Entity, StepContext, World } from '../types.ts';
import { addEntity, findEntity } from '../world.ts';
import { THING_KIND } from './state.ts';

declare module '../types.ts' {
  interface World {
    /**
     * Step 4, the town's tiers: by area, its alert level, for the page to
     * draw the pips wherever the party is (a page is sent only its own
     * room's entities, so the area's `~alert:` entity does not follow you).
     * Written only where an alert changes (raiseAlert, lowerAlert), never
     * deleted (a page takes top-level fields by key); read with a default
     * (a kept game may predate it). Only the display travels: nobody in
     * another room learns anything from it (D-065).
     */
    alerts?: Record<string, number>;
  }
  interface Components {
    /**
     * On one bodiless entity per area ("~alert:<room>"), made by the first
     * completed call there.
     * INTENT (D-065): the area's alert is its own number, apart from every
     * person's mood. On an entity so the server's replication carries it.
     */
    alert?: {
      /** 0 to maxAlert() (MAX_ALERT where the area has no dispatch table). Raised only by raiseAlert(); lowered only by lowerAlert(). */
      level: number;
      /** Ticks of hiding and waiting since the last sighting or incident. */
      quiet: number;
    };
    /** On a person walking to, or ringing, a call point. Owned by systems/npc-call.ts. */
    call?: {
      /** Ticks spent pleading (mood 2) before going to call. */
      plead: number;
      /** Ticks of the call itself made so far; 0 until they stand at the bell. */
      progress: number;
      /** The bell being rung, once started. */
      bell: string | null;
      /** How long the walk to the bell has made no headway. */
      stall: number;
      /** Their dissonance when they last sent (or gave up) a call: they call again only for something new. */
      reported: number;
    };
    /** On a bell while someone rings it: ticks done and ticks needed, for the page to draw. */
    ringing?: { ticks: number; of: number };
    /**
     * On a guard on duty who blows, or has blown, his whistle (Step 4, the
     * town's tiers). Owned by systems/alert-whistle.ts. On his own entity so
     * every page in his room is sent the gauge, as a bell's `ringing` is.
     * DRAFT: doc 27's whistle is "a suggested reconciliation", not a decision.
     */
    whistle?: {
      /** Ticks blown so far; 0 while not blowing. */
      progress: number;
      /** Ticks a whistle takes (for the page to draw the gauge). */
      of: number;
      /** Ticks before he may start again (after a whistle stopped or sent). */
      wait: number;
      /** His dissonance when he last sent (or was stopped in) a whistle: he blows again only for something new. */
      reported: number;
    };
    /**
     * On a person a dispatch row walked in (systems/alert-dispatch.ts): the
     * area they answer to and the door they came by, which is the door they
     * leave by when the alert is over (and are then removed).
     */
    arrival?: {
      area: string;
      door: string;
      /** How long the walk out has made no headway (read with a default: a kept game may lack it). */
      stall?: number;
      /** The row (its index in the table) he walked in with (the escalating guard response; absent on a kept game's: never relieved). */
      row?: number;
      /** Stood down to make room for a stronger row (alert-dispatch, "the stronger relieve the weaker"): he walks out now, whatever the alert. */
      relieved?: boolean;
    };
    /** On a person answering a call. Owned by systems/alert-respond.ts. */
    respond?: {
      phase: 'go' | 'search' | 'chase' | 'return';
      /**
       * Where they are heading, across: the reported place, then wherever
       * they last SAW a hero.
       * INTENT (D-065, "Escalation is not omniscient"): never a hero's
       * position on a tick they do not see that hero.
       */
      x: number;
      /** Which way the search is pacing. */
      dir: 1 | -1;
      /** How long a walk has made no headway. */
      stall: number;
      /** The hero this person saw on their last turn, or null. Written by alert-respond, read by alert-follow. */
      sight?: string | null;
      /** A door of the room they are in that they saw a hero leave by, and mean to follow through. */
      door?: string | null;
    };
  }
  interface EventMap {
    /** INTENT: these four names and fields are a contract with Step 7's legend detector. Exactly these. */
    'call-started': { by: string };
    'call-completed': { by: string; area: string; x: number; y: number };
    'call-stopped': { by: string; why: string };
    'alert-changed': { area: string; from: number; to: number };
  }
}

/** DRAFT (the Step 4 lead's call, in docs/decisions-log.md): the alert runs 0 to 3 in an area with no dispatch table. */
export const MAX_ALERT = 3;

/**
 * The most an area's alert can reach: its dispatch table's row count (one
 * level per row: content/dispatch/<area>.json), else MAX_ALERT.
 * DRAFT (the escalating guard response, 2026-11-25; doc 26's 0-5 ladder is
 * "an IMPLEMENTATION PROPOSAL", used by default under D-096;
 * docs/decisions-log.md, "Step 4: five levels"): the castle town's tables
 * have five rows, so its alert runs 0 to 5. Data, so a sixth level or a
 * fourth is one row added or taken out.
 */
export function maxAlert(content: Content, area: string): number {
  return content.dispatch?.[area]?.rows.length ?? MAX_ALERT;
}

/**
 * DRAFT (the escalating guard response, push 2): two areas are of one town when both dispatch tables name the same
 * `town` (content/dispatch/; the castle town's five rooms). An area is always of its own town.
 */
export function sameTown(content: Content, a: string, b: string): boolean {
  if (a === b) return true;
  const ta = content.dispatch?.[a]?.town;
  return !!ta && ta === content.dispatch?.[b]?.town;
}

/** The highest alert of the area's town (its own level, for an area of no town). */
export function townLevel(world: World, content: Content, area: string): number {
  let best = alertLevel(world, area);
  for (const id of Object.keys(content.dispatch ?? {})) if (id !== area && sameTown(content, area, id)) best = Math.max(best, alertLevel(world, id));
  return best;
}

/** DRAFT: an area is a room tonight. */
export const alertId = (area: string): string => `~alert:${area}`;

export function alertOf(world: World, area: string): Entity | undefined {
  return findEntity(world, alertId(area));
}

export function alertLevel(world: World, area: string): number {
  return alertOf(world, area)?.c.alert?.level ?? 0;
}

/** Copies an area's new level into world.alerts (for the page's pips; see World.alerts). */
function showAlert(world: World, area: string, level: number): void {
  (world.alerts ??= {})[area] = level;
}

/**
 * A completed call raises its area's alert by one.
 * INTENT (D-063, D-075; the one invariant of slice 2): this function holds
 * THE ONLY LINE THAT RAISES AN ALERT, and only completeCall() below calls it,
 * on a completed call, by bell or whistle (systems/npc-call.ts and
 * systems/alert-whistle.ts). Not rage, not a hit, not a sighting, not a body
 * on the floor, not a timer. Do not add a second raise anywhere
 * (scenario step4-rage-without-a-call is the check).
 */
function raiseAlert(ctx: StepContext, area: string): void {
  let e = alertOf(ctx.world, area);
  if (!e) {
    // INTENT: THING_KIND, like a placed thing, so physics and the drawers skip it; it has no `c.thing`.
    e = addEntity(ctx.world, { id: alertId(area), kind: THING_KIND, player: null, room: area, x: 0, y: 0, vx: 0, vy: 0, facing: 1, onGround: true, c: { alert: { level: 0, quiet: 0 } } });
  }
  const a = e.c.alert!;
  // INTENT (D-068): a new call restarts the wait even when the number is already at its most.
  a.quiet = 0;
  const most = maxAlert(ctx.content, area);
  if (a.level >= most) return;
  const from = a.level;
  // DRAFT (the escalating guard response, push 2, "one town-wide level"; docs/decisions-log.md, "Step 4: one town"):
  // one above the town's highest, so a report in the courtyard with the street at 3 makes it 4 there and brings the
  // fourth row there. Of no town, townLevel is the area's own: one up, as ever. Still one call, one raise (D-063).
  a.level = Math.min(most, townLevel(ctx.world, ctx.content, area) + 1); // The single raise.
  showAlert(ctx.world, area, a.level);
  ctx.emit('alert-changed', { area, from, to: a.level });
}

/** One level down, after enough hiding and waiting (systems/alert-cool.ts is the only caller). */
export function lowerAlert(ctx: StepContext, area: string): void {
  const a = alertOf(ctx.world, area)?.c.alert;
  if (!a || a.level <= 0) return;
  const from = a.level;
  a.level = from - 1;
  a.quiet = 0;
  showAlert(ctx.world, area, a.level);
  ctx.emit('alert-changed', { area, from, to: a.level });
}

/**
 * A call for help is sent: by bell (systems/npc-call.ts) or by whistle
 * (systems/alert-whistle.ts). Emits `call-completed`, raises the area's
 * alert one level and records the place reported on the alert entity, which
 * is where help is sent (D-065).
 * INTENT (D-063, D-075): the one site that raises an alert. A completed
 * call, by bell or whistle, is the only thing that does; both kinds of call
 * come here so there stays exactly one raising line and one calling site.
 */
export function completeCall(ctx: StepContext, by: string, area: string, at: { x: number; y: number }): void {
  ctx.emit('call-completed', { by, area, x: at.x, y: at.y });
  raiseAlert(ctx, area);
  const alert = alertOf(ctx.world, area);
  if (alert) {
    alert.x = at.x;
    alert.y = at.y;
  }
}
