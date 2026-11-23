import { release, ticksOf } from '../body-state.ts';
import { doorBetween, landingSpot } from '../defeat.ts';
import { emitEffect, heldBy } from '../effects.ts';
import { carriedBy, prizeOf, returnPrize } from '../heist.ts';
import type { System } from '../types.ts';
import { findEntity } from '../world.ts';

/**
 * Step 21 (risk; docs/mechanisms/defeat.md): when the beat of a seize runs
 * out, the hero is thrown out of the place. In order: whatever they carry or
 * whoever holds them is let go; a prize in their hands goes back on its stand
 * (returnPrize, then `prize-returned`) BEFORE they leave the room, so it is
 * never banked (heist-cargo, 607, banks a prize carried out on its carrier's
 * own feet); then one `move` to the place's landing spot, flat there for
 * world.flattenTime, and `thrown-out`. Nothing of the place is reset.
 *
 * INTENT (CLAUDE.md, "There is always a way out"; D-019): the throw is itself
 * the exit. The hero lands flat and is free the moment the flatten runs out,
 * never held longer than the beat plus world.flattenTime; a place whose
 * landing spot is missing or inside a wall throws nobody (they get up where
 * they lie).
 * INTENT (cantina-out.ts): a player is only ever moved by an effect.
 * DRAFT (docs/decisions-log.md, "Step 21"): with the place's `follow`, the
 * throw also says which door the hero went by (`changed-room`), so the
 * existing chase rules (alert-follow 605, chase-cap 606) send the guards who
 * had them in sight out after them. No new pursuit: D-077, the throw never
 * ends a chase.
 */
const system: System = {
  id: 'defeat-throw',
  order: 590,
  run(ctx) {
    const { world, content } = ctx;
    for (const hero of [...world.entities]) {
      const s = hero.c.seized;
      if (!s) continue;
      s.ticks--;
      if (s.ticks > 0) continue;
      delete hero.c.seized;
      const d = content.defeat?.[s.place];
      const spot = d ? landingSpot(world, content, d, hero.kind) : undefined;
      if (!d || !spot) continue;

      const carried = hero.c.carrying ? findEntity(world, hero.c.carrying.id) : undefined;
      if (carried && heldBy(carried) === hero.id) release(ctx, carried, 'dropped');
      delete hero.c.carrying;
      if (heldBy(hero) !== null) release(ctx, hero, 'dropped');
      const thing = carriedBy(world, hero.id);
      if (thing !== undefined && returnPrize(world, thing) !== undefined) {
        ctx.emit('prize-returned', { heist: prizeOf(content, thing)?.heist.id ?? '', thing, by: hero.id });
      }

      delete hero.c.falls;
      const from = hero.room;
      const by = hero.c.flattened?.by ?? null;
      delete hero.c.flying;
      delete hero.c.beat;
      emitEffect(ctx, hero, { kind: 'move', room: spot.room, x: spot.x, y: spot.y });
      emitEffect(ctx, hero, { kind: 'flatten', ticks: Math.max(1, ticksOf(content.tuning.world.flattenTime)), by });
      hero.onGround = false;
      ctx.emit('thrown-out', { entity: hero.id, player: hero.player, place: d.id, from, to: spot.room });
      const way = d.follow && from !== spot.room ? doorBetween(content, from, spot.room) : undefined;
      if (way) ctx.emit('changed-room', { entity: hero.id, player: hero.player, fromRoom: from, fromDoor: way.fromDoor, toRoom: spot.room, toDoor: way.toDoor });
    }
  },
};
export default system;
