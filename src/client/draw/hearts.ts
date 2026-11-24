import type { Content } from '../../content/types.ts';
import { heartsLeft, maxHearts } from '../../sim/hearts.ts';
import type { World } from '../../sim/types.ts';
import { drawLook, look } from './looks.ts';

// Step 21, hearts (the owner, 2026-11-24: "Heros should have hearts which
// can be lost"; docs/mechanisms/defeat.md, "Hearts"): a row of hearts under
// each face on the party plate (draw/hud.ts calls these). Full hearts red,
// lost ones dark. A heart lost since the last frame pops: it swells and
// fades over POP_FRAMES at its place in the row, on every page (the party's
// hearts come with every snapshot, World.heartsLost).
// INTENT: no digits (t-no-numbers; D-020): a heart is a picture, never a count.
// The viewer's row is the cut looks `hud-heart-full` and `hud-heart-empty`
// (the props builder, 2026-11-24, from the approved P07 UI atlas); a
// friend's row is 3 by 3 hearts drawn in the same colours (DRAFT: a cut
// that small is on the missing list). Without the looks, a stand-in of the
// same shape is drawn.

/** The viewer's hearts (9 by 8 game px, the cut look's size) and a friend's (3 by 3), as rows of pixels: '#' filled; the stand-in when a look is missing. */
const BIG = ['.###.###.', '#########', '#########', '#########', '########.', '.#######.', '..#####..', '....#....'];
const SMALL = ['#.#', '###', '.#.'];
/** The cut hearts' own colours (assets/ui/hud.png), so a friend's small heart matches the viewer's. */
const FULL = '#e860a0';
const EMPTY = '#5c5690';
/** DRAFT: about a third of a second of this page's frames. */
const POP_FRAMES = 22;

/** The size of one heart, and the step from one to the next, in game px. */
export function heartSize(big: boolean): { w: number; h: number; step: number } {
  return big ? { w: 9, h: 8, step: 9 } : { w: 3, h: 3, step: 4 };
}

let lastLeft: Record<string, number> = {};
let pops: { kind: string; index: number; frame: number }[] = [];
let drawnRows: Record<string, { left: number; max: number }> = {};

/** What the plate's heart rows showed last frame, by hero kind, for `window.irreverents.drawn.hearts`. */
export function drawnHearts(): { rows: Record<string, { left: number; max: number }>; pops: number } {
  return { rows: drawnRows, pops: pops.length };
}

/** Called once a frame before the rows are drawn: notes the hearts lost since the last frame (each pops). */
export function noteHearts(world: World, content: Content, kinds: string[], frame: number): void {
  drawnRows = {};
  for (const k of kinds) {
    const left = heartsLeft(world, content, k);
    const was = lastLeft[k];
    if (was !== undefined && left < was) for (let i = left; i < was; i++) pops.push({ kind: k, index: i, frame });
    lastLeft[k] = left;
  }
  pops = pops.filter((p) => frame - p.frame <= POP_FRAMES);
}

/** Whether a hero kind has no hearts left (its face is drawn greyed). */
export function isOut(world: World, content: Content, kind: string): boolean {
  return content.hearts?.on === true && heartsLeft(world, content, kind) === 0;
}

/** Draws a hero's row of hearts with its first heart's top-left at (x, y). */
export function drawHeartRow(g: CanvasRenderingContext2D, world: World, content: Content, kind: string, x: number, y: number, big: boolean, frame: number): void {
  if (!content.hearts?.on) return;
  const max = maxHearts(content, kind);
  const left = heartsLeft(world, content, kind);
  drawnRows[kind] = { left, max };
  const s = heartSize(big);
  for (let i = 0; i < max; i++) heart(g, content, x + i * s.step, y, i < left, big);
  for (const p of pops) {
    if (p.kind !== kind) continue;
    const age = frame - p.frame;
    const k = 1 + age / 7;
    const before = g.globalAlpha;
    g.globalAlpha = before * Math.max(0, 1 - age / POP_FRAMES);
    const cx = x + p.index * s.step + s.w / 2;
    const cy = y + s.h / 2 - age / 3;
    g.save();
    g.translate(cx, cy);
    g.scale(k, k);
    heart(g, content, -s.w / 2, -s.h / 2, true, big);
    g.restore();
    g.globalAlpha = before;
  }
}

function heart(g: CanvasRenderingContext2D, content: Content, x: number, y: number, full: boolean, big: boolean): void {
  const s = heartSize(big);
  const id = full ? 'hud-heart-full' : 'hud-heart-empty';
  // The cut look for the viewer's row; a friend's 3 by 3 heart is too small to scale it down to, so it is drawn in its colours.
  if (big && look(content, id) && drawLook(g, content, id, x, y, { w: s.w, h: s.h })) return;
  const rows = big ? BIG : SMALL;
  rows.forEach((row, r) => {
    for (let c = 0; c < row.length; c++) {
      if (row[c] !== '#') continue;
      g.fillStyle = full ? FULL : EMPTY;
      g.fillRect(x + c, y + r, 1, 1);
    }
  });
}
