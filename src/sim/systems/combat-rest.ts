import { heldBy } from '../effects.ts';
import type { System } from '../types.ts';

/** A flight ends when the body is on the ground and has all but stopped; it can act again from the next tick. */
const system: System = {
  id: 'combat-rest',
  order: 530,
  tuning: {
    restSpeed: { min: 0, max: 900, what: 'a flying body on the ground slower than this (pixels per second) has come to rest' },
    footingSpeed: { min: 0, max: 900, what: 'a flying body that can run (a player, a person) gets its feet back once it is on the ground and slower than this, pixels per second' },
  },
  run(ctx) {
    const { restSpeed, footingSpeed } = ctx.content.tuning.world;
    for (const e of ctx.world.entities) {
      if (!e.c.flying || e.c.beat || heldBy(e) !== null) continue;
      // DRAFT: a body with the move verb finds its feet sooner than a crate
      // stops sliding, so a thrown friend is not a passenger for the whole slide.
      const runs = ctx.content.characters[e.kind]?.verbs.includes('move');
      if (e.onGround && Math.abs(e.vx) < (runs ? Math.max(restSpeed!, footingSpeed!) : restSpeed!)) {
        delete e.c.flying;
        // Nothing slows a body that is not flying and cannot run, so it stops here.
        if (!runs) e.vx = 0;
      }
    }
  },
};
export default system;
