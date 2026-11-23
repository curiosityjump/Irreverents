import type { Content } from '../../content/types.ts';
import type { Entity, World } from '../../sim/types.ts';

/** DRAFT: every entity is its character kind's box in a flat colour, with an eye so facing reads. Sprite sheets replace this as data. */
export function drawEntities(g: CanvasRenderingContext2D, world: World, content: Content, roomId: string, ox: number, oy: number): void {
  for (const e of world.entities) {
    if (e.room !== roomId) continue;
    const kind = content.characters[e.kind];
    if (!kind) continue;
    const x = ox + Math.round(e.x);
    const y = oy + Math.round(e.y);
    g.fillStyle = kind.color;
    g.fillRect(x, y, kind.box.w, kind.box.h);
    g.fillStyle = '#1b1b2f';
    g.fillRect(e.facing > 0 ? x + kind.box.w - 4 : x + 2, y + 5, 2, 3);
    MARKS[kind.id]?.(g, x, y, kind.box.w, kind.box.h, e);
  }
}

const DARK = '#1b1b2f';

/**
 * DRAFT: one small mark per party member so the three tell apart at a glance
 * on a phone even without colour (size and colour are data, in
 * content/characters/). Keyed by character id; a kind with no entry is just
 * its box. Sprite sheets replace all of this.
 */
const MARKS: Record<string, (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, e: Entity) => void> = {
  // The grappler: broad shoulders that overhang the box, and a belt.
  grappler(g, x, y, w, h) {
    g.fillStyle = '#a63d1f';
    g.fillRect(x - 2, y + 10, w + 4, 5);
    g.fillStyle = DARK;
    g.fillRect(x, y + h - 9, w, 2);
  },
  // The infiltrator: a dark headband with a tail trailing behind.
  infiltrator(g, x, y, w, _h, e) {
    g.fillStyle = DARK;
    g.fillRect(x, y + 1, w, 2);
    g.fillRect(e.facing > 0 ? x - 3 : x + w, y + 2, 3, 2);
  },
  // The flyer: a wing on each side, raised while rising and lowered while falling.
  flyer(g, x, y, w, _h, e) {
    g.fillStyle = '#e8f7fd';
    const wy = e.onGround ? y + 8 : e.vy < 0 ? y + 3 : y + 10;
    g.fillRect(x - 4, wy, 4, 5);
    g.fillRect(x + w, wy, 4, 5);
  },
};
