import { canAct } from '../body-state.ts';
import { heartsOut } from '../hearts.ts';
import { emitEffect } from '../effects.ts';
import { boxInSolid, memberTaken } from '../party.ts';
import type { Entity, StepContext, System } from '../types.ts';

declare module '../types.ts' {
  interface EventMap {
    /** Step 21, hearts: `from` (a kind) is out of hearts, so its player is now `to`, standing `where` ('here' or the room's 'way-in'). */
    'hero-out': { entity: string; player: string | null; from: string; to: string; where: 'here' | 'way-in' };
  }
}

/**
 * Step 21, hearts (docs/mechanisms/defeat.md, "Hearts"): a hero with no
 * hearts is out. Once they would get up (no longer flattened, held or
 * flying), their player is moved to the next party member with hearts that
 * nobody else plays (the switch's order and its fit rule, forced), by a
 * `become` effect: where they stand if that body fits there, else at the
 * room's way in (its first spawn). Every member with hearts taken by a
 * friend: the first with hearts again (the fourth friend's rule, party.ts),
 * so nobody is ever left without a hero. No member with hearts: nothing
 * here (that is the game over, heart-game-over).
 *
 * INTENT (CLAUDE.md, "There is always a way out"): the new body is never put
 * inside a wall; a spot where it does not fit is never used.
 * INTENT: only the server's world forces it (`World.taken` is set only in a
 * page's world): the page is told by the effect, as by any switch the world
 * makes, and never does it a second time itself.
 * DRAFT (docs/decisions-log.md, "Step 21: hearts"): the way in is the room's
 * first spawn.
 * Runs after heart-lose (580) and before the place rules (defeat-seize, 585).
 */
const system: System = {
  id: 'heart-out',
  order: 582,
  run(ctx) {
    const { world, content } = ctx;
    if (!content.hearts?.on || world.taken !== undefined) return;
    for (const e of world.entities) {
      if (e.player === null || !heartsOut(world, content, e.kind) || !canAct(e) || e.c.seized) continue;
      const next = nextWithHearts(ctx, e);
      if (!next) continue;
      const spot = spotFor(ctx, e, next);
      if (!spot) continue;
      const from = e.kind;
      emitEffect(ctx, e, { kind: 'become', to: next, x: spot.x, y: spot.y });
      if (e.c.jump) {
        e.c.jump.buffer = 0;
        e.c.jump.cut = true;
      }
      ctx.emit('hero-out', { entity: e.id, player: e.player, from, to: next, where: spot.where });
      ctx.emit('switched', { entity: e.id, player: e.player, from, to: next });
    }
  },
};
export default system;

/** The next party member after `e`'s with hearts that nobody else plays; else the first with hearts. */
export function nextWithHearts(ctx: StepContext, e: Entity): string | undefined {
  const { world, content } = ctx;
  const members = world.party ?? content.party.members;
  const at = Math.max(0, members.indexOf(e.kind));
  const order = members.map((_, i) => members[(at + 1 + i) % members.length]!).filter((m) => m !== e.kind && !heartsOut(world, content, m) && m in content.characters);
  return order.find((m) => !memberTaken(world, m, e.id)) ?? order[0];
}

/** Where `e` stands as `to`: feet and middle kept if it fits, slid at most its extra half-width; else the room's first spawn; else nowhere. */
export function spotFor(ctx: StepContext, e: Entity, to: string): { x: number; y: number; where: 'here' | 'way-in' } | undefined {
  const room = ctx.content.rooms[e.room];
  const old = ctx.content.characters[e.kind];
  const next = ctx.content.characters[to];
  if (!room || !old || !next) return undefined;
  const x = e.x + (old.box.w - next.box.w) / 2;
  const y = e.y + old.box.h - next.box.h;
  const reach = Math.max(0, Math.ceil((next.box.w - old.box.w) / 2));
  for (let k = 0; k <= reach; k++) {
    if (!boxInSolid(room, x + k, y, next.box.w, next.box.h, ctx.world)) return { x: x + k, y, where: 'here' };
    if (k > 0 && !boxInSolid(room, x - k, y, next.box.w, next.box.h, ctx.world)) return { x: x - k, y, where: 'here' };
  }
  const s = room.spawns[0];
  if (!s) return undefined;
  const T = room.tile;
  const sx = (s.tx + 0.5) * T - next.box.w / 2;
  const sy = (s.ty + 1) * T - next.box.h;
  return boxInSolid(room, sx, sy, next.box.w, next.box.h, ctx.world) ? undefined : { x: sx, y: sy, where: 'way-in' };
}
