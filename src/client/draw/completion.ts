import type { Content } from '../../content/types.ts';
import type { World } from '../../sim/types.ts';
import type { PlayerView } from './entities.ts';
import { drawLook, frameAt, look } from './looks.ts';
import { levelProgress } from '../../sim/levels.ts';
import { drawPie } from './levels.ts';
import { safeView } from './fx.ts';

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
  /** Push 2: the level whose pie flashes at the top because a hidden place of it was just found, and the pie drawn; null when none. */
  place: { level: string; quarters: number } | null;
  /** Push 3: levels whose finished set is snapping together in this room now. */
  snaps?: string[];
}

let last: DrawnCompletion = { glints: [], row: null, pops: [], place: null };
/** Hidden places this page has seen found (`<level>:<place>`); null until the first frame (what was found before this page came does not flash). */
let knownPlaces: Set<string> | null = null;
let flash: { level: string; until: number } | null = null;
/** Push 3: sets this page has seen complete; null until the first frame. */
let completeKnown: Set<string> | null = null;
const snaps = new Map<string, number>();
/** DRAFT: the pieces fly in for SNAP_IN frames, then a burst for SNAP_POP more. */
const SNAP_IN = 36;
const SNAP_POP = 24;
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
  const out: DrawnCompletion = { glints: [], row: null, pops: [], place: null };
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

  // Push 3: a set just completed snaps together where what it builds stands (D-078: unknown until
  // the last piece). Read from the record, so a friend's last piece snaps here too.
  // INTENT: it stops nothing and takes no input.
  const complete = Object.values(sets).filter((set) => set.pieces.every((p) => found.has(`${set.id}:${p.id}`))).map((set) => set.id);
  if (completeKnown === null) completeKnown = new Set(complete);
  for (const level of complete) if (!completeKnown.has(level)) {
    completeKnown.add(level);
    snaps.set(level, frame);
  }
  for (const [level, at] of snaps) {
    const age = frame - at;
    const b = sets[level]?.builds;
    if (age > SNAP_IN + SNAP_POP || !b) {
      snaps.delete(level);
      continue;
    }
    if (b.room !== roomId) continue;
    (out.snaps ??= []).push(level);
    const cx = ox + b.tile[0] * T + T / 2;
    const cy = oy + b.tile[1] * T + T / 2;
    if (age < SNAP_IN) {
      const n = sets[level]!.pieces.length;
      const r = 44 * (1 - age / SNAP_IN);
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + age * 0.12;
        const px = Math.round(cx + Math.cos(a) * r - 6);
        const py = Math.round(cy + Math.sin(a) * r - 6);
        if (!drawLook(g, content, 'piece-gold', px, py)) {
          g.fillStyle = GOLD;
          g.fillRect(px + 2, py + 2, 8, 8);
        }
      }
    } else {
      const fx = look(content, 'fx-pickup-get');
      if (fx) drawLook(g, content, 'fx-pickup-get', Math.round(cx - fx.w / 2), Math.round(cy - fx.h / 2), { frame: Math.max(0, frameAt(fx, age - SNAP_IN, false)) });
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
  if (!view) return;
  const frame = view.frame;
  const out = last;
  // Push 2: a hidden place found (D-079: "Hidden rooms should contribute to the percentage"): the
  // level's pie flashes here, with the chime (src/client/audio/moments.ts, place-found). Read from
  // the record, so a friend's find in another room flashes too. INTENT: nothing is drawn in the
  // room itself, and the pie never says which place.
  const places = hiddenSeen(world, content);
  if (knownPlaces === null) knownPlaces = new Set(places);
  for (const key of places) {
    if (knownPlaces.has(key)) continue;
    knownPlaces.add(key);
    flash = { level: key.slice(0, key.indexOf(':')), until: frame + ROW_FRAMES };
  }
  if (flash && frame >= flash.until) flash = null;
  let pieces: boolean[] | null = null;
  if (row && frame < row.until && sets?.[row.level]) {
    const have = world.found?.[row.level] ?? [];
    pieces = sets[row.level]!.pieces.map((p) => have.includes(p.id));
    out.row = { level: row.level, pieces };
  } else row = null;
  let pie: number | null = null;
  if (flash) {
    pie = levelProgress(world, content, flash.level).quarters;
    out.place = { level: flash.level, quarters: pie };
  }
  if (pieces || pie !== null) drawStrip(g, content, pie, pieces ?? [], viewW);
}

/** `<level>:<place>` for every hidden room and hidden area the world's record has seen. */
function hiddenSeen(world: World, content: Content): string[] {
  const out: string[] = [];
  for (const [level, rec] of Object.entries(world.levels ?? {})) {
    for (const place of rec.seen) {
      const [roomId, areaId] = place.split('/');
      const room = content.rooms[roomId!];
      if (!room) continue;
      const hidden = areaId === undefined ? room.hidden : room.areas.some((a) => a.id === areaId && a.hidden);
      if (hidden) out.push(`${level}:${place}`);
    }
  }
  return out;
}

/** Piece looks are 12 by 12 (the P05 HUD sheet's bottom row, cut at 8d15d9c). */
const S = 12;
const PIE_W = 12;

/**
 * The strip at the top, under the level banner's place: the flashing pie
 * (a hidden place found), then the row of pieces, grey with the found ones
 * gold. Either may be alone.
 */
function drawStrip(g: CanvasRenderingContext2D, content: Content, pie: number | null, pieces: boolean[], viewW: number): void {
  const rowW = pieces.length ? pieces.length * (S + 1) - 1 : 0;
  const pieW = pie === null ? 0 : PIE_W;
  const inner = pieW + rowW + (pieW && rowW ? 5 : 0);
  const w = inner + 6;
  const x = Math.round((viewW - w) / 2);
  // DRAFT: just under the banner queue's line (draw/banner.ts, 6 px down, 16 tall). Kept here rather
  // than in the queue, which shows words only; this strip is pictures (a pie, pieces).
  const y = 26 + safeView.top;
  g.fillStyle = INK;
  g.fillRect(x, y, w, S + 6);
  g.fillStyle = '#221f44';
  g.fillRect(x + 1, y + 1, w - 2, S + 4);
  let px = x + 3;
  if (pie !== null) {
    drawPie(g, content, pie, px, y + 3);
    px += PIE_W + 5;
  }
  drawPieces(g, content, pieces, px, y + 3);
}

/** A row of piece looks from (x, y), grey with the found ones gold; plain shapes if the looks are missing. Also the entrance signs' row. */
export function drawPieces(g: CanvasRenderingContext2D, content: Content, pieces: boolean[], x: number, y: number): void {
  pieces.forEach((gold, i) => {
    const px = x + i * (S + 1);
    if (drawLook(g, content, gold ? 'piece-gold' : 'piece-grey', px, y)) return;
    g.fillStyle = INK;
    g.fillRect(px, y + 1, S - 1, S - 1);
    g.fillStyle = gold ? GOLD : GREY;
    g.fillRect(px + 1, y + 2, S - 3, S - 3);
    g.fillRect(px + 4, y, 3, 2);
  });
}

/** The width drawPieces takes for n pieces. */
export function piecesWidth(n: number): number {
  return n ? n * (S + 1) - 1 : 0;
}

/** For a level, each of its pieces in order, true when the world has found it; null when the level has no set. */
export function levelPieces(world: World, content: Content, level: string): boolean[] | null {
  const set = content.completion?.[level];
  if (!set) return null;
  const have = world.found?.[level] ?? [];
  return set.pieces.map((p) => have.includes(p.id));
}
