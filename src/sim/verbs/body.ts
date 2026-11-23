import type { Verb } from '../types.ts';

/**
 * Having a body that can be hit, lifted and thrown. It does nothing by
 * itself: it exists so each character kind (crates and dummies included)
 * can carry its own weight and toughness in content/tuning.json, which only
 * a verb may declare (src/sim/check-content.ts). The combat-*, carry-* and
 * impact-* systems read these numbers.
 */
const verb: Verb = {
  id: 'body',
  order: 0,
  tuning: {
    weight: { min: 1, max: 1000, what: 'how heavy the body is: heavier flies less far when hit or thrown, shoves harder, and needs more lifting strength to pick up' },
    toughness: { min: 0, max: 100000, what: 'how much hitting the body takes before it is flattened (hidden, never shown); 0 = cannot be flattened' },
  },
  update() {},
};
export default verb;
