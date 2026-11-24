import { describe, known } from '../reader.ts';
import { lookTable } from './looks.ts';
import type { ContentKind, Reader } from '../types.ts';

/**
 * content/weapons/<id>.json: a weapon anyone with hands can find, pick up,
 * swing and lose (Step 23; D-009, D-020, D-080, D-081;
 * docs/mechanisms/weapons.md). The owner's P12 contract: one library, no
 * bearer in any picture, attached in the engine at a grip anchor. A weapon
 * is a numbers overlay on whoever holds it (`hit`, laid over after a
 * power's), and its own object when it lies loose. The code that applies it
 * is src/sim/weapons.ts; the systems named `weapon-*` stand, give and drop it.
 *
 * DRAFT: every field (decisions-log "Step 23"). The shown name is data
 * (`name`), never in an id. Adding a weapon is one file.
 */
export interface Weapon {
  id: string;
  /** Shown to a player. A name is data: never put it in an id. */
  name: string;
  /**
   * The looks it has (content/looks/, group `weapons`), by state. Only
   * `ground` and `held` are needed: the contract never lists fixed states,
   * and a weapon with no swing or broken look is valid (the readme: no
   * bogus states). `pickup` falls back to `ground` in a glow.
   */
  looks: { ground: string; held: string; pickup?: string; swing?: string; impact?: string; broken?: string; icon?: string };
  /** Where the hand holds it in its `held` and `swing` looks, pixels from the look's top-left, drawn facing right (the contract's grip_anchor). */
  grip: [number, number];
  /** Its box lying loose or flying, pixels [w, h] (the contract's hitbox): what a hero touches to pick it up. */
  box: [number, number];
  /** Its holder's character numbers, changed: first `times`, then `add`, then `atLeast`, over the holder's own (after a power's). */
  hit: { add: Record<string, number>; times: Record<string, number>; atLeast: Record<string, number> };
  /** What Hit does with it: `swing` it (the holder's own swing, with `hit` laid over). */
  use: 'swing';
  /**
   * Where it stands (D-080: return to a known source for another): a room and
   * a tile, and `restock` seconds after the one from here is used up or
   * carried out of the room, another stands there.
   */
  sources: { id: string; room: string; tile: [number, number]; restock: number }[];
  /**
   * Thrown with Grab (systems/weapon-throw.ts): it leaves the hand at
   * `speed` (px/s) and launches the first body it meets by `strength`
   * against that body's weight (as a swing does), wearing it by `wear`.
   */
  thrown: { speed: number; strength: number; wear: number };
  /**
   * What its swing breaks (systems/weapon-break.ts): a breakable part in
   * reach in front, whose own breakSpeed (or world.wallBreakSpeed) is at
   * most this, breaks when the strike starts. 0: it breaks nothing by itself
   * (what it launches can still break a wall by flying into it).
   */
  breaks: number;
  /** Who starts holding one: placed entity ids (content/placements/) or character kinds, bodies nobody plays (systems/weapon-carriers.ts). */
  carriers: string[];
}

declare module '../types.ts' {
  interface Content {
    weapons: Record<string, Weapon>;
  }
}

const LOOK_STATES = ['ground', 'held', 'pickup', 'swing', 'impact', 'broken', 'icon'] as const;

function numbers(read: Reader, value: unknown, where: string): Record<string, number> {
  const out: Record<string, number> = {};
  if (value === undefined) return out;
  const o = read.object(value, where);
  if (!o) return out;
  for (const [k, v] of Object.entries(o)) {
    if (k === '//') continue;
    if (typeof v === 'number' && Number.isFinite(v) && v >= 0) out[k] = v;
    else read.fail(`${where}.${k}`, `must be a number from 0, but is ${describe(v)}`);
  }
  return out;
}

function pair(read: Reader, value: unknown, where: string, fallback: [number, number], min: number): [number, number] {
  if (value === undefined) return fallback;
  const ok = Array.isArray(value) && value.length === 2 && value.every((n) => typeof n === 'number' && Number.isFinite(n) && n >= min && n <= 64);
  if (!ok) {
    read.fail(where, `must be [x, y] in pixels from ${min} to 64, but is ${describe(value)}`);
    return fallback;
  }
  return [value[0], value[1]];
}

const kind: ContentKind = {
  id: 'weapons',
  source: { dir: 'weapons' },
  parse(raw, read) {
    const o = read.object(raw, '');
    if (!o) return null;
    read.only(o, ['id', 'name', 'looks', 'grip', 'box', 'hit', 'use', 'sources', 'thrown', 'carriers', 'breaks'], '');
    const looks: Weapon['looks'] = { ground: '', held: '' };
    const lo = read.object(o.looks, 'looks');
    if (lo) {
      read.only(lo, [...LOOK_STATES], 'looks');
      looks.ground = read.string(lo, 'ground', 'looks');
      looks.held = read.string(lo, 'held', 'looks');
      for (const s of LOOK_STATES) {
        if (s === 'ground' || s === 'held' || lo[s] === undefined) continue;
        looks[s] = read.string(lo, s, 'looks');
      }
    }
    const hit: Weapon['hit'] = { add: {}, times: {}, atLeast: {} };
    if (o.hit !== undefined) {
      const h = read.object(o.hit, 'hit');
      if (h) {
        read.only(h, ['add', 'times', 'atLeast'], 'hit');
        hit.add = numbers(read, h.add, 'hit.add');
        hit.times = numbers(read, h.times, 'hit.times');
        hit.atLeast = numbers(read, h.atLeast, 'hit.atLeast');
      }
    }
    let use: Weapon['use'] = 'swing';
    if (o.use !== undefined) {
      // DRAFT: "throw" (the bomb's) arrives with the rule that throws it (Step 23 push 4).
      if (o.use === 'swing') use = o.use;
      else read.fail('use', `must be "swing", but is ${describe(o.use)}`);
    }
    const out: Weapon = {
      id: read.string(o, 'id', ''),
      name: read.string(o, 'name', ''),
      looks,
      // DRAFT: with no grip, the hand holds the look's bottom-left quarter, where the cut pictures put a handle.
      grip: pair(read, o.grip, 'grip', [8, 20], 0),
      box: pair(read, o.box, 'box', [14, 8], 2),
      hit,
      use,
      sources: [],
      // DRAFT: a weapon that says nothing about its throw flies like the sword.
      thrown: { speed: 320, strength: 12000, wear: 20 },
      carriers: o.carriers === undefined ? [] : read.stringList(o, 'carriers', ''),
      breaks: o.breaks === undefined ? 0 : read.number(o, 'breaks', '', { min: 0, max: 900 }),
    };
    if (o.thrown !== undefined) {
      const t = read.object(o.thrown, 'thrown');
      if (t) {
        read.only(t, ['speed', 'strength', 'wear'], 'thrown');
        // Under a tile a tick (16 px at 60 ticks): the flight tests one step ahead, as physics does.
        if (t.speed !== undefined) out.thrown.speed = read.number(t, 'speed', 'thrown', { min: 0, max: 900 });
        if (t.strength !== undefined) out.thrown.strength = read.number(t, 'strength', 'thrown', { min: 0, max: 1000000 });
        if (t.wear !== undefined) out.thrown.wear = read.number(t, 'wear', 'thrown', { min: 0, max: 100000 });
      }
    }
    if (/\d/.test(out.name)) read.fail('name', `"${out.name}" has a digit: the game shows no numbers`);
    if (o.sources !== undefined) {
      if (!Array.isArray(o.sources)) read.fail('sources', `must be a list of { "id", "room", "tile", "restock" }, but is ${describe(o.sources)}`);
      else
        o.sources.forEach((item: unknown, i: number) => {
          const w = `sources[${i}]`;
          const s = read.object(item, w);
          if (!s) return;
          read.only(s, ['id', 'room', 'tile', 'restock'], w);
          const t = s.tile;
          const ok = Array.isArray(t) && t.length === 2 && t.every((n) => Number.isInteger(n) && n >= 0);
          if (!ok) read.fail(`${w}.tile`, `must be [column, row], but is ${describe(t)}`);
          out.sources.push({
            id: read.string(s, 'id', w),
            room: read.string(s, 'room', w),
            tile: ok ? [t[0], t[1]] : [0, 0],
            restock: s.restock === undefined ? 30 : read.number(s, 'restock', w, { min: 0, max: 3600 }),
          });
        });
    }
    return out;
  },
  check(content, fail) {
    const looks = lookTable(content);
    const sourceOwner = new Map<string, string>();
    // A number some character's tuning set has is one a verb reads (src/sim/check-content.ts refuses an unread one).
    const readNumbers = new Set<string>();
    for (const set of Object.values(content.tuning.characters)) for (const k of Object.keys(set)) readNumbers.add(k);
    const placed = new Set<string>();
    for (const p of Object.values(content.placements ?? {})) for (const q of p.place) placed.add(q.id);
    for (const w of Object.values(content.weapons).sort((a, b) => (a.id < b.id ? -1 : 1))) {
      const file = `content/weapons/${w.id}.json`;
      w.carriers.forEach((c, i) => {
        if (!placed.has(c) && !(c in content.characters)) fail(file, `carriers[${i}]`, `"${c}" is neither a placed entity id (content/placements/) nor a character kind (characters: ${known(content.characters)})`);
        else if (c in content.characters && !content.characters[c]!.verbs.includes('attack')) fail(file, `carriers[${i}]`, `character "${c}" has no hands for it: it does not list the verb "attack"`);
      });
      for (const s of LOOK_STATES) {
        const id = w.looks[s];
        if (id !== undefined && !looks.has(id)) fail(file, `looks.${s}`, `no look "${id}" (content/looks/; the cut ones for weapons are in content/looks/weapons.json)`);
      }
      for (const part of ['add', 'times', 'atLeast'] as const) {
        for (const name of Object.keys(w.hit[part])) {
          if (!readNumbers.has(name)) fail(file, `hit.${part}.${name}`, 'no verb reads this number: no character has it in content/tuning.json (a typo?)');
        }
      }
      w.sources.forEach((s, i) => {
        const where = `sources[${i}]`;
        const other = sourceOwner.get(s.id);
        if (other !== undefined) fail(file, `${where}.id`, `source "${s.id}" is already a source of weapon "${other}": source ids are unique across every weapon`);
        else sourceOwner.set(s.id, w.id);
        // A carrier's weapon carries a `~carrier:` src (carrierTag, src/sim/weapons.ts): no source id may look like one.
        if (s.id.startsWith('~')) fail(file, `${where}.id`, `source "${s.id}" starts with "~", which is kept for a carrier's weapon`);
        const room = content.rooms[s.room];
        if (!room) return fail(file, `${where}.room`, `no room "${s.room}" (rooms: ${known(content.rooms)})`);
        const [tx, ty] = s.tile;
        if (tx >= room.w || ty >= room.h) fail(file, `${where}.tile`, `[${tx}, ${ty}] is outside room "${room.id}", which is ${room.w} by ${room.h} tiles`);
      });
    }
  },
};
export default kind;
