import { known } from '../../content/reader.ts';
import { bodyAt, bodyName, checkAt, checkBody, checkOnly } from '../fact-helpers.ts';
import type { Fact } from '../types.ts';

/**
 * { "fact": "in-room", "player": "a", "at": 200, "room": "castle-street" }
 * At that tick the player (or, with "entity" instead of "player", a body
 * nobody plays) is in that room.
 */
const fact: Fact = {
  id: 'in-room',
  validate(spec, scenario, content) {
    const out: string[] = [];
    checkOnly(spec, ['player', 'entity', 'at', 'room'], out);
    checkBody(spec, scenario, out, content);
    checkAt(spec, scenario, out);
    if (typeof spec.room !== 'string' || !(spec.room in content.rooms)) out.push(`room: no room ${JSON.stringify(spec.room)} (rooms: ${known(content.rooms)})`);
    return out;
  },
  test(spec, rec) {
    const e = bodyAt(rec, spec, spec.at as number);
    if (!e) return `${bodyName(spec)} is not in the world at tick ${spec.at}`;
    if (e.room === spec.room) return null;
    return `at tick ${spec.at} ${bodyName(spec)} is in room "${e.room}", expected "${spec.room}"`;
  },
};
export default fact;
