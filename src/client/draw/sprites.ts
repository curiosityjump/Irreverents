import type { Content } from '../../content/types.ts';
import type { Entity, World } from '../../sim/types.ts';
import { image } from './images.ts';

// The actor side of the art contract (docs/mechanisms/art-pipeline.md,
// "Characters and things"): which animation state a body is in, which
// frames that state plays, and juice (squash, stretch, flash, tint) that
// never moves where a body is. Notes: docs/mechanisms/rendering-actors.md.

/** Every state the contract names. */
export type AnimState =
  | 'idle' | 'run' | 'air' | 'jump' | 'fall' | 'flap' | 'attack' | 'grab' | 'carry' | 'carryRun'
  | 'throw' | 'hurt' | 'down' | 'held' | 'hide' | 'talk' | 'tumble';

/** The sprite file as the contract writes it (src/content/kinds/sprites.ts parses it; optional parts read defensively). */
interface SheetFile {
  id: string;
  image: string;
  cell: { w: number; h: number };
  anchor: { x: number; y: number };
  fps: number;
  frames: Partial<Record<AnimState, number[]>> & { idle: number[]; run: number[]; air: number[] };
  fpsBy?: Partial<Record<AnimState, number>>;
  moods?: Record<string, Partial<Record<AnimState, number[]>>>;
  carryAt?: { x: number; y: number } | null;
  /** Round 3: a carry point per state (carry, carryRun, throw); a state with none uses carryAt. */
  carryAtBy?: Partial<Record<'carry' | 'carryRun' | 'throw', { x: number; y: number }>>;
}

/**
 * The contract's fallbacks, in order: a state missing from the sheet uses
 * the next name that is there. `carry` with no frames uses run or idle by
 * whether the body moves (handled in framesFor).
 */
const CHAIN: Record<AnimState, AnimState[]> = {
  idle: ['idle'],
  run: ['run'],
  air: ['air'],
  jump: ['jump', 'air'],
  fall: ['fall', 'air'],
  flap: ['flap', 'air'],
  attack: ['attack', 'idle'],
  // INTENT (round 3, gap 5): a throw is never drawn as the attack strip (the punch pose while
  // carrying was the stutter); with no throw frames it is the carry pose.
  throw: ['throw', 'carry', 'idle'],
  grab: ['grab', 'idle'],
  carry: ['carry'],
  carryRun: ['carryRun', 'carry'],
  hurt: ['hurt', 'idle'],
  down: ['down', 'hurt', 'idle'],
  held: ['held', 'hurt', 'air'],
  hide: ['hide', 'idle'],
  talk: ['talk', 'idle'],
  // Round 3 (the contract): with no tumble frames, the hurt frame turned in quarter turns (drawSprite).
  tumble: ['tumble', 'held', 'hurt', 'air'],
};

/** INTENT (the contract): these play once from when they start and hold their last frame; every other state loops. */
const ONCE: ReadonlySet<AnimState> = new Set(['attack', 'grab', 'throw', 'hurt']);

/** Below this speed (pixels per second) a body on the ground is standing, as before. */
const MOVING = 1;
/** DRAFT: how long a grab or a throw shows when the sheet has no frames to time it by (ticks). */
const ONCE_TICKS = 12;
/** DRAFT: squash after landing and stretch after leaving the ground, in ticks. */
const SQUASH_TICKS = 6;
const STRETCH_TICKS = 6;
/** DRAFT (round 2): the white flash on being hit, in ticks, and only for a strong hit (impact speed, px/s). */
const FLASH_TICKS = 2;
const FLASH_SPEED = 250;
/** DRAFT (round 2): the red flash when a person with drawn rage frames becomes enraged, in ticks. */
const RAGE_FLASH_TICKS = 4;
/** DRAFT (round 3): a flying body faster than this (px/s) tumbles; slower, it is hurt. */
const TUMBLE_SPEED = 220;
/** DRAFT (round 3): a body that flew lies `down` this long after it lands, while it stays still (ticks). */
const DOWN_TICKS = 24;
/** DRAFT (round 3): a turned hurt frame (no tumble frames) turns a quarter every this many ticks. */
const TUMBLE_TURN_TICKS = 4;

/**
 * What this page remembers about each body between frames, to time the
 * states the simulation does not stamp with a tick (landing, leaving the
 * ground, starting a grab or a throw, a flap). Everything is kept in world
 * ticks, so two screens differ only by when the news reached them.
 * DRAFT: see "Flags for the lead" in docs/mechanisms/rendering-actors.md.
 */
interface Memory {
  tick: number;
  onGround: boolean;
  carrying: string | null;
  flaps: number;
  landed: number;
  left: number;
  grabbed: number;
  threw: number;
  flapped: number;
  /** The last swing seen (attack.swung), and whether this body was carrying then: that swing is a throw. */
  swing: number;
  swingThrew: boolean;
  /**
   * Round 3 (gap 13): the swing's phase last seen, and whether the wind-up now running began
   * while carrying. On a player's own page a throw press starts a wind-up (the page never
   * learns it carries); that wind-up is the throw, and so is the strike it ends in, even if
   * the server's release has arrived by then.
   */
  phase: string;
  windThrew: boolean;
  /** Round 3: the grab button last seen down, the tick of the last fresh press made while not carrying, whether the body was flying, and the tick it stopped. */
  grabHeld: boolean;
  grabPress: number;
  flying: boolean;
  flewEnd: number;
  /** The person's mood last seen, and the tick it became 3 (enraged). */
  mood: number;
  raged: number;
}
const memory = new Map<string, Memory>();

/**
 * What a body is carrying: its own `carrying`, or else a body that says it
 * is held by this one. INTENT: the second half is needed: a player's own
 * character is simulated on their page, which never learns it carries
 * (the server does the hold); the carried body's copy says who holds it.
 */
export function carriedBy(world: World, e: Entity): string | null {
  if (e.c.carrying) return e.c.carrying.id;
  for (const o of world.entities) if (o.c.effect?.heldBy === e.id) return o.id;
  return null;
}

/** Updates one body's memory for this tick and returns it. Call once per body per frame. */
export function remember(world: World, e: Entity): Memory {
  let m = memory.get(e.id);
  const carrying = carriedBy(world, e);
  const flaps = e.c.flap?.used ?? 0;
  if (!m || world.tick < m.tick - 600) {
    // First sight (or the world restarted): nothing has just happened.
    m = { tick: world.tick, onGround: e.onGround, carrying, flaps, landed: -1e9, left: -1e9, grabbed: -1e9, threw: -1e9, flapped: -1e9, swing: e.c.attack?.swung ?? -1e9, swingThrew: false, phase: e.c.attack?.phase ?? 'ready', windThrew: false, grabHeld: e.c.grab?.held ?? false, grabPress: -1e9, flying: !!e.c.flying, flewEnd: -1e9, mood: e.c.npc?.mood ?? 1, raged: -1e9 };
    memory.set(e.id, m);
    return stamped(e, m);
  }
  if (world.tick !== m.tick) {
    const swung = e.c.attack?.swung ?? -1e9;
    const phase = e.c.attack?.phase ?? 'ready';
    if (phase === 'windup' && m.phase !== 'windup') {
      m.windThrew = m.carrying !== null || carrying !== null;
      // INTENT (round 3): the throw is drawn from the press, not from the server's release.
      if (m.windThrew) m.threw = world.tick;
    } else if (phase === 'ready') m.windThrew = false;
    m.phase = phase;
    if (swung !== m.swing) {
      // INTENT: a player's own page predicts a plain swing when the
      // attack button throws (it never learns it carries; see carriedBy):
      // a swing made while carrying is drawn as the throw it is.
      m.swing = swung;
      m.swingThrew = m.carrying !== null || carrying !== null || m.windThrew;
      if (m.swingThrew && !m.windThrew) m.threw = swung;
    }
    // Round 3: the grab press itself (a player's own page never learns it caught anything until
    // the server says so): the grab plays from the press, and a catch that follows continues it.
    const grabHeld = e.c.grab?.held ?? false;
    if (grabHeld && !m.grabHeld && !carrying && !m.carrying) m.grabPress = world.tick;
    m.grabHeld = grabHeld;
    if (m.flying && !e.c.flying) m.flewEnd = world.tick;
    m.flying = !!e.c.flying;
    if (e.onGround && !m.onGround) m.landed = world.tick;
    if (!e.onGround && m.onGround && e.vy < 0) m.left = world.tick;
    if (carrying && carrying !== m.carrying) m.grabbed = world.tick - m.grabPress < 40 ? m.grabPress : world.tick;
    if (!carrying && m.carrying) {
      // Let go while the body flies off from us: that was a throw (attack.ts
      // stamps no tick for one). Set down or dropped is not.
      const was = world.entities.find((o) => o.id === m!.carrying);
      if (was?.c.flying?.by === e.id && world.tick - m.threw > 20) m.threw = world.tick;
    }
    if (flaps > m.flaps) m.flapped = world.tick;
    const mood = e.c.npc?.mood ?? 1;
    if (mood === 3 && m.mood !== 3) m.raged = world.tick;
    m.mood = mood;
    m.tick = world.tick;
    m.onGround = e.onGround;
    m.carrying = carrying;
    m.flaps = flaps;
  }
  return stamped(e, m);
}

/**
 * Round 2: where the simulation stamps when something began (Step 2's feel
 * push, docs/mechanisms/combat-and-impact.md), that tick is used instead of
 * the moment this page first saw it, so two screens time it alike. Each
 * stamp is taken only when it is newer than what the page saw, so a stale
 * one never restarts an old animation.
 */
function stamped(e: Entity, m: Memory): Memory {
  const newer = (stamp: number | undefined, seen: number): number => (stamp !== undefined && stamp > seen - 30 ? stamp : seen);
  m.landed = newer(e.c.landing?.tick, m.landed);
  if (e.vy < 0) m.left = newer(e.c.airborne?.since, m.left);
  if (m.carrying) m.grabbed = newer(e.c.grab?.at, m.grabbed);
  m.threw = newer(e.c.lastThrow?.tick, m.threw);
  m.flapped = newer(e.c.flap?.at, m.flapped);
  return m;
}

/** Whether a person is in the first ticks of rage (a short red flash for a sheet that draws its own rage). */
export function rageFlash(world: World, e: Entity): boolean {
  const m = memory.get(e.id);
  return !!m && world.tick - m.raged >= 0 && world.tick - m.raged < RAGE_FLASH_TICKS;
}

/** Whether this body's latest swing was really a throw (no slash for it). */
export function swingWasThrow(e: Entity): boolean {
  return memory.get(e.id)?.swingThrew ?? false;
}

/** Forgets bodies not seen for a while, so the memory never grows. Call once per frame. */
export function forget(world: World): void {
  if (memory.size < 64) return;
  for (const [id, m] of memory) if (world.tick - m.tick > 600) memory.delete(id);
}

/** Out cold and drawn lying: flattened, and no longer in the held beat or the flight of the blow that did it. */
export function lyingOut(e: Entity): boolean {
  return !!e.c.flattened && !e.c.flying && !e.c.beat;
}

/**
 * Which state a body is in, and the world tick it began (for play-once
 * states; loops use 0). The table of which fact selects which state is in
 * docs/mechanisms/rendering-actors.md.
 */
export function stateOf(world: World, e: Entity, m: Memory, onceTicks: (s: AnimState) => number): { state: AnimState; since: number } {
  const t = world.tick;
  // INTENT (Step 5, the owner playing: "When an enemy gets knocked out, they collapse, then randomly
  // fly off the screen. Very weird"): the blow that knocks a body out also launches it (verbs/attack.ts:
  // wear and launch on one hit), so it is drawn taking the blow (its beat) and flying (hurt, tumble)
  // like any other hit, and lies `down` only once the flight is over. Drawn `down` from the blow, the
  // knockback read as a collapsed body sliding off the screen for no reason.
  if (lyingOut(e)) return { state: 'down', since: 0 };
  if (e.c.effect?.heldBy) return { state: 'held', since: 0 };
  if (e.c.flying && !e.c.beat && Math.hypot(e.vx, e.vy) > TUMBLE_SPEED) return { state: 'tumble', since: e.c.impact && t - e.c.impact.tick < 120 ? e.c.impact.tick : m.tick };
  if (e.c.flying || e.c.beat || e.c.stunned) return { state: 'hurt', since: e.c.impact && t - e.c.impact.tick < 120 ? e.c.impact.tick : m.tick };
  if (t - m.threw < onceTicks('throw')) return { state: 'throw', since: m.threw };
  const swung = e.c.attack?.swung ?? -1e9;
  // Round 2: the swing's own phase (Step 2 stamps it), so the wind-up is drawn too; drawSprite
  // picks the frame by phase. A wind-up is never a throw (a throw has none).
  const phase = e.c.attack?.phase;
  // Round 3 (gap 13): a wind-up while carrying is the throw (handled above), never an attack.
  if ((phase === 'windup' && !m.carrying && !m.windThrew) || ((phase === 'strike' || phase === 'recover') && !m.swingThrew && !m.windThrew)) return { state: 'attack', since: swung };
  if (phase === undefined && !m.swingThrew && t - swung >= 0 && t - swung < onceTicks('attack')) return { state: 'attack', since: swung };
  const moving = Math.abs(e.vx) > MOVING;
  // Round 3: a body that flew lies down a moment where it landed (cut short when it moves).
  if (!m.carrying && e.onGround && !moving && t - m.flewEnd >= 0 && t - m.flewEnd < DOWN_TICKS) return { state: 'down', since: m.flewEnd };
  if (!m.carrying && t - m.grabPress >= 0 && t - m.grabPress < onceTicks('grab')) return { state: 'grab', since: m.grabPress };
  if (m.carrying) {
    if (t - m.grabbed < onceTicks('grab')) return { state: 'grab', since: m.grabbed };
    return { state: moving && e.onGround ? 'carryRun' : 'carry', since: 0 };
  }
  if (!e.onGround) {
    if (e.c.flap && e.c.flap.used > 0 && e.vy < 0 && t - m.flapped < 30) return { state: 'flap', since: 0 };
    return { state: e.vy < 0 ? 'jump' : 'fall', since: 0 };
  }
  if (moving) return { state: 'run', since: 0 };
  if (e.c.roomHide) return { state: 'hide', since: 0 };
  if (e.c.npc?.bark || e.c.audience) return { state: 'talk', since: 0 };
  return { state: 'idle', since: 0 };
}

/** The frame list a state plays on this sheet, after moods and the contract's fallbacks; and which state's numbers (fpsBy) time it. */
function framesFor(sheet: SheetFile, state: AnimState, mood: number, moving: boolean): { list: number[]; as: AnimState } {
  const byMood = mood > 1 ? sheet.moods?.[String(mood)] : undefined;
  const chain = state === 'carry' || state === 'carryRun' ? [...CHAIN[state], moving ? 'run' : 'idle'] as AnimState[] : CHAIN[state];
  for (const name of chain) {
    const list = byMood?.[name] ?? sheet.frames[name];
    if (list && list.length > 0) return { list, as: name };
  }
  return { list: sheet.frames.idle, as: 'idle' };
}

function fpsOf(sheet: SheetFile, s: AnimState): number {
  const f = sheet.fpsBy?.[s] ?? sheet.fps;
  return f > 0 ? f : 8;
}

/** How long a play-once state lasts on this sheet, in ticks: its frames at its speed. */
function onceTicksOn(sheet: SheetFile | undefined, s: AnimState, mood: number): number {
  if (!sheet) return s === 'attack' ? 7 : ONCE_TICKS;
  const { list, as } = framesFor(sheet, s, mood, false);
  if (as !== s) return s === 'attack' ? 7 : ONCE_TICKS;
  return Math.max(4, Math.round((list.length * 60) / fpsOf(sheet, as)));
}

/** A body's sheet, image and kind, or null when it is drawn as its rectangle. */
export function sheetOf(content: Content, e: Entity): { sheet: SheetFile; img: HTMLImageElement } | null {
  const kind = content.characters[e.kind];
  const sheet = kind ? (content.sprites[kind.id] as SheetFile | undefined) : undefined;
  const img = sheet ? image(sheet.image) : null;
  return sheet && img ? { sheet, img } : null;
}

/** How a sprite body is drawn this frame: set by entities.ts. */
export interface SpriteLook {
  /** 0..1 dimming (away). */
  alpha: number;
  /** A tint over the sprite's own pixels, or null. */
  tint: { color: string; amount: number } | null;
  /** Round 3: a state this page shows ahead of the world (a hit it predicts on its own swing), and when it began. */
  pose?: { state: AnimState; since: number };
  /** Round 3: the white hit flash, asked for by the page's own prediction. */
  flash?: boolean;
}

/** Offscreen canvases of tinted frames, made once each (no per-frame allocation). */
const tinted = new Map<string, HTMLCanvasElement>();
function tintedFrame(img: HTMLImageElement, sx: number, sy: number, w: number, h: number, color: string, amount: number): HTMLCanvasElement {
  const key = `${img.src}|${sx},${sy},${w},${h}|${color}|${amount}`;
  let c = tinted.get(key);
  if (!c) {
    c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const g = c.getContext('2d')!;
    g.imageSmoothingEnabled = false;
    g.drawImage(img, sx, sy, w, h, 0, 0, w, h);
    g.globalCompositeOperation = 'source-atop';
    g.globalAlpha = amount;
    g.fillStyle = color;
    g.fillRect(0, 0, w, h);
    if (tinted.size > 512) tinted.clear();
    tinted.set(key, c);
  }
  return c;
}

/**
 * Round 3: the first row of a frame with any opaque pixel, measured once per frame and cached
 * (0 when it cannot be read). Overlays sit on the picture, not on the cell's empty headroom.
 */
const opaque = new Map<string, number>();
function opaqueTop(img: HTMLImageElement, sx: number, sy: number, w: number, h: number): number {
  const key = `${img.src}|${sx},${sy}`;
  const known = opaque.get(key);
  if (known !== undefined) return known;
  let row = 0;
  try {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const g = c.getContext('2d', { willReadFrequently: true })!;
    g.drawImage(img, sx, sy, w, h, 0, 0, w, h);
    const data = g.getImageData(0, 0, w, h).data;
    row = h;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i]! > 0) {
        row = Math.floor((i - 3) / 4 / w);
        break;
      }
    }
    if (row >= h) row = 0;
  } catch {
    row = 0;
  }
  if (opaque.size > 2048) opaque.clear();
  opaque.set(key, row);
  return row;
}

/** Facts the caller may want after drawing: where the top of the picture is (for marks over the head). */
export interface Drew {
  state: AnimState;
  /** Screen y of the picture's top edge, after squash/stretch. */
  top: number;
  /** Round 3: screen y of the frame's first non-transparent row (the top of the hat or plume), after squash/stretch. */
  head: number;
  /** Round 2: the screen point where a carried body's bottom-centre sits (the sheet's carryAt), when it has one. */
  hold?: { x: number; y: number };
  /** Round 3: during `grab`, how far the heave has come (0 at the press, 1 when the load is up): the caller eases the load from where it is to `hold`. */
  heave?: number;
}

/**
 * INTENT: art replaces rectangles as DATA. A character kind with a file in
 * content/sprites/ (named after the kind) is drawn from that sheet; one
 * without keeps its graybox box. Returns what it drew, or null when it did
 * not draw (docs/architecture.md, "Where art plugs in").
 * INTENT: juice never moves a body. Squash and stretch scale the picture
 * about the middle of the box's bottom edge; the box (and PlayerView.drawn)
 * stays where the simulation put it.
 */
export function drawSprite(g: CanvasRenderingContext2D, world: World, content: Content, e: Entity, x: number, y: number, look: SpriteLook): Drew | null {
  const kind = content.characters[e.kind];
  const found = sheetOf(content, e);
  if (!kind || !found) return null;
  const { sheet, img } = found;
  const mood = e.c.npc?.mood ?? 1;
  const m = remember(world, e);
  const { state, since } = look.pose ?? stateOf(world, e, m, (s) => onceTicksOn(sheet, s, mood));
  const moving = Math.abs(e.vx) > MOVING;
  const { list, as } = framesFor(sheet, state, mood, moving);
  const fps = fpsOf(sheet, as);
  const t = world.tick;
  const step = Math.floor(((ONCE.has(state) ? t - since : t) * fps) / 60);
  let f = ONCE.has(state) ? list[Math.max(0, Math.min(list.length - 1, step))]! : list[((step % list.length) + list.length) % list.length]!;
  // Round 2: an attack strip drawn by the swing's phase (the contract: wind-up, strike, recovery):
  // the first frame while winding up, the next while striking (the one after for the strike's
  // second half on a strip of 4 or more), the last while recovering.
  const phase = e.c.attack?.phase;
  if (state === 'attack' && as === 'attack' && (phase === 'windup' || phase === 'strike' || phase === 'recover')) {
    const n = list.length;
    const left = e.c.attack?.left ?? 0;
    const idx = phase === 'windup' ? 0 : phase === 'recover' ? n - 1 : Math.min(n - 1, n >= 4 && left <= 2 ? 2 : 1);
    f = list[Math.max(0, idx)]!;
  }
  const cols = Math.max(1, Math.floor(img.naturalWidth / sheet.cell.w));
  const sx = (f % cols) * sheet.cell.w;
  const sy = Math.floor(f / cols) * sheet.cell.h;
  const { w: cw, h: ch } = sheet.cell;

  // Squash on landing, stretch on take-off: whole pixels of the cell, about the feet.
  let sqx = 0;
  let sqy = 0;
  const sinceLand = t - m.landed;
  const sinceLeft = t - m.left;
  if (state !== 'down' && state !== 'held') {
    if (sinceLand >= 0 && sinceLand < SQUASH_TICKS && e.onGround) {
      const k = 1 - sinceLand / SQUASH_TICKS;
      sqy = -Math.round(ch * 0.14 * k);
      sqx = Math.round(cw * 0.1 * k);
    } else if (sinceLeft >= 0 && sinceLeft < STRETCH_TICKS && !e.onGround) {
      const k = 1 - sinceLeft / STRETCH_TICKS;
      sqy = Math.round(ch * 0.12 * k);
      sqx = -Math.round(cw * 0.08 * k);
    }
  }
  const dw = cw + 2 * Math.round(sqx / 2);
  const dh = ch + sqy;
  // The feet: the box's bottom edge, at the box's middle.
  const footX = x + kind.box.w / 2;
  const footY = y + kind.box.h;
  // Where the cell's own feet-middle sits inside the cell.
  const ax = sheet.anchor.x + kind.box.w / 2;
  const ay = sheet.anchor.y + kind.box.h;
  const scaleX = dw / cw;
  const scaleY = dh / ch;
  const left = Math.round(e.facing < 0 ? footX - (cw - ax) * scaleX : footX - ax * scaleX);
  const top = Math.round(footY - ay * scaleY);

  // A white flash on the ticks right after a strong hit; else the tint asked for.
  const hitAge = e.c.impact ? t - e.c.impact.tick : 1e9;
  // DRAFT (brief page-misses-what-happened, push 2; docs/decisions-log.md): every landed blow on a hero
  // flashes, however light (a grappler's shot is 200 px/s, under FLASH_SPEED): being hit must show (D-020).
  const strong = (e.c.impact?.speed ?? 0) >= FLASH_SPEED || (e.player !== null && !!e.c.impact);
  const tint = look.flash || (strong && hitAge >= 0 && hitAge < FLASH_TICKS) ? { color: '#ffffff', amount: 1 } : look.tint;
  const src: CanvasImageSource = tint ? tintedFrame(img, sx, sy, cw, ch, tint.color, tint.amount) : img;
  const ox = tint ? 0 : sx;
  const oy = tint ? 0 : sy;

  g.save();
  if (look.alpha < 1) g.globalAlpha = look.alpha;
  // Round 3 (the contract): a tumble with no frames of its own turns its frame in quarter turns
  // about the middle of the box, the way it flies.
  const turns = state === 'tumble' && as !== 'tumble' ? Math.floor(Math.max(0, t - since) / TUMBLE_TURN_TICKS) % 4 : 0;
  if (turns) {
    const mx = Math.round(footX);
    const my = Math.round(y + kind.box.h / 2);
    g.translate(mx, my);
    g.rotate(((e.facing < 0 ? -turns : turns) * Math.PI) / 2);
    g.translate(-mx, -my);
  }
  if (e.facing < 0) {
    g.translate(left + dw, top);
    g.scale(-1, 1);
  } else g.translate(left, top);
  g.drawImage(src, ox, oy, cw, ch, 0, 0, dw, dh);
  g.restore();
  // Round 2: where a carried body's bottom-centre goes (carryAt, mirrored with the facing), in
  // the states that hold it.
  // Round 3: carryAtBy per state, else carryAt. During `grab` the point of the pose it heaves
  // into (carry), with how far the heave has come: the caller eases the load up to it, so the
  // load rises with the arms instead of popping overhead.
  let hold: { x: number; y: number } | undefined;
  let heave: number | undefined;
  const pointFor = state === 'grab' ? 'carry' : state;
  const ca = pointFor === 'carry' || pointFor === 'carryRun' || pointFor === 'throw' ? (sheet.carryAtBy?.[pointFor] ?? sheet.carryAt) : null;
  if (ca) {
    hold = { x: e.facing < 0 ? left + dw - ca.x * scaleX : left + ca.x * scaleX, y: top + ca.y * scaleY };
    if (state === 'grab') heave = Math.max(0, Math.min(1, (t - since + 1) / Math.max(1, onceTicksOn(sheet, 'grab', mood))));
  }
  const head = top + Math.round(opaqueTop(img, sx, sy, cw, ch) * scaleY);
  return { state, top, head, hold, heave };
}

/** Whether a sheet draws its own rage (mood 3 frames). */
export function drawsOwnRage(content: Content, e: Entity): boolean {
  const s = sheetOf(content, e)?.sheet;
  return !!s?.moods?.['3'] && Object.keys(s.moods['3']).length > 0;
}
