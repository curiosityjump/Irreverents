import { TILE } from '../../content/kinds/rooms.ts';
import type { Room } from '../../content/kinds/rooms.ts';
import { DT } from '../types.ts';
import type { System } from '../types.ts';

declare module '../types.ts' {
  interface EventMap {
    /** An entity touched down. tx,ty is the tile under the middle of its feet. */
    landed: { entity: string; player: string | null; tx: number; ty: number };
  }
}

const EPS = 1e-6;

/**
 * DRAFT: everything outside a room's grid is solid, so nothing can leave a
 * room or fall forever. Step 3 (connected rooms) will want exits.
 */
export function cellAt(room: Room, tx: number, ty: number): number {
  if (tx < 0 || ty < 0 || tx >= room.w || ty >= room.h) return TILE.solid;
  return room.cells[ty * room.w + tx]!;
}

/** Gravity, movement and collision against the room's tiles, for every entity. */
const system: System = {
  id: 'physics',
  order: 500,
  tuning: {
    gravity: { min: 0, max: 10000, what: 'downward pull, pixels per second per second' },
    // INTENT: falling must stay under one 16 px tile per tick (960 px/s at
    // 60 ticks), or a fast fall could pass through a platform.
    maxFallSpeed: { min: 1, max: 900, what: 'fastest fall, pixels per second' },
  },
  run(ctx) {
    const { gravity, maxFallSpeed } = ctx.content.tuning.world;
    for (const e of ctx.world.entities) {
      const room = ctx.content.rooms[e.room];
      const kind = ctx.content.characters[e.kind];
      if (!room || !kind) continue;
      const T = room.tile;
      const { w, h } = kind.box;

      e.vy = Math.min(e.vy + gravity! * DT, maxFallSpeed!);

      // Sideways first: only solid tiles block.
      e.x += e.vx * DT;
      if (e.vx !== 0) {
        const top = Math.floor(e.y / T);
        const bottom = Math.floor((e.y + h - EPS) / T);
        const tx = e.vx > 0 ? Math.floor((e.x + w - EPS) / T) : Math.floor(e.x / T);
        for (let ty = top; ty <= bottom; ty++) {
          if (cellAt(room, tx, ty) !== TILE.solid) continue;
          e.x = e.vx > 0 ? tx * T - w : (tx + 1) * T;
          e.vx = 0;
          break;
        }
      }

      // Then up or down.
      const wasOnGround = e.onGround;
      const feetBefore = e.y + h;
      e.y += e.vy * DT;
      e.onGround = false;
      const left = Math.floor(e.x / T);
      const right = Math.floor((e.x + w - EPS) / T);
      if (e.vy > 0) {
        const ty = Math.floor((e.y + h - EPS) / T);
        for (let tx = left; tx <= right; tx++) {
          const cell = cellAt(room, tx, ty);
          // A one-way platform only catches feet that were above it.
          const lands = cell === TILE.solid || (cell === TILE.oneway && feetBefore <= ty * T + EPS);
          if (!lands) continue;
          e.y = ty * T - h;
          e.vy = 0;
          e.onGround = true;
          break;
        }
      } else if (e.vy < 0) {
        const ty = Math.floor(e.y / T);
        for (let tx = left; tx <= right; tx++) {
          if (cellAt(room, tx, ty) !== TILE.solid) continue;
          e.y = (ty + 1) * T;
          e.vy = 0;
          break;
        }
      }

      if (e.onGround && !wasOnGround) {
        ctx.emit('landed', {
          entity: e.id,
          player: e.player,
          tx: Math.floor((e.x + w / 2) / T),
          ty: Math.round((e.y + h) / T),
        });
      }
    }
  },
};
export default system;
