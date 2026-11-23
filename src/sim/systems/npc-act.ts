import type { System } from '../types.ts';
import { behaviours } from '../npc/behaviours.ts';
import { drive, isOut, npcKind } from '../npc/state.ts';

/**
 * What each person wants to do this tick, by their mood: the behaviour
 * their NPC kind names for it (content/npcs/), handed to their body as
 * input. Runs before the `verbs` system (100), which acts on it.
 */
const system: System = {
  id: 'npc-act',
  order: 50,
  tuning: {
    npcChargeReach: { min: 0, max: 200, what: 'how close, in pixels, a raging person gets to where they last saw the offender before stopping' },
  },
  run(ctx) {
    for (const e of ctx.world.entities) {
      const n = e.c.npc;
      const kind = npcKind(ctx.content, e);
      if (!n || !kind) continue;
      drive(e, isOut(e) ? { x: 0, y: 0, held: [] } : behaviours[kind.moods[n.mood]](ctx, e));
    }
  },
};
export default system;
