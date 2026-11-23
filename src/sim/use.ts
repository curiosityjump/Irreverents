import type { Content } from '../content/types.ts';
import type { Entity, World } from './types.ts';
import entryList from './use/index.gen.ts';

/**
 * What a fresh press of Use would do, here, for this body: the one answer
 * every system that reads Use acts on, and the one the page shows on the
 * button (Step 19, docs/plan/step-19.md; docs/mechanisms/heists.md).
 */
export interface UseAnswer {
  /** The entry (src/sim/use/<id>.ts) that takes the press. */
  entry: string;
  /**
   * The key of the word the button shows for it (content/prompts.json, by
   * entry then this key): a thing's deed ("take", "buy", "break"), "go-in",
   * "ring". DRAFT: the words are data; this key is what picks one.
   */
  word: string;
  /** The entity the press acts on, when it is one (a placed thing). */
  target?: string;
  /** Where the press acts, in pixels, for the mark over it: the middle top of the doorway, thing or bell. */
  at: { x: number; y: number };
}

/**
 * One thing Use can do. One file each in src/sim/use/, default-exported;
 * the directory is a registry (scripts/lib/registries.ts), so a new thing
 * Use does is one new file and one row of words, and no list is edited.
 */
export interface UseEntry {
  id: string;
  /**
   * Lower asks first; the first entry with an answer takes the press.
   * INTENT: the door wins (order 0): standing in an enter doorway, Use goes
   * through it and never also buys, robs or rings (decisions-log 2026-11-23
   * "Doorways by Use"). Ties break by id, as systems do (src/sim/registry.ts).
   */
  order: number;
  /** This entry's answer for a fresh press by `e` now, or undefined when it has nothing to do here. */
  find(world: World, content: Content, e: Entity): UseAnswer | undefined;
}

let sorted: UseEntry[] | undefined;
/** Sorted on first use, not at load: the entries import the systems that import this file. */
function entries(): UseEntry[] {
  return (sorted ??= [...(entryList as UseEntry[])].sort((a, b) => a.order - b.order || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)));
}

/**
 * What a fresh press of Use by this body would do here and now, or
 * undefined when it would do nothing. Any body (the door entry serves a
 * guard driven by entity.c.input too); the systems keep their own effects
 * and their own fresh-press memory, and act only when the answer is theirs.
 * DRAFT: Step 19 push 1, the arbiter (decisions-log "Step 19").
 */
export function useHere(world: World, content: Content, e: Entity): UseAnswer | undefined {
  for (const entry of entries()) {
    const answer = entry.find(world, content, e);
    if (answer) return answer;
  }
  return undefined;
}
