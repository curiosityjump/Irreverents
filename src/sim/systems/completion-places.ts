import { levelOfRoom } from '../../content/kinds/levels.ts';
import type { System } from '../types.ts';

declare module '../types.ts' {
  interface EventMap {
    /**
     * Step 14 slice B: a hero someone plays is, for the first time in this
     * world, inside a hidden room or a hidden area of one (`place` is
     * `<room>` or `<room>/<area>`, as `world.levels` writes it).
     */
    'place-found': { level: string; place: string; by: string; player: string };
  }
}

/**
 * Step 14 slice B (D-079; the owner, after playing: "no hidden places to
 * explore"; docs/mechanisms/levels.md, "Pieces"): a hidden place found is a
 * moment of its own. It runs just before `level-explore` (610) and reads the
 * same record: a hidden place a played body is in that `world.levels` does
 * not list yet is being found this tick. So it keeps no state of its own
 * and a kept game never flashes a place twice.
 * INTENT: nothing is drawn in the room for it (the page flashes the level's
 * pie at the top): a hidden place stays drawn as what it is.
 * INTENT: a body nobody plays (a thrown crate, a guard) finds nothing, as in
 * level-explore.
 * DRAFT: in a page's own world it emits too; the page plays the chime from
 * the server's copy only (src/client/audio/moments.ts) and draws from the
 * record, so it is heard and shown once.
 * Runs after the doors (600), so a body that went through this tick counts
 * in the room it arrived in.
 */
const system: System = {
  id: 'completion-places',
  order: 605,
  run(ctx) {
    const { world, content } = ctx;
    if (!content.levels) return;
    const told = new Set<string>();
    for (const e of world.entities) {
      if (e.player === null) continue;
      const level = levelOfRoom(content, e.room);
      if (level === undefined) continue;
      const room = content.rooms[e.room];
      if (!room) continue;
      const seen = world.levels?.[level]?.seen ?? [];
      const box = content.characters[e.kind]?.box ?? { w: 0, h: 0 };
      const tx = Math.floor((e.x + box.w / 2) / room.tile);
      const ty = Math.floor((e.y + box.h / 2) / room.tile);
      // The same middle-of-the-body test as level-explore, so the two agree on "inside".
      const places: string[] = room.hidden ? [room.id] : [];
      for (const a of room.areas) {
        if (!a.hidden || tx < a.tx || ty < a.ty || tx >= a.tx + a.w || ty >= a.ty + a.h) continue;
        places.push(`${room.id}/${a.id}`);
      }
      for (const place of places) {
        const key = `${level}:${place}`;
        if (seen.includes(place) || told.has(key)) continue;
        told.add(key);
        ctx.emit('place-found', { level, place, by: e.id, player: e.player });
      }
    }
  },
};
export default system;
