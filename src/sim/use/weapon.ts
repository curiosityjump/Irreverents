import { canAct, overlaps } from '../body-state.ts';
import type { Entity } from '../types.ts';
import type { UseEntry } from '../use.ts';
import { canHold, looseBox } from '../weapons.ts';

/**
 * Use beside a loose weapon picks it up (Step 23; docs/mechanisms/weapons.md;
 * systems/weapon-take.ts acts): a played hero with hands who can act and
 * carries no body, touching a loose weapon (its box widened by
 * weaponPickupReach) that may be picked up now. The nearest one, by middles.
 * The word is "pick-up", or "swap" when the hand is already full.
 * DRAFT: order 90, before a thing's 100, so a weapon lying beside a counter
 * can still be picked up; the door's 0 still wins.
 */
const entry: UseEntry = {
  id: 'weapon',
  order: 90,
  find(world, content, e) {
    if (e.player === null || !canAct(e) || e.c.carrying || !canHold(content, e)) return undefined;
    const box = content.characters[e.kind]?.box;
    if (!box) return undefined;
    const reach = content.tuning.world.weaponPickupReach ?? 6;
    const mid = e.x + box.w / 2;
    let best: Entity | undefined;
    let bestGap = Infinity;
    for (const o of world.entities) {
      const l = o.c.loose;
      if (!l || o.room !== e.room || world.tick < l.until || !content.weapons?.[l.weapon]) continue;
      const b = looseBox(content, o);
      if (!overlaps(e.x, e.y, box.w, box.h, o.x - reach, o.y - reach, b.w + 2 * reach, b.h + 2 * reach)) continue;
      // Entities are in id order, so between two equally near weapons the lower id wins on every device.
      const gap = Math.abs(o.x + b.w / 2 - mid);
      if (gap < bestGap) [best, bestGap] = [o, gap];
    }
    if (!best) return undefined;
    const b = looseBox(content, best);
    return { entry: 'weapon', word: e.c.weapon ? 'swap' : 'pick-up', target: best.id, at: { x: best.x + b.w / 2, y: best.y - 4 } };
  },
};
export default entry;
