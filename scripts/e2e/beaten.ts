// Step 5, the owner playing on the live game: "enemies collapse but never die" (docs/plan/step-5.md,
// "Knocked-out enemies fly off", Part 2; src/sim/beaten.ts). Called from scripts/e2e.ts.
// One phone-sized page, by touch only, with 150 ms added each way on its socket, walks from the start
// room to the courtyard and up through its doorway into the Bandit Camp, and fights the camp's
// people with the attack button (standing beside whoever of them is nearest and up, facing them)
// until the page has drawn one of them go in a poof (`drawn.beaten.gone`, from the world's
// `defeated-gone`) and then no longer draws that body at all for 3 s.
//
// Control: world.beatenAfter set to 100 on the page's world through ?tune is not possible (the
// server's world decides), so the control is the build: with beaten-mark's `defeat(...)` call removed
// (npm run build), nobody is ever defeated and `beaten-gone` fails at its time limit.
// DRAFT: every limit below is a first pass with room to spare.
import path from 'node:path';
import { me, pointOn, settle, standAt, tap } from '../lib/e2e-touch.ts';
import type { Kit, Phone } from '../lib/e2e-touch.ts';
import { pushUp, walkInto } from './outpost.ts';

/* eslint-disable @typescript-eslint/no-explicit-any */
const DELAY_MS = 150;
const FIGHT_MS = 150000;
const CAMP = ['outpost-lookout', 'outpost-fighter', 'heavy-fighter'];
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

async function delayedPhone(kit: Kit, url: string, name: string, delayMs: number): Promise<Phone> {
  const ctx = await kit.browser.newContext({ ...kit.devices['iPhone 14 landscape'] });
  const page = await ctx.newPage();
  page.on('pageerror', (e: Error) => kit.errors.push(`${name}: ${e.message}`));
  if (delayMs > 0) {
    await page.routeWebSocket(/\/ws$/, (ws: any) => {
      const upstream = ws.connectToServer();
      ws.onMessage((m: string) => setTimeout(() => { try { upstream.send(m); } catch { /* closed */ } }, delayMs));
      upstream.onMessage((m: string) => setTimeout(() => { try { ws.send(m); } catch { /* closed */ } }, delayMs));
    });
  }
  const cdp = await ctx.newCDPSession(page);
  await page.goto(url);
  await page.waitForFunction(() => (window as any).irreverents?.drawn.status === 'online' && (window as any).irreverents.drawn.me, null, { timeout: 10000 });
  const id = (await page.evaluate(() => (window as any).irreverents.player)) as string;
  return { name, ctx, page, cdp, id };
}

const room = (ph: Phone): Promise<string> => ph.page.evaluate(() => (window as any).irreverents.drawn.room);
/** The camp's people the page draws now: id, kind, x, whether drawn knocked out. */
const campDrawn = (ph: Phone): Promise<{ id: string; kind: string; x: number; out: boolean }[]> =>
  ph.page.evaluate((kinds: string[]) => ((window as any).irreverents.drawn.entities as any[]).filter((e) => e.player === null && kinds.includes(e.kind)).map((e) => ({ id: e.id, kind: e.kind, x: e.x, out: !!e.out })), CAMP);
const goneDrawn = (ph: Phone): Promise<string[]> => ph.page.evaluate(() => (window as any).irreverents.drawn.beaten?.gone ?? []);

export async function beatenFacts(kit: Kit): Promise<void> {
  const { fact } = kit;
  const url = `${kit.base}/?room=e2e-beaten-${Math.random().toString(36).slice(2, 10)}`;
  const ph = await delayedPhone(kit, url, 'beaten', DELAY_MS);
  try {
    const toStreet = await walkInto(ph, 1, 'castle-street');
    const toCourtyard = toStreet && (await walkInto(ph, 1, 'courtyard'));
    const c = (await ph.page.evaluate(() => {
      const irr = (window as any).irreverents;
      const door = irr.content.rooms.courtyard.doors.find((d: any) => d.id === 'to-outpost');
      return { doorX: door.tx * irr.content.rooms.courtyard.tile, tile: irr.content.rooms.courtyard.tile, w: irr.content.characters[irr.drawn.me.kind].box.w, kind: irr.drawn.me.kind };
    })) as { doorX: number; tile: number; w: number; kind: string };
    if (toCourtyard) await standAt(ph, c.doorX + (c.tile - c.w) / 2 - 4, 1);
    await pushUp(ph);
    let inside = false;
    try {
      await ph.page.waitForFunction(() => (window as any).irreverents.drawn.room === 'outpost', null, { polling: 'raf', timeout: 4000 });
      inside = true;
    } catch {
      // reported below
    }
    // Record, every frame, each camp body's drawn x and every id the page has been told went.
    await ph.page.evaluate((kinds: string[]) => {
      const irr = (window as any).irreverents;
      irr.e2eBeaten = { seen: {}, lastSeen: {} };
      const tick = (): void => {
        for (const e of irr.drawn.entities as any[]) {
          if (e.player !== null || !kinds.includes(e.kind)) continue;
          irr.e2eBeaten.seen[e.id] ??= performance.now();
          irr.e2eBeaten.lastSeen[e.id] = performance.now();
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, CAMP);

    // Over the step (jump while walking east), as outpost.ts does, into the camp.
    const stick = await pointOn(ph, '[data-stick]', 0.9);
    if (inside && stick) {
      await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...stick, id: 1 }] });
      await sleep(250);
      for (let i = 0; i < 3; i++) {
        const jump = await pointOn(ph, '[data-action="jump"]');
        if (jump) {
          await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ ...stick, id: 1 }, { ...jump, id: 2 }] });
          await sleep(250);
          await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ ...stick, id: 1 }] });
        }
        await sleep(300);
      }
      await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    }
    /** A thumb on the stick toward `dir` for `ms` (a short press only turns the character), with a hop over anything low. */
    const push = async (dir: number, ms: number, hop: boolean): Promise<void> => {
      const p = await pointOn(ph, '[data-stick]', dir > 0 ? 0.9 : 0.1);
      if (!p) return;
      await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...p, id: 1 }] });
      const jump = hop ? await pointOn(ph, '[data-action="jump"]') : null;
      if (jump) {
        await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ ...p, id: 1 }, { ...jump, id: 2 }] });
        await sleep(120);
        await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ ...p, id: 1 }] });
      }
      await sleep(ms);
      await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    };
    // The fight: beside whoever of the camp is nearest and up, facing them, and swing; again.
    const t0 = Date.now();
    let goneId: string | null = null;
    let swings = 0;
    let poofAt = 0;
    while (inside && Date.now() - t0 < FIGHT_MS) {
      const gone = await goneDrawn(ph);
      const seen = (await ph.page.evaluate(() => (window as any).irreverents.e2eBeaten.seen)) as Record<string, number>;
      const hit = gone.find((id) => seen[id] !== undefined);
      if (hit) {
        goneId = hit;
        poofAt = Date.now();
        break;
      }
      const at = (await me(ph))?.x as number;
      const up = (await campDrawn(ph)).filter((e) => !e.out).sort((a, b) => Math.abs(a.x - at) - Math.abs(b.x - at));
      const foe = up[0];
      if (foe) {
        const dir = foe.x < at ? -1 : 1;
        const far = Math.abs(foe.x - at) > c.w + 14;
        await push(dir, far ? 350 : 40, far);
      }
      await tap(ph, 'attack');
      swings++;
      await sleep(150);
    }
    await ph.page.screenshot({ path: path.join(kit.out, 'e2e-beaten-poof.png') });
    // Then: that body is not drawn again for 3 s.
    let stillGone = false;
    if (goneId) {
      await sleep(3000);
      const last = (await ph.page.evaluate((id: string) => (window as any).irreverents.e2eBeaten.lastSeen[id], goneId)) as number;
      const nowMs = (await ph.page.evaluate(() => performance.now())) as number;
      stillGone = nowMs - last >= 3000 && !(await campDrawn(ph)).some((e) => e.id === goneId);
    }
    await settle(ph);
    await ph.page.screenshot({ path: path.join(kit.out, 'e2e-beaten-after.png') });
    fact(
      'beaten-gone',
      inside && !!goneId && stillGone,
      `by touch alone (150 ms each way), a phone (${c.kind}) walked into the Bandit Camp (${inside}; now in ${await room(ph)}) and fought its people with ${swings} attack taps in ${Math.round((poofAt || Date.now()) - t0) / 1000} s: ` +
        (goneId ? `the page drew ${goneId} go in a poof and then did not draw him for 3 s (${stillGone})` : 'the page never drew any of them go (nobody defeated)'),
    );
  } finally {
    await ph.ctx.close();
  }
}
