import { heldBy } from '../effects.ts';
import { bodyNumbers } from '../body-state.ts';
import { partsOfKind } from '../room-parts.ts';
import { partState } from '../room-state.ts';
import type { Entity, System } from '../types.ts';

declare module '../types.ts' {
  interface EventMap {
    /** A floor plate went down: something came to rest on it (enough of it, for a plate that needs weight). */
    'plate-down': { room: string; part: string };
    /** A floor plate came back up: nothing rests on it any more (or too little). */
    'plate-up': { room: string; part: string };
  }
}

/**
 * Floor plates (docs/mechanisms/rooms-and-doors.md, "The kinds of part").
 * A plate's tiles are the open tiles a body stands *in*, just above the
 * floor. It is down while any body rests on the ground with its feet in
 * those tiles; what it holds open reads `partState(...).down`.
 *
 * A plate may say `params.needs`, a weight (Step 3, the stone plate): then
 * it is down only while the summed weight of the bodies resting on it is at
 * least that, and `partState(...).load` says how much rests on it now, so a
 * page can draw how far it has sunk. A carried body's weight is added to
 * its carrier's (a hero holding the king over the plate weighs both).
 * Weight is read with `bodyNumbers`, so a held power's numbers count.
 * A plate with no `needs` is exactly the plate it always was, and keeps
 * no `load`.
 *
 * INTENT: any body presses it, played or not: a crate counts exactly like a
 * hero, and nothing here counts players or asks which character a body is
 * (D-006, D-015: solo is never locked out by headcount). A plate that needs
 * weight reads only weight, never who or how many.
 *
 * Order 520: after physics (500), so it sees where bodies came to rest this
 * tick; before the gates (530), which read it.
 */
const system: System = {
  id: 'room-plate',
  order: 520,
  parts: {
    plate: {
      what: 'a floor plate: down while any body rests on it, or, with params.needs, while the bodies on it weigh at least that',
      check(part, _room, fail) {
        const needs = part.params.needs;
        if (needs !== undefined && (typeof needs !== 'number' || !(needs > 0) || needs > 10000)) fail('params.needs: must be a weight above 0 and at most 10000');
      },
    },
  },
  run(ctx) {
    let byCarrier: Map<string, Entity[]> | null = null;
    for (const { room, part } of partsOfKind(ctx.content, 'plate')) {
      const T = room.tile;
      const needs = typeof part.params.needs === 'number' ? part.params.needs : null;
      let down = false;
      let load = 0;
      for (const e of ctx.world.entities) {
        if (e.room !== room.id || !e.onGround || heldBy(e) !== null) continue;
        const box = ctx.content.characters[e.kind]?.box;
        if (!box) continue;
        const feetRow = Math.floor((e.y + box.h - 1) / T);
        if (!part.tiles.some((t) => t.ty === feetRow && e.x < (t.tx + 1) * T && e.x + box.w > t.tx * T)) continue;
        if (needs === null) {
          down = true;
          break;
        }
        byCarrier ??= carriedBy(ctx.world.entities);
        load += weightWithLoad(ctx.content, e, byCarrier, 0);
      }
      const s = partState(ctx.world, room.id, part.id);
      if (needs !== null) {
        load = Math.round(load);
        if (s.load !== load) s.load = load;
        down = load >= needs;
      }
      if (down === (s.down ?? false)) continue;
      s.down = down;
      ctx.emit(down ? 'plate-down' : 'plate-up', { room: room.id, part: part.id });
    }
  },
};
export default system;

/** Who is held by whom this tick: carrier id to the bodies it holds. */
function carriedBy(entities: Entity[]): Map<string, Entity[]> {
  const m = new Map<string, Entity[]>();
  for (const e of entities) {
    const by = heldBy(e);
    if (by === null) continue;
    const list = m.get(by);
    if (list) list.push(e);
    else m.set(by, [e]);
  }
  return m;
}

/** A body's weight plus everything it holds (and what that holds), a few levels deep at most. */
function weightWithLoad(content: Parameters<typeof bodyNumbers>[0], e: Entity, byCarrier: Map<string, Entity[]>, depth: number): number {
  let w = bodyNumbers(content, e).weight;
  if (depth < 4) for (const h of byCarrier.get(e.id) ?? []) if (h.room === e.room) w += weightWithLoad(content, h, byCarrier, depth + 1);
  return w;
}
