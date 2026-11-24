import { canAct } from '../body-state.ts';
import { emitEffect, heldBy } from '../effects.ts';
import { boxInSolid } from '../party.ts';
import { inPart, partsOfKind } from '../room-parts.ts';
import type { Part, Room } from '../../content/kinds/rooms.ts';
import type { Entity, StepContext, System } from '../types.ts';

/** The part kind of a false wall (src/sim/systems/room-false-wall.ts). */
const FALSE_WALL = 'false-wall';
/** DRAFT: how far either way (pixels) a body is looked for room for. A false wall is a few tiles deep. */
const LOOK = 160;

/**
 * Step 5 (the owner, playing: "The king keeps getting stuck in the wall too";
 * docs/plan/step-5.md, "Knocked-out enemies fly off", part 3). A false wall
 * is drawn exactly as wall and stops nobody (room-false-wall.ts, INTENT:
 * unadvertised). Every hero comes into the throne room from the street door,
 * east, so every blow sends the king west, off the dais and into the false
 * wall behind the throne, where he lay drawn inside the wall for good (he has
 * no legs).
 *
 * INTENT: a body nobody plays never comes to rest in a false wall. On the
 * tick one is found there at rest (on the ground and still; not flying, not
 * in a held beat, not held; a person who can walk and act is left to walk), it
 * is put (a `move` effect, never a launch) at the nearest place along its
 * row east of it where its box overlaps no false wall and no solid tile,
 * else the nearest west (the throne room's hidden door is west). A hero
 * still walks through and stands in it (the secret is theirs to find), and a
 * body still flies through it (the king thrown through the window into the
 * undercroft: step6-king-through-the-window).
 * DRAFT: along the row only; a body with no room within LOOK is left where it is.
 * Runs after room-doors (600), so a body that went through the hidden door
 * this tick is already in the undercroft.
 */
const system: System = {
  id: 'rest-out-of-false-wall',
  order: 601,
  run(ctx) {
    const walls = partsOfKind(ctx.content, FALSE_WALL);
    if (walls.length === 0) return;
    for (const e of ctx.world.entities) {
      if (e.player !== null || e.c.flying || e.c.beat || heldBy(e) !== null) continue;
      // At rest: on the ground and still. A body sent at speed without a flight (step3-through-the-window) is moving.
      if (!e.onGround || Math.abs(e.vx) >= 1 || Math.abs(e.vy) >= 1) continue;
      const kind = ctx.content.characters[e.kind];
      const box = kind?.box;
      if (!kind || !box) continue;
      // A person who can walk and act stands where they choose (a guard following a hero, step4-guard-follows-seen).
      if (kind.verbs.includes('move') && canAct(e)) continue;
      const here = walls.filter((w) => w.room.id === e.room);
      if (!here.some((w) => inPart(ctx.content, e, w.room, w.part))) continue;
      const room = here[0]!.room;
      const x = roomFor(ctx, room, here.map((w) => w.part), e, box);
      if (x !== null) emitEffect(ctx, e, { kind: 'move', room: room.id, x, y: e.y });
    }
  },
};
export default system;

function roomFor(ctx: StepContext, room: Room, parts: Part[], e: Entity, box: { w: number; h: number }): number | null {
  const T = room.tile;
  const inWall = (x: number): boolean =>
    parts.some((p) => p.tiles.some((t) => x < (t.tx + 1) * T && x + box.w > t.tx * T && e.y < (t.ty + 1) * T && e.y + box.h > t.ty * T));
  const fits = (x: number): boolean => x >= 0 && x + box.w <= room.w * T && !inWall(x) && !boxInSolid(room, x, e.y, box.w, box.h, ctx.world);
  // East (the room's side of the throne room's false wall) first, then west: the hidden door is west of it.
  for (let d = 1; d <= LOOK; d++) if (fits(e.x + d)) return e.x + d;
  for (let d = 1; d <= LOOK; d++) if (fits(e.x - d)) return e.x - d;
  return null;
}
