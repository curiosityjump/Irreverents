import { canAct, inputOf } from '../body-state.ts';
import type { System } from '../types.ts';
import { throwWeapon, weaponOf, weaponWorld } from '../weapons.ts';

/**
 * Grab throws the weapon in hand (Step 23; docs/mechanisms/weapons.md): a
 * fresh press of `grab` by a body holding a weapon (`throwWeapon`,
 * src/sim/weapons.ts: the stick held down sets it at the feet; a bomb is
 * lit). In flight it launches the first body it meets
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
      if (!w || !content.characters[e.kind]?.box) continue;
      throwWeapon(ctx, e, w, input);
    }
  },
};
export default system;
