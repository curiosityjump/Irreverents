import { levelOfRoom } from '../../content/kinds/levels.ts';
import type { Content } from '../../content/types.ts';
import { levelProgress } from '../../sim/levels.ts';
import type { World } from '../../sim/types.ts';
import type { PlayerView } from './entities.ts';
import { drawText, textWidth, useContent } from './fx.ts';
import { drawLook, look } from './looks.ts';
import { drawnBanner, queueBanner } from './banner.ts';

// Step 14 slice A (docs/mechanisms/levels.md): the owner, playing, "Not
// finding clear 'level entries' with discovered indicators etc" (D-078,
// D-079). Each doorway into a level (content/levels/, `entries`) is drawn as
// an entrance from the P05 sheet; over it, a completion pie, and once the
// level is discovered its name on a small sign. The first time a level is
// discovered, its name crosses the top of the view for two seconds (the
// shared banner queue, draw/banner.ts, Step 19).
//
// INTENT: a pie and a name, never a digit, a list or a count of places
// left: "player knows there's more to discover without the game revealing
// WHICH route, room or secret is missing" (D-079). The check refuses a
// hidden door as an entry, so nothing here can point at a secret.
// DRAFT: every size, colour and place below.

const INK = '#2b2140';
const PLATE = '#221f44';
const EDGE = '#e09a1e';
const LIGHT = '#fff1a0';
/** DRAFT: two seconds of this page's frames (the owner's brief: "for two seconds"). */
const BANNER_FRAMES = 120;
/** The entrance art's size when its look is missing (a plain frame is drawn instead). */
const ART = 32;
const PIE = 12;
const GAP = 12;

export interface DrawnEntrance {
  level: string;
  room: string;
  door: string;
  /** The entrance art drawn (a look id), or "" when drawn plain. */
  look: string;
  discovered: boolean;
  /** The name on the sign, or null (not discovered: no name). */
  name: string | null;
  /** The pie drawn, 0 (empty ring) to 4 (full). */
  quarters: number;
}

let entrances: DrawnEntrance[] = [];
/** Levels this page has seen discovered; null until the first frame (what was found before this page came is never announced). */
let known: Set<string> | null = null;

/** What the last frame drew, for `window.irreverents.drawn.levels` (scripted checks read only this). */
export function drawnLevels(): { entrances: DrawnEntrance[]; banner: string | null } {
  const up = drawnBanner();
  return { entrances, banner: up && up.key.startsWith('level:') ? up.text : null };
}

/** The entrances in this room: drawn after the doorways' own arches, behind the parts and the bodies. */
export function drawLevelEntrances(g: CanvasRenderingContext2D, world: World, content: Content, roomId: string, ox: number, oy: number): void {
  entrances = [];
  signs = [];
  const room = content.rooms[roomId];
  if (!room || !content.levels) return;
  useContent(content);
  const T = room.tile;
  for (const level of Object.values(content.levels)) {
    for (const entry of level.entries) {
      if (entry.room !== roomId) continue;
      const door = room.doors.find((d) => d.id === entry.door);
      if (!door) continue;
      const p = levelProgress(world, content, level.id);
      const id = `level-entry-${level.look}`;
      const art = look(content, id);
      const aw = art?.w ?? ART;
      const ah = art?.h ?? ART;
      // The art stands on the doorway's floor, centred on it.
      const x = ox + Math.round(door.tx * T + (door.w * T - aw) / 2);
      const y = oy + (door.ty + door.h) * T - ah;
      if (!drawLook(g, content, id, x, y)) {
        g.fillStyle = INK;
        g.fillRect(x, y, aw, ah);
        g.fillStyle = EDGE;
        g.fillRect(x + 2, y + 2, aw - 4, ah - 2);
        g.fillStyle = PLATE;
        g.fillRect(x + 5, y + 6, aw - 10, ah - 6);
      }
      const name = p.discovered ? level.name : null;
      // DRAFT: 12 px above the art, clear of the doorway's bobbing Go-in arrow (draw/door-hint.ts, 10 px up).
      signs.push({ name, quarters: name ? p.quarters : 0, mid: x + Math.floor(aw / 2), bottom: y - GAP });
      entrances.push({ level: level.id, room: roomId, door: door.id, look: art ? id : '', discovered: p.discovered, name, quarters: name ? p.quarters : 0 });
    }
  }
}

let signs: { name: string | null; quarters: number; mid: number; bottom: number }[] = [];

/**
 * The signs over this room's entrances (the name and pie, or the empty ring
 * alone), after the working parts so a gate never covers one, still behind
 * the bodies. Two doorways close together (the courtyard's quarry and camp,
 * five tiles apart) would put their signs on top of each other: a sign that
 * would overlap one already placed is lifted above it. DRAFT.
 */
export function drawLevelSigns(g: CanvasRenderingContext2D, content: Content): void {
  const placed: { x: number; y: number; w: number; h: number }[] = [];
  for (const s of [...signs].sort((a, b) => a.mid - b.mid)) {
    const w = s.name ? textWidth(g, s.name, 'light') + PIE + 9 : PIE;
    const h = s.name ? PIE + 4 : PIE;
    const x = Math.round(s.mid - w / 2);
    let y = s.bottom - h;
    for (let moved = true; moved; ) {
      moved = false;
      for (const r of placed) {
        if (x < r.x + r.w + 3 && r.x < x + w + 3 && y < r.y + r.h + 3 && r.y < y + h + 3) {
          y = r.y - h - 3;
          moved = true;
        }
      }
    }
    placed.push({ x, y, w, h });
    if (s.name) sign(g, content, s.name, s.quarters, x, y, w, h);
    else pie(g, content, 0, x, y);
  }
}

/** The name and the pie on one dark plate. */
function sign(g: CanvasRenderingContext2D, content: Content, name: string, quarters: number, x: number, y: number, w: number, h: number): void {
  plate(g, x, y, w, h);
  if (!drawText(g, name, x + 3, y + Math.floor((h - 10) / 2) + 1, 'light')) {
    g.font = 'bold 8px monospace';
    g.textBaseline = 'top';
    g.fillStyle = LIGHT;
    g.fillText(name, x + 3, y + 4);
  }
  pie(g, content, quarters, x + w - PIE - 2, y + 2);
}

function plate(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
  g.fillStyle = INK;
  g.fillRect(x - 1, y, w + 2, h);
  g.fillRect(x, y - 1, w, h + 2);
  g.fillStyle = EDGE;
  g.fillRect(x, y, w, h);
  g.fillStyle = PLATE;
  g.fillRect(x + 1, y + 1, w - 2, h - 2);
}

/** A completion pie: the look `level-pie-<n>`, else a ring drawn in its colours. */
function pie(g: CanvasRenderingContext2D, content: Content, quarters: number, x: number, y: number): void {
  if (drawLook(g, content, `level-pie-${quarters}`, x, y)) return;
  g.fillStyle = INK;
  g.fillRect(x + 2, y, PIE - 4, PIE);
  g.fillRect(x, y + 2, PIE, PIE - 4);
  g.fillStyle = '#7444b8';
  g.fillRect(x + 2, y + 2, PIE - 4, PIE - 4);
  g.fillStyle = '#ffd23f';
  const h = PIE / 2 - 2;
  if (quarters >= 1) g.fillRect(x + PIE / 2, y + 2, h, h);
  if (quarters >= 2) g.fillRect(x + PIE / 2, y + PIE / 2, h, h);
  if (quarters >= 3) g.fillRect(x + 2, y + PIE / 2, h, h);
  if (quarters >= 4) g.fillRect(x + 2, y + 2, h, h);
}

/**
 * The first time this page sees the level its own hero stands in become
 * discovered, the level's name across the top for two seconds: an entry in
 * the shared banner queue (Step 19, draw/banner.ts, which draws it).
 * INTENT: it takes no input and stops nothing; it goes by itself (there is
 * always a way out). Screen furniture: drawn last, at the top, never over
 * the controls (they sit at the bottom).
 */
export function drawLevelBanner(_g: CanvasRenderingContext2D, world: World, content: Content, roomId: string, _viewW: number, view?: PlayerView): void {
  if (!view || !content.levels) return;
  useContent(content);
  const discovered = Object.keys(content.levels).filter((id) => levelProgress(world, content, id).discovered);
  if (known === null) known = new Set(discovered);
  const here = levelOfRoom(content, roomId);
  if (here && discovered.includes(here) && !known.has(here)) queueBanner({ key: `level:${here}`, text: content.levels[here]!.name, frames: BANNER_FRAMES });
  for (const id of discovered) known.add(id);
}
