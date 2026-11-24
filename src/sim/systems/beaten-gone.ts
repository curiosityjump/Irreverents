import { release } from '../body-state.ts';
import { goneId } from '../beaten.ts';
import { heldBy } from '../effects.ts';
import { centre, placementOf, THING_KIND } from '../npc/state.ts';
import type { System } from '../types.ts';
import { knockLoose, weaponOf } from '../weapons.ts';
import { addEntity, findEntity, removeEntity } from '../world.ts';

/**
 * Step 5 (DRAFT, docs/decisions-log.md "Beaten for good"): a defeated bad guy
 * (beaten-mark) lies world.beatenLieTime once he has stopped flying, never
 * getting up, then is gone where he lies: `defeated-gone`, which every page
 * draws as the cut `fx-poof` (src/client/draw/beaten.ts). A placed one leaves
 * a bodiless `~beaten:<id>` record so beaten-return can put him back; a
 * wave's or a dispatch row's arrival leaves nothing (the next wave is the
 * camp's answer). Whatever he carried, and a weapon still in hand, is dropped first.
 * After beaten-mark (530); before the Hall (970), which only reads events.
 */
const system: System = {
  id: 'beaten-gone',
  order: 535,
  run(ctx) {
    const { world, content } = ctx;
    const gone: string[] = [];
    for (const e of world.entities) {
      const b = e.c.beaten;
      if (!b) continue;
      // INTENT: a defeated body never gets up: its knock-out outlasts the lie.
      if (e.c.flattened) e.c.flattened.ticksLeft = Math.max(e.c.flattened.ticksLeft, b.ticks + 2);
      else e.c.flattened = { ticksLeft: b.ticks + 2, by: b.by };
      if (e.c.flying || e.c.beat || heldBy(e) !== null) continue;
      if (b.ticks > 0) {
        b.ticks--;
        continue;
      }
      gone.push(e.id);
    }
    for (const id of gone) {
      const e = findEntity(world, id);
      if (!e) continue;
      const carried = e.c.carrying ? findEntity(world, e.c.carrying.id) : undefined;
      if (carried && heldBy(carried) === e.id) release(ctx, carried, 'dropped');
      // Step 23: a weapon still in hand drops where he lay (being laid flat usually knocked it loose already).
      if (weaponOf(content, e)) knockLoose(ctx, e, null);
      const at = centre(content, e);
      const placed = !e.c.outpostWave && !e.c.arrival ? placementOf(content, e) : undefined;
      removeEntity(world, id);
      if (placed && e.c.npc && !findEntity(world, goneId(id))) {
        addEntity(world, { id: goneId(id), kind: THING_KIND, player: null, room: e.c.npc.home, x: 0, y: 0, vx: 0, vy: 0, facing: 1, onGround: true, c: { beatenGone: { id, room: e.c.npc.home, empty: 0 } } });
      }
      ctx.emit('defeated-gone', { target: id, room: e.room, x: Math.round(at.x), y: Math.round(at.y) });
    }
  },
};
export default system;
