import type { Content } from '../../content/types.ts';
import { MAX_ALERT } from '../../sim/npc/alert.ts';
import type { World } from '../../sim/types.ts';
import { drawFrame, frameOf, look } from './fx.ts';
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
  for (const e of bells(world, content, roomId)) {
    const ring = e.c.ringing;
    if (!ring || e.c.thing?.takenBy !== null) continue;
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
  const level = world.entities.find((e) => e.room === roomId && e.c.alert)?.c.alert?.level ?? 0;
  if (level > lastLevel) litAt = world.tick;
  lastLevel = level;
  if (level <= 0) return;
  if (lookDef(content, 'alert-pip')) {
    let drawn = true;
    const slots = lookDef(content, 'alert-pip-off') ? Math.max(level, MAX_ALERT) : level;
    for (let i = 0; i < slots; i++) {
      drawn = drawLookIn(g, content, [i < level ? 'alert-pip' : 'alert-pip-off'], 5 + i * 12, 5, 10, 10) && drawn;
      if (!drawn) break;
    }
    // Round 3 (gap 11): the newest lit pip glows as it fills: a ring of its own light, fading.
    const pip = look('alert-pip');
    const age = world.tick - litAt;
    if (drawn && pip && age >= 0 && age < GLOW_TICKS) {
      g.globalAlpha = 0.6 * (1 - age / GLOW_TICKS);
      drawFrame(g, pip, frameOf(pip, world.tick, true), 5 + (level - 1) * 12 - 2, 3, { w: 14, h: 14 });
      g.globalAlpha = 1;
    }
    if (drawn) return;
  }
  for (let i = 0; i < level; i++) {
    const x = 6 + i * 12;
    g.fillStyle = INK;
    g.fillRect(x - 1, 5, 10, 12);
    g.fillStyle = ALARM;
    g.fillRect(x, 6, 8, 10);
    g.fillStyle = PAPER;
    g.fillRect(x + 3, 8, 2, 4);
    g.fillRect(x + 3, 13, 2, 2);
  }
}
