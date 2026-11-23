import { ticksOf } from '../body-state.ts';
import type { System } from '../types.ts';

/**
 * The timers on a body: the held beat, being flattened, and how long a
 * flight may last. Runs first, so a body whose timer ran out acts this tick.
 */
const system: System = {
  id: 'combat-clock',
  order: 50,
  tuning: {
    flattenTime: { min: 0.1, max: 60, what: 'seconds a flattened body is out before it gets up' },
    flyMaxTime: { min: 0.1, max: 60, what: 'the longest a body stays "flying" (unable to act) from one hit or throw, seconds' },
    hitBeatTime: { min: 0, max: 1, what: 'seconds a body hit by an attack is held still before it flies (the held beat of a hit; 0 = none)' },
    defaultWeight: { min: 1, max: 1000, what: 'weight of a body whose kind gives none' },
    defaultToughness: { min: 0, max: 100000, what: 'toughness of a body whose kind gives none (0 = cannot be flattened)' },
    // INTENT: physics looks one 16 px tile ahead, so nothing may be launched
    // at 960 px/s or more on either axis. Rising speed is not capped by physics.
    maxLaunchSpeed: { min: 0, max: 900, what: 'the fastest a hit, a throw or a shove can send a body, pixels per second on each axis' },
    attackLift: { min: 0, max: 2, what: 'how much of a hit goes upwards (0 = flat along the ground, 1 = as much up as along)' },
    throwLift: { min: 0, max: 2, what: 'how much of a forward throw goes upwards' },
    friendAttackLaunch: { min: 0, max: 1, what: "share of a hit's launch a player's attack gives another player (0 = a friend's attack does not move you)" },
    friendAttackWear: { min: 0, max: 1, what: "share of a hit's wear a player's attack gives another player (0 = a friend's attack does not wear you down)" },
  },
  run(ctx) {
    for (const e of ctx.world.entities) {
      if (e.c.beat) {
        if (e.c.beat.ticks <= 0) delete e.c.beat;
        else e.c.beat.ticks--;
      }
      const flat = e.c.flattened;
      if (flat) {
        flat.ticksLeft--;
        if (flat.ticksLeft <= 0) {
          delete e.c.flattened;
          delete e.c.worn;
          ctx.emit('recovered', { target: e.id });
        }
      }
      const f = e.c.flying;
      if (f && !e.c.beat && !e.c.held) {
        f.ticks++;
        // INTENT: there is always a way out. However a flight goes (a body
        // bouncing between two walls, wedged on a ledge), the player gets
        // their stick back after world.flyMaxTime.
        if (f.ticks > ticksOf(ctx.content.tuning.world.flyMaxTime)) delete e.c.flying;
      }
    }
  },
};
export default system;
