import { ID_PATTERN } from '../assemble.ts';
import { describe, known } from '../reader.ts';
import type { ContentKind } from '../types.ts';

/**
 * content/placements/<room id>.json: who and what stands in a room when it
 * is set up, kept apart from the room's geometry (docs/architecture.md).
 * DRAFT: the minimal shape, landed by Step 2 so crates and dummies can be
 * placed; Step 4 owns this kind from here and adds fields (additively).
 * The file is named after its room, so `id` and `room` are the same text.
 */
export interface Placements {
  id: string;
  room: string;
  place: {
    /** The entity's id in the world. Unique across every placements file. */
    id: string;
    /** A character kind id (content/characters/). */
    character: string;
    /** [column, row]: the body stands with its feet on the floor of this tile, centred. */
    tile: [number, number];
  }[];
}

declare module '../types.ts' {
  interface Content {
    placements: Record<string, Placements>;
  }
}

const kind: ContentKind = {
  id: 'placements',
  source: { dir: 'placements' },
  parse(raw, read) {
    const o = read.object(raw, '');
    if (!o) return null;
    read.only(o, ['id', 'room', 'place'], '');
    const out: Placements = { id: read.string(o, 'id', ''), room: read.string(o, 'room', ''), place: [] };
    if (out.room !== out.id) read.fail('room', `must be the room this file is named after ("${out.id}"), but is ${describe(o.room)}`);
    if (!Array.isArray(o.place)) {
      read.fail('place', `must be a list, but is ${describe(o.place)}`);
      return out;
    }
    o.place.forEach((item: unknown, i: number) => {
      const w = `place[${i}]`;
      const p = read.object(item, w);
      if (!p) return;
      read.only(p, ['id', 'character', 'tile'], w);
      const id = read.string(p, 'id', w);
      if (id && !ID_PATTERN.test(id)) read.fail(`${w}.id`, `"${id}" is not a valid id: use lower-case letters, digits and dashes, starting with a letter`);
      if (out.place.some((q) => q.id === id)) read.fail(`${w}.id`, `"${id}" is placed twice in this file`);
      const t = p.tile;
      const ok = Array.isArray(t) && t.length === 2 && t.every((n) => Number.isInteger(n));
      if (!ok) read.fail(`${w}.tile`, `must be [column, row], but is ${describe(t)}`);
      out.place.push({ id, character: read.string(p, 'character', w), tile: ok ? [t[0] as number, t[1] as number] : [0, 0] });
    });
    return out;
  },
  check(content, fail) {
    const seen: Record<string, string> = {};
    for (const pl of Object.values(content.placements)) {
      const file = `content/placements/${pl.id}.json`;
      const room = content.rooms[pl.room];
      if (!room) {
        fail(file, 'room', `no room "${pl.room}" (rooms: ${known(content.rooms)})`);
        continue;
      }
      pl.place.forEach((p, i) => {
        const w = `place[${i}]`;
        if (seen[p.id]) fail(file, `${w}.id`, `"${p.id}" is already placed by ${seen[p.id]}; an id must be unique across every room`);
        else seen[p.id] = file;
        if (!(p.character in content.characters)) fail(file, `${w}.character`, `no character "${p.character}" (characters: ${known(content.characters)})`);
        const [tx, ty] = p.tile;
        if (tx < 0 || ty < 0 || tx >= room.w || ty >= room.h) fail(file, `${w}.tile`, `[${tx}, ${ty}] is outside room "${room.id}", which is ${room.w} by ${room.h} tiles`);
      });
    }
  },
};
export default kind;
