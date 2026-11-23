import type { CantinaPattern } from '../../content/kinds/cantina.ts';
import { canAct, release, ticksOf } from '../body-state.ts';
import { cantinasOf, hasBody, isRegular, padSpot, regularId } from '../cantina.ts';
import { isUnlocked } from '../roster.ts';
import { heldBy } from '../effects.ts';
import { TICK_RATE } from '../types.ts';
import type { Entity, Input, StepContext, System } from '../types.ts';
import { addEntity, findEntity, removeEntity } from '../world.ts';

/**
 * The cantina's regulars (Step 11, D-083; docs/mechanisms/cantina.md): one
 * body per unlocked roster character nobody is playing (Step 13,
 * src/sim/roster.ts), `cantina:<kind>`, in the
 * cantina room. A player becoming that character takes its regular away;
 * nobody playing it any more brings it back on a pad. Each regular is
 * driven through the input any body takes (entity.c.input): its walking
 * loop, or while a brawl is on its fight pattern (content/cantina/).
 *
 * INTENT (D-055, D-086): regulars are scripted and outside every ordinary
 * rule. They never get `c.npc`, so they see nothing, witness nothing and
 * call nobody; a brawl raises no mood and no alert.
 * INTENT: does nothing in a world without a `~cantina:<room>` entity (a
 * page's own world), so a page never grows regulars of its own.
 * Runs before the verbs (100), which read the input it writes.
 */
const system: System = {
  id: 'cantina-regulars',
  order: 20,
  run(ctx) {
    const { world, content } = ctx;
    for (const { file, state } of cantinasOf(world, content)) {
      const played = new Set(world.entities.filter((e) => e.player !== null).map((e) => e.kind));
      content.roster.characters.forEach((kind) => {
        const id = regularId(kind);
        const e = findEntity(world, id);
        if (played.has(kind)) {
          if (e) leave(ctx, e);
          return;
        }
        // Step 13: only a hero unlocked in this world wanders in (world.roster; absent is everyone).
        if (e || !content.characters[kind] || !isUnlocked(world, content, kind)) return;
        const at = padSpot(content, file, state.pad++, kind);
        addEntity(world, { id, kind, player: null, room: file.room, x: at.x, y: at.y, vx: 0, vy: 0, facing: -1, onGround: true, c: { regular: { step: 0, ticks: 0, stall: 0, lastX: at.x } } });
      });
      content.roster.characters.forEach((kind, index) => {
        const e = findEntity(world, regularId(kind));
        const pattern = file.patterns[kind];
        if (!e || !pattern || e.room !== file.room) return;
        if (!canAct(e)) {
          delete e.c.input;
          return;
        }
        e.c.input = state.on ? fight(ctx, e, pattern, index) : walk(ctx, e, pattern);
      });
    }
  },
};
export default system;

/** A regular whose character a player has taken: anything it held, or that held it, lets go, and it is gone. */
function leave(ctx: StepContext, e: Entity): void {
  const carried = e.c.carrying ? findEntity(ctx.world, e.c.carrying.id) : undefined;
  if (carried && heldBy(carried) === e.id) release(ctx, carried, 'dropped');
  if (heldBy(e) !== null) release(ctx, e, 'let-go');
  removeEntity(ctx.world, e.id);
}

/** DRAFT: how near (pixels) a regular's middle must come to a column's middle to count as there. */
const THERE = 3;
/** DRAFT: ticks with no headway before a regular gives up on a walk and goes on to its next step. */
const STALL_TICKS = 90;

function walk(ctx: StepContext, e: Entity, pattern: CantinaPattern): Input {
  const r = (e.c.regular ??= { step: 0, ticks: 0, stall: 0, lastX: e.x });
  const steps = pattern.walk;
  const next = (): void => {
    r.step = (r.step + 1) % steps.length;
    r.ticks = 0;
    r.stall = 0;
  };
  const s = steps[r.step % steps.length]!;
  let x = 0;
  if (s.op === 'wait') {
    if (++r.ticks >= ticksOf(s.seconds)) next();
  } else {
    const room = ctx.content.rooms[e.room]!;
    const box = ctx.content.characters[e.kind]!.box;
    const d = (s.column + 0.5) * room.tile - (e.x + box.w / 2);
    if (Math.abs(d) <= THERE) next();
    else {
      x = Math.sign(d);
      r.stall = Math.abs(e.x - r.lastX) < 0.01 ? r.stall + 1 : 0;
      if (r.stall >= STALL_TICKS) next();
    }
  }
  r.lastX = e.x;
  // INTENT: a regular never pushes the stick up: up is how a doorway is
  // used, and up with attack is the launcher (docs/plan/step-11.md).
  return { x, y: 0, held: [] };
}

/** DRAFT: a body that hit this regular in the last few seconds is the one it goes for ("hits back"). */
const GRUDGE_SECONDS = 3;

function fight(ctx: StepContext, e: Entity, pattern: CantinaPattern, index: number): Input {
  const { world, content } = ctx;
  const box = content.characters[e.kind]!.box;
  const mid = e.x + box.w / 2;
  const foes = world.entities.filter((o) => o !== e && o.room === e.room && hasBody(content, o) && !o.c.flattened && heldBy(o) === null);
  const grudge = e.c.lastHit && world.tick - e.c.lastHit.tick <= GRUDGE_SECONDS * TICK_RATE ? foes.find((o) => o.id === e.c.lastHit!.by) : undefined;
  const middle = (o: Entity): number => o.x + content.characters[o.kind]!.box.w / 2;
  let target = grudge;
  if (!target) {
    let best = Infinity;
    for (const o of foes) {
      const d = Math.abs(middle(o) - mid) + Math.abs(o.y - e.y);
      if (d < best) [best, target] = [d, o];
    }
  }
  // Deterministic variety: each character's clock is offset by its place in the roster.
  const t = world.tick + index * 23;
  const held: string[] = [];
  const jumpEvery = ticksOf(pattern.fight.jumpEvery);
  if (jumpEvery > 0 && t % jumpEvery < 10) held.push('jump');
  if (!target) return { x: 0, y: 0, held };
  const dx = middle(target) - mid;
  const dir = dx > 0 ? 1 : dx < 0 ? -1 : e.facing;
  const gap = Math.abs(dx) - (box.w + content.characters[target.kind]!.box.w) / 2;
  let x = 0;
  if (gap > pattern.fight.reach) x = dir;
  else {
    // Turned to face it with the lightest touch of the stick, then swings on its own beat.
    if (e.facing !== dir) x = dir * 0.05;
    const swing = Math.max(1, ticksOf(pattern.fight.swingEvery));
    if (t % swing < 3) held.push('attack');
  }
  // INTENT: never up (see walk()).
  return { x, y: 0, held };
}
