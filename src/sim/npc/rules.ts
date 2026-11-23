import { HERO_ROLE } from '../../content/kinds/npcs.ts';
import type { Side } from '../../content/kinds/npcs.ts';
import type { EventRow, ExpectRow, ReactionRow, Rules } from '../../content/kinds/rules.ts';
import type { Content } from '../../content/types.ts';
import type { Entity } from '../types.ts';
import { npcKind } from './state.ts';

/** The part someone plays in the eyes of the rules. */
export interface Who {
  role: string;
  side: Side | null;
}

/**
 * INTENT (D-050, "The world evaluates WHO is acting and WHAT their expected
 * role dictates"): every player's character is a "hero" whichever body it
 * is; a person has their kind's role and side; anything else (a crate) has
 * no part, and what it "does" is not a deed.
 */
export function whoIs(content: Content, e: Entity | undefined): Who | null {
  if (!e) return null;
  if (e.player !== null) return { role: HERO_ROLE, side: null };
  const kind = npcKind(content, e);
  return kind ? { role: kind.role, side: kind.side } : null;
}

/** Every rules file, in file-name order, so two devices always read the tables the same way. */
function files(content: Content): Rules[] {
  return Object.keys(content.rules)
    .sort()
    .map((id) => content.rules[id]!);
}

const OPTIONAL = ['targetRole', 'targetSide', 'witnessRole', 'witnessSide'] as const;

/**
 * What `witness` makes of `actor` doing `deed` (to `target`, if anyone).
 * The matching row with the most conditions wins; between equals, the first
 * in file-name then row order. No row at all: the deed means nothing to
 * this witness (null), which is neither expected nor odd.
 */
export function verdictFor(content: Content, deed: string, actor: Who, target: Who | null, witness: Who): ExpectRow | null {
  let best: ExpectRow | null = null;
  let bestScore = -1;
  for (const f of files(content)) {
    for (const row of f.expect) {
      if (row.actor !== actor.role || row.deed !== deed) continue;
      if (row.targetRole !== undefined && row.targetRole !== target?.role) continue;
      if (row.targetSide !== undefined && row.targetSide !== target?.side) continue;
      if (row.witnessRole !== undefined && row.witnessRole !== witness.role) continue;
      if (row.witnessSide !== undefined && row.witnessSide !== witness.side) continue;
      const score = OPTIONAL.filter((k) => row[k] !== undefined).length;
      if (score > bestScore) {
        best = row;
        bestScore = score;
      }
    }
  }
  return best;
}

export function reactionFor(content: Content, deed: string, actor: Who, witness: Who): ReactionRow | null {
  for (const f of files(content)) {
    for (const row of f.reactions) {
      if (row.witness === witness.role && row.actor === actor.role && row.deed === deed) return row;
    }
  }
  return null;
}

/** The rows saying which deed a simulation event of this type is. */
export function eventRows(content: Content, type: string): EventRow[] {
  return files(content).flatMap((f) => f.events.filter((r) => r.event === type));
}
