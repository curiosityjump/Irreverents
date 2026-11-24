import { describe, known } from '../reader.ts';
import type { ContentKind } from '../types.ts';

/**
 * content/grips.json (Step 23; docs/mechanisms/weapons.md): where each
 * character kind's hand is, so a weapon (content/weapons/) is drawn in it.
 * The P12 contract: "All equipment is attached by grip anchors in-engine";
 * a sprite has one `anchor` and no hand point (content/sprites/), so the
 * hand is here. `kinds`: pixels from the body's box top-left, facing right.
 * `default`: a share of the box [across, down], so a new kind needs no row.
 * DRAFT: every point, read by eye off the cut sprites.
 */
export interface Grips {
  default: [number, number];
  kinds: Record<string, [number, number]>;
}

declare module '../types.ts' {
  interface Content {
    grips: Grips;
  }
}

const kind: ContentKind = {
  id: 'grips',
  source: { file: 'grips.json' },
  parse(raw, read) {
    const out: Grips = { default: [0.8, 0.55], kinds: {} };
    const o = read.object(raw, '');
    if (!o) return out;
    read.only(o, ['default', 'kinds'], '');
    const d = o.default;
    if (d !== undefined) {
      if (Array.isArray(d) && d.length === 2 && d.every((n) => typeof n === 'number' && n >= 0 && n <= 1)) out.default = [d[0], d[1]];
      else read.fail('default', `must be [across, down], each a share of the box from 0 to 1, but is ${describe(d)}`);
    }
    if (o.kinds !== undefined) {
      const k = read.object(o.kinds, 'kinds');
      if (k)
        for (const [id, p] of Object.entries(k)) {
          if (id === '//') continue;
          if (Array.isArray(p) && p.length === 2 && p.every((n) => typeof n === 'number' && Number.isFinite(n) && n >= 0 && n <= 64)) out.kinds[id] = [p[0], p[1]];
          else read.fail(`kinds.${id}`, `must be [x, y] in pixels from the box's top-left, but is ${describe(p)}`);
        }
    }
    return out;
  },
  check(content, fail) {
    for (const [id, [x, y]] of Object.entries(content.grips.kinds)) {
      const c = content.characters[id];
      if (!c) fail('content/grips.json', `kinds.${id}`, `no character "${id}" (characters: ${known(content.characters)})`);
      else if (x > c.box.w || y > c.box.h) fail('content/grips.json', `kinds.${id}`, `[${x}, ${y}] is outside its ${c.box.w} by ${c.box.h} box`);
    }
  },
};
export default kind;
