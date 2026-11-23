import { bodyAt, bodyName, checkAt, checkBody, checkOnly, isRange, round2 } from '../fact-helpers.ts';
import type { Fact } from '../types.ts';

/**
 * { "fact": "body-state", "player": "b", "at": 40, "is": ["flying"], "not": ["held"], "worn": [0, 0] }
 * At that tick the body has every state named in "is" and none named in
 * "not" (the names are the fields of entity.c: flying, held, carrying,
 * beat, flattened...), and, if "worn" is given, the wear it has taken so
 * far (against its hidden toughness) is inside that range. Give at least
 * one of the three.
 */
const fact: Fact = {
  id: 'body-state',
  validate(spec, scenario, content) {
    const out: string[] = [];
    checkOnly(spec, ['player', 'entity', 'at', 'is', 'not', 'worn'], out);
    checkBody(spec, scenario, out, content);
    checkAt(spec, scenario, out);
    if (spec.is === undefined && spec.not === undefined && spec.worn === undefined) out.push('is / not / worn: give at least one');
    for (const key of ['is', 'not']) {
      const v = spec[key];
      if (v !== undefined && (!Array.isArray(v) || v.length === 0 || !v.every((s) => typeof s === 'string' && s !== ''))) {
        out.push(`${key}: must be a list of state names, but is ${JSON.stringify(v)}`);
      }
    }
    if (spec.worn !== undefined && !isRange(spec.worn)) out.push(`worn: must be [min, max], but is ${JSON.stringify(spec.worn)}`);
    return out;
  },
  test(spec, rec) {
    const e = bodyAt(rec, spec, spec.at as number);
    if (!e) return `${bodyName(spec)} is not in the world at tick ${spec.at}`;
    const c = e.c as Record<string, unknown>;
    const has = Object.keys(c).filter((k) => c[k] !== undefined).sort().join(', ') || 'nothing';
    for (const name of (spec.is as string[] | undefined) ?? []) {
      if (c[name] === undefined) return `at tick ${spec.at} ${bodyName(spec)} is not "${name}" (its states: ${has})`;
    }
    for (const name of (spec.not as string[] | undefined) ?? []) {
      if (c[name] !== undefined) return `at tick ${spec.at} ${bodyName(spec)} is "${name}", expected not (its states: ${has})`;
    }
    const range = spec.worn as [number, number] | undefined;
    const worn = e.c.worn?.amount ?? 0;
    if (range && (worn < range[0] || worn > range[1])) return `at tick ${spec.at} ${bodyName(spec)} has taken ${round2(worn)} wear, expected between ${range[0]} and ${range[1]}`;
    return null;
  },
};
export default fact;
