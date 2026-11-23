import { DT } from '../types.ts';
import type { Verb } from '../types.ts';

function approach(value: number, target: number, maxChange: number): number {
  if (value < target) return Math.min(value + maxChange, target);
  if (value > target) return Math.max(value - maxChange, target);
  return value;
}

/** Running left and right. DRAFT: the feel is the owner's to judge; every number is in content/tuning.json. */
const verb: Verb = {
  id: 'move',
  order: 10,
  tuning: {
    // INTENT: the top speed must stay under one 16 px tile per tick (960
    // px/s at 60 ticks); the physics system checks one tile ahead.
    runSpeed: { min: 0, max: 600, what: 'top running speed, pixels per second' },
    runAccel: { min: 0, max: 100000, what: 'how fast running speed builds on the ground, pixels per second per second' },
    runDecel: { min: 0, max: 100000, what: 'how fast the character stops on the ground when the stick is let go' },
    airAccel: { min: 0, max: 100000, what: 'how fast sideways speed builds in the air' },
    airDecel: { min: 0, max: 100000, what: 'how fast sideways speed fades in the air when the stick is let go' },
  },
  update(_ctx, e, input, t) {
    const dir = input.x > 0 ? 1 : input.x < 0 ? -1 : 0;
    const target = Math.max(-1, Math.min(1, input.x)) * t.runSpeed!;
    const rate = dir !== 0 ? (e.onGround ? t.runAccel! : t.airAccel!) : e.onGround ? t.runDecel! : t.airDecel!;
    e.vx = approach(e.vx, target, rate * DT);
    if (dir !== 0) e.facing = dir;
  },
};
export default verb;
