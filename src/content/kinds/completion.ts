import { describe, known } from '../reader.ts';
import { TILE } from './rooms.ts';
import type { ContentKind } from '../types.ts';

/**
 * content/completion/<level id>.json: the pieces hidden in a level (Step 14
 * slice B; D-078 "hidden components that assemble into a final object whose
 * identity is UNKNOWN to the player"; docs/mechanisms/levels.md, "Pieces").
 * A piece is placed (`room`, `tile`: a played hero's box touching the tile
 * finds it) or comes `from` something already in the game: a once-only thing
 * taken (its `takenBy` set, read as state, so an old kept game is not locked
 * out) or a prize carried out (`world.banked`, the heist slice's field).
 * INTENT: ids never say what anything is, nor what the set builds.
 * DRAFT: every field here.
 */
export interface Piece {
  id: string;
  /** Placed: the room (one of the level's) and the tile ([column, row]) it lies in. */
  room?: string;
  tile?: [number, number];
  /** Placed: how it is drawn lying there, a look id (content/looks/; the cut `item-*` loose items). */
  look?: string;
  /** Or found by something else happening: a thing taken, or a prize carried out. */
  from?: { thing: string } | { prize: string };
}

export interface CompletionSet {
  /** The level id (content/levels/). */
  id: string;
  pieces: Piece[];
  /**
   * What the finished set makes (push 3): a body of this character that
   * appears at this room and tile when the last piece is found (system
   * completion-build). Absent: nothing assembles. The room may be any room.
   * INTENT: the character's id says which level's set, never what it is.
   */
  builds?: { character: string; room: string; tile: [number, number] };
}

declare module '../types.ts' {
  interface Content {
    completion: Record<string, CompletionSet>;
  }
}

const kind: ContentKind = {
  id: 'completion',
  source: { dir: 'completion' },
  parse(raw, read) {
    const o = read.object(raw, '');
    if (!o) return null;
    read.only(o, ['id', 'pieces', 'builds'], '');
    const out: CompletionSet = { id: read.string(o, 'id', ''), pieces: [] };
    if (o.builds !== undefined) {
      const b = read.object(o.builds, 'builds');
      if (b) {
        read.only(b, ['character', 'room', 'tile'], 'builds');
        const t = b.tile;
        const ok = Array.isArray(t) && t.length === 2 && t.every((n) => Number.isInteger(n));
        if (!ok) read.fail('builds.tile', `must be [column, row], but is ${describe(t)}`);
        const tile: [number, number] = ok ? [t[0] as number, t[1] as number] : [0, 0];
        out.builds = { character: read.string(b, 'character', 'builds'), room: read.string(b, 'room', 'builds'), tile };
      }
    }
    if (!Array.isArray(o.pieces) || o.pieces.length === 0) {
      read.fail('pieces', `must be a list of at least one piece, but is ${describe(o.pieces)}`);
      return out;
    }
    const ids = new Set<string>();
    o.pieces.forEach((item: unknown, i: number) => {
      const w = `pieces[${i}]`;
      const p = read.object(item, w);
      if (!p) return;
      read.only(p, ['id', 'room', 'tile', 'look', 'from'], w);
      const piece: Piece = { id: read.string(p, 'id', w) };
      if (ids.has(piece.id)) read.fail(`${w}.id`, `"${piece.id}" is used twice in this file`);
      ids.add(piece.id);
      if (p.from !== undefined) {
        const f = read.object(p.from, `${w}.from`);
        if (f) {
          read.only(f, ['thing', 'prize'], `${w}.from`);
          if (typeof f.thing === 'string' && f.thing && f.prize === undefined) piece.from = { thing: f.thing };
          else if (typeof f.prize === 'string' && f.prize && f.thing === undefined) piece.from = { prize: f.prize };
          else read.fail(`${w}.from`, 'must be { "thing": "<placed thing id>" } or { "prize": "<prize id>" }');
        }
        if (p.room !== undefined || p.tile !== undefined) read.fail(w, 'a piece is either placed (room, tile) or comes from something (from), not both');
      } else {
        piece.room = read.string(p, 'room', w);
        const t = p.tile;
        if (Array.isArray(t) && t.length === 2 && t.every((n) => Number.isInteger(n))) piece.tile = [t[0] as number, t[1] as number];
        else read.fail(`${w}.tile`, `must be [column, row], but is ${describe(t)}`);
        piece.look = p.look === undefined ? 'item-gear' : read.string(p, 'look', w);
      }
      out.pieces.push(piece);
    });
    return out;
  },
  check(content, fail) {
    const seen = new Map<string, string>();
    for (const set of Object.values(content.completion)) {
      const file = `content/completion/${set.id}.json`;
      const level = content.levels?.[set.id];
      if (!level) {
        fail(file, 'id', `no level "${set.id}" (levels: ${known(content.levels ?? {})})`);
        continue;
      }
      if (set.builds) {
        const b = set.builds;
        const room = content.rooms[b.room];
        if (!content.characters[b.character]) fail(file, 'builds.character', `no character "${b.character}" (characters: ${known(content.characters)})`);
        if (!room) fail(file, 'builds.room', `no room "${b.room}" (rooms: ${known(content.rooms)})`);
        else {
          const [tx, ty] = b.tile;
          if (tx < 0 || ty < 0 || tx >= room.w || ty >= room.h) fail(file, 'builds.tile', `[${tx}, ${ty}] is outside room "${room.id}" (${room.w} by ${room.h} tiles)`);
          else if (room.cells[ty * room.w + tx] === TILE.solid) fail(file, 'builds.tile', `[${tx}, ${ty}] is a solid tile of room "${room.id}"`);
        }
      }
      set.pieces.forEach((p, i) => {
        const w = `pieces[${i}]`;
        const other = seen.get(p.id);
        if (other) fail(file, `${w}.id`, `"${p.id}" is already a piece of ${other}: piece ids are unique across every set`);
        seen.set(p.id, set.id);
        if (p.from && 'thing' in p.from) {
          const thing = p.from.thing;
          const where = level.rooms.find((r) => content.placements?.[r]?.things?.some((t) => t.id === thing && t.once));
          if (!where) fail(file, `${w}.from.thing`, `"${thing}" is not a once-only thing placed in a room of level "${set.id}" (content/placements/)`);
          return;
        }
        if (p.from) return; // a prize: the heist slice's ids, read with a default
        const room = p.room ? content.rooms[p.room] : undefined;
        if (!room) return fail(file, `${w}.room`, `no room "${p.room}" (rooms: ${known(content.rooms)})`);
        if (!level.rooms.includes(room.id)) fail(file, `${w}.room`, `"${room.id}" is not a room of level "${set.id}" (${level.rooms.join(', ')})`);
        const [tx, ty] = p.tile ?? [0, 0];
        if (tx < 0 || ty < 0 || tx >= room.w || ty >= room.h) return fail(file, `${w}.tile`, `[${tx}, ${ty}] is outside room "${room.id}" (${room.w} by ${room.h} tiles)`);
        if (room.cells[ty * room.w + tx] === TILE.solid) fail(file, `${w}.tile`, `[${tx}, ${ty}] is a solid tile of room "${room.id}": nobody could touch it`);
        if (p.look && content.looks && !Object.values(content.looks).some((g) => p.look! in g.looks)) fail(file, `${w}.look`, `no look "${p.look}" in content/looks/`);
      });
    }
  },
};
export default kind;
