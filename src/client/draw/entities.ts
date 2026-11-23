import type { Content } from '../../content/types.ts';
import { TILE } from '../../content/kinds/rooms.ts';
import type { Room } from '../../content/kinds/rooms.ts';
import { tileAt } from '../../sim/room-state.ts';
import type { Entity, World } from '../../sim/types.ts';
import { drawFrame, frameOf, look, tinted, useContent } from './fx.ts';
import { drawLookIn } from './room-parts.ts';
import { carriedBy, drawSprite, drawsOwnRage, forget, rageFlash, remember, swingWasThrow } from './sprites.ts';
import type { Drew } from './sprites.ts';

/** One thing the renderer put on screen this frame, in room pixels. Part of the debug object (docs/mechanisms/network.md). */
export interface Drawn {
  id: string;
  player: string | null;
  kind: string;
  /** Where the renderer read it to be (remote characters: after smoothing). */
  x: number;
  y: number;
  /** The whole pixel it was drawn at. */
  px: number;
  py: number;
  /** For a player's character: that player's own colour (the dot above it). Otherwise the kind's colour. */
  color: string;
  mine: boolean;
  /** Step 5 (set by draw/away.ts): drawn as away, its player's page being gone for the moment. */
  away?: boolean;
}

/** Whose view this is, and where to record what was drawn. */
export interface PlayerView {
  me: string;
  frame: number;
  drawn: Drawn[];
}

/** DRAFT: every entity is its character kind's box in a flat colour, with an eye so facing reads. Sprite sheets replace this as data. */
export function drawEntities(g: CanvasRenderingContext2D, world: World, content: Content, roomId: string, ox: number, oy: number, view?: PlayerView): void {
  useContent(content);
  forget(world);
  const room = content.rooms[roomId];
  // Shadows first, under every body (the contract's draw order), only once the looks exist.
  if (room) {
    for (const e of world.entities) {
      if (e.room !== roomId) continue;
      const kind = content.characters[e.kind];
      if (!kind) continue;
      remember(world, e);
      drawShadow(g, world, room, kind.box, e, ox, oy);
    }
  }
  const heads: { e: Entity; x: number; y: number; w: number; color: string }[] = [];
  const dotOf = (e: Entity): string | null => (e.c.net ? content.net.playerColors[e.c.net.slot % content.net.playerColors.length]! : null);
  // What was drawn, recorded first and in the world's order, from the simulation's positions,
  // exactly as before (scripted checks read it), however the bodies are then drawn.
  if (view) {
    for (const e of world.entities) {
      if (e.room !== roomId) continue;
      const kind = content.characters[e.kind];
      if (!kind) continue;
      view.drawn.push({ id: e.id, player: e.player, kind: e.kind, x: e.x, y: e.y, px: Math.round(e.x), py: Math.round(e.y), color: dotOf(e) ?? kind.color, mine: e.id === view.me });
    }
  }
  // Round 2: a carried body is drawn right after its carrier (in its hands), not in list order.
  const heldBy = new Map<string, string>();
  for (const e of world.entities) {
    if (e.room !== roomId) continue;
    const held = carriedBy(world, e);
    if (held) heldBy.set(held, e.id);
  }
  const byId = new Map(world.entities.map((e) => [e.id, e]));
  const body = (e: Entity, at?: { x: number; y: number }): Drew | null => {
    const kind = content.characters[e.kind]!;
    const x = at ? Math.round(at.x) : ox + Math.round(e.x);
    const y = at ? Math.round(at.y) : oy + Math.round(e.y);
    // Step 1 Gate 2 (one small edit; Step 2 owns this file): each PLAYER has
    // a dot above the head in their own colour, by join order, so two people
    // playing the same member can be told apart.
    const dot = dotOf(e);
    if (dot) {
      // With a `player-mark` look the mark is drawn over the head after every body (below).
      if (look('player-mark')) heads.push({ e, x, y, w: kind.box.w, color: dot });
      else {
        g.fillStyle = dot;
        g.fillRect(x + Math.floor(kind.box.w / 2) - 2, y - 7, 4, 4);
      }
    }
    // Art as data: a kind with a file in content/sprites/ is drawn from its sheet.
    const away = !!e.c.net?.away && e.id !== view?.me;
    const enraged = e.c.npc?.mood === 3;
    // Round 2: a sheet with its own rage frames carries the anger in its drawn face (a short
    // red flash as it begins); only a sheet without them is washed red, as before.
    const ownRage = enraged && drawsOwnRage(content, e);
    const fold = hideFold(content, e);
    const tint = enraged && !ownRage ? RAGE_TINT : ownRage && rageFlash(world, e) ? RAGE_FLASH : e.c.roomHide && !fold ? HIDDEN_TINT : null;
    const drew = drawSprite(g, world, content, e, x, y, { alpha: away ? AWAY_ALPHA : 1, tint });
    if (drew) {
      drawSwing(g, world, content, e, x, y, kind.box, false);
      if (fold) drawLookIn(g, content, [fold.id], ox + fold.x, oy + fold.y, fold.w, fold.h, world.tick);
      return drew;
    }
    const { w, h } = kind.box;
    if (e.c.flattened) {
      // DRAFT: knocked out reads as lying down: the same box on its side at
      // the body's feet, dimmed, eye shut. No bar, no number, no countdown.
      const lx = x + Math.round((w - h) / 2);
      const ly = y + h - w;
      g.globalAlpha = 0.6;
      g.fillStyle = kind.color;
      g.fillRect(lx, ly, h, w);
      g.globalAlpha = 1;
      g.fillStyle = DARK;
      g.fillRect(e.facing > 0 ? lx + h - 6 : lx + 2, ly + Math.min(3, w - 2), 4, 1);
      return null;
    }
    g.fillStyle = kind.color;
    g.fillRect(x, y, w, h);
    // DRAFT: an eye on anything that can be knocked out (a creature); a
    // thing that cannot (a crate: toughness 0) gets a plank line instead.
    g.fillStyle = DARK;
    if (content.tuning.characters[kind.tuning]?.toughness === 0) g.fillRect(x + 2, y + Math.floor(h / 2), w - 4, 1);
    else g.fillRect(e.facing > 0 ? x + w - 4 : x + 2, y + Math.min(5, h - 4), 2, 3);
    MARKS[kind.id]?.(g, x, y, w, h, e);
    drawSwing(g, world, content, e, x, y, kind.box, true);
    if (fold) drawLookIn(g, content, [fold.id], ox + fold.x, oy + fold.y, fold.w, fold.h, world.tick);
    return null;
  };
  for (const e of world.entities) {
    if (e.room !== roomId || !content.characters[e.kind]) continue;
    const carrier = heldBy.get(e.id);
    if (carrier && byId.get(carrier)?.room === roomId) continue;
    const drew = body(e);
    const held = [...heldBy].find(([, by]) => by === e.id)?.[0];
    const h = held ? byId.get(held) : undefined;
    if (!h || h.room !== roomId || !content.characters[h.kind]) continue;
    // In the carrier's hands: its bottom-centre on the carrier's carryAt; else where it is, as before.
    const hb = content.characters[h.kind]!.box;
    body(h, drew?.hold ? { x: drew.hold.x - hb.w / 2, y: drew.hold.y - hb.h } : undefined);
  }
  // Effects over bodies: landing dust.
  const land = look('fx-land');
  if (land) {
    for (const e of world.entities) {
      if (e.room !== roomId) continue;
      const kind = content.characters[e.kind];
      const m = kind ? remember(world, e) : null;
      if (!kind || !m) continue;
      const f = frameOf(land, world.tick - m.landed, false);
      if (f < 0) continue;
      drawFrame(g, land, f, ox + Math.round(e.x + kind.box.w / 2 - land.w / 2), oy + Math.round(e.y + kind.box.h - land.h + 1));
    }
  }
  // Marks over heads: each player's own mark in their colour, bobbing gently.
  const mark = look('player-mark');
  if (mark) {
    for (const h of heads) {
      // The bob comes from the tick and the body's id, so two marks do not bob in step.
      const bob = Math.floor((world.tick + hash(h.e.id)) / 24) % 2;
      // Over whatever is carried overhead too, so the mark is never hidden.
      const held = carriedBy(world, h.e);
      const over = held ? world.entities.find((o) => o.id === held) : undefined;
      const top = over && over.room === roomId ? Math.min(h.y, oy + Math.round(over.y)) : h.y;
      drawFrame(g, mark, frameOf(mark, world.tick, true), h.x + Math.round(h.w / 2 - mark.w / 2), top - mark.h - 4 - bob, { source: tinted(mark, h.color) });
    }
  }
}

/** DRAFT: a friend whose page went away is drawn this faint (draw/away.ts adds the dots). */
const AWAY_ALPHA = 0.45;
/** DRAFT: an enraged person's own pixels, pushed this far toward red (only for a sheet with no mood-3 frames, round 2). */
const RAGE_TINT = { color: '#c8324a', amount: 0.45 };
/** DRAFT (round 2): the brief red flash as a person with drawn rage becomes enraged. */
const RAGE_FLASH = { color: '#f0596a', amount: 0.55 };
/** DRAFT (round 2): a hidden body with no `hide-front` fold to draw over it is one ramp step darker (the night ink). INTENT: no outline, icon or sparkle: nothing points. */
const HIDDEN_TINT = { color: '#221f44', amount: 0.35 };

/**
 * Round 2: the front fold of the hiding place a body is in, `hide-front-<w>x<h>`
 * for the part's size in tiles, drawn over the body; null when the body is
 * not hidden in a part or the look is missing (then the body is drawn darker).
 */
function hideFold(content: Content, e: Entity): { id: string; x: number; y: number; w: number; h: number } | null {
  const inPart = e.c.roomHide?.in;
  const room = inPart ? content.rooms[e.room] : undefined;
  const part = room?.parts.find((p) => p.id === inPart);
  if (!room || !part || part.tiles.length === 0) return null;
  const xs = part.tiles.map((t) => t.tx);
  const ys = part.tiles.map((t) => t.ty);
  const tx = Math.min(...xs);
  const ty = Math.min(...ys);
  const w = Math.max(...xs) - tx + 1;
  const h = Math.max(...ys) - ty + 1;
  const id = `hide-front-${w}x${h}`;
  if (!look(id)) return null;
  const T = room.tile;
  return { id, x: tx * T, y: ty * T, w: w * T, h: h * T };
}

/** A small fixed number from an id (no randomness). */
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/**
 * A soft shadow on the ground under a body: sized by the body's width,
 * shrinking and fading as the body rises above the floor, gone when it is
 * far up or there is no floor near. Only with the `shadow-*` looks.
 */
function drawShadow(g: CanvasRenderingContext2D, world: World, room: Room, box: { w: number; h: number }, e: Entity, ox: number, oy: number): void {
  const l = look(box.w <= 12 ? 'shadow-s' : box.w <= 20 ? 'shadow-m' : 'shadow-l');
  if (!l) return;
  const feet = e.y + box.h;
  const cx = e.x + box.w / 2;
  const tx = Math.floor(cx / room.tile);
  let floor = -1;
  for (let ty = Math.floor((feet - 1) / room.tile); ty < room.h && ty * room.tile < feet + SHADOW_REACH; ty++) {
    const top = ty * room.tile;
    if (top < feet - 1) continue;
    const code = tileAt(world, room, tx, ty);
    if (code === TILE.solid || code === TILE.oneway) {
      floor = top;
      break;
    }
  }
  if (floor < 0) {
    if (!e.onGround) return;
    floor = feet;
  }
  const rise = Math.max(0, floor - feet);
  const k = 1 - rise / SHADOW_REACH;
  if (k <= 0.2) return;
  const w = Math.max(4, Math.round(l.w * (0.5 + 0.5 * k)));
  const h = Math.max(2, Math.round(l.h * (0.5 + 0.5 * k)));
  drawFrame(g, l, 0, ox + Math.round(cx - w / 2), oy + Math.round(floor - h / 2 - 1), { w, h });
}
/** DRAFT: how far above the floor (pixels) a body still casts a shadow. */
const SHADOW_REACH = 72;

/**
 * DRAFT: the swing of an attack, in front of the body for a moment. Round 2:
 * the character's own `fx-swing-<character id>` when there is one (the
 * grappler's punch burst), else `fx-slash`, centred on where the strike
 * lands (half the attack's reach past the body's front edge, at chest
 * height), mirrored by facing; it starts with the strike, not the wind-up.
 * `fx-slash` is sized by reach as before; a character's own swing is drawn
 * at its own size. With no look, a rectangle body keeps its white bar.
 */
function drawSwing(g: CanvasRenderingContext2D, world: World, content: Content, e: Entity, x: number, y: number, box: { w: number; h: number }, plain: boolean): void {
  const since = world.tick - (e.c.attack?.swung ?? -1000);
  if (since < 0 || e.c.attack?.phase === 'windup') return;
  const own = look(`fx-swing-${e.kind}`);
  const slash = own ?? look('fx-slash');
  if (slash && swingWasThrow(e)) return;
  const kind = content.characters[e.kind];
  const reachOf = (content.tuning.characters[kind?.tuning ?? '']?.attackReach ?? 10);
  if (slash) {
    const f = frameOf(slash, since, false);
    if (f < 0) return;
    // fx-slash: sized by reach, in quarter steps so the pixels stay even.
    const scale = own ? 1 : Math.max(0.5, Math.min(2, Math.round(((reachOf + box.w / 2) / slash.w) * 4) / 4));
    const w = Math.round(slash.w * scale);
    const h = Math.round(slash.h * scale);
    const cx = e.facing > 0 ? x + box.w + reachOf / 2 : x - reachOf / 2;
    const cy = y + box.h * 0.45;
    drawFrame(g, slash, f, Math.round(cx - w / 2), Math.round(cy - h / 2), { flip: e.facing < 0, w, h });
    return;
  }
  if (!plain || since >= SWING_TICKS) return;
  const reach = reachOf * (1 - since / (SWING_TICKS * 2));
  g.fillStyle = '#fdf6e3';
  g.fillRect(e.facing > 0 ? x + box.w : x - Math.round(reach), y + Math.floor(box.h / 3), Math.round(reach), Math.max(2, Math.floor(box.h / 4)));
}

const DARK = '#1b1b2f';
const SWING_TICKS = 7;

/**
 * DRAFT: one small mark per party member so the three tell apart at a glance
 * on a phone even without colour (size and colour are data, in
 * content/characters/). Keyed by character id; a kind with no entry is just
 * its box. Sprite sheets replace all of this.
 */
const MARKS: Record<string, (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, e: Entity) => void> = {
  // The grappler: broad shoulders that overhang the box, and a belt.
  grappler(g, x, y, w, h) {
    g.fillStyle = '#a63d1f';
    g.fillRect(x - 2, y + 10, w + 4, 5);
    g.fillStyle = DARK;
    g.fillRect(x, y + h - 9, w, 2);
  },
  // The infiltrator: a dark headband with a tail trailing behind.
  infiltrator(g, x, y, w, _h, e) {
    g.fillStyle = DARK;
    g.fillRect(x, y + 1, w, 2);
    g.fillRect(e.facing > 0 ? x - 3 : x + w, y + 2, 3, 2);
  },
  // The flyer: a wing on each side, raised while rising and lowered while falling.
  flyer(g, x, y, w, _h, e) {
    g.fillStyle = '#e8f7fd';
    const wy = e.onGround ? y + 8 : e.vy < 0 ? y + 3 : y + 10;
    g.fillRect(x - 4, wy, 4, 5);
    g.fillRect(x + w, wy, 4, 5);
  },
};
