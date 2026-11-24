import type { SimEvent } from '../../sim/types.ts';
import { drawText, textWidth } from './fx.ts';

// Step 21, hearts (the owner, 2026-11-24: "Once all heros in the party are
// out of hearts, that's a game over (back to cantina)"): the page's GAME
// OVER moment. The world's `game-over-coming` puts up a card across the
// middle of the view; it stays while the world moves everyone (a beat of
// about a second) and a little after, then goes by itself.
// INTENT (CLAUDE.md, "There is always a way out"): it never holds a player.
// It takes no input of its own (the stick and buttons work through it), and
// any touch or press anywhere takes it down at once.
// DRAFT: the words, the colours, the time.

const TITLE = 'GAME OVER';
const LINE = 'Back to the cantina';
const HEARTS = 'Every heart back';
/** DRAFT: about three seconds of this page's frames. */
const FRAMES = 180;

let lastLatest: unknown = null;
let shownAt: number | null = null;
let line = LINE;
let skipped = 0;
let seen = 0;

/** What the card drew last frame, for the page's drawn record: null when none is up. */
export function drawnGameOver(): { title: string; line: string; shown: number; skipped: number } | null {
  return shownAt === null ? null : { title: TITLE, line, shown: seen, skipped };
}
/** How many game overs this page has shown, and how many a touch took down. */
export function gameOverCounts(): { shown: number; skipped: number } {
  return { shown: seen, skipped };
}

/** Fed every frame from main.ts with the server's newest events. */
export function watchGameOver(latest: { tick: number; events: readonly SimEvent[] }, frame: number, roomName: (room: string) => string): void {
  if (latest === lastLatest) return;
  lastLatest = latest;
  for (const ev of latest.events) {
    if (ev.type !== 'game-over-coming') continue;
    shownAt = frame;
    seen++;
    line = ev.room === 'cantina' ? LINE : `Back to ${roomName(ev.room)}`;
    if (/[0-9]/.test(line)) line = LINE;
  }
}

/** Any touch or press: the card goes at once (main.ts calls this from its own listeners; it never stops the touch). */
export function skipGameOver(): void {
  if (shownAt === null) return;
  shownAt = null;
  skipped++;
}

/** Draws the card over the finished picture, if one is up. */
export function drawGameOver(g: CanvasRenderingContext2D, W: number, H: number, frame: number): void {
  if (shownAt === null) return;
  const age = frame - shownAt;
  if (age > FRAMES || age < 0) {
    shownAt = null;
    return;
  }
  const fade = Math.min(1, age / 8, (FRAMES - age) / 20);
  const h = Math.round(Math.min(H * 0.4, 100));
  const y = Math.round(H / 2 - h / 2);
  g.save();
  g.globalAlpha = 0.9 * fade;
  g.fillStyle = '#1a0b10';
  g.fillRect(0, y, W, h);
  g.globalAlpha = fade;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  // Every word inside the view at any width: each font shrinks until its widest line fits.
  const fit = (lines: string[], start: number, min: number, weight: string): number => {
    let px = start;
    for (; px > min; px--) {
      g.font = `${weight}${px}px monospace`;
      if (lines.every((l) => g.measureText(l).width <= W - 8)) break;
    }
    g.font = `${weight}${px}px monospace`;
    return px;
  };
  // DRAFT (brief phone-hud-legibility, 2026-11-24: the card's words were the browser's monospace, smoothed): the
  // pixel font at a whole scale, the biggest that fits; the monospace below only when the font is missing.
  if (pixelWords(g, [TITLE, line, HEARTS], W, y, h)) {
    g.restore();
    return;
  }
  g.fillStyle = '#ffd36b';
  const big = fit([TITLE], Math.max(14, Math.min(40, Math.floor(h * 0.42))), 8, 'bold ');
  g.fillText(TITLE, W / 2, y + h * 0.34);
  g.fillStyle = '#f4e9d8';
  const small = fit([line, HEARTS], Math.max(7, Math.floor(big / 2.4)), 5, '');
  g.fillText(line, W / 2, y + h * 0.34 + big * 0.5 + small * 1.1);
  g.fillText(HEARTS, W / 2, y + h * 0.34 + big * 0.5 + small * 2.3);
  g.restore();
}

/** Each line once, drawn in the pixel font at 1x and kept (the card draws the same words every frame). */
const cut = new Map<string, HTMLCanvasElement | null>();
function line1x(text: string, color: string): HTMLCanvasElement | null {
  const key = `${color}|${text}`;
  if (cut.has(key)) return cut.get(key)!;
  let c: HTMLCanvasElement | null = null;
  if (typeof document !== 'undefined') {
    c = document.createElement('canvas');
    const cg = c.getContext('2d');
    c.width = Math.max(1, Math.ceil(cg ? textWidth(cg, text, 'light') : 0) + 1);
    c.height = 10;
    if (!cg || !drawText(cg, text, 0, 0, 'light', color)) c = null;
  }
  if (c) cut.set(key, c);
  return c;
}

/** The title and its two lines in the pixel font, each at the biggest whole scale that fits; false when the font is not loaded. */
function pixelWords(g: CanvasRenderingContext2D, [title, ...rest]: string[], W: number, y: number, h: number): boolean {
  const t = line1x(title!, '#ffd36b');
  const r = rest.map((l) => line1x(l, '#f4e9d8'));
  if (!t || r.some((c) => !c)) return false;
  const most = (c: HTMLCanvasElement, tall: number): number => Math.max(1, Math.min(Math.floor((W - 8) / c.width), Math.floor(tall / c.height)));
  const ts = most(t, h * 0.45);
  const ls = Math.max(1, Math.min(Math.ceil(ts / 2), ...r.map((c) => most(c!, h * 0.2))));
  const total = t.height * ts + 4 * ls + r.length * (r[0]!.height + 2) * ls;
  let cy = Math.round(y + (h - total) / 2);
  g.imageSmoothingEnabled = false;
  g.drawImage(t, Math.round((W - t.width * ts) / 2), cy, t.width * ts, t.height * ts);
  cy += t.height * ts + 4 * ls;
  for (const c of r) {
    g.drawImage(c!, Math.round((W - c!.width * ls) / 2), cy, c!.width * ls, c!.height * ls);
    cy += (c!.height + 2) * ls;
  }
  return true;
}
