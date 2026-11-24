// Step 21, hearts (docs/mechanisms/defeat.md, "Hearts"): the party's hearts
// are the world's. A heart lost in the server's world is in both
// connections' own worlds, and a kept game keeps it across everyone leaving
// and a rebuilt server, while a new game's party is full. A real server on a
// temporary store (scripts/lib/save-harness.ts), two connections; run by
// `npm run check`. (That a fall to a bandit takes the heart is the
// scenarios' to show: step21-heart-*.)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { Content } from '../../src/content/types.ts';
import { GAME_PREFIX } from '../../src/server/saves.ts';
import { heartsLeft, loseHeart, maxHearts } from '../../src/sim/hearts.ts';
import type { World } from '../../src/sim/types.ts';
import { bootServer, joinAs, until } from '../lib/save-harness.ts';
import type { Booted } from '../lib/save-harness.ts';
import type { ScriptCheck } from '../lib/script-checks.ts';

const check: ScriptCheck = {
  id: 'step21-hearts',
  gate: null,
  proves:
    "the party's hearts are the world's: a heart the grappler loses in the server's world is one fewer in both connections' own worlds, and after everyone leaves and a new server loads the kept game from the same store a joining connection's world has it lost still, while a new game's grappler has every heart",
  async run(content: Content): Promise<string[]> {
    const failures: string[] = [];
    const full = maxHearts(content, 'grappler');
    const left = (w: World): number => heartsLeft(w, content, 'grappler');
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'irreverents-step21-hearts-'));
    const name = GAME_PREFIX + 'HRTS';
    let server: Booted | null = null;
    try {
      server = await bootServer(content, dir);
      const a = joinAs(content, server.port, 'a', name);
      const b = joinAs(content, server.port, 'b', name);
      const online = await until(failures, 'two players join the game', () => a.c.status() === 'online' && b.c.status() === 'online' && !!server!.game.worlds.get(name), () => `${a.c.status()} / ${b.c.status()}`);
      if (online) {
        const w = server.game.worlds.get(name)!.world;
        if (left(w) !== full) failures.push(`a new game's grappler has ${left(w)} hearts, expected ${full}`);
        loseHeart(w, content, 'grappler');
        await until(failures, "a's own world has the grappler one heart down", () => left(a.c.world) === full - 1, () => String(left(a.c.world)));
        await until(failures, "b's own world has the grappler one heart down", () => left(b.c.world) === full - 1, () => String(left(b.c.world)));
      }
      a.leave();
      b.leave();
      await until(failures, 'the game is forgotten once its last player is gone', () => !server!.game.worlds.has(name), () => 'still there');
      await server.stop();

      server = await bootServer(content, dir);
      const c = joinAs(content, server.port, 'c', name);
      if (await until(failures, 'player c joins the saved game', () => c.c.status() === 'online' && !!server!.game.worlds.get(name), () => c.c.status())) {
        const n = left(server.game.worlds.get(name)!.world);
        if (n !== full - 1) failures.push(`after the restart the kept game's grappler has ${n} hearts, expected ${full - 1}`);
        await until(failures, "c's own world has the kept hearts", () => left(c.c.world) === full - 1, () => String(left(c.c.world)));
      }
      c.leave();
      const d = joinAs(content, server.port, 'd', GAME_PREFIX + 'FULL');
      if (await until(failures, 'player d joins a new game', () => d.c.status() === 'online' && !!server!.game.worlds.get(GAME_PREFIX + 'FULL'), () => d.c.status())) {
        const n = left(server.game.worlds.get(GAME_PREFIX + 'FULL')!.world);
        if (n !== full) failures.push(`a new game's grappler has ${n} hearts, expected ${full}`);
      }
      d.leave();
      await until(failures, 'both games are forgotten', () => server!.game.worlds.size === 0, () => [...server!.game.worlds.keys()].join(', '));
    } finally {
      await server?.stop();
      fs.rmSync(dir, { recursive: true, force: true });
    }
    return failures;
  },
};
export default check;
