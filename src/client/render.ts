import { drawRecruitCalls, drawRecruitFlash, drawRecruits } from './draw/recruits.ts';
import type { Content } from '../content/types.ts';
import type { World } from '../sim/types.ts';
import { drawAlert, drawBells } from './draw/alert.ts';
import { drawAudience } from './draw/audience.ts';
import { drawAway } from './draw/away.ts';
import { drawCantina, drawCantinaBell, drawDoorRefused } from './draw/cantina.ts';
import { drawBackdrop, drawFrontLayers } from './draw/backdrop.ts';
import { drawDecor } from './draw/decor.ts';
import { drawDoorHint } from './draw/door-hint.ts';
import { drawEntities } from './draw/entities.ts';
import { watchWords } from './draw/fx.ts';
import type { PlayerView } from './draw/entities.ts';
import { drawHall } from './draw/hall.ts';
import { drawImpact } from './draw/impact.ts';
import { drawLevelBanner, drawLevelEntrances, drawLevelSigns } from './draw/levels.ts';
import { drawCompletion, drawCompletionRow } from './draw/completion.ts';
import { drawNpcs } from './draw/npcs.ts';
import { drawSignalers } from './draw/outpost.ts';
import { backdropOf, decorOf, drawDoors, drawRoom, roomOrigin } from './draw/room.ts';
import { drawRoomParts } from './draw/room-parts.ts';
import { drawBanners } from './draw/banner.ts';
import { drawHud } from './draw/hud.ts';
import { drawUseHint } from './draw/use-hint.ts';
import { drawSight, drawUnseenMarks } from './draw/sight.ts';
import { drawPrizeStands } from './draw/heist.ts';
import { useHere } from '../sim/use.ts';

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
  watchWords(g); // every string drawn into the picture is recorded (draw/fx.ts, takeWords)
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
  drawLevelEntrances(g, world, content, roomId, ox, oy);
  drawRoomParts(g, world, room, ox, oy, content);
  drawLevelSigns(g, content);
  drawCompletion(g, world, content, roomId, ox, oy, W, pv);
  drawBells(g, world, content, roomId, ox, oy);
  drawCantinaBell(g, world, content, roomId, ox, oy);
  const decor = decorOf(room, content);
  drawDecor(g, decor, 'back', room.tile, ox, oy, W, H);
  // Step 19: a taken prize's empty stand (draw/heist.ts, which also fills the plate's cargo slot).
  drawPrizeStands(g, world, content, roomId, ox, oy);
  // Step 19: every person's sight, faint, behind the bodies (draw/sight.ts).
  drawSight(g, world, content, roomId, ox, oy);
  drawEntities(g, world, content, roomId, ox, oy, pv);
  // Step 13: a captive in a cage, the bars over them (src/client/draw/recruits.ts).
  drawRecruits(g, world, content, roomId, ox, oy, pv);
  drawSignalers(g, world, content, roomId, ox, oy);
  drawAway(g, world, content, roomId, ox, oy, pv);
  // Round 2: backdrop layers marked `front` (foreground foliage along the bottom or top edge).
  if (backdrop) drawFrontLayers(g, backdrop, room, -ox, -oy, W, H);
  // DRAFT: front decoration before the impact pass, not after the effects: drawImpact shakes the
  // finished picture, and a blade of grass that stayed still while the world shook would show.
  drawDecor(g, decor, 'front', room.tile, ox, oy, W, H);
  drawImpact(g, world, roomId, ox, oy);
  drawDoorHint(g, world, content, roomId, ox, oy, pv);
  // Step 19: the mark over what a press of Use would act on (the button names it: use-prompt.ts).
  if (pv && mine && mine.room === roomId) drawUseHint(g, useHere(world, content, mine), ox, oy, pv.frame, mine.y);
  drawNpcs(g, world, content, roomId, ox, oy);
  drawUnseenMarks(g, roomId, ox, oy);
  drawRecruitCalls(g, world, content, roomId, ox, oy);
  drawAlert(g, world, content, roomId, ox, oy);
  drawAudience(g, world, content, roomId, ox, oy);
  drawHall(g, world, content, roomId, ox, oy);
  drawDoorRefused(g, world, content, roomId, ox, oy, pv?.me);
  drawCantina(g, world, content, roomId, pv?.me);
  drawLevelBanner(g, world, content, roomId, W, pv);
  drawCompletionRow(g, world, content, W, pv);
  // Step 19: the party plate, then the one banner queue (draw/banner.ts), clear of it; last, as screen furniture.
  if (pv) drawBanners(g, W, pv.frame, drawHud(g, world, content, mine, pv.frame));
  // Step 13: a freed hero's face flashing beside the plate (draw/recruits.ts).
  if (pv) drawRecruitFlash(g, content, pv.frame);
  return { x: -ox, y: -oy };
}
