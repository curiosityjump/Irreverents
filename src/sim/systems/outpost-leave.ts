import { canAct, release } from '../body-state.ts';
import { heldBy } from '../effects.ts';
import { centre, drive, isOut, seconds } from '../npc/state.ts';
import { outposts } from '../outpost/state.ts';
import type { System } from '../types.ts';
import { findEntity, removeEntity } from '../world.ts';

/** DRAFT: how near (pixels across) the entry's middle a leaving person must come to be gone. */
const THERE = 6;
/** DRAFT: ticks with no headway before a leaving person is gone where they stand (there is always a way out). */
const STALLED = 90;

/**
 * Step 7 (DRAFT, docs/decisions-log.md "Step 7: waves"): beaten waves walk
 * off, so the next can come. A person who walked in with a wave of an
 * outpost with `leaveCold` or `leaveIdle` and has lain out cold that long in
 * all, or stood with nobody to fight that long in a row, walks back to the
 * entry once up and is gone there.
 *
 * INTENT (doc 24, "bounded crowds"; outpost-wave): the cap on bodies stays,
 * and a leaving person counts against it until gone. INTENT (doc 24: "the
 * system must never impose an arbitrary maximum wave count"): this is what
 * keeps the waves coming under the cap in a long fight. Placed people never
 * leave; only a wave's. Runs after outpost-fight (58) and outpost-wave (59)
 * and overlays the input they wrote.
 */
const system: System = {
  id: 'outpost-leave',
  order: 61,
  run(ctx) {
    const { world, content } = ctx;
    for (const op of outposts(content)) {
      if (op.leaveCold <= 0 && op.leaveIdle <= 0) continue;
      const [tx] = op.entry;
      const room = content.rooms[op.room];
      const tile = room?.tile ?? 16;
      const entryX = (tx + 0.5) * tile;
      const gone: string[] = [];
      for (const e of world.entities) {
        const w = e.c.outpostWave;
        if (!w || w.outpost !== op.id || e.room !== op.room || e.player !== null) continue;
        if (isOut(e)) {
          w.cold++;
          if (op.leaveCold > 0 && w.cold >= seconds(op.leaveCold) && !w.going) {
            w.going = true;
            w.idle = 0;
          }
          continue;
        }
        if (!w.going) {
          // Nobody to fight: no hero seen and no place to go (outpost-fight cleared it on arriving).
          w.idle = e.c.outpostFight ? 0 : w.idle + 1;
          if (op.leaveIdle <= 0 || w.idle < seconds(op.leaveIdle)) continue;
          w.going = true;
          w.idle = 0;
        }
        if (!canAct(e)) continue; // held, flying or in a beat: whatever has them carries them.
        // The entry this person walked in at (the owner's "from the sides", 2026-11-24); older ones, the outpost's entry.
        const dx = (w.from ? (w.from[0] + 0.5) * tile : entryX) - centre(content, e).x;
        if (Math.abs(dx) <= THERE) {
          gone.push(e.id);
          continue;
        }
        // While going, `idle` counts ticks with no headway.
        w.idle = Math.abs(e.vx) < 1 ? w.idle + 1 : 0;
        if (w.idle >= STALLED) {
          gone.push(e.id);
          continue;
        }
        e.c.outpostFight = null;
        drive(e, { x: dx > 0 ? 1 : -1, y: 0, held: [] });
      }
      for (const id of gone) {
        const e = findEntity(world, id);
        if (!e) continue;
        const carried = e.c.carrying ? findEntity(world, e.c.carrying.id) : undefined;
        if (carried && heldBy(carried) === e.id) release(ctx, carried, 'dropped');
        removeEntity(world, id);
        ctx.emit('outpost-left', { outpost: op.id, entity: id });
      }
    }
  },
};
export default system;

declare module '../types.ts' {
  interface EventMap {
    /** Step 7: a wave's person walked back off at the entry and is gone. */
    'outpost-left': { outpost: string; entity: string };
  }
}
