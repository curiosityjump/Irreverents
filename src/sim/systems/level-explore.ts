import { levelOfRoom } from '../../content/kinds/levels.ts';
import type { System } from '../types.ts';

declare module '../types.ts' {
  interface World {
    /**
     * Step 14 slice A (D-078, D-079; docs/mechanisms/levels.md): by level id
     * (content/levels/), the places of it a hero someone plays has been
     * inside, oldest first: `<room>` and `<room>/<area>`. A level with an
     * entry here is discovered. Absent until the first. Only ever grows:
     * nothing is deleted (a page takes top-level fields by key, so a deleted
     * one would linger there). Kept with a kept game like every top-level
     * field (docs/mechanisms/saves.md).
     */
    levels?: Record<string, { seen: string[] }>;
  }
}

/**
 * Step 14 slice A: marks where heroes someone plays have been. Each tick, for
 * each played body, its room and any area of that room its middle is in,
 * if the room is in a level (content/levels/).
 *
 * INTENT: it reads where the body is each tick, never the `changed-room`
 * event: on the server a player's body changes room because the page says so
 * (the page owns `room`), and no door event fires there.
 * DRAFT: it runs in a page's own world too; it only ever adds what the
 * server's world adds a moment later for the same body, and the snapshot
 * replaces the page's copy by key, so they agree (a page shows its own
 * entrance a snapshot sooner).
 * INTENT: a body nobody plays (a thrown crate, a guard) explores nothing:
 * "a hero someone plays has been inside".
 * Runs after the doors (600), so a body that went through this tick counts
 * in the room it arrived in.
 */
const system: System = {
  id: 'level-explore',
  order: 610,
  run(ctx) {
    const { world, content } = ctx;
    if (!content.levels) return;
    for (const e of world.entities) {
      if (e.player === null) continue;
      const level = levelOfRoom(content, e.room);
      if (level === undefined) continue;
      const room = content.rooms[e.room];
      if (!room) continue;
      const box = content.characters[e.kind]?.box ?? { w: 0, h: 0 };
      const tx = Math.floor((e.x + box.w / 2) / room.tile);
      const ty = Math.floor((e.y + box.h / 2) / room.tile);
      const levels = (world.levels ??= {});
      const rec = (levels[level] ??= { seen: [] });
      if (!rec.seen.includes(room.id)) rec.seen.push(room.id);
      for (const a of room.areas) {
        if (tx < a.tx || ty < a.ty || tx >= a.tx + a.w || ty >= a.ty + a.h) continue;
        const key = `${room.id}/${a.id}`;
        if (!rec.seen.includes(key)) rec.seen.push(key);
      }
    }
  },
};
export default system;
