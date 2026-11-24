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
import { addEntity, findEntity, removeEntity } from './world.ts';

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
    loose?: {
      weapon: string;
      src?: string;
      /** Swings left, for a weapon that wears out (`uses`), when some are spent; absent: all of them. */
      uses?: number;
      until: number;
      from: string | null;
      flying?: { by: string; met: string[] };
      /** A bursting weapon thrown (systems/weapon-burst.ts): lit at tick `at` by `by`; `now`: it met a body and bursts this tick. Nobody picks it up. */
      lit?: { at: number; by: string; now?: boolean };
      /** It has burst (or, `broken`, worn out: systems/weapon-wear.ts) at tick `at`: its `burst` (or `broken`) look plays where it was, then it is gone. Nobody picks it up; it does not move. */
      ending?: { at: number; broken?: boolean };
    };
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
    /** Lit weapon `loose` (`weapon`, thrown by `by`) burst at (`x`, `y`) in `room`, launching `struck`. */
    'weapon-burst': { loose: string; weapon: string; by: string; room: string; x: number; y: number; struck: string[] };
    /** Thrown loose weapon `loose` struck `target` (a `hit` by the thrower is emitted too). */
    'weapon-struck': { loose: string; weapon: string; by: string; target: string };
    /** `entity`'s `weapon` wore out with its last swing and broke in the hand; `loose` shows its broken look where it was (systems/weapon-wear.ts). */
    'weapon-worn-out': { entity: string; player: string | null; weapon: string; loose: string };
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
  opts: { src?: string; from?: string | null; vx?: number; vy?: number; until?: number; flying?: { by: string; met: string[] }; lit?: { at: number; by: string }; uses?: number; ending?: { at: number; broken?: boolean } } = {},
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
    c: { loose: { weapon: w.id, until: opts.until ?? world.tick, from: opts.from ?? null, ...(opts.src ? { src: opts.src } : {}), ...(opts.flying ? { flying: opts.flying } : {}), ...(opts.lit ? { lit: opts.lit } : {}), ...(opts.uses !== undefined ? { uses: opts.uses } : {}), ...(opts.ending ? { ending: opts.ending } : {}) } },
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
  const uses = from.c.weapon?.uses;
  emitEffect(ctx, from, { kind: 'weapon', weapon: null });
  const loose = makeLoose(ctx, w, from.room, mid, from.y + Math.max(w.box[1], box.h / 2 + w.box[1] / 2), {
    from: from.id,
    vx: dir * (t.powerOrbSpread ?? 60),
    vy: -(t.powerOrbPop ?? 240),
    until: ctx.world.tick + ticksOf(t.powerRetakeTime ?? 0.6),
    ...(src ? { src } : {}),
    ...(uses !== undefined ? { uses } : {}),
  });
  ctx.emit('weapon-dropped', { entity: from.id, player: from.player, weapon: w.id, loose: loose.id, how: 'knocked' });
  return loose;
}

/**
 * `e` throws the weapon `w` in its hand (Grab, systems/weapon-throw.ts; or
 * Hit for a `throw` weapon, systems/weapon-toss.ts): it leaves the hand at
 * `thrown.speed`, aimed by the stick as a carried body is thrown
 * (`throwCarried`, src/sim/body-state.ts): forward in a flat arc lifted by
 * world.throwLift, or up. The stick held down sets it at the feet instead.
 * A weapon with a `burst` is lit by a throw (never by setting it down).
 */
export function throwWeapon(ctx: StepContext, e: Entity, w: Weapon, input: { x: number; y: number }): void {
  const { content } = ctx;
  const box = content.characters[e.kind]?.box;
  if (!box) return;
  const src = e.c.weapon?.src;
  const uses = e.c.weapon?.uses !== undefined ? { uses: e.c.weapon.uses } : {};
  emitEffect(ctx, e, { kind: 'weapon', weapon: null });
  const mid = e.x + box.w / 2;
  if (input.y > 0.5) {
    const loose = makeLoose(ctx, w, e.room, mid, e.y + box.h, { from: e.id, ...uses, ...(src ? { src } : {}) });
    ctx.emit('weapon-dropped', { entity: e.id, player: e.player, weapon: w.id, loose: loose.id, how: 'set-down' });
    return;
  }
  const dir = input.x > 0 ? 1 : input.x < 0 ? -1 : e.facing;
  const speed = w.thrown.speed;
  const up = input.y < -0.5;
  const vx = dir * speed * (up ? 0.2 : 1);
  const vy = -speed * (up ? 1 : (content.tuning.world.throwLift ?? 0.4));
  // From in front of the hand at chest height, as a forward throw of a body leaves (throwCarried).
  const x = up ? mid : dir > 0 ? e.x + box.w + w.box[0] / 2 : e.x - w.box[0] / 2;
  const feet = e.y + box.h / 2 + w.box[1] / 2;
  const lit = w.burst ? { lit: { at: ctx.world.tick, by: e.id } } : {};
  const loose = makeLoose(ctx, w, e.room, x, feet, { from: e.id, vx, vy, flying: { by: e.id, met: [e.id] }, ...lit, ...uses, ...(src ? { src } : {}) });
  ctx.emit('weapon-dropped', { entity: e.id, player: e.player, weapon: w.id, loose: loose.id, how: 'thrown' });
}

/**
 * Puts the weapons of `rooms` back as they began (Step 23 for Step 22's
 * stage starting over, src/sim/stage.ts): every weapon lying loose in them
 * (thrown, lit or bursting too) is gone, and every source standing in them
 * forgets its bookkeeping, so it stands its weapon again on the next run of
 * weapon-sources (unless the one from it is still out: held by a player in
 * its room, as weapon-sources counts it). A carrier there put back fresh by
 * the stage is handed his weapon again by weapon-carriers (his is nowhere
 * now). A weapon in a player's hand stays in it. Returns the loose ones
 * removed. Called on `stage-restarted` by systems/weapon-stage-restart.ts;
 * exported so a stage can call it itself.
 * DRAFT: a player's held weapon is kept through a start-over (the start-over
 * puts back the world, not the heroes).
 */
export function restoreRoomWeapons(world: World, content: Content, rooms: readonly string[]): string[] {
  const set = new Set(rooms);
  const gone = world.entities.filter((e) => e.c.loose !== undefined && set.has(e.room)).map((e) => e.id);
  for (const id of gone) removeEntity(world, id);
  if (world.weaponSources) {
    for (const w of Object.values(content.weapons ?? {})) for (const s of w.sources) if (set.has(s.room)) delete world.weaponSources[s.id];
  }
  return gone;
}
