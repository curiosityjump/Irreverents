import { machineIdOf, machineOf, machineState } from '../machines.ts';
import { DT } from '../types.ts';
import type { Verb } from '../types.ts';

function approach(value: number, target: number, maxChange: number): number {
  if (value < target) return Math.min(value + maxChange, target);
  if (value > target) return Math.max(value - maxChange, target);
  return value;
}

/**
 * Driving a machine (Step 20; docs/mechanisms/machines.md): the stick builds
 * speed slowly on the ground and the machine nearly holds it when the stick
 * is let go; the stick held against the way it rolls brakes. No jump, no
 * switch: Jump is how a rider gets out (src/sim/systems/machine-seat.ts).
 * A player drives at the machine's `speed.rider`, a person of the world (a
 * body with entity.c.input) at `speed.driver`. A wreck does not drive: it
 * brakes to a stop and stays.
 * Runs wherever the body is simulated, so a rider's own page drives with no
 * lag. Every number is the machine file's (content/machines/).
 * DRAFT: the whole feel (decisions-log "Step 20: the machine").
 */
const verb: Verb = {
  id: 'drive',
  order: 10,
  update(ctx, e, input) {
    const m = machineOf(ctx.content, e.kind);
    if (!m) return;
    if (machineState(ctx.world, machineIdOf(ctx.world, e)).wrecked) {
      if (e.onGround) e.vx = approach(e.vx, 0, m.brake * DT);
      return;
    }
    if (!e.onGround) return;
    const top = e.player === null ? m.speed.driver : m.speed.rider;
    const stick = Math.max(-1, Math.min(1, input.x));
    const dir = stick > 0 ? 1 : stick < 0 ? -1 : 0;
    if (dir === 0) e.vx = approach(e.vx, 0, m.coast * DT);
    else if (e.vx !== 0 && Math.sign(e.vx) !== dir) e.vx = approach(e.vx, 0, m.brake * DT);
    else if (Math.abs(e.vx) > top) e.vx = approach(e.vx, dir * top, m.brake * DT);
    else e.vx = approach(e.vx, stick * top, m.accel * DT);
    if (e.vx !== 0) e.facing = e.vx > 0 ? 1 : -1;
    else if (dir !== 0) e.facing = dir;
  },
};
export default verb;
