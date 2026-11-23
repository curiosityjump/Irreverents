import { TILE } from '../../content/kinds/rooms.ts';
import type { Atlas } from '../../content/kinds/atlases.ts';
import type { Room } from '../../content/kinds/rooms.ts';

/**
 * Ground that joins up (docs/mechanisms/art-pipeline.md, "Ground"). Pure
 * drawing: given which tiles look solid, it picks each tile's cell from the
 * atlas's 4×4 block, closes inside corners, varies big walls by a fixed
 * hash of the position (nothing random: two screens show the same thing),
 * and hangs `top` / `under` pieces into the open tiles beside a surface.
 * The caller (draw/room.ts) draws it once into an offscreen canvas.
 */

type Cell = [number, number];
/** A fixed hash of a tile position; `salt` keeps the fill, top and under choices independent. */
export function tileHash(tx: number, ty: number, salt: number): number {
  let h = (Math.imul(tx, 374761393) + Math.imul(ty, 668265263) + Math.imul(salt, 1442695041)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return (h ^ (h >>> 16)) >>> 0;
}

const pick = <T>(list: T[] | undefined, tx: number, ty: number, salt: number): T | undefined =>
  list && list.length > 0 ? list[tileHash(tx, ty, salt) % list.length] : undefined;

const isCell = (c: unknown): c is Cell => Array.isArray(c) && c.length === 2 && c[0] >= 0 && c[1] >= 0;

/**
 * Draws the ground for tiles tx0..tx1-1, ty0..ty1-1 (room tile coordinates,
 * which may run past the room's edges), with tile (0, 0)'s top-left at
 * (px, py) on `g`. `solid(tx, ty)` is the "looks solid" set
 * (draw/room-parts.ts, `solidLook`), already continued past the edges.
 */
export function drawGround(
  g: CanvasRenderingContext2D,
  room: Room,
  atlas: Atlas,
  sheet: CanvasImageSource,
  solid: (tx: number, ty: number) => boolean,
  tx0: number,
  ty0: number,
  tx1: number,
  ty1: number,
  px: number,
  py: number,
): void {
  const S = atlas.tile;
  const T = room.tile;
  const auto = atlas.autotile && isCell(atlas.autotile.origin) ? atlas.autotile : undefined;
  const put = (c: Cell | undefined, tx: number, ty: number): void => {
    if (!c || c[0] < 0 || c[1] < 0) return;
    g.drawImage(sheet, c[0] * S, c[1] * S, S, S, px + tx * T, py + ty * T, T, T);
  };
  const oneway = (tx: number, ty: number): boolean =>
    tx >= 0 && ty >= 0 && tx < room.w && ty < room.h && room.cells[ty * room.w + tx] === TILE.oneway;

  // Solid tiles first, then the pieces that hang off them, so a tuft is never covered by its neighbour.
  for (let ty = ty0; ty < ty1; ty++) {
    for (let tx = tx0; tx < tx1; tx++) {
      if (!solid(tx, ty)) {
        if (oneway(tx, ty)) {
          const l = oneway(tx - 1, ty);
          const r = oneway(tx + 1, ty);
          const o = auto?.oneway;
          const c = o ? (l && r ? o.mid : l ? o.right : r ? o.left : o.single) : undefined;
          put(isCell(c) ? c : atlas.cells.oneway, tx, ty);
        }
        continue;
      }
      const n = solid(tx, ty - 1);
      if (!auto) {
        put(n ? atlas.cells.solid : atlas.cells.solidTop, tx, ty);
        continue;
      }
      const index = (n ? 1 : 0) + (solid(tx + 1, ty) ? 2 : 0) + (solid(tx, ty + 1) ? 4 : 0) + (solid(tx - 1, ty) ? 8 : 0);
      if (index !== 15) {
        put([auto.origin[0] + (index % 4), auto.origin[1] + Math.floor(index / 4)], tx, ty);
        continue;
      }
      put(pick(auto.fill, tx, ty, 1) ?? [auto.origin[0] + 3, auto.origin[1] + 3], tx, ty);
      const ic = auto.innerCorners;
      if (!ic) continue;
      if (!solid(tx - 1, ty - 1)) put(ic.nw, tx, ty);
      if (!solid(tx + 1, ty - 1)) put(ic.ne, tx, ty);
      if (!solid(tx - 1, ty + 1)) put(ic.sw, tx, ty);
      if (!solid(tx + 1, ty + 1)) put(ic.se, tx, ty);
    }
  }
  if (!auto) return;
  for (let ty = ty0; ty < ty1; ty++) {
    for (let tx = tx0; tx < tx1; tx++) {
      if (!solid(tx, ty)) continue;
      // A top surface: the piece stands in the open tile above (cells are one tile, so bottom-aligned is in place).
      if (!solid(tx, ty - 1) && !oneway(tx, ty - 1)) put(pick(auto.top, tx, ty, 2), tx, ty - 1);
      if (!solid(tx, ty + 1) && !oneway(tx, ty + 1)) put(pick(auto.under, tx, ty, 3), tx, ty + 1);
    }
  }
}
