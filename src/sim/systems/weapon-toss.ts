import { canAct, inputOf } from '../body-state.ts';
import type { System } from '../types.ts';
import { throwWeapon, weaponOf, weaponWorld } from '../weapons.ts';

/**
 * Hit throws a `throw` weapon (Step 23, the bomb; docs/mechanisms/weapons.md):
 * a fresh press of `attack` by a body holding a weapon whose `use` is
 * `throw`, and whose swing is ready, throws it as Grab does
 * (`throwWeapon`, src/sim/weapons.ts: a bomb is lit), and no swing starts.
 * INTENT: the press is the toss's alone. This system marks the attack verb's
 * own button memory (`c.attack.held`) as already down, so the verb (which
 * runs after it, in verbs at 100) sees no fresh press and swings nothing.
 * That part runs in every world, a page's too (it knows its own weapon by
 * the effect), so the page does not predict a swing the server never makes.
 * The throw itself is the server's (and a scenario's) only (weaponWorld).
 * DRAFT: Hit throws a bomb (the brief: "the holder's Hit swing is
 * harmless ... on attacked the bomb leaves the hand"; the toss on the press
 * keeps a later strike tick from landing a bare fist once the bomb is gone).
 * A bad guy holding one throws it too, when his scripted swing presses Hit.
 * Runs before the verbs (100).
 */
const system: System = {
  id: 'weapon-toss',
  order: 95,
  run(ctx) {
    const { world, content } = ctx;
    const server = weaponWorld(world);
    for (const e of world.entities) {
      if (!e.c.weapon) continue;
      const w = weaponOf(content, e);
      if (!w || w.use !== 'throw' || !canAct(e)) continue;
      const input = inputOf(ctx, e);
      const down = input.held.includes('attack');
      const a = (e.c.attack ??= { held: false, cooldown: 0, swung: -1000 });
      const fresh = down && !a.held;
      if (!fresh || (a.phase ?? 'ready') !== 'ready' || a.cooldown > 0 || e.c.carrying) continue;
      a.held = true;
      if (server) throwWeapon(ctx, e, w, input);
    }
  },
};
export default system;
