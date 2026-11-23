import { known } from '../../content/reader.ts';
import { checkOnly, feet, isRange, isTick } from '../fact-helpers.ts';
import type { Fact } from '../types.ts';

/**
 * { "fact": "people-at", "room": "outpost", "at": 900, "ids": "outpost:w0:", "x": [0, 400], "count": [1, 9] }
 * Step 7: at tick `at`, the number of people in the room (bodies nobody
 * plays with an NPC kind, out cold or not) whose id starts with `ids`
 * (optional; a wave's people are `<outpost>:w<wave>:<i>`) and whose feet
 * are within `x` (pixels across; optional) is within `count`. For bodies a
 * scenario does not place, such as a wave that walked in.
 */
const fact: Fact = {
  id: 'people-at',
  validate(spec, scenario, content) {
    const out: string[] = [];
    checkOnly(spec, ['room', 'at', 'ids', 'x', 'count'], out);
    if (typeof spec.room !== 'string' || !(spec.room in content.rooms)) out.push(`room: no room ${JSON.stringify(spec.room)} (rooms: ${known(content.rooms)})`);
    if (!isTick(spec.at, scenario)) out.push(`at: must be a tick from 0 to ${scenario.ticks}, but is ${JSON.stringify(spec.at)}`);
    if (spec.ids !== undefined && (typeof spec.ids !== 'string' || spec.ids === '')) out.push(`ids: must be non-empty text (the start of the ids counted), but is ${JSON.stringify(spec.ids)}`);
    if (spec.x !== undefined && !isRange(spec.x)) out.push(`x: must be [min, max] pixels, but is ${JSON.stringify(spec.x)}`);
    if (!isRange(spec.count)) out.push(`count: must be [min, max], but is ${JSON.stringify(spec.count)}`);
    return out;
  },
  test(spec, rec) {
    const at = spec.at as number;
    const [min, max] = spec.count as [number, number];
    const ids = spec.ids as string | undefined;
    const span = spec.x as [number, number] | undefined;
    const found = rec.history[at]!.entities.filter((e) => {
      if (e.c.npc === undefined || e.player !== null || e.room !== spec.room) return false;
      if (ids !== undefined && !e.id.startsWith(ids)) return false;
      if (!span) return true;
      const fx = feet(rec, e).x;
      return fx >= span[0] && fx <= span[1];
    });
    if (found.length >= min && found.length <= max) return null;
    return `at tick ${at} room "${spec.room}" holds ${found.length} such people (${found.map((e) => `${e.id} at x ${Math.round(e.x)}`).join(', ') || 'none'}), expected ${min} to ${max}`;
  },
};
export default fact;
