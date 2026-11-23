import { checkAt, checkOnly, checkPlayer, playerAt } from '../fact-helpers.ts';
import type { Fact } from '../types.ts';

/**
 * { "fact": "character", "player": "a", "at": 60, "is": "flyer" }
 * At that tick the player is playing that character kind (content/characters/).
 * { "fact": "character", "player": "a", "at": 0, "differentFrom": "b" }
 * At that tick players a and b are different characters. Either or both.
 */
const fact: Fact = {
  id: 'character',
  validate(spec, scenario, content) {
    const out: string[] = [];
    checkOnly(spec, ['player', 'at', 'is', 'differentFrom'], out);
    checkPlayer(spec, scenario, out);
    checkAt(spec, scenario, out);
    if (spec.is === undefined && spec.differentFrom === undefined) out.push('is / differentFrom: give at least one');
    if (spec.is !== undefined && (typeof spec.is !== 'string' || !(spec.is in content.characters))) {
      out.push(`is: no character ${JSON.stringify(spec.is)} (characters: ${Object.keys(content.characters).sort().join(', ')})`);
    }
    if (spec.differentFrom !== undefined && (spec.differentFrom === spec.player || !scenario.players.some((p) => p.id === spec.differentFrom))) {
      out.push(`differentFrom: must be another of this scenario's players, but is ${JSON.stringify(spec.differentFrom)}`);
    }
    return out;
  },
  test(spec, rec) {
    const e = playerAt(rec, spec.player as string, spec.at as number);
    if (!e) return `player ${spec.player} is not in the world at tick ${spec.at}`;
    if (spec.is !== undefined && e.kind !== spec.is) return `at tick ${spec.at} player ${spec.player} is the ${e.kind}, expected the ${spec.is}`;
    if (spec.differentFrom !== undefined) {
      const other = playerAt(rec, spec.differentFrom as string, spec.at as number);
      if (!other) return `player ${spec.differentFrom} is not in the world at tick ${spec.at}`;
      if (other.kind === e.kind) return `at tick ${spec.at} players ${spec.player} and ${spec.differentFrom} are both the ${e.kind}, expected different characters`;
    }
    return null;
  },
};
export default fact;
