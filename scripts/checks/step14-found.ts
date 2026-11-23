// Step 14 slice B (docs/mechanisms/levels.md, "Pieces"): a piece one
// connection finds is in the other connection's own world, and a kept game
// keeps it across everyone leaving and a rebuilt server. A real server on a
// temporary store (scripts/lib/save-harness.ts), two connections; run by
// `npm run check`.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { Content } from '../../src/content/types.ts';
import { GAME_PREFIX } from '../../src/server/saves.ts';
import { bootServer, joinAs, until } from '../lib/save-harness.ts';
import type { Booted } from '../lib/save-harness.ts';
import type { ScriptCheck } from '../lib/script-checks.ts';

const check: ScriptCheck = {
  id: 'step14-found',
  gate: null,
  proves:
    "a piece one connection finds is the world's: a hero put on the town's piece over the awning finds it in the server's world, the other connection's own world then has it found, and after everyone leaves and a new server loads the kept game from the same store a joining connection's world has it still, while a new game's does not",
  async run(content: Content): Promise<string[]> {
    const failures: string[] = [];
    const set = content.completion?.['castle-town'];
    const piece = set?.pieces.find((p) => p.room && p.tile);
    if (!set || !piece?.room || !piece.tile) return ['no placed piece in content/completion/castle-town.json'];
    const room = content.rooms[piece.room]!;
    const has = (w: { found?: Record<string, string[]> }): boolean => (w.found?.['castle-town'] ?? []).includes(piece.id);
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'irreverents-step14-found-'));
    const name = GAME_PREFIX + 'PQRS';
    let server: Booted | null = null;
    try {
      server = await bootServer(content, dir);
      const a = joinAs(content, server.port, 'a', name);
      const b = joinAs(content, server.port, 'b', name);
      const online = await until(failures, 'two players join the game', () => a.c.status() === 'online' && b.c.status() === 'online' && !!server!.game.worlds.get(name), () => `${a.c.status()} / ${b.c.status()}`);
      if (online) {
        const w = server.game.worlds.get(name)!.world;
        if (has(w)) failures.push('the piece is found before anyone touched it');
        // The page owns its body's place (docs/mechanisms/network.md): stand a's hero on the piece's tile.
        const me = a.c.me();
        const box = content.characters[me.kind]!.box;
        me.room = room.id;
        me.x = piece.tile[0] * room.tile + (room.tile - box.w) / 2;
        me.y = (piece.tile[1] + 1) * room.tile - box.h;
        me.vx = 0;
        me.vy = 0;
        await until(failures, "the server's world has the piece found", () => has(w), () => JSON.stringify(w.found ?? {}));
        await until(failures, "the other connection's own world has it found", () => has(b.c.world), () => JSON.stringify(b.c.world.found ?? {}));
      }
      a.leave();
      b.leave();
      await until(failures, 'the game is forgotten once its last player is gone', () => !server!.game.worlds.has(name), () => 'still there');
      await server.stop();

      server = await bootServer(content, dir);
      const c = joinAs(content, server.port, 'c', name);
      if (await until(failures, 'player c joins the saved game', () => c.c.status() === 'online' && !!server!.game.worlds.get(name), () => c.c.status())) {
        if (!has(server.game.worlds.get(name)!.world)) failures.push(`after the restart the kept game's found pieces are ${JSON.stringify(server.game.worlds.get(name)!.world.found ?? {})}, expected ${piece.id} among them`);
        await until(failures, "c's own world has the kept piece", () => has(c.c.world), () => JSON.stringify(c.c.world.found ?? {}));
      }
      c.leave();
      const d = joinAs(content, server.port, 'd', GAME_PREFIX + 'TUVW');
      if (await until(failures, 'player d joins a new game', () => d.c.status() === 'online' && !!server!.game.worlds.get(GAME_PREFIX + 'TUVW'), () => d.c.status())) {
        if (has(server.game.worlds.get(GAME_PREFIX + 'TUVW')!.world)) failures.push('a new game has the other game\'s piece found');
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
