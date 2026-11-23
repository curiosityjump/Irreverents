import type { LookEntry } from '../../content/kinds/looks.ts';
import { lookTable } from '../../content/kinds/looks.ts';
import type { Content } from '../../content/types.ts';
import { image } from './images.ts';

// The renderer's one way to the pictures in content/looks/
// (docs/mechanisms/art-pipeline.md, "Everything else code used to draw",
// which lists the look ids in use). Ask for a look by id; every function
// answers "not drawn" (null or false) when the id is missing or its image
// has not loaded, and the caller draws the plain shape it drew before, so
// looks arrive one at a time and nothing breaks without them.
// Nothing here allocates per frame once a look has been seen: resolved
// looks and tinted strips are cached. Nothing is random.
// Notes: docs/mechanisms/art-foundation.md.

/** One look, resolved: its loaded image, the first frame's rectangle, and its strip. */
export interface Look {
  id: string;
  img: HTMLImageElement;
  /** Top-left of frame 0 in the image; frame n is n·w to the right. */
  x: number;
  y: number;
  w: number;
  h: number;
  frames: number;
  fps: number;
}

/** Where (x, y) is on the drawn picture. */
export type LookAnchor = 'top-left' | 'bottom-left' | 'bottom-centre' | 'centre';

export interface DrawLookOptions {
  /** Which frame of the strip; wraps round (default 0). frameAt() turns ticks into one. */
  frame?: number;
  /** Mirrored sideways, in place (pictures face right). */
  flip?: boolean;
  /** Destination size in pixels (default the look's own size). */
  w?: number;
  h?: number;
  /** 0..1, multiplied with the context's own alpha (default 1). */
  alpha?: number;
  /** A colour painted over the look's own pixels (see tinted()). */
  tint?: string;
  /** Where (x, y) is on the picture (default the top-left). */
  anchor?: LookAnchor;
}

const tables = new WeakMap<Content, Map<string, LookEntry>>();
const resolved = new WeakMap<Content, Map<string, Look>>();

function table(content: Content): Map<string, LookEntry> {
  let t = tables.get(content);
  if (!t) {
    t = lookTable(content);
    tables.set(content, t);
  }
  return t;
}

/** Whether content names this look at all (its image may still be loading). */
export function hasLook(content: Content, id: string): boolean {
  return table(content).has(id);
}

/** The look with this id once its image has loaded; null when it is missing or still loading (draw the old shape). */
export function look(content: Content, id: string): Look | null {
  let cache = resolved.get(content);
  if (!cache) {
    cache = new Map();
    resolved.set(content, cache);
  }
  const hit = cache.get(id);
  if (hit) return hit;
  const e = table(content).get(id);
  if (!e) return null;
  const img = image(e.image);
  if (!img) return null;
  const [x, y, w, h] = e.src;
  const l: Look = { id, img, x, y, w, h, frames: e.frames, fps: e.fps };
  cache.set(id, l);
  return l;
}

/**
 * Which frame a strip shows `ticks` (of 60 a second) after it began.
 * Looping wraps; played once, it is -1 when over (hold the last frame with
 * Math.max(0, …) or stop drawing, as the caller wants).
 */
export function frameAt(l: Look, ticks: number, loop = true): number {
  const f = Math.floor((Math.max(0, ticks) * l.fps) / 60);
  if (loop) return f % l.frames;
  return f < l.frames ? f : -1;
}

/** How long a strip lasts played once, in ticks. */
export function lookTicks(l: Look): number {
  return Math.max(1, Math.ceil((l.frames * 60) / l.fps));
}

/**
 * Draws one frame of a look at (x, y), on whole pixels. Returns false,
 * drawing nothing, when the look or its image is missing.
 */
export function drawLook(g: CanvasRenderingContext2D, content: Content, id: string, x: number, y: number, opts: DrawLookOptions = {}): boolean {
  const l = look(content, id);
  if (!l) return false;
  drawLookFrame(g, l, x, y, opts);
  return true;
}

/** drawLook for a look already in hand. */
export function drawLookFrame(g: CanvasRenderingContext2D, l: Look, x: number, y: number, opts: DrawLookOptions = {}): void {
  const n = opts.frame ?? 0;
  const frame = ((Math.floor(n) % l.frames) + l.frames) % l.frames;
  const w = Math.round(opts.w ?? l.w);
  const h = Math.round(opts.h ?? l.h);
  let px = x;
  let py = y;
  switch (opts.anchor) {
    case 'bottom-left': py = y - h; break;
    case 'bottom-centre': px = x - w / 2; py = y - h; break;
    case 'centre': px = x - w / 2; py = y - h / 2; break;
    default: break;
  }
  px = Math.round(px);
  py = Math.round(py);
  let src: CanvasImageSource = l.img;
  let sx = l.x + frame * l.w;
  let sy = l.y;
  if (opts.tint) {
    src = tinted(l, opts.tint);
    sx = frame * l.w;
    sy = 0;
  }
  const alpha = opts.alpha ?? 1;
  if (alpha <= 0) return;
  const before = g.globalAlpha;
  if (alpha < 1) g.globalAlpha = before * alpha;
  if (opts.flip) {
    g.save();
    g.translate(px + w, py);
    g.scale(-1, 1);
    g.drawImage(src, sx, sy, l.w, l.h, 0, 0, w, h);
    g.restore();
  } else {
    g.drawImage(src, sx, sy, l.w, l.h, px, py, w, h);
  }
  g.globalAlpha = before;
}

/**
 * A nine-slice box filling (x, y, w, h): the look is 3×3 equal cells
 * (the contract's `bark` and `ribbon` are 3×3 cells of 4×4 px); corners
 * are kept, edges and middle stretched. Returns false, drawing nothing,
 * when the look or its image is missing.
 */
export function drawNine(g: CanvasRenderingContext2D, content: Content, id: string, x: number, y: number, w: number, h: number, opts: { alpha?: number } = {}): boolean {
  const l = look(content, id);
  if (!l) return false;
  const cw = Math.floor(l.w / 3);
  const ch = Math.floor(l.h / 3);
  const px = Math.round(x);
  const py = Math.round(y);
  const W = Math.max(Math.round(w), 2 * cw);
  const H = Math.max(Math.round(h), 2 * ch);
  const mw = W - 2 * cw;
  const mh = H - 2 * ch;
  const alpha = opts.alpha ?? 1;
  const before = g.globalAlpha;
  if (alpha < 1) g.globalAlpha = before * alpha;
  for (let r = 0; r < 3; r++) {
    const dy = r === 0 ? py : r === 1 ? py + ch : py + ch + mh;
    const dh = r === 1 ? mh : ch;
    if (dh <= 0) continue;
    for (let c = 0; c < 3; c++) {
      const dx = c === 0 ? px : c === 1 ? px + cw : px + cw + mw;
      const dw = c === 1 ? mw : cw;
      if (dw <= 0) continue;
      g.drawImage(l.img, l.x + c * cw, l.y + r * ch, cw, ch, dx, dy, dw, dh);
    }
  }
  g.globalAlpha = before;
  return true;
}

/** How a tint is laid over a look's pixels. */
export type TintMode = 'multiply' | 'paint';

const tints = new Map<string, HTMLCanvasElement>();
/** DRAFT: a plain cap on cached tinted strips; the cast and marks need a handful. */
const MAX_TINTS = 128;

/**
 * An offscreen copy of a look's whole strip with a colour laid over its own
 * pixels (transparent pixels stay transparent). `multiply` keeps the drawn
 * shading (a white `player-mark` becomes the player's colour); `paint`
 * covers the pixels with the colour at `amount` (a hit flash, an enraged
 * red). Made once per look, colour, mode and amount; frame n is n·w across.
 */
export function tinted(l: Look, color: string, mode: TintMode = 'multiply', amount = 1): HTMLCanvasElement {
  const key = `${l.img.src}|${l.x},${l.y},${l.w},${l.h},${l.frames}|${color}|${mode}|${amount}`;
  let c = tints.get(key);
  if (c) return c;
  c = document.createElement('canvas');
  c.width = l.w * l.frames;
  c.height = l.h;
  const t = c.getContext('2d')!;
  t.imageSmoothingEnabled = false;
  t.drawImage(l.img, l.x, l.y, c.width, l.h, 0, 0, c.width, l.h);
  t.globalCompositeOperation = mode === 'multiply' ? 'multiply' : 'source-atop';
  t.globalAlpha = Math.max(0, Math.min(1, amount));
  t.fillStyle = color;
  t.fillRect(0, 0, c.width, c.height);
  // Multiply also paints the transparent pixels: cut back to the look's own shape.
  t.globalAlpha = 1;
  t.globalCompositeOperation = 'destination-in';
  t.drawImage(l.img, l.x, l.y, c.width, l.h, 0, 0, c.width, l.h);
  if (tints.size >= MAX_TINTS) tints.clear();
  tints.set(key, c);
  return c;
}
