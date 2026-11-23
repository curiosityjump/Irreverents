import type { Content } from '../content/types.ts';
import type { World } from '../sim/types.ts';
import { drawAlert, drawBells } from './draw/alert.ts';
import { drawAudience } from './draw/audience.ts';
import { drawAway } from './draw/away.ts';
import { drawBackdrop, drawFrontLayers } from './draw/backdrop.ts';
import { drawDecor } from './draw/decor.ts';
import { drawEntities } from './draw/entities.ts';
import type { PlayerView } from './draw/entities.ts';
import { drawHall } from './draw/hall.ts';
import { drawImpact } from './draw/impact.ts';
import { drawNpcs } from './draw/npcs.ts';
import { drawSignalers } from './draw/outpost.ts';
import { backdropOf, decorOf, drawDoors, drawRoom, roomOrigin } from './draw/room.ts';
import { drawRoomParts } from './draw/room-parts.ts';

/** DRAFT: the internal resolution the art on order assumes (docs/plan/step-1.md). */
export const VIEW_W = 320;
export const VIEW_H = 180;
/**
 * The view, game pixels. `reserve`: how much of its bottom the touch
 * controls sit over (the shell sets it; 0 when they sit outside the view),
 * which the camera keeps the floor and the player above (draw/room.ts).
 */
export const view = { w: VIEW_W, h: VIEW_H, reserve: 0 };
const SKY = '#1b1b2f';

/**
 * One frame: the room, then everything in it. Each layer is its own file in draw/.
 * `world` is what this player should see: their own character and everyone
 * else's as received. With `view`, the camera follows `view.me` and what was
 * drawn is recorded in `view.drawn`. Returns the camera (room pixels at the
 * screen's top-left).
 * The frame is `view.w` × `view.h`, which the shell sets (narrower and
 * taller when the phone is upright); nothing here assumes 320×180.
 * The order is the art contract's (docs/mechanisms/art-pipeline.md, "Draw
 * order"): sky and backdrop layers, back wall, far decoration, ground,
 * doors and working parts, back decoration, bodies, effects, front
 * decoration, marks over heads and speech, screen furniture.
 */
export function render(g: CanvasRenderingContext2D, world: World, content: Content, roomId: string, pv?: PlayerView): { x: number; y: number } {
  const W = view.w;
  const H = view.h;
  const room = content.rooms[roomId];
  if (!room) {
    g.fillStyle = SKY;
    g.fillRect(0, 0, W, H);
    return { x: 0, y: 0 };
  }
  const mine = pv ? world.entities.find((e) => e.id === pv.me) : undefined;
  const box = mine ? content.characters[mine.kind]?.box : undefined;
  const focus = mine ? { x: mine.x + (box?.w ?? 0) / 2, y: mine.y + (box?.h ?? 0) / 2 } : undefined;
  const feet = mine && box ? mine.y + box.h : undefined;
  const { ox, oy } = roomOrigin(room, W, H, focus, view.reserve, feet);
  const backdrop = backdropOf(room, content);
  if (backdrop) drawBackdrop(g, backdrop, room, -ox, -oy, W, H, SKY);
  else {
    g.fillStyle = SKY;
    g.fillRect(0, 0, W, H);
  }
  drawRoom(g, room, ox, oy, content, world, W, H);
  drawDoors(g, room, ox, oy, content, world.tick);
  drawRoomParts(g, world, room, ox, oy, content);
  drawBells(g, world, content, roomId, ox, oy);
  const decor = decorOf(room, content);
  drawDecor(g, decor, 'back', room.tile, ox, oy, W, H);
  drawEntities(g, world, content, roomId, ox, oy, pv);
  drawSignalers(g, world, content, roomId, ox, oy);
  drawAway(g, world, content, roomId, ox, oy, pv);
  // Round 2: backdrop layers marked `front` (foreground foliage along the bottom or top edge).
  if (backdrop) drawFrontLayers(g, backdrop, room, -ox, -oy, W, H);
  // DRAFT: front decoration before the impact pass, not after the effects: drawImpact shakes the
  // finished picture, and a blade of grass that stayed still while the world shook would show.
  drawDecor(g, decor, 'front', room.tile, ox, oy, W, H);
  drawImpact(g, world, roomId, ox, oy);
  drawNpcs(g, world, content, roomId, ox, oy);
  drawAlert(g, world, content, roomId, ox, oy);
  drawAudience(g, world, content, roomId, ox, oy);
  drawHall(g, world, content, roomId, ox, oy);
  return { x: -ox, y: -oy };
}
