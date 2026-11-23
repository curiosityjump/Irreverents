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

/**
 * Look round 3 (gap 12): the safe area's insets over the game picture, in game pixels, set by
 * shell.ts on every layout, so screen furniture drawn in the picture (the alert pips, an edge
 * bark) stays clear of a notch while the picture itself runs under it. All 0 when nothing of
 * the picture is under an inset. Kept here so draw files never import the shell (an import
 * cycle through render.ts).
 */
export const safeView = { left: 0, right: 0, top: 0 };

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

/**
 * Round 2: the game's pixel font (the contract's `font-dark` / `font-light`:
 * a 95-frame strip, ASCII 32–126 in order, each cell one glyph, advancing
 * by the cell's width). `dark` is for words on paper (barks), `light` for
 * words on a dark ground (it carries its own 1 px shadow).
 */
export type FontName = 'dark' | 'light';

/** The font look, once loaded; null means "draw words the old way" (fillText). */
export function font(name: FontName): Look | null {
  return look(`font-${name}`);
}

/** How wide a line of text is drawn, in pixels: by the font's advance, else the canvas's own measure. */
export function textWidth(g: CanvasRenderingContext2D, text: string, name: FontName): number {
  const f = font(name);
  return f ? Math.max(0, inFont(text).length * f.w - 1) : g.measureText(text).width;
}

/** The height of one line of the font (its cell), else `fallback`. */
export function lineHeight(name: FontName, fallback: number): number {
  return font(name)?.h ?? fallback;
}

/**
 * Draws one line with its top-left at (x, y), glyph by glyph on whole
 * pixels from the font strip; `color` repaints the letters (multiply over
 * their own shading). Returns false when the font is missing, and draws
 * nothing: the caller then uses fillText as before.
 */
export function drawText(g: CanvasRenderingContext2D, text: string, x: number, y: number, name: FontName, color?: string): boolean {
  const f = font(name);
  if (!f) return false;
  noteWords(text);
  const source = color ? tinted(f, color) : undefined;
  const px = Math.round(x);
  const py = Math.round(y);
  text = inFont(text);
  for (let i = 0; i < text.length; i++) {
    let code = text.charCodeAt(i) - 32;
    if (code === 0) continue;
    // Outside the strip (an ellipsis, an accent): a question mark, so the line keeps its length.
    if (code < 0 || code >= f.frames) code = 63 - 32;
    drawFrame(g, f, code, px + i * f.w, py, source ? { source } : {});
  }
  return true;
}

/**
 * Round 3 (gap 15): the few non-ASCII marks the game's own words use, spelled in the font's
 * ASCII, so they never draw as "?". Anything else outside the strip still draws as "?".
 * DRAFT: the spellings ("·" as "-", "…" as "...").
 */
const SPELLED: Record<string, string> = { '·': '-', '…': '...', '—': '-', '–': '-', '’': "'", '‘': "'", '“': '"', '”': '"' };
function inFont(text: string): string {
  return /[^\x20-\x7e]/.test(text) ? text.replace(/[·…—–’‘“”]/g, (c) => SPELLED[c] ?? c) : text;
}

// Step 2, signal 6: every string drawn into the game picture, for the
// page's debug record (`window.irreverents.drawn.words`). Impact is
// physical, never a number on screen (docs/vision.md, "What it is not"),
// and the e2e fact `t-no-numbers` reads this to check it. Filled by
// drawText (the pixel font) and by fillText on the game canvas
// (watchWords); taken, and emptied, once per frame by the page.
let words: string[] = [];
/** Notes one string as drawn into the game picture (each once per frame). */
export function noteWords(text: string): void {
  if (text !== '' && !words.includes(text)) words.push(text);
}
/** The strings drawn into the game picture since the last call, in the order first drawn. */
export function takeWords(): string[] {
  const out = words;
  words = [];
  return out;
}
const watched = new WeakSet<CanvasRenderingContext2D>();
/**
 * Makes every fillText on this context note its string too: words drawn
 * the old way (no font yet, edgedText, a direct fillText) count as drawn.
 * INTENT: on the context itself, not at each call site, so a string a later
 * change draws into the game picture is in the record without that change
 * knowing about it. Once per context; it draws exactly as before.
 */
export function watchWords(g: CanvasRenderingContext2D): void {
  if (watched.has(g)) return;
  watched.add(g);
  const fill = g.fillText.bind(g);
  g.fillText = (text: string, x: number, y: number, maxWidth?: number): void => {
    noteWords(String(text));
    if (maxWidth === undefined) fill(text, x, y);
    else fill(text, x, y, maxWidth);
  };
}

/** Breaks text into lines no wider than `width` pixels in this font (a word longer than a line stands alone). */
export function wrapText(g: CanvasRenderingContext2D, text: string, width: number, name: FontName): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${word}` : word;
    if (line && textWidth(g, next, name) > width) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}
