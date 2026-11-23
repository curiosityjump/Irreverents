import type { UseEntry } from '../use.ts';
import { centre, isOut } from '../npc/state.ts';
import { recruitsOf } from '../recruits.ts';

/** DRAFT: how near (pixels) a body's middle must be to the cage's middle, across and up/down, to free or swap. */
const ACROSS = 22;
const UPDOWN = 20;

/**
 * Step 13 (docs/mechanisms/recruits.md): Use at a shut cage frees the
 * captive (held for the recruit file's `hold`; systems/recruit-free.ts
 * acts). For a few seconds after, Use at the open cage by whoever freed
 * them swaps them in on the spot (word `swap`). Order 150: after the door
 * and after a placed thing, so within a thing's reach Use still does the
 * thing's deed (the camp's strongbox stands beside the cage, Step 19), and
 * before the cantina's bell.
 * Empty in a page's own world (no captive there), so the page's button
 * asks the composed world, as for things.
 */
const entry: UseEntry = {
  id: 'free',
  order: 150,
  find(world, content, e) {
    if (isOut(e) || e.player === null) return undefined;
    const me = centre(content, e);
    for (const { r, e: cage, state } of recruitsOf(world, content)) {
      if (cage.room !== e.room) continue;
      const T = content.rooms[cage.room]!.tile;
      const mid = { x: cage.x + (r.w * T) / 2, y: cage.y - T };
      if (Math.abs(me.x - mid.x) > ACROSS + (r.w * T) / 2 - T || Math.abs(me.y - mid.y) > UPDOWN) continue;
      const at = { x: mid.x, y: cage.y - 2 * T };
      if (!state.open) return { entry: 'free', word: 'free', target: cage.id, at };
      if (state.offer && state.offer.to === e.id && world.tick < state.offer.until) return { entry: 'free', word: 'swap', target: cage.id, at };
    }
    return undefined;
  },
};
export default entry;
