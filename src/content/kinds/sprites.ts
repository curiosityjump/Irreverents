import type { ContentKind } from '../types.ts';

/**
 * content/sprites/<character id>.json: the sprite sheet that replaces a
 * character kind's graybox rectangle. Named after the character kind it
 * draws, so adding one edits no other file (docs/architecture.md, "Where
 * art plugs in"). Collision never depends on it.
 * DRAFT: first shape, written before any sheet was wired in; the animation
 * states are the three the client can tell apart today.
 */
export interface Sprite {
  id: string;
  /** Path under assets/, e.g. "heroes/hero-a.png". */
  image: string;
  /** Size of one frame in the sheet (frames are numbered row by row from 0). */
  cell: { w: number; h: number };
  /** Where the collision box's top-left corner sits inside a frame. */
  anchor: { x: number; y: number };
  /** Frames shown per second. */
  fps: number;
  frames: { idle: number[]; run: number[]; air: number[] };
}

declare module '../types.ts' {
  interface Content {
    sprites: Record<string, Sprite>;
  }
}

const kind: ContentKind = {
  id: 'sprites',
  source: { dir: 'sprites' },
  parse(raw, read) {
    const o = read.object(raw, '');
    if (!o) return null;
    read.only(o, ['id', 'image', 'cell', 'anchor', 'fps', 'frames'], '');
    const cell = read.object(o.cell, 'cell') ?? {};
    const anchor = read.object(o.anchor, 'anchor') ?? {};
    const frames = read.object(o.frames, 'frames') ?? {};
    const list = (name: string): number[] => {
      const v = frames[name];
      if (Array.isArray(v) && v.length > 0 && v.every((n) => Number.isInteger(n) && n >= 0)) return v as number[];
      read.fail(`frames.${name}`, 'must be a non-empty list of frame numbers');
      return [0];
    };
    const out: Sprite = {
      id: read.string(o, 'id', ''),
      image: read.string(o, 'image', ''),
      cell: { w: read.number(cell, 'w', 'cell', { min: 1, max: 512, integer: true }), h: read.number(cell, 'h', 'cell', { min: 1, max: 512, integer: true }) },
      anchor: { x: read.number(anchor, 'x', 'anchor', { min: 0, max: 512, integer: true }), y: read.number(anchor, 'y', 'anchor', { min: 0, max: 512, integer: true }) },
      fps: read.number(o, 'fps', '', { min: 1, max: 60 }),
      frames: { idle: list('idle'), run: list('run'), air: list('air') },
    };
    return out;
  },
  check(content, fail) {
    for (const s of Object.values(content.sprites)) {
      if (!(s.id in content.characters)) fail(`content/sprites/${s.id}.json`, 'id', `no character kind "${s.id}": a sprite file is named after the character kind it draws`);
    }
  },
};
export default kind;
