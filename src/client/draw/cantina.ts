import type { Content } from '../../content/types.ts';
import type { World } from '../../sim/types.ts';
import { cantinaId } from '../../sim/cantina.ts';
import { edgedText } from './fx.ts';
import { drawLookIn } from './room-parts.ts';

// The cantina brawl's running counter (Step 11, D-086;
// docs/mechanisms/cantina.md): each player in the room, by their colour,
// with this brawl's knock-outs and falls, along the top of the view, only
// while a brawl is on.
// INTENT (D-020, "impact over numbers"): the numbers live here, at the top
// of the screen, and never over a hit or a body.
// DRAFT: the look and the wording are a graybox stand-in for the owner to
// judge; Step 8 owns the final look.

const INK = '#1b1b2f';
const PAPER = '#f8f9fa';
const FONT = 'bold 8px monospace';
const SWATCH = 7;
const GAP = 8;

export function drawCantina(g: CanvasRenderingContext2D, world: World, content: Content, roomId: string): void {
  const state = world.entities.find((e) => e.id === cantinaId(roomId))?.c.cantina;
  if (!state?.on) return;
  const players = world.entities
    .filter((e) => e.player !== null && e.room === roomId)
    .sort((p, q) => (p.c.net?.slot ?? 0) - (q.c.net?.slot ?? 0) || (p.id < q.id ? -1 : 1));
  if (players.length === 0) return;
  g.font = FONT;
  g.textBaseline = 'top';
  const colors = content.net.playerColors;
  const chips = players.map((p) => {
    const s = state.score[p.id] ?? { ko: 0, falls: 0 };
    const text = `${s.ko} KO ${s.falls} FALL`;
    return { text, color: p.c.net ? colors[p.c.net.slot % colors.length]! : (content.characters[p.kind]?.color ?? PAPER), w: SWATCH + 3 + Math.ceil(g.measureText(text).width) };
  });
  const total = chips.reduce((n, c) => n + c.w, 0) + GAP * (chips.length - 1) + 6;
  let x = Math.max(2, Math.round((g.canvas.width - total) / 2));
  const y = 3;
  g.fillStyle = 'rgba(15, 15, 28, 0.6)';
  g.fillRect(x - 3, y - 2, total, 13);
  for (const c of chips) {
    g.fillStyle = INK;
    g.fillRect(x - 1, y, SWATCH + 2, SWATCH + 2);
    g.fillStyle = c.color;
    g.fillRect(x, y + 1, SWATCH, SWATCH);
    edgedText(g, c.text, x + SWATCH + 3, y, PAPER, INK);
    x += c.w + GAP;
  }
}

/** DRAFT: how long (ticks) the bell shows ringing after a press. */
const RING_TICKS = 45;
const POST = '#6c584c';
const BRASS = '#e9c46a';

/**
 * The bell that stops the fight (the owner, Q-008), drawn with the room
 * behind the bodies: the `bell` look, `bell-ringing` for a moment after a
 * press, else a graybox post and bell. Drawn from the cantina file, so it
 * shows even before the server's state arrives.
 */
export function drawCantinaBell(g: CanvasRenderingContext2D, world: World, content: Content, roomId: string, ox: number, oy: number): void {
  const file = content.cantina?.[roomId];
  const room = content.rooms[roomId];
  if (!file || !room) return;
  const T = room.tile;
  const rang = world.entities.find((e) => e.id === cantinaId(roomId))?.c.cantina?.rang ?? -1;
  const since = world.tick - rang;
  const ringing = rang >= 0 && since >= 0 && since < RING_TICKS;
  const x = ox + file.bell.tile[0] * T;
  const y = oy + file.bell.tile[1] * T;
  if (drawLookIn(g, content, [ringing ? 'bell-ringing' : 'bell'], x, y, T, T, ringing ? since : world.tick)) return;
  const cx = x + T / 2;
  const base = y + T;
  g.fillStyle = POST;
  g.fillRect(cx - 1, base - 20, 2, 20);
  g.fillRect(cx - 3, base - 2, 6, 2);
  const swing = ringing ? (Math.floor(since / 6) % 2 === 0 ? -2 : 2) : 0;
  g.fillStyle = BRASS;
  g.fillRect(cx - 3 + swing, base - 22, 6, 2);
  g.fillRect(cx - 4 + swing, base - 20, 8, 6);
}
