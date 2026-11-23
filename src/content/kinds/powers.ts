import { describe, known } from '../reader.ts';
import { lookTable } from './looks.ts';
import type { ContentKind, Reader } from '../types.ts';

/**
 * content/powers/<id>.json: a power a hero can take and lose, Kirby-style
 * (Step 9; D-009, D-081; docs/mechanisms/powers.md). A power is a numbers
 * overlay on top of whoever holds it, plus any verbs it lends. It never
 * replaces who the hero is (D-082). The code that applies it is
 * src/sim/powers.ts. The systems named `power-*` give it, knock it loose and
 * fade it.
 *
 * DRAFT: every field, and both powers there are (O-005 is OPEN: which powers,
 * slots, thresholds). The id says what the power does to the numbers. The
 * shown name is data (`name`). Adding a power is one file.
 */
export interface Power {
  id: string;
  /** Shown to a player. A name is data: never put it in an id. */
  name: string;
  /** The look drawn for it: its orb, the icon by the holder's face (content/looks/). */
  icon: string;
  /** Numbers raised to at least this, whoever holds it (a character tuning number name to its floor). */
  atLeast: Record<string, number>;
  /** Numbers multiplied by this, whoever holds it. Applied before `atLeast`. */
  times: Record<string, number>;
  /** Verb ids it lends a holder who lacks them (src/sim/verbs/). Each of their numbers must be in `atLeast`. */
  lends: string[];
  /** Who carries it: placed entity ids (content/placements/) or character kind ids. Laid flat, a carrier drops it as an orb. */
  carriers: string[];
  /** Where it stands for good, to be taken by touch (D-080: very rare ones in one or few spots you can return to). */
  sources: { id: string; room: string; tile: [number, number] }[];
  /** Seconds an orb knocked loose lies before it fades. */
  fade: number;
  /** Whether a carrier has it again when it gets up. */
  regain: boolean;
}

declare module '../types.ts' {
  interface Content {
    powers: Record<string, Power>;
  }
}

function numbers(read: Reader, value: unknown, where: string): Record<string, number> {
  const out: Record<string, number> = {};
  if (value === undefined) return out;
  const o = read.object(value, where);
  if (!o) return out;
  for (const [k, v] of Object.entries(o)) {
    if (k === '//') continue;
    if (typeof v === 'number' && Number.isFinite(v) && v >= 0) out[k] = v;
    else read.fail(`${where}.${k}`, `must be a number from 0, but is ${describe(v)}`);
  }
  return out;
}

const kind: ContentKind = {
  id: 'powers',
  source: { dir: 'powers' },
  parse(raw, read) {
    const o = read.object(raw, '');
    if (!o) return null;
    read.only(o, ['id', 'name', 'icon', 'atLeast', 'times', 'lends', 'carriers', 'sources', 'fade', 'regain'], '');
    const out: Power = {
      id: read.string(o, 'id', ''),
      name: read.string(o, 'name', ''),
      icon: read.string(o, 'icon', ''),
      atLeast: numbers(read, o.atLeast, 'atLeast'),
      times: numbers(read, o.times, 'times'),
      lends: o.lends === undefined ? [] : read.stringList(o, 'lends', ''),
      carriers: o.carriers === undefined ? [] : read.stringList(o, 'carriers', ''),
      sources: [],
      fade: read.number(o, 'fade', '', { min: 0.5, max: 120 }),
      regain: o.regain === undefined ? true : o.regain === true,
    };
    if (o.regain !== undefined && typeof o.regain !== 'boolean') read.fail('regain', `must be true or false, but is ${describe(o.regain)}`);
    if (o.sources !== undefined) {
      if (!Array.isArray(o.sources)) read.fail('sources', `must be a list of { "id", "room", "tile" }, but is ${describe(o.sources)}`);
      else
        o.sources.forEach((item: unknown, i: number) => {
          const w = `sources[${i}]`;
          const s = read.object(item, w);
          if (!s) return;
          read.only(s, ['id', 'room', 'tile'], w);
          const t = s.tile;
          const ok = Array.isArray(t) && t.length === 2 && t.every((n) => Number.isInteger(n) && n >= 0);
          if (!ok) read.fail(`${w}.tile`, `must be [column, row], but is ${describe(t)}`);
          out.sources.push({ id: read.string(s, 'id', w), room: read.string(s, 'room', w), tile: ok ? [t[0], t[1]] : [0, 0] });
        });
    }
    return out;
  },
  check(content, fail) {
    const looks = lookTable(content);
    const sourceOwner = new Map<string, string>();
    const placed = new Set<string>();
    for (const p of Object.values(content.placements ?? {})) for (const q of p.place) placed.add(q.id);
    for (const p of Object.values(content.powers).sort((a, b) => (a.id < b.id ? -1 : 1))) {
      const file = `content/powers/${p.id}.json`;
      if (!looks.has(p.icon)) fail(file, 'icon', `no look "${p.icon}" (content/looks/; the cut ones for powers are in content/looks/powers.json)`);
      p.carriers.forEach((c, i) => {
        if (!placed.has(c) && !(c in content.characters)) fail(file, `carriers[${i}]`, `"${c}" is neither a placed entity id (content/placements/) nor a character kind (characters: ${known(content.characters)})`);
      });
      p.sources.forEach((s, i) => {
        const w = `sources[${i}]`;
        const other = sourceOwner.get(s.id);
        if (other !== undefined) fail(file, `${w}.id`, `source "${s.id}" is already a source of power "${other}": source ids are unique across every power`);
        else sourceOwner.set(s.id, p.id);
        const room = content.rooms[s.room];
        if (!room) return fail(file, `${w}.room`, `no room "${s.room}" (rooms: ${known(content.rooms)})`);
        const [tx, ty] = s.tile;
        if (tx >= room.w || ty >= room.h) fail(file, `${w}.tile`, `[${tx}, ${ty}] is outside room "${room.id}", which is ${room.w} by ${room.h} tiles`);
      });
    }
  },
};
export default kind;
