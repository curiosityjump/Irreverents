// Step 13 (docs/mechanisms/recruits.md): the roster is the world's. A real
// server on a temporary store (scripts/lib/save-harness.ts); run by
// `npm run check`. Push 1: a new kept game and everyone's kingdom start with
// the roster's `start` on the server and on a joining page; a `?room=`
// world has no roster of its own (everyone).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { Content } from '../../src/content/types.ts';
import { DEFAULT_WORLD } from '../../src/net/protocol.ts';
import { GAME_PREFIX } from '../../src/server/saves.ts';
import { bootServer, joinAs, until } from '../lib/save-harness.ts';
import type { Booted } from '../lib/save-harness.ts';
import type { ScriptCheck } from '../lib/script-checks.ts';

const check: ScriptCheck = {
  id: 'step13-roster',
  gate: null,
  proves:
    "the roster is the world's: a new kept game and everyone's kingdom start with the roster's start list unlocked, in the server's world and in a joining connection's own world, while a ?room= world (made for checks) has no roster of its own and so keeps everyone",
  async run(content: Content): Promise<string[]> {
    const failures: string[] = [];
    const start = JSON.stringify(content.roster.start);
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'irreverents-step13-roster-'));
    const game = GAME_PREFIX + 'HJKM';
    let server: Booted | null = null;
    try {
      server = await bootServer(content, dir);
      const a = joinAs(content, server.port, 'a', game);
      const m = joinAs(content, server.port, 'm', DEFAULT_WORLD);
      const r = joinAs(content, server.port, 'r', 'check-step13-roster');
      const worlds = [game, DEFAULT_WORLD, 'check-step13-roster'];
      if (await until(failures, 'three players join three worlds', () => [a, m, r].every((p) => p.c.status() === 'online') && worlds.every((w) => server!.game.worlds.has(w)), () => [a, m, r].map((p) => p.c.status()).join(' / '))) {
        for (const [p, w] of [[a, game], [m, DEFAULT_WORLD]] as const) {
          const got = JSON.stringify(server.game.worlds.get(w)!.world.roster);
          if (got !== start) failures.push(`a new ${w === game ? 'kept game' : "everyone's kingdom"} starts with roster ${got}, expected ${start}`);
          await until(failures, `the joining page's own world in ${w} has the start list`, () => JSON.stringify(p.c.world.roster) === start, () => JSON.stringify(p.c.world.roster));
        }
        const priv = server.game.worlds.get('check-step13-roster')!.world.roster;
        if (priv !== undefined) failures.push(`a ?room= world has roster ${JSON.stringify(priv)}, expected none (everyone)`);
      }
      a.leave();
      m.leave();
      r.leave();
    } finally {
      await server?.stop();
      fs.rmSync(dir, { recursive: true, force: true });
    }
    return failures;
  },
};
export default check;
