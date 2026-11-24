import { emitEffect } from '../effects.ts';
import type { System } from '../types.ts';
import { canHold, carrierTag, weaponWorld } from '../weapons.ts';

/**
 * Bad guys who come at you with a weapon (Step 23, D-009: "weapons can be
 * acquired from enemies"; docs/mechanisms/weapons.md): a body nobody plays
 * that a weapon names in `carriers` (its placed id, or its character kind)
 * is handed that weapon once, the first tick it is in this world. Knocked
 * loose (systems/weapon-loose.ts), it lies there to be stolen; the carrier
 * is not handed another (`c.weaponCarrier` stays).
 * A carrier beaten for good comes back a fresh body (Step 5's beaten-return):
 * he is handed his weapon again only if the one he was handed is not still
 * in the world, lying loose or in anyone's hand (kept for a party member
 * too), so swords do not pile up in his room. His weapon carries
 * `src: carrierTag(id)` for that, wherever it goes.
 * A carrier holding a weapon swings with it: numbersOf serves every body.
 * DRAFT: handed once per body, never again while that body lives (a power's
 * carrier regains it on getting up); a returned one only while his own is gone.
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
      const tag = carrierTag(e.id);
      const out = world.entities.some(
        (x) => x.c.weapon?.src === tag || x.c.loose?.src === tag || Object.values(x.c.weaponKept ?? {}).some((k) => k.src === tag),
      );
      if (!e.c.weapon && !out) emitEffect(ctx, e, { kind: 'weapon', weapon: w.id, by: e.kind, src: tag });
    }
  },
};
export default system;
