// The owner's report, 2026-11-24 ("Alarms don't seem to do anything yet ...
// enemies don't give chase if you are not right in front of them"), inside
// `npm run e2e` (one call line in scripts/e2e.ts): a phone-sized page, by
// touch only, in the Bandit Camp.
// - alarm-reads: standing in the lookout's view, the page announces the horn
//   and the wave it brings on the banner queue (draw/alarm-banner.ts).
// docs/plan/step-4.md, "Alarms and the chase, as played".
// DRAFT: every limit below is a first pass with room to spare.
import path from 'node:path';
import { me, phone, pointOn, settle, standAt } from '../lib/e2e-touch.ts';
import type { Kit, Phone } from '../lib/e2e-touch.ts';
import { pushUp, walkInto } from './outpost.ts';

/* eslint-disable @typescript-eslint/no-explicit-any */
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
const T = 16;

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
    // Into the lookout's view (column 18, watching west first), and stand.
    await standAt(ph, 12 * T, 1);
    // The page announces the horn and the wave.
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
