import { bodyAt, bodyName, checkAt, checkBody, checkOnly } from '../fact-helpers.ts';
import type { Fact } from '../types.ts';

/**
 * { "fact": "power", "player": "a", "at": 120, "is": "boost" }
 * At that tick the body holds that power (content/powers/), or none when
 * "is" is null (Step 9, docs/mechanisms/powers.md).
 */
const fact: Fact = {
  id: 'power',
  validate(spec, scenario, content) {
    const out: string[] = [];
    checkOnly(spec, ['player', 'entity', 'at', 'is'], out);
    checkBody(spec, scenario, out, content);
    checkAt(spec, scenario, out);
    if (spec.is !== null && (typeof spec.is !== 'string' || !(spec.is in (content.powers ?? {})))) {
      out.push(`is: must be a power id (${Object.keys(content.powers ?? {}).join(', ')}) or null for none, but is ${JSON.stringify(spec.is)}`);
    }
    return out;
  },
  test(spec, rec) {
    const e = bodyAt(rec, spec, spec.at as number);
    if (!e) return `${bodyName(spec)} is not in the world at tick ${spec.at}`;
    const has = e.c.power?.id ?? null;
    if (has === spec.is) return null;
    const changes: string[] = [];
    let last: string | null | undefined;
    rec.history.forEach((w, t) => {
      const b = spec.entity !== undefined ? w.entities.find((x) => x.id === spec.entity) : w.entities.find((x) => x.player === spec.player);
      const now = b ? (b.c.power?.id ?? null) : undefined;
      if (now !== last) changes.push(`${t}: ${now === undefined ? 'not in the world' : (now ?? 'none')}`);
      last = now;
    });
    return `at tick ${spec.at} ${bodyName(spec)} holds ${has ?? 'no power'}, expected ${spec.is ?? 'none'} (by tick: ${changes.join('; ')})`;
  },
};
export default fact;
