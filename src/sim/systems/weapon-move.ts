import { beatTicks, bodyNumbers, launch, markImpact, overlaps, wear } from '../body-state.ts';
import { heldBy } from '../effects.ts';
import { moveLoose } from '../loose-fall.ts';
import type { System } from '../types.ts';
import { findEntity } from '../world.ts';
import { looseBox, weaponWorld } from '../weapons.ts';

/**
 * A loose weapon (no body: src/sim/weapons.ts, WEAPON_KIND) falls, bounces
 * and slides to rest by the orb's own small physics (src/sim/loose-fall.ts,
 * the same numbers), for its weapon's box (Step 23; docs/mechanisms/weapons.md).
 * A thrown one (`loose.flying`, systems/weapon-throw.ts) launches the first
 * body it meets by its weapon's `thrown` numbers against that body's weight,
 * as a swing does (verbs/attack.ts: launch, markImpact, wear, a `hit` by the
 * thrower), sparing a friend by friendAttackLaunch and friendAttackWear, then
 * drops; it stops flying when it lands. A lit one (a bomb) bursts on the
 * first body it meets instead (systems/weapon-burst.ts); one that has burst
 * (`ending`) does not move. It is no body itself: what it meets
 * is a body; nothing meets it.
 * The server's world and a scenario's only (weaponWorld).
 * Runs after the impacts (510, 520) and before power-drop (542) and
 * weapon-loose (543), so a thrown weapon's blow can knock loose what its
 * target holds this tick; and before the outpost's signal post (540), so a
 * thrown weapon can strike the post.
 */
const system: System = {
  id: 'weapon-move',
  order: 530,
  run(ctx) {
    const { world, content } = ctx;
    if (!weaponWorld(world)) return;
    const t = content.tuning.world;
    for (const e of world.entities) {
      const l = e.c.loose;
      if (!l || l.ending) continue;
      const b = looseBox(content, e);
      moveLoose(ctx, e, b.w, b.h);
      const fly = l.flying;
      if (!fly) continue;
      if (e.onGround) {
        delete l.flying;
        continue;
      }
      const w = content.weapons[l.weapon];
      if (!w) continue;
      const thrower = findEntity(world, fly.by);
      for (const o of world.entities) {
        if (o === e || o.room !== e.room || fly.met.includes(o.id) || heldBy(o) !== null || o.c.flattened) continue;
        const ob = content.characters[o.kind]?.box;
        if (!ob || !overlaps(e.x, e.y, b.w, b.h, o.x, o.y, ob.w, ob.h)) continue;
        fly.met.push(o.id);
        // A lit weapon (a bomb) bursts on what it meets instead of striking it (systems/weapon-burst.ts, next).
        if (l.lit) {
          l.lit.now = true;
          break;
        }
        const dir = e.vx < 0 ? -1 : 1;
        const friend = thrower !== undefined && thrower.player !== null && o.player !== null;
        o.c.lastHit = { tick: world.tick, by: fly.by };
        ctx.emit('hit', { by: fly.by, target: o.id, player: thrower?.player ?? null });
        ctx.emit('weapon-struck', { loose: e.id, weapon: w.id, by: fly.by, target: o.id });
        const speed = Math.min(w.thrown.strength / bodyNumbers(content, o).weight, t.maxLaunchSpeed ?? 500) * (friend ? (o.c.brawl?.attackLaunch ?? t.friendAttackLaunch ?? 0) : 1);
        if (speed > 0) {
          launch(ctx, o, dir * speed, -speed * (t.attackLift ?? 0.5), fly.by, [fly.by], beatTicks(ctx, t.hitBeatTime, t.hitBeatMaxTime, speed));
          markImpact(ctx, o, dir > 0 ? o.x : o.x + ob.w, o.y + ob.h / 2, speed);
        }
        wear(ctx, o, w.thrown.wear * (friend ? (o.c.brawl?.attackWear ?? t.friendAttackWear ?? 0) : 1), fly.by);
        // It drops off what it struck: a little back and up, no longer flying.
        e.vx = -dir * 40;
        e.vy = -90;
        delete l.flying;
        break;
      }
    }
  },
};
export default system;
