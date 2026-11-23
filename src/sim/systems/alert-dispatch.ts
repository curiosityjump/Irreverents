import type { Door, Room } from '../../content/kinds/rooms.ts';
import { alertLevel, alertOf, MAX_ALERT } from '../npc/alert.ts';
import { centre, drive, isOut, npcKind, setMood } from '../npc/state.ts';
import type { Entity, System, World } from '../types.ts';
import { findEntity, removeEntity, spawnBody } from '../world.ts';

declare module '../types.ts' {
  interface Components {
    /**
     * On an area's alert entity (`~alert:<area>`), for an area with a
     * dispatch file: the rows waiting to walk in (each a row index) and how
     * many rows have walked in so far (for deterministic ids).
     */
    dispatch?: { queue: number[]; sent: number };
  }
  interface EventMap {
    /** A row of a dispatch table walked in: `row` is its index in the table (level - 1), `people` the new entity ids. */
    'dispatch-arrived': { area: string; row: number; people: string[] };
  }
}

/** How close, in pixels, counts as having reached the door to leave by. */
const ARRIVED = 2;
/** DRAFT: a walk out that has made no headway for this many ticks is ended there (there is always a way out). */
const STALLED = 45;

/**
 * The tile beside a walk door, inside the room, at the door's floor, where
 * someone coming in by it first stands; the `nth` to come by the same door in
 * one row stands that many tiles further in, so no two start on one tile.
 * DRAFT: a row's own people only; a row is at most a few people.
 */
function besideDoor(room: Room, door: Door, nth: number): [number, number] {
  const col = door.side === 'west' ? door.tx + door.w + nth : door.tx - 1 - nth;
  return [Math.max(0, Math.min(room.w - 1, col)), door.ty + door.h - 1];
}

/** Where, across, someone leaving by a walk door stops and is gone: just short of it, so the door never carries them. */
function doorEdge(room: Room, door: Door): number {
  return door.side === 'west' ? (door.tx + door.w) * room.tile + ARRIVED + 1 : door.tx * room.tile - ARRIVED - 1;
}

/** People (bodies with an NPC kind) in a room, out cold or not: they are still there. */
function peopleIn(world: World, content: Parameters<typeof npcKind>[0], room: string): Entity[] {
  return world.entities.filter((e) => e.room === room && e.player === null && e.c.npc && npcKind(content, e));
}

/**
 * The town sends help by rows (Step 4, the town's tiers). For an area with a
 * dispatch file (content/dispatch/<area>.json): each time its alert goes UP,
 * that level's row is queued; a completed call with the alert already at its
 * most queues the last row again. A queued row walks in by the area's doors
 * (split between them in turn) while it fits under the cap; otherwise it
 * waits. Each arrival is given `c.npc` (home the area) and `c.respond`
 * heading to the place reported, in mood 2 (`called`). When the alert is
 * over, arrivals walk out by the door they came in by and are removed;
 * placed people go home as alert-respond already does.
 *
 * INTENT (D-063): only a completed call brings anyone. This reads the
 * alert's own events; it never raises or lowers the alert.
 * INTENT (D-065, "Escalation is not omniscient"): arrivals head to the place
 * reported (the alert entity's x), never to a hero.
 * DRAFT (docs/decisions-log.md, "Step 4: dispatch"): the rows, the cap, the
 * doors and the repeat at the top level are first guesses.
 */
const system: System = {
  id: 'alert-dispatch',
  order: 58,
  tuning: {
    npcDispatchCapOn: { min: 0, max: 1, what: 'switch: 1 = a dispatch row waits while it would take the room past its cap on people; 0 = no cap (a control for the scenarios only)' },
  },
  run(ctx) {
    const { world, content } = ctx;
    const tables = content.dispatch ?? {};
    const capOn = content.tuning.world.npcDispatchCapOn! >= 1;

    // Queue rows from this tick's calls and alert changes.
    const raisedTo = new Map<string, number>();
    for (const ev of ctx.events) {
      if (ev.type === 'alert-changed' && ev.to > ev.from && tables[ev.area]) raisedTo.set(ev.area, ev.to);
    }
    for (const ev of ctx.events) {
      if (ev.type !== 'call-completed') continue;
      const table = tables[ev.area];
      const alert = alertOf(world, ev.area);
      if (!table || !alert) continue;
      const st = (alert.c.dispatch ??= { queue: [], sent: 0 });
      const to = raisedTo.get(ev.area);
      if (to !== undefined) {
        raisedTo.delete(ev.area);
        st.queue.push(Math.min(to, table.rows.length) - 1);
      } else if (alertLevel(world, ev.area) >= MAX_ALERT) {
        // INTENT (doc 24: "never impose an arbitrary maximum wave count"): at the top, a further call brings the last row again, under the cap.
        // DRAFT: one such row waits at a time; calls finished while it waits add nothing (a full street does not bank a flood for later).
        if (st.queue.length === 0) st.queue.push(table.rows.length - 1);
      }
    }

    for (const table of Object.values(tables)) {
      const area = table.id;
      const room = content.rooms[area];
      const alert = alertOf(world, area);
      const st = alert?.c.dispatch;
      if (!room || !alert || !st) continue;
      // The alert is over: nothing more walks in.
      if (alertLevel(world, area) === 0) st.queue = [];
      while (st.queue.length > 0) {
        const index = st.queue[0]!;
        const row = table.rows[index] ?? [];
        if (capOn && peopleIn(world, content, area).length + row.length > table.cap) break;
        st.queue.shift();
        if (row.length === 0) continue;
        const ids: string[] = [];
        row.forEach((p, i) => {
          // Deterministic ids (no randomness, no clock): every machine makes the same ones.
          const id = `${area}:help${st.sent}:${i}`;
          if (findEntity(world, id)) return;
          const doorId = table.doors[i % table.doors.length]!;
          const door = room.doors.find((d) => d.id === doorId)!;
          const e = spawnBody(world, content, { id, character: p.character, room: area, tile: besideDoor(room, door, Math.floor(i / table.doors.length)) });
          e.facing = door.side === 'west' ? 1 : -1;
          // People get c.npc from a placement entry (npc-setup); an arrival has none, so it is given here.
          e.c.npc = { kind: p.npc, home: area, mood: 1, dissonance: 0, offenders: [], quiet: 0, cool: 0, lastSeen: null, step: 0, stepTicks: 0, stall: 0, bark: null };
          e.c.arrival = { area, door: doorId, stall: 0 };
          e.c.respond = { phase: 'go', x: alert.x, dir: door.side === 'west' ? 1 : -1, stall: 0 };
          setMood(ctx, e, 2, 'called');
          ids.push(id);
        });
        ctx.emit('dispatch-arrived', { area, row: index, people: ids });
        st.sent++;
      }
    }

    // The alert over: arrivals walk out by their door and are gone.
    for (const e of [...world.entities]) {
      const a = e.c.arrival;
      if (!a || e.c.respond || isOut(e)) continue;
      if (alertLevel(world, a.area) > 0) continue;
      const room = content.rooms[e.room];
      const door = e.room === a.area ? room?.doors.find((d) => d.id === a.door) : undefined;
      // INTENT (there is always a way out, for them too): one who cannot reach his door (or is not in his area) leaves where he stands.
      if (!room || !door) {
        removeEntity(world, e.id);
        continue;
      }
      const dx = doorEdge(room, door) - centre(content, e).x;
      const there = door.side === 'west' ? dx >= -ARRIVED : dx <= ARRIVED;
      a.stall = Math.abs(e.vx) < 1 ? (a.stall ?? 0) + 1 : 0;
      const stall = a.stall;
      if (there || stall >= STALLED) {
        removeEntity(world, e.id);
        continue;
      }
      drive(e, { x: dx > 0 ? 1 : -1, y: 0, held: [] });
    }
  },
};
export default system;
