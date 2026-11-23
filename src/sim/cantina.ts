// The cantina's endless brawl (Step 11, D-083 to D-086): what the three
// cantina-* systems share. Writeup: docs/mechanisms/cantina.md. Pure, like
// the rest of src/sim. Not in a registry directory on purpose: a helper.
import type { Cantina } from '../content/kinds/cantina.ts';
import type { Content } from '../content/types.ts';
import type { Entity, World } from './types.ts';

declare module './types.ts' {
  interface Components {
    /**
     * On the one bodiless entity per cantina room, `~cantina:<room>`, made
     * where a world is made (populateRoom, src/sim/world.ts: the server's
     * makeWorld and a scenario with "placements"). INTENT: every cantina
     * system does nothing in a world without it, which is how a page's own
     * world (only its own character in it) never grows regulars or counts
     * a brawl a second time (docs/mechanisms/network.md).
     */
    cantina?: {
      /** Whether a brawl is on. */
      on: boolean;
      /** Ticks since a player last attacked in the room, while on. */
      quiet: number;
      /** Which pad the next body comes back on (an index into the cantina file's pads, wrapping). */
      pad: number;
      /** This brawl's count by player entity id: knock-outs (bodies it sent out) and falls (times it was out). Kept until the next brawl starts. */
      score: Record<string, { ko: number; falls: number }>;
    };
    /**
     * On every body in a cantina room while its brawl is on, players and
     * regulars alike; removed the tick the body leaves the room or the
     * brawl ends. Step 2's friend shares (attack.ts, impact-walls.ts,
     * impact-bodies.ts) read these first, and only for player on player:
     * outside a brawl a friend stays harmless (Step 2's rule).
     */
    brawl?: { attackLaunch: number; attackWear: number; throwWear: number };
    /** On a regular: where it is in its walking loop. */
    regular?: { step: number; ticks: number; stall: number; lastX: number };
  }
  interface EventMap {
    /** A player's hit on a regular started a brawl in `room`. */
    'cantina-brawl-start': { room: string; by: string };
    /** The brawl in `room` settled: nobody attacked for calmTime (`calm`), or no player is left in the room (`empty`). */
    'cantina-brawl-end': { room: string; why: 'calm' | 'empty' };
    /** `entity` went past the edge or was knocked flat in a brawl and is back on a pad. `by`: the body credited with sending it (null: nobody). */
    'cantina-out': { room: string; entity: string; player: string | null; by: string | null };
  }
}

/** INTENT: the same kind as THING_KIND (src/sim/npc/state.ts): physics and the drawers skip a kind that is not a character. Written out to keep world.ts free of an import cycle. */
const CANTINA_KIND = '~thing';

export const cantinaId = (room: string): string => `~cantina:${room}`;

/** INTENT: a contract once pushed (ids are never renamed): one regular per roster character, `cantina:<kind>`. */
export const regularId = (kind: string): string => `cantina:${kind}`;

export function isRegular(e: Entity): boolean {
  return e.player === null && e.id === regularId(e.kind);
}

/** The bodiless entity that makes a room's cantina run, as a new world starts with it. */
export function cantinaEntity(room: string): Entity {
  return { id: cantinaId(room), kind: CANTINA_KIND, player: null, room, x: 0, y: 0, vx: 0, vy: 0, facing: 1, onGround: true, c: { cantina: { on: false, quiet: 0, pad: 0, score: {} } } };
}

/** Every cantina this world runs: its file and its entity. Empty in a page's own world. */
export function cantinasOf(world: World, content: Content): { file: Cantina; e: Entity; state: NonNullable<Entity['c']['cantina']> }[] {
  const out: { file: Cantina; e: Entity; state: NonNullable<Entity['c']['cantina']> }[] = [];
  for (const id of Object.keys(content.cantina ?? {}).sort()) {
    const file = content.cantina[id]!;
    const e = world.entities.find((x) => x.id === cantinaId(file.room));
    if (e?.c.cantina) out.push({ file, e, state: e.c.cantina });
  }
  return out;
}

/** A body that fights and can be put out: anything with a character kind (not a bodiless thing). */
export function hasBody(content: Content, e: Entity): boolean {
  return content.characters[e.kind] !== undefined;
}

/** Top-left of a body of `kind` standing on the floor of pad `index` (wrapping). */
export function padSpot(content: Content, file: Cantina, index: number, kind: string): { x: number; y: number } {
  const room = content.rooms[file.room]!;
  const box = content.characters[kind]!.box;
  const [tx, ty] = file.pads[((index % file.pads.length) + file.pads.length) % file.pads.length]!;
  return { x: tx * room.tile + (room.tile - box.w) / 2, y: (ty + 1) * room.tile - box.h };
}

/** Whether a body's middle is outside the cantina's edge. */
export function pastEdge(content: Content, file: Cantina, e: Entity): boolean {
  const room = content.rooms[file.room]!;
  const box = content.characters[e.kind]!.box;
  const mx = e.x + box.w / 2;
  const my = e.y + box.h / 2;
  const [ex, ey] = file.edge.at;
  const [ew, eh] = file.edge.size;
  return mx < ex * room.tile || mx >= (ex + ew) * room.tile || my < ey * room.tile || my >= (ey + eh) * room.tile;
}
