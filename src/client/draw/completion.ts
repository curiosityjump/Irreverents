import type { Content } from '../../content/types.ts';
import type { World } from '../../sim/types.ts';
import type { PlayerView } from './entities.ts';
import { drawLook, frameAt, look } from './looks.ts';

// Step 14 slice B (docs/mechanisms/levels.md, "Pieces"): the owner, after
// playing, "no hidden places to explore". Every unfound placed piece in this
// room glints where it lies, seen before it can be reached (doc 04: "Visible
// inaccessible curiosities"); when a piece is found it pops, and a short row
// of the level's pieces, grey with the found ones gold, shows at the top for
// two seconds.
// INTENT: a glint marks a piece, never a way: nothing here is drawn at a
// false wall, a hidden door or a roof's route (the pieces' places are data,
// and the check keeps them off solid tiles). No digit anywhere: the row is
// pieces, never "2/5" (t-no-numbers).
// DRAFT: every size, place and time below.

const INK = '#2b2140';
const GREY = '#807b96';
const GOLD = '#ffd23f';
/** Two seconds of this page's frames. */
const ROW_FRAMES = 120;
const POP_FRAMES = 30;

export interface DrawnCompletion {
  /** The unfound placed pieces this frame drew in this room. */
  glints: { piece: string; level: string }[];
  /** The found row, while it shows: the level, and each piece in order, true when found. */
  row: { level: string; pieces: boolean[] } | null;
  /** Pieces popping now (found a moment ago). */
  pops: string[];
}

let last: DrawnCompletion = { glints: [], row: null, pops: [] };
/** Pieces this page has seen found; null until the first frame (what was found before this page came does not pop). */
let known: Set<string> | null = null;
let row: { level: string; until: number } | null = null;
const pops = new Map<string, { room: string; x: number; y: number; at: number }>();

/** What the last frame drew, for `window.irreverents.drawn.completion` (scripted checks read only this). */
export function drawnCompletion(): DrawnCompletion {
  return last;
}

/** Glints and pops in the room, behind the bodies; then the found row, as screen furniture. */
export function drawCompletion(g: CanvasRenderingContext2D, world: World, content: Content, roomId: string, ox: number, oy: number, viewW: number, view?: PlayerView): void {
  const out: DrawnCompletion = { glints: [], row: null, pops: [] };
  last = out;
  const sets = content.completion;
  const room = content.rooms[roomId];
  if (!sets || !room || !view) return;
  const T = room.tile;
  const frame = view.frame;
  const found = new Set<string>();
  for (const [level, ids] of Object.entries(world.found ?? {})) for (const id of ids) found.add(`${level}:${id}`);
  const first = known === null;
  if (first) known = new Set(found);

  for (const set of Object.values(sets)) {
    for (const p of set.pieces) {
      const key = `${set.id}:${p.id}`;
      const placed = p.room !== undefined && p.tile !== undefined;
      const x = placed ? ox + p.tile![0] * T : 0;
      const y = placed ? oy + p.tile![1] * T : 0;
      if (found.has(key)) {
        if (!known!.has(key)) {
          known!.add(key);
          row = { level: set.id, until: frame + ROW_FRAMES };
          if (placed) pops.set(key, { room: p.room!, x: p.tile![0] * T, y: p.tile![1] * T, at: frame });
        }
        continue;
      }
      if (!placed || p.room !== roomId) continue;
      // The glow under it, then the piece itself, bobbing a pixel.
      const glow = look(content, 'fx-pickup-glow');
      const bob = Math.floor(frame / 20) % 2;
      if (glow) drawLook(g, content, 'fx-pickup-glow', x + Math.round((T - glow.w) / 2), y + T - glow.h + 2, { frame: frameAt(glow, frame) });
      if (!drawLook(g, content, p.look ?? 'item-gear', x + Math.round((T - 18) / 2), y + T - 16 - bob)) {
        g.fillStyle = INK;
        g.fillRect(x + 4, y + 5 - bob, 8, 8);
        g.fillStyle = GOLD;
        g.fillRect(x + 5, y + 6 - bob, 6, 6);
      }
      // A sparkle that comes and goes, so it reads as "something here" at a glance.
      if (frame % 60 < 12) {
        g.fillStyle = '#fff1a0';
        g.fillRect(x + 12, y + 2 - bob, 1, 3);
        g.fillRect(x + 11, y + 3 - bob, 3, 1);
      }
      out.glints.push({ piece: p.id, level: set.id });
    }
  }

  // The pop where a piece was found in this room.
  for (const [key, pop] of pops) {
    const age = frame - pop.at;
    if (age > POP_FRAMES) {
      pops.delete(key);
      continue;
    }
    if (pop.room !== roomId) continue;
    out.pops.push(key.slice(key.indexOf(':') + 1));
    const fx = look(content, 'fx-pickup-get');
    if (fx) drawLook(g, content, 'fx-pickup-get', ox + pop.x + Math.round((T - fx.w) / 2), oy + pop.y + T - fx.h, { frame: Math.max(0, frameAt(fx, age, false)) });
    else {
      const r = 2 + age / 3;
      g.fillStyle = GOLD;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) g.fillRect(ox + pop.x + 8 + dx * r - 1, oy + pop.y + 8 + dy * r - 1, 2, 2);
    }
  }

}

/**
 * The found row: the level of what was just found, at the top, for two
 * seconds. Screen furniture, drawn last over everything (render.ts), never
 * over the controls (they sit at the bottom). INTENT: it stops nothing.
 */
export function drawCompletionRow(g: CanvasRenderingContext2D, world: World, content: Content, viewW: number, view?: PlayerView): void {
  const sets = content.completion;
  if (!sets || !view) return;
  const frame = view.frame;
  const out = last;
  if (row && frame < row.until) {
    const set = sets[row.level];
    if (set) {
      const have = world.found?.[row.level] ?? [];
      const pieces = set.pieces.map((p) => have.includes(p.id));
      out.row = { level: row.level, pieces };
      drawRow(g, content, pieces, viewW);
    }
  } else row = null;
}

/** The row of pieces: grey, the found ones gold, centred at the top under the level banner's place. */
function drawRow(g: CanvasRenderingContext2D, content: Content, pieces: boolean[], viewW: number): void {
  const S = 10;
  const w = pieces.length * S + 6;
  const x = Math.round((viewW - w) / 2);
  const y = 26;
  g.fillStyle = INK;
  g.fillRect(x, y, w, S + 6);
  g.fillStyle = '#221f44';
  g.fillRect(x + 1, y + 1, w - 2, S + 4);
  pieces.forEach((gold, i) => {
    const px = x + 3 + i * S;
    if (drawLook(g, content, gold ? 'piece-gold' : 'piece-grey', px, y + 3)) return;
    g.fillStyle = INK;
    g.fillRect(px, y + 3, S - 1, S);
    g.fillStyle = gold ? GOLD : GREY;
    g.fillRect(px + 1, y + 4, S - 3, S - 2);
    g.fillRect(px + 3, y + 2, 3, 2);
  });
}
