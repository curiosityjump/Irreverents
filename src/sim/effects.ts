// Effects on a player: how anything in the world moves a character that a
// player's own device simulates (docs/architecture.md, "Effects on a
// player"; docs/plan/step-1.md, "The netcode must let the world move a
// player"). Pure simulation code: it knows nothing about the network.
import type { Entity, StepContext } from './types.ts';

/**
 * INTENT: additive only. A hit, a hold, a throw or a door reaches a player
 * as one of these. Emit it with emitEffect() from a verb or a system and
 * write no network code: in one world (a scenario, the server's own bodies)
 * it simply happens; across devices the network layer delivers it to the
 * one player concerned, whose device applies and acknowledges it.
 */
export type Effect =
  /** Sent flying: the body's velocity becomes (vx, vy), pixels per second. */
  /** With `fly` (Step 2): it is also "flying", unable to act until it comes to rest; `by` started the flight, `met` are bodies it will not strike. */
  | { kind: 'push'; vx: number; vy: number; fly?: { by: string | null; met: string[] } }
  /** Knocked out for `ticks` ticks (Step 2): it lies where it is and cannot act until it recovers. */
  | { kind: 'flatten'; ticks: number; by: string | null }
  /** Held by the body with entity id `by`. Until released, whoever holds it moves it; its own device does not. */
  | { kind: 'hold'; by: string }
  /** Let go: free again, where it is now. Follow with a `push` to throw it. */
  | { kind: 'release' }
  /** Put somewhere: a door, a respawn. `x`,`y` are the top-left of its box in `room`; it arrives standing still. */
  | { kind: 'move'; room: string; x: number; y: number };

declare module './types.ts' {
  interface Components {
    /** State the effects keep on a body. `heldBy`: the entity id holding it, while held. */
    effect?: { heldBy?: string };
  }
  interface EventMap {
    /** An effect was applied to `entity` this tick. */
    effect: { entity: string; player: string | null; effect: Effect };
  }
}

/** Whether a body is being held (its holder moves it; its own input does not). */
export function heldBy(e: Entity): string | null {
  return e.c.effect?.heldBy ?? null;
}

/** What an effect does to a body. The same function runs wherever the body is simulated. */
export function applyEffect(e: Entity, effect: Effect): void {
  if (effect.kind === 'push') {
    e.vx = effect.vx;
    e.vy = effect.vy;
    if (effect.vy < 0) e.onGround = false;
    if (effect.fly) e.c.flying = { by: effect.fly.by, met: [...effect.fly.met], ticks: 0, pvx: 0, pvy: 0, pGround: false, at: -1 };
  } else if (effect.kind === 'flatten') {
    e.c.flattened = { ticksLeft: effect.ticks, by: effect.by };
  } else if (effect.kind === 'hold') {
    e.c.effect = { ...e.c.effect, heldBy: effect.by };
    e.vx = 0;
    e.vy = 0;
  } else if (effect.kind === 'release') {
    if (e.c.effect) delete e.c.effect.heldBy;
  } else if (effect.kind === 'move') {
    e.room = effect.room;
    e.x = effect.x;
    e.y = effect.y;
    e.vx = 0;
    e.vy = 0;
  }
}

/** Applies an effect to a body now and records it as this tick's `effect` event. */
export function emitEffect(ctx: StepContext, e: Entity, effect: Effect): void {
  applyEffect(e, effect);
  ctx.emit('effect', { entity: e.id, player: e.player, effect });
}
