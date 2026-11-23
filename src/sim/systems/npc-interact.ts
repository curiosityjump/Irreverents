import type { System } from '../types.ts';
import { findEntity } from '../world.ts';
import { isOut, thingDef } from '../npc/state.ts';
import { useHere } from '../use.ts';

/**
 * A hero using a thing: a fresh press of the `interact` action
 * (content/actions/interact.json) acts on the nearest usable thing in
 * reach. What that means is the thing's data (content/placements/,
 * `things`): the deed it is, the keeper it needs, whether it is taken.
 * Which thing, and whether, is the Use arbiter's (src/sim/use/thing.ts,
 * Step 19); this system does the deed. A system, not a verb: it needs no per-character numbers, and every
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
    for (const e of world.entities) {
      if (e.player === null) continue;
      const down = ctx.inputs[e.player]?.held.includes('interact') ?? false;
      const state = (e.c.interact ??= { held: false });
      const fresh = down && !state.held;
      state.held = down;
      if (!fresh || isOut(e)) continue;
      // Step 19: what this press does is the Use arbiter's (src/sim/use.ts): the door wins it, then
      // the nearest attended thing (src/sim/use/thing.ts). This system keeps only the effect.
      const answer = useHere(world, content, e);
      if (answer?.entry !== 'thing' || answer.target === undefined) continue;
      const best = findEntity(world, answer.target);
      const def = best && thingDef(content, best);
      if (!best?.c.thing || !def) continue;
      if (def.once) best.c.thing!.takenBy = e.id;
      ctx.emit('did', { deed: def.deed, by: e.id, target: def.keeper ?? null, thing: best.id });
    }
  },
};
export default system;
