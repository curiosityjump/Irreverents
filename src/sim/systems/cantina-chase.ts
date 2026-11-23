import { ticksOf } from '../body-state.ts';
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
 * DRAFT (the lead's call): an active chase (and chaseHold seconds after the
 * guard last had them in sight), not a raised alert; a bad-side
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
    const cantinas = cantinasOf(world, content);
    const first = cantinas[0];
    if (!first) return;
    // DRAFT (the lead, doc 31: the cantina is "NOT a shortcut for breaking line of sight"): a player stays
    // listed for chaseHold seconds after a chasing guard last had them in sight, so a blink of lost sight
    // (a guard turning as the hero moves off) is no way in. Kept on the first cantina's state.
    const hold = ticksOf(first.file.chaseHold ?? 1);
    const seen: Record<string, number> = { ...(first.state.seen ?? {}) };
    for (const e of world.entities) {
      const r = e.c.respond;
      if (r?.phase !== 'chase' || !r.sight || npcKind(content, e)?.side !== 'good') continue;
      const target = world.entities.find((x) => x.id === r.sight);
      if (target?.player != null) seen[target.id] = world.tick;
    }
    const chased: string[] = [];
    for (const [id, at] of Object.entries(seen)) {
      if (world.tick - at <= hold && world.entities.some((x) => x.id === id)) chased.push(id);
      else delete seen[id];
    }
    if (Object.keys(seen).length) first.state.seen = seen;
    else delete first.state.seen;
    const list = chased.sort();
    if (world.chased?.join() !== list.join() || !world.chased) world.chased = list;
  },
};
export default system;
