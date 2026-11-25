import { overlaps, takesNoPhysics } from '../body-state.ts';
import { emitEffect, heldBy } from '../effects.ts';
import { crashMachine, machineIdOf, machineOf, machineState, ram, ramSpeedOf } from '../machines.ts';
import type { System } from '../types.ts';

/**
 * A machine moving at its `ramSpeed` or faster that meets a body shoves it
 * by weight (the one ram rule, src/sim/machines.ts), once per pass, and
 * takes a crash itself; so does a machine stopped dead by a wall at that
 * speed, and one that bursts a barrier. Worn through, it is a wreck (src/sim/verbs/drive.ts stops it).
 * Step 20, docs/mechanisms/machines.md.
 *
 * INTENT: only a machine at speed rams. impact-bodies' rule stands
 * untouched: bodies that are not flying pass through each other, a machine
 * below `ramSpeed` included. It never moves a placed thing or a captive
 * (kind `~thing`: no box), a carried body (its carrier holds it), a body
 * lying flattened, or one already in a held beat.
 * DRAFT: "once per pass" means once while the two overlap; apart again,
 * they can meet again. A barrier (`breakable`) needs nothing here: it
 * already opens to any body arriving at its breakSpeed (room-breakable.ts),
 * and the machine rolls on through with its speed.
 *
 * Order 525: after physics (500) has moved everyone and impact-bodies (520)
 * has settled flying bodies, before combat-rest (530) and the horn post's
 * rule (540), which reads this tick's `impact` events.
 */
const system: System = {
  id: 'machine-ram',
  order: 525,
  run(ctx) {
    for (const a of ctx.world.entities) {
      const m = machineOf(ctx.content, a.kind);
      if (!m) continue;
      const ab = ctx.content.characters[a.kind]!.box;
      const r = (a.c.ram ??= { met: [], pvx: 0 });
      // Apart again: a body may be met on the next pass.
      r.met = r.met.filter((id) => {
        const b = ctx.world.entities.find((o) => o.id === id);
        const bb = b ? ctx.content.characters[b.kind]?.box : undefined;
        return !!b && !!bb && b.room === a.room && overlaps(a.x, a.y, ab.w, ab.h, b.x, b.y, bb.w, bb.h);
      });
      const mid = machineIdOf(ctx.world, a);
      const limit = ramSpeedOf(m, a);
      const free = !a.c.flying && heldBy(a) === null && !takesNoPhysics(a);
      // A wall stopped it dead at ram speed: physics leaves vx at exactly 0 only on the tick it stopped the body.
      if (free && a.vx === 0 && Math.abs(r.pvx) >= limit && !machineState(ctx.world, mid).wrecked) {
        const ax = r.pvx > 0 ? a.x + ab.w : a.x;
        const speed = Math.abs(r.pvx);
        a.c.impact = { x: ax, y: a.y + ab.h / 2, speed, tick: ctx.world.tick };
        ctx.emit('impact', { entity: a.id, player: a.player, other: null, speed });
        ctx.emit('machine-crash', { machine: mid, target: null, speed, player: a.player, by: a.id });
        crashMachine(ctx, a, m);
      }
      // A barrier it burst through this tick (room-breakable, order 460, names it as `by`) is a crash too.
      for (const ev of ctx.events) {
        if (ev.type === 'part-broken' && ev.by === a.id) {
          ctx.emit('machine-crash', { machine: mid, target: null, speed: ev.speed, player: a.player, by: a.id });
          crashMachine(ctx, a, m);
        }
      }
      if (free && Math.abs(a.vx) >= limit && !machineState(ctx.world, mid).wrecked) {
        for (const b of ctx.world.entities) {
          if (b === a || b.room !== a.room || r.met.includes(b.id)) continue;
          if (heldBy(b) !== null || b.c.carrying?.id === a.id || b.c.flattened || b.c.beat) continue;
          // Its own driver sits in it (machine-driven snaps him to the seat).
          if (a.c.seat?.driver === b.id) continue;
          const bb = ctx.content.characters[b.kind]?.box;
          if (!bb || !overlaps(a.x, a.y, ab.w, ab.h, b.x, b.y, bb.w, bb.h)) continue;
          r.met.push(b.id);
          const after = ram(ctx, a, b, a.id);
          // Guard vehicle push 2b (DRAFT): a machine with `ramLift` throws what it meets up as well as on,
          // so the pieces arc away where a player sees them; added to the speed its held beat hands back.
          if (m.ramLift) {
            const cap = ctx.content.tuning.world.maxLaunchSpeed ?? 500;
            // ram() has just set the beat (the guard above narrowed it away for the type checker).
            const beat = (b.c as { beat?: { vy?: number } }).beat;
            if (beat?.vy !== undefined) beat.vy = Math.max(-cap, beat.vy - m.ramLift);
            else b.vy = Math.max(-cap, b.vy - m.ramLift);
          }
          ctx.emit('machine-crash', { machine: mid, target: b.id, speed: after.speed, player: a.player, by: a.id });
          if (after.vx !== a.vx) emitEffect(ctx, a, { kind: 'push', vx: after.vx, vy: a.vy });
          crashMachine(ctx, a, m);
          if (machineState(ctx.world, mid).wrecked || Math.abs(a.vx) < limit) break;
        }
      }
      r.pvx = a.vx;
    }
  },
};
export default system;
