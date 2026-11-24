import { emitEffect, heldBy } from '../effects.ts';
import { ticksOf } from '../body-state.ts';
import { beatenRule, creditDefeat, knockedOutOnly } from '../beaten.ts';
import type { Entity, StepContext, System } from '../types.ts';
import { findEntity } from '../world.ts';

/**
 * Step 5, the owner's report (2026-11-23, playing): "enemies collapse but
 * never die". DRAFT (docs/decisions-log.md, "Beaten for good"): a bad guy
 * (src/sim/beaten.ts, beatenRule) knocked out by the players his kind's
 * `after` times, or flung into a wall or a body at his `slam` speed or more
 * (impact over numbers, D-020: the big hit ends it sooner), is defeated: he
 * does not get up, and beaten-gone takes him away. A good person knocked out
 * stays down world.knockedOutTime instead of world.flattenTime.
 *
 * DRAFT: only what a player did counts (the knock-out's `by`, or the flight's,
 * is a player's character): the camp's people flatten each other often, and a
 * fight among them should not empty the camp. Runs after every way a body is
 * laid flat or slammed this tick (verbs 100, impacts 510 and 520), before the
 * power carriers (540) and the Hall (970), which read the `flattened` a slam
 * adds. In a page's own world there are no people, so it does nothing there.
 */
const system: System = {
  id: 'beaten-mark',
  order: 530,
  tuning: {
    beatenAfter: { min: 1, max: 100, what: 'how many times the players must knock out a bad guy whose kind says no `beaten.after` before he is defeated for good (1 = the first knock-out)' },
    beatenSlam: { min: 0, max: 2000, what: 'the impact speed (pixels per second, into a wall, the floor or a body) that defeats a bad guy at once, for a kind with no `beaten.slam`; 0 = no slam defeats' },
    beatenLieTime: { min: 0, max: 30, what: 'seconds a defeated bad guy lies still, once he has stopped flying, before he goes in a poof' },
    beatenReturnTime: { min: 1, max: 3600, what: 'seconds nobody must be in his room before a defeated placed bad guy is back at his place (a wave\'s arrivals never come back)' },
    knockedOutTime: { min: 0.1, max: 600, what: 'seconds a good person (a townsperson, a guard) knocked out stays down before getting up (bodies nobody plays with no side get world.flattenTime)' },
  },
  run(ctx) {
    const { world, content } = ctx;
    for (const ev of [...ctx.events]) {
      if (ev.type === 'flattened') {
        const t = findEntity(world, ev.target);
        if (!t?.c.flattened) continue;
        if (knockedOutOnly(content, t)) {
          // INTENT (D-064, doc 26): a knocked-out townsperson or guard lies there to be found, long.
          t.c.flattened.ticksLeft = Math.max(t.c.flattened.ticksLeft, ticksOf(content.tuning.world.knockedOutTime));
          continue;
        }
        const rule = beatenRule(content, t);
        if (!rule || t.c.beaten) continue;
        const by = credited(ctx, ev.by);
        if (!by) continue;
        const knocks = (t.c.knocks ??= { n: 0 });
        knocks.n++;
        if (knocks.n >= rule.after) defeat(ctx, t, by, 'worn');
      } else if (ev.type === 'impact') {
        const t = findEntity(world, ev.entity);
        if (!t || t.c.beaten) continue;
        const rule = beatenRule(content, t);
        if (!rule || rule.slam <= 0 || ev.speed < rule.slam) continue;
        // Whoever started the flight: his own (he was thrown or knocked), or the body that struck him.
        const other = ev.other ? findEntity(world, ev.other) : undefined;
        const by = credited(ctx, t.c.flying?.by ?? other?.c.flying?.by ?? null);
        if (!by) continue;
        defeat(ctx, t, by, 'slam');
      }
    }
  },
};
export default system;

/** The player's character behind a knock-out or a flight, or null if it was nobody's doing. */
function credited(ctx: StepContext, by: string | null): Entity | null {
  const e = by ? findEntity(ctx.world, by) : undefined;
  return e && e.player !== null ? e : null;
}

function defeat(ctx: StepContext, t: Entity, by: Entity, how: 'worn' | 'slam'): void {
  const world = ctx.content.tuning.world;
  const lie = ticksOf(world.beatenLieTime);
  // A slam can defeat a body still standing: it is laid flat now, as a knock-out
  // (one `flattened`, so the Hall counts the body felled once).
  if (!t.c.flattened && heldBy(t) === null) {
    emitEffect(ctx, t, { kind: 'flatten', ticks: lie + 60, by: by.id });
    ctx.emit('flattened', { target: t.id, by: by.id });
  }
  if (!t.c.flattened) return;
  t.c.beaten = { ticks: lie, by: by.id };
  creditDefeat(ctx.world, t.room, by.player!);
  ctx.emit('defeated', { target: t.id, by: by.id, player: by.player, how });
}
