// Step 17's checks (scripts/checks/step17-*.ts): a real server on a free
// port with a store in a given directory, and headless players running the
// page's own network client (src/net/client.ts). Not a check itself
// (scripts/checks/ loads every file there as one).
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import WebSocket from 'ws';
import type { Content } from '../../src/content/types.ts';
import { createNetClient } from '../../src/net/client.ts';
import type { NetClient } from '../../src/net/client.ts';
import { attachGame } from '../../src/server/game.ts';
import type { Game } from '../../src/server/game.ts';
import { openStore } from '../../src/server/store.ts';
import type { Input } from '../../src/sim/types.ts';

export interface Booted {
  game: Game;
  port: number;
  /** Everything the server reported (what main.ts sends to /debug/errors). */
  problems: string[];
  stop(): Promise<void>;
}

/** One server on a fresh openStore(dir), as src/server/main.ts makes it after a restart. */
export async function bootServer(content: Content, dir: string): Promise<Booted> {
  const server = http.createServer();
  const problems: string[] = [];
  const game = attachGame(server, { content, commit: 'check', startedAt: new Date().toISOString(), store: openStore(dir), problem: (m) => problems.push(m) });
  await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));
  const port = (server.address() as AddressInfo).port;
  return {
    game,
    port,
    problems,
    stop: async () => {
      game.close();
      server.closeAllConnections();
      await new Promise<void>((done) => server.close(() => done()));
    },
  };
}

export interface Player {
  c: NetClient;
  /** What the server said when it set this player's world aside, or null. */
  gone(): string | null;
  /** Leave on purpose (says `bye`). */
  leave(): void;
  /** Stop without a word (the socket is cut). */
  drop(): void;
}

/** A headless player in world `world`, stepped 60 times a second until it leaves. `input` (Step 13): what it holds each frame; left out, nothing. */
export function joinAs(content: Content, port: number, id: string, world: string, input?: () => Input): Player {
  let ws: WebSocket | null = null;
  let why: string | null = null;
  const c = createNetClient({
    content,
    player: id,
    world,
    now: () => performance.now(),
    onGone: (w) => (why = w),
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
  const frames = setInterval(() => c.update(input ? input() : { x: 0, y: 0, held: [] }), 1000 / 60);
  return {
    c,
    gone: () => why,
    leave: () => {
      c.leave();
      clearInterval(frames);
      setTimeout(() => ws?.terminate(), 200);
    },
    drop: () => {
      clearInterval(frames);
      ws?.terminate();
    },
  };
}

export const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/** Waits until `cond`; on timeout pushes `what` (with `seen()`) to `failures` and answers false. */
export async function until(failures: string[], what: string, cond: () => boolean, seen: () => string, ms = 3000): Promise<boolean> {
  const end = performance.now() + ms;
  while (performance.now() < end) {
    if (cond()) return true;
    await sleep(10);
  }
  failures.push(`${what}: not within ${ms} ms (${seen()})`);
  return false;
}
