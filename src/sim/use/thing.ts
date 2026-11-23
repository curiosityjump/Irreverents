import type { Entity } from '../types.ts';
import type { UseEntry } from '../use.ts';
import { findEntity } from '../world.ts';
import { centre, isOut, thingDef } from '../npc/state.ts';

/**
 * Use near a placed thing does its deed (systems/npc-interact.ts acts):
 * the nearest untaken thing in this room within npcInteractReach of the
 * body's middle; a thing with a keeper only while the keeper attends it.
 * Not while the body is out cold. The word is the thing's deed.
 * Moved here unchanged from npc-interact (Step 4), Step 19 push 1.
 */
const entry: UseEntry = {
  id: 'thing',
  order: 100,
  find(world, content, e) {
    if (isOut(e)) return undefined;
    const { npcInteractReach, npcKeeperReach } = content.tuning.world;
    const me = centre(content, e);
    let best: Entity | undefined;
    let bestDist = Infinity;
    for (const t of world.entities) {
      if (!t.c.thing || t.c.thing.takenBy !== null || t.room !== e.room) continue;
      const at = centre(content, t);
      const dist = Math.hypot(at.x - me.x, at.y - me.y);
      // Entities are in id order, so between two equally near things the lower id wins on every device.
      if (dist <= npcInteractReach! && dist < bestDist) {
        best = t;
        bestDist = dist;
      }
    }
    const def = best && thingDef(content, best);
    if (!best || !def) return undefined;
    if (def.keeper !== undefined) {
      const keeper = findEntity(world, def.keeper);
      const attended = keeper !== undefined && keeper.room === best.room && !isOut(keeper) && Math.abs(centre(content, keeper).x - centre(content, best).x) <= npcKeeperReach!;
      // INTENT (as in Step 4): the nearest thing decides; an unattended counter does nothing, it does not pass the press to the next thing.
      if (!attended) return undefined;
    }
    const at = centre(content, best);
    const T = content.rooms[best.room]?.tile ?? 0;
    return { entry: 'thing', word: def.deed, target: best.id, at: { x: at.x, y: at.y - T / 2 } };
  },
};
export default entry;
