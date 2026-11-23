import { release } from '../body-state.ts';
import { cantinasOf, hasBody, padSpot, pastEdge } from '../cantina.ts';
import type { Cantina } from '../../content/kinds/cantina.ts';
import { emitEffect, heldBy } from '../effects.ts';
import type { Entity, StepContext, System } from '../types.ts';
import { findEntity } from '../world.ts';

/**
 * Out and back (Step 11, D-085; docs/mechanisms/cantina.md). In a brawl, a
 * body whose middle leaves the cantina's edge, or that is knocked flat,
 * counts a fall for itself and a knock-out for whoever sent it, and is on
 * the next pad at once: no longer flying, flat, worn, carried or carrying,
 * standing still. Players and regulars alike, without end.
 * Outside a brawl a body that leaves the edge is put back too, with no score.
 *
 * INTENT: a player is only ever moved by an effect (`move`,
 * src/sim/effects.ts): the player's own device owns where it is, and the
 * effect is how the server tells it (docs/mechanisms/network.md).
 * DRAFT: who is credited: whoever sent the body flying, else whoever
 * knocked it flat, else whoever hit it last; nobody when it was itself.
 * Runs after physics, impacts and doors, and after the brawl's own pass (640).
 */
const system: System = {
  id: 'cantina-out',
  order: 650,
  run(ctx) {
    const { world, content } = ctx;
    for (const { file, state } of cantinasOf(world, content)) {
      for (const e of [...world.entities]) {
        if (e.room !== file.room || !hasBody(content, e) || heldBy(e) !== null) continue;
        if (!pastEdge(content, file, e) && !(state.on && e.c.flattened)) continue;
        if (state.on) {
          let by = e.c.flying?.by ?? e.c.flattened?.by ?? e.c.lastHit?.by ?? null;
          if (by === e.id) by = null;
          const count = (id: string, field: 'ko' | 'falls'): void => {
            if (findEntity(world, id)?.player === null) return;
            const s = (state.score[id] ??= { ko: 0, falls: 0 });
            s[field]++;
          };
          if (e.player !== null) count(e.id, 'falls');
          if (by !== null && findEntity(world, by)) count(by, 'ko');
          ctx.emit('cantina-out', { room: file.room, entity: e.id, player: e.player, by });
        }
        putBack(ctx, file, state, e);
      }
    }
  },
};
export default system;

function putBack(ctx: StepContext, file: Cantina, state: { pad: number }, e: Entity): void {
  const carried = e.c.carrying ? findEntity(ctx.world, e.c.carrying.id) : undefined;
  if (carried && heldBy(carried) === e.id) release(ctx, carried, 'dropped');
  delete e.c.carrying;
  delete e.c.flying;
  delete e.c.flattened;
  delete e.c.worn;
  delete e.c.beat;
  delete e.c.lastHit;
  const at = padSpot(ctx.content, file, state.pad++, e.kind);
  emitEffect(ctx, e, { kind: 'move', room: file.room, x: at.x, y: at.y });
}
