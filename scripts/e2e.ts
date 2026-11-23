// npm run e2e: the real page in headless Chromium, two players, against the
//   built server started here on a free port. One fact per line; exits
//   non-zero on any failure. Screenshots land in e2e-out/ (git-ignored).
// npm run check:live (this file with --live): the same two-player walk, facts
//   (a)-(c) and (e), against the live address, after checking it runs main.
//
// Every fact is read from `window.irreverents.drawn`, which the page's frame
// loop fills with what it just drew (docs/mechanisms/network.md): what the
// player sees, never server state.
//
// Playwright is preinstalled globally (the npm scripts set NODE_PATH); it is
// not a dependency, and `playwright install` must never be run here.
import { spawn, spawnSync } from 'node:child_process';
import type { ChildProcess } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import net from 'node:net';
import path from 'node:path';
import { awayFacts } from './e2e/away.ts';
import { errorFacts } from './e2e/errors.ts';
import { lookFacts } from './e2e/look.ts';
import { PAINT, paintedShare, paintOk, phoneFacts, problemsOf, read as readPhone } from './e2e/phone.ts';
import { root } from './lib/registries.ts';

/* eslint-disable @typescript-eslint/no-explicit-any */
type Page = any;
const { chromium, devices } = createRequire(import.meta.url)('playwright') as any;

const LIVE = process.argv.includes('--live');
const LIVE_URL = 'https://irreverents-production.up.railway.app';
/** How long fact (h) keeps the server down. 75 s is a deploy's gap; E2E_DOWN_MS shortens it while working on other facts. */
const DOWN_MS = Number(process.env.E2E_DOWN_MS) || 75000;
const out = path.join(root, 'e2e-out');
fs.mkdirSync(out, { recursive: true });

let failed = 0;
const fact = (id: string, ok: boolean, text: string): void => {
  if (!ok) failed++;
  console.log(`${ok ? 'ok  ' : 'FAIL'}  (${id}) ${text}`);
};
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
const rand = (): string => Math.random().toString(36).slice(2, 10);

// ---- the server under test (local mode) ----
let server: ChildProcess | null = null;
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
function startServer(port: number, commit?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const env: NodeJS.ProcessEnv = { ...process.env, PORT: String(port) };
    delete env.RAILWAY_GIT_COMMIT_SHA;
    if (commit) env.RAILWAY_GIT_COMMIT_SHA = commit;
    const child = spawn(process.execPath, [path.join(root, 'dist/server.cjs')], { env, stdio: ['ignore', 'pipe', 'inherit'] });
    server = child;
    const timer = setTimeout(() => reject(new Error('the server did not start within 10 s')), 10000);
    child.stdout!.on('data', (d: Buffer) => {
      if (d.toString().includes('listening')) {
        clearTimeout(timer);
        resolve();
      }
    });
    child.once('exit', (code) => {
      if (server === child) reject(new Error(`the server exited with code ${code}`));
    });
  });
}
/** Stops the server we started, by its pid, and waits until it is gone. */
function stopServer(): Promise<void> {
  const child = server;
  server = null;
  if (!child || child.exitCode !== null) return Promise.resolve();
  return new Promise((resolve) => {
    child.once('exit', () => resolve());
    process.kill(child.pid!);
  });
}

// ---- reading the page ----
const drawn = (page: Page): Promise<any> => page.evaluate(() => (window as any).irreverents.drawn);
const info = (page: Page): Promise<any> => page.evaluate(() => ({ player: (window as any).irreverents.player, net: { ...(window as any).irreverents.net }, builtFrom: (window as any).irreverents.builtFrom }));
/** Waits (checking every frame, in the page) until the page draws `player` within `tol` of x (and y, if given). Resolves to the page's Date.now() at that frame, or null. */
async function whenDrawnAt(page: Page, player: string, x: number | null, y: number | null, tol: number, ms: number): Promise<number | null> {
  try {
    const h = await page.waitForFunction(
      ([p, tx, ty, t]: [string, number | null, number | null, number]) => {
        const e = (window as any).irreverents.drawn.entities.find((d: any) => d.player === p);
        if (!e) return false;
        if (tx !== null && Math.abs(e.x - tx) > t) return false;
        if (ty !== null && Math.abs(e.y - ty) > t) return false;
        return Date.now();
      },
      [player, x, y, tol],
      { polling: 'raf', timeout: ms },
    );
    return (await h.jsonValue()) as number;
  } catch {
    return null;
  }
}
/** Waits until the page's own character has stopped; resolves to where, and the page's Date.now() when it first stood there. */
const whenStopped = (page: Page): Promise<{ x: number; y: number; at: number }> =>
  page.evaluate(
    () =>
      new Promise((resolve) => {
        let last = NaN;
        let lastY = NaN;
        let since = 0;
        let still = 0;
        const tick = (): void => {
          const me = (window as any).irreverents.drawn.me;
          if (me && me.x === last && me.y === lastY) {
            if (++still >= 6) return resolve({ x: me.x, y: me.y, at: since });
          } else {
            still = 0;
            since = Date.now();
            last = me?.x;
            lastY = me?.y;
          }
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }),
  );
/** The players' characters among everything a page drew (the room also holds crates and such). */
const players = (d: any): any[] => d.entities.filter((e: any) => e.player !== null);
/** Where the view and every touch control sit on a page, and whether any control covers the view. */
const controlsOf = (page: Page): Promise<any> =>
  page.evaluate(() => {
    const r = (el: Element): any => {
      const b = el.getBoundingClientRect();
      return { left: b.left, top: b.top, right: b.right, bottom: b.bottom };
    };
    const view = r(document.getElementById('game')!);
    const controls = [...document.querySelectorAll('[data-stick], [data-action]')].map((el) => ({ ...r(el), action: (el as HTMLElement).dataset.action ?? 'stick' }));
    const covers = (c: any): boolean => c.left < view.right && c.right > view.left && c.top < view.bottom && c.bottom > view.top;
    const offScreen = (c: any): boolean => c.left < 0 || c.top < 0 || c.right > innerWidth || c.bottom > innerHeight;
    return {
      view,
      controls,
      covering: controls.filter(covers).map((c) => c.action),
      offScreen: controls.filter(offScreen).map((c) => c.action),
      small: controls.filter((c) => c.right - c.left < 44 || c.bottom - c.top < 44).map((c) => c.action),
      actions: Object.keys((window as any).irreverents.content.actions),
      vw: innerWidth,
      vh: innerHeight,
    };
  });
const online = (page: Page, ms = 10000): Promise<unknown> =>
  page.waitForFunction(() => (window as any).irreverents?.drawn.status === 'online' && (window as any).irreverents.drawn.me, null, { timeout: ms });

async function main(): Promise<void> {
  let base = LIVE_URL;
  let port = 0;
  if (LIVE) {
    // The live address must be running what is on main, or this checks the wrong build.
    const dep = spawnSync(process.execPath, [path.join(root, 'scripts/check-deployed.ts')], { cwd: root, encoding: 'utf8' });
    const last = `${dep.stdout}${dep.stderr}`.trim().split('\n').pop() ?? '';
    fact('live', dep.status === 0, `the live address runs main: ${last}`);
    if (dep.status !== 0) return;
  } else {
    const { build } = await import('./build.ts');
    if (!(await build())) throw new Error('the build failed');
    port = await freePort();
    await startServer(port);
    base = `http://127.0.0.1:${port}`;
  }
  // INTENT: scripted players never join the world people play in. Every run
  // makes a private world of its own, named for the run, which the server
  // forgets when its last player leaves (docs/plan/step-1.md, "A live check
  // never lands in the players' world").
  const room = `${LIVE ? 'check' : 'e2e'}-${rand()}`;
  const url = `${base}/?room=${room}`;
  console.log(`      ${LIVE ? 'live' : 'local'}: ${url}`);

  const browser = await chromium.launch();
  try {
    // A: a desktop page, driven by keys. Its socket is routed through this
    // script, so frames can be delayed (fact d) and the socket cut (fact e).
    const ctxA = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const A = await ctxA.newPage();
    let delayMs = 0;
    const routes: any[] = [];
    await A.routeWebSocket(/\/ws$/, (ws: any) => {
      const upstream = ws.connectToServer();
      const later = (fn: () => void): void => {
        if (delayMs > 0) setTimeout(fn, delayMs);
        else fn();
      };
      ws.onMessage((m: string) => later(() => { try { upstream.send(m); } catch { /* closed */ } }));
      upstream.onMessage((m: string) => later(() => { try { ws.send(m); } catch { /* closed */ } }));
      routes.push({ ws, upstream });
    });
    let loadsA = 0;
    A.on('load', () => loadsA++);
    const errors: string[] = [];
    A.on('pageerror', (e: Error) => errors.push(`A: ${e.message}`));

    // B: Playwright's iPhone 14 held sideways, driven by touch, on a real socket.
    const ctxB = await browser.newContext({ ...devices['iPhone 14 landscape'] });
    const B = await ctxB.newPage();
    B.on('pageerror', (e: Error) => errors.push(`B: ${e.message}`));
    const cdpB = await ctxB.newCDPSession(B);

    await Promise.all([A.goto(url), B.goto(url)]);
    await Promise.all([online(A), online(B)]);
    const idA = (await info(A)).player as string;
    const idB = (await info(B)).player as string;

    // (a) both in one world, each draws the other.
    const aSeesB = await whenDrawnAt(A, idB, null, null, 0, 5000);
    const bSeesA = await whenDrawnAt(B, idA, null, null, 0, 5000);
    const dA = await drawn(A);
    const dB = await drawn(B);
    const colours = new Set(players(dA).map((e: any) => e.color));
    const kinds = players(dA).map((e: any) => e.kind);
    fact('a', !!aSeesB && !!bSeesA && players(dA).length === 2 && players(dB).length === 2 && colours.size === 2,
      `both pages are in the same world and each draws the other: the desktop page draws ${players(dA).length} players, the phone page ${players(dB).length}, in ${colours.size} player colours (${[...colours].join(', ')}), as ${kinds.join(' and ')}; ${dA.entities.length - players(dA).length} other bodies in the room`);

    // (b) A moves; B shows A at the new place within 500 ms.
    await A.keyboard.down('ArrowRight');
    await sleep(600);
    await A.keyboard.up('ArrowRight');
    const stopA = await whenStopped(A);
    const seen = await whenDrawnAt(B, idA, stopA.x, stopA.y, 1, 3000);
    const lag = seen === null ? null : Math.max(0, seen - stopA.at);
    fact('b', lag !== null && lag <= 500 && stopA.x > dA.me.x + 20,
      `the desktop player ran from x ${dA.me.x.toFixed(0)} to ${stopA.x.toFixed(1)}; the phone page drew them there ${lag === null ? 'never (3 s)' : `${lag} ms after they stopped`} (limit 500 ms)`);

    // (c) two touches at once on the phone: run and jump in the same moment.
    const boxes = await B.evaluate(() => {
      const r = (el: Element | null): any => {
        const b = el!.getBoundingClientRect();
        return { left: b.left, top: b.top, right: b.right, bottom: b.bottom };
      };
      return {
        pad: r(document.querySelector('[data-stick]')),
        jump: r(document.querySelector('[data-action="jump"]')),
        actions: Object.keys((window as any).irreverents.content.actions),
        controls: [...document.querySelectorAll('[data-action]')].map((e) => (e as HTMLElement).dataset.action),
        vw: innerWidth,
        vh: innerHeight,
      };
    });
    const b0 = (await drawn(B)).me;
    const padPoint = { x: Math.round(boxes.pad.left + (boxes.pad.right - boxes.pad.left) * 0.75), y: Math.round((boxes.pad.top + boxes.pad.bottom) / 2) };
    const jumpPoint = { x: Math.round((boxes.jump.left + boxes.jump.right) / 2), y: Math.round((boxes.jump.top + boxes.jump.bottom) / 2) };
    await cdpB.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...padPoint, id: 1 }, { ...jumpPoint, id: 2 }] });
    let both: any = null;
    try {
      both = await (
        await B.waitForFunction(
          ([x0, y0]: number[]) => {
            const me = (window as any).irreverents.drawn.me;
            return me.x > x0! + 3 && me.y < y0! - 3 ? { x: me.x, y: me.y } : false;
          },
          [b0.x, b0.y],
          { polling: 'raf', timeout: 1500 },
        )
      ).jsonValue();
    } catch {
      both = null;
    }
    const mid = await drawn(B);
    await cdpB.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    fact('c', both !== null,
      `two fingers down at once on the phone page (pad and jump): its character ${both ? `was running and in the air in the same frame (from ${b0.x.toFixed(0)},${b0.y.toFixed(0)} to ${both.x.toFixed(1)},${both.y.toFixed(1)})` : `did not run and jump together (at ${mid.me.x.toFixed(1)},${mid.me.y.toFixed(1)}, started ${b0.x},${b0.y})`}`);
    // c2 (look round 2, a design change decided in docs/decisions-log.md 2026-11-23, "Held sideways,
    // the game fills the phone"): it used to require no control over the play field; sideways the
    // controls now sit over the view, see-through, so it is the see-through test the full-view
    // phones pass (scripts/e2e/phone.ts): every action and the stick on screen, clear of the safe
    // area, 44 px or more, reachable, two fingers ran and jumped (fact c), and the paint limits.
    const lay = await readPhone(B);
    const seeProblems = problemsOf(lay);
    const overView = lay.controls.some((c: any) => c.left < lay.view.right && c.right > lay.view.left && c.top < lay.view.bottom && c.bottom > lay.view.top);
    const painted = await paintedShare(B, lay.view);
    fact('c2', seeProblems.length === 0 && both !== null && paintOk(painted, overView),
      `the phone page (${lay.vw}x${lay.vh}) shows a touch control for every action (${lay.actions.join(', ')}) and the stick, on screen, clear of the safe area, 44 px or more and reachable: ${seeProblems.join('; ') || 'yes'}; two fingers ran and jumped: ${both !== null}; controls ${overView ? 'over' : 'beside'} the view paint ${(painted * 100).toFixed(2)}% of it (limit ${PAINT.limit * 100}%, at least ${PAINT.floor * 100}% when over it); game pixels are ${mid.scale}x device pixels`);

    // How much is sent: measured on the desktop page over two seconds of play.
    await A.keyboard.down('ArrowLeft');
    const n0 = (await info(A)).net;
    await sleep(2000);
    const n1 = (await info(A)).net;
    await A.keyboard.up('ArrowLeft');
    const per = (k: string): number => Math.round((n1[k] - n0[k]) / 2);
    fact('rate', per('msgsOut') <= 45 && per('msgsIn') <= 40 && per('msgsOut') >= 15 && per('msgsIn') >= 10,
      `with two players, one page sends ${per('msgsOut')} messages/s (${per('bytesOut')} bytes/s) and receives ${per('msgsIn')} messages/s (${per('bytesIn')} bytes/s)`);

    await A.screenshot({ path: path.join(out, LIVE ? 'live-desktop.png' : 'desktop.png') });
    await B.screenshot({ path: path.join(out, LIVE ? 'live-phone.png' : 'phone.png') });

    if (!LIVE) {
      // (d) 150 ms of delay each way on A's connection; A's own character still answers at once.
      const rttBefore = (await info(A)).net.rttMs;
      delayMs = 150;
      await sleep(2600);
      const rttDelayed = (await info(A)).net.rttMs;
      fact('d-delay', rttDelayed >= 300, `delay injected on the desktop page's connection: its measured round trip went from ${Math.round(rttBefore)} ms to ${Math.round(rttDelayed)} ms (150 ms each way)`);
      await whenStopped(A);
      const measuring = A.evaluate(
        () =>
          new Promise((resolve) => {
            const start = (window as any).irreverents.drawn.me;
            let pressed: number | null = null;
            let moved: number | null = null;
            addEventListener('keydown', (e) => { if (e.code === 'ArrowRight' && pressed === null) pressed = performance.now(); }, true);
            const tick = (): void => {
              const me = (window as any).irreverents.drawn.me;
              if (pressed !== null && moved === null && me.x !== start.x) moved = performance.now() - pressed;
              if (pressed !== null && me.px !== start.px) return resolve({ moved, pixel: performance.now() - pressed });
              if (pressed !== null && performance.now() - pressed > 2000) return resolve({ moved, pixel: null });
              requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }),
      );
      await sleep(100);
      await A.keyboard.down('ArrowRight');
      const m = (await measuring) as { moved: number | null; pixel: number | null };
      await sleep(200);
      await A.keyboard.up('ArrowRight');
      fact('d', m.moved !== null && m.moved <= 50,
        `with that delay, the desktop player's own character started moving ${m.moved === null ? 'never (2 s)' : `${m.moved.toFixed(1)} ms`} after the key press (limit 50 ms); it had crossed to the next whole pixel after ${m.pixel === null ? '?' : m.pixel.toFixed(1)} ms`);
      delayMs = 0;
      await sleep(400);
    }

    // (e) A's socket is cut; A is back and visible to B within 10 s, with no reload.
    await A.evaluate(() => ((window as any).__sameDocument = true));
    const connects = (await info(A)).net.connects;
    const cutAt = Date.now();
    for (const r of routes.splice(0)) {
      try { r.ws.close(); } catch { /* already closed */ }
      try { r.upstream.close(); } catch { /* already closed */ }
    }
    let back = false;
    try {
      await A.waitForFunction((n: number) => (window as any).irreverents.net.connects > n && (window as any).irreverents.drawn.status === 'online', connects, { timeout: 10000 });
      back = true;
    } catch {
      back = false;
    }
    // Proof that the new socket carries A: A moves, and B must see it.
    await whenStopped(A);
    await A.keyboard.down('ArrowRight');
    await sleep(300);
    await A.keyboard.up('ArrowRight');
    const stop2 = await whenStopped(A);
    const seen2 = back ? await whenDrawnAt(B, idA, stop2.x, stop2.y, 1, 5000) : null;
    const took = seen2 === null ? null : Date.now() - cutAt;
    const same = await A.evaluate(() => (window as any).__sameDocument === true);
    const count = players(await drawn(B)).length;
    fact('e', back && took !== null && took <= 10000 && same && count === 2,
      `the desktop page's socket was cut: ${back ? 'it reconnected by itself' : 'it did NOT reconnect'}${took === null ? '' : `, and ${took} ms after the cut the phone page had drawn it at its new place`}; no reload: ${same}; the phone page draws ${count} players (2 = no duplicate)`);

    if (!LIVE) {
      // Step 2's facts (t-*, s-*): hit, grab, carry, throw and switch by touch, and what the other phone's screen shows (docs/mechanisms/combat-and-impact.md, "Across two phones").
      await (await import('./lib/e2e-touch.ts')).touchAndThrows({ browser, devices, base, out, fact, errors });
      // Step 5's facts (hit-*): the hitter's own page draws its hit at once on a delayed connection; the other page as before (docs/mechanisms/network.md, "Predicted hits").
      await (await import('./e2e/hit-lands.ts')).hitLandsFacts({ browser, devices, base, out, fact, errors });
      // Step 2's ?tune facts (tune-*): the feel dials by touch, and play following them on two pages (docs/mechanisms/tuning-panel.md).
      await (await import('./e2e/tune.ts')).tuneFacts({ browser, devices, base, out, fact, errors });
      // Step 12's facts (outpost-*): into the outpost by touch, and the horn post drawn working, then broken (docs/mechanisms/outposts.md).
      await (await import('./e2e/outpost.ts')).outpostFacts({ browser, devices, base, out, fact, errors });
      // The switch gap (switch-refused): three pages hold the whole party and a Switch tap changes nothing (docs/mechanisms/party-and-switching.md).
      await (await import('./e2e/switch.ts')).switchFacts({ browser, devices, base, out, fact, errors });
      // Doorways by Use (door-*): the Use button says "Go in" in a doorway and a tap of it goes through (docs/mechanisms/rooms-and-doors.md).
      await (await import('./e2e/doors.ts')).doorFacts({ browser, devices, base, out, fact, errors, shots: path.join(out, 'doors') });
      // Step 19's facts (heist-*): the Use button's word at the shop, and the party plate (docs/mechanisms/heists.md).
      await (await import('./e2e/heist.ts')).heistFacts({ browser, devices, base, out, fact, errors, shots: path.join(out, 'heist') });
      // Step 14 slice A's facts (level-*): the quarry's entrance drawn, found by touch, its name and pie; the menu's rows (docs/mechanisms/levels.md).
      await (await import('./e2e/levels.ts')).levelFacts({ browser, devices, base, out, fact, errors, shots: path.join(out, 'levels') });
      // Step 14 slice B's facts (glint-*): the piece over the awning glints, a held Jump by touch finds it, the row shows it gold (docs/mechanisms/levels.md, "Pieces").
      await (await import('./e2e/glints.ts')).glintFacts({ browser, devices, base, out, fact, errors, shots: path.join(out, 'glints') });
      // Step 16's facts (quarry-*): into the quarry by touch, and across its road onto the ridge (docs/plan/step-16.md, signal 7).
      await (await import('./e2e/quarry.ts')).quarryFacts({ browser, devices, base, out, fact, errors });
      // Step 11's facts (cantina-*): into the cantina by touch, the party row, the swap and the brawl's counter on two phones (docs/mechanisms/cantina.md, signal 8).
      await (await import('./e2e/cantina.ts')).cantinaFacts({ browser, devices, base, out, fact, errors });
      // Step 17's facts (start-*): the start screen, New game, a friend joining by the shared link, and back, by touch (docs/mechanisms/saves.md).
      await (await import('./e2e/start-screen.ts')).startFacts({ browser, devices, base, out, fact, errors, shots: path.join(root, 'docs/plan/step-17-shots') });
      // Step 8's look facts (look-*): the three moods differ as drawn, and a hidden friend has no mark on another page (docs/mechanisms/rendering-actors.md, "Round 3").
      await lookFacts({ browser, devices, base, out, fact, errors });
      // (f) another world does not see them.
      const ctxC = await browser.newContext({ viewport: { width: 800, height: 450 } });
      const C = await ctxC.newPage();
      await C.goto(`${base}/?room=other-${rand()}`);
      await online(C);
      await sleep(700);
      const dC = await drawn(C);
      const dA2 = await drawn(A);
      fact('f', players(dC).length === 1 && players(dA2).length === 2, `a page opened with ?room=other-... draws ${players(dC).length} player (itself); the first world still draws ${players(dA2).length}`);
      await ctxC.close();

      // (g) a phone held upright can still play: move and jump, controls below the view.
      const ctxP = await browser.newContext({ ...devices['iPhone 14'] });
      const P = await ctxP.newPage();
      P.on('pageerror', (e: Error) => errors.push(`upright: ${e.message}`));
      const cdpP = await ctxP.newCDPSession(P);
      await P.goto(`${base}/?room=upright-${rand()}`);
      await online(P);
      const up = await controlsOf(P);
      const p0 = await drawn(P);
      const stick = up.controls.find((c: any) => c.action === 'stick');
      const jumpP = up.controls.find((c: any) => c.action === 'jump');
      await cdpP.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [
          { x: Math.round(stick.left + (stick.right - stick.left) * 0.75), y: Math.round((stick.top + stick.bottom) / 2), id: 1 },
          { x: Math.round((jumpP.left + jumpP.right) / 2), y: Math.round((jumpP.top + jumpP.bottom) / 2), id: 2 },
        ],
      });
      let moved: any = null;
      try {
        moved = await (
          await P.waitForFunction(
            ([x0, y0]: number[]) => {
              const me = (window as any).irreverents.drawn.me;
              return me.x > x0! + 3 && me.y < y0! - 3 ? { x: me.x, y: me.y } : false;
            },
            [p0.me.x, p0.me.y],
            { polling: 'raf', timeout: 1500 },
          )
        ).jsonValue();
      } catch {
        moved = null;
      }
      await cdpP.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await P.screenshot({ path: path.join(out, 'upright.png') });
      const below = up.controls.every((c: any) => c.top >= up.view.bottom);
      const hintText = p0.hint as string;
      // The one line can be dismissed.
      await P.tap('#hint button');
      await sleep(100);
      const hintAfter = (await drawn(P)).hint as string;
      fact('g', moved !== null && p0.upright && below && up.covering.length === 0 && up.offScreen.length === 0 && hintText !== '' && hintAfter === '',
        `a phone held upright (${up.vw}x${up.vh}) can play: with two fingers its character ${moved ? 'ran and jumped' : 'did NOT run and jump'}; the view is across the top at ${p0.scale}x with every control below it (covering: ${up.covering.join(', ') || 'none'}; off screen: ${up.offScreen.join(', ') || 'none'}); it showed "${hintText}", gone after a tap on its button: ${hintAfter === ''}`);
      await ctxP.close();

      // (h) the server goes away under connected pages for 75 s, as it does
      //     on every deploy now that a storage volume is attached, then returns.
      const c0 = (await info(A)).net.connects;
      const loads0 = loadsA;
      await stopServer();
      const downAt = Date.now();
      await sleep(2000);
      const offline = (await drawn(A)).statusText;
      // The player can still move while it is down.
      const before = (await drawn(A)).me.x;
      await A.keyboard.down('ArrowLeft');
      await sleep(300);
      await A.keyboard.up('ArrowLeft');
      const movedOffline = Math.abs((await drawn(A)).me.x - before) > 3;
      console.log(`      (h) the server is stopped; waiting ${Math.round(DOWN_MS / 1000)} s before starting it again...`);
      await sleep(Math.max(0, DOWN_MS - (Date.now() - downAt)));
      const stillTrying = (await drawn(A)).statusText;
      await startServer(port);
      const upAt = Date.now();
      let rejoined = false;
      try {
        await A.waitForFunction((n: number) => (window as any).irreverents.net.connects > n && (window as any).irreverents.drawn.status === 'online', c0, { timeout: 10000 });
        await whenDrawnAt(A, idB, null, null, 0, 10000);
        rejoined = players(await drawn(A)).length === 2;
      } catch {
        rejoined = false;
      }
      fact('h1', rejoined && loadsA === loads0 && offline !== '' && stillTrying !== '' && movedOffline,
        `the server was down for ${Math.round(DOWN_MS / 1000)} s under both pages: the desktop page said "${offline}" (and still "${stillTrying}" at the end), its player could still move: ${movedOffline}; ${rejoined ? `${Date.now() - upAt} ms after the server returned it was back in the world and drawing both players` : 'it did NOT come back within 10 s of the server returning'}; reloads: ${loadsA - loads0} (same commit, so none expected)`);

      // ...and restarted as a different commit: the page reloads itself exactly once.
      const loads1 = loadsA;
      await stopServer();
      await startServer(port, 'e2e-new-commit');
      let onNew = false;
      try {
        await A.waitForFunction(() => (window as any).irreverents?.builtFrom === 'e2e-new-commit' && (window as any).irreverents.drawn.status === 'online', null, { timeout: 10000 });
        onNew = true;
      } catch {
        onNew = false;
      }
      await sleep(3000);
      const after = await drawn(A);
      fact('h2', onNew && loadsA - loads1 === 1 && after.status === 'online',
        `the server was restarted as a different commit: the desktop page reloaded ${loadsA - loads1} time(s) (exactly 1 expected), ${onNew ? 'now runs the new build' : 'did NOT pick up the new build'} and is ${after.status}`);
    }

    await phoneFacts({ browser, devices, base, out, tag: LIVE ? 'check' : 'e2e', fact, errors });
    // Step 18's fact (fight-back): a guard hit until he rages hits the phone's character back, by touch, here and on live (docs/plan/step-18.md, signal 5).
    await (await import('./e2e/fight.ts')).fightFacts({ browser, devices, base, out, tag: LIVE ? 'check' : 'e2e', fact, errors });
    await awayFacts({ browser, base, out, tag: LIVE ? 'check' : 'e2e', fact, errors, wholeWait: !LIVE });

    fact('errors', errors.length === 0, errors.length ? `page errors: ${errors.join(' | ')}` : 'no page raised an error');
    // After the fact above: this one raises errors in a page of its own, on purpose.
    await errorFacts({ browser, base, tag: LIVE ? 'check' : 'e2e', fact });
    await ctxA.close();
    await ctxB.close();
  } finally {
    await browser.close();
    await stopServer();
  }
}

try {
  await main();
} catch (err) {
  failed++;
  console.log(`FAIL  the run itself broke: ${(err as Error).stack ?? String(err)}`);
  await stopServer();
}
console.log(failed ? `\n${LIVE ? 'check:live' : 'e2e'}: FAILED (${failed})` : `\n${LIVE ? 'check:live' : 'e2e'}: ok`);
process.exit(failed ? 1 : 0);
