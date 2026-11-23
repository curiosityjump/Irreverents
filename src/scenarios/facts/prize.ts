import { checkAt, checkOnly } from '../fact-helpers.ts';
import type { Fact } from '../types.ts';

/**
 * { "fact": "prize", "thing": "camp-strongbox", "at": 1500, "taken": false, "banked": false, "carrier": null }
 * Step 21: at that tick, about a heist's prize: `taken` (someone took it and
 * it is not back on its stand), `banked` (in world.banked), `carrier` (the
 * player whose hero carries it in world.cargo, or null for nobody). Give at
 * least one.
 */
const fact: Fact = {
  id: 'prize',
  validate(spec, scenario, content) {
    const out: string[] = [];
    checkOnly(spec, ['thing', 'at', 'taken', 'banked', 'carrier'], out);
    checkAt(spec, scenario, out);
    const prizes = Object.values(content.heists ?? {}).flatMap((h) => h.prizes.map((p) => p.thing));
    if (typeof spec.thing !== 'string' || !prizes.includes(spec.thing)) out.push(`thing: ${JSON.stringify(spec.thing)} is no heist's prize (prizes: ${prizes.join(', ')})`);
    for (const k of ['taken', 'banked']) if (spec[k] !== undefined && typeof spec[k] !== 'boolean') out.push(`${k}: must be true or false`);
    if (spec.carrier !== undefined && spec.carrier !== null && typeof spec.carrier !== 'string') out.push('carrier: a player id or null');
    if (spec.taken === undefined && spec.banked === undefined && spec.carrier === undefined) out.push('taken / banked / carrier: give at least one');
    return out;
  },
  test(spec, rec) {
    const world = rec.history[spec.at as number];
    if (!world) return `no tick ${spec.at as number}`;
    const thing = spec.thing as string;
    const e = world.entities.find((x) => x.id === thing);
    const taken = (e?.c.thing?.takenBy ?? null) !== null;
    const banked = (world.banked ?? []).includes(thing);
    const heroId = Object.keys(world.cargo ?? {}).find((h) => world.cargo![h] === thing);
    const carrier = heroId === undefined ? null : (world.entities.find((x) => x.id === heroId)?.player ?? heroId);
    const bad: string[] = [];
    if (spec.taken !== undefined && taken !== spec.taken) bad.push(`taken is ${taken}`);
    if (spec.banked !== undefined && banked !== spec.banked) bad.push(`banked is ${banked}`);
    if (spec.carrier !== undefined && carrier !== spec.carrier) bad.push(`carried by ${JSON.stringify(carrier)}`);
    return bad.length ? `at tick ${spec.at as number} "${thing}": ${bad.join(', ')}` : null;
  },
};
export default fact;
