import { checkAt, checkOnly } from '../fact-helpers.ts';
import type { Fact } from '../types.ts';

/**
 * { "fact": "signaler", "outpost": "outpost", "at": 1500, "broken": true }
 * At that tick the post with the horn of content/outposts/<outpost>.json is
 * broken (or not). Step 21: being thrown out of the camp resets nothing.
 */
const fact: Fact = {
  id: 'signaler',
  validate(spec, scenario, content) {
    const out: string[] = [];
    checkOnly(spec, ['outpost', 'at', 'broken'], out);
    if (typeof spec.outpost !== 'string' || !content.outposts?.[spec.outpost]) out.push(`outpost: no outpost ${JSON.stringify(spec.outpost)}`);
    checkAt(spec, scenario, out);
    if (typeof spec.broken !== 'boolean') out.push('broken: must be true or false');
    return out;
  },
  test(spec, rec) {
    const op = rec.content.outposts[spec.outpost as string]!;
    const world = rec.history[spec.at as number];
    if (!world) return `no tick ${spec.at as number} (the scenario has ${rec.history.length - 1})`;
    const post = world.entities.find((e) => e.id === op.signaler);
    const broken = post?.c.signaler?.broken === true;
    return broken === spec.broken ? null : `at tick ${spec.at as number} the post was ${broken ? 'broken' : 'not broken'}`;
  },
};
export default fact;
