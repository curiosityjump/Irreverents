import { ticksOf } from '../body-state.ts';
import { cantinasOf, isRegular, partyOf } from '../cantina.ts';
import { emitEffect } from '../effects.ts';
import { boxInSolid, memberTaken } from '../party.ts';
import type { Entity, Input, StepContext, System } from '../types.ts';

/**
 * The cantina's party swap (Step 11 slice B, D-084; docs/mechanisms/cantina.md):
 * tap a regular who is not in the party and your party appears across the
 * screen; tap the member to replace.
 *
 * - The row opens only for a regular outside the party, only with no brawl
 *   on (DRAFT, the lead's call: a tap mid-fight is never a surprise).
 * - It closes on a tap elsewhere, the stick or any button, a brawl starting,
 *   the player leaving the room, or by itself after `pick.seconds` (DRAFT).
 * - A member nobody plays: the slot becomes the regular's character; both
 *   go on wandering (neither is played).
 * - Your own member: the slot changes AND you become the newcomer, through
 *   the `become` effect (the only way to change a player's body: the page
 *   owns its character). Feet and middle stay put, as a switch does; a body
 *   that would not fit is refused (`no-fit`).
 * - A member a friend plays: refused (`taken`), nothing changes.
 *   INTENT: "avoid silently stealing a teammate's avatar" (library doc 06).
 *   Only the tapping player's own entity ever gets `become`.
 *
 * INTENT: does nothing in a world without a `~cantina:<room>` entity, so a
 * page's own world never writes `world.party` (a page takes the server's by
 * key with each snapshot, and would otherwise overwrite it every tick).
 * Runs after the brawl (640) and the ring-out (650), so a brawl that started
 * this tick closes every row.
 */
const system: System = {
  id: 'cantina-swap',
  order: 660,
  run(ctx) {
    const { world, content } = ctx;
    for (const { file, state } of cantinasOf(world, content)) {
      const room = file.room;
      for (const e of world.entities) {
        if (e.player === null) continue;
        const input: Input = ctx.inputs[e.player] ?? { x: 0, y: 0, held: [] };
        const tap = input.tap;
        const fresh = tap !== undefined && e.c.cantinaTap?.n !== tap.n;
        if (tap) e.c.cantinaTap = { n: tap.n };
        else delete e.c.cantinaTap;

        const base = { room, entity: e.id, player: e.player };
        const close = (why: 'tap' | 'moved' | 'brawl' | 'time' | 'swap' | 'left'): void => {
          if (!state.pick?.[e.id]) return;
          delete state.pick[e.id];
          if (Object.keys(state.pick).length === 0) delete state.pick;
          ctx.emit('cantina-row-close', { ...base, why });
        };
        const idle = input.x === 0 && input.y === 0 && input.held.length === 0;

        let open = state.pick?.[e.id];
        if (open) {
          if (e.room !== room) close('left');
          else if (state.on) close('brawl');
          else if (!idle) close('moved');
          else if (world.tick >= open.until) close('time');
          else if (fresh && tap.slot !== undefined) {
            if (swap(ctx, e, open.kind, tap.slot, base)) close('swap');
            continue;
          } else if (fresh) close('tap');
          else continue;
          open = undefined;
        }
        if (!fresh || tap.slot !== undefined || state.on || !idle || e.room !== room) continue;
        const party = partyOf(world, content);
        // The regular under the finger: its box grown by pick.reach; nearest middle wins, ties by id.
        let best: { e: Entity; d: number } | null = null;
        for (const r of world.entities) {
          if (!isRegular(r) || r.room !== room || party.includes(r.kind)) continue;
          const box = content.characters[r.kind]?.box;
          if (!box) continue;
          const m = file.pick.reach;
          if (tap.x < r.x - m || tap.x > r.x + box.w + m || tap.y < r.y - m || tap.y > r.y + box.h + m) continue;
          const d = Math.abs(tap.x - (r.x + box.w / 2)) + Math.abs(tap.y - (r.y + box.h / 2));
          if (!best || d < best.d) best = { e: r, d };
        }
        if (!best) continue;
        (state.pick ??= {})[e.id] = { kind: best.e.kind, until: world.tick + ticksOf(file.pick.seconds) };
        ctx.emit('cantina-row-open', { ...base, kind: best.e.kind });
      }
    }
  },
};
export default system;

/**
 * A tap on party slot `slot` with the row open to bring in `to`. True when the party changed.
 * Step 13: also the rescue's swap on the spot (systems/recruit-free.ts), one function for both.
 */
export function swap(ctx: StepContext, e: Entity, to: string, slot: number, base: { room: string; entity: string; player: string | null }): boolean {
  const { world, content } = ctx;
  const party = [...partyOf(world, content)];
  const from = party[slot];
  if (from === undefined || party.includes(to) || !content.characters[to]) return false;
  if (from !== e.kind) {
    // INTENT: never a friend's character (library doc 06).
    if (memberTaken(world, from, e.id)) {
      ctx.emit('cantina-swap-refused', { ...base, slot, why: 'taken' });
      return false;
    }
    party[slot] = to;
    world.party = party;
    ctx.emit('cantina-swap', { ...base, slot, from, to });
    return true;
  }
  // Your own member: you become the newcomer where you stand, feet and middle kept (as verbs/switch.ts).
  const room = content.rooms[e.room];
  const old = content.characters[e.kind]!;
  const next = content.characters[to]!;
  if (!room) return false;
  const x = e.x + (old.box.w - next.box.w) / 2;
  const y = e.y + old.box.h - next.box.h;
  // DRAFT: slid sideways at most its extra half-width to clear a wall, nearest first, right before left (as a switch).
  const reach = Math.max(0, Math.ceil((next.box.w - old.box.w) / 2));
  let dx: number | null = null;
  for (let k = 0; k <= reach && dx === null; k++) {
    if (!boxInSolid(room, x + k, y, next.box.w, next.box.h, world)) dx = k;
    else if (k > 0 && !boxInSolid(room, x - k, y, next.box.w, next.box.h, world)) dx = -k;
  }
  // INTENT: there is always a way out: never put a body inside a wall.
  if (dx === null) {
    ctx.emit('cantina-swap-refused', { ...base, slot, why: 'no-fit' });
    return false;
  }
  party[slot] = to;
  world.party = party;
  emitEffect(ctx, e, { kind: 'become', to, x: x + dx, y });
  ctx.emit('cantina-swap', { ...base, slot, from, to });
  return true;
}
