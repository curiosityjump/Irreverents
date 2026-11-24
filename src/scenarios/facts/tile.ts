import { known } from '../../content/reader.ts';
import { TILE } from '../../content/kinds/rooms.ts';
import { tileAt } from '../../sim/room-state.ts';
import { checkAt, checkOnly } from '../fact-helpers.ts';
import type { Fact } from '../types.ts';

/**
 * { "fact": "tile", "room": "quarry-depot", "tile": [5, 13], "at": 900, "is": "empty" }
 * (Step 22) At that tick the world's tile there (the room file's, or what a
 * working part or a scenario's `tiles` made it: world.rooms) is `is`
 * ("solid", "oneway" or "empty").
 */
const names = Object.keys(TILE) as (keyof typeof TILE)[];
const fact: Fact = {
  id: 'tile',
  validate(spec, scenario, content) {
    const out: string[] = [];
    checkOnly(spec, ['room', 'tile', 'at', 'is'], out);
    checkAt(spec, scenario, out);
    const room = typeof spec.room === 'string' ? content.rooms[spec.room] : undefined;
    if (!room) out.push(`room: no room ${JSON.stringify(spec.room)} (rooms: ${known(content.rooms)})`);
    const t = spec.tile;
    if (!Array.isArray(t) || t.length !== 2 || !t.every((n) => Number.isInteger(n))) out.push('tile: must be [column, row]');
    else if (room && (t[0] < 0 || t[1] < 0 || t[0] >= room.w || t[1] >= room.h)) out.push(`tile: [${t.join(', ')}] is outside room "${room.id}"`);
    if (!names.includes(spec.is as keyof typeof TILE)) out.push(`is: must be one of ${names.join(', ')}`);
    return out;
  },
  test(spec, rec) {
    const world = rec.history[spec.at as number];
    if (!world) return `no tick ${spec.at as number}`;
    const room = rec.content.rooms[spec.room as string]!;
    const [tx, ty] = spec.tile as [number, number];
    const code = tileAt(world, room, tx, ty);
    const is = names.find((n) => TILE[n] === code) ?? String(code);
    return is === spec.is ? null : `at tick ${spec.at as number} tile [${tx}, ${ty}] of "${room.id}" is ${is}, expected ${spec.is as string}`;
  },
};
export default fact;
