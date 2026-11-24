import { homeOf, restoreStage, stageOfRoom, stageRooms, type StageRun } from '../stage.ts';
import type { System } from '../types.ts';

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
 *   counted, the clock and counts at zero (`stage-restarted`).
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

      if (run.state !== 'running' && inside.length > 0) {
        run.state = 'running';
        run.started = world.tick;
        run.tries = 0;
        run.pending = [];
        ctx.emit('stage-started', { stage: s.id, player: inside[0]!.player });
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
        ctx.emit('stage-restarted', { stage: s.id, tries: run.tries });
      }
    }
  },
};
export default system;
