// The server's half of the ?tune dials (docs/mechanisms/tuning-panel.md),
// without a browser: a page is not trusted to send sane numbers, one
// world's dials never move another's, and someone joining a tuned world
// gets its numbers. Run by `npm run check`.
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import WebSocket from 'ws';
import type { Content } from '../../src/content/types.ts';
import { attachGame } from '../../src/server/game.ts';
import type { ScriptCheck } from '../lib/script-checks.ts';

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

const check: ScriptCheck = {
  id: 'tune-server',
  gate: null,
  proves: 'a ?tune change reaches the server and every page of its world: an unknown set or name, a non-number or an out-of-range number refuses the whole message (answered to the sender alone, nothing applied); a good one is applied to that world only and sent to every page in it, and a page joining later is sent the world\'s numbers',
  async run(content: Content): Promise<string[]> {
    const failures: string[] = [];
    const server = http.createServer();
    const game = attachGame(server, { content, commit: 'check', startedAt: new Date().toISOString() });
    await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));
    const port = (server.address() as AddressInfo).port;
    const shippedTuning = JSON.stringify(content.tuning);
    const W = `check-tune-${process.pid}`;
    const OTHER = `${W}-other`;
    const socks: WebSocket[] = [];

    /** A raw page: joins, and keeps every `tuning` message it is sent. */
    const page = async (player: string, world: string): Promise<{ ws: WebSocket; got: unknown[] }> => {
      const ws = new WebSocket(`ws://127.0.0.1:${port}/ws`);
      socks.push(ws);
      const got: unknown[] = [];
      ws.on('message', (d) => {
        const m = JSON.parse(d.toString()) as { t: string; diff?: unknown };
        if (m.t === 'tuning') got.push(m.diff);
      });
      await new Promise<void>((done) => ws.on('open', () => done()));
      const e = { id: '', kind: 'grappler', room: content.game.startRoom, x: 0, y: 0, vx: 0, vy: 0, facing: 1, onGround: false, player, c: {} };
      ws.send(JSON.stringify({ t: 'join', player, world, e, fresh: true }));
      await sleep(150);
      return { ws, got };
    };
    const tune = async (ws: WebSocket, changes: unknown, reset = false): Promise<void> => {
      ws.send(JSON.stringify({ t: 'tune', changes, reset }));
      await sleep(150);
    };
    const set = Object.keys(content.tuning.characters).find((k) => content.tuning.characters[k]!.runSpeed !== undefined)!;
    const run = content.tuning.characters[set]!.runSpeed!;

    try {
      const a = await page('tune-a', W);
      const b = await page('tune-b', W);
      const o = await page('tune-o', OTHER);
      if (a.got.length + b.got.length + o.got.length !== 0) failures.push(`pages joining untuned worlds were sent ${a.got.length + b.got.length + o.got.length} tuning messages (want 0)`);

      const bad: [string, unknown][] = [
        ['an unknown name', [{ set, name: 'notANumber', v: 1 }]],
        ['an unknown set', [{ set: 'nobody', name: 'runSpeed', v: 1 }]],
        ['a string', [{ set, name: 'runSpeed', v: '200' }]],
        ['NaN as null-ish garbage', [{ set, name: 'runSpeed', v: { n: 1 } }]],
        ['out of range', [{ set, name: 'runSpeed', v: 100000 }]],
        ['negative gravity', [{ set: 'world', name: 'gravity', v: -1 }]],
        ['one good and one bad', [{ set, name: 'runSpeed', v: run + 1 }, { set, name: 'runSpeed', v: -5 }]],
        ['not a list', 'runSpeed=1'],
      ];
      for (const [what, changes] of bad) {
        const before = { a: a.got.length, b: b.got.length };
        await tune(a.ws, changes);
        const gw = game.worlds.get(W);
        const now = gw?.content?.tuning.characters[set]?.runSpeed ?? run;
        if (now !== run) failures.push(`${what}: applied anyway (runSpeed is ${now})`);
        if (a.got.length !== before.a + 1) failures.push(`${what}: the sender was not answered with the world's numbers`);
        if (b.got.length !== before.b) failures.push(`${what}: another page of the world was sent a refused change`);
      }

      await tune(a.ws, [{ set, name: 'runSpeed', v: run + 10 }, { set: 'world', name: 'gravity', v: 700 }]);
      const last = (got: unknown[]): any => got[got.length - 1]; // eslint-disable-line @typescript-eslint/no-explicit-any
      for (const [who, p] of [['the sender', a], ['the other page', b]] as const) {
        const d = last(p.got);
        if (d?.characters?.[set]?.runSpeed !== run + 10 || d?.world?.gravity !== 700) failures.push(`a good change: ${who} was sent ${JSON.stringify(d)}`);
      }
      if (game.worlds.get(W)?.content?.tuning.characters[set]?.runSpeed !== run + 10) failures.push('a good change was not applied to the world the server steps');
      if (o.got.length !== 0 || game.worlds.get(OTHER)?.content) failures.push('a change in one world reached another');
      if (JSON.stringify(content.tuning) !== shippedTuning) failures.push('the shared content was changed (every world would follow it)');

      const c = await page('tune-c', W);
      if (last(c.got)?.characters?.[set]?.runSpeed !== run + 10) failures.push(`a page joining the tuned world was sent ${JSON.stringify(c.got)}`);

      await tune(b.ws, [], true);
      if (JSON.stringify(last(a.got)) !== '{}' || game.worlds.get(W)?.content?.tuning.characters[set]?.runSpeed !== run) failures.push(`reset: the world still differs (${JSON.stringify(last(a.got))})`);
      await tune(b.ws, [{ set, name: 'runSpeed', v: run + 3 }]);
      await tune(b.ws, [{ set, name: 'runSpeed', v: null }]);
      if (JSON.stringify(last(c.got)) !== '{}') failures.push(`a null puts the shipped number back: sent ${JSON.stringify(last(c.got))}`);
    } finally {
      for (const s of socks) s.close();
      game.close();
      await new Promise<void>((done) => server.close(() => done()));
    }
    return failures;
  },
};
export default check;
