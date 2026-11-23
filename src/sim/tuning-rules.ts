// Which tuning numbers exist, and the range each may take, read from the
// declarations of the verbs and systems that read them (never a hand list).
// Used by the ?tune panel and by the server, which refuses any change these
// rules do not allow (docs/mechanisms/tuning-panel.md).
import type { Content } from '../content/types.ts';
import type { Tuning } from '../content/kinds/tuning.ts';
import { systems, verbs } from './registry.ts';
import { TICK_RATE } from './types.ts';
import type { TuningRule } from './types.ts';

export interface TuningRules {
  /** World numbers, as the systems declare them. */
  world: Record<string, TuningRule>;
  /** For each character tuning set (content/tuning.json `characters.<set>`): the numbers its characters' verbs declare. */
  characters: Record<string, Record<string, TuningRule>>;
}

/** The set name for the world's numbers in a change; any other name is a character tuning set. */
export const WORLD_SET = 'world';

/**
 * Every tuning number a change may touch, with its range. The ranges are
 * the declared ones, narrowed where src/sim/check-content.ts narrows them
 * (no speed may cross a whole tile in one tick), so a dial can never set
 * a number the build would refuse.
 */
export function tuningRules(content: Content): TuningRules {
  const world: Record<string, TuningRule> = {};
  for (const s of systems) Object.assign(world, s.tuning ?? {});
  const characters: Record<string, Record<string, TuningRule>> = {};
  for (const c of Object.values(content.characters)) {
    const set = (characters[c.tuning] ??= {});
    for (const id of c.verbs) Object.assign(set, verbs.find((v) => v.id === id)?.tuning ?? {});
  }
  const tiles = Object.values(content.rooms).map((r) => r.tile);
  if (tiles.length > 0) {
    // Under, not at: check-content refuses a speed equal to the limit.
    const limit = Math.min(...tiles) * TICK_RATE - 1;
    const cap = (rules: Record<string, TuningRule>, name: string): void => {
      const r = rules[name];
      if (r && r.max > limit) rules[name] = { ...r, max: Math.max(r.min, limit) };
    };
    cap(world, 'maxFallSpeed');
    for (const set of Object.values(characters)) for (const name of ['runSpeed', 'jumpSpeed']) cap(set, name);
  }
  return { world, characters };
}

/** A change as it travels: one number in one set; `v: null` puts the shipped number back. */
export interface TuningChange {
  set: string;
  name: string;
  v: number | null;
}

/** Why a change is refused, or null when the rules allow it. Never trusts what it is given. */
export function refuseChange(rules: TuningRules, raw: unknown): string | null {
  if (typeof raw !== 'object' || raw === null) return 'not a change';
  const c = raw as Record<string, unknown>;
  if (typeof c.set !== 'string' || typeof c.name !== 'string') return 'no set or name';
  const set = c.set === WORLD_SET ? rules.world : Object.hasOwn(rules.characters, c.set) ? rules.characters[c.set]! : null;
  if (!set) return `no tuning set "${c.set}"`;
  if (!Object.hasOwn(set, c.name)) return `no number "${c.name}" in "${c.set}"`;
  if (c.v === null) return null;
  if (typeof c.v !== 'number' || !Number.isFinite(c.v)) return 'not a number';
  const r = set[c.name]!;
  if (c.v < r.min || c.v > r.max) return `${c.v} is outside ${r.min}..${r.max}`;
  return null;
}

/** What differs from the shipped numbers, shaped like content/tuning.json (only the sets and names that differ). */
export interface TuningDiff {
  world?: Record<string, number>;
  characters?: Record<string, Record<string, number>>;
}

export function tuningDiff(shipped: Tuning, now: Tuning): TuningDiff {
  const out: TuningDiff = {};
  for (const [name, v] of Object.entries(now.world)) {
    if (shipped.world[name] !== v) (out.world ??= {})[name] = v;
  }
  for (const [set, numbers] of Object.entries(now.characters)) {
    for (const [name, v] of Object.entries(numbers)) {
      if (shipped.characters[set]?.[name] !== v) ((out.characters ??= {})[set] ??= {})[name] = v;
    }
  }
  return out;
}

/** Makes `target` the shipped numbers with `diff` laid over them, in place (so every holder of the object sees it). */
export function applyTuningDiff(target: Tuning, shipped: Tuning, diff: TuningDiff): void {
  for (const name of Object.keys(target.world)) if (!(name in shipped.world)) delete target.world[name];
  Object.assign(target.world, shipped.world, diff.world ?? {});
  for (const [set, numbers] of Object.entries(shipped.characters)) {
    const t = (target.characters[set] ??= {});
    for (const name of Object.keys(t)) if (!(name in numbers)) delete t[name];
    Object.assign(t, numbers, diff.characters?.[set] ?? {});
  }
}

/** One change applied to a tuning, in place. Call only with a change `refuseChange` allowed. */
export function applyChange(target: Tuning, shipped: Tuning, c: TuningChange): void {
  const into = c.set === WORLD_SET ? target.world : (target.characters[c.set] ??= {});
  const from = c.set === WORLD_SET ? shipped.world : (shipped.characters[c.set] ?? {});
  if (c.v === null) {
    if (c.name in from) into[c.name] = from[c.name]!;
  } else into[c.name] = c.v;
}
