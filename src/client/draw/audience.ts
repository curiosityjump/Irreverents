import type { Content } from '../../content/types.ts';
import { speechLine, speechLineNumber, wrapSpeech } from '../../content/speech.ts';
import { speechTicksPerLine } from '../../sim/systems/audience-speech.ts';
import type { World } from '../../sim/types.ts';
import { drawNine, drawText, edgedText, font, lineHeight, textWidth } from './fx.ts';

// DRAFT: the whole look. A small dark ribbon with pale letters over the
// speaker's head, two rows at most: there to be glanced at or ignored,
// never a dialogue box (the speech is never dialogue; design library doc 03).
const RIBBON = '#2b1d3a';
const EDGE = '#d4af37';
const WORDS = '#f3e9c6';
const ROW = 9;

/**
 * The line each speaker is on, over his head, wherever he is in this room:
 * it follows him when he is carried or thrown. Drawn only for the room the
 * viewer is in (lead's decision 2026-11-23, DRAFT).
 */
export function drawAudience(g: CanvasRenderingContext2D, world: World, content: Content, roomId: string, ox: number, oy: number): void {
  const per = speechTicksPerLine(content.tuning.world.speechLineTime);
  for (const a of Object.values(content.audience ?? {})) {
    const e = world.entities.find((x) => x.id === a.speaker);
    const box = e ? content.characters[e.kind]?.box : undefined;
    if (!e || !box || e.room !== roomId) continue;
    const rows = wrapSpeech(speechLine(a, speechLineNumber(a, e.c.audience?.ticks, per)));
    if (rows.length === 0) continue;
    g.font = 'bold 8px monospace';
    g.textBaseline = 'top';
    const pixel = font('light') !== null;
    const row = pixel ? lineHeight('light', ROW) : ROW;
    const w = Math.ceil(Math.max(...rows.map((r) => textWidth(g, r, 'light')))) + 6;
    const h = rows.length * row + 3;
    const W = g.canvas.width;
    const H = g.canvas.height;
    const bx = ox + Math.round(e.x);
    const by = oy + Math.round(e.y);
    const cx = bx + box.w / 2;
    // Round 2: never over the speaker. The ribbon's bottom (its frame and tail included) stays
    // CLEAR px above the top of his picture (box top minus the HEADROOM a crown stands above it),
    // with a tail pointing down at him; where there is no room above, it goes beside him, the
    // tail pointing at his head.
    const picTop = by - HEADROOM;
    let x = Math.round(cx - w / 2);
    let y = picTop - CLEAR - TAIL - 3 - h;
    let tail: 'down' | 'left' | 'right' = 'down';
    if (y < 3) {
      const right = bx + box.w + SIDE_GAP + TAIL + 2;
      const left = bx - SIDE_GAP - TAIL - 2 - w;
      // Round 3 (gap 16): beside him only where the whole ribbon fits on that side; where
      // neither side fits it stays above him, its bottom still clear of his crown, its top
      // running off the screen (the last row, the one he is saying, nearest him). INTENT:
      // never clamped sideways across his box. DRAFT: running off the top, not shrinking.
      if (right + w + 3 <= W) {
        x = right;
        tail = 'left';
        y = Math.max(3, Math.min(H - h - 3, picTop));
      } else if (left >= 3) {
        x = left;
        tail = 'right';
        y = Math.max(3, Math.min(H - h - 3, picTop));
      }
    }
    if (tail === 'down') x = Math.max(3, Math.min(W - w - 3, x));
    // The `ribbon` nine-slice, a little roomier; else the plain ribbon.
    const framed = drawNine(g, 'ribbon', x - 2, y - 2, w + 4, h + 4);
    if (!framed) {
      g.fillStyle = EDGE;
      g.fillRect(x - 1, y - 1, w + 2, h + 2);
      g.fillStyle = RIBBON;
      g.fillRect(x, y, w, h);
    }
    drawTail(g, tail, tail === 'down' ? Math.max(x + 2, Math.min(x + w - 3, Math.round(cx))) : tail === 'left' ? x - 2 : x + w + 2, tail === 'down' ? y + h + 2 : y + Math.min(h - 2, 5));
    rows.forEach((r, i) => {
      // Light letters carry their own shadow; without the font, edged canvas letters as before.
      if (drawText(g, r, x + 3, y + 2 + i * row, 'light')) return;
      if (framed) edgedText(g, r, x + 3, y + 2 + i * row, WORDS, RIBBON);
      else {
        g.fillStyle = WORDS;
        g.fillText(r, x + 3, y + 2 + i * row);
      }
    });
  }
}

/** DRAFT: how far a speaker's picture may stand above his box (the contract: the king's crown is 8). */
const HEADROOM = 8;
/** DRAFT: the clear gap between the ribbon (tail included) and the speaker's picture. */
const CLEAR = 4;
/** DRAFT: the tail's length, and the gap from the box when the ribbon is beside him. */
const TAIL = 3;
const SIDE_GAP = 4;

/** A small stepped tail in the ribbon's colours, its base on (x, y), pointing down, left or right. */
function drawTail(g: CanvasRenderingContext2D, dir: 'down' | 'left' | 'right', x: number, y: number): void {
  for (let i = 0; i < TAIL; i++) {
    const half = TAIL - 1 - i;
    g.fillStyle = EDGE;
    if (dir === 'down') g.fillRect(x - half - 1, y + i, 2 * half + 3, 1);
    else g.fillRect(dir === 'left' ? x - i - 1 : x + i, y - half - 1, 1, 2 * half + 3);
    g.fillStyle = RIBBON;
    if (dir === 'down') g.fillRect(x - half, y + i, 2 * half + 1, 1);
    else g.fillRect(dir === 'left' ? x - i - 1 : x + i, y - half, 1, 2 * half + 1);
  }
  g.fillStyle = EDGE;
  if (dir === 'down') g.fillRect(x, y + TAIL, 1, 1);
  else g.fillRect(dir === 'left' ? x - TAIL - 1 : x + TAIL, y, 1, 1);
}
