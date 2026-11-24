import { canSee } from '../npc/sight.ts';
import { npcKind } from '../npc/state.ts';
import { atStageEnd, freshCounts, homeOf, restoreStage, stageOfRoom, stageRooms, stageStars, type StageRun } from '../stage.ts';
import type { System } from '../types.ts';
import { findEntity } from '../world.ts';

/**
 * Step 22 (docs/mechanisms/stages.md): a stage's run, from start to start
 * over. Each tick, for each stage that is on:
 *
 * - the first time a stage is seen, its people and bodies as first placed
 *   are kept (`world.stageHome`), what a start-over puts back;
 * - a played hero inside one of its rooms with no run under way starts one
 *   (`stage-started`): the clock from now, the counts at zero;
 * - a `thrown-out` (Step 21's throw, the stage's defeat file landing at its
 *   entrance) of a player inside it is a try: the player waits in `pending`;
 * - once every player still inside the stage is one of those waiting (solo:
 *   at once), the stage is put back as it began (`restoreStage`), the try
 *   counted, the clock and counts at zero (`stage-restarted`);
 * - while it runs, the try's statistics gather (`counts`): bad guys knocked
 *   flat by a played hero (the Hall detector's rule, hall-detect.ts, copied:
 *   a `flattened` whose `by` is a played body), calls finished in its rooms,
 *   whether any bad guy of it had a played hero in sight (canSee, the test
 *   heist-cargo uses for a clean getaway), and a prize of its rooms banked;
 * - a played hero reaching its end (Step 22 push 3) clears it once:
 *   `stage-cleared` with the statistics and stars, the best kept
 *   (`best`), and no new run starts until everyone has left the stage.
 *
 * DRAFT (docs/decisions-log.md, "Step 22"): with friends, a beaten player is
 * back at the entrance at once (the defeat file) and the stage starts over
 * only when nobody else is left inside; a friend who walks out of the level
 * without being beaten does not start it over. A friend joining mid-run joins
 * the run: its clock and counts are shared. The clock does not stop while a
 * menu is open: the world never pauses.
 * INTENT (docs/plan/step-22.md): only inside a stage, only on being beaten.
 * Elsewhere nothing is put back (D-077); in a stage, an alarm still opens a
 * fight or an escape, and only being beaten starts it over.
 * Runs after the throw (defeat-throw, 590) and the doors and level-explore
 * (600, 610), so a body that went in this tick counts in the room it reached.
 */
const system: System = {
  id: 'stage-run',
  order: 612,
  run(ctx) {
    const { world, content } = ctx;
    const stages = Object.values(content.stages ?? {}).filter((s) => s.on);
    if (stages.length === 0) return;
    for (const s of [...stages].sort((a, b) => (a.id < b.id ? -1 : 1))) {
      const home = (world.stageHome ??= {});
      if (!home[s.id]) home[s.id] = homeOf(content, s);
      const runs = (world.stages ??= {});
      const run: StageRun = (runs[s.id] ??= { state: 'idle', started: world.tick, tries: 0, pending: [] });
      run.pending ??= [];
      const rooms = new Set(stageRooms(content, s));
      const inside = world.entities.filter((e) => e.player !== null && rooms.has(e.room));

      if (run.state === 'cleared' && inside.length === 0) run.state = 'idle';
      if (run.state === 'idle' && inside.length > 0) {
        run.state = 'running';
        run.started = world.tick;
        run.tries = 0;
        run.pending = [];
        run.counts = freshCounts();
        ctx.emit('stage-started', { stage: s.id, player: inside[0]!.player });
      }
      // An older kept game's run, from before the statistics.
      if (run.state === 'running') run.counts ??= freshCounts();
      const counts = run.counts;
      // INTENT: only the world everyone shares counts (hall-detect.ts): a page steps its own
      // character in a world of its own (`taken` set) with nobody else in it, and takes
      // world.stages as the server sends it.
      const shared = world.taken === undefined;
      if (run.state === 'running' && counts && shared) {
        const heists = Object.values(content.heists ?? {}).filter((h) => rooms.has(h.room)).map((h) => h.id);
        for (const ev of ctx.events) {
          if (ev.type === 'flattened' && ev.by !== null) {
            const target = findEntity(world, ev.target);
            const by = findEntity(world, ev.by);
            if (!target || target.player !== null || !target.c.npc || !rooms.has(target.room)) continue;
            if (!by || by.player === null) continue;
            if (!counts.defeated.includes(target.id)) counts.defeated.push(target.id);
          } else if (ev.type === 'outpost-call-completed') {
            if (rooms.has(content.outposts?.[ev.outpost]?.room ?? '')) counts.alarms++;
          } else if (ev.type === 'call-completed') {
            if (rooms.has(ev.area)) counts.alarms++;
          } else if (ev.type === 'prize-banked') {
            if (heists.includes(ev.heist)) counts.hoard = true;
          }
        }
        if (!counts.seen) {
          // DRAFT (docs/decisions-log.md, "Step 22 push 3"): "unseen" is the heist's test, made the
          // stage's: no bad guy (npc side "bad") in its rooms, placed or a wave's, ever had a played hero in sight.
          counts.seen = world.entities.some(
            (w) => w.player === null && rooms.has(w.room) && npcKind(content, w)?.side === 'bad' && inside.some((h) => canSee(content, w, h)),
          );
        }
      }

      for (const ev of ctx.events) {
        if (ev.type !== 'thrown-out' || ev.player === null || run.state !== 'running') continue;
        if (stageOfRoom(content, ev.from)?.id !== s.id) continue;
        if (!run.pending.includes(ev.player)) run.pending.push(ev.player);
      }

      if (run.pending.length > 0 && inside.every((e) => run.pending.includes(e.player!))) {
        restoreStage(world, content, s);
        run.tries++;
        run.pending = [];
        run.started = world.tick;
        run.counts = freshCounts();
        ctx.emit('stage-restarted', { stage: s.id, tries: run.tries });
      }

      if (run.state === 'running' && counts && shared) {
        const there = inside.find((e) => !run.pending.includes(e.player!) && atStageEnd(content, s, e));
        if (there) {
          // A prize still in a hero's hands at the end counts as carried out: the end is inside the stage.
          const prizes = Object.values(content.heists ?? {}).filter((h) => rooms.has(h.room)).flatMap((h) => h.prizes.map((p) => p.thing));
          const carried = world.entities.some((e) => e.player !== null && prizes.includes(world.cargo?.[e.id] ?? ''));
          const r = {
            ticks: world.tick - run.started,
            defeated: counts.defeated.length,
            alarms: counts.alarms,
            tries: run.tries,
            unseen: !counts.seen,
            hoard: counts.hoard || carried,
          };
          const stars = stageStars(s, r);
          const best = !run.best || stars > run.best.stars || (stars === run.best.stars && r.ticks < run.best.ticks);
          if (best) run.best = { stars, ticks: r.ticks };
          run.state = 'cleared';
          run.pending = [];
          ctx.emit('stage-cleared', { stage: s.id, player: there.player, ...r, stars, best });
        }
      }
    }
  },
};
export default system;
