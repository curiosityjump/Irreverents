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
}
