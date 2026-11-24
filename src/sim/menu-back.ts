// The menu's way back (brief owner-stuck-in-the-quarry, 2026-11-24): where
// "Back to the entrance" or "Back to the cantina" takes a hero, read the same
// way by the page (which choice the menu shows) and by the server
// (src/sim/systems/menu-back.ts, which moves the hero).
//
// INTENT (CLAUDE.md, "There is always a way out": waiting may be a cost;
// being stuck may not). The owner, 2026-11-24, from playing: "My little guy
// died and then i got stuck in the quarry. There are platforms you can jump
// up through, but not back down through, which can close paths. Not a bad
// thing l, just needs accounted for. The menu in the too left corner didn't
// seem to be working either". A hero shut in anywhere gets out by the menu
// without losing the game. Do not remove it.
// DRAFT (the orchestrator's ruling, docs/decisions-log.md "The menu's way
// back"): inside a stage, its entrance, as a start-over; elsewhere, the
// cantina; never in the cantina itself, during its brawl, or while a game
// over is on its way.
import type { Content } from '../content/types.ts';
import { stageOfRoom } from './stage.ts';

export type BackTo = { to: 'entrance'; stage: string; room: string; door: string } | { to: 'cantina'; room: string };

/** Whether a room is one of the cantina's (content/cantina/). */
export function isCantinaRoom(content: Content, room: string): boolean {
  return Object.values(content.cantina ?? {}).some((c) => c.room === room);
}

/** Where the menu's way back from `room` goes, or null when it offers none there (the cantina itself). */
export function menuBackTo(content: Content, room: string): BackTo | null {
  const s = stageOfRoom(content, room);
  if (s) return { to: 'entrance', stage: s.id, room: s.entrance.room, door: s.entrance.door };
  if (!content.hearts) return null;
  const to = content.hearts.gameOver.room;
  if (room === to || isCantinaRoom(content, room)) return null;
  return { to: 'cantina', room: to };
}

/** The menu row's words for it. */
export const backWords = (b: BackTo): string => (b.to === 'entrance' ? 'Back to the entrance' : 'Back to the cantina');
