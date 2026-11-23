import { describe, isRecord } from '../reader.ts';
import type { ContentKind } from '../types.ts';

/**
 * content/tuning.json: every feel number in one file (docs/plan/step-1.md,
 * "Taste, for the owner in the morning").
 *
 * INTENT: the numbers are untyped name -> number maps. Which names must
 * exist, and their ranges, are declared by the verb or system that reads
 * them and checked in src/sim/check-content.ts, so a new verb brings its
 * own numbers without anyone editing a shared type.
 */
export interface Tuning {
  /** Numbers that apply to the whole world (read by systems). */
  world: Record<string, number>;
  /** One set of numbers per character tuning id (read by verbs). */
  characters: Record<string, Record<string, number>>;
}

declare module '../types.ts' {
  interface Content {
    tuning: Tuning;
  }
}

const kind: ContentKind = {
  id: 'tuning',
  source: { file: 'tuning.json' },
  parse(raw, read) {
    const out: Tuning = { world: {}, characters: {} };
    const o = read.object(raw, '');
    if (!o) return out;
    read.only(o, ['world', 'characters'], '');
    const numbers = (value: unknown, where: string): Record<string, number> => {
      const set: Record<string, number> = {};
      const obj = read.object(value, where);
      if (!obj) return set;
      for (const key of Object.keys(obj)) {
        if (key === '//') continue;
        const v = obj[key];
        if (typeof v === 'number' && Number.isFinite(v)) set[key] = v;
        else read.fail(`${where}.${key}`, `must be a number, but is ${describe(v)}`);
      }
      return set;
    };
    out.world = numbers(o.world, 'world');
    const chars = read.object(o.characters, 'characters');
    if (chars) {
      for (const id of Object.keys(chars)) {
        if (id === '//') continue;
        if (isRecord(chars[id])) out.characters[id] = numbers(chars[id], `characters.${id}`);
        else read.fail(`characters.${id}`, `must be an object of numbers, but is ${describe(chars[id])}`);
      }
    }
    return out;
  },
};
export default kind;
