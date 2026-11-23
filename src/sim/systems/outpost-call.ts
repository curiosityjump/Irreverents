import { canAct } from '../body-state.ts';
import { heldBy } from '../effects.ts';
import { canSee } from '../npc/sight.ts';
import { centre, drive, isOut, seconds } from '../npc/state.ts';
import { heroesIn, outposts, postOf } from '../outpost/state.ts';
import type { Content } from '../../content/types.ts';
import type { Entity, StepContext, System } from '../types.ts';
import { findEntity } from '../world.ts';

/** DRAFT: a walk to the post that has made no headway for this many ticks is given up (there is always a way out). */
const STALLED = 45;

/**
 * An outpost's caller sees a hero, runs to the post and sounds the horn.
 * Runs after Step 4's npc-act (50) and npc-call (55) and overlays the input
 * they wrote, as alert-respond (56) does.
 *
 * INTENT (D-063, D-070): seeing is not calling. A caller who sees a hero
 * walks to the post and has to finish sounding it; only a finished call
 * brings a wave. Knocked out, grabbed, the post broken or no hero left in
 * the room before the end, and nothing was sent.
 * DRAFT (docs/decisions-log.md): this is the outpost's own call. It never
 * calls raiseAlert(): the bad side's horn brings waves, not the good
 * side's area alert (Step 4's npc-call stays good-side only).
 */
const system: System = {
  id: 'outpost-call',
  order: 57,
  tuning: {
    outpostCallReach: { min: 1, max: 200, what: 'how near the post, in pixels across, a caller must stand to sound the horn' },
    outpostZoneEndOn: { min: 0, max: 1, what: 'switch: 1 = with no hero left in the outpost room, a call being sounded stops and queued waves are dropped; 0 = they go on (a control for the scenarios only)' },
  },
  run(ctx) {
    const { world, content } = ctx;
    const { outpostCallReach, outpostZoneEndOn } = content.tuning.world;
    for (const op of outposts(content)) {
      const post = postOf(world, op);
      if (!post) continue;
      const sig = post.c.signaler!;
      const heroes = heroesIn(world, op.room);
      const zoneEnded = heroes.length === 0 && outpostZoneEndOn! >= 1;
      const need = seconds(op.callTime);
      let sounding = 0;
      // Step 7 (DRAFT, `tryAgain`): after any call ends, nobody goes for the horn for callAgain.
      if ((sig.rest ?? 0) > 0) sig.rest = (sig.rest ?? 0) - 1;
      const rest = (): void => {
        if (op.tryAgain) sig.rest = seconds(op.callAgain);
      };
      const stop = (e: Entity, why: string): void => {
        const st = e.c.outpostCall!;
        if (st.phase === 'sounding') ctx.emit('outpost-call-stopped', { by: e.id, outpost: op.id, why });
        st.phase = 'idle';
        st.progress = 0;
        st.stall = 0;
        st.seen = null;
      };
      // Step 7 (DRAFT, `tryAgain`): one caller goes for the horn at a time; the others fight.
      const busy = (): boolean =>
        op.tryAgain && op.callers.some((c) => {
          const p = findEntity(world, c)?.c.outpostCall?.phase;
          return p === 'going' || p === 'sounding';
        });
      for (const id of op.callers) {
        const e = findEntity(world, id);
        if (!e || !e.c.npc || e.room !== op.room) continue;
        const st = (e.c.outpostCall ??= { phase: 'idle', progress: 0, wait: 0, done: false, stall: 0 });
        if (st.done) continue;
        if (isOut(e) || heldBy(e) !== null) {
          // DRAFT (the library leaves it open): a caller stopped by a knock-out or a grab never calls again; they fight instead.
          // Step 7 (DRAFT, docs/decisions-log.md "Step 7: waves"): an outpost with `tryAgain` has them
          // try again after callAgain once up (the wait counts down only while they are up): stopping
          // a caller buys time, it does not end the calls; breaking the post does (D-061).
          const wasCalling = st.phase !== 'idle';
          stop(e, isOut(e) ? 'knocked-out' : 'grabbed');
          if (wasCalling && op.tryAgain) {
            st.wait = seconds(op.callAgain);
            rest();
          } else if (wasCalling) st.done = true;
          continue;
        }
        if (sig.broken) {
          stop(e, 'signaler-broken');
          continue;
        }
        if (zoneEnded) {
          // INTENT (D-061: escape the zone): with no hero left in it, the outpost's call ends.
          stop(e, 'no-hero');
          continue;
        }
        if (!canAct(e)) continue; // flying or in a held beat: the hit carries them; see "left-the-signaler" below.
        if (st.phase === 'idle') {
          if (st.wait > 0) {
            st.wait--;
            continue;
          }
          if ((sig.rest ?? 0) > 0 || busy()) continue;
          if (!heroes.some((h) => canSee(content, e, h))) continue;
          st.phase = 'going';
          st.stall = 0;
          st.seen = null;
        }
        // Step 7 (DRAFT): the caller keeps where they saw a hero, nearest first, on this tick only
        // under canSee (INTENT D-065: this sighting is the only thing a wave is told).
        const sighted = sightOf(content, e, heroes);
        if (sighted) st.seen = sighted;
        const dx = centre(content, post).x - centre(content, e).x;
        if (Math.abs(dx) > outpostCallReach!) {
          if (st.phase === 'sounding') {
            stop(e, 'left-the-signaler');
            continue;
          }
          st.stall = Math.abs(e.vx) < 1 ? st.stall + 1 : 0;
          if (st.stall >= STALLED) {
            // INTENT (there is always a way out): a post they cannot walk to is given up, and nothing is sent.
            stop(e, 'left-the-signaler');
            st.wait = seconds(op.callAgain);
            rest();
            continue;
          }
          drive(e, { x: dx > 0 ? 1 : -1, y: 0, held: [] });
          continue;
        }
        drive(e, { x: 0, y: 0, held: [] });
        if (st.phase === 'going') {
          st.phase = 'sounding';
          st.progress = 0;
          ctx.emit('outpost-call-started', { by: e.id, outpost: op.id });
        }
        st.progress++;
        if (st.progress < need) {
          sounding = Math.max(sounding, st.progress);
          continue;
        }
        st.phase = 'idle';
        st.progress = 0;
        st.wait = seconds(op.callAgain);
        rest();
        // DRAFT (doc 07's suggested default): one wave per finished call. outpost-wave walks it in.
        // Step 7: the wave is told where this caller saw a hero.
        sig.seen = st.seen ?? null;
        st.seen = null;
        sig.queued++;
        ctx.emit('outpost-call-completed', { by: e.id, outpost: op.id });
      }
      sig.sounding = sounding;
      sig.of = need;
    }
  },
};
export default system;

/** The centre of the nearest hero `e` sees on this tick, or null. */
function sightOf(content: Content, e: Entity, heroes: Entity[]): { x: number; y: number } | null {
  const me = centre(content, e);
  let best: { x: number; y: number } | null = null;
  for (const h of heroes) {
    if (!canSee(content, e, h)) continue;
    const c = centre(content, h);
    if (!best || Math.abs(c.x - me.x) < Math.abs(best.x - me.x)) best = c;
  }
  return best;
}
