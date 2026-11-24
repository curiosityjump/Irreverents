import { describe, known } from '../reader.ts';
import type { ContentKind } from '../types.ts';

/**
 * content/hearts.json (Step 21, hearts; docs/mechanisms/defeat.md): how many
 * hearts each hero has and what costs one. The party's hearts are the
 * world's (`World.heartsLost`, src/sim/hearts.ts): everyone playing shares
 * them (D-012, D-013).
 *
 * DRAFT (the owner, 2026-11-24, "Heros should have hearts which can be
 * lost"; docs/decisions-log.md, "Step 21: hearts"): three each, a fall to an
 * enemy costs one. Every number and the `per` switch are first passes.
 */
export interface Hearts {
  /** The switch: false is the game before hearts (nobody loses one). */
  on: boolean;
  /** Hearts of a hero kind `heroes` leaves out. */
  default: number;
  /** Hearts by character kind (content/characters/). */
  heroes: Record<string, number>;
  /**
   * What costs a heart: `fall`, an enemy putting the hero on the floor (the
   * owner's unit; D-020: impact carries combat, nothing counts single blows);
   * `blow`, each blow an enemy lands (the other answer, one switch away).
   */
  per: 'fall' | 'blow';
}

declare module '../types.ts' {
  interface Content {
    hearts: Hearts;
  }
}

const kind: ContentKind = {
  id: 'hearts',
  source: { file: 'hearts.json' },
  parse(raw, read) {
    const o = read.object(raw, '');
    const out: Hearts = { on: false, default: 3, heroes: {}, per: 'fall' };
    if (!o) return out;
    read.only(o, ['on', 'default', 'heroes', 'per'], '');
    if (typeof o.on !== 'boolean') read.fail('on', `must be true or false, but is ${describe(o.on)}`);
    out.on = o.on === true;
    out.default = read.number(o, 'default', '', { min: 1, max: 9, integer: true });
    const h = read.object(o.heroes, 'heroes');
    if (h) for (const k of Object.keys(h)) out.heroes[k] = read.number(h, k, 'heroes', { min: 1, max: 9, integer: true });
    if (o.per !== 'fall' && o.per !== 'blow') read.fail('per', `must be "fall" or "blow", but is ${describe(o.per)}`);
    else out.per = o.per;
    return out;
  },
  check(content, fail) {
    for (const k of Object.keys(content.hearts.heroes)) {
      if (!(k in content.characters)) fail('content/hearts.json', `heroes.${k}`, `no character "${k}" (characters: ${known(content.characters)})`);
    }
  },
};
export default kind;
