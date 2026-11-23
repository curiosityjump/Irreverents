import { alertLevel } from '../npc/alert.ts';
import { canSee } from '../npc/sight.ts';
import { centre, drive, isOut, npcKind, placementOf, setMood } from '../npc/state.ts';
import type { Entity, Input, StepContext, System } from '../types.ts';

/** DRAFT: the role that answers a call. More roles: make this a field of content/npcs/. */
const RESPONDER_ROLE = 'guard';
/** How close, in pixels, counts as having arrived. */
const ARRIVED = 2;
/** DRAFT: a walk that has made no headway for this many ticks (a wall, a ledge) is given up. */
const STALLED = 45;

const IDLE: Input = { x: 0, y: 0, held: [] };
const walk = (dx: number): Input => ({ x: dx > 0 ? 1 : -1, y: 0, held: [] });

/** Walks toward x. True once there, or once a wall has stopped the walk for long enough. */
function arrive(e: Entity, dx: number, within: number): boolean {
  const r = e.c.respond!;
  if (Math.abs(dx) <= within) {
    r.stall = 0;
    return true;
  }
  r.stall = Math.abs(e.vx) < 1 ? r.stall + 1 : 0;
  if (r.stall >= STALLED) {
    r.stall = 0;
    return true;
  }
  drive(e, walk(dx));
  return false;
}

/**
 * Help comes to the place that was reported. On a completed call every
 * guard of the caller's side in the area walks to the reported place and
 * searches around it for as long as the alert is above 0; one who sees a
 * hero chases to where it last saw them; at alert 0 they walk back to
 * their post and their routine. Overlays `c.input` after `npc-act` (50)
 * and `npc-call` (55); never sets a body's speed.
 *
 * INTENT (D-065, help is not psychic): the only place a hero's position is
 * read is under `canSee(...)` on this same tick. Everything else steers by
 * `c.respond.x`, the reported place or the last place a hero was SEEN.
 * "Chase the nearest player" is the natural code and it is the bug
 * (scenario step4-call-brings-help is the check).
 * INTENT (D-063): seeing a hero changes this guard's mood and where they
 * walk. It never touches the alert number.
 */
const system: System = {
  id: 'alert-respond',
  order: 56,
  tuning: {
    npcSearchRange: { min: 0, max: 2000, what: 'how far either side of the reported place, in pixels, a responder paces while searching' },
  },
  run(ctx) {
    const { world, content } = ctx;
    const { npcSearchRange, npcChargeReach } = content.tuning.world;

    for (const ev of ctx.events) {
      if (ev.type !== 'call-completed') continue;
      const callerSide = npcKind(content, world.entities.find((e) => e.id === ev.by)!)?.side;
      for (const e of world.entities) {
        const kind = npcKind(content, e);
        if (!kind || e.room !== ev.area || e.id === ev.by || kind.role !== RESPONDER_ROLE || kind.side !== callerSide) continue;
        // Someone already chasing a hero they have seen keeps their own, fresher, lead.
        if (e.c.respond?.phase === 'chase') continue;
        e.c.respond = { phase: 'go', x: ev.x, dir: 1, stall: 0 };
        // DRAFT: a responder is in mood 2 from the moment they are called.
        if (e.c.npc!.mood === 1) setMood(ctx, e, 2, 'called');
      }
    }

    for (const e of world.entities) {
      const r = e.c.respond;
      const n = e.c.npc;
      if (!r || !n || isOut(e)) continue;
      const me = centre(content, e).x;

      if (alertLevel(world, e.room) === 0) {
        // The alert is over: back to the post, then the routine from its top.
        r.phase = 'return';
        const place = placementOf(content, e);
        const room = content.rooms[e.room];
        const post = place && room ? place.tile[0] * room.tile + room.tile / 2 : me;
        n.quiet = 0;
        if (!arrive(e, post - me, ARRIVED)) continue;
        delete e.c.respond;
        if (n.mood === 1) {
          n.step = 0;
          n.stepTicks = 0;
          n.stall = 0;
        } else setMood(ctx, e, 1, 'stood-down');
        continue;
      }

      // Held in mood 2 (or 3) for as long as the alert lasts: distress does not fade on duty.
      n.quiet = 0;
      const seen = world.entities.find((h) => h.player !== null && canSee(content, e, h));
      if (seen) {
        r.phase = 'chase';
        r.x = centre(content, seen).x;
        // DRAFT: a responder who has seen a hero while the alert is above 0 is in mood 3.
        if (n.mood !== 3) setMood(ctx, e, 3, 'pursuit');
        const dx = r.x - me;
        if (Math.abs(dx) > npcChargeReach!) drive(e, walk(dx));
        else drive(e, content.characters[e.kind]?.verbs.includes('attack') ? { x: 0, y: 0, held: ['attack'] } : IDLE);
        continue;
      }

      if (r.phase !== 'search') {
        // To the reported place, or to where a hero was last seen.
        if (arrive(e, r.x - me, ARRIVED)) r.phase = 'search';
        continue;
      }
      // DRAFT: searching is pacing either side of that place, looking the way they walk.
      if (arrive(e, r.x + r.dir * npcSearchRange! - me, ARRIVED)) r.dir = r.dir === 1 ? -1 : 1;
    }
  },
};
export default system;
