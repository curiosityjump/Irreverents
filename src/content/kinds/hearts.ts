import { describe, known } from '../reader.ts';
import type { ContentKind } from '../types.ts';

/**
 * content/hearts.json (Step 21, hearts; docs/mechanisms/defeat.md): how many
 * hearts each hero has and what costs one. The party's hearts are the
 * world's (`World.heartsLost`, src/sim/hearts.ts): everyone playing shares
 * them (D-012, D-013).
 *
 * DRAFT (the owner, 2026-11-24, "Heros should have hearts which can be
 * lost"; docs/decisions-log.md, "Step 21: hearts"): three each, a fall to an
 * enemy costs one. Every number and the `per` switch are first passes.
 */
export interface Hearts {
  /** The switch: false is the game before hearts (nobody loses one). */
  on: boolean;
  /** Hearts of a hero kind `heroes` leaves out. */
  default: number;
  /** Hearts by character kind (content/characters/). */
  heroes: Record<string, number>;
  /**
   * What costs a heart: `fall`, an enemy putting the hero on the floor (the
   * owner's unit; D-020: impact carries combat, nothing counts single blows);
   * `blow`, each blow an enemy lands (the other answer, one switch away).
   */
  per: 'fall' | 'blow';
  /**
   * Where a game over sends everyone (every party member out of hearts),
   * unless the place they lost in says otherwise (content/defeat/<place>.json
   * `gameOver`): a room, and a door or a tile in it; neither: a cantina's
   * pads, else the room's spawns. `beat`: seconds the last fall is seen
   * first. DRAFT (the owner: "that's a game over (back to cantina)").
   */
  gameOver: GameOverTo & { beat: number };
}

/** Where a game over sends everyone: a room, and a door or a tile of it (at most one). */
export interface GameOverTo {
  room: string;
  door?: string;
  tile?: [number, number];
}

/** Reads a `gameOver` object (hearts.json's, or a place file's). */
export function readGameOverTo(read: Parameters<ContentKind['parse']>[1], raw: unknown, where: string, extra: string[] = []): GameOverTo | null {
  const g = read.object(raw, where);
  if (!g) return null;
  read.only(g, ['room', 'door', 'tile', ...extra], where);
  const out: GameOverTo = { room: read.string(g, 'room', where) };
  if (g.door !== undefined) out.door = read.string(g, 'door', where);
  if (g.tile !== undefined) {
    const t = g.tile;
    if (Array.isArray(t) && t.length === 2 && t.every((n) => Number.isInteger(n))) out.tile = [t[0] as number, t[1] as number];
    else read.fail(`${where}.tile`, `must be [column, row], but is ${describe(t)}`);
  }
  if (out.door !== undefined && out.tile !== undefined) read.fail(where, 'give at most one of "door" or "tile"');
  return out;
}

/** Problems with a `gameOver` against the rooms. */
export function checkGameOverTo(content: Parameters<NonNullable<ContentKind['check']>>[0], g: GameOverTo, file: string, where: string, fail: Parameters<NonNullable<ContentKind['check']>>[1]): void {
  const room = content.rooms[g.room];
  if (!room) return fail(file, `${where}.room`, `no room "${g.room}" (rooms: ${known(content.rooms)})`);
  if (g.door !== undefined && !room.doors.some((x) => x.id === g.door)) fail(file, `${where}.door`, `room "${room.id}" has no door "${g.door}" (doors: ${room.doors.map((x) => x.id).join(', ')})`);
  if (g.tile && (g.tile[0] < 0 || g.tile[1] < 0 || g.tile[0] >= room.w || g.tile[1] >= room.h)) fail(file, `${where}.tile`, `[${g.tile.join(', ')}] is outside room "${room.id}"`);
  if (g.door === undefined && !g.tile && room.spawns.length === 0 && !Object.values(content.cantina ?? {}).some((c) => c.room === room.id)) fail(file, `${where}.room`, `"${room.id}" has no spawn and is no cantina: give a door or a tile`);
}

declare module '../types.ts' {
  interface Content {
    hearts: Hearts;
  }
}

const kind: ContentKind = {
  id: 'hearts',
  source: { file: 'hearts.json' },
  parse(raw, read) {
    const o = read.object(raw, '');
    const out: Hearts = { on: false, default: 3, heroes: {}, per: 'fall', gameOver: { room: 'cantina', beat: 1 } };
    if (!o) return out;
    read.only(o, ['on', 'default', 'heroes', 'per', 'gameOver'], '');
    if (typeof o.on !== 'boolean') read.fail('on', `must be true or false, but is ${describe(o.on)}`);
    out.on = o.on === true;
    out.default = read.number(o, 'default', '', { min: 1, max: 9, integer: true });
    const h = read.object(o.heroes, 'heroes');
    if (h) for (const k of Object.keys(h)) out.heroes[k] = read.number(h, k, 'heroes', { min: 1, max: 9, integer: true });
    if (o.per !== 'fall' && o.per !== 'blow') read.fail('per', `must be "fall" or "blow", but is ${describe(o.per)}`);
    else out.per = o.per;
    const g = readGameOverTo(read, o.gameOver, 'gameOver', ['beat']);
    if (g) out.gameOver = { ...g, beat: read.number(o.gameOver as Record<string, unknown>, 'beat', 'gameOver', { min: 0.05, max: 5 }) };
    return out;
  },
  check(content, fail) {
    checkGameOverTo(content, content.hearts.gameOver, 'content/hearts.json', 'gameOver', fail);
    const flatten = content.tuning.world.flattenTime ?? 3;
    // INTENT (nobody is held): the beat is shorter than the fall it shows.
    if (content.hearts.gameOver.beat >= flatten) fail('content/hearts.json', 'gameOver.beat', `${content.hearts.gameOver.beat} s is not below world.flattenTime (${flatten} s)`);
    for (const k of Object.keys(content.hearts.heroes)) {
      if (!(k in content.characters)) fail('content/hearts.json', `heroes.${k}`, `no character "${k}" (characters: ${known(content.characters)})`);
    }
  },
};
export default kind;
