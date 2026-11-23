import type { Content } from '../../content/types.ts';
import { image } from './images.ts';

// The actor lane's way to the contract's looks (docs/mechanisms/art-pipeline.md,
// "Everything else code used to draw"): find a look by id, draw one frame
// of it, a tinted copy, a nine-slice, and text that reads on any ground.
// Every function answers "not drawn" when the look or its image is missing,
// so the caller draws what it drew before.
// DRAFT: reads content.looks itself, loosely, so it works whichever way the
// foundation lane's kind shapes it; see docs/mechanisms/rendering-actors.md.

/** One look, resolved: its image and the first frame's rectangle. */
export interface Look {
  img: HTMLImageElement;
  x: number;
  y: number;
  w: number;
  h: number;
  frames: number;
  fps: number;
}

interface RawLook { src?: unknown; frames?: unknown; fps?: unknown; image?: unknown }
interface RawGroup { image?: unknown; looks?: Record<string, RawLook> }

let current: Content | null = null;
let index: Map<string, { image: string; src: number[]; frames: number; fps: number }> | null = null;

/**
 * Which content the looks come from. drawEntities sets it every frame, so
 * files whose entry points get no content (draw/impact.ts) can still ask.
 */
export function useContent(content: Content): void {
  if (content === current) return;
  current = content;
  index = null;
}

function build(): Map<string, { image: string; src: number[]; frames: number; fps: number }> {
  const out = new Map<string, { image: string; src: number[]; frames: number; fps: number }>();
  const groups = (current as unknown as { looks?: Record<string, RawGroup> } | null)?.looks;
  if (!groups || typeof groups !== 'object') return out;
  for (const group of Object.values(groups)) {
    if (!group || typeof group !== 'object' || !group.looks) continue;
    for (const [id, raw] of Object.entries(group.looks)) {
      const src = raw?.src;
      const img = typeof raw?.image === 'string' ? raw.image : group.image;
      if (!Array.isArray(src) || src.length !== 4 || typeof img !== 'string') continue;
      out.set(id, { image: img, src: src as number[], frames: typeof raw.frames === 'number' && raw.frames > 0 ? raw.frames : 1, fps: typeof raw.fps === 'number' && raw.fps > 0 ? raw.fps : 10 });
    }
  }
  return out;
}

/** The look with this id, once its image has loaded; else null (draw the old shape). */
export function look(id: string): Look | null {
  index ??= build();
  const l = index.get(id);
  if (!l) return null;
  const img = image(l.image);
  if (!img) return null;
  const [x, y, w, h] = l.src as [number, number, number, number];
  return { img, x, y, w, h, frames: l.frames, fps: l.fps };
}

/** Which frame a strip shows `age` ticks after it began: looping, or once (then -1 when over). */
export function frameOf(l: Look, age: number, loop: boolean): number {
  const f = Math.floor((Math.max(0, age) * l.fps) / 60);
  if (loop) return f % l.frames;
  return f < l.frames ? f : -1;
}

/** How long a strip lasts when played once, in ticks. */
export function lengthOf(l: Look): number {
  return Math.max(1, Math.ceil((l.frames * 60) / l.fps));
}

/** Draws frame `frame` of a look with its top-left at (x, y), whole pixels, optionally mirrored and scaled. */
export function drawFrame(g: CanvasRenderingContext2D, l: Look, frame: number, x: number, y: number, opts: { flip?: boolean; w?: number; h?: number; source?: CanvasImageSource } = {}): void {
  const w = Math.round(opts.w ?? l.w);
  const h = Math.round(opts.h ?? l.h);
  const sx = opts.source ? frame * l.w : l.x + frame * l.w;
  const sy = opts.source ? 0 : l.y;
  const px = Math.round(x);
  const py = Math.round(y);
  if (opts.flip) {
    g.save();
    g.translate(px + w, py);
    g.scale(-1, 1);
    g.drawImage(opts.source ?? l.img, sx, sy, l.w, l.h, 0, 0, w, h);
    g.restore();
  } else g.drawImage(opts.source ?? l.img, sx, sy, l.w, l.h, px, py, w, h);
}

/** Offscreen copies of a look's whole strip painted one colour over its own pixels (the player mark). Made once per look and colour. */
const tints = new Map<string, HTMLCanvasElement>();
export function tinted(l: Look, color: string): HTMLCanvasElement {
  const key = `${l.img.src}|${l.x},${l.y},${l.w},${l.h},${l.frames}|${color}`;
  let c = tints.get(key);
  if (!c) {
    c = document.createElement('canvas');
    c.width = l.w * l.frames;
    c.height = l.h;
    const g = c.getContext('2d')!;
    g.drawImage(l.img, l.x, l.y, l.w * l.frames, l.h, 0, 0, l.w * l.frames, l.h);
    // Multiply keeps the drawn shading of a white mark; source-atop keeps its shape.
    g.globalCompositeOperation = 'multiply';
    g.fillStyle = color;
    g.fillRect(0, 0, c.width, c.height);
    g.globalCompositeOperation = 'destination-in';
    g.drawImage(l.img, l.x, l.y, l.w * l.frames, l.h, 0, 0, l.w * l.frames, l.h);
    if (tints.size > 64) tints.clear();
    tints.set(key, c);
  }
  return c;
}

/**
 * A nine-slice box: the look is 3×3 cells (corners kept, edges and middle
 * stretched). With the contract's 4×4 cells a look is 12×12. Returns
 * whether it drew.
 */
export function drawNine(g: CanvasRenderingContext2D, id: string, x: number, y: number, w: number, h: number): boolean {
  const l = look(id);
  if (!l) return false;
  const cw = Math.floor(l.w / 3);
  const chh = Math.floor(l.h / 3);
  const mw = Math.max(0, w - 2 * cw);
  const mh = Math.max(0, h - 2 * chh);
  const xs = [x, x + cw, x + cw + mw];
  const ws = [cw, mw, cw];
  const ys = [y, y + chh, y + chh + mh];
  const hs = [chh, mh, chh];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (ws[c]! <= 0 || hs[r]! <= 0) continue;
      g.drawImage(l.img, l.x + c * cw, l.y + r * chh, cw, chh, xs[c]!, ys[r]!, ws[c]!, hs[r]!);
    }
  }
  return true;
}

/** Text on whole pixels with a 1 px dark edge all round, so it reads on any ground. */
export function edgedText(g: CanvasRenderingContext2D, text: string, x: number, y: number, color: string, edge: string): void {
  const px = Math.round(x);
  const py = Math.round(y);
  g.fillStyle = edge;
  for (const [dx, dy] of EDGE) g.fillText(text, px + dx, py + dy);
  g.fillStyle = color;
  g.fillText(text, px, py);
}
const EDGE: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]];
