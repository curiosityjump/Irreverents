import { heartsOut, loseHeart } from '../hearts.ts';
import type { Entity, StepContext, System } from '../types.ts';
import { findEntity } from '../world.ts';

/**
 * Step 21, hearts (docs/mechanisms/defeat.md, "Hearts"): a played hero put
 * on the floor by an enemy loses one of the party's hearts for its kind
 * (content/hearts.json, `per`: "fall"); with `per`: "blow", every blow an
 * enemy lands costs one instead.
 *
 * An enemy is a person nobody plays (an NPC) who is in this world: a bad
 * guy, or a guard provoked into fighting. A friend's hit, a wall or a fall
 * with nobody behind it (`by` null) and anything in a cantina room (its
 * brawl, D-086, doc 31: no loss there) cost nothing. A thrown or slammed
 * hero counts the one who threw them (the flight's `by`).
 *
 * INTENT (cantina-chase.ts): a page's world holds only its own hero, so the
 * enemy is never found there and this never writes `World.heartsLost` on a
 * page; it is the server's world's rule.
 * DRAFT (docs/decisions-log.md, "Step 21: hearts"): the fall is the unit.
 * Runs after every way of being flattened this tick (verbs 100, impacts
 * 510-520) and before the place rules (defeat-seize, 585).
 */
const system: System = {
  id: 'heart-lose',
  order: 580,
  run(ctx) {
    const { world, content } = ctx;
    const h = content.hearts;
    if (!h?.on) return;
    for (const ev of ctx.events) {
      if (h.per === 'fall' && ev.type === 'flattened') take(ctx, ev.target, ev.by);
      else if (h.per === 'blow' && ev.type === 'hit') take(ctx, ev.target, ev.by);
    }
    function take(c: StepContext, target: string, by: string | null): void {
      const hero = findEntity(world, target);
      if (!hero || hero.player === null || !enemy(c, hero, by)) return;
      if (heartsOut(world, content, hero.kind)) return;
      const left = loseHeart(world, content, hero.kind);
      c.emit('heart-lost', { entity: hero.id, player: hero.player, hero: hero.kind, by: by!, left });
    }
  },
};
export default system;

function enemy(ctx: StepContext, hero: Entity, by: string | null): boolean {
  if (by === null || ctx.content.cantina?.[hero.room]) return false;
  const who = findEntity(ctx.world, by);
  return !!who && who.player === null && !!who.c.npc;
}
