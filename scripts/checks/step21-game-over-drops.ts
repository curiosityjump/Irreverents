// Step 21, hearts (docs/mechanisms/defeat.md, "Hearts"): what a game over
// leaves where it was and what it puts back. A hand-made world on the real
// step(): the camp's own placements, a grappler in the camp carrying the
// strongbox (world.cargo) and holding the boost and the sword, the castle
// street's alert at 2, and every party member out of hearts. After the beat:
// the player is in the cantina on a pad, free; the strongbox is back on its
// stand (`prize-returned`, nobody carries it, nothing banked); an orb of the
// boost and a loose sword lie in the camp; the street's alert is 0; the
// party's hearts are full. Run by `npm run check`. (A scenario cannot start a
// hero holding a weapon or seed an alert.)
import type { Content } from '../../src/content/types.ts';
import { heartsLeft, maxHearts } from '../../src/sim/hearts.ts';
import { alertLevel } from '../../src/sim/npc/alert.ts';
import { step } from '../../src/sim/step.ts';
import type { SimEvent } from '../../src/sim/types.ts';
import { addEntity, createWorld, populateRoom, spawnPlayer } from '../../src/sim/world.ts';
import type { ScriptCheck } from '../lib/script-checks.ts';

const check: ScriptCheck = {
  id: 'step21-game-over-drops',
  gate: null,
  proves:
    "a game over puts a carried prize back on its stand, leaves a held power and a held weapon lying where their holder stood, ends every alert, gives the party back every heart and leaves the player in the cantina on their own feet",
  async run(content: Content): Promise<string[]> {
    const failures: string[] = [];
    const world = createWorld();
    populateRoom(world, content, 'outpost');
    const e = spawnPlayer(world, content, { player: 'a', character: 'grappler', room: 'outpost' });
    e.c.power = { id: 'boost' };
    e.c.weapon = { id: 'sword' };
    world.cargo = { [e.id]: 'camp-strongbox' };
    addEntity(world, { id: '~alert:castle-street', kind: '~thing', player: null, room: 'castle-street', x: 0, y: 0, vx: 0, vy: 0, facing: 1, onGround: true, c: { alert: { level: 2, quiet: 0 } } } as never);
    const members = world.party ?? content.party.members;
    world.heartsLost = Object.fromEntries(members.map((m) => [m, maxHearts(content, m)]));
    const events: SimEvent[] = [];
    for (let t = 0; t < 200 && !events.some((ev) => ev.type === 'game-over'); t++) events.push(...step(world, {}, content));
    for (let t = 0; t < 3; t++) events.push(...step(world, {}, content));
    const has = (type: string): boolean => events.some((ev) => ev.type === type);
    if (!has('game-over-coming')) failures.push('no game-over-coming');
    if (!has('game-over')) return [...failures, 'no game-over within 200 ticks'];
    if (e.room !== 'cantina') failures.push(`the player is in ${e.room}, expected the cantina`);
    if (e.c.flattened || e.c.effect?.heldBy) failures.push('the player is not free in the cantina');
    if (world.cargo?.[e.id] !== undefined) failures.push(`the player still carries ${world.cargo[e.id]}`);
    if (!events.some((ev) => ev.type === 'prize-returned' && (ev as { thing: string }).thing === 'camp-strongbox')) failures.push('no prize-returned for the strongbox');
    if ((world.banked ?? []).includes('camp-strongbox')) failures.push('the strongbox was banked');
    if (e.c.power || e.c.weapon) failures.push(`the player still holds ${e.c.power?.id ?? ''} ${e.c.weapon?.id ?? ''}`);
    if (!world.entities.some((x) => x.room === 'outpost' && x.id.startsWith('orb:'))) failures.push('no orb of the boost lies in the camp');
    if (!world.entities.some((x) => x.room === 'outpost' && x.c.loose?.weapon === 'sword')) failures.push('no loose sword lies in the camp');
    if (alertLevel(world, 'castle-street') !== 0) failures.push(`the castle street's alert is ${alertLevel(world, 'castle-street')}, expected 0`);
    for (const m of members) if (heartsLeft(world, content, m) !== maxHearts(content, m)) failures.push(`the ${m} has ${heartsLeft(world, content, m)} hearts, expected all`);
    return failures;
  },
};
export default check;
