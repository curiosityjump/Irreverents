import type { Behaviour } from '../../content/kinds/npcs.ts';
import type { Entity, Input, StepContext } from '../types.ts';
import { findEntity } from '../world.ts';
import { canSee } from './sight.ts';
import { centre, placementOf, seconds } from './state.ts';

const IDLE: Input = { x: 0, y: 0, held: [] };

/** How close, in pixels, counts as having arrived at a routine's walk-to column. */
const ARRIVED = 2;
/** DRAFT: a walk that has made no headway for this many ticks (a wall, a ledge) is given up. */
const STALLED = 45;

/**
 * INTENT: a person never sets their body's facing or speed (every body is
 * Step 2's). To turn on the spot they touch the stick so lightly that the
 * `move` verb turns the body and moves it by a hundredth of a pixel.
 */
function turn(dir: number): Input {
  return { x: dir > 0 ? 0.01 : -0.01, y: 0, held: [] };
}

function faces(e: Entity, dx: number): boolean {
  return dx === 0 || (dx > 0 ? 1 : -1) === e.facing;
}

/**
 * Mood 1 for most people: the routine in their placement entry, looping.
 * It is a script, step by step, with nothing decided on the way.
 */
function routine(ctx: StepContext, e: Entity): Input {
  const n = e.c.npc!;
  const steps = placementOf(ctx.content, e)?.routine ?? [];
  const room = ctx.content.rooms[e.room];
  if (steps.length === 0 || !room) return IDLE;
  const next = (): void => {
    n.step = (n.step + 1) % steps.length;
    n.stepTicks = 0;
    n.stall = 0;
  };
  // At most one pass over the routine per tick: steps that take no time fall through to the next.
  for (let guard = 0; guard < steps.length; guard++) {
    const s = steps[n.step % steps.length]!;
    if (s.op === 'wait') {
      if (++n.stepTicks < seconds(s.seconds)) return IDLE;
      next();
      return IDLE;
    }
    if (s.op === 'face') {
      if (e.facing !== s.dir) return turn(s.dir);
      next();
    } else if (s.op === 'walk-to') {
      const dx = s.column * room.tile + room.tile / 2 - centre(ctx.content, e).x;
      // INTENT (there is always a way out): a walk a wall has stopped is given up, never repeated for ever.
      n.stall = Math.abs(e.vx) < 1 ? n.stall + 1 : 0;
      if (Math.abs(dx) > ARRIVED && n.stall < STALLED) return { x: dx > 0 ? 1 : -1, y: 0, held: [] };
      next();
    } else {
      const target = s.target === null ? undefined : findEntity(ctx.world, s.target);
      // A deed done to someone needs them here; otherwise the step is skipped.
      if (s.target !== null && (!target || target.room !== e.room)) {
        next();
        continue;
      }
      if (target) {
        const dx = centre(ctx.content, target).x - centre(ctx.content, e).x;
        if (!faces(e, dx)) return turn(dx);
      }
      ctx.emit('did', { deed: s.deed, by: e.id, target: s.target, thing: null });
      next();
    }
  }
  return IDLE;
}

/** Mood 2: stop, turn to the offender and plead (the bark is raised when the mood changes). */
function plead(ctx: StepContext, e: Entity): Input {
  const n = e.c.npc!;
  for (const id of n.offenders) {
    const who = findEntity(ctx.world, id);
    if (!who || who.room !== e.room) continue;
    const dx = centre(ctx.content, who).x - centre(ctx.content, e).x;
    return faces(e, dx) ? IDLE : turn(dx);
  }
  return IDLE;
}

/**
 * Mood 3: walk at where an offender was last seen.
 * INTENT (D-065, "Escalation is not omniscient"): the target is the place
 * the offender was last *seen*, never where they are. Out of sight, the
 * person arrives at an empty spot and stands there.
 * INTENT (Step 18): a body that lists Step 2's `attack` presses it fresh
 * every other tick while an offender is in sight and in reach, because the
 * verb starts a swing only on a fresh press (src/sim/verbs/attack.ts:65-72);
 * held, it would swing once per approach. People never jump and walk slower
 * than every hero runs: the way out.
 */
function charge(ctx: StepContext, e: Entity): Input {
  const n = e.c.npc!;
  if (!n.lastSeen) return IDLE;
  const dx = n.lastSeen.x - centre(ctx.content, e).x;
  const reach = ctx.content.tuning.world.npcChargeReach!;
  if (Math.abs(dx) > reach) return { x: dx > 0 ? 1 : -1, y: 0, held: [] };
  if (!faces(e, dx)) return turn(dx);
  const canAttack = ctx.content.characters[e.kind]?.verbs.includes('attack') ?? false;
  const inSight = n.offenders.some((id) => {
    const who = findEntity(ctx.world, id);
    return who !== undefined && canSee(ctx.content, e, who);
  });
  return canAttack && inSight ? { x: 0, y: 0, held: ctx.world.tick % 2 === 0 ? ['attack'] : [] } : IDLE;
}

/**
 * Every behaviour an NPC kind's `moods` may name (content/kinds/npcs.ts,
 * BEHAVIOURS). Adding one is adding its id there and its function here.
 */
export const behaviours: Record<Behaviour, (ctx: StepContext, e: Entity) => Input> = { routine, plead, charge };
