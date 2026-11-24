import { bodyNumbers } from '../body-state.ts';
import { heldBy } from '../effects.ts';
import { verbsOf } from '../powers.ts';
import type { UseEntry } from '../use.ts';

/**
 * Step 25 (docs/mechanisms/combat-and-impact.md, "The suplex"): Use while
 * carrying a body that can be knocked out (toughness above 0: people,
 * heroes, dummies, the king; never a crate) suplexes it (verbs/suplex.ts
 * acts). Only a player's character whose verbs include `suplex`.
 * INTENT: order 300, after every other entry, so a doorway, counter,
 * captive, machine or bell still wins while carrying (Step 25's DRAFT
 * choice 1; the other answer is this one number).
 * INTENT: the carried body is found by its `heldBy`, never by
 * `e.c.carrying`: a page never gets its own character's `c`
 * (docs/mechanisms/network.md), but it does see who holds whom, so the
 * button can say SUPLEX on a phone.
 */
const entry: UseEntry = {
  id: 'suplex',
  order: 300,
  find(world, content, e) {
    if (e.player === null || !verbsOf(content, e).includes('suplex')) return undefined;
    // Entities are in id order, so every device finds the same body.
    const body = world.entities.find((o) => o !== e && o.room === e.room && heldBy(o) === e.id);
    if (!body || bodyNumbers(content, body).toughness <= 0) return undefined;
    const box = content.characters[body.kind]?.box;
    if (!box) return undefined;
    return { entry: 'suplex', word: 'suplex', target: body.id, at: { x: body.x + box.w / 2, y: body.y } };
  },
};
export default entry;
