import { checkOnly, isRange, isTick } from '../fact-helpers.ts';
import type { Fact } from '../types.ts';
import { recruitId } from '../../sim/recruits.ts';

/**
 * Step 13 (docs/mechanisms/recruits.md): at a tick, or on every tick of a
 * span (both ends included), about the captive of content/recruits/<id>.json
 * and the world's roster:
 *   { "fact": "recruit", "id": "camp-captive", "between": [0, 600], "present": true, "open": false }
 * `present` whether the captive's entity is in the world; `open` whether its
 * cage stands open (needs it present); `holding` the ticks Use has been held
 * at it, [min, max] (0 when nobody holds); `unlocked` whether its hero is in
 * the world's roster (an absent roster is everyone).
 */
const fact: Fact = {
  id: 'recruit',
  validate(spec, scenario, content) {
    const out: string[] = [];
    checkOnly(spec, ['id', 'at', 'between', 'present', 'open', 'holding', 'unlocked'], out);
    if (typeof spec.id !== 'string' || !content.recruits?.[spec.id]) out.push(`id: no recruit ${JSON.stringify(spec.id)} (content/recruits/: ${Object.keys(content.recruits ?? {}).join(', ')})`);
    const b = spec.between;
    if ((spec.at === undefined) === (b === undefined)) out.push('at / between: give one or the other');
    else if (spec.at !== undefined && !isTick(spec.at, scenario)) out.push(`at: must be a tick from 0 to ${scenario.ticks}`);
    else if (b !== undefined && (!isRange(b) || !isTick(b[0], scenario) || !isTick(b[1], scenario))) out.push(`between: must be [first tick, last tick] within 0 to ${scenario.ticks}`);
    for (const k of ['present', 'open', 'unlocked']) if (spec[k] !== undefined && typeof spec[k] !== 'boolean') out.push(`${k}: must be true or false`);
    if (spec.holding !== undefined && !isRange(spec.holding)) out.push('holding: must be [min, max] ticks');
    if (spec.present === undefined && spec.open === undefined && spec.holding === undefined && spec.unlocked === undefined) out.push('give at least one of present, open, holding, unlocked');
    return out;
  },
  test(spec, rec) {
    const r = rec.content.recruits[spec.id as string]!;
    const [from, to] = spec.at !== undefined ? [spec.at as number, spec.at as number] : (spec.between as [number, number]);
    for (let t = from; t <= to; t++) {
      const w = rec.history[t]!;
      const e = w.entities.find((x) => x.id === recruitId(r.id));
      if (spec.present !== undefined && !!e !== spec.present) return `at tick ${t} the captive is ${e ? 'in' : 'not in'} the world`;
      if (spec.open !== undefined && (!e?.c.recruit || e.c.recruit.open !== spec.open)) return `at tick ${t} the cage is ${e?.c.recruit ? (e.c.recruit.open ? 'open' : 'shut') : 'not there'}`;
      if (spec.holding !== undefined) {
        const [lo, hi] = spec.holding as [number, number];
        const n = e?.c.recruit?.hold?.ticks ?? 0;
        if (n < lo || n > hi) return `at tick ${t} Use has been held at the cage for ${n} ticks, expected ${lo} to ${hi}`;
      }
      if (spec.unlocked !== undefined) {
        const have = !Array.isArray(w.roster) || w.roster.includes(r.character);
        if (have !== spec.unlocked) return `at tick ${t} the roster ${JSON.stringify(w.roster ?? 'absent (everyone)')} ${have ? 'has' : 'lacks'} ${r.character}`;
      }
    }
    return null;
  },
};
export default fact;
