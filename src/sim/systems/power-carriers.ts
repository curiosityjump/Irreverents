import { popOrb } from '../power-orbs.ts';
import { carriedPowerOf } from '../powers.ts';
import type { System } from '../types.ts';
import { findEntity } from '../world.ts';

/**
 * Carriers (Step 9, D-009; docs/mechanisms/powers.md): a body nobody plays
 * that a power names in `carriers` has it, drawn as a small glowing orb over
 * its head (src/client/draw/powers.ts). Laid flat, it pops out of them as an
 * orb (src/sim/power-orbs.ts) for a hero to take, and the carrier is spent
 * (`c.powerSpent`) until it gets up, when it has it again if the power says
 * `regain`.
 * DRAFT: regain on getting up, so a carrier can be beaten for it again; the
 * carrier is not made stronger by what it carries (a boosted villain would
 * re-time Step 18's fight-back).
 * Runs after every way a body is laid flat this tick (verbs 100, impacts
 * 510 and 520) and after `recovered` (combat-clock 50). In a page's own world
 * there are no carriers, so it does nothing there.
 */
const system: System = {
  id: 'power-carriers',
  order: 540,
  run(ctx) {
    for (const ev of ctx.events) {
      if (ev.type === 'flattened') {
        const t = findEntity(ctx.world, ev.target);
        if (!t || t.c.powerSpent) continue;
        const p = carriedPowerOf(ctx.content, t);
        if (!p) continue;
        popOrb(ctx, p, t, ev.by ? (findEntity(ctx.world, ev.by) ?? null) : null);
        t.c.powerSpent = { at: ctx.world.tick };
      } else if (ev.type === 'recovered') {
        const t = findEntity(ctx.world, ev.target);
        if (t?.c.powerSpent && carriedPowerOf(ctx.content, t)?.regain) delete t.c.powerSpent;
      }
    }
  },
};
export default system;
