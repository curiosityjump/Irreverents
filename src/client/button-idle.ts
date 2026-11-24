import type { Content } from '../content/types.ts';
import type { Entity, World } from '../sim/types.ts';
import { canAct } from '../sim/body-state.ts';
import { machineOf } from '../sim/machines.ts';
import { memberTaken } from '../sim/party.ts';

/**
 * Which touch buttons a press would do nothing with right now, so the page
 * can dim them (index.html `.idle`; brief owner-better-buttons: "shows when
 * it would do nothing"). Asked of the composed world the page draws, by the
 * same rules the simulation acts on; a dimmed button still takes the press.
 *
 * INTENT: only a button we can be sure of is dimmed. A dimmed button that
 * would have done something tells the player a lie, which is worse than a
 * lit one that does nothing. So: Use, when the Use arbiter has no answer and
 * this body is not a machine (a rider's Use is read by machine-seat.ts);
 * Switch, when the switch verb's own rule finds no free member, or this
 * body cannot act (src/sim/verbs/switch.ts). Jump, Hit and Grab always do
 * something (a jump, a swing, a reach), so they never dim.
 * DRAFT: the rule per button; a wall may still refuse a Switch that is lit.
 */
export function idleActions(content: Content, world: World, me: Entity, useAnswered: boolean): Set<string> {
  const idle = new Set<string>();
  if (!useAnswered && !machineOf(content, me.kind)) idle.add('interact');
  const members = world.party ?? content.party.members;
  const at = members.indexOf(me.kind);
  const anyFree = at >= 0 && members.some((m, i) => i !== at && content.characters[m] !== undefined && !memberTaken(world, m, me.id));
  if (!anyFree || !canAct(me)) idle.add('switch');
  return idle;
}

/** Puts `.idle` on exactly the buttons named; touches the page only on a change. */
export function showIdle(host: HTMLElement, idle: Set<string>): void {
  for (const b of host.querySelectorAll<HTMLElement>('#actions [data-action]')) {
    const want = idle.has(b.dataset.action ?? '');
    if (b.classList.contains('idle') !== want) b.classList.toggle('idle', want);
  }
}
