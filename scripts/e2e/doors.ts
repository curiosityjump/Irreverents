// Doorways by Use, inside `npm run e2e` (one call line in scripts/e2e.ts):
// a phone-sized page, by touch only, walks from the start room to the
// courtyard and stands in the outpost's doorway; the Use button then reads
// "Go in" (`data-state="go-in"`, read from the page), and a tap of it, with
// no slide of the thumb, carries the character into the camp. The owner,
// 2026-11-23: "There is no stick to push up..." (docs/mechanisms/rooms-and-doors.md,
// "The two kinds of door"). Screenshots, sideways and upright, standing in
// the doorway, go to docs/plan/step-5-shots/doors/.
//
// Control: E2E_TOUCH_BREAK=interact takes the Use button off the page, and
// door-use must fail.
// DRAFT: every limit below is a first pass with room to spare.
import fs from 'node:fs';
import path from 'node:path';
import { phone, pointOn, settle, standAt, tap } from '../lib/e2e-touch.ts';
import type { Kit, Phone } from '../lib/e2e-touch.ts';

/* eslint-disable @typescript-eslint/no-explicit-any */
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/** Holds the stick one way until the page draws its character in `goal` (or the time runs out). */
async function walkInto(ph: Phone, dir: number, goal: string, ms = 20000): Promise<boolean> {
  const p = await pointOn(ph, '[data-stick]', dir > 0 ? 0.9 : 0.1);
  if (!p) return false;
  await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...p, id: 1 }] });
  let ok = true;
  try {
    await ph.page.waitForFunction((g: string) => (window as any).irreverents.drawn.room === g, goal, { polling: 'raf', timeout: ms });
  } catch {
    ok = false;
  }
  await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await settle(ph);
  return ok;
}

const useState = (ph: Phone): Promise<string> => ph.page.evaluate(() => document.querySelector<HTMLElement>('#actions [data-action="interact"]')?.dataset.state ?? '');

export async function doorFacts(kit: Kit & { shots: string }): Promise<void> {
  const { fact } = kit;
  const url = `${kit.base}/?room=e2e-doors-${Math.random().toString(36).slice(2, 10)}`;
  const ph = await phone(kit, url, 'doors');
  try {
    const toStreet = await walkInto(ph, 1, 'castle-street');
    const toCourtyard = toStreet && (await walkInto(ph, 1, 'courtyard'));
    const away = await useState(ph);
    const { doorX, tile, w } = await ph.page.evaluate(() => {
      const irr = (window as any).irreverents;
      const c = irr.content;
      const door = c.rooms.courtyard.doors.find((d: any) => d.id === 'to-outpost');
      return { doorX: door.tx * c.rooms.courtyard.tile, tile: c.rooms.courtyard.tile, w: c.characters[irr.drawn.me.kind].box.w };
    });
    if (toCourtyard) await standAt(ph, doorX + (tile - w) / 2, 1);
    await sleep(150);
    const inDoor = await useState(ph);
    fact('door-go-in', toCourtyard && away === '' && inDoor === 'go-in', `by touch, a phone walked to the courtyard (${toCourtyard}); away from a doorway the Use button's state was "${away}" (expected none), standing in the outpost's doorway it is "${inDoor}" (expected go-in)`);

    // The pictures, standing in the doorway: sideways, then upright (iPhone size), then sideways again.
    fs.mkdirSync(kit.shots, { recursive: true });
    await ph.page.setViewportSize({ width: 844, height: 390 });
    await sleep(400);
    await ph.page.screenshot({ path: path.join(kit.shots, 'doorway-sideways.png') });
    await ph.page.setViewportSize({ width: 390, height: 664 });
    await sleep(400);
    await ph.page.screenshot({ path: path.join(kit.shots, 'doorway-upright.png') });
    await ph.page.setViewportSize({ width: 844, height: 390 });
    await sleep(400);

    const before = await ph.page.evaluate(() => (window as any).irreverents.drawn.room);
    const tapped = await tap(ph, 'interact');
    let inside = false;
    try {
      await ph.page.waitForFunction(() => (window as any).irreverents.drawn.room === 'outpost', null, { polling: 'raf', timeout: 4000 });
      inside = true;
    } catch {
      // reported below
    }
    await sleep(300);
    // In the camp the character stands in its doorway back, so Use says "Go in" there too.
    const after = await useState(ph);
    fact('door-use', inside && tapped, `standing in the courtyard's outpost doorway (in ${before}), one tap of the Use button (${tapped ? 'tapped' : 'NOT on the page'}), no slide of the thumb, carried the phone's character into the camp (${inside}); the Use button there reads "${after}"`);
  } finally {
    await ph.ctx.close();
  }
}
