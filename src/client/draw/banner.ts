import { drawText, safeView, textWidth } from './fx.ts';

// Step 19 push 2 (docs/mechanisms/rendering-world.md, "Banners"): one queue
// for the short banners across the top of the view. Any draw file adds one
// with queueBanner (a level discovered, a clean getaway, a piece found, a
// hero freed); render.ts draws the queue last, as screen furniture.
//
// INTENT: a banner takes no input and stops nothing; it goes by itself after
// its time (there is always a way out). One at a time, in the order they
// came; at the top, never over the controls (they sit at the bottom), and
// clear of the party plate (draw/hud.ts).
// DRAFT: every size, colour and time below.

const INK = '#2b2140';
const PLATE = '#221f44';
const EDGE = '#e09a1e';
const LIGHT = '#fff1a0';
/** DRAFT: two seconds of this page's frames. */
export const BANNER_FRAMES = 120;
/** DRAFT: at most this many wait; a flood of the same moment drops the oldest waiting. */
const MAX_WAITING = 4;
/** DRAFT (brief phone-hud-legibility, third pass): the share of the view's width, at its right, a banner beside the plate keeps clear of (the Switch and sound buttons sit over it). */
const RIGHT_KEEP = 0.16;

export interface Banner {
  /** Unique while queued or showing: the same key queued again is ignored. Prefix it with your slice ("level:", "heist:"). */
  key: string;
  /** The words. No digits (t-no-numbers). */
  text: string;
  /** How long it stays, in frames of this page's clock. Default BANNER_FRAMES. */
  frames?: number;
  /** The words' colour. Default a warm light. */
  color?: string;
}

let waiting: Banner[] = [];
let current: (Banner & { until: number }) | null = null;
let shown: { key: string; text: string } | null = null;

/** Adds a banner to the queue (ignored when the same key is already waiting or up). */
export function queueBanner(b: Banner): void {
  if (current?.key === b.key || waiting.some((w) => w.key === b.key)) return;
  waiting.push(b);
  if (waiting.length > MAX_WAITING) waiting.shift();
}

/** The banner up on the last frame drawn, for the page's drawn record; null when none. */
export function drawnBanner(): { key: string; text: string } | null {
  return shown;
}

/**
 * Draws the banner that is up (taking the next when its time is over),
 * centred across the top, below `clearOf` (the party plate) when it would
 * overlap it. Screen furniture: called last in render.ts.
 */
export function drawBanners(g: CanvasRenderingContext2D, viewW: number, frame: number, clearOf?: { x: number; y: number; w: number; h: number }): void {
  shown = null;
  if (current && frame >= current.until) current = null;
  if (!current) {
    const next = waiting.shift();
    if (!next) return;
    current = { ...next, until: frame + (next.frames ?? BANNER_FRAMES) };
  }
  const text = current.text;
  const tw = textWidth(g, text, 'light');
  const w = tw + 16;
  const h = 16;
  let y = 6 + safeView.top;
  let x = Math.round((viewW - w) / 2);
  if (clearOf && x < clearOf.x + clearOf.w && x + w > clearOf.x && y < clearOf.y + clearOf.h) {
    // DRAFT (brief phone-hud-legibility, third pass: a wider plate pushed "Bandit Camp" down into the play area's sky):
    // first beside the plate, on the top row, while it ends short of the top-right buttons (Switch, sound: the last
    // RIGHT_KEEP of the view); only where it does not fit there, below the plate.
    const beside = clearOf.x + clearOf.w + 4;
    if (beside + w <= viewW * (1 - RIGHT_KEEP)) x = beside;
    else y = clearOf.y + clearOf.h + 3;
  }
  g.fillStyle = INK;
  g.fillRect(x - 1, y, w + 2, h);
  g.fillRect(x, y - 1, w, h + 2);
  g.fillStyle = EDGE;
  g.fillRect(x, y, w, h);
  g.fillStyle = PLATE;
  g.fillRect(x + 1, y + 1, w - 2, h - 2);
  if (!drawText(g, text, x + 8, y + 3, 'light', current.color)) {
    g.font = 'bold 8px monospace';
    g.textBaseline = 'top';
    g.fillStyle = current.color ?? LIGHT;
    g.fillText(text, x + 8, y + 4);
  }
  shown = { key: current.key, text };
}

/** For a page that starts over (a new world): nothing carried across. */
export function clearBanners(): void {
  waiting = [];
  current = null;
  shown = null;
}
