import { canAct } from '../body-state.ts';
import { heartsOut } from '../hearts.ts';
import { boxInSolid, memberTaken } from '../party.ts';
import type { Verb } from '../types.ts';

declare module '../types.ts' {
  interface Components {
    switch?: {
      /** Whether the action was held last tick, to see a fresh press. */
      held: boolean;
    };
  }
  interface EventMap {
    /** A player changed which party member they are. `from` and `to` are character kind ids; the entity id did not change. */
    switched: { entity: string; player: string | null; from: string; to: string };
    /** A switch was pressed and nothing changed. `reason`: "no-fit" (no free member's body fits here) or "none-free" (every other member is being played). */
    'switch-refused': { entity: string; player: string | null; reason: 'no-fit' | 'none-free' };
  }
}

/**
 * Switching between party members, in place. Rules and their sources:
 * docs/mechanisms/party-and-switching.md.
 *
 * DRAFT: the unplayed members are not in the world; the switch changes this
 * entity's kind where it stands (docs/plan/step-2.md: what happens to
 * members nobody is playing is open in the library).
 */
const verb: Verb = {
  id: 'switch',
  // Before move (10) and jump (20), so the new body is the one that acts this tick.
  order: 5,
  actions: ['switch'],
  update(ctx, e, input) {
    // INTENT: only a player switches. Bodies nobody plays also run verbs
    // (from entity.c.input); a party seat is a player's, never theirs.
    if (e.player === null) return;
    const s = (e.c.switch ??= { held: false });
    const down = input.held.includes('switch');
    const fresh = down && !s.held;
    s.held = down;
    if (!fresh) return;
    // DRAFT: a player someone is holding or carrying may not switch (the
    // press is ignored; break free first, with jump).
    if (!canAct(e)) return;

    // Step 11: the world's own party once a cantina swap has changed it (docs/mechanisms/cantina.md).
    const members = ctx.world.party ?? ctx.content.party.members;
    const at = members.indexOf(e.kind);
    const room = ctx.content.rooms[e.room];
    const old = ctx.content.characters[e.kind];
    if (at < 0 || !room || !old) return;

    let anyFree = false;
    // The next member in party order first, then the one after, and so on.
    for (let i = 1; i < members.length; i++) {
      const to = members[(at + i) % members.length]!;
      const next = ctx.content.characters[to];
      if (!next) continue;
      // INTENT: nobody is moved off their character, and no member is played
      // twice by a switch (library docs 05, 06: "without involuntary takeovers").
      if (memberTaken(ctx.world, to, e.id)) continue;
      // Step 21, hearts: a hero with no hearts is out; nobody switches to them (docs/mechanisms/defeat.md, "Hearts").
      if (heartsOut(ctx.world, ctx.content, to)) continue;
      anyFree = true;

      // Feet and middle stay where they are; physics measures from the top-left.
      const x = e.x + (old.box.w - next.box.w) / 2;
      const y = e.y + old.box.h - next.box.h;
      // DRAFT: a wider body standing against a wall is slid sideways just
      // far enough to fit (at most its extra half-width), so touching a
      // wall never blocks a switch. Nearest fit wins; right before left.
      const reach = Math.max(0, Math.ceil((next.box.w - old.box.w) / 2));
      let dx: number | null = null;
      for (let k = 0; k <= reach && dx === null; k++) {
        if (!boxInSolid(room, x + k, y, next.box.w, next.box.h, ctx.world)) dx = k;
        else if (k > 0 && !boxInSolid(room, x - k, y, next.box.w, next.box.h, ctx.world)) dx = -k;
      }
      // INTENT: there is always a way out. A body that would stand inside a
      // wall here (a tall one in a crawlspace) is never switched to; the
      // next member is tried instead. Do not remove this test to make a
      // switch "always work": it is what keeps a player from being stuck
      // in solid tiles (docs/deliberate-designs.md).
      if (dx === null) continue;

      const from = e.kind;
      e.kind = to;
      e.x = x + dx;
      e.y = y;
      // The old body's half-finished jump does not carry over: no buffered
      // press, no variable-height cut waiting. (Flaps: see verbs/flap.ts.)
      if (e.c.jump) {
        e.c.jump.buffer = 0;
        e.c.jump.cut = true;
      }
      ctx.emit('switched', { entity: e.id, player: e.player, from, to });
      return;
    }
    // INTENT: a refused switch changes nothing and says so, so the screen can show why.
    ctx.emit('switch-refused', { entity: e.id, player: e.player, reason: anyFree ? 'no-fit' : 'none-free' });
  },
};
export default verb;
