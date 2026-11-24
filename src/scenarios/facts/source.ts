import { checkAt, checkOnly } from '../fact-helpers.ts';
import type { Fact } from '../types.ts';

/**
 * { "fact": "source", "id": "depot-strongroom", "at": 400, "lit": true, "found": true }
 * At that tick the power source (a `sources` entry of content/powers/) is lit
 * or dark, and/or is (or is not) in `world.sources`, the sources a hero has
 * found (Step 9, docs/mechanisms/powers.md). Give "lit", "found" or both.
 */
const fact: Fact = {
  id: 'source',
  validate(spec, scenario, content) {
    const out: string[] = [];
    checkOnly(spec, ['id', 'at', 'lit', 'found'], out);
    checkAt(spec, scenario, out);
    const ids = Object.values(content.powers ?? {}).flatMap((p) => p.sources.map((s) => s.id));
    if (typeof spec.id !== 'string' || !ids.includes(spec.id)) out.push(`id: must be a power source id (${ids.join(', ') || 'there are none'}), but is ${JSON.stringify(spec.id)}`);
    if (spec.lit === undefined && spec.found === undefined) out.push('lit / found: give at least one');
    for (const k of ['lit', 'found']) if (spec[k] !== undefined && typeof spec[k] !== 'boolean') out.push(`${k}: must be true or false`);
    return out;
  },
  test(spec, rec) {
    const w = rec.history[spec.at as number]!;
    const e = w.entities.find((x) => x.c.source?.id === spec.id);
    if (!e) return `at tick ${spec.at} source ${spec.id} is not in the world (its room's placements are put in with "placements": true)`;
    if (spec.lit !== undefined && e.c.source!.lit !== spec.lit) {
      const when = rec.history.map((h, t) => [t, h.entities.find((x) => x.c.source?.id === spec.id)?.c.source?.lit] as const).filter(([t, l], i, a) => i === 0 || a[i - 1]![1] !== l).map(([t, l]) => `${t}: ${l ? 'lit' : 'dark'}`);
      return `at tick ${spec.at} source ${spec.id} is ${e.c.source!.lit ? 'lit' : 'dark'}, expected ${spec.lit ? 'lit' : 'dark'} (by tick: ${when.join('; ')})`;
    }
    const found = (w.sources ?? []).includes(spec.id as string);
    if (spec.found !== undefined && found !== spec.found) return `at tick ${spec.at} world.sources is ${JSON.stringify(w.sources ?? [])}, expected ${spec.id} ${spec.found ? 'in it' : 'not in it'}`;
    return null;
  },
};
export default fact;
