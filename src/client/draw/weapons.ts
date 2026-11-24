import type { Content } from '../../content/types.ts';
import type { Weapon } from '../../content/kinds/weapons.ts';
import type { Entity, World } from '../../sim/types.ts';
import { useHere } from '../../sim/use.ts';
import { looseBox, weaponOf } from '../../sim/weapons.ts';
import { drawnOffset } from './entities.ts';
import type { PlayerView } from './entities.ts';
import { drawFrame, frameOf, lengthOf, look } from './fx.ts';
import { tinted } from './looks.ts';
import { fillHudSlot } from './hud.ts';

// Step 23 (docs/mechanisms/weapons.md): what a weapon looks like. A loose
// weapon lies as its `ground` look; the one this page's Use would pick up
// glows (`fx-pickup-glow`, the powers' glow, as a layer of its own: the P12
// readme wants ground art without baked rings). A held one is drawn in the
// holder's hand: the weapon's grip on the hand point of content/grips.json,
// mirrored with `facing`, where the body is drawn this frame (`drawnOffset`),
// following the swing (wind-up: held; strike and follow-through: the swing
// frames), and its `impact` look where it lands. One library, any hand: no
// bearer is in any picture (the owner's P12 contract). No digits anywhere.
// DRAFT: every size, place and time below.

/**
 * The viewer's one weapon in the party plate's weapon slot (draw/hud.ts): its
 * `icon` look when one is cut, else its `held` look fitted to the slot. No
 * inventory: one slot, the weapon in hand (the owner: "Only one weapon at a time").
 */
fillHudSlot('weapon', (_world, content, me) => {
  const w = weaponOf(content, me);
  return w ? (w.looks.icon ?? w.looks.held) : undefined;
});

/** What the page drew for weapons this frame, for the checks (window.irreverents.drawn.weapons). */
export interface DrawnWeapons {
  /** Loose weapons: entity id, weapon, the middle of its box (room px), and whether it glows (this page's Use would take it); `lit` a thrown bomb, `burst` one bursting, `broken` one worn out (its broken look playing). */
  loose: { id: string; weapon: string; x: number; y: number; glow: boolean; lit?: boolean; burst?: boolean; broken?: boolean; flying?: boolean }[];
  /** Held weapons: the holder's entity id, the weapon, the look drawn, and the hand point (room px). */
  held: { id: string; weapon: string; look: string; x: number; y: number }[];
}
let drawn: DrawnWeapons = { loose: [], held: [] };
export function drawnWeapons(): DrawnWeapons {
  return drawn;
}

/** Where each weapon in flight was drawn on this page's recent frames (room px, its middle), newest last: its trail. */
const trails = new Map<string, { x: number; y: number }[]>();
/** DRAFT: frames between two copies in a trail. */
const TRAIL_STEP = 2;

/**
 * Step 24 slice 1b: a weapon in the air with a `flight` look (content/weapons/,
 * the kind's `flight`), so a thing flying at you cannot be taken for the same
 * thing lying still to pick up: `trail` fading, tinted copies where it was
 * drawn a few frames ago, then the picture itself, spun `spin` turns a second
 * about its middle and tinted. Read from the page's own frames, so it follows
 * what is drawn, not the simulation. DRAFT: the look; the trail's spacing.
 */
function drawInFlight(g: CanvasRenderingContext2D, w: Weapon, id: string, x: number, y: number, ox: number, oy: number, frame: number): void {
  const f = w.flight!;
  const art = look(w.looks.flying ?? w.looks.ground);
  const past = trails.get(id) ?? [];
  if (trails.size > 64) trails.clear();
  past.push({ x, y });
  while (past.length > f.trail * TRAIL_STEP + 1) past.shift();
  trails.set(id, past);
  const source = art && f.tint ? tinted(art, f.tint, 'paint', f.tintAmount) : undefined;
  const rim = art && f.outline ? tinted(art, f.outline, 'paint', 1) : undefined;
  const turn = (frame / 60) * f.spin * Math.PI * 2;
  const one = (px: number, py: number, alpha: number, angle: number, solid = false) => {
    g.save();
    g.globalAlpha *= alpha;
    g.translate(ox + Math.round(px), oy + Math.round(py));
    g.rotate(angle);
    g.scale(f.scale, f.scale);
    // The rim: the picture in the outline's colour a pixel out each way, under it (the thing itself only, not its trail).
    if (art && rim && solid) for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]] as const) drawFrame(g, art, 0, -art.w / 2 + dx, -art.h / 2 + dy, { source: rim });
    if (art) drawFrame(g, art, 0, -art.w / 2, -art.h / 2, source ? { source } : {});
    else {
      g.fillStyle = f.tint ?? '#c8ccd8';
      g.fillRect(-4, -4, 8, 8);
    }
    g.restore();
  };
  // The copies, every TRAIL_STEP frames back, the oldest faintest, each turned as it was then.
  for (let k = f.trail; k >= 1; k--) {
    const p = past[past.length - 1 - k * TRAIL_STEP];
    if (p) one(p.x, p.y, (0.7 * (f.trail + 1 - k)) / (f.trail + 1), turn - k * TRAIL_STEP * (f.spin * Math.PI * 2) / 60);
  }
  one(x, y, 1, turn, true);
}

/** Impact looks playing: which look, where (room px, centre), on which frame they began. */
const playing: { id: string; x: number; y: number; at: number }[] = [];
/** The impacts already started, by body id: the simulation tick of the last one seen, so each plays once. */
const seenImpacts = new Map<string, number>();

/** The hand point of a body, room px: its kind's row in content/grips.json, or the default share of its box, mirrored with `facing`. */
export function handOf(content: Content, e: Entity): { x: number; y: number } | null {
  const box = content.characters[e.kind]?.box;
  if (!box) return null;
  const g = content.grips?.kinds[e.kind];
  const d = content.grips?.default ?? [0.8, 0.55];
  const hx = g ? g[0] : box.w * d[0];
  const hy = g ? g[1] : box.h * d[1];
  return { x: e.x + (e.facing < 0 ? box.w - hx : hx), y: e.y + hy };
}

/** The look a holder's weapon shows now, and its frame: by the swing's phase (verbs/attack.ts). */
function heldLook(w: Weapon, e: Entity): { id: string; frame: number } {
  const phase = e.c.attack?.phase ?? 'ready';
  if (w.looks.swing && (phase === 'strike' || phase === 'recover')) {
    const l = look(w.looks.swing);
    const last = l ? Math.max(0, l.frames - 1) : 0;
    return { id: w.looks.swing, frame: phase === 'strike' ? 0 : last };
  }
  return { id: w.looks.held, frame: 0 };
}

/** Draws every loose weapon and every held weapon in this room, after the bodies. */
export function drawWeapons(g: CanvasRenderingContext2D, world: World, content: Content, roomId: string, ox: number, oy: number, view?: PlayerView): void {
  const now: DrawnWeapons = { loose: [], held: [] };
  const weapons = content.weapons ?? {};
  if (Object.keys(weapons).length === 0) {
    drawn = now;
    return;
  }
  const frame = view?.frame ?? world.tick;
  const mine = view ? world.entities.find((e) => e.id === view.me) : undefined;
  const answer = mine && mine.room === roomId ? useHere(world, content, mine) : undefined;
  const target = answer?.entry === 'weapon' ? answer.target : undefined;
  const glow = look('fx-pickup-glow');
  for (const e of world.entities) {
    if (e.room !== roomId) continue;
    const l = e.c.loose;
    if (l) {
      const w = weapons[l.weapon];
      if (!w) continue;
      const b = looseBox(content, e);
      const cx = e.x + b.w / 2;
      const feet = e.y + b.h;
      const lit = e.id === target;
      const inFlight = !!(l.flying && w.flight && !l.ending);
      now.loose.push({ id: e.id, weapon: w.id, x: cx, y: e.y + b.h / 2, glow: lit, ...(l.lit ? { lit: true } : {}), ...(l.ending ? (l.ending.broken ? { broken: true } : { burst: true }) : {}), ...(inFlight ? { flying: true } : {}) });
      if (inFlight) {
        drawInFlight(g, w, e.id, cx, e.y + b.h / 2, ox, oy, frame);
        continue;
      }
      trails.delete(e.id);
      // A bomb that has burst: its burst look, centred where it burst, played once from the tick it burst (weapon-burst).
      // A weapon worn out (weapon-wear): its broken look where the hand was, in the same way.
      if (l.ending) {
        const endLook = l.ending.broken ? w.looks.broken : w.looks.burst;
        const boom = endLook ? look(endLook) : undefined;
        if (boom) drawFrame(g, boom, Math.max(0, frameOf(boom, world.tick - l.ending.at, false)), ox + Math.round(cx - boom.w / 2), oy + Math.round(e.y + b.h / 2 - boom.h / 2));
        else if (!l.ending.broken) {
          g.fillStyle = '#ffb040';
          g.fillRect(ox + Math.round(cx - 12), oy + Math.round(e.y + b.h / 2 - 12), 24, 24);
        }
        continue;
      }
      // DRAFT: a lit bomb blinks (hidden 4 frames in every 12) so it reads as about to go.
      if (l.lit && frame % 12 < 4) continue;
      if (lit && glow) drawFrame(g, glow, frameOf(glow, frame, true), ox + cx - glow.w / 2, oy + feet - glow.h / 2 - b.h / 2);
      const id = (lit && w.looks.pickup) || w.looks.ground;
      const art = look(id);
      // The ground look's picture sits low in its cell: its bottom on the box's bottom, a pixel into the floor.
      if (art) drawFrame(g, art, 0, ox + Math.round(cx - art.w / 2), oy + Math.round(feet - art.h + 2), { flip: e.facing < 0 });
      else {
        g.fillStyle = lit ? '#fff1a0' : '#c8ccd8';
        g.fillRect(ox + Math.round(e.x), oy + Math.round(e.y + b.h / 2 - 1), b.w, 3);
      }
      continue;
    }
    // Through weaponOf: a weapon kept for another party member is not drawn on this one (systems/weapon-hands.ts).
    const w = weaponOf(content, e);
    const hand = w && handOf(content, e);
    if (!w || !hand) continue;
    const off = drawnOffset(e.id);
    const hx = ox + Math.round(hand.x) + off.x;
    const hy = oy + Math.round(hand.y) + off.y;
    const { id, frame: f } = heldLook(w, e);
    now.held.push({ id: e.id, weapon: w.id, look: id, x: hand.x, y: hand.y });
    const art = look(id);
    const flip = e.facing < 0;
    if (art) drawFrame(g, art, Math.min(f, Math.max(0, art.frames - 1)), hx - (flip ? art.w - w.grip[0] : w.grip[0]), hy - w.grip[1], { flip });
    else {
      g.fillStyle = '#c8ccd8';
      g.fillRect(hx, hy - 8, 2, 9);
    }
  }
  // A blow from a weapon in hand: its impact look where the struck body was hit, once per blow.
  for (const o of world.entities) {
    const imp = o.c.impact;
    const by = o.c.lastHit?.by;
    if (!imp || by === undefined || o.room !== roomId || seenImpacts.get(o.id) === imp.tick) continue;
    if (o.c.lastHit!.tick !== imp.tick) continue;
    const holder = world.entities.find((h) => h.id === by);
    const w = holder && weaponOf(content, holder);
    seenImpacts.set(o.id, imp.tick);
    if (w && w.looks.impact) playing.push({ id: w.looks.impact, x: imp.x, y: imp.y, at: frame });
  }
  for (let i = playing.length - 1; i >= 0; i--) {
    const p = playing[i]!;
    const l = look(p.id);
    const len = l ? Math.max(lengthOf(l), 8) : 0;
    if (!l || frame - p.at >= len) {
      playing.splice(i, 1);
      continue;
    }
    const f = Math.max(0, frameOf(l, frame - p.at, false));
    drawFrame(g, l, f, ox + Math.round(p.x) - l.w / 2, oy + Math.round(p.y) - l.h / 2);
  }
  drawn = now;
}
