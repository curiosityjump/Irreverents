// The armoured guard's own look (brief armoured-guard-look.md, 2026-11-24), inside `npm run e2e` (one call
// line in scripts/e2e.ts; local only, never check:live: it stages the street in a game of its own).
//
// Fact `armoured-look`: on a phone-sized page (iPhone 14, sideways), when the castle street's top alarm row
// walks in, the page draws the armoured guard in his own colours (the purple of P08 row 4's armour) and not
// the plain guard's (his blue tabard and helmet). Read from the game canvas over the box the page drew him
// at (`drawn.entities`, `drawn.camera`): what the player sees.
//
// How it gets the row without playing to it: this file runs the real game in this process (attachGame and
// the built client from dist/public, as scripts/checks/* do), and a throwaway system calls the sim's own
// completeCall, the one site that raises an alert, so the street's dispatch brings the row itself, from the
// sides, as in play. Level 2's row is skipped (the level set by hand between the two calls; level 1's row
// is empty), so the street holds the top row and its own people only. tools/art/cast/shots-armoured.ts
// uses the same staging for the brief's shots.
//
// Control, watched to fail (2026-11-24): content/sprites/armoured-guard.json put back to the guard's sheet
// (git show 178e243:content/sprites/armoured-guard.json), built: purple 0, blue well above it, red.
//
// DRAFT: the colours and the counts are first passes with room to spare.
import fs from 'node:fs';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import path from 'node:path';
import { loadContent } from '../lib/content-files.ts';
import { root } from '../lib/registries.ts';
import { attachGame } from '../../src/server/game.ts';
import { systems } from '../../src/sim/registry.ts';
import { alertOf, completeCall } from '../../src/sim/npc/alert.ts';
import type { StepContext, System, World } from '../../src/sim/types.ts';
import type { Kit } from '../lib/e2e-touch.ts';

/* eslint-disable @typescript-eslint/no-explicit-any */
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
const AREA = 'castle-street';
/** Where the hero stands (tile): east of the villain, west of the doorway, so the row walks in at both view edges. */
export const STAND = [25, 10] as const;
/** P08 row 4's armour, as cut (the master palette's purple ramp). */
const PURPLE = ['#4a2a7a', '#7444b8', '#a070e8', '#d0aaff'];
/** The plain guard's tabard and helmet (the blue ramp). */
const BLUE = ['#263a8c', '#3c62d0', '#5c92f5', '#a0c8ff'];

const MIME: Record<string, string> = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.ogg': 'audio/ogg', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.map': 'application/json' };

/** The real game in this process, serving the built client; `raiseTopRow` brings the street's top row in one world. */
export async function startStage(): Promise<{ base: string; raiseTopRow: (world: string) => Promise<boolean>; close: () => void }> {
  const { content, problems } = loadContent();
  if (problems.length) throw new Error(`content problems: ${problems.length}`);
  const pub = path.join(root, 'dist', 'public');
  const server = http.createServer((req, res) => {
    const u = new URL(req.url ?? '/', 'http://x');
    const rel = u.pathname === '/' ? 'index.html' : decodeURIComponent(u.pathname.slice(1));
    const file = path.join(pub, rel);
    if (!file.startsWith(pub + path.sep)) return void res.writeHead(404).end();
    fs.readFile(file, (err, data) => {
      if (err) return void res.writeHead(404).end();
      res.writeHead(200, { 'content-type': MIME[path.extname(file)] ?? 'application/octet-stream', 'cache-control': 'no-store' }).end(data);
    });
  });
  const game = attachGame(server, { content, commit: 'armoured-look', startedAt: new Date().toISOString() });
  await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

  const raiseTopRow = async (name: string): Promise<boolean> => {
    const gw = game.worlds.get(name);
    const me = gw?.world.entities.find((e) => e.player !== null && e.room === AREA);
    if (!gw || !me) return false;
    const world: World = gw.world;
    const at = { x: me.x, y: me.y };
    let armed = true;
    const sys: System = {
      id: 'throwaway-raise-street',
      order: 50, // before alert-respond (56) and alert-dispatch (58), so they read this tick's events
      run(ctx: StepContext) {
        if (!armed || ctx.world !== world) return; // systems are global: only this world
        armed = false;
        // The street's own guard is the caller, as when he rings the bell (the sim looks the caller up).
        completeCall(ctx, 'street-guard', AREA, at); // 0 -> 1: level 1's row is empty
        alertOf(ctx.world, AREA)!.c.alert!.level = 2;
        completeCall(ctx, 'street-guard', AREA, at); // 2 -> 3: the top row is queued
      },
    };
    const i = systems.findIndex((s) => s.order > sys.order);
    systems.splice(i < 0 ? systems.length : i, 0, sys);
    try {
      for (let t = 0; t < 40 && armed; t++) await sleep(50);
    } finally {
      systems.splice(systems.indexOf(sys), 1);
    }
    return !armed;
  };
  return { base, raiseTopRow, close: () => server.close() };
}

/** Opens a `?room=` world on `page`, stands the hero in the castle street and waits until it is there on the server. */
export async function enterStreet(page: any, base: string, name: string): Promise<void> {
  await page.goto(`${base}/?room=${name}`);
  await page.waitForFunction(() => (window as any).irreverents?.drawn?.status === 'online', null, { timeout: 30000 });
  // As tools/art/cast/shots.mjs places the hero: the page owns its character, and the server takes it as sent.
  await page.evaluate(([tx, ty]: number[]) => {
    const d = (window as any).irreverents;
    const me = d.world.entities.find((e: any) => e.player === d.player);
    const box = d.content.characters[me.kind].box;
    Object.assign(me, { room: 'castle-street', x: tx! * 16 + (16 - box.w) / 2, y: (ty! + 1) * 16 - box.h, vx: 0, vy: 0 });
  }, STAND as unknown as number[]);
  await page.waitForFunction(() => (window as any).irreverents.drawn.room === 'castle-street', null, { timeout: 5000 });
  await sleep(1500);
}

/** Waits until the page draws the whole top row inside its view; false after `ms`. */
export async function rowInView(page: any, ms: number): Promise<boolean> {
  try {
    await page.waitForFunction(
      () => {
        const irr = (window as any).irreverents;
        const d = irr.drawn;
        const inView = (e: any): boolean => e.x > d.camera.x + 8 && e.x < d.camera.x + irr.view.w - 24;
        const row = d.entities.filter((e: any) => String(e.id).includes(':help'));
        return row.length >= 3 && row.every(inView) && row.some((e: any) => e.kind === 'armoured-guard');
      },
      null,
      { polling: 200, timeout: ms },
    );
    return true;
  } catch {
    return false;
  }
}

/** Over the armoured guard's drawn box (a margin round it for the hammer and the overhang): pixels of each ramp, on the game canvas. */
const colours = (page: any): Promise<{ purple: number; blue: number; seen: boolean }> =>
  page.evaluate(
    ([purple, blue]: string[][]) => {
      const irr = (window as any).irreverents;
      const d = irr.drawn;
      const e = d.entities.find((x: any) => x.kind === 'armoured-guard');
      if (!e) return { purple: 0, blue: 0, seen: false };
      const box = irr.content.characters[e.kind].box;
      const c = document.getElementById('game') as HTMLCanvasElement;
      const x0 = Math.max(0, Math.round(e.px - d.camera.x) - 10);
      const y0 = Math.max(0, Math.round(e.py - d.camera.y) - 12);
      const w = Math.min(c.width - x0, box.w + 20);
      const h = Math.min(c.height - y0, box.h + 14);
      if (w <= 0 || h <= 0) return { purple: 0, blue: 0, seen: false };
      const px = c.getContext('2d')!.getImageData(x0, y0, w, h).data;
      const hex = (i: number): string => '#' + [px[i], px[i + 1], px[i + 2]].map((v) => v!.toString(16).padStart(2, '0')).join('');
      let p = 0;
      let b = 0;
      for (let i = 0; i < px.length; i += 4) {
        const k = hex(i);
        if (purple!.includes(k)) p++;
        else if (blue!.includes(k)) b++;
      }
      return { purple: p, blue: b, seen: true };
    },
    [PURPLE, BLUE],
  );

export async function armouredLookFacts(kit: Kit): Promise<void> {
  const { fact } = kit;
  const stage = await startStage();
  const ctx = await kit.browser.newContext({ ...kit.devices['iPhone 14 landscape'] });
  try {
    const page = await ctx.newPage();
    page.on('pageerror', (e: Error) => kit.errors.push(`armoured-look: ${e.message}`));
    const name = `e2e-armoured-${Math.random().toString(36).slice(2, 10)}`;
    await enterStreet(page, stage.base, name);
    const raised = await stage.raiseTopRow(name);
    const arrived = raised && (await rowInView(page, 10000));
    // The most of each over a few looks (a hit's white flash or the rage's red one can cover a frame).
    let best = { purple: 0, blue: 0, seen: false };
    for (let i = 0; i < 8; i++) {
      const c = await colours(page);
      if (c.seen && c.purple >= best.purple) best = c;
      await sleep(120);
    }
    await page.screenshot({ path: path.join(kit.out, 'armoured-look.png') });
    fact(
      'armoured-look',
      arrived && best.seen && best.purple >= 40 && best.purple > 2 * best.blue,
      `the street's top row walks in and the page draws the armoured guard in his own armour, not the guard's: ` +
        `raised ${raised}, row in view ${arrived}, over his box ${best.purple} px of his purple and ${best.blue} of the guard's blue (need >= 40, and over twice the blue)`,
    );
  } finally {
    await ctx.close();
    stage.close();
  }
}
