import { hallOf } from '../../content/kinds/hall.ts';
import type { Content } from '../../content/types.ts';
import type { Entity, World } from '../../sim/types.ts';
import { FRAME_CREDITED, FRAME_OUT, PEDESTAL_KIND } from '../../sim/hall/record.ts';
import type { FrameBody, HallRecord } from '../../sim/hall/record.ts';
import type { SimEvent } from '../../sim/types.ts';
import { drawnBanner, queueBanner } from './banner.ts';
import { image } from './images.ts';
import { look } from './looks.ts';
import { drawText, safeView, textWidth, useContent } from './fx.ts';

// How a Hall of Legends record looks in the room
// (docs/mechanisms/hall-of-legends.md, "On screen"): a small framed picture
// on its pedestal, a card when a player stands at it, and a banner for a
// few seconds when a new one is hung.
// Push 3: the picture is the record's bodies drawn with their own sprites in
// the P04 hall atlas's frame (`hall-frame`), on the atlas's plinth (the
// pedestal's sprite sheet, content/sprites/pedestal.json); the same picture
// stands under a new legend's banner. The card's panel and words are still
// DRAFT stand-ins. The picture is the record's `frame` redrawn, never stored
// pixels, so new art redraws every old picture too.

const INK = '#0f0f1c';
const PAPER = '#f4f1de';
const DIM = '#8d93a5';
const GOLD = '#c9a66b';
const WALL = '#2b2d42';
const FLOOR = '#5c6378';
const UNKNOWN = '#8d93a5';
const PIP = '#ffd090';
const FONT = 'bold 8px monospace';
const LINE = 9;

/** The picture's size on a pedestal, frame included. Twice this on the card. */
const PIC_W = 32;
const PIC_H = 24;
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

/** Where a sheet's frame for a pose sits, or null when the kind has no sheet (or its image is still loading). */
interface Pose { img: HTMLImageElement; sx: number; sy: number; cw: number; ch: number; footX: number; footY: number }
function poseOf(content: Content, kind: string, out: boolean): Pose | null {
  const sheet = content.sprites[kind] as { image: string; cell: { w: number; h: number }; anchor: { x: number; y: number }; frames: Record<string, number[] | undefined> } | undefined;
  const box = content.characters[kind]?.box;
  const img = sheet ? image(sheet.image) : null;
  if (!sheet || !box || !img || !img.naturalWidth) return null;
  // The contract's fallbacks (sprites.ts CHAIN): down, else hurt, else idle; standing is idle's first frame.
  const list = (out ? (sheet.frames.down ?? sheet.frames.hurt) : undefined) ?? sheet.frames.idle ?? [0];
  const f = list[out ? list.length - 1 : 0] ?? 0;
  const cols = Math.max(1, Math.floor(img.naturalWidth / sheet.cell.w));
  return {
    img,
    sx: (f % cols) * sheet.cell.w,
    sy: Math.floor(f / cols) * sheet.cell.h,
    cw: sheet.cell.w,
    ch: sheet.cell.h,
    footX: sheet.anchor.x + box.w / 2,
    footY: sheet.anchor.y + box.h,
  };
}

/**
 * The frame, nine-sliced from the P04 atlas's `hall-frame` (14x14): its
 * corners kept, its edges stretched, each atlas pixel `scale` pixels. The
 * inside is painted over (a wall and a floor), so the atlas's grey canvas
 * never shows. Returns false when the look has not loaded (draw the old box).
 * DRAFT: the insets are read off the piece (dark line, grey margin, gold
 * moulding: four on the left and top, two on the right and bottom).
 */
const FRAME_INSET = { l: 4, t: 4, r: 2, b: 2 };
function drawFrameLook(g: CanvasRenderingContext2D, content: Content, x: number, y: number, w: number, h: number, scale: number): boolean {
  const l = look(content, 'hall-frame');
  if (!l) return false;
  const { l: L, t: T, r: R, b: B } = FRAME_INSET;
  const piece = (sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, dw: number, dh: number): void => {
    if (dw > 0 && dh > 0) g.drawImage(l.img, l.x + sx, l.y + sy, sw, sh, dx, dy, dw, dh);
  };
  const midW = w - (L + R) * scale;
  const midH = h - (T + B) * scale;
  // Corners.
  piece(0, 0, L, T, x, y, L * scale, T * scale);
  piece(l.w - R, 0, R, T, x + w - R * scale, y, R * scale, T * scale);
  piece(0, l.h - B, L, B, x, y + h - B * scale, L * scale, B * scale);
  piece(l.w - R, l.h - B, R, B, x + w - R * scale, y + h - B * scale, R * scale, B * scale);
  // Edges: one plain column or row of the piece, stretched (the top's highlights stay in its corners).
  piece(L + 1, 0, 1, T, x + L * scale, y, midW, T * scale);
  piece(L + 1, l.h - B, 1, B, x + L * scale, y + h - B * scale, midW, B * scale);
  piece(0, T + 1, L, 1, x, y + T * scale, L * scale, midH);
  piece(l.w - R, T + 1, R, 1, x + w - R * scale, y + T * scale, R * scale, midH);
  return true;
}

/**
 * The picture: the record's bodies drawn with their own sprites (the first
 * frame of standing, or of lying down when knocked out), facing as they
 * faced, at their places in the room drawn closer together to fit, inside
 * the P04 atlas's frame. A credited player has a gold pip over the head.
 * Whole pixels, no text. `scale` 1 is the pedestal's size (sprites at half
 * size), 2 the card's and the banner's (sprites at their own size).
 * A kind with no sheet (or before images load) is its coloured box, as before.
 * DRAFT: every size and the half-size sprites on the pedestal.
 */
function drawPicture(g: CanvasRenderingContext2D, bodies: readonly FrameBody[], content: Content, x: number, y: number, scale: number): void {
  const w = PIC_W * scale;
  const h = PIC_H * scale;
  const framed = drawFrameLook(g, content, x, y, w, h, scale);
  if (!framed) {
    g.fillStyle = GOLD;
    g.fillRect(x, y, w, h);
  }
  const ix = x + (framed ? FRAME_INSET.l : 1) * scale;
  const iy = y + (framed ? FRAME_INSET.t : 1) * scale;
  const iw = w - (framed ? FRAME_INSET.l + FRAME_INSET.r : 2) * scale;
  const ih = h - (framed ? FRAME_INSET.t + FRAME_INSET.b : 2) * scale;
  g.fillStyle = WALL;
  g.fillRect(ix, iy, iw, ih);
  const floorH = scale;
  g.fillStyle = FLOOR;
  g.fillRect(ix, iy + ih - floorH, iw, floorH);
  if (bodies.length === 0) return;

  const s = scale / 2; // sprite size: half on the pedestal, whole on the card
  const list = bodies.map(([kind, bx, by, facing, flags]) => {
    const box = content.characters[kind]?.box ?? { w: 12, h: 16 };
    return { kind, color: content.characters[kind]?.color ?? UNKNOWN, bx, by, bw: box.w, bh: box.h, facing, flags, out: (flags & FRAME_OUT) !== 0 };
  });
  // Places are drawn closer together than the sprites, so a fight spread over a screen fits the frame.
  const left = Math.min(...list.map((b) => b.bx + b.bw / 2));
  const right = Math.max(...list.map((b) => b.bx + b.bw / 2));
  const bottom = Math.max(...list.map((b) => b.by + b.bh));
  const top = Math.min(...list.map((b) => b.by));
  const margin = 7 * scale;
  const kx = Math.min(s, (iw - 2 * margin) / Math.max(1, right - left));
  const ky = Math.min(s, (ih - floorH - 12 * scale) / Math.max(1, bottom - top - 16));
  const cx = (left + right) / 2;
  const floorY = iy + ih - floorH;

  g.save();
  g.beginPath();
  g.rect(ix, iy, iw, ih);
  g.clip();
  g.imageSmoothingEnabled = false;
  // The standing first, then the fallen at their feet (in front, so a felled body shows), the credited players last (on top).
  const order = [...list].sort((a, b) => (a.flags & FRAME_CREDITED) - (b.flags & FRAME_CREDITED) || Number(a.out) - Number(b.out));
  for (const b of order) {
    const fx = Math.round(ix + iw / 2 + (b.bx + b.bw / 2 - cx) * kx);
    const fy = Math.round(floorY - Math.max(0, bottom - (b.by + b.bh)) * ky);
    const pose = poseOf(content, b.kind, b.out);
    let head = fy - Math.round(b.bh * s);
    if (pose) {
      const dw = Math.round(pose.cw * s);
      const dh = Math.round(pose.ch * s);
      const left0 = b.facing < 0 ? fx - Math.round((pose.cw - pose.footX) * s) : fx - Math.round(pose.footX * s);
      const top0 = fy - Math.round(pose.footY * s);
      if (b.facing < 0) {
        g.save();
        g.translate(left0 + dw, top0);
        g.scale(-1, 1);
        g.drawImage(pose.img, pose.sx, pose.sy, pose.cw, pose.ch, 0, 0, dw, dh);
        g.restore();
      } else g.drawImage(pose.img, pose.sx, pose.sy, pose.cw, pose.ch, left0, top0, dw, dh);
    } else {
      // No sheet: the coloured box, lying on its side when out.
      const pw = Math.max(scale, Math.round((b.out ? b.bh : b.bw) * s));
      const ph = Math.max(scale, Math.round((b.out ? b.bw : b.bh) * s));
      g.fillStyle = b.color;
      g.fillRect(fx - (pw >> 1), fy - ph, pw, ph);
      head = fy - ph;
    }
    if (b.flags & FRAME_CREDITED && !b.out) {
      g.fillStyle = PIP;
      g.fillRect(fx - Math.floor(scale / 2), Math.max(iy, head - 2 * scale), scale, scale);
    }
  }
  g.restore();
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
  // Push 3: below the party plate (and the menu beside it) when they would overlap, as banner.ts does;
  // the plate is drawn after this, so it would cover the card's picture. Last frame's plate: a frame late at most.
  let y = 4 + safeView.top;
  if (plateRect && x < plateRect.x + plateRect.w && x + w > plateRect.x && y < plateRect.y + plateRect.h) y = plateRect.y + plateRect.h + 3;
  g.fillStyle = GOLD;
  g.fillRect(x - 1, y - 1, w + 2, h + 2);
  g.fillStyle = INK;
  g.fillRect(x, y, w, h);
  drawPicture(g, record.frame.bodies, content, x + pad, y + pad, pictureScale);
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
    // Push 3: on the plinth's top (its sprite stands two pixels above the box), overlapping it by one.
    const y = oy + Math.round(e.y) - 2 - PIC_H + 1;
    drawPicture(g, record.frame.bodies, content, x, y, 1);
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
/** Push 3: the pictures of legends announced lately, by their banner's key. */
const pictures = new Map<string, readonly FrameBody[]>();
/** Push 3: whether the last frame drew a legend's picture under its banner (the page's drawn record). */
let pictureShown = false;
/** Push 3: the party plate's place on the last frame (draw/hud.ts, via render.ts), so the card can stand clear of it. */
let plateRect: { x: number; y: number; w: number; h: number } | undefined;

/** The legends this page has announced (for the page's drawn record): their titles, newest last. */
export function drawnHall(): { announced: string[]; picture: boolean } {
  return { announced, picture: pictureShown };
}

/**
 * Push 3: while a new legend's banner is up (draw/banner.ts), its picture
 * at the card's size, centred just under it. Called by render.ts right
 * after drawBanners, with the same party plate (kept for the card: drawPanel).
 * INTENT: like the banner, it takes no input and stops nothing; it goes with it.
 * DRAFT: where the banner stands is worked out the way banner.ts does it
 * (centred, 6 below the safe top, or under the plate when they would
 * overlap). If banner.ts ever moves its banner, move this with it.
 */
export function drawLegendPicture(g: CanvasRenderingContext2D, content: Content, viewW: number, clearOf?: { x: number; y: number; w: number; h: number }): void {
  pictureShown = false;
  plateRect = clearOf;
  const up = drawnBanner();
  const bodies = up ? pictures.get(up.key) : undefined;
  if (!up || !bodies) return;
  useContent(content);
  const bw = textWidth(g, up.text, 'light') + 16;
  const bx = Math.round((viewW - bw) / 2);
  let by = 6 + safeView.top;
  if (clearOf && bx < clearOf.x + clearOf.w && bx + bw > clearOf.x && by < clearOf.y + clearOf.h) by = clearOf.y + clearOf.h + 3;
  const scale = 2;
  drawPicture(g, bodies, content, Math.round((viewW - PIC_W * scale) / 2), by + 16 + 3, scale);
  pictureShown = true;
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
    // Push 3: the picture to stand under that banner (events from before push 3 carry none: words only).
    if (Array.isArray(ev.frame) && ev.frame.length) {
      pictures.set(`hall:${ev.n}`, ev.frame);
      if (pictures.size > 8) pictures.delete(pictures.keys().next().value!);
    }
    announced = [...announced, ev.title].slice(-8);
  }
}
