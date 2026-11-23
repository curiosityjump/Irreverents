import { checkOnly, feet, isRange, isTick } from '../fact-helpers.ts';
import type { Fact } from '../types.ts';

/**
 * { "fact": "people", "room": "castle-street", "between": [0, 6000], "count": [0, 8] }
 * { "fact": "people", "room": "castle-street", "at": 3000, "x": [40, 120], "count": [1, 1] }
 * How many people (bodies nobody plays that carry `c.npc`: placed people and
 * anyone a dispatch row or a wave walked in, out cold or not) are in a room,
 * at a tick or on every tick of a span, both ends included (Step 4, the
 * town's tiers: a dispatch row waits while it would pass the cap). With `x`,
 * only those whose feet are within [min, max] pixels across (people a row
 * walked in have ids no scenario can name ahead, so this is how to say where
 * they are). With `"arrivals": true`, only people a dispatch row walked in
 * (`c.arrival`), and `room` may be left out to count them in every room.
 */
const fact: Fact = {
  id: 'people',
  validate(spec, scenario, content) {
    const out: string[] = [];
    checkOnly(spec, ['room', 'at', 'between', 'count', 'x', 'arrivals'], out);
    if (spec.arrivals !== undefined && spec.arrivals !== true) out.push(`arrivals: must be true or left out, but is ${JSON.stringify(spec.arrivals)}`);
    if (spec.x !== undefined && !isRange(spec.x)) out.push(`x: must be [min, max] pixels, but is ${JSON.stringify(spec.x)}`);
    if (!(spec.room === undefined && spec.arrivals === true) && (typeof spec.room !== 'string' || !(spec.room in content.rooms))) out.push(`room: must be a room id, but is ${JSON.stringify(spec.room)}`);
    if (!isRange(spec.count)) out.push(`count: must be [min, max], but is ${JSON.stringify(spec.count)}`);
    const b = spec.between;
    if ((spec.at === undefined) === (b === undefined)) out.push('at / between: give one or the other');
    else if (spec.at !== undefined && !isTick(spec.at, scenario)) out.push(`at: must be a tick from 0 to ${scenario.ticks}, but is ${JSON.stringify(spec.at)}`);
    else if (b !== undefined && (!isRange(b) || !isTick(b[0], scenario) || !isTick(b[1], scenario))) {
      out.push(`between: must be [first tick, last tick] within 0 to ${scenario.ticks}, but is ${JSON.stringify(b)}`);
    }
    return out;
  },
  test(spec, rec) {
    const [from, to] = spec.at !== undefined ? [spec.at as number, spec.at as number] : (spec.between as [number, number]);
    const [min, max] = spec.count as [number, number];
    for (let t = from; t <= to; t++) {
      const here = (rec.history[t]?.entities ?? []).filter((e) => {
        if ((spec.room !== undefined && e.room !== spec.room) || e.player !== null || e.c.npc === undefined) return false;
        if (spec.arrivals === true && e.c.arrival === undefined) return false;
        if (spec.x === undefined) return true;
        const [lo, hi] = spec.x as [number, number];
        const mid = feet(rec, e).x;
        return mid >= lo && mid <= hi;
      });
      if (here.length < min || here.length > max) return `at tick ${t} ${here.length} ${spec.arrivals === true ? 'arrivals' : 'people'} are in ${spec.room === undefined ? 'the world' : String(spec.room)} (${here.map((e) => e.id).join(', ')}), expected ${min} to ${max}${spec.x === undefined ? '' : ` within x ${JSON.stringify(spec.x)}`}`;
    }
    return null;
  },
};
export default fact;
