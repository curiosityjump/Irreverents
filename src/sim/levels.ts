// Step 14 slice A (docs/mechanisms/levels.md): what a level's record says,
// for the page's drawing, the menu and the scenario facts. Pure.
import { levelPlaces } from '../content/kinds/levels.ts';
import type { Content } from '../content/types.ts';
import type { World } from './types.ts';

export interface LevelProgress {
  discovered: boolean;
  /** Places of the level seen (rooms and areas, hidden ones included). */
  seen: number;
  /** Every place of the level, hidden ones included, from the first tick (D-079). */
  total: number;
  /**
   * The completion pie: quarters filled, rounded down, 4 only when every
   * place has been seen. DRAFT (the brief): a pie, never a digit, and it
   * never says which or where (D-079).
   */
  quarters: 0 | 1 | 2 | 3 | 4;
}

export function levelProgress(world: World, content: Content, id: string): LevelProgress {
  const level = content.levels?.[id];
  const rec = world.levels?.[id];
  const places = level ? levelPlaces(content, level) : [];
  const have = new Set(rec?.seen ?? []);
  const seen = places.filter((p) => have.has(p)).length;
  const total = places.length;
  const quarters = (total > 0 && seen >= total ? 4 : Math.min(3, Math.floor((seen * 4) / Math.max(1, total)))) as LevelProgress['quarters'];
  return { discovered: rec !== undefined && rec.seen.length > 0, seen, total, quarters };
}
