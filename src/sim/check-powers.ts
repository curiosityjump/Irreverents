// The power checks that need the simulation's own verb list (Step 9,
// docs/mechanisms/powers.md). Apart from src/sim/powers.ts so the helper the
// read sites import never imports the registry.
import type { Content, Problem } from '../content/types.ts';
import { verbs } from './registry.ts';
import type { TuningRule } from './types.ts';

/**
 * The checks that need the simulation's verbs: a lent verb exists, every
 * number a power changes is one some verb reads, and is in range, and a lent
 * verb's every number is given in `atLeast` (a holder who lacks the verb has
 * none of its numbers of its own). Called from src/sim/check-content.ts.
 */
export function checkPowers(content: Content): Problem[] {
  const problems: Problem[] = [];
  const rules: Record<string, TuningRule> = {};
  for (const v of verbs) Object.assign(rules, v.tuning ?? {});
  for (const p of Object.values(content.powers ?? {})) {
    const file = `content/powers/${p.id}.json`;
    const fail = (where: string, message: string): void => {
      problems.push({ file, where, message });
    };
    p.lends.forEach((id, i) => {
      const verb = verbs.find((v) => v.id === id);
      if (!verb) return fail(`lends[${i}]`, `no verb "${id}" (verbs are files in src/sim/verbs/: ${verbs.map((v) => v.id).join(', ')})`);
      for (const name of Object.keys(verb.tuning ?? {})) {
        if (!(name in p.atLeast)) fail('atLeast', `missing "${name}": the lent verb "${id}" reads it, and a holder who lacks that verb has no number of its own`);
      }
    });
    for (const [where, set] of [['atLeast', p.atLeast], ['times', p.times]] as const) {
      for (const [name, v] of Object.entries(set)) {
        const rule = rules[name];
        if (!rule) fail(`${where}.${name}`, 'no verb reads this number (a typo?)');
        else if (where === 'atLeast' && (v < rule.min || v > rule.max)) fail(`${where}.${name}`, `is ${v}, but the verb that reads it needs it between ${rule.min} and ${rule.max} (${rule.what})`);
      }
    }
  }
  return problems;
}
