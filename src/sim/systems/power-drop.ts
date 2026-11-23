import { popOrb } from '../power-orbs.ts';
import { powerOf } from '../powers.ts';
import { emitEffect } from '../effects.ts';
import type { Entity, StepContext, System } from '../types.ts';
import { findEntity } from '../world.ts';

/**
 * Losing it (Step 9, D-081: "taking DAMAGE can KNOCK AN ACQUIRED/STOLEN
 * POWER LOOSE"; docs/mechanisms/powers.md). A hard hit on a hero holding a
 * power knocks it out of them as an orb (src/sim/power-orbs.ts) that fades
 * after the power's `fade`, unless someone takes it first. The hero holds
 * none from then on (the effect `{ kind: 'power', power: null }`, so their
 * own page loses it too).
 *
 * A hard hit is being laid flat by someone, or a blow (`hit`) that sends
 * the hero off at powerHardHitSpeed or faster (the speed the attack itself
 * recorded in `c.impact` this tick). A light hit (a shopkeeper's swat) does not.
 * DRAFT: the threshold; that a throw or a fall is not a hit; and that it is
 * not lost in the cantina (powerLostInCantina 0; D-086 leaves rare gear in a
 * brawl OPEN), one number from the other answer.
 *
 * INTENT: only a blow from someone in this world counts. A page's own world
 * holds only its character: an impact it simulates there wears it, but the
 * one who started the flight is not in that world, so the page never drops
 * a power itself; the server does and sends the effect.
 * Runs after the impacts (510, 520) and the carriers (540), before power-take (545).
 */
const system: System = {
  id: 'power-drop',
  order: 542,
  tuning: {
    powerHardHitSpeed: { min: 0, max: 900, what: 'a blow that sends a hero holding a power off at this speed or faster knocks the power loose, pixels per second' },
    powerLostInCantina: { min: 0, max: 1, what: '1: a hard hit in the cantina knocks a power loose too; 0: it does not' },
  },
  run(ctx) {
    const { world, content } = ctx;
    const hard = content.tuning.world.powerHardHitSpeed ?? 180;
    for (const ev of ctx.events) {
      let target: Entity | undefined;
      let by: Entity | undefined;
      if (ev.type === 'flattened' && ev.by !== null) {
        target = findEntity(world, ev.target);
        by = findEntity(world, ev.by);
      } else if (ev.type === 'hit') {
        target = findEntity(world, ev.target);
        by = findEntity(world, ev.by);
        const impact = target?.c.impact;
        if (!impact || impact.tick !== world.tick || impact.speed < hard) continue;
      } else continue;
      if (!target || !by || target.player === null) continue;
      knockLoose(ctx, target, by);
    }
  },
};

function knockLoose(ctx: StepContext, target: Entity, by: Entity): void {
  const p = powerOf(ctx.content, target);
  if (!p) return;
  if (ctx.content.cantina?.[target.room] && !ctx.content.tuning.world.powerLostInCantina) return;
  const src = target.c.power?.src;
  emitEffect(ctx, target, { kind: 'power', power: null });
  popOrb(ctx, p, target, by, src);
}
export default system;
