import { hostile } from '../../content/kinds/hostility.ts';
import { canAct } from '../body-state.ts';
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
 */
const system: System = {
  id: 'clash-fight',
  order: 59,
  run(ctx) {
    const { world, content } = ctx;
    const reach = content.tuning.world.npcChargeReach!;
    const people = world.entities.filter((e) => e.c.npc && !isOut(e));
    for (const e of people) {
      if (!canAct(e) || !content.characters[e.kind]?.verbs.includes('attack')) continue;
      if (e.c.outpostCall?.phase === 'going' || e.c.outpostCall?.phase === 'sounding' || e.c.call) continue;
      if (world.entities.some((h) => h.player !== null && canSee(content, e, h))) continue;
      const me = centre(content, e);
      let foe: Entity | null = null;
      let best = Infinity;
      for (const o of people) {
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
