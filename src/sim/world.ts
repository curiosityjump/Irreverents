import type { Content } from '../content/types.ts';
import type { Entity, Input, World } from './types.ts';

export const NO_INPUT: Input = { x: 0, y: 0, held: [] };

export function createWorld(): World {
  return { tick: 0, entities: [] };
}

export function findEntity(world: World, id: string): Entity | undefined {
  return world.entities.find((e) => e.id === id);
}

export function playerEntity(world: World, player: string): Entity | undefined {
  return world.entities.find((e) => e.player === player);
}

/** Adds an entity, keeping world.entities sorted by id (see World). */
export function addEntity(world: World, entity: Entity): Entity {
  if (findEntity(world, entity.id)) throw new Error(`entity "${entity.id}" is already in the world`);
  let i = 0;
  while (i < world.entities.length && world.entities[i]!.id < entity.id) i++;
  world.entities.splice(i, 0, entity);
  return entity;
}

export function removeEntity(world: World, id: string): void {
  const i = world.entities.findIndex((e) => e.id === id);
  if (i >= 0) world.entities.splice(i, 1);
}

/**
 * Puts a player's character in a room, feet on the floor of a spawn tile.
 * `spawn` picks among the room's spawn tiles and wraps, so any number of
 * players fits a room with at least one.
 */
export function spawnPlayer(
  world: World,
  content: Content,
  opts: { player: string; character: string; room: string; spawn?: number },
): Entity {
  const room = content.rooms[opts.room];
  const kind = content.characters[opts.character];
  if (!room) throw new Error(`no room "${opts.room}"`);
  if (!kind) throw new Error(`no character "${opts.character}"`);
  if (room.spawns.length === 0) throw new Error(`room "${room.id}" has no spawn tile`);
  const at = room.spawns[(opts.spawn ?? 0) % room.spawns.length]!;
  return addEntity(world, {
    id: `p:${opts.player}`,
    kind: kind.id,
    player: opts.player,
    room: room.id,
    x: at.tx * room.tile + (room.tile - kind.box.w) / 2,
    y: (at.ty + 1) * room.tile - kind.box.h,
    vx: 0,
    vy: 0,
    facing: 1,
    onGround: true,
    c: {},
  });
}

/**
 * Puts a body nobody plays (a crate, a dummy, later an NPC) in a room: feet
 * on the floor of `tile`, centred in it, the way spawnPlayer does it.
 */
export function spawnBody(
  world: World,
  content: Content,
  opts: { id: string; character: string; room: string; tile: [number, number] },
): Entity {
  const room = content.rooms[opts.room];
  const kind = content.characters[opts.character];
  if (!room) throw new Error(`no room "${opts.room}"`);
  if (!kind) throw new Error(`no character "${opts.character}"`);
  const [tx, ty] = opts.tile;
  return addEntity(world, {
    id: opts.id,
    kind: kind.id,
    player: null,
    room: room.id,
    x: tx * room.tile + (room.tile - kind.box.w) / 2,
    y: (ty + 1) * room.tile - kind.box.h,
    vx: 0,
    vy: 0,
    facing: 1,
    onGround: true,
    c: {},
  });
}

/**
 * Adds everything content/placements/<room id>.json places in a room.
 * Safe to call twice: an id already in the world is skipped. A room with no
 * placements file gets nothing.
 */
export function populateRoom(world: World, content: Content, roomId: string): void {
  const placed = content.placements?.[roomId];
  if (!placed) return;
  for (const p of placed.place) {
    if (findEntity(world, p.id)) continue;
    spawnBody(world, content, { id: p.id, character: p.character, room: roomId, tile: p.tile });
  }
}
