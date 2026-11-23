import { verbs } from '../registry.ts';
import type { System } from '../types.ts';
import { NO_INPUT } from '../world.ts';

/** Lets every player-driven entity do the verbs its character kind lists. */
const system: System = {
  id: 'verbs',
  order: 100,
  run(ctx) {
    for (const entity of ctx.world.entities) {
      if (entity.player === null) continue;
      const kind = ctx.content.characters[entity.kind];
      if (!kind) continue;
      const input = ctx.inputs[entity.player] ?? NO_INPUT;
      const tuning = ctx.content.tuning.characters[kind.tuning] ?? {};
      for (const verb of verbs) {
        if (kind.verbs.includes(verb.id)) verb.update(ctx, entity, input, tuning);
      }
    }
  },
};
export default system;
