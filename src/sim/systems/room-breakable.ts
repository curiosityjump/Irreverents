import { takesNoPhysics } from '../body-state.ts';
import { BREAKABLE, breakPart, partsOfKind, setPartSolid } from '../room-parts.ts';
import { partState } from '../room-state.ts';
import { DT } from '../types.ts';
import type { System } from '../types.ts';

const EPS = 1e-6;

/**
 * Walls (and windows) that break (docs/mechanisms/rooms-and-doors.md, "The
 * kinds of part"). Solid until a body is about to run into one sideways at
 * or above `params.breakSpeed` (default: world.wallBreakSpeed); then its
 * tiles are open for good, it emits `part-broken` (src/sim/room-parts.ts)
 * and the body carries on through with its speed. `params.look` ("wall" by
 * default, or "window") only changes how it is drawn. Another system
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
        if (look !== undefined && look !== 'wall' && look !== 'window') fail('params.look: must be "wall" or "window"');
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
        if (!part.tiles.some((t) => t.tx === tx && t.ty >= top && t.ty <= bottom)) continue;
        breakPart(ctx, room, part, e, Math.abs(e.vx));
        break;
      }
    }
  },
};
export default system;
