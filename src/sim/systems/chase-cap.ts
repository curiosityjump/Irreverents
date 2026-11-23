import { centre, isOut } from '../npc/state.ts';
import type { System } from '../types.ts';

/**
 * Only a few guards follow a hero through one door. Runs after
 * `alert-follow` (605), which gives every responder who saw the hero leave
 * `c.respond.door`; this keeps the door for the nearest `chaseCrossCap` of
 * them (ties by id) and sends the rest back to searching where they stand.
 *
 * DRAFT (Step 12 slice B, docs/decisions-log.md): 2 cross. The camp is the
 * other side of a doorway; a whole street's watch pouring in would empty the
 * town and swamp the camp's bound. Per hero per door: a hero who comes back
 * out and goes in again is a new chase.
 * INTENT (D-065, not psychic): those held back learn nothing more than what
 * they saw; they search where they are, as one who never saw the hero leave
 * does (alert-respond's search, around `c.respond.x`).
 */
const system: System = {
  id: 'chase-cap',
  order: 606,
  tuning: {
    chaseCrossCap: { min: 0, max: 99, what: 'how many responders follow a hero through one door they saw them leave by (the rest search where they are)' },
  },
  run(ctx) {
    const { world, content } = ctx;
    const cap = content.tuning.world.chaseCrossCap!;
    for (const ev of ctx.events) {
      if (ev.type !== 'changed-room' || ev.player === null) continue;
      const room = content.rooms[ev.fromRoom];
      const door = room?.doors.find((d) => d.id === ev.fromDoor);
      if (!room || !door) continue;
      const doorX = (door.tx + door.w / 2) * room.tile;
      const following = world.entities
        .filter((e) => e.room === ev.fromRoom && !isOut(e) && e.c.respond?.door === ev.fromDoor && e.c.respond.sight === ev.entity)
        .map((e) => ({ e, d: Math.abs(centre(content, e).x - doorX) }))
        .sort((a, b) => a.d - b.d || (a.e.id < b.e.id ? -1 : a.e.id > b.e.id ? 1 : 0));
      for (const { e } of following.slice(Math.max(0, Math.floor(cap)))) {
        const r = e.c.respond!;
        r.door = null;
        r.x = centre(content, e).x;
        r.phase = 'search';
        r.stall = 0;
      }
    }
  },
};
export default system;
