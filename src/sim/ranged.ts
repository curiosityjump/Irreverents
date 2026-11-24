// A bad guy who throws things from where he stands (Step 24;
// docs/mechanisms/ranged.md). What systems/ranged-throw.ts and the page's
// telegraph (src/client/draw/ranged.ts) share: where his shot leaves, how it
// leaves, and the arc it will fly. Pure, like the rest of src/sim. Not in a
// registry directory on purpose: a helper.
import type { NpcKind } from '../content/kinds/npcs.ts';
import type { Weapon } from '../content/kinds/weapons.ts';
import type { Content } from '../content/types.ts';
import { moveLoose } from './loose-fall.ts';
import { npcKind } from './npc/state.ts';
import type { Entity, StepContext, World } from './types.ts';
import { WEAPON_KIND } from './weapons.ts';

declare module './types.ts' {
  interface Components {
    /**
     * On a thrower who is aiming: since tick `at`, the way `dir` he will
     * throw. INTENT (D-093, "legible pixels"; the owner's "readable
     * enemies"): while this is on him the page draws his shot held up and
     * its arc; no shot leaves without it for his whole `aim`.
     */
    rangedAim?: { at: number; dir: 1 | -1 };
    /** On a thrower: the tick of his last throw (systems/ranged-throw.ts), so the next aim waits `every` seconds. */
    rangedLast?: { at: number };
  }
  interface EventMap {
    /** Thrower `entity` started to aim `weapon` the way `dir`, at hero `at` (seen this tick). */
    'ranged-aim': { entity: string; weapon: string; dir: 1 | -1; at: string };
    /** Thrower `entity` threw `weapon`, now loose as `loose`. */
    'ranged-threw': { entity: string; weapon: string; loose: string; dir: 1 | -1 };
    /** Thrower `entity`'s aim ended with no throw (knocked off his feet, or the shot left his hand). */
    'ranged-lost': { entity: string };
    /** One of thrower `by`'s shots, `loose`, lying in `room` at (`x`, `y`), went (a poof): more than his `out` lay there. */
    'ranged-shot-gone': { loose: string; by: string; room: string; x: number; y: number };
  }
}

/** The `src` a thrower's shots carry through every hand and drop (never a source id: those never start with `~`). */
export function rangedTag(id: string): string {
  return `~ranged:${id}`;
}

/** A body's thrower numbers (its NPC kind's `ranged`), or undefined. */
export function rangedOf(content: Content, e: Entity): NonNullable<NpcKind['ranged']> | undefined {
  return e.player === null ? npcKind(content, e)?.ranged : undefined;
}

/**
 * Where his shot leaves and how fast: in front of his hand at chest height
 * (as throwWeapon throws, src/sim/weapons.ts), the bottom-middle of its box
 * at (`x`, `feet`), at (`vx`, `vy`) = (dir × speed, −speed × lift).
 */
export function shotStart(content: Content, e: Entity, w: Weapon, r: NonNullable<NpcKind['ranged']>, dir: 1 | -1): { x: number; feet: number; vx: number; vy: number } | undefined {
  const box = content.characters[e.kind]?.box;
  if (!box) return undefined;
  const x = dir > 0 ? e.x + box.w + w.box[0] / 2 : e.x - w.box[0] / 2;
  const feet = e.y + box.h / 2 + w.box[1] / 2;
  return { x, feet, vx: dir * r.speed, vy: -r.speed * r.lift };
}

/**
 * The arc the shot of an aiming thrower will fly: the middle of its box,
 * room pixels, every `every` ticks, by the sim's own fall (moveLoose, on a
 * scratch entity: gravity, the fall cap, solid tiles and one-way landings)
 * until it first lands or `max` ticks pass. The last point is where it lands.
 * It cannot know a body it will meet: that is the hero's to read.
 */
export function shotArc(content: Content, world: World, e: Entity, every = 3, max = 240): { x: number; y: number }[] {
  const r = rangedOf(content, e);
  const aim = e.c.rangedAim;
  const w = r ? content.weapons?.[r.weapon] : undefined;
  if (!r || !aim || !w) return [];
  const s = shotStart(content, e, w, r, aim.dir);
  if (!s) return [];
  const [bw, bh] = w.box;
  const shot: Entity = { id: '~arc', kind: WEAPON_KIND, player: null, room: e.room, x: s.x - bw / 2, y: s.feet - bh, vx: s.vx, vy: s.vy, facing: aim.dir, onGround: false, c: {} };
  const ctx = { world, content } as unknown as StepContext;
  const pts = [{ x: shot.x + bw / 2, y: shot.y + bh / 2 }];
  for (let t = 1; t <= max; t++) {
    const vy = shot.vy;
    const vx = shot.vx;
    moveLoose(ctx, shot, bw, bh);
    // Met a tile: on the ground, bounced up off a floor (moveLoose turns a hard landing's fall about), or off a wall.
    const landed = shot.onGround || (vy > 0 && shot.vy <= 0) || (vx !== 0 && Math.sign(shot.vx) !== Math.sign(vx));
    if (landed || t % every === 0) pts.push({ x: shot.x + bw / 2, y: shot.y + bh / 2 });
    if (landed) break;
  }
  return pts;
}
