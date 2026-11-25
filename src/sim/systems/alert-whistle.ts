import { heldBy } from '../effects.ts';
import { alertLevel, completeCall, sameTown } from '../npc/alert.ts';
import { canSee } from '../npc/sight.ts';
import { findEntity } from '../world.ts';
import { centre, drive, isOut, npcKind, seconds } from '../npc/state.ts';
import { doorToward } from '../room-routes.ts';
import { askForDoor } from './room-doors.ts';
import type { Content } from '../../content/types.ts';
import type { Door } from '../../content/kinds/rooms.ts';
import type { Entity, StepContext, System } from '../types.ts';

/**
 * A guard on duty who sees a hero do something more blows his whistle
 * (Step 4, the town's tiers). Runs after alert-respond (56) and overlays the
 * input it wrote: while he blows he stands and does not swing.
 *
 * Fixed states, no choosing (D-055: NPC response logic):
 * - **Who, when:** a good person answering a call (`c.respond`), in its
 *   `chase` phase (a hero in sight), or a guard in a rage while his area's
 *   alert is up with a hero who offended him in sight; whose home area has a dispatch file
 *   (content/dispatch/), who is standing on his feet, and whose dissonance
 *   is above what he last reported: the same rule as the bell's
 *   (npc-call.ts, "one call per thing witnessed"), for someone on duty.
 *   Seeing alone adds no dissonance, so a hero who only stands in view is
 *   never whistled at (D-063: seeing is not calling).
 * - **Blowing** takes `npcWhistleTime` under a gauge (`c.whistle.progress`).
 * - **Stopping it (D-066, "calls/signalers are INTERCEPTABLE"):** knocked
 *   out, grabbed or carried, or knocked off his feet (a hit, a throw, a body
 *   thrown into him: anything that leaves him unable to act) before the end,
 *   and nothing is sent: `call-stopped`. He may start again after
 *   `npcWhistleAgain`, once he is up and still has cause.
 * - **Finishing it** is a completed call like the bell's: `call-started`,
 *   `call-completed`, and the one raise, through completeCall().
 *
 * INTENT (D-063): only a finished whistle is a call. A whistle that finishes
 * at once, or one that raises anything before its end, is the bug.
 * DRAFT (docs/decisions-log.md, "Step 4: whistle"): doc 27's whistle is "a
 * suggested reconciliation, not a new owner-approved implementation"; that a
 * guard whistles at all, what stops it and every number are first guesses.
 * A follower who blows in another room raises his home area's alert; the
 * place reported is the home room's door toward where he is. In a room of
 * his home's town with its own table (the castle town's), he reports that
 * room instead, where he saw it (the escalating guard response, push 2).
 */
function stop(ctx: StepContext, e: Entity, why: string): void {
  const w = e.c.whistle;
  if (!w || w.progress === 0) return;
  ctx.emit('call-stopped', { by: e.id, why });
  w.progress = 0;
  w.reported = e.c.npc?.dissonance ?? w.reported;
  w.wait = seconds(ctx.content.tuning.world.npcWhistleAgain!);
}

/** Why a body cannot blow now, or null when it can. */
function cannotBlow(e: Entity): string | null {
  if (isOut(e)) return 'knocked-out';
  if (heldBy(e) !== null) return 'grabbed';
  if (e.c.flying || e.c.beat) return 'knocked-down';
  return null;
}

/** The middle of a door of a room, in that room's pixels (feet height). */
function doorPlace(content: Content, roomId: string, door: Door): { x: number; y: number } {
  const T = content.rooms[roomId]?.tile ?? 16;
  return { x: (door.tx + door.w / 2) * T, y: (door.ty + door.h) * T - 14 };
}

const system: System = {
  id: 'alert-whistle',
  order: 57,
  tuning: {
    npcWhistleTime: { min: 0.1, max: 600, what: 'seconds a guard on duty blows his whistle before the call is sent (the window to stop him)' },
    npcWhistleAgain: { min: 0, max: 600, what: 'seconds a guard waits, after a whistle was stopped or sent, before he may blow again' },
  },
  run(ctx) {
    const { world, content } = ctx;
    const need = seconds(content.tuning.world.npcWhistleTime!);
    for (const e of world.entities) {
      const n = e.c.npc;
      const r = e.c.respond;
      if (!n) continue;
      const w = e.c.whistle;
      const why = cannotBlow(e);
      if (why !== null) {
        if (w) stop(ctx, e, why);
        continue;
      }
      if (w && w.wait > 0) w.wait--;
      const kind = npcKind(content, e);
      // The alert over (alert-respond has taken them off duty), or not one who whistles: nothing.
      // A follower away from home whistles too, if there is a way home to report (below).
      // DRAFT (the escalating guard response, push 2, "the row comes to the room the report names"): away from home
      // in a room of the same town with its own table (content/dispatch/, `town`), he reports the room he is in.
      const here = e.room !== n.home && !!content.dispatch?.[e.room] && sameTown(content, n.home, e.room);
      const wayHome = e.room === n.home || here ? null : doorToward(content, n.home, e.room);
      // On duty: answering a call (`c.respond`), or a guard in a rage while his area's alert is up (the one
      // who rang the bell himself is no responder, but he is just as much after you).
      // DRAFT (docs/decisions-log.md, "Step 4: whistle"): the second half, found by tracing e2e's fight-back.
      const raging = !r && kind?.role === 'guard' && n.mood === 3 && alertLevel(world, n.home) > 0;
      // A raging guard put out of his area (a blow, a throw) while its alert is up, with nobody who offended
      // him in sight: back by the door toward home, where he can see the hero and call again.
      // DRAFT (docs/decisions-log.md, "Step 4: whistle", the re-land): measured on a phone script, a blow that sent
      // him out by the courtyard door left him there until the alert cooled, so the street never escalated.
      // A responder is alert-respond's (D-077: he searches where the chase led); this is only the one who called.
      if (raging && e.room !== n.home && kind?.side === 'good' && content.dispatch?.[n.home]) {
        const seesOffender = n.offenders.some((id) => { const h = findEntity(world, id); return h?.player != null && canSee(content, e, h); });
        const home = doorToward(content, e.room, n.home);
        const room = content.rooms[e.room];
        if (!seesOffender && home && room) {
          if (w) stop(ctx, e, 'stood-down');
          const T = room.tile;
          const dx = (home.tx + home.w / 2) * T - centre(content, e).x;
          drive(e, { x: dx > 0 ? 1 : -1, y: 0, held: [] });
          if (home.use === 'enter' && Math.abs(dx) <= (home.w * T) / 2) askForDoor(e);
          continue;
        }
      }
      if ((!r && !raging) || !kind || kind.side !== 'good' || !content.dispatch?.[n.home] || (e.room !== n.home && !wayHome && !here)) {
        if (w) {
          stop(ctx, e, 'stood-down');
          w.reported = n.dissonance;
        }
        continue;
      }
      if (!w) {
        // Just come on duty: what he had witnessed before he was called is already reported (by whoever called him).
        e.c.whistle = { progress: 0, of: need, wait: 0, reported: n.dissonance };
        continue;
      }
      if (w.progress === 0) {
        // Chasing: a responder in his chase phase, or a raging guard with a hero who offended him in sight.
        const chasing = r ? r.phase === 'chase' : n.offenders.some((id) => { const h = findEntity(world, id); return h?.player != null && canSee(content, e, h); });
        if (!chasing || w.wait > 0 || n.dissonance <= w.reported) continue;
        ctx.emit('call-started', { by: e.id });
      }
      const blow = w;
      drive(e, { x: 0, y: 0, held: [] });
      blow.progress++;
      blow.of = need;
      if (blow.progress < need) continue;
      // Sent. The place reported is where he last saw what upset him; from another room, the
      // home room's door toward that room.
      // DRAFT (docs/decisions-log.md, "Step 4: whistle"): help from home comes to the door the chase
      // went out by and searches there; it learns which way, not where (D-065).
      // Reporting the room he is in, away from home: where he is chasing (c.respond.x, always this room's: alert-follow
      // resets it at a door), since his lastSeen may be from the room before.
      const at = here ? { x: r?.x ?? centre(content, e).x, y: centre(content, e).y } : wayHome ? doorPlace(content, n.home, wayHome) : (n.lastSeen ?? centre(content, e));
      blow.progress = 0;
      blow.reported = n.dissonance;
      blow.wait = seconds(content.tuning.world.npcWhistleAgain!);
      completeCall(ctx, e.id, here ? e.room : n.home, at);
    }
  },
};
export default system;
