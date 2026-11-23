import { hallOf } from '../../content/kinds/hall.ts';
import type { Content } from '../../content/types.ts';
import type { Entity, World } from '../../sim/types.ts';
import { FRAME_CREDITED, FRAME_OUT, PEDESTAL_KIND } from '../../sim/hall/record.ts';
import type { HallRecord } from '../../sim/hall/record.ts';
import type { SimEvent } from '../../sim/types.ts';
import { queueBanner } from './banner.ts';
import { drawText, textWidth, useContent } from './fx.ts';

// How a Hall of Legends record looks in the room
// (docs/mechanisms/hall-of-legends.md, "On screen"): a small framed picture
// on its pedestal, a card when a player stands at it, and a banner for a
// few seconds when a new one is hung.
// DRAFT: every look here is a graybox stand-in (colours, sizes, wording);
// Step 8 owns the final art. The picture is the record's `frame` redrawn,
// never stored pixels, so new art redraws every old picture too.

const INK = '#0f0f1c';
const PAPER = '#f4f1de';
const DIM = '#8d93a5';
const GOLD = '#c9a66b';
const WALL = '#2b2d42';
const FLOOR = '#5c6378';
const UNKNOWN = '#8d93a5';
const FONT = 'bold 8px monospace';
const LINE = 9;

/** The picture's size on a pedestal, frame included. Twice this on the card. */
const PIC_W = 28;
const PIC_H = 20;
/** DRAFT: about a tile and a half, measured between the middles of the two boxes. */
const READ_X = 24;
const READ_Y = 28;
/** DRAFT: how long a new legend's banner stays, in milliseconds. */
const BANNER_MS = 3000;
/** The most stats a card shows. */
const CARD_STATS = 4;

/**
 * DRAFT: the shown words for kinds and stats live in `content.hall` (slice
 * B's content kind, not on main when this was written, so it is read
 * loosely here and every word has a fallback made from the id). Tighten to
 * the real type once src/content/kinds/hall.ts exists.
 */
type HallWords = { kinds?: Record<string, { name?: string }>; stats?: Record<string, { label?: string }> };
// Step 7: the content kind exists now (src/content/kinds/hall.ts); read through hallOf, still with the fallbacks.
const words = (content: Content): HallWords => hallOf(content) ?? {};
const fromId = (id: string): string => id.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/-/g, ' ').toLowerCase();

/** A pedestal's record, or null for anything else. */
function recordOf(e: Entity): HallRecord | null {
  const record = e.c.hall?.record;
  return e.kind === PEDESTAL_KIND && record && record.frame && Array.isArray(record.frame.bodies) ? record : null;
}

/**
 * The picture: the record's bodies as tiny blocks in their character
 * colours, at their places scaled into the frame. Knocked-out bodies lie
 * flat; a credited player has a bright pixel over the head. Whole pixels,
 * no text. `scale` 1 is the pedestal's size, 2 the card's.
 */
function drawPicture(g: CanvasRenderingContext2D, record: HallRecord, content: Content, x: number, y: number, scale: number): void {
  const w = PIC_W * scale;
  const h = PIC_H * scale;
  g.fillStyle = GOLD;
  g.fillRect(x, y, w, h);
  const ix = x + scale;
  const iy = y + scale;
  const iw = w - 2 * scale;
  const ih = h - 2 * scale;
  g.fillStyle = WALL;
  g.fillRect(ix, iy, iw, ih);

  const bodies = record.frame.bodies.map(([kind, bx, by, facing, flags]) => {
    const box = content.characters[kind]?.box ?? { w: 12, h: 16 };
    return { color: content.characters[kind]?.color ?? UNKNOWN, bx, by, bw: box.w, bh: box.h, facing, flags };
  });
  if (bodies.length === 0) return;
  // The part of the room the picture shows: around the bodies, never
  // closer than about five tiles across, so two bodies side by side stay small.
  const left = Math.min(...bodies.map((b) => b.bx));
  const right = Math.max(...bodies.map((b) => b.bx + b.bw));
  const top = Math.min(...bodies.map((b) => b.by));
  const bottom = Math.max(...bodies.map((b) => b.by + b.bh));
  const floorH = scale;
  const k = Math.min(iw / Math.max(right - left, 84), (ih - floorH - 2 * scale) / Math.max(bottom - top, 48));
  const cx = (left + right) / 2;
  g.fillStyle = FLOOR;
  g.fillRect(ix, iy + ih - floorH, iw, floorH);
  for (const b of bodies) {
    const out = (b.flags & FRAME_OUT) !== 0;
    // Lying flat: the box turned on its side, resting on its own feet line.
    const pw = Math.max(scale * 2, Math.round((out ? b.bh : b.bw) * k));
    const ph = Math.max(scale * 2, Math.round((out ? b.bw : b.bh) * k));
    const midX = ix + iw / 2 + (b.bx + b.bw / 2 - cx) * k;
    const feet = iy + ih - floorH - (bottom - (b.by + b.bh)) * k;
    const px = Math.max(ix, Math.min(ix + iw - pw, Math.round(midX - pw / 2)));
    const py = Math.max(iy + scale, Math.round(feet) - ph);
    g.fillStyle = b.color;
    g.fillRect(px, py, pw, ph);
    if (!out) {
      g.fillStyle = INK;
      g.fillRect(b.facing > 0 ? px + pw - scale : px, py + scale, scale, scale);
    }
    if (b.flags & FRAME_CREDITED) {
      g.fillStyle = PAPER;
      g.fillRect(px + ((pw - scale) >> 1), py - scale - Math.min(scale, 1), scale, scale);
    }
  }
}

function ordinal(n: number): string {
  const tens = n % 100;
  if (tens >= 11 && tens <= 13) return `${n}th`;
  return `${n}${['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'}`;
}

/** Break a text into at most `max` lines no wider than `width`; the last line is cut with "…" if it must be. */
function wrap(g: CanvasRenderingContext2D, text: string, width: number, max: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${word}` : word;
    if (line && textWidth(g, next, 'light') > width) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  const kept = lines.slice(0, max);
  if (lines.length > max) kept[max - 1] = `${kept[max - 1]}…`;
  return kept.map((l) => {
    let out = l;
    while (out.length > 1 && textWidth(g, out, 'light') > width) out = `${out.slice(0, -2)}…`;
    return out;
  });
}

/** The lines of a record's card, top to bottom. */
function cardLines(g: CanvasRenderingContext2D, record: HallRecord, world: World, content: Content, lasting: boolean, width: number): { text: string; color: string }[] {
  const w = words(content);
  const lines: { text: string; color: string }[] = [];
  for (const text of wrap(g, record.title, width, 2)) lines.push({ text, color: PAPER });

  // DRAFT: its standing among records of its kind in the world, by score ("2nd of 5").
  const peers = world.entities.map(recordOf).filter((r): r is HallRecord => r !== null && r.kind === record.kind);
  const rank = 1 + peers.filter((r) => r.score > record.score).length;
  const kindName = w.kinds?.[record.kind]?.name ?? fromId(record.kind);
  lines.push({ text: wrap(g, `${kindName} · ${ordinal(rank)} of ${Math.max(peers.length, 1)}`, width, 1)[0] ?? '', color: GOLD });

  // Who was there: the name if the record has one, else the character kind's shown name.
  const names = record.who.map((p) => p.name ?? content.characters[p.character]?.name ?? fromId(p.character));
  let who = '';
  for (let i = 0; i < names.length; i++) {
    const rest = names.length - i - 1;
    const next = who ? `${who}, ${names[i]}` : names[i]!;
    if (who && textWidth(g, rest ? `${next} +${rest}` : next, 'light') > width) {
      who = `${who} +${names.length - i}`;
      break;
    }
    who = next;
  }
  if (who) lines.push({ text: wrap(g, who, width, 1)[0] ?? '', color: PAPER });

  // DRAFT: up to four stats that are not zero, in the order content lists them (else the record's own order), two to a line.
  const order = w.stats ? Object.keys(w.stats) : [];
  const ids = [...order.filter((id) => id in record.stats), ...Object.keys(record.stats).filter((id) => !order.includes(id))];
  const shown = ids.filter((id) => record.stats[id]).slice(0, CARD_STATS);
  const stat = (id: string): string => `${w.stats?.[id]?.label ?? fromId(id)} ${Math.round(record.stats[id]! * 10) / 10}`;
  for (let i = 0; i < shown.length; i += 2) {
    const pair = shown[i + 1] ? `${stat(shown[i]!)}   ${stat(shown[i + 1]!)}` : stat(shown[i]!);
    if (shown[i + 1] && textWidth(g, pair, 'light') > width) {
      lines.push({ text: wrap(g, stat(shown[i]!), width, 1)[0] ?? '', color: DIM });
      lines.push({ text: wrap(g, stat(shown[i + 1]!), width, 1)[0] ?? '', color: DIM });
    } else lines.push({ text: pair, color: DIM });
  }
  // DRAFT wording. Shown only when the server says records are in memory (no storage volume).
  if (!lasting) lines.push({ text: wrap(g, 'Not saved: gone when the game restarts', width, 1)[0] ?? '', color: '#ef8354' });
  return lines;
}

/** A panel across the top of the screen: the picture at twice its size on the left, lines of text on the right. */
function drawPanel(g: CanvasRenderingContext2D, record: HallRecord, content: Content, lines: { text: string; color: string }[], pictureScale: number): void {
  const viewW = g.canvas.width;
  const picW = PIC_W * pictureScale;
  const picH = PIC_H * pictureScale;
  const pad = 4;
  const w = Math.min(viewW - 8, 264);
  const h = Math.max(picH, lines.length * LINE) + 2 * pad;
  const x = Math.round((viewW - w) / 2);
  const y = 4;
  g.fillStyle = GOLD;
  g.fillRect(x - 1, y - 1, w + 2, h + 2);
  g.fillStyle = INK;
  g.fillRect(x, y, w, h);
  drawPicture(g, record, content, x + pad, y + pad, pictureScale);
  g.font = FONT;
  g.textBaseline = 'top';
  g.textAlign = 'left';
  lines.forEach((line, i) => {
    // Round 2: the pixel font, light letters recoloured per line; else the canvas's letters as before.
    if (drawText(g, line.text, x + pad + picW + pad, y + pad + i * LINE, 'light', line.color)) return;
    g.fillStyle = line.color;
    g.fillText(line.text, x + pad + picW + pad, y + pad + i * LINE);
  });
}

/** Pedestals this page has already seen, so only a newly hung one is announced. Null until the first frame with a world in it. */
let seen: Set<string> | null = null;
let banner: { id: string; until: number } | null = null;

/**
 * Everything the Hall shows: each pedestal's picture, then the banner for a
 * newly hung record, or else the card of the pedestal a player stands at.
 */
export function drawHall(g: CanvasRenderingContext2D, world: World, content: Content, roomId: string, ox: number, oy: number): void {
  useContent(content);
  const pedestals: { e: Entity; record: HallRecord }[] = [];
  for (const e of world.entities) {
    const record = recordOf(e);
    if (record) pedestals.push({ e, record });
  }

  // A new legend is announced by itself, wherever the player is.
  // INTENT: the banner takes no input and stops nothing; it goes by itself.
  // DRAFT: "was not here when this page joined" is read as "was not in the
  // first frame that had anything in it". If the network layer fills the
  // world over several frames, the stored records would each be announced:
  // several arriving in one frame are therefore taken as old, and only a
  // single new one is announced.
  const now = performance.now();
  if (seen === null) {
    if (world.entities.length > 0) seen = new Set(pedestals.map((p) => p.e.id));
  } else {
    const fresh = pedestals.filter((p) => !seen!.has(p.e.id));
    for (const p of fresh) seen.add(p.e.id);
    // Step 7: a new legend is announced from the world's `hall-legend` event (watchHallEvents),
    // which reaches every page; a pedestal arriving is no longer announced by itself, or a page
    // in the gallery would announce it twice. INTENT: a page is sent only the entities of its
    // own room (src/server/game.ts), so the pedestal cannot be how a page in the camp hears it.
    void BANNER_MS;
  }

  const boxOf = (e: Entity): { w: number; h: number } => content.characters[e.kind]?.box ?? { w: 16, h: 16 };
  for (const { e, record } of pedestals) {
    if (e.room !== roomId) continue;
    // The picture stands on the pedestal's body and moves with it.
    const x = ox + Math.round(e.x) + Math.round((boxOf(e).w - PIC_W) / 2);
    const y = oy + Math.round(e.y) - PIC_H - 1;
    drawPicture(g, record, content, x, y, 1);
  }

  g.save();
  g.font = FONT;
  const textW = Math.min(g.canvas.width - 8, 264) - 3 * 4 - PIC_W * 2;

  const announced = banner && now < banner.until ? pedestals.find((p) => p.e.id === banner!.id) : undefined;
  if (announced) {
    const lines = [{ text: 'A new legend', color: GOLD }, ...wrap(g, announced.record.title, textW + PIC_W, 2).map((text) => ({ text, color: PAPER }))];
    drawPanel(g, announced.record, content, lines, 1);
    g.restore();
    return;
  }
  banner = null;

  // The card. INTENT: no button. Walking up to a pedestal shows it and
  // walking away hides it: iPhone first, and there is always a way out.
  // It takes no input, holds nobody, and stays in the top half of the
  // screen, clear of where the touch controls go (Step 5).
  // DRAFT: render() is not told which character is this page's own, so any
  // player's character standing at a pedestal in the room on screen shows
  // its card. Narrow to the local player once render() is given one.
  let best: { record: HallRecord; lasting: boolean; d: number } | null = null;
  for (const { e, record } of pedestals) {
    if (e.room !== roomId) continue;
    const pb = boxOf(e);
    for (const p of world.entities) {
      if (p.player === null || p.room !== roomId) continue;
      const b = boxOf(p);
      const dx = Math.abs(p.x + b.w / 2 - (e.x + pb.w / 2));
      const dy = Math.abs(p.y + b.h / 2 - (e.y + pb.h / 2));
      if (dx > READ_X || dy > READ_Y) continue;
      // DRAFT: `lasting: false` beside the record is how the server will say "kept in memory only" (see the mechanism doc); absent means kept.
      const lasting = (e.c.hall as { lasting?: boolean } | undefined)?.lasting !== false;
      if (!best || dx + dy < best.d) best = { record, lasting, d: dx + dy };
    }
  }
  if (best) drawPanel(g, best.record, content, cardLines(g, best.record, world, content, best.lasting, textW), 2);
  g.restore();
}

/** Step 7 (DRAFT): the words of a new legend's banner, before its title. No digits (t-no-numbers). */
const NEW_LEGEND = 'A new legend';
let lastLatest: unknown = null;
let announced: string[] = [];

/** The legends this page has announced (for the page's drawn record): their titles, newest last. */
export function drawnHall(): { announced: string[] } {
  return { announced };
}

/**
 * Fed every frame from main.ts with the server's newest events: a new
 * legend, anyone's, anywhere in this world, queues its banner (draw/banner.ts).
 * INTENT: the banner takes no input and stops nothing; it goes by itself.
 */
export function watchHallEvents(latest: { tick: number; events: readonly SimEvent[] }): void {
  if (latest === lastLatest) return;
  lastLatest = latest;
  for (const ev of latest.events) {
    if (ev.type !== 'hall-legend') continue;
    queueBanner({ key: `hall:${ev.n}`, text: `${NEW_LEGEND}: ${ev.title}`, frames: 180, color: GOLD });
    announced = [...announced, ev.title].slice(-8);
  }
}
