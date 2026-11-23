import { canAct, inputOf } from '../body-state.ts';
import { partsOfKind } from '../room-parts.ts';
import type { System } from '../types.ts';

declare module '../types.ts' {
  interface Components {
    /**
     * Present exactly while this body is hiding: standing still, doing
     * nothing, with the middle of its box inside a `hide` part's tiles.
     * `in` is that part's id (in the body's room). Step 3 only sets and
     * clears it; what being hidden does to being seen is Step 4's.
     */
    roomHide?: { in: string };
  }
}

/**
 * Places to hide (a curtain, a barrel: graybox). A body is hiding while it
 * stands still on the ground inside the part's tiles, holding no action;
 * the tick it moves out, moves at all or acts, it is not.
 *
 * Order 550: after physics (500) and doors (600 runs later, so a body that
 * changes room is cleared the next tick; one tick late on purpose is not
 * worth another system).
 */
const system: System = {
  id: 'room-hide',
  order: 550,
  parts: {
    hide: { what: 'a place to hide: a body standing still inside it is marked hiding' },
  },
  run(ctx) {
    const places = partsOfKind(ctx.content, 'hide');
    for (const e of ctx.world.entities) {
      let found: string | undefined;
      const box = ctx.content.characters[e.kind]?.box;
      if (box && e.onGround && e.vx === 0 && e.vy === 0 && canAct(e) && inputOf(ctx, e).held.length === 0) {
        for (const { room, part } of places) {
          if (room.id !== e.room) continue;
          const tx = Math.floor((e.x + box.w / 2) / room.tile);
          const ty = Math.floor((e.y + box.h / 2) / room.tile);
          if (!part.tiles.some((t) => t.tx === tx && t.ty === ty)) continue;
          found = part.id;
          break;
        }
      }
      if (found === undefined) delete e.c.roomHide;
      else if (e.c.roomHide?.in !== found) e.c.roomHide = { in: found };
    }
  },
};
export default system;
