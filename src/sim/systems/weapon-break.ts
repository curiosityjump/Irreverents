import { BREAKABLE, breakPart } from '../room-parts.ts';
import { partState } from '../room-state.ts';
import { numbersOf } from '../powers.ts';
import type { System } from '../types.ts';
import { findEntity } from '../world.ts';
import { weaponOf, weaponWorld } from '../weapons.ts';

/**
 * A weapon swung at a wall (Step 23; docs/mechanisms/weapons.md): when a
 * holder's strike starts (`attacked`, verbs/attack.ts), every breakable part
 * (room-breakable) with a tile in the swing's reach in front, the body's
 * height, breaks if its own breakSpeed (or world.wallBreakSpeed) is at most
 * the weapon's `breaks`. The hammer's 250 breaks a cracked wall (200), a
 * fence (200) or a stall (150), not the camp's barricade (300); the sword's
 * 0 breaks nothing by itself.
 * DRAFT: by the swing's reach (the holder's attackReach with the weapon),
 * from the body's middle as the swing's own test.
 * Runs after the verbs (100), which emit `attacked`.
 */
const system: System = {
  id: 'weapon-break',
  order: 106,
  run(ctx) {
    const { world, content } = ctx;
    if (!weaponWorld(world)) return;
    for (const ev of ctx.events) {
      if (ev.type !== 'attacked') continue;
      const e = findEntity(world, ev.by);
      const w = e && weaponOf(content, e);
      const box = e && content.characters[e.kind]?.box;
      const room = e && content.rooms[e.room];
      if (!e || !w || !box || !room || w.breaks <= 0) continue;
      const reach = numbersOf(content, e).attackReach ?? 0;
      const T = room.tile;
      const x0 = e.facing > 0 ? e.x + box.w / 2 : e.x - reach;
      const x1 = e.facing > 0 ? e.x + box.w + reach : e.x + box.w / 2;
      const tx0 = Math.floor(x0 / T);
      const tx1 = Math.floor((x1 - 1e-6) / T);
      const ty0 = Math.floor(e.y / T);
      const ty1 = Math.floor((e.y + box.h - 1e-6) / T);
      for (const part of room.parts) {
        if (part.kind !== BREAKABLE || partState(world, room.id, part.id).broken) continue;
        if (!part.tiles.some((t) => t.tx >= tx0 && t.tx <= tx1 && t.ty >= ty0 && t.ty <= ty1)) continue;
        const limit = typeof part.params.breakSpeed === 'number' ? part.params.breakSpeed : (content.tuning.world.wallBreakSpeed ?? 200);
        if (limit <= w.breaks) breakPart(ctx, room, part, e, w.breaks);
      }
    }
  },
};
export default system;
