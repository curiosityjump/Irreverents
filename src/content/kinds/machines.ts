import { known } from '../reader.ts';
import type { ContentKind } from '../types.ts';

/**
 * content/machines/<id>.json: a machine a person drives and a hero can take
 * (Step 20, vehicle hijacking: D-017, D-020, D-023; docs/mechanisms/machines.md).
 * The machine is an ordinary body of its own character kind (content/
 * characters/, verbs `drive` and `body`); this file holds what makes it a
 * machine: how it drives, when it rams, and how it wears to a wreck.
 * INTENT: the file id and the character are ids; a shown name is the
 * character's data.
 * DRAFT: every field and number here (O-008, O-009 are OPEN; doc 24's one
 * hijackable machine is PROPOSED). docs/decisions-log.md, "Step 20: the machine".
 */
export interface Machine {
  id: string;
  /** The character kind (content/characters/) of the machine's body. One machine file per character. */
  character: string;
  /**
   * Top speed, pixels per second: driven by a hero (a player), and by a
   * person of the world (a bandit at the reins).
   * INTENT: people can be outrun: `driver` stays below the slowest roster
   * hero's runSpeed (checked here), so a bandit-driven machine never runs a
   * hero down from behind. `rider` stays at most 600 (move's INTENT: under
   * one tile a tick).
   */
  speed: { rider: number; driver: number };
  /** How fast the stick builds speed on the ground, pixels per second per second (slow: it is heavy). */
  accel: number;
  /** How fast it slows with the stick let go: it rolls on, nearly holding its speed. */
  coast: number;
  /** How fast the stick held against the way it rolls slows it, and a wreck stops. */
  brake: number;
  /** The slowest it rams at: moving at this or faster, a body it meets is shoved by weight (src/sim/machines.ts). */
  ramSpeed: number;
  /** Crashes (a ram, or a wall met at ramSpeed or faster) it takes before it is a wreck, for good. */
  crashes: number;
  /**
   * The slowest it rams at while a person of the world drives it (no player
   * at the reins), so a bandit's slow machine still shoves the hero it
   * catches. Left out: `ramSpeed`.
   */
  driverRamSpeed?: number;
  /**
   * Step 20 push 2: the weakest blow (the striker's attackStrength) that
   * throws a rider out of the seat and flying; a lighter blow only rocks the
   * machine. Left out: no blow throws a rider.
   */
  throwRider?: number;
}

declare module '../types.ts' {
  interface Content {
    machines: Record<string, Machine>;
  }
}

const kind: ContentKind = {
  id: 'machines',
  source: { dir: 'machines' },
  parse(raw, read) {
    const o = read.object(raw, '');
    if (!o) return null;
    read.only(o, ['id', 'character', 'speed', 'accel', 'coast', 'brake', 'ramSpeed', 'crashes', 'driverRamSpeed', 'throwRider'], '');
    const speed = read.object(o.speed, 'speed');
    if (speed) read.only(speed, ['rider', 'driver'], 'speed');
    const out: Machine = {
      id: read.string(o, 'id', ''),
      character: read.string(o, 'character', ''),
      speed: {
        rider: speed ? read.number(speed, 'rider', 'speed', { min: 1, max: 600 }) : 0,
        driver: speed ? read.number(speed, 'driver', 'speed', { min: 0, max: 600 }) : 0,
      },
      accel: read.number(o, 'accel', '', { min: 1, max: 100000 }),
      coast: read.number(o, 'coast', '', { min: 0, max: 100000 }),
      brake: read.number(o, 'brake', '', { min: 1, max: 100000 }),
      ramSpeed: read.number(o, 'ramSpeed', '', { min: 1, max: 900 }),
      crashes: read.number(o, 'crashes', '', { min: 1, max: 1000, integer: true }),
      ...(o.driverRamSpeed === undefined ? {} : { driverRamSpeed: read.number(o, 'driverRamSpeed', '', { min: 1, max: 900 }) }),
      ...(o.throwRider === undefined ? {} : { throwRider: read.number(o, 'throwRider', '', { min: 0, max: 1000000 }) }),
    };
    return out;
  },
  check(content, fail) {
    const by = new Map<string, string>();
    for (const m of Object.values(content.machines ?? {})) {
      const file = `content/machines/${m.id}.json`;
      const ch = content.characters[m.character];
      if (!ch) {
        fail(file, 'character', `no character "${m.character}" (characters: ${known(content.characters)})`);
        continue;
      }
      if (!ch.verbs.includes('drive')) fail(file, 'character', `character "${m.character}" does not list the verb "drive", so nobody could drive it`);
      const other = by.get(m.character);
      if (other) fail(file, 'character', `"${m.character}" is already the machine of content/machines/${other}.json: one file per character`);
      by.set(m.character, m.id);
      // INTENT: people can be outrun (Step 20, "What's decided"): a person at the reins is slower than every roster hero.
      let slowest: { id: string; speed: number } | undefined;
      for (const id of content.roster?.characters ?? []) {
        const c = content.characters[id];
        const run = c ? content.tuning.characters[c.tuning]?.runSpeed : undefined;
        if (typeof run === 'number' && (!slowest || run < slowest.speed)) slowest = { id, speed: run };
      }
      if (slowest && m.speed.driver >= slowest.speed) {
        fail(file, 'speed.driver', `${m.speed.driver} is not below the slowest roster hero's runSpeed (${slowest.id}, ${slowest.speed}): people must be able to outrun a machine a person drives`);
      }
    }
  },
};
export default kind;
