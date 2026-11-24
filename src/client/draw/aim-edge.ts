import type { Content } from '../../content/types.ts';
import type { Entity, World } from '../../sim/types.ts';
import { safeView } from './fx.ts';
import { drawnOffset } from './entities.ts';
import { plateFadeOff } from './hud.ts';

// Brief plate-clear-of-bodies, part 2 (docs/mechanisms/rendering-world.md,
// "The party plate"): the camera cannot go above a room's top, so a thrower on
// a balcony or a stair at the top of a room can aim at you while partly (or
// wholly) off the top of the picture. While a thrower in your room aims your
// way (`c.rangedAim`, his throw's direction toward your hero) and any of his
// body is outside the picture, a small arrow sits at the picture's edge beside
// him, pointing at him, in the arc's own colours (draw/ranged.ts: the pale dot
// with the dark rim), pulsing with the aim.
// INTENT (the brief): only for a body aiming at you; not a general off-screen
// radar. It takes no input. `window.irreverents.plateFade.off` (the e2e's
// control) leaves it out, as before.
// DRAFT: the arrow's size, place and pulse.

/** The arc's colours (draw/ranged.ts). */
const DOT = '#ffe9a8';
const RIM = '#2a1a10';
/** DRAFT: game px between the arrow and the picture's edge, and beside his body. */
const EDGE = 2;
const BESIDE = 3;

export interface AimMark {
  /** The thrower's entity id. */
  id: string;
  /** The arrow's tip, screen game px. */
  x: number;
  y: number;
  /** Which way it points: toward him. */
  dir: 'up' | 'left' | 'right';
}

type Box = { x: number; y: number; w: number; h: number };

/** Draws an arrow for each thrower aiming at `me` with part of him outside the W×H picture; returns what it drew. */
export function drawAimEdges(g: CanvasRenderingContext2D, world: World, content: Content, roomId: string, ox: number, oy: number, W: number, H: number, me: Entity | undefined, plate: Box | undefined, frame: number): AimMark[] {
  const out: AimMark[] = [];
  if (plateFadeOff()) return out;
  if (!me || me.room !== roomId) return out;
  const mine = content.characters[me.kind]?.box;
  if (!mine) return out;
  const meMid = me.x + mine.w / 2;
  for (const e of world.entities) {
    const aim = e.c.rangedAim;
    const box = content.characters[e.kind]?.box;
    if (!aim || !box || e.room !== roomId || e.id === me.id) continue;
    // Aiming your way: his throw goes toward your hero's side of him.
    if (Math.sign(meMid - (e.x + box.w / 2)) !== aim.dir) continue;
    const off = drawnOffset(e.id);
    const x = ox + Math.round(e.x) + off.x;
    const y = oy + Math.round(e.y) + off.y;
    const top = safeView.top;
    const left = safeView.left;
    const right = W - safeView.right;
    const offTop = y < top;
    const offLeft = x < left;
    const offRight = x + box.w > right;
    // INTENT: the picture's bottom is the controls' band; nobody aims from below it.
    if (!offTop && !offLeft && !offRight) continue;
    let mark: AimMark;
    if (offTop) {
      // Beside him, on the side he throws toward (clear of his feet, which may show), at the top edge.
      let ax = aim.dir > 0 ? x + box.w + BESIDE + 3 : x - BESIDE - 4;
      ax = Math.max(left + 5, Math.min(right - 6, ax));
      let ay = top + EDGE;
      // Never under the party plate: below it instead.
      if (plate && ax + 4 >= plate.x && ax - 4 <= plate.x + plate.w && ay <= plate.y + plate.h) ay = plate.y + plate.h + EDGE;
      mark = { id: e.id, x: ax, y: ay, dir: 'up' };
    } else {
      const ay = Math.max(top + 5, Math.min(H - 6, y + Math.floor(box.h / 3)));
      mark = offLeft ? { id: e.id, x: left + EDGE, y: ay, dir: 'left' } : { id: e.id, x: right - EDGE - 1, y: ay, dir: 'right' };
    }
    arrow(g, mark, frame);
    out.push(mark);
  }
  return out;
}

/** A 9-wide, 5-deep arrowhead with a dark rim, its tip at the mark, pulsing (1 px in and out). */
function arrow(g: CanvasRenderingContext2D, m: AimMark, frame: number): void {
  const pulse = Math.floor(frame / 8) % 2;
  const rows: [number, number][] = [];
  for (let i = 0; i < 5; i++) rows.push([i, i]); // depth i: half-width i
  const at = (d: number, s: number): [number, number] => {
    const depth = d + pulse;
    if (m.dir === 'up') return [m.x + s, m.y + depth];
    if (m.dir === 'left') return [m.x + depth, m.y + s];
    return [m.x - depth, m.y + s];
  };
  // The rim: one px wider all round.
  g.fillStyle = RIM;
  for (const [d, hw] of rows)
    for (let s = -hw - 1; s <= hw + 1; s++) {
      const [px, py] = at(d, s);
      g.fillRect(px, py, 1, 1);
    }
  for (let s = -5; s <= 5; s++) {
    const [px, py] = at(5, s);
    g.fillRect(px, py, 1, 1);
  }
  const [tx, ty] = at(-1, 0);
  g.fillRect(tx, ty, 1, 1);
  g.fillStyle = DOT;
  for (const [d, hw] of rows)
    for (let s = -hw; s <= hw; s++) {
      const [px, py] = at(d, s);
      g.fillRect(px, py, 1, 1);
    }
}
