import type { Content } from '../../content/types.ts';
import { oneMoreDefeats } from '../../sim/beaten.ts';
import type { SimEvent, World } from '../../sim/types.ts';
import { drawnOffset, drawnTop } from './entities.ts';
import type { PlayerView } from './entities.ts';
import { drawFrame, frameOf, lengthOf, look } from './fx.ts';

// Step 5, the owner's report ("enemies collapse but never die";
// src/sim/beaten.ts, docs/mechanisms/combat-and-impact.md "Beaten for good"):
// what a defeat looks like on the page. A defeated bad guy lies still (the
// body is drawn down, as any knocked-out body), then goes in the cut
// `fx-poof` where he lay, from the world's `defeated-gone` event, on every
// page in that room. A bad guy one knock-out from defeat, standing again,
// wears the cut `fx-dizzy` over his head: how close he is to going shows on
// the body (INTENT, the brief: no number over anyone's head, no health bar).
// DRAFT: the daze as the warning, and every size and time here.

/** Poofs playing: where (room pixels, the body's middle), in which room, on which frame they began. */
const playing: { id: string; room: string; x: number; y: number; at: number }[] = [];
let lastLatest: unknown = null;
let frameNow = 0;

/** What the page drew for defeats this frame, for the checks (window.irreverents.drawn.beaten). */
export interface DrawnBeaten {
  /** Poofs drawn this frame: the defeated body's id and where (room pixels). */
  poofs: { id: string; x: number; y: number }[];
  /** Every defeated body this page has been told went, by id, oldest first (kept to the last 32). */
  gone: string[];
  /** Bodies drawn dazed this frame: one more knock-out defeats them. */
  dazed: string[];
}
let drawn: DrawnBeaten = { poofs: [], gone: [], dazed: [] };
let gone: string[] = [];
export function drawnBeaten(): DrawnBeaten {
  return drawn;
}

/** Fed every frame from main.ts with the server's newest events: each `defeated-gone` starts a poof. */
export function watchBeatenEvents(latest: { tick: number; events: readonly SimEvent[] }, frame: number): void {
  frameNow = frame;
  if (latest === lastLatest) return;
  lastLatest = latest;
  for (const ev of latest.events) {
    if (ev.type !== 'defeated-gone') continue;
    playing.push({ id: ev.target, room: ev.room, x: ev.x, y: ev.y, at: frame });
    gone = [...gone.filter((g) => g !== ev.target), ev.target].slice(-32);
  }
}

/** Draws the poofs in this room and the daze over any bad guy one knock-out from defeat, after the bodies. */
export function drawBeaten(g: CanvasRenderingContext2D, world: World, content: Content, roomId: string, ox: number, oy: number, view?: PlayerView): void {
  const frame = view?.frame ?? frameNow;
  const now: DrawnBeaten = { poofs: [], gone, dazed: [] };
  const daze = look('fx-dizzy');
  for (const e of world.entities) {
    if (e.room !== roomId || !oneMoreDefeats(content, e)) continue;
    const box = content.characters[e.kind]?.box;
    if (!box) continue;
    now.dazed.push(e.id);
    if (!daze) continue;
    const off = drawnOffset(e.id);
    const top = drawnTop(e.id) ?? oy + Math.round(e.y) + off.y;
    drawFrame(g, daze, frameOf(daze, frame, true), ox + Math.round(e.x) + off.x + Math.round(box.w / 2 - daze.w / 2), Math.round(Math.max(top, 0) - daze.h / 2 + 2));
  }
  const poof = look('fx-poof');
  for (let i = playing.length - 1; i >= 0; i--) {
    const p = playing[i]!;
    const age = frame - p.at;
    // DRAFT: with no look yet, a poof still counts as drawn for its first half second.
    if (age < 0 || age >= (poof ? lengthOf(poof) : 30)) {
      playing.splice(i, 1);
      continue;
    }
    if (p.room !== roomId) continue;
    now.poofs.push({ id: p.id, x: p.x, y: p.y });
    if (!poof) continue;
    const f = frameOf(poof, age, false);
    if (f >= 0) drawFrame(g, poof, f, ox + Math.round(p.x) - poof.w / 2, oy + Math.round(p.y) - poof.h / 2);
  }
  drawn = now;
}
