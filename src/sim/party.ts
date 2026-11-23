// The party's rules that more than one file needs: who is free to be
// played, and whether a body fits where it stands. Pure, like the rest of
// src/sim. Writeup: docs/mechanisms/party-and-switching.md.
import { TILE } from '../content/kinds/rooms.ts';
import type { Room } from '../content/kinds/rooms.ts';
import type { Content } from '../content/types.ts';
import { tileAt } from './room-state.ts';
import { cellAt } from './systems/physics.ts';
import type { World } from './types.ts';

const EPS = 1e-6;

/** Whether a box (top-left x,y; size w,h; pixels) overlaps any solid tile of the room. One-way platforms never count. Pass `world` whenever there is one. */
export function boxInSolid(room: Room, x: number, y: number, w: number, h: number, world?: World): boolean {
  const T = room.tile;
  const left = Math.floor(x / T);
  const right = Math.floor((x + w - EPS) / T);
  const top = Math.floor(y / T);
  const bottom = Math.floor((y + h - EPS) / T);
  for (let ty = top; ty <= bottom; ty++) {
    for (let tx = left; tx <= right; tx++) {
      // With `world`, the run-time tiles (a shut gate is solid, a broken wall is not); without, the room file's.
      if ((world ? tileAt(world, room, tx, ty) : cellAt(room, tx, ty)) === TILE.solid) return true;
    }
  }
  return false;
}

/**
 * Whether some player other than `exceptEntity` is playing this member.
 * INTENT: "A character cannot be controlled by two humans at once" (library
 * doc 05): a member counts as taken wherever in the world its player is.
 */
export function memberTaken(world: World, member: string, exceptEntity?: string): boolean {
  // `taken`: a page's local world sees its friends only as this list (World.taken).
  return (
    world.entities.some((e) => e.player !== null && e.id !== exceptEntity && e.kind === member) ||
    (world.taken?.includes(member) ?? false) ||
    // Step 20: a rider's body is the machine while they ride; the hero they went in as stays theirs (World.machines).
    Object.values(world.machines ?? {}).some((m) => m.rider !== undefined && m.rider !== exceptEntity && m.hero === member)
  );
}

/**
 * The member a new player gets: the first in party order nobody is playing.
 * INTENT: when every member is taken the first is given again, so a fourth
 * friend is never turned away (docs/plan/step-2.md, "Decided by the lead").
 */
export function firstFreeMember(world: World, content: Content): string | undefined {
  // Step 11: the world's own party once a cantina swap has changed it (docs/mechanisms/cantina.md).
  const members = world.party ?? content.party.members;
  return members.find((m) => !memberTaken(world, m)) ?? members[0];
}
