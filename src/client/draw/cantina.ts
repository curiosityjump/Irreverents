import type { Content } from '../../content/types.ts';
import type { World } from '../../sim/types.ts';
import { cantinaId, partyOf } from '../../sim/cantina.ts';
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

/** One chip of the party row, in game pixels (the view's), as last drawn. */
export interface RowChip {
  kind: string;
  slot: number;
  x: number;
  y: number;
  w: number;
  h: number;
  /** A friend plays it: tapping it is refused (doc 06). */
  taken: boolean;
}
/** What the last frame drew, for the page's tap (main.ts) and its debug record (`drawn.cantina`). */
let last: { row: RowChip[] | null; counter: { player: string; ko: number; falls: number }[] | null } = { row: null, counter: null };
export function drawnCantina(): typeof last {
  return last;
}

/**
 * The cantina's overlays, screen furniture drawn last: the brawl's counter
 * and, for the player `me` only, their open party row (slice B).
 */
export function drawCantina(g: CanvasRenderingContext2D, world: World, content: Content, roomId: string, me?: string): void {
  last = { row: null, counter: null };
  const state = world.entities.find((e) => e.id === cantinaId(roomId))?.c.cantina;
  if (!state) return;
  const pick = me ? state.pick?.[me] : undefined;
  if (pick && me) last.row = drawRow(g, world, content, me, pick.kind);
  if (!state.on) return;
  const players = world.entities
    .filter((e) => e.player !== null && e.room === roomId)
    .sort((p, q) => (p.c.net?.slot ?? 0) - (q.c.net?.slot ?? 0) || (p.id < q.id ? -1 : 1));
  if (players.length === 0) return;
  g.font = FONT;
  g.textBaseline = 'top';
  const colors = content.net.playerColors;
  last.counter = players.map((p) => ({ player: p.player!, ...(state.score[p.id] ?? { ko: 0, falls: 0 }) }));
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

/** DRAFT: the party row's chip, game pixels: about a thumb (44 CSS px) on an iPhone at the scales the shell picks. */
const CHIP_W = 34;
const CHIP_H = 34;
const CHIP_GAP = 8;

/**
 * The party row (D-084: "tap a regular, the party appears across the
 * screen, tap the one to replace"): one chip per member in party order, in
 * its character's colour; a friend's member dimmed and crossed (it cannot be
 * taken, doc 06); the player's own marked by a notch. Over it a small
 * swatch of the newcomer. DRAFT: the whole look, and the hint.
 */
function drawRow(g: CanvasRenderingContext2D, world: World, content: Content, me: string, kind: string): RowChip[] {
  const party = partyOf(world, content);
  const mine = world.entities.find((e) => e.id === me);
  const W = g.canvas.width;
  const total = party.length * CHIP_W + (party.length - 1) * CHIP_GAP;
  const x0 = Math.round((W - total) / 2);
  const y0 = 30;
  g.fillStyle = 'rgba(15, 15, 28, 0.72)';
  g.fillRect(x0 - 6, y0 - 16, total + 12, CHIP_H + 22);
  g.font = FONT;
  g.textBaseline = 'top';
  const newColor = content.characters[kind]?.color ?? PAPER;
  g.fillStyle = INK;
  g.fillRect(x0 - 2, y0 - 13, 10, 10);
  g.fillStyle = newColor;
  g.fillRect(x0 - 1, y0 - 12, 8, 8);
  // DRAFT: the hint's words.
  edgedText(g, 'TAP ONE TO SWAP', x0 + 12, y0 - 12, PAPER, INK);
  const out: RowChip[] = [];
  party.forEach((member, slot) => {
    const x = x0 + slot * (CHIP_W + CHIP_GAP);
    const own = mine?.kind === member;
    const taken = !own && world.entities.some((e) => e.player !== null && e.id !== me && e.kind === member);
    g.fillStyle = INK;
    g.fillRect(x, y0, CHIP_W, CHIP_H);
    g.fillStyle = content.characters[member]?.color ?? PAPER;
    g.globalAlpha = taken ? 0.3 : 1;
    g.fillRect(x + 3, y0 + 3, CHIP_W - 6, CHIP_H - 6);
    g.globalAlpha = 1;
    if (taken) {
      g.fillStyle = INK;
      for (let i = 4; i < CHIP_W - 4; i++) {
        g.fillRect(x + i, y0 + i, 2, 2);
        g.fillRect(x + CHIP_W - 2 - i, y0 + i, 2, 2);
      }
    }
    if (own) {
      g.fillStyle = PAPER;
      g.fillRect(x + CHIP_W / 2 - 3, y0 + CHIP_H - 2, 6, 4);
    }
    out.push({ kind: member, slot, x, y: y0, w: CHIP_W, h: CHIP_H, taken });
  });
  return out;
}
