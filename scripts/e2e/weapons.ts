// Step 23, inside `npm run e2e` and `npm run check:live` (one call line in
// scripts/e2e.ts; docs/mechanisms/weapons.md): a phone-sized page with 150 ms
// added each way (as scripts/e2e/hit-lands.ts), by touch only, walks east
// from the start into the castle street and stands at the sword lying there.
// The Use button says "Pick up" (`data-state` pick-up) and the page draws the
// sword glowing; a tap of Use and the page draws it in the hero's hand. It
// stands where the street's first crate is past its bare reach and inside
// the sword's, taps Hit, and the page draws the star on the crate within the
// wind-up plus 50 ms (the predicted hit with the sword's reach,
// docs/mechanisms/network.md). A tap of Grab and the sword is drawn loose
// again. Press-to-drawn of the pick-up and the throw (neither is predicted)
// is printed, not limited. Screenshots, sideways and upright.
// Control, watched to fail: with the sword's `sources` emptied, weapon-word
// and weapon-held fail.
import fs from 'node:fs';
import path from 'node:path';
import { pointOn, settle, standAt, tap } from '../lib/e2e-touch.ts';
import type { Kit, Phone } from '../lib/e2e-touch.ts';

/* eslint-disable @typescript-eslint/no-explicit-any */
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/** DRAFT: the added delay each way, as scripts/e2e/hit-lands.ts. */
const DELAY_MS = 150;

/** A phone page whose socket is routed through a delay each way (as scripts/e2e/hit-lands.ts: Chromium's throttling does not delay WebSocket frames). */
async function routedPhone(kit: Kit, url: string, name: string, delayMs: number): Promise<Phone> {
  const ctx = await kit.browser.newContext({ ...kit.devices['iPhone 14 landscape'] });
  const page = await ctx.newPage();
  page.on('pageerror', (e: Error) => kit.errors.push(`${name}: ${e.message}`));
  await page.routeWebSocket(/\/ws$/, (ws: any) => {
    const upstream = ws.connectToServer();
    ws.onMessage((m: string) => setTimeout(() => { try { upstream.send(m); } catch { /* closed */ } }, delayMs));
    upstream.onMessage((m: string) => setTimeout(() => { try { ws.send(m); } catch { /* closed */ } }, delayMs));
  });
  const cdp = await ctx.newCDPSession(page);
  await page.goto(url);
  await page.waitForFunction(() => (window as any).irreverents?.drawn.status === 'online' && (window as any).irreverents.drawn.me, null, { timeout: 10000 });
  const id = (await page.evaluate(() => (window as any).irreverents.player)) as string;
  return { name, ctx, page, cdp, id };
}

/** Taps an action and resolves with the ms from the finger going down until `cond` holds on a drawn frame (null when it never did within `ms`). */
async function timedTap(ph: Phone, action: string, cond: string, arg: unknown, ms = 3000): Promise<number | null> {
  const watch = ph.page.evaluate(
    ([c, a, limit]: [string, unknown, number]) =>
      new Promise<number | null>((resolve) => {
        const test = new Function('d', 'a', `return (${c})(d, a);`) as (d: any, a: unknown) => boolean;
        const t0 = performance.now();
        (window as any).__tapAt = null;
        const tick = (): void => {
          const at = (window as any).__tapAt as number | null;
          if (at !== null && test((window as any).irreverents.drawn, a)) return resolve(performance.now() - at);
          if (performance.now() - t0 > limit) return resolve(null);
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }),
    [cond, arg, ms] as [string, unknown, number],
  );
  // The clock starts when the press reaches the page (its touchstart), as scripts/e2e/hit-lands.ts times it:
  // started before the tap was sent, the test's own tap delivery (about 30 ms) was counted as the game's.
  await ph.page.evaluate(() => addEventListener('touchstart', () => { if ((window as any).__tapAt === null) (window as any).__tapAt = performance.now(); }, { capture: true, once: true }));
  await tap(ph, action);
  return watch;
}

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
  const ph = await routedPhone(kit, url, 'weapons', DELAY_MS);
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

    const holdsSword = `(d) => (d.weapons?.held ?? []).some((x) => x.id === d.me?.id && x.weapon === 'sword')`;
    const pickMs = await timedTap(ph, 'interact', holdsSword, null);
    const held = ((await drawnWeapons(ph)).held as any[]).filter((x) => x.weapon === 'sword');
    // The hand is the effect's (it arrives first); the floor is the snapshot's, drawn about 100 ms behind: wait for it.
    let gone = false;
    try {
      await ph.page.waitForFunction(() => !((window as any).irreverents.drawn.weapons?.loose ?? []).some((l: any) => l.weapon === 'sword'), null, { polling: 'raf', timeout: 2000 });
      gone = true;
    } catch {
      gone = false;
    }
    await shoot(ph, kit.shots, 'held');
    fact('weapon-held', pickMs !== null && held.length === 1 && gone, `a tap of Use and the page draws the sword in its own hero's hand after ${pickMs === null ? 'never' : `${pickMs.toFixed(0)} ms`} (150 ms added each way; not predicted) (${JSON.stringify(held)}), and no longer lying there (${gone})`);

    // The street's first crate, past the bare reach and inside the sword's: a hit on it is the sword's reach, predicted on this page.
    const plan = (await ph.page.evaluate(() => {
      const irr = (window as any).irreverents;
      const c = irr.content;
      const crate = irr.drawn.entities.find((e: any) => e.id === 'street-crate-1');
      const kind = c.characters[irr.drawn.me.kind];
      const reach = c.tuning.characters[kind.tuning].attackReach as number;
      const add = c.weapons.sword.hit.add.attackReach ?? 0;
      // Facing right, the swing reaches `reach` past the front edge (verbs/attack.ts): stand so the crate's left edge is past the bare reach by half the sword's extra.
      return crate ? { goal: crate.x - kind.box.w - reach - add / 2, crate: crate.x, reach, add } : null;
    })) as { goal: number; crate: number; reach: number; add: number } | null;
    let starMs: number | null = null;
    const windup = (await ph.page.evaluate(() => {
      const irr = (window as any).irreverents;
      return irr.content.tuning.characters[irr.content.characters[irr.drawn.me.kind].tuning].attackWindup as number;
    })) as number;
    if (plan) {
      await standAt(ph, plan.goal, 1);
      await sleep(300);
      starMs = await timedTap(ph, 'attack', `(d) => (d.impacts ?? []).some((i) => i.id === 'street-crate-1' && i.age <= 30)`, null);
    }
    const limit = windup * 1000 + 50;
    fact('weapon-hit-quick', plan !== null && starMs !== null && starMs <= limit, `holding the sword, standing with the street's first crate past the bare reach (${plan ? `${plan.reach} px` : '?'}) and inside the sword's (+${plan?.add ?? '?'} px), a tap of Hit: the page first drew the star on the crate after ${starMs === null ? 'never' : `${starMs.toFixed(0)} ms`} (limit: the wind-up ${(windup * 1000).toFixed(0)} + 50 = ${limit.toFixed(0)} ms, 150 ms added each way)`);
    await sleep(800);

    const lies = `(d) => (d.weapons?.loose ?? []).some((l) => l.weapon === 'sword') && !(d.weapons?.held ?? []).some((x) => x.id === d.me?.id)`;
    const throwMs = await timedTap(ph, 'grab', lies, null);
    await sleep(600);
    await shoot(ph, kit.shots, 'thrown');
    fact('weapon-thrown', throwMs !== null, `a tap of Grab with the sword in hand, and the page draws it loose and not in hand after ${throwMs === null ? 'never' : `${throwMs.toFixed(0)} ms`} (150 ms added each way; not predicted)`);
  } finally {
    await ph.ctx.close();
  }
}
