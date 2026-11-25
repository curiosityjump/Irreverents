import type { Content } from '../../content/types.ts';
import { machineLookId } from '../../content/kinds/machines.ts';
import { machineIdOf, machineOf, machineState } from '../../sim/machines.ts';
import type { Entity, World } from '../../sim/types.ts';
import { drawFrame, frameOf, look } from './fx.ts';
import type { Look } from './fx.ts';
import { drawSprite } from './sprites.ts';
import type { Drew } from './sprites.ts';

// Step 20 push 3, the look of a machine (docs/mechanisms/machines.md, "The
// look"). A machine's body is drawn from its looks (`<look>-idle`,
// `-moving`, `-crash`, `-wrecked`, `-empty`; the stem is the machine file's
// `look`) instead of its plain box; draw/entities.ts asks here first, so
// shadows, the player's mark over a rider and the debug record stay as for
// any body. Everything is read from the world a page is sent: the body,
// its `c.seat`, `c.impact` and `World.machines`; nothing listens to events.
// DRAFT: the stand-in cells and when each shows (docs/decisions-log.md,
// "Step 20: the look"):
// - with a person at the reins, the cells as cut: their baked goggled rider
//   reads as the driver, and the seated driver's own body is not drawn;
// - with a hero in it, the same cells, and the player's own mark over it
//   (draw/entities.ts draws the mark for every player's body);
// - empty, `-empty` once it is cut (asked of the art builder), else the idle
//   cell as it is: until then an empty wagon shows a rider. The Use mark
//   over it (draw/use-hint.ts) says it is free to take;
// - `-moving` while it rolls, `-crash` for a beat after a ram or a wall,
//   `-wrecked` once worn through, for good. Wear is never a number (D-020).

/** DRAFT: how long the crash cell holds after a ram, ticks (a quarter second). */
const CRASH_TICKS = 15;
/** Rolling faster than this (px/s) shows the moving cells. */
const ROLLING = 4;

export type MachineLook = 'idle' | 'moving' | 'crash' | 'wrecked' | 'empty';

/** What the last frame drew, by entity id, for the page's debug record and the shots. */
let last: { id: string; look: MachineLook; rider: string | null }[] = [];
export function drawnMachines(): { id: string; look: MachineLook; rider: string | null }[] {
  return last;
}
/** Called once per frame before the bodies (draw/entities.ts). */
export function beginMachines(): void {
  last = [];
  riders = [];
}

/** Which cell a machine body shows now. */
export function machineLook(world: World, content: Content, e: Entity): MachineLook | null {
  const m = machineOf(content, e.kind);
  if (!m?.look) return null;
  const s = machineState(world, machineIdOf(world, e));
  if (s.wrecked) return 'wrecked';
  if (e.c.impact && world.tick - e.c.impact.tick < CRASH_TICKS && e.c.impact.speed > 0) return 'crash';
  if (Math.abs(e.vx) > ROLLING) return 'moving';
  // A standing machine whose seat the server has looked at and found empty.
  if (e.player === null && e.c.seat && e.c.seat.driver === null) return 'empty';
  return 'idle';
}

/**
 * Draws a machine body from its looks, bottom-centred on its box and turned
 * the way it faces (the cells face right). Returns what it drew, or null
 * when the body is not a machine with looks (or they have not loaded): the
 * caller then draws it as before.
 */
export function drawMachineBody(g: CanvasRenderingContext2D, world: World, content: Content, e: Entity, x: number, y: number, alpha = 1): Drew | null {
  const m = machineOf(content, e.kind);
  const box = content.characters[e.kind]?.box;
  const state = machineLook(world, content, e);
  if (!m?.look || !box || !state) return null;
  // Each state falls back to idle when its cell is not cut yet (`-empty` is on order). A machine
  // file may name its cells per state (`looks`: the guards' trike, whose sheet has its own names).
  const l = look(machineLookId(m, state) ?? '') ?? look(machineLookId(m, 'idle') ?? '');
  if (!l) return null;
  const age = state === 'crash' ? world.tick - (e.c.impact?.tick ?? world.tick) : world.tick;
  const f = Math.max(0, frameOf(l, age, state !== 'crash'));
  const left = Math.round(x + box.w / 2 - l.w / 2);
  const top = Math.round(y + box.h - l.h);
  // A crash jolts the picture back a pixel against the way it rolls; the box never moves.
  const jolt = state === 'crash' && world.tick - (e.c.impact?.tick ?? 0) < 4 ? -e.facing : 0;
  // Guard vehicle push 2b (DRAFT): rolling fast, the picture bobs a pixel on its wheels and kicks up dust behind.
  const speed = Math.abs(e.vx);
  const bob = state === 'moving' && speed > BOB_SPEED && Math.floor(world.tick / 4) % 2 === 0 ? -1 : 0;
  if (state === 'moving' && speed > DUST_SPEED) drawTravelDust(g, world.tick, e.facing < 0 ? left + l.w : left, top + l.h, -e.facing, speed);
  if (alpha < 1) g.globalAlpha = alpha;
  drawFrame(g, l, f, left + jolt, top + bob, { flip: e.facing < 0, ...(m.livery ? { source: liveried(l, m.livery) } : {}) });
  g.globalAlpha = 1;
  last.push({ id: e.id, look: state, rider: e.player === null ? (e.c.seat?.driver ?? null) : e.id });
  // DRAFT: the picture's top as the cells are cut (the wagon's flag tip, 9 px down its cell;
  // the trike's, 6: the machine file's `headRow`).
  let head = top + (m.headRow ?? HEAD_ROW);
  // The courtyard's trike: cells with nobody aboard (`crew` false) show a rider as the hero they
  // went in as, on the saddle, over the cells, by the same sprite drawing every body uses.
  if (m.crew === false && e.player !== null) {
    const hero = world.machines?.[machineIdOf(world, e)]?.hero;
    const hb = hero ? content.characters[hero]?.box : undefined;
    if (hero && hb) {
      const [rx, ry] = m.riderAt ?? [Math.round(l.w / 2), Math.round(l.h / 2)];
      const fx = left + jolt + (e.facing < 0 ? l.w - rx : rx);
      const fy = top + bob + ry;
      // A stand-in body for the drawing only (its own id, so its animation memory is its own): standing still, facing as the machine does.
      const rider: Entity = { ...e, id: `${e.id}~rider`, kind: hero, vx: 0, vy: 0, onGround: true, c: {} };
      const drew = drawSprite(g, world, content, rider, fx - Math.round(hb.w / 2), fy - hb.h, { alpha, tint: null });
      if (!drew) {
        // No sheet for that hero: its box, as an unsheeted body is drawn.
        if (alpha < 1) g.globalAlpha = alpha;
        g.fillStyle = content.characters[hero]!.color;
        g.fillRect(fx - Math.round(hb.w / 2), fy - hb.h, hb.w, hb.h);
        g.globalAlpha = 1;
      }
      head = Math.min(head, drew ? drew.head : fy - hb.h);
      riders.push({ id: e.id, hero });
    }
  }
  return { state: 'idle', top, head };
}
/** DRAFT (guard vehicle push 2b): px/s above which a machine bobs on its wheels, and above which it kicks up dust. */
const BOB_SPEED = 60;
const DUST_SPEED = 120;
const DUST = '#e9e4d4';

/**
 * Puffs of dust thrown back from a machine's rear wheel while it rolls fast
 * (`back`: -1 behind a machine facing right). Nothing random: two screens draw
 * the same. DRAFT: the number, size and reach of the puffs.
 */
function drawTravelDust(g: CanvasRenderingContext2D, tick: number, x: number, floor: number, back: number, speed: number): void {
  const dust = look('fx-dust');
  const reach = Math.min(1, speed / 400);
  for (let i = 0; i < 3; i++) {
    const age = (tick + i * 5) % 15;
    const k = age / 15;
    const px = x + back * (4 + k * 22 * reach + i * 2);
    const rise = Math.round(k * 6);
    if (dust) {
      const fr = frameOf(dust, age, false);
      if (fr < 0) continue;
      const sc = 0.4 + 0.3 * (1 - k);
      const dw = Math.round(dust.w * sc);
      const dh = Math.round(dust.h * sc);
      drawFrame(g, dust, fr, Math.round(px - dw / 2), Math.round(floor - dh + 1 - rise), { flip: back < 0, w: dw, h: dh });
    } else {
      const side = Math.max(1, Math.round(3 * (1 - k)));
      g.globalAlpha = 0.8 * (1 - k);
      g.fillStyle = DUST;
      g.fillRect(Math.round(px) - side, Math.round(floor - side - rise), side * 2, side * 2);
      g.globalAlpha = 1;
    }
  }
}

const liveries = new Map<string, HTMLCanvasElement>();
/**
 * The look's strip with its warm pixels inside the livery's region recoloured
 * to the livery's colour, keeping each pixel's shading (machine file `livery`;
 * the guards' trike flies the town guards' blue). Cached per look and livery.
 */
function liveried(l: Look, lv: { color: string; region: [number, number, number, number] }): HTMLCanvasElement {
  const key = `${l.id}|${l.img.src}|${lv.color}|${lv.region.join(',')}`;
  let c = liveries.get(key);
  if (c) return c;
  c = document.createElement('canvas');
  c.width = l.w * l.frames;
  c.height = l.h;
  const t = c.getContext('2d')!;
  t.imageSmoothingEnabled = false;
  t.drawImage(l.img, l.x, l.y, c.width, l.h, 0, 0, c.width, l.h);
  const tr = parseInt(lv.color.slice(1, 3), 16);
  const tg = parseInt(lv.color.slice(3, 5), 16);
  const tb = parseInt(lv.color.slice(5, 7), 16);
  const [rx, ry, rw, rh] = lv.region;
  for (let f = 0; f < l.frames; f++) {
    const x0 = f * l.w + rx;
    const w = Math.min(rw, l.w - rx);
    const h = Math.min(rh, l.h - ry);
    if (w <= 0 || h <= 0) continue;
    const px = t.getImageData(x0, ry, w, h);
    const d = px.data;
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i]!, gg = d[i + 1]!, b = d[i + 2]!;
      // Warm: red well above blue, and above green (reds and oranges; the gold body is left, being outside the region).
      if (d[i + 3]! === 0 || r < b + 50 || r < gg + 20) continue;
      const shade = Math.min(1.5, (0.3 * r + 0.59 * gg + 0.11 * b) / 100);
      d[i] = Math.min(255, Math.round(tr * shade));
      d[i + 1] = Math.min(255, Math.round(tg * shade));
      d[i + 2] = Math.min(255, Math.round(tb * shade));
    }
    t.putImageData(px, x0, ry);
  }
  liveries.set(key, c);
  return c;
}

/** The first painted row of the wagon's cells (tools/art/props, measured 2026-11-24). DRAFT. */
const HEAD_ROW = 9;
/** Riders this frame drew as themselves on a crewless machine, for the page's debug record and the e2e. */
let riders: { id: string; hero: string }[] = [];
export function drawnRiders(): { id: string; hero: string }[] {
  return riders;
}

/**
 * Whether this body is a person sitting at the reins of a standing machine
 * that is drawn from its looks: the cells already show a rider, so the body
 * itself is not drawn (DRAFT, the stand-in; a cut empty cell plus the
 * person's own sprite would replace it).
 */
export function seatedInDrawnMachine(world: World, content: Content, e: Entity): boolean {
  if (!e.c.npc) return false;
  for (const o of world.entities) {
    if (o.room !== e.room || o.c.seat?.driver !== e.id) continue;
    const m = machineOf(content, o.kind);
    // A machine whose cells show nobody aboard (`crew` false) leaves its driver drawn as himself.
    if (m?.look && m.crew !== false && look(machineLookId(m, 'idle') ?? '')) return true;
  }
  return false;
}
