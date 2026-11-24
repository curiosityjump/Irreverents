import { describe, known } from '../reader.ts';
import type { ContentKind } from '../types.ts';

/**
 * content/outposts/<id>.json: a hostile camp (Step 12, D-061). Which room it
 * is, the post with the horn on it (the signaler), who may run to it and
 * sound it, where the reinforcements walk in, how many people the room holds
 * at most, and the table of waves. Writeup: docs/mechanisms/outposts.md.
 *
 * INTENT (D-055): scripted, never AI. Everything an outpost does is this
 * data plus the fixed systems src/sim/systems/outpost-*.ts.
 */
export interface Outpost {
  id: string;
  /** The room the outpost is (content/rooms/). DRAFT: the zone is this one room. */
  room: string;
  /** The placed id (content/placements/<room>.json) of the post with the horn. */
  signaler: string;
  /** Placed ids of the people who may run to the post and sound it. */
  callers: string[];
  /** [column, row]: the tile a wave walks in at (feet on its floor). Not a door. */
  entry: [number, number];
  /** DRAFT: 8. The most people (bodies with an NPC kind) in the room at once; a wave waits while it would not fit. */
  bound: number;
  /** DRAFT: 3. Seconds a caller stands at the post sounding the horn before the call is sent. */
  callTime: number;
  /** DRAFT: 6. Seconds a caller who finished a call waits before they may go again. */
  callAgain: number;
  /** DRAFT: 3. Hits that break the post. */
  breakHits: number;
  /** Speed (pixels per second) of a thrown body striking the post that breaks it at once. */
  breakSpeed: number;
  /**
   * The waves, in order, harder row by row (D-061). Each row is the people
   * of one wave: a body (content/characters/) and an NPC kind (content/npcs/).
   * INTENT (doc 24: "the system must never impose an arbitrary maximum wave
   * count"): after the last row, the last row comes again, for ever.
   */
  waves: { character: string; npc: string }[][];
  /**
   * Step 7 (DRAFT, optional, default false): a caller stopped mid-call by a
   * knock-out or a grab tries again once up (after `callAgain`), instead of
   * never calling again; only one caller goes for the horn at a time; and
   * after any call ends, finished or stopped, nobody goes for `callAgain`
   * seconds. Stopping a caller buys time; breaking the post is the real stop (D-061).
   */
  tryAgain: boolean;
  /**
   * Step 7 (DRAFT, optional, default 0 = never): seconds a wave's person may
   * lie out cold in all before they walk back off at the entry and are gone,
   * so beaten waves make room under `bound` for the next.
   */
  leaveCold: number;
  /** Step 7 (DRAFT, optional, default 0 = never): seconds in a row a wave's person may stand with nobody to fight before they walk off. */
  leaveIdle: number;
  /**
   * The owner, 2026-11-24: "Alarms should spawn more enemies of increasing
   * strength that come in from the sides." DRAFT, optional (left out: [entry]):
   * the tiles [column, row] a wave may walk in at. A wave is split between the
   * left and the right of where its caller saw a hero (src/sim/systems/
   * outpost-wave.ts): on each side the nearest entry at least `entryAway`
   * tiles from that place, else the farthest on that side; with entries on
   * one side only, all come from there.
   */
  entries: [number, number][];
  /** DRAFT, optional (default 0): tiles from the place reported that a side's entry should be at least, so a wave walks in at the screen's edge rather than in view. */
  entryAway: number;
  /** DRAFT, optional: the banner per row (index as `waves`; the last repeats), at most a few words, no digits. Left out: "Here they come!". */
  announce: string[];
}

declare module '../types.ts' {
  interface Content {
    outposts: Record<string, Outpost>;
  }
}

const kind: ContentKind = {
  id: 'outposts',
  source: { dir: 'outposts' },
  parse(raw, read) {
    const o = read.object(raw, '');
    if (!o) return null;
    read.only(o, ['id', 'room', 'signaler', 'callers', 'entry', 'bound', 'callTime', 'callAgain', 'breakHits', 'breakSpeed', 'waves', 'tryAgain', 'leaveCold', 'leaveIdle', 'entries', 'entryAway', 'announce'], '');
    const out: Outpost = {
      id: read.string(o, 'id', ''),
      room: read.string(o, 'room', ''),
      signaler: read.string(o, 'signaler', ''),
      callers: read.stringList(o, 'callers', ''),
      entry: [0, 0],
      bound: read.number(o, 'bound', '', { min: 1, max: 64, integer: true }),
      callTime: read.number(o, 'callTime', '', { min: 0.1, max: 600 }),
      callAgain: read.number(o, 'callAgain', '', { min: 0, max: 600 }),
      breakHits: read.number(o, 'breakHits', '', { min: 1, max: 1000, integer: true }),
      breakSpeed: read.number(o, 'breakSpeed', '', { min: 0, max: 2000 }),
      waves: [],
      tryAgain: o.tryAgain === true,
      leaveCold: o.leaveCold === undefined ? 0 : read.number(o, 'leaveCold', '', { min: 0, max: 600 }),
      leaveIdle: o.leaveIdle === undefined ? 0 : read.number(o, 'leaveIdle', '', { min: 0, max: 600 }),
      entries: [],
      entryAway: 0,
      announce: [],
    };
    if (o.tryAgain !== undefined && typeof o.tryAgain !== 'boolean') read.fail('tryAgain', `must be true or false, but is ${describe(o.tryAgain)}`);
    const e = o.entry;
    if (Array.isArray(e) && e.length === 2 && e.every((n) => Number.isInteger(n))) out.entry = [e[0] as number, e[1] as number];
    else read.fail('entry', `must be [column, row], but is ${describe(e)}`);
    if (!Array.isArray(o.waves) || o.waves.length === 0) {
      read.fail('waves', `must be a list of at least one wave (each a list of { "character", "npc" }), but is ${describe(o.waves)}`);
      return out;
    }
    o.waves.forEach((row: unknown, i: number) => {
      const w = `waves[${i}]`;
      if (!Array.isArray(row) || row.length === 0) {
        read.fail(w, `must be a list of at least one { "character", "npc" }, but is ${describe(row)}`);
        return;
      }
      const people: Outpost['waves'][number] = [];
      row.forEach((item: unknown, k: number) => {
        const p = read.object(item, `${w}[${k}]`);
        if (!p) return;
        read.only(p, ['character', 'npc'], `${w}[${k}]`);
        people.push({ character: read.string(p, 'character', `${w}[${k}]`), npc: read.string(p, 'npc', `${w}[${k}]`) });
      });
      if (people.length > out.bound) read.fail(w, `has ${people.length} people, more than the bound (${out.bound}): this wave could never walk in`);
      out.waves.push(people);
    });
    out.entries = [out.entry];
    if (o.entries !== undefined) {
      if (Array.isArray(o.entries) && o.entries.length > 0 && o.entries.every((t: unknown) => Array.isArray(t) && t.length === 2 && t.every((n) => Number.isInteger(n)))) out.entries = (o.entries as [number, number][]).map(([c, r]) => [c, r]);
      else read.fail('entries', `must be a list of at least one [column, row], or left out, but is ${describe(o.entries)}`);
    }
    out.entryAway = o.entryAway === undefined ? 0 : read.number(o, 'entryAway', '', { min: 0, max: 200 });
    out.announce = [];
    if (o.announce !== undefined) {
      if (Array.isArray(o.announce) && o.announce.every((t) => typeof t === 'string' && t.trim() !== '' && !/[0-9]/.test(t))) out.announce = o.announce as string[];
      else read.fail('announce', `must be a list of words with no digits, one per row, or left out, but is ${describe(o.announce)}`);
    }
    return out;
  },
  check(content, fail) {
    for (const op of Object.values(content.outposts)) {
      const file = `content/outposts/${op.id}.json`;
      const room = content.rooms[op.room];
      if (!room) {
        fail(file, 'room', `no room "${op.room}" (rooms: ${known(content.rooms)})`);
        continue;
      }
      const placed = content.placements[op.room]?.place ?? [];
      if (!placed.some((p) => p.id === op.signaler)) fail(file, 'signaler', `"${op.signaler}" is not a body content/placements/${op.room}.json places`);
      op.callers.forEach((c, i) => {
        const p = placed.find((q) => q.id === c);
        if (!p || p.npc === undefined) fail(file, `callers[${i}]`, `"${c}" is not a person content/placements/${op.room}.json places (an entry of "place" with an "npc")`);
      });
      const [tx, ty] = op.entry;
      if (tx < 0 || ty < 0 || tx >= room.w || ty >= room.h) fail(file, 'entry', `[${tx}, ${ty}] is outside room "${room.id}", which is ${room.w} by ${room.h} tiles`);
      op.entries.forEach(([cx, cy], i) => {
        if (cx < 0 || cy < 0 || cx >= room.w || cy >= room.h) fail(file, `entries[${i}]`, `[${cx}, ${cy}] is outside room "${room.id}", which is ${room.w} by ${room.h} tiles`);
      });
      op.waves.forEach((row, i) =>
        row.forEach((p, k) => {
          if (!(p.character in content.characters)) fail(file, `waves[${i}][${k}].character`, `no character "${p.character}" (characters: ${known(content.characters)})`);
          if (!(p.npc in content.npcs)) fail(file, `waves[${i}][${k}].npc`, `no NPC kind "${p.npc}" (kinds: ${known(content.npcs)})`);
        }),
      );
    }
  },
};
export default kind;
