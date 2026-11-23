import { checkAt, checkOnly, bodyAt, bodyName, checkBody, feet, isRange, round2 } from '../fact-helpers.ts';
import type { Fact } from '../types.ts';

/**
 * { "fact": "position", "player": "a", "at": 60, "x": [100, 110], "y": [159, 161] }
 * At that tick the middle of the player's feet is inside the given pixel
 * ranges (either may be left out). x grows rightwards, y grows downwards.
 */
const fact: Fact = {
  id: 'position',
  validate(spec, scenario, content) {
    const out: string[] = [];
    checkOnly(spec, ['player', 'entity', 'at', 'x', 'y'], out);
    checkBody(spec, scenario, out, content);
    checkAt(spec, scenario, out);
    if (spec.x === undefined && spec.y === undefined) out.push('x / y: give at least one range');
    for (const axis of ['x', 'y']) {
      if (spec[axis] !== undefined && !isRange(spec[axis])) out.push(`${axis}: must be [min, max], but is ${JSON.stringify(spec[axis])}`);
    }
    return out;
  },
  test(spec, rec) {
    const e = bodyAt(rec, spec, spec.at as number);
    if (!e) return `${bodyName(spec)} is not in the world at tick ${spec.at}`;
    const f = feet(rec, e);
    for (const axis of ['x', 'y'] as const) {
      const range = spec[axis] as [number, number] | undefined;
      if (range && (f[axis] < range[0] || f[axis] > range[1])) {
        return `at tick ${spec.at} ${bodyName(spec)}'s feet are at ${axis} = ${round2(f[axis])}, expected between ${range[0]} and ${range[1]}`;
      }
    }
    return null;
  },
};
export default fact;
