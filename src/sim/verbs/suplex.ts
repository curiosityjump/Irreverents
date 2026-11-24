import { beatTicks, bodyNumbers, launch, markImpact, release, ticksOf, wear } from '../body-state.ts';
import { heldBy } from '../effects.ts';
import { friendly } from '../systems/impact-walls.ts';
import type { Entity, StepContext, Verb } from '../types.ts';
import { findEntity } from '../world.ts';

declare module '../types.ts' {
  interface Components {
    /**
     * Step 25, the suplex (docs/mechanisms/combat-and-impact.md, "The
     * suplex"), on the carrier. `held`: whether Use was down last tick;
     * `pressed`, a fresh press the Use arbiter gave the suplex (systems/suplex-press.ts). While
     * a heave is on, `target` is the body going over, `left` the ticks until
     * the slam, `dir` the way the carrier faced at the press (the body lands
     * on the other side). `at` is the press tick and `slam` the slam's tick,
     * kept after, for drawing (src/client/draw/suplex.ts).
     */
    suplex?: { held: boolean; pressed?: { tick: number; target: string }; target?: string; left?: number; dir?: number; at?: number; slam?: number; tick?: number };
  }
  interface EventMap {
    /** Step 25: `by` slammed `target` head-first into the floor behind them (the witness's deed `hit`, content/rules/expectations.json). */
    suplexed: { by: string; target: string; player: string | null };
  }
}

/**
 * The suplex: Use while carrying a body that can be knocked out, when the
 * Use arbiter's answer is this one (src/sim/use/suplex.ts, order 300, after
 * every other entry). The hero heaves the body up and over for
 * `suplexTime`, still holding it, then drives it head-first into the floor
 * behind: an impact at `suplexSpeed` recorded here (the floor's own test
 * never reaches the slam's speed: world.maxFallSpeed), the held beat, wear
 * `suplexWear`, and everything within `suplexSplashReach` of the landing
 * knocked away. All of it happens in this verb (order 100) so that this
 * tick's beaten-mark (530) and npc-witness (600) see it.
 * DRAFT (Step 25, decisions-log "Step 25: the suplex"): the carrier keeps
 * moving during the heave (a page predicts its own hero's motion and never
 * knows it carries: stopping him here would fight the page); "behind" is
 * where the carrier faced at the press.
 */
const verb: Verb = {
  id: 'suplex',
  order: 45,
  tuning: {
    suplexTime: { min: 0, max: 2, what: 'the heave: seconds from the press of Use until the body carried over the head hits the floor behind' },
    suplexSpeed: { min: 0, max: 2000, what: "the slam's impact speed, pixels per second (judged as any impact: the sound, the shake, a bad guy's slam rule)" },
    suplexWear: { min: 0, max: 100000, what: 'how much the slam wears down the body slammed (against its toughness)' },
    suplexSplashReach: { min: 0, max: 128, what: 'how far from the landing (pixels, from the slammed body\'s box) other bodies are knocked away' },
    suplexSplashStrength: { min: 0, max: 1000000, what: 'how hard the splash knocks a body away: speed (pixels per second) is this divided by its weight, capped by world.maxLaunchSpeed' },
  },
  update(ctx, e, _input, t) {
    const now = ctx.world.tick;
    const s = (e.c.suplex ??= { held: false });
    // INTENT: a body that could not act last tick (knocked flying, held, in a
    // beat) ran no verb: its heave is lost, like a cut-off swing.
    if (s.target !== undefined && s.tick !== now - 1) endHeave(s);
    s.tick = now;

    if (s.target !== undefined) {
      const body = findEntity(ctx.world, s.target);
      // INTENT: the way out. The heave is still a hold: the body may break free
      // with Jump and a held player is let go after holdPlayerTime
      // (systems/carry-hold.ts). A heave whose body is no longer in these hands
      // (broke free, let go, thrown, set down) is lost; nothing is slammed.
      if (!body || heldBy(body) !== e.id || e.c.carrying?.id !== body.id) {
        endHeave(s);
        return;
      }
      s.left = (s.left ?? 1) - 1;
      if (s.left <= 0) slam(ctx, e, body, s.dir ?? e.facing, t);
      return;
    }

    // The press is the arbiter's, read by systems/suplex-press.ts before anything else spends it this tick.
    if (s.pressed?.tick !== now) return;
    const body = findEntity(ctx.world, s.pressed.target);
    // A page's own world holds no carried body: there the arbiter has no suplex answer and this is never reached.
    if (!body || heldBy(body) !== e.id || e.c.carrying?.id !== body.id) return;
    s.target = body.id;
    s.dir = e.facing;
    s.at = now;
    s.left = Math.max(1, ticksOf(t.suplexTime));
  },
};

function endHeave(s: NonNullable<Entity['c']['suplex']>): void {
  delete s.target;
  delete s.left;
}

function slam(ctx: StepContext, e: Entity, body: Entity, dir: number, t: Record<string, number>): void {
  const s = e.c.suplex!;
  endHeave(s);
  s.slam = ctx.world.tick;
  const world = ctx.content.tuning.world;
  const cb = ctx.content.characters[e.kind]?.box;
  const tb = ctx.content.characters[body.kind]?.box;
  if (!cb || !tb) return;
  // DRAFT: behind the carrier, feet on the carrier's floor; against a wall,
  // half under the carrier, then at the carrier's own feet (release() takes
  // the first spot clear of solid tiles).
  const y = e.y + cb.h - tb.h;
  const behind = dir > 0 ? e.x - tb.w - 1 : e.x + cb.w + 1;
  const half = dir > 0 ? e.x - tb.w / 2 : e.x + cb.w - tb.w / 2;
  release(ctx, body, null, [{ x: behind, y }, { x: half, y }, { x: e.x + (cb.w - tb.w) / 2, y }]);
  const speed = t.suplexSpeed ?? 0;
  const landX = body.x + tb.w / 2;
  const landY = body.y + tb.h;
  // The bounce off the floor after the beat, as a thrown body's (systems/impact-walls.ts).
  const up = speed >= (world.floorBounceSpeed ?? 0) ? -speed * (world.floorBounce ?? 0) : 0;
  launch(ctx, body, -dir * 20, up, e.id, [e.id], beatTicks(ctx, world.beatTime, world.beatMaxTime, speed));
  markImpact(ctx, body, landX, landY, speed);
  ctx.emit('suplexed', { by: e.id, target: body.id, player: e.player });
  ctx.emit('impact', { entity: body.id, player: body.player, other: null, speed });
  // Step 11: in a cantina brawl the body's c.brawl share is read first; a friend's, else, is world.friendThrowWear.
  wear(ctx, body, (t.suplexWear ?? 0) * (friendly(ctx, e.id, body) ? (body.c.brawl?.throwWear ?? world.friendThrowWear ?? 0) : 1), e.id);
  splash(ctx, e, body, t);
}

/**
 * Every other body near the landing is knocked away from it, as by a blow:
 * the speed is the splash strength over its weight. A friend is knocked by
 * the friend share of an attack (world.friendAttackLaunch). Bodies carry on
 * into what they meet through impact-bodies and impact-walls.
 * DRAFT: the splash's own impact is judged like any other: a bad guy
 * knocked away at his slam speed or more is defeated (beaten-mark).
 */
function splash(ctx: StepContext, e: Entity, body: Entity, t: Record<string, number>): void {
  const reach = t.suplexSplashReach ?? 0;
  const strength = t.suplexSplashStrength ?? 0;
  const tb = ctx.content.characters[body.kind]?.box;
  if (reach <= 0 || strength <= 0 || !tb) return;
  const world = ctx.content.tuning.world;
  const mid = body.x + tb.w / 2;
  for (const o of ctx.world.entities) {
    if (o === e || o === body || o.room !== body.room || heldBy(o) !== null || o.c.flattened) continue;
    const ob = ctx.content.characters[o.kind]?.box;
    if (!ob) continue;
    const gapX = Math.max(0, o.x - (body.x + tb.w), body.x - (o.x + ob.w));
    const gapY = Math.max(0, o.y - (body.y + tb.h), body.y - (o.y + ob.h));
    if (gapX > reach || gapY > reach) continue;
    const friend = e.player !== null && o.player !== null;
    const speed = Math.min(strength / bodyNumbers(ctx.content, o).weight, world.maxLaunchSpeed ?? 500) * (friend ? (o.c.brawl?.attackLaunch ?? world.friendAttackLaunch ?? 0) : 1);
    if (speed <= 0) continue;
    const omid = o.x + ob.w / 2;
    const away = omid > mid ? 1 : omid < mid ? -1 : (e.c.suplex?.dir ?? e.facing) > 0 ? -1 : 1;
    launch(ctx, o, away * speed, -speed * (world.attackLift ?? 0.5), e.id, [e.id, body.id], beatTicks(ctx, world.hitBeatTime, world.hitBeatMaxTime, speed));
    markImpact(ctx, o, away > 0 ? o.x : o.x + ob.w, o.y + ob.h / 2, speed);
    ctx.emit('impact', { entity: o.id, player: o.player, other: body.id, speed });
    wear(ctx, o, speed * (world.impactWear ?? 0) * (friend ? (o.c.brawl?.throwWear ?? world.friendThrowWear ?? 0) : 1), e.id);
  }
}
export default verb;
