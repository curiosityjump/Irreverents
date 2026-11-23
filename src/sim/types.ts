// The simulation core's shared shapes. Plain TypeScript: no DOM, no Node
// APIs, nothing random, no clock. The same code runs on the server, in the
// browser and in the scenario harness (docs/architecture.md).
import type { Content } from '../content/types.ts';

/** DRAFT: 60 simulation ticks per second (Step 1 lead's call). */
export const TICK_RATE = 60;
/** Seconds per tick. Tuning numbers are per second; multiply by DT. */
export const DT = 1 / TICK_RATE;

/**
 * What one player is asking for on one tick. The keyboard, the touch layout
 * and scenario files all produce exactly this.
 * INTENT: additive only. `held` is a list of action ids (content/actions/),
 * so a new action needs no change here.
 */
export interface Input {
  /** The stick: -1 (left) to 1 (right). */
  x: number;
  /** The stick: -1 (up) to 1 (down). */
  y: number;
  /** Ids of the actions held down this tick. */
  held: string[];
  /**
   * Step 11 (docs/mechanisms/cantina.md): the newest tap on the game view,
   * if any: `x`,`y` in room pixels, or `slot` (a party index) when it
   * landed on the cantina's party row. `n` grows by one per tap, so a tap
   * repeated across several ticks' inputs is acted on once. DRAFT.
   */
  tap?: { x: number; y: number; n: number; slot?: number };
}

/**
 * Per-entity state owned by one verb or system, keyed by that verb's or
 * system's id.
 * INTENT: empty here on purpose. A verb or system that needs to remember
 * something adds its own field from its own file (declaration merging; see
 * src/sim/verbs/jump.ts), so no two steps edit this interface.
 */
export interface Components {}

/** Anything with a body in the world: a player's character now; NPCs and objects later. */
export interface Entity {
  /** Unique in the world. Players are "p:<player id>". */
  id: string;
  /** A character kind id (content/characters/). */
  kind: string;
  /** The player whose input drives this entity, or null. */
  player: string | null;
  /** The room this entity is in (content/rooms/). */
  room: string;
  /** Top-left of the collision box, in pixels. */
  x: number;
  y: number;
  /** Pixels per second. */
  vx: number;
  vy: number;
  facing: 1 | -1;
  onGround: boolean;
  c: Components;
}

/**
 * The whole simulated state: plain JSON-serialisable data and nothing else.
 * INTENT: additive only once pushed (docs/architecture.md, "Changing a
 * shared contract"). `entities` is kept sorted by id so the order things
 * happen in never depends on who arrived first.
 */
export interface World {
  /** How many steps have run. */
  tick: number;
  entities: Entity[];
  /**
   * What has changed in a room while the game runs, by room id. Absent
   * until something changes. Read and written through src/sim/room-state.ts
   * (Step 3); never reset when a room empties (D-077).
   */
  rooms?: Record<string, RoomState>;
  /**
   * Step 11: the party as it stands in this world, after a cantina swap
   * (docs/mechanisms/cantina.md); absent until the first swap, which means
   * content.party.members. Written only by the server's world (a page takes
   * it by key with every snapshot).
   */
  party?: string[];
}

/** One room's run-time state. Plain JSON, like the rest of the World. */
export interface RoomState {
  /** Tile codes (TILE) that replace the room file's, by cell index (ty * room.w + tx). How a closed gate is solid and an open one is not. */
  tiles: Record<number, number>;
  /** Whatever each placed part remembers, by part id; owned by the system that declares the part's kind. */
  parts: Record<string, Record<string, number | boolean | string>>;
}

/**
 * The events step() can return, by type.
 * INTENT: empty here on purpose; each event is declared beside the code
 * that emits it (declaration merging), e.g. `landed` in systems/physics.ts.
 */
export interface EventMap {}

export type SimEvent = {
  [K in keyof EventMap]: { type: K; tick: number } & EventMap[K];
}[keyof EventMap];

/** A tuning number a verb or system reads, with the range that keeps the simulation sound. */
export interface TuningRule {
  min: number;
  max: number;
  what: string;
}

export interface StepContext {
  world: World;
  /** By player id. A player with no entry is holding nothing. */
  inputs: Record<string, Input>;
  content: Content;
  /** This tick's events so far, oldest first. Read-only: add one with emit(). (Step 4: its witness pass reads other steps' events.) */
  events: readonly SimEvent[];
  emit<K extends keyof EventMap>(type: K, data: EventMap[K]): void;
}

/**
 * One pass over the world per tick. A file in src/sim/systems/
 * default-exports one of these and is picked up automatically.
 */
export interface System {
  id: string;
  /** Systems run in ascending order (ties by id). Leave gaps. */
  order: number;
  /** Numbers this system reads from content/tuning.json "world". */
  tuning?: Record<string, TuningRule>;
  /**
   * Kinds of working part (a room file's "parts") this system drives, by
   * kind name. Declaring a kind here is what makes it a known kind
   * (src/sim/check-rooms.ts); see docs/architecture.md, "a kind of working part".
   */
  parts?: Record<string, PartRule>;
  run(ctx: StepContext): void;
}

/** A kind of working part, declared by the system that drives it. */
export interface PartRule {
  /** What this kind of part is, in a few words (shown when a room names an unknown kind). */
  what: string;
  /**
   * True when a part of this kind can stand in the way (a shut gate, an
   * unbroken wall). The way-out check then counts its tiles as solid
   * throughout: pessimistic, so "there is a way out" never leans on a part
   * being open.
   */
  blocks?: boolean;
  /** Reports what is wrong with one placed part's parameters or tiles. `part` and `room` are the content's Part and Room. */
  check?(part: { id: string; kind: string; tiles: { tx: number; ty: number }[]; params: Record<string, unknown> }, room: { id: string; w: number; h: number }, fail: (message: string) => void): void;
}

/**
 * One thing a character can do. A file in src/sim/verbs/ default-exports
 * one of these and is picked up automatically; a character can do it once
 * its content file lists the verb's id.
 */
export interface Verb {
  id: string;
  /** Verbs run in ascending order on each entity (ties by id). Leave gaps. */
  order: number;
  /** Numbers this verb reads from the character's set in content/tuning.json "characters". */
  tuning?: Record<string, TuningRule>;
  /** Action ids (content/actions/) this verb reads from Input.held. */
  actions?: string[];
  update(ctx: StepContext, entity: Entity, input: Input, tuning: Record<string, number>): void;
}
