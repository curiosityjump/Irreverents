// node scripts/e2e/defeat-alone.ts [runs]: Step 21's camp walk (scripts/e2e/defeat.ts) alone, `runs`
// times (default 10), against the built server (`npm run build` first) started here on a free port.
// Prints every fact of every run and how many runs each fact passed. Not part of `npm run e2e`;
// for measuring a fact's rate on a quiet machine (handoff-prompts/hearts.md, the flaky game over).
// NODE_PATH=/opt/node-tools/node_modules, as `npm run e2e` sets, for the preinstalled Playwright.
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import net from 'node:net';
import path from 'node:path';
import { root } from '../lib/registries.ts';
import { defeatFacts } from './defeat.ts';

/* eslint-disable @typescript-eslint/no-explicit-any */
const { chromium, devices } = createRequire(import.meta.url)('playwright') as any;
const runs = Number(process.argv[2] ?? 10);
const port = await new Promise<number>((resolve) => {
  const s = net.createServer();
  s.listen(0, '127.0.0.1', () => {
    const p = (s.address() as net.AddressInfo).port;
    s.close(() => resolve(p));
  });
});
const env: NodeJS.ProcessEnv = { ...process.env, PORT: String(port) };
delete env.RAILWAY_GIT_COMMIT_SHA;
const server = spawn(process.execPath, [path.join(root, 'dist/server.cjs')], { env, stdio: ['ignore', 'pipe', 'inherit'] });
await new Promise<void>((resolve) => server.stdout!.on('data', (d: Buffer) => d.toString().includes('listening') && resolve()));
const browser = await chromium.launch();
const passes: Record<string, number> = {};
try {
  for (let r = 0; r < runs; r++) {
    const errors: string[] = [];
    const fact = (id: string, ok: boolean, text: string): void => {
      passes[id] = (passes[id] ?? 0) + (ok ? 1 : 0);
      console.log(`run ${r + 1}: ${ok ? 'ok  ' : 'FAIL'}  (${id}) ${text}`);
    };
    await defeatFacts({ browser, devices, base: `http://127.0.0.1:${port}`, out: path.join(root, 'e2e-out'), fact, errors, shots: path.join(root, 'e2e-out', 'defeat') });
    for (const e of errors) console.log(`run ${r + 1}: page error ${e}`);
  }
} finally {
  await browser.close();
  server.kill();
}
for (const [id, n] of Object.entries(passes)) console.log(`${id}: ${n} of ${runs}`);
process.exit(Object.values(passes).every((n) => n === runs) ? 0 : 1);
