import type { Content } from '../../content/types.ts';
import type { World } from '../../sim/types.ts';

// DRAFT: every look in this file is a plain graybox stand-in. Step 8 owns
// how a mood finally reads; this is the least that lets the three moods,
// a bark and the shop's things be told apart on a phone.
const DISTRESS = '#ffd166';
const RAGE = '#ef233c';
const INK = '#1b1b2f';
const PAPER = '#f8f9fa';
const LOOKS = {
  counter: { w: 16, h: 12, color: '#8d6e63' },
  goods: { w: 6, h: 8, color: '#06d6a0' },
} as const;

/** A short text in a little box, centred on cx with its bottom at y, kept inside the screen. */
function label(g: CanvasRenderingContext2D, text: string, cx: number, bottom: number, fill: string, color: string): void {
  g.font = 'bold 8px monospace';
  g.textBaseline = 'top';
  const w = Math.ceil(g.measureText(text).width) + 4;
  const x = Math.max(1, Math.min(g.canvas.width - w - 1, Math.round(cx - w / 2)));
  const y = Math.max(1, Math.round(bottom - 10));
  g.fillStyle = fill;
  g.fillRect(x, y, w, 10);
  g.fillStyle = color;
  g.fillText(text, x + 2, y + 1);
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
    const look = LOOKS[def?.look ?? 'goods'];
    g.fillStyle = look.color;
    g.fillRect(ox + e.x + Math.round((room.tile - look.w) / 2), oy + e.y + room.tile - look.h, look.w, look.h);
  }
  for (const e of world.entities) {
    const n = e.c.npc;
    const box = content.characters[e.kind]?.box;
    if (e.room !== roomId || !n || !box) continue;
    const x = ox + Math.round(e.x);
    const y = oy + Math.round(e.y);
    if (n.mood === 3) {
      // Strong enough that a raging person cannot be mistaken for anyone's own colour.
      g.globalAlpha = 0.75;
      g.fillStyle = RAGE;
      g.fillRect(x, y, box.w, box.h);
      g.globalAlpha = 1;
    }
    const cx = x + box.w / 2;
    if (n.bark) label(g, n.bark.text, cx, y - 2, PAPER, INK);
    else if (n.mood === 2) label(g, '?', cx, y - 2, DISTRESS, INK);
    else if (n.mood === 3) label(g, '!', cx, y - 2, RAGE, PAPER);
  }
}
