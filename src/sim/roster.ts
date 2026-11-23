import type { Content } from '../content/types.ts';
import type { World } from './types.ts';

declare module './types.ts' {
  interface World {
    /**
     * Step 13 (D-007, D-082; docs/mechanisms/recruits.md): the character ids
     * unlocked in this game. **Absent means every roster character**
     * (content/roster.json `characters`), which is every world from before
     * Step 13, every scenario that does not seed it and every `?room=`
     * world. A new shared world or a new kept game starts with the roster's
     * `start` (src/server/game.ts, makeWorld). Only ever grows (D-082:
     * unlocks are permanent); a page takes it by key with every snapshot,
     * and a kept game keeps it. Read it through `unlocked`, never directly.
     */
    roster?: string[];
  }
}

/**
 * The roster characters unlocked in this world, in the roster's order.
 * INTENT: absent means all of them, so no world made before Step 13 loses
 * anyone (an old kept game, every existing scenario and check).
 */
export function unlocked(world: World, content: Content): string[] {
  const all = content.roster.characters;
  if (!Array.isArray(world.roster)) return all;
  const have = new Set(world.roster);
  return all.filter((k) => have.has(k));
}

/** True when `kind` is a roster character unlocked in this world. */
export function isUnlocked(world: World, content: Content, kind: string): boolean {
  return unlocked(world, content).includes(kind);
}

/**
 * Unlocks `kind` for good (D-082). Returns false when it was unlocked
 * already or is not a roster character. An absent roster is everyone, so
 * there is nothing to add.
 */
export function unlock(world: World, content: Content, kind: string): boolean {
  if (!content.roster.characters.includes(kind) || isUnlocked(world, content, kind)) return false;
  (world.roster ??= []).push(kind);
  return true;
}
