import { TILE } from '../../content/kinds/rooms.ts';
import type { Part, Room } from '../../content/kinds/rooms.ts';
import type { Content } from '../../content/types.ts';
import type { World } from '../../sim/types.ts';
import { drawLookFrame, frameAt, hasLook, look } from './looks.ts';

// DRAFT: graybox colours, used when a room or a part has no picture.
const CRACK = '#2e3242';
const SOLID = '#5c6378';
const PLATE = '#b8b08d';
const PLATE_DOWN = '#7d775f';
const GATE = '#9a8f6a';
const GATE_DARK = '#4a4433';
const PANE = '#a9c4d6';
const PANE_LIGHT = '#d5e4ee';
const FRAME = '#3d4254';
const HIDE = '#6b3f4f';
const HIDE_FOLD = '#4f2d3a';

/**
 * Which tiles *look* solid (docs/mechanisms/art-pipeline.md, "Ground"): the
 * room file's solid tiles, false walls, unbroken wall-look breakables,
 * hidden walk doors' tiles, and past the room's edge.
 *
 * INTENT: one set, fed to the ground (draw/room.ts, draw/autotile.ts) and to
 * the back wall alike, so a false wall, a cracked wall and a hidden door are
 * drawn by the very code that draws the wall around them, joined at every
 * edge and corner, top and under pieces included. Nothing about a secret
 * may differ from wall (docs/plan/step-3.md, "Unadvertised").
 * INTENT: a hidden walk door is a gap in the room's edge, and a gap is a
 * sign. Its tiles look solid, so nothing shows where the way is (the door
 * still works: draw/room.ts draws a walk door as nothing).
 * DRAFT: past the edge, a tile looks like the nearest tile inside the room.
 * For every tile of the room this gives the contract's "everything outside
 * looks solid" answer (an edge tile that looks solid continues as solid),
 * and past the edge it keeps an open sky open and an open walk door open,
 * where "all solid" would roof over an outdoor room and wall up its doors.
 */
export interface SolidLook {
  at: (tx: number, ty: number) => boolean;
  /** Changes whenever any tile's look changes (a wall broken). */
  key: string;
}

const looks = new Map<string, SolidLook>();

export function solidLook(room: Room, world: World): SolidLook {
  const memory = world.rooms?.[room.id]?.parts ?? {};
  let key = room.id;
  for (const p of room.parts) if (p.kind === 'breakable' && memory[p.id]?.broken) key += `|${p.id}`;
  const hit = looks.get(room.id);
  if (hit && hit.key === key) return hit;
  const grid = new Uint8Array(room.w * room.h);
  for (let i = 0; i < grid.length; i++) grid[i] = room.cells[i] === TILE.solid ? 1 : 0;
  for (const part of room.parts) {
    const asWall = part.kind === 'false-wall' || (part.kind === 'breakable' && part.params.look !== 'window' && !memory[part.id]?.broken);
    if (asWall) for (const t of part.tiles) grid[t.ty * room.w + t.tx] = 1;
  }
  for (const d of room.doors) {
    if (!d.hidden || d.use !== 'walk') continue;
    for (let ty = d.ty; ty < d.ty + d.h; ty++) for (let tx = d.tx; tx < d.tx + d.w; tx++) grid[ty * room.w + tx] = 1;
  }
  const w = room.w;
  const h = room.h;
  const at = (tx: number, ty: number): boolean => grid[Math.max(0, Math.min(h - 1, ty)) * w + Math.max(0, Math.min(w - 1, tx))] === 1;
  const made = { at, key };
  looks.set(room.id, made);
  return made;
}

/** Whether content names this look at all (draw/looks.ts). */
export function lookDef(content: Content, id: string): boolean {
  return hasLook(content, id);
}

/**
 * Draws the first of `ids` that exists and has loaded, bottom-centred on the
 * rectangle (x, y, w, h), at the frame `ticks` (60 a second) selects
 * (draw/looks.ts does the drawing). Returns false when none could be drawn:
 * the caller then draws its plain shape.
 */
export function drawLookIn(g: CanvasRenderingContext2D, content: Content, ids: string[], x: number, y: number, w: number, h: number, ticks = 0): boolean {
  for (const id of ids) {
    if (!hasLook(content, id)) continue;
    const l = look(content, id);
    if (!l) return false;
    drawLookFrame(g, l, x + w / 2, y + h, { frame: frameAt(l, ticks), anchor: 'bottom-centre' });
    return true;
  }
  return false;
}

/** The part's tile rectangle: left, top, width and height in tiles. */
function bounds(part: Part): { tx: number; ty: number; w: number; h: number } {
  const xs = part.tiles.map((t) => t.tx);
  const ys = part.tiles.map((t) => t.ty);
  const tx = Math.min(...xs);
  const ty = Math.min(...ys);
  return { tx, ty, w: Math.max(...xs) - tx + 1, h: Math.max(...ys) - ty + 1 };
}

/**
 * Working parts (Step 3): plates, gates, breakable walls and windows,
 * hiding places. A false wall, an unbroken cracked wall and a hidden walk
 * door are ground (see `solidLook`); this draws what sits on them. Each
 * part asks first for its own picture (`part:<room>:<part>`, with
 * `:down`, `:open` or `:broken` for that state), then the generic one, then
 * draws its plain shape.
 *
 * INTENT: no arrow, no glow, no text, nothing that points
 * (docs/plan/step-3.md, "Unadvertised"). A breakable wall is wall with a
 * crack, the library's own "suspicious cracked wall".
 * DRAFT: parts are drawn behind bodies, so a body walking into a false wall
 * stays visible in front of it (docs/decisions-log.md).
 */
/** One plate or gate as the last frame drew it (for `window.irreverents.drawn.parts`; nothing in the game reads it). */
export interface DrawnPart {
  room: string;
  part: string;
  kind: string;
  /** A plate: drawn down. A gate: drawn open. */
  on: boolean;
  /** A plate that needs weight: pixels it was drawn sunk (`plateSink`); else null. */
  sink: number | null;
}
let drawnList: DrawnPart[] = [];

/** The server's room state from the newest snapshot (src/net/client.ts `heardRooms`); the page sets it each frame. */
let heard: World['rooms'] = undefined;
export function setHeardRooms(rooms: World['rooms']): void {
  heard = rooms;
}

/**
 * What a plate is drawn as: down if the page's own step or the server says
 * so, and the larger of their two loads (Step 3, the stone plate).
 *
 * INTENT: a page steps only its own character, so its own step sees no
 * friend: a plate a friend stands on reads up there every tick (Step 3's
 * handoff item 5, measured: drawn up in every frame on both pages,
 * scripts/e2e/plates.ts `plates-friend-held`). The server's copy has every
 * body but lags a round trip; the page's own copy is instant for its own
 * feet. Either saying down is down, so a press shows at once and a friend's
 * weight is never drawn away. Drawing only: what the page's own step does
 * with the plate is untouched.
 */
function plateAsDrawn(local: { down?: boolean; load?: unknown }, server: { down?: boolean; load?: unknown } | undefined): { down: boolean; load?: number } {
  const n = (v: unknown): number => (typeof v === 'number' ? v : 0);
  const down = local.down === true || server?.down === true;
  if (local.load === undefined && server?.load === undefined) return { down };
  return { down, load: Math.max(n(local.load), n(server?.load)) };
}

/** The plates and gates the last frame drew. */
export function drawnParts(): DrawnPart[] {
  return drawnList;
}

export function drawRoomParts(g: CanvasRenderingContext2D, world: World, room: Room, ox: number, oy: number, content?: Content): void {
  drawnList = [];
  if (room.parts.length === 0) return;
  const T = room.tile;
  const memory = world.rooms?.[room.id]?.parts ?? {};
  for (const part of room.parts) {
    if (part.tiles.length === 0) continue;
    const s = memory[part.id] ?? {};
    const own = `part:${room.id}:${part.id}`;
    const b = bounds(part);
    const rx = ox + b.tx * T;
    const ry = oy + b.ty * T;
    const tick = world.tick;
    const whole = (ids: string[]): boolean => content !== undefined && drawLookIn(g, content, ids, rx, ry, b.w * T, b.h * T, tick);
    const each = (ids: (t: { tx: number; ty: number }) => string[], only?: (t: { tx: number; ty: number }) => boolean): boolean => {
      if (!content) return false;
      let all = true;
      for (const t of part.tiles) if (!only || only(t)) all = drawLookIn(g, content, ids(t), ox + t.tx * T, oy + t.ty * T, T, T, tick) && all;
      return all;
    };
    if (part.kind === 'plate') {
      const ps = plateAsDrawn(s, heard?.[room.id]?.parts?.[part.id]);
      const down = ps.down;
      const sink = plateSink(part, ps, down);
      drawnList.push({ room: room.id, part: part.id, kind: part.kind, on: down, sink });
      if (sink !== null) {
        // A plate that needs weight: the same look, lowered into the floor by how much rests on it.
        // DRAFT: the generic plate-up/plate-down look (a small stone, one tile) is lost under a hero and
        // the room's props on a phone (seen at 844x390), so a weighted plate is its own wide slab unless
        // a picture of it is delivered (`part:<room>:<part>`).
        if (sunk(g, rx, ry, b.w * T, b.h * T, sink, () => whole([down ? `${own}:down` : own]))) continue;
        drawSlab(g, rx, ry + b.h * T, b.w * T, sink);
        continue;
      }
      if (whole([down ? `${own}:down` : own]) || each(() => [down ? 'plate-down' : 'plate-up'])) continue;
      drawPlate(g, part, down, T, ox, oy);
    } else if (part.kind === 'gate') {
      const open = s.open === true;
      drawnList.push({ room: room.id, part: part.id, kind: part.kind, on: open, sink: null });
      if (whole([open ? `${own}:open` : own])) continue;
      if (isGrate(b)) {
        drawGrate(g, part, open, T, ox, oy);
        continue;
      }
      if (open ? each(() => ['gate-open'], (t) => t.ty === b.ty) : each(() => ['gate-closed'])) continue;
      drawGate(g, part, open, T, ox, oy);
    } else if (part.kind === 'breakable') {
      const broken = s.broken === true;
      if (part.params.look === 'window') {
        const size = `${b.w}x${b.h}`;
        if (whole(broken ? [`${own}:broken`, `window-broken-${size}`] : [own, `window-${size}`])) continue;
      } else if (broken) {
        if (whole([`${own}:broken`]) || each(() => ['rubble'], (t) => t.ty === b.ty + b.h - 1)) continue;
      } else {
        // The crack, chosen per tile by position (the wall itself is ground).
        if (whole([own]) || each((t) => [(t.tx + t.ty) % 2 === 0 ? 'crack-1' : 'crack-2'])) continue;
      }
      drawBreakable(g, part, broken, T, ox, oy);
    } else if (part.kind === 'hide') {
      if (whole([own, `hide-${b.w}x${b.h}`])) continue;
      drawHide(g, part, T, ox, oy);
    }
  }
}

/**
 * How many pixels a plate that needs weight is drawn below its raised look
 * (Step 3, the stone plate): none with nothing on it, a little more for
 * every bit of weight, `PLATE_SINK` when it is down. Null for a plate with
 * no `needs`, drawn as it always was. A kept game's plate with no `load`
 * yet reads as nothing on it.
 *
 * INTENT: the plate itself shows how far it has gone, and nothing else
 * does: no arrow, no number, no text (docs/plan/step-3.md, "Unadvertised";
 * handoff-prompts/loop-puzzles.md, push 4). "Heavier" is the thought the
 * room hands you.
 * DRAFT: a part-loaded plate sinks at least a pixel and never as far as a
 * down one, so any weight shows and "almost" never looks like "done".
 */
export function plateSink(part: Part, s: { load?: unknown }, down: boolean): number | null {
  const needs = part.params.needs;
  if (typeof needs !== 'number' || !(needs > 0)) return null;
  if (down) return PLATE_SINK;
  const load = typeof s.load === 'number' && s.load > 0 ? s.load : 0;
  if (load === 0) return 0;
  return Math.max(1, Math.min(PLATE_SINK - 1, Math.round((load / needs) * (PLATE_SINK - 1))));
}

/** DRAFT: how far down a weighted plate goes, in room pixels (a quarter of a tile reads at phone size). */
const PLATE_SINK = 4;

/** Draws with `draw` lowered by `sink` pixels and clipped to the part's rectangle, so it sinks into the floor. */
function sunk(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, sink: number, draw: () => boolean): boolean {
  g.save();
  g.beginPath();
  g.rect(x, y, w, h);
  g.clip();
  g.translate(0, sink);
  const ok = draw();
  g.restore();
  return ok;
}

function drawPlate(g: CanvasRenderingContext2D, part: Part, down: boolean, T: number, ox: number, oy: number): void {
  for (const t of part.tiles) {
    g.fillStyle = down ? PLATE_DOWN : PLATE;
    const h = down ? 1 : 3;
    g.fillRect(ox + t.tx * T + 1, oy + (t.ty + 1) * T - h, T - 2, h);
  }
}

/** DRAFT: how tall a weighted plate's slab stands with nothing on it, in room pixels. */
const SLAB_H = 6;

/**
 * DRAFT stand-in: a weighted plate as one wide stone slab standing `SLAB_H`
 * pixels proud of the floor (`floorY`), `sink` pixels lower for its load.
 * Pale stone against the dark floor, a darker rim, a joint every tile.
 */
function drawSlab(g: CanvasRenderingContext2D, x: number, floorY: number, w: number, sink: number): void {
  const h = Math.max(1, SLAB_H - sink);
  const top = floorY - h;
  g.fillStyle = GATE_DARK;
  g.fillRect(x, top - 1, w, h + 1);
  g.fillStyle = sink >= PLATE_SINK ? PLATE_DOWN : PLATE;
  g.fillRect(x + 1, top, w - 2, h);
  if (h > 2) {
    g.fillStyle = '#ddd5b0';
    g.fillRect(x + 1, top, w - 2, 1);
    g.fillStyle = PLATE_DOWN;
    for (let j = x + 16; j < x + w - 1; j += 16) g.fillRect(j, top + 1, 1, h - 1);
  }
}

/**
 * A gate wider than it is tall is a grate in the floor (Step 3, the stone
 * plate's grate under the castle): an upright portcullis look does not fit
 * it. DRAFT: decided by shape, so no param is needed on the gate; a
 * delivered `part:<room>:<part>` picture (and `:open`) still wins.
 */
function isGrate(b: { w: number; h: number }): boolean {
  return b.w > b.h;
}

/** DRAFT: a stand-in floor grate: iron bars across the slot when shut; open, the slot is dark and the grate hangs down its side. */
function drawGrate(g: CanvasRenderingContext2D, part: Part, open: boolean, T: number, ox: number, oy: number): void {
  const xs = part.tiles.map((t) => t.tx);
  const left = Math.min(...xs);
  const right = Math.max(...xs);
  for (const t of part.tiles) {
    const x = ox + t.tx * T;
    const y = oy + t.ty * T;
    g.fillStyle = '#0d0d18';
    g.fillRect(x, y, T, T);
    if (!open) {
      g.fillStyle = GATE_DARK;
      g.fillRect(x, y, T, 4);
      g.fillStyle = GATE;
      g.fillRect(x, y, T, 2);
      for (let bar = 1; bar < T; bar += 4) g.fillRect(x + bar, y, 2, 6);
    } else if (t.tx === left) {
      g.fillStyle = GATE_DARK;
      g.fillRect(x, y, 3, T);
      g.fillStyle = GATE;
      for (let rung = 1; rung < T; rung += 4) g.fillRect(x, y + rung, 3, 1);
    }
    if (t.tx === left || t.tx === right) {
      // The stone lip at each end of the slot.
      g.fillStyle = SOLID;
      g.fillRect(t.tx === left ? x : x + T - 1, y, 1, 2);
    }
  }
}

function drawGate(g: CanvasRenderingContext2D, part: Part, open: boolean, T: number, ox: number, oy: number): void {
  const top = Math.min(...part.tiles.map((t) => t.ty));
  for (const t of part.tiles) {
    const x = ox + t.tx * T;
    const y = oy + t.ty * T;
    // Open: the gate is drawn up, only its foot showing under the lintel.
    if (open && t.ty !== top) continue;
    const h = open ? 4 : T;
    g.fillStyle = GATE_DARK;
    g.fillRect(x, y, T, h);
    g.fillStyle = GATE;
    for (let bar = 2; bar < T; bar += 5) g.fillRect(x + bar, y, 2, h);
    if (!open) g.fillRect(x, y + 6, T, 2);
  }
}

function drawBreakable(g: CanvasRenderingContext2D, part: Part, broken: boolean, T: number, ox: number, oy: number): void {
  const window = part.params.look === 'window';
  for (const t of part.tiles) {
    const x = ox + t.tx * T;
    const y = oy + t.ty * T;
    if (window) {
      // A paler pane in a frame; broken, the frame and a few shards are left.
      g.fillStyle = FRAME;
      g.fillRect(x, y, T, T);
      if (!broken) {
        g.fillStyle = PANE;
        g.fillRect(x + 2, y + 1, T - 4, T - 2);
        g.fillStyle = PANE_LIGHT;
        g.fillRect(x + 4, y + 3, 2, T - 6);
      } else {
        g.fillStyle = '#0d0d18';
        g.fillRect(x + 2, y, T - 4, T);
        g.fillStyle = PANE;
        g.fillRect(x + 2, y, 2, 3);
        g.fillRect(x + T - 5, y + T - 4, 3, 4);
      }
    } else if (!broken) {
      // The wall itself is ground (solidLook); this is the crack.
      g.fillStyle = CRACK;
      g.fillRect(x + 7, y, 1, 5);
      g.fillRect(x + 8, y + 4, 1, 5);
      g.fillRect(x + 6, y + 8, 1, 4);
      g.fillRect(x + 7, y + 11, 1, 5);
      g.fillRect(x + 9, y + 6, 3, 1);
    } else {
      // Rubble on the floor of the opening.
      const bottom = Math.max(...part.tiles.map((q) => q.ty));
      if (t.ty !== bottom) continue;
      g.fillStyle = SOLID;
      g.fillRect(x + 1, y + T - 3, 4, 3);
      g.fillRect(x + 9, y + T - 2, 5, 2);
    }
  }
}

function drawHide(g: CanvasRenderingContext2D, part: Part, T: number, ox: number, oy: number): void {
  // DRAFT: a graybox curtain.
  for (const t of part.tiles) {
    const x = ox + t.tx * T;
    const y = oy + t.ty * T;
    g.fillStyle = HIDE;
    g.fillRect(x, y, T, T);
    g.fillStyle = HIDE_FOLD;
    for (let fold = 3; fold < T; fold += 5) g.fillRect(x + fold, y, 1, T);
  }
}
