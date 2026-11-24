import { overlaps } from '../body-state.ts';
import { emitEffect, heldBy } from '../effects.ts';
import { ORB_SIZE, isOrb } from '../powers.ts';
import { moveLoose } from '../loose-fall.ts';
import type { Entity, StepContext, System } from '../types.ts';
import { removeEntity } from '../world.ts';

/**
 * Orbs (Step 9; docs/mechanisms/powers.md): a power lying loose (no body:
 * src/sim/powers.ts, ORB_KIND) falls, bounces and slides to rest by the
 * small physics of src/sim/loose-fall.ts, fades after its power's `fade`, and is taken by the first played hero
 * who touches it (or picks it up) holding no power. The take is the effect
 * `{ kind: 'power' }`, so it reaches the hero's own page, and the event
 * `power-taken`.
 * INTENT: decided here, in the world that has the orb: the server's, or a
 * scenario's. A page's own world has no orbs, so a page never takes one.
 * DRAFT: one power per hero (a hero holding one walks through an orb); nobody takes it for powerRetakeTime
 * after it pops, so it is seen to pop; how it bounces and slides.
 * Runs after the carriers (540), so an orb popped this tick takes its first step now.
 */
const system: System = {
  id: 'power-take',
  order: 545,
  tuning: {
    powerOrbPop: { min: 0, max: 900, what: 'how fast an orb jumps up out of the body it comes from, pixels per second' },
    powerOrbSpread: { min: 0, max: 900, what: 'how fast an orb leaves sideways, away from the one who knocked it out, pixels per second' },
    powerOrbBounce: { min: 0, max: 0.95, what: 'the share of its falling speed an orb bounces up with when it lands' },
    powerOrbFriction: { min: 0, max: 10000, what: 'how fast an orb on the ground slows sideways, pixels per second per second' },
    powerRetakeTime: { min: 0, max: 10, what: 'seconds after an orb pops before anyone can take it' },
  },
  run(ctx) {
    const { world, content } = ctx;
    const gone: Entity[] = [];
    for (const orb of world.entities) {
      const o = orb.c.orb;
      if (!o) continue;
      moveLoose(ctx, orb, ORB_SIZE, ORB_SIZE);
      if (o.left > 0 && --o.left === 0) {
        gone.push(orb);
        ctx.emit('power-faded', { orb: orb.id, power: o.power, room: orb.room });
        continue;
      }
      const taker = takerOf(ctx.world.entities, orb, world.tick, content);
      if (!taker) continue;
      emitEffect(ctx, taker, { kind: 'power', power: o.power, ...(o.src ? { src: o.src } : {}) });
      ctx.emit('power-taken', { entity: taker.id, player: taker.player, power: o.power, from: o.from, ...(o.src ? { src: o.src } : {}) });
      gone.push(orb);
    }
    for (const orb of gone) removeEntity(world, orb.id);
  },
};

/** Who takes this orb now: the first played hero touching it who holds no power and can act. */
function takerOf(entities: Entity[], orb: Entity, tick: number, content: StepContext['content']): Entity | null {
  const o = orb.c.orb!;
  if (tick < o.until) return null;
  const free = (h: Entity): boolean => h.player !== null && !h.c.power && !isOrb(h) && !h.c.flattened;
  for (const h of entities) {
    if (h.room !== orb.room || !free(h) || heldBy(h) !== null) continue;
    const hb = content.characters[h.kind]?.box;
    if (hb && overlaps(h.x, h.y, hb.w, hb.h, orb.x, orb.y, ORB_SIZE, ORB_SIZE)) return h;
  }
  return null;
}
export default system;
