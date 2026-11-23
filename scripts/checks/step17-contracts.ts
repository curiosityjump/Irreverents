// Step 17 hardening, push C (docs/mechanisms/saves.md, "What /healthz
// shows"): asking whether a game exists leaves nothing behind, and /healthz
// gives a count of saved games, never their codes (a code is how anyone
// joins a game). Run by `npm run check`.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import type { Content } from '../../src/content/types.ts';
import { createSaves } from '../../src/server/saves.ts';
import { openStore } from '../../src/server/store.ts';
import { createWorld, populateRoom } from '../../src/sim/world.ts';
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
  id: 'step17-contracts',
  gate: null,
  proves: "asking about a game code that has no save opens nothing in the store (no entry left behind), saved games are counted on the volume and in memory, and the built server's /healthz shows that count and no game code, even after codes were asked about",
  async run(content: Content): Promise<string[]> {
    const failures: string[] = [];
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'irreverents-step17-contracts-'));
    const problem = (m: string): void => void failures.push(`unexpected problem: ${m}`);
    try {
      const world = createWorld();
      for (const id of Object.keys(content.rooms)) populateRoom(world, content, id);
      for (const [label, store] of [['on a volume', openStore(dir)], ['in memory', openStore(null)]] as const) {
        const saves = createSaves(store, { content, commit: 'check', problem });
        for (const code of ['ZZZZ', 'QQQQ', 'HJKM']) {
          saves.has(code);
          saves.savedAt(code);
          saves.load(code);
        }
        const opened = Object.keys(store.status().collections);
        if (opened.length > 0) failures.push(`${label}: asking about three codes with no save opened ${opened.length} collection(s): ${opened.join(', ')}`);
        saves.save('ABCD', world);
        if (saves.count() !== 1) failures.push(`${label}: one game saved, count() says ${saves.count()}`);
      }
      const again = createSaves(openStore(dir), { content, commit: 'check', problem });
      if (again.count() !== 1 || !again.has('ABCD')) failures.push(`after a restart on the same volume: count() ${again.count()}, has(ABCD) ${again.has('ABCD')}; expected 1 and true`);

      // The built server's /healthz, after codes were asked about.
      const file = path.join(root, 'dist/server.cjs');
      if (!fs.existsSync(file) || fs.statSync(file).mtimeMs < Math.max(newestIn(path.join(root, 'src')), newestIn(path.join(root, 'content')))) {
        const { build } = await import('../build.ts');
        if (!(await build())) return [...failures, 'dist/ was missing or older than the sources, and npm run build failed'];
      }
      const port = await new Promise<number>((resolve, reject) => {
        const s = net.createServer();
        s.once('error', reject);
        s.listen(0, '127.0.0.1', () => {
          const p = (s.address() as net.AddressInfo).port;
          s.close(() => resolve(p));
        });
      });
      const env: NodeJS.ProcessEnv = { ...process.env, PORT: String(port) };
      delete env.RAILWAY_VOLUME_MOUNT_PATH;
      delete env.RAILWAY_VOLUME_NAME;
      const child = spawn(process.execPath, [file], { env, stdio: 'ignore' });
      try {
        let up = false;
        for (let i = 0; i < 100 && !up; i++) {
          up = await fetch(`http://127.0.0.1:${port}/healthz`).then((r) => r.ok, () => false);
          if (!up) await new Promise((r) => setTimeout(r, 100));
        }
        if (!up) return [...failures, 'the built server did not answer /healthz'];
        for (const code of ['WXYZ', 'BCDF']) await fetch(`http://127.0.0.1:${port}/game/${code}`);
        const text = await (await fetch(`http://127.0.0.1:${port}/healthz`)).text();
        const h = JSON.parse(text) as { store?: Record<string, unknown> };
        if (typeof h.store?.saves !== 'number') failures.push(`/healthz store has no count of saved games: ${JSON.stringify(h.store)}`);
        if (h.store && 'collections' in h.store) failures.push(`/healthz store still lists collections: ${JSON.stringify(h.store.collections)}`);
        if (/wxyz|bcdf/i.test(text)) failures.push(`/healthz names a game code that was asked about: ${text.slice(0, 300)}`);
      } finally {
        child.kill('SIGKILL');
      }
    } catch (err) {
      failures.push(`the check itself crashed: ${(err as Error).stack ?? String(err)}`);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
    return failures;
  },
};
export default check;
