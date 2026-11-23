import { ticksOf } from '../body-state.ts';
import type { System } from '../types.ts';
import { thingDef } from '../npc/state.ts';

declare module '../types.ts' {
  interface Components {
    /** Step 19: on a taken thing with a `restock`, the tick it was first seen taken (the clock to its return). */
    restockFrom?: { tick: number };
  }
  interface EventMap {
    /** Step 19: a taken thing is back on its shelf after its `restock` time. */
    restocked: { thing: string; room: string };
  }
}

/**
 * Step 19 push 5 (docs/mechanisms/heists.md, "The lure comes back"): a
 * taken thing with a `restock` (content/placements/, seconds) is back,
 * untaken, that long after it was taken: the shop's ordinary goods, so a
 * take in the keeper's glance away is there to try in every session.
 * The clock starts the tick this system first sees it taken, so a good taken
 * in an older kept game comes back that long after the game is next played.
 * INTENT: never a bell, the special good or a prize (the content check
 * refuses `restock` on them). DRAFT: the times (decisions-log "Step 19").
 * After the take (npc-interact, 60) and the heist rules (607).
 */
const system: System = {
  id: 'heist-restock',
  order: 615,
  run(ctx) {
    const { world, content } = ctx;
    for (const e of world.entities) {
      const t = e.c.thing;
      if (!t) continue;
      if (t.takenBy === null) {
        if (e.c.restockFrom) delete e.c.restockFrom;
        continue;
      }
      const def = thingDef(content, e);
      if (def?.restock === undefined) continue;
      const from = (e.c.restockFrom ??= { tick: world.tick });
      if (world.tick - from.tick < ticksOf(def.restock)) continue;
      t.takenBy = null;
      delete e.c.restockFrom;
      ctx.emit('restocked', { thing: e.id, room: e.room });
    }
  },
};
export default system;
