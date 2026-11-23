import type { Content } from '../../content/types.ts';
import type { Entity, World } from '../../sim/types.ts';
import { drawFrame, frameOf, look } from './fx.ts';

// DRAFT: how impacts look. Everything is read from entity.c.impact (where,
// how hard, which tick), which the simulation records and every device
// receives with the world: nothing here listens to step()'s events, and
// nothing is random, so two screens show the same thing.
// The feel (how long, how big) is the owner's to judge; no numbers are drawn.
const DUST_TICKS = 22;
const SHAKE_TICKS = 10;
/** An impact at this speed (pixels per second) or more shakes and puffs at full size. */
const FULL_SPEED = 450;
const MAX_SHAKE = 4;
const DUST = '#e9e4d4';
/** Where the dust looks go, sideways from the point of impact (fixed: nothing random). */
const SIDES = [-1, 1, 0];
const SIDES_SMALL = [-1, 1];

/** Per impact (by its key), the last age at which it was seen in its beat: the star waits that long. */
const held = new Map<string, number>();

/** Fixed directions for the dust puffs, so no randomness is needed. */
const PUFFS: [number, number][] = [
  [-1, -0.2],
  [1, -0.2],
  [-0.6, -0.8],
  [0.6, -0.8],
  [0, -1],
  [-0.9, 0.4],
  [0.9, 0.4],
];

/**
 * Round 3 (gap 4): a hit drawn on the hitter's own page when the strike lands, not when the
 * server's word arrives (about 0.4 s later: the page's own world holds only its own character,
 * docs/mechanisms/network.md, "Known limits"). INTENT: cosmetic only. Nothing here moves a body
 * or changes the simulation: knockback stays the server's. The star waits on its first frame
 * (the page's "beat") until the server's impact on that body arrives, then plays on; that
 * impact then draws no second star, dust or shake. A swing the server does not confirm within
 * PREDICT_MS just lets its star play out.
 * DRAFT: the whole of it, and the alternative (widening the page's local world in
 * src/net/client.ts) is logged in docs/mechanisms/rendering-actors.md, not taken.
 */
interface Predicted {
  /** Page time it was predicted (ms), and the world tick then. */
  at: number;
  tick: number;
  /** The contact point (room px), and which way the push goes (+1 right, -1 left). */
  x: number;
  y: number;
  dir: number;
  /** When the server's impact on the body arrived (page ms and tick), or null while waiting. */
  landed: number | null;
  landTick: number;
}
const predicted = new Map<string, Predicted>();
/** Per attacker: the swing being watched (its `swung` tick) and the bodies it already struck. */
const swings = new Map<string, { swung: number; struck: Set<string> }>();
/** Impact keys first seen while a prediction for that body was waiting: drawn by the prediction. */
const covered = new Set<string>();
const seenKeys = new Set<string>();
/** DRAFT: how long a prediction waits for the server's word (ms), and the nudge along the push (px). */
const PREDICT_MS = 500;
const NUDGE = 2;
/** DRAFT: the beat a predicted hit is drawn in front of its hitter after the server's word (ticks). */
const FRONT_TICKS = 20;

function nowMs(): number {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}

/**
 * Call once a frame with the page's own character (after it has been simulated): on each tick
 * of its strike, every body its strike box overlaps (as drawn) that the server would launch is
 * predicted hit, once per swing. The box is attack.ts's own (from the middle of the body to the
 * reach past its front edge). `isThrow`: the swing was really a throw (nothing is hit).
 */
export function predictHits(world: World, content: Content, me: Entity, isThrow: boolean): void {
  const a = me.c.attack;
  const box = content.characters[me.kind]?.box;
  if (!a || !box || a.phase !== 'strike' || isThrow) return;
  let sw = swings.get(me.id);
  if (!sw || sw.swung !== a.swung) {
    sw = { swung: a.swung, struck: new Set() };
    swings.set(me.id, sw);
  }
  const reach = content.tuning.characters[content.characters[me.kind]!.tuning]?.attackReach ?? 10;
  const x0 = me.facing > 0 ? me.x + box.w / 2 : me.x - reach;
  const width = box.w / 2 + reach;
  for (const o of world.entities) {
    if (o.id === me.id || o.room !== me.room || o.c.flattened || o.c.effect?.heldBy || o.c.held || sw.struck.has(o.id)) continue;
    // A friend's swing neither wears nor launches a friend (Step 2), except in a cantina brawl.
    if (o.player !== null && !(o.c.brawl && me.c.brawl)) continue;
    if (o.c.thing || o.c.alert) continue;
    // INTENT (round 3): a body the net layer has lent to this page with real predicted stamps
    // (Step 5, `c.predicted`) is drawn from those; this cosmetic prediction stands down for it.
    if ((o.c as { predicted?: unknown }).predicted) continue;
    const ob = content.characters[o.kind]?.box;
    if (!ob) continue;
    if (!(x0 < o.x + ob.w && x0 + width > o.x && me.y - 4 < o.y + ob.h && me.y + box.h > o.y)) continue;
    sw.struck.add(o.id);
    // The contact edge: the target's side facing the fist, no further than the fist itself.
    const x = me.facing > 0 ? Math.max(o.x, Math.min(o.x + ob.w, me.x + box.w)) : Math.min(o.x + ob.w, Math.max(o.x, me.x));
    const y = Math.max(o.y + 3, Math.min(o.y + ob.h - 3, me.y + box.h * 0.45));
    predicted.set(o.id, { at: nowMs(), tick: world.tick, x, y, dir: me.facing > 0 ? 1 : -1, landed: null, landTick: 0 });
  }
}

/**
 * How a body predicted hit is drawn this frame: its hurt pose (white for the first ticks) and a
 * nudge along the push while the server's word is awaited, easing back once it comes; and
 * whether it is drawn in front of whoever hit it. Null when nothing is predicted for it.
 */
export function predictedLook(world: World, id: string): { since: number; flash: boolean; dx: number; waiting: boolean } | null {
  const p = predicted.get(id);
  if (!p) return null;
  const age = world.tick - p.tick;
  if (p.landed === null) {
    if (nowMs() - p.at > PREDICT_MS) return null;
    return { since: p.tick, flash: age < 3, dx: p.dir * NUDGE, waiting: true };
  }
  const after = world.tick - p.landTick;
  if (after > FRONT_TICKS) return null;
  return { since: p.tick, flash: false, dx: Math.round(p.dir * NUDGE * Math.max(0, 1 - after / 3)), waiting: false };
}

/**
 * Dust where bodies struck something, and a shake of the whole picture for
 * the hard ones. Call it last: the shake moves what is already drawn.
 */
export function drawImpact(g: CanvasRenderingContext2D, world: World, roomId: string, ox: number, oy: number): void {
  let shake = 0;
  let newest = 0;
  const seen = new Set<string>();
  const keyOf = (hit: { tick: number; x: number; y: number }): string => `${hit.tick}:${Math.round(hit.x)}:${Math.round(hit.y)}`;
  // Round 2: the simulation's hit freeze (`c.beat`, 2 to 8 ticks by impact speed) holds the star
  // on its first frame; it plays on when the beat lets go. Which impacts are in their beat now:
  const beating = new Set<string>();
  for (const e of world.entities) if (e.c.impact && e.c.beat && e.room === roomId) beating.add(keyOf(e.c.impact));
  for (const k of beating) {
    const age = world.tick - Number(k.split(':')[0]);
    held.set(k, age);
  }
  if (held.size > 64) for (const [k] of held) if (world.tick - Number(k.split(':')[0]) > 600) held.delete(k);
  // Round 3: the server's word on a predicted hit: that impact is drawn by the prediction.
  const now = nowMs();
  for (const e of world.entities) {
    const hit = e.c.impact;
    if (!hit || e.room !== roomId) continue;
    const key = keyOf(hit);
    if (seenKeys.has(key)) continue;
    seenKeys.add(key);
    const p = predicted.get(e.id);
    if (p && p.landed === null && now - p.at <= PREDICT_MS) {
      p.landed = now;
      p.landTick = world.tick;
      covered.add(key);
    }
  }
  if (seenKeys.size > 256) seenKeys.clear();
  if (covered.size > 64) covered.clear();
  for (const [id, p] of predicted) {
    const age = world.tick - p.tick;
    if (age < 0 || age > 120) {
      predicted.delete(id);
      continue;
    }
    // The star holds its first frame while the server's word is awaited (the page's beat), then plays on.
    const waiting = p.landed === null && now - p.at <= PREDICT_MS;
    const starAge = waiting ? 0 : p.landed !== null ? world.tick - p.landTick : age - Math.round((PREDICT_MS * 60) / 1000);
    if (!waiting && starAge >= DUST_TICKS && age >= DUST_TICKS) continue;
    if (age < SHAKE_TICKS) {
      const s = MAX_SHAKE * (1 - age / SHAKE_TICKS);
      if (s > shake) [shake, newest] = [s, p.tick];
    }
    const dust = look('fx-dust');
    const star = look('fx-hit');
    if (dust && age < DUST_TICKS) {
      const f = frameOf(dust, age, false);
      if (f >= 0) {
        const spreadL = 13 * Math.min(1, age / 8);
        for (const dx of SIDES) drawFrame(g, dust, f, ox + Math.round(p.x + dx * spreadL - dust.w / 2), oy + Math.round(p.y - dust.h / 2 - Math.abs(dx) * 2), { flip: dx < 0 });
      }
    }
    if (star) {
      const f = frameOf(star, Math.max(0, starAge), false);
      if (f >= 0) drawFrame(g, star, f, ox + Math.round(p.x - star.w / 2), oy + Math.round(p.y - star.h / 2));
    } else if (age < 4) {
      g.fillStyle = '#ffffff';
      g.fillRect(ox + Math.round(p.x) - 6, oy + Math.round(p.y) - 1, 12, 2);
      g.fillRect(ox + Math.round(p.x) - 1, oy + Math.round(p.y) - 6, 2, 12);
    }
  }
  for (const e of world.entities) {
    const hit = e.c.impact;
    if (!hit || e.room !== roomId) continue;
    const age = world.tick - hit.tick;
    const key = keyOf(hit);
    if (covered.has(key)) continue;
    const hold = held.get(key);
    // How far the star has played: 0 through the beat, then counting on from when it let go.
    const starAge = beating.has(key) ? 0 : hold === undefined ? age : age - hold - 1;
    if (age < 0 || (age >= DUST_TICKS && starAge >= DUST_TICKS)) continue;
    const size = Math.min(1, hit.speed / FULL_SPEED);
    if (age < SHAKE_TICKS) {
      const s = MAX_SHAKE * size * (1 - age / SHAKE_TICKS);
      if (s > shake) [shake, newest] = [s, hit.tick];
    }
    // Two bodies of one impact share a point: draw its dust once.
    if (seen.has(key)) continue;
    seen.add(key);
    // With the `fx-dust` and `fx-hit` looks (docs/mechanisms/art-pipeline.md)
    // a few puffs and a star play out; without them, the squares as before.
    const dust = look('fx-dust');
    const star = look('fx-hit');
    if (dust || star) {
      if (dust && age < DUST_TICKS) {
        const f = frameOf(dust, age, false);
        if (f >= 0) {
          const spreadL = (3 + 10 * size) * Math.min(1, age / 8);
          const scale = size < 0.4 ? 0.75 : 1;
          const w = Math.round(dust.w * scale);
          const h = Math.round(dust.h * scale);
          for (const dx of size < 0.4 ? SIDES_SMALL : SIDES) {
            drawFrame(g, dust, f, ox + Math.round(hit.x + dx * spreadL - w / 2), oy + Math.round(hit.y - h / 2 - Math.abs(dx) * 2), { flip: dx < 0, w, h });
          }
        }
      }
      if (star) {
        const f = frameOf(star, starAge, false);
        // Round 2: sized by the impact, in quarter steps: soft 3/4, full speed 5/4; an attack's hit
        // (c.lastHit on this tick) never smaller than the look itself.
        const byAttack = world.entities.some((o) => o.c.lastHit?.tick === hit.tick && keyOf(o.c.impact ?? { tick: -1, x: 0, y: 0 }) === key);
        const k = size >= 0.85 ? 1.25 : size < 0.35 && !byAttack ? 0.75 : 1;
        const w = Math.round(star.w * k);
        const h = Math.round(star.h * k);
        if (f >= 0) drawFrame(g, star, f, ox + Math.round(hit.x - w / 2), oy + Math.round(hit.y - h / 2), { w, h });
      }
      continue;
    }
    if (age >= DUST_TICKS) continue;
    const spread = (4 + 14 * size) * (age / DUST_TICKS);
    const side = Math.max(1, Math.round((2 + 3 * size) * (1 - age / DUST_TICKS)));
    g.globalAlpha = 0.85 * (1 - age / DUST_TICKS);
    g.fillStyle = DUST;
    for (const [dx, dy] of PUFFS) {
      g.fillRect(ox + Math.round(hit.x + dx * spread) - (side >> 1), oy + Math.round(hit.y + dy * spread) - (side >> 1), side, side);
    }
    // The first frames of an impact get a bright star at the point of contact.
    if (age < 4) {
      const r = Math.round((3 + 5 * size) * (1 - age / 4));
      g.globalAlpha = 0.9;
      g.fillStyle = '#ffffff';
      g.fillRect(ox + Math.round(hit.x) - r, oy + Math.round(hit.y) - 1, r * 2, 2);
      g.fillRect(ox + Math.round(hit.x) - 1, oy + Math.round(hit.y) - r, 2, r * 2);
    }
    g.globalAlpha = 1;
  }
  const amount = Math.round(shake);
  if (amount > 0) {
    // The shake: the finished frame drawn over itself, nudged. The direction
    // flips every tick and comes from the tick numbers alone.
    const flip = (world.tick - newest) % 2 === 0 ? 1 : -1;
    g.drawImage(g.canvas, flip * amount, -flip * Math.round(amount / 2));
  }
}
