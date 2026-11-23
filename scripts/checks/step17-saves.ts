// Step 17 (docs/mechanisms/saves.md): a kept game outlasts its players
// leaving and the server being rebuilt. A real server on a free port with a
// store in a temporary directory, a headless player running the page's own
// network client (src/net/client.ts), as scripts/checks/together.ts does.
// Run by `npm run check`.
import fs from 'node:fs';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import os from 'node:os';
import path from 'node:path';
import WebSocket from 'ws';
import type { Content } from '../../src/content/types.ts';
import { createNetClient } from '../../src/net/client.ts';
import type { NetClient } from '../../src/net/client.ts';
import { attachGame } from '../../src/server/game.ts';
import type { Game } from '../../src/server/game.ts';
import { GAME_PREFIX } from '../../src/server/saves.ts';
import type { SaveRecord } from '../../src/server/saves.ts';
import { openStore } from '../../src/server/store.ts';
import { partState } from '../../src/sim/room-state.ts';
import type { Entity, World } from '../../src/sim/types.ts';
import type { ScriptCheck } from '../lib/script-checks.ts';

const check: ScriptCheck = {
  id: 'step17-saves',
  gate: null,
  proves: "a kept game outlasts everyone leaving and the server being rebuilt on the same store: its room state and a moved body are there when it is joined again, its save holds no player's character, a second new code starts fresh, and a save naming a room and a kind this build does not have still loads, without them, saying so once",
  async run(content: Content): Promise<string[]> {
    const failures: string[] = [];
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'irreverents-step17-'));
    const problems: string[] = [];
    const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
    const until = async (what: string, cond: () => boolean, seen: () => string, ms = 3000): Promise<boolean> => {
      const end = performance.now() + ms;
      while (performance.now() < end) {
        if (cond()) return true;
        await sleep(10);
      }
      failures.push(`${what}: not within ${ms} ms (${seen()})`);
      return false;
    };

    /** One server on a fresh openStore(dir), as src/server/main.ts makes it after a restart. */
    const boot = async (): Promise<{ game: Game; port: number; stop: () => Promise<void> }> => {
      const server = http.createServer();
      const game = attachGame(server, { content, commit: 'check', startedAt: new Date().toISOString(), store: openStore(dir), problem: (m) => problems.push(m) });
      await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));
      const port = (server.address() as AddressInfo).port;
      return {
        game,
        port,
        stop: async () => {
          game.close();
          server.closeAllConnections();
          await new Promise<void>((done) => server.close(() => done()));
        },
      };
    };
    /** A headless player in world `world`, stepped 60 times a second until `leave()`. */
    const player = (port: number, id: string, world: string): { c: NetClient; leave: () => void } => {
      let ws: WebSocket | null = null;
      const c = createNetClient({
        content,
        player: id,
        world,
        now: () => performance.now(),
        connect(h) {
          ws = new WebSocket(`ws://127.0.0.1:${port}/ws`);
          ws.on('open', () => h.open());
          ws.on('message', (d) => h.message(d.toString()));
          ws.on('close', () => h.close());
          ws.on('error', () => h.close());
          const s = ws;
          return { send: (t) => s.readyState === s.OPEN && s.send(t), close: () => s.close() };
        },
      });
      const frames = setInterval(() => c.update({ x: 0, y: 0, held: [] }), 1000 / 60);
      return {
        c,
        leave: () => {
          c.leave();
          clearInterval(frames);
          setTimeout(() => ws?.terminate(), 200);
        },
      };
    };

    const code = 'QWZX';
    const fresh = 'MNPB';
    const name = GAME_PREFIX + code;
    const room = content.game.startRoom;
    const PART = 'step17-check';
    /** A body nobody plays in the start room (a placed crate or person), to move. */
    const bodyIn = (w: World): Entity | undefined => w.entities.find((e) => e.player === null && e.room === room && !e.kind.startsWith('~'));

    let one: Awaited<ReturnType<typeof boot>> | null = null;
    let two: Awaited<ReturnType<typeof boot>> | null = null;
    try {
      // 1. A game is played, changed, and everyone leaves.
      one = await boot();
      const a = player(one.port, 'a', name);
      if (!(await until('player a joins the game', () => a.c.status() === 'online' && !!one!.game.worlds.get(name), () => a.c.status()))) return failures;
      const gw = one.game.worlds.get(name)!;
      if (one.game.gameExists(code) !== true) failures.push('while being played, the game does not say it exists');
      if (one.game.gameExists(fresh) !== false) failures.push(`a code nobody has used (${fresh}) says it exists`);
      partState(gw.world, room, PART).marked = 'kept';
      const body = bodyIn(gw.world);
      let movedId = '';
      let movedX = 0;
      if (!body) failures.push(`the start room ${room} has no body nobody plays to move (content/placements/)`);
      else {
        body.x += 24;
        movedId = body.id;
        await sleep(1000);
        movedX = gw.world.entities.find((e) => e.id === movedId)!.x;
      }
      a.leave();
      await until('the game is forgotten in memory once its last player is gone', () => !one!.game.worlds.has(name), () => 'still there');
      await one.stop();
      one = null;

      // 2. What is on disk: one record, no player in it.
      const file = path.join(dir, 'irreverents', `save-${code.toLowerCase()}.json`);
      if (!fs.existsSync(file)) failures.push(`no save was written (${file} does not exist)`);
      else {
        const saved = JSON.parse(fs.readFileSync(file, 'utf8')) as { records: SaveRecord[] };
        if (saved.records.length !== 1) failures.push(`the save holds ${saved.records.length} records, expected exactly one`);
        const rec = saved.records[0];
        if (rec && rec.world.entities.some((e) => e.player !== null)) failures.push(`the save holds a player's character: ${rec.world.entities.filter((e) => e.player !== null).map((e) => e.id).join(', ')}`);
        if (rec && (rec.version !== 1 || rec.code !== code)) failures.push(`the record says version ${rec.version}, code ${rec.code}; expected 1 and ${code}`);
      }

      // 3. A new server on the same directory: the game comes back as it was left.
      two = await boot();
      if (two.game.gameExists(code) !== true) failures.push('after the restart, the saved game does not say it exists');
      const b = player(two.port, 'b', name);
      if (await until('player b joins the saved game', () => b.c.status() === 'online' && !!two!.game.worlds.get(name), () => b.c.status())) {
        const w = two.game.worlds.get(name)!.world;
        const mark = w.rooms?.[room]?.parts[PART]?.marked;
        if (mark !== 'kept') failures.push(`the room state set before everyone left is not there after the restart (${room} part ${PART}: ${JSON.stringify(mark)})`);
        if (movedId) {
          const back = w.entities.find((e) => e.id === movedId);
          if (!back) failures.push(`the moved body ${movedId} is not in the loaded game`);
          else if (Math.abs(back.x - movedX) > 2) failures.push(`the moved body ${movedId} is at x ${back.x.toFixed(1)} after the restart, but was left at ${movedX.toFixed(1)}`);
          if (w.entities.filter((e) => e.id === movedId).length > 1) failures.push(`the moved body ${movedId} is in the loaded game twice`);
        }
        const players = w.entities.filter((e) => e.player !== null).map((e) => e.id);
        if (players.join() !== 'p:b') failures.push(`the loaded game holds players [${players.join(', ')}], expected only p:b`);
      }
      b.leave();

      // 4. Control: a second, new code starts fresh.
      const c = player(two.port, 'c', GAME_PREFIX + fresh);
      if (await until('player c joins a new game', () => c.c.status() === 'online' && !!two!.game.worlds.get(GAME_PREFIX + fresh), () => c.c.status())) {
        const w = two.game.worlds.get(GAME_PREFIX + fresh)!.world;
        if (w.rooms?.[room]?.parts[PART]) failures.push(`a new game (${fresh}) has the other game's room state`);
        if (movedId && Math.abs((w.entities.find((e) => e.id === movedId)?.x ?? -1) - movedX) < 1) failures.push(`a new game (${fresh}) has the other game's moved body where it was left`);
      }
      c.leave();
      await until('both games are forgotten in memory', () => two!.game.worlds.size === 0, () => [...two!.game.worlds.keys()].join(', '));
      await two.stop();
      two = null;

      // 5. A save written by an older build, naming a room and a kind this one does not have, still loads.
      const oldCode = 'HJKR';
      const oldFile = path.join(dir, 'irreverents', `save-${oldCode.toLowerCase()}.json`);
      const old: SaveRecord = {
        version: 1,
        code: oldCode,
        savedAt: new Date().toISOString(),
        commit: 'older-build',
        rooms: Object.keys(content.rooms).concat('a-room-that-was-removed'),
        world: {
          tick: 1234,
          entities: [
            { id: 'old:gone-room', kind: Object.keys(content.characters)[0]!, player: null, room: 'a-room-that-was-removed', x: 10, y: 10, vx: 0, vy: 0, facing: 1, onGround: true, c: {} },
            { id: 'old:gone-kind', kind: 'a-kind-that-was-removed', player: null, room, x: 10, y: 10, vx: 0, vy: 0, facing: 1, onGround: true, c: {} },
            { id: 'old:kept', kind: Object.keys(content.characters)[0]!, player: null, room, x: 77, y: 10, vx: 0, vy: 0, facing: 1, onGround: true, c: {} },
            { id: 'p:stale', kind: Object.keys(content.characters)[0]!, player: 'stale', room, x: 10, y: 10, vx: 0, vy: 0, facing: 1, onGround: true, c: {} },
          ],
          rooms: { 'a-room-that-was-removed': { tiles: {}, parts: {} }, [room]: { tiles: {}, parts: { [PART]: { marked: 'old' } } } },
        },
      };
      fs.writeFileSync(oldFile, JSON.stringify({ version: 1, collection: `save-${oldCode.toLowerCase()}`, records: [old] }));
      problems.length = 0;
      two = await boot();
      const d = player(two.port, 'd', GAME_PREFIX + oldCode);
      if (await until('player d joins the older save', () => d.c.status() === 'online' && !!two!.game.worlds.get(GAME_PREFIX + oldCode), () => d.c.status())) {
        const w = two.game.worlds.get(GAME_PREFIX + oldCode)!.world;
        const ids = w.entities.map((e) => e.id);
        if (!ids.includes('old:kept')) failures.push('a body that still fits was not loaded from the older save');
        if (ids.includes('old:gone-room') || ids.includes('old:gone-kind')) failures.push(`bodies whose room or kind is gone were loaded: ${ids.filter((i) => i.startsWith('old:gone')).join(', ')}`);
        if (ids.includes('p:stale')) failures.push("a player's character in an older save was loaded");
        if (w.rooms?.['a-room-that-was-removed']) failures.push('the state of a room that is gone was loaded');
        if (w.rooms?.[room]?.parts[PART]?.marked !== 'old') failures.push('the room state of a room that still exists was not loaded from the older save');
        const said = problems.filter((m) => m.includes('no longer has'));
        if (said.length !== 1) failures.push(`what was dropped should be said exactly once, but was said ${said.length} times (${JSON.stringify(problems)})`);
      }
      d.leave();
      await until('the older game is forgotten in memory', () => two!.game.worlds.size === 0, () => [...two!.game.worlds.keys()].join(', '));
    } catch (err) {
      failures.push(`the check itself crashed: ${(err as Error).stack ?? String(err)}`);
    } finally {
      if (one) await one.stop();
      if (two) await two.stop();
      fs.rmSync(dir, { recursive: true, force: true });
    }
    return failures;
  },
};
export default check;
