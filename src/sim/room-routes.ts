// Which door leads toward another room: the fact "where did my friend go"
// is drawn from (docs/architecture.md, Step 3's row; Step 5 draws it).
// Pure and content-only: it reads the rooms' doors, never the World.
import type { Door } from '../content/kinds/rooms.ts';
import type { Content } from '../content/types.ts';

/**
 * The door of room `from` that starts the shortest way to room `to`,
 * counted in doors gone through. Null when they are the same room or
 * there is no way. Ties go to the door listed first in the room file.
 *
 * DRAFT: every door counts as usable from anywhere in its room. Whether a
 * body can actually reach the door is the way-out check's business
 * (src/sim/check-rooms.ts), which refuses rooms where it could not.
 */
export function doorToward(content: Content, from: string, to: string): Door | null {
  if (from === to || !content.rooms[from] || !content.rooms[to]) return null;
  // Breadth-first over rooms, remembering which of `from`'s doors each was first reached through.
  const first = new Map<string, Door>();
  const seen = new Set<string>([from]);
  let frontier: string[] = [from];
  while (frontier.length) {
    const next: string[] = [];
    for (const id of frontier) {
      for (const door of content.rooms[id]?.doors ?? []) {
        const far = door.to.room;
        if (seen.has(far) || !content.rooms[far]) continue;
        seen.add(far);
        first.set(far, id === from ? door : first.get(id)!);
        if (far === to) return first.get(far)!;
        next.push(far);
      }
    }
    frontier = next;
  }
  return null;
}
