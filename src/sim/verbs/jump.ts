import { TICK_RATE } from '../types.ts';
import type { Verb } from '../types.ts';

declare module '../types.ts' {
  interface Components {
    jump?: {
      /** Ticks left in which a press still counts (jump buffering). */
      buffer: number;
      /** Ticks left in which leaving the ground still allows a jump (coyote time). */
      coyote: number;
      /** Whether the action was held last tick, to see a fresh press. */
      held: boolean;
      /** Whether this jump's rise has already been cut short (or was not a jump). */
      cut: boolean;
    };
  }
  interface EventMap {
    jumped: { entity: string; player: string | null };
  }
}

/**
 * Jumping. DRAFT: variable height (let go early for a short hop), coyote
 * time and jump buffering are first-pass feel choices for the owner to
 * judge; every number is in content/tuning.json.
 */
const verb: Verb = {
  id: 'jump',
  order: 20,
  actions: ['jump'],
  tuning: {
    jumpSpeed: { min: 0, max: 900, what: 'upward speed at take-off, pixels per second' },
    jumpCutMultiplier: { min: 0, max: 1, what: 'share of upward speed kept when the button is let go early (1 = fixed-height jump)' },
    coyoteTime: { min: 0, max: 1, what: 'seconds after walking off an edge in which a jump still works' },
    jumpBufferTime: { min: 0, max: 1, what: 'seconds before landing in which a press still counts' },
    // Read by systems/physics.ts, not here: a per-character number must be
    // declared by one of that character's verbs (src/sim/check-content.ts).
    // They shape a body's own arc only; a body knocked flying or flattened
    // falls by the world's numbers. All 1 (and fallSpeed = world.maxFallSpeed)
    // is the plain arc of before 2026-11-23.
    apexSpeed: { min: 0, max: 900, what: 'near the top of a jump: while the body rises or falls slower than this (pixels per second), apexGravity applies' },
    apexGravity: { min: 0.1, max: 2, what: 'gravity near the top of a jump, as a share of world.gravity (under 1 = a little hang at the top)' },
    fallGravity: { min: 0.1, max: 4, what: 'gravity while falling (past the top), as a share of world.gravity (over 1 = a faster fall than rise)' },
    // INTENT: under one 16 px tile per tick (960 px/s), as world.maxFallSpeed.
    fallSpeed: { min: 1, max: 900, what: "this character's fastest fall, pixels per second" },
  },
  update(ctx, e, input, t) {
    const j = (e.c.jump ??= { buffer: 0, coyote: 0, held: false, cut: true });
    const down = input.held.includes('jump');

    if (down && !j.held) j.buffer = Math.max(1, Math.round(t.jumpBufferTime! * TICK_RATE));
    else if (j.buffer > 0) j.buffer--;

    if (e.onGround) j.coyote = Math.max(1, Math.round(t.coyoteTime! * TICK_RATE));
    else if (j.coyote > 0) j.coyote--;

    if (j.buffer > 0 && j.coyote > 0) {
      e.vy = -t.jumpSpeed!;
      e.onGround = false;
      j.buffer = 0;
      j.coyote = 0;
      j.cut = false;
      ctx.emit('jumped', { entity: e.id, player: e.player });
    } else if (!down && !j.cut && e.vy < 0) {
      e.vy *= t.jumpCutMultiplier!;
      j.cut = true;
    }
    if (e.onGround || e.vy >= 0) j.cut = true;
    j.held = down;
  },
};
export default verb;
