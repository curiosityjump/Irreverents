import { canAct, inputOf, release } from '../body-state.ts';
import type { System } from '../types.ts';

/**
 * Keeps every hold honest, each tick, after the verbs: a carried body whose
 * carrier is gone, flattened, knocked flying, picked up, switched to
 * another character or in another room is dropped; a held body that
 * presses jump breaks free; a held player is let go after a moment.
 */
const system: System = {
  id: 'carry-hold',
  order: 200,
  tuning: {
    holdPlayerTime: { min: 0.1, max: 60, what: 'seconds a player can be carried before being let go by itself' },
    breakFreeOn: { min: 0, max: 1, what: 'switch: 1 = a carried body that presses jump breaks free at once' },
    breakFreeHop: { min: 0, max: 900, what: 'upward speed of the hop out of a hold, pixels per second' },
  },
  run(ctx) {
    const world = ctx.content.tuning.world;
    for (const target of ctx.world.entities) {
      const held = target.c.held;
      if (!held) continue;
      const carrier = ctx.world.entities.find((e) => e.id === held.by);
      const carrying = carrier?.c.carrying;
      if (!carrier || !carrying || carrying.id !== target.id || carrier.room !== target.room || carrier.kind !== carrying.kind || !canAct(carrier)) {
        release(ctx, target, 'dropped');
        continue;
      }
      // INTENT: there is always a way out. A held body is never stuck in
      // someone's hands: pressing jump breaks free at once, and a held
      // player is let go by itself after world.holdPlayerTime even if they
      // press nothing. Do not remove either to make carrying a friend
      // "reliable" (docs/deliberate-designs.md).
      const down = inputOf(ctx, target).held.includes('jump');
      const fresh = down && !held.jumpDown;
      held.jumpDown = down;
      if (fresh && world.breakFreeOn! >= 1) {
        release(ctx, target, 'broke-free');
        target.vy = -world.breakFreeHop!;
        continue;
      }
      if (held.ticks > 0 && --held.ticks === 0) release(ctx, target, 'let-go');
    }
    // A carrier whose body vanished (left the game) carries nothing.
    for (const e of ctx.world.entities) {
      const c = e.c.carrying;
      if (c && ctx.world.entities.find((o) => o.id === c.id)?.c.held?.by !== e.id) delete e.c.carrying;
    }
  },
};
export default system;
