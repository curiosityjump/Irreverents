import { lowerAlert } from '../npc/alert.ts';
import { verdictFor, whoIs } from '../npc/rules.ts';
import { canSee } from '../npc/sight.ts';
import { isOut, seconds } from '../npc/state.ts';
import type { System } from '../types.ts';
import { findEntity } from '../world.ts';

/**
 * An alert cools only by hiding and waiting. Runs after the witness pass
 * (600) and the mood clocks (610).
 *
 * INTENT (D-068, D-074, D-076): while no conscious person of the area sees
 * any hero and nobody perceives a hero doing anything unexpected, a clock
 * runs; long enough, and the alert drops ONE level and the clock restarts.
 * Being seen, or any perceived incident, puts the clock back to zero.
 * INTENT (D-067): acting normal in view of a pursuer does nothing (being
 * seen holds the clock at zero), and hitting back restarts the wait without
 * raising the number.
 * INTENT (D-019): nothing here ends, reloads or resets anything else.
 */
const system: System = {
  id: 'alert-cool',
  order: 620,
  tuning: {
    npcAlertCoolTime: { min: 0.1, max: 3600, what: 'seconds of hiding and waiting, unseen and with no incident, for an area alert to drop one level' },
  },
  run(ctx) {
    const { world, content } = ctx;
    const need = seconds(content.tuning.world.npcAlertCoolTime!);
    for (const a of world.entities) {
      const alert = a.c.alert;
      if (!alert || alert.level <= 0) continue;
      // A person of the area is anyone in it, and anyone placed in it whom a chase has led elsewhere (D-077).
      const heroes = world.entities.filter((h) => h.player !== null);
      const seen = world.entities.some((p) => p.c.npc && (p.room === a.room || p.c.npc.home === a.room) && !isOut(p) && heroes.some((h) => canSee(content, p, h)));
      const incident = ctx.events.some((ev) => {
        if (ev.type !== 'deed' || ev.room !== a.room || ev.player === null) return false;
        const actor = whoIs(content, findEntity(world, ev.by));
        const target = whoIs(content, ev.target === null ? undefined : findEntity(world, ev.target));
        return actor !== null && ev.witnesses.some((id) => {
          const w = whoIs(content, findEntity(world, id));
          return w !== null && verdictFor(content, ev.deed, actor, target, w)?.verdict === 'odd';
        });
      });
      if (seen || incident) {
        alert.quiet = 0;
        continue;
      }
      if (++alert.quiet >= need) lowerAlert(ctx, a.room);
    }
  },
};
export default system;
