import type { UseEntry } from '../use.ts';
import { machineOf, machineState } from '../machines.ts';
import { centre, isOut } from '../npc/state.ts';

/** DRAFT: how near (pixels) a hero's middle must be to the machine's box, across and up/down, to get in. */
const ACROSS = 16;
const UPDOWN = 24;

/**
 * Step 20 push 2 (docs/mechanisms/machines.md): beside a machine with
 * nobody at the reins, Use reads GET IN; machine-seat acts on it on the
 * server (the hero's body becomes the machine). Not at a wreck, not while
 * a person still sits in it (Grab pulls him out first), and only for a hero
 * a player plays.
 * Order 120: after the door (0) and a placed thing's deed (100), so in a
 * doorway or within a thing's reach Use still does that; before freeing a
 * captive (150) and the bell (200).
 * A page asks its composed world (it holds the machine's entity and its
 * `c.seat`), as for things.
 */
const entry: UseEntry = {
  id: 'get-in',
  order: 120,
  find(world, content, e) {
    if (e.player === null || isOut(e) || machineOf(content, e.kind)) return undefined;
    const me = centre(content, e);
    for (const m of world.entities) {
      if (m.room !== e.room || m.player !== null) continue;
      const def = machineOf(content, m.kind);
      if (!def) continue;
      if ((m.c.seat?.driver ?? null) !== null || machineState(world, m.id).wrecked) continue;
      const box = content.characters[m.kind]!.box;
      if (me.x < m.x - ACROSS || me.x > m.x + box.w + ACROSS) continue;
      if (Math.abs(me.y - (m.y + box.h / 2)) > UPDOWN) continue;
      return { entry: 'get-in', word: 'get-in', target: m.id, at: { x: m.x + box.w / 2, y: m.y } };
    }
    return undefined;
  },
};
export default entry;
