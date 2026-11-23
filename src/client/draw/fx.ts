import type { Content } from '../../content/types.ts';
import { drawNine as nine, frameAt, look as lookIn, lookTicks, tinted as tintedIn } from './looks.ts';
import type { Look } from './looks.ts';

// The actor lane's short way to the contract's looks
// (docs/mechanisms/art-pipeline.md), over the foundation lane's helper
// (draw/looks.ts): the content is remembered once per frame, so draw files
// whose entry points get no content (draw/impact.ts) can ask too. Every
// function answers "not drawn" when the look or its image is missing, so
// the caller draws what it drew before.
// Notes: docs/mechanisms/rendering-actors.md.

export type { Look };

let current: Content | null = null;

/** Which content the looks come from. drawEntities sets it every frame. */
export function useContent(content: Content): void {
  current = content;
}

/** The look with this id, once its image has loaded; else null (draw the old shape). */
export function look(id: string): Look | null {
  return current ? lookIn(current, id) : null;
}

/** Which frame a strip shows `age` ticks after it began: looping, or once (then -1 when over). */
export function frameOf(l: Look, age: number, loop: boolean): number {
  return frameAt(l, age, loop);
}

/** How long a strip lasts when played once, in ticks. */
export function lengthOf(l: Look): number {
  return lookTicks(l);
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

/** A look's whole strip painted one colour over its own pixels, keeping its shading (the player mark). Cached by draw/looks.ts. */
export function tinted(l: Look, color: string): HTMLCanvasElement {
  return tintedIn(l, color, 'multiply');
}

/** A nine-slice box (draw/looks.ts): returns whether it drew. */
export function drawNine(g: CanvasRenderingContext2D, id: string, x: number, y: number, w: number, h: number): boolean {
  return current ? nine(g, current, id, x, y, w, h) : false;
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
