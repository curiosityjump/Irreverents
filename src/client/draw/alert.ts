import type { Content } from '../../content/types.ts';
import { MAX_ALERT, maxAlert } from '../../sim/npc/alert.ts';
import type { World } from '../../sim/types.ts';
import { queueBanner } from './banner.ts';
import { drawFrame, frameOf, look, safeView } from './fx.ts';
import { drawnHud } from './hud.ts';
import { drawLookIn, lookDef } from './room-parts.ts';

// DRAFT: plain stand-ins (Step 8 and Step 5 own the final look of marks and
// the alert display). Everything is read from entities the page receives:
// the bell is a thing's entity (`c.thing`, `c.ringing`), the alert is the
// area's bodiless entity (`c.alert`). Nothing here listens to events.
const BRASS = '#ffd166';
const BROKEN = '#6c757d';
const INK = '#1b1b2f';
const POST = '#8d6e63';
const ALARM = '#ef233c';
const PAPER = '#f8f9fa';

/** Round 3: the area's alert level last drawn and the tick it last rose (the newest pip glows). DRAFT: GLOW_TICKS. */
let lastLevel = 0;
/** Round 3 (gap 12): the pips' corner, clear of a notch the picture now runs under. */
// Step 4, the town's tiers: the pips sit just below the party plate (draw/hud.ts) when it is up, so the two
// never overlap; the plate's box is last frame's, which is where it is drawn this frame too.
const PX = (): number => (drawnHud()?.box.x ?? 5 + safeView.left) + SIGN_W;
const PY = (): number => {
  const box = drawnHud()?.box;
  return box ? box.y + box.h + 3 : 5 + safeView.top;
};
/** The warning sign leading the pips' strip, game px (its width with the gap after it). */
const SIGN_W = 13;
/** A warning sign: a brass triangle with an ink "!", 11 by 10 game px. */
const SIGN = ['.....#.....', '....###....', '....#.#....', '...##.##...', '...##.##...', '..###.###..', '..#######..', '.####.####.', '###########', '###########'];

/** The pips' strip: a dark plate with an orange edge (as the banners), the sign, then room for `slots` pips 12 px apart, from the sign's left at (x0, y). */
function drawPipStrip(g: CanvasRenderingContext2D, x: number, y: number, slots: number): void {
  const left = x - SIGN_W - 2;
  const w = SIGN_W + slots * 12 + 3;
  g.fillStyle = INK;
  g.fillRect(left - 1, y - 2, w + 2, 14);
  g.fillStyle = '#e09a1e';
  g.fillRect(left, y - 1, w, 12);
  g.fillStyle = '#221f44';
  g.fillRect(left + 1, y, w - 2, 10);
  SIGN.forEach((row, r) => {
    for (let c = 0; c < row.length; c++) {
      if (row[c] !== '#') continue;
      g.fillStyle = BRASS;
      g.fillRect(left + 2 + c, y + r, 1, 1);
    }
  });
}

/**
 * DRAFT (brief phone-hud-legibility, second pass, 2026-11-24: the round red
 * `alert-pip` looks still read as balloons, or as hearts, beside the plate):
 * the level is a rising meter, MAX_ALERT bars climbing left to right, the
 * lit ones amber to red, the rest dark sockets, so it reads as how loud the
 * alarm is, not as a count of things you own. true puts the pip looks back.
 */
const PIP_LOOKS = false;
// DRAFT (the escalating guard response: five levels in the castle town): two more, deeper reds, the last all-out.
const METER = ['#ffd166', '#f78c2a', '#ef233c', '#c1121f', '#ff2d6f'];
const SOCKET = '#2b2750';
/** DRAFT (brief phone-hud-legibility, third pass: the unlit sockets were nearly invisible on the strip): an unlit bar has a pale rim, so the meter shows how far it can still climb. */
const SOCKET_RIM = '#7d77b8';

/**
 * The rising meter: `slots` bars climbing from 4 px to 10 px tall (4, 7, 10 for three; 4, 6, 7, 9, 10 for five),
 * 8 wide, 12 apart; the newest lit bar flashes white as it lights. DRAFT (the escalating guard response): at the
 * top level (all-out) every lit bar flickers on and off its colour, so the strip reads as "it will not stop".
 */
function drawMeter(g: CanvasRenderingContext2D, x: number, y: number, level: number, age: number, slots: number, tick: number): void {
  const bars = Math.max(level, slots);
  const allOut = level >= slots && slots > MAX_ALERT;
  for (let i = 0; i < bars; i++) {
    const h = bars <= 1 ? 10 : Math.min(10, 4 + Math.round((6 * i) / (bars - 1)));
    const bx = x + i * 12;
    const by = y + 10 - h;
    const lit = i < level;
    g.fillStyle = lit ? INK : SOCKET_RIM;
    g.fillRect(bx, by, 8, h);
    const flash = lit && i === level - 1 && age >= 0 && age < GLOW_TICKS && Math.floor(age / 5) % 2 === 0;
    const flicker = allOut && lit && Math.floor(tick / 15) % 2 === 0;
    g.fillStyle = flash ? PAPER : flicker ? ALARM : lit ? METER[Math.min(METER.length - 1, i)]! : SOCKET;
    g.fillRect(bx + 1, by + 1, 6, lit ? h - 1 : h - 2);
    if (lit && !flash) {
      // A lit bar's top edge catches the light.
      g.fillStyle = 'rgba(255, 255, 255, 0.45)';
      g.fillRect(bx + 1, by + 1, 6, 1);
    }
  }
}

/** Step 4, the town's tiers: what was drawn last frame, for the page's drawn record (drawn.alert). */
// `bell` (additive, the fifth town-tiers builder): a ringing bell's bar in this room, its progress 0..1, or null;
// a call for help is a bell or a whistle (D-063), and the checks read either (docs/decisions-log.md, the tiers fact).
let shown: { level: number; whistle: number | null; bell?: number | null } = { level: 0, whistle: null, bell: null };
/** No banner for the level a page finds when it first draws (joining a game mid-alert is not the moment). */
let drawnOnce = false;

/** The highest alert of any area (world.alerts, which follows the party), or the room's own entity's. */
function shownLevel(world: World, roomId: string): { level: number; area: string | null } {
  let best = { level: world.entities.find((e) => e.room === roomId && e.c.alert)?.c.alert?.level ?? 0, area: roomId as string | null };
  for (const [area, level] of Object.entries(world.alerts ?? {})) if (level > best.level) best = { level, area };
  return best;
}

/** The pips and the whistle's gauge drawn on the last frame: `level` (0 to the area's most, maxAlert) and `whistle`, a whistling guard's progress 0..1 in this room, or null. */
export function drawnAlert(): { level: number; whistle: number | null; bell?: number | null } {
  return shown;
}

/** A gauge (the `bell-gauge` look, else a bar) filling with `progress`, centred at cx with its foot at `foot`. */
function drawGauge(g: CanvasRenderingContext2D, progress: number, cx: number, foot: number): void {
  const gauge = look('bell-gauge');
  if (gauge) {
    const f = Math.min(gauge.frames - 1, Math.floor(progress * gauge.frames));
    drawFrame(g, gauge, f, Math.round(cx - gauge.w / 2), foot - gauge.h);
    return;
  }
  g.fillStyle = INK;
  g.fillRect(cx - 9, foot - 4, 18, 4);
  g.fillStyle = ALARM;
  g.fillRect(cx - 8, foot - 3, Math.round(16 * progress), 2);
}
let litAt = -1e9;
const GLOW_TICKS = 40;

/** The bells of the room, each with the entity it is drawn from. */
function bells(world: World, content: Content, roomId: string): World['entities'] {
  return world.entities.filter((e) => e.room === roomId && e.c.thing && content.placements[roomId]?.things?.find((t) => t.id === e.id)?.look === 'bell');
}

/**
 * The call points of a room: drawn with the working parts, behind bodies.
 * A working bell is a brass bell on a wooden post; while someone rings it, it
 * swings; a broken one is a grey stump. With the looks `bell`,
 * `bell-ringing` (a strip) and `bell-broken`, those are drawn instead,
 * bottom-centre on the bell's tile.
 */
export function drawBells(g: CanvasRenderingContext2D, world: World, content: Content, roomId: string, ox: number, oy: number): void {
  const room = content.rooms[roomId];
  if (!room) return;
  for (const e of bells(world, content, roomId)) {
    const thing = e.c.thing;
    if (!thing) continue;
    const T = room.tile;
    const ring = e.c.ringing;
    const id = thing.takenBy !== null ? 'bell-broken' : ring ? 'bell-ringing' : 'bell';
    if (drawLookIn(g, content, [id], ox + e.x, oy + e.y, T, T, ring ? ring.ticks : world.tick)) continue;
    const cx = ox + e.x + T / 2;
    const base = oy + e.y + T;
    g.fillStyle = POST;
    g.fillRect(cx - 1, base - 20, 2, 20);
    g.fillRect(cx - 3, base - 2, 6, 2);
    if (thing.takenBy !== null) {
      // Broken: the post, and what is left of the bell lying at its foot.
      g.fillStyle = BROKEN;
      g.fillRect(cx - 5, base - 3, 4, 3);
      g.fillRect(cx + 2, base - 2, 3, 2);
      continue;
    }
    const swing = ring ? (Math.floor(ring.ticks / 6) % 2 === 0 ? -2 : 2) : 0;
    g.fillStyle = BRASS;
    g.fillRect(cx - 3 + swing, base - 22, 6, 2);
    g.fillRect(cx - 4 + swing, base - 20, 8, 6);
    g.fillStyle = INK;
    g.fillRect(cx - 1 + swing, base - 14, 2, 2);
  }
}

/**
 * The marks: over a ringing bell, a bar filling with the call's progress
 * (the time left to stop the call); and the area's alert level, up to
 * three marks in the top-left corner (screen furniture, drawn last). At 0
 * nothing is shown. With the looks `alert-pip` and `alert-pip-off`, the
 * level is that many lit pips followed by unlit ones up to the most.
 */
export function drawAlert(g: CanvasRenderingContext2D, world: World, content: Content, roomId: string, ox: number, oy: number): void {
  const room = content.rooms[roomId];
  if (!room) return;
  let bell: number | null = null;
  for (const e of bells(world, content, roomId)) {
    const ring = e.c.ringing;
    if (!ring || e.c.thing?.takenBy !== null) continue;
    bell = Math.max(bell ?? 0, Math.min(1, ring.ticks / Math.max(1, ring.of)));
    const cx = ox + e.x + room.tile / 2;
    const base = oy + e.y + room.tile;
    // Round 3 (gap 11): with the looks, a `bell-gauge` over the bell filling frame by frame
    // with the call's progress, and `fx-clang` either side of the bell as it rings; else the bar.
    const gauge = look('bell-gauge');
    if (gauge) {
      const progress = Math.min(1, ring.ticks / Math.max(1, ring.of));
      const f = Math.min(gauge.frames - 1, Math.floor(progress * gauge.frames));
      drawFrame(g, gauge, f, Math.round(cx - gauge.w / 2), base - 26 - gauge.h);
      const clang = look('fx-clang');
      if (clang) {
        const cf = frameOf(clang, ring.ticks, true);
        drawFrame(g, clang, cf, Math.round(cx - 6 - clang.w), base - 24 - Math.round(clang.h / 2));
        drawFrame(g, clang, cf, Math.round(cx + 6), base - 24 - Math.round(clang.h / 2), { flip: true });
      }
      continue;
    }
    g.fillStyle = INK;
    g.fillRect(cx - 9, base - 40, 18, 4);
    g.fillStyle = ALARM;
    g.fillRect(cx - 8, base - 39, Math.round((16 * Math.min(ring.ticks, ring.of)) / Math.max(1, ring.of)), 2);
  }
  // Step 4, the town's tiers: a guard blowing his whistle, a gauge over his head filling (the time left to stop him).
  let whistle: number | null = null;
  for (const e of world.entities) {
    const w = e.c.whistle;
    const box = content.characters[e.kind]?.box;
    if (e.room !== roomId || !w || w.progress <= 0 || !box) continue;
    const progress = Math.min(1, w.progress / Math.max(1, w.of));
    whistle = Math.max(whistle ?? 0, progress);
    drawGauge(g, progress, ox + e.x + box.w / 2, oy + e.y - 12);
  }
  // Step 4, the town's tiers: the pips follow the party (world.alerts), the highest area's level.
  const { level, area } = shownLevel(world, roomId);
  if (level > lastLevel) {
    litAt = world.tick;
    // DRAFT (docs/decisions-log.md, "Step 4: pips"): a new pip queues one banner, the dispatch file's words for that level.
    const words = area ? content.dispatch?.[area]?.banners[level - 1] : undefined;
    if (drawnOnce && words) queueBanner({ key: `alert:${level}`, text: words });
  }
  drawnOnce = true;
  lastLevel = level;
  shown = { level, whistle, bell };
  if (level <= 0) return;
  // DRAFT (brief phone-hud-legibility, 2026-11-24: the pips under the plate read as hearts or balloons):
  // they sit on their own dark strip led by a warning sign, so they read as "the watch is after you".
  // The meter's length is the shown area's most (five in the castle town, three elsewhere: maxAlert).
  const most = area ? maxAlert(content, area) : MAX_ALERT;
  const slotsShown = lookDef(content, 'alert-pip') && lookDef(content, 'alert-pip-off') ? Math.max(level, most) : level;
  drawPipStrip(g, PX(), PY(), PIP_LOOKS ? slotsShown : Math.max(level, most));
  if (!PIP_LOOKS) {
    drawMeter(g, PX(), PY(), level, world.tick - litAt, most, world.tick);
    return;
  }
  if (lookDef(content, 'alert-pip')) {
    let drawn = true;
    const slots = lookDef(content, 'alert-pip-off') ? Math.max(level, most) : level;
    for (let i = 0; i < slots; i++) {
      drawn = drawLookIn(g, content, [i < level ? 'alert-pip' : 'alert-pip-off'], PX() + i * 12, PY(), 10, 10) && drawn;
      if (!drawn) break;
    }
    // Round 3 (gap 11): the newest lit pip glows as it fills: a ring of its own light, fading.
    const pip = look('alert-pip');
    const age = world.tick - litAt;
    if (drawn && pip && age >= 0 && age < GLOW_TICKS) {
      g.globalAlpha = 0.6 * (1 - age / GLOW_TICKS);
      drawFrame(g, pip, frameOf(pip, world.tick, true), PX() + (level - 1) * 12 - 2, PY() - 2, { w: 14, h: 14 });
      g.globalAlpha = 1;
    }
    if (drawn) return;
  }
  for (let i = 0; i < level; i++) {
    const x = PX() + 1 + i * 12;
    const y = PY();
    g.fillStyle = INK;
    g.fillRect(x - 1, y, 10, 12);
    g.fillStyle = ALARM;
    g.fillRect(x, y + 1, 8, 10);
    g.fillStyle = PAPER;
    g.fillRect(x + 3, y + 3, 2, 4);
    g.fillRect(x + 3, y + 8, 2, 2);
  }
}
