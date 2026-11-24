import { heroesIn, outposts, peopleIn, postOf } from '../outpost/state.ts';
import type { Outpost } from '../../content/kinds/outposts.ts';
import type { System, World } from '../types.ts';
import type { Content } from '../../content/types.ts';

/**
 * The owner, 2026-11-24: "Alarms should spawn more enemies of increasing
 * strength that come in from the sides." DRAFT: where person `i` of wave `n`
 * walks in. The place reported is the caller's sighting (D-065: the only
 * place a wave is told), or the old entry when there is none. On each side
 * of it, the nearest entry at least `entryAway` tiles off (else the farthest
 * there); people alternate sides, wave by wave starting on the other side;
 * with entries on one side only, everyone comes from there.
 */
function entryFor(op: Outpost, tile: number, seenX: number | null, n: number, i: number): [number, number] {
  if (op.entries.length < 2 || seenX === null) return op.entries[0]!;
  const col = seenX / tile;
  const pick = (side: [number, number][]): [number, number] | undefined => {
    if (side.length === 0) return undefined;
    const far = [...side].sort((a, b) => Math.abs(a[0] + 0.5 - col) - Math.abs(b[0] + 0.5 - col));
    return far.find((t) => Math.abs(t[0] + 0.5 - col) >= op.entryAway) ?? far[far.length - 1];
  };
  const left = pick(op.entries.filter((t) => t[0] + 0.5 < col));
  const right = pick(op.entries.filter((t) => t[0] + 0.5 >= col));
  if (!left) return right!;
  if (!right) return left;
  return (i + n) % 2 === 0 ? right : left;
}
import { findEntity, spawnBody } from '../world.ts';

/**
 * Step 20 push 3 (DRAFT; the alarms builder's ask, 2026-11-24): a person who
 * rides a machine skips an entry where a standing machine already is (its
 * body within the new machine's width of the entry's middle): the camp's
 * parked wagon stands on its west entry. He takes the next entry on that side
 * by the same order, else the other side's; with none clear, the one chosen.
 * Read from the world, never a listed tile, so an entry can move freely.
 */
function rideEntry(world: World, content: Content, op: Outpost, at: [number, number], w: number, tile: number, seenX: number | null): [number, number] {
  const taken = ([c]: [number, number]): boolean => {
    const mid = (c + 0.5) * tile;
    return world.entities.some((o) => o.room === op.room && content.machines !== undefined && Object.values(content.machines).some((d) => d.character === o.kind) && Math.abs(o.x + (content.characters[o.kind]?.box.w ?? 0) / 2 - mid) < w);
  };
  if (!taken(at)) return at;
  const col = seenX === null ? null : seenX / tile;
  const left = (t: [number, number]): boolean => col !== null && t[0] + 0.5 < col;
  const byNear = (a: [number, number], b: [number, number]): number => (col === null ? 0 : Math.abs(a[0] + 0.5 - col) - Math.abs(b[0] + 0.5 - col));
  const same = op.entries.filter((t) => t !== at && left(t) === left(at)).sort(byNear);
  const other = op.entries.filter((t) => left(t) !== left(at)).sort(byNear);
  return [...same, ...other].find((t) => !taken(t)) ?? at;
}

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
          const tile = content.rooms[op.room]!.tile;
          const seenX = outpostSendOn! >= 1 ? (sig.seen?.x ?? null) : null;
          // Step 20 (DRAFT, vehicles B): a person who `rides` walks in at the reins: the machine is put down first, on the same tile,
          // and machine-seat (order 120, this tick) seats him, since he has c.npc by then. machine-driven drives it from there.
          const ride = p.rides !== undefined ? content.machines?.[p.rides] : undefined;
          const first = entryFor(op, tile, seenX, sig.sent, i);
          const at = ride ? rideEntry(world, content, op, first, content.characters[ride.character]?.box.w ?? tile, tile, seenX) : first;
          const m = ride && !findEntity(world, `${id}:ride`) ? spawnBody(world, content, { id: `${id}:ride`, character: ride.character, room: op.room, tile: at }) : undefined;
          const e = spawnBody(world, content, { id, character: p.character, room: op.room, tile: at });
          // People get c.npc from a placement entry (npc-setup); a wave has none, so it is given here.
          // `home` is the outpost room; with no placement entry, mood 1's routine is standing still.
          e.c.npc = { kind: p.npc, home: op.room, mood: 1, dissonance: 0, offenders: [], quiet: 0, cool: 0, lastSeen: null, step: 0, stepTicks: 0, stall: 0, bark: null };
          // With entries on both sides, facing the place reported; one entry faces west, into the room, as it always did.
          e.facing = op.entries.length > 1 && sig.seen && sig.seen.x > (at[0] + 0.5) * tile ? 1 : -1;
          if (m) m.facing = e.facing;
          // Step 7 (DRAFT): the wave walks to where its caller saw a hero.
          // INTENT (D-065, "Escalation is not omniscient"): that sighting, kept with the call, is the
          // only place a wave is told; outpost-fight takes it from there under canSee.
          const seen = sig.seen ?? null;
          if (seen && outpostSendOn! >= 1) e.c.outpostFight = { x: seen.x, y: seen.y };
          // Step 20 (DRAFT): his machine is told the same place, so it is driven at it (machine-driven) though he sees nobody yet.
          if (m && seen && outpostSendOn! >= 1) m.c.chase = { x: seen.x };
          if (op.leaveCold > 0 || op.leaveIdle > 0) e.c.outpostWave = { outpost: op.id, cold: 0, idle: 0, going: false, from: at };
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
