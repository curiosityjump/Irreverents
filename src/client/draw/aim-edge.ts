import type { Content } from '../../content/types.ts';
import type { Entity, World } from '../../sim/types.ts';
import { safeView } from './fx.ts';
import { drawnOffset, drawnTop } from './entities.ts';
import { menuBox, plateFadeOff } from './hud.ts';

// Brief plate-clear-of-bodies, part 2 (docs/mechanisms/rendering-world.md,
// "The party plate"): the camera cannot go above a room's top, so a thrower on
// a balcony or a stair at the top of a room can aim at you while partly (or
// wholly) off the top of the picture. While a thrower in your room aims your
// way (`c.rangedAim`, his throw's direction toward your hero) and any of his
// body is outside the picture, a small arrow sits at the picture's edge beside
// him, pointing at him, in the arc's own colours (draw/ranged.ts: the pale dot
// with the dark rim), pulsing with the aim. Brief phone-legibility-pass: in the
// alarm's red, larger, blinking with his wind-up, and placed clear of his
// picture, the plate and the menu button (the first of a few places that fits).
// INTENT (the brief): only for a body aiming at you; not a general off-screen
// radar. It takes no input. `window.irreverents.plateFade.off` (the e2e's
// control) leaves it out, as before.
// DRAFT: the arrow's size, place and pulse.

/** The arc's colours (draw/ranged.ts): the arrow as it was, kept for the e2e's control. */
const DOT = '#ffe9a8';
const RIM = '#2a1a10';
/**
 * Brief phone-legibility-pass (the look at 1ef40fb: "a cream triangle about
 * 10-15 px drawn over the thrower's own burst and legs: it reads as part of
 * that sprite, not as a warning"): the alarm's red (draw/alert.ts) with the
 * HUD's dark rim, 15 wide and 8 deep, its rim flashing cream faster as his
 * wind-up fills.
 * DRAFT: the size, the colours and the blink.
 */
const ALARM = '#ef233c';
/** DRAFT: the blink's rim: a cream flash round the same red. */
const FLASH = '#fff3d6';
const INK = '#1b1b2f';
const HALF = 7;
const DEPTH = 8;
/** DRAFT: game px kept between the arrow and the picture's edge, and between it and anything it must clear. */
const EDGE = 2;
const CLEAR = 3;
/** DRAFT: how far a thrower's picture reaches past his box (his arms), game px; on his throwing side his held shot and its red burst reach further (seen at 844x390: a red arrow beside the burst read as part of it). */
const REACH = 10;
const REACH_THROW = 26;

export interface AimMark {
  /** The thrower's entity id. */
  id: string;
  /** The arrow's tip, screen game px. */
  x: number;
  y: number;
  /** Which way it points: toward him. */
  dir: 'up' | 'left' | 'right';
  /** Brief phone-legibility-pass: the whole arrow, rim and pulse included, screen game px. */
  box: Box;
}

type Box = { x: number; y: number; w: number; h: number };

/** INTENT (e2e control only, scripts/e2e/plate-legible.ts): `window.irreverents.plateFade.oldArrow` draws and places the arrow as before brief phone-legibility-pass; nothing in the game sets it. */
function oldArrow(): boolean {
  return (globalThis as { irreverents?: { plateFade?: { oldArrow?: boolean } } }).irreverents?.plateFade?.oldArrow === true;
}

const meets = (a: Box, b: Box): boolean => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const grow = (b: Box, n: number): Box => ({ x: b.x - n, y: b.y - n, w: b.w + 2 * n, h: b.h + 2 * n });

/** The box an arrow with its tip at (x, y) covers, rim and pulse included. */
function boxOf(x: number, y: number, dir: AimMark['dir'], old: boolean): Box {
  const half = old ? 5 : HALF + 1;
  const deep = (old ? 6 : DEPTH + 1) + 2;
  if (dir === 'up') return { x: x - half, y: y - 1, w: 2 * half + 1, h: deep };
  if (dir === 'left') return { x: x - 1, y: y - half, w: deep, h: 2 * half + 1 };
  return { x: x - deep + 2, y: y - half, w: deep, h: 2 * half + 1 };
}

/** Draws an arrow for each thrower aiming at `me` with part of him outside the W×H picture; returns what it drew. */
export function drawAimEdges(g: CanvasRenderingContext2D, world: World, content: Content, roomId: string, ox: number, oy: number, W: number, H: number, me: Entity | undefined, plate: Box | undefined, frame: number): AimMark[] {
  const out: AimMark[] = [];
  if (plateFadeOff()) return out;
  if (!me || me.room !== roomId) return out;
  const mine = content.characters[me.kind]?.box;
  if (!mine) return out;
  const old = oldArrow();
  const meMid = me.x + mine.w / 2;
  const menu = menuBox();
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
    // How far his wind-up has filled (0..1), for the blink.
    const aimTicks = Math.max(1, Math.round((content.npcs[e.c.npc?.kind ?? '']?.ranged?.aim ?? 0.6) * 60));
    const wound = Math.min(1, Math.max(0, world.tick - aim.at) / aimTicks);
    let mark: AimMark | undefined;
    if (old) mark = oldPlace(e.id, x, y, box, aim.dir, top, left, right, H, plate);
    else {
      // Everything the arrow must clear: his picture (box, sprite top, held shot), the plate, the menu button.
      const headTop = Math.min(y, drawnTop(e.id) ?? y);
      const lr = aim.dir > 0 ? REACH : REACH_THROW;
      const rr = aim.dir > 0 ? REACH_THROW : REACH;
      const him: Box = { x: x - lr, y: headTop - REACH, w: box.w + lr + rr, h: y + box.h - headTop + REACH };
      const keep: Box[] = [him, ...(plate ? [plate] : []), ...(menu ? [menu] : [])].map((b) => grow(b, CLEAR));
      const fits = (m: { x: number; y: number; dir: AimMark['dir'] }): boolean => {
        const b = boxOf(m.x, m.y, m.dir, false);
        return b.x >= left && b.x + b.w <= right && b.y >= top && b.y + b.h <= H && !keep.some((k) => meets(b, k));
      };
      const tries: { x: number; y: number; dir: AimMark['dir'] }[] = [];
      if (offTop) {
        // At the top edge beside him: away from his throw first (his shot is held on that side), then toward it; else below the plate, then under his feet.
        const back = aim.dir > 0 ? him.x - CLEAR - HALF - 2 : him.x + him.w + CLEAR + HALF + 2;
        const front = aim.dir > 0 ? him.x + him.w + CLEAR + HALF + 2 : him.x - CLEAR - HALF - 2;
        const below = plate ? plate.y + plate.h + CLEAR + 2 : top + EDGE + 1;
        for (const ax of [back, front]) tries.push({ x: ax, y: top + EDGE + 1, dir: 'up' });
        for (const ax of [back, front]) tries.push({ x: ax, y: below, dir: 'up' });
        tries.push({ x: x + Math.round(box.w / 2), y: him.y + him.h + CLEAR + 2, dir: 'up' });
      } else {
        // At the side edge, above or below him (his visible part is at that edge).
        const dir = offLeft ? 'left' : 'right';
        const ex = offLeft ? left + EDGE + 1 : right - EDGE - 2;
        tries.push({ x: ex, y: him.y + him.h + CLEAR + HALF + 2, dir });
        tries.push({ x: ex, y: him.y - CLEAR - HALF - 2, dir });
        if (plate) tries.push({ x: ex, y: plate.y + plate.h + CLEAR + HALF + 2, dir });
      }
      const at = tries.find(fits) ?? tries[0]!;
      const ax = at.dir === 'up' ? Math.max(left + HALF + 2, Math.min(right - HALF - 2, at.x)) : at.x;
      mark = { id: e.id, x: ax, y: at.y, dir: at.dir, box: boxOf(ax, at.y, at.dir, false) };
    }
    if (!mark) continue;
    if (old) oldDraw(g, mark, frame);
    else arrow(g, mark, frame, wound);
    out.push(mark);
  }
  return out;
}

/** The arrow as it was before brief phone-legibility-pass (the e2e's control). */
function oldPlace(id: string, x: number, y: number, box: { w: number; h: number }, dir: 1 | -1, top: number, left: number, right: number, H: number, plate: Box | undefined): AimMark {
  if (y < top) {
    let ax = dir > 0 ? x + box.w + 6 : x - 7;
    ax = Math.max(left + 5, Math.min(right - 6, ax));
    let ay = top + 2;
    if (plate && ax + 4 >= plate.x && ax - 4 <= plate.x + plate.w && ay <= plate.y + plate.h) ay = plate.y + plate.h + 2;
    return { id, x: ax, y: ay, dir: 'up', box: boxOf(ax, ay, 'up', true) };
  }
  const ay = Math.max(top + 5, Math.min(H - 6, y + Math.floor(box.h / 3)));
  const d = x < left ? 'left' : 'right';
  const ax = d === 'left' ? left + 2 : right - 3;
  return { id, x: ax, y: ay, dir: d, box: boxOf(ax, ay, d, true) };
}

/** A point of the arrow `d` deep from its tip and `s` across, in screen px. */
function at(m: AimMark, d: number, s: number): [number, number] {
  if (m.dir === 'up') return [m.x + s, m.y + d];
  if (m.dir === 'left') return [m.x + d, m.y + s];
  return [m.x - d, m.y + s];
}

/**
 * A 15-wide, 8-deep arrowhead in the alarm's red with a dark rim, its tip at
 * the mark. It blinks (its rim flashes cream, and it steps 1 px toward him) faster as
 * his wind-up fills: every 10 frames at its start, every 3 at its end.
 */
function arrow(g: CanvasRenderingContext2D, m: AimMark, frame: number, wound: number): void {
  const period = Math.max(3, Math.round(10 - 7 * wound));
  const hot = Math.floor(frame / period) % 2 === 1;
  const nudge = hot ? 1 : 0;
  const px = (d: number, s: number): void => {
    const [x, y] = at(m, d + nudge, s);
    g.fillRect(x, y, 1, 1);
  };
  g.fillStyle = hot ? FLASH : INK;
  for (let d = 0; d < DEPTH; d++) for (let s = -d - 1; s <= d + 1; s++) px(d, s);
  for (let s = -DEPTH; s <= DEPTH; s++) px(DEPTH, s);
  px(-1, 0);
  g.fillStyle = ALARM;
  for (let d = 0; d < DEPTH; d++) for (let s = -d; s <= d; s++) px(d, s);
}

/** The old 9-wide, 5-deep arrowhead in the arc's colours (the control). */
function oldDraw(g: CanvasRenderingContext2D, m: AimMark, frame: number): void {
  const pulse = Math.floor(frame / 8) % 2;
  const px = (d: number, s: number): void => {
    const [x, y] = at(m, d + pulse, s);
    g.fillRect(x, y, 1, 1);
  };
  g.fillStyle = RIM;
  for (let d = 0; d < 5; d++) for (let s = -d - 1; s <= d + 1; s++) px(d, s);
  for (let s = -5; s <= 5; s++) px(5, s);
  px(-1, 0);
  g.fillStyle = DOT;
  for (let d = 0; d < 5; d++) for (let s = -d; s <= d; s++) px(d, s);
}
