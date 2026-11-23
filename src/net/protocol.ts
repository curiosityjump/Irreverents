// The network layer's messages (docs/mechanisms/network.md). Pure: shared by
// the server, the browser and the headless check.
//
// DRAFT: JSON text over one WebSocket at /ws. No binary format, no delta
// compression; reconsider when a world holds many entities.
//
// INTENT: nothing here names a kind of entity, a verb or a component. A
// page reports its whole character (an Entity) and the server sends the
// whole World, so a later step that adds an NPC, an object or a component
// writes no network code (docs/plan/step-1.md, "What's decided").
import type { Effect } from '../sim/effects.ts';
import type { Entity, Input, SimEvent, World } from '../sim/types.ts';

declare module '../sim/types.ts' {
  interface Components {
    /** Set by the server on a player's character: which player of this world they are, in join order (picks the graybox colour). */
    net?: {
      slot: number;
      /** Step 5 (additive): true while this player's page is not there (its socket closed, or nothing heard from it for a moment). The others draw the character as away. */
      away?: boolean;
    };
  }
}

/** The world everyone who opens the address shares; `?room=<name>` picks another. */
export const DEFAULT_WORLD = 'main';

export type ClientMessage =
  /** First message on every socket. `fresh`: this page has not played yet, so the server may place it. */
  | { t: 'join'; player: string; world: string; e: Entity; fresh: boolean }
  /**
   * The page's own character after its latest tick, its own tick count, and
   * what it was holding: `is` has one Input per simulation tick since the
   * last report, oldest first, so a tap shorter than a report is neither
   * lost nor seen twice; `i` is the newest of them.
   */
  | { t: 'me'; e: Entity; i: Input; is?: Input[]; ct: number }
  /** "I applied effect `id`" (the server resends an effect until it hears this). */
  | { t: 'ack'; id: number }
  | { t: 'ping'; n: number }
  /** Leaving on purpose (tab closed, a scripted client done): remove my character now. */
  | { t: 'bye' };

export type ServerMessage =
  | { t: 'welcome'; commit: string; startedAt: string; player: string; e: Entity; tick: number }
  /** The whole world. `stamps`: for a character a page owns, that page's own tick count when it reported it. `ev`: the simulation's events since the last snapshot. */
  | { t: 'snap'; w: World; stamps: Record<string, number>; ev: SimEvent[] }
  /**
   * An effect on this page's own character (src/sim/effects.ts), numbered,
   * with the server's copy of the character just after it. Resent until acknowledged.
   */
  | { t: 'fx'; id: number; effect: Effect; e: Entity }
  | { t: 'pong'; n: number };

export function playerEntityId(player: string): string {
  return `p:${player}`;
}

export function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/** Whether something that arrived over the wire can be used as an Entity at all. */
export function looksLikeEntity(value: unknown): value is Entity {
  if (typeof value !== 'object' || value === null) return false;
  const e = value as Record<string, unknown>;
  return (
    ['x', 'y', 'vx', 'vy'].every((k) => typeof e[k] === 'number' && Number.isFinite(e[k] as number)) &&
    typeof e.kind === 'string' &&
    typeof e.room === 'string' &&
    typeof e.c === 'object' &&
    e.c !== null
  );
}
