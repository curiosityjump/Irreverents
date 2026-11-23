import type { System } from '../types.ts';

/**
 * A false wall: drawn exactly as wall (src/client/draw/room-parts.ts),
 * never solid. It has no behaviour; this file exists so the kind is known.
 *
 * INTENT: nothing points at it: no arrow, no glow, no text, no event when a
 * body walks in (docs/plan/step-3.md, "Unadvertised").
 * DRAFT: whether it should look or sound any different from the wall around
 * it is the owner's to say after playing; tonight it is identical.
 */
const system: System = {
  id: 'room-false-wall',
  order: 540,
  parts: {
    'false-wall': { what: 'a wall that is only drawn: bodies pass through it' },
  },
  run() {},
};
export default system;
