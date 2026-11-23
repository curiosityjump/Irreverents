import { canAct } from '../body-state.ts';
import { canSee } from '../npc/sight.ts';
import { centre, drive, isOut } from '../npc/state.ts';
import { heroesIn, ofOutpost, outposts } from '../outpost/state.ts';
import type { System } from '../types.ts';

/**
 * The outpost's people fight heroes: it is their business as usual (D-060),
 * so their mood stays 1 throughout. Runs after outpost-call (57) and
 * overlays the input npc-act wrote; a caller walking to the post or
 * sounding it is left to outpost-call.
 *
 * INTENT (D-065, "Escalation is not omniscient"): the only read of a hero's
 * position is under canSee on the same tick. Losing sight, a fighter walks
 * to the last place it saw one and stands there.
 * DRAFT: the nearest hero seen; a fresh press of attack every other tick in
 * reach (Step 2's attack starts a swing on a fresh press, and its own
 * cooldown sets the pace).
 */
const system: System = {
  id: 'outpost-fight',
  order: 58,
  run(ctx) {
    const { world, content } = ctx;
    const reach = content.tuning.world.npcChargeReach!;
    for (const op of outposts(content)) {
      const heroes = heroesIn(world, op.room);
      for (const e of world.entities) {
        if (!ofOutpost(op, e) || e.c.outpostCall?.phase === 'going' || e.c.outpostCall?.phase === 'sounding') continue;
        if (isOut(e) || !canAct(e)) continue;
        if (!content.characters[e.kind]?.verbs.includes('attack')) continue;
        const me = centre(content, e);
        let seen: { x: number; y: number } | null = null;
        let best = Infinity;
        for (const h of heroes) {
          if (!canSee(content, e, h)) continue;
          const c = centre(content, h);
          const d = Math.abs(c.x - me.x);
          if (d < best) {
            best = d;
            seen = c;
          }
        }
        if (seen) e.c.outpostFight = seen;
        const target = e.c.outpostFight;
        if (!target) continue;
        const dx = target.x - me.x;
        if (Math.abs(dx) > reach) {
          drive(e, { x: dx > 0 ? 1 : -1, y: 0, held: [] });
          continue;
        }
        if (!seen) {
          // Arrived where a hero was last seen, and nobody is there: stand.
          e.c.outpostFight = null;
          drive(e, { x: 0, y: 0, held: [] });
          continue;
        }
        const facing = dx === 0 || (dx > 0 ? 1 : -1) === e.facing;
        if (!facing) drive(e, { x: dx > 0 ? 0.01 : -0.01, y: 0, held: [] });
        else drive(e, { x: 0, y: 0, held: world.tick % 2 === 0 ? ['attack'] : [] });
      }
    }
  },
};
export default system;
