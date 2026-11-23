import { TILE } from '../content/kinds/rooms.ts';
import type { Content } from '../content/types.ts';
import type { World } from '../sim/types.ts';

/** DRAFT: the internal resolution the art on order assumes (docs/plan/step-1.md). */
export const VIEW_W = 320;
export const VIEW_H = 180;

// DRAFT: graybox colours. Tile atlases and sprite sheets replace these
// rectangles as data (docs/architecture.md, "Where art plugs in").
const SKY = '#1b1b2f';
const SOLID = '#5c6378';
const SOLID_TOP = '#8d93a5';
const ONEWAY = '#c9a66b';

export function render(g: CanvasRenderingContext2D, world: World, content: Content, roomId: string): void {
  const room = content.rooms[roomId];
  g.fillStyle = SKY;
  g.fillRect(0, 0, VIEW_W, VIEW_H);
  if (!room) return;
  const T = room.tile;
  // DRAFT: no camera; the room is centred. Rooms larger than a screen need one (Step 3).
  const ox = Math.floor((VIEW_W - room.w * T) / 2);
  const oy = Math.floor((VIEW_H - room.h * T) / 2);

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

  for (const e of world.entities) {
    if (e.room !== roomId) continue;
    const kind = content.characters[e.kind];
    if (!kind) continue;
    const x = ox + Math.round(e.x);
    const y = oy + Math.round(e.y);
    g.fillStyle = kind.color;
    g.fillRect(x, y, kind.box.w, kind.box.h);
    // An eye, so facing reads at a glance.
    g.fillStyle = '#1b1b2f';
    g.fillRect(e.facing > 0 ? x + kind.box.w - 4 : x + 2, y + 5, 2, 3);
  }
}
