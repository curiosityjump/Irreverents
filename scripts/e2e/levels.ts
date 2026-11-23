// Step 14 slice A, inside `npm run e2e` (one call line in scripts/e2e.ts):
// a phone-sized page, by touch only, walks to the courtyard and stands at
// the quarry's doorway: the page draws the mine entrance and an empty ring,
// and no name. It goes in by Use (the level's name crosses the top), comes
// back the same way, and the entrance now has the name and the pie the
// world's record says. Then into the Bandit Camp and back: a level of one
// room, so a full pie. The menu, opened by touch, lists the three levels
// found with their pies. All read from `window.irreverents.drawn.levels`
// and the menu's rows. Screenshots, both states, sideways and upright, go
// to e2e-out/levels/ (git-ignored; the committed ones are
// docs/plan/step-14-shots/, copied from a run: docs/mechanisms/levels.md).
// DRAFT: every limit below is a first pass with room to spare.
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

/** A touch on the middle of the element `sel` (the menu's buttons are HTML). */
async function touch(ph: Phone, sel: string): Promise<boolean> {
  const box = await ph.page.evaluate((s: string) => {
    const r = document.querySelector(s)?.getBoundingClientRect();
    return r && r.width > 0 ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null;
  }, sel);
  if (!box) return false;
  await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...box, id: 2 }] });
  await sleep(60);
  await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await sleep(200);
  return true;
}

const entrance = (ph: Phone, level: string): Promise<any> =>
  ph.page.evaluate((l: string) => (window as any).irreverents.drawn.levels?.entrances?.find((e: any) => e.level === l) ?? null, level);

/** Stands in the middle of `door` of the room the page is in. */
async function standInDoor(ph: Phone, room: string, door: string): Promise<void> {
  const x = await ph.page.evaluate(
    ([r, d]: [string, string]) => {
      const irr = (window as any).irreverents;
      const c = irr.content;
      const dd = c.rooms[r].doors.find((q: any) => q.id === d);
      return dd.tx * c.rooms[r].tile + (dd.w * c.rooms[r].tile - c.characters[irr.drawn.me.kind].box.w) / 2;
    },
    [room, door] as [string, string],
  );
  await standAt(ph, x, 1);
  await sleep(150);
}

/** One tap of Use, then waits until the page draws its character in `goal`. */
async function goThrough(ph: Phone, goal: string): Promise<boolean> {
  const tapped = await tap(ph, 'interact');
  try {
    await ph.page.waitForFunction((g: string) => (window as any).irreverents.drawn.room === g, goal, { polling: 'raf', timeout: 4000 });
  } catch {
    return false;
  }
  await settle(ph);
  return tapped;
}

async function shots(ph: Phone, dir: string, name: string): Promise<void> {
  fs.mkdirSync(dir, { recursive: true });
  await ph.page.setViewportSize({ width: 844, height: 390 });
  await sleep(400);
  await ph.page.screenshot({ path: path.join(dir, `${name}-sideways.png`) });
  await ph.page.setViewportSize({ width: 390, height: 664 });
  await sleep(400);
  await ph.page.screenshot({ path: path.join(dir, `${name}-upright.png`) });
  await ph.page.setViewportSize({ width: 844, height: 390 });
  await sleep(400);
}

export async function levelFacts(kit: Kit & { shots: string }): Promise<void> {
  const { fact } = kit;
  const url = `${kit.base}/?room=e2e-levels-${Math.random().toString(36).slice(2, 10)}`;
  const ph = await phone(kit, url, 'levels');
  try {
    const there = (await walkInto(ph, 1, 'castle-street')) && (await walkInto(ph, 1, 'courtyard'));
    if (there) await standInDoor(ph, 'courtyard', 'to-quarry');
    const before = await entrance(ph, 'iron-quarry');
    fact(
      'level-entrance',
      there && before?.look === 'level-entry-mine' && before.discovered === false && before.name === null && before.quarters === 0,
      `by touch, a phone walked to the courtyard (${there}) and stands at the quarry's doorway: the page drew ${JSON.stringify(before)} (expected the mine entrance, not discovered, no name, the empty ring)`,
    );
    await shots(ph, kit.shots, 'quarry-not-found');

    const inside = await goThrough(ph, 'quarry-road');
    let banner = '';
    try {
      await ph.page.waitForFunction(() => (window as any).irreverents.drawn.levels?.banner === 'Iron Quarry', null, { polling: 'raf', timeout: 2000 });
      banner = 'Iron Quarry';
    } catch {
      banner = String(await ph.page.evaluate(() => (window as any).irreverents.drawn.levels?.banner));
    }
    if (inside) await standInDoor(ph, 'quarry-road', 'to-courtyard');
    const back = inside && (await goThrough(ph, 'courtyard'));
    await sleep(300);
    const after = await entrance(ph, 'iron-quarry');
    const want = await ph.page.evaluate(() => {
      const irr = (window as any).irreverents;
      const seen = irr.world.levels?.['iron-quarry']?.seen ?? [];
      return { seen: seen.length };
    });
    fact(
      'level-found',
      back && banner === 'Iron Quarry' && after?.discovered === true && after.name === 'Iron Quarry' && after.quarters === Math.floor((want.seen * 4) / 13),
      `by Use into the quarry (${inside}; the banner read "${banner}") and back (${back}): the entrance is drawn ${JSON.stringify(after)}; the world's record has ${want.seen} of the quarry's 13 places (expected the name and that pie)`,
    );
    await shots(ph, kit.shots, 'quarry-found');

    // The Bandit Camp is one room: in and out, and its pie is full.
    if (back) await standInDoor(ph, 'courtyard', 'to-outpost');
    const camp = back && (await goThrough(ph, 'outpost'));
    if (camp) await standInDoor(ph, 'outpost', 'to-courtyard');
    const campBack = camp && (await goThrough(ph, 'courtyard'));
    await sleep(300);
    const campDrawn = await entrance(ph, 'bandit-camp');
    fact('level-full', campBack && campDrawn?.name === 'Bandit Camp' && campDrawn.quarters === 4, `into the Bandit Camp (${camp}) and back (${campBack}): its entrance is drawn ${JSON.stringify(campDrawn)} (expected its name and the full pie)`);
    await shots(ph, kit.shots, 'camp-found');

    // The menu, by touch: a row per level found, with its pie; Close shuts it.
    const opened = await touch(ph, '#menu-btn');
    const rows = await ph.page.evaluate(() => [...document.querySelectorAll<HTMLElement>('#game-menu .st-level')].map((r) => `${r.dataset.level}:${r.dataset.quarters}`));
    await sleep(300);
    fs.mkdirSync(kit.shots, { recursive: true });
    await ph.page.screenshot({ path: path.join(kit.shots, 'menu-sideways.png') });
    const closed = (await touch(ph, '#game-menu [data-menu="close"]')) && (await ph.page.evaluate(() => (document.getElementById('game-menu') as HTMLElement).hidden));
    const have = rows.sort().join(', ');
    fact('level-menu', opened && closed && have === `bandit-camp:4, castle-town:${await ph.page.evaluate(() => Math.floor(((window as any).irreverents.world.levels?.['castle-town']?.seen?.length ?? 0) * 4 / 13))}, iron-quarry:${after?.quarters}`, `the menu opened by touch (${opened}) lists [${have}] (a row per level found and its pie; none for the cantina, not found) and Close shut it (${closed})`);
  } finally {
    await ph.ctx.close();
  }
}
