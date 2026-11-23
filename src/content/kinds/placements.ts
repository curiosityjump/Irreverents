import { ID_PATTERN } from '../assemble.ts';
import { describe, known } from '../reader.ts';
import type { ContentKind, Reader } from '../types.ts';

/**
 * content/placements/<room id>.json: who and what stands in a room when it
 * is set up, kept apart from the room's geometry (docs/architecture.md).
 * DRAFT: the minimal shape, landed by Step 2 so crates and dummies can be
 * placed; Step 4 owns this kind from here and adds fields (additively).
 * The file is named after its room, so `id` and `room` are the same text.
 */
export interface Placements {
  id: string;
  room: string;
  place: {
    /** The entity's id in the world. Unique across every placements file. */
    id: string;
    /** A character kind id (content/characters/). */
    character: string;
    /** [column, row]: the body stands with its feet on the floor of this tile, centred. */
    tile: [number, number];
    /** Step 4: an NPC kind id (content/npcs/). With it, this body is a person with three moods. */
    npc?: string;
    /** Step 4: what the person does, on a loop, while in business as usual. Needs `npc`. */
    routine?: RoutineStep[];
  }[];
  /** Step 4: bodiless things a hero can use: a shop counter, goods on a shelf. */
  things?: PlacedThing[];
}

/**
 * One step of a person's routine. In the file: { "wait": seconds },
 * { "face": "left" | "right" }, { "walk-to": column } or
 * { "do": deed id, "target": a placed id }.
 */
export type RoutineStep =
  | { op: 'wait'; seconds: number }
  | { op: 'face'; dir: 1 | -1 }
  | { op: 'walk-to'; column: number }
  | { op: 'do'; deed: string; target: string | null };

export interface PlacedThing {
  /** The thing's entity id in the world. Unique across every placements file, bodies included. */
  id: string;
  /** [column, row] of the tile it occupies. */
  tile: [number, number];
  /** The deed (content/rules/ "deeds") a hero does by using it. */
  deed: string;
  /** A placed person who must be standing by for it to work, and to whom the deed is done. */
  keeper?: string;
  /** True when it can be used only once: whoever uses it takes it. */
  once: boolean;
  /** DRAFT: how the graybox drawer shows it. */
  look: ThingLook;
  /** Slice 2: for a call point (look "bell"), whose side rings it. Left out: "good". */
  side?: 'good' | 'bad';
}

// Step 14 slice B: 'special', a visibly special good (content/completion/: taking it is a piece).
export const THING_LOOKS = ['counter', 'goods', 'bell', 'special'] as const;
export type ThingLook = (typeof THING_LOOKS)[number];

/**
 * DRAFT: the most people one room's file may place (the library's "bounded
 * crowds", doc 24). Eight is a guess at what a phone and a 320 px screen hold.
 */
export const MAX_NPCS_PER_ROOM = 8;

function tileOf(o: Record<string, unknown>, where: string, read: Reader): [number, number] {
  const t = o.tile;
  const ok = Array.isArray(t) && t.length === 2 && t.every((n) => Number.isInteger(n));
  if (!ok) read.fail(`${where}.tile`, `must be [column, row], but is ${describe(t)}`);
  return ok ? [t[0] as number, t[1] as number] : [0, 0];
}

function parseRoutine(value: unknown, where: string, read: Reader): RoutineStep[] {
  const out: RoutineStep[] = [];
  if (!Array.isArray(value)) {
    read.fail(where, `must be a list of steps, but is ${describe(value)}`);
    return out;
  }
  const SHAPES = '{ "wait": seconds }, { "face": "left" | "right" }, { "walk-to": column } or { "do": deed, "target": id }';
  value.forEach((item: unknown, i: number) => {
    const w = `${where}[${i}]`;
    const s = read.object(item, w);
    if (!s) return;
    if (s.wait !== undefined) {
      read.only(s, ['wait'], w);
      out.push({ op: 'wait', seconds: read.number(s, 'wait', w, { min: 0, max: 600 }) });
    } else if (s.face !== undefined) {
      read.only(s, ['face'], w);
      if (s.face !== 'left' && s.face !== 'right') read.fail(`${w}.face`, `must be "left" or "right", but is ${describe(s.face)}`);
      out.push({ op: 'face', dir: s.face === 'left' ? -1 : 1 });
    } else if (s['walk-to'] !== undefined) {
      read.only(s, ['walk-to'], w);
      out.push({ op: 'walk-to', column: read.number(s, 'walk-to', w, { min: 0, integer: true }) });
    } else if (s.do !== undefined) {
      read.only(s, ['do', 'target'], w);
      out.push({ op: 'do', deed: read.string(s, 'do', w), target: s.target === undefined ? null : read.string(s, 'target', w) });
    } else read.fail(w, `is not a routine step: use ${SHAPES}`);
  });
  if (out.length > 0 && !out.some((s) => s.op === 'wait' && s.seconds > 0)) {
    // INTENT: a routine loops for ever; without a wait it could spin through
    // every step in one tick, every tick.
    read.fail(where, 'a routine needs at least one { "wait": seconds } step longer than 0');
  }
  return out;
}

declare module '../types.ts' {
  interface Content {
    placements: Record<string, Placements>;
  }
}

const kind: ContentKind = {
  id: 'placements',
  source: { dir: 'placements' },
  parse(raw, read) {
    const o = read.object(raw, '');
    if (!o) return null;
    read.only(o, ['id', 'room', 'place', 'things'], '');
    const out: Placements = { id: read.string(o, 'id', ''), room: read.string(o, 'room', ''), place: [] };
    const badId = (id: string): boolean => id !== '' && !ID_PATTERN.test(id);
    const NOT_AN_ID = 'is not a valid id: use lower-case letters, digits and dashes, starting with a letter';
    if (o.things !== undefined) {
      out.things = [];
      if (!Array.isArray(o.things)) read.fail('things', `must be a list, but is ${describe(o.things)}`);
      else {
        o.things.forEach((item: unknown, i: number) => {
          const w = `things[${i}]`;
          const t = read.object(item, w);
          if (!t) return;
          read.only(t, ['id', 'tile', 'deed', 'keeper', 'once', 'look', 'side'], w);
          const id = read.string(t, 'id', w);
          if (badId(id)) read.fail(`${w}.id`, `"${id}" ${NOT_AN_ID}`);
          if (out.things!.some((q) => q.id === id)) read.fail(`${w}.id`, `"${id}" is placed twice in this file`);
          if (t.once !== undefined && typeof t.once !== 'boolean') read.fail(`${w}.once`, `must be true or false, but is ${describe(t.once)}`);
          if (!THING_LOOKS.includes(t.look as ThingLook)) read.fail(`${w}.look`, `must be one of ${THING_LOOKS.join(', ')}, but is ${describe(t.look)}`);
          const thing: PlacedThing = { id, tile: tileOf(t, w, read), deed: read.string(t, 'deed', w), once: t.once === true, look: THING_LOOKS.includes(t.look as ThingLook) ? (t.look as ThingLook) : 'goods' };
          if (t.keeper !== undefined) thing.keeper = read.string(t, 'keeper', w);
          if (t.side !== undefined) {
            if (t.side === 'good' || t.side === 'bad') thing.side = t.side;
            else read.fail(`${w}.side`, `must be "good" or "bad", but is ${describe(t.side)}`);
          }
          // A bell is a call point (docs/mechanisms/npc-response.md): using it breaks it, so it must be a once thing.
          if (thing.look === 'bell' && !thing.once) read.fail(`${w}.once`, 'a bell must have "once": true (a hero using it breaks it, and a broken bell stays broken)');
          out.things!.push(thing);
        });
      }
    }
    if (out.room !== out.id) read.fail('room', `must be the room this file is named after ("${out.id}"), but is ${describe(o.room)}`);
    if (!Array.isArray(o.place)) {
      read.fail('place', `must be a list, but is ${describe(o.place)}`);
      return out;
    }
    o.place.forEach((item: unknown, i: number) => {
      const w = `place[${i}]`;
      const p = read.object(item, w);
      if (!p) return;
      read.only(p, ['id', 'character', 'tile', 'npc', 'routine'], w);
      const id = read.string(p, 'id', w);
      if (id && !ID_PATTERN.test(id)) read.fail(`${w}.id`, `"${id}" is not a valid id: use lower-case letters, digits and dashes, starting with a letter`);
      if (out.place.some((q) => q.id === id)) read.fail(`${w}.id`, `"${id}" is placed twice in this file`);
      const t = p.tile;
      const ok = Array.isArray(t) && t.length === 2 && t.every((n) => Number.isInteger(n));
      if (!ok) read.fail(`${w}.tile`, `must be [column, row], but is ${describe(t)}`);
      const entry: Placements['place'][number] = { id, character: read.string(p, 'character', w), tile: ok ? [t[0] as number, t[1] as number] : [0, 0] };
      if (p.npc !== undefined) entry.npc = read.string(p, 'npc', w);
      if (p.routine !== undefined) {
        entry.routine = parseRoutine(p.routine, `${w}.routine`, read);
        if (p.npc === undefined) read.fail(`${w}.routine`, 'only a person has a routine: give this entry an "npc" too');
      }
      if ((out.things ?? []).some((q) => q.id === id)) read.fail(`${w}.id`, `"${id}" is also the id of one of this file's things`);
      out.place.push(entry);
    });
    const people = out.place.filter((p) => p.npc !== undefined).length;
    if (people > MAX_NPCS_PER_ROOM) read.fail('place', `places ${people} people, but one room may hold at most ${MAX_NPCS_PER_ROOM}`);
    return out;
  },
  check(content, fail) {
    const seen: Record<string, string> = {};
    const deeds = new Set(Object.values(content.rules).flatMap((f) => f.deeds));
    for (const pl of Object.values(content.placements)) {
      const file = `content/placements/${pl.id}.json`;
      const room = content.rooms[pl.room];
      if (!room) {
        fail(file, 'room', `no room "${pl.room}" (rooms: ${known(content.rooms)})`);
        continue;
      }
      pl.place.forEach((p, i) => {
        const w = `place[${i}]`;
        if (seen[p.id]) fail(file, `${w}.id`, `"${p.id}" is already placed by ${seen[p.id]}; an id must be unique across every room`);
        else seen[p.id] = file;
        if (!(p.character in content.characters)) fail(file, `${w}.character`, `no character "${p.character}" (characters: ${known(content.characters)})`);
        const [tx, ty] = p.tile;
        if (tx < 0 || ty < 0 || tx >= room.w || ty >= room.h) fail(file, `${w}.tile`, `[${tx}, ${ty}] is outside room "${room.id}", which is ${room.w} by ${room.h} tiles`);
        if (p.npc !== undefined && !(p.npc in content.npcs)) fail(file, `${w}.npc`, `no NPC kind "${p.npc}" (kinds: ${known(content.npcs)})`);
        (p.routine ?? []).forEach((s, k) => {
          const ws = `${w}.routine[${k}]`;
          if (s.op === 'walk-to' && s.column >= room.w) fail(file, `${ws}.walk-to`, `column ${s.column} is outside room "${room.id}", which is ${room.w} tiles wide`);
          if (s.op !== 'do') return;
          if (!deeds.has(s.deed)) fail(file, `${ws}.do`, `no deed "${s.deed}" (deeds are listed under "deeds" in a content/rules/ file: ${[...deeds].sort().join(', ') || '(none yet)'})`);
          if (s.target !== null && !pl.place.some((q) => q.id === s.target)) fail(file, `${ws}.target`, `"${s.target}" is not a body this file places`);
        });
      });
      (pl.things ?? []).forEach((t, i) => {
        const w = `things[${i}]`;
        if (seen[t.id]) fail(file, `${w}.id`, `"${t.id}" is already placed by ${seen[t.id]}; an id must be unique across every room`);
        else seen[t.id] = file;
        const [tx, ty] = t.tile;
        if (tx < 0 || ty < 0 || tx >= room.w || ty >= room.h) fail(file, `${w}.tile`, `[${tx}, ${ty}] is outside room "${room.id}", which is ${room.w} by ${room.h} tiles`);
        if (!deeds.has(t.deed)) fail(file, `${w}.deed`, `no deed "${t.deed}" (deeds are listed under "deeds" in a content/rules/ file: ${[...deeds].sort().join(', ') || '(none yet)'})`);
        if (t.keeper !== undefined && !pl.place.some((q) => q.id === t.keeper && q.npc !== undefined)) {
          fail(file, `${w}.keeper`, `"${t.keeper}" is not a person this file places (an entry of "place" with an "npc")`);
        }
      });
    }
  },
};
export default kind;
