import { inPart, partsOfKind, setPartSolid } from '../room-parts.ts';
import { partState } from '../room-state.ts';
import { TICK_RATE } from '../types.ts';
import type { System } from '../types.ts';

declare module '../types.ts' {
  interface EventMap {
    /** A gate opened: its tiles are passable. */
    'gate-opened': { room: string; part: string };
    /** A gate shut: its tiles are solid again. */
    'gate-closed': { room: string; part: string };
  }
}

/**
 * Gates held open by floor plates (docs/mechanisms/rooms-and-doors.md,
 * "The kinds of part"). Solid while shut. `params.plates` names the plates
 * (part ids in the same room) that hold it: it opens while **all** are
 * down, and stays open `params.stayOpen` seconds after one comes up
 * (default: world.gateStayOpenTime).
 *
 * INTENT: there is always a way out. A gate never shuts on a body standing
 * in it: it waits, however long. Do not "tidy" the wait away.
 *
 * Order 530: after physics (500) and the plates (520), so it acts on where
 * bodies are and what is pressed at the end of this tick.
 */
const system: System = {
  id: 'room-gate',
  order: 530,
  tuning: {
    // DRAFT: 6 seconds, long enough for two friends to step off their plates and walk through together (docs/decisions-log.md).
    gateStayOpenTime: { min: 0, max: 600, what: 'seconds a plate gate stays open after a plate comes up, unless the gate says its own' },
  },
  parts: {
    gate: {
      what: 'a gate, solid while shut, opened by floor plates',
      blocks: true,
      check(part, _room, fail) {
        const plates = part.params.plates;
        if (!Array.isArray(plates) || plates.length === 0 || !plates.every((p) => typeof p === 'string')) fail('params.plates: must list the ids of the plates in this room that hold the gate open');
        const stay = part.params.stayOpen;
        if (stay !== undefined && (typeof stay !== 'number' || !(stay >= 0) || stay > 600)) fail('params.stayOpen: must be seconds from 0 to 600');
      },
    },
  },
  run(ctx) {
    for (const { room, part } of partsOfKind(ctx.content, 'gate')) {
      const s = partState(ctx.world, room.id, part.id);
      if (!s.ready) {
        s.ready = true;
        s.open = false;
        s.left = 0;
        setPartSolid(ctx.world, room, part, true);
      }
      const plates = Array.isArray(part.params.plates) ? (part.params.plates as string[]) : [];
      const pressed = plates.length > 0 && plates.every((id) => room.parts.some((p) => p.id === id && p.kind === 'plate') && partState(ctx.world, room.id, id).down === true);
      if (pressed) {
        const seconds = typeof part.params.stayOpen === 'number' ? part.params.stayOpen : ctx.content.tuning.world.gateStayOpenTime!;
        s.left = Math.round(seconds * TICK_RATE);
        if (!s.open) {
          s.open = true;
          setPartSolid(ctx.world, room, part, false);
          ctx.emit('gate-opened', { room: room.id, part: part.id });
        }
        continue;
      }
      if (!s.open) continue;
      if ((s.left as number) > 0) {
        s.left = (s.left as number) - 1;
        continue;
      }
      // INTENT: it waits for the opening to be clear; see above.
      if (ctx.world.entities.some((e) => inPart(ctx.content, e, room, part))) continue;
      s.open = false;
      setPartSolid(ctx.world, room, part, true);
      ctx.emit('gate-closed', { room: room.id, part: part.id });
    }
  },
};
export default system;
