import { known } from '../reader.ts';
import { TILE } from './rooms.ts';
import type { ContentKind } from '../types.ts';

/**
 * content/recruits/<id>.json: a hero held captive somewhere in the world,
 * to be freed and kept (Step 13; D-007, D-082; docs/mechanisms/recruits.md).
 * The captive is a bodiless thing until freed (src/sim/recruits.ts), never a
 * body: nobody can hit, grab or throw them, and they never count toward an
 * outpost's bound.
 * INTENT: the file id and the character are ids; a shown name is the
 * character's data (E-006: every roster name is EXAMPLE).
 * DRAFT: every field here.
 */
export interface Recruit {
  id: string;
  /** The roster character held here; freeing them unlocks them for good. */
  character: string;
  /** The room and the tile ([column, row]) of the cage's bottom-left; the cage is `w` tiles wide. */
  room: string;
  tile: [number, number];
  /** Tiles wide (the cage's look is drawn over them, the captive in the middle). */
  w: number;
  /**
   * How the cage is drawn shut, and open: look ids (content/looks/), drawn
   * over the captive. Left out: plain drawn bars (DRAFT).
   */
  look?: string;
  openLook?: string;
  /** Seconds Use must be held at the cage to free them. */
  hold: number;
  /** What they call out, and how often (seconds between calls, each shown for `callFor` seconds). */
  call: string;
  callEvery: number;
  callFor: number;
}

declare module '../types.ts' {
  interface Content {
    recruits: Record<string, Recruit>;
  }
}

const kind: ContentKind = {
  id: 'recruits',
  source: { dir: 'recruits' },
  parse(raw, read) {
    const o = read.object(raw, '');
    if (!o) return null;
    read.only(o, ['id', 'character', 'room', 'tile', 'w', 'look', 'openLook', 'hold', 'call', 'callEvery', 'callFor'], '');
    const t = o.tile;
    const tile: [number, number] = Array.isArray(t) && t.length === 2 && t.every((n) => Number.isInteger(n)) ? [t[0] as number, t[1] as number] : [0, 0];
    if (tile[0] === 0 && tile[1] === 0 && !(Array.isArray(t) && t.length === 2)) read.fail('tile', 'must be [column, row]');
    const out: Recruit = {
      id: read.string(o, 'id', ''),
      character: read.string(o, 'character', ''),
      room: read.string(o, 'room', ''),
      tile,
      w: o.w === undefined ? 2 : read.number(o, 'w', '', { min: 1, max: 4, integer: true }),
      ...(o.look === undefined ? {} : { look: read.string(o, 'look', '') }),
      ...(o.openLook === undefined ? {} : { openLook: read.string(o, 'openLook', '') }),
      hold: read.number(o, 'hold', '', { min: 0.2, max: 20 }),
      call: read.string(o, 'call', ''),
      callEvery: o.callEvery === undefined ? 6 : read.number(o, 'callEvery', '', { min: 1, max: 120 }),
      callFor: o.callFor === undefined ? 2.5 : read.number(o, 'callFor', '', { min: 0.5, max: 20 }),
    };
    return out;
  },
  check(content, fail) {
    const taken = new Map<string, string>();
    for (const r of Object.values(content.recruits ?? {})) {
      const file = `content/recruits/${r.id}.json`;
      if (!content.roster.characters.includes(r.character)) fail(file, 'character', `"${r.character}" is not a roster character (content/roster.json: ${content.roster.characters.join(', ')})`);
      else if (content.roster.start.includes(r.character)) fail(file, 'character', `"${r.character}" is in the roster's start: a new game has them already, so there is nobody to free`);
      const other = taken.get(r.character);
      if (other) fail(file, 'character', `"${r.character}" is already held by content/recruits/${other}.json: one place each`);
      taken.set(r.character, r.id);
      const room = content.rooms[r.room];
      if (!room) {
        fail(file, 'room', `no room "${r.room}" (rooms: ${known(content.rooms)})`);
        continue;
      }
      const [tx, ty] = r.tile;
      if (tx < 0 || ty < 0 || tx + r.w > room.w || ty >= room.h) {
        fail(file, 'tile', `[${tx}, ${ty}] and ${r.w} wide is outside room "${room.id}" (${room.w} by ${room.h} tiles)`);
        continue;
      }
      for (let x = tx; x < tx + r.w; x++) {
        if (room.cells[ty * room.w + x] === TILE.solid) fail(file, 'tile', `[${x}, ${ty}] is a solid tile of room "${room.id}"`);
        if (ty + 1 < room.h && room.cells[(ty + 1) * room.w + x] !== TILE.solid) fail(file, 'tile', `[${x}, ${ty + 1}], under the cage, is not solid floor`);
      }
      for (const [field, id] of [['look', r.look], ['openLook', r.openLook]] as const) {
        if (id !== undefined && content.looks && !Object.values(content.looks).some((g) => id in g.looks)) fail(file, field, `no look "${id}" in content/looks/`);
      }
    }
  },
};
export default kind;
