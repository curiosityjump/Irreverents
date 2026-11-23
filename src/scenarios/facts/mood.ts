import { checkOnly, isRange, isTick } from '../fact-helpers.ts';
import type { Fact } from '../types.ts';

/**
 * { "fact": "mood", "npc": "shopkeeper-1", "at": 240, "is": 2 }
 * { "fact": "mood", "npc": "shopkeeper-1", "between": [0, 600], "is": 1 }
 * A person's mood (1 business as usual, 2 distress, 3 rage) at a tick, or
 * on every tick of a span, both ends included. "npc" is the id of a person
 * the scenario room's placements file places (the scenario needs
 * "placements": true).
 */
const fact: Fact = {
  id: 'mood',
  validate(spec, scenario, content) {
    const out: string[] = [];
    checkOnly(spec, ['npc', 'at', 'between', 'is'], out);
    const people = scenario.placements ? (content.placements[scenario.room]?.place ?? []).filter((p) => p.npc !== undefined).map((p) => p.id) : [];
    if (typeof spec.npc !== 'string' || !people.includes(spec.npc)) {
      out.push(`npc: must be a person placed in this scenario's room (${people.join(', ') || 'none: the scenario needs "placements": true and a placements file with people'}), but is ${JSON.stringify(spec.npc)}`);
    }
    if (spec.is !== 1 && spec.is !== 2 && spec.is !== 3) out.push(`is: must be 1, 2 or 3 (there are exactly three moods), but is ${JSON.stringify(spec.is)}`);
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
      const e = rec.history[t]?.entities.find((x) => x.id === spec.npc);
      if (!e) return `${String(spec.npc)} is not in the world at tick ${t}`;
      // A person gets their mood on the first step, so before it they are at business as usual.
      const mood = e.c.npc?.mood ?? 1;
      if (mood !== spec.is) {
        const changes = rec.events.filter((ev) => ev.type === 'mood-changed' && ev.entity === spec.npc).map((ev) => (ev.type === 'mood-changed' ? `${ev.from}->${ev.to} at tick ${ev.tick} (${ev.cause})` : ''));
        return `at tick ${t} ${String(spec.npc)} is in mood ${mood}, expected ${String(spec.is)}; mood changes in this run: ${changes.join(', ') || 'none'}`;
      }
    }
    return null;
  },
};
export default fact;
