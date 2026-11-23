import { heroesIn, outposts, peopleIn, postOf } from '../outpost/state.ts';
import type { System } from '../types.ts';
import { findEntity, spawnBody } from '../world.ts';

/**
 * Each finished call walks one wave in at the outpost's entry.
 *
 * INTENT (doc 24: "the system must never impose an arbitrary maximum wave
 * count"): no cap on waves. Waves are rows of the outpost's table, harder
 * row by row; after the last row the last row comes again, for ever.
 * INTENT (doc 24, "bounded crowds"): a cap on bodies. A wave walks in only
 * while the room's people and the wave fit under the outpost's `bound`;
 * otherwise it waits. Out-cold people still count (they are still there).
 * INTENT (D-061: escape the zone): with no hero left in the room, queued
 * waves are dropped and nothing new starts; the people there stay.
 */
const system: System = {
  id: 'outpost-wave',
  order: 59,
  tuning: {
    outpostBoundOn: { min: 0, max: 1, what: 'switch: 1 = a wave waits while it would take the outpost room past its bound on people; 0 = no bound (a control for the scenarios only)' },
    outpostSendOn: { min: 0, max: 1, what: 'switch: 1 = a wave walks to where its caller saw a hero; 0 = it stands at the entry (a control for the scenarios only)' },
  },
  run(ctx) {
    const { world, content } = ctx;
    const { outpostBoundOn, outpostZoneEndOn, outpostSendOn } = content.tuning.world;
    for (const op of outposts(content)) {
      const post = postOf(world, op);
      if (!post) continue;
      const sig = post.c.signaler!;
      if (heroesIn(world, op.room).length === 0 && outpostZoneEndOn! >= 1) {
        sig.queued = 0;
        continue;
      }
      while (sig.queued > 0) {
        const row = Math.min(sig.sent, op.waves.length - 1);
        const people = op.waves[row]!;
        if (outpostBoundOn! >= 1 && peopleIn(world, op.room).length + people.length > op.bound) break;
        const ids: string[] = [];
        people.forEach((p, i) => {
          // Deterministic ids (no randomness, no clock): every machine makes the same ones.
          const id = `${op.id}:w${sig.sent}:${i}`;
          if (findEntity(world, id)) return;
          const e = spawnBody(world, content, { id, character: p.character, room: op.room, tile: op.entry });
          // People get c.npc from a placement entry (npc-setup); a wave has none, so it is given here.
          // `home` is the outpost room; with no placement entry, mood 1's routine is standing still.
          e.c.npc = { kind: p.npc, home: op.room, mood: 1, dissonance: 0, offenders: [], quiet: 0, cool: 0, lastSeen: null, step: 0, stepTicks: 0, stall: 0, bark: null };
          e.facing = -1;
          // Step 7 (DRAFT): the wave walks to where its caller saw a hero.
          // INTENT (D-065, "Escalation is not omniscient"): that sighting, kept with the call, is the
          // only place a wave is told; outpost-fight takes it from there under canSee.
          const seen = sig.seen ?? null;
          if (seen && outpostSendOn! >= 1) e.c.outpostFight = { x: seen.x, y: seen.y };
          if (op.leaveCold > 0 || op.leaveIdle > 0) e.c.outpostWave = { outpost: op.id, cold: 0, idle: 0, going: false };
          ids.push(id);
        });
        ctx.emit('outpost-wave', { outpost: op.id, wave: sig.sent, row, people: ids });
        sig.sent++;
        sig.queued--;
      }
    }
  },
};
export default system;
