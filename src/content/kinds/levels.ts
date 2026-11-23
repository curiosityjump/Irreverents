import { describe, known } from '../reader.ts';
import type { Content, ContentKind } from '../types.ts';

/**
 * content/levels/<id>.json: a level, several rooms that make one place you
 * go into (Step 14 slice A; docs/mechanisms/levels.md). Its rooms, the
 * doorways that lead into it from outside, and which entrance art they wear.
 * The world remembers which levels someone has been inside and which of their
 * rooms and areas (`world.levels`, systems/level-explore.ts); the doorway and
 * the menu show it as a name and a completion pie (D-078, D-079).
 *
 * DRAFT: every field here (the owner, 2026-11-23: "Not finding clear 'level
 * entries' with discovered indicators etc"). Adding a level is one file.
 */
export interface Level {
  id: string;
  /** Shown on the sign at the doorway, in the banner and the menu. A name is data: never put it in an id. */
  name: string;
  /** Its room ids (content/rooms/). A room is in one level at most. */
  rooms: string[];
  /** The doorways that lead into it from outside: a door of a room outside the level whose far end is inside. May be empty (where you start). */
  entries: { room: string; door: string }[];
  /** Which entrance art its entries wear: a look `level-entry-<look>` (content/looks/levels.json). */
  look: string;
}

declare module '../types.ts' {
  interface Content {
    levels: Record<string, Level>;
  }
}

/** DRAFT: the entrance arts the sheet has (tools/art/levels/make.py). */
export const LEVEL_LOOKS = ['arch', 'gem-door', 'mine', 'portal'] as const;

const kind: ContentKind = {
  id: 'levels',
  source: { dir: 'levels' },
  parse(raw, read) {
    const o = read.object(raw, '');
    if (!o) return null;
    read.only(o, ['id', 'name', 'rooms', 'entries', 'look'], '');
    const out: Level = {
      id: read.string(o, 'id', ''),
      name: read.string(o, 'name', ''),
      rooms: read.stringList(o, 'rooms', ''),
      entries: [],
      look: read.string(o, 'look', ''),
    };
    if (out.look && !(LEVEL_LOOKS as readonly string[]).includes(out.look)) read.fail('look', `must be one of ${LEVEL_LOOKS.join(', ')}, but is ${describe(out.look)}`);
    if (out.rooms.length === 0) read.fail('rooms', 'lists no rooms');
    if (!Array.isArray(o.entries)) read.fail('entries', `must be a list of { "room", "door" } (it may be empty), but is ${describe(o.entries)}`);
    else
      o.entries.forEach((item: unknown, i: number) => {
        const p = read.object(item, `entries[${i}]`);
        if (!p) return;
        read.only(p, ['room', 'door'], `entries[${i}]`);
        out.entries.push({ room: read.string(p, 'room', `entries[${i}]`), door: read.string(p, 'door', `entries[${i}]`) });
      });
    return out;
  },
  check(content, fail) {
    const owner = new Map<string, string>();
    for (const lv of Object.values(content.levels).sort((a, b) => (a.id < b.id ? -1 : 1))) {
      const file = `content/levels/${lv.id}.json`;
      lv.rooms.forEach((r, i) => {
        if (!(r in content.rooms)) fail(file, `rooms[${i}]`, `no room "${r}" (rooms: ${known(content.rooms)})`);
        const other = owner.get(r);
        if (other !== undefined) fail(file, `rooms[${i}]`, `room "${r}" is already in level "${other}": a room is in one level at most`);
        else owner.set(r, lv.id);
      });
      lv.entries.forEach((en, i) => {
        const room = content.rooms[en.room];
        if (!room) return fail(file, `entries[${i}].room`, `no room "${en.room}" (rooms: ${known(content.rooms)})`);
        const door = room.doors.find((d) => d.id === en.door);
        if (!door) return fail(file, `entries[${i}].door`, `room "${en.room}" has no door "${en.door}" (doors: ${room.doors.map((d) => d.id).join(', ') || 'none'})`);
        if (lv.rooms.includes(en.room)) fail(file, `entries[${i}]`, `"${en.room}" is inside this level: an entry is a doorway from outside it`);
        if (!lv.rooms.includes(door.to.room)) fail(file, `entries[${i}]`, `door "${en.door}" leads to "${door.to.room}", which is not one of this level's rooms`);
        if (door.hidden) fail(file, `entries[${i}]`, `door "${en.door}" is hidden: an entrance is drawn, and nothing may point at a hidden door`);
      });
    }
  },
};
export default kind;

/** Which level each room is in (rooms in none are absent). Cached per content. */
const roomLevels = new WeakMap<Content, Map<string, string>>();
export function levelOfRoom(content: Content, room: string): string | undefined {
  let m = roomLevels.get(content);
  if (!m) {
    m = new Map();
    for (const lv of Object.values(content.levels ?? {})) for (const r of lv.rooms) if (!m.has(r)) m.set(r, lv.id);
    roomLevels.set(content, m);
  }
  return m.get(room);
}

/**
 * Every place a level counts, in a fixed order: each room (`<room>`) and
 * each of its areas (`<room>/<area>`), hidden ones included (D-079: "Hidden
 * rooms should contribute to the percentage").
 */
export function levelPlaces(content: Content, level: Level): string[] {
  const out: string[] = [];
  for (const r of level.rooms) {
    out.push(r);
    for (const a of content.rooms[r]?.areas ?? []) out.push(`${r}/${a.id}`);
  }
  return out;
}
