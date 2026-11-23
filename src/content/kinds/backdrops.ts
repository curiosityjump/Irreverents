import { readBool, readCellList, readImage, requireDraftNote } from '../art-fields.ts';
import type { Cell } from '../art-fields.ts';
import { describe } from '../reader.ts';
import type { ContentKind } from '../types.ts';

/**
 * content/backdrops/<room id>.json: what is drawn behind a room's ground,
 * named after the room (docs/mechanisms/art-pipeline.md, "Behind the
 * ground"). Drawn first, in order: `sky`, each layer, then `wall`.
 * A room with no file keeps its plain background.
 * Notes: docs/mechanisms/art-foundation.md.
 */
export interface Backdrop {
  id: string;
  /** Colours of a top-to-bottom gradient fixed to the screen, drawn as at most 8 flat bands. Empty when the file has none. */
  sky: string[];
  layers: BackdropLayer[];
  /** A back wall behind every tile that does not look solid (indoor rooms), or null. */
  wall: { image: string; tile: number; cells: Cell[] } | null;
}

export interface BackdropLayer {
  /** Path under assets/; 320 px wide or a multiple, tiling sideways without a seam. */
  image: string;
  /** Its left edge sits at -cameraX × parallax (0 never moves, 1 moves with the room). */
  parallax: number;
  /** Which screen edge its matching edge is pinned to, shifted by offsetY. */
  y: 'top' | 'bottom';
  offsetY: number;
  /** Wrapped sideways. */
  repeatX: boolean;
  /** The same as parallax for the camera's height; 0 when the file has none. */
  parallaxY: number;
}

declare module '../types.ts' {
  interface Content {
    backdrops: Record<string, Backdrop>;
  }
}

const COLOUR = /^#[0-9a-f]{6}$/i;

const kind: ContentKind = {
  id: 'backdrops',
  source: { dir: 'backdrops' },
  parse(raw, read) {
    const o = read.object(raw, '');
    if (!o) return null;
    read.only(o, ['id', 'sky', 'layers', 'wall'], '');
    requireDraftNote(read, o);
    const sky: string[] = [];
    if (o.sky !== undefined) {
      if (!Array.isArray(o.sky) || o.sky.length < 1 || o.sky.length > 8) read.fail('sky', `must be a list of 1 to 8 colours ("#rrggbb"), but is ${describe(o.sky)}`);
      else o.sky.forEach((c, i) => (typeof c === 'string' && COLOUR.test(c) ? sky.push(c) : read.fail(`sky[${i}]`, `must be a colour "#rrggbb", but is ${describe(c)}`)));
    }
    const layers: BackdropLayer[] = [];
    if (o.layers !== undefined) {
      if (!Array.isArray(o.layers)) read.fail('layers', `must be a list, but is ${describe(o.layers)}`);
      else
        o.layers.forEach((rawLayer, i) => {
          const w = `layers[${i}]`;
          const l = read.object(rawLayer, w);
          if (!l) return;
          read.only(l, ['image', 'parallax', 'y', 'offsetY', 'repeatX', 'parallaxY'], w);
          const y = l.y;
          if (y !== 'top' && y !== 'bottom') read.fail(`${w}.y`, `must be "top" or "bottom", but is ${describe(y)}`);
          layers.push({
            image: readImage(read, l, 'image', w),
            parallax: read.number(l, 'parallax', w, { min: 0, max: 2 }),
            y: y === 'top' ? 'top' : 'bottom',
            offsetY: l.offsetY === undefined ? 0 : read.number(l, 'offsetY', w, { min: -1000, max: 1000, integer: true }),
            repeatX: readBool(read, l, 'repeatX', w, false),
            parallaxY: l.parallaxY === undefined ? 0 : read.number(l, 'parallaxY', w, { min: 0, max: 2 }),
          });
        });
    }
    let wall: Backdrop['wall'] = null;
    if (o.wall !== undefined) {
      const wl = read.object(o.wall, 'wall');
      if (wl) {
        read.only(wl, ['image', 'tile', 'cells'], 'wall');
        wall = { image: readImage(read, wl, 'image', 'wall'), tile: read.number(wl, 'tile', 'wall', { min: 1, max: 512, integer: true }), cells: readCellList(read, wl.cells, 'wall.cells') };
      }
    }
    if (sky.length === 0 && layers.length === 0 && !wall && o.sky === undefined) read.fail('(the whole file)', 'draws nothing: give it a sky, layers or a wall');
    const out: Backdrop = { id: read.string(o, 'id', ''), sky, layers, wall };
    return out;
  },
  check(content, fail) {
    for (const b of Object.values(content.backdrops)) {
      if (!(b.id in content.rooms)) fail(`content/backdrops/${b.id}.json`, 'id', `no room "${b.id}": a backdrop file is named after the room it is behind`);
    }
  },
};
export default kind;
