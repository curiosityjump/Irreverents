import type { Content } from '../content/types.ts';
import { cantinaEntity, cantinaId } from './cantina.ts';
import { firstFreeMember } from './party.ts';
import { sourcesIn } from './powers.ts';
import { placeRecruits } from './recruits.ts';
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
 * players fits a room with at least one. Leave `character` out and the
 * player gets the first party member nobody is playing (src/sim/party.ts);
 * a caller that names one still gets it.
 */
export function spawnPlayer(
  world: World,
  content: Content,
  opts: { player: string; character?: string; room: string; spawn?: number },
): Entity {
  const room = content.rooms[opts.room];
  const character = opts.character ?? firstFreeMember(world, content);
  const kind = character === undefined ? undefined : content.characters[character];
  if (!room) throw new Error(`no room "${opts.room}"`);
  if (!kind) throw new Error(`no character "${character}"`);
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
 * Adds everything content/placements/<room id>.json places in a room
 * (and, Step 11, a cantina room's `~cantina:<room>` entity).
 * Safe to call twice: an id already in the world is skipped. A room with no
 * placements file gets nothing.
 */
export function populateRoom(world: World, content: Content, roomId: string): void {
  // Step 11: a cantina room starts with the bodiless entity its brawl runs on
  // (src/sim/cantina.ts); its regulars are added by systems/cantina-regulars.ts.
  if (content.cantina?.[roomId] && !findEntity(world, cantinaId(roomId))) addEntity(world, cantinaEntity(roomId));
  // Step 13: a captive hero in their cage (src/sim/recruits.ts), bodiless like the cantina's.
  placeRecruits(world, content, roomId);
  // Step 9: a power's source (a pedestal), bodiless (src/sim/powers.ts).
  for (const s of sourcesIn(content, roomId)) if (!findEntity(world, s.id)) addEntity(world, s);
  const placed = content.placements?.[roomId];
  if (!placed) return;
  for (const p of placed.place) {
    if (findEntity(world, p.id)) continue;
    spawnBody(world, content, { id: p.id, character: p.character, room: roomId, tile: p.tile });
  }
}
