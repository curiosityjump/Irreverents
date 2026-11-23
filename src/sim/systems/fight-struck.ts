import { ticksOf } from '../body-state.ts';
import { findEntity } from '../world.ts';
import type { System } from '../types.ts';

declare module '../types.ts' {
  interface Components {
    /**
     * Step 18, on a person: which heroes struck them, by entity id, and the
     * tick of the latest deed (a hit, a grab or a throw). Read by
     * outpost-fight for a kind with `"fights": "when-struck"`. Entries older
     * than `npcStruckMemory` seconds are dropped, and so are ids no longer in
     * the world (Step 17's saves remove players' entities).
     */
    struck?: Record<string, number>;
  }
}

/**
 * Remembers who struck a person, for the villain who hits back once struck
 * (docs/mechanisms/npc-response.md, "Who fights"). Runs after the verbs
 * (100), whose events it reads, and before the next system (200).
 * DRAFT (Step 18): only a hero's own `hit`, `grabbed` or `thrown` counts. A
 * body a hero throws into the person names no hero in its `impact` event,
 * so it is not a strike; reading the thrower from the flight is a change
 * here (this would then run after impact-bodies).
 * INTENT: state lives on the person only; anything the server wrote on a
 * player's entity would be undone by the puppet rule
 * (docs/mechanisms/network.md).
 */
const system: System = {
  id: 'fight-struck',
  order: 101,
  tuning: {
    npcStruckMemory: { min: 0, max: 600, what: 'how long, in seconds, a person who fights when struck keeps fighting the hero who struck them' },
  },
  run(ctx) {
    const { world, content } = ctx;
    for (const ev of ctx.events) {
      if (ev.type !== 'hit' && ev.type !== 'grabbed' && ev.type !== 'thrown') continue;
      if (ev.player === null) continue;
      const target = findEntity(world, ev.target);
      if (!target || !target.c.npc || target.player !== null) continue;
      (target.c.struck ??= {})[ev.by] = world.tick;
    }
    // DRAFT: 15 s, and each new deed restarts it.
    const memory = ticksOf(content.tuning.world.npcStruckMemory ?? 15);
    for (const e of world.entities) {
      const s = e.c.struck;
      if (!s) continue;
      for (const id of Object.keys(s)) {
        if (world.tick - s[id]! > memory || !findEntity(world, id)) delete s[id];
      }
      if (Object.keys(s).length === 0) delete e.c.struck;
    }
  },
};
export default system;
