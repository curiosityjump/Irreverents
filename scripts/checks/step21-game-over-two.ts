// Step 21, hearts (docs/mechanisms/defeat.md, "Hearts"): a game over with
// two connections on a real server. Both pages' own worlds have the same
// hearts; when the last heart is gone (the server's world told every heart
// of the party is lost) both pages are moved to the cantina by the world's
// `move` effect, both have every heart back, and both are in charge of their
// bodies there: a page's stick walks its hero and the server's copy follows.
// A real server on a temporary store (scripts/lib/save-harness.ts); run by
// `npm run check`.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { Content } from '../../src/content/types.ts';
import { GAME_PREFIX } from '../../src/server/saves.ts';
import { heartsLeft, maxHearts } from '../../src/sim/hearts.ts';
import type { World } from '../../src/sim/types.ts';
import { bootServer, joinAs, until } from '../lib/save-harness.ts';
import type { Booted } from '../lib/save-harness.ts';
import type { ScriptCheck } from '../lib/script-checks.ts';

const check: ScriptCheck = {
  id: 'step21-game-over-two',
  gate: null,
  proves:
    "a game over reaches every player: with two connections, a heart lost is one fewer on both pages; when the party has none left both pages are moved to the cantina with every heart back, and each page's stick then walks its own hero there, the server's copy following",
  async run(content: Content): Promise<string[]> {
    const failures: string[] = [];
    const members = content.party.members;
    const total = (w: World): number => members.reduce((n, m) => n + heartsLeft(w, content, m), 0);
    const full = members.reduce((n, m) => n + maxHearts(content, m), 0);
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'irreverents-step21-over-'));
    const name = GAME_PREFIX + 'OVER';
    let server: Booted | null = null;
    let walk = false;
    const input = () => ({ x: walk ? 1 : 0, y: 0, held: [] as string[] });
    try {
      server = await bootServer(content, dir);
      const a = joinAs(content, server.port, 'a', name, input);
      const b = joinAs(content, server.port, 'b', name, input);
      if (await until(failures, 'two players join the game', () => a.c.status() === 'online' && b.c.status() === 'online' && !!server!.game.worlds.get(name), () => `${a.c.status()} / ${b.c.status()}`)) {
        const w = server.game.worlds.get(name)!.world;
        const start = { a: a.c.me().room, b: b.c.me().room };
        if (start.a === 'cantina' || start.b === 'cantina') failures.push(`a player starts in the cantina (${start.a}, ${start.b}); the check needs them elsewhere`);
        // One heart short of out, on the server: both pages see it.
        w.heartsLost = Object.fromEntries(members.map((m, i) => [m, maxHearts(content, m) - (i === 0 ? 1 : 0)]));
        await until(failures, "both pages' worlds have one heart left in the party", () => total(a.c.world) === 1 && total(b.c.world) === 1, () => `${total(a.c.world)} / ${total(b.c.world)}`);
        // The last heart: the game over.
        w.heartsLost = { ...w.heartsLost, [members[0]!]: maxHearts(content, members[0]!) };
        await until(failures, "both pages' own heroes are in the cantina", () => a.c.me().room === 'cantina' && b.c.me().room === 'cantina', () => `${a.c.me().room} / ${b.c.me().room}`, 6000);
        await until(failures, "both pages' worlds have every heart back", () => total(a.c.world) === full && total(b.c.world) === full, () => `${total(a.c.world)} / ${total(b.c.world)}`);
        await until(failures, "the server's copies are in the cantina", () => w.entities.filter((e) => e.player !== null).every((e) => e.room === 'cantina'), () => w.entities.filter((e) => e.player !== null).map((e) => e.room).join(', '));
        const x0 = { a: a.c.me().x, b: b.c.me().x };
        walk = true;
        await until(
          failures,
          'each page walks its own hero east in the cantina, and the server follows',
          () => {
            const sa = w.entities.find((e) => e.player === 'a');
            const sb = w.entities.find((e) => e.player === 'b');
            return a.c.me().x > x0.a + 20 && b.c.me().x > x0.b + 20 && !!sa && !!sb && sa.x > x0.a + 10 && sb.x > x0.b + 10 && sa.room === 'cantina' && sb.room === 'cantina';
          },
          () => `pages ${a.c.me().x - x0.a}, ${b.c.me().x - x0.b} px`,
          4000,
        );
        walk = false;
      }
      a.leave();
      b.leave();
      await until(failures, 'the game is forgotten once its last player is gone', () => !server!.game.worlds.has(name), () => 'still there');
    } finally {
      await server?.stop();
      fs.rmSync(dir, { recursive: true, force: true });
    }
    return failures;
  },
};
export default check;
