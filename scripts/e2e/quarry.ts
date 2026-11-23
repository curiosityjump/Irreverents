// Step 16's facts inside `npm run e2e` (one call line in scripts/e2e.ts):
// a phone-sized page, by touch only, walks from the start room to the
// courtyard, up through its doorway into the quarry road and across it
// into the ridge (signal 7; docs/plan/step-16.md). Copied in shape from
// scripts/e2e/outpost.ts.
//
// DRAFT: every limit below is a first pass with room to spare.
import fs from 'node:fs';
import path from 'node:path';
import { me, phone, pointOn, settle, standAt, tap } from '../lib/e2e-touch.ts';
import type { Kit, Phone } from '../lib/e2e-touch.ts';

/* eslint-disable @typescript-eslint/no-explicit-any */
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
const room = (ph: Phone): Promise<string> => ph.page.evaluate(() => (window as any).irreverents.drawn.room);

/** Holds the stick one way until the page draws its character in `goal`; with `hop`, taps jump every `hop` ms meanwhile. */
async function walkInto(ph: Phone, dir: number, goal: string, ms = 20000, hop = 0): Promise<boolean> {
  const p = await pointOn(ph, '[data-stick]', dir > 0 ? 0.9 : 0.1);
  if (!p) return false;
  await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...p, id: 1 }] });
  const end = Date.now() + ms;
  let ok = false;
  while (Date.now() < end) {
    if ((await room(ph)) === goal) {
      ok = true;
      break;
    }
    if (hop) {
      const jump = await pointOn(ph, '[data-action="jump"]');
      if (jump) {
        // The jump finger lands with a touchStart carrying both fingers (as scripts/e2e.ts's two-finger fact does):
        // a touchMove that adds a finger is never seen by the page as touching down (measured by the lead at 727dec7).
        await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...p, id: 1 }, { ...jump, id: 2 }] });
        await sleep(300);
        await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...p, id: 1 }] });
      }
      await sleep(Math.max(0, hop - 300));
    } else await sleep(50);
  }
  await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await settle(ph);
  return ok;
}

/** The shared control (scripts/lib/e2e-touch.ts, `tap`): E2E_TOUCH_BREAK=jump takes the jump button off the page, and every hop below must then fail. */
async function honourBreak(ph: Phone): Promise<void> {
  if (process.env.E2E_TOUCH_BREAK === 'jump') await ph.page.addStyleTag({ content: '[data-action="jump"] { display: none !important; }' });
}

/** Holds the stick east with jump tapped every 0.7 s until the page draws its character at or past `x` in this room. */
async function hopTo(ph: Phone, x: number, ms = 30000): Promise<boolean> {
  await honourBreak(ph);
  const p = await pointOn(ph, '[data-stick]', 0.9);
  const jump = await pointOn(ph, '[data-action="jump"]');
  if (!p || !jump) return false;
  const start = await room(ph);
  const end = Date.now() + ms;
  let ok = false;
  await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...p, id: 1 }] });
  while (Date.now() < end && (await room(ph)) === start) {
    if ((await me(ph)).x >= x) {
      ok = true;
      break;
    }
    await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...p, id: 1 }, { ...jump, id: 2 }] });
    await sleep(300);
    await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...p, id: 1 }] });
    await sleep(400);
  }
  await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await settle(ph);
  return ok;
}

/** From standing, the stick east and jump held together: a running jump over a gap. */
async function leap(ph: Phone): Promise<void> {
  await honourBreak(ph);
  const p = await pointOn(ph, '[data-stick]', 0.9);
  const jump = await pointOn(ph, '[data-action="jump"]');
  if (!p || !jump) return;
  await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...p, id: 1 }] });
  await sleep(80);
  await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...p, id: 1 }, { ...jump, id: 2 }] });
  await sleep(350);
  await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...p, id: 1 }] });
  await sleep(500);
  await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await settle(ph);
}

/** Screenshots the page held sideways (as it is) and then upright (390×664), into e2e-out/quarry/, for looking at (signal 7: never a grade). */
async function shots(ph: Phone, dir: string, name: string): Promise<void> {
  await ph.page.screenshot({ path: path.join(dir, `${name}-side.png`) });
  const was = ph.page.viewportSize();
  await ph.page.setViewportSize({ width: 390, height: 664 });
  await sleep(400);
  await ph.page.screenshot({ path: path.join(dir, `${name}-up.png`) });
  await ph.page.setViewportSize(was);
  await sleep(400);
}

/** A thumb slides up off the pad for a moment (the stick pushed up: the way through an enter doorway). As outpost.ts. */
async function pushUp(ph: Phone): Promise<void> {
  const r = await ph.page.evaluate(() => {
    const b = document.querySelector('[data-stick]')!.getBoundingClientRect();
    return { x: Math.round(b.left + b.width / 2), top: Math.round(b.top - 30), mid: Math.round(b.top + b.height / 2) };
  });
  await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: r.x, y: r.mid, id: 1 }] });
  await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: r.x, y: r.top, id: 1 }] });
  await sleep(80);
  await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await sleep(200);
}

export async function quarryFacts(kit: Kit): Promise<void> {
  const { fact } = kit;
  const url = `${kit.base}/?room=e2e-quarry-${Math.random().toString(36).slice(2, 10)}`;
  const ph = await phone(kit, url, 'quarry');
  try {
    const toStreet = await walkInto(ph, 1, 'castle-street');
    const toCourtyard = toStreet && (await walkInto(ph, 1, 'courtyard'));
    const c = await ph.page.evaluate(() => {
      const irr = (window as any).irreverents;
      const cy = irr.content.rooms.courtyard;
      const door = cy.doors.find((d: any) => d.id === 'to-quarry');
      return { doorX: door.tx * cy.tile, doorW: door.w * cy.tile, w: irr.content.characters[irr.drawn.me.kind].box.w };
    });
    if (toCourtyard) await standAt(ph, c.doorX + (c.doorW - c.w) / 2, 1);
    await pushUp(ph);
    let inside = false;
    try {
      await ph.page.waitForFunction(() => (window as any).irreverents.drawn.room === 'quarry-road', null, { polling: 'raf', timeout: 4000 });
      inside = true;
    } catch {
      // reported below
    }
    fact('quarry-in', inside, `by touch alone, a phone walked from the start room to the courtyard (${toCourtyard}) and up through its doorway into the quarry road (${inside}; now in ${await room(ph)})`);
    await ph.page.screenshot({ path: path.join(kit.out, 'e2e-quarry-road.png') });
    const across = inside && (await walkInto(ph, 1, 'quarry-ridge', 45000, 700));
    fact('quarry-road-cross', across, `by touch alone (stick held east, jump tapped every 0.7 s), a phone crossed the quarry road into the ridge (${across}; now in ${await room(ph)})`);
    // Signal 7, further in: the ridge, the tower and the depot by touch, with a look at each (e2e-out/quarry/, both ways up).
    const dir = path.join(kit.out, 'quarry');
    fs.mkdirSync(dir, { recursive: true });
    if (across) await shots(ph, dir, 'ridge');
    // The ridge's chasm (columns 28-29, its `//`) drops a missed jump into the pit, so the page hops up onto the step before it,
    // stands at its edge and takes one running jump, then hops on east.
    let toTower = false;
    if (across) {
      const w = await ph.page.evaluate(() => (window as any).irreverents.content.characters[(window as any).irreverents.drawn.me.kind].box.w);
      const onStep = await hopTo(ph, 22 * 16);
      if (onStep) await standAt(ph, 28 * 16 - w - 2, 1);
      if (onStep) await leap(ph);
      const over = (await room(ph)) === 'quarry-ridge' && (await me(ph)).x >= 30 * 16 - 4;
      toTower = over && (await walkInto(ph, 1, 'quarry-tower', 30000, 700));
    }
    fact('quarry-ridge-cross', toTower, `by touch alone (hops east, one running jump over the chasm, hops on), a phone crossed the ridge into the tower (${toTower}; now in ${await room(ph)})`);
    let top = false;
    if (toTower) {
      await shots(ph, dir, 'tower-foot');
      const t = await ph.page.evaluate(() => {
        const irr = (window as any).irreverents;
        const box = irr.content.characters[irr.drawn.me.kind].box;
        return { tile: irr.content.rooms['quarry-tower'].tile, w: box.w, h: box.h };
      });
      // The tower's one-way ledges overlap over columns 8-11 (its `//`): jumping on the spot there climbs them to the top floor (row 5).
      await standAt(ph, 10 * t.tile - t.w / 2, 1);
      const end = Date.now() + 40000;
      while (Date.now() < end) {
        const m = await me(ph);
        if (m.y + t.h <= 5 * t.tile + 2) {
          top = true;
          break;
        }
        await tap(ph, 'jump', 250);
        await sleep(450);
      }
      if (top) await shots(ph, dir, 'tower-top');
    }
    const toDepot = top && (await walkInto(ph, 1, 'quarry-depot', 15000));
    const post = toDepot ? await ph.page.evaluate(() => (window as any).irreverents.drawn.signalers.find((s: any) => s.id === 'depot-horn-post')?.state ?? 'not drawn') : 'not reached';
    fact('quarry-depot-in', toDepot && post !== 'not drawn', `by touch alone, a phone climbed the tower by jumps on the spot (${top}) and walked east into the depot (${toDepot}), which draws its horn post (${post})`);
    if (toDepot) {
      // DRAFT: looks only, never a fact: the depot as a first-time player walking in sees it (docs/plan/step-16.md, "Measure").
      await shots(ph, dir, 'depot-door');
      await hopTo(ph, 18 * 16, 4000);
      await shots(ph, dir, 'depot-yard');
      await hopTo(ph, 33 * 16, 6000);
      await shots(ph, dir, 'depot-strongroom');
      await sleep(6000);
      await shots(ph, dir, 'depot-later');
    }
  } finally {
    await ph.ctx.close();
  }
}
