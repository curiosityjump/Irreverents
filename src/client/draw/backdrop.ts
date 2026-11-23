import type { Room } from '../../content/kinds/rooms.ts';
import { tileHash } from './autotile.ts';
import { image } from './images.ts';

/**
 * Behind the ground (docs/mechanisms/art-pipeline.md, "Behind the ground"):
 * the banded sky fixed to the screen, then each parallax layer, then (in the
 * room's cached picture, draw/room.ts) the indoor back wall.
 * DRAFT: read loosely from `content.backdrops` until the foundation lane's
 * typed kind is the only shape; every field has a safe default.
 */

export interface BackdropLayer {
  image: string;
  parallax?: number;
  parallaxY?: number;
  y?: 'top' | 'bottom';
  offsetY?: number;
  repeatX?: boolean;
}

export interface Backdrop {
  id: string;
  sky?: string[];
  layers?: BackdropLayer[];
  wall?: { image: string; tile: number; cells: [number, number][] };
}

const MAX_BANDS = 8;

const hex = (c: string): [number, number, number] | null => {
  const m = /^#([0-9a-f]{6})$/i.exec(c);
  if (!m) return null;
  const n = parseInt(m[1] as string, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const toHex = (rgb: number[]): string => '#' + rgb.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');

/** The sky's flat bands, top to bottom: the listed colours spread over at most eight bands. */
const bandCache = new Map<string, string[]>();
export function skyBands(sky: string[]): string[] {
  const key = sky.join(',');
  const hit = bandCache.get(key);
  if (hit) return hit;
  const stops = sky.map(hex).filter((c): c is [number, number, number] => c !== null);
  let bands: string[];
  if (stops.length <= 1) bands = stops.length ? [toHex(stops[0] as number[])] : [];
  else if (stops.length >= MAX_BANDS) bands = stops.slice(0, MAX_BANDS).map(toHex);
  else {
    // DRAFT: fewer stops than bands: the in-between bands are even mixes of their neighbours.
    bands = [];
    for (let i = 0; i < MAX_BANDS; i++) {
      const t = (i / (MAX_BANDS - 1)) * (stops.length - 1);
      const a = stops[Math.floor(t)] as number[];
      const b = stops[Math.min(stops.length - 1, Math.floor(t) + 1)] as number[];
      const f = t - Math.floor(t);
      bands.push(toHex(a.map((v, k) => v + ((b[k] as number) - v) * f)));
    }
  }
  bandCache.set(key, bands);
  return bands;
}

/**
 * The sky and the layers, for a camera whose top-left is (camX, camY) in
 * room pixels, on a view w × h. With no sky colours the view is filled with
 * `fallback`.
 */
export function drawBackdrop(g: CanvasRenderingContext2D, bd: Backdrop, room: Room, camX: number, camY: number, w: number, h: number, fallback: string): void {
  const bands = skyBands(bd.sky ?? []);
  if (bands.length === 0) {
    g.fillStyle = fallback;
    g.fillRect(0, 0, w, h);
  } else {
    for (let i = 0; i < bands.length; i++) {
      const y0 = Math.round((i * h) / bands.length);
      const y1 = Math.round(((i + 1) * h) / bands.length);
      g.fillStyle = bands[i] as string;
      g.fillRect(0, y0, w, y1 - y0);
    }
  }
  const roomH = room.h * room.tile;
  // DRAFT: a layer pins to the screen's top or bottom edge, or to the room's own edge when the
  // room is shorter than the view and so sits inside it (an upright phone): hills drawn to stand
  // on the floor line at 320×180 stand on it in a taller view too, instead of behind the ground.
  const topEdge = Math.max(0, -camY);
  const bottomEdge = Math.min(h, roomH - camY);
  // DRAFT: vertical parallax is measured from where the camera rests for that pinning: a top-pinned
  // layer from the room's top, a bottom-pinned one from the room's bottom, so each sits at its
  // offsetY when the camera is against that edge. Rooms shorter than the view never shift.
  const camYClamped = Math.max(0, Math.min(Math.max(0, roomH - h), camY));
  for (const layer of bd.layers ?? []) {
    const img = image(layer.image);
    if (!img) continue;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const bottom = layer.y === 'bottom';
    const rest = bottom ? Math.max(0, roomH - h) : 0;
    const shiftY = -(camYClamped - rest) * (layer.parallaxY ?? 0);
    const y = Math.round((bottom ? bottomEdge - ih : topEdge) + (layer.offsetY ?? 0) + shiftY);
    let x = Math.floor(-camX * (layer.parallax ?? 0));
    if (layer.repeatX === false) {
      g.drawImage(img, x, y);
      continue;
    }
    x = ((x % iw) + iw) % iw;
    if (x > 0) x -= iw;
    for (; x < w; x += iw) g.drawImage(img, x, y);
  }
}

/**
 * The back wall (indoor rooms): hash-chosen cells behind every tile in
 * tx0..tx1-1, ty0..ty1-1 that does not look solid, tile (0, 0) at (px, py).
 * Returns false when its image is not loaded yet.
 */
export function drawBackWall(g: CanvasRenderingContext2D, room: Room, bd: Backdrop, solid: (tx: number, ty: number) => boolean, tx0: number, ty0: number, tx1: number, ty1: number, px: number, py: number): boolean {
  const wall = bd.wall;
  if (!wall || !wall.cells || wall.cells.length === 0) return true;
  const sheet = image(wall.image);
  if (!sheet) return false;
  const S = wall.tile;
  const T = room.tile;
  for (let ty = ty0; ty < ty1; ty++) {
    for (let tx = tx0; tx < tx1; tx++) {
      if (solid(tx, ty)) continue;
      const c = wall.cells[tileHash(tx, ty, 7) % wall.cells.length] as [number, number];
      g.drawImage(sheet, c[0] * S, c[1] * S, S, S, px + tx * T, py + ty * T, T, T);
    }
  }
  return true;
}
