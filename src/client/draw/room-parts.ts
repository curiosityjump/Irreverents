import { TILE } from '../../content/kinds/rooms.ts';
import type { Part, Room } from '../../content/kinds/rooms.ts';
import type { World } from '../../sim/types.ts';

// DRAFT: graybox colours. SOLID and SOLID_TOP must stay equal to
// draw/room.ts's, or a false wall stops looking like the wall around it.
const SOLID = '#5c6378';
const SOLID_TOP = '#8d93a5';
const CRACK = '#2e3242';
const PLATE = '#b8b08d';
const PLATE_DOWN = '#7d775f';
const GATE = '#9a8f6a';
const GATE_DARK = '#4a4433';
const PANE = '#a9c4d6';
const PANE_LIGHT = '#d5e4ee';
const FRAME = '#3d4254';
const HIDE = '#6b3f4f';
const HIDE_FOLD = '#4f2d3a';

/**
 * Working parts (Step 3): plates, gates, breakable walls and windows, false
 * walls, hiding places. drawRoom draws the room file's tiles only, so every
 * part draws itself here from the world's run-time state.
 *
 * INTENT: no arrow, no glow, no text, nothing that points
 * (docs/plan/step-3.md, "Unadvertised"). A false wall is drawn exactly as
 * the wall around it; a breakable wall is wall with a crack, the library's
 * own "suspicious cracked wall".
 * DRAFT: parts are drawn behind bodies, so a body walking into a false wall
 * stays visible in front of it (docs/decisions-log.md).
 */
export function drawRoomParts(g: CanvasRenderingContext2D, world: World, room: Room, ox: number, oy: number): void {
  if (room.parts.length === 0) return;
  const T = room.tile;
  const memory = world.rooms?.[room.id]?.parts ?? {};
  // Cells that look like wall: the room file's solid tiles, false walls and unbroken wall-look breakables.
  const wallLook = new Set<number>();
  for (const part of room.parts) {
    const asWall = part.kind === 'false-wall' || (part.kind === 'breakable' && part.params.look !== 'window' && !memory[part.id]?.broken);
    if (asWall) for (const t of part.tiles) wallLook.add(t.ty * room.w + t.tx);
  }
  const looksSolid = (tx: number, ty: number): boolean =>
    tx >= 0 && ty >= 0 && tx < room.w && ty < room.h && (room.cells[ty * room.w + tx] === TILE.solid || wallLook.has(ty * room.w + tx));

  for (const part of room.parts) {
    const s = memory[part.id] ?? {};
    for (const t of part.tiles) {
      const x = ox + t.tx * T;
      const y = oy + t.ty * T;
      if (wallLook.has(t.ty * room.w + t.tx)) {
        g.fillStyle = SOLID;
        g.fillRect(x, y, T, T);
        if (t.ty > 0 && !looksSolid(t.tx, t.ty - 1)) {
          g.fillStyle = SOLID_TOP;
          g.fillRect(x, y, T, 2);
        }
        // drawRoom gave the wall tile below a lit top edge, because the room file says this tile is empty: paint it out.
        if (t.ty + 1 < room.h && room.cells[(t.ty + 1) * room.w + t.tx] === TILE.solid) {
          g.fillStyle = SOLID;
          g.fillRect(x, y + T, T, 2);
        }
      }
    }
    if (part.kind === 'plate') drawPlate(g, part, s.down === true, T, ox, oy);
    else if (part.kind === 'gate') drawGate(g, part, s.open === true, T, ox, oy);
    else if (part.kind === 'breakable') drawBreakable(g, part, s.broken === true, T, ox, oy);
    else if (part.kind === 'hide') drawHide(g, part, T, ox, oy);
  }
}

function drawPlate(g: CanvasRenderingContext2D, part: Part, down: boolean, T: number, ox: number, oy: number): void {
  for (const t of part.tiles) {
    g.fillStyle = down ? PLATE_DOWN : PLATE;
    const h = down ? 1 : 3;
    g.fillRect(ox + t.tx * T + 1, oy + (t.ty + 1) * T - h, T - 2, h);
  }
}

function drawGate(g: CanvasRenderingContext2D, part: Part, open: boolean, T: number, ox: number, oy: number): void {
  const top = Math.min(...part.tiles.map((t) => t.ty));
  for (const t of part.tiles) {
    const x = ox + t.tx * T;
    const y = oy + t.ty * T;
    // Open: the gate is drawn up, only its foot showing under the lintel.
    if (open && t.ty !== top) continue;
    const h = open ? 4 : T;
    g.fillStyle = GATE_DARK;
    g.fillRect(x, y, T, h);
    g.fillStyle = GATE;
    for (let bar = 2; bar < T; bar += 5) g.fillRect(x + bar, y, 2, h);
    if (!open) g.fillRect(x, y + 6, T, 2);
  }
}

function drawBreakable(g: CanvasRenderingContext2D, part: Part, broken: boolean, T: number, ox: number, oy: number): void {
  const window = part.params.look === 'window';
  for (const t of part.tiles) {
    const x = ox + t.tx * T;
    const y = oy + t.ty * T;
    if (window) {
      // A paler pane in a frame; broken, the frame and a few shards are left.
      g.fillStyle = FRAME;
      g.fillRect(x, y, T, T);
      if (!broken) {
        g.fillStyle = PANE;
        g.fillRect(x + 2, y + 1, T - 4, T - 2);
        g.fillStyle = PANE_LIGHT;
        g.fillRect(x + 4, y + 3, 2, T - 6);
      } else {
        g.fillStyle = '#0d0d18';
        g.fillRect(x + 2, y, T - 4, T);
        g.fillStyle = PANE;
        g.fillRect(x + 2, y, 2, 3);
        g.fillRect(x + T - 5, y + T - 4, 3, 4);
      }
    } else if (!broken) {
      // The wall itself was painted above; this is the crack.
      g.fillStyle = CRACK;
      g.fillRect(x + 7, y, 1, 5);
      g.fillRect(x + 8, y + 4, 1, 5);
      g.fillRect(x + 6, y + 8, 1, 4);
      g.fillRect(x + 7, y + 11, 1, 5);
      g.fillRect(x + 9, y + 6, 3, 1);
    } else {
      // Rubble on the floor of the opening.
      const bottom = Math.max(...part.tiles.map((q) => q.ty));
      if (t.ty !== bottom) continue;
      g.fillStyle = SOLID;
      g.fillRect(x + 1, y + T - 3, 4, 3);
      g.fillRect(x + 9, y + T - 2, 5, 2);
    }
  }
}

function drawHide(g: CanvasRenderingContext2D, part: Part, T: number, ox: number, oy: number): void {
  // DRAFT: a graybox curtain.
  for (const t of part.tiles) {
    const x = ox + t.tx * T;
    const y = oy + t.ty * T;
    g.fillStyle = HIDE;
    g.fillRect(x, y, T, T);
    g.fillStyle = HIDE_FOLD;
    for (let fold = 3; fold < T; fold += 5) g.fillRect(x + fold, y, 1, T);
  }
}
