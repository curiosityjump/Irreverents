import { cantinasOf } from '../cantina.ts';
import { npcKind } from '../npc/state.ts';
import type { System } from '../types.ts';

/**
 * The cantina's chase lock (Step 11 slice B, D-088: chased by the good
 * guys, every cantina entrance refuses; the chase over, it opens;
 * docs/mechanisms/cantina.md). Each tick, `world.chased` is the player
 * entity ids some good-side person is chasing right now: answering a call
 * (`c.respond`) in the `chase` phase with that player in sight
 * (systems/alert-respond.ts; alert-follow.ts keeps `sight` through a door).
 * A door with `"refuse": "chased"` reads it (systems/room-doors.ts).
 *
 * DRAFT (the lead's call): an active chase, not a raised alert; a bad-side
 * chaser (Step 12's outpost fighters use `c.outpostFight`, never
 * `c.respond`) never locks it.
 * INTENT: does nothing in a world without a `~cantina:<room>` entity: a
 * page's own world has no guards, and writing an empty list there would
 * overwrite the server's every tick before the page's own doors read it.
 * Runs before the doors (600), after the responders (56).
 */
const system: System = {
  id: 'cantina-chase',
  order: 590,
  run(ctx) {
    const { world, content } = ctx;
    if (cantinasOf(world, content).length === 0) return;
    const chased = new Set<string>();
    for (const e of world.entities) {
      const r = e.c.respond;
      if (r?.phase !== 'chase' || !r.sight || npcKind(content, e)?.side !== 'good') continue;
      const target = world.entities.find((x) => x.id === r.sight);
      if (target?.player != null) chased.add(target.id);
    }
    const list = [...chased].sort();
    if (world.chased?.join() !== list.join() || !world.chased) world.chased = list;
  },
};
export default system;
