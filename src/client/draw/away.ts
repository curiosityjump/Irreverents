import type { Content } from '../../content/types.ts';
import type { World } from '../../sim/types.ts';
import type { PlayerView } from './entities.ts';

const VEIL = '#1b1b2f';
const MARK = '#f4f1de';

/**
 * A friend whose page went away looks away, not frozen (Step 5): while the
 * server marks a player's character `away` (src/server/game.ts), everyone
 * else sees it dimmed with three small dots above its head, until the
 * player comes back or the character is removed.
 * DRAFT: the look (a veil over the body's box and the dots), and that
 * nothing is written; a mark that reads at 320x180 was the aim.
 */
export function drawAway(g: CanvasRenderingContext2D, world: World, content: Content, roomId: string, ox: number, oy: number, view?: PlayerView): void {
  for (const e of world.entities) {
    if (e.room !== roomId || !e.c.net?.away || e.id === view?.me) continue;
    const box = content.characters[e.kind]?.box;
    if (!box) continue;
    const x = ox + Math.round(e.x);
    const y = oy + Math.round(e.y);
    g.globalAlpha = 0.6;
    g.fillStyle = VEIL;
    g.fillRect(x - 4, y - 8, box.w + 8, box.h + 8);
    g.globalAlpha = 1;
    g.fillStyle = MARK;
    const mid = x + Math.floor(box.w / 2);
    for (const dx of [-5, -1, 3]) g.fillRect(mid + dx, y - 12, 2, 2);
    const drawn = view?.drawn.find((d) => d.id === e.id);
    if (drawn) drawn.away = true;
  }
}
