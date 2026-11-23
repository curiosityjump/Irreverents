import type { Heist } from '../content/kinds/heists.ts';
import type { Content } from '../content/types.ts';
import { heldBy } from './effects.ts';
import { isOut } from './npc/state.ts';
import type { Entity, World } from './types.ts';
import { findEntity } from './world.ts';

// Step 19 push 4 (docs/mechanisms/heists.md, "A prize in your hands"): the
// world's record of prizes carried and banked, and the one way to put a
// carried prize back. The rules run in systems/heist-cargo.ts.

declare module './types.ts' {
  interface World {
    /**
     * Step 19: hero entity id to the prize thing id it carries now (a prize
     * of content/heists/). Written only by the server's world; a page takes
     * it by key with every snapshot, so the holder's own page shows it.
     * Kept with a kept game. Never deleted itself (a page would keep a
     * deleted top-level field): entries come and go inside it.
     */
    cargo?: Record<string, string>;
    /** Step 19: prize thing ids a hero carried out of their place, oldest first. Only grows. */
    banked?: string[];
    /**
     * Step 19: by heist id, the job in progress: `from`, the tick a played
     * hero was first in the place's room (null when nobody is on the job);
     * `seen`, whether a person of the place has had a played hero in sight
     * since. Server's world only, like cargo.
     */
    jobs?: Record<string, { from: number | null; seen: boolean }>;
  }
  interface EventMap {
    /** Step 19: a hero took a prize; it is in their hands (world.cargo) until they are out of the place. */
    'prize-taken': { heist: string; thing: string; by: string; player: string | null };
    /** Step 19: a prize carried out of its place on the carrier's own feet (world.banked). */
    'prize-banked': { heist: string; thing: string; by: string; player: string | null };
    /** Step 19: banked, and nobody of the place had a played hero in sight from going in to now. */
    'clean-getaway': { heist: string; thing: string; by: string; player: string | null };
    /** Step 19: a carried prize put back on its stand (returnPrize; emitted by the rule that called it, Step 21). */
    'prize-returned': { heist: string; thing: string; by: string | null };
  }
}

/** The heist a thing is a prize of, and its prize entry. */
export function prizeOf(content: Content, thing: string): { heist: Heist; prize: Heist['prizes'][number] } | undefined {
  for (const id of Object.keys(content.heists ?? {}).sort()) {
    const heist = content.heists[id]!;
    const prize = heist.prizes.find((p) => p.thing === thing);
    if (prize) return { heist, prize };
  }
  return undefined;
}

/** What a hero carries now (a prize thing id), if anything. Read with a default: old worlds have no cargo. */
export function carriedBy(world: World, hero: string): string | undefined {
  return world.cargo?.[hero];
}

/**
 * Whether a body is on its own feet for banking: not out cold, not held or
 * carried, not flying from a hit or a throw.
 * DRAFT: "out of the place's room on their own feet" (decisions-log "Step 19").
 */
export function onOwnFeet(e: Entity): boolean {
  return !isOut(e) && heldBy(e) === null && !e.c.held && !e.c.flying;
}

/**
 * Puts a carried prize back on its stand: clears whoever carries it and the
 * thing's `takenBy`, so it can be taken again. For Step 21's throw-out (and
 * any rule that takes a prize from a hero); the caller emits
 * `prize-returned`. Returns the hero it was taken from, or undefined when
 * nobody carried it. A banked prize is never put back.
 */
export function returnPrize(world: World, thing: string): string | undefined {
  const cargo = world.cargo;
  if (!cargo) return undefined;
  const hero = Object.keys(cargo).find((h) => cargo[h] === thing);
  if (hero === undefined) return undefined;
  delete cargo[hero];
  const t = findEntity(world, thing);
  if (t?.c.thing) t.c.thing.takenBy = null;
  return hero;
}
