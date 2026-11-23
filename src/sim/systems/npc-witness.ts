import type { Entity, StepContext, System } from '../types.ts';
import { findEntity } from '../world.ts';
import { eventRows, reactionFor, verdictFor, whoIs } from '../npc/rules.ts';
import type { Who } from '../npc/rules.ts';
import { canSee } from '../npc/sight.ts';
import { bark, centre, isOut, npcKind, setMood } from '../npc/state.ts';

interface Deed {
  deed: string;
  by: string;
  target: string | null;
  thing: string | null;
}

/**
 * This tick's deeds: Step 4's own (`did`), and any other step's event that
 * content/rules/ maps to a deed ("events": event type, deed, which fields
 * name who did it and to whom). Step 2's hit, grab and throw arrive this
 * way without this file knowing them.
 */
function deedsOf(ctx: StepContext): Deed[] {
  const out: Deed[] = [];
  for (const ev of [...ctx.events]) {
    if (ev.type === 'did') {
      out.push({ deed: ev.deed, by: ev.by, target: ev.target, thing: ev.thing });
      continue;
    }
    const fields = ev as unknown as Record<string, unknown>;
    for (const row of eventRows(ctx.content, ev.type)) {
      const by = fields[row.by];
      const target = row.target === undefined ? null : fields[row.target];
      if (typeof by === 'string') out.push({ deed: row.deed, by, target: typeof target === 'string' ? target : null, thing: null });
    }
  }
  return out;
}

function witnessed(ctx: StepContext, witness: Entity, d: Deed, actor: Who, target: Who | null, at: { x: number; y: number }): void {
  const n = witness.c.npc!;
  const me = whoIs(ctx.content, witness);
  if (!me) return;
  const row = verdictFor(ctx.content, d.deed, actor, target, me);
  if (!row) return;
  const rageAt = ctx.content.tuning.world.npcRageAt!;
  let justReassured = false;

  if (row.verdict === 'odd') {
    n.dissonance += row.weight;
    if (!n.offenders.includes(d.by)) n.offenders = [...n.offenders, d.by].sort();
    n.quiet = 0;
    n.cool = 0;
    n.lastSeen = { x: at.x, y: at.y };
    // INTENT (D-044): the first deviation is a fluke. From business as usual
    // one odd deed, however heavy, only ever reaches distress.
    if (n.mood === 1) setMood(ctx, witness, 2, `odd:${d.deed}`);
    // INTENT (D-045): persisting is what makes rage.
    else if (n.mood === 2 && n.dissonance >= rageAt) setMood(ctx, witness, 3, `odd:${d.deed}`);
  } else if (n.offenders.includes(d.by)) {
    // INTENT (D-042, D-072): distress calms at once when the offender is
    // seen doing something expected: this same tick, not a fade. The owner
    // calls the speed of this "core to the game's comedy and strategy".
    // INTENT (D-073): good-guy rage does NOT: in mood 3 no expected act in
    // view helps a good person. (D-051: a bad person's rage calms like distress.)
    if (n.mood === 2 || (n.mood === 3 && me.side === 'bad')) {
      setMood(ctx, witness, 1, `expected:${d.deed}`);
      ctx.emit('reassured', { entity: witness.id, by: d.by, deed: d.deed });
      bark(ctx, witness, 'reassured');
      justReassured = true;
    }
  }

  // INTENT (D-049): mood 1 is role conformity, not friendliness. A
  // shopkeeper being robbed by the villain stays in business as usual and
  // happily opposes him: fighting inside mood 1 is the design.
  if (n.mood === 1 && row.verdict === 'expected') {
    const reaction = reactionFor(ctx.content, d.deed, actor, me);
    if (!reaction) return;
    if (reaction.reaction === 'oppose') ctx.emit('opposed', { entity: witness.id, target: d.by, deed: d.deed });
    if (!justReassured) bark(ctx, witness, reaction.reaction);
  }
}

/**
 * Who perceived each deed of this tick, and what it did to their mood.
 * Runs after physics (500) and after every system that can emit a deed.
 */
const system: System = {
  id: 'npc-witness',
  order: 600,
  tuning: {
    npcSightRange: { min: 0, max: 2000, what: 'how far across, in pixels, a person sees in front of them' },
    npcSightHeight: { min: 0, max: 2000, what: 'how far up or down, in pixels, a person sees' },
    npcRageAt: { min: 2, max: 1000, what: 'how much unexpected behaviour witnessed turns distress into rage (each odd deed adds its weight from content/rules/)' },
    npcBarkTime: { min: 0.1, max: 30, what: 'seconds a bark stays over a head' },
  },
  run(ctx) {
    const { world, content } = ctx;
    for (const d of deedsOf(ctx)) {
      const doer = findEntity(world, d.by);
      const actor = whoIs(content, doer);
      if (!doer || !actor) continue;
      const done = d.target === null ? undefined : findEntity(world, d.target);
      const at = centre(content, doer);
      // DRAFT: the one done to always perceives a deed, facing or not; anyone
      // else has to see the doer (src/sim/npc/sight.ts).
      const witnesses = world.entities.filter((e) => e.c.npc && npcKind(content, e) && e.id !== d.by && e.room === doer.room && !isOut(e) && (e.id === d.target || canSee(content, e, doer)));
      ctx.emit('deed', { deed: d.deed, by: d.by, player: doer.player, target: d.target, thing: d.thing, room: doer.room, x: at.x, y: at.y, witnesses: witnesses.map((e) => e.id) });
      for (const w of witnesses) witnessed(ctx, w, d, actor, whoIs(content, done), at);
    }
  },
};
export default system;
