import { drawFrame, frameOf, look } from './fx.ts';

/**
 * Step 25 push 4: the suplex's weight you can see. A burst of dust along the
 * floor at the slam, wider than the body slammed, thrown out both ways and
 * settling. Drawn beside the impact's own star and shake (draw/impact.ts),
 * which every hard impact gets; this is the slam's alone (draw/suplex.ts calls
 * it). Nothing random: two screens draw the same.
 * DRAFT: its size and length; the owner judges the weight by playing.
 */
const TICKS = 24;
const DUST = '#e9e4d4';
/** Puffs out each side, by how far along the spread (0 at the head, 1 at the edge). */
const PUFFS = [0.15, 0.45, 0.75, 1];

/** `age`: ticks since the body met the floor; `x`, `y`: the landing's middle at floor level (screen px); `w`: the body's width. */
export function drawSlamDust(g: CanvasRenderingContext2D, age: number, x: number, y: number, w: number): void {
  if (age < 0 || age >= TICKS) return;
  const k = age / TICKS;
  // Out fast, then settling: about twice the body's width end to end at once, three and a half times at its widest.
  const reach = w * 0.8 + 6 + w * 0.8 * (1 - (1 - k) * (1 - k));
  const dust = look('fx-dust');
  for (const side of [-1, 1]) {
    for (let i = 0; i < PUFFS.length; i++) {
      const d = PUFFS[i]!;
      const px = x + side * reach * d;
      const rise = Math.round((3 + 4 * (1 - d)) * Math.sin(Math.PI * Math.min(1, k * 1.4)));
      if (dust) {
        const f = frameOf(dust, age + i, false);
        if (f < 0) continue;
        const s = 0.6 + 0.4 * (1 - d);
        const dw = Math.round(dust.w * s);
        const dh = Math.round(dust.h * s);
        drawFrame(g, dust, f, Math.round(px - dw / 2), Math.round(y - dh + 2 - rise), { flip: side < 0, w: dw, h: dh });
      } else {
        const side2 = Math.max(1, Math.round((4 - 2 * d) * (1 - k)));
        g.globalAlpha = 0.85 * (1 - k);
        g.fillStyle = DUST;
        g.fillRect(Math.round(px) - side2, Math.round(y - side2 - rise), side2 * 2, side2 * 2);
        g.globalAlpha = 1;
      }
    }
  }
}
