// Step 21, hearts (docs/mechanisms/defeat.md, "Hearts"): the party's hearts.
// A helper, not a registry file, like defeat.ts: the systems are
// src/sim/systems/heart-*.ts.
//
// The owner, 2026-11-24, first-hand: "Heros should have hearts which can be
// lost. Once all heros in the party are out of hearts, that's a game over
// (back to cantina)". The party is shared by everyone playing (D-012,
// D-013), so its hearts are the world's, kept by hero kind, not a player's.
import type { Content } from '../content/types.ts';
import type { World } from './types.ts';

declare module './types.ts' {
  interface World {
    /**
     * Step 21, hearts: hearts each hero (by character kind) has lost, kept
     * with a kept game. Absent, or a kind left out: none lost (old saves,
     * scenarios, a new game). Written only by the server's world (a page
     * takes it by key with every snapshot); never a key deleted, only set
     * (a page takes top-level fields by key; World.chased's note).
     */
    heartsLost?: Record<string, number>;
  }
  interface EventMap {
    /** Step 21: hero `hero` (a kind) lost a heart to `by`; `left` is how many it has now. */
    'heart-lost': { entity: string; player: string | null; hero: string; by: string; left: number };
  }
}

/** How many hearts a hero of this kind has when full. */
export function maxHearts(content: Content, kind: string): number {
  return content.hearts?.heroes[kind] ?? content.hearts?.default ?? 3;
}

/** How many hearts a hero of this kind has left in this world. */
export function heartsLeft(world: World, content: Content, kind: string): number {
  return Math.max(0, maxHearts(content, kind) - (world.heartsLost?.[kind] ?? 0));
}

/** Whether a hero of this kind is out: hearts are on and it has none left. */
export function heartsOut(world: World, content: Content, kind: string): boolean {
  return content.hearts?.on === true && heartsLeft(world, content, kind) === 0;
}

/** Takes one heart from a hero kind; returns how many it has left. Never below none. */
export function loseHeart(world: World, content: Content, kind: string): number {
  const lost = Math.min(maxHearts(content, kind), (world.heartsLost?.[kind] ?? 0) + 1);
  world.heartsLost = { ...world.heartsLost, [kind]: lost };
  return heartsLeft(world, content, kind);
}

/** Every hero's hearts back. Leaves the field present (empty), never deleted. */
export function refillHearts(world: World): void {
  if (world.heartsLost && Object.values(world.heartsLost).some((n) => n > 0)) world.heartsLost = {};
}
