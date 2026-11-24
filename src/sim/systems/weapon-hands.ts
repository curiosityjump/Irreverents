import { emitEffect } from '../effects.ts';
import type { System } from '../types.ts';
import { weaponWorld } from '../weapons.ts';

/**
 * One weapon per hero, not per party (Step 23; the owner, 2026-11-24: "No
 * inventory. Only one weapon at a time"; docs/plan/step-23.md): a weapon
 * belongs to the party member who picked it up (`c.weapon.by`, a character
 * kind). When the player switches to another member (a switch, a cantina
 * swap), that member's own weapon, if they had one, is in hand and the other
 * is kept for its hero (`c.weaponKept`); switching back, it is in hand again.
 * `weaponOf` already ignores a weapon whose `by` is not the body's kind, so
 * the page, where a switch is decided first, swings with the right one at
 * once; this system makes it so on the server and tells the page (effects).
 * DRAFT: world.weaponStaysWithHero 0 is the other answer: the weapon follows
 * the player through every switch.
 * Runs first among the weapon systems, before the verbs.
 */
const system: System = {
  id: 'weapon-hands',
  order: 24,
  tuning: {
    weaponStaysWithHero: { min: 0, max: 1, what: '1: a weapon stays with the party member who picked it up through a switch; 0: it stays in the player\'s hand whoever they switch to' },
  },
  run(ctx) {
    const { world, content } = ctx;
    if (!weaponWorld(world) || (content.tuning.world.weaponStaysWithHero ?? 1) === 0) return;
    for (const e of world.entities) {
      if (e.player === null) continue;
      const held = e.c.weapon;
      if (held?.by !== undefined && held.by !== e.kind) {
        // The member who picked it up is not the one played now: theirs to keep.
        (e.c.weaponKept ??= {})[held.by] = { id: held.id, ...(held.src ? { src: held.src } : {}), ...(held.uses !== undefined ? { uses: held.uses } : {}) };
        emitEffect(ctx, e, { kind: 'weapon', weapon: null });
      }
      const mine = e.c.weaponKept?.[e.kind];
      if (!e.c.weapon && mine && content.weapons[mine.id]) {
        delete e.c.weaponKept![e.kind];
        emitEffect(ctx, e, { kind: 'weapon', weapon: mine.id, by: e.kind, ...(mine.src ? { src: mine.src } : {}), ...(mine.uses !== undefined ? { uses: mine.uses } : {}) });
      }
    }
  },
};
export default system;
