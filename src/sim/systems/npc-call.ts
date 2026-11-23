import { alertOf, raiseAlert } from '../npc/alert.ts';
import { canSee } from '../npc/sight.ts';
import { centre, drive, isOut, npcKind, seconds, thingDef } from '../npc/state.ts';
import type { Entity, StepContext, System } from '../types.ts';
import { findEntity } from '../world.ts';

/** DRAFT: a walk to the bell that has made no headway for this many ticks is given up (there is always a way out). */
const STALLED = 45;

function stop(ctx: StepContext, e: Entity, why: string): void {
  const call = e.c.call;
  if (!call) return;
  if (call.progress > 0) {
    ctx.emit('call-stopped', { by: e.id, why });
    const bell = call.bell === null ? undefined : findEntity(ctx.world, call.bell);
    if (bell) delete bell.c.ringing;
  }
  call.progress = 0;
  call.bell = null;
}

/** The nearest working bell of this side in the person's room, or none. Entities are in id order, so ties fall the same way everywhere. */
function nearestBell(ctx: StepContext, e: Entity, side: string): Entity | undefined {
  const me = centre(ctx.content, e).x;
  let best: Entity | undefined;
  let bestDist = Infinity;
  for (const t of ctx.world.entities) {
    if (!t.c.thing || t.c.thing.takenBy !== null || t.room !== e.room) continue;
    const def = thingDef(ctx.content, t);
    if (def?.look !== 'bell' || (def.side ?? 'good') !== side) continue;
    const dist = Math.abs(centre(ctx.content, t).x - me);
    if (dist < bestDist) {
      best = t;
      bestDist = dist;
    }
  }
  return best;
}

/**
 * An upset witness goes and calls for help. Runs after `npc-act` (50) and
 * overlays the input it wrote: pleading and charging stay slice 1's
 * behaviours; this only takes over for the walk to the bell and the ringing.
 *
 * INTENT (D-066): a call is a real act that can be stopped. The caller walks
 * to a call point, starts, and has to finish: knocked out, the bell broken,
 * or calmed back to business as usual before the end, and nothing was sent.
 * INTENT (D-066): a sent call is not unsent. Nothing here ever lowers an alert.
 */
const system: System = {
  id: 'npc-call',
  order: 55,
  tuning: {
    npcPleadTime: { min: 0, max: 600, what: 'seconds a distressed person pleads before walking off to call for help: the window to make it right' },
    npcCallTime: { min: 0.1, max: 600, what: 'seconds a call for help takes, standing at the bell, before it is sent' },
    npcCallReach: { min: 1, max: 200, what: 'how near a bell, in pixels across, a person must stand to ring it' },
  },
  run(ctx) {
    const { world, content } = ctx;
    const { npcPleadTime, npcCallTime, npcCallReach } = content.tuning.world;
    for (const e of world.entities) {
      const n = e.c.npc;
      const kind = npcKind(content, e);
      if (!n || !kind) continue;
      if (isOut(e)) {
        stop(ctx, e, 'knocked-out');
        continue;
      }
      // INTENT (D-064, D-071): a good person in mood 2 or 3 may call, never in mood 1.
      // INTENT (D-072): the reassured merchant "stops trying to call".
      if (n.mood === 1) {
        stop(ctx, e, 'calmed');
        delete e.c.call;
        continue;
      }
      // DRAFT: the villain calling at his own horn (D-070) and a struck guard whistling are not built; someone answering a call does not make one.
      if (kind.side !== 'good' || e.c.respond) continue;
      // DRAFT (docs/decisions-log.md): a report names the heroes, so only someone upset by a hero goes to call.
      if (!n.offenders.some((id) => findEntity(world, id)?.player != null)) continue;

      const call = (e.c.call ??= { plead: 0, progress: 0, bell: null, stall: 0, reported: 0 });
      // One call per thing witnessed: having sent one, they go again only when they have seen something more.
      if (n.dissonance <= call.reported) continue;
      if (call.progress === 0) {
        // DRAFT: mood 2 pleads first; mood 3 charges while an offender is in sight and goes to call when none is.
        if (n.mood === 2 && ++call.plead < seconds(npcPleadTime!)) continue;
        if (n.mood === 3 && n.offenders.some((id) => { const who = findEntity(world, id); return who !== undefined && canSee(content, e, who); })) continue;
      }

      const bell = call.progress > 0 && call.bell !== null ? findEntity(world, call.bell) : nearestBell(ctx, e, kind.side);
      if (!bell || bell.c.thing?.takenBy !== null) {
        // A person with no working bell to reach does not call.
        stop(ctx, e, 'bell-broken');
        continue;
      }
      const dx = centre(content, bell).x - centre(content, e).x;
      if (Math.abs(dx) > npcCallReach!) {
        if (call.progress > 0) stop(ctx, e, 'left-the-bell');
        call.stall = Math.abs(e.vx) < 1 ? call.stall + 1 : 0;
        if (call.stall >= STALLED) {
          // INTENT (there is always a way out): a bell they cannot walk to is given up, and nothing is sent.
          call.reported = n.dissonance;
          call.stall = 0;
          continue;
        }
        drive(e, { x: dx > 0 ? 1 : -1, y: 0, held: [] });
        continue;
      }

      drive(e, { x: 0, y: 0, held: [] });
      if (call.progress === 0) {
        call.bell = bell.id;
        ctx.emit('call-started', { by: e.id });
      }
      call.progress++;
      const need = seconds(npcCallTime!);
      bell.c.ringing = { ticks: call.progress, of: need };
      if (call.progress < need) continue;

      // Sent. The place reported is where the caller last saw what upset them.
      const at = n.lastSeen ?? centre(content, e);
      delete bell.c.ringing;
      call.progress = 0;
      call.bell = null;
      call.stall = 0;
      call.reported = n.dissonance;
      ctx.emit('call-completed', { by: e.id, area: e.room, x: at.x, y: at.y });
      // INTENT (D-063, D-075): only a completed call raises the alert. This is the one call of raiseAlert().
      raiseAlert(ctx, e.room);
      const alert = alertOf(world, e.room);
      if (alert) {
        alert.x = at.x;
        alert.y = at.y;
      }
    }
  },
};
export default system;
