import { takesNoPhysics } from '../body-state.ts';
import { DT } from '../types.ts';
import type { System } from '../types.ts';

/**
 * Just before physics: slows bodies that were launched, and remembers each
 * flying body's speed so impact-walls (just after physics) can see what a
 * wall, floor or ceiling took away. Physics itself stops a body silently.
 */
const system: System = {
  id: 'impact-before',
  order: 450,
  tuning: {
    groundFriction: { min: 0, max: 100000, what: 'how fast a knocked or thrown body sliding on the ground slows, pixels per second per second' },
    airDrag: { min: 0, max: 100000, what: 'how fast a knocked or thrown body slows sideways in the air, pixels per second per second' },
  },
  run(ctx) {
    const { groundFriction, airDrag } = ctx.content.tuning.world;
    for (const e of ctx.world.entities) {
      if (takesNoPhysics(e)) continue;
      const kind = ctx.content.characters[e.kind];
      if (!kind) continue;
      // The move verb slows a body that is running itself; a body that was
      // launched (or lies flattened) is slowed here. INTENT: a body that is
      // neither is left alone, as before Step 2: other steps' scenarios
      // give a body a starting speed and rely on it keeping it.
      if (e.c.flying || e.c.flattened) {
        const slow = (e.onGround ? groundFriction! : airDrag!) * DT;
        e.vx = e.vx > 0 ? Math.max(0, e.vx - slow) : Math.min(0, e.vx + slow);
      }
      const f = e.c.flying;
      if (f) {
        f.pvx = e.vx;
        f.pvy = e.vy;
        f.pGround = e.onGround;
        f.at = ctx.world.tick;
      }
    }
  },
};
export default system;
