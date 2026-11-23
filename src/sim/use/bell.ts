import type { UseEntry } from '../use.ts';
import { byBell } from '../cantina.ts';

/**
 * Use by the cantina's bell rings it (systems/cantina-brawl.ts acts: it
 * ends a brawl at once, the way out). Any cantina whose room this body is
 * in; content.cantina, by id order.
 */
const entry: UseEntry = {
  id: 'bell',
  order: 200,
  find(_world, content, e) {
    for (const id of Object.keys(content.cantina ?? {}).sort()) {
      const file = content.cantina[id]!;
      if (file.room !== e.room || !byBell(content, file, e)) continue;
      const T = content.rooms[file.room]!.tile;
      const [tx, ty] = file.bell.tile;
      return { entry: 'bell', word: 'ring', at: { x: (tx + 0.5) * T, y: ty * T } };
    }
    return undefined;
  },
};
export default entry;
