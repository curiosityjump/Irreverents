// Step 2's ?tune facts inside `npm run e2e` (one call line in scripts/e2e.ts):
// the feel dials work by touch on a phone-sized page, and play follows on
// BOTH pages, for a number each page simulates itself (a character's top
// speed) and for one only the server runs (the grappler's hit).
// docs/mechanisms/tuning-panel.md.
//
// Three phones, Playwright's iPhone 14 held sideways, driven only by touch:
// A opens with ?tune (the grappler: first to join), B without (the
// infiltrator), C without, joining after the dials have moved. Movement
// and flight are read from what a page drew (`window.irreverents.drawn`).
//
// DRAFT: every limit below is a first pass with room to spare.
import fs from 'node:fs';
import path from 'node:path';
import { floor, flight, me, phone, pointOn, settle, standAt, steer, tap, track } from '../lib/e2e-touch.ts';
import type { Key, Kit, Phone } from '../lib/e2e-touch.ts';

/* eslint-disable @typescript-eslint/no-explicit-any */
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
const n = (v: number | null | undefined): string => (v === null || v === undefined ? '?' : v.toFixed(0));

/** One finger on an element and up again (a tap), or false when nothing there can be touched. */
async function touchOn(ph: Phone, selector: string): Promise<boolean> {
  await ph.page.evaluate((s: string) => document.querySelector(s)?.scrollIntoView({ block: 'center' }), selector);
  const p = await pointOn(ph, selector);
  if (!p) return false;
  await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...p, id: 5 }] });
  await sleep(60);
  await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await sleep(120);
  return true;
}

/** A thumb drags a slider all the way to one end (-1 left, 1 right). */
async function dragTo(ph: Phone, selector: string, end: number): Promise<boolean> {
  await ph.page.evaluate((s: string) => document.querySelector(s)?.scrollIntoView({ block: 'center' }), selector);
  const box = await ph.page.evaluate((s: string) => {
    const el = document.querySelector(s) as HTMLInputElement | null;
    if (!el) return null;
    const b = el.getBoundingClientRect();
    const f = (Number(el.value) - Number(el.min)) / (Number(el.max) - Number(el.min));
    return { left: b.left, width: b.width, y: b.top + b.height / 2, f };
  }, selector);
  if (!box) return false;
  const start = { x: Math.round(box.left + 8 + (box.width - 16) * box.f), y: Math.round(box.y) };
  const goal = end > 0 ? box.left + box.width + 30 : box.left - 30;
  await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...start, id: 6 }] });
  for (let i = 1; i <= 8; i++) {
    await sleep(25);
    await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: Math.round(start.x + ((goal - start.x) * i) / 8), y: start.y, id: 6 }] });
  }
  await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await sleep(200);
  return true;
}

const tuning = (ph: Phone, set: string, name: string): Promise<number> =>
  ph.page.evaluate(([s, k]: string[]) => (window as any).irreverents.content.tuning.characters[s!][k!], [set, name]);
/** Waits until a page's own numbers have `name` between lo and hi (a change has reached it). */
const waitTuning = (ph: Phone, set: string, name: string, lo: number, hi: number, ms = 3000): Promise<boolean> =>
  ph.page
    .waitForFunction(
      ([s, k, a, b]: [string, string, number, number]) => {
        const v = (window as any).irreverents.content.tuning.characters[s][k];
        return v >= a && v <= b;
      },
      [set, name, lo, hi],
      { timeout: ms },
    )
    .then(() => true, () => false);

/**
 * How long, in ms, a run from standing takes to cover `dist` px to the
 * right, as page `on` draws the runner `who` (B steering by its stick).
 */
async function sprint(runner: Phone, on: [Phone, Phone], who: Key, dist: number): Promise<[number | null, number | null]> {
  const x0 = (await me(runner)).x as number;
  const tracks = on.map((ph) => track(ph, who, 2500));
  await steer(runner, 1, x0 + dist + 4, 2400);
  const pts = await Promise.all(tracks);
  await settle(runner);
  const took = (list: { t: number; x: number }[]): number | null => {
    if (list.length === 0) return null;
    const start = list.find((p) => p.x > list[0]!.x + 1);
    const end = list.find((p) => p.x >= list[0]!.x + dist);
    return start && end ? end.t - start.t : null;
  };
  return [took(pts[0]!), took(pts[1]!)];
}

export async function tuneFacts(kit: Kit): Promise<void> {
  const { fact } = kit;
  const world = `e2e-tune-${Math.random().toString(36).slice(2, 10)}`;
  const A = await phone(kit, `${kit.base}/?tune&room=${world}`, 'tune A');
  const B = await phone(kit, `${kit.base}/?room=${world}`, 'tune B');
  let C: Phone | null = null;
  try {
    for (const [x, y] of [[A, B], [B, A]] as const) {
      await x.page.waitForFunction((p: string) => (window as any).irreverents.drawn.entities.some((d: any) => d.player === p), y.id, { timeout: 5000 }).catch(() => {});
    }
    const a0 = await me(A);
    const b0 = await me(B);
    const keyB: Key = { player: B.id };

    // ---- without ?tune: no panel, no message ----
    const off = await B.page.evaluate(() => ({
      panel: !!document.getElementById('tune') || !!document.getElementById('tune-open'),
      out: (window as any).irreverents.net.tunesOut,
      in: (window as any).irreverents.net.tuningsIn,
    }));
    fact('tune-off', !off.panel && off.out === 0 && off.in === 0,
      `a page opened without ?tune ${off.panel ? 'HAS a tune panel or button' : 'has no tune panel and no tune button'}, sent ${off.out} tune messages and, in a world nobody has tuned, received ${off.in} tuning messages`);

    // ---- the panel opens by touch, scrolls, and leaves the controls free ----
    const opened = (await touchOn(A, '#tune-open')) && (await A.page.evaluate(() => document.getElementById('tune')?.hidden === false));
    const groups = await A.page.evaluate(() => [...document.querySelectorAll('#tune details')].map((d: any) => d.dataset.set));
    const before = await A.page.evaluate(() => document.querySelector('#tune .scroll')!.scrollTop);
    // A thumb on a row's words (a swipe that starts on a slider moves the slider, as on any phone).
    const sc = await pointOn(A, '#tune .row .what', 0.3);
    if (sc) {
      await A.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: sc.x, y: sc.y, id: 7 }] });
      for (let i = 1; i <= 6; i++) {
        await sleep(20);
        await A.cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: sc.x, y: Math.max(2, sc.y - i * 15), id: 7 }] });
      }
      await A.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await sleep(300);
    }
    const after = await A.page.evaluate(() => document.querySelector('#tune .scroll')!.scrollTop);
    const free = await A.page.evaluate(() =>
      [...document.querySelectorAll('[data-stick], [data-action]')].filter((el) => {
        const b = el.getBoundingClientRect();
        const t = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
        return !(t && (t === el || el.contains(t)));
      }).length,
    );
    fact('tune-open', opened && groups[0] === a0.kind && groups.includes('world') && after > before && free === 0,
      `A (with ?tune) taps Tune: the panel ${opened ? 'opened' : 'did NOT open'}, groups in order ${groups.join(', ')} (its own character, the ${a0.kind}, first); a thumb swipe scrolled it from ${n(before)} to ${n(after)} px; ${free} touch controls covered by it`);

    // ---- a number each page simulates itself: B's top speed, turned on A ----
    const floorB = await floor(B);
    await standAt(B, floorB.left + 6, 1);
    const [slowB, slowOnA] = await sprint(B, [B, A], keyB, 60);
    await standAt(B, floorB.left + 6, 1);
    const shippedRun = await tuning(B, b0.kind, 'runSpeed');
    await touchOn(A, `#tune details[data-set="${b0.kind}"] > summary`);
    const dragged = await dragTo(A, `#tune .row[data-set="${b0.kind}"][data-name="runSpeed"] input[type=range]`, 1);
    const onA = await tuning(A, b0.kind, 'runSpeed');
    const reached = await waitTuning(B, b0.kind, 'runSpeed', shippedRun * 1.5, Infinity);
    const fastRun = await tuning(B, b0.kind, 'runSpeed');
    const [fastB, fastOnA] = await sprint(B, [B, A], keyB, 60);
    fact('tune-move', dragged && reached && slowB !== null && fastB !== null && fastB < slowB * 0.75 && slowOnA !== null && fastOnA !== null && fastOnA < slowOnA * 0.75,
      `A drags the ${b0.kind}'s runSpeed slider to its end by touch: A's page has ${n(onA)}, B's page (no ?tune) ${reached ? 'got' : 'did NOT get'} ${n(fastRun)} (shipped ${n(shippedRun)}); B runs 60 px by its stick in ${n(slowB)} ms before and ${n(fastB)} ms after on its own page, and A's page draws it in ${n(slowOnA)} ms and ${n(fastOnA)} ms`);

    // ---- a number only the server runs: the grappler's hit ----
    const hit = async (): Promise<{ onA: number; onB: number; found: boolean }> => {
      const f = await floor(A);
      const x = (await me(A)).x as number;
      const crate = f.bodies.filter((o) => o.kind === 'crate').sort((p, q) => Math.abs(p.x - x) - Math.abs(q.x - x))[0];
      if (!crate) return { onA: 0, onB: 0, found: false };
      // Stand on whichever side has more floor beyond the crate, facing it.
      const right = f.right - crate.x > crate.x - f.left;
      await standAt(A, right ? crate.x - 14 : crate.x + crate.w + 2, right ? 1 : -1);
      const key: Key = { id: crate.id };
      const tracks = [track(A, key, 1500), track(B, key, 1500)];
      await sleep(100);
      await tap(A, 'attack');
      const [pa, pb] = await Promise.all(tracks);
      await sleep(400);
      return { onA: flight(pa!).far, onB: flight(pb!).far, found: true };
    };
    let base = await hit();
    // DRAFT: one more try when the first swing barely caught the crate (seen once in ten runs: 9 px).
    if (base.found && base.onA < 20) base = await hit();
    // A's own character's group is open from the start.
    const zeroed = await dragTo(A, `#tune .row[data-set="${a0.kind}"][data-name="attackStrength"] input[type=range]`, -1);
    const strengthOnB = (await waitTuning(B, a0.kind, 'attackStrength', 0, 0)) ? 0 : await tuning(B, a0.kind, 'attackStrength');
    await sleep(300);
    const weak = await hit();
    fact('tune-hit', base.found && weak.found && zeroed && base.onA >= 20 && base.onB >= 20 && weak.onA <= 6 && weak.onB <= 6 && strengthOnB === 0,
      `A hits a crate by touch: it flies ${n(base.onA)} px on A's page and ${n(base.onB)} px on B's; A drags the ${a0.kind}'s attackStrength to 0 (B's page has ${n(strengthOnB)}), and the same hit moves it ${n(weak.onA)} px on A's page and ${n(weak.onB)} px on B's (the server runs hits)`);

    // ---- a page joining later plays by the world's numbers ----
    C = await phone(kit, `${kit.base}/?room=${world}`, 'tune C');
    await waitTuning(C, b0.kind, 'runSpeed', shippedRun * 1.5, Infinity);
    const cRun = await tuning(C, b0.kind, 'runSpeed');
    const cStrength = await tuning(C, a0.kind, 'attackStrength');
    fact('tune-join', cRun === fastRun && cStrength === 0,
      `a page joining afterwards (no ?tune) plays by the world's numbers: the ${b0.kind}'s runSpeed ${n(cRun)} (the world's ${n(fastRun)}, shipped ${n(shippedRun)}), the ${a0.kind}'s attackStrength ${n(cStrength)}`);

    // ---- copy and reset ----
    await touchOn(A, '#tune [data-tune="copy"]');
    const copied = await A.page.evaluate(() => {
      const t = document.querySelector('#tune textarea') as HTMLTextAreaElement;
      try {
        return { shown: !t.hidden, json: JSON.parse(t.value) };
      } catch {
        return { shown: !t.hidden, json: null };
      }
    });
    const want = copied.json?.characters?.[b0.kind]?.runSpeed === fastRun && copied.json?.characters?.[a0.kind]?.attackStrength === 0 && !copied.json?.world;
    await touchOn(A, '#tune [data-tune="reset"]');
    const resetB = await waitTuning(B, b0.kind, 'runSpeed', shippedRun, shippedRun);
    await touchOn(A, '#tune [data-tune="close"]');
    const closed = await A.page.evaluate(() => document.getElementById('tune')?.hidden === true);
    fact('tune-copy', copied.shown && want && resetB && closed,
      `Copy shows ${copied.shown ? 'a text box with' : 'NO text box with'} ${JSON.stringify(copied.json)}; Reset puts B's page back to runSpeed ${n(await tuning(B, b0.kind, 'runSpeed'))} (${resetB ? 'shipped' : 'NOT shipped'}); the x ${closed ? 'closed' : 'did NOT close'} the panel`);

    // Pictures for the lead (e2e-out/, git-ignored), at iPhone 14 size with one device pixel per CSS pixel.
    for (const [label, viewport] of [['sideways', { width: 844, height: 390 }], ['upright', { width: 390, height: 844 }]] as const) {
      const ctx = await kit.browser.newContext({ viewport, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
      const pg = await ctx.newPage();
      await pg.goto(`${kit.base}/?tune&room=${world}-shot`);
      await pg.waitForFunction(() => (window as any).irreverents?.drawn.status === 'online', null, { timeout: 10000 }).catch(() => {});
      await pg.tap('#tune-open').catch(() => {});
      await sleep(300);
      fs.mkdirSync(kit.out, { recursive: true });
      await pg.screenshot({ path: path.join(kit.out, `tune-${label}.png`) });
      await ctx.close();
    }
  } finally {
    await A.ctx.close();
    await B.ctx.close();
    if (C) await C.ctx.close();
  }
}
