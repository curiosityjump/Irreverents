import type { Content } from '../content/types.ts';
import type { World } from '../sim/types.ts';
import { drawEntities } from './draw/entities.ts';
import { drawImpact } from './draw/impact.ts';
import { drawRoom, roomOrigin } from './draw/room.ts';

/** DRAFT: the internal resolution the art on order assumes (docs/plan/step-1.md). */
export const VIEW_W = 320;
export const VIEW_H = 180;
const SKY = '#1b1b2f';

/** One frame: the room, then everything in it. Each layer is its own file in draw/. */
export function render(g: CanvasRenderingContext2D, world: World, content: Content, roomId: string): void {
  g.fillStyle = SKY;
  g.fillRect(0, 0, VIEW_W, VIEW_H);
  const room = content.rooms[roomId];
  if (!room) return;
  const { ox, oy } = roomOrigin(room, VIEW_W, VIEW_H);
  drawRoom(g, room, ox, oy);
  drawEntities(g, world, content, roomId, ox, oy);
  drawImpact(g, world, roomId, ox, oy);
}
