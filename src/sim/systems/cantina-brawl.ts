import { ticksOf } from '../body-state.ts';
import { byBell, cantinasOf, hasBody, isRegular } from '../cantina.ts';
import type { System } from '../types.ts';
import { findEntity } from '../world.ts';

/**
 * The cantina's brawl: when it starts and when it settles (Step 11, D-085;
 * docs/mechanisms/cantina.md). A player's hit landing on a regular starts
 * it; a swing that misses, standing beside one, or anything else does not.
 * While it is on, every body in the room carries `c.brawl`, the friend
 * shares Step 2's hit reads in place of its own (so friends launch and
 * hurt each other here), and the regulars fight (systems/cantina-regulars.ts).
 *
 * INTENT: there is always a way out (docs/plan/step-11.md; Q-008 in
 * docs/decisions-log.md). The owner: "There is a bell in the middle of the
 * cantina player can use to stop fights": a player's fresh press of Use
 * within reach of the bell ends it at once. It also ends when no player is
 * left in the room, and (DRAFT: off, calmTime 0) when no player has
 * attacked for calmTime.
 * `c.brawl` comes off a body the tick it leaves the room or the brawl
 * ends: a friend in the street is harmless again (Step 2's rule).
 * DRAFT: only a player's swing keeps it going; the regulars swing for as
 * long as it is on, so counting theirs would never let it end.
 * Runs after the verbs (100, where hits land) and the doors (600).
 */
const system: System = {
  id: 'cantina-brawl',
  order: 640,
  run(ctx) {
    const { world, content } = ctx;
    for (const { file, state } of cantinasOf(world, content)) {
      const room = file.room;
      const inRoom = (id: string): boolean => findEntity(world, id)?.room === room;
      // The bell: a fresh press of Use by a player standing by it.
      let rung = false;
      for (const e of world.entities) {
        if (e.player === null) continue;
        if (e.room !== room) {
          delete e.c.cantinaUse;
          continue;
        }
        const down = ctx.inputs[e.player]?.held.includes('interact') ?? false;
        const use = (e.c.cantinaUse ??= { held: false });
        const fresh = down && !use.held;
        use.held = down;
        if (fresh && !rung && byBell(content, file, e)) {
          rung = true;
          state.rang = world.tick;
          ctx.emit('cantina-bell', { room, by: e.id });
        }
      }
      if (state.on && rung) {
        state.on = false;
        ctx.emit('cantina-brawl-end', { room, why: 'bell' });
      } else if (!state.on) {
        const start = ctx.events.find((ev) => {
          if (ev.type !== 'hit' || ev.player === null) return false;
          const target = findEntity(world, ev.target);
          return target !== undefined && isRegular(target) && target.room === room && inRoom(ev.by);
        });
        if (start && start.type === 'hit') {
          state.on = true;
          state.quiet = 0;
          state.score = {};
          ctx.emit('cantina-brawl-start', { room, by: start.by });
        }
      } else if (!world.entities.some((e) => e.player !== null && e.room === room)) {
        state.on = false;
        ctx.emit('cantina-brawl-end', { room, why: 'empty' });
      } else {
        const swung = ctx.events.some((ev) => ev.type === 'attacked' && ev.player !== null && inRoom(ev.by));
        state.quiet = swung ? 0 : state.quiet + 1;
        if (file.calmTime > 0 && state.quiet >= ticksOf(file.calmTime)) {
          state.on = false;
          ctx.emit('cantina-brawl-end', { room, why: 'calm' });
        }
      }
      for (const e of world.entities) {
        if (state.on && e.room === room && hasBody(content, e)) e.c.brawl ??= { ...file.friend };
        else if (e.c.brawl) delete e.c.brawl;
      }
    }
  },
};
export default system;
