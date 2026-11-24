import { emitEffect } from '../effects.ts';
import { menuBackTo } from '../menu-back.ts';
import type { System } from '../types.ts';
import { dropEverything, spotIn } from './heart-game-over.ts';

declare module '../types.ts' {
  interface Input {
    /**
     * The menu's way back (brief owner-stuck-in-the-quarry): the newest press
     * of "Back to the entrance" / "Back to the cantina". `n` grows by one per
     * press, so a press carried by several ticks' inputs is acted on once.
     */
    back?: { n: number };
  }
  interface Components {
    /** The last `Input.back.n` this player's hero acted on (menu-back). */
    menuBack?: { n: number };
  }
  interface EventMap {
    /** The menu moved `player`'s hero from `from` to `room`; `stage` when it was a stage's entrance (a try: stage-run). */
    'menu-back': { player: string; entity: string; from: string; room: string; stage: string | null };
    /** A press the menu's way back did not act on, and why. */
    'menu-back-refused': { player: string; why: 'none-here' | 'game-over' | 'brawl' | 'no-spot' };
  }
}

/**
 * The menu's way back (src/sim/menu-back.ts says where it goes, and why).
 * A fresh `Input.back` press moves that player's hero alone: inside a stage,
 * to the stage's entrance (as Step 21's game over lands there), and the stage
 * counts it as a try (stage-run: it starts over once nobody else is inside);
 * elsewhere, to the cantina's pads. What it carried or held is let go first,
 * as at a game over (a prize back on its stand, a power and a weapon left
 * where it stood); the party's hearts, the roster, pieces, levels and the
 * Hall are not touched.
 * INTENT (CLAUDE.md, "There is always a way out"; the owner, 2026-11-24:
 * "i got stuck in the quarry"): never removed; refused only where another way
 * on is already under way (a game over coming) or the room is the cantina.
 * INTENT (cantina-chase.ts): the server's world only (`World.taken` is set
 * only in a page's); the page is moved by the `move` effect.
 * Runs after the game over (588), before the throw (590), the doors (600)
 * and the stage's run (612), which reads its event on the same tick.
 */
const system: System = {
  id: 'menu-back',
  order: 589,
  run(ctx) {
    const { world, content } = ctx;
    if (world.taken !== undefined) return;
    for (const e of world.entities) {
      if (e.player === null) continue;
      const press = ctx.inputs[e.player]?.back;
      if (!press || e.c.menuBack?.n === press.n) continue;
      e.c.menuBack = { n: press.n };
      const refuse = (why: 'none-here' | 'game-over' | 'brawl' | 'no-spot'): void => void ctx.emit('menu-back-refused', { player: e.player!, why });
      const to = menuBackTo(content, e.room);
      if (!to) {
        refuse('none-here');
        continue;
      }
      if (world.gameOver) {
        refuse('game-over');
        continue;
      }
      if (e.c.brawl) {
        refuse('brawl');
        continue;
      }
      const spot =
        to.to === 'entrance'
          ? spotIn(ctx, { room: to.room, door: to.door, tile: null }, e, 0)
          : spotIn(ctx, { room: to.room, door: null, tile: null }, e, world.entities.filter((x) => x.player !== null && x.room === to.room).length);
      if (!spot) {
        refuse('no-spot');
        continue;
      }
      const from = e.room;
      dropEverything(ctx, e);
      emitEffect(ctx, e, { kind: 'move', room: spot.room, x: spot.x, y: spot.y });
      // Free on arriving, as at a game over: a flat hero gets up on the next tick.
      if (e.c.flattened) emitEffect(ctx, e, { kind: 'flatten', ticks: 1, by: null });
      e.onGround = false;
      ctx.emit('menu-back', { player: e.player, entity: e.id, from, room: spot.room, stage: to.to === 'entrance' ? to.stage : null });
    }
  },
};
export default system;
