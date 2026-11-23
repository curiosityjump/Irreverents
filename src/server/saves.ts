// Games that are kept (Step 17, docs/mechanisms/saves.md): a world named
// `game-<CODE>` is saved to the store (src/server/store.ts) while people play
// it and when the last one leaves, and is built from that save the next time
// anyone joins it, after a deploy or a restart too.
//
// Server code only: the simulation never sees the store. Like the rest of
// the network layer, nothing here names a kind of entity, a verb or a
// component: a save is the whole World with the players taken out.
import fs from 'node:fs';
import path from 'node:path';
import type { Content } from '../content/types.ts';
import { clone } from '../net/protocol.ts';
import type { Room } from '../content/kinds/rooms.ts';
import type { RoomState, World } from '../sim/types.ts';
import { populateRoom, removeEntity } from '../sim/world.ts';
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
  /** Every content room this build had when it saved. Kept for the record; loading no longer depends on it. */
  rooms: string[];
  /** The World with every player's character taken out (they are put back as they join). */
  world: World;
  /**
   * Hardening (additive): each content room's shape when saved, so a later
   * build that edited a room can tell (its tile overrides are by cell
   * index). Absent in records written before it.
   */
  shapes?: Record<string, RoomShape>;
  /**
   * Hardening (additive): ids of content placements that were not in the
   * world when saved, so loading (which places every room's placements
   * again, to bring in what later builds added) never brings back a
   * placed body that left the world for good. Absent in older records.
   */
  removed?: string[];
}

/** A room as a save saw it: its width and height, a fingerprint of its cells and parts, and each part's own tiles. */
export interface RoomShape {
  w: number;
  h: number;
  sig: string;
  parts: Record<string, string>;
}

const collectionName = (code: string): string => `save-${code.toLowerCase()}`;

/** FNV-1a, 32 bits, as hex: enough to tell that a room file changed. */
function fingerprint(text: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}
const partSig = (p: Room['parts'][number]): string => `${p.kind}|${p.tiles.map((t) => `${t.tx},${t.ty}`).join(' ')}`;
function shapeOf(room: Room): RoomShape {
  const parts: Record<string, string> = {};
  for (const p of room.parts) parts[p.id] = partSig(p);
  return { w: room.w, h: room.h, sig: fingerprint(JSON.stringify([room.w, room.h, room.cells, room.parts.map((p) => [p.id, partSig(p)])])), parts };
}

export type Loaded = { world: World } | { newer: number } | null;

export interface Saves {
  /** Whether a game with this code has a save. */
  has(code: string): boolean;
  /** When the game's save was written (ISO time), or null when it has none. */
  savedAt(code: string): string | null;
  /**
   * The saved world of a game, fitted to this build's content, or null when
   * there is none (a new game), or `{ newer }` when the record is a version
   * this build does not know (never loaded, never written over). Never
   * throws: what no longer fits is dropped and said once through `problem`.
   */
  load(code: string): Loaded;
  /** Keep this world as the game's save (its players are left out). Never throws; never writes over a newer version's record. */
  save(code: string, world: World): void;
  /** How many games have a save (for /healthz: a count, never the codes). */
  count(): number;
}

export interface SavesOptions {
  content: Content;
  commit: string;
  /** Said once per load that had to drop something (it goes to /debug/errors). */
  problem: (message: string) => void;
}

export function createSaves(store: Store, opts: SavesOptions): Saves {
  const { content } = opts;
  // INTENT: asking about a code that has no save opens nothing: a store
  // collection, once opened, is listed until a restart, so every guessed
  // code would otherwise leave an entry behind (the review's item 7).
  const exists = (name: string): boolean => {
    if (Object.prototype.hasOwnProperty.call(store.status().collections, name)) return true;
    if (!store.dir) return false;
    try {
      return fs.existsSync(path.join(store.dir, `${name}.json`));
    } catch {
      return false;
    }
  };
  const latest = (code: string): SaveRecord | undefined => {
    if (!exists(collectionName(code))) return undefined;
    const records = store.collection<SaveRecord>(collectionName(code)).all();
    return records[records.length - 1];
  };
  return {
    savedAt(code) {
      if (!isGameCode(code)) return null;
      const at = latest(code)?.savedAt;
      return typeof at === 'string' ? at : null;
    },
    has(code) {
      if (!isGameCode(code)) return false;
      return latest(code) !== undefined;
    },
    load(code) {
      if (!isGameCode(code)) return null;
      const rec = latest(code);
      if (!rec || typeof rec !== 'object' || !rec.world || !Array.isArray(rec.world.entities)) return null;
      // INTENT: a record from a newer build is never read as if this build
      // understood it, and never written over (as store.ts does for its files).
      if (typeof rec.version === 'number' && rec.version > SAVE_VERSION) return { newer: rec.version };
      // Every top-level field of the World is kept, not a list of names
      // (docs/mechanisms/network.md: whatever a later step adds there travels).
      const { tick, entities, rooms, ...rest } = rec.world;
      const world: World = { ...rest, tick: Number.isFinite(tick) ? tick : 0, entities: [] };
      // INTENT: a save that no longer fits the content after a deploy (a
      // room or a kind gone) drops what doesn't fit and loads the rest. It
      // never refuses to load: that is what keeps the owner's game alive
      // across every push. A kind starting with `~` is a bodiless thing
      // (src/sim/npc/state.ts, src/sim/cantina.ts), not a character.
      const said: string[] = [];
      const dropped: string[] = [];
      for (const e of entities) {
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
      if (dropped.length > 0) said.push(`${dropped.length} bod${dropped.length === 1 ? 'y' : 'ies'} (${[...new Set(dropped)].slice(0, 8).join(', ')}) whose room or kind this build no longer has`);

      // Room state. Tile overrides are by cell index (room-state.ts), so a room
      // edited since the save would put them in the wrong places: invisible
      // walls, gates that do not block. Every override is laid by a part
      // (room-parts.ts, setPartSolid), so in a changed room each part whose
      // own tiles are unchanged keeps its state and its overrides, moved to
      // the same (x, y) in the new grid; the rest of that room's state goes.
      const goneRooms: string[] = [];
      const changed: string[] = [];
      for (const [roomId, raw] of Object.entries(rooms ?? {})) {
        const room = content.rooms[roomId];
        if (!room) {
          goneRooms.push(roomId);
          continue;
        }
        const state = raw as RoomState;
        const was = rec.shapes?.[roomId];
        if (!was || was.sig === shapeOf(room).sig) {
          // Same room (or a record from before shapes, which the builds since were read with as-is).
          (world.rooms ??= {})[roomId] = state;
          continue;
        }
        changed.push(roomId);
        const kept: RoomState = { tiles: {}, parts: {} };
        const now = shapeOf(room).parts;
        const keepParts = room.parts.filter((p) => was.parts[p.id] !== undefined && was.parts[p.id] === now[p.id]);
        for (const p of keepParts) if (state.parts?.[p.id]) kept.parts[p.id] = state.parts[p.id]!;
        const cells = new Set(keepParts.flatMap((p) => p.tiles.map((t) => `${t.tx},${t.ty}`)));
        for (const [index, code] of Object.entries(state.tiles ?? {})) {
          const i = Number(index);
          const tx = i % was.w;
          const ty = Math.floor(i / was.w);
          if (cells.has(`${tx},${ty}`)) kept.tiles[ty * room.w + tx] = code;
        }
        (world.rooms ??= {})[roomId] = kept;
      }
      if (goneRooms.length > 0) said.push(`the state of ${goneRooms.length} room(s) this build no longer has (${goneRooms.slice(0, 8).join(', ')})`);
      if (changed.length > 0) said.push(`what was done in ${changed.length} room(s) changed since (${changed.slice(0, 8).join(', ')}), except parts that did not move`);

      // INTENT: every room's placements are placed again: populateRoom skips
      // an id already in the world, so what a later build added appears and
      // what was moved stays where it was. What left the world for good
      // (`removed`) is taken out again, never brought back.
      for (const roomId of Object.keys(content.rooms)) populateRoom(world, content, roomId);
      for (const id of Array.isArray(rec.removed) ? rec.removed : []) if (typeof id === 'string') removeEntity(world, id);

      // INTENT (src/server/errors.ts): no personal data, so not the code either.
      if (said.length > 0) opts.problem(`a saved game written by ${String(rec.commit).slice(0, 12)} was loaded without ${said.join('; and without ')}`);
      return { world };
    },
    count() {
      const names = new Set<string>();
      for (const [name, size] of Object.entries(store.status().collections)) if (name.startsWith('save-') && size > 0) names.add(name);
      if (store.dir) {
        try {
          for (const f of fs.readdirSync(store.dir)) if (/^save-[a-z]+\.json$/.test(f)) names.add(f.slice(0, -'.json'.length));
        } catch {
          // an unreadable directory is the store's to report
        }
      }
      return names.size;
    },
    save(code, world) {
      if (!isGameCode(code)) return;
      try {
        const old = latest(code);
        if (old && typeof old.version === 'number' && old.version > SAVE_VERSION) return; // a newer build's record: never written over
        const w = clone(world);
        // INTENT: player characters are never saved. They are put back as
        // their players join; one loaded from a save would stand there for ever.
        w.entities = w.entities.filter((e) => e.player === null);
        const here = new Set(w.entities.map((e) => e.id));
        const removed: string[] = [];
        for (const roomId of Object.keys(content.placements ?? {})) for (const p of content.placements[roomId]!.place) if (!here.has(p.id)) removed.push(p.id);
        const shapes: Record<string, RoomShape> = {};
        for (const [id, room] of Object.entries(content.rooms)) shapes[id] = shapeOf(room);
        const record: SaveRecord = { version: SAVE_VERSION, code, savedAt: new Date().toISOString(), commit: opts.commit, rooms: Object.keys(content.rooms), world: w, shapes, removed };
        store.collection<SaveRecord>(collectionName(code)).replaceAll([record]);
      } catch (err) {
        opts.problem(`a game could not be saved (${err instanceof Error ? err.message : String(err)})`);
      }
    },
  };
}
