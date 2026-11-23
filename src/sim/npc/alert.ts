// The area alert, the call that raises it and the task of those who answer
// (Step 4, slice 2). Writeup: docs/mechanisms/npc-response.md, "Calling for help".
import type { Entity, StepContext, World } from '../types.ts';
import { addEntity, findEntity } from '../world.ts';
import { THING_KIND } from './state.ts';

declare module '../types.ts' {
  interface Components {
    /**
     * On one bodiless entity per area ("~alert:<room>"), made by the first
     * completed call there.
     * INTENT (D-065): the area's alert is its own number, apart from every
     * person's mood. On an entity so the server's replication carries it.
     */
    alert?: {
      /** 0 to MAX_ALERT. Raised only by raiseAlert(); lowered only by lowerAlert(). */
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

/** DRAFT (the Step 4 lead's call, in docs/decisions-log.md): the alert runs 0 to 3. */
export const MAX_ALERT = 3;

/** DRAFT: an area is a room tonight. */
export const alertId = (area: string): string => `~alert:${area}`;

export function alertOf(world: World, area: string): Entity | undefined {
  return findEntity(world, alertId(area));
}

export function alertLevel(world: World, area: string): number {
  return alertOf(world, area)?.c.alert?.level ?? 0;
}

/**
 * A completed call raises its area's alert by one.
 * INTENT (D-063, D-075; the one invariant of slice 2): this function holds
 * THE ONLY LINE THAT RAISES AN ALERT, and only systems/npc-call.ts calls it,
 * on a completed call. Not rage, not a hit, not a sighting, not a body on
 * the floor, not a timer. Do not add a second raise anywhere
 * (scenario step4-rage-without-a-call is the check).
 */
export function raiseAlert(ctx: StepContext, area: string): void {
  let e = alertOf(ctx.world, area);
  if (!e) {
    // INTENT: THING_KIND, like a placed thing, so physics and the drawers skip it; it has no `c.thing`.
    e = addEntity(ctx.world, { id: alertId(area), kind: THING_KIND, player: null, room: area, x: 0, y: 0, vx: 0, vy: 0, facing: 1, onGround: true, c: { alert: { level: 0, quiet: 0 } } });
  }
  const a = e.c.alert!;
  // INTENT (D-068): a new call restarts the wait even when the number is already at its most.
  a.quiet = 0;
  if (a.level >= MAX_ALERT) return;
  const from = a.level;
  a.level = from + 1; // The single raise.
  ctx.emit('alert-changed', { area, from, to: a.level });
}

/** One level down, after enough hiding and waiting (systems/alert-cool.ts is the only caller). */
export function lowerAlert(ctx: StepContext, area: string): void {
  const a = alertOf(ctx.world, area)?.c.alert;
  if (!a || a.level <= 0) return;
  const from = a.level;
  a.level = from - 1;
  a.quiet = 0;
  ctx.emit('alert-changed', { area, from, to: a.level });
}
