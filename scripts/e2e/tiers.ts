// Step 4, the town's tiers (docs/mechanisms/npc-response.md, "The town's
// tiers"), inside `npm run e2e` and `npm run check:live` (one call line in
// scripts/e2e.ts): a phone-sized page, by touch alone, starts from
// fight-back's moves (walk into the castle street, punch the guard until he
// rages), waits while he rings the bell, punches him once more when he is
// back, then touches nothing: the page draws his whistle's gauge filling,
// then one more pip and more guards in the street than before, and, after
// walking out by the west door, the same pip count in the throne room.
//
// Every number is read from what the page drew (`window.irreverents.drawn`,
// its `alert` record), never from server state. The helpers below are copies
// of scripts/e2e/fight.ts's (Step 18's file, not exported there).
//
// DRAFT: every wait is a first pass with room to spare.
import path from 'node:path';
import { me, phone, pointOn, settle, tap } from '../lib/e2e-touch.ts';
import type { Kit, Phone } from '../lib/e2e-touch.ts';

/* eslint-disable @typescript-eslint/no-explicit-any */
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
const GUARD = 'street-guard';

/** Holds the stick one way until the page draws its character in `goal` (copied from scripts/e2e/outpost.ts, Step 12's). */
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

/** Walks right until the page draws its character past the guard (40 px beyond his left edge), short of the courtyard door. */
async function passGuard(ph: Phone): Promise<void> {
  const p = await pointOn(ph, '[data-stick]', 0.75);
  if (!p) return;
  await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...p, id: 1 }] });
  try {
    await ph.page.waitForFunction(
      (id: string) => {
        const d = (window as any).irreverents.drawn;
        const g = d.entities.find((e: any) => e.id === id);
        return d.me.x >= 712 || (g !== undefined && d.me.x >= g.x + 40);
      },
      GUARD,
      { polling: 'raf', timeout: 8000 },
    );
  } catch {
    // the fact reports where it stood
  }
  await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await settle(ph);
}

/** Holds the stick toward the guard until the page draws the two touching (within 4 px), or 4 s pass. */
async function closeIn(ph: Phone): Promise<boolean> {
  const [mx, gx, gw, w] = (await ph.page.evaluate((id: string) => {
    const irr = (window as any).irreverents;
    const g = irr.drawn.entities.find((e: any) => e.id === id);
    const box = (k: string): any => irr.content.characters[k].box;
    return [irr.drawn.me.x, g?.x ?? NaN, g ? box(g.kind).w : 0, box(irr.drawn.me.kind).w];
  }, GUARD)) as [number, number, number, number];
  if (Number.isNaN(gx)) return false;
  const dir = mx < gx ? 1 : -1;
  const p = await pointOn(ph, '[data-stick]', dir > 0 ? 0.75 : 0.25);
  if (!p) return false;
  await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...p, id: 1 }] });
  let ok = true;
  try {
    await ph.page.waitForFunction(
      ([id, d, myW, gW]: [string, number, number, number]) => {
        const irr = (window as any).irreverents;
        const g = irr.drawn.entities.find((e: any) => e.id === id);
        const m = irr.drawn.me;
        if (!g) return true;
        const gap = d > 0 ? g.x - (m.x + myW) : m.x - (g.x + gW);
        return gap <= 4;
      },
      [GUARD, dir, w, gw],
      { polling: 'raf', timeout: 4000 },
    );
  } catch {
    ok = false;
  }
  await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  return ok;
}

type Seen = { level: number; whistle: number | null; guards: number; room: string };
const look = (ph: Phone): Promise<Seen> =>
  ph.page.evaluate(() => {
    const d = (window as any).irreverents.drawn;
    return { level: d.alert?.level ?? 0, whistle: d.alert?.whistle ?? null, guards: d.entities.filter((e: any) => e.kind === 'guard').length, room: d.room };
  });

/** Watches the drawn record for `ms`, or until `done` holds; returns the most whistle progress, the last level and the most guards drawn. */
const watch = (ph: Phone, ms: number, until: 'whistle' | 'level-up', from: number): Promise<{ whistle: number; level: number; guards: number; ms: number }> =>
  ph.page.evaluate(
    ([dur, what, base]: [number, string, number]) =>
      new Promise<any>((resolve) => {
        const t0 = performance.now();
        let whistle = 0;
        let guards = 0;
        const tick = (): void => {
          const d = (window as any).irreverents.drawn;
          const t = performance.now() - t0;
          whistle = Math.max(whistle, d.alert?.whistle ?? 0);
          guards = Math.max(guards, d.entities.filter((e: any) => e.kind === 'guard').length);
          const level = d.alert?.level ?? 0;
          if ((what === 'whistle' && whistle > 0) || (what === 'level-up' && level > base) || t > dur) return resolve({ whistle, level, guards, ms: Math.round(t) });
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }),
    [ms, until, from] as [number, string, number],
  );

export async function tierFacts(kit: Kit & { tag: string }): Promise<void> {
  const { fact } = kit;
  const url = `${kit.base}/?room=${kit.tag}-tiers-${Math.random().toString(36).slice(2, 10)}`;
  const ph = await phone(kit, url, 'tiers');
  const notes: string[] = [];
  try {
    const kind = (await me(ph))?.kind as string;
    const inStreet = await walkInto(ph, 1, 'castle-street');
    if (inStreet) await passGuard(ph);
    // fight-back's moves: at him until his alert is up (he rages, rings the bell himself and comes back).
    let taps = 0;
    let before = await look(ph);
    const t0 = Date.now();
    while (inStreet && before.level < 1 && Date.now() - t0 < 60000) {
      if ((await look(ph)).room !== 'castle-street') await walkInto(ph, -1, 'castle-street', 10000);
      if (taps < 12) {
        await closeIn(ph);
        await tap(ph, 'attack');
        taps++;
      } else await sleep(500);
      before = await look(ph);
    }
    notes.push(`${taps} taps, the alert drawn at ${before.level} after ${((Date.now() - t0) / 1000).toFixed(1)} s`);
    // Once more at him when he is back, until the page draws his gauge (each try: close in, tap, watch 3 s).
    let gauge = { whistle: 0, level: 0, guards: 0, ms: 0 };
    let tries = 0;
    while (inStreet && before.level >= 1 && gauge.whistle === 0 && tries < 12) {
      // A blow can carry the phone's character out through the courtyard door: walk back in first.
      if ((await look(ph)).room !== 'castle-street') await walkInto(ph, -1, 'castle-street', 10000);
      // A tap while he blows would stop the very whistle we wait for (D-066): look first.
      gauge = await watch(ph, 300, 'whistle', 0);
      if (gauge.whistle > 0) break;
      await closeIn(ph);
      gauge = await watch(ph, 100, 'whistle', 0);
      if (gauge.whistle > 0) break;
      await tap(ph, 'attack');
      tries++;
      gauge = await watch(ph, 6000, 'whistle', 0);
    }
    const mid = await look(ph);
    // Touch nothing: the gauge fills, the pip lights, the row walks in.
    const up = gauge.whistle > 0 ? await watch(ph, 8000, 'level-up', before.level) : { whistle: 0, level: mid.level, guards: mid.guards, ms: 0 };
    await sleep(2500);
    const after = await look(ph);
    await ph.page.screenshot({ path: path.join(kit.out, `${kit.tag === 'check' ? 'live-' : ''}tiers-street.png`) });
    const out = await walkInto(ph, -1, 'throne-room', 30000);
    const away = await look(ph);
    await ph.page.screenshot({ path: path.join(kit.out, `${kit.tag === 'check' ? 'live-' : ''}tiers-away.png`) });
    // The whistle's call, and often more calls after it (another whistle, the shopkeeper's bell), may land before
    // the page is read again: what must hold is one pip more than before the gauge, more guards than before it, and
    // pips still drawn (not fewer than that) in the next room. Read before the gauge, the level is the control.
    const ok = inStreet && gauge.whistle > 0 && up.level >= before.level + 1 && after.guards > before.guards && out && away.level >= before.level + 1;
    fact(
      'tiers',
      ok,
      `by touch, a phone's ${kind} in the castle street (${inStreet}): ${notes.join('; ')}; ${tries} more tap(s) until the page drew the guard's whistle gauge (most progress drawn ${gauge.whistle.toFixed(2)}); ` +
        `then, touching nothing, the pips drawn went from ${before.level} (before the gauge) to ${up.level} in ${(up.ms / 1000).toFixed(1)} s, guards drawn in the street ${before.guards} before the gauge, ${mid.guards} as it showed and ${after.guards} after; ` +
        `out by the west door (${out}) the throne room draws ${away.level} pip(s) (expected ${before.level + 1} or more)`,
    );
  } finally {
    await ph.ctx.close();
  }
}
