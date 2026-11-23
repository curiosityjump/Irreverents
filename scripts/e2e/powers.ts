// Step 9, inside `npm run e2e` (one call line in scripts/e2e.ts;
// docs/mechanisms/powers.md): a phone-sized page, by touch only, walks east
// from the start into the castle street, where the villain carries the
// boost. Its drawn record (`window.irreverents.drawn.powers`) lists him as a
// carrier with his orb drawn over his head. Winning the fight is left to the
// scenarios (step9-take-from-carrier) and the two-connection check
// (scripts/checks/step9-powers.ts).
// Control, watched to fail: with boost's `carriers` emptied, power-carrier-drawn fails.
import fs from 'node:fs';
import path from 'node:path';
import { phone, pointOn, settle } from '../lib/e2e-touch.ts';
import type { Kit, Phone } from '../lib/e2e-touch.ts';

/* eslint-disable @typescript-eslint/no-explicit-any */
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/** Holds the stick one way until the page draws its character in `goal` (as scripts/e2e/glints.ts). */
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

export async function powerFacts(kit: Kit & { shots: string }): Promise<void> {
  const { fact } = kit;
  const url = `${kit.base}/?room=e2e-powers-${Math.random().toString(36).slice(2, 10)}`;
  const ph = await phone(kit, url, 'powers');
  try {
    const there = await walkInto(ph, 1, 'castle-street');
    let carriers: any[] = [];
    try {
      const h = await ph.page.waitForFunction(() => {
        const c = (window as any).irreverents.drawn.powers?.carriers ?? [];
        return c.length ? c : null;
      }, null, { polling: 'raf', timeout: 3000 });
      carriers = (await h.jsonValue()) as any[];
    } catch {
      carriers = (await ph.page.evaluate(() => (window as any).irreverents.drawn.powers?.carriers ?? [])) as any[];
    }
    const villain = carriers.some((c) => c.id === 'street-villain' && c.power === 'boost');
    fact('power-carrier-drawn', there && villain, `by touch, a phone walked from the start into the street (${there}); the page drew the villain as a carrier with his orb over his head (${villain}; carriers drawn: ${JSON.stringify(carriers)})`);
    fs.mkdirSync(kit.shots, { recursive: true });
    await sleep(100);
    await ph.page.screenshot({ path: path.join(kit.shots, 'carrier-sideways.png') });
  } finally {
    await ph.ctx.close();
  }
}
