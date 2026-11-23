// The page's sound output: one Web Audio context, the delivered files
// decoded into buffers, two buses (effects, music) into a mute and a
// limiter. Writeup: docs/mechanisms/sound.md.
//
// INTENT (the owner's phone rules, docs/audio-design.md rule 5): silent
// until the first tap (a browser will not start sound before one anyway);
// back after the phone sleeps or the tab returns; and never in the way of
// play: a file that is missing or will not decode, or a browser that
// refuses audio altogether, leaves the game exactly as it was, silent.

/** What the page's own record says about sound (`window.irreverents.sound`). Read by scripts/checks/sound.ts. */
export interface SoundRecord {
  /** Whether a tap has started sound. */
  unlocked: boolean;
  /** The AudioContext's state: "none" until the first tap. */
  state: string;
  muted: boolean;
  /** Files asked for, decoded, and missing or undecodable. */
  files: number;
  loaded: number;
  failed: string[];
  /** Effects started since the page opened, and the newest ones (oldest first). */
  played: number;
  log: { moment: string; file: string; tick: number; mine: boolean; volume: number }[];
  /** Effects that were due but not heard: muted, not yet unlocked, file missing, too many at once. */
  skipped: number;
  /** The tune playing now (a content/sounds/ id), or "". */
  tune: string;
  /** Notes the music has started. */
  notes: number;
}

/** DRAFT: at most this many effects sound at once; more are skipped, never queued. */
const MAX_VOICES = 20;
const LOG_KEEP = 60;

type Ctx = AudioContext;

export function createEngine(files: string[], muted: boolean) {
  const record: SoundRecord = { unlocked: false, state: 'none', muted, files: files.length, loaded: 0, failed: [], played: 0, log: [], skipped: 0, tune: '', notes: 0 };
  let ctx: Ctx | null = null;
  let master: GainNode | null = null;
  let sfx: GainNode | null = null;
  let music: GainNode | null = null;
  let voices = 0;
  const raw = new Map<string, Promise<ArrayBuffer | null>>();
  const buffers = new Map<string, AudioBuffer>();
  const settled = new Set<string>();

  // The bytes start downloading at once, before any tap; decoding needs the
  // context, which only a tap may start.
  for (const f of files) {
    raw.set(
      f,
      fetch(`assets/${f}`)
        .then((r) => (r.ok ? r.arrayBuffer() : null))
        .catch(() => null),
    );
  }

  const fail = (f: string): void => {
    if (settled.has(f)) return;
    settled.add(f);
    record.failed.push(f);
  };

  const decodeAll = (c: Ctx): void => {
    for (const [f, bytes] of raw) {
      bytes
        .then((b) => {
          if (!b) return fail(f);
          // The callback form as well: older Safari has no promise from decodeAudioData.
          return new Promise<void>((resolve) => {
            const ok = (buf: AudioBuffer): void => {
              if (!settled.has(f)) {
                settled.add(f);
                buffers.set(f, buf);
                record.loaded++;
              }
              resolve();
            };
            const bad = (): void => {
              fail(f);
              resolve();
            };
            try {
              const p = c.decodeAudioData(b, ok, bad) as Promise<AudioBuffer> | undefined;
              if (p && typeof p.then === 'function') p.then(ok, bad);
            } catch {
              bad();
            }
          });
        })
        .catch(() => fail(f));
    }
  };

  const applyMute = (): void => {
    if (!ctx || !master) return;
    // A short ramp rather than a jump, so muting never clicks.
    const t = ctx.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setTargetAtTime(record.muted ? 0 : 1, t, 0.02);
  };

  /** Call from inside a tap, key or click: starts sound the first time, wakes it after that. */
  const unlock = (): void => {
    try {
      if (!ctx) {
        const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AC) {
          record.state = 'unsupported';
          return;
        }
        ctx = new AC();
        master = ctx.createGain();
        master.gain.value = record.muted ? 0 : 1;
        // DRAFT: the pack's README asks for a limiter: impact sounds are loud on purpose.
        const limiter = ctx.createDynamicsCompressor();
        limiter.threshold.value = -6;
        limiter.knee.value = 4;
        limiter.ratio.value = 12;
        limiter.attack.value = 0.002;
        limiter.release.value = 0.15;
        master.connect(limiter).connect(ctx.destination);
        sfx = ctx.createGain();
        sfx.gain.value = 0.9;
        sfx.connect(master);
        music = ctx.createGain();
        music.gain.value = 1;
        music.connect(master);
        // iOS starts a context only once something has played inside the tap.
        const blip = ctx.createBufferSource();
        blip.buffer = ctx.createBuffer(1, 1, 22050);
        blip.connect(ctx.destination);
        blip.start(0);
        ctx.onstatechange = () => (record.state = ctx!.state);
        decodeAll(ctx);
      }
      if (ctx.state !== 'running') void ctx.resume().catch(() => {});
      record.state = ctx.state;
      record.unlocked = true;
    } catch {
      record.state = 'refused';
    }
  };

  return {
    record,
    unlock,
    /** The context once a tap has made one and it is running; otherwise null (nothing should be scheduled). */
    live(): { ctx: Ctx; music: GainNode } | null {
      return ctx && music && ctx.state === 'running' ? { ctx, music } : null;
    },
    setMuted(m: boolean): void {
      record.muted = m;
      applyMute();
    },
    /** The page went out of view: stop the clock (battery; nothing piles up). */
    sleep(): void {
      if (ctx && ctx.state === 'running') void ctx.suspend().catch(() => {});
    },
    /** The page came back: start again if the browser lets it without a tap (the next tap does otherwise). */
    wake(): void {
      if (ctx && ctx.state !== 'running') void ctx.resume().catch(() => {});
    },
    /**
     * Starts one effect now (or `delay` seconds from now). `pan` is -1 (left)
     * to 1 (right). Returns false when nothing was started.
     */
    play(moment: string, file: string, opts: { volume: number; rate: number; pan: number; delay: number; tick: number; mine: boolean }): boolean {
      const buf = buffers.get(file);
      if (!ctx || !sfx || !buf || ctx.state !== 'running' || record.muted || voices >= MAX_VOICES || opts.volume <= 0.001) {
        record.skipped++;
        return false;
      }
      try {
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.playbackRate.value = opts.rate;
        const gain = ctx.createGain();
        gain.gain.value = opts.volume;
        src.connect(gain);
        if (opts.pan !== 0 && typeof ctx.createStereoPanner === 'function') {
          const p = ctx.createStereoPanner();
          p.pan.value = Math.max(-1, Math.min(1, opts.pan));
          gain.connect(p).connect(sfx);
        } else gain.connect(sfx);
        voices++;
        src.onended = () => {
          voices--;
          src.disconnect();
          gain.disconnect();
        };
        src.start(ctx.currentTime + Math.max(0, opts.delay));
      } catch {
        record.skipped++;
        return false;
      }
      record.played++;
      record.log.push({ moment, file, tick: opts.tick, mine: opts.mine, volume: Math.round(opts.volume * 100) / 100 });
      if (record.log.length > LOG_KEEP) record.log.shift();
      return true;
    },
  };
}
export type Engine = ReturnType<typeof createEngine>;
