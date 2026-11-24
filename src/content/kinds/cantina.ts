import { describe, known } from '../reader.ts';
import type { ContentKind, Reader } from '../types.ts';

/**
 * content/cantina/<room id>.json: what makes a room a cantina (Step 11,
 * D-083 to D-086; docs/mechanisms/cantina.md): the ring-out edge, the pads
 * a body comes back on, how long a brawl takes to calm, the friend numbers
 * while it is on, and one pattern per roster character: how it wanders
 * and how it fights. All data: a new character's pattern is a JSON edit.
 * The file is named after its room, so `id` and `room` are the same text.
 */
export interface Cantina {
  id: string;
  room: string;
  /** In tiles: a body whose middle is outside this rectangle is out. `at` is [column, row] of its top-left tile, `size` [columns, rows]. */
  edge: { at: [number, number]; size: [number, number] };
  /** [column, row]: a body comes back standing on the floor of one of these tiles, in turn. */
  pads: [number, number][];
  /** Seconds with no player attacking in the room before a brawl ends by itself; 0: never (the owner's bell ends it, Q-008). */
  calmTime: number;
  /**
   * The bell that stops the fight (the owner, Q-008: "There is a bell in the
   * middle of the cantina player can use to stop fights"): a fresh press of
   * Use (`interact`) by a player whose middle is within `reach` pixels of the
   * middle of tile `tile` ([column, row]) ends the brawl at once.
   */
  bell: { tile: [number, number]; reach: number };
  /** Shares of a player's attack and throw on another player while a brawl is on (Step 2's friend numbers outside it). */
  friend: { attackLaunch: number; attackWear: number; throwWear: number };
  /** By roster character id. */
  patterns: Record<string, CantinaPattern>;
  /**
   * Step 11 slice B, the party swap (D-084): a tap within `reach` pixels of a
   * regular's box (room pixels, for a finger) opens the party row; it closes
   * by itself after `seconds`. Optional; DRAFT defaults 8 and 6. `lag`
   * (additive, DRAFT default 40): more pixels allowed around the regular
   * the page says it drew under the finger, for how far behind the server
   * a page draws others (docs/mechanisms/cantina.md, "A tap on a walking regular").
   */
  pick: { reach: number; seconds: number; lag: number };
  /**
   * Step 11 slice B (D-088; doc 31: the cantina is "NOT a shortcut for
   * breaking line of sight"): seconds a player stays on the chased list after
   * a good guard last had them in sight, so a blink of lost sight is no way
   * in. Optional; DRAFT default 1.
   */
  chaseHold: number;
}

/** One step of a regular's walking loop: walk until its middle is over `column`, or stand for `seconds`. */
export type WalkStep = { op: 'walk-to'; column: number } | { op: 'wait'; seconds: number };

export interface CantinaPattern {
  /** The loop it walks while there is no brawl. Never pushes the stick up. */
  walk: WalkStep[];
  fight: {
    /** Pixels between its front and its target's side at which it stops closing in and swings. */
    reach: number;
    /** Seconds between swings while in reach. */
    swingEvery: number;
    /** Seconds between jumps while fighting; 0: it never jumps. */
    jumpEvery: number;
  };
}

declare module '../types.ts' {
  interface Content {
    cantina: Record<string, Cantina>;
  }
}

function pair(o: Record<string, unknown>, field: string, where: string, read: Reader, min: number): [number, number] {
  const t = o[field];
  const ok = Array.isArray(t) && t.length === 2 && t.every((n) => Number.isInteger(n) && (n as number) >= min);
  if (!ok) read.fail(Array.isArray(o) ? `${where}[${field}]` : `${where}${where ? '.' : ''}${field}`, `must be two whole numbers of at least ${min}, but is ${describe(t)}`);
  return ok ? [t[0] as number, t[1] as number] : [0, 0];
}

function parseWalk(value: unknown, where: string, read: Reader): WalkStep[] {
  const out: WalkStep[] = [];
  if (!Array.isArray(value) || value.length === 0) {
    read.fail(where, `must be a list of steps, { "walk-to": column } or { "wait": seconds }, but is ${describe(value)}`);
    return out;
  }
  value.forEach((item: unknown, i: number) => {
    const w = `${where}[${i}]`;
    const s = read.object(item, w);
    if (!s) return;
    if (s['walk-to'] !== undefined) {
      read.only(s, ['walk-to'], w);
      out.push({ op: 'walk-to', column: read.number(s, 'walk-to', w, { min: 0, integer: true }) });
    } else if (s.wait !== undefined) {
      read.only(s, ['wait'], w);
      out.push({ op: 'wait', seconds: read.number(s, 'wait', w, { min: 0, max: 600 }) });
    } else read.fail(w, 'is not a walking step: use { "walk-to": column } or { "wait": seconds }');
  });
  // INTENT: the loop runs for ever; without a wait it could spin through every step in one tick.
  if (out.length > 0 && !out.some((s) => s.op === 'wait' && s.seconds > 0)) read.fail(where, 'a walking loop needs at least one { "wait": seconds } longer than 0');
  return out;
}

const kind: ContentKind = {
  id: 'cantina',
  source: { dir: 'cantina' },
  parse(raw, read) {
    const o = read.object(raw, '');
    if (!o) return null;
    read.only(o, ['id', 'room', 'edge', 'pads', 'calmTime', 'bell', 'friend', 'patterns', 'pick', 'chaseHold'], '');
    const out: Cantina = {
      id: read.string(o, 'id', ''),
      room: read.string(o, 'room', ''),
      edge: { at: [0, 0], size: [1, 1] },
      pads: [],
      calmTime: read.number(o, 'calmTime', '', { min: 0, max: 600 }),
      bell: { tile: [0, 0], reach: 16 },
      friend: { attackLaunch: 0, attackWear: 0, throwWear: 0 },
      patterns: {},
      pick: { reach: 8, seconds: 6, lag: 40 },
      chaseHold: o.chaseHold === undefined ? 1 : read.number(o, 'chaseHold', '', { min: 0, max: 30 }),
    };
    if (out.room !== out.id) read.fail('room', `must be the room this file is named after ("${out.id}"), but is ${describe(o.room)}`);
    const edge = read.object(o.edge, 'edge');
    if (edge) {
      read.only(edge, ['at', 'size'], 'edge');
      out.edge = { at: pair(edge, 'at', 'edge', read, 0), size: pair(edge, 'size', 'edge', read, 1) };
    }
    if (!Array.isArray(o.pads) || o.pads.length === 0) read.fail('pads', `must be a list of at least one [column, row], but is ${describe(o.pads)}`);
    else {
      const pads = o.pads as unknown[];
      pads.forEach((_p, i) => out.pads.push(pair(pads as unknown as Record<string, unknown>, String(i), 'pads', read, 0)));
    }
    const bell = read.object(o.bell, 'bell');
    if (bell) {
      read.only(bell, ['tile', 'reach'], 'bell');
      out.bell = { tile: pair(bell, 'tile', 'bell', read, 0), reach: read.number(bell, 'reach', 'bell', { min: 4, max: 64 }) };
    }
    const friend = read.object(o.friend, 'friend');
    if (friend) {
      read.only(friend, ['attackLaunch', 'attackWear', 'throwWear'], 'friend');
      for (const f of ['attackLaunch', 'attackWear', 'throwWear'] as const) out.friend[f] = read.number(friend, f, 'friend', { min: 0, max: 2 });
    }
    if (o.pick !== undefined) {
      const pick = read.object(o.pick, 'pick');
      if (pick) {
        read.only(pick, ['reach', 'seconds', 'lag'], 'pick');
        out.pick = {
          reach: read.number(pick, 'reach', 'pick', { min: 0, max: 64 }),
          seconds: read.number(pick, 'seconds', 'pick', { min: 0.5, max: 60 }),
          lag: pick.lag === undefined ? 40 : read.number(pick, 'lag', 'pick', { min: 0, max: 200 }),
        };
      }
    }
    const patterns = read.object(o.patterns, 'patterns');
    if (patterns) {
      for (const id of Object.keys(patterns)) {
        if (id === '//') continue;
        const w = `patterns.${id}`;
        const p = read.object(patterns[id], w);
        if (!p) continue;
        read.only(p, ['walk', 'fight'], w);
        const fight = read.object(p.fight, `${w}.fight`);
        const pattern: CantinaPattern = { walk: parseWalk(p.walk, `${w}.walk`, read), fight: { reach: 8, swingEvery: 1, jumpEvery: 0 } };
        if (fight) {
          read.only(fight, ['reach', 'swingEvery', 'jumpEvery'], `${w}.fight`);
          pattern.fight = {
            reach: read.number(fight, 'reach', `${w}.fight`, { min: 0, max: 64 }),
            swingEvery: read.number(fight, 'swingEvery', `${w}.fight`, { min: 0.1, max: 60 }),
            jumpEvery: read.number(fight, 'jumpEvery', `${w}.fight`, { min: 0, max: 60 }),
          };
        }
        out.patterns[id] = pattern;
      }
    }
    return out;
  },
  check(content, fail) {
    // DRAFT: one cantina. A regular's id is `cantina:<kind>`, a contract once pushed, with no room in it.
    const files = Object.keys(content.cantina).sort();
    if (files.length > 1) fail(`content/cantina/${files[1]}.json`, '(the whole file)', `there is already a cantina (${files[0]}); a regular's id names no room, so there is one cantina for now`);
    for (const c of Object.values(content.cantina)) {
      const file = `content/cantina/${c.id}.json`;
      const room = content.rooms[c.room];
      if (!room) {
        fail(file, 'room', `no room "${c.room}" (rooms: ${known(content.rooms)})`);
        continue;
      }
      // INTENT: there is always a way out (CLAUDE.md). The chase lock (D-088) is on the doorway IN, the
      // street's; a cantina room's own doors never refuse anyone (controls/rooms/cantina-door-refuses.json).
      room.doors.forEach((d) => {
        if (d.refuse !== undefined) fail(`content/rooms/${room.id}.json`, `door ${d.id}`, `has "refuse": "${d.refuse}", but a cantina's own doors never refuse anyone: there is always a way out (only the doorway in, in another room, may)`);
      });
      const [ex, ey] = c.edge.at;
      const [ew, eh] = c.edge.size;
      if (ex + ew > room.w || ey + eh > room.h) fail(file, 'edge', `reaches past room "${room.id}", which is ${room.w} by ${room.h} tiles`);
      // INTENT: outside a room's rows reads as solid, so a body can never leave a room's bounds; an edge
      // that touches a side of the room could never be crossed there (docs/mechanisms/cantina.md).
      if (ex === 0 && ex + ew === room.w) fail(file, 'edge', `spans the whole width of room "${room.id}": leave open air between it and at least one side, or nobody can be launched out`);
      const inEdge = (tx: number): boolean => tx >= ex && tx < ex + ew;
      c.pads.forEach(([tx, ty], i) => {
        if (!inEdge(tx) || ty < ey || ty >= ey + eh) fail(file, `pads[${i}]`, `[${tx}, ${ty}] is outside the edge: a body put there would be out again at once`);
      });
      const [bx, by] = c.bell.tile;
      if (!inEdge(bx) || by < ey || by >= ey + eh) fail(file, 'bell.tile', `[${bx}, ${by}] is outside the edge: nobody could stand by it`);
      const roster = content.roster.characters;
      for (const id of roster) if (!c.patterns[id]) fail(file, 'patterns', `has no pattern for roster character "${id}": every roster character wanders the cantina`);
      for (const [id, p] of Object.entries(c.patterns)) {
        if (!roster.includes(id)) fail(file, `patterns.${id}`, `"${id}" is not in the roster (content/roster.json: ${roster.join(', ')})`);
        p.walk.forEach((s, k) => {
          if (s.op === 'walk-to' && !inEdge(s.column)) fail(file, `patterns.${id}.walk[${k}]`, `column ${s.column} is outside the edge (columns ${ex} to ${ex + ew - 1}): a regular must never walk out`);
        });
      }
    }
  },
};
export default kind;
