import { known } from '../../content/reader.ts';
import '../../sim/stage.ts';
import { checkAt, checkOnly } from '../fact-helpers.ts';
import type { Fact } from '../types.ts';

/**
 * { "fact": "stage", "stage": "iron-quarry", "at": 600, "state": "cleared",
 *   "tries": 0, "best": { "stars": 3, "ticks": 359 } }
 * (Step 22 push 3, docs/mechanisms/stages.md) At that tick the world's run of
 * the stage (`world.stages[id]`) has each field given: `state` ("idle",
 * "running", "cleared"), `tries`, and `best` (its stars and ticks, or `null`
 * for no clear yet). Give at least one.
 */
const fact: Fact = {
  id: 'stage',
  validate(spec, scenario, content) {
    const out: string[] = [];
    checkOnly(spec, ['stage', 'at', 'state', 'tries', 'best'], out);
    checkAt(spec, scenario, out);
    if (typeof spec.stage !== 'string' || !(spec.stage in (content.stages ?? {}))) out.push(`stage: no stage ${JSON.stringify(spec.stage)} (stages: ${known(content.stages ?? {})})`);
    if (spec.state === undefined && spec.tries === undefined && spec.best === undefined) out.push('give at least one of state, tries, best');
    if (spec.state !== undefined && !['idle', 'running', 'cleared'].includes(spec.state as string)) out.push('state: one of idle, running, cleared');
    if (spec.tries !== undefined && !Number.isInteger(spec.tries)) out.push('tries: a whole number');
    const b = spec.best as { stars?: unknown; ticks?: unknown } | null | undefined;
    if (b !== undefined && b !== null && !(typeof b === 'object' && Number.isInteger(b.stars) && Number.isInteger(b.ticks))) out.push('best: { "stars": n, "ticks": n } or null');
    return out;
  },
  test(spec, rec) {
    const t = spec.at as number;
    const run = rec.history[t]?.stages?.[spec.stage as string];
    const got = { state: run?.state ?? null, tries: run?.tries ?? null, best: run?.best ?? null };
    const wrong: string[] = [];
    if (spec.state !== undefined && got.state !== spec.state) wrong.push(`state ${String(got.state)}, expected ${spec.state as string}`);
    if (spec.tries !== undefined && got.tries !== spec.tries) wrong.push(`tries ${String(got.tries)}, expected ${String(spec.tries)}`);
    if (spec.best !== undefined && JSON.stringify(got.best) !== JSON.stringify(spec.best)) wrong.push(`best ${JSON.stringify(got.best)}, expected ${JSON.stringify(spec.best)}`);
    return wrong.length ? `at tick ${t} stage "${spec.stage as string}": ${wrong.join('; ')}` : null;
  },
};
export default fact;
