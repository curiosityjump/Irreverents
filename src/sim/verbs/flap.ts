import { canAct } from '../body-state.ts';
import type { Verb } from '../types.ts';

declare module '../types.ts' {
  interface Components {
    flap?: {
      /** Flaps spent since last standing on the ground. */
      used: number;
      /** Whether the jump action was held last tick, to see a fresh press. */
      held: boolean;
      /** The world tick this verb last ran for this entity, to notice a body that only just became a flapper. */
      tick: number;
    };
  }
  interface EventMap {
    /** A flap in the air. `left` is how many remain before landing. */
    flapped: { entity: string; player: string | null; left: number };
  }
}

/**
 * Flapping: the flyer's own move. A fresh press of `jump` in the air gives
 * a weaker upward push, a limited number of times per time off the ground.
 * DRAFT: every number is in content/tuning.json; the library gives flight
 * no limits ("not stated"), these are a first pass for the owner to feel.
 */
const verb: Verb = {
  id: 'flap',
  // INTENT: runs before jump (20) so it can tell whether this same press is
  // about to be a ground (or coyote-time) jump, and stand aside: one press
  // is a take-off or a flap, never both.
  order: 15,
  actions: ['jump'],
  tuning: {
    // INTENT: rising is not capped by physics, which looks one 16 px tile
    // ahead: keep every upward speed under 960 px/s.
    flapSpeed: { min: 0, max: 900, what: 'upward speed a flap gives, pixels per second' },
    flaps: { min: 0, max: 20, what: 'how many flaps before the character must land again (0 = cannot flap)' },
  },
  update(ctx, e, input, t) {
    const now = ctx.world.tick;
    const down = input.held.includes('jump');
    let f = e.c.flap;
    if (!f || f.tick !== now - 1) {
      // This body was not a flapper last tick (a new player, or a switch).
      // DRAFT: one that becomes the flyer in mid-air has no flaps until it
      // lands, so cycling the switch button in the air is not endless
      // flight. `held` starts true so a press already down is not fresh.
      f = e.c.flap = { used: e.onGround ? 0 : t.flaps!, held: true, tick: now };
    }
    f.tick = now;
    if (e.onGround) f.used = 0;
    const fresh = down && !f.held;
    f.held = down;
    if (!fresh || e.onGround) return;
    // DRAFT: a held or carried player does not flap away (jump breaks free instead).
    if (!canAct(e)) return;
    // The jump verb, later this tick, takes this press itself while its
    // coyote time has more than one tick left.
    if ((e.c.jump?.coyote ?? 0) >= 2) return;
    if (f.used >= t.flaps!) return;
    f.used++;
    e.vy = Math.min(e.vy, -t.flapSpeed!);
    ctx.emit('flapped', { entity: e.id, player: e.player, left: Math.max(0, Math.round(t.flaps!) - f.used) });
  },
};
export default verb;
