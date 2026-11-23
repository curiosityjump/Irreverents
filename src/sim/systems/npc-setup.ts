import { addEntity, findEntity } from '../world.ts';
import type { System } from '../types.ts';
import { THING_KIND } from '../npc/state.ts';

/**
 * Makes a placed body a person, and puts a room's bodiless things in the
 * world. Bodies are placed by populateRoom() (src/sim/world.ts); this pass
 * only adds what Step 4 owns: `c.npc` on any entity whose placement entry
 * names an `npc`, and one entity per entry of `things` once anybody is in
 * that room. Safe every tick: what is already there is left alone.
 */
const system: System = {
  id: 'npc-setup',
  order: 10,
  run(ctx) {
    const { world, content } = ctx;
    for (const roomId of Object.keys(content.placements).sort()) {
      const placed = content.placements[roomId]!;
      for (const p of placed.place) {
        if (p.npc === undefined) continue;
        const e = findEntity(world, p.id);
        if (!e || e.c.npc) continue;
        e.c.npc = { kind: p.npc, home: roomId, mood: 1, dissonance: 0, offenders: [], quiet: 0, cool: 0, lastSeen: null, step: 0, stepTicks: 0, stall: 0, bark: null };
      }
      const things = placed.things ?? [];
      const room = content.rooms[roomId];
      if (things.length === 0 || !room) continue;
      if (!world.entities.some((e) => e.room === roomId && e.kind !== THING_KIND)) continue;
      for (const t of things) {
        if (findEntity(world, t.id)) continue;
        addEntity(world, {
          id: t.id,
          kind: THING_KIND,
          player: null,
          room: roomId,
          x: t.tile[0] * room.tile,
          y: t.tile[1] * room.tile,
          vx: 0,
          vy: 0,
          facing: 1,
          onGround: true,
          c: { thing: { takenBy: null } },
        });
      }
    }
  },
};
export default system;
