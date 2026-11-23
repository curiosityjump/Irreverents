import { bodyNumbers, inputOf, overlaps, release, ticksOf } from '../body-state.ts';
import { emitEffect, heldBy } from '../effects.ts';
import type { Entity, Verb } from '../types.ts';

declare module '../types.ts' {
  interface Components {
    grab?: {
      /** Whether the action was held last tick, to see a fresh press. */
      held: boolean;
    };
  }
}

/**
 * The grab button: picks up the nearest body in reach that this character
 * is strong enough to lift; while carrying, sets it down in front. The
 * throw is the attack button (verbs/attack.ts). Carrying itself is the
 * carry-* systems.
 * DRAFT: a body being carried cannot grab, and a body that is picked up
 * drops what it was carrying, so there are no chains of holds.
 */
const verb: Verb = {
  id: 'grab',
  order: 40,
  actions: ['grab'],
  tuning: {
    liftStrength: { min: 0, max: 100000, what: 'the heaviest body (its weight) this character can pick up' },
    throwStrength: { min: 0, max: 1000000, what: 'how hard a throw is: throw speed (pixels per second) is this divided by the weight of what is thrown, capped by world.maxLaunchSpeed' },
    grabReach: { min: 0, max: 64, what: 'how far in front of the body a grab reaches, pixels' },
  },
  update(ctx, e, input, t) {
    const g = (e.c.grab ??= { held: false });
    const down = input.held.includes('grab');
    // INTENT: a fresh press only. A carrier still holding the button when a
    // friend breaks free must not pick them straight back up.
    const fresh = down && !g.held;
    g.held = down;
    if (!fresh) return;
    const box = ctx.content.characters[e.kind]?.box;
    if (!box) return;

    if (e.c.carrying) {
      const carried = ctx.world.entities.find((o) => o.id === e.c.carrying!.id);
      const cb = carried && ctx.content.characters[carried.kind]?.box;
      if (carried && cb) {
        // In front, feet level with the carrier's; release() falls back to the carrier's own feet.
        release(ctx, carried, 'set-down', [{ x: e.facing > 0 ? e.x + box.w + 1 : e.x - cb.w - 1, y: e.y + box.h - cb.h }]);
      } else delete e.c.carrying;
      return;
    }

    const reach = t.grabReach!;
    const x0 = e.facing > 0 ? e.x : e.x - reach;
    const mid = e.x + box.w / 2;
    let best: Entity | undefined;
    let bestGap = Infinity;
    let tooHeavy: Entity | undefined;
    let heavyGap = Infinity;
    for (const o of ctx.world.entities) {
      if (o === e || o.room !== e.room || heldBy(o) !== null || o.c.flattened) continue;
      const ob = ctx.content.characters[o.kind]?.box;
      if (!ob || !overlaps(x0, e.y - 2, box.w + reach, box.h + 4, o.x, o.y, ob.w, ob.h)) continue;
      const gap = Math.abs(o.x + ob.w / 2 - mid);
      if (bodyNumbers(ctx.content, o).weight <= t.liftStrength!) {
        if (gap < bestGap) [best, bestGap] = [o, gap];
      } else if (gap < heavyGap) [tooHeavy, heavyGap] = [o, gap];
    }
    if (!best) {
      // Too heavy for this character: refused, and said so, so the screen can show why.
      if (tooHeavy) ctx.emit('grab-refused', { by: e.id, target: tooHeavy.id, player: e.player, reason: 'too-heavy' });
      return;
    }
    delete best.c.flying;
    delete best.c.beat;
    emitEffect(ctx, best, { kind: 'hold', by: e.id });
    e.c.carrying = { id: best.id, kind: e.kind };
    best.c.held = {
      ticks: best.player !== null ? Math.max(1, ticksOf(ctx.content.tuning.world.holdPlayerTime)) : -1,
      jumpDown: inputOf(ctx, best).held.includes('jump'),
    };
    ctx.emit('grabbed', { by: e.id, target: best.id, player: e.player });
  },
};
export default verb;
