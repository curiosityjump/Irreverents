import type { Content } from '../../content/types.ts';
import { machineLookId } from '../../content/kinds/machines.ts';
import { machineIdOf, machineOf, machineState } from '../../sim/machines.ts';
import type { Entity, World } from '../../sim/types.ts';
import { drawFrame, frameOf, look } from './fx.ts';
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
  if (alpha < 1) g.globalAlpha = alpha;
  drawFrame(g, l, f, left + jolt, top, { flip: e.facing < 0 });
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
      const fy = top + ry;
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
