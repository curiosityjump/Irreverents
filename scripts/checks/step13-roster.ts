// Step 13 (docs/mechanisms/recruits.md): the roster is the world's. A real
// server on a temporary store (scripts/lib/save-harness.ts); run by
// `npm run check`. Push 1: a new kept game and everyone's kingdom start with
// the roster's `start` on the server and on a joining page; a `?room=`
// world has no roster of its own (everyone). Push 3: in a kept game, A frees
// the camp's captive (Use held at the cage while the fighter looks away); B,
// in another room, gets `recruited` and B's own world has the hero; the
// roster outlasts everyone leaving and a rebuilt server.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { Content } from '../../src/content/types.ts';
import { DEFAULT_WORLD } from '../../src/net/protocol.ts';
import { recruitId } from '../../src/sim/recruits.ts';
import type { Input } from '../../src/sim/types.ts';
import { GAME_PREFIX } from '../../src/server/saves.ts';
import { bootServer, joinAs, until } from '../lib/save-harness.ts';
import type { Booted } from '../lib/save-harness.ts';
import type { ScriptCheck } from '../lib/script-checks.ts';

const check: ScriptCheck = {
  id: 'step13-roster',
  gate: null,
  proves:
    "the roster is the world's: a new kept game and everyone's kingdom start with the roster's start list unlocked, in the server's world and in a joining connection's own world, while a ?room= world (made for checks) has no roster of its own and so keeps everyone; and in a kept game one connection frees the camp's captive by holding Use at the cage while the fighter looks away: the other connection, in another room, gets `recruited` in its events and its own world's roster then has the hero, and the roster is still there after everyone leaves and a rebuilt server loads the game",
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
      m.leave();
      r.leave();
      // Push 3: A frees the captive; B, in the start room, hears of it.
      const rec = content.recruits['camp-captive'];
      if (!rec) failures.push('no content/recruits/camp-captive.json');
      else {
        let hold = false;
        const held = (): Input => ({ x: 0, y: 0, held: hold ? ['interact'] : [] });
        a.leave();
        const a2 = joinAs(content, server.port, 'a2', game, held);
        const b = joinAs(content, server.port, 'b', game);
        // Every snapshot's events, gathered as they come (latest() holds only the last snapshot's).
        let heard = false;
        const listen = setInterval(() => (heard ||= b.c.latest().events.some((e) => e.type === 'recruited')), 5);
        if (await until(failures, 'two players join the kept game', () => a2.c.status() === 'online' && b.c.status() === 'online', () => `${a2.c.status()} / ${b.c.status()}`)) {
          const world = server.game.worlds.get(game)!.world;
          const fighter = (): { facing: number } | undefined => world.entities.find((e) => e.id === 'camp-fighter-2');
          // Wait for the fighter to turn west (he faces east 7 s, then west 3 s), then stand at the cage and hold.
          if (await until(failures, 'the second fighter turns west', () => fighter()?.facing === -1, () => `facing ${fighter()?.facing}`, 12000)) {
            const me = a2.c.me();
            const box = content.characters[me.kind]!.box;
            const T = content.rooms[rec.room]!.tile;
            me.room = rec.room;
            me.x = (rec.tile[0] + rec.w / 2) * T - box.w / 2;
            me.y = (rec.tile[1] + 1) * T - box.h;
            me.vx = 0;
            me.vy = 0;
            hold = true;
            const cage = (): { open: boolean } | undefined => world.entities.find((e) => e.id === recruitId(rec.id))?.c.recruit;
            await until(failures, "the server's cage opens", () => cage()?.open === true, () => JSON.stringify(cage()), 5000);
            hold = false;
            if (!world.roster?.includes(rec.character)) failures.push(`the server's roster is ${JSON.stringify(world.roster)}, without ${rec.character}`);
            await until(failures, 'B, in another room, gets `recruited`', () => heard, () => `B in ${b.c.me().room}`);
            await until(failures, "B's own world's roster has the hero", () => !!b.c.world.roster?.includes(rec.character), () => JSON.stringify(b.c.world.roster));
          }
        }
        clearInterval(listen);
        a2.leave();
        b.leave();
        await until(failures, 'the game is forgotten once its last player is gone', () => !server!.game.worlds.has(game), () => 'still there');
        await server.stop();
        server = await bootServer(content, dir);
        const c = joinAs(content, server.port, 'c', game);
        if (await until(failures, 'player c joins the saved game', () => c.c.status() === 'online' && !!server!.game.worlds.get(game), () => c.c.status())) {
          const roster = server.game.worlds.get(game)!.world.roster;
          if (!roster?.includes(rec.character)) failures.push(`after the restart the kept game's roster is ${JSON.stringify(roster)}, without ${rec.character}`);
          await until(failures, "c's own world has the kept hero", () => !!c.c.world.roster?.includes(rec.character), () => JSON.stringify(c.c.world.roster));
        }
        c.leave();
      }
    } finally {
      await server?.stop();
      fs.rmSync(dir, { recursive: true, force: true });
    }
    return failures;
  },
};
export default check;
