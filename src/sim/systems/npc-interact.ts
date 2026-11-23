import type { Entity, System } from '../types.ts';
import { findEntity } from '../world.ts';
import { centre, isOut, thingDef } from '../npc/state.ts';
import { inEnterDoorway } from './room-doors.ts';

/**
 * A hero using a thing: a fresh press of the `interact` action
 * (content/actions/interact.json) acts on the nearest usable thing in
 * reach. What that means is the thing's data (content/placements/,
 * `things`): the deed it is, the keeper it needs, whether it is taken.
 * A system, not a verb: it needs no per-character numbers, and every
 * player's character can do it whichever body it is.
 *
 * DRAFT: there is no money and no inventory tonight. Buying is the deed
 * and a bark; taken goods are marked as held by the taker and vanish from
 * the shelf. What carrying them means is slice 2's to decide.
 */
const system: System = {
  id: 'npc-interact',
  order: 60,
  tuning: {
    npcInteractReach: { min: 1, max: 200, what: 'how near, in pixels, a hero must be to a thing to use it' },
    npcKeeperReach: { min: 1, max: 400, what: 'how near its thing, in pixels across, a keeper must stand for it to count as attended' },
  },
  run(ctx) {
    const { world, content } = ctx;
    const { npcInteractReach, npcKeeperReach } = content.tuning.world;
    for (const e of world.entities) {
      if (e.player === null) continue;
      const down = ctx.inputs[e.player]?.held.includes('interact') ?? false;
      const state = (e.c.interact ??= { held: false });
      const fresh = down && !state.held;
      state.held = down;
      if (!fresh || isOut(e)) continue;
      // DRAFT: in an enter doorway, Use goes through it (systems/room-doors.ts); the door wins the press.
      if (inEnterDoorway(content, e)) continue;

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
      if (!best || !def) continue;
      if (def.keeper !== undefined) {
        const keeper = findEntity(world, def.keeper);
        const attended = keeper !== undefined && keeper.room === best.room && !isOut(keeper) && Math.abs(centre(content, keeper).x - centre(content, best).x) <= npcKeeperReach!;
        if (!attended) continue;
      }
      if (def.once) best.c.thing!.takenBy = e.id;
      ctx.emit('did', { deed: def.deed, by: e.id, target: def.keeper ?? null, thing: best.id });
    }
  },
};
export default system;
