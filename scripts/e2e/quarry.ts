// Step 16's facts inside `npm run e2e` (one call line in scripts/e2e.ts):
// a phone-sized page, by touch only, walks from the start room to the
// courtyard and up through its doorway into the quarry road (signal 7,
// its first half; docs/plan/step-16.md). Crossing the road by touch is
// not proven yet (see the DRAFT below). Copied in shape from
// scripts/e2e/outpost.ts.
//
// DRAFT: every limit below is a first pass with room to spare.
import path from 'node:path';
import { phone, pointOn, settle, standAt } from '../lib/e2e-touch.ts';
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
        await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ ...p, id: 1 }, { ...jump, id: 2 }] });
        await sleep(300);
        await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ ...p, id: 1 }] });
      }
      await sleep(Math.max(0, hop - 300));
    } else await sleep(50);
  }
  await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await settle(ph);
  return ok;
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
    // DRAFT: the second half, across the road by touch (stick held east, jump tapped every 0.6 s), stopped at the
    // first two-tile step (x 174) in its one run on 2026-11-23 and is left for the next session (docs/plan/step-16.md, handoff notes).
  } finally {
    await ph.ctx.close();
  }
}
