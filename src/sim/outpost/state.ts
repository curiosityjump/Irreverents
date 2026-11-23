// The outpost (Step 12, D-061): the shared shapes and small helpers of the
// outpost-* systems. Writeup: docs/mechanisms/outposts.md.
//
// INTENT (D-055): scripted, never AI. Fixed states and the data in
// content/outposts/. All state is on entities, so the server's generic
// replication carries it to every phone (no World field, no module variable).
import type { Outpost } from '../../content/kinds/outposts.ts';
import type { Content } from '../../content/types.ts';
import type { Entity, World } from '../types.ts';
import { findEntity } from '../world.ts';

declare module '../types.ts' {
  interface Components {
    /** On a caller of an outpost (a person its data lists in `callers`). */
    outpostCall?: {
      /** `idle` (fighting or standing), `going` (walking to the post), `sounding` (at the post). */
      phase: 'idle' | 'going' | 'sounding';
      /** Ticks sounded so far. */
      progress: number;
      /** Ticks to wait before they may go again, after a finished call. */
      wait: number;
      /** DRAFT: true once a call of theirs was stopped by a knock-out or a grab: they never call again. */
      done: boolean;
      /** Ticks the walk to the post has made no headway. */
      stall: number;
    };
    /** On an outpost's post (the signaler). */
    signaler?: {
      /** Hits it has taken. */
      hits: number;
      /** DRAFT: broken stays broken until the world restarts. Nothing is saved. */
      broken: boolean;
      /** Ticks of the call being sounded now (0: not sounding), and how many it needs. For the page to draw. */
      sounding: number;
      of: number;
      /** Finished calls whose wave has not walked in yet. */
      queued: number;
      /** Waves that have walked in so far (the next wave's row, and its ids). */
      sent: number;
    };
    /** On a person of an outpost while fighting: where a hero was last seen. */
    outpostFight?: { x: number; y: number } | null;
  }
  interface EventMap {
    'outpost-call-started': { by: string; outpost: string };
    'outpost-call-completed': { by: string; outpost: string };
    /** `why`: knocked-out, grabbed, signaler-broken, no-hero, or left-the-signaler (knocked away from it, not out). */
    'outpost-call-stopped': { by: string; outpost: string; why: string };
    /** A wave walked in at the outpost's entry: its row in the table and its people's entity ids. */
    'outpost-wave': { outpost: string; wave: number; row: number; people: string[] };
    'signaler-broken': { outpost: string; signaler: string; by: string | null };
  }
}

/** The outposts, in id order, so every machine does them in the same order. */
export function outposts(content: Content): Outpost[] {
  return Object.keys(content.outposts ?? {})
    .sort()
    .map((id) => content.outposts[id]!);
}

/** The outpost's post, with its state made if it has none yet. Undefined if the post is not in the world. */
export function postOf(world: World, op: Outpost): Entity | undefined {
  const post = findEntity(world, op.signaler);
  if (!post) return undefined;
  post.c.signaler ??= { hits: 0, broken: false, sounding: 0, of: 0, queued: 0, sent: 0 };
  return post;
}

/** The players' characters in the outpost's room. */
export function heroesIn(world: World, room: string): Entity[] {
  return world.entities.filter((e) => e.player !== null && e.room === room);
}

/**
 * The people of the room: bodies with an NPC kind, out cold or not.
 * INTENT: the post and the heroes are not people and never count against the bound.
 */
export function peopleIn(world: World, room: string): Entity[] {
  return world.entities.filter((e) => e.c.npc !== undefined && e.room === room && e.player === null);
}

/** Whether a body is one of this outpost's people: placed in its room, or walked in with a wave. */
export function ofOutpost(op: Outpost, e: Entity): boolean {
  return e.c.npc?.home === op.room && e.room === op.room && e.player === null;
}
