// The BUILT server (dist/server.cjs), started the way Railway starts it, as
// a child process on a free port: it must answer /healthz and let two
// players join. Run by `npm run check`, so by everyone before every push.
//
// INTENT: with the owner's storage volume attached, Railway stops the old
// server before starting the new one, so a build that fails to START leaves
// nothing serving the game. This is the check that would catch it first
// (docs/plan/step-1.md, "The built server is started once before every code push").
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import WebSocket from 'ws';
import { createNetClient } from '../../src/net/client.ts';
import type { NetClient } from '../../src/net/client.ts';
import { playerEntityId } from '../../src/net/protocol.ts';
import { root } from '../lib/registries.ts';
import type { ScriptCheck } from '../lib/script-checks.ts';

function newestIn(dir: string): number {
  let newest = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true, recursive: true })) {
    if (entry.isFile() && !entry.name.endsWith('.gen.ts')) newest = Math.max(newest, fs.statSync(path.join(entry.parentPath, entry.name)).mtimeMs);
  }
  return newest;
}

const check: ScriptCheck = {
  id: 'built-server',
  gate: null,
  proves: 'the built server (dist/server.cjs) starts as its own process, answers /healthz, and two players can join it',
  async run(content): Promise<string[]> {
    const file = path.join(root, 'dist/server.cjs');
    const sources = Math.max(newestIn(path.join(root, 'src')), newestIn(path.join(root, 'content')));
    if (!fs.existsSync(file) || fs.statSync(file).mtimeMs < sources) {
      // A stale build would test yesterday's server; build what is here.
      const { build } = await import('../build.ts');
      if (!(await build())) return ['dist/ was missing or older than the sources, and npm run build failed'];
    }
    const port = await new Promise<number>((resolve, reject) => {
      const s = net.createServer();
      s.once('error', reject);
      s.listen(0, '127.0.0.1', () => {
        const p = (s.address() as net.AddressInfo).port;
        s.close(() => resolve(p));
      });
    });
    const failures: string[] = [];
    let output = '';
    const child = spawn(process.execPath, [file], { env: { ...process.env, PORT: String(port) }, stdio: ['ignore', 'pipe', 'pipe'] });
    child.stdout.on('data', (d: Buffer) => (output += d.toString()));
    child.stderr.on('data', (d: Buffer) => (output += d.toString()));
    const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
    const sockets: WebSocket[] = [];
    let frames: NodeJS.Timeout | undefined;
    try {
      let health = null as { ok?: boolean; players?: number } | null;
      for (let i = 0; i < 100 && !health && child.exitCode === null; i++) {
        try {
          health = (await (await fetch(`http://127.0.0.1:${port}/healthz`)).json()) as typeof health;
        } catch {
          await sleep(50);
        }
      }
      if (!health?.ok) return [`the built server did not answer /healthz within 5 s (exit code ${child.exitCode}); it printed: ${output.trim().slice(-600) || '(nothing)'}`];
      if (typeof health.players !== 'number') failures.push('/healthz does not say how many players are in the shared world ("players")');
      const page = await fetch(`http://127.0.0.1:${port}/`);
      if (!page.ok || !(await page.text()).includes('game.js')) failures.push(`GET / did not return the page (HTTP ${page.status})`);

      const make = (player: string): NetClient =>
        createNetClient({
          content,
          player,
          world: `check-built-${process.pid}`,
          now: () => performance.now(),
          connect(h) {
            const ws = new WebSocket(`ws://127.0.0.1:${port}/ws`);
            sockets.push(ws);
            ws.on('open', () => h.open());
            ws.on('message', (d) => h.message(d.toString()));
            ws.on('close', () => h.close());
            ws.on('error', () => h.close());
            return { send: (t) => ws.readyState === ws.OPEN && ws.send(t), close: () => ws.close() };
          },
        });
      const a = make('a');
      const b = make('b');
      const idle = { x: 0, y: 0, held: [] };
      frames = setInterval(() => {
        a.update(idle);
        b.update(idle);
      }, 1000 / 60);
      const sees = (): boolean => a.others().some((e) => e.id === playerEntityId('b')) && b.others().some((e) => e.id === playerEntityId('a'));
      for (let i = 0; i < 300 && !sees(); i++) await sleep(10);
      if (!sees()) failures.push(`two players joined the built server but did not see each other within 3 s (a: ${a.status()}, b: ${b.status()})`);
      a.leave();
      b.leave();
      await sleep(50);
    } catch (err) {
      failures.push(`the check itself crashed: ${(err as Error).stack ?? String(err)}`);
    } finally {
      clearInterval(frames);
      for (const ws of sockets) ws.terminate();
      // Stopped by its pid, and waited for.
      if (child.exitCode === null) {
        await new Promise<void>((done) => {
          child.once('exit', () => done());
          process.kill(child.pid!);
        });
      }
    }
    return failures;
  },
};
export default check;
