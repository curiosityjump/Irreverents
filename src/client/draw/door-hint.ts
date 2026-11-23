import type { Content } from '../../content/types.ts';
import { enterDoorwayAt } from '../../sim/systems/room-doors.ts';
import type { World } from '../../sim/types.ts';
import type { PlayerView } from './entities.ts';
import { drawFrame, frameOf, look } from './fx.ts';

const MARK = '#f4f1de';
const EDGE = '#1b1b2f';

/**
 * "This doorway goes somewhere" (the owner, 2026-11-23: "There is no stick
 * to push up..."): while this page's own character stands in an enter
 * doorway, a small up-arrow bobs over it, the same moment the Use button
 * reads "Go in" (src/client/touch.ts, showGoIn). Only this player's own
 * doorway: a friend's hint would be noise on their screen.
 * DRAFT: the look. With a `door-hint` look it is drawn from that; without
 * one, a 7x6 drawn arrow with a dark edge so it reads on any wall. No
 * words, no digits (decisions-log 2026-11-23 "Doorways by Use").
 */
export function drawDoorHint(g: CanvasRenderingContext2D, world: World, content: Content, roomId: string, ox: number, oy: number, view?: PlayerView): void {
  if (!view) return;
  const me = world.entities.find((e) => e.id === view.me);
  if (!me || me.room !== roomId) return;
  const door = enterDoorwayAt(content, me);
  const room = content.rooms[roomId];
  if (!door || !room) return;
  const T = room.tile;
  const mid = ox + Math.round(door.tx * T + (door.w * T) / 2);
  // DRAFT: a one-pixel bob, every 15 frames of this page's clock (two a second at 60 fps).
  const bob = Math.floor(view.frame / 15) % 2;
  // Above the doorway, or above the character standing in it (and the player's own mark over its
  // head) when that stands taller: a big hero hides a two-tile doorway.
  // DRAFT: 20 px clears an 8 px player-mark with room to spare.
  const top = oy + Math.min(door.ty * T - 10, Math.round(me.y) - 20) - bob;
  const art = look('door-hint');
  if (art) {
    drawFrame(g, art, frameOf(art, view.frame, true), mid - Math.floor(art.w / 2), top + 6 - art.h);
    return;
  }
  // The arrow: rows 1, 3, 5, 7 px wide, then a 3 px stem; edged by one pixel.
  const rows = [1, 3, 5, 7, 3, 3];
  g.fillStyle = EDGE;
  rows.forEach((w, i) => g.fillRect(mid - Math.floor(w / 2) - 1, top + i - 1, w + 2, 3));
  g.fillStyle = MARK;
  rows.forEach((w, i) => g.fillRect(mid - Math.floor(w / 2), top + i, w, 1));
}
