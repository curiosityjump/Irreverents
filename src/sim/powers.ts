// Powers on a body (Step 9; docs/mechanisms/powers.md). The one place a
// held power is laid over a character's own numbers and verbs. The four read
// sites (systems/verbs.ts twice, body-state.ts `bodyNumbers` and
// systems/physics.ts) all ask this file, so the overlay is never applied in
// one place and forgotten in another. Pure, like the rest of src/sim. Not in
// a registry directory on purpose: it is a helper.
import type { Content } from '../content/types.ts';
import type { Power } from '../content/kinds/powers.ts';
import type { Entity } from './types.ts';
import { weaponOver } from './weapons.ts';

declare module './types.ts' {
  interface Components {
    /**
     * The power this body holds, if any. Only an effect sets or clears it
     * (`{ kind: 'power' }`, src/sim/effects.ts), so it reaches the holder's
     * own page. `id` is a power id (content/powers/). `src` is the source it
     * was taken from, if it came off a pedestal.
     * DRAFT: one power per hero (O-005 leaves slots OPEN).
     */
    power?: { id: string; src?: string };
  }
}

const NONE: Record<string, number> = {};

/** The power a body holds, or null. Reads with a default: a body saved before Step 9 has no `c.power`. */
export function powerOf(content: Content, e: Entity): Power | null {
  const id = e.c.power?.id;
  if (id === undefined) return null;
  return content.powers?.[id] ?? null;
}

/**
 * A body's character numbers with its power laid over them: first `times`,
 * then `atLeast`. With no power it is the tuning set itself (no copy), so a
 * world with no power in it reads exactly what it read before Step 9.
 */
export function numbersOf(content: Content, e: Entity): Record<string, number> {
  const kind = content.characters[e.kind];
  const set = (kind && content.tuning.characters[kind.tuning]) || NONE;
  const p = powerOf(content, e);
  // Step 23: a held weapon is laid over after the power (src/sim/weapons.ts); with none, weaponOver returns what it is given.
  if (!p) return weaponOver(content, e, set);
  const out = { ...set };
  for (const [k, v] of Object.entries(p.times)) if (out[k] !== undefined) out[k] *= v;
  for (const [k, v] of Object.entries(p.atLeast)) out[k] = Math.max(out[k] ?? v, v);
  return weaponOver(content, e, out);
}

/** The verbs a body may do: its character kind's, plus any its power lends. With no power it is the kind's own list. */
export function verbsOf(content: Content, e: Entity): string[] {
  const own = content.characters[e.kind]?.verbs ?? [];
  const p = powerOf(content, e);
  if (!p || p.lends.length === 0) return own;
  return [...own, ...p.lends.filter((v) => !own.includes(v))];
}

/**
 * The kind of a power's orb: a power lying loose. INTENT: not a character
 * kind, so an orb is no body. No swing strikes it, no grab lifts it, no
 * flying body meets it, and no person witnesses a blow on it (a shopkeeper's
 * swing at an orb once raised the street's alert, and a struck orb wore down
 * the villain it hit). It moves by its own small physics
 * (systems/power-take.ts) and is drawn by src/client/draw/powers.ts.
 */
export const ORB_KIND = '~power-orb';
/** An orb's size, pixels: what a hero must touch. */
export const ORB_SIZE = 10;

declare module './types.ts' {
  interface Components {
    /**
     * Present on an orb: a power lying loose in the room, to be taken by
     * touch (systems/power-take.ts). `left`: ticks until it fades (-1 never).
     * `from`: the body it came out of. Nobody can take it before tick
     * `until`. `src`: the source it was first taken from, if any.
     */
    orb?: { power: string; left: number; from: string | null; until: number; src?: string };
    /** Present on a carrier whose power has been knocked out of it, until it has it again (systems/power-carriers.ts). */
    powerSpent?: { at: number };
  }
  interface EventMap {
    /** A played hero took `power` by touching an orb (`from` the body it came out of) or a source (`src`). */
    'power-taken': { entity: string; player: string | null; power: string; from: string | null; src?: string };
    /** `power` came out of `entity` as orb `orb`: a carrier laid flat, or a holder hit hard. */
    'power-dropped': { entity: string; player: string | null; power: string; orb: string };
    /** Orb `orb` faded where it lay, nobody having taken it. */
    'power-faded': { orb: string; power: string; room: string };
  }
}

/**
 * The power a body nobody plays carries, by its placed id or its character
 * kind (a power's `carriers`), or null. Players are never carriers: what a
 * player has is `c.power`.
 */
export function carriedPowerOf(content: Content, e: Entity): Power | null {
  if (e.player !== null || e.kind === ORB_KIND) return null;
  for (const id of Object.keys(content.powers ?? {}).sort()) {
    const p = content.powers[id]!;
    if (p.carriers.includes(e.id) || p.carriers.includes(e.kind)) return p;
  }
  return null;
}

/** Whether a body is an orb (a power lying loose). */
export function isOrb(e: Entity): boolean {
  return e.c.orb !== undefined;
}

/** The kind of a power source's entity: bodiless, like ORB_KIND (no swing, grab or physics touches it). */
export const SOURCE_KIND = '~power-source';

declare module './types.ts' {
  interface Components {
    /** Present on a power source (D-080: a rare power's spot you can return to). `lit`: it can be taken now (nobody holds its power and no orb of it lies loose). */
    source?: { id: string; power: string; lit: boolean };
  }
  interface World {
    /**
     * Step 9 (D-082: knowing where a source is stays valuable): the power
     * source ids a hero has taken from in this world, oldest first. Written
     * only where the source is (the server's world); a page takes it by key.
     * Never shrinks. Read with a default: older worlds have none.
     */
    sources?: string[];
  }
}

/** The sources standing in a room, as bodiless entities (src/sim/world.ts, populateRoom), lit to start with. */
export function sourcesIn(content: Content, roomId: string): Entity[] {
  const room = content.rooms[roomId];
  if (!room) return [];
  const out: Entity[] = [];
  for (const id of Object.keys(content.powers ?? {}).sort()) {
    for (const s of content.powers[id]!.sources) {
      if (s.room !== roomId) continue;
      out.push({ id: `~source:${s.id}`, kind: SOURCE_KIND, player: null, room: roomId, x: s.tile[0] * room.tile, y: s.tile[1] * room.tile, vx: 0, vy: 0, facing: 1, onGround: true, c: { source: { id: s.id, power: id, lit: true } } });
    }
  }
  return out;
}
