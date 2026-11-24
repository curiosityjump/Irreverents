import { describe, isRecord } from '../reader.ts';
import type { ContentKind, Reader } from '../types.ts';

/**
 * content/sounds/<id>.json: what the game sounds like, as data
 * (docs/mechanisms/sound.md). Two shapes share the folder:
 *
 * - an **effect**: the file is named after a moment of play (MOMENTS
 *   below) and says which files play for it, how loud, how far it carries;
 * - a **tune**: the file is named `tune-<name>` and holds a short loop of
 *   notes for a tiny square/triangle/noise synth, and the rooms it plays in.
 *
 * Which moment happened is the page's code (src/client/audio/moments.ts);
 * what it sounds like is only this data.
 * DRAFT: every number in the files is a first guess made without ears
 * (nobody who wrote them could hear); the owner judges by playing.
 */
export interface SoundEffect {
  id: string;
  type: 'effect';
  /** Paths under assets/; one is picked per play, by tick (never at random). */
  files: string[];
  /** 0 to 1, before the effects mix. */
  volume: number;
  /** Playback speed, 1 as delivered: above 1 is higher and shorter, below 1 lower and longer. */
  rate: number;
  /** How far the pitch may stray either way, as a fraction (0.05 = ±5%), picked by tick. */
  pitch: number;
  /** The same moment never starts again sooner than this. */
  gapMs: number;
  /** Whether it fades with distance from the listener, and is silent past `range`. */
  distance: boolean;
  /** Pixels; with `distance`, where it falls silent. */
  range: number;
  /** Whether it is heard from another room than the listener's (at half volume). */
  otherRooms: boolean;
  /** For the impact moments: the slowest impact (pixels per second) that plays this one. */
  minSpeed: number;
}

export interface TuneTrack {
  wave: 'square' | 'triangle' | 'noise';
  /** 0 to 1, within the tune. */
  volume: number;
  /**
   * One token per step, separated by spaces; `|` is ignored (bar lines).
   * A note (C4, F#5, Bb3) starts a note; `-` holds the one before; `.` is
   * silence. On a noise track, `x` is a hit and `o` a soft one.
   */
  steps: string[];
}

export interface Tune {
  id: string;
  type: 'tune';
  /** Room ids it plays in. A room is in one tune at most; a room in none is quiet. */
  rooms: string[];
  bpm: number;
  stepsPerBeat: number;
  /** 0 to 1, before the music mix. */
  volume: number;
  tracks: TuneTrack[];
}

export type Sound = SoundEffect | Tune;

/**
 * Every moment the page can tell happened, and what tells it. An effect
 * file must be named after one of these; a moment with no file is silent.
 * INTENT: additive only: these ids are in deployed content.
 */
export const MOMENTS: Record<string, string> = {
  footstep: 'a body walking on the ground (from its motion: no event)',
  jump: 'jumped',
  flap: 'the flyer flapped in the air (flapped)',
  land: 'landed',
  swing: 'an attack swung, landed or not (attacked)',
  hit: 'an attack landed (hit)',
  hurt: 'an attack landed on the listener (hit, target is mine)',
  impact: 'a flying body struck something, softly (impact, below heavy-hit)',
  'heavy-hit': 'a flying body struck something hard (impact, minSpeed)',
  slam: 'a flying body struck something very hard (impact, minSpeed): the biggest sound in the game',
  grab: 'picked up a person (grabbed)',
  pickup: 'picked up a thing that is nobody (grabbed)',
  'grab-refused': 'a grab found only bodies too heavy (grab-refused)',
  throw: 'thrown',
  door: 'a body went through a door (changed-room)',
  bell: 'a call for help completed (call-completed)',
  'call-windup': 'someone started calling for help (call-started)',
  'alarm-rising': 'an area’s alert went up (alert-changed)',
  'mood-calm': 'a person went back to business as usual (mood-changed to 1)',
  'mood-confused': 'a person became confused or distressed (mood-changed to 2)',
  'mood-rage': 'a person flew into a rage (mood-changed to 3)',
  calmed: 'a distressed person saw something expected and calmed at once: "Yup! Just as expected!" (mood-changed 2 to 1, cause expected:)',
  voice: 'the king talking: gibberish syllables while each line of his speech is new (from c.audience)',
  bark: 'a person said something over their head (from c.npc.bark)',
  'break-wall': 'a breakable wall gave way (part-broken, look wall)',
  'break-window': 'a window broke (part-broken, look window)',
  'plate-down': 'a pressure plate went down (plate-down)',
  'plate-up': 'a pressure plate came up (plate-up)',
  'gate-open': 'a gate opened (gate-opened)',
  'gate-close': 'a gate closed (gate-closed)',
  switch: 'the listener switched hero (switched)',
  'switch-refused': 'switch pressed and nothing changed (switch-refused)',
  'ui-tap': 'the sound button turned sound on',
  'clean-getaway': 'Step 19: a prize carried out of its place with nobody of the place ever having seen the heroes (heard everywhere)',
  'secret-found': 'a hidden place entered for the first time, or a piece of a set found (place-found, piece-found; Step 14 slice B)',
  recruited: 'a captive hero was freed, anywhere in this world (recruited): the fanfare (Step 13)',
  'heart-lost': 'Step 21: a hero of the party lost a heart, anywhere in this world (heart-lost)',
  'game-over': 'Step 21: every hero of the party is out of hearts: GAME OVER, back to the cantina (game-over-coming)',
};

const NOTE = /^([A-G])(#|b)?([0-8])$/;
/** Semitones above A4 of a note token, or null if it is not one. */
export function noteSemitones(token: string): number | null {
  const m = NOTE.exec(token);
  if (!m) return null;
  const base = { C: -9, D: -7, E: -5, F: -4, G: -2, A: 0, B: 2 }[m[1] as 'C'];
  return base + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + (Number(m[3]) - 4) * 12;
}

function bool(read: Reader, o: Record<string, unknown>, field: string, fallback: boolean): boolean {
  const v = o[field];
  if (v === undefined) return fallback;
  if (typeof v !== 'boolean') read.fail(field, `must be true or false, but is ${describe(v)}`);
  return v === true;
}

declare module '../types.ts' {
  interface Content {
    sounds: Record<string, Sound>;
  }
}

const kind: ContentKind = {
  id: 'sounds',
  source: { dir: 'sounds' },
  parse(raw, read) {
    const o = read.object(raw, '');
    if (!o) return null;
    const id = typeof o.id === 'string' ? o.id : '';
    if (id.startsWith('tune-')) {
      read.only(o, ['id', 'rooms', 'bpm', 'stepsPerBeat', 'volume', 'tracks'], '');
      const tune: Tune = {
        id,
        type: 'tune',
        rooms: read.stringList(o, 'rooms', ''),
        bpm: read.number(o, 'bpm', '', { min: 30, max: 300 }),
        stepsPerBeat: read.number(o, 'stepsPerBeat', '', { min: 1, max: 8, integer: true }),
        volume: read.number(o, 'volume', '', { min: 0, max: 1 }),
        tracks: [],
      };
      if (!Array.isArray(o.tracks) || o.tracks.length === 0) {
        read.fail('tracks', `must be a list of at least one track, but is ${describe(o.tracks)}`);
        return tune;
      }
      o.tracks.forEach((t: unknown, i: number) => {
        const w = `tracks[${i}]`;
        if (!isRecord(t)) return read.fail(w, `must be { "wave", "volume", "notes" }, but is ${describe(t)}`);
        read.only(t, ['wave', 'volume', 'notes'], w);
        const wave = read.string(t, 'wave', w);
        if (wave !== 'square' && wave !== 'triangle' && wave !== 'noise') read.fail(`${w}.wave`, `must be "square", "triangle" or "noise", but is "${wave}"`);
        const notes = read.string(t, 'notes', w);
        const steps = notes.split(/\s+/).filter((s) => s !== '' && s !== '|');
        steps.forEach((s, k) => {
          const ok = s === '.' || s === '-' || (wave === 'noise' ? s === 'x' || s === 'o' : noteSemitones(s) !== null);
          if (!ok) read.fail(`${w}.notes`, `step ${k + 1} is "${s}": use a note like C4 or F#5${wave === 'noise' ? ' (on noise: x or o)' : ''}, "-" to hold, "." for silence`);
        });
        if (steps.length === 0) read.fail(`${w}.notes`, 'has no steps');
        tune.tracks.push({ wave: wave as TuneTrack['wave'], volume: read.number(t, 'volume', w, { min: 0, max: 1 }), steps });
      });
      const lengths = new Set(tune.tracks.map((t) => t.steps.length));
      if (lengths.size > 1) read.fail('tracks', `every track must have the same number of steps, so the loop stays in time; they have ${[...lengths].join(', ')}`);
      return tune;
    }
    read.only(o, ['id', 'files', 'volume', 'rate', 'pitch', 'gapMs', 'distance', 'range', 'otherRooms', 'minSpeed'], '');
    if (id !== '' && !(id in MOMENTS)) read.fail('id', `"${id}" is not a moment the game can tell (src/content/kinds/sounds.ts, MOMENTS: ${Object.keys(MOMENTS).join(', ')}), and not a tune ("tune-<name>")`);
    const files = read.stringList(o, 'files', '');
    if (files.length === 0) read.fail('files', 'must name at least one file under assets/');
    for (const f of files) if (!/^[a-z0-9][a-z0-9/_.-]*\.(wav|mp3|ogg)$/.test(f) || f.includes('..')) read.fail('files', `"${f}" must be a path under assets/ ending in .wav, .mp3 or .ogg`);
    return {
      id,
      type: 'effect',
      files,
      volume: read.number(o, 'volume', '', { min: 0, max: 1 }),
      rate: o.rate === undefined ? 1 : read.number(o, 'rate', '', { min: 0.25, max: 4 }),
      pitch: o.pitch === undefined ? 0 : read.number(o, 'pitch', '', { min: 0, max: 0.5 }),
      gapMs: o.gapMs === undefined ? 0 : read.number(o, 'gapMs', '', { min: 0, max: 60000 }),
      distance: bool(read, o, 'distance', true),
      range: o.range === undefined ? 260 : read.number(o, 'range', '', { min: 1, max: 100000 }),
      otherRooms: bool(read, o, 'otherRooms', false),
      minSpeed: o.minSpeed === undefined ? 0 : read.number(o, 'minSpeed', '', { min: 0, max: 100000 }),
    } satisfies SoundEffect;
  },
  check(content, fail) {
    const taken: Record<string, string> = {};
    for (const s of Object.values(content.sounds ?? {})) {
      if (s.type !== 'tune') continue;
      for (const room of s.rooms) {
        const file = `content/sounds/${s.id}.json`;
        // INTENT: an unknown room is not refused here: the room checks' controls
        // (controls/rooms/) judge maps that leave the real rooms out. Whether
        // every tune's rooms exist is scripts/checks/sound.ts's, on the real map.
        if (taken[room]) fail(file, 'rooms', `"${room}" is already in ${taken[room]}: a room plays one tune`);
        else taken[room] = s.id;
      }
    }
  },
};
export default kind;
