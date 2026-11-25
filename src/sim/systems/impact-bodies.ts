import { beatTicks, bodyNumbers, markImpact, overlaps, strike, wear } from '../body-state.ts';
import { heldBy } from '../effects.ts';
import { sparedByOwn } from '../outpost/state.ts';
import type { System } from '../types.ts';
import { friendly } from './impact-walls.ts';

/**
 * A flying body that meets another body shoves it, by weight: the one hit
 * flies too, an impact is recorded for each, and both hold still for the
 * held beat. Bodies that are not flying pass through each other
 * (docs/plan/step-2.md, "Decided by the lead").
 */
const system: System = {
  id: 'impact-bodies',
  order: 520,
  tuning: {
    bodyImpactOn: { min: 0, max: 1, what: 'switch: 1 = a flying body shoves the bodies it meets; 0 = it passes through them' },
    bodyImpactSpeed: { min: 0, max: 900, what: 'the slowest two bodies can meet and still count as an impact, pixels per second' },
    shoveBounce: { min: 0, max: 1, what: 'how springy a body-on-body impact is (1 = all the speed is passed on or bounced back, 0 = they move off together)' },
    shovePop: { min: 0, max: 900, what: 'upward speed added to a body standing on the ground when it is shoved, so it flies instead of sliding, pixels per second' },
  },
  run(ctx) {
    const world = ctx.content.tuning.world;
    if (world.bodyImpactOn! < 1) return;
    for (const a of ctx.world.entities) {
      const fa = a.c.flying;
      if (!fa || heldBy(a) !== null || a.c.beat) continue;
      const ab = ctx.content.characters[a.kind]?.box;
      if (!ab) continue;
      for (const b of ctx.world.entities) {
        if (b === a || b.room !== a.room || heldBy(b) !== null || b.c.flattened || b.c.beat) continue;
        // INTENT: each pair meets once per flight (two bodies overlap for
        // several ticks), and a thrown body never "meets" its thrower:
        // launch() puts the thrower in `met`.
        if (fa.met.includes(b.id) || b.c.flying?.met.includes(a.id)) continue;
        const bb = ctx.content.characters[b.kind]?.box;
        if (!bb || !overlaps(a.x, a.y, ab.w, ab.h, b.x, b.y, bb.w, bb.h)) continue;
        // DRAFT (the outpost's `sparedByOwn`, docs/decisions-log.md "A lookout is not felled by his
        // own camp's fight"): a body the lookout's own side sent flying passes him by.
        if (sparedByOwn(ctx.world, ctx.content, b, fa.by)) continue;
        const speed = Math.hypot(a.vx - b.vx, a.vy - b.vy);
        if (speed < world.bodyImpactSpeed!) continue;

        const ma = bodyNumbers(ctx.content, a).weight;
        const mb = bodyNumbers(ctx.content, b).weight;
        const k = world.shoveBounce!;
        const [avx, avy, bvx, bvy] = [a.vx, a.vy, b.vx, b.vy];
        const pop = b.onGround ? world.shovePop! : 0;
        const beat = beatTicks(ctx, world.beatTime, world.beatMaxTime, speed);
        fa.met.push(b.id);
        if (b.c.flying) b.c.flying.met.push(a.id);
        strike(ctx, a, (ma * avx + mb * bvx + mb * k * (bvx - avx)) / (ma + mb), (ma * avy + mb * bvy + mb * k * (bvy - avy)) / (ma + mb), beat);
        strike(
          ctx,
          b,
          (ma * avx + mb * bvx + ma * k * (avx - bvx)) / (ma + mb),
          (ma * avy + mb * bvy + ma * k * (avy - bvy)) / (ma + mb) - pop,
          beat,
          b.c.flying ? undefined : { by: fa.by, met: [a.id] },
        );
        b.onGround = false;

        const x = (a.x + ab.w / 2 + b.x + bb.w / 2) / 2;
        const y = (a.y + ab.h / 2 + b.y + bb.h / 2) / 2;
        markImpact(ctx, a, x, y, speed);
        markImpact(ctx, b, x, y, speed);
        ctx.emit('impact', { entity: a.id, player: a.player, other: b.id, speed });
        ctx.emit('impact', { entity: b.id, player: b.player, other: a.id, speed });
        const hurt = speed * world.impactWear!;
        // Step 11: in a cantina brawl each body's c.brawl share is read first (systems/cantina-brawl.ts).
        wear(ctx, a, hurt * (friendly(ctx, fa.by, a) ? (a.c.brawl?.throwWear ?? world.friendThrowWear!) : 1), fa.by);
        wear(ctx, b, hurt * (friendly(ctx, fa.by, b) ? (b.c.brawl?.throwWear ?? world.friendThrowWear!) : 1), fa.by);
        break;
      }
    }
  },
};
export default system;
