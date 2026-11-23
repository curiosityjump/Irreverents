import { describe, isRecord, known } from '../reader.ts';
import type { ContentKind, Content, Reader } from '../types.ts';
import type { CharacterKind } from './characters.ts';

/**
 * content/rooms/<id>.json: a room's geometry, hand-editable as rows of
 * characters with a legend, plus its doors, named areas and placed working
 * parts. Who and what stands in a room is separate data
 * (docs/architecture.md), so the map and the people never share a file.
 * The format, the door rules and the checks: docs/mechanisms/rooms-and-doors.md.
 */
export interface Room {
  id: string;
  name: string;
  /** Tile size in pixels. DRAFT: 16, the size the art on order assumes. */
  tile: number;
  /** Size in tiles. A room may be larger than one 320x180 screen; the camera follows (src/client/draw/room.ts). */
  w: number;
  h: number;
  /** w*h collision codes, row by row from the top-left: see TILE. Door and part tiles are TILE.empty here. */
  cells: number[];
  /** Tiles a player can start on, in reading order. */
  spawns: { tx: number; ty: number }[];
  /** Whether the whole room is a hidden one. Parsed only: an explored percentage will count it later (D-079). */
  hidden: boolean;
  doors: Door[];
  areas: Area[];
  parts: Part[];
}

export type DoorUse = 'walk' | 'enter';
export type DoorSide = 'west' | 'east' | 'north' | 'south';

/**
 * A way into another room: a filled rectangle of tiles.
 * - walk: an opening on the room's edge (or a hole in its floor). Touching
 *   it carries anything through, no button.
 * - enter: a doorway inside the room. A body goes through when it asks to
 *   (for a player: a fresh push of the stick up).
 * Both ends are written, each naming the other, and the check makes them agree.
 */
export interface Door {
  /** Unique in its room. A contract once deployed. */
  id: string;
  use: DoorUse;
  /** Which edge of the room a walk door is on. Null for an enter door. */
  side: DoorSide | null;
  /** The rectangle, in tiles. */
  tx: number;
  ty: number;
  w: number;
  h: number;
  to: { room: string; door: string };
  /**
   * A connection nothing points at (docs/plan/step-3.md: "no arrow, no
   * glow, no text"). A hidden door may not carry a sign: tonight the only
   * sign a door can have is an enter doorway's drawn arch, so a hidden
   * door must be a walk door (a bare gap). Counted later by the explored
   * percentage (D-079).
   */
  hidden: boolean;
}

/** A named rectangle of tiles. Nothing reads these yet (D-079: hidden areas count toward the explored percentage). */
export interface Area {
  id: string;
  hidden: boolean;
  tx: number;
  ty: number;
  w: number;
  h: number;
}

/**
 * A placed working part (a plate, a gate, a breakable wall...). The room
 * file only places it; what a kind of part *does* is a system in
 * src/sim/systems/ that declares the kind in its `parts`
 * (docs/architecture.md, "a kind of working part"). Unknown kinds are
 * reported by src/sim/check-rooms.ts, which can see the systems.
 */
export interface Part {
  /** Unique in its room. */
  id: string;
  kind: string;
  /** The tiles its legend letter covers, in reading order. They are TILE.empty in Room.cells; a part makes them solid while the game runs through src/sim/room-state.ts. */
  tiles: { tx: number; ty: number }[];
  /** Free parameters, checked by the system that declares the kind. */
  params: Record<string, unknown>;
}

/**
 * What a legend entry can mean. INTENT: additive only. The codes are stored
 * in Room.cells, so never renumber or remove one; add the next number.
 */
export const TILE = {
  empty: 0,
  /** Blocks from every side. */
  solid: 1,
  /** A platform: stand on it from above, pass through from below and the sides. */
  oneway: 2,
} as const;

declare module '../types.ts' {
  interface Content {
    rooms: Record<string, Room>;
  }
}

const MEANINGS = ['empty', 'solid', 'oneway', 'spawn'];
const LEGEND_HELP = `${MEANINGS.join(', ')}, { "door": "<door id>" } or { "part": "<part id>" }`;
const USES: DoorUse[] = ['walk', 'enter'];
const SIDES: DoorSide[] = ['west', 'east', 'north', 'south'];
const OPPOSITE: Record<DoorSide, DoorSide> = { west: 'east', east: 'west', north: 'south', south: 'north' };
// Same shape as an item id (src/content/assemble.ts); repeated here because assemble imports the kinds.
const LOCAL_ID = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

function localId(read: Reader, o: Record<string, unknown>, where: string, seen: Set<string>, what: string): string {
  const id = read.string(o, 'id', where);
  if (id === '') return id;
  if (!LOCAL_ID.test(id)) read.fail(`${where}.id`, `"${id}" is not a valid id: use lower-case letters, digits and dashes, starting with a letter`);
  if (seen.has(id)) read.fail(`${where}.id`, `${what} "${id}" is listed twice in this room`);
  seen.add(id);
  return id;
}

function list(read: Reader, o: Record<string, unknown>, field: string): Record<string, unknown>[] {
  const v = o[field];
  if (v === undefined) return [];
  if (!Array.isArray(v)) {
    read.fail(field, `must be a list, but is ${describe(v)}`);
    return [];
  }
  const out: Record<string, unknown>[] = [];
  v.forEach((item, i) => {
    const obj = read.object(item, `${field}[${i}]`);
    // Keep the index stable for messages even when an entry is unusable.
    out.push(obj ?? { '//': 'unusable' });
  });
  return out;
}

function flag(read: Reader, o: Record<string, unknown>, field: string, where: string): boolean {
  const v = o[field];
  if (v === undefined) return false;
  if (typeof v !== 'boolean') read.fail(where ? `${where}.${field}` : field, `must be true or false, but is ${describe(v)}`);
  return v === true;
}

function pair(read: Reader, o: Record<string, unknown>, field: string, where: string, min: number): [number, number] {
  const v = o[field];
  if (!Array.isArray(v) || v.length !== 2 || !v.every((n) => Number.isInteger(n) && n >= min)) {
    read.fail(`${where}.${field}`, `must be two whole numbers [column, row] or [wide, tall], each at least ${min}, but is ${JSON.stringify(v)}`);
    return [min, min];
  }
  return [v[0] as number, v[1] as number];
}

/**
 * Every character a player can be: the party's members (content/party.json,
 * Step 2), else game.json's playerCharacter. The room checks run for each.
 */
export function playableCharacters(content: Content): CharacterKind[] {
  const ids = content.party?.members.length ? content.party.members : [content.game.playerCharacter];
  return ids.map((id) => content.characters[id]).filter((c): c is CharacterKind => c !== undefined);
}

const kind: ContentKind = {
  id: 'rooms',
  source: { dir: 'rooms' },
  parse(raw, read) {
    const o = read.object(raw, '');
    if (!o) return null;
    read.only(o, ['id', 'name', 'tile', 'hidden', 'legend', 'rows', 'doors', 'areas', 'parts'], '');
    const out: Room = {
      id: read.string(o, 'id', ''),
      name: read.string(o, 'name', ''),
      tile: read.number(o, 'tile', '', { min: 8, max: 64, integer: true }),
      w: 0,
      h: 0,
      cells: [],
      spawns: [],
      hidden: flag(read, o, 'hidden', ''),
      doors: [],
      areas: [],
      parts: [],
    };

    // Doors and parts are declared in lists; the legend says which tiles each covers.
    const doorIds = new Set<string>();
    list(read, o, 'doors').forEach((d, i) => {
      const w = `doors[${i}]`;
      if (d['//'] === 'unusable') return;
      read.only(d, ['id', 'use', 'side', 'to', 'hidden'], w);
      const id = localId(read, d, w, doorIds, 'door');
      const use = d.use as DoorUse;
      if (!USES.includes(use)) read.fail(`${w}.use`, `must be one of ${USES.join(', ')}, but is ${describe(d.use)}`);
      let side: DoorSide | null = null;
      if (d.side !== undefined) {
        if (!SIDES.includes(d.side as DoorSide)) read.fail(`${w}.side`, `must be one of ${SIDES.join(', ')} or left out, but is ${describe(d.side)}`);
        else if (use === 'enter') read.fail(`${w}.side`, 'only a walk door has a side; an enter door is a doorway inside the room');
        else side = d.side as DoorSide;
      }
      const to = read.object(d.to, `${w}.to`);
      if (to) read.only(to, ['room', 'door'], `${w}.to`);
      out.doors.push({
        id,
        use: USES.includes(use) ? use : 'walk',
        side,
        tx: 0,
        ty: 0,
        w: 0,
        h: 0,
        to: { room: to ? read.string(to, 'room', `${w}.to`) : '', door: to ? read.string(to, 'door', `${w}.to`) : '' },
        hidden: flag(read, d, 'hidden', w),
      });
      // INTENT: "unadvertised" is checked, not trusted. Whatever comes to count as a sign on a door, a hidden one may not have it.
      if (d.hidden === true && use === 'enter') {
        read.fail(`${w}.hidden`, `door "${id}" is hidden but is an enter doorway, which is drawn as an arch: a hidden connection may not carry a sign or marker (make it a walk door, a bare gap, or not hidden)`);
      }
    });
    const partIds = new Set<string>();
    list(read, o, 'parts').forEach((p, i) => {
      const w = `parts[${i}]`;
      if (p['//'] === 'unusable') return;
      read.only(p, ['id', 'kind', 'params'], w);
      const params = p.params === undefined ? {} : read.object(p.params, `${w}.params`);
      out.parts.push({ id: localId(read, p, w, partIds, 'part'), kind: read.string(p, 'kind', w), tiles: [], params: params ?? {} });
    });

    const legend = read.object(o.legend, 'legend') ?? {};
    for (const ch of Object.keys(legend)) {
      if (ch === '//') continue;
      if (ch.length !== 1) read.fail(`legend.${ch}`, 'a legend key must be exactly one character');
      const m = legend[ch];
      if (typeof m === 'string' && MEANINGS.includes(m)) continue;
      if (isRecord(m) && Object.keys(m).length === 1 && typeof m.door === 'string') {
        if (!doorIds.has(m.door)) read.fail(`legend.${ch}.door`, `no door "${m.door}" in this room's "doors" (doors: ${[...doorIds].sort().join(', ') || '(none yet)'})`);
        continue;
      }
      if (isRecord(m) && Object.keys(m).length === 1 && typeof m.part === 'string') {
        if (!partIds.has(m.part)) read.fail(`legend.${ch}.part`, `no part "${m.part}" in this room's "parts" (parts: ${[...partIds].sort().join(', ') || '(none yet)'})`);
        continue;
      }
      read.fail(`legend.${ch}`, `must be one of ${LEGEND_HELP}, but is ${describe(m)}`);
    }

    const rows = read.stringList(o, 'rows', '');
    out.h = rows.length;
    out.w = rows[0]?.length ?? 0;
    if (out.h === 0 || out.w === 0) read.fail('rows', 'a room needs at least one non-empty row');
    const doorTiles = new Map<string, { tx: number; ty: number }[]>();
    rows.forEach((row, ty) => {
      if (row.length !== out.w) {
        read.fail(`rows[${ty}]`, `is ${row.length} characters wide, but rows[0] is ${out.w}: every row must be the same width`);
        return;
      }
      for (let tx = 0; tx < row.length; tx++) {
        const ch = row[tx]!;
        const meaning = Object.hasOwn(legend, ch) ? legend[ch] : undefined;
        if (meaning === 'solid') out.cells.push(TILE.solid);
        else if (meaning === 'oneway') out.cells.push(TILE.oneway);
        else {
          out.cells.push(TILE.empty);
          if (meaning === 'spawn') out.spawns.push({ tx, ty });
          else if (isRecord(meaning) && typeof meaning.door === 'string') {
            if (!doorTiles.has(meaning.door)) doorTiles.set(meaning.door, []);
            doorTiles.get(meaning.door)!.push({ tx, ty });
          } else if (isRecord(meaning) && typeof meaning.part === 'string') {
            out.parts.find((p) => p.id === meaning.part)?.tiles.push({ tx, ty });
          } else if (meaning !== 'empty') read.fail(`rows[${ty}]`, `column ${tx} is "${ch}", which is not in the legend`);
        }
      }
    });

    out.doors.forEach((door, i) => {
      const w = `doors[${i}]`;
      const tiles = doorTiles.get(door.id) ?? [];
      if (tiles.length === 0) {
        read.fail(w, `door "${door.id}" covers no tile: give it a legend letter ({ "door": "${door.id}" }) and put that letter in "rows"`);
        return;
      }
      door.tx = Math.min(...tiles.map((t) => t.tx));
      door.ty = Math.min(...tiles.map((t) => t.ty));
      door.w = Math.max(...tiles.map((t) => t.tx)) - door.tx + 1;
      door.h = Math.max(...tiles.map((t) => t.ty)) - door.ty + 1;
      // INTENT: a door is one filled rectangle, so "your place across the opening" is one number.
      if (tiles.length !== door.w * door.h) {
        read.fail(w, `door "${door.id}" must cover one filled rectangle of tiles, but its ${tiles.length} tile(s) span ${door.w} by ${door.h} from tile [${door.tx}, ${door.ty}]`);
      }
      if (door.use !== 'walk') return;
      const touching = SIDES.filter((s) => (s === 'west' ? door.tx === 0 : s === 'east' ? door.tx + door.w === out.w : s === 'north' ? door.ty === 0 : door.ty + door.h === out.h));
      if (door.side !== null) {
        if (!touching.includes(door.side)) read.fail(`${w}.side`, `is "${door.side}", but door "${door.id}" at tile [${door.tx}, ${door.ty}] does not touch the room's ${door.side} edge`);
      } else if (touching.length === 1) door.side = touching[0]!;
      else if (touching.length === 0) {
        read.fail(w, `walk door "${door.id}" at tile [${door.tx}, ${door.ty}] must sit on the room's edge (first or last column, or first or last row); a doorway inside the room is "use": "enter"`);
      } else read.fail(`${w}.side`, `door "${door.id}" touches the ${touching.join(' and ')} edges: say which with "side"`);
    });
    out.parts.forEach((part, i) => {
      if (part.tiles.length === 0) read.fail(`parts[${i}]`, `part "${part.id}" covers no tile: give it a legend letter ({ "part": "${part.id}" }) and put that letter in "rows"`);
    });

    const areaIds = new Set<string>();
    list(read, o, 'areas').forEach((a, i) => {
      const w = `areas[${i}]`;
      if (a['//'] === 'unusable') return;
      read.only(a, ['id', 'hidden', 'at', 'size'], w);
      const [tx, ty] = pair(read, a, 'at', w, 0);
      const [aw, ah] = pair(read, a, 'size', w, 1);
      if (tx + aw > out.w || ty + ah > out.h) read.fail(w, `reaches tile [${tx + aw - 1}, ${ty + ah - 1}], outside the room's ${out.w} by ${out.h} tiles`);
      out.areas.push({ id: localId(read, a, w, areaIds, 'area'), hidden: flag(read, a, 'hidden', w), tx, ty, w: aw, h: ah });
    });
    return out;
  },

  check(content, fail) {
    // The widest and tallest body a player can be: a spawn and a door's far side must have room for it.
    const playable = playableCharacters(content);
    const hero = playable.length ? { id: playable.map((c) => c.id).join(' / '), box: { w: Math.max(...playable.map((c) => c.box.w)), h: Math.max(...playable.map((c) => c.box.h)) } } : undefined;
    for (const room of Object.values(content.rooms)) {
      const file = `content/rooms/${room.id}.json`;
      const T = room.tile;
      const cell = (tx: number, ty: number): number => (tx < 0 || ty < 0 || tx >= room.w || ty >= room.h ? TILE.solid : room.cells[ty * room.w + tx]!);

      if (hero) {
        const tall = Math.ceil(hero.box.h / T);
        const wide = Math.ceil(hero.box.w / T);
        for (const s of room.spawns) {
          const where = `tile [${s.tx}, ${s.ty}]`;
          if (cell(s.tx, s.ty + 1) === TILE.empty) fail(file, where, 'this spawn is in mid-air: the tile directly below it must be solid or a one-way platform');
          // A body starts centred on its spawn tile; one wider than a tile overlaps the tiles either side.
          for (let k = 0; k < tall; k++) {
            for (let j = wide > 1 ? -1 : 0; j <= (wide > 1 ? 1 : 0); j++) {
              if (cell(s.tx + j, s.ty - k) === TILE.solid) fail(file, where, `this spawn has no room for a body: tile [${s.tx + j}, ${s.ty - k}] is solid, and the largest body a player can be (${hero.id}) is ${hero.box.w} by ${hero.box.h} px`);
            }
          }
        }
      }

      room.doors.forEach((door, i) => {
        const where = `doors[${i}] ("${door.id}", tile [${door.tx}, ${door.ty}])`;
        const farRoom = content.rooms[door.to.room];
        if (!farRoom) return fail(file, `${where}.to.room`, `no room "${door.to.room}" (rooms: ${known(content.rooms)})`);
        const far = farRoom.doors.find((d) => d.id === door.to.door);
        if (!far) {
          return fail(file, `${where}.to.door`, `room "${farRoom.id}" has no door "${door.to.door}" (its doors: ${farRoom.doors.map((d) => d.id).sort().join(', ') || '(none yet)'})`);
        }
        if (far.to.room !== room.id || far.to.door !== door.id) {
          fail(file, `${where}.to`, `the two ends disagree: this door leads to "${farRoom.id}" door "${far.id}", but that one leads to "${far.to.room}" door "${far.to.door}"`);
        }
        if (far.use !== door.use) fail(file, `${where}.use`, `is "${door.use}", but the other end ("${farRoom.id}" door "${far.id}") is "${far.use}": both ends of a door are used the same way`);

        if (door.use === 'enter') {
          // You arrive standing in the doorway, so it needs a floor.
          for (let tx = door.tx; tx < door.tx + door.w; tx++) {
            if (cell(tx, door.ty + door.h) === TILE.empty) fail(file, where, `this doorway has no floor: tile [${tx}, ${door.ty + door.h}] below it must be solid or a one-way platform`);
          }
          return;
        }
        if (door.side === null) return;
        if (far.use === 'walk' && far.side !== null) {
          // INTENT: opposite edges and equal width, so a body keeps its
          // place across the opening and keeps moving *away* from the door
          // it arrives at (it cannot bounce straight back).
          const across = door.side === 'west' || door.side === 'east';
          if (far.side !== OPPOSITE[door.side]) fail(file, `${where}.side`, `is on the ${door.side} edge, so the other end must be on a ${OPPOSITE[door.side]} edge, but "${farRoom.id}" door "${far.id}" is on the ${far.side} edge`);
          else if (across ? far.h * farRoom.tile !== door.h * T : far.w * farRoom.tile !== door.w * T) {
            fail(file, where, `the opening is ${across ? door.h : door.w} tile(s) ${across ? 'tall' : 'wide'} here but ${across ? far.h : far.w} at the other end ("${farRoom.id}" door "${far.id}"): both ends of a walk door must be the same size`);
          }
        }
        // Arriving bodies are put just inside the room, beside the door: that strip must be open.
        const deep = hero ? Math.ceil((door.side === 'west' || door.side === 'east' ? hero.box.w : hero.box.h) / T) : 1;
        for (let k = 0; k < deep; k++) {
          for (let j = 0; j < (door.side === 'west' || door.side === 'east' ? door.h : door.w); j++) {
            const tx = door.side === 'west' ? door.tx + door.w + k : door.side === 'east' ? door.tx - 1 - k : door.tx + j;
            const ty = door.side === 'north' ? door.ty + door.h + k : door.side === 'south' ? door.ty - 1 - k : door.ty + j;
            if (cell(tx, ty) === TILE.solid) fail(file, where, `a body arriving through this door lands inside a wall: tile [${tx}, ${ty}], just inside the door, is solid`);
          }
        }
      });
    }
  },
};
export default kind;
