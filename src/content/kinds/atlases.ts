import { readCell, readCellList, readImage, requireDraftNote } from '../art-fields.ts';
import type { Cell } from '../art-fields.ts';
import type { ContentKind } from '../types.ts';

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
        read.only(t, ['origin', 'innerCorners', 'fill', 'top', 'under', 'oneway'], 'autotile');
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
      if (!(a.id in content.rooms)) fail(`content/atlases/${a.id}.json`, 'id', `no room "${a.id}": an atlas file is named after the room it draws`);
    }
  },
};
export default kind;
