import { heldBy } from '../effects.ts';
import type { System } from '../types.ts';

/**
 * After physics has moved the carriers: every carried body rides above its
 * carrier's head. (Physics does not move a carried body; body-state.ts,
 * takesNoPhysics.) DRAFT: overhead, centred; art may want hands.
 */
const system: System = {
  id: 'carry-ride',
  order: 600,
  run(ctx) {
    for (const target of ctx.world.entities) {
      const by = heldBy(target);
      if (by === null) continue;
      const carrier = ctx.world.entities.find((e) => e.id === by);
      const cb = carrier && ctx.content.characters[carrier.kind]?.box;
      const tb = ctx.content.characters[target.kind]?.box;
      if (!carrier || !cb || !tb) continue;
      target.x = carrier.x + (cb.w - tb.w) / 2;
      target.y = carrier.y - tb.h;
      target.vx = 0;
      target.vy = 0;
      target.facing = carrier.facing;
      target.onGround = false;
    }
  },
};
export default system;
