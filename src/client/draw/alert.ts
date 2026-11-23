import type { Content } from '../../content/types.ts';
import type { World } from '../../sim/types.ts';

// DRAFT: plain stand-ins (Step 8 and Step 5 own the final look of marks and
// the alert display). Everything is read from entities the page receives:
// the bell is a thing's entity (`c.thing`, `c.ringing`), the alert is the
// area's bodiless entity (`c.alert`). Nothing here listens to events.
const BRASS = '#ffd166';
const BROKEN = '#6c757d';
const INK = '#1b1b2f';
const POST = '#8d6e63';
const ALARM = '#ef233c';
const PAPER = '#f8f9fa';

/**
 * The call points of a room and the area's alert level.
 * A working bell is a brass bell on a wooden post; while someone rings it, it
 * swings and a bar over it fills with the call's progress (the time left
 * to stop the call); a broken one is a grey stump. The alert is up to
 * three red marks in the top-left corner; at 0 nothing is shown.
 */
export function drawAlert(g: CanvasRenderingContext2D, world: World, content: Content, roomId: string, ox: number, oy: number): void {
  const room = content.rooms[roomId];
  if (!room) return;
  for (const e of world.entities) {
    if (e.room !== roomId || !e.c.thing) continue;
    const def = content.placements[roomId]?.things?.find((t) => t.id === e.id);
    if (def?.look !== 'bell') continue;
    const cx = ox + e.x + room.tile / 2;
    const base = oy + e.y + room.tile;
    g.fillStyle = POST;
    g.fillRect(cx - 1, base - 20, 2, 20);
    g.fillRect(cx - 3, base - 2, 6, 2);
    if (e.c.thing.takenBy !== null) {
      // Broken: the post, and what is left of the bell lying at its foot.
      g.fillStyle = BROKEN;
      g.fillRect(cx - 5, base - 3, 4, 3);
      g.fillRect(cx + 2, base - 2, 3, 2);
      continue;
    }
    const ring = e.c.ringing;
    const swing = ring ? (Math.floor(ring.ticks / 6) % 2 === 0 ? -2 : 2) : 0;
    g.fillStyle = BRASS;
    g.fillRect(cx - 3 + swing, base - 22, 6, 2);
    g.fillRect(cx - 4 + swing, base - 20, 8, 6);
    g.fillStyle = INK;
    g.fillRect(cx - 1 + swing, base - 14, 2, 2);
    if (ring) {
      g.fillStyle = INK;
      g.fillRect(cx - 9, base - 40, 18, 4);
      g.fillStyle = ALARM;
      g.fillRect(cx - 8, base - 39, Math.round((16 * Math.min(ring.ticks, ring.of)) / Math.max(1, ring.of)), 2);
    }
  }
  const level = world.entities.find((e) => e.room === roomId && e.c.alert)?.c.alert?.level ?? 0;
  for (let i = 0; i < level; i++) {
    const x = 6 + i * 12;
    g.fillStyle = INK;
    g.fillRect(x - 1, 5, 10, 12);
    g.fillStyle = ALARM;
    g.fillRect(x, 6, 8, 10);
    g.fillStyle = PAPER;
    g.fillRect(x + 3, 8, 2, 4);
    g.fillRect(x + 3, 13, 2, 2);
  }
}
