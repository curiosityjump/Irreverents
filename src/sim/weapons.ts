// Weapons on a body and lying loose (Step 23; docs/mechanisms/weapons.md).
// The one place a held weapon is laid over a body's numbers (called from
// `numbersOf`, src/sim/powers.ts, after a power's), and the one place a
// loose weapon is made. Pure, like the rest of src/sim. Not in a registry
// directory on purpose: it is a helper.
import type { Content } from '../content/types.ts';
import type { Weapon } from '../content/kinds/weapons.ts';
import type { Entity, StepContext, World } from './types.ts';
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
    weapon?: { id: string; src?: string; uses?: number };
    /**
     * Present on a loose weapon: a weapon lying in a room, to be picked up
     * with Use (src/sim/use/weapon.ts). `src`: the source it came from.
     * Nobody can pick it up before tick `until`. `from`: the body it left.
     */
    loose?: { weapon: string; src?: string; until: number; from: string | null };
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
    'weapon-dropped': { entity: string; player: string | null; weapon: string; loose: string; how: 'swap' };
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

/** The weapon a body holds, or null. Reads with a default: a body saved before Step 23 has no `c.weapon`. */
export function weaponOf(content: Content, e: Entity): Weapon | null {
  const id = e.c.weapon?.id;
  if (id === undefined) return null;
  return content.weapons?.[id] ?? null;
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
  opts: { src?: string; from?: string | null; vx?: number; vy?: number; until?: number } = {},
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
    c: { loose: { weapon: w.id, until: opts.until ?? world.tick, from: opts.from ?? null, ...(opts.src ? { src: opts.src } : {}) } },
  });
}
