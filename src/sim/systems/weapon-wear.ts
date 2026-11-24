import { emitEffect } from '../effects.ts';
import type { System } from '../types.ts';
import { findEntity } from '../world.ts';
import { makeLoose, weaponOf, weaponWorld } from '../weapons.ts';

/**
 * A weapon that wears out (Step 23, its `uses`; docs/mechanisms/weapons.md).
 * Each strike of a holder's swing (`attacked`, verbs/attack.ts) spends one
 * use: the holder's weapon is set again by the effect with the uses left, so
 * a player's own page has the same count. A weapon with none left breaks
 * once the strike that spent the last is over (the whole of that strike
 * still lands with it): it leaves the hand by the effect, its `broken` look
 * plays where the hand was (`loose.ending` with `broken`, shown for
 * weaponBurstShow seconds and then gone, by systems/weapon-burst.ts), and
 * `weapon-worn-out` is emitted. Its source, if it came off one, stands
 * another after its restock. No count is ever drawn (D-020: no digits).
 * DRAFT: only a swing spends a use; a throw (Grab) does not. A `throw`
 * weapon (the bomb) is spent by its burst, not here.
 * The server's world and a scenario's only (weaponWorld).
 * Runs after the verbs (100), which emit `attacked`, and after weapon-break
 * (106), so a last swing still breaks a wall.
 */
const system: System = {
  id: 'weapon-wear',
  order: 107,
  run(ctx) {
    const { world, content } = ctx;
    if (!weaponWorld(world)) return;
    for (const ev of ctx.events) {
      if (ev.type !== 'attacked') continue;
      const e = findEntity(world, ev.by);
      const held = e?.c.weapon;
      const w = e && weaponOf(content, e);
      if (!e || !held || !w || w.uses === undefined || w.use !== 'swing') continue;
      const left = Math.max(0, (held.uses ?? w.uses) - 1);
      emitEffect(ctx, e, { kind: 'weapon', weapon: w.id, uses: left, ...(held.src ? { src: held.src } : {}), ...(held.by ? { by: held.by } : {}) });
    }
    for (const e of world.entities) {
      const held = e.c.weapon;
      if (held?.uses === undefined || held.uses > 0 || e.c.attack?.phase === 'strike') continue;
      const w = weaponOf(content, e);
      const box = content.characters[e.kind]?.box;
      if (!w || !box) continue;
      emitEffect(ctx, e, { kind: 'weapon', weapon: null });
      const x = e.facing > 0 ? e.x + box.w : e.x;
      const loose = makeLoose(ctx, w, e.room, x, e.y + box.h * 0.6, { from: e.id, ending: { at: world.tick, broken: true }, ...(held.src ? { src: held.src } : {}) });
      ctx.emit('weapon-worn-out', { entity: e.id, player: e.player, weapon: w.id, loose: loose.id });
    }
  },
};
export default system;
