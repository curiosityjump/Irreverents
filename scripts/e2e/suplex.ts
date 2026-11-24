// Step 25 push 2, the suplex by touch (docs/plan/step-25.md, "The signal";
// docs/mechanisms/combat-and-impact.md, "The suplex"): called from
// scripts/e2e.ts. One phone-sized page (iPhone 14 landscape), touch only, in
// a private world, with 150 ms added each way (as e2e/hit-lands.ts), seated
// as the grappler (the party's first member). It walks to the nearest body
// on its floor that can be knocked out and that it can lift, taps Grab, reads
// the Use button (`data-state` must be `suplex`), taps Use, and watches for
// the page to draw an impact on that body on the far side of the hero from
// the way it faces. Press-to-drawn is printed, not limited (the suplex is
// not predicted: about a round trip).
//
// Control: E2E_SUPLEX_SKIP=1 taps Grab again in place of Use (the body is
// set down in front), and `suplex-slam` must fail.
import fs from 'node:fs';
import path from 'node:path';
import { floor, me, pointOn, settle, standAt, tap } from '../lib/e2e-touch.ts';
import type { Kit, Phone } from '../lib/e2e-touch.ts';

/* eslint-disable @typescript-eslint/no-explicit-any */
const DELAY_MS = 150;
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
const n = (v: number | null | undefined): string => (v === null || v === undefined ? '?' : v.toFixed(0));
const useState = (ph: Phone): Promise<string> => ph.page.evaluate(() => document.querySelector<HTMLElement>('#actions [data-action="interact"]')?.dataset.state ?? '');

async function delayedPhone(kit: Kit, url: string, name: string): Promise<Phone> {
  const ctx = await kit.browser.newContext({ ...kit.devices['iPhone 14 landscape'] });
  const page = await ctx.newPage();
  page.on('pageerror', (e: Error) => kit.errors.push(`${name}: ${e.message}`));
  await page.routeWebSocket(/\/ws$/, (ws: any) => {
    const upstream = ws.connectToServer();
    ws.onMessage((m: string) => setTimeout(() => { try { upstream.send(m); } catch { /* closed */ } }, DELAY_MS));
    upstream.onMessage((m: string) => setTimeout(() => { try { ws.send(m); } catch { /* closed */ } }, DELAY_MS));
  });
  const cdp = await ctx.newCDPSession(page);
  await page.goto(url);
  await page.waitForFunction(() => (window as any).irreverents?.drawn.status === 'online' && (window as any).irreverents.drawn.me, null, { timeout: 10000 });
  const id = (await page.evaluate(() => (window as any).irreverents.player)) as string;
  return { name, ctx, page, cdp, id };
}

/** The stick held one way with Jump tapped every half second, until the page's own feet are level with `feet` (as e2e/chase.ts's hopUntil). */
async function hopOnto(ph: Phone, dir: number, feet: number, ms = 8000): Promise<boolean> {
  const st = await pointOn(ph, '[data-stick]', dir > 0 ? 0.9 : 0.1);
  const jp = await pointOn(ph, '[data-action="jump"]');
  if (!st || !jp) return false;
  const level = (): Promise<boolean> => ph.page.evaluate((f: number) => {
    const irr = (window as any).irreverents;
    const m = irr.drawn.me;
    return Math.abs(m.y + irr.content.characters[m.kind].box.h - f) <= 1;
  }, feet);
  const end = Date.now() + ms;
  let ok = false;
  while (Date.now() < end) {
    if (await level()) {
      ok = true;
      break;
    }
    await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...st, id: 1 }, { ...jp, id: 2 }] });
    await sleep(220);
    await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...st, id: 1 }] });
    await sleep(220);
  }
  await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await settle(ph);
  return ok && (await level());
}

export async function suplexFacts(kit: Kit & { shots: string }): Promise<void> {
  const { fact } = kit;
  const skip = process.env.E2E_SUPLEX_SKIP === '1';
  const url = `${kit.base}/?room=e2e-suplex-${Math.random().toString(36).slice(2, 10)}`;
  const ph = await delayedPhone(kit, url, 'suplex');
  try {
    await sleep(1500);
    const info = (await ph.page.evaluate(() => {
      const irr = (window as any).irreverents;
      const c = irr.content;
      const num = (k: string): any => c.tuning.characters[c.characters[k].tuning] ?? {};
      const kind = irr.drawn.me.kind;
      const lift = num(kind).liftStrength ?? 0;
      const ok = Object.fromEntries(Object.keys(c.characters).map((k) => [k, (num(k).toughness ?? c.tuning.world.defaultToughness) > 0 && (num(k).weight ?? c.tuning.world.defaultWeight) <= lift]));
      return { kind, room: irr.drawn.room, ok, rtt: irr.net.rttMs };
    })) as any;
    const a0 = await me(ph);
    // The nearest body in the room it can lift and knock out (the start room's king stands on his dais, a tile up: hop onto it).
    const pick = (await ph.page.evaluate((ok: Record<string, boolean>) => {
      const irr = (window as any).irreverents;
      const d = irr.drawn;
      const box = (k: string): any => irr.content.characters[k].box;
      return d.entities.filter((e: any) => e.player === null && ok[e.kind]).map((e: any) => ({ id: e.id, kind: e.kind, x: e.x, feet: e.y + box(e.kind).h }));
    }, info.ok)) as { id: string; kind: string; x: number; feet: number }[];
    const near = pick.sort((p, q) => Math.abs(p.x - a0.x) - Math.abs(q.x - a0.x))[0];
    const myFeet = (await ph.page.evaluate(() => { const irr = (window as any).irreverents; const m = irr.drawn.me; return m.y + irr.content.characters[m.kind].box.h; })) as number;
    const up = near && Math.abs(near.feet - myFeet) > 1 ? await hopOnto(ph, near.x < a0.x ? -1 : 1, near.feet) : true;
    const f = await floor(ph);
    const body = up && near ? f.bodies.find((b) => b.id === near.id) : undefined;
    fact('suplex-0', !!body, `a phone page, touch only, ${DELAY_MS} ms added each way (round trip ${n(info.rtt)} ms), seated as the ${info.kind} in ${info.room}: the nearest body it can lift and knock out is ${near ? `${near.kind} ${near.id} at x ${n(near.x)}` : 'none'}${near && near.feet !== myFeet ? `, a step up (reached: ${up})` : ''}`);
    if (!body) return;
    // Face it from the side with more floor behind (the slam lands behind the hero).
    const face = body.x - f.left >= f.right - (body.x + body.w) ? -1 : 1;
    await standAt(ph, face > 0 ? body.x - 22 : body.x + body.w + 4, face);
    await sleep(300);
    await tap(ph, 'grab');
    const carried = await ph.page
      .waitForFunction(([id, mine]: string[]) => {
        const d = (window as any).irreverents.drawn;
        const c = d.entities.find((e: any) => e.id === id);
        const m = d.entities.find((e: any) => e.id === mine);
        return !!c && !!m && c.y < m.y - 4;
      }, [body.id, a0.id], { timeout: 4000, polling: 'raf' })
      .then(() => true, () => false);
    await sleep(400);
    const word = await useState(ph);
    fact('suplex-button', carried && word === 'suplex', `carrying the ${body.kind} (${carried}), the Use button's state is "${word}" (expected suplex)`);

    fs.mkdirSync(kit.shots, { recursive: true });
    await ph.page.screenshot({ path: path.join(kit.shots, 'carrying-sideways.png') });
    await ph.page.setViewportSize({ width: 390, height: 664 });
    await sleep(400);
    await ph.page.screenshot({ path: path.join(kit.shots, 'carrying-upright.png') });
    await ph.page.setViewportSize({ width: 844, height: 390 });
    await sleep(600);

    const watch = ph.page.evaluate(
      ([target, dur]: [string, number]) =>
        new Promise((resolve) => {
          const irr = (window as any).irreverents;
          const clock = (): number => performance.timeOrigin + performance.now();
          const before = new Set((irr.drawn.impacts as any[]).filter((i) => i.id === target).map((i) => i.tick));
          let pressed: number | null = null;
          addEventListener('touchstart', () => { if (pressed === null) pressed = clock(); }, { capture: true, once: true });
          const t0 = clock();
          const tick = (): void => {
            const hit = (irr.drawn.impacts as any[]).find((i) => i.id === target && !before.has(i.tick) && i.age >= 0);
            if (hit && pressed !== null) {
              const d = irr.drawn;
              const b = d.entities.find((e: any) => e.id === target);
              const box = (k: string): any => irr.content.characters[k].box;
              const mid = (e: any): number => e.x + box(e.kind).w / 2;
              return resolve({ ms: clock() - pressed, dx: b && d.me ? mid(b) - mid(d.me) : null });
            }
            if (clock() - t0 > dur) return resolve({ ms: null, dx: null });
            requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }),
      [body.id, 4000] as [string, number],
    );
    await sleep(50);
    const tapped = await tap(ph, skip ? 'grab' : 'interact');
    // Mid-heave on the presser's own page: drawn from the press (draw/suplex.ts), about two thirds of the way over.
    await sleep(40);
    const turned = await ph.page.evaluate(() => (window as any).irreverents.drawn.heave ?? null);
    await ph.page.screenshot({ path: path.join(kit.shots, 'heave-sideways.png') });
    const r = (await watch) as { ms: number | null; dx: number | null };
    await ph.page.screenshot({ path: path.join(kit.shots, 'slam-sideways.png') });
    await sleep(250);
    await ph.page.screenshot({ path: path.join(kit.shots, 'splash-sideways.png') });
    const behind = r.dx !== null && Math.sign(r.dx) === -face;
    fact('suplex-slam', tapped && r.ms !== null && behind,
      `${skip ? 'CONTROL (Grab in place of Use): ' : ''}from the Use press the page drew an impact on the ${body.kind} after ${n(r.ms)} ms (printed, not limited: not predicted, about a round trip plus the heave), its middle ${n(r.dx)} px from the hero's, facing ${face > 0 ? 'right' : 'left'} (expected behind); mid-heave the page drew the body turned ${turned === null ? 'not at all' : `${n(turned)} degrees`}`);
    await ph.page.setViewportSize({ width: 390, height: 664 });
    await sleep(400);
    await ph.page.screenshot({ path: path.join(kit.shots, 'after-upright.png') });
  } finally {
    await ph.ctx.close();
  }
}
