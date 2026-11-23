import { centre, isOut } from '../npc/state.ts';
import type { System } from '../types.ts';

/**
 * A chasing guard follows a hero they SAW leave through a door. Runs after
 * `room-doors` (600), which emits `changed-room`.
 *
 * INTENT (D-077): "a level transition never automatically resets pursuit,
 * and guards may follow between regions."
 * INTENT (D-065, not psychic): only a responder who had that hero in sight
 * on the very tick they left (`c.respond.sight`, written by alert-respond
 * before the door acted) learns which door it was. One who did not see
 * them leave is told nothing, and goes on searching where they are
 * (scenario step4-leaves-unseen-guard-stays).
 */
const system: System = {
  id: 'alert-follow',
  order: 605,
  run(ctx) {
    for (const ev of ctx.events) {
      if (ev.type !== 'changed-room') continue;
      for (const e of ctx.world.entities) {
        const r = e.c.respond;
        if (!r || isOut(e)) continue;
        if (ev.entity === e.id) {
          // Through. Whoever they followed is not in sight yet: search from where they came out.
          r.door = null;
          r.sight = null;
          r.x = centre(ctx.content, e).x;
          r.phase = 'search';
          r.stall = 0;
        } else if (ev.player !== null && e.room === ev.fromRoom && r.sight === ev.entity) {
          r.door = ev.fromDoor;
          r.phase = 'chase';
          r.stall = 0;
        }
      }
    }
  },
};
export default system;
