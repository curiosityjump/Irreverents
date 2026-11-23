// Step 17 hardening, item 2 (docs/mechanisms/saves.md, "At a deploy"): the
// server started the way Railway starts it (`npm start`) saves every game
// being played when the top process is told to stop (SIGTERM), as at a
// deploy. Run by `npm run check`. No volume is needed: the server says how
// many games it saved on its way out.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import WebSocket from 'ws';
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
  id: 'step17-stop-save',
  gate: null,
  proves: "`npm start` (as Railway starts the server), told to stop with SIGTERM while a kept game is being played, saves it before it exits: the signal reaches node through npm",
  async run(): Promise<string[]> {
    const file = path.join(root, 'dist/server.cjs');
    const sources = Math.max(newestIn(path.join(root, 'src')), newestIn(path.join(root, 'content')));
    if (!fs.existsSync(file) || fs.statSync(file).mtimeMs < sources) {
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
    // No volume variables: the store keeps games in memory, which is enough to count what is saved.
    const env: NodeJS.ProcessEnv = { ...process.env, PORT: String(port) };
    delete env.RAILWAY_VOLUME_MOUNT_PATH;
    delete env.RAILWAY_VOLUME_NAME;
    // Its own process group, so whatever is left behind (a server the signal never reached) can be stopped afterwards.
    const npm = spawn('npm', ['start', '--silent'], { cwd: root, env, stdio: ['ignore', 'pipe', 'pipe'], detached: true });
    npm.stdout.on('data', (d: Buffer) => (output += d.toString()));
    npm.stderr.on('data', (d: Buffer) => (output += d.toString()));
    const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
    let ws: WebSocket | null = null;
    try {
      let up = false;
      for (let i = 0; i < 100 && !up && npm.exitCode === null; i++) {
        up = await fetch(`http://127.0.0.1:${port}/healthz`).then((r) => r.ok, () => false);
        if (!up) await sleep(100);
      }
      if (!up) return [`npm start did not answer /healthz within 10 s: ${output.trim().slice(-500)}`];
      const welcomed = await new Promise<boolean>((resolve) => {
        ws = new WebSocket(`ws://127.0.0.1:${port}/ws`);
        const t = setTimeout(() => resolve(false), 3000);
        ws.on('open', () => ws!.send(JSON.stringify({ t: 'join', player: 'stop-check', world: 'game-STPS', e: {}, fresh: true })));
        ws.on('message', (d) => {
          if ((JSON.parse(d.toString()) as { t: string }).t === 'welcome') {
            clearTimeout(t);
            resolve(true);
          }
        });
        ws.on('error', () => resolve(false));
      });
      if (!welcomed) return ['could not join a kept game on the server npm start started'];
      // The process Railway signals is the top one: npm.
      npm.kill('SIGTERM');
      const exited = await Promise.race([new Promise<boolean>((r) => npm.once('exit', () => r(true))), sleep(5000).then(() => false)]);
      await sleep(200);
      const said = /stopping on SIGTERM: saved (\d+) kept game/.exec(output);
      if (!said) failures.push(`after SIGTERM to npm, the server never said it saved its games (it did not get the signal?); npm ${exited ? 'exited' : 'did NOT exit within 5 s'}; output: ${output.trim().slice(-400)}`);
      else if (said[1] !== '1') failures.push(`after SIGTERM the server saved ${said[1]} kept games, expected the 1 being played`);
    } catch (err) {
      failures.push(`the check itself crashed: ${(err as Error).stack ?? String(err)}`);
    } finally {
      (ws as WebSocket | null)?.terminate();
      try {
        if (npm.pid) process.kill(-npm.pid, 'SIGKILL');
      } catch {
        // the whole group is already gone
      }
    }
    return failures;
  },
};
export default check;
