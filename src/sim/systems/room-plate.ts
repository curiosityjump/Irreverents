import { heldBy } from '../effects.ts';
import { partsOfKind } from '../room-parts.ts';
import { partState } from '../room-state.ts';
import type { System } from '../types.ts';

declare module '../types.ts' {
  interface EventMap {
    /** A floor plate went down: something came to rest on it. */
    'plate-down': { room: string; part: string };
    /** A floor plate came back up: nothing rests on it any more. */
    'plate-up': { room: string; part: string };
  }
}

/**
 * Floor plates (docs/mechanisms/rooms-and-doors.md, "The kinds of part").
 * A plate's tiles are the open tiles a body stands *in*, just above the
 * floor. It is down while any body rests on the ground with its feet in
 * those tiles; what it holds open reads `partState(...).down`.
 *
 * INTENT: any body presses it, played or not: a crate counts exactly like a
 * hero, and nothing here counts players or asks which character a body is
 * (D-006, D-015: solo is never locked out by headcount).
 *
 * Order 520: after physics (500), so it sees where bodies came to rest this
 * tick; before the gates (530), which read it.
 */
const system: System = {
  id: 'room-plate',
  order: 520,
  parts: {
    plate: { what: 'a floor plate: down while any body rests on it' },
  },
  run(ctx) {
    for (const { room, part } of partsOfKind(ctx.content, 'plate')) {
      const T = room.tile;
      let down = false;
      for (const e of ctx.world.entities) {
        if (e.room !== room.id || !e.onGround || heldBy(e) !== null) continue;
        const box = ctx.content.characters[e.kind]?.box;
        if (!box) continue;
        const feetRow = Math.floor((e.y + box.h - 1) / T);
        if (part.tiles.some((t) => t.ty === feetRow && e.x < (t.tx + 1) * T && e.x + box.w > t.tx * T)) {
          down = true;
          break;
        }
      }
      const s = partState(ctx.world, room.id, part.id);
      if (down === (s.down ?? false)) continue;
      s.down = down;
      ctx.emit(down ? 'plate-down' : 'plate-up', { room: room.id, part: part.id });
    }
  },
};
export default system;
