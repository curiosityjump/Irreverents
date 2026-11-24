import { emitEffect, heldBy } from '../effects.ts';
import type { System } from '../types.ts';

/**
 * Power sources (Step 9, D-080: very rare powers live in one or few spots
 * you can return to; docs/mechanisms/powers.md). A source is a bodiless
 * entity (`~source:<id>`, src/sim/powers.ts) standing on its tile. It is lit
 * while nobody holds its power taken from it and no orb of it lies loose. A
 * played hero holding no power whose middle stands over the lit source's
 * tile takes it: the effect `power` (with `src`), the event `power-taken`,
 * and the source's id joins `world.sources` (found, for good: D-082).
 * DRAFT: touch to take, the middle over the tile (so a hero walking past at
 * the next tile does not take it by a pixel), and it lights again as soon as
 * the power is gone (a holder knocked loose and the orb faded, or left the game).
 * In a page's own world there are no sources, so it does nothing there.
 * Runs after power-take (545), so an orb taken this tick no longer counts.
 */
const system: System = {
  id: 'power-sources',
  order: 546,
  run(ctx) {
    const { world, content } = ctx;
    for (const src of world.entities) {
      const s = src.c.source;
      if (!s) continue;
      const out = world.entities.some((e) => e.c.power?.src === s.id || e.c.orb?.src === s.id);
      s.lit = !out;
      if (!s.lit) continue;
      const room = content.rooms[src.room];
      if (!room) continue;
      const T = room.tile;
      for (const h of world.entities) {
        if (h.player === null || h.room !== src.room || h.c.power || h.c.flattened || heldBy(h) !== null) continue;
        const box = content.characters[h.kind]?.box;
        if (!box) continue;
        const mid = h.x + box.w / 2;
        if (mid < src.x || mid >= src.x + T || h.y + box.h <= src.y || h.y >= src.y + T) continue;
        emitEffect(ctx, h, { kind: 'power', power: s.power, src: s.id });
        ctx.emit('power-taken', { entity: h.id, player: h.player, power: s.power, from: null, src: s.id });
        const found = world.sources ?? [];
        if (!found.includes(s.id)) world.sources = [...found, s.id];
        s.lit = false;
        break;
      }
    }
  },
};
export default system;
