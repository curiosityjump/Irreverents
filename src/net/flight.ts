// A flying own character meets the bodies its page draws (Step 5, "Thrown
// friend", docs/mechanisms/network.md "A flying own character"). Pure (no
// DOM, no clock of its own), like the rest of src/net.
import type { Content } from '../content/types.ts';
import { heldBy } from '../sim/effects.ts';
import { systems } from '../sim/registry.ts';
import type { Entity, SimEvent, StepContext, World } from '../sim/types.ts';
import { clone } from './protocol.ts';

/** The simulation's own body-on-body impact (src/sim/systems/impact-bodies.ts), never a copy of it. */
const impactBodies = systems.find((s) => s.id === 'impact-bodies');
const byId = (p: Entity, q: Entity): number => (p.id < q.id ? -1 : p.id > q.id ? 1 : 0);

/**
 * DRAFT (Step 5, "Thrown friend"; docs/decisions-log.md 2026-11-24): a page's
 * local world holds only its own character, so a friend thrown into a crate
 * flew through it on their own phone while the thrower's phone (which steps
 * the flight among the bodies it draws, src/net/predict.ts) bounced them off
 * it. After each local tick in which the page's own character is flying, this
 * runs the simulation's own impact-bodies once more, in a scratch world of
 * that character (the very object: what it does to it stays) and copies of
 * the bodies as this page draws them. What it does to those copies is thrown
 * away: the server's, drawn when it arrives.
 *
 * - Copies never fly here (`c.flying` dropped), so only this page's own
 *   character can be the one that meets: a body flying INTO it is still the
 *   server's to say, by a push effect, as before.
 * - The speed it met at is kept through the held beat: the simulation stops
 *   a body in a beat (vx, vy 0, the bounce kept in `c.beat`), and nothing
 *   reads its speed until the beat ends (physics, impact and the verbs skip
 *   a body in a beat; combat-clock then sets the bounce). INTENT: so this
 *   page's reports during the beat carry the meeting as it happened, where
 *   it happened, and the server's own impact-bodies meets the same body at
 *   the same speed: the crate is shoved there too, for every screen. Without
 *   it the server saw a body at rest against the crate and the crate never
 *   moved. The server's push for that meeting is then an echo the page sets
 *   aside (src/net/client.ts, `echoes`).
 * - No wear: the server's copy wears the character down when the server sees
 *   the impact (a flatten arrives as an effect); a page wearing itself would
 *   flatten itself where no other screen does.
 *
 * Returns this tick's events about the own character only (its impact, for
 * the sound and the shake) and the ids it met.
 */
export function meetDrawn(world: World, me: Entity, drawn: Entity[], content: Content): { events: SimEvent[]; met: string[] } {
  const none = { events: [], met: [] };
  const f = me.c.flying;
  if (!impactBodies || !f || me.c.beat || heldBy(me) !== null) return none;
  const before = f.met.length;
  const copies: Entity[] = [];
  for (const e of drawn) {
    if (e.id === me.id || e.room !== me.room) continue;
    const o = clone(e);
    delete o.c.flying;
    delete o.c.predicted;
    copies.push(o);
  }
  if (copies.length === 0) return none;
  const tick = world.tick - 1;
  const events: SimEvent[] = [];
  const noWear: Content = { ...content, tuning: { ...content.tuning, world: { ...content.tuning.world, impactWear: 0 } } };
  const ctx: StepContext = {
    world: { ...world, tick, entities: [me, ...copies].sort(byId) },
    inputs: {},
    content: noWear,
    events,
    emit(type, data) {
      events.push({ type, tick, ...data } as SimEvent);
    },
  };
  const [vx, vy] = [me.vx, me.vy];
  impactBodies.run(ctx);
  const met = (me.c.flying?.met ?? []).slice(before);
  if (met.length > 0 && me.c.beat) [me.vx, me.vy] = [vx, vy];
  return { events: events.filter((ev) => (ev as { entity?: string }).entity === me.id), met };
}
