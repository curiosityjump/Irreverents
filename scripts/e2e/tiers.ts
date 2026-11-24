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
import { me, phone, pointOn, settle, standAt, tap } from '../lib/e2e-touch.ts';
import type { Kit, Phone } from '../lib/e2e-touch.ts';

/* eslint-disable @typescript-eslint/no-explicit-any */
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
const GUARD = 'street-guard';
/** meet() swings once the drawn gap is this or less (the grappler reaches 12 px past its front). */
const MEET_REACH = 8;
/** Farther than this (px, edge to edge) and meet() first walks to him: he sees 7 tiles (112 px). */
const APPROACH = 60;
/** meet() fights him west of this (px): a flattening blow flies about 300 px, and the courtyard door is at 752. */
const LURE_TO = 400;
/** meet() never stands the hero west of this (px): clear of the west door and the spawns (columns 0-5). */
const STAND_WEST = 120;

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

/** A touch of the stick (60 ms): the character turns that way and barely moves. */
async function nudge(ph: Phone, dir: number): Promise<void> {
  const p = await pointOn(ph, '[data-stick]', dir > 0 ? 0.75 : 0.25);
  if (!p) return;
  await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...p, id: 1 }] });
  await sleep(60);
  await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}

type Near = { mx: number; mw: number; face: number; gx: number; gw: number };
const near = (ph: Phone): Promise<Near | null> =>
  ph.page.evaluate((id: string) => {
    const irr = (window as any).irreverents;
    const g = irr.drawn.entities.find((e: any) => e.id === id);
    const m = irr.drawn.me;
    const mine = irr.world?.entities.find((e: any) => e.player === irr.player);
    const box = (k: string): any => irr.content.characters[k].box;
    return g && m && mine ? { mx: m.x, mw: box(m.kind).w, face: mine.facing, gx: g.x, gw: box(g.kind).w } : null;
  }, GUARD) as Promise<Near | null>;

/**
 * After the alert is up, as a friend would: draws the guard west of the
 * street's middle if he is east of it (stands a step west of him, inside his
 * sight, and lets him come), stands a step west of him, turned toward him,
 * and returns true once the page draws him within reach in front and not
 * flying (he is after the hero, so he comes to it), stepping up to him if he
 * stands off; false after 6 s without that. The caller then swings.
 *
 * INTENT: measured against a local server with 300 ms added to the page's
 * input and 60 ms to what it is sent (live's round trip is about 105 ms; its
 * input queue lands a swing about 300 ms after the page shows it). Phase 1's
 * walk-the-drawn-bodies-together, which this fact used here at first, failed
 * 2 of 4 runs, like live's run of b441908: the page draws its own hero early
 * and the guard late, so the swing came 17 px short, or (the two
 * overlapping) faced away; a flying guard is drawn ~50 px behind; the fight
 * drifted to the courtyard door, where a landed blow put him out of the
 * street (the game's part, fixed in alert-whistle.ts) and his blows put the
 * hero out. With this and that fix: 6 of 6 (docs/plan/step-4.md, "Builder
 * notes"). Every blow he perceived on duty brought his whistle.
 */
async function meet(ph: Phone): Promise<boolean> {
  let w = await near(ph);
  if (!w) {
    try {
      await ph.page.waitForFunction((id: string) => (window as any).irreverents.drawn.entities.some((e: any) => e.id === id), GUARD, { timeout: 8000 });
    } catch {
      return false;
    }
    w = await near(ph);
    if (!w) return false;
  }
  // East of LURE_TO, draw him west first: stand a step west of him, inside his sight, and let him come
  // (he walks 40 px a second); again, up to 10 s.
  const t1 = Date.now();
  while (w.gx > LURE_TO && Date.now() - t1 < 10000) {
    await standAt(ph, Math.max(STAND_WEST, w.gx - w.mw - 60), 1);
    await sleep(600);
    const again = await near(ph);
    if (!again) break;
    w = again;
  }
  // West of him, so a blow sends him east, and from west of LURE_TO even a flattening one (about 300 px)
  // leaves him short of the courtyard door.
  if (w.mx + w.mw > w.gx || w.gx - (w.mx + w.mw) > APPROACH) await standAt(ph, Math.max(STAND_WEST, w.gx - w.mw - 30), 1);
  const t0 = Date.now();
  let last: number | null = null;
  let still = 0;
  while (Date.now() - t0 < 6000) {
    w = await near(ph);
    if (!w) {
      last = null;
      await sleep(100);
      continue;
    }
    const dir = w.gx + w.gw / 2 > w.mx + w.mw / 2 ? 1 : -1;
    const gap = dir > 0 ? w.gx - (w.mx + w.mw) : w.mx - (w.gx + w.gw);
    // Still or walking (under 3 px between looks 50 ms apart), not flying from a blow.
    const moved = last === null ? Infinity : Math.abs(w.gx - last);
    last = w.gx;
    if (w.face !== dir) {
      await nudge(ph, dir);
      last = null;
      continue;
    }
    if (moved < 3 && gap <= MEET_REACH) return true;
    // He stands off (as he does by a wall): step up to him. He is still, so where the page draws him is where he is.
    still = moved < 0.5 ? still + 1 : 0;
    if (still >= 6) {
      await closeIn(ph);
      last = null;
      still = 0;
      continue;
    }
    await sleep(50);
  }
  return false;
}

/**
 * Phase 1 (fight-back's moves): the guard paces his beat and waits 4 s at
 * each end of it. Returns true once the page draws him standing still with
 * the phone's character just east of him, turned toward him (walking there
 * once he is still: a blow then sends him west, toward his bell, as
 * fight-back's do); false after 8 s.
 *
 * INTENT: walking the drawn bodies together and swinging at a pacing guard
 * (fight-back's closeIn, which this phase used) failed on live twice: in
 * one run 12 taps landed 2 blows and the alert never rose in 60 s (7f148ea,
 * reverted; and the same with the code before it). Over live's delay the
 * page draws him late, so a swing at a walking guard lands where he was. A
 * still guard is drawn where he is.
 */
async function atRest(ph: Phone): Promise<boolean> {
  const t0 = Date.now();
  let last: number | null = null;
  let still = 0;
  while (Date.now() - t0 < 8000) {
    const w = await near(ph);
    if (!w) {
      last = null;
      still = 0;
      await sleep(100);
      continue;
    }
    still = last !== null && Math.abs(w.gx - last) < 0.5 ? still + 1 : 0;
    last = w.gx;
    if (still >= 6) {
      const gap = w.mx - (w.gx + w.gw);
      if (gap < 0 || gap > MEET_REACH) {
        await standAt(ph, w.gx + w.gw + 3, -1);
        last = null;
        still = 0;
        continue;
      }
      if (w.face !== -1) {
        await nudge(ph, -1);
        last = null;
        still = 0;
        continue;
      }
      return true;
    }
    await sleep(50);
  }
  return false;
}

/** Back into the street if a blow carried the phone's character out: east from the throne room, west from the courtyard. */
async function backIn(ph: Phone): Promise<void> {
  const room = (await look(ph)).room;
  if (room !== 'castle-street') await walkInto(ph, room === 'throne-room' ? 1 : -1, 'castle-street', 10000);
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
      await backIn(ph);
      if (taps < 12) {
        await atRest(ph);
        await tap(ph, 'attack');
        taps++;
      } else await sleep(500);
      before = await look(ph);
    }
    notes.push(`${taps} taps, the alert drawn at ${before.level} after ${((Date.now() - t0) / 1000).toFixed(1)} s`);
    // Once more at him, until the page draws his gauge (each try: meet him, tap, watch 6 s).
    let gauge = { whistle: 0, level: 0, guards: 0, ms: 0 };
    let tries = 0;
    while (inStreet && before.level >= 1 && gauge.whistle === 0 && tries < 12) {
      // A blow can carry the phone's character out by either door: walk back in first.
      await backIn(ph);
      // A tap while he blows would stop the very whistle we wait for (D-066): look first.
      gauge = await watch(ph, 300, 'whistle', 0);
      if (gauge.whistle > 0) break;
      await meet(ph);
      gauge = await watch(ph, 100, 'whistle', 0);
      if (gauge.whistle > 0) break;
      await tap(ph, 'attack');
      tries++;
      gauge = await watch(ph, 6000, 'whistle', 0);
    }
    const mid = await look(ph);
    // Touch nothing: the gauge fills, the pip lights, the row walks in.
    const up = gauge.whistle > 0 ? await watch(ph, 8000, 'level-up', before.level) : { whistle: 0, level: mid.level, guards: mid.guards, ms: 0 };
    // The most guards the page draws in the street over the next 2.5 s (the arrivals' blows can carry the
    // phone's character out of it meanwhile; a count read in another room says nothing of the street).
    const most = (await ph.page.evaluate(
      (ms: number) =>
        new Promise<number>((resolve) => {
          const t0 = performance.now();
          let n = 0;
          const tick = (): void => {
            const d = (window as any).irreverents.drawn;
            if (d.room === 'castle-street') n = Math.max(n, d.entities.filter((e: any) => e.kind === 'guard').length);
            if (performance.now() - t0 > ms) return resolve(n);
            requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }),
      2500,
    )) as number;
    const after = { ...(await look(ph)), guards: most };
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
