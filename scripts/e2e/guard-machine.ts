// Step 20, the guards' trike on the courtyard's run (handoff brief
// guard-vehicle-courtyard, push 1): its facts inside `npm run e2e` (one call
// line in scripts/e2e.ts). A phone-sized page, by touch only, in a private
// world, walks from the start room through the castle street into the
// courtyard, where the town guards' patrol trike stands empty near the run's
// west end (columns 5-6). In the street the Use button does not read Get in; beside the
// trike it reads "Get in" (`data-state="get-in"`); a tap makes the page's
// own character the trike, the page draws the hero they went in as on its
// saddle (the trike's cells show nobody aboard: the debug record's `rider`),
// the stick moves it east; a tap of Jump puts the hero back on its feet
// beside it. docs/mechanisms/machines.md, "On the courtyard's run".
//
// Control: E2E_TOUCH_BREAK=interact takes the Use button off the page and
// guard-machine-drive must fail; the street's word (not get-in) is the
// get-in fact's own control.
// DRAFT: every limit below is a first pass with room to spare.
import path from 'node:path';
import { me, phone, pointOn, settle, standAt, tap } from '../lib/e2e-touch.ts';
import type { Kit, Phone } from '../lib/e2e-touch.ts';
import { walkInto } from './outpost.ts';

/* eslint-disable @typescript-eslint/no-explicit-any */
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

const useState = (ph: Phone): Promise<string> => ph.page.evaluate(() => document.querySelector<HTMLElement>('#actions [data-action="interact"]')?.dataset.state ?? '');

export async function guardMachineFacts(kit: Kit): Promise<void> {
  const { fact } = kit;
  const url = `${kit.base}/?room=e2e-guard-machine-${Math.random().toString(36).slice(2, 10)}`;
  const ph = await phone(kit, url, 'guard-machine');
  try {
    const toStreet = await walkInto(ph, 1, 'castle-street');
    const street = await useState(ph);
    const toCourtyard = toStreet && (await walkInto(ph, 1, 'courtyard'));
    const c = await ph.page.evaluate(() => {
      const irr = (window as any).irreverents;
      const k = irr.content;
      const trike = (irr.drawn.entities as any[]).find((e) => e.kind === 'guard-trike' && e.player === null);
      return { tile: k.rooms.courtyard.tile, hero: irr.drawn.me.kind, trikeX: trike ? trike.x : null, trikeW: k.characters['guard-trike'].box.w };
    });
    // Just west of the trike (it stands at columns 5-6), facing east, the way it will be driven.
    if (toCourtyard && c.trikeX !== null) await standAt(ph, c.trikeX - 14, 1);
    await settle(ph);
    const word = await useState(ph);
    const at = await me(ph);
    fact('guard-machine-get-in', toCourtyard && street !== 'get-in' && word === 'get-in', `by touch, a phone walked into the courtyard (${toCourtyard}); in the street the Use button said "${street}" (not get-in), beside the empty trike it says "${word}" (expected get-in), the ${c.hero} at x ${Math.round(at?.x ?? -1)}, the trike at ${c.trikeX === null ? 'nowhere' : Math.round(c.trikeX)}`);
    await ph.page.screenshot({ path: path.join(kit.out, 'e2e-guard-machine-parked.png') });

    await tap(ph, 'interact');
    let riding = false;
    try {
      await ph.page.waitForFunction(() => (window as any).irreverents.drawn.me.kind === 'guard-trike', null, { polling: 'raf', timeout: 4000 });
      riding = true;
    } catch {
      // reported below
    }
    await sleep(200);
    const drawnRider = await ph.page.evaluate(() => (window as any).irreverents.drawn.me?.rider ?? null);
    const x0 = (await me(ph))?.x ?? 0;
    const p = await pointOn(ph, '[data-stick]', 0.9);
    if (riding && p) {
      await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...p, id: 1 }] });
      // 0.6 s: well short of the roadblock's far side. Held longer, the crates it flings can land on
      // both plates, open the gate, and the trike leave by the gallery's walk door (measured), so its
      // x would be read in another room.
      await sleep(400);
      await ph.page.screenshot({ path: path.join(kit.out, 'e2e-guard-machine-riding.png') });
      await sleep(200);
    }
    const x1 = (await me(ph))?.x ?? 0;
    if (riding && p) await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    fact('guard-machine-drive', riding && drawnRider === c.hero && x1 - x0 > 3 * c.tile, `by touch, a tap of Use beside the trike made the page's own character the trike (${riding}), the page drew ${drawnRider === null ? 'nobody' : `the ${drawnRider}`} on its saddle (expected the ${c.hero}), and the stick held east for 0.6 s moved it ${Math.round(x1 - x0)} px (expected more than ${3 * c.tile})`);

    await tap(ph, 'jump');
    let out = false;
    try {
      await ph.page.waitForFunction((h: string) => (window as any).irreverents.drawn.me.kind === h, c.hero, { polling: 'raf', timeout: 4000 });
      out = true;
    } catch {
      // reported below
    }
    // Read as soon as the page draws the trike standing again (it arrives with the server's next
    // snapshot, a moment after the hero is out): the hero is put out beside it, and the empty trike
    // then rolls on a little (it slows at its `coast`).
    try {
      await ph.page.waitForFunction(() => ((window as any).irreverents.drawn.entities as any[]).some((e) => e.player === null && e.kind === 'guard-trike'), null, { polling: 'raf', timeout: 2000 });
    } catch {
      // reported below
    }
    const near = await ph.page.evaluate(() => {
      const irr = (window as any).irreverents;
      const m = irr.drawn.me;
      const trike = (irr.drawn.entities as any[]).find((e) => e.player === null && e.kind === 'guard-trike');
      return trike ? Math.abs(trike.x - m.x) : null;
    });
    await settle(ph);
    await ph.page.screenshot({ path: path.join(kit.out, 'e2e-guard-machine-out.png') });
    fact('guard-machine-out', out && near !== null && near < 8 * c.tile, `by touch, a tap of Jump put the ${c.hero} back on its feet (${out}), the trike drawn standing ${near === null ? 'nowhere' : `${Math.round(near)} px from it`} (expected beside it, under ${8 * c.tile})`);
  } finally {
    await ph.ctx.close();
  }
}
