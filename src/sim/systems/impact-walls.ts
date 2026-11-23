import { beatTicks, markImpact, strike, wear } from '../body-state.ts';
import { DT } from '../types.ts';
import { heldBy } from '../effects.ts';
import type { Entity, StepContext, System } from '../types.ts';

/** Whether the launcher of a flight and the body it hurts are both players (the friend rule). */
export function friendly(ctx: StepContext, by: string | null, victim: Entity): boolean {
  if (victim.player === null || by === null) return false;
  if (by === victim.id) return true;
  const who = ctx.world.entities.find((e) => e.id === by);
  return who !== undefined && who.player !== null;
}

/**
 * Just after physics: a flying body that a wall, the floor or a ceiling
 * stopped, faster than world.wallImpactSpeed, records an impact: the event,
 * the held beat (longer for a harder impact), wear, and a bounce off walls,
 * ceilings and (Step 2 feel, 2026-11-23) the floor.
 */
const system: System = {
  id: 'impact-walls',
  order: 510,
  tuning: {
    wallImpactSpeed: { min: 0, max: 900, what: 'the slowest a flying body can hit a wall, floor or ceiling and still count as an impact, pixels per second' },
    wallBounce: { min: 0, max: 1, what: 'share of its speed a body keeps, reversed, off a wall or ceiling (0 = it stops dead)' },
    beatTime: { min: 0, max: 1, what: 'the held beat: seconds the bodies of an impact hold still before they move on, for the softest impact that counts (0 = none)' },
    beatMaxTime: { min: 0, max: 1, what: 'the held beat of the hardest impact (at world.maxLaunchSpeed), seconds; an impact between gets a beat between beatTime and this' },
    floorBounce: { min: 0, max: 1, what: 'share of its falling speed a flying body keeps, upwards, when it hits the floor (0 = it stops dead)' },
    floorBounceSpeed: { min: 0, max: 900, what: 'a flying body that hits the floor slower than this (pixels per second) does not bounce, so the bouncing ends' },
    impactWear: { min: 0, max: 100, what: 'how much an impact wears a body down, per pixel-per-second of impact speed' },
    friendThrowWear: { min: 0, max: 1, what: "share of an impact's wear a player takes from a flight another player started (0 = a friend's throw does not wear you down)" },
  },
  run(ctx) {
    const world = ctx.content.tuning.world;
    const limit = world.wallImpactSpeed!;
    for (const e of ctx.world.entities) {
      const f = e.c.flying;
      if (!f || f.at !== ctx.world.tick || e.c.beat || heldBy(e) !== null) continue;
      const box = ctx.content.characters[e.kind]?.box;
      if (!box) continue;
      const fall = Math.min(f.pvy + world.gravity! * DT, world.maxFallSpeed!);
      let speed = 0;
      let x = 0;
      let y = 0;
      let [vx, vy] = [e.vx, e.vy];
      // INTENT: one impact per stop. Physics leaves vx (or vy) at exactly 0
      // only on the tick it stopped the body, and a body resting on the
      // floor was already on it (pGround), so a body lying against a wall
      // does not record an impact every tick.
      if (f.pvx !== 0 && e.vx === 0 && Math.abs(f.pvx) >= limit) {
        speed = Math.abs(f.pvx);
        x = f.pvx > 0 ? e.x + box.w : e.x;
        y = e.y + box.h / 2;
        vx = -f.pvx * world.wallBounce!;
      }
      if (!f.pGround && e.onGround && fall >= limit && fall > speed) {
        speed = fall;
        x = e.x + box.w / 2;
        y = e.y + box.h;
        // DRAFT: a thrown or knocked body bounces off the floor, each bounce
        // lower, until it lands slower than floorBounceSpeed.
        if (fall >= world.floorBounceSpeed!) vy = -fall * world.floorBounce!;
      } else if (fall < 0 && e.vy === 0 && !e.onGround && -fall >= limit && -fall > speed) {
        speed = -fall;
        x = e.x + box.w / 2;
        y = e.y;
        vy = -fall * world.wallBounce!;
      }
      if (speed === 0) continue;
      markImpact(ctx, e, x, y, speed);
      strike(ctx, e, vx, vy, beatTicks(ctx, world.beatTime, world.beatMaxTime, speed));
      ctx.emit('impact', { entity: e.id, player: e.player, other: null, speed });
      // Step 11: in a cantina brawl the body's c.brawl share is read first (systems/cantina-brawl.ts).
      wear(ctx, e, speed * world.impactWear! * (friendly(ctx, f.by, e) ? (e.c.brawl?.throwWear ?? world.friendThrowWear!) : 1), f.by);
    }
  },
};
export default system;
