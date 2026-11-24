// Step 5, the owner's report (2026-11-23, playing): "enemies collapse but
// never die". What the beaten-* systems share: which people can be defeated
// and by what, the bodiless records of a placed bad guy who is gone and of
// the defeats each player is credited with, and the two things Step 22's
// stage reads (defeatsBy, restorePeople). Pure, like the rest of src/sim.
// Not in a registry directory on purpose: a helper.
// Writeup: docs/mechanisms/combat-and-impact.md, "Beaten for good".
import type { Content } from '../content/types.ts';
import { isOut, npcKind, THING_KIND } from './npc/state.ts';
import type { Entity, World } from './types.ts';
import { addEntity, findEntity, removeEntity, spawnBody } from './world.ts';

declare module './types.ts' {
  interface Components {
    /** On a bad guy: how many times the players have knocked him out (hidden; drawing shows the last one coming as a daze). */
    knocks?: { n: number };
    /** On a defeated bad guy: he lies `ticks` more (counted only once he has stopped flying), then goes in a poof. */
    beaten?: { ticks: number; by: string | null };
    /**
     * On the bodiless `~beaten:<placed id>` record: a placed bad guy who was
     * defeated and is gone, his room, and how long (ticks, in a row) no
     * player's character has been in it.
     */
    beatenGone?: { id: string; room: string; empty: number };
    /** On the one bodiless `~defeats` record: bad guys defeated, by the player id credited with each. */
    defeats?: Record<string, number>;
  }
  interface EventMap {
    /** A bad guy was defeated: he will not get up. `by`: the body that did it; `player`: the player credited (null: none). */
    defeated: { target: string; by: string | null; player: string | null; how: 'worn' | 'slam' };
    /** A defeated bad guy went in a poof where he lay: his middle, room pixels. */
    'defeated-gone': { target: string; room: string; x: number; y: number };
    /** A placed bad guy who was defeated is back at his place. */
    'defeated-back': { target: string; room: string };
  }
}

export const DEFEATS_ID = '~defeats';
export const goneId = (placed: string): string => `~beaten:${placed}`;

/**
 * How a body can be defeated, or null if it cannot: only a `bad` person
 * (a body nobody plays with `c.npc`) whose kind does not say `beaten: false`.
 * INTENT (the brief, from D-064 and doc 26): a `good` person (a townsperson,
 * a guard) is knocked out, never defeated: an unconscious body lying there to
 * be found is what the town's response builds on.
 */
export function beatenRule(content: Content, e: Entity): { after: number; slam: number } | null {
  if (e.player !== null || !e.c.npc) return null;
  const kind = npcKind(content, e);
  if (!kind || kind.side !== 'bad' || kind.beaten === false) return null;
  const world = content.tuning.world;
  return { after: kind.beaten?.after ?? world.beatenAfter ?? 3, slam: kind.beaten?.slam ?? world.beatenSlam ?? 0 };
}

/** Whether a body is a `good` person, who stays knocked out longer instead of being defeated. */
export function knockedOutOnly(content: Content, e: Entity): boolean {
  if (e.player !== null || !e.c.npc) return false;
  return npcKind(content, e)?.side === 'good';
}

/** Whether `knocks` more knock-outs would defeat this body now (drawing's daze: the last one is coming). */
export function oneMoreDefeats(content: Content, e: Entity): boolean {
  const rule = beatenRule(content, e);
  return !!rule && rule.after > 1 && !isOut(e) && (e.c.knocks?.n ?? 0) >= rule.after - 1;
}

/** Credits a defeat to a player. */
export function creditDefeat(world: World, room: string, player: string): void {
  let rec = findEntity(world, DEFEATS_ID);
  rec ??= addEntity(world, { id: DEFEATS_ID, kind: THING_KIND, player: null, room, x: 0, y: 0, vx: 0, vy: 0, facing: 1, onGround: true, c: {} });
  const d = (rec.c.defeats ??= {});
  d[player] = (d[player] ?? 0) + 1;
}

/**
 * For Step 22's stage: how many bad guys this player has been credited with
 * defeating in this world, ever. A stage counts its own by taking the
 * difference from when it began.
 */
export function defeatsBy(world: World, player: string): number {
  return findEntity(world, DEFEATS_ID)?.c.defeats?.[player] ?? 0;
}

/** Every placed bad guy who was defeated and is gone, in id order: [record, placed id, room]. */
export function goneRecords(world: World): Entity[] {
  return world.entities.filter((e) => e.c.beatenGone !== undefined);
}

/**
 * Puts a gone placed bad guy back at his placement, fresh, and drops his
 * record. A placement this build no longer has, or an id already back in the
 * world (a kept game's load places every placement again), only drops the
 * record. Returns whether a body was placed.
 */
export function bringBack(world: World, content: Content, rec: Entity): boolean {
  const g = rec.c.beatenGone;
  removeEntity(world, rec.id);
  if (!g || findEntity(world, g.id)) return false;
  const p = content.placements[g.room]?.place.find((q) => q.id === g.id);
  if (!p || !content.characters[p.character] || !content.rooms[g.room]) return false;
  spawnBody(world, content, { id: p.id, character: p.character, room: g.room, tile: p.tile });
  // c.npc is made by npc-setup (order 10) on the next pass, as for any placed body.
  return true;
}

/**
 * For Step 22's stage, starting over: every placed bad guy defeated in
 * `room` (every room when left out) is back at his place now. Returns the
 * ids put back. A wave's arrivals are not placed and are never put back.
 */
export function restorePeople(world: World, content: Content, room?: string): string[] {
  const out: string[] = [];
  for (const rec of goneRecords(world)) {
    const g = rec.c.beatenGone!;
    if (room !== undefined && g.room !== room) continue;
    if (bringBack(world, content, rec)) out.push(g.id);
  }
  return out;
}
