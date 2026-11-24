// node scripts/hud-shots.ts <out-dir>: the phone HUD's look pass shots (brief
// phone-hud-legibility; docs/plan/step-8.md, "Phone HUD"). Builds, starts the
// built server on a free port, and drives one phone page by touch through the
// states the brief names, each shot upright 390x664 and sideways 844x390 and
// 750x340, with every touch control's box beside it in controls.json.
// DRAFT: a tool for looking, not a check; nothing here asserts.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import net from 'node:net';
import path from 'node:path';
import { me, phone, pointOn, settle, standAt, tap } from './lib/e2e-touch.ts';
import type { Kit, Phone } from './lib/e2e-touch.ts';
import { pushUp, walkInto } from './e2e/outpost.ts';
import { root } from './lib/registries.ts';

/* eslint-disable @typescript-eslint/no-explicit-any */
const { chromium, devices } = createRequire(import.meta.url)('playwright') as any;
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
const out = path.resolve(process.argv[2] ?? path.join(root, 'e2e-out/hud'));
fs.mkdirSync(out, { recursive: true });
const SIZES = [
  { w: 390, h: 664 },
  { w: 844, h: 390 },
  { w: 750, h: 340 },
];
const record: Record<string, unknown> = {};

const controls = (page: any): Promise<any> =>
  page.evaluate(() => {
    const vis = (el: Element): boolean => {
      const s = getComputedStyle(el);
      const b = el.getBoundingClientRect();
      return s.display !== 'none' && s.visibility !== 'hidden' && b.width > 0 && b.height > 0 && !(el as HTMLElement).closest('[hidden]');
    };
    return [...document.querySelectorAll('[data-stick], [data-action], #stage-continue, #start button, #hint button, #sound, button')]
      .filter(vis)
      .map((el) => {
        const b = el.getBoundingClientRect();
        const h = el as HTMLElement;
        return { id: h.dataset.action ?? (h.dataset.stick ? 'stick' : h.id || h.dataset.start || h.textContent?.trim().slice(0, 12)), w: Math.round(b.width), h: Math.round(b.height), x: Math.round(b.left), y: Math.round(b.top), cls: h.className, state: h.dataset.state ?? '' };
      });
  });

async function three(ph: Phone, name: string, back = { w: 750, h: 340 }): Promise<void> {
  for (const s of SIZES) {
    await ph.page.setViewportSize({ width: s.w, height: s.h });
    await sleep(450);
    const file = `${name}-${s.w}x${s.h}.png`;
    await ph.page.screenshot({ path: path.join(out, file) });
    record[file] = await controls(ph.page);
  }
  await ph.page.setViewportSize({ width: back.w, height: back.h });
  await sleep(300);
  console.log('shot', name);
}

function freePort(): Promise<number> {
  return new Promise((resolve) => {
    const s = net.createServer();
    s.listen(0, '127.0.0.1', () => {
      const port = (s.address() as net.AddressInfo).port;
      s.close(() => resolve(port));
    });
  });
}

const { build } = await import('./build.ts');
if (!(await build())) throw new Error('the build failed');
const port = await freePort();
const child = spawn(process.execPath, [path.join(root, 'dist/server.cjs')], { env: { ...process.env, PORT: String(port) }, stdio: ['ignore', 'pipe', 'inherit'] });
await new Promise<void>((r) => child.stdout!.on('data', (d: Buffer) => d.toString().includes('listening') && r()));
const base = `http://127.0.0.1:${port}`;
const browser = await chromium.launch();
const errors: string[] = [];
const kit: Kit = { browser, devices, base, out, fact: () => undefined, errors };
const only = process.argv[3] ?? 'title,street,camp,stage';
try {
  if (only.includes('title')) {
    // The title: the address alone.
    const ctx = await browser.newContext({ ...devices['iPhone 14 landscape'] });
    const page = await ctx.newPage();
    await page.goto(`${base}/`);
    await page.waitForSelector('#start [data-start="new"]', { timeout: 8000 });
    await sleep(1200);
    await three({ name: 't', ctx, page, cdp: null, id: '' } as Phone, 'title');
    await ctx.close();
  }
  if (only.includes('street')) {
    // The castle street: walk in, punch the guard until hearts are lost and pips are up.
    const ph = await phone(kit, `${base}/?room=hud-street-${Math.random().toString(36).slice(2, 8)}`, 'street');
    await walkInto(ph, 1, 'castle-street');
    await sleep(500);
    await three(ph, 'street-plain');
    const t0 = Date.now();
    let shot = false;
    while (Date.now() - t0 < 60000) {
      const s = await ph.page.evaluate(() => {
        const irr = (window as any).irreverents;
        const g = irr.drawn.entities.find((e: any) => e.kind?.includes('guard'));
        const r = irr.drawn.hearts?.rows?.[irr.drawn.me.kind];
        return { gx: g?.x ?? null, mx: irr.drawn.me.x, left: r?.left ?? 0, max: r?.max ?? 0, pips: irr.drawn.alert?.level ?? 0 };
      });
      if (s.gx !== null) {
        const dir = s.gx > s.mx ? 1 : -1;
        if (Math.abs(s.gx - s.mx) > 18) {
          const p = await pointOn(ph, '[data-stick]', dir > 0 ? 0.9 : 0.1);
          if (p) {
            await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...p, id: 1 }] });
            await sleep(150);
            await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
          }
        }
      }
      await tap(ph, 'attack');
      if (s.left < s.max && s.pips > 0 && !shot) {
        await three(ph, 'street-fight');
        shot = true;
        break;
      }
    }
    if (!shot) await three(ph, 'street-fight-partial');
    await ph.ctx.close();
  }
  if (only.includes('camp')) {
    const ph = await phone(kit, `${base}/?room=hud-camp-${Math.random().toString(36).slice(2, 8)}`, 'camp');
    await walkInto(ph, 1, 'castle-street');
    await walkInto(ph, 1, 'courtyard');
    const c = await ph.page.evaluate(() => {
      const irr = (window as any).irreverents;
      const door = irr.content.rooms.courtyard.doors.find((d: any) => d.id === 'to-outpost');
      return { doorX: door.tx * irr.content.rooms.courtyard.tile, tile: irr.content.rooms.outpost.tile, w: irr.content.characters[irr.drawn.me.kind].box.w };
    });
    await standAt(ph, c.doorX + (c.tile - c.w) / 2, 1);
    await sleep(200);
    await three(ph, 'courtyard-go-in');
    for (let t = 0; t < 4; t++) {
      if (t > 0) await standAt(ph, c.doorX + (c.tile - c.w) / 2 + (t % 2 ? -3 : 3), 1);
      await sleep(150);
      await tap(ph, 'interact');
      const ok = await ph.page.waitForFunction(() => (window as any).irreverents.drawn.room === 'outpost', null, { polling: 'raf', timeout: 3000 }).then(() => true, () => false);
      if (ok) break;
      await pushUp(ph);
      if ((await ph.page.evaluate(() => (window as any).irreverents.drawn.room)) === 'outpost') break;
    }
    console.log('room', await ph.page.evaluate(() => (window as any).irreverents.drawn.room));
    await settle(ph);
    await three(ph, 'camp-doorway');
    // Onto the step beside the wagon, until Use says Get in.
    const stick = await pointOn(ph, '[data-stick]', 0.75);
    const word = (): Promise<string> => ph.page.evaluate(() => document.querySelector<HTMLElement>('#actions [data-action="interact"]')?.dataset.state ?? '');
    if (stick) {
      await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...stick, id: 1 }] });
      const t0 = Date.now();
      let jumps = 0;
      while (Date.now() - t0 < 5000 && (await word()) !== 'get-in') {
        if (jumps < 3 && Date.now() - t0 > 150 + jumps * 450) {
          const jump = await pointOn(ph, '[data-action="jump"]');
          if (jump) {
            await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ ...stick, id: 1 }, { ...jump, id: 2 }] });
            await sleep(200);
            await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ ...stick, id: 1 }] });
          }
          jumps++;
        }
        await sleep(30);
      }
      await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await settle(ph);
    }
    await three(ph, `camp-wagon-${(await word()) || 'none'}`);
    // East among the fighters; pick up the hammer if Use offers it on the way; stand until GAME OVER, shooting banners and hearts.
    const east = await pointOn(ph, '[data-stick]', 0.9);
    let took = false;
    let banners = 0;
    let lost = false;
    let over = false;
    // HUD_QUICK=1: stop after the wagon (the defeat walk below shoots hearts, the horn and GAME OVER).
    for (let i = 0; i < (process.env.HUD_QUICK ? 0 : 500) && !over; i++) {
      const s = await ph.page.evaluate(() => {
        const irr = (window as any).irreverents;
        const r = irr.drawn.hearts?.rows?.[irr.drawn.me?.kind];
        return { room: irr.drawn.room, x: irr.drawn.me?.x ?? 0, use: document.querySelector<HTMLElement>('#actions [data-action="interact"]')?.dataset.state ?? '', banner: !!irr.drawn.banner || (irr.drawn.alarms?.up ?? null) !== null, card: !!irr.drawn.gameOver, left: r?.left ?? 0, max: r?.max ?? 0, weapon: irr.drawn.hud?.weapon ?? null };
      });
      if (i % 20 === 0) console.log('camp', i, JSON.stringify(s));
      if (s.card) {
        await sleep(300);
        await three(ph, 'game-over');
        over = true;
        break;
      }
      if (s.room !== 'outpost') break;
      if (!took && (s.use === 'pick-up' || s.use === 'swap')) {
        await tap(ph, 'interact');
        await sleep(500);
        took = true;
        await three(ph, 'camp-hammer-held');
      }
      if (s.banner && banners < 3) {
        banners++;
        await three(ph, `camp-banner-${banners}`);
      }
      if (!lost && s.left < s.max) {
        lost = true;
        await three(ph, 'camp-hearts-lost');
      }
      if (s.room === 'outpost' && s.x < 22 * c.tile && east) {
        await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...east, id: 1 }] });
        await sleep(350);
        const jump = await pointOn(ph, '[data-action="jump"]');
        if (jump && i % 3 === 0) {
          await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ ...east, id: 1 }, { ...jump, id: 2 }] });
          await sleep(200);
        }
        await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      } else await sleep(400);
    }
    console.log('camp', { took, banners, lost, over, at: await me(ph) });
    await ph.ctx.close();
  }
  if (only.includes('defeat')) {
    const { defeatFacts } = await import('./e2e/defeat.ts');
    await defeatFacts({ ...kit, fact: (id: string, ok: boolean, t: string) => console.log(ok ? 'ok' : 'FAIL', id, t.slice(0, 160)), shots: out });
  }
  if (only.includes('stage')) {
    const ph = await phone(kit, `${base}/?room=hud-stage-${Math.random().toString(36).slice(2, 8)}`, 'stage');
    await sleep(600);
    const CLEAR = { type: 'stage-cleared', tick: 1, stage: 'iron-quarry', ticks: 75 * 60 + 12, defeated: 7, alarms: 2, tries: 1, unseen: false, hoard: true, stars: 2, best: true, player: ph.id };
    await ph.page.evaluate((ev: any) => (window as any).irreverents.stage.show(ev), CLEAR);
    await sleep(700);
    await three(ph, 'stage-mid-count');
    await sleep(6000);
    await three(ph, 'stage-done');
    await ph.ctx.close();
  }
} finally {
  fs.writeFileSync(path.join(out, 'controls.json'), JSON.stringify(record, null, 1));
  await browser.close();
  process.kill(child.pid!);
  if (errors.length) console.log('page errors:', errors);
}
