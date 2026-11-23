// Orbs: a power lying loose in a room (Step 9; docs/mechanisms/powers.md).
// The one place an orb is made. Pure, like the rest of src/sim; a helper,
// not in a registry directory.
import type { Power } from '../content/kinds/powers.ts';
import { ticksOf } from './body-state.ts';
import { ORB_KIND, ORB_SIZE } from './powers.ts';
import type { Entity, StepContext } from './types.ts';
import { addEntity, findEntity } from './world.ts';

/**
 * Pops power `p` out of body `from` as an orb: a light body that jumps up out
 * of it, a little away from `away` (the one who laid it flat or hit it), and
 * bounces to rest (systems/power-take.ts moves it). Emits `power-dropped`.
 * DRAFT: nobody can take it for powerRetakeTime, so it is seen to pop and
 * bounce and the hitter steps over the body to grab it, instead of having it
 * the instant it appears; the pop's speeds are powerOrbPop and powerOrbSpread.
 */
export function popOrb(ctx: StepContext, p: Power, from: Entity, away: Entity | null, src?: string): Entity | null {
  const { content, world } = ctx;
  const box = content.characters[from.kind]?.box;
  if (!box) return null;
  let n = 0;
  while (findEntity(world, `orb:${world.tick}:${n}`)) n++;
  const id = `orb:${world.tick}:${n}`;
  const t = content.tuning.world;
  const mid = from.x + box.w / 2;
  const dir = away ? (away.x + (content.characters[away.kind]?.box.w ?? 0) / 2 < mid ? 1 : -1) : from.facing;
  const fade = Math.max(1, ticksOf(p.fade));
  const orb = addEntity(world, {
    id,
    kind: ORB_KIND,
    player: null,
    room: from.room,
    x: mid - ORB_SIZE / 2,
    // Out of the top of the body, but never above where the body itself reaches (a ceiling).
    y: from.y + Math.max(0, box.h - ORB_SIZE) / 2,
    vx: dir * (t.powerOrbSpread ?? 60),
    vy: -(t.powerOrbPop ?? 240),
    facing: dir > 0 ? 1 : -1,
    onGround: false,
    c: { orb: { power: p.id, left: fade, from: from.id, until: world.tick + ticksOf(t.powerRetakeTime ?? 0.6), ...(src ? { src } : {}) } },
  });
  ctx.emit('power-dropped', { entity: from.id, player: from.player, power: p.id, orb: id });
  return orb;
}
