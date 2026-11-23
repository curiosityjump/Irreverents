import type { Content } from '../../content/types.ts';
import type { Entity, World } from '../../sim/types.ts';
import { drawSprite } from './sprites.ts';

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
  for (const e of world.entities) {
    if (e.room !== roomId) continue;
    const kind = content.characters[e.kind];
    if (!kind) continue;
    const x = ox + Math.round(e.x);
    const y = oy + Math.round(e.y);
    // Step 1 Gate 2 (one small edit; Step 2 owns this file): each PLAYER has
    // a dot above the head in their own colour, by join order, so two people
    // playing the same member can be told apart; and what was drawn is
    // recorded for the scripted checks.
    const dot = e.c.net ? content.net.playerColors[e.c.net.slot % content.net.playerColors.length]! : null;
    if (dot) {
      g.fillStyle = dot;
      g.fillRect(x + Math.floor(kind.box.w / 2) - 2, y - 7, 4, 4);
    }
    view?.drawn.push({ id: e.id, player: e.player, kind: e.kind, x: e.x, y: e.y, px: Math.round(e.x), py: Math.round(e.y), color: dot ?? kind.color, mine: e.id === view.me });
    // Art as data: a kind with a file in content/sprites/ is drawn from its sheet.
    if (drawSprite(g, content, e, x, y, view?.frame ?? world.tick)) continue;
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
      continue;
    }
    g.fillStyle = kind.color;
    g.fillRect(x, y, w, h);
    // DRAFT: an eye on anything that can be knocked out (a creature); a
    // thing that cannot (a crate: toughness 0) gets a plank line instead.
    g.fillStyle = DARK;
    if (content.tuning.characters[kind.tuning]?.toughness === 0) g.fillRect(x + 2, y + Math.floor(h / 2), w - 4, 1);
    else g.fillRect(e.facing > 0 ? x + w - 4 : x + 2, y + Math.min(5, h - 4), 2, 3);
    MARKS[kind.id]?.(g, x, y, w, h, e);
    // DRAFT: the swing of an attack, shown for a few ticks in front of the body.
    const since = world.tick - (e.c.attack?.swung ?? -1000);
    if (since >= 0 && since < SWING_TICKS) {
      const reach = (content.tuning.characters[kind.tuning]?.attackReach ?? 10) * (1 - since / (SWING_TICKS * 2));
      g.fillStyle = '#fdf6e3';
      g.fillRect(e.facing > 0 ? x + w : x - Math.round(reach), y + Math.floor(h / 3), Math.round(reach), Math.max(2, Math.floor(h / 4)));
    }
  }
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
