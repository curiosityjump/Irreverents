// What changes in a room while the game runs: tile overrides and each
// working part's memory. Everything lives in World.rooms, so it is part of
// the deterministic state and travels wherever the World does.
// docs/mechanisms/rooms-and-doors.md, "Tiles that change while the game runs".
import { TILE } from '../content/kinds/rooms.ts';
import type { Room } from '../content/kinds/rooms.ts';
import type { RoomState, World } from './types.ts';

function state(world: World, roomId: string): RoomState {
  const rooms = (world.rooms ??= {});
  return (rooms[roomId] ??= { tiles: {}, parts: {} });
}

/**
 * The tile code collision uses: a run-time override if a part has set one,
 * else the room file's. Outside the grid is always solid.
 */
export function tileAt(world: World, room: Room, tx: number, ty: number): number {
  if (tx < 0 || ty < 0 || tx >= room.w || ty >= room.h) return TILE.solid;
  const i = ty * room.w + tx;
  const over = world.rooms?.[room.id]?.tiles[i];
  return over ?? room.cells[i]!;
}

/** Makes one tile behave as `code` (a TILE value) from now on, or gives it back to the room file with null. */
export function setTile(world: World, room: Room, tx: number, ty: number, code: number | null): void {
  if (tx < 0 || ty < 0 || tx >= room.w || ty >= room.h) return;
  const i = ty * room.w + tx;
  if (code === null) {
    const tiles = world.rooms?.[room.id]?.tiles;
    if (tiles) delete tiles[i];
  } else state(world, room.id).tiles[i] = code;
}

/** A placed part's own memory (created empty on first use). Keep it to plain numbers, booleans and text. */
export function partState(world: World, roomId: string, partId: string): Record<string, number | boolean | string> {
  const s = state(world, roomId);
  return (s.parts[partId] ??= {});
}
