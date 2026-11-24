import { beatTicks, bodyNumbers, launch, markImpact, ticksOf, wear } from '../body-state.ts';
import { heldBy } from '../effects.ts';
import { BREAKABLE, breakPart } from '../room-parts.ts';
import { partState } from '../room-state.ts';
import type { Entity, System } from '../types.ts';
import { findEntity, removeEntity } from '../world.ts';
import { looseBox, weaponWorld } from '../weapons.ts';

/**
 * A lit weapon bursts (Step 23, the bomb; docs/mechanisms/weapons.md). A
 * thrown weapon with a `burst` is lit (`throwWeapon`, src/sim/weapons.ts).
 * After its `fuse`, or on the tick it meets a body in flight
 * (systems/weapon-move.ts sets `lit.now`), it bursts at its box's middle:
 * every body in the room within `radius` (to the nearest point of its box),
 * not held, is launched away from the middle (up, and to the side it stands
 * on) by `strength` against its weight, capped at maxLaunchSpeed, and worn
 * by `wear`, with a `hit` by the thrower. The thrower is not spared (doc 08:
 * "recklessly, carelessly destructive action including self-destructive
 * stunts"); a friend is spared by the shares a friend's swing uses
 * (friendAttackLaunch, friendAttackWear). Every breakable part with a tile
 * centre in the radius breaks if its breakSpeed (or world.wallBreakSpeed)
 * is at most `breaks`. Then it shows its `burst` look for weaponBurstShow
 * seconds (`loose.ending`: nobody picks it up, it does not move) and is gone,
 * so its source stands another after its restock.
 * DRAFT: every number in the bomb's file; launched up at least as hard as
 * a swing lifts (attackLift) so a burst reads as a burst.
 * The server's world and a scenario's only (weaponWorld).
 * Runs after weapon-move (530), before power-drop (542) and weapon-loose
 * (543), so a burst's blow knocks loose what the bodies it meets hold.
 */
const system: System = {
  id: 'weapon-burst',
  order: 531,
  tuning: {
    weaponBurstShow: { min: 0, max: 3, what: 'seconds a burst weapon shows its burst look where it burst before it is gone' },
  },
  run(ctx) {
    const { world, content } = ctx;
    if (!weaponWorld(world)) return;
    const t = content.tuning.world;
    const gone: Entity[] = [];
    for (const e of world.entities) {
      const l = e.c.loose;
      if (!l) continue;
      if (l.ending) {
        if (world.tick - l.ending.at >= Math.max(1, ticksOf(t.weaponBurstShow ?? 0.4))) gone.push(e);
        continue;
      }
      const lit = l.lit;
      const w = content.weapons?.[l.weapon];
      const b = w?.burst;
      if (!lit || !w || !b) continue;
      if (!lit.now && world.tick - lit.at < ticksOf(b.fuse)) continue;
      const box = looseBox(content, e);
      const cx = e.x + box.w / 2;
      const cy = e.y + box.h / 2;
      const thrower = findEntity(world, lit.by);
      const struck: string[] = [];
      for (const o of world.entities) {
        if (o.room !== e.room || o.c.loose || heldBy(o) !== null) continue;
        const ob = content.characters[o.kind]?.box;
        if (!ob) continue;
        const nx = Math.max(o.x, Math.min(cx, o.x + ob.w));
        const ny = Math.max(o.y, Math.min(cy, o.y + ob.h));
        if (Math.hypot(nx - cx, ny - cy) > b.radius) continue;
        struck.push(o.id);
        const friend = thrower !== undefined && thrower !== o && thrower.player !== null && o.player !== null;
        const mid = o.x + ob.w / 2;
        const dir = mid > cx ? 1 : mid < cx ? -1 : o === thrower ? -o.facing : 1;
        o.c.lastHit = { tick: world.tick, by: lit.by };
        ctx.emit('hit', { by: lit.by, target: o.id, player: thrower?.player ?? null });
        const speed = Math.min(b.strength / bodyNumbers(content, o).weight, t.maxLaunchSpeed ?? 500) * (friend ? (o.c.brawl?.attackLaunch ?? t.friendAttackLaunch ?? 0) : 1);
        if (speed > 0) {
          launch(ctx, o, dir * speed, -speed * Math.max(t.attackLift ?? 0.5, 0.6), lit.by, [lit.by], beatTicks(ctx, t.hitBeatTime, t.hitBeatMaxTime, speed));
          markImpact(ctx, o, mid, o.y + ob.h / 2, speed);
        }
        wear(ctx, o, b.wear * (friend ? (o.c.brawl?.attackWear ?? t.friendAttackWear ?? 0) : 1), lit.by);
      }
      const room = content.rooms[e.room];
      if (room && b.breaks > 0) {
        const T = room.tile;
        for (const part of room.parts) {
          if (part.kind !== BREAKABLE || partState(world, room.id, part.id).broken) continue;
          const limit = typeof part.params.breakSpeed === 'number' ? part.params.breakSpeed : (t.wallBreakSpeed ?? 200);
          if (limit > b.breaks) continue;
          if (part.tiles.some((p) => Math.hypot((p.tx + 0.5) * T - cx, (p.ty + 0.5) * T - cy) <= b.radius)) breakPart(ctx, room, part, thrower ?? null, b.breaks);
        }
      }
      delete l.lit;
      delete l.flying;
      l.ending = { at: world.tick };
      e.vx = 0;
      e.vy = 0;
      ctx.emit('weapon-burst', { loose: e.id, weapon: w.id, by: lit.by, room: e.room, x: cx, y: cy, struck });
    }
    for (const e of gone) removeEntity(world, e.id);
  },
};
export default system;
