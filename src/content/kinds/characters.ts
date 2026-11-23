import { known } from '../reader.ts';
import type { ContentKind } from '../types.ts';

/**
 * content/characters/<id>.json: a kind of body a player (or, later, an NPC)
 * can be. DRAFT: one collision box, one flat colour until sprite sheets land
 * (docs/architecture.md, "Where art plugs in").
 */
export interface CharacterKind {
  id: string;
  name: string;
  /** Collision box in pixels. */
  box: { w: number; h: number };
  /** Graybox fill colour. */
  color: string;
  /** Ids of the verbs this character can do (files in src/sim/verbs/). */
  verbs: string[];
  /** Which set in content/tuning.json "characters" this character reads. */
  tuning: string;
}

declare module '../types.ts' {
  interface Content {
    characters: Record<string, CharacterKind>;
  }
}

const kind: ContentKind = {
  id: 'characters',
  source: { dir: 'characters' },
  parse(raw, read) {
    const o = read.object(raw, '');
    if (!o) return null;
    read.only(o, ['id', 'name', 'box', 'color', 'verbs', 'tuning'], '');
    const box = read.object(o.box, 'box');
    const out: CharacterKind = {
      id: read.string(o, 'id', ''),
      name: read.string(o, 'name', ''),
      // INTENT: whole pixels and smaller than a 32x32 sprite cell; the physics
      // system snaps to tile edges and relies on whole-number boxes.
      box: {
        w: box ? read.number(box, 'w', 'box', { min: 1, max: 32, integer: true }) : 0,
        h: box ? read.number(box, 'h', 'box', { min: 1, max: 32, integer: true }) : 0,
      },
      color: read.string(o, 'color', ''),
      verbs: read.stringList(o, 'verbs', ''),
      tuning: read.string(o, 'tuning', ''),
    };
    return out;
  },
  check(content, fail) {
    for (const c of Object.values(content.characters)) {
      if (!(c.tuning in content.tuning.characters)) {
        fail(
          `content/characters/${c.id}.json`,
          'tuning',
          `no tuning set "${c.tuning}" in content/tuning.json "characters" (sets there: ${known(content.tuning.characters)})`,
        );
      }
    }
  },
};
export default kind;
