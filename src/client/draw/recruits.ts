import type { Content } from '../../content/types.ts';
import { recruitsOf } from '../../sim/recruits.ts';
import type { Entity, World } from '../../sim/types.ts';
import type { PlayerView } from './entities.ts';
import { drawLook, look } from './looks.ts';
import { bubble, edgeBark, label } from './npcs.ts';
import { drawSprite } from './sprites.ts';

// Step 13 (docs/mechanisms/recruits.md): a captive hero in a cage, drawn with
// their own sprite behind the cage's bars (the recruit file's looks: P04's
// barred gate, cut for it); their call over the cage, or at
// the screen's edge when the cage is off screen (the `bark-edge` chip), so
// they are found by ear before by eye (doc 04: visible curiosities).
// DRAFT: every size, place and time below.

const PAPER = '#f8f9fa';
const INK = '#1b1b2f';
const BAR = '#8a8aa0';
const BAR_DARK = '#2a2438';

export interface DrawnRecruits {
  /** The cages this frame drew in this room: the recruit file, its hero, and whether it stands open. */
  cages: { id: string; character: string; open: boolean }[];
  /** The captives' calls this frame drew: over the cage, or at the screen's edge. */
  calls: { id: string; at: 'cage' | 'edge' }[];
}

let last: DrawnRecruits = { cages: [], calls: [] };
/** What the last frame drew, for `window.irreverents.drawn.recruits` (scripted checks read only this). */
export function drawnRecruits(): DrawnRecruits {
  return last;
}

/** A captive's body as the cage's drawing uses it: their character, standing in the cage's middle. Never in the world. */
function captiveBody(content: Content, e: Entity, character: string, cageW: number): Entity | null {
  const box = content.characters[character]?.box;
  if (!box) return null;
  return { id: `${e.id}:hero`, kind: character, player: null, room: e.room, x: e.x + (cageW - box.w) / 2, y: e.y - box.h, vx: 0, vy: 0, facing: -1, onGround: true, c: {} };
}

/** The cages and the heroes in them, in front of the bodies' layer (the bars over the captive). */
export function drawRecruits(g: CanvasRenderingContext2D, world: World, content: Content, roomId: string, ox: number, oy: number, view?: PlayerView): void {
  const out: DrawnRecruits = { cages: [], calls: [] };
  last = out;
  if (!view) return;
  for (const { r, e, state } of recruitsOf(world, content)) {
    if (e.room !== roomId) continue;
    const T = content.rooms[roomId]!.tile;
    const cageW = r.w * T;
    const x = ox + Math.round(e.x);
    const y = oy + Math.round(e.y);
    out.cages.push({ id: r.id, character: r.character, open: state.open });
    const hero = state.open ? null : captiveBody(content, e, r.character, cageW);
    if (hero) {
      // Facing whoever is looking, so the captive reads as calling to them.
      const me = world.entities.find((b) => b.id === view.me);
      if (me) hero.facing = me.x < hero.x ? -1 : 1;
      const box = content.characters[r.character]!.box;
      if (!drawSprite(g, world, content, hero, ox + Math.round(hero.x), oy + Math.round(hero.y), { alpha: 1, tint: null })) {
        g.fillStyle = content.characters[r.character]!.color;
        g.fillRect(ox + Math.round(hero.x), oy + Math.round(hero.y), box.w, box.h);
      }
    }
    const id = state.open ? r.openLook : r.look;
    const l = id ? look(content, id) : null;
    if (l && id) {
      // The cage's art, standing on the floor, spread over the cage's tiles.
      for (let i = 0; i * l.w < cageW; i++) drawLook(g, content, id, x + i * l.w, y - l.h);
    } else drawBars(g, x, y, cageW, T + 8, state.open);
  }
}

/**
 * DRAFT: a plain cage for a recruit file with no looks: a dark frame and bars the captive shows between;
 * open, the front bars are gone and the frame stands.
 */
function drawBars(g: CanvasRenderingContext2D, x: number, floor: number, w: number, h: number, open: boolean): void {
  const top = floor - h;
  g.fillStyle = BAR_DARK;
  g.fillRect(x, top, w, 3);
  g.fillRect(x, top, 2, h);
  g.fillRect(x + w - 2, top, 2, h);
  g.fillRect(x - 1, floor - 2, w + 2, 2);
  g.fillStyle = BAR;
  g.fillRect(x + 1, top + 1, w - 2, 1);
  if (open) return;
  for (let bx = 5; bx < w - 3; bx += 5) {
    g.fillStyle = BAR_DARK;
    g.fillRect(x + bx, top + 3, 2, h - 5);
    g.fillStyle = BAR;
    g.fillRect(x + bx, top + 3, 1, h - 5);
  }
}

/** The captives' calls, over everything in the room (as people's barks are), every `callEvery` seconds while shut. */
export function drawRecruitCalls(g: CanvasRenderingContext2D, world: World, content: Content, roomId: string, ox: number, oy: number): void {
  for (const { r, e, state } of recruitsOf(world, content)) {
    if (e.room !== roomId || state.open) continue;
    const every = Math.max(1, Math.round(r.callEvery * 60));
    const showing = world.tick % every < Math.round(r.callFor * 60);
    if (!showing) continue;
    const T = content.rooms[roomId]!.tile;
    const hero = captiveBody(content, e, r.character, r.w * T);
    if (!hero) continue;
    const cx = ox + e.x + (r.w * T) / 2;
    const top = oy + Math.round(hero.y) - 2;
    if (cx < 0 || cx > g.canvas.width) {
      edgeBark(g, content, hero, r.call, cx < 0 ? -1 : 1, Math.max(2, top));
      last.calls.push({ id: r.id, at: 'edge' });
    } else {
      if (!bubble(g, r.call, cx, top)) label(g, r.call, cx, top, PAPER, INK);
      last.calls.push({ id: r.id, at: 'cage' });
    }
  }
}
