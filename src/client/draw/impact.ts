import type { World } from '../../sim/types.ts';
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
  for (const e of world.entities) {
    const hit = e.c.impact;
    if (!hit || e.room !== roomId) continue;
    const age = world.tick - hit.tick;
    const key = keyOf(hit);
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
