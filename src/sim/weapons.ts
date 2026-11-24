// Weapons on a body and lying loose (Step 23; docs/mechanisms/weapons.md).
// The one place a held weapon is laid over a body's numbers (called from
// `numbersOf`, src/sim/powers.ts, after a power's), and the one place a
// loose weapon is made. Pure, like the rest of src/sim. Not in a registry
// directory on purpose: it is a helper.
import type { Content } from '../content/types.ts';
import type { Weapon } from '../content/kinds/weapons.ts';
import type { Entity, StepContext, World } from './types.ts';
import { ticksOf } from './body-state.ts';
import { emitEffect } from './effects.ts';
import { addEntity, findEntity } from './world.ts';

declare module './types.ts' {
  interface Components {
    /**
     * The weapon this body holds, if any. Only an effect sets or clears it
     * (`{ kind: 'weapon' }`, src/sim/effects.ts), so it reaches the holder's
     * own page. `id` is a weapon id (content/weapons/); `src` the source it
     * was taken from, if it came off one (so the source knows it is out).
     * DRAFT: one weapon in hand, beside one power (doc 05 leaves slots OPEN).
     */
    weapon?: { id: string; src?: string; uses?: number; by?: string };
    /**
     * Step 23 (the owner: "No inventory. Only one weapon at a time"; per hero,
     * not per party): the weapon each other party member of this player holds,
     * by character kind, while that member is not the one played
     * (systems/weapon-hands.ts). One each, never a bag.
     */
    weaponKept?: Record<string, { id: string; src?: string; uses?: number }>;
    /** On a carrier (a weapon's `carriers`): it has been handed its weapon once in this world (systems/weapon-carriers.ts). */
    weaponCarrier?: { at: number };
    /** Each played body's own memory of the Grab button for the weapon throw (systems/weapon-throw.ts). */
    weaponGrab?: { held: boolean };
    /**
     * Present on a loose weapon: a weapon lying in a room, to be picked up
     * with Use (src/sim/use/weapon.ts). `src`: the source it came from.
     * Nobody can pick it up before tick `until`. `from`: the body it left.
     */
    loose?: { weapon: string; src?: string; until: number; from: string | null; flying?: { by: string; met: string[] } };
    /** Each body's own memory of the Use button for the weapon systems (systems/weapon-take.ts), to see a fresh press. */
    weaponUse?: { held: boolean };
  }
  interface World {
    /**
     * Step 23: each weapon source's bookkeeping, by source id
     * (systems/weapon-sources.ts). Absent until a source first stands its
     * weapon, so a kept game saved before Step 23 has none and gets them.
     * `gone`: the tick the weapon from it was last seen out of the world.
     */
    weaponSources?: Record<string, { gone?: number }>;
  }
  interface EventMap {
    /** `entity` picked up `weapon` (loose weapon `loose`; `src` its source, if any). */
    'weapon-taken': { entity: string; player: string | null; weapon: string; loose: string; src?: string };
    /** `weapon` left `entity`'s hand and lies loose as `loose` (`how`: swapped for another). */
    'weapon-dropped': { entity: string; player: string | null; weapon: string; loose: string; how: 'swap' | 'knocked' | 'set-down' | 'thrown' };
    /** Thrown loose weapon `loose` struck `target` (a `hit` by the thrower is emitted too). */
    'weapon-struck': { loose: string; weapon: string; by: string; target: string };
    /** Source `src` stood a fresh `weapon` as `loose`. */
    'weapon-stood': { src: string; weapon: string; loose: string; room: string };
  }
}

/**
 * The kind of a weapon lying loose. INTENT: not a character kind, so a loose
 * weapon is no body, for the orb's reasons (src/sim/powers.ts, ORB_KIND): no
 * swing strikes it, no grab lifts it, no flying body meets it, and no person
 * witnesses a blow on it (as a body, a shopkeeper's swing at an orb raised the
 * street's alert, and a struck orb wore down the villain it hit). It moves by
 * its own small physics (src/sim/loose-fall.ts) and is drawn by
 * src/client/draw/weapons.ts.
 */
export const WEAPON_KIND = '~weapon';

/**
 * The weapon a body holds, or null. Reads with a default: a body saved before
 * Step 23 has no `c.weapon`. A weapon taken by another party member (`by`, a
 * character kind) is not this body's while it is someone else (a switch is
 * decided on the page first; systems/weapon-hands.ts puts it away on the
 * server), unless world.weaponStaysWithHero is 0.
 */
export function weaponOf(content: Content, e: Entity): Weapon | null {
  const held = e.c.weapon;
  if (held === undefined) return null;
  if (held.by !== undefined && held.by !== e.kind && (content.tuning.world.weaponStaysWithHero ?? 1) !== 0) return null;
  return content.weapons?.[held.id] ?? null;
}

/** The weapon a loose weapon is, or null. */
export function looseWeaponOf(content: Content, e: Entity): Weapon | null {
  const id = e.c.loose?.weapon;
  return id === undefined ? null : (content.weapons?.[id] ?? null);
}

/** A loose weapon's box, pixels: what a hero touches. */
export function looseBox(content: Content, e: Entity): { w: number; h: number } {
  const w = looseWeaponOf(content, e);
  return { w: w?.box[0] ?? 14, h: w?.box[1] ?? 8 };
}

/**
 * `set` (a body's numbers, a power's already laid over) with the held
 * weapon's `hit` laid over: first `times`, then `add`, then `atLeast`. With
 * no weapon it is `set` itself (no copy), so a world with no weapon in it
 * reads exactly what it read before Step 23.
 */
export function weaponOver(content: Content, e: Entity, set: Record<string, number>): Record<string, number> {
  const w = weaponOf(content, e);
  if (!w) return set;
  const out = { ...set };
  for (const [k, v] of Object.entries(w.hit.times)) if (out[k] !== undefined) out[k] *= v;
  for (const [k, v] of Object.entries(w.hit.add)) if (out[k] !== undefined) out[k] += v;
  for (const [k, v] of Object.entries(w.hit.atLeast)) out[k] = Math.max(out[k] ?? v, v);
  return out;
}

/**
 * Whether the weapon rules run in this world: the server's or a scenario's,
 * never a page's own. A page's world holds only its own character
 * (src/net/client.ts); `isPageWorld` (src/sim/machines.ts) tells it by
 * `world.taken`, which a page has only from its first snapshot, so before
 * that a page's world also has no body besides the played ones.
 * DRAFT: a scenario with no body but its players stands no weapon (put a
 * dummy in it, or `"placements": true`).
 */
export function weaponWorld(world: World): boolean {
  return world.taken === undefined && world.entities.some((e) => e.player === null);
}

/**
 * The `src` a carrier's weapon carries (systems/weapon-carriers.ts): not a
 * source id (those come from content and never start with `~`), so no
 * source counts it, and it follows the weapon through every hand and drop
 * as a source's id does.
 */
export function carrierTag(id: string): string {
  return `~carrier:${id}`;
}

/** Whether a body's kind has hands for a weapon: it swings (lists `attack`). */
export function canHold(content: Content, e: Entity): boolean {
  return content.characters[e.kind]?.verbs.includes('attack') ?? false;
}

/**
 * Lays weapon `w` loose in `room` with its box's bottom-middle at (`x`,
 * `feet`), moving at (`vx`, `vy`). The one place a loose weapon is made.
 */
export function makeLoose(
  ctx: StepContext,
  w: Weapon,
  room: string,
  x: number,
  feet: number,
  opts: { src?: string; from?: string | null; vx?: number; vy?: number; until?: number; flying?: { by: string; met: string[] } } = {},
): Entity {
  const { world } = ctx;
  let n = 0;
  while (findEntity(world, `weapon:${world.tick}:${n}`)) n++;
  const [bw, bh] = w.box;
  const vx = opts.vx ?? 0;
  const vy = opts.vy ?? 0;
  return addEntity(world, {
    id: `weapon:${world.tick}:${n}`,
    kind: WEAPON_KIND,
    player: null,
    room,
    x: x - bw / 2,
    y: feet - bh,
    vx,
    vy,
    facing: vx < 0 ? -1 : 1,
    onGround: vx === 0 && vy === 0,
    c: { loose: { weapon: w.id, until: opts.until ?? world.tick, from: opts.from ?? null, ...(opts.src ? { src: opts.src } : {}), ...(opts.flying ? { flying: opts.flying } : {}) } },
  });
}

/**
 * Knocks the weapon in `from`'s hand out of it (a hard hit, D-081): it
 * leaves the hand (the effect, so a player's own page loses it too) and pops
 * up out of the body and a little away from `away`, as a power's orb does
 * (the orb's numbers: powerOrbPop, powerOrbSpread, powerRetakeTime).
 */
export function knockLoose(ctx: StepContext, from: Entity, away: Entity | null): Entity | null {
  const w = weaponOf(ctx.content, from);
  const box = ctx.content.characters[from.kind]?.box;
  if (!w || !box) return null;
  const t = ctx.content.tuning.world;
  const mid = from.x + box.w / 2;
  const dir = away ? (away.x + (ctx.content.characters[away.kind]?.box.w ?? 0) / 2 < mid ? 1 : -1) : -from.facing;
  const src = from.c.weapon?.src;
  emitEffect(ctx, from, { kind: 'weapon', weapon: null });
  const loose = makeLoose(ctx, w, from.room, mid, from.y + Math.max(w.box[1], box.h / 2 + w.box[1] / 2), {
    from: from.id,
    vx: dir * (t.powerOrbSpread ?? 60),
    vy: -(t.powerOrbPop ?? 240),
    until: ctx.world.tick + ticksOf(t.powerRetakeTime ?? 0.6),
    ...(src ? { src } : {}),
  });
  ctx.emit('weapon-dropped', { entity: from.id, player: from.player, weapon: w.id, loose: loose.id, how: 'knocked' });
  return loose;
}
