import type { Content } from '../../content/types.ts';
import { memberTaken } from '../../sim/party.ts';
import type { Entity, World } from '../../sim/types.ts';
import { safeView } from './fx.ts';
import { drawHeartRow, heartSize, isOut, noteHearts } from './hearts.ts';
import { maxHearts } from '../../sim/hearts.ts';
import { drawLook, drawNine, look } from './looks.ts';

// Step 19 push 2 (docs/mechanisms/rendering-world.md, "The party plate"):
// the top-left plate. The viewer's own face first and lit, then three small
// slots beside it that other slices fill (power, cargo, condition), then the
// rest of the party's faces: a friend's at full strength, a free member's
// dimmed. Faces are the cut `hud-face-<kind>` looks on the `hud-plate`
// nine-slice (content/looks/ui.json); a kind with no face is a square in its
// colour.
//
// INTENT: screen furniture, no input, no digits, nothing over the controls
// (they sit at the bottom); clear of the menu button, which holds the way
// out (src/client/start.ts) and sits over the view's top-left corner.
// DRAFT: every size, place and strength below; whether the plate should
// show a friend's slots too.

// Step 23: 'weapon', the one weapon in the viewer's hand (src/client/draw/weapons.ts fills it).
export type HudSlot = 'power' | 'weapon' | 'cargo' | 'condition';
export const HUD_SLOTS: readonly HudSlot[] = ['power', 'weapon', 'cargo', 'condition'];

/** What a slot shows for this viewer now: a look id, or undefined for empty. */
export type SlotFiller = (world: World, content: Content, me: Entity) => string | undefined;
const fillers: Partial<Record<HudSlot, SlotFiller>> = {};

/**
 * Fills one of the viewer's slots: called once, at load, from the filling
 * slice's own draw file (heist: cargo). One filler per slot; a second
 * replaces the first (say so in your brief if two slices want one slot).
 */
export function fillHudSlot(slot: HudSlot, filler: SlotFiller): void {
  fillers[slot] = filler;
}

const FACE = 16;
const SMALL = 16;
const SLOT = 12;
const PAD = 3;
const GAP = 2;
const WELL = 'rgba(15, 15, 28, 0.55)';
/** DRAFT (brief phone-hud-legibility): game px between friends' columns, a divider line in the middle, so two friends' hearts never run together. */
const FRIEND_GAP = 5;
/** DRAFT (brief phone-hud-legibility, second pass: a 5-heart friend's row ran under the next face): a friend's hearts wrap at this many a line, so every heart sits under its own face. */
const FRIEND_LINE = 3;
const DIVIDER = 'rgba(224, 154, 30, 0.45)';

export interface DrawnHud {
  /** In plate order: the viewer's own first. `played`: by the viewer or a friend. `out`: no hearts left (Step 21, drawn greyed). */
  faces: { kind: string; me: boolean; played: boolean; out: boolean }[];
  /** What each of the viewer's slots shows (a look id), or null. */
  slots: Record<HudSlot, string | null>;
  /** The plate, in game pixels of the view. */
  box: { x: number; y: number; w: number; h: number };
}
let drawn: DrawnHud | null = null;

/** What the last frame drew, for `window.irreverents.drawn.hud`; null with no plate. */
export function drawnHud(): DrawnHud | null {
  return drawn;
}

/** Where the menu button ends, in game pixels across the view; looked up every so often, not every frame. */
let menuRight = 0;
let menuLooked = -1;
function clearOfMenu(g: CanvasRenderingContext2D, frame: number): number {
  if (menuLooked >= 0 && frame - menuLooked < 30) return menuRight;
  menuLooked = frame;
  menuRight = 0;
  if (typeof document === 'undefined') return 0;
  const btn = document.getElementById('menu-btn');
  const c = g.canvas as HTMLCanvasElement;
  if (!btn || btn.hidden || !c.getBoundingClientRect) return 0;
  const b = btn.getBoundingClientRect();
  const r = c.getBoundingClientRect();
  if (r.width <= 0 || b.width <= 0) return 0;
  const sx = c.width / r.width;
  // Only when the button is over the plate's rows (the top of the view).
  if (b.top > r.top + 30 / sx) return 0;
  menuRight = Math.max(0, Math.ceil((b.right - r.left) * sx));
  return menuRight;
}

/**
 * Draws the plate for the viewer `me` (this page's own character), and
 * returns its box (the banners keep clear of it), or undefined.
 */
export function drawHud(g: CanvasRenderingContext2D, world: World, content: Content, me: Entity | undefined, frame: number): DrawnHud['box'] | undefined {
  drawn = null;
  if (!me) return undefined;
  const members = world.party ?? content.party.members;
  // Step 20 push 3: a rider's body is the machine's kind; the plate shows the hero they went in as (docs/mechanisms/machines.md).
  const mine = riddenHero(world, me) ?? me.kind;
  const others = members.filter((k) => k !== mine);
  const slots = {} as Record<HudSlot, string | null>;
  for (const s of HUD_SLOTS) slots[s] = fillers[s]?.(world, content, me) ?? null;

  // Step 21, hearts (draw/hearts.ts): hearts under each face; a friend's wrap FRIEND_LINE to a line, centred under its face.
  const hearts = content.hearts?.on === true;
  const small = heartSize(false);
  const col = (k: string): number => (hearts ? Math.max(SMALL, Math.min(FRIEND_LINE, maxHearts(content, k)) * small.step - 1) : SMALL);
  const friendLines = hearts ? Math.max(0, ...others.map((k) => Math.ceil(maxHearts(content, k) / FRIEND_LINE))) : 0;
  if (hearts) noteHearts(world, content, [mine, ...others], frame);
  const w = PAD + FACE + GAP + HUD_SLOTS.length * (SLOT + 1) + (others.length > 0 ? GAP + others.reduce((n, k) => n + col(k) + FRIEND_GAP, 0) - FRIEND_GAP + 1 : 0) + PAD - 1;
  const h = PAD + FACE + (hearts ? Math.max(1 + heartSize(true).h, 2 + friendLines * small.step - 1) : 0) + PAD;
  const x = Math.max(3 + safeView.left, clearOfMenu(g, frame) + 2);
  const y = 3 + safeView.top;
  if (!drawNine(g, content, 'hud-plate', x, y, w, h)) {
    g.fillStyle = '#e09a1e';
    g.fillRect(x, y, w, h);
    g.fillStyle = '#221f44';
    g.fillRect(x + 1, y + 1, w - 2, h - 2);
  }
  // A heart's pop stays on the plate (draw/hearts.ts).
  g.save();
  g.beginPath();
  g.rect(x, y, w, h);
  g.clip();
  // The viewer's own face, lit.
  face(g, content, mine, x + PAD, y + PAD, FACE, 1, hearts && isOut(world, content, mine));
  if (hearts) drawHeartRow(g, world, content, mine, x + PAD, y + PAD + FACE + 1, true, frame);
  let cx = x + PAD + FACE + GAP;
  // The slots, beside it: an empty slot is a dark well.
  for (const s of HUD_SLOTS) {
    const sy = y + PAD + Math.floor((FACE - SLOT) / 2);
    g.fillStyle = WELL;
    g.fillRect(cx, sy, SLOT, SLOT);
    const id = slots[s];
    if (id) fit(g, content, id, cx, sy, SLOT);
    cx += SLOT + 1;
  }
  cx += GAP;
  const faces: DrawnHud['faces'] = [{ kind: mine, me: true, played: true, out: hearts && isOut(world, content, mine) }];
  others.forEach((k, i) => {
    if (i > 0) {
      g.fillStyle = DIVIDER;
      g.fillRect(cx - Math.ceil(FRIEND_GAP / 2), y + PAD + 1, 1, h - 2 * PAD - 2);
    }
    const played = memberTaken(world, k, me.id);
    const out = hearts && isOut(world, content, k);
    const fx = cx + Math.floor((col(k) - SMALL) / 2);
    face(g, content, k, fx, y + PAD + (FACE - SMALL), SMALL, played ? 0.9 : 0.35, out);
    if (hearts) drawHeartRow(g, world, content, k, cx, y + PAD + FACE + 2, false, frame, FRIEND_LINE, col(k));
    faces.push({ kind: k, me: false, played, out });
    cx += col(k) + FRIEND_GAP;
  });
  g.restore();
  drawn = { faces, slots, box: { x, y, w, h } };
  return drawn.box;
}

/** The hero a rider went in as (World.machines, Step 20), or undefined for a body that rides nothing. */
function riddenHero(world: World, me: Entity): string | undefined {
  for (const s of Object.values(world.machines ?? {})) if (s.rider === me.id && s.hero) return s.hero;
  return undefined;
}

/** A look fitted into a size×size square, keeping its shape, centred. */
function fit(g: CanvasRenderingContext2D, content: Content, id: string, x: number, y: number, size: number): void {
  const l = look(content, id);
  if (!l) return;
  const k = Math.min(1, size / l.w, size / l.h);
  const w = Math.max(1, Math.round(l.w * k));
  const h = Math.max(1, Math.round(l.h * k));
  drawLook(g, content, id, x + Math.floor((size - w) / 2), y + Math.floor((size - h) / 2), { w, h });
}

function face(g: CanvasRenderingContext2D, content: Content, kind: string, x: number, y: number, size: number, alpha: number, out = false): void {
  const before = g.globalAlpha;
  g.globalAlpha = before * (out ? Math.min(alpha, 0.5) : alpha);
  if (!drawLook(g, content, `hud-face-${kind}`, x, y, { w: size, h: size })) {
    g.fillStyle = '#0f0f1c';
    g.fillRect(x, y, size, size);
    g.fillStyle = content.characters[kind]?.color ?? '#d2cfe0';
    g.fillRect(x + 1, y + 1, size - 2, size - 2);
  }
  g.globalAlpha = before;
  // Step 21, hearts: a hero with no hearts is out; its face is greyed over (DRAFT: the shade).
  if (out) {
    g.fillStyle = 'rgba(70, 70, 80, 0.65)';
    g.fillRect(x, y, size, size);
  }
}
