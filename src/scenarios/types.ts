// Scenarios: a scripted play-through as data, with the facts expected of it.
// Pure (no DOM, no Node): reading files is scripts/lib/scenario-files.ts.
// Format and fact vocabulary: docs/mechanisms/scenarios.md.
import type { Content } from '../content/types.ts';
import type { SimEvent, World } from '../sim/types.ts';

/** Holds the stick and/or some actions for a span of ticks: from (inclusive) to (exclusive). */
export interface InputSpan {
  player: string;
  from: number;
  to: number;
  x?: number;
  y?: number;
  hold?: string[];
}

export interface Scenario {
  id: string;
  /** Which of the design library's build gates (A-F) this scenario is evidence for, if any. */
  gate: string | null;
  /** What this scenario proves, in a sentence. */
  proves: string;
  room: string;
  players: { id: string; character: string; spawn: number }[];
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
