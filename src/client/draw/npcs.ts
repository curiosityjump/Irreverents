import type { Content } from '../../content/types.ts';
import type { World } from '../../sim/types.ts';
import { drawFrame, drawNine, drawText, edgedText, font, frameOf, lineHeight, look, textWidth, wrapText } from './fx.ts';
import { sheetOf } from './sprites.ts';

// DRAFT: every look in this file is a plain graybox stand-in. Step 8 owns
// how a mood finally reads; this is the least that lets the three moods,
// a bark and the shop's things be told apart on a phone.
const DISTRESS = '#ffd166';
const RAGE = '#ef233c';
const INK = '#1b1b2f';
const PAPER = '#f8f9fa';
/** DRAFT: the widest a bark's line runs before it wraps, pixels (20 letters of the pixel font). */
const BARK_WIDTH = 119;
const LOOKS = {
  counter: { w: 16, h: 12, color: '#8d6e63' },
  goods: { w: 6, h: 8, color: '#06d6a0' },
} as const;

/** A short text in a little box, centred on cx with its bottom at y, kept inside the screen. */
function label(g: CanvasRenderingContext2D, text: string, cx: number, bottom: number, fill: string, color: string): void {
  g.font = 'bold 8px monospace';
  g.textBaseline = 'top';
  const lh = lineHeight('dark', 8);
  const w = Math.ceil(textWidth(g, text, 'dark')) + 4;
  const x = Math.max(1, Math.min(g.canvas.width - w - 1, Math.round(cx - w / 2)));
  const y = Math.max(1, Math.round(bottom - lh - 2));
  g.fillStyle = fill;
  g.fillRect(x, y, w, lh + 2);
  // Round 2: the pixel font, recoloured; else the canvas's own letters as before.
  if (drawText(g, text, x + 2, y + 1, 'dark', color)) return;
  g.fillStyle = color;
  g.fillText(text, x + 2, y + 1);
}

/**
 * A bark in the `bark` nine-slice with its `bark-tail` under it pointing
 * at the speaker, centred on cx with the tail's tip at `bottom`, kept
 * inside the screen. Returns false when the look is missing.
 */
function bubble(g: CanvasRenderingContext2D, text: string, cx: number, bottom: number): boolean {
  if (!look('bark')) return false;
  const tail = look('bark-tail');
  g.font = 'bold 8px monospace';
  g.textBaseline = 'top';
  // Round 2: with the pixel font, dark letters straight on the paper (no halo), wrapped to
  // BARK_WIDTH; without it, one line of the canvas's letters with a dark edge, as before.
  const pixel = font('dark') !== null;
  const rows = pixel ? wrapText(g, text, BARK_WIDTH, 'dark') : [text];
  const lh = lineHeight('dark', 8);
  const w = Math.ceil(Math.max(...rows.map((r) => textWidth(g, r, 'dark')))) + 8;
  const h = pixel ? rows.length * lh + 5 : 14;
  const th = tail ? tail.h - 1 : 0;
  const x = Math.max(1, Math.min(g.canvas.width - w - 1, Math.round(cx - w / 2)));
  const y = Math.max(1, Math.round(bottom - th - h));
  drawNine(g, 'bark', x, y, w, h);
  if (tail) {
    const tx = Math.max(x + 2, Math.min(x + w - tail.w - 2, Math.round(cx - tail.w / 2)));
    drawFrame(g, tail, 0, tx, y + h - 1);
  }
  if (pixel) rows.forEach((r, i) => drawText(g, r, x + 4, y + 3 + i * lh, 'dark'));
  else edgedText(g, text, x + 4, y + 3, PAPER, INK);
  return true;
}

/**
 * People's moods and barks, and the bodiless things a hero can use.
 * Mood 1 shows nothing (business as usual is the world at rest); mood 2 a
 * "?" over the head; mood 3 a "!" and a red tint over the body. A bark
 * replaces the mark while it lasts.
 */
export function drawNpcs(g: CanvasRenderingContext2D, world: World, content: Content, roomId: string, ox: number, oy: number): void {
  const room = content.rooms[roomId];
  if (!room) return;
  for (const e of world.entities) {
    if (e.room !== roomId || !e.c.thing || e.c.thing.takenBy !== null) continue;
    const def = content.placements[roomId]?.things?.find((t) => t.id === e.id);
    // A bell (slice 2) is drawn, working or broken, by draw/alert.ts.
    if (def?.look === 'bell') continue;
    const name = def?.look ?? 'goods';
    // The `shop-counter` / `shop-goods` looks, bottom-centre on the tile; else the plain block.
    const art = look(`shop-${name}`);
    if (art) {
      drawFrame(g, art, frameOf(art, world.tick, true), ox + Math.round(e.x + (room.tile - art.w) / 2), oy + Math.round(e.y + room.tile - art.h));
      continue;
    }
    const plain = LOOKS[name];
    g.fillStyle = plain.color;
    g.fillRect(ox + e.x + Math.round((room.tile - plain.w) / 2), oy + e.y + room.tile - plain.h, plain.w, plain.h);
  }
  for (const e of world.entities) {
    const n = e.c.npc;
    const box = content.characters[e.kind]?.box;
    if (e.room !== roomId || !n || !box) continue;
    const x = ox + Math.round(e.x);
    const y = oy + Math.round(e.y);
    // A person drawn from a sprite sheet shows rage in its own pixels (draw/entities.ts).
    if (n.mood === 3 && !sheetOf(content, e)) {
      // Strong enough that a raging person cannot be mistaken for anyone's own colour.
      g.globalAlpha = 0.75;
      g.fillStyle = RAGE;
      g.fillRect(x, y, box.w, box.h);
      g.globalAlpha = 1;
    }
    const cx = x + box.w / 2;
    if (n.bark) {
      if (!bubble(g, n.bark.text, cx, y - 2)) label(g, n.bark.text, cx, y - 2, PAPER, INK);
    } else if (n.mood === 2 || n.mood === 3) {
      const mark = look(`mood-${n.mood}`);
      if (mark) drawFrame(g, mark, frameOf(mark, world.tick, true), Math.round(cx - mark.w / 2), y - mark.h - 3);
      else if (n.mood === 2) label(g, '?', cx, y - 2, DISTRESS, INK);
      else label(g, '!', cx, y - 2, RAGE, PAPER);
    }
  }
}
