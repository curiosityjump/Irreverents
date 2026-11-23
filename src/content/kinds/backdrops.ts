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
  /**
   * Round 2 (the contract, "Round 2 additions"): what is painted past the
   * room's top and bottom edges. `fill` (the default) continues the ground as
   * before; `sky` paints nothing above, so the sky and layers show; `deep`
   * paints below from the atlas's `autotile.deep`.
   * INTENT: only the painting changes. Past the edge still looks solid for
   * the autotile index (it keeps a secret looking like wall) and is still
   * solid to the simulation.
   */
  outside: { above: 'fill' | 'sky'; below: 'fill' | 'deep' };
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
  /** Round 2: `y` and `offsetY` measured from the screen's edge (`screen`, the default) or from the room's on-screen edge (`room`). */
  pin: 'screen' | 'room';
  /** Round 2: drawn in front of bodies, after effects and before front decoration (strips below the floor line or along the top edge only). */
  front: boolean;
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
    read.only(o, ['id', 'sky', 'layers', 'wall', 'outside'], '');
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
          read.only(l, ['image', 'parallax', 'y', 'offsetY', 'repeatX', 'parallaxY', 'pin', 'front'], w);
          const y = l.y;
          if (y !== 'top' && y !== 'bottom') read.fail(`${w}.y`, `must be "top" or "bottom", but is ${describe(y)}`);
          const pin = l.pin === undefined ? 'screen' : l.pin;
          if (pin !== 'screen' && pin !== 'room') read.fail(`${w}.pin`, `must be "screen" or "room", but is ${describe(l.pin)}`);
          layers.push({
            image: readImage(read, l, 'image', w),
            parallax: read.number(l, 'parallax', w, { min: 0, max: 2 }),
            y: y === 'top' ? 'top' : 'bottom',
            offsetY: l.offsetY === undefined ? 0 : read.number(l, 'offsetY', w, { min: -1000, max: 1000, integer: true }),
            repeatX: readBool(read, l, 'repeatX', w, false),
            parallaxY: l.parallaxY === undefined ? 0 : read.number(l, 'parallaxY', w, { min: 0, max: 2 }),
            pin: pin === 'room' ? 'room' : 'screen',
            front: readBool(read, l, 'front', w, false),
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
    const outside: Backdrop['outside'] = { above: 'fill', below: 'fill' };
    if (o.outside !== undefined) {
      const ou = read.object(o.outside, 'outside');
      if (ou) {
        read.only(ou, ['above', 'below'], 'outside');
        if (ou.above !== undefined && ou.above !== 'fill' && ou.above !== 'sky') read.fail('outside.above', `must be "fill" or "sky", but is ${describe(ou.above)}`);
        if (ou.below !== undefined && ou.below !== 'fill' && ou.below !== 'deep') read.fail('outside.below', `must be "fill" or "deep", but is ${describe(ou.below)}`);
        if (ou.above === 'sky') outside.above = 'sky';
        if (ou.below === 'deep') outside.below = 'deep';
      }
    }
    if (sky.length === 0 && layers.length === 0 && !wall && o.sky === undefined) read.fail('(the whole file)', 'draws nothing: give it a sky, layers or a wall');
    const out: Backdrop = { id: read.string(o, 'id', ''), sky, layers, wall, outside };
    return out;
  },
  check(content, fail) {
    for (const b of Object.values(content.backdrops)) {
      if (!(b.id in content.rooms)) fail(`content/backdrops/${b.id}.json`, 'id', `no room "${b.id}": a backdrop file is named after the room it is behind`);
      // "deep" paints from the room's atlas; without one it would quietly draw what "fill" draws.
      if (b.outside.below === 'deep' && (content.atlases?.[b.id]?.autotile?.deep.length ?? 0) === 0) {
        fail(`content/backdrops/${b.id}.json`, 'outside.below', `is "deep" but content/atlases/${b.id}.json has no autotile.deep to paint it from`);
      }
    }
  },
};
export default kind;
