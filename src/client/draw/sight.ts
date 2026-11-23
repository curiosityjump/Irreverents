import type { Content } from '../../content/types.ts';
import { sightBox } from '../../sim/npc/sight.ts';
import { bandCells } from './band-cells.ts';
import { isOut } from '../../sim/npc/state.ts';
import type { Entity, SimEvent, World } from '../../sim/types.ts';
import { look } from './fx.ts';
import { drawLookFrame } from './looks.ts';

// Step 19 push 3 (docs/mechanisms/heists.md, "Sight you can see"): every
// person's sight drawn as a faint band, behind the bodies, so a phone player
// can read a job before doing it. The owner's comp A00-01 draws a vision
// cone; the library's doc 07 asks for "detection cones or simple proximity
// checks".
//
// INTENT: it draws the test that exists, exactly, and adds none (O-007,
// detection rules, is OPEN). The band is sightBox (src/sim/npc/sight.ts):
// where a body's MIDDLE must be for canSee to see it, the eye's own column
// included; a cell is lit only where the line from the eye to the cell's
// middle is clear (lineClear, canSee's own test). scripts/checks/
// step19-band.ts holds bandCells to canSee at every cell's middle.
// DRAFT: the look (a pale wash, a brighter far edge), the 8 px cells (the
// band's grain; between two cell middles canSee's answer can differ), and
// the unseen mark.

const WASH = 'rgba(255, 196, 60, 0.3)';
const RIM = 'rgba(255, 150, 40, 0.75)';

export interface DrawnBand {
  id: string;
  facing: 1 | -1;
  /** The box, room pixels, and how many cells were lit. */
  x0: number;
  x1: number;
  eyeX: number;
  cells: number;
}
let drawnBands: DrawnBand[] = [];
let drawnMarks: { by: string; x: number; y: number }[] = [];

/** What the last frame drew, for `window.irreverents.drawn.sight`. */
export function drawnSight(): { bands: DrawnBand[]; unseen: { by: string; x: number; y: number }[] } {
  return { bands: drawnBands, unseen: drawnMarks };
}

/** Behind the bodies: every person in the room who is not out cold. */
export function drawSight(g: CanvasRenderingContext2D, world: World, content: Content, roomId: string, ox: number, oy: number): void {
  drawnBands = [];
  for (const e of world.entities) {
    if (!e.c.npc || e.room !== roomId || isOut(e)) continue;
    const cells = bandCells(content, e);
    const box = sightBox(content, e);
    if (!box) continue;
    g.fillStyle = WASH;
    for (const c of cells) g.fillRect(Math.round(ox + c.x), Math.round(oy + c.y), Math.round(c.w), Math.round(c.h));
    // The far edge, where sight ends: one brighter column on the lit cells there.
    g.fillStyle = RIM;
    const far = e.facing > 0 ? box.x1 : box.x0;
    for (const c of cells) {
      if ((e.facing > 0 && c.x + c.w >= far) || (e.facing < 0 && c.x <= far)) g.fillRect(Math.round(ox + (e.facing > 0 ? c.x + c.w - 1 : c.x)), Math.round(oy + c.y), 1, Math.round(c.h));
    }
    drawnBands.push({ id: e.id, facing: e.facing, x0: box.x0, x1: box.x1, eyeX: box.eye.x, cells: cells.length });
  }
}

/** DRAFT: how long the unseen mark stays, in this page's frames (a second and a half). */
const MARK_FRAMES = 90;
let marks: { by: string; room: string; x: number; y: number; until: number }[] = [];
let lastLatest: unknown = null;
let frameNow = 0;

/**
 * An unseen deed: the `deed` event (src/sim/npc/state.ts) with no
 * witnesses, done by a player, gets a soft tick and a closed eye over where
 * it was done. Fed every frame from main.ts with the server's newest events
 * (snap.ev; a page does not do a take itself).
 */
export function watchSightEvents(latest: { tick: number; events: readonly SimEvent[] }, frame: number): void {
  frameNow = frame;
  if (latest === lastLatest) return;
  lastLatest = latest;
  for (const ev of latest.events) {
    if (ev.type !== 'deed' || ev.player === null || ev.witnesses.length > 0) continue;
    if (marks.some((m) => m.by === ev.by && Math.abs(m.x - ev.x) < 1 && m.until > frame)) continue;
    marks.push({ by: ev.by, room: ev.room, x: ev.x, y: ev.y, until: frame + MARK_FRAMES });
  }
}

/** Over the bodies, with the marks over heads: the unseen marks in this room. */
export function drawUnseenMarks(g: CanvasRenderingContext2D, roomId: string, ox: number, oy: number): void {
  marks = marks.filter((m) => m.until > frameNow);
  drawnMarks = [];
  for (const m of marks) {
    if (m.room !== roomId) continue;
    const left = m.until - frameNow;
    const rise = Math.floor((MARK_FRAMES - left) / 10);
    const x = Math.round(ox + m.x);
    const y = Math.round(oy + m.y) - 22 - rise;
    const art = look('unseen');
    if (art) drawLookFrame(g, art, x - Math.floor(art.w / 2), y - art.h);
    else mark(g, x, y);
    drawnMarks.push({ by: m.by, x: m.x, y: m.y });
  }
}

/** The stand-in: a closed eye (a lid's curve and three lashes) and a tick beside it, dark-edged. */
function mark(g: CanvasRenderingContext2D, x: number, y: number): void {
  const ink = '#1b1b2f';
  const pale = '#f4f1de';
  const green = '#8fd694';
  // The closed eye, 9 px wide, its middle 5 px left of x.
  const lid: [number, number][] = [[-9, -2], [-8, -1], [-7, 0], [-6, 0], [-5, 0], [-4, 0], [-3, 0], [-2, -1], [-1, -2]];
  const lashes: [number, number][] = [[-8, 1], [-5, 2], [-2, 1]];
  g.fillStyle = ink;
  for (const [dx, dy] of [...lid, ...lashes]) g.fillRect(x + dx - 1, y + dy - 1, 3, 3);
  g.fillStyle = pale;
  for (const [dx, dy] of [...lid, ...lashes]) g.fillRect(x + dx, y + dy, 1, 1);
  // The tick, 6 px wide, right of x.
  const tick: [number, number][] = [[2, -1], [3, 0], [4, -1], [5, -2], [6, -3], [7, -4]];
  g.fillStyle = ink;
  for (const [dx, dy] of tick) g.fillRect(x + dx - 1, y + dy - 1, 3, 3);
  g.fillStyle = green;
  for (const [dx, dy] of tick) g.fillRect(x + dx, y + dy, 1, 2);
}
