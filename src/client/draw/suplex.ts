import type { Content } from '../../content/types.ts';
import { ticksOf } from '../../sim/body-state.ts';
import { numbersOf } from '../../sim/powers.ts';
import type { Entity, World } from '../../sim/types.ts';
import { useHere } from '../../sim/use.ts';
import { drawSlamDust } from './slam-dust.ts';

/**
 * Step 25, the suplex drawn (docs/mechanisms/combat-and-impact.md, "The
 * suplex"). Push 4: it must read as "a wrestler throwing someone over
 * backwards onto their head" on a phone, before the grappler has frames of
 * his own (C02-05; a `suplex` strip drops in through sprites.ts and this
 * file then only moves the body).
 *
 * Three pictures, all cosmetic (nothing here moves a body in the simulation):
 * 1. The heave: the carried body rises above the carrier's head and travels
 *    over and behind him on an arc about his feet, turning head-down as it
 *    comes over (`turnForHeave`, while it is still held).
 * 2. The slam: once the server's slam arrives (the body is let go with a new
 *    impact), the body finishes the arc, is drawn head-down at the floor
 *    behind the carrier, and that picture is held for the slam's beat, then
 *    flops over flat (`poseFor`, the body drawn free). The carrier leans back
 *    into it: the bridge.
 * 3. A dust burst along the floor wider than the body (draw/slam-dust.ts),
 *    beside the impact's own star and shake (draw/impact.ts).
 *
 * INTENT: drawn from the press. A player's own page never learns its hero
 * carries or heaves (the server does both; docs/mechanisms/network.md), so
 * it starts the heave on the frame its own Use press goes down while the
 * Use arbiter, asked of the composed world, says `suplex`; another page
 * starts it when the carrier's `c.suplex.at` (stamped by the simulation)
 * first arrives. INTENT (push 4, the orchestrator's ruling 4): the drawn
 * heave is stretched so the body reaches the floor when the server's slam
 * reaches this page: on the presser's page `suplexTime` plus the page's
 * lag (seeded from the round trip, then learned from each slam it sees); on
 * another page `suplexTime` (the stamp and the slam come by the same road).
 * No frozen body overhead while it waits, no snap back.
 */

/** DRAFT: the carrier's lean back into the throw at the slam (radians): the bridge, until frames come. */
const LEAN = 0.15;
/** DRAFT: how much higher than the carry the body rises at the top of the arc (px). */
const LIFT = 8;
/** DRAFT: the drawn gap between carrier and slammed body, beyond the simulation's 1 px (sprite pictures are wider than their boxes). */
const GAP = 18;
/** DRAFT: ticks to finish the arc when the slam arrives before the drawn body reaches the floor. */
const CATCH = 3;
/** DRAFT: ticks the head-down picture is held at least (the slam's own beat is used when longer). */
const HOLD_MIN = 9;
/** DRAFT: ticks the head-down body takes to flop flat. */
const FLOP = 8;
/** DRAFT: the most ticks a slammed body is drawn lying after its flop while it bounces. */
const LIE_MAX = 75;
/** DRAFT: how long past its stretched length the heave waits for a slam before it is taken as lost (ticks). */
const GIVE_UP = 45;

interface Heave {
  carrier: string;
  body: string;
  /** Page tick the heave began on this page; its stretched length (ticks); whether this page pressed it. */
  start: number;
  length: number;
  pressed: boolean;
  dir: number;
  /** The body's impact tick when the heave began (a new one means the slam). */
  impact: number | null;
  /** Page tick the slam arrived, the arc's progress then, and the arc's end as it stood (room px, the body's centre). */
  slamAt: number | null;
  pAtSlam: number;
  end: { x: number; y: number } | null;
  /** The slam's beat, ticks. */
  beat: number;
}
/** By carried body. */
const heaves = new Map<string, Heave>();
/** Per carrier: whether its Use was down, and the last `c.suplex.at` seen. */
const carriers = new Map<string, { held: boolean; at: number | undefined }>();
/** Learned lag (ticks) from the press to the slam's arrival beyond suplexTime, on this page. */
let lag: number | null = null;
/** What the last frames drew, for the checks (window.irreverents.drawn.suplex). */
const record: { phase: string; p: number; angle: number; heaveTick: number | null; slamTick: number | null; length: number; lag: number | null; frames: number; beside: number; slamDx: number | null } = {
  frames: 0,
  beside: 0,
  slamDx: null,
  phase: 'none',
  p: 0,
  angle: 0,
  heaveTick: null,
  slamTick: null,
  length: 0,
  lag: null,
};

type Debug = { drawn?: Record<string, unknown>; net?: { rttMs?: number | null }; player?: string };
function debug(): Debug | undefined {
  return (globalThis as { irreverents?: Debug }).irreverents;
}

function boxOf(content: Content, e: Entity): { w: number; h: number } | undefined {
  return content.characters[e.kind]?.box;
}

/** The ticks from the press to the server's slam showing on this page, beyond the heave itself: learned, else from the round trip. */
function pressLag(content: Content): number {
  if (lag !== null) return lag;
  const n = content.net;
  const rtt = debug()?.net?.rttMs ?? 100;
  return Math.round(((rtt + 1000 / n.reportRate + 1000 / n.snapshotRate + n.interpDelayMs) * 60) / 1000);
}

/** Notices a heave starting on `carrier` this frame (the page's own press, or the server's stamp arriving). */
function notice(world: World, content: Content, carrier: Entity, body: Entity): void {
  const s = carrier.c.suplex;
  let m = carriers.get(carrier.id);
  if (!m) {
    m = { held: s?.held ?? false, at: s?.at };
    carriers.set(carrier.id, m);
  }
  const held = s?.held ?? false;
  const time = Math.max(1, ticksOf(numbersOf(content, carrier).suplexTime));
  const current = heaves.get(body.id);
  const fresh = !current || current.carrier !== carrier.id || current.slamAt !== null;
  const begin = (pressed: boolean): void => {
    heaves.set(body.id, {
      carrier: carrier.id,
      body: body.id,
      start: world.tick,
      length: time + (pressed ? pressLag(content) : 0),
      pressed,
      dir: carrier.facing >= 0 ? 1 : -1,
      impact: body.c.impact?.tick ?? null,
      slamAt: null,
      pAtSlam: 0,
      end: null,
      beat: HOLD_MIN,
    });
    record.heaveTick = world.tick;
    record.slamTick = null;
    record.frames = 0;
    record.beside = 0;
    record.slamDx = null;
  };
  // Only the page's own hero is heaved from a press here: another's `held` arrives with its stamp.
  const own = carrier.player !== null && carrier.player === debug()?.player;
  if (own && held && !m.held && fresh && useHere(world, content, carrier)?.entry === 'suplex') begin(true);
  else if (s?.at !== undefined && s.at !== m.at && fresh) begin(false);
  m.held = held;
  m.at = s?.at;
  if (carriers.size > 64) for (const [id] of carriers) if (!world.entities.some((e) => e.id === id)) carriers.delete(id);
}

/** The arc's progress at a heave's age: eased in, slowing near the floor if the slam is late (never overhead). */
function progress(h: Heave, age: number): number {
  const raw = (age + 1) / Math.max(1, h.length);
  if (raw < 0.92) return Math.max(0, raw);
  return 0.92 + 0.07 * (1 - Math.exp(-(raw - 0.92) * 4));
}

/**
 * Where the body is drawn at progress p: its centre (screen px) and its turn. `feet`: the carrier's
 * feet-middle; `from`: the body's centre in the hands.
 */
function arc(h: Heave, p: number, feet: { x: number; y: number }, from: { x: number; y: number }, end: { x: number; y: number }): { x: number; y: number; angle: number } {
  const back = -h.dir;
  // Polar about the carrier's feet: phi measured from straight up toward behind.
  const v0 = { x: from.x - feet.x, y: from.y - feet.y };
  const v1 = { x: end.x - feet.x, y: end.y - feet.y };
  const r0 = Math.hypot(v0.x, v0.y);
  const r1 = Math.hypot(v1.x, v1.y);
  const phi0 = Math.atan2(v0.x * back, -v0.y);
  const phi1 = Math.atan2(v1.x * back, -v1.y);
  const s = p * p;
  const phi = phi0 + (phi1 - phi0) * s;
  const r = r0 + (r1 - r0) * Math.pow(p, 2.5) + LIFT * Math.sin(Math.PI * Math.min(1, p * 1.25));
  // DRAFT: the turn leads the travel, so by the top of the arc the body is already tipping over head first.
  const angle = -h.dir * Math.PI * Math.min(1, Math.pow(p, 1.3));
  return { x: feet.x + back * r * Math.sin(phi), y: feet.y - r * Math.cos(phi), angle };
}

/** The slammed body's centre at the arc's end, behind the carrier, head at the floor (room px). */
function arcEnd(content: Content, h: Heave, carrier: Entity, body: Entity): { x: number; y: number } | null {
  const cb = boxOf(content, carrier);
  const tb = boxOf(content, body);
  if (!cb || !tb) return null;
  return { x: carrier.x + cb.w / 2 - h.dir * (cb.w / 2 + tb.w / 2 + 1 + GAP), y: carrier.y + cb.h - tb.h / 2 };
}

function turnAbout(g: CanvasRenderingContext2D, from: { x: number; y: number }, to: { x: number; y: number }, angle: number): void {
  g.translate(Math.round(to.x), Math.round(to.y));
  if (angle) g.rotate(angle);
  g.translate(-Math.round(from.x), -Math.round(from.y));
}

/**
 * Turns the canvas for drawing `body`, carried by `carrier`, mid-heave.
 * `at`: the body's top-left as it will be drawn (screen px), when it is in the hands.
 * Returns true when it turned it (the caller restores). `ox`, `oy`: the room's origin on screen.
 */
export function turnForHeave(g: CanvasRenderingContext2D, world: World, content: Content, carrier: Entity, body: Entity, ox: number, oy: number, at?: { x: number; y: number }): boolean {
  if (body.c.effect?.heldBy !== carrier.id) return false;
  notice(world, content, carrier, body);
  const h = heaves.get(body.id);
  if (!h || h.carrier !== carrier.id || h.slamAt !== null) return false;
  const age = world.tick - h.start;
  // INTENT: the way out. A heave the server never slams (the body broke free, or the press was not
  // the server's suplex) is let go after its length and GIVE_UP: the body is drawn in the hands again.
  if (age < 0 || age > h.length + GIVE_UP) {
    heaves.delete(body.id);
    return false;
  }
  const cb = boxOf(content, carrier);
  const tb = boxOf(content, body);
  const end = arcEnd(content, h, carrier, body);
  if (!cb || !tb || !end) return false;
  const feet = { x: ox + carrier.x + cb.w / 2, y: oy + carrier.y + cb.h };
  const from = at ? { x: at.x + tb.w / 2, y: at.y + tb.h / 2 } : { x: feet.x, y: feet.y - cb.h - tb.h / 2 };
  const p = progress(h, age);
  const pose = arc(h, p, feet, from, { x: ox + end.x, y: oy + end.y });
  // For the checks: heave frames drawn, and those whose body's middle was neither above the carrier's head nor behind his back.
  record.frames++;
  if (!(pose.y < oy + carrier.y || (pose.x - feet.x) * -h.dir > cb.w / 2)) record.beside++;
  note(world, 'heave', p, pose.angle, h.length);
  turnAbout(g, from, pose, pose.angle);
  return true;
}

function note(world: World, phase: string, p: number, angle: number, length: number): void {
  record.phase = phase;
  record.p = p;
  record.angle = Math.abs((angle * 180) / Math.PI);
  record.length = length;
  record.lag = lag;
  const drawn = debug()?.drawn;
  if (!drawn) return;
  // What a check reads (scripts/e2e/suplex.ts): the last heave drawn, in degrees, and the whole record.
  if (phase === 'heave' || phase === 'catch') drawn.heave = record.angle;
  drawn.suplex = { ...record, tick: world.tick };
}

/**
 * Turns the canvas for drawing a body that is not carried this frame: a slammed body finishing
 * its arc, held head-down at the floor for the beat, then flopping flat; a carrier leaning back
 * into its throw. Returns true when it turned it (the caller restores).
 * `at`: the body's top-left as it will be drawn (screen px), when not where the simulation has it.
 */
export function poseFor(g: CanvasRenderingContext2D, world: World, content: Content, e: Entity, ox: number, oy: number, at?: { x: number; y: number }): boolean {
  const tb = boxOf(content, e);
  if (!tb) return false;
  const mine = heaves.get(e.id);
  if (mine) return slammed(g, world, content, mine, e, ox, oy, at ?? { x: ox + e.x, y: oy + e.y }, tb);
  // The carrier's lean: through the heave's second half, the slam and its hold; easing upright through the flop.
  for (const h of heaves.values()) {
    if (h.carrier !== e.id) continue;
    const k = leanOf(world, h);
    if (k <= 0) return false;
    const fx = Math.round(ox + e.x + tb.w / 2);
    const fy = Math.round(oy + e.y + tb.h);
    turnAbout(g, { x: fx, y: fy }, { x: fx, y: fy }, -h.dir * LEAN * k);
    return true;
  }
  return false;
}

function leanOf(world: World, h: Heave): number {
  if (h.slamAt === null) {
    const p = progress(h, world.tick - h.start);
    return p < 0.4 ? 0 : Math.min(1, (p - 0.4) / 0.5);
  }
  const since = world.tick - h.slamAt;
  const flopAt = CATCH + h.beat;
  if (since < flopAt) return 1;
  return Math.max(0, 1 - (since - flopAt) / FLOP);
}

function slammed(g: CanvasRenderingContext2D, world: World, content: Content, h: Heave, body: Entity, ox: number, oy: number, at: { x: number; y: number }, tb: { w: number; h: number }): boolean {
  const carrier = world.entities.find((o) => o.id === h.carrier);
  if (h.slamAt === null) {
    const hit = body.c.impact;
    // Let go with no new impact: broke free, set down, thrown. Not a suplex: draw it as it is.
    if (!hit || hit.tick === h.impact || !carrier) {
      heaves.delete(body.id);
      return false;
    }
    h.slamAt = world.tick;
    h.pAtSlam = progress(h, world.tick - h.start);
    h.end = arcEnd(content, h, carrier, body);
    const w = content.tuning.world;
    const share = Math.max(0, Math.min(1, hit.speed / (w.maxLaunchSpeed ?? 500)));
    h.beat = Math.max(HOLD_MIN, ticksOf((w.beatTime ?? 0) + ((w.beatMaxTime ?? 0) - (w.beatTime ?? 0)) * share));
    record.slamTick = world.tick;
    if (h.pressed) {
      const measured = world.tick - h.start - (h.length - pressLag(content));
      lag = Math.max(0, Math.min(90, lag === null ? measured : Math.round((lag + measured) / 2)));
    }
  }
  const since = world.tick - h.slamAt;
  const end = h.end;
  // INTENT: after the flop it stays drawn lying flat until it is back on the floor (the slam's bounce,
  // world.floorBounce), so it never stands up mid-bounce; LIE_MAX ticks at most.
  const lying = since > CATCH + h.beat + FLOP;
  if (!end || since < 0 || (lying && (since > CATCH + h.beat + FLOP + LIE_MAX || (body.onGround && !body.c.flying)))) {
    heaves.delete(body.id);
    return false;
  }
  const from = { x: at.x + tb.w / 2, y: at.y + tb.h / 2 };
  const endScreen = { x: ox + end.x, y: oy + end.y };
  // Finishing the arc when the slam came before the drawn body reached the floor.
  if (since < CATCH && h.pAtSlam < 1 && carrier) {
    const cb = boxOf(content, carrier);
    if (cb) {
      const feet = { x: ox + carrier.x + cb.w / 2, y: oy + carrier.y + cb.h };
      const hands = { x: feet.x, y: feet.y - cb.h - tb.h / 2 };
      const p = h.pAtSlam + ((1 - h.pAtSlam) * (since + 1)) / CATCH;
      const pose = arc(h, Math.min(1, p), feet, hands, endScreen);
      note(world, 'catch', p, pose.angle, h.length);
      turnAbout(g, from, pose, pose.angle);
      return true;
    }
  }
  const held = since - CATCH;
  if (held < h.beat) {
    // INTENT (push 4, ruling 2): head-down at the floor behind, held for the slam's beat.
    if (carrier) record.slamDx = Math.round(end.x - (carrier.x + (boxOf(content, carrier)?.w ?? 0) / 2));
    note(world, 'slam', 1, Math.PI, h.length);
    turnAbout(g, from, endScreen, -h.dir * Math.PI);
    return true;
  }
  // The flop: the turn carries on over (the legs fall away from the carrier) to lying flat, eased
  // onto where the simulation has the body, a lying body's middle half its width off the floor.
  const k = Math.min(1, (held - h.beat + 1) / FLOP);
  const angle = -h.dir * Math.PI * (1 + 0.5 * k);
  const to = { x: endScreen.x + (from.x - endScreen.x) * k, y: endScreen.y + (tb.h - tb.w) / 2 * k };
  note(world, lying ? 'lie' : 'flop', 1, angle, h.length);
  turnAbout(g, from, to, angle);
  return true;
}

/** The dust of every slam this page has seen land, along the floor. Call once a frame, after the bodies. */
export function drawSlams(g: CanvasRenderingContext2D, world: World, content: Content, roomId: string, ox: number, oy: number): void {
  for (const h of heaves.values()) {
    if (h.slamAt === null || !h.end) continue;
    const body = world.entities.find((o) => o.id === h.body);
    const tb = body && boxOf(content, body);
    if (!body || !tb || body.room !== roomId) continue;
    drawSlamDust(g, world.tick - h.slamAt, ox + h.end.x, oy + h.end.y + tb.h / 2, tb.w);
  }
  // The page's drawn record is made afresh each frame: the last suplex drawn stays on it.
  const drawn = debug()?.drawn;
  if (drawn && record.heaveTick !== null && !drawn.suplex) drawn.suplex = { ...record, tick: world.tick };
}
