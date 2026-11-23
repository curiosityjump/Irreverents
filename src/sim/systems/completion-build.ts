import { setComplete } from '../completion.ts';
import type { System } from '../types.ts';
import { findEntity, spawnBody } from '../world.ts';

declare module '../types.ts' {
  interface EventMap {
    /** Step 14 slice B push 3: a level's finished set appeared as a body (`entity`), at room pixels x, y. */
    'set-built': { level: string; entity: string; room: string; x: number; y: number };
  }
}

/**
 * Step 14 slice B push 3 (D-078: "hidden components that assemble into a
 * final object whose identity is UNKNOWN to the player while collecting"):
 * when a level's set is complete and its file says what it `builds`, that
 * body stands at the room and tile the data names, id `built:<level>`. It
 * is an ordinary body from then on (grabbed, thrown, set on a plate: what it
 * does is what bodies already do). If it is ever missing (a kept game from
 * before it existed), it is put back where the data says.
 * INTENT: only in a world that holds placed bodies (the server's, a
 * scenario with placements): a page's own world holds only its own
 * character, and a body made there would be a second, local copy.
 * INTENT: the id names the level, never the thing.
 * Runs after completion-find (620), so the last piece and the thing land on
 * the same tick.
 */
const system: System = {
  id: 'completion-build',
  order: 625,
  run(ctx) {
    const { world, content } = ctx;
    const sets = content.completion;
    if (!sets) return;
    let placed: boolean | null = null;
    for (const set of Object.values(sets)) {
      const b = set.builds;
      if (!b || !setComplete(world, content, set.id)) continue;
      const id = `built:${set.id}`;
      if (findEntity(world, id)) continue;
      placed ??= world.entities.some((e) => e.player === null && !e.id.startsWith('built:') && content.characters[e.kind] !== undefined);
      if (!placed) return;
      const e = spawnBody(world, content, { id, character: b.character, room: b.room, tile: b.tile });
      ctx.emit('set-built', { level: set.id, entity: id, room: b.room, x: e.x, y: e.y });
    }
  },
};
export default system;
