import { image } from './images.ts';

/**
 * Decoration (docs/mechanisms/art-pipeline.md, "Decoration"): pictures
 * placed by tile that never collide and never mark anything. `far` is drawn
 * into the room's cached picture behind the ground (draw/room.ts); `back`
 * behind bodies and `front` in front of them, each frame.
 * INTENT: this code knows nothing about secrets and draws every item the
 * file lists, the same way everywhere ("Nothing points").
 * DRAFT: read loosely from `content.decor` until the foundation lane's
 * typed kind is the only shape.
 */

export type DecorLayer = 'far' | 'back' | 'front';

export interface DecorItem {
  image: string;
  src: [number, number, number, number];
  tx: number;
  ty: number;
  dx?: number;
  dy?: number;
  layer?: DecorLayer;
  flip?: boolean;
}

export interface Decor {
  id: string;
  items: DecorItem[];
}

/**
 * Draws the items of one layer, with the room's tile (0, 0) at (ox, oy).
 * Items wholly outside 0..w × 0..h are skipped. Returns false when an image
 * the layer needs has not loaded yet (the caller may draw it again later).
 */
export function drawDecor(g: CanvasRenderingContext2D, decor: Decor | undefined, layer: DecorLayer, T: number, ox: number, oy: number, w: number, h: number): boolean {
  if (!decor) return true;
  let complete = true;
  for (const it of decor.items) {
    if ((it.layer ?? 'back') !== layer) continue;
    const [sx, sy, sw, sh] = it.src;
    // Bottom-left of the picture on the bottom-left of its tile, then moved by (dx, dy).
    const x = Math.round(ox + it.tx * T + (it.dx ?? 0));
    const y = Math.round(oy + (it.ty + 1) * T - sh + (it.dy ?? 0));
    if (x >= w || y >= h || x + sw <= 0 || y + sh <= 0) continue;
    const img = image(it.image);
    if (!img) {
      complete = false;
      continue;
    }
    if (it.flip) {
      g.save();
      g.translate(x + sw, y);
      g.scale(-1, 1);
      g.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
      g.restore();
    } else g.drawImage(img, sx, sy, sw, sh, x, y, sw, sh);
  }
  return complete;
}
