import type { Entity, System } from '../types.ts';
import { findEntity } from '../world.ts';
import { knockLoose, weaponOf, weaponWorld } from '../weapons.ts';

/**
 * A hard hit knocks a weapon out of the hand (Step 23, D-081: "taking DAMAGE
 * can KNOCK AN ACQUIRED/STOLEN POWER LOOSE and potentially also lose carried
 * items"; docs/mechanisms/weapons.md). Step 9's rule for a power
 * (systems/power-drop.ts), for **any** holder, played or not: being laid
 * flat by someone, or a blow (`hit`) that sends the holder off at
 * powerHardHitSpeed or faster (the speed the blow recorded in `c.impact`
 * this tick). The weapon pops out away from the hitter and lies for anyone:
 * this is how a carrier's weapon is stolen. Not in the cantina while
 * powerLostInCantina is 0, as a power.
 * INTENT: only a blow from someone in this world counts (as power-drop), and
 * only in the server's world or a scenario's (weaponWorld).
 * Runs after the impacts (510, 520) and power-drop (542).
 */
const system: System = {
  id: 'weapon-loose',
  order: 543,
  run(ctx) {
    const { world, content } = ctx;
    if (!weaponWorld(world)) return;
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
      if (!target || !by || !weaponOf(content, target)) continue;
      if (content.cantina?.[target.room] && !content.tuning.world.powerLostInCantina) continue;
      knockLoose(ctx, target, by);
    }
  },
};
export default system;
