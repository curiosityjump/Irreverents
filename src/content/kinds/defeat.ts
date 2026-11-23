import { describe, known } from '../reader.ts';
import type { ContentKind } from '../types.ts';

/**
 * content/defeat/<place>.json (Step 21, risk; docs/mechanisms/defeat.md):
 * what being beaten costs in one bad guys' place. A played hero knocked flat
 * in one of `rooms` while a standing person of the place (an NPC kind in
 * `seizers`) can reach them is stood over for `beat` seconds, then thrown
 * out to `lands`: flat there, free when they get up. What they carried goes
 * back; the place keeps its state.
 *
 * INTENT (CLAUDE.md, "There is always a way out"; D-019, "NOT an
 * automatic-reload punishment loop"): the throw is itself the exit. A place
 * with no file, or a file that is off, throws nobody: the hero gets up where
 * they lie, as before Step 21.
 * DRAFT (O-006 is OPEN; docs/decisions-log.md, "Step 21"): every field and
 * number here is a first pass.
 */
export interface Defeat {
  id: string;
  /** The switch: false is the game before Step 21 (nobody is thrown out of here). */
  on: boolean;
  /** The rooms of the place (content/rooms/). */
  rooms: string[];
  /** The NPC kinds (content/npcs/) who stand over a beaten hero: the place's side. */
  seizers: string[];
  /** Pixels between the seizer's box and the hero's (sideways) that count as "can reach". */
  reach: number;
  /**
   * How many times a hero must be knocked flat here within `window` seconds,
   * this fall included, before the next fall in reach of a seizer throws them
   * out. 1: the first fall does (the orchestrator's other answer is one number).
   * DRAFT (the orchestrator, 2026-11-23, docs/decisions-log.md "Step 21"): a
   * last stand must be able to grow; one fall is part of the fight.
   */
  downs: number;
  /** Seconds a fall is remembered for `downs`. */
  window: number;
  /** Seconds the seizer stands over the hero before the throw. Below world.flattenTime. */
  beat: number;
  /**
   * Only while the place's alert (its room's area) is above this (the town).
   * Left out: always (the camp).
   */
  alertAbove: number | null;
  /** Where a thrown-out hero lands: a room one door away at most, and a door of it or a tile in it. */
  lands: { room: string; door: string | null; tile: [number, number] | null };
  /**
   * Whether the place's chasers may follow: true tells the existing chase
   * rules which door the hero went by (a `changed-room` for it), so guards who
   * saw it walk out after them. False: nobody is told.
   */
  follow: boolean;
  /** The banners (no digits): on being thrown out, and on a carried prize going back. */
  words: { thrownOut: string; prizeReturned: string };
}

declare module '../types.ts' {
  interface Content {
    defeat: Record<string, Defeat>;
  }
}

const kind: ContentKind = {
  id: 'defeat',
  source: { dir: 'defeat' },
  parse(raw, read) {
    const o = read.object(raw, '');
    if (!o) return null;
    read.only(o, ['id', 'on', 'rooms', 'seizers', 'reach', 'downs', 'window', 'beat', 'alertAbove', 'lands', 'follow', 'words'], '');
    if (typeof o.on !== 'boolean') read.fail('on', `must be true or false, but is ${describe(o.on)}`);
    if (o.follow !== undefined && typeof o.follow !== 'boolean') read.fail('follow', `must be true or false, but is ${describe(o.follow)}`);
    const out: Defeat = {
      id: read.string(o, 'id', ''),
      on: o.on === true,
      rooms: read.stringList(o, 'rooms', ''),
      seizers: read.stringList(o, 'seizers', ''),
      reach: read.number(o, 'reach', '', { min: 0, max: 200 }),
      downs: read.number(o, 'downs', '', { min: 1, max: 99, integer: true }),
      window: read.number(o, 'window', '', { min: 1, max: 3600 }),
      beat: read.number(o, 'beat', '', { min: 0.05, max: 30 }),
      alertAbove: o.alertAbove === undefined ? null : read.number(o, 'alertAbove', '', { min: 0, max: 3, integer: true }),
      lands: { room: '', door: null, tile: null },
      follow: o.follow === true,
      words: { thrownOut: '', prizeReturned: '' },
    };
    if (out.rooms.length === 0) read.fail('rooms', 'must name at least one room');
    if (out.seizers.length === 0) read.fail('seizers', 'must name at least one NPC kind');
    const l = read.object(o.lands, 'lands');
    if (l) {
      read.only(l, ['room', 'door', 'tile'], 'lands');
      out.lands.room = read.string(l, 'room', 'lands');
      if (l.door !== undefined) out.lands.door = read.string(l, 'door', 'lands');
      const t = l.tile;
      if (t !== undefined) {
        if (Array.isArray(t) && t.length === 2 && t.every((n) => Number.isInteger(n))) out.lands.tile = [t[0] as number, t[1] as number];
        else read.fail('lands.tile', `must be [column, row], but is ${describe(t)}`);
      }
      if ((out.lands.door === null) === (out.lands.tile === null)) read.fail('lands', 'give exactly one of "door" or "tile"');
    }
    const w = read.object(o.words, 'words');
    if (w) {
      read.only(w, ['thrownOut', 'prizeReturned'], 'words');
      out.words.thrownOut = read.string(w, 'thrownOut', 'words');
      out.words.prizeReturned = read.string(w, 'prizeReturned', 'words');
      for (const [k, v] of Object.entries(out.words)) if (/[0-9]/.test(v)) read.fail(`words.${k}`, `"${v}" has a digit; nothing drawn shows numbers`);
    }
    return out;
  },
  check(content, fail) {
    const flatten = content.tuning.world.flattenTime ?? 3;
    for (const d of Object.values(content.defeat ?? {})) {
      const file = `content/defeat/${d.id}.json`;
      d.rooms.forEach((r, i) => {
        if (!(r in content.rooms)) fail(file, `rooms[${i}]`, `no room "${r}" (rooms: ${known(content.rooms)})`);
        if (content.cantina?.[r]) fail(file, `rooms[${i}]`, `"${r}" is a cantina: its brawl has its own rules (D-086), nobody is thrown out of it`);
      });
      d.seizers.forEach((s, i) => {
        if (!(s in content.npcs)) fail(file, `seizers[${i}]`, `no NPC kind "${s}" (kinds: ${known(content.npcs)})`);
      });
      if (d.beat >= flatten) fail(file, 'beat', `${d.beat} s is not below world.flattenTime (${flatten} s): the hero would get up before the throw`);
      const room = content.rooms[d.lands.room];
      if (!room) {
        fail(file, 'lands.room', `no room "${d.lands.room}" (rooms: ${known(content.rooms)})`);
        continue;
      }
      // DRAFT: one room away at most: a room of the place, or the far side of one of its doors.
      const near = d.rooms.includes(room.id) || d.rooms.some((r) => content.rooms[r]?.doors.some((x) => x.to.room === room.id));
      if (!near) fail(file, 'lands.room', `"${room.id}" is not one of the place's rooms or one door away from them`);
      if (d.lands.door !== null && !room.doors.some((x) => x.id === d.lands.door)) {
        fail(file, 'lands.door', `room "${room.id}" has no door "${d.lands.door}" (doors: ${room.doors.map((x) => x.id).join(', ')})`);
      }
      if (d.lands.tile) {
        const [tx, ty] = d.lands.tile;
        if (tx < 0 || ty < 0 || tx >= room.w || ty >= room.h) fail(file, 'lands.tile', `[${tx}, ${ty}] is outside room "${room.id}", which is ${room.w} by ${room.h} tiles`);
      }
    }
  },
};
export default kind;
