import { ticksOf } from '../body-state.ts';
import { canSeize, placeAt } from '../defeat.ts';
import type { Entity, System } from '../types.ts';
import { findEntity } from '../world.ts';

/**
 * Step 21 (risk; docs/mechanisms/defeat.md): a played hero knocked flat in a
 * place that is on (content/defeat/), while a standing person of the place
 * can reach them, is stood over: `c.seized` for the place's beat, then
 * defeat-throw throws them out. Nobody in reach: nothing happens, the hero
 * gets up where they lie, as before.
 *
 * DRAFT (docs/decisions-log.md, "Step 21"): only a played body's hit on the
 * one standing over them stops it. A bandit's stray hit does not: bandits
 * flatten each other constantly (docs/plan/step-7.md:359-362).
 * INTENT (cantina-chase.ts:19-21): a page's world holds only its own hero,
 * so this never starts there; it is the server's world's rule. It writes no
 * top-level field.
 * Runs after every way of being flattened this tick (verbs 100, impacts
 * 510-520) and before the throw (defeat-throw, 590).
 */
const system: System = {
  id: 'defeat-seize',
  order: 585,
  run(ctx) {
    const { world, content } = ctx;
    if (Object.keys(content.defeat ?? {}).length === 0) return;
    for (const ev of ctx.events) {
      if (ev.type === 'flattened') {
        const hero = findEntity(world, ev.target);
        if (!hero || hero.player === null || hero.c.seized || !hero.c.flattened) continue;
        const d = placeAt(world, content, hero.room);
        if (!d) continue;
        const near = world.entities
          .filter((o) => canSeize(content, d, o, hero))
          .sort((a, b) => Math.abs(a.x - hero.x) - Math.abs(b.x - hero.x) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))[0];
        if (!near) continue;
        hero.c.seized = { by: near.id, place: d.id, ticks: Math.max(1, ticksOf(d.beat)) };
        ctx.emit('seized', { entity: hero.id, player: hero.player, by: near.id, place: d.id });
      } else if (ev.type === 'hit') {
        // A played body's hit on the one standing over a hero stops it.
        if (findEntity(world, ev.by)?.player == null) continue;
        for (const hero of world.entities) {
          const s = hero.c.seized;
          if (!s || s.by !== ev.target) continue;
          stop(hero);
          ctx.emit('seize-stopped', { entity: hero.id, player: hero.player, by: s.by, place: s.place, stoppedBy: ev.by });
        }
      }
    }
    // A seize ends quietly when what it stood on is gone: up already, gone from the place, or the place switched off.
    for (const hero of world.entities) {
      const s = hero.c.seized;
      if (!s) continue;
      const d = content.defeat?.[s.place];
      if (!hero.c.flattened || !d || !d.on || !d.rooms.includes(hero.room)) stop(hero);
    }
  },
};
export default system;

function stop(hero: Entity): void {
  delete hero.c.seized;
}
