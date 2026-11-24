// DRAFT, NOT RUN (Step 15 push 4, second builder): written, never executed. Move to scripts/e2e/forest.ts and add its call line after quarryFacts in scripts/e2e.ts:
//   await (await import('./e2e/forest.ts')).forestFacts({ browser, devices, base, out, fact, errors });
// Step 15's facts inside `npm run e2e` (one call line in scripts/e2e.ts), signal 6
// (docs/plan/step-15.md): a phone-sized page, by touch only, walks from the
// start room to the courtyard, up through its forest doorway into the forest
// road, across the road into the Bramble Trail, switches hero to the
// infiltrator there, climbs the boughs at the trail's start by jumps on the
// spot and walks east into the gap under the root mound, down into the root
// tunnel (area `root-tunnel`). Copied in shape from scripts/e2e/quarry.ts.
// - forest-in: through the courtyard's `to-forest` doorway into the road.
//   Control (watched to fail): E2E_FOREST_BREAK=door pushes up at column 14,
//   between the forest's and the quarry's doorways, where there is no door,
//   and the page stays in the courtyard.
// - forest-road-cross, forest-switch, forest-climb, forest-gap: as named.
// Shots for looking at (never a grade) go to e2e-out/forest/; the committed
// ones in docs/plan/step-15-shots/ are tools/scenario-bots/shots.mjs's.
// DRAFT: every limit below is a first pass with room to spare.
import fs from 'node:fs';
import path from 'node:path';
import { me, phone, pointOn, settle, standAt, tap } from '../lib/e2e-touch.ts'; // DRAFT: move this file to scripts/e2e/forest.ts before running it
import type { Kit, Phone } from '../lib/e2e-touch.ts';

/* eslint-disable @typescript-eslint/no-explicit-any */
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
const room = (ph: Phone): Promise<string> => ph.page.evaluate(() => (window as any).irreverents.drawn.room);
const boxOf = (ph: Phone): Promise<{ w: number; h: number; kind: string }> =>
  ph.page.evaluate(() => {
    const irr = (window as any).irreverents;
    const b = irr.content.characters[irr.drawn.me.kind].box;
    return { w: b.w, h: b.h, kind: irr.drawn.me.kind };
  });

/** Holds the stick one way until `done` says so (or `ms` pass); with `hop`, taps jump every `hop` ms meanwhile. As quarry.ts's walkInto. */
async function holdUntil(ph: Phone, dir: number, done: () => Promise<boolean>, ms = 20000, hop = 0): Promise<boolean> {
  const p = await pointOn(ph, '[data-stick]', dir > 0 ? 0.9 : 0.1);
  if (!p) return false;
  await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...p, id: 1 }] });
  const end = Date.now() + ms;
  let ok = false;
  while (Date.now() < end) {
    if (await done()) {
      ok = true;
      break;
    }
    if (hop) {
      const jump = await pointOn(ph, '[data-action="jump"]');
      if (jump) {
        // The jump finger lands with a touchStart carrying both fingers (quarry.ts: a touchMove that adds a finger is never seen as touching down).
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

/** A thumb slides up off the pad for a moment (the stick pushed up: the way through an enter doorway). As quarry.ts. */
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

/** Screenshots sideways as the page is, then 750x340 and upright 390x664, into `dir`, for looking at. */
async function shots(ph: Phone, dir: string, name: string): Promise<void> {
  const was = ph.page.viewportSize();
  await ph.page.screenshot({ path: path.join(dir, `${name}-${was.width}x${was.height}.png`) });
  for (const [w, h] of [[750, 340], [390, 664]]) {
    await ph.page.setViewportSize({ width: w, height: h });
    await sleep(400);
    await ph.page.screenshot({ path: path.join(dir, `${name}-${w}x${h}.png`) });
  }
  await ph.page.setViewportSize(was);
  await sleep(400);
}

export async function forestFacts(kit: Kit): Promise<void> {
  const { fact } = kit;
  const dir = path.join(kit.out, 'forest');
  fs.mkdirSync(dir, { recursive: true });
  const url = `${kit.base}/?room=e2e-forest-${Math.random().toString(36).slice(2, 10)}`;
  const ph = await phone(kit, url, 'forest');
  try {
    const toStreet = await holdUntil(ph, 1, async () => (await room(ph)) === 'castle-street');
    const toCourtyard = toStreet && (await holdUntil(ph, 1, async () => (await room(ph)) === 'courtyard'));
    const c = await ph.page.evaluate(() => {
      const irr = (window as any).irreverents;
      const cy = irr.content.rooms.courtyard;
      const door = cy.doors.find((d: any) => d.id === 'to-forest');
      return { doorX: door ? door.tx * cy.tile : -1, doorW: door ? door.w * cy.tile : 0, tile: cy.tile, w: irr.content.characters[irr.drawn.me.kind].box.w };
    });
    // INTENT: the control stands where no door is (column 14, between the forest's doorway at 8-10 and the quarry's at 17-19).
    const at = process.env.E2E_FOREST_BREAK === 'door' ? 14 * c.tile + (c.tile - c.w) / 2 : c.doorX + (c.doorW - c.w) / 2;
    if (toCourtyard && c.doorX >= 0) await standAt(ph, at, 1);
    await pushUp(ph);
    const inside = await ph.page.waitForFunction(() => (window as any).irreverents.drawn.room === 'forest-road', null, { polling: 'raf', timeout: 4000 }).then(
      () => true,
      () => false,
    );
    fact('forest-in', inside, `by touch alone, a phone walked from the start room to the courtyard (${toCourtyard}) and up through its forest doorway (columns ${c.doorX / c.tile}-${(c.doorX + c.doorW) / c.tile - 1}) into the forest road (${inside}; now in ${await room(ph)})`);
    if (!inside) return;
    await sleep(600);
    await shots(ph, dir, 'road');
    const across = await holdUntil(ph, 1, async () => (await room(ph)) === 'forest-trail', 30000, 700);
    fact('forest-road-cross', across, `by touch alone (stick held east, jump tapped every 0.7 s), a phone crossed the forest road into the Bramble Trail (${across}; now in ${await room(ph)})`);
    if (!across) return;
    await sleep(600);
    await shots(ph, dir, 'trail-start');
    // Switch: tap Switch until the page plays the infiltrator (the one who fits the gap). At most the party's size of taps.
    const k0 = (await boxOf(ph)).kind;
    for (let i = 0; i < 5 && (await boxOf(ph)).kind !== 'infiltrator'; i++) {
      await tap(ph, 'switch');
      await sleep(700);
    }
    const b = await boxOf(ph);
    fact('forest-switch', b.kind === 'infiltrator', `on the trail a tap of Switch changed the page's hero from ${k0} to ${b.kind} (expected the infiltrator)`);
    if (b.kind !== 'infiltrator') return;
    // The climb (content/rooms/forest-trail.json `//`): one-way boughs two tiles apart over columns 10-13, jumped up on the spot, to the trail on row 9.
    const T = 16;
    await standAt(ph, 11.5 * T - b.w / 2, 1);
    let up = false;
    const end = Date.now() + 40000;
    while (Date.now() < end) {
      const m = await me(ph);
      if (m.y + b.h <= 9 * T + 2) {
        up = true;
        break;
      }
      await tap(ph, 'jump', 250);
      await sleep(450);
    }
    fact('forest-climb', up, `by jumps on the spot (touch), the infiltrator climbed the boughs at the trail's start to the trail (feet at ${((await me(ph)).y + b.h).toFixed(0)}, the trail's floor at ${9 * T})`);
    if (!up) return;
    await sleep(400);
    await shots(ph, dir, 'trail-gap');
    // The gap: the stick east, no jump: the crawl under the root mound (row 8, columns 24-29) is one tile high and the infiltrator fits; it drops into the root tunnel (rows 10-12).
    const inTunnel = async (): Promise<boolean> => {
      const m = await me(ph);
      return (await room(ph)) === 'forest-trail' && m.y + b.h > 10 * T && m.x >= 24 * T && m.x <= 39 * T;
    };
    const gap = await holdUntil(ph, 1, inTunnel, 20000);
    const m = await me(ph);
    fact('forest-gap', gap, `by touch alone (stick held east, no jump) the infiltrator walked into the gap under the root mound and down into the root tunnel (${gap}; at ${m.x.toFixed(0)},${(m.y + b.h).toFixed(0)})`);
    if (gap) {
      await sleep(600);
      await shots(ph, dir, 'root-tunnel');
    }
  } finally {
    await ph.ctx.close();
  }
}
