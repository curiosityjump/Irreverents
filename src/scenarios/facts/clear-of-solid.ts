import { checkOnly, checkPlayer, isRange, isTick, playerAt, round2 } from '../fact-helpers.ts';
import { boxInSolid } from '../../sim/party.ts';
import type { Fact } from '../types.ts';

/**
 * { "fact": "clear-of-solid", "player": "a", "between": [0, 120] }
 * On every tick from 0 to 120, both included, the player's whole body is
 * outside every solid tile: it is never inside a wall, floor or ceiling.
 */
const fact: Fact = {
  id: 'clear-of-solid',
  validate(spec, scenario) {
    const out: string[] = [];
    checkOnly(spec, ['player', 'between'], out);
    checkPlayer(spec, scenario, out);
    const b = spec.between;
    if (!isRange(b) || !isTick(b[0], scenario) || !isTick(b[1], scenario)) {
      out.push(`between: must be [first tick, last tick] within 0 to ${scenario.ticks}, but is ${JSON.stringify(b)}`);
    }
    return out;
  },
  test(spec, rec) {
    const [from, to] = spec.between as [number, number];
    for (let t = from; t <= to; t++) {
      const e = playerAt(rec, spec.player as string, t);
      if (!e) return `player ${spec.player} is not in the world at tick ${t}`;
      const room = rec.content.rooms[e.room]!;
      const box = rec.content.characters[e.kind]!.box;
      if (boxInSolid(room, e.x, e.y, box.w, box.h)) {
        return `at tick ${t} player ${spec.player} (the ${e.kind}, ${box.w}x${box.h}) is inside solid tiles: its box starts at ${round2(e.x)}, ${round2(e.y)}`;
      }
    }
    return null;
  },
};
export default fact;
