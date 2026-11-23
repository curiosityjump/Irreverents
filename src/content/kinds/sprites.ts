import { readImage, requireDraftNote } from '../art-fields.ts';
import { describe } from '../reader.ts';
import type { ContentKind, Reader } from '../types.ts';

/**
 * content/sprites/<character id>.json: the sprite sheet that replaces a
 * character kind's graybox rectangle. Named after the character kind it
 * draws, so adding one edits no other file (docs/architecture.md, "Where
 * art plugs in"). Collision never depends on it.
 * The shape is the art contract's (docs/mechanisms/art-pipeline.md,
 * "Characters and things"), extended additively from the first three
 * states. Notes: docs/mechanisms/art-foundation.md.
 */

/** Every animation state the contract names. `idle`, `run`, `air` are required; the rest fall back (the contract says to what). */
export const SPRITE_STATES = [
  'idle', 'run', 'air', 'jump', 'fall', 'attack', 'grab', 'carry', 'carryRun', 'throw',
  'hurt', 'down', 'held', 'hide', 'talk', 'flap',
] as const;
export type SpriteState = (typeof SPRITE_STATES)[number];
const REQUIRED: SpriteState[] = ['idle', 'run', 'air'];
/** The moods a person can show (2 unsettled, 3 enraged); mood 1 is the normal frames. */
export const SPRITE_MOODS = ['2', '3'] as const;

export type SpriteFrames = { idle: number[]; run: number[]; air: number[] } & Partial<Record<SpriteState, number[]>>;

export interface Sprite {
  id: string;
  /** Path under assets/, e.g. "sprites/heroes/grappler.png". */
  image: string;
  /** Size of one frame in the sheet (frames are numbered row by row from 0). */
  cell: { w: number; h: number };
  /** Where the collision box's top-left corner sits inside a frame. */
  anchor: { x: number; y: number };
  /** Frames shown per second. */
  fps: number;
  frames: SpriteFrames;
  /** Frames per second for one state, overriding `fps`. Empty when the file has none. */
  fpsBy: Partial<Record<SpriteState, number>>;
  /** Frame lists that replace the normal ones while a person is in mood "2" or "3". Empty when the file has none. */
  moods: Partial<Record<(typeof SPRITE_MOODS)[number], Partial<Record<SpriteState, number[]>>>>;
}

declare module '../types.ts' {
  interface Content {
    sprites: Record<string, Sprite>;
  }
}

function frameList(read: Reader, v: unknown, where: string): number[] | null {
  if (Array.isArray(v) && v.length > 0 && v.every((n) => Number.isInteger(n) && n >= 0)) return v as number[];
  read.fail(where, `must be a non-empty list of frame numbers (whole numbers from 0), but is ${describe(v)}`);
  return null;
}

/** Reads a { state: frames } block; `required` states must be there. */
function stateLists(read: Reader, raw: unknown, where: string, required: SpriteState[]): Partial<Record<SpriteState, number[]>> {
  const out: Partial<Record<SpriteState, number[]>> = {};
  const o = read.object(raw, where);
  if (!o) return out;
  read.only(o, [...SPRITE_STATES], where);
  for (const s of SPRITE_STATES) {
    if (o[s] === undefined) {
      if (required.includes(s)) read.fail(`${where}.${s}`, 'is required (idle, run and air must each have frames)');
      continue;
    }
    const l = frameList(read, o[s], `${where}.${s}`);
    if (l) out[s] = l;
  }
  return out;
}

const kind: ContentKind = {
  id: 'sprites',
  source: { dir: 'sprites' },
  parse(raw, read) {
    const o = read.object(raw, '');
    if (!o) return null;
    read.only(o, ['id', 'image', 'cell', 'anchor', 'fps', 'frames', 'fpsBy', 'moods'], '');
    requireDraftNote(read, o);
    const cell = read.object(o.cell, 'cell') ?? {};
    const anchor = read.object(o.anchor, 'anchor') ?? {};
    const frames = stateLists(read, o.frames, 'frames', REQUIRED);
    const fpsBy: Partial<Record<SpriteState, number>> = {};
    if (o.fpsBy !== undefined) {
      const f = read.object(o.fpsBy, 'fpsBy');
      if (f) {
        read.only(f, [...SPRITE_STATES], 'fpsBy');
        for (const s of SPRITE_STATES) if (f[s] !== undefined) fpsBy[s] = read.number(f, s, 'fpsBy', { min: 1, max: 60 });
      }
    }
    const moods: Sprite['moods'] = {};
    if (o.moods !== undefined) {
      const m = read.object(o.moods, 'moods');
      if (m) {
        read.only(m, [...SPRITE_MOODS], 'moods');
        for (const mood of SPRITE_MOODS) if (m[mood] !== undefined) moods[mood] = stateLists(read, m[mood], `moods.${mood}`, []);
      }
    }
    const out: Sprite = {
      id: read.string(o, 'id', ''),
      image: readImage(read, o, 'image', ''),
      cell: { w: read.number(cell, 'w', 'cell', { min: 1, max: 512, integer: true }), h: read.number(cell, 'h', 'cell', { min: 1, max: 512, integer: true }) },
      anchor: { x: read.number(anchor, 'x', 'anchor', { min: 0, max: 512, integer: true }), y: read.number(anchor, 'y', 'anchor', { min: 0, max: 512, integer: true }) },
      fps: read.number(o, 'fps', '', { min: 1, max: 60 }),
      frames: { idle: [0], run: [0], air: [0], ...frames },
      fpsBy,
      moods,
    };
    return out;
  },
  check(content, fail) {
    for (const s of Object.values(content.sprites)) {
      const file = `content/sprites/${s.id}.json`;
      const ch = content.characters[s.id];
      if (!ch) {
        fail(file, 'id', `no character kind "${s.id}": a sprite file is named after the character kind it draws`);
        continue;
      }
      // INTENT (the contract): the picture may overhang the box, never the other way round; the box is the truth.
      if (s.anchor.x + ch.box.w > s.cell.w || s.anchor.y + ch.box.h > s.cell.h) {
        fail(file, 'anchor', `the collision box (${ch.box.w}×${ch.box.h} at ${s.anchor.x},${s.anchor.y}) does not fit inside a ${s.cell.w}×${s.cell.h} cell`);
      }
    }
  },
};
export default kind;
