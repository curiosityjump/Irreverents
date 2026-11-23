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
 * tile on the straight line between them. Someone out cold sees nothing.
 */
export function canSee(content: Content, watcher: Entity, target: Entity): boolean {
  if (watcher.room !== target.room || isOut(watcher)) return false;
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
