import { known } from '../../content/reader.ts';
import { checkOnly, isRange, isTick } from '../fact-helpers.ts';
import type { Fact } from '../types.ts';

/**
 * { "fact": "people-count", "room": "test-outpost", "between": [0, 900], "count": [3, 8] }
 * On every tick from 0 to 900 (both included), the number of people in the
 * room (bodies nobody plays with an NPC kind, out cold or not: what an
 * outpost's bound counts, docs/mechanisms/outposts.md) is within the range.
 */
const fact: Fact = {
  id: 'people-count',
  validate(spec, scenario, content) {
    const out: string[] = [];
    checkOnly(spec, ['room', 'between', 'count'], out);
    if (typeof spec.room !== 'string' || !(spec.room in content.rooms)) out.push(`room: no room ${JSON.stringify(spec.room)} (rooms: ${known(content.rooms)})`);
    const b = spec.between;
    if (!isRange(b) || !isTick(b[0], scenario) || !isTick(b[1], scenario)) out.push(`between: must be [first tick, last tick] within 0 to ${scenario.ticks}, but is ${JSON.stringify(b)}`);
    if (!isRange(spec.count)) out.push(`count: must be [min, max], but is ${JSON.stringify(spec.count)}`);
    return out;
  },
  test(spec, rec) {
    const [from, to] = spec.between as [number, number];
    const [min, max] = spec.count as [number, number];
    for (let t = from; t <= to; t++) {
      const n = rec.history[t]!.entities.filter((e) => e.c.npc !== undefined && e.player === null && e.room === spec.room).length;
      if (n < min || n > max) return `at tick ${t} room "${spec.room}" holds ${n} people, expected ${min} to ${max}`;
    }
    return null;
  },
};
export default fact;
