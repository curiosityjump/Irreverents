import type { Content } from '../../content/types.ts';
import { shotArc } from '../../sim/ranged.ts';
import type { World } from '../../sim/types.ts';

// Step 24 (docs/mechanisms/ranged.md): a thrower's telegraph. While a body
// has `c.rangedAim` (src/sim/systems/ranged-throw.ts), a dotted arc is drawn
// from his hand to where his shot will come down, by the sim's own fall
// (shotArc, src/sim/ranged.ts: moveLoose on a scratch entity), and a mark
// where it lands; the shot itself is drawn held up in his hand by
// draw/weapons.ts (his row in content/grips.json).
// INTENT (D-093, "legible pixels"; the owner's "readable enemies",
// docs/vision.md:74): no shot leaves his hand without having been drawn held
// up, with this arc, for his whole aim. Do not hide it behind a setting.
// DRAFT: the dots' size, colours, spacing and the landing mark; the dots
// fill in from his hand over the aim, so the beat before the throw reads.

/** DRAFT: a pale warm dot with a dark rim, readable on the castle's stone and the night sky. */
const DOT = '#ffe9a8';
const RIM = '#2a1a10';
/** Ticks of flight between two dots. */
const EVERY = 3;

/** What the page drew for throwers this frame, for the checks (window.irreverents.drawn.ranged). */
export interface DrawnRanged {
  /** Each aiming thrower: his entity id, the tick his aim began, and where the arc ends (room px, the shot's middle). */
  aims: { id: string; at: number; x: number; y: number; dots: number }[];
}
let drawn: DrawnRanged = { aims: [] };
export function drawnRanged(): DrawnRanged {
  return drawn;
}

/** Draws each aiming thrower's arc in this room, after the bodies. */
export function drawRanged(g: CanvasRenderingContext2D, world: World, content: Content, roomId: string, ox: number, oy: number): void {
  const now: DrawnRanged = { aims: [] };
  for (const e of world.entities) {
    const aim = e.c.rangedAim;
    if (!aim || e.room !== roomId) continue;
    const pts = shotArc(content, world, e, EVERY);
    if (pts.length < 2) continue;
    const end = pts[pts.length - 1]!;
    const aimTicks = Math.max(1, Math.round((content.npcs[e.c.npc?.kind ?? '']?.ranged?.aim ?? 0.6) * 60));
    // The dots fill in from his hand: a third at once, the rest over the aim.
    const share = Math.min(1, 1 / 3 + ((2 / 3) * Math.max(0, world.tick - aim.at)) / aimTicks);
    const shown = Math.max(1, Math.ceil((pts.length - 1) * share));
    for (let i = 1; i < shown; i++) {
      const p = pts[i]!;
      const x = Math.round(ox + p.x);
      const y = Math.round(oy + p.y);
      g.fillStyle = RIM;
      g.fillRect(x - 2, y - 2, 4, 4);
      g.fillStyle = DOT;
      g.fillRect(x - 1, y - 1, 2, 2);
    }
    // Where it comes down: a small cross, drawn from the first frame so a hero sees the spot to leave.
    const x = Math.round(ox + end.x);
    const y = Math.round(oy + end.y);
    g.fillStyle = RIM;
    g.fillRect(x - 4, y - 1, 9, 3);
    g.fillRect(x - 1, y - 4, 3, 9);
    g.fillStyle = DOT;
    g.fillRect(x - 3, y, 7, 1);
    g.fillRect(x, y - 3, 1, 7);
    now.aims.push({ id: e.id, at: aim.at, x: end.x, y: end.y, dots: shown - 1 });
  }
  drawn = now;
}
