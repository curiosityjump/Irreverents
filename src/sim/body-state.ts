// What can happen to a body (being launched, flying, held, the held beat,
// worn down, flattened) and the small rules several verbs and systems
// share. Pure, like the rest of src/sim. Not in a registry directory on
// purpose: it is a helper, imported by verbs and systems.
// Writeup: docs/mechanisms/combat-and-impact.md.
import type { Content } from '../content/types.ts';
import { emitEffect, heldBy } from './effects.ts';
import { boxInSolid } from './party.ts';
import { numbersOf } from './powers.ts';
import { TICK_RATE } from './types.ts';
import type { Entity, Input, StepContext } from './types.ts';
import { NO_INPUT } from './world.ts';

declare module './types.ts' {
  interface Components {
    /** Present while the body is flying from a hit, a throw or a shove, until it comes to rest. */
    flying?: {
      /** The entity id of whoever started this flight (the attacker or thrower; carried over to bodies it shoves). */
      by: string | null;
      /** Entity ids this flight has already struck (or was thrown by): each pair meets once per flight. */
      met: string[];
      /** Ticks in the air so far. */
      ticks: number;
      /** Speed and ground state going into this tick's physics, to see what a wall, floor or ceiling took away. */
      pvx: number;
      pvy: number;
      pGround: boolean;
      /** The world tick pvx/pvy were recorded on. */
      at: number;
    };
    /**
     * The hold's own timers, present while the body is being carried. Who
     * holds it is Step 1's `heldBy(entity)` (src/sim/effects.ts): one copy.
     */
    held?: {
      /** Ticks until a held player is let go by itself; -1 = no limit (bodies nobody plays). */
      ticks: number;
      /** Whether the held body's jump was down last tick, to see a fresh press. */
      jumpDown: boolean;
    };
    /** Present on a carrier. */
    carrying?: {
      /** The carried entity's id. */
      id: string;
      /** The carrier's character kind when it picked the body up; a switch drops what is carried. */
      kind: string;
    };
    /** The held beat: present while an impact holds this body still. */
    beat?: {
      ticks: number;
      /** The speed the body leaves with when the beat ends (a `push` effect then), if any. */
      vx?: number;
      vy?: number;
    };
    /** How much hitting this body has taken since it was last fresh (hidden; never shown). */
    worn?: { amount: number };
    /** Present exactly while the body is knocked out. It stays in the world, lying where it fell. */
    flattened?: { ticksLeft: number; by: string | null };
    /** The last throw this body made: the world tick and what it threw (Step 2 feel: drawing reads it). */
    lastThrow?: { tick: number; target: string };
    /** The last impact or hit this body took: where (room pixels), how hard (pixels per second), and on which tick. Drawing reads it for shake and dust. */
    impact?: { x: number; y: number; speed: number; tick: number };
  }
  interface EventMap {
    /** An attack landed on `target`. `player` is the player id of `by`. */
    hit: { by: string; target: string; player: string | null };
    /** An attack was swung, whether or not it landed on anything. */
    attacked: { by: string; player: string | null };
    grabbed: { by: string; target: string; player: string | null };
    /** A grab found only bodies too heavy for `by`. `target` is the nearest of them. */
    'grab-refused': { by: string; target: string; player: string | null; reason: 'too-heavy' };
    thrown: { by: string; target: string; player: string | null };
    /** `target` was set down, broke free, was let go after a while, or was dropped because its carrier could no longer hold it. */
    released: { by: string; target: string; player: string | null; how: 'set-down' | 'broke-free' | 'let-go' | 'dropped' };
    /** A flying body struck `other` (an entity id), or a wall, floor or ceiling (null). One event per body involved. */
    impact: { entity: string; player: string | null; other: string | null; speed: number };
    flattened: { target: string; by: string | null };
    recovered: { target: string };
  }
}

/**
 * Whether a body may do anything of its own this tick. A body that is
 * flying, carried, in a held beat or flattened is moved by what happened to
 * it, not by its stick: src/sim/systems/verbs.ts runs no verb for it.
 */
export function canAct(e: Entity): boolean {
  return !e.c.flying && heldBy(e) === null && !e.c.beat && !e.c.flattened;
}

/** A carried body, and a body in a held beat, are not moved by gravity or tiles (read by systems/physics.ts). */
export function takesNoPhysics(e: Entity): boolean {
  return heldBy(e) !== null || e.c.beat !== undefined;
}

/** What a body is asking for this tick: a player's device, or entity.c.input for anyone else. */
export function inputOf(ctx: StepContext, e: Entity): Input {
  return (e.player === null ? e.c.input : ctx.inputs[e.player]) ?? NO_INPUT;
}

/**
 * A body's weight and toughness. A kind whose tuning set has neither (an
 * NPC kind another step made, or `hero`) gets the world defaults, so every
 * character kind can be hit, grabbed and thrown.
 */
export function bodyNumbers(content: Content, e: Entity): { weight: number; toughness: number } {
  // Step 9: with a held power laid over the kind's own numbers (src/sim/powers.ts).
  const set = numbersOf(content, e);
  const world = content.tuning.world;
  return { weight: set.weight ?? world.defaultWeight ?? 40, toughness: set.toughness ?? world.defaultToughness ?? 0 };
}

export function clamp(v: number, limit: number): number {
  return Math.max(-limit, Math.min(limit, v));
}

export function ticksOf(seconds: number | undefined): number {
  return Math.round((seconds ?? 0) * TICK_RATE);
}

/**
 * The held beat for an impact of `speed` pixels per second, in ticks:
 * `minSeconds` for the softest, rising evenly to `maxSeconds` at
 * world.maxLaunchSpeed and above, so a harder hit holds longer.
 * DRAFT (Step 2 feel, 2026-11-23): a straight line; with max = min every
 * beat is the same length, as before.
 */
export function beatTicks(ctx: StepContext, minSeconds: number | undefined, maxSeconds: number | undefined, speed: number): number {
  const lo = minSeconds ?? 0;
  const hi = Math.max(lo, maxSeconds ?? lo);
  const full = ctx.content.tuning.world.maxLaunchSpeed ?? 500;
  const share = full > 0 ? Math.max(0, Math.min(1, speed / full)) : 1;
  return ticksOf(lo + (hi - lo) * share);
}

/**
 * Changes a body's speed from outside, through an effect (src/sim/effects.ts)
 * so it reaches a player's own device. With a held beat the body is stopped
 * now and gets the speed when the beat ends (systems/combat-clock.ts).
 * Speeds are capped at world.maxLaunchSpeed on each axis (physics looks one
 * tile ahead). `fly` starts a flight; without it a flight already going carries on.
 */
export function strike(
  ctx: StepContext,
  target: Entity,
  vx: number,
  vy: number,
  beatTicks: number,
  fly?: { by: string | null; met: string[] },
): void {
  const cap = ctx.content.tuning.world.maxLaunchSpeed ?? 500;
  vx = clamp(vx, cap);
  vy = clamp(vy, cap);
  if (beatTicks > 0) {
    emitEffect(ctx, target, { kind: 'push', vx: 0, vy: 0, ...(fly ? { fly } : {}) });
    target.c.beat = { ticks: beatTicks, vx, vy };
  } else {
    delete target.c.beat;
    emitEffect(ctx, target, { kind: 'push', vx, vy, ...(fly ? { fly } : {}) });
  }
}

/** Sends a body flying from a hit or a throw. */
export function launch(ctx: StepContext, target: Entity, vx: number, vy: number, by: string | null, met: string[], beatTicks = 0): void {
  strike(ctx, target, vx, vy, beatTicks, { by, met });
  target.onGround = false;
}

/** Wears a body down; at its toughness it is flattened. A toughness of 0 cannot be flattened. */
export function wear(ctx: StepContext, target: Entity, amount: number, by: string | null): void {
  if (amount <= 0 || target.c.flattened) return;
  const { toughness } = bodyNumbers(ctx.content, target);
  if (toughness <= 0) return;
  const worn = (target.c.worn ??= { amount: 0 });
  worn.amount += amount;
  if (worn.amount < toughness) return;
  // DRAFT: a flattened body is out for world.flattenTime seconds and gets
  // up where it lies (docs/plan/step-2.md, "Being beaten never ends the game").
  emitEffect(ctx, target, { kind: 'flatten', ticks: Math.max(1, ticksOf(ctx.content.tuning.world.flattenTime)), by });
  ctx.emit('flattened', { target: target.id, by });
}

/** Records what drawing needs for shake and dust. */
export function markImpact(ctx: StepContext, e: Entity, x: number, y: number, speed: number): void {
  e.c.impact = { x, y, speed, tick: ctx.world.tick };
}

/**
 * Lets a carried body go and puts it somewhere it fits: the first of
 * `spots` (top-left corners) clear of solid tiles, else centred at the
 * carrier's feet, else where it is. Emits `released` unless `how` is null
 * (a throw says `thrown` instead).
 */
export function release(
  ctx: StepContext,
  target: Entity,
  how: 'set-down' | 'broke-free' | 'let-go' | 'dropped' | null,
  spots: { x: number; y: number }[] = [],
): void {
  const by = heldBy(target);
  if (by === null) return;
  const carrier = ctx.world.entities.find((e) => e.id === by);
  emitEffect(ctx, target, { kind: 'release' });
  delete target.c.held;
  if (carrier?.c.carrying?.id === target.id) delete carrier.c.carrying;

  const room = ctx.content.rooms[target.room];
  const box = ctx.content.characters[target.kind]?.box;
  if (room && box) {
    const tries = [...spots, { x: target.x, y: target.y }];
    const cbox = carrier && carrier.room === target.room ? ctx.content.characters[carrier.kind]?.box : undefined;
    if (carrier && cbox) tries.push({ x: carrier.x + (cbox.w - box.w) / 2, y: carrier.y + cbox.h - box.h });
    const spot = tries.find((s) => !boxInSolid(room, s.x, s.y, box.w, box.h, ctx.world));
    if (spot && (spot.x !== target.x || spot.y !== target.y)) emitEffect(ctx, target, { kind: 'move', room: target.room, x: spot.x, y: spot.y });
  }
  target.onGround = false;
  if (how) ctx.emit('released', { by, target: target.id, player: carrier?.player ?? null, how });
}

/** Throws what `e` carries, aimed by the stick: forward by default, up, or down. */
export function throwCarried(ctx: StepContext, e: Entity, input: Input, throwStrength: number): void {
  const carrying = e.c.carrying;
  if (!carrying) return;
  const target = ctx.world.entities.find((o) => o.id === carrying.id);
  if (!target || heldBy(target) !== e.id) {
    delete e.c.carrying;
    return;
  }
  const world = ctx.content.tuning.world;
  const { weight } = bodyNumbers(ctx.content, target);
  const speed = Math.min(throwStrength / weight, world.maxLaunchSpeed ?? 500);
  const dir = input.x > 0 ? 1 : input.x < 0 ? -1 : e.facing;
  // DRAFT: three throws. Up is nearly straight up, down is a spike at the
  // floor in front, forward is a flat arc lifted by world.throwLift.
  let vx = dir * speed;
  let vy = -speed * (world.throwLift ?? 0.4);
  if (input.y < -0.5) {
    vx = dir * speed * 0.2;
    vy = -speed;
  } else if (input.y > 0.5) {
    vx = dir * speed * 0.6;
    vy = speed * 0.8;
  }
  // DRAFT: a forward or downward throw leaves from in front of the carrier
  // at chest height, so it meets a body standing in front instead of
  // sailing over it; an upward throw leaves from overhead. release() falls
  // back to overhead, then the carrier's feet, when the spot is in a wall.
  const spots: { x: number; y: number }[] = [];
  const cb = ctx.content.characters[e.kind]?.box;
  const tb = ctx.content.characters[target.kind]?.box;
  if (cb && tb && input.y >= -0.5) {
    spots.push({ x: dir > 0 ? e.x + cb.w : e.x - tb.w, y: Math.min(e.y + (cb.h - tb.h) / 2, e.y + cb.h - tb.h) });
  }
  release(ctx, target, null, spots);
  launch(ctx, target, vx, vy, e.id, [e.id]);
  e.c.lastThrow = { tick: ctx.world.tick, target: target.id };
  ctx.emit('thrown', { by: e.id, target: target.id, player: e.player });
}

export function overlaps(ax: number, ay: number, aw: number, ah: number, bx: number, by: number, bw: number, bh: number): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}
