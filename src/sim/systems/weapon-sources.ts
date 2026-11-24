import { ticksOf } from '../body-state.ts';
import type { System } from '../types.ts';
import { makeLoose, weaponWorld } from '../weapons.ts';

/**
 * Where weapons come from (Step 23, D-080: "players can deliberately return
 * to KNOWN SOURCES and obtain another copy after losing the one they carried
 * away"; docs/mechanisms/weapons.md). Each source in a weapon's file has
 * that weapon lying on its tile, unless the one from it is still out: lying
 * loose anywhere, or in a hand in the source's room. Once it is not (used
 * up, carried out of the room, or gone with a player who left), another
 * stands there the source's `restock` seconds later.
 * Reads with defaults: a world (a kept game saved before Step 23) with no
 * `weaponSources` stands every source's weapon at once.
 * INTENT: the server's world and a scenario's only (weaponWorld, src/sim/weapons.ts): a page's
 * own world holds only its character.
 * DRAFT: a weapon carried back into its source's room counts as out again.
 */
const system: System = {
  id: 'weapon-sources',
  order: 546,
  run(ctx) {
    const { world, content } = ctx;
    if (!weaponWorld(world)) return;
    const weapons = Object.values(content.weapons ?? {});
    if (weapons.length === 0) return;
    // What is out, by source id: loose anywhere, or held in its source's room.
    const out = new Set<string>();
    const room = new Map<string, string>();
    for (const w of weapons) for (const s of w.sources) room.set(s.id, s.room);
    for (const e of world.entities) {
      const loose = e.c.loose?.src;
      if (loose !== undefined) out.add(loose);
      const held = e.c.weapon?.src;
      if (held !== undefined && room.get(held) === e.room) out.add(held);
    }
    for (const w of [...weapons].sort((a, b) => (a.id < b.id ? -1 : 1))) {
      for (const s of w.sources) {
        const all = (world.weaponSources ??= {});
        const rec = all[s.id];
        if (out.has(s.id)) {
          if (rec?.gone !== undefined) delete rec.gone;
          continue;
        }
        if (rec !== undefined) {
          if (rec.gone === undefined) {
            rec.gone = world.tick;
            continue;
          }
          if (world.tick - rec.gone < ticksOf(s.restock)) continue;
        }
        const r = content.rooms[s.room];
        if (!r) continue;
        const T = r.tile;
        const loose = makeLoose(ctx, w, s.room, (s.tile[0] + 0.5) * T, (s.tile[1] + 1) * T, { src: s.id });
        all[s.id] = {};
        ctx.emit('weapon-stood', { src: s.id, weapon: w.id, loose: loose.id, room: s.room });
      }
    }
  },
};
export default system;
