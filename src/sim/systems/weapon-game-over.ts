import { ticksOf } from '../body-state.ts';
import { emitEffect } from '../effects.ts';
import type { System } from '../types.ts';
import { canHold, carrierTag, weaponWorld } from '../weapons.ts';
import { removeEntity } from '../world.ts';

declare module '../types.ts' {
  interface EventMap {
    /** Step 23: at a game over, loose weapon `loose` (`weapon`, from `src`) went back where it was found: its source stands it again, or carrier `carrier` holds it again. */
    'weapon-returned': { loose: string; weapon: string; src: string; carrier?: string };
  }
}

/**
 * A weapon held at a game over goes back where it was found (Step 23, the
 * orchestrator's brief; Step 21's game over, systems/heart-game-over.ts).
 * A weapon leaves a player's hand on the way to it: the last fall knocks it
 * loose (weapon-loose, D-081), at the start of the game over's beat, and the
 * game over lets go of anything still held (its dropEverything) this tick.
 * Each loose weapon that left a player of this game over (`from`) within the
 * beat (its id's tick, makeLoose) and still lies loose then goes back:
 * - from a source (`src` a source id): it is gone, and its source stands it
 *   again on the next tick (its bookkeeping cleared, so with no restock wait);
 * - from a carrier (`src` = carrierTag(id)): it is gone, and the carrier
 *   holds it again if he is in the world with empty hands; if he is beaten
 *   and gone, he comes back armed (weapon-carriers: his sword is nowhere).
 * A weapon with no `src` (none comes from anywhere else today) stays where it lay.
 * DRAFT: only what the players held is sent back; a weapon already lying
 * loose somewhere stays there. A weapon kept for another party member
 * (weapon-hands) stays kept: it is not in a hand at the game over.
 * The server's world and a scenario's only (weaponWorld).
 * Runs after the game over (588), which emits `game-over`.
 */
const system: System = {
  id: 'weapon-game-over',
  order: 589,
  run(ctx) {
    const { world, content } = ctx;
    if (!weaponWorld(world)) return;
    for (const ev of ctx.events) {
      if (ev.type !== 'game-over') continue;
      const holders = new Set(world.entities.filter((e) => e.player !== null && ev.players.includes(e.player)).map((e) => e.id));
      const since = world.tick - Math.max(1, ticksOf(content.hearts?.gameOver.beat ?? 0)) - 1;
      const madeAt = (id: string): number => Number(id.split(':')[1] ?? -1);
      const dropped = world.entities.filter((e) => e.c.loose && e.c.loose.from !== null && holders.has(e.c.loose.from) && madeAt(e.id) >= since);
      for (const loose of dropped) {
        const l = loose.c.loose!;
        const src = l.src;
        if (src === undefined) continue;
        const carrierId = src.startsWith('~carrier:') ? src.slice('~carrier:'.length) : undefined;
        removeEntity(world, loose.id);
        if (carrierId === undefined) {
          if (world.weaponSources) delete world.weaponSources[src];
          ctx.emit('weapon-returned', { loose: loose.id, weapon: l.weapon, src });
          continue;
        }
        const carrier = world.entities.find((e) => e.id === carrierId);
        if (carrier && carrier.player === null && !carrier.c.weapon && canHold(content, carrier)) {
          emitEffect(ctx, carrier, { kind: 'weapon', weapon: l.weapon, by: carrier.kind, src: carrierTag(carrierId) });
        }
        ctx.emit('weapon-returned', { loose: loose.id, weapon: l.weapon, src, carrier: carrierId });
      }
    }
  },
};
export default system;
