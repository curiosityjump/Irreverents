import type { Content } from '../../content/types.ts';
import type { World } from '../../sim/types.ts';
import type { Entity } from '../../sim/types.ts';
import { drawnOffset, drawnTop } from './entities.ts';
import { drawFrame, drawNine, drawText, edgedText, font, frameOf, lineHeight, look, safeView, textWidth, wrapText } from './fx.ts';
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
  // Step 14 slice B: the shop's special good, if neither its cut look (`goods-special`) nor `gem` is loaded.
  special: { w: 8, h: 10, color: '#ff4fa3' },
  // Step 19: a prize's strongbox, drawn from the cut `chest-iron-closed` look meanwhile.
  strongbox: { w: 14, h: 10, color: '#7d8597' },
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
 * Round 3 (gap 11): a bark from someone past the screen's edge (`side` -1 left, 1 right): at
 * that edge, a `bark-edge` chip with their own head in it (cropped from the top of their
 * sprite's first idle frame) and an arrow toward them, the words in a bubble with no tail
 * beside it, level with where their head is (kept on screen). With no `bark-edge` look, the
 * same bubble with a small plain arrow. DRAFT: the layout.
 */
function edgeBark(g: CanvasRenderingContext2D, content: Content, e: Entity, text: string, side: number, top: number): void {
  const W = g.canvas.width;
  const H = g.canvas.height;
  const chip = look('bark-edge');
  g.font = 'bold 8px monospace';
  g.textBaseline = 'top';
  const pixel = font('dark') !== null;
  const rows = pixel ? wrapText(g, text, BARK_WIDTH, 'dark') : [text];
  const lh = lineHeight('dark', 8);
  const w = Math.ceil(Math.max(...rows.map((r) => textWidth(g, r, 'dark')))) + 8;
  const h = pixel ? rows.length * lh + 5 : 14;
  const cw = chip ? chip.w : 6;
  const ch = chip ? chip.h : h;
  const y = Math.max(2, Math.min(H - Math.max(h, ch) - 2, Math.round(top)));
  // Clear of a notch the picture runs under (round 3, fx.ts `safeView`, set by shell.ts).
  const chipX = side < 0 ? 2 + safeView.left : W - cw - 2 - safeView.right;
  if (chip) {
    // The chip's arrow is drawn pointing left; mirrored for a speaker off the right edge.
    drawFrame(g, chip, frameOf(chip, 0, true), chipX, y, { flip: side > 0 });
    const found = sheetOf(content, e);
    if (found) {
      // Their head: the top of the first idle frame, centred on the box, fitted inside the chip.
      const { sheet, img } = found;
      const box = content.characters[e.kind]!.box;
      const f = sheet.frames.idle[0] ?? 0;
      const cols = Math.max(1, Math.floor(img.naturalWidth / sheet.cell.w));
      const hw = Math.min(sheet.cell.w, cw - 4);
      const hh = Math.min(sheet.cell.h, ch - 4);
      const sx = (f % cols) * sheet.cell.w + Math.max(0, Math.round(sheet.anchor.x + box.w / 2 - hw / 2));
      const headTop = Math.max(0, sheet.anchor.y - Math.round(hh / 3));
      const sy = Math.floor(f / cols) * sheet.cell.h + headTop;
      const inset = side < 0 ? Math.round((cw - hw) / 2) + 1 : Math.round((cw - hw) / 2) - 1;
      g.save();
      if (side < 0) {
        // Face toward the edge they are past.
        g.translate(chipX + inset + hw, y + 2);
        g.scale(-1, 1);
        g.drawImage(img, sx, sy, hw, hh, 0, 0, hw, hh);
      } else g.drawImage(img, sx, sy, hw, hh, chipX + inset, y + 2, hw, hh);
      g.restore();
    }
  } else {
    // A plain arrow at the edge, pointing out toward them.
    g.fillStyle = INK;
    for (let i = 0; i < 4; i++) g.fillRect(side < 0 ? chipX + i : chipX + cw - 1 - i, y + Math.round(h / 2) - 3 + i, 1, 7 - 2 * i);
  }
  const bx = side < 0 ? chipX + cw + 1 : chipX - w - 1;
  if (look('bark') && drawNine(g, 'bark', bx, y, w, h)) {
    if (pixel) rows.forEach((r, i) => drawText(g, r, bx + 4, y + 3 + i * lh, 'dark'));
    else edgedText(g, text, bx + 4, y + 3, PAPER, INK);
    return;
  }
  g.fillStyle = PAPER;
  g.fillRect(bx, y, w, h);
  if (drawText(g, text, bx + 4, y + 3, 'dark', INK)) return;
  g.fillStyle = INK;
  g.fillText(text, bx + 4, y + 3);
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
    // Step 14 slice B: the special good is the cut `goods-special` (8d15d9c; the crown in its case), `gem` if that is missing.
    const art = look(`shop-${name}`) ?? (name === 'special' ? (look('goods-special') ?? look('gem')) : name === 'strongbox' ? look('chest-iron-closed') : null);
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
    // Round 3 (gap 14): where the body is drawn (in a carrier's hands, say), not where the simulation has it.
    const off = drawnOffset(e.id);
    const x = ox + Math.round(e.x) + off.x;
    const y = oy + Math.round(e.y) + off.y;
    // Round 3: marks and barks sit over the picture as drawn (clear of hats and plumes), else over the box.
    const top = Math.min(y, drawnTop(e.id) ?? y);
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
      // Round 3 (gap 11): a speaker past the screen's edge is pointed at from that edge, never
      // given a bubble whose tail lands on whoever stands there.
      if (cx < 0 || cx > g.canvas.width) edgeBark(g, content, e, n.bark.text, cx < 0 ? -1 : 1, top);
      else if (!bubble(g, n.bark.text, cx, top - 1)) label(g, n.bark.text, cx, top - 1, PAPER, INK);
    } else if (n.mood === 2 || n.mood === 3) {
      const mark = look(`mood-${n.mood}`);
      if (mark) drawFrame(g, mark, frameOf(mark, world.tick, true), Math.round(cx - mark.w / 2), top - mark.h - 1);
      else if (n.mood === 2) label(g, '?', cx, y - 2, DISTRESS, INK);
      else label(g, '!', cx, y - 2, RAGE, PAPER);
    }
  }
}
