import type { Decor, DecorLayer } from '../../content/kinds/decor.ts';
import { image } from './images.ts';

/**
 * Decoration (docs/mechanisms/art-pipeline.md, "Decoration"): pictures
 * placed by tile that never collide and never mark anything. `far` is drawn
 * into the room's cached picture behind the ground (draw/room.ts); `back`
 * behind bodies and `front` in front of them, each frame.
 * INTENT: this code knows nothing about secrets and draws every item the
 * file lists, the same way everywhere ("Nothing points").
 */

/**
 * Draws the items of one layer, with the room's tile (0, 0) at (ox, oy).
 * Items wholly outside 0..w × 0..h are skipped. Returns false when an image
 * the layer needs has not loaded yet (the caller may draw it again later).
 */
export function drawDecor(g: CanvasRenderingContext2D, decor: Decor | undefined, layer: DecorLayer, T: number, ox: number, oy: number, w: number, h: number): boolean {
  if (!decor) return true;
  let complete = true;
  for (const it of decor.items) {
    if (it.layer !== layer) continue;
    const [sx, sy, sw, sh] = it.src;
    // Bottom-left of the picture on the bottom-left of its tile, then moved by (dx, dy).
    const x = Math.round(ox + it.tx * T + it.dx);
    const y = Math.round(oy + (it.ty + 1) * T - sh + it.dy);
    if (x >= w || y >= h || x + sw <= 0 || y + sh <= 0) continue;
    const img = image(it.image);
    if (!img) {
      complete = false;
      continue;
    }
    // Round 2: `blend: "lighter"` adds its light to what is under it (a torch's glow), then the
    // canvas goes back to normal drawing. DRAFT: a `far` glow lands in the room's cached picture,
    // so outdoors with no back wall under it, it is laid over the sky rather than added to it.
    const glow = it.blend === 'lighter';
    if (it.flip || glow) {
      g.save();
      if (glow) g.globalCompositeOperation = 'lighter';
      if (it.flip) {
        g.translate(x + sw, y);
        g.scale(-1, 1);
        g.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
      } else g.drawImage(img, sx, sy, sw, sh, x, y, sw, sh);
      g.restore();
    } else g.drawImage(img, sx, sy, sw, sh, x, y, sw, sh);
  }
  return complete;
}
