import systemList from './systems/index.gen.ts';
import verbList from './verbs/index.gen.ts';
import type { System, Verb } from './types.ts';

// INTENT: sorted by (order, id), never by file or import order, so every
// device runs the same things in the same order.
function byOrder<T extends { id: string; order: number }>(list: T[]): T[] {
  return [...list].sort((a, b) => a.order - b.order || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

export const systems: System[] = byOrder(systemList);
export const verbs: Verb[] = byOrder(verbList);
