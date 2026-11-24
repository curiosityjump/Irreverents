import { takesNoPhysics } from '../body-state.ts';
import { BREAKABLE, breakPart, partsOfKind, setPartSolid } from '../room-parts.ts';
import { partState } from '../room-state.ts';
import { DT } from '../types.ts';
import type { System } from '../types.ts';

const EPS = 1e-6;

/** What a breakable may look like: drawing only (src/client/draw/room-parts.ts). Add, never take away: rooms name them. */
export const BREAKABLE_LOOKS = ['wall', 'window', 'fence', 'stall', 'barricade'];

/**
 * Walls (and windows) that break (docs/mechanisms/rooms-and-doors.md, "The
 * kinds of part"). Solid until a body is about to run into one sideways at
 * or above `params.breakSpeed` (default: world.wallBreakSpeed); then its
 * tiles are open for good, it emits `part-broken` (src/sim/room-parts.ts)
 * and the body carries on through with its speed. `params.look` ("wall" by
 * default, "window", or Step 20's timber pieces standing in the open:
 * "fence", "stall", "barricade") only changes how it is drawn. Another system
 * breaks one with breakPartAt() from src/sim/room-parts.ts.
 *
 * INTENT: impact over numbers (D-020). The wall has no health: one hard
 * enough arrival breaks it, and any body will do, a thrown crate or a
 * thrown friend. Nothing here asks which character a body is.
 *
 * Order 460: physics (500) stops a body dead at a solid tile and zeroes its
 * speed, so this looks at where the body is *about* to be, after
 * impact-before (450) has slowed a flying body for this tick and before
 * physics moves it. The sideways move it predicts is exactly physics' own.
 */
const system: System = {
  id: 'room-breakable',
  order: 460,
  tuning: {
    // DRAFT: 200 px/s. A running hero (96) does not break a wall; a thrown crate or a thrown friend does (docs/decisions-log.md).
    wallBreakSpeed: { min: 1, max: 900, what: 'the slowest a body can run into a breakable wall sideways and break it, pixels per second, unless the wall says its own' },
  },
  parts: {
    [BREAKABLE]: {
      what: 'a wall or window, solid until something hits it hard',
      blocks: true,
      check(part, _room, fail) {
        const look = part.params.look;
        // DRAFT (Step 20): fence, stall and barricade are the camp's run (content/rooms/outpost.json); drawing only.
        if (look !== undefined && !BREAKABLE_LOOKS.includes(look as string)) fail(`params.look: must be one of ${BREAKABLE_LOOKS.map((l) => `"${l}"`).join(', ')}`);
        const speed = part.params.breakSpeed;
        if (speed !== undefined && (typeof speed !== 'number' || !(speed >= 1) || speed > 900)) fail('params.breakSpeed: must be pixels per second from 1 to 900');
      },
    },
  },
  run(ctx) {
    for (const { room, part } of partsOfKind(ctx.content, BREAKABLE)) {
      const s = partState(ctx.world, room.id, part.id);
      if (!s.ready) {
        s.ready = true;
        s.broken = false;
        setPartSolid(ctx.world, room, part, true);
      }
      if (s.broken) continue;
      const limit = typeof part.params.breakSpeed === 'number' ? part.params.breakSpeed : ctx.content.tuning.world.wallBreakSpeed!;
      const T = room.tile;
      for (const e of ctx.world.entities) {
        if (e.room !== room.id || Math.abs(e.vx) < limit || takesNoPhysics(e)) continue;
        const box = ctx.content.characters[e.kind]?.box;
        if (!box) continue;
        const x = e.x + e.vx * DT;
        const tx = e.vx > 0 ? Math.floor((x + box.w - EPS) / T) : Math.floor(x / T);
        const top = Math.floor(e.y / T);
        const bottom = Math.floor((e.y + box.h - EPS) / T);
        // INTENT (Step 20, the machine check that failed 1 run in 4): a body
        // its own page moves (a player, a driven wagon) is not stepped on the
        // server between reports, and a fast one's reports land 2-3 ticks
        // apart, so it can arrive already inside the wall's tiles, or skip the
        // one tick it was "about to" enter them. Physics never leaves a body
        // inside a solid tile, so a body found overlapping one at speed got
        // there by a report: it arrived at speed, and the wall breaks as if
        // it had been caught a tick earlier. Server-stepped bodies are untouched.
        const c0 = Math.floor(e.x / T);
        const c1 = Math.floor((e.x + box.w - EPS) / T);
        const into = (t: { tx: number; ty: number }): boolean => t.ty >= top && t.ty <= bottom && (t.tx === tx || (t.tx >= c0 && t.tx <= c1));
        if (!part.tiles.some(into)) continue;
        breakPart(ctx, room, part, e, Math.abs(e.vx));
        break;
      }
    }
  },
};
export default system;
