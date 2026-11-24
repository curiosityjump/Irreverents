// The owner's report, 2026-11-24 ("Alarms don't seem to do anything yet ...
// enemies don't give chase if you are not right in front of them"), inside
// `npm run e2e` (one call line in scripts/e2e.ts): a phone-sized page, by
// touch only, in the Bandit Camp.
// - chase-comes / chase-goes-back: walking up to camp fighter 1, he comes for
//   the hero; once the hero is out of his sight (walked out of the camp by its doorway, and
//   back in), he has searched and walked back to his post.
// - alarm-reads: the walk crossed the lookout's view, and the page announces
//   the horn and the wave it brings on the banner queue (draw/alarm-banner.ts).
// docs/plan/step-4.md, "Alarms and the chase, as played".
// DRAFT: every limit below is a first pass with room to spare.
import path from 'node:path';
import { me, phone, pointOn, settle, standAt } from '../lib/e2e-touch.ts';
import type { Kit, Phone } from '../lib/e2e-touch.ts';
import { pushUp, walkInto } from './outpost.ts';

/* eslint-disable @typescript-eslint/no-explicit-any */
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
const T = 16;
const drawnX = (ph: Phone, id: string): Promise<number | null> => ph.page.evaluate((i: string) => (window as any).irreverents.drawn.entities.find((e: any) => e.id === i)?.x ?? null, id);

/** The stick held one way with the jump button tapped every half second, until `done` or the time runs out. */
async function hopUntil(ph: Phone, dir: number, done: () => Promise<boolean>, ms = 8000): Promise<boolean> {
  const st = await pointOn(ph, '[data-stick]', dir > 0 ? 0.9 : 0.1);
  const jp = await pointOn(ph, '[data-action="jump"]');
  if (!st || !jp) return false;
  const end = Date.now() + ms;
  let ok = false;
  let down = false;
  while (Date.now() < end) {
    if (await done()) {
      ok = true;
      break;
    }
    await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...st, id: 1 }, { ...jp, id: 2 }] });
    down = true;
    await sleep(220);
    await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...st, id: 1 }] });
    await sleep(220);
  }
  if (down) await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await settle(ph);
  return ok;
}

export async function chaseFacts(kit: Kit): Promise<void> {
  const { fact } = kit;
  const ph = await phone(kit, `${kit.base}/?room=e2e-chase-${Math.random().toString(36).slice(2, 10)}`, 'chase');
  try {
    const inCamp = (await walkInto(ph, 1, 'castle-street')) && (await walkInto(ph, 1, 'courtyard'));
    const doorX = await ph.page.evaluate(() => {
      const c = (window as any).irreverents.content;
      return c.rooms.courtyard.doors.find((d: any) => d.id === 'to-outpost').tx * c.rooms.courtyard.tile;
    });
    for (let i = 0; inCamp && i < 3 && (await ph.page.evaluate(() => (window as any).irreverents.drawn.room)) !== 'outpost'; i++) {
      const w = (await ph.page.evaluate(() => { const irr = (window as any).irreverents; return irr.content.characters[irr.drawn.me.kind].box.w; })) as number;
      await standAt(ph, doorX + (T - w) / 2 - 4, 1);
      await pushUp(ph);
      await sleep(1000);
    }
    // Over the step by the doorway (columns 5-7) and down the far side.
    await hopUntil(ph, 1, async () => (await me(ph)).x > 9 * T);
    // The chase: walk east until camp fighter 1 (placed at column 25) is drawn coming west, at most to column 21.
    const post = 25 * T + 2;
    const st = await pointOn(ph, '[data-stick]', 0.75);
    let came = false;
    if (st) {
      await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...st, id: 1 }] });
      let held = true;
      // He watches west 8 s, then east 3 s: wait for him there, standing, for up to 12 s.
      for (let i = 0; i < 160 && !came; i++) {
        await sleep(100);
        const fx = await drawnX(ph, 'camp-fighter-1');
        came = fx !== null && fx < post - T;
        if (held && (await me(ph)).x > 19 * T) {
          await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
          held = false;
        }
      }
      if (held) await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    }
    const cameTo = await drawnX(ph, 'camp-fighter-1');
    await ph.page.screenshot({ path: path.join(kit.out, 'e2e-chase-comes.png') });
    fact('chase-comes', came, `by touch, walking up to camp fighter 1 (post x ${post}), the page drew him coming for the hero: at x ${Math.round(cameTo ?? -1)} (expected west of ${post - T}), the hero at x ${Math.round((await me(ph)).x)}`);

    // Out of sight: the hero walks back west over the step and out by the camp's doorway into the
    // courtyard, then walks back in. Every fighter who saw the hero has lost them; fighter 1 searched
    // and walked back to his post (before this change he stood where he last saw them for ever).
    // Step 21, hearts (2026-11-24, the orchestrator's go): the camp no longer throws a beaten hero out,
    // so the hero leaves on its own feet; a game over is never the way out here (it ends every alert).
    const roomNow = (): Promise<string> => ph.page.evaluate(() => (window as any).irreverents.drawn.room);
    let lowest = cameTo ?? Infinity;
    const campDoorX = (await ph.page.evaluate(() => {
      const c = (window as any).irreverents.content;
      return c.rooms.outpost.doors.find((d: any) => d.id === 'to-courtyard').tx * c.rooms.outpost.tile;
    })) as number;
    const watch = setInterval(() => {
      drawnX(ph, 'camp-fighter-1').then((x) => {
        if (x !== null) lowest = Math.min(lowest, x);
      }, () => undefined);
    }, 250);
    const tries: string[] = [];
    for (let i = 0; i < 20 && (await roomNow()) === 'outpost'; i++) {
      // West over the block by the doorway (columns 5-7) and on into the doorway's own column (2), then up.
      await hopUntil(ph, -1, async () => (await me(ph)).x < campDoorX + T / 2 && (await me(ph)).y > 8 * T, 4000);
      tries.push(String(Math.round((await me(ph)).x / T)));
      if ((await me(ph)).x < campDoorX + T) await pushUp(ph);
      else continue;
      if ((await roomNow()) === 'outpost') {
        const w = (await ph.page.evaluate(() => { const irr = (window as any).irreverents; return irr.content.characters[irr.drawn.me.kind].box.w; })) as number;
        await standAt(ph, campDoorX + (T - w) / 2, -1);
        await pushUp(ph);
      }
      await sleep(500);
    }
    clearInterval(watch);
    tries.push(`then in ${await roomNow()}`);
    const out = (await roomNow()) === 'courtyard';
    await sleep(6000);
    for (let i = 0; i < 3 && (await roomNow()) !== 'outpost'; i++) {
      const w = (await ph.page.evaluate(() => { const irr = (window as any).irreverents; return irr.content.characters[irr.drawn.me.kind].box.w; })) as number;
      await standAt(ph, doorX + (T - w) / 2 - 4, 1);
      await pushUp(ph);
      await sleep(1000);
    }
    let back = false;
    let fx: number | null = null;
    for (let i = 0; i < 40 && !back; i++) {
      await sleep(250);
      fx = await drawnX(ph, 'camp-fighter-1');
      back = fx !== null && Math.abs(fx - post) <= T && lowest < post - T;
    }
    await ph.page.screenshot({ path: path.join(kit.out, 'e2e-chase-back.png') });
    fact('chase-goes-back', out && back, `by touch, the hero walked out of the camp by its doorway (${out}; column after each try west: ${tries.join(', ')}) and back in; camp fighter 1 had come as far west as x ${Math.round(lowest)} and is drawn at x ${Math.round(fx ?? -1)} (expected back within a tile of his post, x ${post})`);

    // Alarm: the walk up to fighter 1 crossed the lookout's view (column 18): by now, or soon, the page has announced the horn and the wave.
    let alarms: string[] = [];
    for (let i = 0; i < 80 && !(alarms.includes('The horn sounds!') && alarms.includes('Here they come!')); i++) {
      await sleep(250);
      alarms = await ph.page.evaluate(() => (window as any).irreverents.drawn.alarms ?? []);
    }
    await ph.page.screenshot({ path: path.join(kit.out, 'e2e-chase-alarm.png') });
    fact('alarm-reads', alarms.includes('The horn sounds!') && alarms.includes('Here they come!'), `by touch, standing in the camp lookout's view, the page announced: ${JSON.stringify(alarms)} (expected "The horn sounds!" and "Here they come!")`);

  } finally {
    await ph.ctx.close();
  }
}
