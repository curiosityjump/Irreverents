import type { Content } from '../../content/types.ts';
import { speechLine, speechLineNumber, wrapSpeech } from '../../content/speech.ts';
import { speechTicksPerLine } from '../../sim/systems/audience-speech.ts';
import type { World } from '../../sim/types.ts';
import { drawNine, edgedText } from './fx.ts';

// DRAFT: the whole look. A small dark ribbon with pale letters over the
// speaker's head, two rows at most: there to be glanced at or ignored,
// never a dialogue box (the speech is never dialogue; design library doc 03).
const RIBBON = '#2b1d3a';
const EDGE = '#d4af37';
const WORDS = '#f3e9c6';
const ROW = 9;

/**
 * The line each speaker is on, over his head, wherever he is in this room:
 * it follows him when he is carried or thrown. Drawn only for the room the
 * viewer is in (lead's decision 2026-11-23, DRAFT).
 */
export function drawAudience(g: CanvasRenderingContext2D, world: World, content: Content, roomId: string, ox: number, oy: number): void {
  const per = speechTicksPerLine(content.tuning.world.speechLineTime);
  for (const a of Object.values(content.audience ?? {})) {
    const e = world.entities.find((x) => x.id === a.speaker);
    const box = e ? content.characters[e.kind]?.box : undefined;
    if (!e || !box || e.room !== roomId) continue;
    const rows = wrapSpeech(speechLine(a, speechLineNumber(a, e.c.audience?.ticks, per)));
    if (rows.length === 0) continue;
    g.font = 'bold 8px monospace';
    g.textBaseline = 'top';
    const w = Math.ceil(Math.max(...rows.map((r) => g.measureText(r).width))) + 6;
    const h = rows.length * ROW + 3;
    const cx = ox + Math.round(e.x) + box.w / 2;
    const x = Math.max(1, Math.min(g.canvas.width - w - 1, Math.round(cx - w / 2)));
    const y = Math.max(1, Math.min(g.canvas.height - h - 1, oy + Math.round(e.y) - 4 - h));
    // The `ribbon` nine-slice, a little roomier, with edged letters; else the plain ribbon.
    // Its frame is 2 px wider each side, so it is kept 3 px inside the screen.
    const nx = Math.max(3, Math.min(g.canvas.width - w - 3, x));
    const ny = Math.max(3, y);
    if (drawNine(g, 'ribbon', nx - 2, ny - 2, w + 4, h + 4)) {
      rows.forEach((r, i) => edgedText(g, r, nx + 3, ny + 2 + i * ROW, WORDS, RIBBON));
      continue;
    }
    g.fillStyle = EDGE;
    g.fillRect(x - 1, y - 1, w + 2, h + 2);
    g.fillStyle = RIBBON;
    g.fillRect(x, y, w, h);
    g.fillStyle = WORDS;
    rows.forEach((r, i) => g.fillText(r, x + 3, y + 2 + i * ROW));
  }
}
