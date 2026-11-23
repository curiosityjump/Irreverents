import { canSee } from '../npc/sight.ts';
import { onOwnFeet, prizeOf } from '../heist.ts';
import type { System } from '../types.ts';
import { findEntity } from '../world.ts';

/**
 * Step 19 push 4 (docs/mechanisms/heists.md, "A prize in your hands"): a
 * prize taken is carried, carried out is banked, and a job nobody of the
 * place saw is a clean getaway.
 *
 * - A `did` take of a prize (npc-interact marks it taken by the taker) puts
 *   it in world.cargo for that hero: `prize-taken`.
 * - A carrier out of the place's room on their own feet (heist.ts,
 *   onOwnFeet) banks it: world.banked, `prize-banked`; and, when no person
 *   placed in that room ever had a played hero in sight since the first
 *   played hero came in (canSee, the test the band draws), `clean-getaway`.
 *   DRAFT: so a brawl with the horn never sounded is not clean (seen).
 * - A prize taken with nobody carrying it (an older kept game, before
 *   cargo; or its carrier left the game) counts as banked, quietly.
 * - A job ends, seen or not, when no played hero is in the room and nobody
 *   carries one of its prizes: the next visit starts clean. DRAFT.
 *
 * INTENT: reads rooms each tick, never `changed-room`: the server sees no
 * door event for a player (the page owns `room`; systems/level-explore.ts).
 * INTENT: it acts only on prizes whose thing is in this world. A page's own
 * world holds no things, so it never writes cargo there; the server's does,
 * and every page takes world.cargo and world.banked by key.
 * After the doors (600) and the witnesses (600), before the moods (610).
 */
const system: System = {
  id: 'heist-cargo',
  order: 607,
  run(ctx) {
    const { world, content } = ctx;
    const heists = content.heists;
    if (!heists || Object.keys(heists).length === 0) return;
    // A take this tick: into the taker's hands.
    for (const ev of ctx.events) {
      if (ev.type !== 'did' || ev.deed !== 'take' || ev.thing === null) continue;
      const p = prizeOf(content, ev.thing);
      const taker = findEntity(world, ev.by);
      if (!p || !taker || !findEntity(world, ev.thing)) continue;
      const cargo = (world.cargo ??= {});
      // DRAFT: one prize in a hero's hands. A second take replaces the first in the slot; the first,
      // taken with nobody carrying it, then counts as banked below (rare: two places' prizes at once).
      cargo[taker.id] = ev.thing;
      ctx.emit('prize-taken', { heist: p.heist.id, thing: ev.thing, by: taker.id, player: taker.player });
    }
    for (const id of Object.keys(heists).sort()) {
      const heist = heists[id]!;
      const jobs = (world.jobs ??= {});
      const job = (jobs[id] ??= { from: null, seen: false });
      const heroesIn = world.entities.filter((e) => e.player !== null && e.room === heist.room);
      const cargo = world.cargo ?? {};
      if (job.from === null && heroesIn.length > 0) {
        job.from = world.tick;
        job.seen = false;
      }
      if (job.from !== null) {
        // The place's people, wherever they are now (a guard who followed you out still counts).
        const people = (content.placements[heist.room]?.place ?? []).filter((p) => p.npc !== undefined);
        if (!job.seen) {
          for (const p of people) {
            const w = findEntity(world, p.id);
            if (!w) continue;
            if (world.entities.some((h) => h.player !== null && canSee(content, w, h))) {
              job.seen = true;
              break;
            }
          }
        }
      }
      for (const prize of heist.prizes) {
        const thing = findEntity(world, prize.thing);
        if (!thing?.c.thing || thing.c.thing.takenBy === null) continue;
        const banked = (world.banked ??= []);
        if (banked.includes(prize.thing)) continue;
        const hero = Object.keys(cargo).find((h) => cargo[h] === prize.thing);
        const carrier = hero === undefined ? undefined : findEntity(world, hero);
        if (hero !== undefined && carrier && carrier.player !== null) {
          if (carrier.room === heist.room || !onOwnFeet(carrier)) continue;
          delete cargo[hero];
          banked.push(prize.thing);
          ctx.emit('prize-banked', { heist: id, thing: prize.thing, by: carrier.id, player: carrier.player });
          if (job.from !== null && !job.seen) ctx.emit('clean-getaway', { heist: id, thing: prize.thing, by: carrier.id, player: carrier.player });
          continue;
        }
        // Taken, and nobody here carries it: an older kept game, or the carrier left the game.
        if (hero !== undefined) delete cargo[hero];
        banked.push(prize.thing);
      }
      if (job.from !== null && heroesIn.length === 0 && !heist.prizes.some((p) => Object.values(world.cargo ?? {}).includes(p.thing))) {
        job.from = null;
        job.seen = false;
      }
    }
  },
};
export default system;
