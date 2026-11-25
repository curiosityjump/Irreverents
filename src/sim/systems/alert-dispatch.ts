import type { Dispatch } from '../../content/kinds/dispatch.ts';
import type { Door, Room } from '../../content/kinds/rooms.ts';
import type { Content } from '../../content/types.ts';
import { alertLevel, alertOf, maxAlert } from '../npc/alert.ts';
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
    dispatch?: {
      queue: number[];
      sent: number;
      /** Ticks, at the alert's most, that a responder of the area has seen a hero since the last row (the table's `keepComing`). Read with a default: a kept game may lack it. */
      seen?: number;
    };
  }
  interface EventMap {
    /** A row of a dispatch table walked in: `row` is its index in the table (level - 1), `people` the new entity ids. */
    'dispatch-arrived': { area: string; row: number; people: string[] };
    /**
     * A row was queued (the escalating guard response, additive): `why` is `call` (the alert went up, or a call
     * completed at the top) or `timer` (the table's keepComing, at the top, while the watch sees a hero). It walks
     * in later, as `dispatch-arrived`, once it fits under the cap.
     */
    'dispatch-queued': { area: string; row: number; why: 'call' | 'timer' };
    /** One of an earlier row was stood down to make room for row `row`'s betters ("the stronger relieve the weaker"). */
    'dispatch-relieved': { area: string; entity: string; row: number };
  }
}

/** DRAFT: tiles from the nearest hero inside which nobody is relieved (a fight a player is in is not emptied under him). */
const RELIEVE_NEAR = 4;
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

/**
 * DRAFT (the owner, 2026-11-24: "come in from the sides"): the entry tile the
 * `i`th of a row walks in at, for a table with `entries`. The outposts' rule
 * (outpost-wave.ts `entryFor`, docs/mechanisms/outposts.md, "From the
 * sides"), for the town: split between the left and the right of the place
 * reported (`seenX`, pixels; D-065: the report, never a hero), on each side
 * the nearest entry at least `entryAway` tiles off, else the farthest there;
 * people alternate sides, each row starting on the other side (`n`, the rows
 * sent so far). Entries on one side only: all from there.
 * DRAFT: a copy of the outposts' rule rather than a shared helper, because
 * outpost-wave.ts is another slice's; one shared helper is a fine later tidy.
 */
function entryFor(entries: [number, number][], away: number, tile: number, seenX: number, n: number, i: number): [number, number] {
  const col = seenX / tile;
  const pick = (side: [number, number][]): [number, number] | undefined => {
    if (side.length === 0) return undefined;
    const near = [...side].sort((a, b) => Math.abs(a[0] + 0.5 - col) - Math.abs(b[0] + 0.5 - col));
    return near.find((t) => Math.abs(t[0] + 0.5 - col) >= away) ?? near[near.length - 1];
  };
  const left = pick(entries.filter((t) => t[0] + 0.5 < col));
  const right = pick(entries.filter((t) => t[0] + 0.5 >= col));
  if (!left) return right!;
  if (!right) return left;
  return (i + n) % 2 === 0 ? right : left;
}

/** Of a table's doors, the one nearest across to a tile: the door someone who walked in at an entry leaves by. */
function nearestDoor(room: Room, doors: string[], col: number): Door {
  const list = doors.map((id) => room.doors.find((d) => d.id === id)!);
  return list.reduce((best, d) => (Math.abs(d.tx + d.w / 2 - col) < Math.abs(best.tx + best.w / 2 - col) ? d : best));
}

/** Where, across, someone leaving by a walk door stops and is gone: just short of it, so the door never carries them. */
function doorEdge(room: Room, door: Door): number {
  return door.side === 'west' ? (door.tx + door.w) * room.tile + ARRIVED + 1 : door.tx * room.tile - ARRIVED - 1;
}

/** The middle of every player's character in a room. */
function heroesIn(world: World, content: Content, room: string): { x: number; y: number }[] {
  return world.entities.filter((e) => e.room === room && e.player !== null).map((e) => centre(content, e));
}

/**
 * DRAFT (the orchestrator's ruling, 2026-11-25, "the stronger relieve the weaker"; docs/decisions-log.md,
 * "Step 4: five levels"): row `index` is due and the area is `over` people past its cap. Of the area's
 * arrivals from an EARLIER row whose character the table lists in `relieve`, stand down up to `over`,
 * farthest from any hero first: they walk out by their door (the leave path below) and stop counting
 * against the cap, so the stronger row walks in within moments of its banner and the room never holds
 * more than the cap of the watch who are still on call. One in another room is gone at once if no hero
 * is there (nobody sees him go).
 * INTENT (there is always a way out; the brief): never the placed guard (he is no arrival), nobody out
 * cold, held, carrying, flying, in a hit's beat or mid-swing, and nobody within RELIEVE_NEAR tiles of a
 * hero: a fight a player is in is never emptied under him.
 */
function relieveFor(ctx: Parameters<System['run']>[0], table: Dispatch, index: number, over: number): void {
  const { world, content } = ctx;
  const tile = content.rooms[table.id]!.tile;
  const busy = (e: Entity): boolean => {
    const c = e.c as { held?: unknown; carrying?: unknown; flying?: unknown; beat?: unknown; attack?: { phase?: string } };
    // A person at the reins of a machine (machine-seat's c.seat.driver) drives the row's new toy: never stood down.
    const driving = world.entities.some((m) => m.c.seat?.driver === e.id);
    return driving || isOut(e) || c.held !== undefined || c.carrying !== undefined || c.flying !== undefined || c.beat !== undefined || (c.attack?.phase !== undefined && c.attack.phase !== 'ready');
  };
  const far = (e: Entity): number => {
    const me = centre(content, e);
    const hs = heroesIn(world, content, e.room);
    return hs.length === 0 ? Infinity : Math.min(...hs.map((h) => Math.abs(h.x - me.x) / tile));
  };
  // Those already stood down and still walking out are making room already: only the rest of `over` is new.
  const going = world.entities.filter((e) => e.c.arrival?.area === table.id && e.c.arrival.relieved).length;
  const may = world.entities
    .filter((e) => {
      const a = e.c.arrival;
      // In another room, only where no hero is (he is gone at once, unseen); in the area, not near a hero.
      const near = e.room === table.id ? far(e) < RELIEVE_NEAR : heroesIn(world, content, e.room).length > 0;
      return a && a.area === table.id && !a.relieved && a.row !== undefined && a.row < index && table.relieve.includes(e.kind) && !busy(e) && !near;
    })
    .sort((p, q) => far(q) - far(p) || (p.id < q.id ? -1 : 1));
  for (const e of may.slice(0, Math.max(0, over - going))) {
    e.c.arrival!.relieved = true;
    // He leaves by the table's door on the far side from the nearest hero, so he never walks out through the fight.
    const room = content.rooms[e.room];
    const hs = heroesIn(world, content, e.room);
    if (room && e.room === table.id && hs.length > 0) {
      const me = centre(content, e).x;
      const h = hs.reduce((b, p) => (Math.abs(p.x - me) < Math.abs(b.x - me) ? p : b));
      const doors = table.doors.map((id) => room.doors.find((d) => d.id === id)!).filter((d) => (d.side === 'west' ? -1 : 1) === (me >= h.x ? 1 : -1));
      if (doors[0]) e.c.arrival!.door = doors[0].id;
    }
    e.c.arrival!.stall = 0;
    delete e.c.respond;
    delete e.c.whistle;
    setMood(ctx, e, 1, 'stood-down');
    ctx.emit('dispatch-relieved', { area: table.id, entity: e.id, row: e.c.arrival!.row! });
  }
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
        ctx.emit('dispatch-queued', { area: ev.area, row: st.queue[st.queue.length - 1]!, why: 'call' });
      } else if (alertLevel(world, ev.area) >= maxAlert(content, ev.area)) {
        // INTENT (doc 24: "never impose an arbitrary maximum wave count"): at the top, a further call brings the last row again, under the cap.
        // DRAFT: one such row waits at a time; calls finished while it waits add nothing (a full street does not bank a flood for later).
        if (st.queue.length === 0) {
          st.queue.push(table.rows.length - 1);
          ctx.emit('dispatch-queued', { area: ev.area, row: table.rows.length - 1, why: 'call' });
        }
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
      // DRAFT (the escalating guard response): cooled below a waiting row's level, it is dropped (the level it answered is gone).
      st.queue = st.queue.filter((k) => k < alertLevel(world, area));
      // DRAFT (the escalating guard response, "all-out"; the table's keepComing): at the alert's most, while any
      // responder of the area sees a hero (alert-respond's `sight`, this tick), the last row comes again on a timer.
      // INTENT (D-063): this never raises the alert; the level got to its most by completed calls. Out of every
      // responder's sight, the clock restarts: getting away stops it (D-061), and cooling is alert-cool's as ever.
      if (table.keepComing > 0 && alertLevel(world, area) >= maxAlert(content, area)) {
        const seen = world.entities.some((e) => e.c.respond?.sight && !isOut(e) && (e.c.arrival?.area ?? e.c.npc?.home) === area);
        st.seen = seen ? (st.seen ?? 0) + 1 : 0;
        if (st.seen >= Math.round(table.keepComing * 60)) {
          st.seen = 0;
          if (st.queue.length === 0) {
            st.queue.push(table.rows.length - 1);
            ctx.emit('dispatch-queued', { area, row: table.rows.length - 1, why: 'timer' });
          }
        }
      } else st.seen = 0;
      while (st.queue.length > 0) {
        const index = st.queue[0]!;
        const row = table.rows[index] ?? [];
        // DRAFT: arrivals of this area who followed a hero out still count, or they walk back in over the cap.
        // INTENT (the cap is for a phone's legibility and frame time): everyone in the room counts, one stood down and
        // walking out too, so the street never holds more than the cap; he is gone once off a phone's screen.
        const away = world.entities.filter((e) => e.c.arrival?.area === area && e.room !== area).length;
        const over = peopleIn(world, content, area).length + away + row.length - table.cap;
        if (capOn && over > 0) {
          // The escalating guard response: a stronger row due makes room by standing down the weaker (DRAFT, relieveFor).
          if (table.relieve.length > 0) relieveFor(ctx, table, index, over);
          break;
        }
        st.queue.shift();
        if (row.length === 0) continue;
        const ids: string[] = [];
        row.forEach((p, i) => {
          // Deterministic ids (no randomness, no clock): every machine makes the same ones.
          const id = `${area}:help${st.sent}:${i}`;
          if (findEntity(world, id)) return;
          // From the sides (table.entries) or, with none, beside the doors in turn, as before.
          // An entry's door, the one he leaves by when it is over, is the nearest of the table's.
          let tile: [number, number];
          let door: Door;
          if (table.entries.length > 0) {
            const at = entryFor(table.entries, table.entryAway, room.tile, alert.x, st.sent, i);
            // A second of the row at the same entry stands a tile nearer the place reported, so no two start on one tile.
            const before = row.slice(0, i).filter((_, k) => entryFor(table.entries, table.entryAway, room.tile, alert.x, st.sent, k) === at).length;
            const toward = alert.x >= (at[0] + 0.5) * room.tile ? 1 : -1;
            tile = [Math.max(0, Math.min(room.w - 1, at[0] + toward * before)), at[1]];
            door = nearestDoor(room, table.doors, tile[0]);
          } else {
            door = room.doors.find((d) => d.id === table.doors[i % table.doors.length])!;
            tile = besideDoor(room, door, Math.floor(i / table.doors.length));
          }
          const doorId = door.id;
          // DRAFT (the escalating guard response; the camp's `rides`, outpost-wave.ts): one who `rides` walks in at the
          // reins: the machine is put down first, on his tile, and machine-seat (order 120, this tick) seats him;
          // machine-driven drives it at the place reported, then at a hero he sees, at the machine's `speed.driver`
          // (INTENT: below every hero's run, content check). DRAFT: at most one of the area's sent machines stands at a
          // time (one taken or wrecked is the player's toy); with one standing, he walks in on foot. Machines are not
          // people, so they do not count toward the cap; the trike is left where it ends when the alert is over.
          const ride = p.rides !== undefined ? content.machines?.[p.rides] : undefined;
          const rideId = `${id}:ride`;
          const standing = ride && world.entities.some((o) => o.room === area && o.kind === ride.character && o.id.startsWith(`${area}:help`));
          const m = ride && !standing && !findEntity(world, rideId) ? spawnBody(world, content, { id: rideId, character: ride.character, room: area, tile }) : undefined;
          const e = spawnBody(world, content, { id, character: p.character, room: area, tile });
          const dir: 1 | -1 = table.entries.length > 0 ? (alert.x >= (tile[0] + 0.5) * room.tile ? 1 : -1) : door.side === 'west' ? 1 : -1;
          e.facing = dir;
          if (m) {
            m.facing = dir;
            m.c.chase = { x: alert.x };
          }
          // People get c.npc from a placement entry (npc-setup); an arrival has none, so it is given here.
          e.c.npc = { kind: p.npc, home: area, mood: 1, dissonance: 0, offenders: [], quiet: 0, cool: 0, lastSeen: null, step: 0, stepTicks: 0, stall: 0, bark: null };
          e.c.arrival = { area, door: doorId, stall: 0, row: index };
          e.c.respond = { phase: 'go', x: alert.x, dir, stall: 0 };
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
      if (alertLevel(world, a.area) > 0 && !a.relieved) continue;
      const room = content.rooms[e.room];
      const door = e.room === a.area ? room?.doors.find((d) => d.id === a.door) : undefined;
      // INTENT (there is always a way out, for them too): one who cannot reach his door (or is not in his area) leaves where he stands.
      if (!room || !door) {
        removeEntity(world, e.id);
        continue;
      }
      // DRAFT (relieveFor): one stood down is gone once off a phone's screen: more than entryAway tiles from every hero.
      const table = tables[a.area];
      if (a.relieved && table) {
        const me = centre(content, e);
        const hs = heroesIn(world, content, e.room);
        if (hs.every((h) => Math.abs(h.x - me.x) / room.tile > table.entryAway)) {
          removeEntity(world, e.id);
          continue;
        }
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
