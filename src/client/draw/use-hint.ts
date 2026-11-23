import type { UseAnswer } from '../../sim/use.ts';

const MARK = '#fff1a0';
const EDGE = '#1b1b2f';

/**
 * Step 19 push 2: a small bobbing mark over what a press of Use would act
 * on (a thing, the cantina's bell), the same moment the Use button names it
 * (src/client/use-prompt.ts). Only this page's own answer. A doorway has its
 * own up-arrow (draw/door-hint.ts), so the door entry draws nothing here.
 * DRAFT: the look: a 5x3 down-pointing chevron with a dark edge, bobbing a
 * pixel twice a second. No words, no digits.
 */
export function drawUseHint(g: CanvasRenderingContext2D, answer: UseAnswer | undefined, ox: number, oy: number, frame: number, meTop?: number): void {
  if (!answer || answer.entry === 'door') return;
  const bob = Math.floor(frame / 15) % 2;
  const mid = Math.round(ox + answer.at.x);
  // Over the thing, or over the head of the character standing at it when that is higher (a hero hides a
  // shelf of goods), clear of the player's own mark: the same rule as the doorway's arrow.
  const over = meTop === undefined ? answer.at.y - 9 : Math.min(answer.at.y - 9, meTop - 20);
  const top = Math.round(oy + over) - bob;
  const rows = [5, 3, 1];
  g.fillStyle = EDGE;
  rows.forEach((w, i) => g.fillRect(mid - Math.floor(w / 2) - 1, top + i - 1, w + 2, 3));
  g.fillStyle = MARK;
  rows.forEach((w, i) => g.fillRect(mid - Math.floor(w / 2), top + i, w, 1));
}
