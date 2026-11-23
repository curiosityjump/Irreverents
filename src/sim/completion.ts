// Step 14 slice B (docs/mechanisms/levels.md, "Pieces"): what the world's
// found record says about the sets. Pure.
import type { Content } from '../content/types.ts';
import type { World } from './types.ts';

/** Whether every piece of the level's set is found (false when the level has no set). */
export function setComplete(world: World, content: Content, level: string): boolean {
  const set = content.completion?.[level];
  if (!set) return false;
  const have = world.found?.[level] ?? [];
  return set.pieces.every((p) => have.includes(p.id));
}

/**
 * D-089 (the owner, doc 11): "the complete set lets a chased hero into the
 * cantina", read as every level's set complete. False while there are no
 * sets at all. DRAFT: every set, not one; one set would be a small change here.
 */
export function everySetComplete(world: World, content: Content): boolean {
  const ids = Object.keys(content.completion ?? {});
  return ids.length > 0 && ids.every((id) => setComplete(world, content, id));
}
