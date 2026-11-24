import { moveLoose } from '../loose-fall.ts';
import type { System } from '../types.ts';
import { looseBox, weaponWorld } from '../weapons.ts';

/**
 * A loose weapon (no body: src/sim/weapons.ts, WEAPON_KIND) falls, bounces
 * and slides to rest by the orb's own small physics (src/sim/loose-fall.ts,
 * the same numbers), for its weapon's box (Step 23; docs/mechanisms/weapons.md).
 * The server's world and a scenario's only.
 * Runs after the sources (546), so one stood this tick rests where it stands.
 */
const system: System = {
  id: 'weapon-move',
  order: 547,
  run(ctx) {
    const { world, content } = ctx;
    if (!weaponWorld(world)) return;
    for (const e of world.entities) {
      if (!e.c.loose) continue;
      const b = looseBox(content, e);
      moveLoose(ctx, e, b.w, b.h);
    }
  },
};
export default system;
