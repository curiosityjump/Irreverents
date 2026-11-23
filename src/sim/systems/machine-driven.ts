import { machineIdOf, machineOf, machineState } from '../machines.ts';
import { canSee } from '../npc/sight.ts';
import type { System } from '../types.ts';
import { NO_INPUT } from '../world.ts';

/** DRAFT: how far into the machine's top the driver sinks, pixels (he sits in it rather than on it). INTENT: deep enough that the shortest hero (the infiltrator, 12 tall) reaches him with Grab from the ground behind: solo is never locked out. */
const SINK = 16;
/** DRAFT: how near (pixels, machine middle to the place he last saw a hero) a driver stops and waits. */
const ARRIVED = 8;

/**
 * Step 20 push 2: a person at the reins of a standing machine
 * (`c.seat.driver`, machine-seat), by NPC response logic with fixed states:
 * - **parked**: no hero seen; the machine coasts to a stop.
 * - **driving**: the driver sees a hero (the NPC sight rule, canSee): he
 *   drives at where the hero is, at the machine's `speed.driver`; out of
 *   sight, he drives on to where he last saw them, then parks.
 * The driver is kept in the seat each tick: at the machine's rear, sunk
 * into it, moving with it; parked, the machine turns the way he faces
 * (a placement's routine `face` sets which way it stands); rolling, he faces
 * the way it rolls; so a hero who comes up
 * behind it can Grab him out.
 *
 * INTENT: people can be outrun: `speed.driver` is below every roster hero's
 * run (content check in src/content/kinds/machines.ts).
 * INTENT (D-055, D-062): scripted, never AI: two states and one sight test.
 *
 * Order 605: after carry-ride (600) has put carried bodies in place and
 * after physics has moved the machine; the input written here is read by
 * the machine's `drive` verb on the next tick. Runs in any world, but a
 * page's own world holds no standing machine.
 */
const system: System = {
  id: 'machine-driven',
  order: 605,
  run(ctx) {
    const { world, content } = ctx;
    for (const m of world.entities) {
      if (m.player !== null) continue;
      const def = machineOf(content, m.kind);
      if (!def) continue;
      const id = m.c.seat?.driver ?? null;
      const d = id === null ? undefined : world.entities.find((o) => o.id === id);
      if (!d || machineState(world, machineIdOf(world, m)).wrecked) {
        m.c.input = NO_INPUT;
        if (!d) delete m.c.chase;
        if (!d) continue;
      }
      const mb = content.characters[m.kind]!.box;
      const db = content.characters[d.kind]?.box;
      if (!db) continue;
      // DRAFT: standing still, the machine faces the way its driver does (his placement's routine `face` sets it); rolling, he faces the way it rolls.
      if (m.vx === 0) m.facing = d.facing;
      d.x = m.facing > 0 ? m.x : m.x + mb.w - db.w;
      d.y = m.y - db.h + SINK;
      d.vx = m.vx;
      d.vy = 0;
      d.onGround = true;
      d.facing = m.facing;
      if (machineState(world, machineIdOf(world, m)).wrecked) continue;

      let seen: { x: number } | undefined;
      let best = Infinity;
      for (const h of world.entities) {
        if (h.player === null || h.room !== m.room || !canSee(content, d, h)) continue;
        const hb = content.characters[h.kind]?.box;
        const x = h.x + (hb?.w ?? 0) / 2;
        const gap = Math.abs(x - (m.x + mb.w / 2));
        if (gap < best) [seen, best] = [{ x }, gap];
      }
      if (seen) m.c.chase = seen;
      const goal = m.c.chase ?? null;
      const mid = m.x + mb.w / 2;
      if (goal === null || Math.abs(goal.x - mid) <= ARRIVED) {
        if (goal !== null && !seen) m.c.chase = null;
        m.c.input = NO_INPUT;
        continue;
      }
      m.c.input = { ...NO_INPUT, x: goal.x > mid ? 1 : -1 };
    }
  },
};
export default system;
