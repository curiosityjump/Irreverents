import { describe, isRecord } from '../../content/reader.ts';
import { checkOnly, isRange, isTick } from '../fact-helpers.ts';
import type { Fact } from '../types.ts';

/**
 * { "fact": "event-where", "event": "deed", "where": { "deed": "take", "by": "p:a", "witnesses": [] }, "between": [100, 140] }
 * An event of that type whose fields equal everything in "where" happened
 * on a tick from 100 to 140, both included. Values are compared whole, so
 * "witnesses": [] means "nobody saw it". Optional "count": [min, max]; the
 * default is at least once, and [0, 0] means "it must not happen". For
 * events that name entity ids rather than one `player` or `entity`.
 */
const fact: Fact = {
  id: 'event-where',
  validate(spec, scenario) {
    const out: string[] = [];
    checkOnly(spec, ['event', 'where', 'between', 'count'], out);
    if (typeof spec.event !== 'string' || spec.event === '') out.push(`event: must name an event type, but is ${JSON.stringify(spec.event)}`);
    if (spec.where !== undefined && !isRecord(spec.where)) out.push(`where: must be an object of field: value, but is ${describe(spec.where)}`);
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
    const where = (spec.where as Record<string, unknown> | undefined) ?? {};
    const ofType = rec.events.filter((e) => e.type === spec.event);
    const matching = ofType.filter((e) => Object.entries(where).every(([k, v]) => k === '//' || JSON.stringify((e as unknown as Record<string, unknown>)[k]) === JSON.stringify(v)));
    const n = matching.filter((e) => e.tick >= from && e.tick <= to).length;
    if (n >= min && n <= max) return null;
    const want = max === Infinity ? `at least ${min}` : min === max ? `exactly ${min}` : `${min} to ${max}`;
    const seen = ofType.length ? `"${String(spec.event)}" events in this run: ${ofType.slice(0, 12).map((e) => JSON.stringify(e)).join(' ')}${ofType.length > 12 ? ' ...' : ''}` : `no "${String(spec.event)}" event happened in this run`;
    return `event "${String(spec.event)}" where ${JSON.stringify(where)} happened ${n} time(s) between ticks ${from} and ${to}, expected ${want}; ${seen}`;
  },
};
export default fact;
