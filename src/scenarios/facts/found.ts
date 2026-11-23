import { known } from '../../content/reader.ts';
import { checkOnly, isRange, isTick } from '../fact-helpers.ts';
import type { Fact } from '../types.ts';

/**
 * Step 14 slice B (docs/mechanisms/levels.md, "Pieces"): at a tick, or on
 * every tick of a span (both ends included), the pieces the world has found
 * of a level's set are exactly these (any order):
 *   { "fact": "found", "level": "castle-town", "at": 120, "pieces": ["town-1"] }
 */
const fact: Fact = {
  id: 'found',
  validate(spec, scenario, content) {
    const out: string[] = [];
    checkOnly(spec, ['level', 'at', 'between', 'pieces'], out);
    const b = spec.between;
    if ((spec.at === undefined) === (b === undefined)) out.push('at / between: give one or the other');
    else if (spec.at !== undefined && !isTick(spec.at, scenario)) out.push(`at: must be a tick from 0 to ${scenario.ticks}`);
    else if (b !== undefined && (!isRange(b) || !isTick(b[0], scenario) || !isTick(b[1], scenario))) out.push(`between: must be [first tick, last tick] within 0 to ${scenario.ticks}`);
    const set = typeof spec.level === 'string' ? content.completion?.[spec.level] : undefined;
    if (!set) out.push(`level: no set ${JSON.stringify(spec.level)} (content/completion/: ${known(content.completion ?? {})})`);
    if (!Array.isArray(spec.pieces) || !spec.pieces.every((p) => typeof p === 'string' && (!set || set.pieces.some((q) => q.id === p)))) out.push("pieces: a list of this level's piece ids (it may be empty)");
    return out;
  },
  test(spec, rec) {
    const [from, to] = spec.at !== undefined ? [spec.at as number, spec.at as number] : (spec.between as [number, number]);
    const want = [...(spec.pieces as string[])].sort().join(', ');
    for (let t = from; t <= to; t++) {
      const have = [...(rec.history[t]!.found?.[spec.level as string] ?? [])].sort().join(', ');
      if (have !== want) return `at tick ${t} the world has found [${have}] of ${spec.level}, expected [${want}]`;
    }
    return null;
  },
};
export default fact;
