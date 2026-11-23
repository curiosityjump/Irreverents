import type { Content } from '../../content/types.ts';
import { lineClear, sightBox } from '../../sim/npc/sight.ts';
import type { Entity } from '../../sim/types.ts';

// Step 19 push 3: the cells of a watcher's sight band, pure (no canvas), so
// scripts/checks/step19-band.ts holds them to canSee and draw/sight.ts
// draws them. See draw/sight.ts for the why.

/** DRAFT: the band's grain, room pixels. Half a tile: 14 by 10 cells for the shipped 112 by 80 box. */
export const CELL = 8;

export interface BandCell {
  /** The cell, room pixels, clipped to the box. */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Its middle: the point held to canSee. */
  mx: number;
  my: number;
}

/**
 * The lit cells of one watcher's band: the sightBox cut on an 8 px grid of
 * the room, each cell kept when the line from the eye to its middle is
 * clear. Pure (no canvas), so the check can hold it to canSee.
 */
export function bandCells(content: Content, watcher: Entity): BandCell[] {
  const box = sightBox(content, watcher);
  const room = content.rooms[watcher.room];
  if (!box || !room) return [];
  const W = room.w * room.tile;
  const H = room.h * room.tile;
  const out: BandCell[] = [];
  const cx0 = Math.max(0, box.x0);
  const cx1 = Math.min(W, box.x1);
  const cy0 = Math.max(0, box.y0);
  const cy1 = Math.min(H, box.y1);
  for (let gy = Math.floor(cy0 / CELL) * CELL; gy < cy1; gy += CELL) {
    for (let gx = Math.floor(cx0 / CELL) * CELL; gx < cx1; gx += CELL) {
      const x = Math.max(gx, cx0);
      const y = Math.max(gy, cy0);
      const w = Math.min(gx + CELL, cx1) - x;
      const h = Math.min(gy + CELL, cy1) - y;
      if (w <= 0 || h <= 0) continue;
      const mx = x + w / 2;
      const my = y + h / 2;
      if (lineClear(room, box.eye, { x: mx, y: my })) out.push({ x, y, w, h, mx, my });
    }
  }
  return out;
}

