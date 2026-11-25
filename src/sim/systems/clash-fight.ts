import { answered, hostile } from '../../content/kinds/hostility.ts';
import { canAct, ticksOf } from '../body-state.ts';
import { findEntity } from '../world.ts';
import { canSee } from '../npc/sight.ts';
import { centre, drive, isOut, npcKind } from '../npc/state.ts';
import type { Entity, System } from '../types.ts';

/**
 * Sides that meet fight (D-069): a person who sees a person of a kind its
 * own kind is hostile to (content/hostility.json) walks at the nearest such
 * one it sees and swings in `npcChargeReach`. Runs after every system that
 * writes a person's input (npc-act 50 … outpost-fight 58) and overlays it.
 *
 * INTENT (D-060, the brief): moods are unchanged; a clash is business as
 * usual for both, and a hit between two people is no deed in the rules
 * (no row), so no witness is troubled and nobody calls.
 * DRAFT: a hero in sight comes first (alert-respond's chase, outpost-fight),
 * as does a person on their way to call or calling; only bodies that list
 * attack swing; the nearest seen; a fresh press on the first tick in reach and every
 * other tick after (Step 2's attack starts a swing on a fresh press), so in
 * a meeting the one who closes first swings first, not the lower id.
 * INTENT (D-061, D-065): only what the person sees, on this tick; nothing
 * here asks for a door, so the camp's people stay in their room.
 *
 * INTENT (D-069, the owner's "no escalating combats or chases", Step 4's
 * "Guards meet bandits"; docs/deliberate-designs.md, "a person answers a
 * blow ahead of a hero"): a person struck by a person of a set they answer
 * (content/hostility.json `answers`) takes that striker as their foe for
 * `npcAnswerMemory`, AHEAD of a hero in sight, with no sight needed (he
 * felt the blow), so a hero who leads a guard into a bad guy can slip away
 * while the two fight. Each new blow renews it (Step 2's attack writes
 * `lastHit` on whoever it hits). Moods, calls and alerts are untouched
 * (D-060): a blow between people is no deed. DRAFT: the memory (6 s: at 3 s and 5 s the knockback parted them before the second answer, measured in the street), and
 * that a hero's own blow on the person (a newer `lastHit`) ends the answer.
 */
const system: System = {
  id: 'clash-fight',
  order: 59,
  tuning: {
    npcAnswerMemory: { min: 0, max: 60, what: 'how long, in seconds, a person struck by a person of a side they answer (content/hostility.json answers) keeps fighting that striker ahead of a hero' },
  },
  run(ctx) {
    const { world, content } = ctx;
    const reach = content.tuning.world.npcChargeReach!;
    const memory = ticksOf(content.tuning.world.npcAnswerMemory ?? 6);
    const people = world.entities.filter((e) => e.c.npc && !isOut(e));
    // The one who last struck e, while that blow is fresh, if e answers him.
    const answering = (e: Entity): Entity | null => {
      const last = e.c.lastHit;
      if (!last || world.tick - last.tick > memory) return null;
      const by = findEntity(world, last.by);
      if (!by || by.player !== null || !by.c.npc || by.room !== e.room || isOut(by)) return null;
      return answered(content.hostility, npcKind(content, e), npcKind(content, by)) ? by : null;
    };
    for (const e of people) {
      if (!canAct(e) || !content.characters[e.kind]?.verbs.includes('attack')) continue;
      if (e.c.outpostCall?.phase === 'going' || e.c.outpostCall?.phase === 'sounding' || e.c.call) continue;
      const me = centre(content, e);
      let foe: Entity | null = answering(e);
      let best = Infinity;
      if (!foe && world.entities.some((h) => h.player !== null && canSee(content, e, h))) continue;
      if (!foe) for (const o of people) {
        if (o === e || o.room !== e.room || !hostile(content.hostility, npcKind(content, e), npcKind(content, o))) continue;
        if (!canSee(content, e, o)) continue;
        const d = Math.abs(centre(content, o).x - me.x);
        if (d < best) {
          best = d;
          foe = o;
        }
      }
      if (!foe) continue;
      const dx = centre(content, foe).x - me.x;
      if (Math.abs(dx) > reach) drive(e, { x: dx > 0 ? 1 : -1, y: 0, held: [] });
      else if (dx !== 0 && (dx > 0 ? 1 : -1) !== e.facing) drive(e, { x: dx > 0 ? 0.01 : -0.01, y: 0, held: [] });
      // A fresh press the first tick in reach, then every other tick: whoever closes first swings first.
      else drive(e, { x: 0, y: 0, held: e.c.attack?.held ? [] : ['attack'] });
    }
  },
};
export default system;
