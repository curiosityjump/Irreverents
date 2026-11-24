// Step 21, hearts (docs/mechanisms/defeat.md, "Hearts"): a hero who is out
// of hearts is never moved into a wall. In test-body's crawlspace (columns
// 5-7, 16 px high) only the infiltrator fits; out of hearts there, its
// player is the next member with hearts at the room's way in (its first
// spawn), standing clear of every solid tile. Out in the open, the same is
// done where it stands. The real step() on a hand-made world: a scenario
// cannot take a heart away mid-run without a bandit. Run by `npm run check`.
import type { Content } from '../../src/content/types.ts';
import { boxInSolid } from '../../src/sim/party.ts';
import { step } from '../../src/sim/step.ts';
import type { SimEvent } from '../../src/sim/types.ts';
import { createWorld, spawnPlayer } from '../../src/sim/world.ts';
import type { ScriptCheck } from '../lib/script-checks.ts';

const check: ScriptCheck = {
  id: 'step21-out-spot',
  gate: null,
  proves:
    "a hero out of hearts is never moved into a wall: the infiltrator out of hearts inside test-body's crawlspace becomes the next member with hearts at the room's way in, clear of solid tiles; out in the open it becomes it where it stands",
  async run(content: Content): Promise<string[]> {
    const failures: string[] = [];
    const room = content.rooms['test-body'];
    if (!room) return ['no room test-body'];
    for (const [where, feetX] of [['way-in', 109.1], ['here', 200]] as const) {
      const world = createWorld();
      const e = spawnPlayer(world, content, { player: 'a', character: 'infiltrator', room: room.id });
      const box = content.characters.infiltrator!.box;
      e.x = feetX - box.w / 2;
      e.y = 160 - box.h;
      world.heartsLost = { infiltrator: content.hearts.heroes.infiltrator ?? content.hearts.default };
      let events: SimEvent[] = [];
      for (let t = 0; t < 2; t++) events = events.concat(step(world, {}, content));
      const out = events.find((ev) => ev.type === 'hero-out') as Extract<SimEvent, { type: 'hero-out' }> | undefined;
      const body = content.characters[e.kind]!.box;
      if (!out) failures.push(`${where}: no hero-out (the player is still the ${e.kind})`);
      else if (out.where !== where) failures.push(`${where}: the ${out.to} was put ${out.where}, expected ${where}`);
      if (e.kind === 'infiltrator') failures.push(`${where}: the player is still the infiltrator, who has no hearts`);
      if (boxInSolid(room, e.x, e.y, body.w, body.h, world)) failures.push(`${where}: the ${e.kind} is inside a wall at ${e.x}, ${e.y}`);
    }
    return failures;
  },
};
export default check;
