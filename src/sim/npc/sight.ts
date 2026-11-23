import { TILE } from '../../content/kinds/rooms.ts';
import type { Room } from '../../content/kinds/rooms.ts';
import type { Content } from '../../content/types.ts';
import type { Entity } from '../types.ts';
import { centre, isOut } from './state.ts';

/** How far apart, in pixels, the points checked along a line of sight are. Under half a tile. */
const SAMPLE = 4;

function solidAt(room: Room, x: number, y: number): boolean {
  const tx = Math.floor(x / room.tile);
  const ty = Math.floor(y / room.tile);
  if (tx < 0 || ty < 0 || tx >= room.w || ty >= room.h) return true;
  return room.cells[ty * room.w + tx] === TILE.solid;
}

/** No solid tile on the straight line between two points. One-way platforms do not block sight. */
export function lineClear(room: Room, a: { x: number; y: number }, b: { x: number; y: number }): boolean {
  const n = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / SAMPLE);
  for (let i = 1; i < n; i++) {
    if (solidAt(room, a.x + ((b.x - a.x) * i) / n, a.y + ((b.y - a.y) * i) / n)) return false;
  }
  return true;
}

/**
 * Whether `watcher` sees `target` right now.
 * DRAFT (the Step 4 lead's call, in docs/decisions-log.md): the simplest
 * thing that makes sneaking a choice. Same room; the target is in front,
 * the way the watcher faces; within npcSightRange across and npcSightHeight
 * up or down, measured between the middles of the two bodies; and no solid
 * tile on the straight line between them. Someone out cold sees nothing,
 * and nobody sees a body that is hiding in a hiding place.
 */
export function canSee(content: Content, watcher: Entity, target: Entity): boolean {
  if (watcher.room !== target.room || isOut(watcher)) return false;
  // INTENT (slice 2; Step 3 sets `c.roomHide` and leaves its meaning to Step 4): a body hiding (standing still in a hiding place) is not seen.
  if (target.c.roomHide) return false;
  const room = content.rooms[watcher.room];
  if (!room) return false;
  const { npcSightRange, npcSightHeight } = content.tuning.world;
  const a = centre(content, watcher);
  const b = centre(content, target);
  const dx = b.x - a.x;
  if (dx * watcher.facing < 0) return false;
  if (Math.abs(dx) > npcSightRange! || Math.abs(b.y - a.y) > npcSightHeight!) return false;
  return lineClear(room, a, b);
}

/**
 * Step 19: the box canSee tests for this watcher now, in room pixels: a
 * target whose middle is inside it (edges included) is in front, within
 * range and within height; canSee then needs the line from `eye` (the
 * watcher's middle) to that middle clear of solid tiles (lineClear). Nothing
 * when canSee would see nothing (out cold, no room). The page draws it
 * (src/client/draw/sight.ts), so it must stay this function's twin: change
 * one, change both. canSee's answers are not changed by it.
 * DRAFT: Step 19 push 3 (decisions-log "Step 19").
 */
export function sightBox(content: Content, watcher: Entity): { eye: { x: number; y: number }; x0: number; x1: number; y0: number; y1: number } | undefined {
  if (isOut(watcher) || !content.rooms[watcher.room]) return undefined;
  const { npcSightRange, npcSightHeight } = content.tuning.world;
  const eye = centre(content, watcher);
  const reach = npcSightRange!;
  // dx * facing >= 0 and |dx| <= range: from the eye forward, the eye's own column included.
  const x0 = watcher.facing < 0 ? eye.x - reach : eye.x;
  const x1 = watcher.facing < 0 ? eye.x : eye.x + reach;
  return { eye, x0, x1, y0: eye.y - npcSightHeight!, y1: eye.y + npcSightHeight! };
}
