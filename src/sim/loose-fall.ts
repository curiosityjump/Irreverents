// The fall of a thing that is no body (Step 9's orb, Step 23's loose
// weapon; docs/mechanisms/powers.md, docs/mechanisms/weapons.md). Pure, like
// the rest of src/sim; a helper, not in a registry directory.
import { TILE } from '../content/kinds/rooms.ts';
import { tileAt } from './room-state.ts';
import { DT } from './types.ts';
import type { Entity, StepContext } from './types.ts';

/**
 * A bodiless thing's own fall, bounce and slide against the room's tiles
 * (solid, and one-way from above), like physics.ts for a box of `W` by `H`:
 * a power's orb (systems/power-take.ts, ORB_SIZE square) and a loose weapon
 * (systems/weapon-move.ts, its weapon's `box`). Lifted unchanged out of
 * power-take.ts (Step 23), where it was `moveOrb` for ORB_SIZE. DRAFT: the
 * bounce share and the slide are powerOrbBounce and powerOrbFriction.
 */
export function moveLoose(ctx: StepContext, orb: Entity, W: number, H: number): void {
  const room = ctx.content.rooms[orb.room];
  if (!room) return;
  const t = ctx.content.tuning.world;
  const T = room.tile;
  const EPS = 1e-6;
  const solid = (tx: number, ty: number): boolean => tileAt(ctx.world, room, tx, ty) === TILE.solid;
  orb.vy = Math.min(orb.vy + (t.gravity ?? 900) * DT, t.maxFallSpeed ?? 360);
  if (orb.onGround) {
    const slow = (t.powerOrbFriction ?? 400) * DT;
    orb.vx = Math.abs(orb.vx) <= slow ? 0 : orb.vx - Math.sign(orb.vx) * slow;
  }
  orb.x += orb.vx * DT;
  if (orb.vx !== 0) {
    const tx = orb.vx > 0 ? Math.floor((orb.x + W - EPS) / T) : Math.floor(orb.x / T);
    for (let ty = Math.floor(orb.y / T); ty <= Math.floor((orb.y + H - EPS) / T); ty++) {
      if (!solid(tx, ty)) continue;
      orb.x = orb.vx > 0 ? tx * T - W : (tx + 1) * T;
      orb.vx = -orb.vx * 0.5;
      break;
    }
  }
  const feetBefore = orb.y + H;
  const falling = orb.vy;
  orb.y += orb.vy * DT;
  orb.onGround = false;
  const left = Math.floor(orb.x / T);
  const right = Math.floor((orb.x + W - EPS) / T);
  if (orb.vy > 0) {
    const ty = Math.floor((orb.y + H - EPS) / T);
    for (let tx = left; tx <= right; tx++) {
      const cell = tileAt(ctx.world, room, tx, ty);
      if (cell !== TILE.solid && !(cell === TILE.oneway && feetBefore <= ty * T + EPS)) continue;
      orb.y = ty * T - H;
      // A hard landing bounces up with a share of its speed; a soft one stops.
      orb.vy = falling > 60 ? -falling * (t.powerOrbBounce ?? 0.5) : 0;
      orb.onGround = orb.vy === 0;
      break;
    }
  } else if (orb.vy < 0) {
    const ty = Math.floor(orb.y / T);
    for (let tx = left; tx <= right; tx++) {
      if (!solid(tx, ty)) continue;
      orb.y = (ty + 1) * T;
      orb.vy = 0;
      break;
    }
  }
}
