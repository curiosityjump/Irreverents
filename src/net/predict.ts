// Predicted hits (Step 5, docs/mechanisms/network.md, "Predicted hits"): the
// page shows its own hero's hit on the tick the swing lands, instead of a
// round trip later. Pure (no DOM, no clock of its own), like the rest of src/net.
import type { Content } from '../content/types.ts';
import { heldBy } from '../sim/effects.ts';
import { systems } from '../sim/registry.ts';
import type { Entity, Input, SimEvent, StepContext, World } from '../sim/types.ts';
import { throwCarried, ticksOf } from '../sim/body-state.ts';
import { numbersOf } from '../sim/powers.ts';
import { strikeTick } from '../sim/verbs/attack.ts';
import { clone } from './protocol.ts';

declare module '../sim/types.ts' {
  interface Components {
    /** Only on a page's drawn copy of a body it lent itself (never sent, never simulated): since when, page ms. */
    predicted?: { since: number };
  }
}

/**
 * DRAFT: the systems that move a body nobody is steering: its timers (the
 * held beat), drag, physics, walls and floors, coming to rest, the stun stamp.
 * Never a verb and never an NPC system: the page does not decide what anyone
 * else does, it only lets a struck body fly the way the simulation would.
 * A body it meets on the way (impact-bodies) is put in the scratch world as
 * drawn, so the lent body bounces off it as on the server; what happens to
 * that other body is thrown away (the server's, drawn when it arrives).
 */
const FLIGHT = new Set(['combat-clock', 'impact-before', 'physics', 'impact-walls', 'impact-bodies', 'combat-rest', 'body-stun']);
const flightSystems = systems.filter((s) => FLIGHT.has(s.id));
/** The verbs system's order: on the tick a body is struck, only what runs after the verbs runs on it. */
const VERBS_ORDER = systems.find((s) => s.id === 'verbs')?.order ?? 100;
/** The combat fields the lent copy owns while it is lent; everything else on the body is the server's. */
const COMBAT = ['flying', 'beat', 'impact', 'lastHit', 'stunned', 'landing', 'airborne'] as const;
/** DRAFT: a loan never lasts longer than this, whatever happens (ms). */
const LOAN_CAP_MS = 4000;
/** DRAFT: after handing back, the server's own copy of the same hit is not drawn as a second star for this long (ms). */
const QUIET_MS = 3000;

interface Loan {
  /** The page's copy of the struck body, stepped here. */
  body: Entity;
  /** When it was lent (ms). */
  since: number;
  /** The server's `c.lastHit.tick` on the body when it was lent: a different one by this player means the server hit it too. */
  prior: number | null;
  confirmed: boolean;
  /** A player's character: its own page moves it, so only the star and the beat are drawn here, never its movement. */
  still: boolean;
  /** A throw (brief item 3): lent from this player's hands, so the server's copy being held by them is no reason to end it. */
  thrown: boolean;
  /** Handing back: from where, and since when. */
  back: { at: number; x: number; y: number } | null;
}

export function createPredictor(content: Content, myId: string) {
  const loans = new Map<string, Loan>();
  /** After a loan: the server's impact tick at the hand-back, and the page's stamps drawn in its place until it changes. */
  const quiet = new Map<string, { server: number | null; c: Pick<Entity['c'], 'impact' | 'lastHit'>; until: number }>();
  /** The swing being predicted: its strike tick and what it has hit so far (so each body once, as in the verb). */
  let swing = { swung: Number.NaN, struck: [] as string[] };
  /** Set by a throw press: the page's own verb winds up a swing it does not know is a throw; no hit is predicted for it. */
  let throwing = false;
  /** For checks (`window.irreverents.net.hits`): hits predicted, then seen from the server, or eased back unseen. */
  const counts = { predicted: 0, confirmed: 0, easedBack: 0, thrown: 0 };

  const on = (): boolean => content.net.predictHitMs > 0;

  const byId = (p: Entity, q: Entity): number => (p.id < q.id ? -1 : p.id > q.id ? 1 : 0);
  /** One tick of a lent body's flight, among copies of the bodies around it as drawn (`around`, already copies). */
  const run = (world: World, body: Entity, around: Entity[], tick: number, fromOrder: number): void => {
    const events: SimEvent[] = [];
    const scratch: World = { ...world, tick, entities: [body, ...around.filter((o) => o.id !== body.id && o.room === body.room)].sort(byId) };
    const ctx: StepContext = {
      world: scratch,
      inputs: {},
      content,
      events,
      emit(type, data) {
        events.push({ type, tick, ...data } as SimEvent);
      },
    };
    for (const s of flightSystems) if (s.order > fromOrder) s.run(ctx);
    // Nothing steers a body nobody plays on this page: once its flight is over it stands where it landed.
    if (!body.c.flying && !body.c.beat) body.vx = 0;
  };

  return {
    clear(): void {
      loans.clear();
      quiet.clear();
    },
    /**
     * After each local tick. `world` is the page's own (its tick already
     * advanced), `me` the page's own character after the tick, `drawn` the
     * bodies as this page draws them (asked for only when the swing struck).
     */
    afterStep(world: World, me: Entity, input: Input, drawn: () => Entity[], now: number, ahead: (times: number) => Entity[] = () => drawn()): void {
      if (!on()) {
        loans.clear();
        return;
      }
      const tick = world.tick - 1;
      let seen: Entity[] | null = null;
      const shownNow = (): Entity[] => (seen ??= drawn());
      // The bodies around a lent one, as this page draws them (lent ones where the page has them), and the page's own character.
      const flying = (id: string): Entity | null => {
        const loan = loans.get(id);
        return loan && !loan.back && !loan.still ? loan.body : null;
      };
      const around = (): Entity[] => [clone(me), ...shownNow().map((e) => clone(flying(e.id) ?? e))];
      // A friend's body (still) is stepped alone, only so its beat counts down: it is drawn where its own page puts it.
      for (const loan of loans.values()) if (!loan.back) run(world, loan.body, loan.still ? [] : around(), tick, -Infinity);
      const a = me.c.attack;
      if (!a || a.tick !== tick) return;
      const kind0 = content.characters[me.kind];
      // Step 23: through numbersOf, as the verb reads them (a held power's or weapon's numbers; src/sim/powers.ts).
      const t0 = kind0 ? numbersOf(content, me) : {};
      if ((a.phase ?? 'ready') === 'ready') throwing = false;
      // The verb took a press on this tick (it set the cooldown, attack.ts). While a drawn body is held by
      // this player's character, the server throws it now (attack.ts: "a throw stays immediate").
      if (a.cooldown === Math.max(1, ticksOf(t0.attackTime))) {
        const held = shownNow().find((e) => e.room === me.room && heldBy(e) === me.id);
        if (held) {
          throwing = true;
          const thrower = clone(me);
          thrower.c.carrying = { id: held.id, kind: me.kind };
          const body = clone(held);
          const events: SimEvent[] = [];
          const ctx: StepContext = {
            world: { ...world, tick, entities: [thrower, body].sort(byId) },
            inputs: me.player ? { [me.player]: input } : {},
            content,
            events,
            emit(type, data) {
              events.push({ type, tick, ...data } as SimEvent);
            },
          };
          // The simulation's own throw (src/sim/body-state.ts): where it leaves from, how fast, which way.
          throwCarried(ctx, thrower, input, t0.throwStrength ?? 0);
          if (heldBy(body) === null) {
            loans.set(body.id, { body, since: now, prior: null, confirmed: false, still: false, thrown: true, back: null });
            quiet.delete(body.id);
            counts.thrown++;
            run(world, body, around(), tick, VERBS_ORDER);
          }
        }
      }
      // The verb left the swing in `strike` exactly on the ticks it tested for hits (attack.ts).
      if (a.phase !== 'strike' || throwing) return;
      if (a.swung !== swing.swung) swing = { swung: a.swung, struck: [] };
      const kind = content.characters[me.kind];
      if (!kind?.verbs.includes('attack')) return;
      const t = numbersOf(content, me);
      const shown = shownNow().filter((e) => e.room === me.room && e.id !== me.id);
      // A press while carrying is a throw on the server, not a swing; this page never learns it carries
      // (docs/mechanisms/network.md, "Known limits"), so it looks for a body held by its own character, as drawing does.
      if (shown.some((e) => heldBy(e) === me.id)) return;
      /** The verb's own reach test and launch (src/sim/verbs/attack.ts), never a copy of its numbers, on copies of `from`. */
      const tryStrike = (from: Entity[]): { struck: string[]; bodies: Entity[] } => {
        const bodies = from.map((e) => clone(flying(e.id) ?? e));
        const attacker = clone(me);
        attacker.c.attack = { ...attacker.c.attack!, struck: [...swing.struck] };
        const events: SimEvent[] = [];
        const ctx: StepContext = {
          world: { ...world, tick, entities: [attacker, ...bodies].sort(byId) },
          inputs: me.player ? { [me.player]: input } : {},
          content,
          events,
          emit(type, data) {
            events.push({ type, tick, ...data } as SimEvent);
          },
        };
        strikeTick(ctx, attacker, input, t);
        return { struck: (attacker.c.attack?.struck ?? []).filter((id) => !swing.struck.includes(id)), bodies };
      };
      const { struck: seenHit, bodies } = tryStrike(shown);
      if (seenHit.length === 0) return;
      // DRAFT: drawn bodies are about 100 ms old or more, and the server hits them where they are when the
      // swing reaches it, which on live came 300 ms after the page's (its input queue adds to the trip).
      // So a hit is predicted only when the swing also reaches the body where the server should have it
      // (`ahead(1)`, the client's look-ahead) and twice as far on (`ahead(2)`): a body walking out of
      // reach is left to the server's hit. A false hit costs more than a late one.
      const there = (times: number): string[] => tryStrike(ahead(times).filter((e) => e.room === me.room && e.id !== me.id)).struck;
      const near = there(1);
      const far = there(2);
      const struck = seenHit.filter((id) => near.includes(id) && far.includes(id));
      for (const id of struck) {
        const body = bodies.find((b) => b.id === id);
        const was = shown.find((e) => e.id === id);
        if (!body || !was) continue;
        const old = loans.get(id);
        loans.set(id, {
          body,
          since: now,
          prior: old ? old.prior : (was.c.lastHit?.tick ?? null),
          confirmed: false,
          still: body.player !== null,
          thrown: false,
          back: null,
        });
        quiet.delete(id);
        counts.predicted++;
        run(world, body, body.player ? [] : around(), tick, VERBS_ORDER);
      }
      swing.struck.push(...struck);
    },
    /** The bodies as this page should draw them: `drawn` (the smoothed server copies) with any lent body in place of its own. */
    view(drawn: Entity[], now: number): Entity[] {
      if (loans.size === 0 && quiet.size === 0) return drawn;
      const giveUp = content.net.predictHitMs;
      const blend = Math.max(1, content.net.predictBlendMs);
      const ids = new Set(drawn.map((e) => e.id));
      for (const id of loans.keys()) if (!ids.has(id)) loans.delete(id);
      for (const [id, q] of quiet) if (!ids.has(id) || now > q.until) quiet.delete(id);
      return drawn.map((s) => {
        const loan = loans.get(s.id);
        if (!loan) {
          const q = quiet.get(s.id);
          if (!q) return s;
          // The server's copy of the hit already shown: its star is not drawn a second time.
          if ((s.c.impact?.tick ?? null) !== q.server) {
            quiet.delete(s.id);
            return s;
          }
          return { ...s, c: { ...s.c, impact: q.c.impact, lastHit: q.c.lastHit } };
        }
        const b = loan.body;
        // Someone took hold of it, or it left the room: the server's, at once. A thrown body is still in
        // this player's hands on the server until the throw arrives there.
        const stillMine = loan.thrown && heldBy(s) === myId;
        if ((heldBy(s) !== null && !stillMine) || s.room !== b.room) {
          loans.delete(s.id);
          return s;
        }
        // The server's throw: the body let go and flying, thrown by this player.
        if (loan.thrown && !loan.confirmed && heldBy(s) === null && s.c.flying?.by === myId) {
          loan.confirmed = true;
          counts.confirmed++;
        } else if (!loan.thrown && !loan.confirmed && s.c.lastHit?.by === myId && s.c.lastHit.tick !== loan.prior) {
          loan.confirmed = true;
          counts.confirmed++;
        }
        const c: Entity['c'] = { ...s.c };
        // A thrown body is out of the hands on this page; drawing must not put it back in them (draw/entities.ts carryAt).
        if (loan.thrown) {
          if (b.c.effect === undefined) delete c.effect;
          else c.effect = b.c.effect;
          delete c.held;
        }
        for (const k of COMBAT) {
          if (b.c[k] === undefined) delete c[k];
          else (c as Record<string, unknown>)[k] = b.c[k];
        }
        const age = now - loan.since;
        const rest = (e: Entity): boolean => !e.c.flying && !e.c.beat;
        if (loan.still) {
          // INTENT: a friend's own page owns their body; this page draws only the star and the beat on it.
          if ((!b.c.beat && (loan.confirmed || age > giveUp)) || age > LOAN_CAP_MS) {
            loans.delete(s.id);
            quiet.set(s.id, { server: s.c.impact?.tick ?? null, c: { impact: b.c.impact, lastHit: b.c.lastHit }, until: now + QUIET_MS });
          }
          return { ...s, c };
        }
        if (!loan.back && ((loan.confirmed && rest(b) && rest(s)) || (!loan.confirmed && age > giveUp) || age > LOAN_CAP_MS)) {
          loan.back = { at: now, x: b.x, y: b.y };
          if (!loan.confirmed) counts.easedBack++;
        }
        if (loan.back) {
          // INTENT: the server's word wins. The drawn body eases from where the page had it into the
          // server's path; if the server never hit it, that is the ease back.
          // DRAFT: never faster than a remote character may glide (smooth.ts), so a long way back is not a jump.
          const k = Math.min(1, (now - loan.back.at) / Math.max(blend, (1000 * Math.hypot(s.x - loan.back.x, s.y - loan.back.y)) / content.net.remoteMaxSpeed));
          const x = loan.back.x + (s.x - loan.back.x) * k;
          const y = loan.back.y + (s.y - loan.back.y) * k;
          if (k >= 1) {
            loans.delete(s.id);
            if (loan.confirmed) quiet.set(s.id, { server: s.c.impact?.tick ?? null, c: { impact: b.c.impact, lastHit: b.c.lastHit }, until: now + QUIET_MS });
            return loan.confirmed ? { ...s, c: { ...s.c, impact: b.c.impact, lastHit: b.c.lastHit } } : s;
          }
          return { ...s, x, y, c: loan.confirmed ? { ...s.c, impact: b.c.impact, lastHit: b.c.lastHit } : s.c };
        }
        // INTENT: a short loan for drawing, never ownership: nothing here is sent to the server.
        return { ...s, x: b.x, y: b.y, vx: b.vx, vy: b.vy, onGround: b.onGround, c: { ...c, predicted: { since: loan.since } } };
      });
    },
    counts,
    /** For checks: how many bodies are lent right now. */
    lent(): number {
      return loans.size;
    },
  };
}
