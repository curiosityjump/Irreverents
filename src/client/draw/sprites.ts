import type { Content } from '../../content/types.ts';
import type { Entity } from '../../sim/types.ts';
import { image } from './images.ts';

/**
 * INTENT: art replaces rectangles as DATA. A character kind with a file in
 * content/sprites/ (named after the kind) is drawn from that sheet; one
 * without keeps its graybox box. Returns whether it drew
 * (docs/architecture.md, "Where art plugs in").
 */
export function drawSprite(g: CanvasRenderingContext2D, content: Content, e: Entity, x: number, y: number, frame: number): boolean {
  const kind = content.characters[e.kind];
  const sprite = kind ? content.sprites[kind.id] : undefined;
  const img = sprite ? image(sprite.image) : null;
  if (!kind || !sprite || !img) return false;
  const frames = !e.onGround ? sprite.frames.air : Math.abs(e.vx) > 1 ? sprite.frames.run : sprite.frames.idle;
  const f = frames[Math.floor((frame * sprite.fps) / 60) % frames.length]!;
  const cols = Math.max(1, Math.floor(img.naturalWidth / sprite.cell.w));
  g.save();
  if (e.facing < 0) {
    g.translate(x + kind.box.w + sprite.anchor.x, y - sprite.anchor.y);
    g.scale(-1, 1);
  } else {
    g.translate(x - sprite.anchor.x, y - sprite.anchor.y);
  }
  g.drawImage(img, (f % cols) * sprite.cell.w, Math.floor(f / cols) * sprite.cell.h, sprite.cell.w, sprite.cell.h, 0, 0, sprite.cell.w, sprite.cell.h);
  g.restore();
  return true;
}
