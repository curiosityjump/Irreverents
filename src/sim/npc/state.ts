// NPC response logic: the shared shapes and small helpers of Step 4's
// systems (src/sim/systems/npc-*.ts). Writeup: docs/mechanisms/npc-response.md.
//
// INTENT (D-055, "NO NPCS WILL HAVE AI"): people are fixed states, explicit
// role/deed tables in content/rules/ and authored reactions. Call it NPC
// response logic, in code and in words.
import type { Mood, NpcKind } from '../../content/kinds/npcs.ts';
import type { PlacedThing, Placements } from '../../content/kinds/placements.ts';
import type { Content } from '../../content/types.ts';
import { TICK_RATE } from '../types.ts';
import type { Entity, Input, StepContext } from '../types.ts';
import { alertLevel } from './alert.ts';

declare module '../types.ts' {
  interface Components {
    /**
     * A person: present on a placed body whose placement names an `npc`.
     * INTENT: every bit of a person's state is here, on the entity, so the
     * server's generic replication carries it to every phone.
     */
    npc?: {
      /** The NPC kind id (content/npcs/). */
      kind: string;
      /** The placements file (a room id) this person was placed by; its entry holds their routine. */
      home: string;
      /** INTENT (D-048): 1, 2 or 3 and never anything else. Changed only by setMood(). */
      mood: Mood;
      /** How much unexpected behaviour this person has witnessed since they were last calm. */
      dissonance: number;
      /** Entity ids of those whose odd deeds this person witnessed, sorted. */
      offenders: string[];
      /** Mood 2: ticks since the last odd deed witnessed. */
      quiet: number;
      /** Mood 3: ticks with no offender in sight and nothing odd witnessed. */
      cool: number;
      /** Where an offender was last seen (the middle of their body), or null. */
      lastSeen: { x: number; y: number } | null;
      /** The routine: which step, how many ticks into it, and how long a walk has made no headway. */
      step: number;
      stepTicks: number;
      stall: number;
      /** What they are saying over their head right now, or null. */
      bark: { text: string; ticksLeft: number } | null;
    };
    /** A bodiless thing from a placements file's `things` (a counter, goods). */
    thing?: {
      /** The entity id of whoever took it, or null while it is still there. */
      takenBy: string | null;
    };
    /** On a player's character: whether `interact` was held last tick, to see a fresh press. */
    interact?: { held: boolean };
  }
  interface EventMap {
    /**
     * Someone did a deed through Step 4's own code (a routine's `do` step,
     * a hero using a thing). Raw: the witness pass turns it into `deed`.
     */
    did: { deed: string; by: string; target: string | null; thing: string | null };
    /**
     * A deed happened, with everyone who perceived it. `by` and `target`
     * are entity ids; `player` is the player id of `by` (null for a person);
     * x,y is the middle of the doer's body. No witnesses: nobody knows.
     */
    deed: { deed: string; by: string; player: string | null; target: string | null; thing: string | null; room: string; x: number; y: number; witnesses: string[] };
    /** A person's mood changed. `cause` is "odd:<deed>", "expected:<deed>", "faded" or "cooled". */
    'mood-changed': { entity: string; from: Mood; to: Mood; cause: string; offender: string | null };
    /** A distressed person saw the offender do something expected and calmed at once (D-072). */
    reassured: { entity: string; by: string; deed: string };
    /** A person in business as usual happily opposed an expected deed (D-049). */
    opposed: { entity: string; target: string; deed: string };
  }
}

/**
 * INTENT: the `kind` of a bodiless thing's entity. It is not a valid
 * content id on purpose ("~"), so no character kind can ever have it and
 * physics and the entity drawer, which skip unknown kinds, leave things be.
 */
export const THING_KIND = '~thing';

export const seconds = (s: number): number => Math.max(1, Math.round(s * TICK_RATE));

/** Out cold is Step 2's `c.flattened`, present exactly while a body is out. */
export function isOut(e: Entity): boolean {
  return (e.c as { flattened?: unknown }).flattened !== undefined;
}

/** The middle of a body (or of a thing's tile), in pixels. */
export function centre(content: Content, e: Entity): { x: number; y: number } {
  const box = content.characters[e.kind]?.box;
  if (box) return { x: e.x + box.w / 2, y: e.y + box.h / 2 };
  const tile = content.rooms[e.room]?.tile ?? 0;
  return { x: e.x + tile / 2, y: e.y + tile / 2 };
}

export function npcKind(content: Content, e: Entity): NpcKind | undefined {
  return e.c.npc ? content.npcs[e.c.npc.kind] : undefined;
}

export function placementOf(content: Content, e: Entity): Placements['place'][number] | undefined {
  return e.c.npc ? content.placements[e.c.npc.home]?.place.find((p) => p.id === e.id) : undefined;
}

export function thingDef(content: Content, e: Entity): PlacedThing | undefined {
  return content.placements[e.room]?.things?.find((t) => t.id === e.id);
}

/** Starts a bark over a person's head, if their kind has words for the cue. */
export function bark(ctx: StepContext, e: Entity, cue: string): void {
  const text = npcKind(ctx.content, e)?.barks[cue];
  if (text && e.c.npc) e.c.npc.bark = { text, ticksLeft: seconds(ctx.content.tuning.world.npcBarkTime!) };
}

/**
 * The one place a mood changes.
 * INTENT (D-048): `to` is typed 1 | 2 | 3; there is no fourth mood.
 */
export function setMood(ctx: StepContext, e: Entity, to: Mood, cause: string): void {
  const n = e.c.npc;
  if (!n || n.mood === to) return;
  const from = n.mood;
  n.mood = to;
  ctx.emit('mood-changed', { entity: e.id, from, to, cause, offender: n.offenders[0] ?? null });
  n.quiet = 0;
  n.cool = 0;
  if (to === 1) {
    n.dissonance = 0;
    n.offenders = [];
    n.lastSeen = null;
    // Back to work from the top, so a routine that begins by walking to a post returns them to it.
    n.step = 0;
    n.stepTicks = 0;
    n.stall = 0;
  } else if (to === 3) bark(ctx, e, 'rage');
  else if (from === 1) bark(ctx, e, 'distress');
}

/**
 * Whether a raging person's cool-down may finish this tick.
 * HOOK for slice 2 (the area alert): add "and this area's alert is 0" here
 * (D-074: once the alert is below the violent level, ordinary behaviour
 * reassures again). Today nothing else holds rage up.
 */
export function rageMayCool(ctx: StepContext, e: Entity): boolean {
  // INTENT (D-073, slice 2): a good person's rage ends only below the violent level, which is any alert above 0.
  // Their area is the room they are in, and the one they were placed in if a chase has led them out of it (D-077).
  return npcKind(ctx.content, e)?.side !== 'good' || (alertLevel(ctx.world, e.room) === 0 && alertLevel(ctx.world, e.c.npc?.home ?? e.room) === 0);
}

/**
 * Hands a body the input its person wants this tick. Step 4 never moves a
 * body itself: the body's own verbs act on this exactly as on a player's
 * device (docs/architecture.md, "Bodies").
 */
export function drive(e: Entity, input: Input): void {
  e.c.input = { x: input.x, y: input.y, held: [...input.held] };
}
