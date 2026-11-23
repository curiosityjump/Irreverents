import { checkAt, checkOnly, checkPlayer, isRange, playerAt, round2 } from '../fact-helpers.ts';
import type { Fact } from '../types.ts';

/**
 * { "fact": "velocity", "player": "a", "at": 60, "vx": [0, 0], "vy": [-400, -1] }
 * At that tick the player's speed, in pixels per second, is inside the given
 * ranges (either may be left out). Negative vy is upwards.
 */
const fact: Fact = {
  id: 'velocity',
  validate(spec, scenario) {
    const out: string[] = [];
    checkOnly(spec, ['player', 'at', 'vx', 'vy'], out);
    checkPlayer(spec, scenario, out);
    checkAt(spec, scenario, out);
    if (spec.vx === undefined && spec.vy === undefined) out.push('vx / vy: give at least one range');
    for (const axis of ['vx', 'vy']) {
      if (spec[axis] !== undefined && !isRange(spec[axis])) out.push(`${axis}: must be [min, max], but is ${JSON.stringify(spec[axis])}`);
    }
    return out;
  },
  test(spec, rec) {
    const e = playerAt(rec, spec.player as string, spec.at as number);
    if (!e) return `player ${spec.player} is not in the world at tick ${spec.at}`;
    for (const axis of ['vx', 'vy'] as const) {
      const range = spec[axis] as [number, number] | undefined;
      if (range && (e[axis] < range[0] || e[axis] > range[1])) {
        return `at tick ${spec.at} player ${spec.player}'s ${axis} is ${round2(e[axis])}, expected between ${range[0]} and ${range[1]}`;
      }
    }
    return null;
  },
};
export default fact;
