import { canAct } from '../body-state.ts';
import type { System } from '../types.ts';
import { useHere } from '../use.ts';

/**
 * Step 25: notes a fresh press of Use (the `interact` action) whose answer
 * from the Use arbiter is the suplex (src/sim/use/suplex.ts), for
 * verbs/suplex.ts to start the heave on.
 * INTENT: order 58, before every system that spends a Use press ahead of the
 * verbs (npc-interact 60, recruit-free 61, weapon-take 62). Asked after
 * them, the arbiter's answer has already changed (the goods taken, so
 * nothing nearer than the suplex), and one press would both take a thing
 * and suplex. One press, one answer.
 */
const system: System = {
  id: 'suplex-press',
  order: 58,
  run(ctx) {
    const { world, content } = ctx;
    for (const e of world.entities) {
      if (e.player === null) continue;
      const s = (e.c.suplex ??= { held: false });
      const down = ctx.inputs[e.player]?.held.includes('interact') ?? false;
      const was = s.held;
      s.held = down;
      if (!down || was || !canAct(e)) continue;
      const answer = useHere(world, content, e);
      if (answer?.entry !== 'suplex' || answer.target === undefined) continue;
      s.pressed = { tick: world.tick, target: answer.target };
    }
  },
};
export default system;
