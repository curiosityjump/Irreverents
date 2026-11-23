import { known } from '../../content/reader.ts';
import { levelProgress } from '../../sim/levels.ts';
import { checkOnly, isRange, isTick } from '../fact-helpers.ts';
import type { Fact } from '../types.ts';

/**
 * Step 14 slice A (docs/mechanisms/levels.md): at a tick, or on every tick of
 * a span (both ends included), what the world's record says of a level:
 *   { "fact": "level", "level": "iron-quarry", "at": 120,
 *     "discovered": true, "seen": ["quarry-road"], "total": 13, "quarters": 0 }
 * Each of `discovered`, `seen` (exactly these places, any order: `<room>` or
 * `<room>/<area>`), `total` and `quarters` is optional.
 * Or `"none": true` with no `level`: the world has no level record at all.
 */
const fact: Fact = {
  id: 'level',
  validate(spec, scenario, content) {
    const out: string[] = [];
    checkOnly(spec, ['level', 'none', 'at', 'between', 'discovered', 'seen', 'total', 'quarters'], out);
    const b = spec.between;
    if ((spec.at === undefined) === (b === undefined)) out.push('at / between: give one or the other');
    else if (spec.at !== undefined && !isTick(spec.at, scenario)) out.push(`at: must be a tick from 0 to ${scenario.ticks}`);
    else if (b !== undefined && (!isRange(b) || !isTick(b[0], scenario) || !isTick(b[1], scenario))) out.push(`between: must be [first tick, last tick] within 0 to ${scenario.ticks}`);
    if (spec.none !== undefined) {
      if (spec.none !== true || spec.level !== undefined) out.push('none: true, with no level');
    } else if (typeof spec.level !== 'string' || !(spec.level in (content.levels ?? {}))) out.push(`level: no level ${JSON.stringify(spec.level)} (levels: ${known(content.levels ?? {})})`);
    if (spec.discovered !== undefined && typeof spec.discovered !== 'boolean') out.push('discovered: true or false');
    if (spec.seen !== undefined && !(Array.isArray(spec.seen) && spec.seen.every((s) => typeof s === 'string'))) out.push('seen: a list of places');
    for (const k of ['total', 'quarters'] as const) if (spec[k] !== undefined && !Number.isInteger(spec[k])) out.push(`${k}: a whole number`);
    return out;
  },
  test(spec, rec) {
    const [from, to] = spec.at !== undefined ? [spec.at as number, spec.at as number] : (spec.between as [number, number]);
    for (let t = from; t <= to; t++) {
      const w = rec.history[t]!;
      if (spec.none) {
        if (w.levels && Object.keys(w.levels).length) return `at tick ${t} the world has level records: ${JSON.stringify(w.levels)}`;
        continue;
      }
      const id = spec.level as string;
      const p = levelProgress(w, rec.content, id);
      if (spec.discovered !== undefined && p.discovered !== spec.discovered) return `at tick ${t} level "${id}" is ${p.discovered ? '' : 'not '}discovered`;
      if (spec.seen !== undefined) {
        const have = [...(w.levels?.[id]?.seen ?? [])].sort().join(', ');
        const want = [...(spec.seen as string[])].sort().join(', ');
        if (have !== want) return `at tick ${t} level "${id}" has seen [${have}], expected [${want}]`;
      }
      if (spec.total !== undefined && p.total !== spec.total) return `at tick ${t} level "${id}" counts ${p.total} places, expected ${spec.total}`;
      if (spec.quarters !== undefined && p.quarters !== spec.quarters) return `at tick ${t} level "${id}"'s pie is ${p.quarters} quarters, expected ${spec.quarters}`;
    }
    return null;
  },
};
export default fact;
