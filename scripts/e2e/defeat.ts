// Step 21's facts inside `npm run e2e` (one call line in scripts/e2e.ts): a
// phone-sized page, by touch only and with no fight to win, walks into the
// Bandit Camp past column 20 (among the fighters) and stands. The page's own
// record of what it drew (`drawn.condition`, the party plate's condition slot)
// goes fine, hurt, down; the plate's hearts are drawn and one is lost; then
// (Step 21, hearts) the party runs out of hearts, the GAME OVER card shows,
// `drawn.room` is the cantina and the stick moves the hero there. docs/mechanisms/defeat.md.
// Control: `defeat-before`, the condition read before the first blow, is fine.
// DRAFT: every limit below is a first pass with room to spare.
import fs from 'node:fs';
import path from 'node:path';
import { me, phone, pointOn, settle } from '../lib/e2e-touch.ts';
import type { Kit } from '../lib/e2e-touch.ts';
import { pushUp, walkInto } from './outpost.ts';
import { standAt } from '../lib/e2e-touch.ts';

/* eslint-disable @typescript-eslint/no-explicit-any */
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

export async function defeatFacts(kit: Kit & { shots?: string }): Promise<void> {
  const { fact } = kit;
  const shots = kit.shots ?? kit.out;
  fs.mkdirSync(shots, { recursive: true });
  const url = `${kit.base}/?room=e2e-defeat-${Math.random().toString(36).slice(2, 10)}`;
  const ph = await phone(kit, url, 'defeat');
  try {
    const toCourtyard = (await walkInto(ph, 1, 'castle-street')) && (await walkInto(ph, 1, 'courtyard'));
    const c = await ph.page.evaluate(() => {
      const irr = (window as any).irreverents;
      const door = irr.content.rooms.courtyard.doors.find((d: any) => d.id === 'to-outpost');
      return { doorX: door.tx * irr.content.rooms.courtyard.tile, tile: irr.content.rooms.outpost.tile, w: irr.content.characters[irr.drawn.me.kind].box.w };
    });
    if (toCourtyard) await standAt(ph, c.doorX + (c.tile - c.w) / 2 - 4, 1);
    await pushUp(ph);
    const inside = await ph.page
      .waitForFunction(() => (window as any).irreverents.drawn.room === 'outpost', null, { polling: 'raf', timeout: 4000 })
      .then(() => true, () => false);
    // Every condition the plate draws, frame by frame, and whether the page is in the courtyard.
    await ph.page.evaluate(() => {
      const irr = (window as any).irreverents;
      irr.e2eCond = [];
      const tick = (): void => {
        const s = irr.drawn.condition;
        if (s && irr.e2eCond[irr.e2eCond.length - 1] !== s) irr.e2eCond.push(s);
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    // Step 21, hearts: every face on the plate has its row of hearts, full, and the plate is inside the view.
    const plate = (await ph.page.evaluate(() => {
      const irr = (window as any).irreverents;
      const c = document.querySelector('canvas') as HTMLCanvasElement;
      return { hud: irr.drawn.hud, hearts: irr.drawn.hearts, w: c.width, h: c.height, me: irr.drawn.me?.kind };
    })) as { hud: { faces: { kind: string }[]; box: { x: number; y: number; w: number; h: number } } | null; hearts: { rows: Record<string, { left: number; max: number }> }; w: number; h: number; me: string };
    const rows = plate.hud?.faces.map((f) => ({ kind: f.kind, ...plate.hearts.rows[f.kind] })) ?? [];
    const inView = !!plate.hud && plate.hud.box.x >= 0 && plate.hud.box.y >= 0 && plate.hud.box.x + plate.hud.box.w <= plate.w && plate.hud.box.y + plate.hud.box.h <= plate.h;
    fact('hearts-drawn', rows.length >= 2 && rows.every((r) => (r.max ?? 0) > 0 && r.left === r.max) && inView, `the plate draws a row of hearts under each face: ${rows.map((r) => `${r.kind} ${r.left ?? '?'} of ${r.max ?? '?'}`).join(', ')}; the plate ${JSON.stringify(plate.hud?.box)} is inside the ${plate.w} by ${plate.h} view: ${inView}`);
    // The viewer's hearts, frame by frame, and the most hearts seen popping at once.
    await ph.page.evaluate((mine: string) => {
      const irr = (window as any).irreverents;
      irr.e2eHearts = { least: 99, pops: 0, out: false };
      const tick = (): void => {
        const h = irr.drawn.hearts;
        const r = h?.rows?.[mine];
        if (r) irr.e2eHearts.least = Math.min(irr.e2eHearts.least, r.left);
        irr.e2eHearts.pops = Math.max(irr.e2eHearts.pops, h?.pops ?? 0);
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, plate.me);
    const before = (await ph.page.evaluate(() => (window as any).irreverents.drawn.condition)) as string;
    fact('defeat-before', before === 'fine', `inside the camp before any blow the condition slot draws "${before}" (expected fine)`);
    // Over the entrance block and east past column 20, by the stick and Jump.
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
      await ph.page.waitForFunction((x: number) => (window as any).irreverents.drawn.me.x >= x, 22 * c.tile, { polling: 'raf', timeout: 8000 }).catch(() => undefined);
      await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    }
    await settle(ph);
    const stoodAt = Math.round(((await me(ph))?.x ?? 0) / c.tile);
    // Stand: walk back east whenever knocked back west of column 20, until the party is out of hearts and the page is in the cantina (Step 21, hearts: the camp throws nobody out now; about 80 s of falls).
    let shotHurt = false;
    let thrown = false;
    let card = false;
    for (let i = 0; i < 400 && !thrown; i++) {
      await sleep(500);
      const s = (await ph.page.evaluate(() => {
        const irr = (window as any).irreverents;
        return { room: irr.drawn.room, cond: irr.drawn.condition, x: irr.drawn.me?.x ?? 0, card: !!irr.drawn.gameOver };
      })) as { room: string; cond: string; x: number; card: boolean };
      if (s.card && !card) {
        card = true;
        await ph.page.screenshot({ path: path.join(shots, 'hearts-game-over-844x390.png') });
      }
      if (s.room === 'cantina') thrown = true;
      else if (s.cond === 'hurt' && !shotHurt) {
        shotHurt = true;
        await ph.page.screenshot({ path: path.join(shots, 'defeat-hurt-844x390.png') });
      } else if (s.room === 'outpost' && s.x < 20 * c.tile && stick) {
        await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...stick, id: 1 }] });
        await sleep(400);
        await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      }
    }
    await ph.page.screenshot({ path: path.join(shots, 'hearts-cantina-844x390.png') });
    const lost = (await ph.page.evaluate(() => (window as any).irreverents.e2eHearts)) as { least: number; pops: number };
    const max = plate.hearts.rows[plate.me]?.max ?? 0;
    fact('hearts-one-lost', max > 0 && lost.least < max && lost.pops > 0, `standing among the camp's fighters the ${plate.me}'s row went from ${max} hearts down to ${lost.least} at the least, and a lost heart popped (the most popping at once: ${lost.pops})`);
    const seen = (await ph.page.evaluate(() => (window as any).irreverents.e2eCond)) as string[];
    const order = ['fine', 'hurt', 'down'].every((k) => seen.includes(k)) && seen.indexOf('fine') < seen.indexOf('hurt') && seen.indexOf('hurt') < seen.lastIndexOf('down');
    fact('defeat-condition', inside && order, `by touch, into the camp (${inside}) and standing among its fighters (column ${stoodAt}): the condition slot drew ${seen.join(' > ')} (expected fine, then hurt, then down)`);
    // Up in the cantina: the stick moves the hero.
    let moved = false;
    let x0 = 0;
    if (thrown) {
      await ph.page.waitForFunction(() => (window as any).irreverents.drawn.condition !== 'down', null, { polling: 'raf', timeout: 8000 }).catch(() => undefined);
      await sleep(300);
      x0 = (await me(ph))?.x ?? 0;
      const left = await pointOn(ph, '[data-stick]', 0.1);
      if (left) {
        await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...left, id: 1 }] });
        await sleep(700);
        await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      }
      await settle(ph);
      moved = Math.abs(((await me(ph))?.x ?? x0) - x0) > 8;
    }
    fact('hearts-game-over', thrown && card && moved && (await ph.page.evaluate(() => (window as any).irreverents.drawn.room)) === 'cantina', `by touch, standing among the camp's fighters until the whole party was out of hearts: the GAME OVER card was drawn (${card}), the page is in the cantina (${thrown}) and its stick then moved the hero (${moved}, from x ${Math.round(x0)}); at the end: ${JSON.stringify(await ph.page.evaluate(() => { const irr = (window as any).irreverents; return { room: irr.drawn.room, me: irr.drawn.me?.kind, x: Math.round(irr.drawn.me?.x ?? -1), rows: irr.drawn.hearts?.rows }; }))}`);
    await ph.page.setViewportSize({ width: 390, height: 664 });
    await sleep(400);
    await ph.page.screenshot({ path: path.join(shots, 'hearts-cantina-390x664.png') });
  } finally {
    await ph.ctx.close();
  }
}
