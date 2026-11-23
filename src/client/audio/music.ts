// The music: a tune from content/sounds/tune-*.json played by a tiny synth
// (square, triangle and noise, as a GBA-era chip would), scheduled a
// fraction of a second ahead on the audio clock. Writeup: docs/mechanisms/sound.md.
//
// DRAFT: written by someone who cannot hear. Quiet on purpose, under the
// effects (docs/audio-design.md rule 2: "quiet by default, so impact can be
// loud"); every level here is a first guess for the owner's ear.
import type { Content } from '../../content/types.ts';
import { noteSemitones } from '../../content/kinds/sounds.ts';
import type { Tune } from '../../content/kinds/sounds.ts';

/** DRAFT: the whole music mix, before each tune's and track's own volume. */
const MUSIC_LEVEL = 0.3;
/** DRAFT: how long one tune fades out and the next fades in, seconds. */
const FADE_S = 0.8;
/** How far ahead notes are put on the audio clock. Short, so a hidden page stops promptly. */
const AHEAD_S = 0.25;

interface Note {
  /** Semitones above A4, or for noise 1 (hit) or 0.5 (soft). */
  pitch: number;
  /** In steps. */
  len: number;
}

interface Prepared {
  tune: Tune;
  stepS: number;
  length: number;
  /** For each track, the note starting at each step, or null. */
  tracks: { wave: Tune['tracks'][number]['wave']; volume: number; at: (Note | null)[] }[];
}

function prepare(tune: Tune): Prepared {
  const length = tune.tracks[0]?.steps.length ?? 0;
  return {
    tune,
    stepS: 60 / tune.bpm / tune.stepsPerBeat,
    length,
    tracks: tune.tracks.map((t) => {
      const at: (Note | null)[] = t.steps.map(() => null);
      t.steps.forEach((s, i) => {
        if (s === '.' || s === '-') return;
        let len = 1;
        while (t.steps[(i + len) % length] === '-' && len < length) len++;
        const pitch = t.wave === 'noise' ? (s === 'x' ? 1 : 0.5) : noteSemitones(s)!;
        at[i] = { pitch, len };
      });
      return { wave: t.wave, volume: t.volume, at };
    }),
  };
}

export function createMusic(content: Content) {
  const byRoom = new Map<string, Prepared>();
  for (const s of Object.values(content.sounds ?? {})) {
    if (s.type !== 'tune') continue;
    const p = prepare(s);
    if (p.length === 0) continue;
    for (const room of s.rooms) byRoom.set(room, p);
  }

  let noise: AudioBuffer | null = null;
  let playing: { p: Prepared; gain: GainNode; step: number; next: number } | null = null;
  let notes = 0;

  const noiseBuffer = (ctx: AudioContext): AudioBuffer => {
    if (noise) return noise;
    // INTENT: nothing random (CLAUDE.md, "Nothing random"): the noise is a fixed sequence.
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.5), ctx.sampleRate);
    const d = buf.getChannelData(0);
    let x = 0x2545f491;
    for (let i = 0; i < d.length; i++) {
      x ^= x << 13;
      x ^= x >>> 17;
      x ^= x << 5;
      d[i] = ((x >>> 0) / 0xffffffff) * 2 - 1;
    }
    return (noise = buf);
  };

  const sound = (ctx: AudioContext, out: GainNode, wave: Prepared['tracks'][number]['wave'], n: Note, volume: number, t: number, stepS: number): void => {
    const g = ctx.createGain();
    g.connect(out);
    if (wave === 'noise') {
      const src = ctx.createBufferSource();
      src.buffer = noiseBuffer(ctx);
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = n.pitch >= 1 ? 5000 : 8000;
      const dur = n.pitch >= 1 ? 0.07 : 0.035;
      g.gain.setValueAtTime(volume * n.pitch, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.connect(hp).connect(g);
      src.start(t, (notes * 0.037) % 0.4);
      src.stop(t + dur + 0.01);
      src.onended = () => g.disconnect();
      return;
    }
    const osc = ctx.createOscillator();
    osc.type = wave;
    osc.frequency.value = 440 * Math.pow(2, n.pitch / 12);
    const dur = Math.max(0.05, n.len * stepS - 0.02);
    // A plucky envelope: quick attack, fall to a sustain, short release.
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(volume, t + 0.006);
    g.gain.setTargetAtTime(volume * 0.55, t + 0.006, 0.08);
    g.gain.setTargetAtTime(0, t + dur, 0.025);
    osc.connect(g);
    osc.start(t);
    osc.stop(t + dur + 0.15);
    osc.onended = () => g.disconnect();
  };

  return {
    /** The tune for a room, or null where it is quiet. */
    tuneFor: (room: string): string => byRoom.get(room)?.tune.id ?? '',
    /** Call every frame with the listener's room; returns the tune playing and how many notes have started. */
    update(live: { ctx: AudioContext; music: GainNode } | null, room: string): { tune: string; notes: number } {
      if (!live) return { tune: playing?.p.tune.id ?? '', notes };
      const { ctx } = live;
      const now = ctx.currentTime;
      const want = byRoom.get(room) ?? null;
      if (playing && playing.p !== want) {
        const g = playing.gain;
        g.gain.cancelScheduledValues(now);
        g.gain.setValueAtTime(g.gain.value, now);
        g.gain.linearRampToValueAtTime(0, now + FADE_S);
        setTimeout(() => g.disconnect(), FADE_S * 1000 + 400);
        playing = null;
      }
      if (!playing && want) {
        const gain = ctx.createGain();
        const level = MUSIC_LEVEL * want.tune.volume;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(level, now + FADE_S);
        gain.connect(live.music);
        playing = { p: want, gain, step: 0, next: now + 0.05 };
      }
      if (playing) {
        const { p } = playing;
        // After a stall, pick up the beat where it is now rather than playing what was missed.
        if (playing.next < now - 0.05) {
          const missed = Math.ceil((now - playing.next) / p.stepS);
          playing.step = (playing.step + missed) % p.length;
          playing.next += missed * p.stepS;
        }
        while (playing.next < now + AHEAD_S) {
          for (const tr of p.tracks) {
            const n = tr.at[playing.step];
            if (!n) continue;
            sound(ctx, playing.gain, tr.wave, n, tr.volume, playing.next, p.stepS);
            notes++;
          }
          playing.step = (playing.step + 1) % p.length;
          playing.next += p.stepS;
        }
      }
      return { tune: playing?.p.tune.id ?? '', notes };
    },
  };
}
