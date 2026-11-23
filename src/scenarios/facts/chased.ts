import { checkOnly, isRange, isTick } from '../fact-helpers.ts';
import type { Fact } from '../types.ts';

/**
 * Step 11 (D-088; docs/mechanisms/cantina.md): at a tick, or on every tick of
 * a span (both ends included), the world's `chased` list (the players a
 * good-side guard is chasing, which a `"refuse": "chased"` door reads) is
 * exactly these player ids:
 *   { "fact": "chased", "between": [2800, 2875], "players": ["a"] }
 * An absent list reads as empty. The world needs a cantina in it (the
 * scenario's room, or `placedRooms`), which is what writes the list.
 */
const fact: Fact = {
  id: 'chased',
  validate(spec, scenario) {
    const out: string[] = [];
    checkOnly(spec, ['at', 'between', 'players'], out);
    const b = spec.between;
    if ((spec.at === undefined) === (b === undefined)) out.push('at / between: give one or the other');
    else if (spec.at !== undefined && !isTick(spec.at, scenario)) out.push(`at: must be a tick from 0 to ${scenario.ticks}`);
    else if (b !== undefined && (!isRange(b) || !isTick(b[0], scenario) || !isTick(b[1], scenario))) out.push(`between: must be [first tick, last tick] within 0 to ${scenario.ticks}`);
    if (!Array.isArray(spec.players) || !spec.players.every((p) => scenario.players.some((q) => q.id === p))) out.push("players: a list of this scenario's player ids (it may be empty)");
    return out;
  },
  test(spec, rec) {
    const [from, to] = spec.at !== undefined ? [spec.at as number, spec.at as number] : (spec.between as [number, number]);
    const want = (spec.players as string[]).map((p) => `p:${p}`).sort().join();
    for (let t = from; t <= to; t++) {
      const have = [...(rec.history[t]!.chased ?? [])].sort().join();
      if (have !== want) return `at tick ${t} the chased list is [${have}], expected [${want}]`;
    }
    return null;
  },
};
export default fact;
