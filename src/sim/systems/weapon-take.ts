import { emitEffect } from '../effects.ts';
import type { System } from '../types.ts';
import { useHere } from '../use.ts';
import { findEntity, removeEntity } from '../world.ts';
import { makeLoose, weaponOf, weaponWorld } from '../weapons.ts';

/**
 * Picking a weapon up (Step 23; docs/mechanisms/weapons.md): a fresh press
 * of Use (the `interact` action) whose answer is the weapon entry's
 * (src/sim/use/weapon.ts) puts that loose weapon in the hero's hand, by the
 * effect `{ kind: 'weapon' }` so it reaches the hero's own page. A hero whose
 * hand is full swaps: the old one is laid at their feet.
 * INTENT: decided in the world that has the loose weapons (the server's, or
 * a scenario's); a page's own world holds only its own character, so a page
 * never picks one up itself (weaponWorld, src/sim/weapons.ts).
 * Keeps its own memory of the button (`c.weaponUse`), as every system that
 * reads Use does, and acts only when the answer is its own.
 */
const system: System = {
  id: 'weapon-take',
  order: 62,
  tuning: {
    weaponPickupReach: { min: 0, max: 64, what: 'how far past its box, in pixels, a hero still touches a loose weapon to pick it up with Use' },
  },
  run(ctx) {
    const { world, content } = ctx;
    if (!weaponWorld(world)) return;
    for (const e of world.entities) {
      if (e.player === null) continue;
      const down = ctx.inputs[e.player]?.held.includes('interact') ?? false;
      const state = (e.c.weaponUse ??= { held: false });
      const fresh = down && !state.held;
      state.held = down;
      if (!fresh) continue;
      const answer = useHere(world, content, e);
      if (answer?.entry !== 'weapon' || answer.target === undefined) continue;
      const loose = findEntity(world, answer.target);
      const l = loose?.c.loose;
      const w = l && content.weapons[l.weapon];
      if (!loose || !l || !w) continue;
      const old = weaponOf(content, e);
      if (old) {
        // A swap: the old one lies at the hero's feet, at once free to pick up again.
        const box = content.characters[e.kind]?.box;
        const src = e.c.weapon?.src;
        const dropped = makeLoose(ctx, old, e.room, e.x + (box?.w ?? 0) / 2, e.y + (box?.h ?? 0), { from: e.id, ...(src ? { src } : {}) });
        ctx.emit('weapon-dropped', { entity: e.id, player: e.player, weapon: old.id, loose: dropped.id, how: 'swap' });
      }
      emitEffect(ctx, e, { kind: 'weapon', weapon: w.id, ...(l.src ? { src: l.src } : {}) });
      ctx.emit('weapon-taken', { entity: e.id, player: e.player, weapon: w.id, loose: loose.id, ...(l.src ? { src: l.src } : {}) });
      removeEntity(world, loose.id);
    }
  },
};
export default system;
