// Step 5, brief camera-looks-at-what-matters (docs/mechanisms/rendering-world.md,
// "The camera leans up"). The page's own camera, on top of roomOrigin
// (draw/room.ts), which still decides where it rests: in a room taller than the
// picture it leans upward, easing,
// - while a thrower in the room aims (c.rangedAim, src/sim/ranged.ts): far
//   enough to show him, his shot held up and the top of his arc;
// - while the hero climbs (rises) or stands holding the stick up: far enough
//   that the hero stands low, just above the touch controls, and the rest of
//   the picture is what is above.
// It never moves the hero off the picture or under a touch control: while
// something is aimed, the feet may go into the controls' band only where no
// control is beside them (aimGround of ground kept); otherwise the controls'
// height is kept, as roomOrigin keeps it.
// INTENT: drawing only, each page its own (two players share one world, each
// with their own view); the simulation never reads it.
// INTENT (the brief's "whole pixels only: no blur"): the lean eases in
// fractions but is drawn rounded to a whole game pixel.
// If a thrower so shown would stand under the party plate (screen furniture
// over the picture's top-left), the camera also slides sideways, as far as
// the room's edges allow with the hero still inside the picture.
// DRAFT: the rule and every number (content/camera.json; docs/decisions-log.md,
// 2026-11-24, "Sideways, the camera looks up at what is aimed at you"). It
// leans for a ranged aim only, and sideways only to clear the plate: a thrower
// beside the picture is not brought into it.
import type { Camera } from '../content/kinds/camera.ts';
import type { Content } from '../content/types.ts';
import { shotArc } from '../sim/ranged.ts';
import type { Entity, World } from '../sim/types.ts';

/** A touch control over the picture, game px of the view (x, y its top-left). */
export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** What one frame's lean is worked out from. Positions are room px; the view's are game px. */
export interface LeanIn {
  cfg: Camera;
  room: string;
  /** The room's height, px. */
  roomH: number;
  viewW: number;
  viewH: number;
  /** The touch controls' band at the view's bottom (view.reserve). */
  reserve: number;
  /** The room's width, px. */
  roomW: number;
  /** Where roomOrigin rests the camera: the room y at the view's top, and the room x at its left. */
  baseY: number;
  baseX: number;
  /** The page's own hero: left, width, top, feet (room px); vy (px/s, negative rising); on the ground. */
  hero: { x: number; w: number; top: number; feet: number; vy: number; onGround: boolean };
  /** The stick, -1 up to 1 down. */
  stickY: number;
  /** Each aiming thrower in the room: his left, right, head (room px) and the highest point of his arc. */
  aims: { left: number; right: number; head: number; feet: number; arcTop: number; arcLeft: number; arcRight: number }[];
  controls: Box[];
  /** Screen furniture drawn over the top of the picture (the party plate), game px of the view. */
  covers: Box[];
  /** Seconds. */
  now: number;
}

/** What the camera did this frame (window.irreverents.drawn.lean, for the checks). */
export interface Lean {
  /** The room x and y at the view's top-left as drawn. */
  x: number;
  y: number;
  /** How far above and how far beside where roomOrigin rests it, px. */
  lift: number;
  shift: number;
  /** Why: what it was leaning toward this frame. */
  why: 'none' | 'aim' | 'look';
}

interface State {
  room: string;
  lift: number;
  shift: number;
  at: number;
  stickSince: number | null;
  lookUntil: number;
  /** The aims last seen, kept for aimHold after they end (his shot is still in the air). */
  aims: LeanIn['aims'];
  aimUntil: number;
}
const fresh = (): State => ({ room: '', lift: 0, shift: 0, at: 0, stickSince: null, lookUntil: -1, aims: [], aimUntil: -1 });
let state: State = fresh();
let last: Lean = { x: 0, y: 0, lift: 0, shift: 0, why: 'none' };
/** The last frame's lean (window.irreverents.drawn.lean). */
export function lastLean(): Lean {
  return last;
}

/** The e2e fact's control (scripts/e2e/camera.ts): `off` draws the camera where roomOrigin rests it, as before Step 5's lean. Nothing in the game sets it. */
export const leanControl = { off: false };

/** Forgets the lean (tests). */
export function resetLean(): void {
  state = fresh();
}

/**
 * The lowest room y the view's top may take (the highest the camera may go)
 * with the view's left at room x `camX`, keeping the hero's feet on the
 * picture and clear of every touch control: `ground` px under the feet where
 * no control in the picture's lower half is beside the hero, else above the
 * tops of those beside him.
 */
function heroLimit(i: LeanIn, camX: number, ground: number): number {
  const left = i.hero.x - camX;
  const right = left + i.hero.w;
  let bottom = i.viewH - ground;
  for (const c of i.controls) if (c.x < right && c.x + c.w > left && c.y > i.viewH / 2 && c.y < i.viewH) bottom = Math.min(bottom, c.y - 1);
  return Math.ceil(i.hero.feet - bottom);
}

/** Eases `from` toward `to` over `dt` seconds (content/camera.json easeRate, maxSpeed). */
function ease(c: Camera, from: number, to: number, dt: number): number {
  const step = (to - from) * (1 - Math.exp(-c.easeRate * dt));
  const most = c.maxSpeed * dt;
  const v = from + Math.max(-most, Math.min(most, step));
  return Math.abs(to - v) < 0.5 ? to : v;
}

/** Where the view's top wants to be with its left at `camX`, and why. */
function wantY(i: LeanIn, camX: number, looking: boolean): { y: number; why: Lean['why']; aim: LeanIn['aims'][number] | null } {
  const c = i.cfg;
  let y = i.baseY;
  let why: Lean['why'] = 'none';
  let aim: LeanIn['aims'][number] | null = null;
  if (i.roomH <= i.viewH) return { y, why, aim };
  if (looking) {
    const v = Math.max(0, heroLimit(i, camX, i.reserve + c.lookGround), Math.ceil(i.hero.feet + i.reserve + c.lookGround - i.viewH));
    if (v < y) {
      y = v;
      why = 'look';
    }
  }
  for (const a of i.aims) {
    // Only one the picture shows across: him or where his arc goes.
    if (!((a.right > camX && a.left < camX + i.viewW) || (a.arcRight > camX && a.arcLeft < camX + i.viewW))) continue;
    const top = Math.floor(Math.min(a.head - c.aimAbove, a.arcTop - c.aimMargin));
    const v = Math.max(0, heroLimit(i, camX, c.aimGround), top);
    if (v < y || (why === 'aim' && v === y)) {
      y = v;
      why = 'aim';
      aim = a;
    }
  }
  return { y, why, aim };
}

/**
 * How much of an aiming thrower (his body and his shot held up over it) a
 * view at `x`, `y` shows: in the picture and not under the screen furniture,
 * px².
 */
function shown(i: LeanIn, x: number, y: number, a: LeanIn['aims'][number]): number {
  const top = a.head - i.cfg.aimAbove - y;
  const bottom = a.feet - y;
  const left = a.left - x;
  const right = a.right - x;
  const span = (l0: number, l1: number, r0: number, r1: number): number => Math.max(0, Math.min(l1, r1) - Math.max(l0, r0));
  const vw = span(left, right, 0, i.viewW);
  const vh = span(top, bottom, 0, i.viewH);
  let seen = vw * vh;
  // The covers are taken as not overlapping one another (the plate alone, today).
  for (const c of i.covers) seen -= span(Math.max(left, 0), Math.min(right, i.viewW), c.x, c.x + c.w) * span(Math.max(top, 0), Math.min(bottom, i.viewH), c.y, c.y + c.h);
  return seen;
}

/**
 * Where the view's left and top want to be for an aim: of the lefts between
 * where it rests and the room's edge on each side (with the hero still
 * `heroSide` px inside the picture), the one that shows most of him (not
 * under the party plate, not off the top), then the least slide.
 * DRAFT: a scan of every whole pixel, no further than his width and the
 * widest cover's: a few hundred cheap tries, only while he is partly hidden.
 */
function aimView(i: LeanIn, looking: boolean, first: { y: number; why: Lean['why']; aim: LeanIn['aims'][number] | null }): { x: number; y: number; why: Lean['why'] } {
  const a = first.aim;
  if (!a || i.covers.length === 0 || i.roomW <= i.viewW) return { x: i.baseX, ...first };
  const c = i.cfg;
  const maxX = Math.max(0, i.roomW - i.viewW);
  let best = { x: i.baseX, y: first.y, why: first.why };
  let bestSeen = shown(i, i.baseX, first.y, a);
  const full = (a.right - a.left) * (a.feet - a.head + c.aimAbove);
  if (bestSeen >= full) return best;
  const lo = Math.max(0, Math.ceil(i.hero.x + i.hero.w + c.heroSide - i.viewW));
  const hi = Math.min(maxX, Math.floor(i.hero.x - c.heroSide));
  // No slide further than it takes to bring him clear of the widest cover helps.
  const far = Math.min(maxX, Math.ceil(a.right - a.left + Math.max(...i.covers.map((k) => k.w)) + c.aimMargin));
  for (let d = 1; d <= far; d++) {
    for (const x of [i.baseX - d, i.baseX + d]) {
      if (x < lo || x > hi) continue;
      const w = wantY(i, x, looking);
      if (w.why !== 'aim') continue;
      const seen = shown(i, x, w.y, a);
      if (seen > bestSeen) [best, bestSeen] = [{ x, y: w.y, why: w.why }, seen];
    }
  }
  return best;
}

/** One frame: the room position at the view's top-left. Call once per drawn frame. */
export function lean(input: LeanIn): Lean {
  let i = input;
  if (leanControl.off) return (last = { x: i.baseX, y: i.baseY, lift: 0, shift: 0, why: 'none' });
  const c = i.cfg;
  if (state.room !== i.room) state = { ...fresh(), room: i.room, at: i.now };
  const dt = Math.max(0, Math.min(0.1, i.now - state.at));
  state.at = i.now;
  // Looking up: the stick held up while standing, or rising.
  const up = i.stickY < -0.5 && i.hero.onGround;
  if (up) state.stickSince ??= i.now;
  else state.stickSince = null;
  if ((state.stickSince !== null && i.now - state.stickSince >= c.lookStickAfter) || i.hero.vy < -c.riseSpeed) state.lookUntil = i.now + c.lookHold;
  const looking = i.now < state.lookUntil;
  // An aim is leant toward for aimHold after it ends, so the picture holds while his shot flies and between his throws.
  if (i.aims.length > 0) {
    state.aims = i.aims;
    state.aimUntil = i.now + c.aimHold;
  } else if (i.now < state.aimUntil) i = { ...i, aims: state.aims };
  // Up first; then aside, if a thrower so shown would be under the plate (aimView).
  const want = aimView(i, looking, wantY(i, i.baseX, looking));
  const toX = want.x;
  // Ease how far above and beside the resting place it is.
  state.lift = ease(c, state.lift, Math.max(0, i.baseY - want.y), dt);
  state.shift = ease(c, state.shift, toX - i.baseX, dt);
  // Whole pixels; never past the room's edges, never past what keeps the hero clear (a hero falling while lifted is followed at once).
  const maxX = Math.max(0, i.roomW - i.viewW);
  const x = i.roomW <= i.viewW ? i.baseX : Math.max(0, Math.min(maxX, i.baseX + Math.round(state.shift)));
  let y = i.baseY - Math.round(state.lift);
  const hard = Math.max(0, heroLimit(i, x, Math.min(c.aimGround, i.reserve + c.lookGround)));
  if (y < hard) {
    y = Math.min(i.baseY, hard);
    state.lift = i.baseY - y;
  }
  last = { x, y, lift: i.baseY - y, shift: x - i.baseX, why: want.why };
  return last;
}

/** An aiming thrower, as `lean` reads him: his body and his arc's extent. */
export function aimsIn(world: World, content: Content, roomId: string): LeanIn['aims'] {
  const out: LeanIn['aims'] = [];
  for (const e of world.entities as Entity[]) {
    if (!e.c.rangedAim || e.room !== roomId) continue;
    const box = content.characters[e.kind]?.box ?? { w: 16, h: 16 };
    const pts = shotArc(content, world, e, 3);
    let arcTop = e.y;
    let arcLeft = e.x;
    let arcRight = e.x + box.w;
    for (const p of pts) {
      arcTop = Math.min(arcTop, p.y);
      arcLeft = Math.min(arcLeft, p.x);
      arcRight = Math.max(arcRight, p.x);
    }
    out.push({ left: e.x, right: e.x + box.w, head: e.y, feet: e.y + box.h, arcTop, arcLeft, arcRight });
  }
  return out;
}

let boxes: Box[] = [];
let boxesKey = '';
let boxesAt = -1;
/**
 * The touch controls that sit over the picture, in game px. Read from the
 * page's own layout (the shell places them; nothing here moves them), again
 * when the view changes and at most twice a second otherwise.
 */
export function controlBoxes(viewW: number, viewH: number, now: number): Box[] {
  const key = `${viewW}x${viewH}:${window.innerWidth}x${window.innerHeight}`;
  if (key === boxesKey && now - boxesAt < 0.5) return boxes;
  boxesKey = key;
  boxesAt = now;
  const canvas = document.getElementById('game');
  if (!canvas) return (boxes = []);
  const r = canvas.getBoundingClientRect();
  if (r.width <= 0 || r.height <= 0) return (boxes = []);
  const sx = viewW / r.width;
  const sy = viewH / r.height;
  const out: Box[] = [];
  for (const el of document.querySelectorAll<HTMLElement>('[data-stick], [data-action]')) {
    const b = el.getBoundingClientRect();
    if (b.width <= 0 || b.height <= 0 || b.bottom <= r.top || b.top >= r.bottom || b.right <= r.left || b.left >= r.right) continue;
    out.push({ x: (b.left - r.left) * sx, y: (b.top - r.top) * sy, w: b.width * sx, h: b.height * sy });
  }
  return (boxes = out);
}
