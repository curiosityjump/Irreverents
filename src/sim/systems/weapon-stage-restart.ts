import { stageRooms } from '../stage.ts';
import type { System } from '../types.ts';
import { restoreRoomWeapons, weaponWorld } from '../weapons.ts';

/**
 * A stage starting over puts its weapons back as they began (Step 23 for
 * Step 22; docs/mechanisms/weapons.md, docs/mechanisms/stages.md): on
 * `stage-restarted` (systems/stage-run.ts, 612), every loose weapon in the
 * stage's rooms is gone and each of their sources stands a fresh one at once
 * (restoreRoomWeapons, src/sim/weapons.ts). So the quarry's spear and bomb lie
 * where they began on every try, and a bomb burst on the last try is back.
 * Kept here, not in stage-run, so the stage's files need no weapon line.
 * The server's world and a scenario's only (weaponWorld).
 */
const system: System = {
  id: 'weapon-stage-restart',
  order: 613,
  run(ctx) {
    const { world, content } = ctx;
    if (!weaponWorld(world)) return;
    for (const ev of ctx.events) {
      if (ev.type !== 'stage-restarted') continue;
      const s = content.stages?.[ev.stage];
      if (s) restoreRoomWeapons(world, content, stageRooms(content, s));
    }
  },
};
export default system;
