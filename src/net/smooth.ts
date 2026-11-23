// How characters simulated elsewhere are drawn smoothly (docs/mechanisms/network.md).
// Pure: time is passed in.
import type { Net } from '../content/kinds/net.ts';
import { DT } from '../sim/types.ts';
import type { Entity } from '../sim/types.ts';

const TICK_MS = DT * 1000;

interface Track {
  /** States by the tick of whoever simulated them, oldest first. */
  samples: { t: number; e: Entity }[];
  /** Recent (arrival time - sample time) values; the smallest is the fastest packet seen. */
  offsets: number[];
  shown: { x: number; y: number; room: string } | null;
  shownAt: number;
}

/**
 * Remote entities are drawn a little in the past (`interpDelayMs`), between
 * two states that have already arrived, each on its own simulator's clock.
 *
 * INTENT: a drawn remote character never teleports across the room on a
 * late packet: it is held at its newest known state, and when the next one
 * lands it travels there at no more than `remoteMaxSpeed` (Step 1 Gate 2
 * brief, "never teleport"). Changing room is the one jump allowed.
 */
export function createSmoother(net: Net) {
  const tracks = new Map<string, Track>();

  return {
    clear(): void {
      tracks.clear();
    },
    /** Feed every entity of a snapshot. `stamp` is its simulator's tick. */
    feed(now: number, id: string, stamp: number, e: Entity): void {
      let track = tracks.get(id);
      if (!track) tracks.set(id, (track = { samples: [], offsets: [], shown: null, shownAt: now }));
      const last = track.samples[track.samples.length - 1];
      if (last && stamp < last.t) {
        // Its simulator started over (a reload, a server restart).
        track.samples = [];
        track.offsets = [];
      } else if (last && stamp === last.t) {
        last.e = e;
        return;
      }
      const offset = now - stamp * TICK_MS;
      // A simulator that stalled (a hidden tab) comes back on a later clock.
      if (track.offsets.length && offset - Math.min(...track.offsets) > 500) track.offsets = [];
      track.offsets.push(offset);
      if (track.offsets.length > 60) track.offsets.shift();
      track.samples.push({ t: stamp, e });
      if (track.samples.length > 40) track.samples.shift();
    },
    /** Forget entities that are no longer in the world. */
    keep(ids: Set<string>): void {
      for (const id of tracks.keys()) if (!ids.has(id)) tracks.delete(id);
    },
    /**
     * Step 5 (src/net/predict.ts): every tracked entity where its simulator will have it `leadMs`
     * after `now`: its newest state received, carried on at the pace of its last two states (a
     * walking person's speed is not in its `vx`; its behaviour moves it). DRAFT: straight along, x only.
     */
    ahead(now: number, leadMs: number): Entity[] {
      const out: Entity[] = [];
      for (const track of tracks.values()) {
        const s = track.samples;
        const newest = s[s.length - 1];
        if (!newest) continue;
        const prev = s[s.length - 2];
        const pace = prev && prev.e.room === newest.e.room && newest.t > prev.t ? (newest.e.x - prev.e.x) / (newest.t - prev.t) : 0;
        // The simulator's tick that is arriving now (the fastest packet's offset), then `leadMs` on.
        const at = (now - Math.min(...track.offsets) + leadMs) / TICK_MS;
        out.push({ ...newest.e, x: newest.e.x + pace * Math.max(0, at - newest.t) });
      }
      return out;
    },
    /** Every tracked entity as it should be drawn at `now`. */
    view(now: number): Entity[] {
      const out: Entity[] = [];
      for (const track of tracks.values()) {
        const s = track.samples;
        const newest = s[s.length - 1];
        if (!newest) continue;
        const at = (now - Math.min(...track.offsets) - net.interpDelayMs) / TICK_MS;
        let base = newest.e;
        let x = newest.e.x;
        let y = newest.e.y;
        if (at <= s[0]!.t) {
          base = s[0]!.e;
          x = base.x;
          y = base.y;
        } else if (at < newest.t) {
          for (let i = s.length - 2; i >= 0; i--) {
            const a = s[i]!;
            if (a.t > at) continue;
            const b = s[i + 1]!;
            const k = (at - a.t) / (b.t - a.t);
            base = a.e;
            if (a.e.room === b.e.room) {
              x = a.e.x + (b.e.x - a.e.x) * k;
              y = a.e.y + (b.e.y - a.e.y) * k;
            } else {
              x = a.e.x;
              y = a.e.y;
            }
            break;
          }
        }
        const shown = track.shown;
        if (shown && shown.room === base.room) {
          const max = (net.remoteMaxSpeed * Math.max(0, now - track.shownAt)) / 1000;
          const dx = x - shown.x;
          const dy = y - shown.y;
          const dist = Math.hypot(dx, dy);
          if (dist > max && dist > 0) {
            x = shown.x + (dx / dist) * max;
            y = shown.y + (dy / dist) * max;
          }
        }
        track.shown = { x, y, room: base.room };
        track.shownAt = now;
        out.push({ ...base, x, y });
      }
      return out;
    },
  };
}
