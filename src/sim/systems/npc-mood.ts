import type { System } from '../types.ts';
import { findEntity } from '../world.ts';
import { canSee } from '../npc/sight.ts';
import { centre, isOut, rageMayCool, seconds, setMood } from '../npc/state.ts';

/**
 * The clocks behind the three moods, and where each person last saw an
 * offender. Runs after the witness pass (600), so a deed seen this tick
 * has already restarted the clocks.
 */
const system: System = {
  id: 'npc-mood',
  order: 610,
  tuning: {
    npcDistressFadeTime: { min: 0.1, max: 3600, what: 'seconds of seeing nothing odd after which distress fades back to business as usual by itself' },
    npcRageCoolTime: { min: 0.1, max: 3600, what: 'seconds a raging person must go without seeing an offender or anything odd before rage falls to distress' },
  },
  run(ctx) {
    const { world, content } = ctx;
    const { npcDistressFadeTime, npcRageCoolTime, npcRageAt } = content.tuning.world;
    for (const e of world.entities) {
      const n = e.c.npc;
      if (!n) continue;
      if (n.bark && --n.bark.ticksLeft <= 0) n.bark = null;
      // DRAFT: someone out cold sees nothing and their clocks stand still (slice 2 owns knocked-out people).
      if (isOut(e)) continue;

      let seen = false;
      for (const id of n.offenders) {
        const who = findEntity(world, id);
        if (!who || !canSee(content, e, who)) continue;
        if (!seen) n.lastSeen = centre(content, who);
        seen = true;
      }

      if (n.mood === 2) {
        // DRAFT: left alone, distress fades by itself. The quick way out is D-072's expected act (npc-witness).
        if (++n.quiet >= seconds(npcDistressFadeTime!)) setMood(ctx, e, 1, 'faded');
      } else if (n.mood === 3) {
        // INTENT (D-073): rage ends only after the offender has stayed
        // unseen and nobody has shown this person anything odd for long
        // enough; seeing either restarts the wait.
        n.cool = seen ? 0 : n.cool + 1;
        if (n.cool >= seconds(npcRageCoolTime!) && rageMayCool(ctx, e)) {
          // DRAFT (the Step 4 lead's call, in docs/decisions-log.md): rage
          // cools to distress, not to calm; an expected act then finishes
          // the job (D-074). They stay on edge: one more odd deed is rage again.
          setMood(ctx, e, 2, 'cooled');
          n.dissonance = Math.max(0, npcRageAt! - 1);
        }
      }
    }
  },
};
export default system;
