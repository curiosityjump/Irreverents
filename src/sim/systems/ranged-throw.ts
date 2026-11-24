import { canAct, ticksOf } from '../body-state.ts';
import { emitEffect } from '../effects.ts';
import { canSee } from '../npc/sight.ts';
import { centre, drive, isOut } from '../npc/state.ts';
import { heroesIn } from '../outpost/state.ts';
import { rangedOf, rangedTag, shotStart } from '../ranged.ts';
import type { Entity, System } from '../types.ts';
import { removeEntity } from '../world.ts';
import { makeLoose, weaponOf, weaponWorld } from '../weapons.ts';

/** The tick a loose weapon was made (makeLoose names it `weapon:<tick>:<n>`), for "the oldest". */
function madeAt(e: Entity): [number, number] {
  const m = /^weapon:(\d+):(\d+)$/.exec(e.id);
  return m ? [Number(m[1]), Number(m[2])] : [0, 0];
}

/**
 * A bad guy who fights from range (Step 24; docs/mechanisms/ranged.md): each
 * person whose NPC kind has `ranged` holds his post, and when a hero he sees
 * this tick is within `range` (and farther than `npcChargeReach`), he is
 * handed his shot (the weapon effect, `src` rangedTag), holds it up for
 * `aim` seconds, then throws it the way he faced when he began: a loose
 * weapon flying at (dir × speed, −speed × lift), striking the first body it
 * meets (systems/weapon-move.ts, 530) and then lying where it lands.
 *
 * INTENT (D-093, "legible pixels"; the owner's "readable enemies",
 * docs/vision.md:74): no shot leaves his hand without first being drawn
 * held up, with its arc (src/client/draw/ranged.ts), for his whole `aim`:
 * `c.rangedAim` is on him every one of those ticks, and only this system
 * throws for him (his input never holds `attack` while the shot is in hand,
 * so weapon-toss, 95, never throws it early).
 * INTENT (D-055, D-062; D-065): a fixed arc the way he faces, on a fixed
 * trigger; the only read of a hero is canSee on this tick, and once begun
 * the throw goes where it was aimed even if the hero moved (that is the dodge).
 * DRAFT: he never walks (he holds his post: the input outpost-fight 58,
 * clash-fight 59 or his routine wrote is kept only when it does not walk,
 * which keeps a swing in reach and a turn). Knocked off his feet while aiming,
 * the aim ends with no throw; a hard hit has already knocked the shot loose
 * (weapon-loose), a soft one leaves it in hand for his next aim (never a
 * second one). More than `out` of his shots lying loose in his room, the
 * oldest goes (`ranged-shot-gone`); one in anyone's hand is never removed.
 * The server's world and a scenario's only (weaponWorld): a page never throws.
 * Runs after the systems that write a person's input (50-62) and before
 * weapon-toss (95) and the verbs (100).
 */
const system: System = {
  id: 'ranged-throw',
  order: 64,
  run(ctx) {
    const { world, content } = ctx;
    if (!weaponWorld(world)) return;
    const reach = content.tuning.world.npcChargeReach!;
    for (const e of world.entities) {
      const r = rangedOf(content, e);
      if (!r || !e.c.npc) continue;
      const w = content.weapons?.[r.weapon];
      if (!w) continue;
      const tag = rangedTag(e.id);
      capShots(e.id, e.room, tag, r.out);
      if (isOut(e) || !canAct(e)) {
        if (e.c.rangedAim) {
          delete e.c.rangedAim;
          ctx.emit('ranged-lost', { entity: e.id });
        }
        continue;
      }
      // A driver in a machine's seat is the machine's (machine-driven, Step 20).
      if (world.entities.some((m) => (m.c as { seat?: { driver: string | null } }).seat?.driver === e.id)) continue;
      const holds = weaponOf(content, e);
      const armed = holds?.id === r.weapon;
      // He holds his post: what was written for him this tick is kept only when it does not walk.
      const prior = e.c.input ?? { x: 0, y: 0, held: [] };
      const input = Math.abs(prior.x) > 0.01 ? { x: 0, y: 0, held: [] as string[] } : { x: prior.x, y: 0, held: [...prior.held] };
      // INTENT (above): with his shot in hand, never Hit (weapon-toss would throw it at once, with no telegraph).
      if (armed || e.c.rangedAim) input.held = input.held.filter((a) => a !== 'attack');
      drive(e, input);

      const aim = e.c.rangedAim;
      if (aim) {
        if (!armed) {
          delete e.c.rangedAim;
          ctx.emit('ranged-lost', { entity: e.id });
          continue;
        }
        if (world.tick - aim.at < ticksOf(r.aim)) {
          // Facing the way he aimed until it leaves.
          if (e.facing !== aim.dir) drive(e, { x: aim.dir * 0.01, y: 0, held: [] });
          continue;
        }
        const s = shotStart(content, e, w, r, aim.dir);
        delete e.c.rangedAim;
        if (!s) continue;
        const src = e.c.weapon?.src;
        emitEffect(ctx, e, { kind: 'weapon', weapon: null });
        const lit = w.burst ? { lit: { at: world.tick, by: e.id } } : {};
        const loose = makeLoose(ctx, w, e.room, s.x, s.feet, { from: e.id, vx: s.vx, vy: s.vy, flying: { by: e.id, met: [e.id] }, ...lit, ...(src ? { src } : {}) });
        e.c.rangedLast = { at: world.tick };
        ctx.emit('weapon-dropped', { entity: e.id, player: null, weapon: w.id, loose: loose.id, how: 'thrown' });
        ctx.emit('ranged-threw', { entity: e.id, weapon: w.id, loose: loose.id, dir: aim.dir });
        capShots(e.id, e.room, tag, r.out);
        continue;
      }
      // Ready again `every` seconds after his last throw; never with another weapon in hand.
      if (e.c.rangedLast && world.tick - e.c.rangedLast.at < ticksOf(r.every)) continue;
      if (holds && !armed) continue;
      const me = centre(content, e);
      let seen: Entity | null = null;
      let best = Infinity;
      for (const h of heroesIn(world, e.room)) {
        if (!canSee(content, e, h)) continue;
        const d = Math.abs(centre(content, h).x - me.x);
        if (d < best) {
          best = d;
          seen = h;
        }
      }
      if (!seen || best > r.range || best <= reach) continue;
      const dir: 1 | -1 = centre(content, seen).x >= me.x ? 1 : -1;
      if (!armed) emitEffect(ctx, e, { kind: 'weapon', weapon: w.id, by: e.kind, src: tag });
      e.c.rangedAim = { at: world.tick, dir };
      if (e.facing !== dir) drive(e, { x: dir * 0.01, y: 0, held: [] });
      ctx.emit('ranged-aim', { entity: e.id, weapon: w.id, dir, at: seen.id });
    }

    /** More than `out` of thrower `by`'s shots lying loose in `room`: the oldest go, in a poof. A shot in a hand is no loose weapon. */
    function capShots(by: string, room: string, tag: string, out: number): void {
      const lying = world.entities.filter((x) => x.room === room && x.c.loose?.src === tag && !x.c.loose.ending);
      if (lying.length <= out) return;
      lying.sort((a, b) => {
        const [ta, na] = madeAt(a);
        const [tb, nb] = madeAt(b);
        return ta - tb || na - nb;
      });
      for (const x of lying.slice(0, lying.length - out)) {
        const b = content.weapons?.[x.c.loose!.weapon]?.box ?? [10, 10];
        ctx.emit('ranged-shot-gone', { loose: x.id, by, room, x: x.x + b[0] / 2, y: x.y + b[1] / 2 });
        removeEntity(world, x.id);
      }
    }
  },
};
export default system;
