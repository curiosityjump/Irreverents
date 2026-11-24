import { emitEffect } from '../effects.ts';
import type { System } from '../types.ts';
import { canHold, weaponWorld } from '../weapons.ts';

/**
 * Bad guys who come at you with a weapon (Step 23, D-009: "weapons can be
 * acquired from enemies"; docs/mechanisms/weapons.md): a body nobody plays
 * that a weapon names in `carriers` (its placed id, or its character kind)
 * is handed that weapon once, the first tick it is in this world. Knocked
 * loose (systems/weapon-loose.ts), it lies there to be stolen; the carrier
 * is not handed another (`c.weaponCarrier` stays).
 * A carrier holding a weapon swings with it: numbersOf serves every body.
 * DRAFT: handed once, never again (a power's carrier regains it on getting up).
 * Runs before the verbs (100).
 */
const system: System = {
  id: 'weapon-carriers',
  order: 26,
  run(ctx) {
    const { world, content } = ctx;
    if (!weaponWorld(world)) return;
    const weapons = Object.values(content.weapons ?? {})
      .filter((w) => w.carriers.length > 0)
      .sort((a, b) => (a.id < b.id ? -1 : 1));
    if (weapons.length === 0) return;
    for (const e of world.entities) {
      if (e.player !== null || e.c.weaponCarrier || e.c.loose || !canHold(content, e)) continue;
      const w = weapons.find((x) => x.carriers.includes(e.id) || x.carriers.includes(e.kind));
      if (!w) continue;
      e.c.weaponCarrier = { at: world.tick };
      if (!e.c.weapon) emitEffect(ctx, e, { kind: 'weapon', weapon: w.id, by: e.kind });
    }
  },
};
export default system;
