// Sound for the page: the moments of play (moments.ts) heard through the
// delivered effects (engine.ts), the tune of the room (music.ts), and the
// sound button. main.ts calls createAudio once and audio.frame() every
// frame (its lines are marked "audio hook (Step 8)").
// Writeup: docs/mechanisms/sound.md. What each moment sounds like: content/sounds/.
import type { SoundEffect } from '../../content/kinds/sounds.ts';
import type { Content } from '../../content/types.ts';
import { playerEntityId } from '../../net/protocol.ts';
import type { Entity, SimEvent } from '../../sim/types.ts';
import { createEngine } from './engine.ts';
import type { SoundRecord } from './engine.ts';
import { createMoments, hash } from './moments.ts';
import { createMusic } from './music.ts';

const MUTE_KEY = 'irreverents.muted';
/** The moments one impact can be, hardest first (each file's minSpeed decides). */
const IMPACTS = ['slam', 'heavy-hit', 'impact'];
/** DRAFT: how much a sound from another room is turned down (one that is heard there at all). */
const OTHER_ROOM = 0.5;
/** DRAFT: how far to one side a sound may sit (0 centre, 1 one ear). */
const MAX_PAN = 0.6;

function readMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    return false;
  }
}
function saveMuted(m: boolean): void {
  try {
    localStorage.setItem(MUTE_KEY, m ? '1' : '0');
  } catch {
    // remembered for this page only
  }
}

const ICON_ON =
  '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M2 6h3l4-3v10l-4-3H2z"/><path fill="none" stroke="currentColor" stroke-width="1.5" d="M11 5.5c1 .8 1 4.2 0 5M12.8 3.8c2 1.8 2 6.6 0 8.4"/></svg>';
const ICON_OFF =
  '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M2 6h3l4-3v10l-4-3H2z"/><path fill="none" stroke="currentColor" stroke-width="1.5" d="M11 6l4 4M15 6l-4 4"/></svg>';

/**
 * INTENT: the sound button is a way out (CLAUDE.md, "There is always a way
 * out"): sound can always be turned off, and the choice is remembered on
 * the device. It stays. DRAFT: its look and corner.
 */
function makeButton(muted: boolean, onToggle: () => void): HTMLButtonElement {
  const b = document.createElement('button');
  b.type = 'button';
  b.id = 'sound';
  b.style.cssText = [
    'position:absolute',
    // DRAFT (brief phone-hud-legibility, 2026-11-24): the touch area is 44 px, the least any
    // control may be (scripts/e2e/hud.ts); the painted disc stays 32 px where it was.
    'top:max(0px, calc(env(safe-area-inset-top) - 6px))',
    'right:max(0px, calc(env(safe-area-inset-right) - 6px))',
    'width:44px',
    'height:44px',
    'padding:0',
    'margin:0',
    'border:0',
    'border-radius:50%',
    'background:radial-gradient(circle, rgba(15,15,28,.5) 15.5px, transparent 16.5px)',
    'color:rgba(244,241,222,.8)',
    'display:flex',
    'align-items:center',
    'justify-content:center',
    'z-index:5',
    'pointer-events:auto',
    'touch-action:manipulation',
    '-webkit-appearance:none',
    'appearance:none',
  ].join(';');
  const show = (m: boolean): void => {
    b.innerHTML = m ? ICON_OFF : ICON_ON;
    b.setAttribute('aria-label', m ? 'Sound off: tap to turn it on' : 'Sound on: tap to turn it off');
    b.dataset.sound = m ? 'off' : 'on';
  };
  show(muted);
  b.addEventListener('click', (e) => {
    e.stopPropagation();
    onToggle();
  });
  // A press here is not a touch on the game.
  b.addEventListener('pointerdown', (e) => e.stopPropagation());
  (b as unknown as { show: typeof show }).show = show;
  document.body.append(b);
  return b;
}

export function createAudio(content: Content, player: string) {
  const effects = new Map<string, SoundEffect>();
  const files = new Set<string>();
  for (const s of Object.values(content.sounds ?? {})) {
    if (s.type !== 'effect') continue;
    effects.set(s.id, s);
    for (const f of s.files) files.add(f);
  }
  const engine = createEngine([...files].sort(), readMuted());
  const record: SoundRecord = engine.record;
  const moments = createMoments(content, player, playerEntityId(player));
  const music = createMusic(content);
  const lastStart = new Map<string, number>();
  const pending: string[] = [];

  const button = makeButton(record.muted, () => {
    engine.unlock();
    const m = !record.muted;
    engine.setMuted(m);
    saveMuted(m);
    (button as unknown as { show: (m: boolean) => void }).show(m);
    if (!m) pending.push('ui-tap');
  });

  // Every kind of first touch, key or click may be the one that starts sound;
  // later ones wake it if the phone suspended it (a call, a lock, Siri).
  const unlock = (): void => engine.unlock();
  for (const type of ['touchend', 'pointerup', 'pointerdown', 'mousedown', 'keydown', 'click']) {
    window.addEventListener(type, unlock, { capture: true, passive: true });
  }
  document.addEventListener('visibilitychange', () => (document.hidden ? engine.sleep() : engine.wake()));
  window.addEventListener('pageshow', () => engine.wake());
  window.addEventListener('focus', () => engine.wake());

  (window as unknown as { irreverents?: Record<string, unknown> }).irreverents!.sound = record;

  const pick = (moment: string, speed: number | undefined): SoundEffect | undefined => {
    if (moment !== 'impact') return effects.get(moment);
    for (const id of IMPACTS) {
      const e = effects.get(id);
      if (e && (speed ?? 0) >= e.minSpeed) return e;
    }
    return undefined;
  };

  return {
    /** Step 22 push 4: plays a sound of content/sounds/ by id on the next frame, as this page's own (the victory screen's stars). */
    cue(id: string): void {
      pending.push(id);
    },
    /** Every frame, after the world has been stepped and drawn. */
    frame(local: SimEvent[], latest: { tick: number; events: SimEvent[] }, me: Entity, others: Entity[]): void {
      const found = moments.update({ local, latest, me, others });
      const box = content.characters[me.kind]?.box;
      const lx = me.x + (box?.w ?? 0) / 2;
      const ly = me.y + (box?.h ?? 0) / 2;
      const nowS = performance.now() / 1000;
      for (const id of pending.splice(0)) found.push({ moment: id, room: me.room, x: null, y: null, key: 0, tick: 0, mine: true, delay: 0 });
      for (const m of found) {
        const fx = pick(m.moment, m.speed);
        if (!fx) continue;
        let volume = fx.volume;
        let pan = 0;
        if (m.room !== me.room) {
          if (!fx.otherRooms) continue;
          volume *= OTHER_ROOM;
        } else if (fx.distance && m.x !== null && m.y !== null) {
          const dx = m.x - lx;
          const d = Math.hypot(dx, m.y - ly);
          if (d >= fx.range) continue;
          volume *= 1 - d / fx.range;
          pan = Math.max(-MAX_PAN, Math.min(MAX_PAN, dx / 240));
        }
        const start = nowS + m.delay;
        if (start - (lastStart.get(fx.id) ?? -1e9) < fx.gapMs / 1000) continue;
        lastStart.set(fx.id, start);
        const h = hash(m.key, fx.id);
        const file = fx.files[h % fx.files.length]!;
        // A pitch spread picked by the hash, not at random: -1..1 of `pitch`.
        const spread = (((h >>> 8) % 2001) / 1000 - 1) * fx.pitch;
        engine.play(fx.id, file, { volume, rate: fx.rate * (1 + spread), pan, delay: m.delay, tick: m.tick, mine: m.mine });
      }
      const now = music.update(engine.live(), me.room);
      record.tune = now.tune;
      record.notes = now.notes;
    },
  };
}
