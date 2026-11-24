// node scripts/throw-runs.ts <runs> [label]: Step 5, "Thrown friend"
// (docs/plan/step-5.md). Throws a friend into the throne room's heavy crate
// <runs> times, one throw at a time (each in a private world of its own, on a
// fresh server process started here), and says where each of the two pages
// drew the thrown friend come to rest, and how long after the Hit tap each
// page first drew them move. Not part of npm run e2e: a measuring runner.
//
//   NODE_PATH=/opt/node-tools/node_modules node scripts/throw-runs.ts 60 after
//   D_IN=300 D_OUT=60 D_JIT=40 ... : that delay on both pages' sockets
//     (page to server, server to page, jitter; order kept), as the live
//     address adds (docs/plan/step-4-replay-tiers.ts.txt).
//   MODE=touch: instead, runs npm run e2e's whole grab-and-throw part
//     (touchAndThrows, scripts/lib/e2e-touch.ts) <runs> times, one at a time,
//     and counts its failed facts (the checks builder's re-measure, Step 5).
//   THIN=3: only every third report of B's page reaches the server (a loaded
//     phone's reports bunch up; the server then misses a meeting).
//   E2E_TOUCH_GRAB_LOG=1: also log what the server did with each Grab press.
//
// Needs `npm run build` first (DIST=<dir>: a copy of dist/ to run instead, e.g. the build before a change). Writes e2e-out/throw-runs-<label>.log.
import { spawn } from 'node:child_process';
import type { ChildProcess } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import net from 'node:net';
import path from 'node:path';
import { root } from './lib/registries.ts';
import { me, phone, settle, standAt, tap, touchAndThrows, track, whenCarried } from './lib/e2e-touch.ts';
import type { Key, Phone } from './lib/e2e-touch.ts';

/* eslint-disable @typescript-eslint/no-explicit-any */
const { chromium, devices } = createRequire(import.meta.url)('playwright') as any;
const runs = Number(process.argv[2] ?? 10);
const label = process.argv[3] ?? 'run';
const IN = Number(process.env.D_IN ?? 0);
const OUT = Number(process.env.D_OUT ?? 0);
const JIT = Number(process.env.D_JIT ?? 0);
const THIN = Number(process.env.THIN ?? 0);
const out = path.join(root, 'e2e-out');
fs.mkdirSync(out, { recursive: true });
const logFile = path.join(out, `throw-runs-${label}.log`);
fs.writeFileSync(logFile, `throw-runs ${label}: ${runs} throws, delay in ${IN} out ${OUT} jitter ${JIT}, thin ${THIN}, gap ${process.env.GAP ?? 29}\n`);
const say = (s: string): void => {
  console.log(s);
  fs.appendFileSync(logFile, s + '\n');
};
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const s = net.createServer();
    s.once('error', reject);
    s.listen(0, '127.0.0.1', () => {
      const port = (s.address() as net.AddressInfo).port;
      s.close(() => resolve(port));
    });
  });
}
async function startServer(): Promise<{ child: ChildProcess; base: string }> {
  const port = await freePort();
  const env: NodeJS.ProcessEnv = { ...process.env, PORT: String(port) };
  delete env.RAILWAY_GIT_COMMIT_SHA;
  const child = spawn(process.execPath, [path.join(process.env.DIST ? path.resolve(process.env.DIST) : path.join(root, 'dist'), 'server.cjs')], { env, stdio: ['ignore', 'pipe', 'inherit'] });
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('the server did not start within 10 s')), 10000);
    child.stdout!.on('data', (d: Buffer) => {
      if (process.env.E2E_TOUCH_GRAB_LOG) for (const l of d.toString().split('\n')) if (l.startsWith('GRAB ')) say('  server ' + l);
      if (d.toString().includes('listening')) {
        clearTimeout(timer);
        resolve();
      }
    });
  });
  return { child, base: `http://127.0.0.1:${port}` };
}

const browser = await chromium.launch();
let contexts = 0;
const kitBrowser = {
  newContext: async (o: any) => {
    const ctx = await browser.newContext(o);
    // THIN=<k>: the second page of each pair (B, the one thrown) has only every k-th report reach the server, as a loaded phone's bunch up.
    const thin = THIN > 1 && contexts++ % 2 === 1;
    if (IN || OUT || JIT || thin) {
      await ctx.routeWebSocket(/\/ws$/, (ws: any) => {
        const up = ws.connectToServer();
        let dueIn = 0;
        let dueOut = 0;
        let reports = 0;
        ws.onMessage((m: string) => {
          if (thin && m.startsWith('{"t":"me"') && reports++ % THIN !== 0) return;
          const now = Date.now();
          dueIn = Math.max(dueIn, now + IN + Math.random() * JIT);
          setTimeout(() => { try { up.send(m); } catch { /* closed */ } }, dueIn - now);
        });
        up.onMessage((m: string) => {
          const now = Date.now();
          dueOut = Math.max(dueOut, now + OUT + Math.random() * JIT);
          setTimeout(() => { try { ws.send(m); } catch { /* closed */ } }, dueOut - now);
        });
      });
    }
    return ctx;
  },
};

/** The first recorded time the drawn x is more than 4 px from the first point, or null. */
const moved = (pts: { t: number; x: number }[]): number | null => {
  const x0 = pts[0]?.x;
  const p = pts.find((q) => Math.abs(q.x - x0!) > 4);
  return p ? p.t : null;
};
const n = (v: number | null | undefined): string => (v === null || v === undefined ? '?' : v.toFixed(0));

const { child, base } = await startServer();
if (process.env.MODE === 'touch') {
  const failedBy = new Map<string, number>();
  let bad = 0;
  try {
    for (let r = 1; r <= runs; r++) {
      const errors: string[] = [];
      const lines: string[] = [];
      const fact = (id: string, ok: boolean, text: string): void => {
        if (!ok) {
          lines.push(`FAIL (${id}) ${text}`);
          failedBy.set(id, (failedBy.get(id) ?? 0) + 1);
        }
      };
      const t0 = Date.now();
      try {
        await touchAndThrows({ browser: kitBrowser, devices, base, out, fact, errors });
      } catch (e) {
        lines.push(`THREW ${(e as Error).message.split('\n')[0]}`);
      }
      if (lines.length) bad++;
      say(`${r}: ${lines.length ? 'FAIL' : 'ok'} (${((Date.now() - t0) / 1000).toFixed(0)} s)${lines.map((l) => '\n   ' + l).join('')}`);
    }
  } finally {
    await browser.close();
    child.kill();
  }
  say(`${label}: ${runs - bad} of ${runs} runs passed; failed facts: ${[...failedBy].map(([k, v]) => `${k} ${v}`).join(', ') || 'none'}`);
  process.exit(0);
}
const tally = { done: 0, agree: 0, grabFailed: 0, disagree: 0, other: 0 };
const pressA: number[] = [];
const pressB: number[] = [];
try {
  for (let r = 1; r <= runs; r++) {
    const errors: string[] = [];
    const kit = { browser: kitBrowser, devices, base, out, fact: () => {}, errors };
    const url = `${base}/?room=throw-runs-${Math.random().toString(36).slice(2, 10)}`;
    let A: Phone | null = null;
    let B: Phone | null = null;
    try {
      A = await phone(kit, url, 'A');
      B = await phone(kit, url, 'B');
      await B.page.waitForFunction((p: string) => (window as any).irreverents.drawn.entities.some((d: any) => d.player === p), A.id, { timeout: 5000 });
      const keyA: Key = { player: A.id };
      const keyB: Key = { player: B.id };
      const drawnOf = (id: string): Promise<any> => A!.page.evaluate((i: string) => (window as any).irreverents.drawn.entities.find((e: any) => e.id === i), id);
      // The light crate lies between the heavy one and the open floor east of it: A first throws it away east.
      const light = await A.page.evaluate(() => (window as any).irreverents.drawn.entities.find((e: any) => e.kind === 'crate' && e.y > 200));
      if (light) {
        await standAt(B, 260, 1);
        await standAt(A, light.x - 12, 1);
        await tap(A, 'grab');
        if ((await whenCarried(A, { id: light.id }, keyA, true, 1500)) !== null) {
          await sleep(200);
          await tap(A, 'attack');
          await sleep(1500);
        }
      }
      const heavy = await A.page.evaluate(() => (window as any).irreverents.drawn.entities.find((e: any) => e.kind === 'crate-heavy'));
      const lightNow = light ? await drawnOf(light.id) : null;
      // B stands 29 px east of the heavy crate's right side (crate-heavy is 24 wide), A 6 px behind B; A throws west.
      // GAP=<px> sets it; GAP=sweep walks 20 to 76 px over the runs. The stick's last touch west drifts B about 10 px.
      const gap0 = process.env.GAP === 'sweep' ? 20 + ((r * 8) % 64) : Number(process.env.GAP ?? 29);
      const bx = heavy.x + 24 + gap0 + 10;
      await standAt(B, bx, -1);
      await standAt(A, ((await me(B)).x as number) + 6, -1);
      await settle(B);
      const before = `A at ${n((await me(A)).x)}, B at ${n((await me(B)).x)}`;
      const grabAt = Date.now();
      await tap(A, 'grab');
      const held = await whenCarried(B, keyB, keyA, true, 1500);
      const heldOnA = await whenCarried(A, keyB, keyA, true, 300);
      if (held === null) {
        tally.grabFailed++;
        const a = await me(A);
        const b = await me(B);
        const bOnA = await A.page.evaluate((p: string) => (window as any).irreverents.drawn.entities.find((d: any) => d.player === p), B.id);
        say(`${r}: GRAB NEVER TOOK (tapped ${Date.now() - grabAt} ms ago): A at ${n(a.x)} facing ${a.facing}, B at ${n(b.x)} (on A's page ${n(bOnA?.x)}), heavy crate at ${n(heavy.x)}; held on A's page: ${heldOnA !== null}`);
        continue;
      }
      await sleep(300);
      const b0 = await me(B);
      const fB = track(B, keyB, 2500);
      const fA = track(A, keyB, 2500);
      await tap(A, 'attack', 100);
      const [onB, onA] = await Promise.all([fB, fA]);
      await sleep(800);
      const endB = await me(B);
      const endBonA = await A.page.evaluate((p: string) => (window as any).irreverents.drawn.entities.find((d: any) => d.player === p), B.id);
      const nb = await B.page.evaluate(() => { const s = (window as any).irreverents.net; return { met: s.met, echoes: s.echoes, first: s.metFirst }; });
      const crateNow = await A.page.evaluate((id: string) => (window as any).irreverents.drawn.entities.find((e: any) => e.id === id), heavy.id);
      const maxB = Math.min(...onB.map((p) => p.x));
      const maxA = Math.min(...onA.map((p) => p.x));
      const gap = Math.abs(endB.x - endBonA.x);
      const bounced = (mx: number, end: number): string => (mx + 10 < heavy.x + 4 ? 'through' : end > mx + 6 ? 'bounced' : 'stopped');
      // The same thing hit on both screens: the same outcome (through, bounced, stopped) and the furthest point within 8 px.
      const ok = bounced(maxA, endBonA.x) === bounced(maxB, endB.x) && Math.abs(maxA - maxB) <= 8;
      tally.done++;
      if (ok) tally.agree++;
      else tally.disagree++;
      const mA = moved(onA);
      const mB = moved(onB);
      if (mA !== null) pressA.push(mA);
      if (mB !== null) pressB.push(mB);
      say(`${r}: ${ok ? 'AGREE' : 'DISAGREE'} (at rest ${n(gap)} px apart): before the grab ${before}; B thrown from x ${n(b0.x)} west at the heavy crate (x ${n(heavy.x)}-${n(heavy.x + 24)}; the light crate at ${n(lightNow?.x)}); B's page: furthest west ${n(maxB)} (${bounced(maxB, endB.x)}), rests at ${n(endB.x)}; A's page: furthest west ${n(maxA)} (${bounced(maxA, endBonA.x)}), rests at ${n(endBonA.x)}; crate now at ${n(crateNow?.x)}; first drawn moving after the tap: A's page ${n(mA)} ms, B's page ${n(mB)} ms; B's page met ${n(nb.met)} drawn bodies itself, took ${n(nb.first)} the server met first, and set aside ${n(nb.echoes)} server pushes${errors.length ? `; page errors: ${errors.join(' | ')}` : ''}`);
    } catch (e) {
      tally.other++;
      say(`${r}: THREW ${(e as Error).message.split('\n')[0]}`);
    } finally {
      await A?.ctx.close();
      await B?.ctx.close();
    }
  }
} finally {
  await browser.close();
  child.kill();
}
const med = (a: number[]): string => (a.length ? String([...a].sort((p, q) => p - q)[Math.floor(a.length / 2)]) : '?');
say(`${label}: ${tally.done} throws: ${tally.agree} drawn the same on both pages (same outcome, furthest point within 8 px), ${tally.disagree} not; grab never took ${tally.grabFailed}; threw ${tally.other}. Tap to first drawn moving, median: A's page ${med(pressA)} ms, B's page ${med(pressB)} ms`);
process.exit(0);
