import { TILE } from '../../content/kinds/rooms.ts';
import type { Room } from '../../content/kinds/rooms.ts';
import type { Content } from '../../content/types.ts';
import { image } from './images.ts';

// DRAFT: graybox colours, used for any room with no file in content/atlases/.
const SOLID = '#5c6378';
const SOLID_TOP = '#8d93a5';
const ONEWAY = '#c9a66b';

/**
 * Where the room's top-left sits on the screen (ox, oy: add them to a room
 * position to get a screen position).
 * DRAFT: the first camera (Step 1 Gate 2; Step 3 owns it from here): each
 * player's own view follows their own character, centred on `focus`, and
 * stops at the room's edges. A room smaller than the screen is centred.
 */
export function roomOrigin(room: Room, viewW: number, viewH: number, focus?: { x: number; y: number }): { ox: number; oy: number } {
  const along = (roomSize: number, view: number, at: number | undefined): number => {
    if (roomSize <= view || at === undefined) return Math.floor((view - roomSize) / 2);
    return -Math.max(0, Math.min(roomSize - view, Math.round(at - view / 2)));
  };
  return { ox: along(room.w * room.tile, viewW, focus?.x), oy: along(room.h * room.tile, viewH, focus?.y) };
}

/**
 * INTENT: art replaces rectangles as DATA. A room with a file in
 * content/atlases/ (named after the room) draws its tiles from that image;
 * a room without one keeps its graybox rectangles. No code changes when art
 * arrives (docs/architecture.md, "Where art plugs in").
 */
export function drawRoom(g: CanvasRenderingContext2D, room: Room, ox: number, oy: number, content?: Content): void {
  const T = room.tile;
  const atlas = content?.atlases[room.id];
  const sheet = atlas ? image(atlas.image) : null;
  for (let ty = 0; ty < room.h; ty++) {
    for (let tx = 0; tx < room.w; tx++) {
      const cell = room.cells[ty * room.w + tx];
      if (cell !== TILE.solid && cell !== TILE.oneway) continue;
      const x = ox + tx * T;
      const y = oy + ty * T;
      const open = cell === TILE.solid && ty > 0 && room.cells[(ty - 1) * room.w + tx] !== TILE.solid;
      if (atlas && sheet) {
        const [c, r] = cell === TILE.oneway ? atlas.cells.oneway : open ? atlas.cells.solidTop : atlas.cells.solid;
        g.drawImage(sheet, c * atlas.tile, r * atlas.tile, atlas.tile, atlas.tile, x, y, T, T);
      } else if (cell === TILE.solid) {
        g.fillStyle = SOLID;
        g.fillRect(x, y, T, T);
        if (open) {
          g.fillStyle = SOLID_TOP;
          g.fillRect(x, y, T, 2);
        }
      } else {
        g.fillStyle = ONEWAY;
        g.fillRect(x, y, T, 4);
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
