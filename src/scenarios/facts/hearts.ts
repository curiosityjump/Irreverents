import { known } from '../../content/reader.ts';
import { heartsLeft } from '../../sim/hearts.ts';
import { checkOnly, isRange, isTick } from '../fact-helpers.ts';
import type { Fact } from '../types.ts';

/**
 * Step 21, hearts (docs/mechanisms/defeat.md, "Hearts"): at a tick, or on
 * every tick of a span (both ends included), a hero kind has exactly this
 * many of the party's hearts left:
 *   { "fact": "hearts", "hero": "grappler", "at": 120, "left": 2 }
 */
const fact: Fact = {
  id: 'hearts',
  validate(spec, scenario, content) {
    const out: string[] = [];
    checkOnly(spec, ['hero', 'at', 'between', 'left'], out);
    const b = spec.between;
    if ((spec.at === undefined) === (b === undefined)) out.push('at / between: give one or the other');
    else if (spec.at !== undefined && !isTick(spec.at, scenario)) out.push(`at: must be a tick from 0 to ${scenario.ticks}`);
    else if (b !== undefined && (!isRange(b) || !isTick(b[0], scenario) || !isTick(b[1], scenario))) out.push(`between: must be [first tick, last tick] within 0 to ${scenario.ticks}`);
    if (typeof spec.hero !== 'string' || !(spec.hero in content.characters)) out.push(`hero: a character kind (${known(content.characters)})`);
    if (typeof spec.left !== 'number' || !Number.isInteger(spec.left) || spec.left < 0) out.push('left: a whole number of hearts, 0 or more');
    return out;
  },
  test(spec, rec) {
    const [from, to] = spec.at !== undefined ? [spec.at as number, spec.at as number] : (spec.between as [number, number]);
    for (let t = from; t <= to; t++) {
      const have = heartsLeft(rec.history[t]!, rec.content, spec.hero as string);
      if (have !== spec.left) {
        const changes: string[] = [];
        let last = -1;
        rec.history.forEach((w, i) => {
          const n = heartsLeft(w, rec.content, spec.hero as string);
          if (n !== last) changes.push(`${i}: ${n}`);
          last = n;
        });
        return `at tick ${t} ${spec.hero} has ${have} hearts left, expected ${spec.left} (by tick: ${changes.join('; ')})`;
      }
    }
    return null;
  },
};
export default fact;
