import type { Content } from '../content/types.ts';
import type { World } from '../sim/types.ts';
import { drawAudience } from './draw/audience.ts';
import { drawEntities } from './draw/entities.ts';
import type { PlayerView } from './draw/entities.ts';
import { drawHall } from './draw/hall.ts';
import { drawImpact } from './draw/impact.ts';
import { drawNpcs } from './draw/npcs.ts';
import { drawRoom, roomOrigin } from './draw/room.ts';
import { drawRoomParts } from './draw/room-parts.ts';

/** DRAFT: the internal resolution the art on order assumes (docs/plan/step-1.md). */
export const VIEW_W = 320;
export const VIEW_H = 180;
const SKY = '#1b1b2f';

/**
 * One frame: the room, then everything in it. Each layer is its own file in draw/.
 * `world` is what this player should see: their own character and everyone
 * else's as received. With `view`, the camera follows `view.me` and what was
 * drawn is recorded in `view.drawn`. Returns the camera (room pixels at the
 * screen's top-left).
 */
export function render(g: CanvasRenderingContext2D, world: World, content: Content, roomId: string, view?: PlayerView): { x: number; y: number } {
  g.fillStyle = SKY;
  g.fillRect(0, 0, VIEW_W, VIEW_H);
  const room = content.rooms[roomId];
  if (!room) return { x: 0, y: 0 };
  const mine = view ? world.entities.find((e) => e.id === view.me) : undefined;
  const box = mine ? content.characters[mine.kind]?.box : undefined;
  const focus = mine ? { x: mine.x + (box?.w ?? 0) / 2, y: mine.y + (box?.h ?? 0) / 2 } : undefined;
  const { ox, oy } = roomOrigin(room, VIEW_W, VIEW_H, focus);
  drawRoom(g, room, ox, oy, content);
  drawRoomParts(g, world, room, ox, oy);
  drawEntities(g, world, content, roomId, ox, oy, view);
  drawImpact(g, world, roomId, ox, oy);
  drawNpcs(g, world, content, roomId, ox, oy);
  drawAudience(g, world, content, roomId, ox, oy);
  drawHall(g, world, content, roomId, ox, oy);
  return { x: -ox, y: -oy };
}
