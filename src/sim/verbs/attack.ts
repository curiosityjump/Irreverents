import { bodyNumbers, launch, markImpact, overlaps, throwCarried, ticksOf, wear } from '../body-state.ts';
import { heldBy } from '../effects.ts';
import type { Verb } from '../types.ts';

declare module '../types.ts' {
  interface Components {
    attack?: {
      /** Whether the action was held last tick, to see a fresh press. */
      held: boolean;
      /** Ticks until the next swing is allowed. */
      cooldown: number;
      /** The world tick of the last swing (drawing shows it for a moment). */
      swung: number;
    };
  }
}

/**
 * The attack button: a short hit in front; while carrying, it throws.
 * What is hit is launched by the attacker's strength against the body's
 * weight, never by a number on screen.
 * DRAFT: the hit lands on the tick of the press, reaches attackReach
 * pixels in front, and holding the stick up makes it a launcher. Every
 * number is in content/tuning.json.
 */
const verb: Verb = {
  id: 'attack',
  order: 30,
  actions: ['attack'],
  tuning: {
    attackStrength: { min: 0, max: 1000000, what: 'how hard a hit launches: launch speed (pixels per second) is this divided by the weight of what is hit, capped by world.maxLaunchSpeed' },
    attackReach: { min: 0, max: 64, what: 'how far in front of the body a hit reaches, pixels' },
    attackTime: { min: 0, max: 5, what: 'seconds before the next hit can start' },
    attackWear: { min: 0, max: 100000, what: 'how much one hit wears down what it lands on (against its toughness)' },
  },
  update(ctx, e, input, t) {
    const a = (e.c.attack ??= { held: false, cooldown: 0, swung: -1000 });
    const down = input.held.includes('attack');
    const fresh = down && !a.held;
    a.held = down;
    if (a.cooldown > 0) a.cooldown--;
    if (!fresh || a.cooldown > 0) return;
    a.cooldown = Math.max(1, ticksOf(t.attackTime));

    if (e.c.carrying) {
      throwCarried(ctx, e, input, t.throwStrength ?? 0);
      return;
    }

    a.swung = ctx.world.tick;
    ctx.emit('attacked', { by: e.id, player: e.player });
    const box = ctx.content.characters[e.kind]?.box;
    if (!box) return;
    const world = ctx.content.tuning.world;
    const reach = t.attackReach!;
    // From the middle of the attacker to `reach` past its front edge, so a
    // body standing inside the attacker (bodies pass through each other) is hit too.
    const x0 = e.facing > 0 ? e.x + box.w / 2 : e.x - reach;
    const width = box.w / 2 + reach;
    for (const o of ctx.world.entities) {
      if (o === e || o.room !== e.room || heldBy(o) !== null || o.c.flattened) continue;
      const ob = ctx.content.characters[o.kind]?.box;
      if (!ob || !overlaps(x0, e.y - 4, width, box.h + 4, o.x, o.y, ob.w, ob.h)) continue;
      ctx.emit('hit', { by: e.id, target: o.id, player: e.player });
      // DRAFT (docs/plan/step-2.md): a friend's attack neither wears you
      // down nor launches you. Each share is a number in the tuning file,
      // so the other answer is a small change. "Friend" is player on player.
      const friend = e.player !== null && o.player !== null;
      const speed = Math.min(t.attackStrength! / bodyNumbers(ctx.content, o).weight, world.maxLaunchSpeed ?? 500) * (friend ? (world.friendAttackLaunch ?? 0) : 1);
      if (speed > 0) {
        const up = input.y < -0.5;
        launch(ctx, o, e.facing * speed * (up ? 0.25 : 1), -speed * (up ? 1 : (world.attackLift ?? 0.5)), e.id, [e.id], ticksOf(world.hitBeatTime));
        markImpact(ctx, o, e.facing > 0 ? o.x : o.x + ob.w, o.y + ob.h / 2, speed);
      }
      wear(ctx, o, t.attackWear! * (friend ? (world.friendAttackWear ?? 0) : 1), e.id);
    }
  },
};
export default verb;
