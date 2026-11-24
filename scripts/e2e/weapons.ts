// Step 23, inside `npm run e2e` (one call line in scripts/e2e.ts;
// docs/mechanisms/weapons.md): a phone-sized page, by touch only, walks east
// from the start into the castle street and stands at the sword lying there.
// The Use button says "Pick up" (`data-state` pick-up) and the page draws the
// sword glowing; a tap of Use and the page draws it in the hero's hand.
// Screenshots, sideways and upright, of the glow and of the sword in hand.
// Control, watched to fail: with the sword's `sources` emptied, weapon-word
// and weapon-held fail.
import fs from 'node:fs';
import path from 'node:path';
import { phone, pointOn, settle, standAt, tap } from '../lib/e2e-touch.ts';
import type { Kit, Phone } from '../lib/e2e-touch.ts';

/* eslint-disable @typescript-eslint/no-explicit-any */
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/** Holds the stick one way until the page draws its character in `goal` (as scripts/e2e/powers.ts). */
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
const drawnWeapons = (ph: Phone): Promise<any> => ph.page.evaluate(() => (window as any).irreverents.drawn.weapons ?? { loose: [], held: [] });

/** Both screenshots of the page as it is now: sideways (844 by 390) and upright (390 by 664), back to sideways after. */
async function shoot(ph: Phone, dir: string, name: string): Promise<void> {
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

export async function weaponFacts(kit: Kit & { shots: string }): Promise<void> {
  const { fact } = kit;
  const url = `${kit.base}/?room=e2e-weapons-${Math.random().toString(36).slice(2, 10)}`;
  const ph = await phone(kit, url, 'weapons');
  try {
    const there = await walkInto(ph, 1, 'castle-street');
    // The sword as this page draws it lying loose (its middle, room px), and where to stand over it.
    let lying: any = null;
    try {
      const h = await ph.page.waitForFunction(() => ((window as any).irreverents.drawn.weapons?.loose ?? []).find((l: any) => l.weapon === 'sword') ?? null, null, { polling: 'raf', timeout: 3000 });
      lying = await h.jsonValue();
    } catch {
      lying = null;
    }
    if (there && lying) {
      const w = (await ph.page.evaluate(() => {
        const irr = (window as any).irreverents;
        return irr.content.characters[irr.drawn.me.kind].box.w;
      })) as number;
      await standAt(ph, lying.x - w / 2, 1);
    }
    await sleep(250);
    const word = await useState(ph);
    const glow = ((await drawnWeapons(ph)).loose as any[]).some((l) => l.weapon === 'sword' && l.glow);
    await shoot(ph, kit.shots, 'pick-up');
    fact('weapon-word', there && word === 'pick-up' && glow, `by touch, a phone walked into the street (${there}) and stood at the sword lying there (${JSON.stringify(lying)}); the Use button's state is "${word}" (expected pick-up) and the sword is drawn glowing (${glow})`);

    const tapped = await tap(ph, 'interact');
    let held: any[] = [];
    try {
      const h = await ph.page.waitForFunction(
        (id: string) => {
          const d = (window as any).irreverents.drawn;
          const mine = (d.weapons?.held ?? []).filter((x: any) => x.id === d.me?.id && x.weapon === 'sword');
          return mine.length ? mine : null;
        },
        ph.id,
        { polling: 'raf', timeout: 3000 },
      );
      held = (await h.jsonValue()) as any[];
    } catch {
      held = [];
    }
    const after = await drawnWeapons(ph);
    const gone = !(after.loose as any[]).some((l) => l.weapon === 'sword');
    const swapWord = await useState(ph);
    await shoot(ph, kit.shots, 'held');
    fact('weapon-held', tapped && held.length === 1 && gone, `a tap of Use (${tapped}) and the page draws the sword in its own hero's hand (${JSON.stringify(held)}) and no longer lying there (${gone}); the Use button then says "${swapWord}"`);
  } finally {
    await ph.ctx.close();
  }
}
