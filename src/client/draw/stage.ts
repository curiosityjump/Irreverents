import type { Content } from '../../content/types.ts';
import '../../sim/stage.ts';
import type { SimEvent } from '../../sim/types.ts';
import { drawText, safeView, textWidth } from './fx.ts';
import { drawLook } from './looks.ts';

// Step 22 push 4 (docs/mechanisms/stages.md, "The victory screen"; the owner,
// 2026-11-24: "Needs a satisfying victory screen at the end. Stage cleared,
// with a star rating and some stats (time to clear, enemies defeated, etc)").
// The world's `stage-cleared` puts up STAGE CLEARED over the view, large; the
// stars light one at a time, each with a sound; then each statistic counts up.
// A Continue button (DOM, src/client/index.html `#stage-continue`) sits under
// the right thumb, inside the phone's safe area.
//
// INTENT (CLAUDE.md, "There is always a way out"): the screen holds nobody.
// Continue is on it from its first frame (and Enter, Space or Escape on a
// keyboard); it never stops the world, which goes on under it; and it is this
// page's alone: each player dismisses their own (main.ts keeps the stick and
// buttons from moving the hero while it is up, and gives them back on Continue).
// INTENT (D-020): the result screen is the only place numbers appear; combat
// keeps none over anyone's head.
// DRAFT: every word, colour, size and time below; the star's sound
// (`secret-found`); who sees it (a page whose own hero is in the stage's
// level when it is cleared, or who cleared it).

const INK = '#141228';
const PLATE = '#221f44';
const EDGE = '#e09a1e';
const GOLD = '#ffd23f';
const LIGHT = '#fff1a0';
const PALE = '#d2cfe0';
/** DRAFT: frames before the first star, between stars, and between statistics. */
const FIRST_STAR = 30;
const STAR_GAP = 50;
const LINE_GAP = 24;
/** DRAFT: frames a statistic takes to count up. */
const COUNT = 36;
/** DRAFT: the star's sound, an existing one (content/sounds/). */
export const STAR_SOUND = 'secret-found';

type Cleared = Extract<SimEvent, { type: 'stage-cleared' }>;
interface Line {
  label: string;
  /** The number counted up to, or null for a line with no number (it just appears). */
  to: number | null;
  /** How the number is written as it counts. */
  fmt: (n: number) => string;
}

let lastLatest: unknown = null;
let open: { ev: Cleared; at: number; name: string; lines: Line[] } | null = null;
let starsSounded = 0;
let sounds: string[] = [];
let dismissed = 0;
let shownCount = 0;
let drawn: { stage: string; title: string; stars: number; lit: number; lines: string[]; box: { x: number; y: number; w: number; h: number }; view: { w: number; h: number }; age: number } | null = null;

/** m:ss for a number of ticks (60 a second). */
export function clock(ticks: number): string {
  const s = Math.max(0, Math.floor(ticks / 60));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** The statistics a clear shows, in order (DRAFT: the words). */
export function stageLines(ev: Cleared): Line[] {
  const n = (x: number): string => String(Math.round(x));
  const lines: Line[] = [
    { label: 'Time to clear', to: ev.ticks, fmt: clock },
    { label: 'Enemies defeated', to: ev.defeated, fmt: n },
    { label: 'Alarms raised', to: ev.alarms, fmt: n },
    // DRAFT (the brief: "tries become game overs"): every start-over of the run, the game over's and the throw's.
    { label: 'Game overs', to: ev.tries, fmt: n },
  ];
  if (ev.unseen) lines.push({ label: 'Nobody saw you', to: null, fmt: n });
  if (ev.hoard) lines.push({ label: 'The hoard, carried out', to: null, fmt: n });
  return lines;
}

/** Fed every frame from main.ts with the server's newest events and where this page's hero is. */
export function watchStageEvents(content: Content, latest: { tick: number; events: readonly SimEvent[] }, frame: number, me: { player: string | null; room: string }): void {
  if (latest === lastLatest) return;
  lastLatest = latest;
  for (const ev of latest.events) if (ev.type === 'stage-cleared') showStageCleared(content, ev, frame, me);
}

/** Puts the screen up for one clear (also the e2e's and a screenshot's way to show it: `irreverents.stage.show`). */
export function showStageCleared(content: Content, ev: Cleared, frame: number, me: { player: string | null; room: string }): boolean {
  const stage = content.stages?.[ev.stage];
  const rooms = stage ? (content.levels?.[stage.level]?.rooms ?? []) : [];
  if (ev.player !== me.player && !rooms.includes(me.room)) return false;
  const name = (stage && content.levels?.[stage.level]?.name) || 'Stage';
  open = { ev, at: frame, name, lines: stageLines(ev) };
  starsSounded = 0;
  shownCount++;
  return true;
}

/** Whether the screen is up (main.ts holds this page's input back while it is). */
export function stageScreenUp(): boolean {
  return open !== null;
}

/** Continue: the screen goes, and the stick is this page's again. */
export function dismissStage(): void {
  if (!open) return;
  open = null;
  drawn = null;
  dismissed++;
}

/** The sounds due since the last call (main.ts plays them). */
export function takeStageSounds(): string[] {
  const out = sounds;
  sounds = [];
  return out;
}

/** What the screen drew last frame, for the page's drawn record; null when it is not up. */
export function drawnStage(): (typeof drawn & { shown: number; dismissed: number }) | null {
  return drawn ? { ...drawn, shown: shownCount, dismissed } : null;
}

/** How many screens this page has put up and dismissed. */
export function stageCounts(): { shown: number; dismissed: number } {
  return { shown: shownCount, dismissed };
}

/** The frame (from the screen's first) on which the i-th statistic starts counting. */
function lineStart(stars: number, i: number): number {
  return FIRST_STAR + stars * STAR_GAP + i * LINE_GAP;
}

/** Draws one line of the pixel font at `scale` (1 or 2), its top-left at (x, y); fillText when the font is missing. */
function words(g: CanvasRenderingContext2D, text: string, x: number, y: number, scale: number, color: string): void {
  if (scale === 1) {
    if (drawText(g, text, x, y, 'light', color)) return;
  } else {
    const w = Math.ceil(textWidth(g, text, 'light')) + 1;
    const c = document.createElement('canvas');
    c.width = Math.max(1, w);
    c.height = 10;
    const cg = c.getContext('2d');
    if (cg && drawText(cg, text, 0, 0, 'light', color)) {
      g.imageSmoothingEnabled = false;
      g.drawImage(c, Math.round(x), Math.round(y), c.width * scale, c.height * scale);
      return;
    }
  }
  g.font = `bold ${8 * scale}px monospace`;
  g.textBaseline = 'top';
  g.fillStyle = color;
  g.fillText(text, x, y + scale);
}

/** Draws the screen over the finished picture, if it is up. Screen furniture: called last in render.ts. */
export function drawStage(g: CanvasRenderingContext2D, content: Content, W: number, H: number, frame: number): void {
  drawn = null;
  if (!open) return;
  const age = Math.max(0, frame - open.at);
  const ev = open.ev;
  const stars = Math.max(0, Math.min(3, ev.stars));
  const left = safeView.left;
  const right = W - safeView.right;
  const top = safeView.top;
  const vw = right - left;

  g.save();
  g.globalAlpha = Math.min(1, age / 12) * 0.78;
  g.fillStyle = INK;
  g.fillRect(0, 0, W, H);
  g.globalAlpha = 1;

  const title = 'STAGE CLEARED';
  const tScale = textWidth(g, title, 'light') * 2 + 16 <= vw ? 2 : 1;
  const tH = 10 * tScale;
  const starPx = tScale === 2 && H >= 150 ? 28 : 14;
  const lineH = 12;
  const lines = open.lines;
  const bodyW = Math.max(...lines.map((l) => textWidth(g, `${l.label}  ${l.to === null ? '' : l.fmt(l.to)}`, 'light')));
  const w = Math.min(vw - 4, Math.max(textWidth(g, title, 'light') * tScale, bodyW, 3 * starPx + 8) + 20);
  const h = 8 + 10 + 4 + tH + 6 + starPx + 8 + lines.length * lineH + 6;
  const x = Math.round(left + (vw - w) / 2);
  const y = Math.round(Math.max(top + 2, (H - h) / 2));

  // The plate, the banner's colours.
  g.fillStyle = INK;
  g.fillRect(x - 1, y, w + 2, h);
  g.fillRect(x, y - 1, w, h + 2);
  g.fillStyle = EDGE;
  g.fillRect(x, y, w, h);
  g.fillStyle = PLATE;
  g.fillRect(x + 1, y + 1, w - 2, h - 2);

  let cy = y + 8;
  const nameW = textWidth(g, open.name, 'light');
  words(g, open.name, x + (w - nameW) / 2, cy, 1, PALE);
  cy += 14;
  // STAGE CLEARED, popping in.
  const pop = age < 8 ? 1 + (8 - age) / 16 : 1;
  const tw = textWidth(g, title, 'light') * tScale;
  if (pop > 1) {
    g.save();
    g.translate(x + w / 2, cy + tH / 2);
    g.scale(pop, pop);
    words(g, title, -tw / 2, -tH / 2, tScale, GOLD);
    g.restore();
  } else words(g, title, x + (w - tw) / 2, cy, tScale, GOLD);
  cy += tH + 6;

  // Three stars, lit one at a time.
  let lit = 0;
  const sx = x + (w - (3 * starPx + 2 * 4)) / 2;
  for (let i = 0; i < 3; i++) {
    const due = FIRST_STAR + i * STAR_GAP;
    const on = i < stars && age >= due;
    if (on) lit++;
    if (on && starsSounded <= i) {
      starsSounded = i + 1;
      sounds.push(STAR_SOUND);
    }
    const grow = on && age - due < 10 ? 1 + (10 - (age - due)) / 12 : 1;
    const size = Math.round(starPx * grow);
    const px = Math.round(sx + i * (starPx + 4) + (starPx - size) / 2);
    const py = Math.round(cy + (starPx - size) / 2);
    g.globalAlpha = on ? 1 : 0.28;
    if (!drawLook(g, content, 'hall-frame-star', px, py, { w: size, h: size })) {
      g.fillStyle = on ? GOLD : '#5a5470';
      g.fillRect(px + size / 4, py + size / 4, size / 2, size / 2);
    }
    g.globalAlpha = 1;
  }
  cy += starPx + 8;

  // The statistics, each counting up in its turn.
  const shownLines: string[] = [];
  lines.forEach((l, i) => {
    const t = age - lineStart(stars, i);
    if (t < 0) return;
    const k = Math.min(1, t / COUNT);
    const value = l.to === null ? '' : l.fmt(l.to * k);
    const lx = x + 10;
    const ly = cy + i * lineH;
    words(g, l.label, lx, ly, 1, l.to === null ? GOLD : PALE);
    if (value) {
      const vwid = textWidth(g, value, 'light');
      words(g, value, x + w - 10 - vwid, ly, 1, LIGHT);
    }
    shownLines.push(value ? `${l.label} ${value}` : l.label);
  });
  g.restore();
  drawn = { stage: ev.stage, title, stars, lit, lines: shownLines, box: { x, y, w, h }, view: { w: W, h: H }, age };
}

/** For a page that starts over (a new world): nothing carried across. */
export function clearStage(): void {
  open = null;
  drawn = null;
  lastLatest = null;
}
