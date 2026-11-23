import { beatTicks, bodyNumbers, launch, markImpact, overlaps, throwCarried, ticksOf, wear } from '../body-state.ts';
import { heldBy } from '../effects.ts';
import type { Entity, Input, StepContext, Verb } from '../types.ts';

declare module '../types.ts' {
  interface Components {
    attack?: {
      /** Whether the action was held last tick, to see a fresh press. */
      held: boolean;
      /** Ticks until the next swing is allowed (counted from the press). */
      cooldown: number;
      /** The world tick the last strike began (drawing shows it for a moment). */
      swung: number;
      /**
       * Step 2 feel (2026-11-23): where the swing is. `windup` (the body
       * draws back; nothing is hit yet), `strike` (anything in reach is hit,
       * each body once), `recover` (follow-through), or `ready`. Drawing
       * reads it with `left`. Absent on a body saved before it existed: read as `ready`.
       */
      phase?: 'ready' | 'windup' | 'strike' | 'recover';
      /** Ticks left in `phase`, this one included. */
      left?: number;
      /** Entity ids this swing has already hit. */
      struck?: string[];
      /** The world tick this verb last ran for the body, to notice a swing cut off (the body was knocked flying, held or flattened). */
      tick?: number;
    };
    /** The last hit of an attack this body took: the world tick and who swung. Drawing reads it for a flinch. */
    lastHit?: { tick: number; by: string };
  }
}

/**
 * The attack button: a swing in front, in three phases (wind-up, strike,
 * recovery), each a per-character time; while carrying, it throws at once.
 * What is hit is launched by the attacker's strength against the body's
 * weight, never by a number on screen.
 * DRAFT: the hit is tested on every tick of the strike, once per body,
 * reaches attackReach pixels in front, and holding the stick up when the
 * strike starts makes it a launcher. A swing cut off by being knocked
 * flying is lost. Every number is in content/tuning.json.
 */
const verb: Verb = {
  id: 'attack',
  order: 30,
  actions: ['attack'],
  tuning: {
    attackStrength: { min: 0, max: 1000000, what: 'how hard a hit launches: launch speed (pixels per second) is this divided by the weight of what is hit, capped by world.maxLaunchSpeed' },
    attackReach: { min: 0, max: 64, what: 'how far in front of the body a hit reaches, pixels' },
    attackTime: { min: 0, max: 5, what: 'seconds from one press of attack until the next can start a swing' },
    attackWear: { min: 0, max: 100000, what: 'how much one hit wears down what it lands on (against its toughness)' },
    attackWindup: { min: 0, max: 1, what: 'seconds from the press until the strike: the body draws back, nothing is hit yet (0 = hits on the press)' },
    attackStrikeTime: { min: 0, max: 1, what: 'seconds the strike lasts: a body that comes into reach during it is still hit, once' },
    attackRecovery: { min: 0, max: 1, what: 'seconds of follow-through after the strike before the swing is over' },
  },
  update(ctx, e, input, t) {
    const now = ctx.world.tick;
    const a = (e.c.attack ??= { held: false, cooldown: 0, swung: -1000 });
    // A body that could not act last tick ran no verb: a swing it was in is lost.
    if (a.tick !== now - 1) {
      a.phase = 'ready';
      a.left = 0;
    }
    a.tick = now;
    const down = input.held.includes('attack');
    const fresh = down && !a.held;
    a.held = down;
    if (a.cooldown > 0) a.cooldown--;

    const phase = a.phase ?? 'ready';
    if (phase === 'ready') {
      if (!fresh || a.cooldown > 0) return;
      a.cooldown = Math.max(1, ticksOf(t.attackTime));
      if (e.c.carrying) {
        // DRAFT: a throw stays immediate (no wind-up): it reads as letting go.
        throwCarried(ctx, e, input, t.throwStrength ?? 0);
        return;
      }
      a.struck = [];
      const windup = ticksOf(t.attackWindup);
      if (windup > 0) {
        a.phase = 'windup';
        a.left = windup;
        return;
      }
      startStrike(ctx, e, input, t);
    } else if (phase === 'windup') {
      a.left = (a.left ?? 1) - 1;
      if (a.left <= 0) startStrike(ctx, e, input, t);
    } else if (phase === 'strike') {
      a.left = (a.left ?? 1) - 1;
      if (a.left > 0) strikeTick(ctx, e, input, t);
      else {
        const recover = ticksOf(t.attackRecovery);
        a.phase = recover > 0 ? 'recover' : 'ready';
        a.left = recover;
      }
    } else {
      a.left = (a.left ?? 1) - 1;
      if (a.left <= 0) {
        a.phase = 'ready';
        a.left = 0;
      }
    }
  },
};

function startStrike(ctx: StepContext, e: Entity, input: Input, t: Record<string, number>): void {
  const a = e.c.attack!;
  a.phase = 'strike';
  a.left = Math.max(1, ticksOf(t.attackStrikeTime));
  a.swung = ctx.world.tick;
  ctx.emit('attacked', { by: e.id, player: e.player });
  strikeTick(ctx, e, input, t);
}

/** One tick of the strike: hits every body in reach that this swing has not hit yet. */
function strikeTick(ctx: StepContext, e: Entity, input: Input, t: Record<string, number>): void {
  const a = e.c.attack!;
  const struck = (a.struck ??= []);
  const box = ctx.content.characters[e.kind]?.box;
  if (!box) return;
  const world = ctx.content.tuning.world;
  const reach = t.attackReach!;
  // From the middle of the attacker to `reach` past its front edge, so a
  // body standing inside the attacker (bodies pass through each other) is hit too.
  const x0 = e.facing > 0 ? e.x + box.w / 2 : e.x - reach;
  const width = box.w / 2 + reach;
  for (const o of ctx.world.entities) {
    if (o === e || o.room !== e.room || heldBy(o) !== null || o.c.flattened || struck.includes(o.id)) continue;
    const ob = ctx.content.characters[o.kind]?.box;
    if (!ob || !overlaps(x0, e.y - 4, width, box.h + 4, o.x, o.y, ob.w, ob.h)) continue;
    struck.push(o.id);
    o.c.lastHit = { tick: ctx.world.tick, by: e.id };
    ctx.emit('hit', { by: e.id, target: o.id, player: e.player });
    // DRAFT (docs/plan/step-2.md): a friend's attack neither wears you
    // down nor launches you. Each share is a number in the tuning file,
    // so the other answer is a small change. "Friend" is player on player.
    const friend = e.player !== null && o.player !== null;
    // Step 11: in a cantina brawl the target's c.brawl share is read first (systems/cantina-brawl.ts).
    const speed = Math.min(t.attackStrength! / bodyNumbers(ctx.content, o).weight, world.maxLaunchSpeed ?? 500) * (friend ? (o.c.brawl?.attackLaunch ?? world.friendAttackLaunch ?? 0) : 1);
    if (speed > 0) {
      const up = input.y < -0.5;
      launch(ctx, o, e.facing * speed * (up ? 0.25 : 1), -speed * (up ? 1 : (world.attackLift ?? 0.5)), e.id, [e.id], beatTicks(ctx, world.hitBeatTime, world.hitBeatMaxTime, speed));
      markImpact(ctx, o, e.facing > 0 ? o.x : o.x + ob.w, o.y + ob.h / 2, speed);
    }
    wear(ctx, o, t.attackWear! * (friend ? (o.c.brawl?.attackWear ?? world.friendAttackWear ?? 0) : 1), e.id);
  }
}
export default verb;
