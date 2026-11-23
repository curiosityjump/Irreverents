// Step 19's facts (heist-*), inside `npm run e2e` (one call line in
// scripts/e2e.ts): a phone-sized page, by touch only, walks from the start
// room onto the street and stands at the shop. The Use button names what a
// press would do (`data-state`, read from the page): "take" at the goods,
// "buy" at the counter (docs/mechanisms/heists.md, "The word"). The party
// plate (window.irreverents.drawn.hud) lists the party's faces, the page's
// own first. Each person's sight band (drawn.sight) flips when they turn
// (heist-band). Screenshots, sideways and upright, go to e2e-out/heist/
// (git-ignored; the committed ones in docs/plan/step-19-shots/ were copied
// from there by hand, and a run never rewrites files in the repository).
//
// Deterministic touches only: walking and standing, no press of Use (the
// goods stay on the shelf for the next fact and the next run).
// Control: E2E_TOUCH_BREAK=interact takes the Use button off the page, and
// heist-word must fail.
// DRAFT: every limit below is a first pass with room to spare.
import fs from 'node:fs';
import path from 'node:path';
import { phone, pointOn, settle, standAt } from '../lib/e2e-touch.ts';
import type { Kit, Phone } from '../lib/e2e-touch.ts';

/* eslint-disable @typescript-eslint/no-explicit-any */
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/** Holds the stick one way until the page draws its character in `goal` (or the time runs out). */
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

const useState = (ph: Phone): Promise<string> => ph.page.evaluate(() => document.querySelector<HTMLElement>('#actions [data-action="interact"]')?.dataset.state ?? '');

/** The left edge that puts this page's character's middle over the middle of a thing's tile. */
const leftOver = (ph: Phone, thing: string): Promise<number> =>
  ph.page.evaluate((id: string) => {
    const irr = (window as any).irreverents;
    const c = irr.content;
    const t = c.placements['castle-street'].things.find((q: any) => q.id === id);
    const T = c.rooms['castle-street'].tile;
    return (t.tile[0] + 0.5) * T - c.characters[irr.drawn.me.kind].box.w / 2;
  }, thing);

export async function heistFacts(kit: Kit & { shots: string }): Promise<void> {
  const { fact } = kit;
  const url = `${kit.base}/?room=e2e-heist-${Math.random().toString(36).slice(2, 10)}`;
  const ph = await phone(kit, url, 'heist');
  try {
    const toStreet = await walkInto(ph, 1, 'castle-street');
    // At the middle good, then at the counter (the shopkeeper stands behind it, attending).
    if (toStreet) await standAt(ph, await leftOver(ph, 'street-goods-2'), 1);
    await sleep(200);
    const atGoods = await useState(ph);
    fs.mkdirSync(kit.shots, { recursive: true });
    await ph.page.setViewportSize({ width: 844, height: 390 });
    await sleep(400);
    await ph.page.screenshot({ path: path.join(kit.shots, 'take-sideways.png') });
    await ph.page.setViewportSize({ width: 390, height: 664 });
    await sleep(400);
    await ph.page.screenshot({ path: path.join(kit.shots, 'take-upright.png') });
    await ph.page.setViewportSize({ width: 844, height: 390 });
    await sleep(400);
    if (toStreet) await standAt(ph, await leftOver(ph, 'street-counter'), -1);
    await sleep(200);
    const atCounter = await useState(ph);
    await ph.page.screenshot({ path: path.join(kit.shots, 'buy-sideways.png') });
    fact('heist-word', toStreet && atGoods === 'take' && atCounter === 'buy', `by touch, a phone walked onto the street (${toStreet}); standing at the shop's middle good the Use button's state is "${atGoods}" (expected take), at the counter "${atCounter}" (expected buy)`);

    const hud = await ph.page.evaluate(() => (window as any).irreverents.drawn.hud);
    const party = await ph.page.evaluate(() => {
      const irr = (window as any).irreverents;
      return { members: (irr.world?.party ?? irr.content.party.members) as string[], kind: irr.drawn.me.kind as string };
    });
    const faces = (hud?.faces ?? []) as { kind: string; me: boolean }[];
    const ok = faces.length === party.members.length && faces[0]?.me === true && faces[0]?.kind === party.kind && party.members.every((m: string) => faces.some((f) => f.kind === m));
    fact('heist-plate', ok, `the party plate draws ${faces.length} faces (${faces.map((f) => f.kind + (f.me ? ' (me)' : '')).join(', ')}) for the party ${party.members.join(', ')}; the page's own (${party.kind}) first and lit`);

    // Push 3: the shopkeeper's sight band, drawn on her side of the counter, flips when she turns
    // (her routine: 5 s facing the goods, 1.5 s away).
    const band = (): Promise<any> => ph.page.evaluate(() => (window as any).irreverents.drawn.sight?.bands.find((b: any) => b.id === 'street-shopkeeper') ?? null);
    const first = await band();
    let second: any = null;
    if (first) {
      try {
        await ph.page.waitForFunction((f: number) => (window as any).irreverents.drawn.sight?.bands.find((b: any) => b.id === 'street-shopkeeper')?.facing === -f, first.facing, { polling: 'raf', timeout: 8000 });
        second = await band();
      } catch {
        // reported below
      }
    }
    const ahead = (b: any): boolean => b && b.cells > 0 && (b.facing > 0 ? b.x0 === b.eyeX && b.x1 > b.eyeX : b.x1 === b.eyeX && b.x0 < b.eyeX);
    await ph.page.screenshot({ path: path.join(kit.shots, 'band-sideways.png') });
    fact('heist-band', ahead(first) && ahead(second) && second.facing === -first.facing, `the page draws the shopkeeper's sight band ${first ? `facing ${first.facing}, ${first.cells} cells lit, from her eye at ${Math.round(first.eyeX)} to ${Math.round(first.facing > 0 ? first.x1 : first.x0)}` : 'NOT at all'}; when she turned it was ${second ? `facing ${second.facing}, ${second.cells} cells, to ${Math.round(second.facing > 0 ? second.x1 : second.x0)}` : 'not seen to flip in 8 s'}`);
  } finally {
    await ph.ctx.close();
  }
}
