import { checkAt, checkOnly, bodyAt, bodyName, checkBody, isRange, round2 } from '../fact-helpers.ts';
import type { Fact } from '../types.ts';

/**
 * { "fact": "velocity", "player": "a", "at": 60, "vx": [0, 0], "vy": [-400, -1] }
 * At that tick the player's speed, in pixels per second, is inside the given
 * ranges (either may be left out). Negative vy is upwards.
 */
const fact: Fact = {
  id: 'velocity',
  validate(spec, scenario, content) {
    const out: string[] = [];
    checkOnly(spec, ['player', 'entity', 'at', 'vx', 'vy'], out);
    checkBody(spec, scenario, out, content);
    checkAt(spec, scenario, out);
    if (spec.vx === undefined && spec.vy === undefined) out.push('vx / vy: give at least one range');
    for (const axis of ['vx', 'vy']) {
      if (spec[axis] !== undefined && !isRange(spec[axis])) out.push(`${axis}: must be [min, max], but is ${JSON.stringify(spec[axis])}`);
    }
    return out;
  },
  test(spec, rec) {
    const e = bodyAt(rec, spec, spec.at as number);
    if (!e) return `${bodyName(spec)} is not in the world at tick ${spec.at}`;
    for (const axis of ['vx', 'vy'] as const) {
      const range = spec[axis] as [number, number] | undefined;
      if (range && (e[axis] < range[0] || e[axis] > range[1])) {
        return `at tick ${spec.at} ${bodyName(spec)}'s ${axis} is ${round2(e[axis])}, expected between ${range[0]} and ${range[1]}`;
      }
    }
    return null;
  },
};
export default fact;
