import { checkOnly, checkPlayer, isRange, isTick } from '../fact-helpers.ts';
import type { Fact } from '../types.ts';

/**
 * { "fact": "event", "event": "landed", "player": "a", "between": [40, 60] }
 * The event happened for that player on a tick from 40 to 60, both included.
 * Optional "count": [min, max] says how many times; the default is at least
 * once, and [0, 0] means "it must not happen". "player" may be left out to
 * count the event for anyone.
 */
const fact: Fact = {
  id: 'event',
  validate(spec, scenario) {
    const out: string[] = [];
    checkOnly(spec, ['event', 'player', 'between', 'count'], out);
    if (typeof spec.event !== 'string' || spec.event === '') out.push(`event: must name an event type, but is ${JSON.stringify(spec.event)}`);
    if (spec.player !== undefined) checkPlayer(spec, scenario, out);
    const b = spec.between;
    if (!isRange(b) || !isTick(b[0], scenario) || !isTick(b[1], scenario)) {
      out.push(`between: must be [first tick, last tick] within 0 to ${scenario.ticks}, but is ${JSON.stringify(b)}`);
    }
    if (spec.count !== undefined && !isRange(spec.count)) out.push(`count: must be [min, max], but is ${JSON.stringify(spec.count)}`);
    return out;
  },
  test(spec, rec) {
    const [from, to] = spec.between as [number, number];
    const [min, max] = (spec.count as [number, number] | undefined) ?? [1, Infinity];
    const who = spec.player as string | undefined;
    const all = rec.events.filter((e) => e.type === spec.event && (who === undefined || (e as { player?: unknown }).player === who));
    const n = all.filter((e) => e.tick >= from && e.tick <= to).length;
    if (n >= min && n <= max) return null;
    const when = all.length ? `it happened at tick(s) ${all.map((e) => e.tick).join(', ')}` : 'it never happened in this run';
    const want = max === Infinity ? `at least ${min}` : min === max ? `exactly ${min}` : `${min} to ${max}`;
    return `event "${spec.event}"${who ? ` for player ${who}` : ''} happened ${n} time(s) between ticks ${from} and ${to}, expected ${want}; ${when}`;
  },
};
export default fact;
