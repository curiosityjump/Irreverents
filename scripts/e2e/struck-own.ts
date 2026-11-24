// Brief page-misses-what-happened, push 2 (docs/mechanisms/network.md, "A
// blow on your own hero"): called from scripts/e2e.ts. One phone-sized page,
// driven only by touch, its socket routed through this script with 150 ms
// added each way. It walks into the cantina and swings at a regular: a brawl,
// and the regulars' blows land on its own hero.
//
// "The blow" is the moment this script hears the server's push for it (a
// `fx` push whose server copy carries the blow's `c.impact`), before the
// 150 ms is added on the way to the page. From then, frame by frame, what the
// struck page drew of its own hero (`drawn.me.state`, and `drawn.impacts`,
// the impacts the frame drew its flash, dust and shake from) must show the
// hit: `hurt` (or tumbling) and its impact, within one round trip plus a
// frame. Clocks: both are this machine's wall clock (Date.now() here,
// performance.timeOrigin + now() in the page).
//
// Control: the pre-change src/net/client.ts (git stash, npm run build): the
// own page never draws its hero hurt from a blow, nor its impact, so
// `struck-own` fails.
// Shots (handoff brief): a hero mid-hit at 844x390 and 390x664.
// DRAFT: every limit and wait below is a first pass with room to spare.
import fs from 'node:fs';
import path from 'node:path';
import { pointOn, settle, standAt, tap } from '../lib/e2e-touch.ts';
import type { Kit, Phone } from '../lib/e2e-touch.ts';
import { pushUp, walkInto } from './outpost.ts';

/* eslint-disable @typescript-eslint/no-explicit-any */
const DELAY_MS = 150;
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
const n = (v: number | null | undefined): string => (v === null || v === undefined ? '?' : v.toFixed(0));
const HIT = "(() => { const d = window.irreverents.drawn; return d.me && (d.me.state === 'hurt' || d.me.state === 'tumble'); })()";

/** A phone page whose socket goes through this script, `DELAY_MS` each way; `blows` gets the wall time of every server push that carries a new blow. */
async function routedPhone(kit: Kit, url: string, blows: { at: number; tick: number; speed: number; what: string }[]): Promise<Phone> {
  const ctx = await kit.browser.newContext({ ...kit.devices['iPhone 14 landscape'] });
  const page = await ctx.newPage();
  page.on('pageerror', (e: Error) => kit.errors.push(`struck: ${e.message}`));
  let lastTick = -1;
  await page.routeWebSocket(/\/ws$/, (ws: any) => {
    const upstream = ws.connectToServer();
    ws.onMessage((m: string) => setTimeout(() => { try { upstream.send(m); } catch { /* closed */ } }, DELAY_MS));
    upstream.onMessage((m: string) => {
      if (typeof m === 'string' && m.startsWith('{"t":"fx"')) {
        try {
          const fx = JSON.parse(m);
          const imp = fx.effect?.kind === 'push' ? fx.e?.c?.impact : null;
          if (imp && imp.tick > lastTick) {
            lastTick = imp.tick;
            blows.push({ at: Date.now(), tick: imp.tick, speed: imp.speed, what: `${fx.effect.fly ? 'fly' : 'no fly'}, beat ${fx.e.c.beat?.ticks ?? 'none'}, flying ${!!fx.e.c.flying}, held ${!!fx.e.c.effect?.heldBy}` });
          }
        } catch {
          // not ours to read
        }
      }
      setTimeout(() => { try { ws.send(m); } catch { /* closed */ } }, DELAY_MS);
    });
  });
  const cdp = await ctx.newCDPSession(page);
  await page.goto(url);
  await page.waitForFunction(() => (window as any).irreverents?.drawn.status === 'online' && (window as any).irreverents.drawn.me, null, { timeout: 10000 });
  const id = (await page.evaluate(() => (window as any).irreverents.player)) as string;
  return { name: 'struck', ctx, page, cdp, id };
}

/** By touch: start room -> castle street -> up through the cantina's doorway (as scripts/e2e/cantina.ts does). */
async function intoCantina(ph: Phone): Promise<boolean> {
  const room = (): Promise<string> => ph.page.evaluate(() => (window as any).irreverents.drawn.room);
  if (!(await walkInto(ph, 1, 'castle-street'))) return false;
  const x = (await ph.page.evaluate(() => {
    const irr = (window as any).irreverents;
    const c = irr.content;
    const door = c.rooms['castle-street'].doors.find((d: any) => d.id === 'to-cantina');
    return (door.tx + door.w / 2) * c.rooms['castle-street'].tile - c.characters[irr.drawn.me.kind].box.w / 2;
  })) as number;
  for (const nudge of [-4, -10, 2, -16]) {
    if ((await room()) === 'cantina') break;
    await standAt(ph, x + nudge, 1);
    await pushUp(ph);
    await ph.page.waitForFunction(() => (window as any).irreverents.drawn.room === 'cantina', null, { polling: 'raf', timeout: 3000 }).catch(() => undefined);
  }
  return (await room()) === 'cantina';
}

/** Swings at the nearest regular until the page draws a brawl's counter. */
async function startBrawl(ph: Phone): Promise<boolean> {
  for (let i = 0; i < 12; i++) {
    const box = await ph.page.evaluate(() => {
      const irr = (window as any).irreverents;
      const d = irr.drawn;
      const regs = d.entities.filter((e: any) => e.player === null && String(e.id).startsWith('cantina:'));
      regs.sort((p: any, q: any) => Math.abs(p.x - d.me.x) - Math.abs(q.x - d.me.x));
      const t = regs[0];
      return t ? { x: t.x, w: irr.content.characters[t.kind].box.w, meW: irr.content.characters[d.me.kind].box.w, meX: d.me.x } : null;
    });
    if (!box) return false;
    const left = box.meX < box.x;
    await standAt(ph, left ? box.x - box.meW - 2 : box.x + box.w + 2, left ? 1 : -1);
    await tap(ph, 'attack');
    await sleep(400);
    if (await ph.page.evaluate(() => !!(window as any).irreverents.drawn.cantina?.counter)) return true;
  }
  return false;
}

export async function struckOwnFacts(kit: Kit & { shots?: string }): Promise<void> {
  const { fact } = kit;
  const shots = kit.shots ?? kit.out;
  const url = `${kit.base}/?room=e2e-struck-${Math.random().toString(36).slice(2, 10)}`;
  const blows: { at: number; tick: number; speed: number; what: string }[] = [];
  const ph = await routedPhone(kit, url, blows);
  try {
    const inside = await intoCantina(ph);
    // The room's regulars reach this page on the snapshots after it arrives (a delayed socket, and drawn a little in the past).
    if (inside) await ph.page.waitForFunction(() => (window as any).irreverents.drawn.entities.some((e: any) => String(e.id).startsWith('cantina:')), null, { timeout: 5000 }).catch(() => undefined);
    const brawl = inside && (await startBrawl(ph));
    // Frame by frame from here: the own hero's drawn state, and whether the frame drew an impact on it.
    await ph.page.evaluate(() => {
      const irr = (window as any).irreverents;
      irr.e2eStruck = [];
      const tick = (): void => {
        const d = irr.drawn;
        const imp = (d.impacts as any[]).find((i) => i.id === d.me?.id && i.age >= 0 && i.age <= 2);
        irr.e2eStruck.push({ t: performance.timeOrigin + performance.now(), state: d.me?.state ?? '', impact: !!imp });
        if (irr.e2eStruck.length > 20000) irr.e2eStruck.shift();
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    const from = blows.length;
    // Stand in the brawl (walking back to the nearest regular now and then) until three blows land, 40 s at most.
    for (let i = 0; i < 80 && blows.length - from < 3 && brawl; i++) {
      await sleep(500);
      if (i % 6 === 5) {
        const near = await ph.page.evaluate(() => {
          const d = (window as any).irreverents.drawn;
          const regs = d.entities.filter((e: any) => e.player === null && String(e.id).startsWith('cantina:'));
          regs.sort((p: any, q: any) => Math.abs(p.x - d.me.x) - Math.abs(q.x - d.me.x));
          return regs[0] ? regs[0].x : null;
        });
        if (near !== null) await standAt(ph, near - 14, 1);
      }
    }
    await sleep(800);
    const rtt = (await ph.page.evaluate(() => (window as any).irreverents.net.rttMs)) as number | null;
    const frames = (await ph.page.evaluate(() => (window as any).irreverents.e2eStruck)) as { t: number; state: string; impact: boolean }[];
    const limit = (rtt ?? 2 * DELAY_MS) + 1000 / 60;
    // Only blows the page had time to draw before its frames were read.
    const lastFrame = frames.length ? frames[frames.length - 1]!.t : 0;
    const seen = blows.slice(from).filter((b) => b.at <= lastFrame - limit - 100).map((b) => {
      const after = frames.filter((f) => f.t >= b.at);
      const hurt = after.find((f) => f.state === 'hurt' || f.state === 'tumble');
      const imp = after.find((f) => f.impact);
      const drew = [...new Set(after.filter((f) => f.t - b.at <= limit).map((f) => f.state))].join('/');
      return { what: b.what, speed: Math.round(b.speed), hurt: hurt ? hurt.t - b.at : null, impact: imp ? imp.t - b.at : null, drew };
    });
    const ok = (s: { hurt: number | null; impact: number | null }): boolean => s.hurt !== null && s.hurt <= limit && s.impact !== null && s.impact <= limit;
    fact(
      'struck-own',
      brawl && rtt !== null && rtt >= 2 * DELAY_MS && seen.length >= 3 && seen.every(ok),
      `a phone page with ${DELAY_MS} ms added each way (its round trip ${n(rtt)} ms), by touch into the cantina (${inside}) and a brawl (${brawl}): ${seen.length} blows on its own hero; from each blow (the server's push heard here) its own page drew the hero hurt after ${seen.map((s) => n(s.hurt)).join(', ')} ms and the blow's impact (flash) after ${seen.map((s) => n(s.impact)).join(', ')} ms, at speeds ${seen.map((s) => s.speed).join(', ')} px/s, drawn in that window as ${seen.map((s) => s.drew).join(', ')}${seen.some((s) => !ok(s)) ? `; the pushes of those not drawn: ${seen.filter((s) => !ok(s)).map((s) => s.what).join('; ')}` : ''} (limit: one round trip plus a frame, ${n(limit)} ms)`,
    );
    if (!brawl) return;
    // Shots of the hero mid-hit, sideways and upright.
    fs.mkdirSync(shots, { recursive: true });
    for (const [w, h] of [[844, 390], [390, 664]] as const) {
      await ph.page.setViewportSize({ width: w, height: h });
      await sleep(300);
      let caught = false;
      for (let i = 0; i < 6 && !caught; i++) {
        caught = await ph.page.waitForFunction(HIT, null, { polling: 'raf', timeout: 5000 }).then(() => true, () => false);
        if (!caught) {
          const p = await pointOn(ph, '[data-stick]', 0.1);
          if (p) {
            await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...p, id: 1 }] });
            await sleep(150);
            await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
          }
        }
      }
      await ph.page.screenshot({ path: path.join(shots, `hero-mid-hit-${w}x${h}.png`) });
      if (!caught) console.log(`      (struck) at ${w}x${h} no hit was drawn in time; shot as it stands`);
    }
    await ph.page.setViewportSize({ width: 844, height: 390 });
    await settle(ph);
  } finally {
    await ph.ctx.close();
  }
}
