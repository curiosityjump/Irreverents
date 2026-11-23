import { readBool, readImage, readRect, requireDraftNote } from '../art-fields.ts';
import type { Rect } from '../art-fields.ts';
import { describe } from '../reader.ts';
import type { ContentKind } from '../types.ts';

/**
 * content/decor/<room id>.json: decoration placed in a room, named after
 * the room (docs/mechanisms/art-pipeline.md, "Decoration"). It never
 * collides, never looks like a platform or a door, and never marks
 * anything.
 * INTENT: "Nothing points" (docs/plan/step-3.md, "Unadvertised"): decor is
 * placed without knowledge of secrets, so nothing here reads secrets either.
 * Notes: docs/mechanisms/art-foundation.md.
 */
export interface Decor {
  id: string;
  items: DecorItem[];
}

export const DECOR_LAYERS = ['far', 'back', 'front'] as const;
export type DecorLayer = (typeof DECOR_LAYERS)[number];

export interface DecorItem {
  /** Path under assets/. */
  image: string;
  /** [x, y, w, h] of the picture in the image. */
  src: Rect;
  /** Its bottom-left corner sits on the bottom-left of this tile... */
  tx: number;
  ty: number;
  /** ...moved by this many pixels (0 when the file has none). */
  dx: number;
  dy: number;
  /** far: behind the ground; back: in front of the ground, behind bodies; front: in front of bodies. */
  layer: DecorLayer;
  /** Mirrored sideways (false when the file has none). */
  flip: boolean;
}

declare module '../types.ts' {
  interface Content {
    decor: Record<string, Decor>;
  }
}

const kind: ContentKind = {
  id: 'decor',
  source: { dir: 'decor' },
  parse(raw, read) {
    const o = read.object(raw, '');
    if (!o) return null;
    read.only(o, ['id', 'items'], '');
    requireDraftNote(read, o);
    const items: DecorItem[] = [];
    if (!Array.isArray(o.items)) read.fail('items', `must be a list, but is ${describe(o.items)}`);
    else
      o.items.forEach((rawItem, i) => {
        const w = `items[${i}]`;
        const it = read.object(rawItem, w);
        if (!it) return;
        read.only(it, ['image', 'src', 'tx', 'ty', 'dx', 'dy', 'layer', 'flip'], w);
        const layer = it.layer;
        if (!DECOR_LAYERS.includes(layer as DecorLayer)) read.fail(`${w}.layer`, `must be one of ${DECOR_LAYERS.join(', ')}, but is ${describe(layer)}`);
        const px = (f: string): number => (it[f] === undefined ? 0 : read.number(it, f, w, { min: -512, max: 512, integer: true }));
        items.push({
          image: readImage(read, it, 'image', w),
          src: readRect(read, it.src, `${w}.src`),
          tx: read.number(it, 'tx', w, { min: 0, max: 4096, integer: true }),
          ty: read.number(it, 'ty', w, { min: 0, max: 4096, integer: true }),
          dx: px('dx'),
          dy: px('dy'),
          layer: DECOR_LAYERS.includes(layer as DecorLayer) ? (layer as DecorLayer) : 'back',
          flip: readBool(read, it, 'flip', w, false),
        });
      });
    const out: Decor = { id: read.string(o, 'id', ''), items };
    return out;
  },
  check(content, fail) {
    for (const d of Object.values(content.decor)) {
      const file = `content/decor/${d.id}.json`;
      const room = content.rooms[d.id];
      if (!room) {
        fail(file, 'id', `no room "${d.id}": a decor file is named after the room it decorates`);
        continue;
      }
      d.items.forEach((it, i) => {
        if (it.tx >= room.w || it.ty >= room.h) fail(file, `items[${i}]`, `tile (${it.tx}, ${it.ty}) is outside room "${room.id}" (${room.w}×${room.h} tiles)`);
      });
    }
  },
};
export default kind;
