import { heldBy } from '../effects.ts';
import type { Entity, System } from '../types.ts';

declare module '../types.ts' {
  interface Components {
    /**
     * Present exactly while the body is stunned by what happened to it: in
     * a held beat, knocked flying (by a hit, a throw or a shove), or
     * flattened. `why` says which (the first that applies, in that order).
     * One readable fact for drawing (Step 8); nothing in the simulation reads it.
     */
    stunned?: { why: 'beat' | 'flying' | 'flattened' };
  }
}

/** Why a body is stunned right now, or null. Carried bodies are held, not stunned. */
export function stunnedWhy(e: Entity): 'beat' | 'flying' | 'flattened' | null {
  if (heldBy(e) !== null) return null;
  if (e.c.beat) return 'beat';
  if (e.c.flying) return 'flying';
  if (e.c.flattened) return 'flattened';
  return null;
}

/**
 * Last of the tick: writes `stunned` on every body from its combat state,
 * so what is drawn after the step reads one field (Step 2 feel, 2026-11-23).
 */
const system: System = {
  id: 'body-stun',
  order: 990,
  run(ctx) {
    for (const e of ctx.world.entities) {
      const why = stunnedWhy(e);
      if (why === null) {
        if (e.c.stunned) delete e.c.stunned;
      } else if (e.c.stunned?.why !== why) e.c.stunned = { why };
    }
  },
};
export default system;
