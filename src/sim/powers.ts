// Powers on a body (Step 9; docs/mechanisms/powers.md). The one place a
// held power is laid over a character's own numbers and verbs. The four read
// sites (systems/verbs.ts twice, body-state.ts `bodyNumbers` and
// systems/physics.ts) all ask this file, so the overlay is never applied in
// one place and forgotten in another. Pure, like the rest of src/sim. Not in
// a registry directory on purpose: it is a helper.
import type { Content } from '../content/types.ts';
import type { Power } from '../content/kinds/powers.ts';
import type { Entity } from './types.ts';

declare module './types.ts' {
  interface Components {
    /**
     * The power this body holds, if any. Only an effect sets or clears it
     * (`{ kind: 'power' }`, src/sim/effects.ts), so it reaches the holder's
     * own page. `id` is a power id (content/powers/). `src` is the source it
     * was taken from, if it came off a pedestal.
     * DRAFT: one power per hero (O-005 leaves slots OPEN).
     */
    power?: { id: string; src?: string };
  }
}

const NONE: Record<string, number> = {};

/** The power a body holds, or null. Reads with a default: a body saved before Step 9 has no `c.power`. */
export function powerOf(content: Content, e: Entity): Power | null {
  const id = e.c.power?.id;
  if (id === undefined) return null;
  return content.powers?.[id] ?? null;
}

/**
 * A body's character numbers with its power laid over them: first `times`,
 * then `atLeast`. With no power it is the tuning set itself (no copy), so a
 * world with no power in it reads exactly what it read before Step 9.
 */
export function numbersOf(content: Content, e: Entity): Record<string, number> {
  const kind = content.characters[e.kind];
  const set = (kind && content.tuning.characters[kind.tuning]) || NONE;
  const p = powerOf(content, e);
  if (!p) return set;
  const out = { ...set };
  for (const [k, v] of Object.entries(p.times)) if (out[k] !== undefined) out[k] *= v;
  for (const [k, v] of Object.entries(p.atLeast)) out[k] = Math.max(out[k] ?? v, v);
  return out;
}

/** The verbs a body may do: its character kind's, plus any its power lends. With no power it is the kind's own list. */
export function verbsOf(content: Content, e: Entity): string[] {
  const own = content.characters[e.kind]?.verbs ?? [];
  const p = powerOf(content, e);
  if (!p || p.lends.length === 0) return own;
  return [...own, ...p.lends.filter((v) => !own.includes(v))];
}
