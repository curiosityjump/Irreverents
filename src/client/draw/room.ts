import { TILE } from '../../content/kinds/rooms.ts';
import type { Room } from '../../content/kinds/rooms.ts';
import type { Content } from '../../content/types.ts';
import type { World } from '../../sim/types.ts';
import type { Atlas } from '../../content/kinds/atlases.ts';
import type { Backdrop } from '../../content/kinds/backdrops.ts';
import type { Decor } from '../../content/kinds/decor.ts';
import { drawGround } from './autotile.ts';
import { drawBackWall } from './backdrop.ts';
import { drawDecor } from './decor.ts';
import { image } from './images.ts';
import { drawLookIn, solidLook } from './room-parts.ts';

// DRAFT: graybox colours, used for any room with no file in content/atlases/.
const SOLID = '#5c6378';
const SOLID_TOP = '#8d93a5';
const ONEWAY = '#c9a66b';

/**
 * Where the room's top-left sits on the screen (ox, oy: add them to a room
 * position to get a screen position).
 * DRAFT: the first camera (Step 1 Gate 2; Step 3 owns it from here): each
 * player's own view follows their own character, centred on `focus`, and
 * stops at the room's edges. A room smaller than the screen is centred.
 */
export function roomOrigin(room: Room, viewW: number, viewH: number, focus?: { x: number; y: number }): { ox: number; oy: number } {
  const along = (roomSize: number, view: number, at: number | undefined): number => {
    if (roomSize <= view || at === undefined) return Math.floor((view - roomSize) / 2);
    return -Math.max(0, Math.min(roomSize - view, Math.round(at - view / 2)));
  };
  return { ox: along(room.w * room.tile, viewW, focus?.x), oy: along(room.h * room.tile, viewH, focus?.y) };
}

/** The art files a room may have (content/atlases/, backdrops/, decor/, each named after the room). */
function artOf(room: Room, content?: Content): { atlas?: Atlas; backdrop?: Backdrop; decor?: Decor } {
  return { atlas: content?.atlases?.[room.id], backdrop: content?.backdrops?.[room.id], decor: content?.decor?.[room.id] };
}

/** The room's backdrop file, if it has one (render.ts draws its sky and layers first). */
export function backdropOf(room: Room, content?: Content): Backdrop | undefined {
  return artOf(room, content).backdrop;
}

/** The room's decoration file, if it has one. */
export function decorOf(room: Room, content?: Content): Decor | undefined {
  return artOf(room, content).decor;
}

/**
 * Tiles drawn past each edge of the room in its cached picture, so a room
 * smaller than the view (or a camera at its edge) shows ground, not a void.
 * DRAFT: 12 tiles covers a view up to 384 pixels across around the smallest
 * room; the view's range in render.ts is 190–320 wide, 180–260 tall.
 */
const MARGIN = 12;

interface Cached {
  canvas: HTMLCanvasElement;
  key: string;
  /** A far-decoration image was still loading: draw it again a little later. */
  waiting: boolean;
  at: number;
}
/** How often, in milliseconds, a picture still waiting for an image is redrawn (a missing file never loads). */
const RETRY_MS = 500;
// INTENT: the ground, back wall and far decoration change only when a wall breaks or an image
// arrives, so they are drawn once into an offscreen canvas and each frame copies the part on
// screen: one drawImage instead of hundreds (60 frames a second on an iPhone).
const cache = new Map<string, Cached>();

/**
 * INTENT: art replaces rectangles as DATA. A room with a file in
 * content/atlases/ (named after the room) draws its ground from that image,
 * joined up by draw/autotile.ts, with its back wall and far decoration
 * (content/backdrops/, content/decor/) behind; a room without art files
 * keeps its graybox rectangles exactly as before. No code changes when art
 * arrives (docs/architecture.md, "Where art plugs in").
 * Every tile is drawn by whether it *looks* solid (draw/room-parts.ts,
 * `solidLook`), so false walls and hidden doors are drawn as the wall itself.
 */
export function drawRoom(g: CanvasRenderingContext2D, room: Room, ox: number, oy: number, content: Content | undefined, world: World, viewW: number, viewH: number): void {
  const T = room.tile;
  const solid = solidLook(room, world);
  const art = artOf(room, content);
  const hasArt = art.atlas !== undefined || (art.backdrop?.wall ?? null) !== null || (art.decor?.items ?? []).some((i) => i.layer === 'far');
  if (!hasArt) {
    drawGraybox(g, room, ox, oy, solid.at);
    return;
  }
  const sheet = art.atlas ? image(art.atlas.image) : null;
  const wallReady = !art.backdrop?.wall || image(art.backdrop.wall.image) !== null;
  const key = `${solid.key}|${sheet ? 1 : 0}|${wallReady ? 1 : 0}`;
  let c = cache.get(room.id);
  if (!c || c.key !== key || (c.waiting && performance.now() - c.at > RETRY_MS)) {
    c = buildCache(room, art, sheet, solid.at, key);
    // Keep only the room on screen and the one just left.
    if (cache.size > 1) for (const id of cache.keys()) if (id !== room.id) cache.delete(id);
    cache.set(room.id, c);
  }
  // The part of the cached picture under the view, clipped to the picture.
  const m = MARGIN * T;
  const sx = Math.max(0, m - ox);
  const sy = Math.max(0, m - oy);
  const ex = Math.min(c.canvas.width, m - ox + viewW);
  const ey = Math.min(c.canvas.height, m - oy + viewH);
  if (ex > sx && ey > sy) g.drawImage(c.canvas, sx, sy, ex - sx, ey - sy, sx - m + ox, sy - m + oy, ex - sx, ey - sy);
  if (!sheet) drawGraybox(g, room, ox, oy, solid.at);
}

function buildCache(room: Room, art: ReturnType<typeof artOf>, sheet: CanvasImageSource | null, solid: (tx: number, ty: number) => boolean, key: string): Cached {
  const T = room.tile;
  const canvas = document.createElement('canvas');
  canvas.width = (room.w + 2 * MARGIN) * T;
  canvas.height = (room.h + 2 * MARGIN) * T;
  const g = canvas.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  const p = MARGIN * T;
  const [tx0, ty0, tx1, ty1] = [-MARGIN, -MARGIN, room.w + MARGIN, room.h + MARGIN];
  if (art.backdrop) drawBackWall(g, room, art.backdrop, solid, tx0, ty0, tx1, ty1, p, p);
  const decorReady = drawDecor(g, art.decor, 'far', T, p, p, canvas.width, canvas.height);
  if (art.atlas && sheet) drawGround(g, room, art.atlas, sheet, solid, tx0, ty0, tx1, ty1, p, p);
  return { canvas, key, waiting: !decorReady, at: performance.now() };
}

/** The graybox ground: the room's own tiles, as before any art. */
function drawGraybox(g: CanvasRenderingContext2D, room: Room, ox: number, oy: number, solid: (tx: number, ty: number) => boolean): void {
  const T = room.tile;
  for (let ty = 0; ty < room.h; ty++) {
    for (let tx = 0; tx < room.w; tx++) {
      const x = ox + tx * T;
      const y = oy + ty * T;
      if (solid(tx, ty)) {
        g.fillStyle = SOLID;
        g.fillRect(x, y, T, T);
        if (!solid(tx, ty - 1)) {
          g.fillStyle = SOLID_TOP;
          g.fillRect(x, y, T, 2);
        }
      } else if (room.cells[ty * room.w + tx] === TILE.oneway) {
        g.fillStyle = ONEWAY;
        g.fillRect(x, y, T, 4);
      }
    }
  }
}

// DRAFT: graybox doorway colours.
const DOORWAY = '#0d0d18';
const DOORWAY_FRAME = '#3d4254';

/**
 * Doors (Step 3). An *enter* doorway is a dark arch, so an opening reads as
 * an opening: the look `door-enter-<w>x<h>` when there is one, else the
 * plain arch. A *walk* door draws nothing: it is simply the gap in the wall.
 * INTENT: no arrows, no glow, no text, on any door: hidden routes depend on
 * the game never pointing (docs/plan/step-3.md, "Unadvertised"). The content
 * check refuses a hidden door that would get the arch.
 */
export function drawDoors(g: CanvasRenderingContext2D, room: Room, ox: number, oy: number, content?: Content, tick = 0): void {
  const T = room.tile;
  for (const door of room.doors) {
    if (door.use !== 'enter') continue;
    const x = ox + door.tx * T;
    const y = oy + door.ty * T;
    const w = door.w * T;
    const h = door.h * T;
    if (content && drawLookIn(g, content, [`door-enter-${door.w}x${door.h}`], x, y, w, h, tick)) continue;
    g.fillStyle = DOORWAY_FRAME;
    g.fillRect(x, y + 4, w, h - 4);
    g.fillRect(x + 2, y + 1, w - 4, 3);
    g.fillStyle = DOORWAY;
    g.fillRect(x + 2, y + 5, w - 4, h - 5);
    g.fillRect(x + 4, y + 3, w - 8, 2);
  }
}
