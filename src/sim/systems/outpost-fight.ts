import { canAct } from '../body-state.ts';
import { canSee } from '../npc/sight.ts';
import type { Room } from '../../content/kinds/rooms.ts';
import { centre, drive, isOut, npcKind, placementOf, seconds } from '../npc/state.ts';
import { heroesIn } from '../outpost/state.ts';
import type { Entity, System } from '../types.ts';

declare module '../types.ts' {
  interface Components {
    /**
     * The chase (owner's report 2026-11-24, DRAFT): on a fighter whose NPC
     * kind has `search`, after he has seen a hero. `chasing` while he walks
     * at the last place seen; `searching` from there: on `search.on` pixels
     * the way the hero was seen going (`dir`), then turning about until
     * `search.time` is up (`ticks`, `from` = where the search began);
     * `returning` to his placement's column. `stall`: ticks with no headway.
     * Gone once he is back (his routine takes over) or has no post.
     */
    outpostChase?: { phase: 'chasing' | 'searching' | 'returning'; dir: 1 | -1; ticks: number; from: number; stall: number };
  }
}

/** DRAFT: a walk with no headway for this many ticks (a wall, a ledge he cannot climb) is given up, as routines do. */
const STALLED = 45;
/** How close, in pixels, counts as back at his post. */
const ARRIVED = 2;

/** INTENT (the street's clearOfDoors, alert-respond.ts): a walk door carries whoever touches it, so a search never walks into one. */
function nearWalkDoor(room: Room | undefined, x: number, dir: number): boolean {
  for (const d of room?.doors ?? []) {
    if (d.use !== 'walk') continue;
    if (dir < 0 && d.side === 'west' && x - room!.tile <= (d.tx + d.w) * room!.tile) return true;
    if (dir > 0 && d.side === 'east' && x + room!.tile >= d.tx * room!.tile) return true;
  }
  return false;
}

/** Walks one way, counting ticks with no headway; false once stalled. */
function walk(e: Entity, ch: NonNullable<Entity['c']['outpostChase']>, dir: number): boolean {
  ch.stall = Math.abs(e.vx) < 1 ? ch.stall + 1 : 0;
  if (ch.stall >= STALLED) return false;
  drive(e, { x: dir > 0 ? 1 : -1, y: 0, held: [] });
  return true;
}

/**
 * Hostile people fight heroes: it is their business as usual (D-060), so
 * their mood stays 1 throughout. Runs after outpost-call (57) and overlays
 * the input npc-act wrote; a caller walking to the post or sounding it is
 * left to outpost-call.
 * DRAFT (the Step 12 lead, 15:05 UTC, for Step 16): who fights is any
 * person of the `bad` side whose body lists `attack`, wherever they are
 * placed or walked in, not only in an outpost's room. Today that is the
 * outpost fighter and Step 16's kinds, and (Step 18) the villain, whose
 * kind fights only a hero who struck him (`"fights": "when-struck"`).
 *
 * INTENT (D-065, "Escalation is not omniscient"): the only read of a hero's
 * position is under canSee on the same tick. Losing sight, a fighter walks
 * to the last place it saw one and stands there.
 * DRAFT: the nearest hero seen; a fresh press of attack every other tick in
 * reach (Step 2's attack starts a swing on a fresh press, and its own
 * cooldown sets the pace).
 */
const system: System = {
  id: 'outpost-fight',
  order: 58,
  run(ctx) {
    const { world, content } = ctx;
    const reach = content.tuning.world.npcChargeReach!;
    {
      for (const e of world.entities) {
        if (!e.c.npc || e.player !== null || npcKind(content, e)?.side !== 'bad') continue;
        if (e.c.outpostCall?.phase === 'going' || e.c.outpostCall?.phase === 'sounding') continue;
        if (isOut(e) || !canAct(e)) continue;
        if (!content.characters[e.kind]?.verbs.includes('attack')) continue;
        // Step 18: a kind that fights only when struck narrows the heroes to those who struck it
        // (src/sim/systems/fight-struck.ts); it still fights only one it sees, below.
        const struck = npcKind(content, e)?.fights === 'when-struck' ? (e.c.struck ?? {}) : null;
        const heroes = heroesIn(world, e.room).filter((h) => struck === null || h.id in struck);
        const me = centre(content, e);
        let seen: { x: number; y: number } | null = null;
        let seenVx = 0;
        let best = Infinity;
        for (const h of heroes) {
          if (!canSee(content, e, h)) continue;
          const c = centre(content, h);
          const d = Math.abs(c.x - me.x);
          if (d < best) {
            best = d;
            seen = c;
            seenVx = h.vx;
          }
        }
        // A driver in a machine's seat is the machine's (machine-driven, Step 20): he never searches or turns about.
        const seated = world.entities.some((m) => (m.c as { seat?: { driver: string | null } }).seat?.driver === e.id);
        // Vehicles B (Step 20), 2026-11-24: nor does he fight from the seat; driving and ramming are machine-driven's.
        // Pulled out, he is no longer the seat's driver and fights like anyone.
        if (seated) {
          delete e.c.outpostChase;
          continue;
        }
        const search = npcKind(content, e)?.search;
        if (seen) {
          e.c.outpostFight = seen;
          if (search) {
            // The way the hero was seen going, read on this tick under canSee (D-065); standing, the way he stands.
            const dir = Math.abs(seenVx) > 1 ? Math.sign(seenVx) : Math.sign(seen.x - me.x) || e.facing;
            e.c.outpostChase = { phase: 'chasing', dir: dir > 0 ? 1 : -1, ticks: 0, from: me.x, stall: 0 };
          }
        }
        const target = e.c.outpostFight;
        if (!target) {
          if (search && e.c.outpostChase) afterLosing(e, search, me.x);
          continue;
        }
        const dx = target.x - me.x;
        const chasing = search ? e.c.outpostChase : undefined;
        // A kind with `search`, walking at an empty place a wall or a step keeps him from (the hero went up
        // where he cannot climb), gives that walk up and searches where he stands: never pushes a wall for ever.
        const stuck = !seen && chasing !== undefined && chasing.phase === 'chasing' && !walk(e, chasing, dx);
        if (Math.abs(dx) > reach && !stuck) {
          drive(e, { x: dx > 0 ? 1 : -1, y: 0, held: [] });
          continue;
        }
        if (!seen) {
          // Arrived where a hero was last seen, and nobody is there: stand (a kind with
          // `search` searches from here instead, from the next tick).
          e.c.outpostFight = null;
          // (A wave's person sent to its caller's sighting arrives with no chase yet: he searches too.)
          if (search) e.c.outpostChase = { phase: 'searching', dir: e.c.outpostChase?.dir ?? (e.facing > 0 ? 1 : -1), ticks: 0, from: me.x, stall: 0 };
          drive(e, { x: 0, y: 0, held: [] });
          continue;
        }
        const facing = dx === 0 || (dx > 0 ? 1 : -1) === e.facing;
        if (!facing) drive(e, { x: dx > 0 ? 0.01 : -0.01, y: 0, held: [] });
        else drive(e, { x: 0, y: 0, held: world.tick % 2 === 0 ? ['attack'] : [] });
      }
    }

    /**
     * Searching, then going back: fixed steps, no choices (D-055). Seeing a
     * hero at any step starts the chase again (above).
     * INTENT (D-065): nothing here reads where a hero is; the search goes the
     * way he was last seen going, and turning about is how a hero who slipped
     * behind is found again, only if he is still in sight.
     */
    function afterLosing(e: Entity, search: { on: number; time: number; turn: number }, x: number): void {
      const ch = e.c.outpostChase!;
      const room = content.rooms[e.room];
      if (ch.phase === 'searching') {
        ch.ticks++;
        if ((x - ch.from) * ch.dir < search.on && !nearWalkDoor(room, x, ch.dir) && walk(e, ch, ch.dir)) return;
        if (ch.ticks < seconds(search.time)) {
          // Look the way he went first, then back, then again.
          const face = Math.floor(ch.ticks / seconds(search.turn)) % 2 === 0 ? ch.dir : -ch.dir;
          drive(e, e.facing === face ? { x: 0, y: 0, held: [] } : { x: face * 0.01, y: 0, held: [] });
          return;
        }
        Object.assign(ch, { phase: 'returning', stall: 0 });
      }
      if (ch.phase === 'returning') {
        const post = placementOf(content, e);
        // A wave's person has no post (outpost-leave walks him off); a body carried to another room stays there.
        if (!post || !room || e.c.npc?.home !== e.room) {
          delete e.c.outpostChase;
          return;
        }
        const dx = post.tile[0] * room.tile + room.tile / 2 - x;
        if (Math.abs(dx) <= ARRIVED || !walk(e, ch, dx)) delete e.c.outpostChase;
        return;
      }
      // Chasing with nowhere left to go (outpost-leave cleared the place): nothing more.
      delete e.c.outpostChase;
    }
  },
};
export default system;
