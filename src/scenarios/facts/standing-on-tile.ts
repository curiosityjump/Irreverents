import { checkAt, checkOnly, bodyAt, bodyName, checkBody, feet, round2 } from '../fact-helpers.ts';
import type { Fact } from '../types.ts';

/**
 * { "fact": "standing-on-tile", "player": "a", "at": 120, "tile": [12, 7] }
 * At that tick the player is on the ground and the tile under the middle of
 * their feet is column 12, row 7 (counted from 0 at the room's top-left).
 */
const fact: Fact = {
  id: 'standing-on-tile',
  validate(spec, scenario, content) {
    const out: string[] = [];
    checkOnly(spec, ['player', 'entity', 'at', 'tile'], out);
    checkBody(spec, scenario, out, content);
    checkAt(spec, scenario, out);
    const t = spec.tile;
    if (!Array.isArray(t) || t.length !== 2 || !t.every((n) => Number.isInteger(n))) {
      out.push(`tile: must be [column, row], but is ${JSON.stringify(t)}`);
    }
    return out;
  },
  test(spec, rec) {
    const e = bodyAt(rec, spec, spec.at as number);
    if (!e) return `${bodyName(spec)} is not in the world at tick ${spec.at}`;
    const [tx, ty] = spec.tile as [number, number];
    const f = feet(rec, e);
    if (e.onGround && f.tx === tx && f.ty === ty) return null;
    return `at tick ${spec.at} ${bodyName(spec)} is ${e.onGround ? 'standing on' : 'in the air over'} tile [${f.tx}, ${f.ty}] (feet at ${round2(f.x)}, ${round2(f.y)}), expected standing on tile [${tx}, ${ty}]`;
  },
};
export default fact;
