import { describe } from '../reader.ts';
import type { ContentKind } from '../types.ts';

/**
 * content/rooms/<id>.json: a room's geometry, hand-editable as rows of
 * characters with a legend. Who and what stands in a room is separate data
 * (docs/architecture.md), so the map and the people never share a file.
 */
export interface Room {
  id: string;
  name: string;
  /** Tile size in pixels. DRAFT: 16, the size the art on order assumes. */
  tile: number;
  /** Size in tiles. */
  w: number;
  h: number;
  /** w*h collision codes, row by row from the top-left: see TILE. */
  cells: number[];
  /** Tiles a player can start on, in reading order. */
  spawns: { tx: number; ty: number }[];
}

/**
 * What a legend entry can mean. INTENT: additive only. The codes are stored
 * in Room.cells, so never renumber or remove one; add the next number.
 */
export const TILE = {
  empty: 0,
  /** Blocks from every side. */
  solid: 1,
  /** A platform: stand on it from above, pass through from below and the sides. */
  oneway: 2,
} as const;

declare module '../types.ts' {
  interface Content {
    rooms: Record<string, Room>;
  }
}

const MEANINGS = ['empty', 'solid', 'oneway', 'spawn'];

const kind: ContentKind = {
  id: 'rooms',
  source: { dir: 'rooms' },
  parse(raw, read) {
    const o = read.object(raw, '');
    if (!o) return null;
    read.only(o, ['id', 'name', 'tile', 'legend', 'rows'], '');
    const out: Room = {
      id: read.string(o, 'id', ''),
      name: read.string(o, 'name', ''),
      tile: read.number(o, 'tile', '', { min: 8, max: 64, integer: true }),
      w: 0,
      h: 0,
      cells: [],
      spawns: [],
    };
    const legend = read.object(o.legend, 'legend') ?? {};
    for (const ch of Object.keys(legend)) {
      if (ch === '//') continue;
      if (ch.length !== 1) read.fail(`legend.${ch}`, 'a legend key must be exactly one character');
      if (typeof legend[ch] !== 'string' || !MEANINGS.includes(legend[ch] as string)) {
        read.fail(`legend.${ch}`, `must be one of ${MEANINGS.join(', ')}, but is ${describe(legend[ch])}`);
      }
    }
    const rows = read.stringList(o, 'rows', '');
    out.h = rows.length;
    out.w = rows[0]?.length ?? 0;
    if (out.h === 0 || out.w === 0) read.fail('rows', 'a room needs at least one non-empty row');
    rows.forEach((row, ty) => {
      if (row.length !== out.w) {
        read.fail(`rows[${ty}]`, `is ${row.length} characters wide, but rows[0] is ${out.w}: every row must be the same width`);
        return;
      }
      for (let tx = 0; tx < row.length; tx++) {
        const ch = row[tx]!;
        const meaning = Object.hasOwn(legend, ch) ? legend[ch] : undefined;
        if (meaning === 'solid') out.cells.push(TILE.solid);
        else if (meaning === 'oneway') out.cells.push(TILE.oneway);
        else {
          out.cells.push(TILE.empty);
          if (meaning === 'spawn') out.spawns.push({ tx, ty });
          else if (meaning !== 'empty') read.fail(`rows[${ty}]`, `column ${tx} is "${ch}", which is not in the legend`);
        }
      }
    });
    return out;
  },
};
export default kind;
