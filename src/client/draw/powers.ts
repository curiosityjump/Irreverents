import type { Content } from '../../content/types.ts';
import { ORB_SIZE, carriedPowerOf, isOrb } from '../../sim/powers.ts';
import type { Entity, World } from '../../sim/types.ts';
import { queueBanner } from './banner.ts';
import { drawnOffset, drawnTop } from './entities.ts';
import type { PlayerView } from './entities.ts';
import { drawFrame, frameOf, lengthOf, look } from './fx.ts';
import type { Look } from './fx.ts';
import { fillHudSlot } from './hud.ts';

// Step 9 (docs/mechanisms/powers.md): what a power looks like. A carrier
// has a small glowing orb over its head; an orb lying loose is its power's
// icon in a glow, flickering as it is about to fade; a hero holding one
// glows, and the viewer's own power is in the party plate's power slot
// (draw/hud.ts). Taking one plays `fx-pickup-get` over the hero (and a short
// banner for the viewer), losing one `fx-power-lost`, a fade `fx-poof`. All
// are the cut looks of content/looks/powers.json (51c8cdb). Nothing here is
// written in digits (t-no-numbers).
// DRAFT: every size, place, strength and time below.

/** The viewer's power, in the party plate's power slot. */
fillHudSlot('power', (_world, content, me) => (me.c.power ? content.powers?.[me.c.power.id]?.icon : undefined));

/** DRAFT: an orb starts to flicker this many ticks before it fades. */
const FLICKER_TICKS = 90;
/** DRAFT: the carrier's orb is drawn at this size over its head (the icon is 20 by 20). */
const OVER_HEAD = 12;
const GLOW_HOLDER = '#fff1a0';

/** Short effects playing: which look, where (room pixels, centre), on which frame they began. */
const playing: { id: string; x: number; y: number; at: number }[] = [];
/** Last frame's view of who held what, and where each orb was, to see a take, a loss or a fade. */
let held = new Map<string, string>();
let orbs = new Map<string, { x: number; y: number; room: string }>();
/** False until the first frame: what is held when the page starts is not a take. */
let primed = false;

function iconOf(content: Content, power: string): Look | null {
  const id = content.powers?.[power]?.icon;
  return id ? look(id) : null;
}

/** What the page drew for powers this frame, for the checks (window.irreverents.drawn.powers). */
export interface DrawnPowers {
  /** Carriers with their orb over the head: entity id and power. */
  carriers: { id: string; power: string }[];
  /** Orbs lying loose: entity id, power, and the middle of the orb in room pixels. */
  orbs: { id: string; power: string; x: number; y: number }[];
  /** Heroes drawn glowing: entity id and power. */
  holders: { id: string; power: string }[];
}
let drawn: DrawnPowers = { carriers: [], orbs: [], holders: [] };
export function drawnPowers(): DrawnPowers {
  return drawn;
}

/** Draws every carrier's orb, every loose orb and every holder's glow in this room, after the bodies. */
export function drawPowers(g: CanvasRenderingContext2D, world: World, content: Content, roomId: string, ox: number, oy: number, view?: PlayerView): void {
  const now: DrawnPowers = { carriers: [], orbs: [], holders: [] };
  const frame = view?.frame ?? world.tick;
  const glow = look('fx-pickup-glow');
  const centre = (e: Entity): { x: number; y: number; w: number; h: number } | null => {
    const box = content.characters[e.kind]?.box;
    if (!box) return null;
    const off = drawnOffset(e.id);
    return { x: ox + Math.round(e.x) + off.x + box.w / 2, y: oy + Math.round(e.y) + off.y + box.h / 2, w: box.w, h: box.h };
  };
  // Who holds what anywhere in this world (a hero changing room has not lost it).
  const nextHeld = new Map<string, string>();
  for (const e of world.entities) if (e.c.power) nextHeld.set(e.id, e.c.power.id);
  const nextOrbs = new Map<string, { x: number; y: number; room: string }>();
  for (const e of world.entities) {
    if (e.room !== roomId) continue;
    // A loose orb (no body: src/sim/powers.ts): its icon in a glow; flickering when about to fade.
    if (isOrb(e)) {
      const o = e.c.orb!;
      const at = { x: ox + Math.round(e.x) + ORB_SIZE / 2, y: oy + Math.round(e.y) + ORB_SIZE / 2 };
      nextOrbs.set(e.id, { x: e.x, y: e.y, room: e.room });
      now.orbs.push({ id: e.id, power: o.power, x: e.x + ORB_SIZE / 2, y: e.y + ORB_SIZE / 2 });
      if (o.left > 0 && o.left < FLICKER_TICKS && Math.floor(frame / 4) % 2 === 0) continue;
      if (glow) drawFrame(g, glow, frameOf(glow, frame, true), at.x - glow.w / 2, at.y - glow.h / 2 + 2);
      const icon = iconOf(content, o.power);
      if (icon) drawFrame(g, icon, 0, at.x - icon.w / 2, at.y - icon.h / 2);
      else {
        g.fillStyle = GLOW_HOLDER;
        g.fillRect(Math.round(at.x) - 3, Math.round(at.y) - 3, 6, 6);
      }
      continue;
    }
    const at = centre(e);
    if (!at) continue;
    // A carrier still carrying: a small orb over its head.
    const carried = carriedPowerOf(content, e);
    if (carried && !e.c.powerSpent && !e.c.flattened) {
      now.carriers.push({ id: e.id, power: carried.id });
      const top = Math.min(at.y - at.h / 2, drawnTop(e.id) ?? at.y - at.h / 2);
      const bob = Math.floor(frame / 15) % 2;
      const y = top - OVER_HEAD - 2 - bob;
      if (glow) drawFrame(g, glow, frameOf(glow, frame, true), at.x - glow.w / 2, y + OVER_HEAD / 2 - glow.h / 2 + 1);
      const icon = iconOf(content, carried.id);
      if (icon) drawFrame(g, icon, 0, at.x - OVER_HEAD / 2, y, { w: OVER_HEAD, h: OVER_HEAD });
      else {
        g.fillStyle = GLOW_HOLDER;
        g.fillRect(Math.round(at.x) - 2, y + 4, 5, 5);
      }
    }
    // A hero holding a power glows (a soft light over the body).
    const power = e.c.power?.id;
    if (power) {
      now.holders.push({ id: e.id, power });
      g.save();
      g.globalCompositeOperation = 'lighter';
      g.globalAlpha = 0.35 + 0.15 * (Math.floor(frame / 10) % 2);
      if (glow) drawFrame(g, glow, frameOf(glow, frame, true), at.x - at.w, at.y - at.h / 2 - 2, { w: at.w * 2, h: at.h + 4 });
      else {
        g.fillStyle = GLOW_HOLDER;
        g.fillRect(Math.round(at.x - at.w / 2) - 1, Math.round(at.y - at.h / 2) - 1, at.w + 2, at.h + 2);
      }
      g.restore();
      if (primed && !held.has(e.id)) {
        playing.push({ id: 'fx-pickup-get', x: e.x + at.w / 2, y: e.y + at.h / 2, at: frame });
        // The viewer's own take gets a short banner with the power's shown name.
        const name = content.powers?.[power]?.name;
        if (e.id === view?.me && name) queueBanner({ key: `power:${power}:${frame}`, text: name });
      }
    } else if (primed && held.has(e.id)) playing.push({ id: 'fx-power-lost', x: e.x + at.w / 2, y: e.y + at.h / 2, at: frame });
  }
  // An orb gone with no new holder in the room faded where it lay.
  for (const [id, o] of orbs) {
    if (nextOrbs.has(id) || o.room !== roomId) continue;
    const taken = [...nextHeld.keys()].some((h) => !held.has(h));
    if (primed && !taken) playing.push({ id: 'fx-poof', x: o.x + 5, y: o.y + 5, at: frame });
  }
  held = nextHeld;
  orbs = nextOrbs;
  primed = true;
  // The short effects, once each.
  for (let i = playing.length - 1; i >= 0; i--) {
    const p = playing[i]!;
    const l = look(p.id);
    if (!l || frame - p.at >= lengthOf(l)) {
      playing.splice(i, 1);
      continue;
    }
    const f = frameOf(l, frame - p.at, false);
    if (f >= 0) drawFrame(g, l, f, ox + Math.round(p.x) - l.w / 2, oy + Math.round(p.y) - l.h / 2);
  }
  drawn = now;
}
