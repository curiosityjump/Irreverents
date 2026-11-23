import type { ContentKind } from '../types.ts';

/**
 * content/atlases/<room id>.json: the tile image that replaces a room's
 * graybox tiles. Named after the room it draws, so adding one edits no
 * other file (docs/architecture.md, "Where art plugs in"). Collision never
 * depends on it.
 * DRAFT: first shape, written before any atlas was wired in: one atlas cell
 * per tile meaning.
 */
export interface Atlas {
  id: string;
  /** Path under assets/. */
  image: string;
  /** Size of one cell in the image, pixels. */
  tile: number;
  /** [column, row] in the image for each thing drawn. `solidTop` is a solid tile with open space above it. */
  cells: { solid: [number, number]; solidTop: [number, number]; oneway: [number, number] };
}

declare module '../types.ts' {
  interface Content {
    atlases: Record<string, Atlas>;
  }
}

const kind: ContentKind = {
  id: 'atlases',
  source: { dir: 'atlases' },
  parse(raw, read) {
    const o = read.object(raw, '');
    if (!o) return null;
    read.only(o, ['id', 'image', 'tile', 'cells'], '');
    const cells = read.object(o.cells, 'cells') ?? {};
    const cell = (name: string): [number, number] => {
      const v = cells[name];
      if (Array.isArray(v) && v.length === 2 && v.every((n) => Number.isInteger(n) && n >= 0)) return [v[0] as number, v[1] as number];
      read.fail(`cells.${name}`, 'must be [column, row]');
      return [0, 0];
    };
    const out: Atlas = {
      id: read.string(o, 'id', ''),
      image: read.string(o, 'image', ''),
      tile: read.number(o, 'tile', '', { min: 1, max: 512, integer: true }),
      cells: { solid: cell('solid'), solidTop: cell('solidTop'), oneway: cell('oneway') },
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
