import { partyOf } from '../cantina.ts';
import { recruitsOf } from '../recruits.ts';
import { unlock } from '../roster.ts';
import type { System } from '../types.ts';
import { useHere } from '../use.ts';
import { swap } from './cantina-swap.ts';

declare module '../types.ts' {
  interface EventMap {
    /**
     * Step 13 (docs/mechanisms/recruits.md; contract with the banners and
     * the detector, docs/plan/core-loops.md "Names the slices share"): a
     * captive was freed. `character` the hero now unlocked for good; `added`
     * false in a world that had them unlocked already (no roster of its own).
     */
    recruited: { recruit: string; character: string; by: string; player: string | null; added: boolean };
    /** Step 13: someone began holding Use at a shut cage (for the page's sound and the scenarios). */
    'recruit-hold': { recruit: string; by: string };
    /** Step 13: a hold at the cage ended before the captive was free (let go, moved away, knocked out). */
    'recruit-let-go': { recruit: string; by: string };
  }
  interface Components {
    /** Step 13: whether this body held Use last tick (a swap on the spot takes a fresh press). */
    recruitUse?: boolean;
  }
}

/** DRAFT: seconds after freeing in which Use at the open cage swaps the hero in on the spot. */
const OFFER_SECONDS = 5;

/**
 * Step 13 push 3: holding Use at a shut cage (the Use arbiter's `free`
 * answer, src/sim/use/free.ts) fills its hold; letting go, stepping away or
 * being knocked out empties it. Full: the cage opens for good, the hero is
 * unlocked (World.roster, D-082), `recruited`, and the deed `free` is done
 * where any watcher may see it (content/rules/rescue.json). Then, for
 * OFFER_SECONDS, a fresh press of Use there by the freer swaps them in on the
 * spot: the cantina's own swap (its function), on the freer's own slot.
 * Does nothing in a page's own world (no captive in it).
 * INTENT: one holder at a time; a friend's press does not reset it.
 */
const system: System = {
  id: 'recruit-free',
  order: 61,
  run(ctx) {
    const { world, content } = ctx;
    const cages = recruitsOf(world, content);
    if (cages.length === 0) return;
    const seconds = (s: number): number => Math.max(1, Math.round(s * 60));
    const holding = new Set<string>();
    for (const e of world.entities) {
      if (e.player === null) continue;
      const down = ctx.inputs[e.player]?.held.includes('interact') ?? false;
      const fresh = down && !e.c.recruitUse;
      e.c.recruitUse = down;
      if (!down) continue;
      const answer = useHere(world, content, e);
      if (answer?.entry !== 'free') continue;
      const cage = cages.find((c) => c.e.id === answer.target);
      if (!cage) continue;
      const { r, state } = cage;
      if (answer.word === 'swap') {
        if (!fresh) continue;
        state.offer = null;
        const slot = partyOf(world, content).indexOf(e.kind);
        if (slot >= 0) swap(ctx, e, r.character, slot, { room: e.room, entity: e.id, player: e.player });
        continue;
      }
      // Shut: hold it.
      if (state.hold && state.hold.by !== e.id) continue;
      if (!state.hold) {
        if (!fresh) continue;
        state.hold = { by: e.id, ticks: 0 };
        ctx.emit('recruit-hold', { recruit: r.id, by: e.id });
      }
      holding.add(cage.e.id);
      state.hold.ticks++;
      if (state.hold.ticks < seconds(r.hold)) continue;
      state.hold = null;
      state.open = true;
      state.offer = { to: e.id, until: world.tick + seconds(OFFER_SECONDS) };
      const added = unlock(world, content, r.character);
      ctx.emit('recruited', { recruit: r.id, character: r.character, by: e.id, player: e.player, added });
      ctx.emit('did', { deed: 'free', by: e.id, target: null, thing: cage.e.id });
    }
    for (const { r, e, state } of cages) {
      if (state.hold && !holding.has(e.id)) {
        ctx.emit('recruit-let-go', { recruit: r.id, by: state.hold.by });
        state.hold = null;
      }
      if (state.offer && world.tick >= state.offer.until) state.offer = null;
    }
  },
};
export default system;
