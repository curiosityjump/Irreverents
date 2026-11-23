import { hallOf } from '../../content/kinds/hall.ts';
import { hang, snapshot } from '../hall/detect.ts';
import type { Episode } from '../hall/detect.ts';
import { isOut } from '../npc/state.ts';
import { heroesIn, outposts, postOf } from '../outpost/state.ts';
import type { System } from '../types.ts';
import { findEntity } from '../world.ts';

/** DRAFT: the most felled ids an episode keeps (a cap on the post's size; past it, nobody new counts). */
const FELLED_MAX = 64;

/**
 * Step 7 (DRAFT, docs/decisions-log.md "Step 7: legends"): the Hall of
 * Legends notices a feat by itself, from what happened (D-024, D-025, D-026;
 * gate E: "without scripting the event itself"). Three kinds:
 *
 * - **A last stand:** at an outpost, waves came and the players knocked many
 *   flat, and it ended with them gone from the room, or all down at once.
 * - **A narrow escape:** waves came and the players left the room on their
 *   own feet with someone of a wave still standing.
 * - **A theft nobody noticed:** Step 19's `clean-getaway`.
 *
 * An episode at an outpost opens with its first wave and closes when no
 * player's character is in the room, or, once it is big enough to be a last
 * stand, when all of them are out cold at once. Only bodies
 * knocked flat by a credited player count (`flattened` with `by` a credited
 * player's character): the camp's people flatten each other often.
 * INTENT (D-026): everyone in the room during the episode is credited.
 * INTENT (doc 00): a memory of actual events, never a checklist; thresholds
 * and wording are data (content/hall/legends.json).
 * Runs late (970), after every system that emits what it reads this tick.
 */
const system: System = {
  id: 'hall-detect',
  order: 970,
  tuning: {
    hallRelativeOn: { min: 0, max: 1, what: 'switch: 1 = a feat hangs only if it beats the best of its kind in that place (S-001); 0 = every one hangs (a control for the scenarios only)' },
  },
  run(ctx) {
    const { world, content } = ctx;
    const hall = hallOf(content);
    if (!hall) return;
    // INTENT: only the world everyone shares hangs a legend. A page steps its own character
    // in a local world of its own (src/net/client.ts), which is the one with `taken` set;
    // a legend hung there would be a second, private pedestal. The page hears of the real
    // one by the server's `hall-legend` event.
    if (world.taken !== undefined) return;
    for (const op of outposts(content)) {
      const post = postOf(world, op);
      if (!post) continue;
      const heroes = heroesIn(world, op.room);
      let ep: Episode | null = post.c.legend ?? null;
      for (const ev of ctx.events) {
        if (ev.type !== 'outpost-wave' || ev.outpost !== op.id) continue;
        ep ??= { start: world.tick, waves: 0, came: 0, felled: [], who: [], snap: [] };
        ep.waves++;
        ep.came += ev.people.length;
      }
      if (!ep) continue;
      for (const h of heroes) if (h.player !== null && !ep.who.some(([p]) => p === h.player)) ep.who.push([h.player, h.kind]);
      const credited = new Set(ep.who.map(([p]) => p));
      for (const ev of ctx.events) {
        if (ev.type !== 'flattened' || ev.by === null) continue;
        const target = findEntity(world, ev.target);
        const by = findEntity(world, ev.by);
        if (!target || target.room !== op.room || target.player !== null || !target.c.npc) continue;
        if (!by || by.player === null || !credited.has(by.player)) continue;
        if (!ep.felled.includes(target.id) && ep.felled.length < FELLED_MAX) ep.felled.push(target.id);
        ep.snap = snapshot(world, content, op.room, credited);
      }
      const stand = hall.kinds['last-stand'];
      const escape = hall.kinds['narrow-escape'];
      const gone = heroes.length === 0;
      // DRAFT: everyone down ends it only once it is already a last stand; being knocked flat
      // early is part of the fight (everyone gets up: docs/plan/step-2.md), not its end.
      const big = !!stand && ep.waves >= stand.minWaves && ep.felled.length >= Math.max(1, stand.minFelled);
      const down = !gone && big && heroes.every((h) => isOut(h));
      if (!gone && !down) {
        post.c.legend = ep;
        continue;
      }
      post.c.legend = null;
      const ticks = world.tick - ep.start;
      const stats = { waves: ep.waves, came: ep.came, felled: ep.felled.length, seconds: Math.round(ticks / 60) };
      const frame = ep.snap.length ? ep.snap : snapshot(world, content, op.room, credited);
      if (big) {
        hang(ctx, { kind: 'last-stand', place: op.room, ticks, who: ep.who, stats, score: ep.felled.length * 100 + ep.waves, frame });
        continue;
      }
      // Left on their own feet with someone of a wave still standing.
      // DRAFT: an escape scores the waves it outlasted, so getting out after as many again hangs nothing.
      const waveStanding = world.entities.some((e) => e.room === op.room && e.id.startsWith(`${op.id}:w`) && !isOut(e));
      if (gone && escape && ep.waves >= escape.minWaves && ep.felled.length >= escape.minFelled && waveStanding) {
        hang(ctx, { kind: 'narrow-escape', place: op.room, ticks, who: ep.who, stats, score: ep.waves, frame: ep.snap.length ? ep.snap : frame });
      }
    }
    // A theft nobody noticed (Step 19): credited, everyone in the taker's room at that moment.
    const theft = hall.kinds['clean-theft'];
    if (!theft) return;
    for (const ev of ctx.events) {
      if (ev.type !== 'clean-getaway') continue;
      const by = findEntity(world, ev.by);
      const place = content.heists?.[ev.heist]?.room;
      if (!by || !place) continue;
      const who: [string, string][] = world.entities.filter((e) => e.player !== null && e.room === by.room).map((e) => [e.player!, e.kind]);
      const credited = new Set(who.map(([p]) => p));
      // DRAFT: a theft scores 1, so the first in a place hangs and the same again does not.
      hang(ctx, { kind: 'clean-theft', place, ticks: 0, who, stats: {}, score: 1, frame: snapshot(world, content, by.room, credited) });
    }
  },
};
export default system;
