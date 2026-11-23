// What the kinds of working part (src/sim/systems/room-<kind>.ts) share:
// finding the placed parts of a kind, asking which bodies are in a part's
// tiles, and breaking a breakable. A helper beside the registry directory,
// like room-state.ts. docs/mechanisms/rooms-and-doors.md, "Working parts".
import { TILE } from '../content/kinds/rooms.ts';
import type { Part, Room } from '../content/kinds/rooms.ts';
import type { Content } from '../content/types.ts';
import { partState, setTile } from './room-state.ts';
import type { Entity, StepContext, World } from './types.ts';

declare module './types.ts' {
  interface EventMap {
    /**
     * A breakable part gave way: its tiles are open from now on. `by` is the
     * entity that went through it (or that a system named), `player` that
     * entity's player or null, `speed` how fast it hit (0 when a system broke
     * it without a body), `look` the part's `params.look` ("wall" or "window").
     */
    'part-broken': { room: string; part: string; by: string | null; player: string | null; speed: number; look: string };
  }
}

/**
 * Every placed part of one kind, room by room.
 * INTENT: rooms in id order and parts in file order, so every device visits
 * them in the same order (determinism).
 */
export function partsOfKind(content: Content, kind: string): { room: Room; part: Part }[] {
  // Content never changes while the game runs, and this is asked several
  // times a tick: the answer is kept per content object (not world state).
  let byKind = found.get(content.rooms);
  if (!byKind) found.set(content.rooms, (byKind = new Map()));
  let out = byKind.get(kind);
  if (out) return out;
  out = [];
  for (const id of Object.keys(content.rooms).sort()) {
    const room = content.rooms[id]!;
    for (const part of room.parts) if (part.kind === kind) out.push({ room, part });
  }
  byKind.set(kind, out);
  return out;
}
const found = new WeakMap<object, Map<string, { room: Room; part: Part }[]>>();

/** Whether a body's box overlaps any of the part's tiles. */
export function inPart(content: Content, e: Entity, room: Room, part: Part): boolean {
  const box = content.characters[e.kind]?.box;
  if (!box || e.room !== room.id) return false;
  const T = room.tile;
  return part.tiles.some((t) => e.x < (t.tx + 1) * T && e.x + box.w > t.tx * T && e.y < (t.ty + 1) * T && e.y + box.h > t.ty * T);
}

/** Makes every tile of a part solid, or gives them back to the room file (open). */
export function setPartSolid(world: World, room: Room, part: Part, solid: boolean): void {
  for (const t of part.tiles) setTile(world, room, t.tx, t.ty, solid ? TILE.solid : null);
}

/** The kind name of a breakable part (src/sim/systems/room-breakable.ts). */
export const BREAKABLE = 'breakable';

/** Breaks one breakable part for good and says so. Does nothing if it is already broken. */
export function breakPart(ctx: StepContext, room: Room, part: Part, by: Entity | null, speed: number): void {
  const s = partState(ctx.world, room.id, part.id);
  if (s.broken) return;
  s.broken = true;
  s.ready = true;
  setPartSolid(ctx.world, room, part, false);
  ctx.emit('part-broken', { room: room.id, part: part.id, by: by?.id ?? null, player: by?.player ?? null, speed, look: part.params.look === 'window' ? 'window' : 'wall' });
}

/**
 * Breaks whichever unbroken breakable part covers this tile, if one does.
 * For any system that hits a wall some other way than by flying into it
 * (an attack, a machine). True when something broke.
 */
export function breakPartAt(ctx: StepContext, roomId: string, tx: number, ty: number, by: Entity | null = null): boolean {
  const room = ctx.content.rooms[roomId];
  const part = room?.parts.find((p) => p.kind === BREAKABLE && p.tiles.some((t) => t.tx === tx && t.ty === ty));
  if (!room || !part || partState(ctx.world, roomId, part.id).broken) return false;
  breakPart(ctx, room, part, by, 0);
  return true;
}
