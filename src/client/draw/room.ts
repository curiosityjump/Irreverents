import { TILE } from '../../content/kinds/rooms.ts';
import type { Room } from '../../content/kinds/rooms.ts';

// DRAFT: graybox colours. A tile atlas replaces these rectangles as data
// (docs/architecture.md, "Where art plugs in").
const SOLID = '#5c6378';
const SOLID_TOP = '#8d93a5';
const ONEWAY = '#c9a66b';

/** Where the room's top-left sits on the screen. DRAFT: no camera; the room is centred. Rooms larger than a screen need one (Step 3). */
export function roomOrigin(room: Room, viewW: number, viewH: number): { ox: number; oy: number } {
  return {
    ox: Math.floor((viewW - room.w * room.tile) / 2),
    oy: Math.floor((viewH - room.h * room.tile) / 2),
  };
}

export function drawRoom(g: CanvasRenderingContext2D, room: Room, ox: number, oy: number): void {
  const T = room.tile;
  for (let ty = 0; ty < room.h; ty++) {
    for (let tx = 0; tx < room.w; tx++) {
      const cell = room.cells[ty * room.w + tx];
      if (cell === TILE.solid) {
        g.fillStyle = SOLID;
        g.fillRect(ox + tx * T, oy + ty * T, T, T);
        if (ty > 0 && room.cells[(ty - 1) * room.w + tx] !== TILE.solid) {
          g.fillStyle = SOLID_TOP;
          g.fillRect(ox + tx * T, oy + ty * T, T, 2);
        }
      } else if (cell === TILE.oneway) {
        g.fillStyle = ONEWAY;
        g.fillRect(ox + tx * T, oy + ty * T, T, 4);
      }
    }
  }
  drawDoors(g, room, ox, oy);
}

// DRAFT: graybox doorway colours.
const DOORWAY = '#0d0d18';
const DOORWAY_FRAME = '#3d4254';

/**
 * Doors (Step 3). An *enter* doorway is a dark arch, so an opening reads as
 * an opening. A *walk* door draws nothing: it is simply the gap in the wall.
 * INTENT: no arrows, no glow, no text, on any door: hidden routes depend on
 * the game never pointing (docs/plan/step-3.md, "Unadvertised"). The content
 * check refuses a hidden door that would get the arch.
 */
function drawDoors(g: CanvasRenderingContext2D, room: Room, ox: number, oy: number): void {
  const T = room.tile;
  for (const door of room.doors) {
    if (door.use !== 'enter') continue;
    const x = ox + door.tx * T;
    const y = oy + door.ty * T;
    const w = door.w * T;
    const h = door.h * T;
    g.fillStyle = DOORWAY_FRAME;
    g.fillRect(x, y + 4, w, h - 4);
    g.fillRect(x + 2, y + 1, w - 4, 3);
    g.fillStyle = DOORWAY;
    g.fillRect(x + 2, y + 5, w - 4, h - 5);
    g.fillRect(x + 4, y + 3, w - 8, 2);
  }
}
