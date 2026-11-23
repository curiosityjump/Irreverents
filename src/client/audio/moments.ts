// Which moments of play just happened, for this page's listener. The names
// are MOMENTS in src/content/kinds/sounds.ts; what each sounds like is
// content/sounds/. Writeup: docs/mechanisms/sound.md.
//
// INTENT (never double-play): this player's own deeds come from the local
// simulation's events (heard the instant they happen, as the movement is
// seen); everything else comes from the server's events (`snap.ev`), with
// every event this player's own page already reported dropped, and from
// what the received world shows (footsteps, the king talking, a bark).
// Nothing is random: a pick between files and a pitch is a hash of the
// tick and who, so two screens hear the same.
import type { Content } from '../../content/types.ts';
import { speechLine, speechLineNumber } from '../../content/speech.ts';
import { speechTicksPerLine } from '../../sim/systems/audience-speech.ts';
import type { Entity, SimEvent } from '../../sim/types.ts';

export interface Moment {
  moment: string;
  room: string;
  /** Where it happened (pixels, room coordinates), or null for "at the listener". */
  x: number | null;
  y: number | null;
  /** Seeds the pick of file and pitch. */
  key: number;
  tick: number;
  /** This player's own doing (local events). */
  mine: boolean;
  /** Seconds from now. */
  delay: number;
  /** For impacts: how hard, pixels per second. */
  speed?: number;
}

/** DRAFT: how far a body walks per footstep, pixels. */
const STRIDE_PX = 17;
/** DRAFT: the gap between two gibberish syllables, seconds. */
const SYLLABLE_S = 0.11;

export function hash(...n: (number | string)[]): number {
  let h = 2166136261;
  for (const v of n) {
    const s = String(v);
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    h ^= 0x9e;
  }
  return h >>> 0;
}

type Ev = SimEvent & Record<string, unknown>;

/** The events the page's own simulation emits for its own character (src/net/client.ts steps only that). */
const LOCAL_TYPES = new Set(['jumped', 'flapped', 'landed', 'attacked', 'switched', 'switch-refused', 'changed-room', 'grab-refused']);
/** Events of a room's working parts, which carry no player. */
const PART_TYPES = new Set(['part-broken', 'plate-down', 'plate-up', 'gate-opened', 'gate-closed']);
/** DRAFT: the same part doing the same thing within this long is one sound. */
const PART_SAME_MS = 2500;

export function createMoments(content: Content, myPlayer: string, myId: string) {
  const strides = new Map<string, { x: number; room: string; walked: number }>();
  const lines = new Map<string, number>();
  const barks = new Map<string, string>();
  let lastLatest: unknown = null;

  const centre = (e: Entity): { x: number; y: number } => {
    const box = content.characters[e.kind]?.box;
    return { x: e.x + (box?.w ?? 0) / 2, y: e.y + (box?.h ?? 0) / 2 };
  };
  const partAt = (room: string, part: string): { x: number; y: number } | null => {
    const t = content.rooms[room]?.parts.find((p) => p.id === part)?.tiles[0];
    return t ? { x: t.tx * 16 + 8, y: t.ty * 16 + 8 } : null;
  };

  /**
   * Is this server event about this player's own character, of a type the
   * page's own simulation also produces (and so already played)? The page's
   * world holds only its own character, so what needs someone else (a hit
   * landing, a grab, a throw, two bodies colliding) is heard from the
   * server's copy alone.
   */
  const alreadyMine = (ev: Ev): boolean => {
    if (ev.player !== myPlayer && ev.entity !== myId && ev.by !== myId) return false;
    return LOCAL_TYPES.has(ev.type) || (ev.type === 'impact' && ev.other === null);
  };
  /** A room's working part can change on this page and on the server alike: heard once (within PART_SAME_MS). */
  const partHeard = new Map<string, number>();
  const firstForPart = (ev: Ev): boolean => {
    if (!PART_TYPES.has(ev.type)) return true;
    const k = `${ev.type}:${String(ev.room)}:${String(ev.part)}`;
    const t = performance.now();
    const before = partHeard.get(k);
    partHeard.set(k, t);
    if (partHeard.size > 100) for (const [key, at] of partHeard) if (t - at > PART_SAME_MS) partHeard.delete(key);
    return before === undefined || t - before > PART_SAME_MS;
  };

  return {
    update(f: { local: SimEvent[]; latest: { tick: number; events: SimEvent[] }; me: Entity; others: Entity[] }): Moment[] {
      const out: Moment[] = [];
      const { me } = f;
      const byId = new Map<string, Entity>();
      for (const e of f.others) byId.set(e.id, e);
      byId.set(me.id, me);

      const at = (id: unknown, ev: Ev, moment: string, mine: boolean, extra?: Partial<Moment>): void => {
        const e = typeof id === 'string' ? byId.get(id) : undefined;
        const c = e ? centre(e) : null;
        out.push({ moment, room: e?.room ?? '', x: c?.x ?? null, y: c?.y ?? null, key: hash(ev.tick, moment, String(id)), tick: ev.tick, mine, delay: 0, ...extra });
      };

      const take = (raw: SimEvent, mine: boolean): void => {
        const ev = raw as Ev;
        if (!firstForPart(ev)) return;
        switch (ev.type) {
          case 'jumped':
            return at(ev.entity, ev, 'jump', mine);
          case 'flapped':
            return at(ev.entity, ev, 'flap', mine);
          case 'landed':
            return at(ev.entity, ev, 'land', mine);
          case 'attacked':
            return at(ev.by, ev, 'swing', mine);
          case 'hit':
            at(ev.target, ev, 'hit', mine);
            if (ev.target === myId) at(ev.target, ev, 'hurt', mine);
            return;
          case 'impact':
            return at(ev.entity, ev, 'impact', mine, { speed: Number(ev.speed) || 0 });
          case 'grabbed': {
            const t = byId.get(String(ev.target));
            // DRAFT: a person (a player, a person, the king, a dummy) is a
            // body much taller than wide; a crate or a throne is a thing.
            const box = t ? content.characters[t.kind]?.box : undefined;
            const person = !t || t.player !== null || t.c.npc !== undefined || t.c.audience !== undefined || !box || box.h >= 1.4 * box.w;
            return at(ev.by, ev, person ? 'grab' : 'pickup', mine);
          }
          case 'grab-refused':
            return at(ev.by, ev, 'grab-refused', mine);
          case 'thrown':
            return at(ev.by, ev, 'throw', mine);
          case 'switched':
            return at(ev.entity, ev, 'switch', mine);
          case 'switch-refused':
            return at(ev.entity, ev, 'switch-refused', mine);
          case 'changed-room': {
            // Heard on both sides of the door: where the body is now if that is
            // here, else the doorway it left by.
            const e = byId.get(String(ev.entity));
            if (e && e.room === me.room) return at(ev.entity, ev, 'door', mine);
            const room = String(ev.fromRoom);
            const d = content.rooms[room]?.doors.find((x) => x.id === ev.fromDoor);
            out.push({ moment: 'door', room, x: d ? d.tx * 16 + 8 : null, y: d ? d.ty * 16 + 8 : null, key: hash(ev.tick, 'door', String(ev.entity)), tick: ev.tick, mine, delay: 0 });
            return;
          }
          case 'clean-getaway':
            // Step 19: nobody noticed; heard by everyone in the game, wherever they are (DRAFT: the jingle, louder).
            out.push({ moment: 'clean-getaway', room: '', x: null, y: null, key: hash(ev.tick, 'clean-getaway', String(ev.thing)), tick: ev.tick, mine, delay: 0 });
            return;
          case 'recruited':
            // Step 13: heard by everyone in this world, wherever they are (distance false, otherRooms true).
            out.push({ moment: 'recruited', room: me.room, x: null, y: null, key: hash(ev.tick, 'recruited', String(ev.recruit)), tick: ev.tick, mine, delay: 0 });
            return;
          case 'call-started':
            return at(ev.by, ev, 'call-windup', mine);
          case 'call-completed':
            out.push({ moment: 'bell', room: String(ev.area), x: Number(ev.x), y: Number(ev.y), key: hash(ev.tick, 'bell'), tick: ev.tick, mine, delay: 0 });
            return;
          case 'alert-changed':
            if (Number(ev.to) > Number(ev.from)) out.push({ moment: 'alarm-rising', room: String(ev.area), x: null, y: null, key: hash(ev.tick, 'alarm'), tick: ev.tick, mine, delay: 0 });
            return;
          case 'mood-changed': {
            const calmed = ev.from === 2 && ev.to === 1 && String(ev.cause).startsWith('expected:');
            const moment = calmed ? 'calmed' : ev.to === 1 ? 'mood-calm' : ev.to === 2 ? 'mood-confused' : 'mood-rage';
            return at(ev.entity, ev, moment, mine);
          }
          // Step 14 slice B: a hidden place found, or a piece. INTENT: from the server's copy only
          // (`mine` false): the page's own world emits these too, and a friend's find is the world's.
          case 'place-found':
          case 'piece-found':
            if (mine) return;
            out.push({ moment: 'secret-found', room: me.room, x: null, y: null, key: hash(ev.tick, 'secret', String(ev.place ?? ev.piece)), tick: ev.tick, mine: ev.player === myPlayer, delay: 0 });
            return;
          case 'part-broken': {
            const p = partAt(String(ev.room), String(ev.part));
            out.push({ moment: ev.look === 'window' ? 'break-window' : 'break-wall', room: String(ev.room), x: p?.x ?? null, y: p?.y ?? null, key: hash(ev.tick, 'break', String(ev.part)), tick: ev.tick, mine, delay: 0 });
            return;
          }
          case 'plate-down':
          case 'plate-up':
          case 'gate-opened':
          case 'gate-closed': {
            const p = partAt(String(ev.room), String(ev.part));
            const moment = ev.type === 'gate-opened' ? 'gate-open' : ev.type === 'gate-closed' ? 'gate-close' : ev.type;
            out.push({ moment, room: String(ev.room), x: p?.x ?? null, y: p?.y ?? null, key: hash(ev.tick, moment, String(ev.part)), tick: ev.tick, mine, delay: 0 });
            return;
          }
        }
      };

      for (const ev of f.local) take(ev, true);
      // `latest` is a new object per snapshot, so identity says whether it is new.
      if (f.latest !== lastLatest) {
        lastLatest = f.latest;
        for (const ev of f.latest.events) if (!alreadyMine(ev as Ev)) take(ev, false);
      }

      // Footsteps, from motion: any person or player walking on the ground in this room.
      const seen = new Set<string>();
      for (const e of byId.values()) {
        if (e.room !== me.room || (e.player === null && e.c.npc === undefined)) continue;
        seen.add(e.id);
        const s = strides.get(e.id);
        if (!s || s.room !== e.room || Math.abs(e.x - s.x) > 40) {
          strides.set(e.id, { x: e.x, room: e.room, walked: 0 });
          continue;
        }
        const busy = !e.onGround || e.c.flattened !== undefined || e.c.effect?.heldBy;
        s.walked = busy ? 0 : s.walked + Math.abs(e.x - s.x);
        s.x = e.x;
        if (s.walked >= STRIDE_PX) {
          s.walked -= STRIDE_PX;
          const c = centre(e);
          out.push({ moment: 'footstep', room: e.room, x: c.x, y: c.y + 10, key: hash(e.id, Math.round(e.x)), tick: 0, mine: e.id === myId, delay: 0 });
        }
      }
      for (const id of strides.keys()) if (!seen.has(id)) strides.delete(id);

      // The king's gibberish: a burst of syllables each time a new line of his speech goes up.
      const per = speechTicksPerLine(content.tuning.world.speechLineTime);
      for (const e of byId.values()) {
        const a = e.c.audience;
        const speech = a ? content.audience?.[a.id] : undefined;
        if (!a || !speech || e.room !== me.room) {
          lines.delete(e.id);
          continue;
        }
        const n = speechLineNumber(speech, a.ticks, per);
        const before = lines.get(e.id);
        lines.set(e.id, n);
        if (before === undefined || n !== before + 1) continue;
        const text = speechLine(speech, n);
        const syllables = Math.max(2, Math.min(16, Math.ceil(text.replace(/[^A-Za-z]/g, '').length / 3)));
        const c = centre(e);
        for (let k = 0; k < syllables; k++) {
          out.push({ moment: 'voice', room: e.room, x: c.x, y: c.y, key: hash(n, k, e.id), tick: n, mine: false, delay: k * SYLLABLE_S + (hash(n, k) % 3) * 0.02 });
        }
      }

      // A person's bark: a few syllables when new words go up over their head.
      for (const e of byId.values()) {
        const text = e.c.npc?.bark?.text ?? '';
        const before = barks.get(e.id);
        barks.set(e.id, text);
        if (before === undefined || text === '' || text === before || e.room !== me.room) continue;
        const syllables = Math.max(1, Math.min(6, Math.ceil(text.replace(/[^A-Za-z]/g, '').length / 4)));
        const c = centre(e);
        for (let k = 0; k < syllables; k++) out.push({ moment: 'bark', room: e.room, x: c.x, y: c.y, key: hash(text, k, e.id), tick: 0, mine: false, delay: k * SYLLABLE_S * 0.9 });
      }
      if (barks.size > 200) for (const id of barks.keys()) if (!byId.has(id)) barks.delete(id);
      return out;
    },
  };
}
