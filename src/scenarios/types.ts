// Scenarios: a scripted play-through as data, with the facts expected of it.
// Pure (no DOM, no Node): reading files is scripts/lib/scenario-files.ts.
// Format and fact vocabulary: docs/mechanisms/scenarios.md.
import type { Content } from '../content/types.ts';
import type { SimEvent, World } from '../sim/types.ts';

/** Holds the stick and/or some actions for a span of ticks: from (inclusive) to (exclusive). */
export interface InputSpan {
  /** The player's id; empty text when the span drives `entity` instead. */
  player: string;
  /** One of the scenario's `entities`: the span is written to its entity.c.input, as an NPC system would. */
  entity?: string;
  from: number;
  to: number;
  x?: number;
  y?: number;
  hold?: string[];
  /** Step 11: a tap on the game view (Input.tap): `at` an entity id (its middle, each tick), or `x`,`y` room pixels, or `slot`. */
  tap?: { n: number; at?: string; x?: number; y?: number; slot?: number };
}

export interface Scenario {
  id: string;
  /** Which of the design library's build gates (A-F) this scenario is evidence for, if any. */
  gate: string | null;
  /** What this scenario proves, in a sentence. */
  proves: string;
  room: string;
  /** `character` left out: the player gets the first party member nobody is playing, as a new player does. */
  /** `room`: where this player starts; left out, the scenario's `room` (Step 3). */
  /** `joins`: the tick this player is put in the world (Step 11); left out, before tick 0. */
  /** `power` (Step 9): the player starts holding this power (content/powers/), as if taken before tick 0. */
  players: { id: string; character?: string; spawn: number; room?: string; joins?: number; power?: string }[];
  /** Bodies nobody plays, put in the room before tick 0. Their entity id is `id`. */
  /** `room`: which room the body is put in; left out, the scenario's `room` (Step 3). */
  entities?: { id: string; character: string; tile: [number, number]; vx?: number; vy?: number; room?: string }[];
  /** Tiles changed before tick 0, as a working part would change them while the game runs (src/sim/room-state.ts): `is` is a TILE code (Step 3). */
  tiles?: { room: string; tile: [number, number]; is: number }[];
  /** True: the room's own placements (content/placements/<room>.json) are put in the world too. */
  placements?: boolean;
  /** Step 11: more rooms whose own placements are put in the world too (populateRoom), as the server's world has every room's. */
  placedRooms?: string[];
  inputs: InputSpan[];
  /** How many ticks to run. */
  ticks: number;
  /** The facts expected. Each has a `fact` naming a file in src/scenarios/facts/. */
  expect: Record<string, unknown>[];
}

/** What a fact gets to look at. history[t] is the world when world.tick === t (history[0] is the start). */
export interface Recording {
  scenario: Scenario;
  content: Content;
  history: World[];
  events: SimEvent[];
}

/**
 * One kind of expectation. A file in src/scenarios/facts/ default-exports
 * one of these and is picked up automatically.
 */
export interface Fact {
  /** The value of "fact" in a scenario file. */
  id: string;
  /** Problems with how the scenario wrote this fact (wrong field, unknown player...). Empty when fine. */
  validate(spec: Record<string, unknown>, scenario: Scenario, content: Content): string[];
  /** Null when the fact holds; otherwise what was true instead. */
  test(spec: Record<string, unknown>, rec: Recording): string | null;
}
