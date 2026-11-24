import type { Content } from '../../content/types.ts';
import type { SimEvent } from '../../sim/types.ts';
import { queueBanner } from './banner.ts';

// The owner, 2026-11-24, playing on a phone: "Alarms don't seem to do
// anything yet." Measured (docs/plan/step-4.md, "Alarms and the chase, as
// played"): the camp's horn finished and its wave came, but nothing said so,
// and the wave walked in off screen. So a finished call and what it brings are
// announced in the room they happen in, on the shared banner queue.
// DRAFT: the words, colours and times; that only the room's players see them.
// The bell's and whistle's own looks (draw/alert.ts) and the whistle's gauge
// are other slices'; this only adds the words.

const CALL = 'The horn sounds!';
const WAVE = 'Here they come!';
const ROW = 'The guard is here!';
const RED = '#ffb0a0';
/** DRAFT: two and a half seconds of this page's frames. */
const FRAMES = 150;

let lastLatest: unknown = null;
let shown: string[] = [];

/** The alarm banners this page queued (for the page's drawn record). */
export function drawnAlarms(): string[] {
  return shown;
}

/** Fed every frame from main.ts with the server's newest events and the room this page's character is in. */
export function watchAlarmEvents(content: Content, latest: { tick: number; events: readonly SimEvent[] }, room: string): void {
  if (latest === lastLatest) return;
  lastLatest = latest;
  for (const raw of latest.events) {
    const ev = raw as SimEvent & Record<string, unknown>;
    let text = '';
    if (ev.type === 'outpost-call-completed' && content.outposts?.[String(ev.outpost)]?.room === room) text = CALL;
    else if (ev.type === 'outpost-wave' && content.outposts?.[String(ev.outpost)]?.room === room) {
      // The owner, 2026-11-24 ("more enemies of increasing strength"): each row can name itself (content/outposts/ `announce`, the last repeating).
      const said = content.outposts[String(ev.outpost)]!.announce ?? [];
      text = said.length > 0 ? said[Math.min(Number(ev.row) || 0, said.length - 1)]! : WAVE;
    }
    else if (ev.type === 'dispatch-arrived' && ev.area === room) {
      // DRAFT (Step 4, town tiers): a street row can name itself too (content/dispatch/ `announce`, the last repeating).
      const said = content.dispatch?.[room]?.announce ?? [];
      text = said.length > 0 ? said[Math.min(Number(ev.row) || 0, said.length - 1)]! : ROW;
    }
    if (!text) continue;
    queueBanner({ key: `alarm:${ev.type}:${ev.tick}`, text, frames: FRAMES, color: RED });
    shown = [...shown, text].slice(-8);
  }
}
