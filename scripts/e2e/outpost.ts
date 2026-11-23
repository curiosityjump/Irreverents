// Step 12's facts inside `npm run e2e` (one call line in scripts/e2e.ts):
// a phone-sized page, by touch only, walks from the start room to the
// courtyard, up through its doorway into the outpost, and breaks the horn
// post with the attack button; the page's own record of what it drew
// (`drawn.signalers`) shows the post working first and broken after.
// Step 7: on the way, standing in the lookout's view, the horn is drawn
// sounding and a wave walks in (more of the camp's people drawn after).
// docs/mechanisms/outposts.md.
//
// DRAFT: every limit below is a first pass with room to spare.
import path from 'node:path';
import { me, phone, pointOn, settle, standAt, steer, tap } from '../lib/e2e-touch.ts';
import type { Kit, Phone } from '../lib/e2e-touch.ts';

/* eslint-disable @typescript-eslint/no-explicit-any */
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

const room = (ph: Phone): Promise<string> => ph.page.evaluate(() => (window as any).irreverents.drawn.room);
const signalers = (ph: Phone): Promise<{ id: string; state: string }[]> => ph.page.evaluate(() => (window as any).irreverents.drawn.signalers ?? []);

/** Holds the stick one way until the page draws its character in `goal` (or the time runs out). */
export async function walkInto(ph: Phone, dir: number, goal: string, ms = 20000): Promise<boolean> {
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

/** A thumb slides up off the pad for a moment (the stick pushed up: the way through an enter doorway, src/client/touch.ts). */
export async function pushUp(ph: Phone): Promise<void> {
  const r = await ph.page.evaluate(() => {
    const b = document.querySelector('[data-stick]')!.getBoundingClientRect();
    return { x: Math.round(b.left + b.width / 2), top: Math.round(b.top - 30), mid: Math.round(b.top + b.height / 2) };
  });
  await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: r.x, y: r.mid, id: 1 }] });
  // At once: the pad also steers (its left or right half), so a long press would walk off the doorway.
  await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: r.x, y: r.top, id: 1 }] });
  await sleep(80);
  await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await sleep(200);
}

export async function outpostFacts(kit: Kit): Promise<void> {
  const { fact } = kit;
  const url = `${kit.base}/?room=e2e-outpost-${Math.random().toString(36).slice(2, 10)}`;
  const ph = await phone(kit, url, 'outpost');
  try {
    // Start room -> castle street -> courtyard, by the stick alone.
    const toStreet = await walkInto(ph, 1, 'castle-street');
    const toCourtyard = toStreet && (await walkInto(ph, 1, 'courtyard'));
    const content = await ph.page.evaluate(() => {
      const c = (window as any).irreverents.content;
      const door = c.rooms.courtyard.doors.find((d: any) => d.id === 'to-outpost');
      const op = Object.values(c.outposts).find((o: any) => o.room === 'outpost') as any;
      const post = c.placements.outpost.place.find((p: any) => p.id === op.signaler);
      const tile = c.rooms.outpost.tile;
      const box = (k: string): any => c.characters[k].box;
      return { doorX: door.tx * c.rooms.courtyard.tile, tile, post: op.signaler, postX: post.tile[0] * tile + (tile - box(post.character).w) / 2, postW: box(post.character).w };
    });
    const w = (await ph.page.evaluate(() => {
      const irr = (window as any).irreverents;
      return irr.content.characters[irr.drawn.me.kind].box.w;
    })) as number;
    if (toCourtyard) await standAt(ph, content.doorX + (content.tile - w) / 2 - 4, 1);
    const before = await me(ph);
    const whereBefore = await room(ph);
    await pushUp(ph);
    let inside = false;
    try {
      await ph.page.waitForFunction(() => (window as any).irreverents.drawn.room === 'outpost', null, { polling: 'raf', timeout: 4000 });
      inside = true;
    } catch {
      // reported below
    }
    const first = (await signalers(ph)).find((s) => s.id === content.post)?.state ?? 'not drawn';
    fact('outpost-in', inside && first === 'working', `by touch alone, a phone walked from the start room to the courtyard (${toCourtyard}) and up through its doorway into the outpost (${inside}; pushed up at x ${Math.round(before?.x ?? -1)} in ${whereBefore}, the doorway at x ${content.doorX}); the horn post is drawn ${first} (expected working)`);
    await ph.page.screenshot({ path: path.join(kit.out, 'e2e-outpost-in.png') });

    // Over the step (jump while walking east), down into the camp, and at the post: swing until it breaks.
    // Every state the page draws the post in is recorded, frame by frame.
    await ph.page.evaluate((id: string) => {
      const irr = (window as any).irreverents;
      irr.e2eSeen = [];
      const tick = (): void => {
        const s = (irr.drawn.signalers ?? []).find((x: any) => x.id === id)?.state;
        if (s && irr.e2eSeen[irr.e2eSeen.length - 1] !== s) irr.e2eSeen.push(s);
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, content.post);
    const stick = await pointOn(ph, '[data-stick]', 0.9);
    if (stick) {
      await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...stick, id: 1 }] });
      await sleep(250);
      for (let i = 0; i < 3; i++) {
        const jump = await pointOn(ph, '[data-action="jump"]');
        if (jump) {
          await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ ...stick, id: 1 }, { ...jump, id: 2 }] });
          await sleep(250);
          await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ ...stick, id: 1 }] });
        }
        await sleep(300);
      }
      try {
        // Step 7: stop first in the lookout's view, six tiles short of the post.
        await ph.page.waitForFunction((x: number) => (window as any).irreverents.drawn.me.x >= x, content.postX - 6 * content.tile, { polling: 'raf', timeout: 6000 });
      } catch {
        // reported below
      }
      await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    }
    // Step 7 (docs/plan/step-7.md, push 1): no fight to win. Stand in the lookout's view: the page
    // draws the horn's bar filling (the post "sounding"), and afterwards more people in the room
    // than before (a wave walked in). Control: the count read before the call, not after.
    await settle(ph);
    const people = (): Promise<number> => ph.page.evaluate(() => ((window as any).irreverents.drawn.entities as any[]).filter((e) => e.player === null && ['outpost-lookout', 'outpost-fighter', 'heavy-fighter'].includes(e.kind)).length);
    const peopleBefore = await people();
    let sounded = false;
    let peopleAfter = peopleBefore;
    for (let i = 0; i < 100 && peopleAfter <= peopleBefore; i++) {
      await sleep(250);
      sounded ||= ((await ph.page.evaluate(() => (window as any).irreverents.e2eSeen)) as string[]).includes('sounding');
      if (sounded) peopleAfter = await people();
    }
    await ph.page.screenshot({ path: path.join(kit.out, 'e2e-outpost-wave.png') });
    fact('outpost-wave', sounded && peopleAfter > peopleBefore, `by touch, standing in the lookout's view (at x ${Math.round((await me(ph))?.x ?? -1)}): the page drew the horn sounding (${sounded}) and then ${peopleAfter} of the camp's people, ${peopleBefore} before the call (expected more after)`);
    let state = 'working';
    for (let i = 0; i < 12 && state !== 'broken'; i++) {
      await standAt(ph, content.postX - w - 2, 1);
      await tap(ph, 'attack');
      await sleep(450);
      state = (await signalers(ph)).find((s) => s.id === content.post)?.state ?? 'not drawn';
    }
    const seen = (await ph.page.evaluate(() => (window as any).irreverents.e2eSeen)) as string[];
    const at = (await me(ph))?.x;
    await ph.page.screenshot({ path: path.join(kit.out, 'e2e-outpost-broken.png') });
    fact('outpost-break', state === 'broken' && seen[seen.length - 1] === 'broken', `by touch, the phone's character (at x ${Math.round(at ?? -1)}) swung at the horn post until it broke: the page drew it ${seen.join(' -> ') || '(nothing)'} (working, maybe sounding, then broken)`);
  } finally {
    await ph.ctx.close();
  }
}
