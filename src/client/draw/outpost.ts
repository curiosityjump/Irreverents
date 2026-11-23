import type { Content } from '../../content/types.ts';
import type { World } from '../../sim/types.ts';
import { drawLookIn } from './room-parts.ts';

// DRAFT: plain stand-ins until Step 8 draws the outpost's horn post
// (docs/mechanisms/outposts.md). Everything is read from the post's entity
// (`c.signaler`, Step 12); nothing here listens to events. The post's body
// is drawn by draw/entities.ts like any body; this adds the horn over it.
const HORN = '#e9c46a';
const HORN_DARK = '#a07c2c';
const BROKEN = '#6c757d';
const SPLINTER = '#3d2c1c';
const INK = '#1b1b2f';
const ALARM = '#ef233c';

export type SignalerState = 'working' | 'sounding' | 'broken';

/** What the last frame drew, for the page's debug record (`drawn.signalers`). */
let last: { id: string; state: SignalerState }[] = [];
export function drawnSignalers(): { id: string; state: SignalerState }[] {
  return last;
}

/**
 * The horn posts of the room's outposts. Working: a horn hung on the post.
 * Sounding: the horn raised to the sky, shaking, and over it a bar filling
 * with the call (the time left to stop it). Broken: a splintered top and the
 * horn lying at its foot. With the looks `signaler`, `signaler-sounding` and
 * `signaler-broken`, those are drawn instead, bottom-centre on the post.
 */
export function drawSignalers(g: CanvasRenderingContext2D, world: World, content: Content, roomId: string, ox: number, oy: number): void {
  const drawn: { id: string; state: SignalerState }[] = [];
  for (const op of Object.values(content.outposts ?? {})) {
    if (op.room !== roomId) continue;
    const post = world.entities.find((e) => e.id === op.signaler && e.room === roomId);
    const box = post ? content.characters[post.kind]?.box : undefined;
    if (!post || !box) continue;
    const sig = post.c.signaler;
    const state: SignalerState = sig?.broken ? 'broken' : (sig?.sounding ?? 0) > 0 ? 'sounding' : 'working';
    drawn.push({ id: post.id, state });
    const cx = Math.round(ox + post.x + box.w / 2);
    const top = Math.round(oy + post.y);
    const base = top + box.h;
    const lookId = state === 'working' ? 'signaler' : `signaler-${state}`;
    const T = content.rooms[roomId]?.tile ?? 16;
    if (!drawLookIn(g, content, [lookId], cx - T, base - 3 * T, 2 * T, 3 * T, state === 'sounding' ? sig!.sounding : world.tick)) {
      if (state === 'broken') {
        g.fillStyle = SPLINTER;
        g.fillRect(cx - box.w / 2, top, box.w, 12);
        g.fillStyle = BROKEN;
        g.fillRect(cx - box.w / 2, top + 12, 3, 2);
        g.fillRect(cx + box.w / 2 - 3, top + 11, 3, 3);
        // The horn, lying at the foot of the post.
        g.fillStyle = HORN_DARK;
        g.fillRect(cx + box.w / 2 + 1, base - 3, 8, 3);
        g.fillRect(cx + box.w / 2 + 9, base - 5, 3, 5);
      } else if (state === 'sounding') {
        const shake = Math.floor(sig!.sounding / 4) % 2 === 0 ? -1 : 1;
        g.fillStyle = HORN;
        g.fillRect(cx - 2 + shake, top - 12, 4, 10);
        g.fillRect(cx - 4 + shake, top - 16, 8, 4);
        g.fillStyle = HORN_DARK;
        g.fillRect(cx - 3 + shake, top - 15, 6, 2);
      } else {
        // Hanging on the post's side: a curved horn, mouth to the right.
        g.fillStyle = HORN;
        g.fillRect(cx + box.w / 2, top + 6, 6, 3);
        g.fillRect(cx + box.w / 2 + 5, top + 3, 3, 8);
        g.fillStyle = HORN_DARK;
        g.fillRect(cx + box.w / 2 - 1, top + 6, 2, 2);
      }
    }
    if (state === 'sounding' && sig) {
      g.fillStyle = INK;
      g.fillRect(cx - 9, top - 24, 18, 4);
      g.fillStyle = ALARM;
      g.fillRect(cx - 8, top - 23, Math.round((16 * Math.min(sig.sounding, sig.of)) / Math.max(1, sig.of)), 2);
    }
  }
  last = drawn;
}
