import { heldBy } from '../effects.ts';
import { completeCall } from '../npc/alert.ts';
import { centre, drive, isOut, npcKind, seconds } from '../npc/state.ts';
import type { Entity, StepContext, System } from '../types.ts';

/**
 * A guard on duty who sees a hero do something more blows his whistle
 * (Step 4, the town's tiers). Runs after alert-respond (56) and overlays the
 * input it wrote: while he blows he stands and does not swing.
 *
 * Fixed states, no choosing (D-055: NPC response logic):
 * - **Who, when:** a good person answering a call (`c.respond`), in its
 *   `chase` phase (a hero in sight), whose home area has a dispatch file
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
 * DRAFT: push 1 whistles only in his own area; a follower who blows in
 * another room is push 2's.
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
      if (!r || !kind || kind.side !== 'good' || !content.dispatch?.[n.home] || e.room !== n.home) {
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
        if (r.phase !== 'chase' || w.wait > 0 || n.dissonance <= w.reported) continue;
        ctx.emit('call-started', { by: e.id });
      }
      const blow = w;
      drive(e, { x: 0, y: 0, held: [] });
      blow.progress++;
      blow.of = need;
      if (blow.progress < need) continue;
      // Sent. The place reported is where he last saw what upset him.
      const at = n.lastSeen ?? centre(content, e);
      blow.progress = 0;
      blow.reported = n.dissonance;
      blow.wait = seconds(content.tuning.world.npcWhistleAgain!);
      completeCall(ctx, e.id, n.home, at);
    }
  },
};
export default system;
