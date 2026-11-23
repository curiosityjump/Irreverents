import type { Door, Room } from '../../content/kinds/rooms.ts';
import { everySetComplete } from '../completion.ts';
import type { Content } from '../../content/types.ts';
import type { Entity, System } from '../types.ts';
import { NO_INPUT } from '../world.ts';
import { useHere } from '../use.ts';

declare module '../types.ts' {
  interface Components {
    roomDoors?: {
      /** Whether the stick was pushed up last tick, to see a fresh push. */
      up: boolean;
      /**
       * "I want through the doorway I am standing in", for one tick. A
       * system sets it with askForDoor() (Step 4's guard giving chase) and
       * this system clears it every tick. The other way to ask is the
       * stick: a fresh push up in the body's Input.
       */
      want: boolean;
      /** Whether `interact` (Use) was held last tick, to see a fresh press. Additive: absent reads as not held. */
      use?: boolean;
    };
    /** Step 11: the tick and door of the last refusal (a `refuse` door), for the page to show it. */
    doorRefused?: { tick: number; room: string; door: string };
  }
  interface EventMap {
    /** Something went through a door. `player` is null for a body nobody drives. */
    'changed-room': { entity: string; player: string | null; fromRoom: string; fromDoor: string; toRoom: string; toDoor: string };
    /** Step 11 (D-088): a push up at a `"refuse": "chased"` doorway by a body on the world's `chased` list; nothing moved. */
    'door-refused': { entity: string; player: string | null; room: string; door: string; why: 'chased' };
  }
}

/** How far up the stick must be pushed to count as "up". DRAFT: half way. */
const STICK_UP = -0.5;

/**
 * Says that this entity wants to go through the doorway it is standing in,
 * this tick: how a system sends a body through an *enter* door without
 * faking a stick. (A *walk* door needs nothing: walk the body into it.)
 */
export function askForDoor(entity: Entity): void {
  (entity.c.roomDoors ??= { up: false, want: false }).want = true;
}

/**
 * The enter doorway the middle of this body's box is in, if any: where a
 * fresh press of Use (or a fresh push up) takes it through. Shared with
 * the systems that also read Use (npc-interact, cantina-brawl), so the
 * door wins that press, and with the client, which shows it (the Use
 * button's "Go in", draw/door-hint.ts).
 * DRAFT: the door wins the press (decisions-log 2026-11-23 "Doorways by Use").
 */
export function enterDoorwayAt(content: Content, e: Entity): Door | undefined {
  const room = content.rooms[e.room];
  const kind = content.characters[e.kind];
  if (!room || !kind || room.doors.length === 0) return undefined;
  const door = doorAt(room, e, kind.box.w, kind.box.h);
  return door?.use === 'enter' ? door : undefined;
}

/** True while this body stands in an enter doorway (enterDoorwayAt). */
export function inEnterDoorway(content: Content, e: Entity): boolean {
  return enterDoorwayAt(content, e) !== undefined;
}

function doorAt(room: Room, e: Entity, w: number, h: number): Door | undefined {
  const tx = Math.floor((e.x + w / 2) / room.tile);
  const ty = Math.floor((e.y + h / 2) / room.tile);
  return room.doors.find((d) => tx >= d.tx && tx < d.tx + d.w && ty >= d.ty && ty < d.ty + d.h);
}

function clamp(v: number, min: number, max: number): number {
  return max < min ? max : Math.min(Math.max(v, min), max);
}

/**
 * Moving between rooms (docs/mechanisms/rooms-and-doors.md).
 *
 * Order 600, after physics (500): a door acts on where a body *is* at the
 * end of this tick. The body is placed in the far room and the next tick's
 * physics settles it; the content check guarantees the place it arrives at
 * is not inside a wall.
 *
 * INTENT: doors never test for a player. (Step 11: a door with `"refuse":
 * "chased"` tests a list the world keeps, `world.chased`, which some system
 * fills; a door still never asks who is a player.) "A level transition never
 * automatically resets pursuit, and guards may follow between regions"
 * (D-077): a guard, a thrown crate and a player all go through the same
 * code. A body asks to use a doorway through its Input, whoever supplies
 * it (a player's device, or entity.c.input for a body nobody plays), or
 * with askForDoor().
 *
 * INTENT: nothing in a room is reset when it empties (D-077 again). The
 * World holds every room's entities and state all the time; this system
 * only ever changes the room of the one body that went through. Do not add
 * an "unload".
 *
 * Step 1's netcode: no network code here. A player walking through a door
 * needs nothing but this system, because each phone simulates its own
 * character with this same step(); a player *thrown* at a door arrives at
 * it by a `push` effect (src/sim/effects.ts) and then goes through here
 * like anything else. If something ever has to put a player through a
 * door from outside their device, the effect for it is `move` (room, x,
 * y), followed by a `push` to give back the speed a walk door keeps.
 */
const system: System = {
  id: 'room-doors',
  order: 600,
  run(ctx) {
    for (const e of ctx.world.entities) {
      const room = ctx.content.rooms[e.room];
      const kind = ctx.content.characters[e.kind];
      if (!room || !kind) continue;

      // Is this body asking to use a doorway? A fresh push of the stick up, a fresh press of Use, or the hook.
      // The same Input the body's verbs get (systems/verbs.ts): its player's device, or entity.c.input.
      const input = (e.player === null ? e.c.input : ctx.inputs[e.player]) ?? NO_INPUT;
      const up = input.y <= STICK_UP;
      const use = input.held.includes('interact');
      const memory = e.c.roomDoors;
      // Step 19: a fresh press of Use asks for the doorway when the Use arbiter gives it the press (src/sim/use.ts; the door entry is first).
      const freshUse = use && !(memory?.use ?? false);
      const asking = (memory?.want ?? false) || (up && !(memory?.up ?? false)) || (freshUse && useHere(ctx.world, ctx.content, e)?.entry === 'door');
      if (memory || up || use) e.c.roomDoors = { up, want: false, use };

      if (room.doors.length === 0) continue;
      const { w, h } = kind.box;
      const door = doorAt(room, e, w, h);
      if (!door) continue;
      // DRAFT: a doorway is used with a fresh push of the stick up (the Step 3 brief's call; Amazing
      // Mirror's door) or a fresh press of Use, the phone's context button (the owner, 2026-11-23:
      // "There is no stick to push up..."; decisions-log "Doorways by Use"). On that tick the door
      // wins the press: the Use arbiter (src/sim/use.ts) gives it to the door entry first.
      if (door.use === 'enter' && !asking) continue;
      // Step 11 (D-088): chased by the good guys, the cantina's doorway will not take you.
      // Step 14 slice B (D-089): unless every set of pieces is complete; the chasers follow (D-090).
      if (door.refuse === 'chased' && ctx.world.chased?.includes(e.id) && !everySetComplete(ctx.world, ctx.content)) {
        e.c.doorRefused = { tick: ctx.world.tick, room: room.id, door: door.id };
        ctx.emit('door-refused', { entity: e.id, player: e.player, room: room.id, door: door.id, why: 'chased' });
        continue;
      }

      const farRoom = ctx.content.rooms[door.to.room];
      const far = farRoom?.doors.find((d) => d.id === door.to.door);
      if (!farRoom || !far) continue;
      arrive(e, w, h, room, door, farRoom, far);
      ctx.emit('changed-room', { entity: e.id, player: e.player, fromRoom: room.id, fromDoor: door.id, toRoom: farRoom.id, toDoor: far.id });
    }
  },
};
export default system;

/** Puts a body that used `door` where it comes out of `far`. */
function arrive(e: Entity, w: number, h: number, room: Room, door: Door, farRoom: Room, far: Door): void {
  const T = room.tile;
  const F = farRoom.tile;
  e.room = farRoom.id;
  if (far.use === 'enter' || far.side === null || door.side === null) {
    // A doorway sets you standing in its pair, still: the stick must be let go before it takes you again.
    e.x = far.tx * F + (far.w * F - w) / 2;
    e.y = (far.ty + far.h) * F - h;
    e.vx = 0;
    e.vy = 0;
    return;
  }
  // A walk door keeps your speed and your place across the opening, and
  // sets you just inside the far room, clear of the far door's tiles, so
  // you are never carried straight back.
  if (far.side === 'west' || far.side === 'east') {
    e.y = far.ty * F + clamp(e.y - door.ty * T, 0, far.h * F - h);
    e.x = far.side === 'west' ? (far.tx + far.w) * F : far.tx * F - w;
  } else {
    e.x = far.tx * F + clamp(e.x - door.tx * T, 0, far.w * F - w);
    e.y = far.side === 'north' ? (far.ty + far.h) * F : far.ty * F - h;
  }
}
