// Step 14 slice B, inside `npm run e2e` (one call line in scripts/e2e.ts):
// a phone-sized page, by touch only, walks east from the start into the
// street, stands under the shop's awning and holds Jump for the full rise.
// Before the jump the page draws the piece's glint and no found row; after
// it, the found row with exactly one gold piece of the town's set. Read from
// `window.irreverents.drawn.completion`. Screenshots of the glint, and of
// the pop and the row, sideways and upright, go to e2e-out/glints/ (the
// committed ones are docs/plan/step-14-shots/, copied from a run).
// Control: E2E_TOUCH_BREAK=jump takes the Jump button off the page, and
// glint-found must fail.
import fs from 'node:fs';
import path from 'node:path';
import { phone, pointOn, settle, standAt, tap } from '../lib/e2e-touch.ts';
import type { Kit, Phone } from '../lib/e2e-touch.ts';

/* eslint-disable @typescript-eslint/no-explicit-any */
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

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

const completion = (ph: Phone): Promise<any> => ph.page.evaluate(() => (window as any).irreverents.drawn.completion);

async function shots(ph: Phone, dir: string, name: string): Promise<void> {
  fs.mkdirSync(dir, { recursive: true });
  await ph.page.screenshot({ path: path.join(dir, `${name}-sideways.png`) });
  await ph.page.setViewportSize({ width: 390, height: 664 });
  await sleep(250);
  await ph.page.screenshot({ path: path.join(dir, `${name}-upright.png`) });
  await ph.page.setViewportSize({ width: 844, height: 390 });
  await sleep(250);
}

export async function glintFacts(kit: Kit & { shots: string }): Promise<void> {
  const { fact } = kit;
  const url = `${kit.base}/?room=e2e-glints-${Math.random().toString(36).slice(2, 10)}`;
  const ph = await phone(kit, url, 'glints');
  try {
    const there = await walkInto(ph, 1, 'castle-street');
    // Under the awning: the piece's column, the character's middle on it.
    const goal = await ph.page.evaluate(() => {
      const irr = (window as any).irreverents;
      const c = irr.content;
      const p = c.completion['castle-town'].pieces.find((q: any) => q.id === 'town-1');
      return p.tile[0] * 16 + 8 - c.characters[irr.drawn.me.kind].box.w / 2;
    });
    if (there) await standAt(ph, goal, 1);
    await sleep(200);
    const before = await completion(ph);
    const glint = before.glints.some((g: any) => g.piece === 'town-1');
    fact('glint-seen', there && glint && before.row === null, `by touch, a phone walked from the start into the street (${there}) and stands under the awning: the page draws the piece's glint (${glint}) and no found row (${JSON.stringify(before.row)})`);
    await shots(ph, kit.shots, 'glint');

    // One deterministic touch: Jump held for the full rise.
    const tapped = await tap(ph, 'jump', 500);
    let row: any = null;
    try {
      const h = await ph.page.waitForFunction(() => (window as any).irreverents.drawn.completion.row, null, { polling: 'raf', timeout: 3000 });
      row = await h.jsonValue();
    } catch {
      row = (await completion(ph)).row;
    }
    const gold = row ? row.pieces.filter(Boolean).length : 0;
    await shots(ph, kit.shots, 'found');
    const after = await completion(ph);
    fact('glint-found', tapped && row?.level === 'castle-town' && gold === 1 && !after.glints.some((g: any) => g.piece === 'town-1'), `one held Jump (${tapped ? 'pressed' : 'the button is NOT on the page'}) from under the awning: the found row reads ${JSON.stringify(row)} (expected the town's, one gold), and the glint is gone`);
  } finally {
    await ph.ctx.close();
  }
}
