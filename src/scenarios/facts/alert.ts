import { checkOnly, isRange, isTick } from '../fact-helpers.ts';
import type { Fact } from '../types.ts';

/**
 * { "fact": "alert", "area": "test-street", "at": 900, "is": 1 }
 * { "fact": "alert", "area": "test-street", "between": [0, 600], "is": 0 }
 * An area's alert level (0 to 3) at a tick, or on every tick of a span,
 * both ends included. An area is a room id tonight; one with no alert
 * entity yet is at 0.
 */
const fact: Fact = {
  id: 'alert',
  validate(spec, scenario, content) {
    const out: string[] = [];
    checkOnly(spec, ['area', 'at', 'between', 'is'], out);
    if (typeof spec.area !== 'string' || !(spec.area in content.rooms)) out.push(`area: must be a room id, but is ${JSON.stringify(spec.area)}`);
    if (![0, 1, 2, 3].includes(spec.is as number)) out.push(`is: must be 0, 1, 2 or 3, but is ${JSON.stringify(spec.is)}`);
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
    for (let t = from; t <= to; t++) {
      const level = rec.history[t]?.entities.find((x) => x.id === `~alert:${String(spec.area)}`)?.c.alert?.level ?? 0;
      if (level !== spec.is) {
        const changes = rec.events.filter((ev) => ev.type === 'alert-changed').map((ev) => (ev.type === 'alert-changed' ? `${ev.from}->${ev.to} at tick ${ev.tick}` : ''));
        return `at tick ${t} the alert of ${String(spec.area)} is ${level}, expected ${String(spec.is)}; alert changes in this run: ${changes.join(', ') || 'none'}`;
      }
    }
    return null;
  },
};
export default fact;
