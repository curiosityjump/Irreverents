import { describe, known } from '../reader.ts';
import type { ContentKind } from '../types.ts';

/**
 * content/stages/<id>.json (Step 22; docs/mechanisms/stages.md): one level
 * played as a stage, the owner's "one level where there is a whole outpost
 * you need to navigate though without dying ... pushes you back to the
 * entrance to start over ... Stage cleared, with a star rating and some
 * stats". A stage names its level (content/levels/; its rooms are the
 * stage's rooms), its entrance (where a beaten hero lands: the same door
 * as the level's defeat file), its end (a box of tiles in one of its rooms:
 * reaching it clears the stage), and three star thresholds.
 *
 * INTENT (docs/plan/step-22.md, "This is the owner's own exception"): a
 * stage is the one place a room's state is put back (D-077 everywhere
 * else); `on: false` is the game before Step 22, the level as any other.
 * DRAFT (docs/decisions-log.md, "Step 22"): every field and number here is
 * a first pass.
 */
export interface Stage {
  id: string;
  /** The switch: false is the level as before Step 22 (no run, nothing put back). */
  on: boolean;
  /** The level (content/levels/) played as this stage: its rooms are the stage's rooms. */
  level: string;
  /** Where the stage starts: a room of the level and a door of it (a beaten hero lands there). */
  entrance: { room: string; door: string };
  /** The end: reaching this box of tiles (inclusive) in `room` clears the stage. */
  end: { room: string; from: [number, number]; to: [number, number] };
  /**
   * The star thresholds, in seconds (DRAFT, measured by scripted runs:
   * docs/plan/step-22.md, "Builder notes"): `good` is the time under which a
   * clear earns the second star, `best` a faster time shown as the target.
   */
  stars: { good: number; best: number };
}

declare module '../types.ts' {
  interface Content {
    stages: Record<string, Stage>;
  }
}

function tile(read: Parameters<ContentKind['parse']>[1], v: unknown, at: string): [number, number] {
  if (Array.isArray(v) && v.length === 2 && v.every((n) => Number.isInteger(n) && (n as number) >= 0)) return [v[0] as number, v[1] as number];
  read.fail(at, `must be [column, row], but is ${describe(v)}`);
  return [0, 0];
}

const kind: ContentKind = {
  id: 'stages',
  source: { dir: 'stages' },
  parse(raw, read) {
    const o = read.object(raw, '');
    if (!o) return null;
    read.only(o, ['//', 'id', 'on', 'level', 'entrance', 'end', 'stars'], '');
    if (typeof o.on !== 'boolean') read.fail('on', `must be true or false, but is ${describe(o.on)}`);
    const out: Stage = {
      id: read.string(o, 'id', ''),
      on: o.on === true,
      level: read.string(o, 'level', ''),
      entrance: { room: '', door: '' },
      end: { room: '', from: [0, 0], to: [0, 0] },
      stars: { good: 0, best: 0 },
    };
    const en = read.object(o.entrance, 'entrance');
    if (en) {
      read.only(en, ['room', 'door'], 'entrance');
      out.entrance = { room: read.string(en, 'room', 'entrance'), door: read.string(en, 'door', 'entrance') };
    }
    const end = read.object(o.end, 'end');
    if (end) {
      read.only(end, ['room', 'from', 'to'], 'end');
      out.end = { room: read.string(end, 'room', 'end'), from: tile(read, end.from, 'end.from'), to: tile(read, end.to, 'end.to') };
      if (out.end.from[0] > out.end.to[0] || out.end.from[1] > out.end.to[1]) read.fail('end', '"from" must be the top-left tile and "to" the bottom-right');
    }
    const st = read.object(o.stars, 'stars');
    if (st) {
      read.only(st, ['good', 'best'], 'stars');
      out.stars = { good: read.number(st, 'good', 'stars', { min: 1, max: 36000 }), best: read.number(st, 'best', 'stars', { min: 1, max: 36000 }) };
      if (out.stars.best > out.stars.good) read.fail('stars', `"best" (${out.stars.best} s) must not be slower than "good" (${out.stars.good} s)`);
    }
    return out;
  },
  check(content, fail) {
    const owner = new Map<string, string>();
    for (const s of Object.values(content.stages ?? {})) {
      const file = `content/stages/${s.id}.json`;
      const level = content.levels?.[s.level];
      if (!level) {
        fail(file, 'level', `no level "${s.level}" (levels: ${known(content.levels ?? {})})`);
        continue;
      }
      // One stage per room: a room's state is put back by its one stage.
      for (const r of level.rooms) {
        const other = owner.get(r);
        if (other) fail(file, 'level', `room "${r}" is already in stage "${other}"`);
        owner.set(r, s.id);
        if (content.cantina?.[r]) fail(file, 'level', `"${r}" is a cantina: nothing is put back there`);
      }
      const er = content.rooms[s.entrance.room];
      if (!level.rooms.includes(s.entrance.room) || !er) fail(file, 'entrance.room', `"${s.entrance.room}" is not a room of level "${s.level}" (${level.rooms.join(', ')})`);
      else if (!er.doors.some((d) => d.id === s.entrance.door)) fail(file, 'entrance.door', `room "${er.id}" has no door "${s.entrance.door}" (doors: ${er.doors.map((d) => d.id).join(', ')})`);
      const room = content.rooms[s.end.room];
      if (!level.rooms.includes(s.end.room) || !room) fail(file, 'end.room', `"${s.end.room}" is not a room of level "${s.level}" (${level.rooms.join(', ')})`);
      else if (s.end.to[0] >= room.w || s.end.to[1] >= room.h) fail(file, 'end.to', `[${s.end.to.join(', ')}] is outside room "${room.id}", which is ${room.w} by ${room.h} tiles`);
    }
  },
};
export default kind;
