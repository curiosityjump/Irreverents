import { ticksOf } from '../body-state.ts';
import { bringBack, goneRecords } from '../beaten.ts';
import type { System } from '../types.ts';

/**
 * Step 5 (DRAFT, docs/decisions-log.md "Beaten for good"): a placed bad guy
 * who was defeated is back at his place, fresh, once no player's character
 * has been in his room for world.beatenReturnTime in a row, as the shop's
 * goods come back (heist-restock): so a place can be cleared and stays
 * cleared while you are there, and is not empty for ever. INTENT: never while
 * a player is in the room, so nobody sees him appear.
 * Before npc-setup (10), which makes the new body a person the same tick.
 */
const system: System = {
  id: 'beaten-return',
  order: 9,
  run(ctx) {
    const { world, content } = ctx;
    const wait = ticksOf(content.tuning.world.beatenReturnTime);
    for (const rec of goneRecords(world)) {
      const g = rec.c.beatenGone!;
      const someone = world.entities.some((e) => e.player !== null && e.room === g.room);
      g.empty = someone ? 0 : g.empty + 1;
      if (g.empty < wait) continue;
      if (bringBack(world, content, rec)) ctx.emit('defeated-back', { target: g.id, room: g.room });
    }
  },
};
export default system;
