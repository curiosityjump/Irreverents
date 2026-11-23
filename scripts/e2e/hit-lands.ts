// Step 5, "A hit lands when you swing" (docs/mechanisms/network.md,
// "Predicted hits"): called from scripts/e2e.ts. Two phone-sized pages,
// driven only by touch, in a private world. The hitter's socket goes through
// this script with 150 ms added each way (as fact d-delay does for the
// desktop page); the watcher's does not. Every number is read from what a
// page drew (`window.irreverents.drawn`): the crate's drawn place, and
// `drawn.impacts`, the impacts the frame drew its dust, star and shake from.
//
// Control: E2E_NO_PREDICT=1 sets the hitter page's `content.net.predictHitMs`
// to 0 (prediction off, as before), and `hit-star` / `hit-moves` must fail.
import { floor, me, standAt, tap } from '../lib/e2e-touch.ts';
import type { Kit, Phone } from '../lib/e2e-touch.ts';

/* eslint-disable @typescript-eslint/no-explicit-any */
const DELAY_MS = 150;
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
const n = (v: number | null | undefined): string => (v === null || v === undefined ? '?' : v.toFixed(0));

async function routedPhone(kit: Kit, url: string, name: string, delayMs: number): Promise<Phone> {
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

/**
 * Starts watching one body on a page: from the next touch (the hitter's
 * press; the watcher is told the press time instead), the first frame it is
 * drawn 4 px or more from where it was, the first frame an impact on it
 * newer than any before is drawn, and where it is drawn once still.
 * Times are wall-clock ms (performance.timeOrigin + now), so two pages compare.
 */
const watch = (ph: Phone, id: string, ms: number): Promise<any> =>
  ph.page.evaluate(
    ([target, dur]: [string, number]) =>
      new Promise((resolve) => {
        const irr = (window as any).irreverents;
        const clock = (): number => performance.timeOrigin + performance.now();
        const find = (): any => irr.drawn.entities.find((d: any) => d.id === target);
        const e0 = find();
        const before = new Set((irr.drawn.impacts as any[]).filter((i) => i.id === target).map((i) => i.tick));
        let pressed: number | null = null;
        addEventListener('touchstart', () => { if (pressed === null) pressed = clock(); }, { capture: true, once: true });
        let star: number | null = null;
        let starPredicted = false;
        let moved: number | null = null;
        let still = 0;
        let last: any = null;
        let restAt: number | null = null;
        const t0 = clock();
        const tick = (): void => {
          const t = clock();
          const e = find();
          const hit = (irr.drawn.impacts as any[]).find((i) => i.id === target && !before.has(i.tick) && i.age >= 0);
          if (star === null && hit) {
            star = t;
            starPredicted = hit.predicted;
          }
          if (moved === null && e && e0 && Math.hypot(e.x - e0.x, e.y - e0.y) >= 4) moved = t;
          if (e && last && e.x === last.x && e.y === last.y) still++;
          else {
            still = 0;
            restAt = null;
          }
          if (moved !== null && still === 1) restAt = t;
          last = e ? { x: e.x, y: e.y } : null;
          if ((moved !== null && still >= 30) || t - t0 > dur) return resolve({ pressed, star, starPredicted, moved, restAt, at: last, from: e0 ? { x: e0.x, y: e0.y } : null });
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }),
    [id, ms],
  );

export async function hitLandsFacts(kit: Kit): Promise<void> {
  const { fact } = kit;
  const url = `${kit.base}/?room=e2e-hit-${Math.random().toString(36).slice(2, 10)}`;
  // A joins first, so it is seated as the grappler (the party's first member).
  const A = await routedPhone(kit, url, 'hit A', DELAY_MS);
  const B = await routedPhone(kit, url, 'hit B', 0);
  try {
    const off = process.env.E2E_NO_PREDICT === '1';
    if (off) await A.page.evaluate(() => { (window as any).irreverents.content.net.predictHitMs = 0; });
    await sleep(2600); // the hitter's round trip is measured once a second
    const info = (await A.page.evaluate(() => {
      const irr = (window as any).irreverents;
      const kind = irr.content.characters[irr.drawn.me.kind];
      return { rtt: irr.net.rttMs, kind: irr.drawn.me.kind, t: irr.content.tuning.characters[kind.tuning], world: irr.content.tuning.world, weights: Object.fromEntries(Object.entries(irr.content.characters).map(([k, c]: [string, any]) => [k, irr.content.tuning.characters[c.tuning]?.weight ?? irr.content.tuning.world.defaultWeight])) };
    })) as any;
    const a0 = await me(A);
    const f = await floor(A);
    const crate = f.bodies.filter((b) => b.kind === 'crate').sort((p, q) => Math.abs(p.x - a0.x) - Math.abs(q.x - a0.x))[0];
    const ready = !!crate && info.rtt >= 2 * DELAY_MS;
    fact('hit-0', ready, `two phone pages, touch only: the hitter (${info.kind}) has ${DELAY_MS} ms added each way (its measured round trip ${n(info.rtt)} ms); a crate on its floor at x ${n(crate?.x)}`);
    if (!ready) return;
    // Knock it toward the side with more floor; stand so it is just past A's front edge (as fact t-hit does).
    const face = f.right - crate.x >= crate.x - f.left ? 1 : -1;
    await standAt(A, face > 0 ? crate.x - 22 : crate.x + crate.w + 4, face);
    await sleep(400);
    const windupMs = (info.t.attackWindup ?? 0) * 1000;
    // The held beat the simulation gives this hit (body-state.ts beatTicks), for the limit only.
    const speed = Math.min(info.t.attackStrength / info.weights.crate, info.world.maxLaunchSpeed);
    const lo = info.world.hitBeatTime;
    const hi = Math.max(lo, info.world.hitBeatMaxTime);
    // The body is held for those ticks and leaves on the tick after (combat-clock.ts), on the server as here.
    const beatMs = ((Math.round((lo + (hi - lo) * Math.min(1, speed / info.world.maxLaunchSpeed)) * 60) + 1) * 1000) / 60;
    const wa = watch(A, crate.id, 4000);
    const wb = watch(B, crate.id, 4000);
    await sleep(50);
    const tapped = await tap(A, 'attack');
    const [ra, rb] = await Promise.all([wa, wb]);
    const press = ra.pressed as number | null;
    const since = (t: number | null): number | null => (t === null || press === null ? null : t - press);
    const starA = since(ra.star);
    const moveA = since(ra.moved);
    const starB = since(rb.star);
    const moveB = since(rb.moved);
    const starLimit = windupMs + 50;
    const moveLimit = windupMs + beatMs + 50;
    const how = off ? 'prediction OFF (control)' : 'prediction on';
    fact('hit-star', tapped && starA !== null && starA <= starLimit,
      `${how}: from the Hit press the hitter's page first drew the star on the crate after ${n(starA)} ms${ra.starPredicted ? ' (predicted)' : ''} (limit: the ${info.kind}'s wind-up ${n(windupMs)} + 50 = ${n(starLimit)} ms)`);
    fact('hit-moves', tapped && moveA !== null && moveA <= moveLimit,
      `${how}: the hitter's page first drew the crate 4 px from where it stood after ${n(moveA)} ms (limit: wind-up ${n(windupMs)} + the beat as held, ${n(beatMs)}, + 50 = ${n(moveLimit)} ms)`);
    // The watcher's screen is not predicted: it draws the server's hit, as before.
    fact('hit-watcher', starB !== null && moveB !== null && moveB <= 900,
      `the other page drew the star after ${n(starB)} ms and the crate moving after ${n(moveB)} ms (the server's hit, unchanged; limit 900 ms)`);
    // Where the two pages end up drawing it, once both have it still.
    const restA = since(ra.restAt);
    const restB = since(rb.restAt);
    const gap = ra.at && rb.at ? Math.hypot(ra.at.x - rb.at.x, ra.at.y - rb.at.y) : null;
    fact('hit-agree', gap !== null && gap <= 2 && restA !== null && restA <= 2500,
      `once still, both pages draw the crate in the same place: ${gap === null ? '?' : gap.toFixed(1)} px apart (limit 2), the hitter's at x ${n(ra.at?.x)} still after ${n(restA)} ms, the watcher's at x ${n(rb.at?.x)} after ${n(restB)} ms (from x ${n(ra.from?.x)})`);

    // ---- brief item 3: a throw leaves the hands on the press ----
    await sleep(1500);
    const f2 = await floor(A);
    const at = (await me(A)).x as number;
    const box = f2.bodies.filter((o) => o.kind === 'crate').sort((p, q) => Math.abs(p.x - at) - Math.abs(q.x - at))[0];
    let carried = false;
    if (box) {
      // Throw toward the longer floor, away from a walk door (a body thrown through one leaves the room).
      const dir = f2.right - box.x >= box.x - f2.left ? 1 : -1;
      await standAt(A, dir > 0 ? box.x - 10 : box.x + box.w - 6, dir);
      await tap(A, 'grab');
      carried = await A.page
        .waitForFunction(([id, me]: string[]) => {
          const d = (window as any).irreverents.drawn;
          const c = d.entities.find((e: any) => e.id === id);
          const m = d.entities.find((e: any) => e.id === me);
          return !!c && !!m && c.y < m.y - 4 && Math.abs(c.x - m.x) < 16;
        }, [box.id, (await me(A)).id], { timeout: 3000, polling: 'raf' })
        .then(() => true, () => false);
    }
    if (!carried) {
      fact('throw-leaves', false, `the hitter could not pick up a crate to throw (crate ${box ? `at x ${n(box.x)}` : 'none'} on its floor)`);
      return;
    }
    await sleep(600);
    const leaves = A.page.evaluate(
      ([id, dur]: [string, number]) =>
        new Promise((resolve) => {
          const irr = (window as any).irreverents;
          const clock = (): number => performance.timeOrigin + performance.now();
          const rel = (): { x: number; y: number } | null => {
            const c = irr.drawn.entities.find((e: any) => e.id === id);
            const m = irr.drawn.me;
            return c && m ? { x: c.x - m.x, y: c.y - m.y } : null;
          };
          const r0 = rel();
          let pressed: number | null = null;
          addEventListener('touchstart', () => { if (pressed === null) pressed = clock(); }, { capture: true, once: true });
          const t0 = clock();
          const tick = (): void => {
            const r = rel();
            // Out of the hands: drawn 6 px from where it rode, or no longer drawn in this room at all.
            if (pressed !== null && r0 && (!r || Math.hypot(r.x - r0.x, r.y - r0.y) >= 6)) return resolve({ left: clock() - pressed, gone: !r, hits: irr.net.hits });
            if (clock() - t0 > dur) return resolve({ left: null, hits: irr.net.hits });
            requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }),
      [box!.id, 3000],
    );
    await sleep(50);
    const threw = await tap(A, 'attack');
    const lv = (await leaves) as { left: number | null; gone?: boolean; hits: any };
    // DRAFT: a throw has no wind-up (attack.ts); 100 ms is a press, a tick and a few frames.
    fact('throw-leaves', threw && lv.left !== null && lv.left <= 100,
      `${how}: the hitter taps Hit while carrying a crate; its page first drew the crate leaving the hands ${n(lv.left)} ms after the press${lv.gone ? ' (gone from the room)' : ''} (limit 100 ms; ${DELAY_MS} ms added each way); throws predicted ${lv.hits?.thrown ?? '?'}, hits confirmed ${lv.hits?.confirmed ?? '?'}, eased back ${lv.hits?.easedBack ?? '?'}`);
  } finally {
    await A.ctx.close();
    await B.ctx.close();
  }
}
