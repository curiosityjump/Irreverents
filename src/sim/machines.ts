// Machines (Step 20, vehicle hijacking): the shared shapes and the one ram
// rule. Pure, like the rest of src/sim; a helper, not in a registry
// directory. Writeup: docs/mechanisms/machines.md.
import type { Machine } from '../content/kinds/machines.ts';
import type { Content } from '../content/types.ts';
import { beatTicks, bodyNumbers, markImpact, strike, wear } from './body-state.ts';
import { friendly } from './systems/impact-walls.ts';
import type { Entity, StepContext, World } from './types.ts';

/** One machine's lasting state, by the machine's entity id. */
export interface MachineState {
  /** Crashes taken so far (never shown as a number: the look shows wear, D-020). */
  wear: number;
  /** True once worn through: it never drives again and stays where it stops. INTENT: nothing resets. */
  wrecked: boolean;
}

declare module './types.ts' {
  interface World {
    /**
     * Step 20: each machine's wear, by its entity id (docs/plan/core-loops.md,
     * "Names the slices share"). A top-level field so a rider's own page,
     * which simulates the machine it drives, reads it with every snapshot.
     * Absent until a machine first crashes; a machine with no entry is new.
     * DRAFT: the field's name.
     */
    machines?: Record<string, MachineState>;
  }
  interface Components {
    /** On a machine's body, server-side bookkeeping for the ram: the bodies it is passing through now, and its speed after last tick. */
    ram?: { met: string[]; pvx: number };
  }
  interface EventMap {
    /** A machine rammed `target` (or, with `target` null, crashed into a wall) at `speed`. `player` drives it, if a player does. */
    'machine-crash': { machine: string; target: string | null; speed: number; player: string | null };
    /** A machine wore through: a wreck, for good. */
    'machine-wrecked': { machine: string; player: string | null };
  }
}

/** The machine file of a character kind, if that kind is a machine. */
export function machineOf(content: Content, kind: string): Machine | undefined {
  for (const m of Object.values(content.machines ?? {})) if (m.character === kind) return m;
  return undefined;
}

/** A machine's state; a fresh one (not stored) when it has none yet. */
export function machineState(world: World, id: string): MachineState {
  return world.machines?.[id] ?? { wear: 0, wrecked: false };
}

/**
 * One crash on a machine: its wear goes up by one, and at the machine's
 * `crashes` it is a wreck (emits `machine-wrecked`). Only the server's world
 * and scenarios call it (the ram runs there).
 */
export function crashMachine(ctx: StepContext, e: Entity, m: Machine): void {
  const all = (ctx.world.machines ??= {});
  const s = (all[e.id] ??= { wear: 0, wrecked: false });
  if (s.wrecked) return;
  s.wear++;
  if (s.wear < m.crashes) return;
  s.wrecked = true;
  ctx.emit('machine-wrecked', { machine: e.id, player: e.player });
}

/**
 * THE ram rule (Step 20; shared on purpose with Step 18's queued "heavies
 * topple to a big throw or crash", docs/plan/step-18.md): a heavy thing
 * moving fast meets `target` and shoves it by weight. The target flies
 * (with the springiness and pop of a body-on-body impact), both record the
 * impact for shake and dust, both get an `impact` event (so the horn post's
 * rule and anything else that listens answers), and the target is worn by
 * the speed as any impact wears. A friend is shoved but not worn, as a
 * friend's throw.
 * Returns the mover's speed after (it gives up the share of its momentum
 * the target took: a light body barely slows it, the horn post nearly
 * stops it). The caller decides whether to apply it.
 * INTENT: one rule, by weight and speed only; it never asks what the
 * target is. DRAFT: the mover is not held in a beat (it rolls on: G-08,
 * "controls recover").
 */
export function ram(ctx: StepContext, mover: Entity, target: Entity, by: string | null): { vx: number; vy: number; speed: number } {
  const world = ctx.content.tuning.world;
  const ma = bodyNumbers(ctx.content, mover).weight;
  const mb = bodyNumbers(ctx.content, target).weight;
  const k = world.shoveBounce ?? 0.8;
  const speed = Math.hypot(mover.vx - target.vx, mover.vy - target.vy);
  const pop = target.onGround ? (world.shovePop ?? 0) : 0;
  const tvx = (ma * mover.vx + mb * target.vx + ma * k * (mover.vx - target.vx)) / (ma + mb);
  const tvy = (ma * mover.vy + mb * target.vy + ma * k * (mover.vy - target.vy)) / (ma + mb) - pop;
  strike(ctx, target, tvx, tvy, beatTicks(ctx, world.beatTime, world.beatMaxTime, speed), target.c.flying ? undefined : { by, met: [mover.id] });
  if (target.c.flying && !target.c.flying.met.includes(mover.id)) target.c.flying.met.push(mover.id);
  target.onGround = false;
  const mbox = ctx.content.characters[mover.kind]?.box;
  const tbox = ctx.content.characters[target.kind]?.box;
  if (mbox && tbox) {
    const x = (mover.x + mbox.w / 2 + target.x + tbox.w / 2) / 2;
    const y = (mover.y + mbox.h / 2 + target.y + tbox.h / 2) / 2;
    markImpact(ctx, mover, x, y, speed);
    markImpact(ctx, target, x, y, speed);
  }
  ctx.emit('impact', { entity: mover.id, player: mover.player, other: target.id, speed });
  ctx.emit('impact', { entity: target.id, player: target.player, other: mover.id, speed });
  wear(ctx, target, speed * (world.impactWear ?? 0) * (friendly(ctx, by, target) ? (target.c.brawl?.throwWear ?? world.friendThrowWear ?? 0) : 1), by);
  const share = ma / (ma + mb);
  return { vx: mover.vx * share, vy: mover.vy, speed };
}
