import { canAct, inputOf } from '../body-state.ts';
import { emitEffect } from '../effects.ts';
import type { System } from '../types.ts';
import { makeLoose, weaponOf, weaponWorld } from '../weapons.ts';

/**
 * Grab throws the weapon in hand (Step 23; docs/mechanisms/weapons.md): a
 * fresh press of `grab` by a body holding a weapon. The stick held down sets
 * it at the feet; otherwise it leaves the hand at the weapon's
 * `thrown.speed`, aimed by the stick as a carried body is thrown
 * (`throwCarried`, src/sim/body-state.ts): forward in a flat arc lifted by
 * world.throwLift, or up. In flight it launches the first body it meets
 * (systems/weapon-move.ts) and then lies where it stops. A body holding a
 * weapon grabs nothing (the guard line in src/sim/verbs/grab.ts), so the
 * press is the throw's alone.
 * DRAFT: Grab throws (the hands button, as a held thing is thrown in Smash);
 * the other answer, Hit throws, is a branch here and in the attack verb.
 * Keeps its own memory of the button (`c.weaponGrab`). Runs after the verbs
 * (100), so the grab verb has already seen the weapon in hand and lifted nothing.
 */
const system: System = {
  id: 'weapon-throw',
  order: 105,
  run(ctx) {
    const { world, content } = ctx;
    if (!weaponWorld(world)) return;
    for (const e of world.entities) {
      if (e.player === null) continue;
      const input = inputOf(ctx, e);
      const down = input.held.includes('grab');
      const state = (e.c.weaponGrab ??= { held: false });
      const fresh = down && !state.held;
      state.held = down;
      if (!fresh || !canAct(e)) continue;
      const w = weaponOf(content, e);
      const box = content.characters[e.kind]?.box;
      if (!w || !box) continue;
      const src = e.c.weapon?.src;
      emitEffect(ctx, e, { kind: 'weapon', weapon: null });
      const mid = e.x + box.w / 2;
      if (input.y > 0.5) {
        const loose = makeLoose(ctx, w, e.room, mid, e.y + box.h, { from: e.id, ...(src ? { src } : {}) });
        ctx.emit('weapon-dropped', { entity: e.id, player: e.player, weapon: w.id, loose: loose.id, how: 'set-down' });
        continue;
      }
      const dir = input.x > 0 ? 1 : input.x < 0 ? -1 : e.facing;
      const speed = w.thrown.speed;
      const up = input.y < -0.5;
      const vx = dir * speed * (up ? 0.2 : 1);
      const vy = -speed * (up ? 1 : (content.tuning.world.throwLift ?? 0.4));
      // From in front of the hand at chest height, as a forward throw of a body leaves (throwCarried).
      const x = up ? mid : dir > 0 ? e.x + box.w + w.box[0] / 2 : e.x - w.box[0] / 2;
      const feet = e.y + box.h / 2 + w.box[1] / 2;
      const loose = makeLoose(ctx, w, e.room, x, feet, { from: e.id, vx, vy, flying: { by: e.id, met: [e.id] }, ...(src ? { src } : {}) });
      ctx.emit('weapon-dropped', { entity: e.id, player: e.player, weapon: w.id, loose: loose.id, how: 'thrown' });
    }
  },
};
export default system;
