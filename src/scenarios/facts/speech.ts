import { speechLine, speechLineNumber } from '../../content/speech.ts';
import { speechTicksPerLine } from '../../sim/systems/audience-speech.ts';
import { bodyAt, bodyName, checkAt, checkBody, checkOnly, isRange, isTick } from '../fact-helpers.ts';
import type { Fact, Recording } from '../types.ts';

/**
 * { "fact": "speech", "entity": "king", "at": 1200, "line": [7, 7], "differs-from-at": 0 }
 * At that tick the body is on a line of its speech (content/audience/)
 * whose number is inside "line", both ends included. Optional
 * "differs-from-at": the words showing differ from those at that earlier tick.
 */
function lineAt(rec: Recording, spec: Record<string, unknown>, tick: number): { n: number; text: string } | string {
  const e = bodyAt(rec, spec, tick);
  if (!e) return `${bodyName(spec)} is not in the world at tick ${tick}`;
  const a = Object.values(rec.content.audience).find((x) => x.speaker === e.id);
  if (!a) return `${bodyName(spec)} gives no speech (no content/audience/ file names it as "speaker")`;
  const n = speechLineNumber(a, e.c.audience?.ticks, speechTicksPerLine(rec.content.tuning.world.speechLineTime));
  return { n, text: speechLine(a, n) };
}

const fact: Fact = {
  id: 'speech',
  validate(spec, scenario, content) {
    const out: string[] = [];
    checkOnly(spec, ['player', 'entity', 'at', 'line', 'differs-from-at'], out);
    checkBody(spec, scenario, out, content);
    checkAt(spec, scenario, out);
    if (!isRange(spec.line)) out.push(`line: must be [min, max] line numbers, but is ${JSON.stringify(spec.line)}`);
    const d = spec['differs-from-at'];
    if (d !== undefined && (!isTick(d, scenario) || (typeof spec.at === 'number' && d >= spec.at))) out.push(`differs-from-at: must be a tick before "at", but is ${JSON.stringify(d)}`);
    return out;
  },
  test(spec, rec) {
    const now = lineAt(rec, spec, spec.at as number);
    if (typeof now === 'string') return now;
    const [min, max] = spec.line as [number, number];
    if (now.n < min || now.n > max) return `at tick ${spec.at} ${bodyName(spec)} is on line ${now.n} ("${now.text}"), expected a line from ${min} to ${max}`;
    const d = spec['differs-from-at'] as number | undefined;
    if (d !== undefined) {
      const then = lineAt(rec, spec, d);
      if (typeof then === 'string') return then;
      if (then.text === now.text) return `at tick ${spec.at} ${bodyName(spec)} is saying "${now.text}", the same words as at tick ${d}`;
    }
    return null;
  },
};
export default fact;
