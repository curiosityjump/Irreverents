// Games that are kept (Step 17, docs/mechanisms/saves.md): a world named
// `game-<CODE>` is saved to the store (src/server/store.ts) while people play
// it and when the last one leaves, and is built from that save the next time
// anyone joins it, after a deploy or a restart too.
//
// Server code only: the simulation never sees the store. Like the rest of
// the network layer, nothing here names a kind of entity, a verb or a
// component: a save is the whole World with the players taken out.
import type { Content } from '../content/types.ts';
import { clone } from '../net/protocol.ts';
import type { World } from '../sim/types.ts';
import type { Store } from './store.ts';
import { gameCode, GAME_PREFIX, isGameCode } from '../net/game-code.ts';

// The code's rules are shared with the page (src/net/game-code.ts).
export { gameCode, GAME_PREFIX, isGameCode };

/** DRAFT: how often a game is saved while anyone is in it (it is also saved when the last player leaves, and when the server is stopped). */
export const SAVE_EVERY_MS = 30_000;
/** The record's own version. INTENT: additive only, like the store's file. */
export const SAVE_VERSION = 1;

/**
 * What one game's collection (`save-<code in lower case>`) holds: exactly
 * one of these. INTENT: a contract once written to the live volume (a
 * deploy loads what the previous build wrote): add fields, never rename or
 * remove one.
 */
export interface SaveRecord {
  version: number;
  /** The game's code, upper case. */
  code: string;
  /** When it was written (ISO time). */
  savedAt: string;
  /** The commit of the server that wrote it. */
  commit: string;
  /** Every content room this build had when it saved. A room added by a later build is populated as new; one listed here is not (what was done to it stays done). */
  rooms: string[];
  /** The World with every player's character taken out (they are put back as they join). */
  world: World;
}

const collectionName = (code: string): string => `save-${code.toLowerCase()}`;

export interface Saves {
  /** Whether a game with this code has a save. */
  has(code: string): boolean;
  /**
   * The saved world of a game, fitted to this build's content (with the
   * rooms the save never knew, to be populated as new), or null when
   * there is none (a new game). Never throws and never refuses: what no
   * longer fits is dropped and said once through `problem`.
   */
  load(code: string): { world: World; newRooms: string[] } | null;
  /** Keep this world as the game's save (its players are left out). Never throws. */
  save(code: string, world: World): void;
}

export interface SavesOptions {
  content: Content;
  commit: string;
  /** Said once per load that had to drop something (it goes to /debug/errors). */
  problem: (message: string) => void;
}

export function createSaves(store: Store, opts: SavesOptions): Saves {
  const { content } = opts;
  return {
    has(code) {
      if (!isGameCode(code)) return false;
      return store.collection<SaveRecord>(collectionName(code)).all().length > 0;
    },
    load(code) {
      if (!isGameCode(code)) return null;
      const records = store.collection<SaveRecord>(collectionName(code)).all();
      const rec = records[records.length - 1];
      if (!rec || typeof rec !== 'object' || !rec.world || !Array.isArray(rec.world.entities)) return null;
      const world: World = { tick: Number.isFinite(rec.world.tick) ? rec.world.tick : 0, entities: [] };
      // INTENT: a save that no longer fits the content after a deploy (a
      // room or a kind gone) drops what doesn't fit and loads the rest. It
      // never refuses to load: that is what keeps the owner's game alive
      // across every push. A kind starting with `~` is a bodiless thing
      // (src/sim/npc/state.ts, src/sim/cantina.ts), not a character.
      const dropped: string[] = [];
      for (const e of rec.world.entities) {
        if (!e || typeof e !== 'object' || typeof e.id !== 'string') continue;
        if (e.player !== null) continue; // never saved; an old record that had one is not trusted with it
        const kindKnown = typeof e.kind === 'string' && (e.kind.startsWith('~') || !!content.characters[e.kind]);
        if (!content.rooms[e.room] || !kindKnown) {
          dropped.push(`${e.kind} in ${e.room}`);
          continue;
        }
        world.entities.push(e);
      }
      world.entities.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
      const goneRooms: string[] = [];
      if (rec.world.rooms && typeof rec.world.rooms === 'object') {
        for (const [roomId, state] of Object.entries(rec.world.rooms)) {
          if (content.rooms[roomId]) (world.rooms ??= {})[roomId] = state;
          else goneRooms.push(roomId);
        }
      }
      if (dropped.length > 0 || goneRooms.length > 0) {
        // INTENT (src/server/errors.ts): no personal data, so not the code either.
        const parts: string[] = [];
        if (dropped.length > 0) parts.push(`${dropped.length} bod${dropped.length === 1 ? 'y' : 'ies'} (${[...new Set(dropped)].slice(0, 8).join(', ')})`);
        if (goneRooms.length > 0) parts.push(`the state of ${goneRooms.length} room(s) (${goneRooms.slice(0, 8).join(', ')})`);
        opts.problem(`a saved game written by ${String(rec.commit).slice(0, 12)} was loaded without ${parts.join(' and ')} that this build no longer has`);
      }
      // Rooms this build has that the save never knew are populated as new.
      const known = new Set(Array.isArray(rec.rooms) ? rec.rooms : Object.keys(content.rooms));
      return { world, newRooms: Object.keys(content.rooms).filter((r) => !known.has(r)) };
    },
    save(code, world) {
      if (!isGameCode(code)) return;
      try {
        const w = clone(world);
        // INTENT: player characters are never saved. They are put back as
        // their players join; one loaded from a save would stand there for ever.
        w.entities = w.entities.filter((e) => e.player === null);
        const record: SaveRecord = { version: SAVE_VERSION, code, savedAt: new Date().toISOString(), commit: opts.commit, rooms: Object.keys(content.rooms), world: w };
        store.collection<SaveRecord>(collectionName(code)).replaceAll([record]);
      } catch (err) {
        opts.problem(`a game could not be saved (${err instanceof Error ? err.message : String(err)})`);
      }
    },
  };
}
