import { verbs } from '../registry.ts';
import type { Input, System } from '../types.ts';
import { NO_INPUT } from '../world.ts';

declare module '../types.ts' {
  interface Components {
    /**
     * What a body that is not a player is asking for this tick. Written by
     * another system (Step 4's NPC response logic); the body's own verbs
     * read it exactly as a player's verbs read their device's input.
     */
    input?: Input;
  }
}

/**
 * Lets every entity do the verbs its character kind lists: a player with
 * their own input, any other body with entity.c.input (nothing held when
 * there is none).
 */
const system: System = {
  id: 'verbs',
  order: 100,
  run(ctx) {
    for (const entity of ctx.world.entities) {
      const kind = ctx.content.characters[entity.kind];
      if (!kind || kind.verbs.length === 0) continue;
      const input = (entity.player === null ? entity.c.input : ctx.inputs[entity.player]) ?? NO_INPUT;
      const tuning = ctx.content.tuning.characters[kind.tuning] ?? {};
      for (const verb of verbs) {
        if (kind.verbs.includes(verb.id)) verb.update(ctx, entity, input, tuning);
      }
    }
  },
};
export default system;
