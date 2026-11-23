import type { System } from '../types.ts';

declare module '../types.ts' {
  interface World {
    /**
     * Step 14 slice B (D-078, D-082; docs/mechanisms/levels.md, "Pieces"): by
     * level id, the piece ids found (content/completion/), oldest first.
     * The world's, so a piece one friend finds is found for both; kept with a
     * kept game. Only ever grows (a page takes top-level fields by key).
     * Read it with a default: old kept games have none.
     */
    found?: Record<string, string[]>;
    /** Step 14 / heist slice: prize thing ids carried out of their place (written by the heist slice; read here with a default). */
    banked?: string[];
  }
  interface EventMap {
    /** Step 14 slice B: a piece of a level's set was found. `by` the played body that touched it, or null when it came from a thing taken or a prize. */
    'piece-found': { level: string; piece: string; by: string | null; player: string | null };
    /** Step 14 slice B: the last piece of a level's set was found. */
    'set-complete': { level: string };
  }
}

/**
 * Step 14 slice B: finds pieces. A placed piece is found when a body someone
 * plays has its box over the piece's tile (INTENT: a thrown crate, a guard,
 * finds nothing: "a hero someone plays"); a `from: { thing }` piece when that
 * thing has been taken (`c.thing.takenBy`, read as state, never the event,
 * so a game kept before the piece existed is not locked out); a
 * `from: { prize }` piece when `world.banked` lists the prize.
 * DRAFT: it runs in a page's own world too, where only the page's own body
 * is and no thing: it only ever adds what the server adds for the same body
 * a moment later, and the snapshot replaces the page's copy by key.
 * Runs after the doors (600) and level-explore (610).
 */
const system: System = {
  id: 'completion-find',
  order: 620,
  run(ctx) {
    const { world, content } = ctx;
    const sets = content.completion;
    if (!sets) return;
    const banked = world.banked ?? [];
    for (const set of Object.values(sets)) {
      const have = world.found?.[set.id] ?? [];
      if (have.length >= set.pieces.length) continue;
      for (const p of set.pieces) {
        if (have.includes(p.id)) continue;
        let by: { id: string; player: string | null } | null | undefined;
        if (p.from) {
          if ('thing' in p.from) {
            const thingId = p.from.thing;
            const t = world.entities.find((e) => e.id === thingId);
            if (t?.c.thing && t.c.thing.takenBy !== null) by = null;
          } else if (banked.includes(p.from.prize)) by = null;
        } else if (p.room && p.tile) {
          const room = content.rooms[p.room];
          if (!room) continue;
          const T = room.tile;
          const x0 = p.tile[0] * T;
          const y0 = p.tile[1] * T;
          for (const e of world.entities) {
            if (e.player === null || e.room !== p.room) continue;
            const box = content.characters[e.kind]?.box;
            if (!box) continue;
            if (e.x < x0 + T && e.x + box.w > x0 && e.y < y0 + T && e.y + box.h > y0) {
              by = { id: e.id, player: e.player };
              break;
            }
          }
        }
        if (by === undefined) continue;
        const found = (world.found ??= {});
        const list = (found[set.id] ??= []);
        list.push(p.id);
        ctx.emit('piece-found', { level: set.id, piece: p.id, by: by?.id ?? null, player: by?.player ?? null });
        if (list.length === set.pieces.length) ctx.emit('set-complete', { level: set.id });
      }
    }
  },
};
export default system;
