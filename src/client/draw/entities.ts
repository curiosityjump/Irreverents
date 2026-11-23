import type { Content } from '../../content/types.ts';
import type { World } from '../../sim/types.ts';

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
  }
}
