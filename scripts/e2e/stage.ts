// Step 22 push 4's facts inside `npm run e2e` (one call line in scripts/e2e.ts):
// the STAGE CLEARED screen on phone-sized pages, by touch.
// - stage-screen-<size>: at each of three phone sizes the screen, given a clear
//   as the server sends it, lights its stars and counts its statistics, all
//   inside the view and clear of the notch; Continue is on screen, inside the
//   safe area, 44 px or more; the stick and buttons rest while it is up.
// - stage-continue: a touch on Continue takes the screen down and the stick
//   moves the hero again. Control: `stage-held`, the stick pushed while the
//   screen is up, and the hero does not move.
// - stage-two: two pages in one world, both with the screen up; one taps
//   Continue and the other's screen stays up.
// DRAFT, and not verified here (docs/plan/step-22.md, Builder notes): the
// clear is put up page-side (`irreverents.stage.show`, the same function the
// server's event reaches), not by walking the whole quarry; that the server
// sends `stage-cleared` to every page is game.ts's (every snap carries every
// event), and the scenarios prove the event. "Walk in and be beaten" is owed.
import fs from 'node:fs';
import path from 'node:path';
import type { Kit } from '../lib/e2e-touch.ts';

/* eslint-disable @typescript-eslint/no-explicit-any */
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

const CLEAR = { type: 'stage-cleared', tick: 1, stage: 'iron-quarry', ticks: 75 * 60 + 12, defeated: 7, alarms: 2, tries: 1, unseen: false, hoard: true, stars: 2, best: true };

async function open(kit: Kit, url: string, opt: any, name: string): Promise<{ page: any; cdp: any; ctx: any; id: string }> {
  const ctx = await kit.browser.newContext(opt);
  const page = await ctx.newPage();
  page.on('pageerror', (e: Error) => kit.errors.push(`${name}: ${e.message}`));
  const cdp = await ctx.newCDPSession(page);
  await page.goto(url);
  await page.waitForFunction(() => (window as any).irreverents?.drawn.status === 'online' && (window as any).irreverents.drawn.me, null, { timeout: 10000 });
  await sleep(600);
  const id = (await page.evaluate(() => (window as any).irreverents.player)) as string;
  return { page, cdp, ctx, id };
}

const show = (p: any, id: string): Promise<boolean> => p.evaluate(([ev, pid]: [any, string]) => (window as any).irreverents.stage.show({ ...ev, player: pid }), [CLEAR, id]);
const stage = (p: any): Promise<any> => p.evaluate(() => (window as any).irreverents.drawn.stage);
const button = (p: any): Promise<any> =>
  p.evaluate(() => {
    const el = document.getElementById('stage-continue')!;
    const b = el.getBoundingClientRect();
    const s = getComputedStyle(document.getElementById('safe')!);
    const x = b.left + b.width / 2;
    const y = b.top + b.height / 2;
    const top = document.elementFromPoint(x, y);
    return {
      hidden: (el as HTMLButtonElement).hidden, x, y, w: b.width, h: b.height, left: b.left, right: b.right, top: b.top, bottom: b.bottom,
      vw: innerWidth, vh: innerHeight, inset: { l: parseFloat(s.paddingLeft), r: parseFloat(s.paddingRight), b: parseFloat(s.paddingBottom) },
      reachable: top === el || el.contains(top), touch: getComputedStyle(document.getElementById('touch')!).visibility,
    };
  });
async function touchAt(cdp: any, x: number, y: number, ms = 120): Promise<void> {
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 1 }] });
  await sleep(ms);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}
async function stickFor(ph: { page: any; cdp: any }, ms: number): Promise<number> {
  const x0 = (await ph.page.evaluate(() => (window as any).irreverents.drawn.me.x)) as number;
  const pt = await ph.page.evaluate(() => {
    const el = document.querySelector('[data-stick]');
    if (!el) return null;
    const b = el.getBoundingClientRect();
    return b.width > 0 ? { x: Math.round(b.left + b.width * 0.9), y: Math.round(b.top + b.height / 2) } : null;
  });
  if (!pt) return 0;
  await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...pt, id: 1 }] });
  await sleep(ms);
  await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await sleep(200);
  const x1 = (await ph.page.evaluate(() => (window as any).irreverents.drawn.me.x)) as number;
  return Math.abs(x1 - x0);
}

export async function stageFacts(kit: Kit & { shots?: string }): Promise<void> {
  const { fact, devices } = kit;
  const shots = kit.shots ?? kit.out;
  fs.mkdirSync(shots, { recursive: true });
  const sizes: [string, any][] = [
    ['upright-390x664', { ...devices['iPhone 14'] }],
    ['sideways-667x375', { viewport: { width: 667, height: 375 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }],
    ['sideways-844x340', { ...devices['iPhone 14 landscape'] }],
  ];
  for (const [size, opt] of sizes) {
    const ph = await open(kit, `${kit.base}/?room=e2e-stage-${size}-${Math.random().toString(36).slice(2, 8)}`, opt, `stage ${size}`);
    try {
      const up = await show(ph.page, ph.id);
      await sleep(1300);
      if (size.startsWith('upright')) await ph.page.screenshot({ path: path.join(shots, 'push4-stage-mid-count-upright.png') });
      await sleep(3800);
      await ph.page.screenshot({ path: path.join(shots, `push4-stage-cleared-${size}.png`) });
      const s = await stage(ph.page);
      const b = await button(ph.page);
      const v = s?.view ?? { w: 0, h: 0 };
      const inside = !!s && s.box.x >= 0 && s.box.y >= 0 && s.box.x + s.box.w <= v.w && s.box.y + s.box.h <= v.h;
      const lines = s?.lines ?? [];
      const all = lines.length === 5 && lines[0] === 'Time to clear 1:15' && lines[1] === 'Enemies defeated 7' && lines[3] === 'Game overs 1';
      const safe = !b.hidden && b.left >= b.inset.l && b.right <= b.vw - b.inset.r && b.bottom <= b.vh - b.inset.b && b.top >= 0 && b.w >= 44 && b.h >= 44 && b.reachable;
      fact(`stage-screen-${size}`, up && inside && s.lit === 2 && all && safe && b.touch === 'hidden',
        `${size}: shown ${up}; stars lit ${s?.lit} of ${s?.stars}; lines ${JSON.stringify(lines)}; the plate ${JSON.stringify(s?.box)} inside the ${v.w} by ${v.h} view: ${inside}; Continue ${Math.round(b.w)}x${Math.round(b.h)} at ${Math.round(b.left)}-${Math.round(b.right)}, ${Math.round(b.top)}-${Math.round(b.bottom)} of ${b.vw}x${b.vh}, insets ${JSON.stringify(b.inset)}, reachable ${b.reachable}: ${safe}; the controls ${b.touch}`);
      if (size.startsWith('sideways-844')) {
        // Control: the stick pushed while the screen is up moves nothing (the controls rest).
        await ph.page.evaluate(() => document.getElementById('touch')!.classList.remove('stage-up'));
        const held = await stickFor(ph, 500);
        fact('stage-held', held < 1, `with STAGE CLEARED up, the stick held 0.5 s moved the hero ${held.toFixed(1)} px (expected none)`);
        await touchAt(ph.cdp, b.x, b.y);
        await sleep(300);
        const after = await stage(ph.page);
        const b2 = await button(ph.page);
        const moved = await stickFor(ph, 600);
        fact('stage-continue', after === null && b2.hidden && b2.touch !== 'hidden' && moved > 4, `a touch on Continue: the screen is ${after === null ? 'down' : 'still up'}, Continue hidden ${b2.hidden}, the controls ${b2.touch}; then the stick held 0.6 s moved the hero ${moved.toFixed(1)} px`);
      }
    } finally {
      await ph.ctx.close();
    }
  }
  // Two pages in one world: each dismisses their own.
  const world = `${kit.base}/?room=e2e-stage-two-${Math.random().toString(36).slice(2, 8)}`;
  const A = await open(kit, world, { ...devices['iPhone 14 landscape'] }, 'stage A');
  const B = await open(kit, world, { ...devices['iPhone 14 landscape'] }, 'stage B');
  try {
    // Both as their own: B's clear names B (as the server's names whoever reached the end; B's own hero is not in the quarry here).
    const a = await show(A.page, A.id);
    const bb = await show(B.page, B.id);
    await sleep(500);
    const ba = await button(A.page);
    await touchAt(A.cdp, ba.x, ba.y);
    await sleep(400);
    const sa = await stage(A.page);
    const sb = await stage(B.page);
    fact('stage-two', a && bb && sa === null && sb !== null, `both pages up (${a}, ${bb}); A touched Continue: A's screen ${sa === null ? 'down' : 'up'}, B's ${sb === null ? 'down' : 'still up'}`);
  } finally {
    await A.ctx.close();
    await B.ctx.close();
  }
}
