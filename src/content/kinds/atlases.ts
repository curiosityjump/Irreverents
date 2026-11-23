import { readCell, readCellList, readImage, requireDraftNote } from '../art-fields.ts';
import type { Cell } from '../art-fields.ts';
import { describe } from '../reader.ts';
import type { ContentKind, Reader } from '../types.ts';

/**
 * content/atlases/<room id>.json: the tile image that replaces a room's
 * graybox tiles. Named after the room it draws, so adding one edits no
 * other file (docs/architecture.md, "Where art plugs in"). Several rooms
 * may name the same image. Collision never depends on it.
 * The shape is the art contract's (docs/mechanisms/art-pipeline.md,
 * "Ground"): `cells` is the first shape and stays required as the
 * fallback; `autotile` is additive. Notes: docs/mechanisms/art-foundation.md.
 */
export interface Atlas {
  id: string;
  /** Path under assets/. */
  image: string;
  /** Size of one cell in the image, pixels. */
  tile: number;
  /** [column, row] in the image for each thing drawn. `solidTop` is a solid tile with open space above it. */
  cells: { solid: Cell; solidTop: Cell; oneway: Cell };
  /** Ground that joins up, or null when the file has none (then `cells` draws it). */
  autotile: Autotile | null;
}

export interface Autotile {
  /**
   * Top-left of the 4×4 block of solid tiles. For a solid tile,
   * index = N·1 + E·2 + S·4 + W·8 (a letter is 1 when that neighbour looks
   * solid); the cell is [origin[0] + index % 4, origin[1] + floor(index / 4)].
   */
  origin: Cell;
  /** Transparent overlays for an index-15 tile whose diagonal neighbour is open. Null when the file has none. */
  innerCorners: { nw: Cell; ne: Cell; sw: Cell; se: Cell } | null;
  /** Variants for index 15, chosen by a fixed hash of the position. At least four. */
  fill: Cell[];
  /** Pieces drawn in the empty tile above a top surface, chosen by hash; [-1, -1] is "nothing here". Empty when none. */
  top: Cell[];
  /** Pieces hanging into the empty tile below an underside; [-1, -1] is "nothing here". Empty when none. */
  under: Cell[];
  /** A one-way platform's cell by its place in a run. Null when the file has none (then `cells.oneway`). */
  oneway: { left: Cell; mid: Cell; right: Cell; single: Cell } | null;
  /**
   * Round 2 (the contract, "Round 2 additions"): cells chosen by hash for
   * everything past the room's bottom edge, when the room's backdrop says
   * `outside.below: "deep"`. Empty when the file has none (then the ground
   * continues as before).
   */
  deep: Cell[];
  /** Round 2: rectangles of the room drawn from their own 4×4 block and lists; the first that holds a tile wins. Empty when none. */
  regions: AutotileRegion[];
}

export interface AutotileRegion {
  /** [x, y, w, h] in room tiles. */
  tiles: [number, number, number, number];
  /** Top-left of this region's own 4×4 block (same index as `origin`). */
  origin: Cell;
  /** This region's own lists, or null to use the atlas's. */
  fill: Cell[] | null;
  top: Cell[] | null;
  under: Cell[] | null;
}

/** The first region that holds room tile (tx, ty), if any. */
export function regionAt(t: Autotile, tx: number, ty: number): AutotileRegion | undefined {
  for (const r of t.regions ?? []) {
    const [x, y, w, h] = r.tiles;
    if (tx >= x && ty >= y && tx < x + w && ty < y + h) return r;
  }
  return undefined;
}

declare module '../types.ts' {
  interface Content {
    atlases: Record<string, Atlas>;
  }
}

/** Every cell an atlas names (except [-1, -1]), with where it is named: what the image check measures. */
export function atlasCells(a: Atlas): { where: string; cell: Cell }[] {
  const out: { where: string; cell: Cell }[] = [];
  const add = (where: string, cell: Cell): void => {
    if (cell[0] >= 0) out.push({ where, cell });
  };
  for (const [k, c] of Object.entries(a.cells)) add(`cells.${k}`, c);
  const t = a.autotile;
  if (!t) return out;
  // The whole 4×4 block must be inside the image: its far corner stands for it.
  add('autotile.origin (its 4×4 block)', [t.origin[0] + 3, t.origin[1] + 3]);
  if (t.innerCorners) for (const [k, c] of Object.entries(t.innerCorners)) add(`autotile.innerCorners.${k}`, c);
  t.fill.forEach((c, i) => add(`autotile.fill[${i}]`, c));
  t.top.forEach((c, i) => add(`autotile.top[${i}]`, c));
  t.under.forEach((c, i) => add(`autotile.under[${i}]`, c));
  if (t.oneway) for (const [k, c] of Object.entries(t.oneway)) add(`autotile.oneway.${k}`, c);
  t.deep.forEach((c, i) => add(`autotile.deep[${i}]`, c));
  t.regions.forEach((r, i) => {
    const w = `autotile.regions[${i}]`;
    add(`${w}.origin (its 4×4 block)`, [r.origin[0] + 3, r.origin[1] + 3]);
    for (const k of ['fill', 'top', 'under'] as const) (r[k] ?? []).forEach((c, j) => add(`${w}.${k}[${j}]`, c));
  });
  return out;
}

function readTiles(read: Reader, v: unknown, where: string): [number, number, number, number] {
  if (Array.isArray(v) && v.length === 4 && v.every((n) => Number.isInteger(n) && n >= 0) && (v[2] as number) > 0 && (v[3] as number) > 0) return v as [number, number, number, number];
  read.fail(where, `must be [x, y, w, h] in whole room tiles (w and h at least 1), but is ${describe(v)}`);
  return [0, 0, 0, 0];
}

function readRegions(read: Reader, v: unknown): AutotileRegion[] {
  if (v === undefined) return [];
  if (!Array.isArray(v)) {
    read.fail('autotile.regions', `must be a list of { "tiles": [x, y, w, h], "origin": [c, r] }, but is ${describe(v)}`);
    return [];
  }
  const out: AutotileRegion[] = [];
  v.forEach((raw, i) => {
    const w = `autotile.regions[${i}]`;
    const r = read.object(raw, w);
    if (!r) return;
    read.only(r, ['tiles', 'origin', 'fill', 'top', 'under'], w);
    // DRAFT: a region's own fill needs only one cell (a strip of roof may want one); the atlas's own needs four.
    const list = (k: 'fill' | 'top' | 'under'): Cell[] | null =>
      r[k] === undefined ? null : readCellList(read, r[k], `${w}.${k}`, { allowNone: k !== 'fill' });
    out.push({ tiles: readTiles(read, r.tiles, `${w}.tiles`), origin: readCell(read, r.origin, `${w}.origin`), fill: list('fill'), top: list('top'), under: list('under') });
  });
  return out;
}

const kind: ContentKind = {
  id: 'atlases',
  source: { dir: 'atlases' },
  parse(raw, read) {
    const o = read.object(raw, '');
    if (!o) return null;
    read.only(o, ['id', 'image', 'tile', 'cells', 'autotile'], '');
    requireDraftNote(read, o);
    const cells = read.object(o.cells, 'cells') ?? {};
    read.only(cells, ['solid', 'solidTop', 'oneway'], 'cells');
    let autotile: Autotile | null = null;
    if (o.autotile !== undefined) {
      const t = read.object(o.autotile, 'autotile');
      if (t) {
        read.only(t, ['origin', 'innerCorners', 'fill', 'top', 'under', 'oneway', 'deep', 'regions'], 'autotile');
        const four = <K extends string>(v: unknown, where: string, keys: K[]): Record<K, Cell> | null => {
          if (v === undefined) return null;
          const b = read.object(v, where);
          if (!b) return null;
          read.only(b, keys, where);
          return Object.fromEntries(keys.map((k) => [k, readCell(read, b[k], `${where}.${k}`)])) as Record<K, Cell>;
        };
        autotile = {
          origin: readCell(read, t.origin, 'autotile.origin'),
          innerCorners: four(t.innerCorners, 'autotile.innerCorners', ['nw', 'ne', 'sw', 'se']),
          fill: readCellList(read, t.fill, 'autotile.fill', { min: 4 }),
          // INTENT (the contract): [-1, -1] ("nothing here") is allowed only in top and under.
          top: t.top === undefined ? [] : readCellList(read, t.top, 'autotile.top', { allowNone: true }),
          under: t.under === undefined ? [] : readCellList(read, t.under, 'autotile.under', { allowNone: true }),
          oneway: four(t.oneway, 'autotile.oneway', ['left', 'mid', 'right', 'single']),
          // The contract: "a list of at least two cells, chosen by hash".
          deep: t.deep === undefined ? [] : readCellList(read, t.deep, 'autotile.deep', { min: 2 }),
          regions: readRegions(read, t.regions),
        };
      }
    }
    const out: Atlas = {
      id: read.string(o, 'id', ''),
      image: readImage(read, o, 'image', ''),
      tile: read.number(o, 'tile', '', { min: 1, max: 512, integer: true }),
      cells: { solid: readCell(read, cells.solid, 'cells.solid'), solidTop: readCell(read, cells.solidTop, 'cells.solidTop'), oneway: readCell(read, cells.oneway, 'cells.oneway') },
      autotile,
    };
    return out;
  },
  check(content, fail) {
    for (const a of Object.values(content.atlases)) {
      const room = content.rooms[a.id];
      if (!room) {
        fail(`content/atlases/${a.id}.json`, 'id', `no room "${a.id}": an atlas file is named after the room it draws`);
        continue;
      }
      (a.autotile?.regions ?? []).forEach((r, i) => {
        const [x, y, w, h] = r.tiles;
        if (x + w > room.w || y + h > room.h) fail(`content/atlases/${a.id}.json`, `autotile.regions[${i}].tiles`, `[${r.tiles.join(', ')}] runs past room "${room.id}" (${room.w}×${room.h} tiles)`);
      });
    }
  },
};
export default kind;
