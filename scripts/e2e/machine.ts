// Step 20 builder B push 2's facts inside `npm run e2e` (one call line in
// scripts/e2e.ts): a phone-sized page, by touch only and with no fight to
// win, walks from the start room to the courtyard, goes in at the Bandit
// Camp's doorway by Use, and climbs onto the camp's entry step, where the
// ram wagon stands empty. Beside it the Use button reads "Get in"
// (`data-state="get-in"`); a tap of it makes the page's own character the
// wagon; the stick moves it; a tap of Jump puts the hero back on its feet
// beside it. docs/mechanisms/machines.md, "In the Bandit Camp".
//
// Control: the Use button's word read in the doorway, before the step,
// is not "get-in" (machine-get-in fails if it were); E2E_TOUCH_BREAK=interact
// takes the Use button off the page and machine-in must fail.
// DRAFT: every limit below is a first pass with room to spare.
import path from 'node:path';
import { me, phone, pointOn, settle, standAt, tap } from '../lib/e2e-touch.ts';
import type { Kit, Phone } from '../lib/e2e-touch.ts';
import { walkInto } from './outpost.ts';

/* eslint-disable @typescript-eslint/no-explicit-any */
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

const useState = (ph: Phone): Promise<string> => ph.page.evaluate(() => document.querySelector<HTMLElement>('#actions [data-action="interact"]')?.dataset.state ?? '');

export async function machineFacts(kit: Kit): Promise<void> {
  const { fact } = kit;
  const url = `${kit.base}/?room=e2e-machine-${Math.random().toString(36).slice(2, 10)}`;
  const ph = await phone(kit, url, 'machine');
  try {
    const toStreet = await walkInto(ph, 1, 'castle-street');
    const toCourtyard = toStreet && (await walkInto(ph, 1, 'courtyard'));
    const c = await ph.page.evaluate(() => {
      const irr = (window as any).irreverents;
      const k = irr.content;
      const door = k.rooms.courtyard.doors.find((d: any) => d.id === 'to-outpost');
      return { doorX: door.tx * k.rooms.courtyard.tile, tile: k.rooms.courtyard.tile, w: k.characters[irr.drawn.me.kind].box.w, hero: irr.drawn.me.kind };
    });
    if (toCourtyard) await standAt(ph, c.doorX + (c.tile - c.w) / 2, 1);
    await sleep(150);
    await tap(ph, 'interact');
    let inside = false;
    try {
      await ph.page.waitForFunction(() => (window as any).irreverents.drawn.room === 'outpost', null, { polling: 'raf', timeout: 4000 });
      inside = true;
    } catch {
      // reported below
    }
    await settle(ph);
    // The control: in the camp's doorway, before the step, the Use button does not say Get in.
    const before = await useState(ph);
    // Onto the step: the stick held east, Jump tapped twice (the half-height stair, then the step), until the Use button says Get in.
    const stick = await pointOn(ph, '[data-stick]', 0.75);
    let word = before;
    if (inside && stick) {
      await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...stick, id: 1 }] });
      const t0 = Date.now();
      let jumps = 0;
      while (Date.now() - t0 < 5000) {
        word = await useState(ph);
        if (word === 'get-in') break;
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
      word = await useState(ph);
    }
    const at = await me(ph);
    fact('machine-get-in', inside && before !== 'get-in' && word === 'get-in', `by touch, a phone went into the Bandit Camp (${inside}); in its doorway the Use button said "${before}" (not get-in), on the entry step beside the empty wagon it says "${word}" (expected get-in), the ${c.hero} at x ${Math.round(at?.x ?? -1)}, y ${Math.round(at?.y ?? -1)}`);
    await ph.page.screenshot({ path: path.join(kit.out, 'e2e-machine-step.png') });

    await tap(ph, 'interact');
    let riding = false;
    try {
      await ph.page.waitForFunction(() => (window as any).irreverents.drawn.me.kind === 'ram-wagon', null, { polling: 'raf', timeout: 4000 });
      riding = true;
    } catch {
      // reported below
    }
    const x0 = (await me(ph))?.x ?? 0;
    const p = await pointOn(ph, '[data-stick]', 0.9);
    if (riding && p) {
      await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...p, id: 1 }] });
      await sleep(1500);
      await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    }
    const x1 = (await me(ph))?.x ?? 0;
    await ph.page.screenshot({ path: path.join(kit.out, 'e2e-machine-driving.png') });
    fact('machine-in', riding && x1 - x0 > 3 * c.tile, `by touch, a tap of Use beside the wagon made the page's own character the wagon (${riding}), and the stick held east for 1.5 s moved it ${Math.round(x1 - x0)} px (expected more than ${3 * c.tile})`);

    await tap(ph, 'jump');
    let out = false;
    try {
      await ph.page.waitForFunction((h: string) => (window as any).irreverents.drawn.me.kind === h, c.hero, { polling: 'raf', timeout: 4000 });
      out = true;
    } catch {
      // reported below
    }
    await settle(ph);
    const near = await ph.page.evaluate(() => {
      const irr = (window as any).irreverents;
      const m = irr.drawn.me;
      const wagon = (irr.drawn.entities as any[]).find((e) => e.player === null && e.kind === 'ram-wagon');
      return wagon ? Math.abs(wagon.x - m.x) : null;
    });
    await ph.page.screenshot({ path: path.join(kit.out, 'e2e-machine-out.png') });
    fact('machine-out', out && near !== null && near < 6 * c.tile, `by touch, a tap of Jump put the ${c.hero} back on its feet (${out}), the wagon drawn standing ${near === null ? 'nowhere' : `${Math.round(near)} px from it`} (expected beside it, under ${6 * c.tile})`);
  } finally {
    await ph.ctx.close();
  }
}
