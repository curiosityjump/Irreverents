// Step 18's fact inside `npm run e2e` and `npm run check:live` (one call
// line in scripts/e2e.ts, outside `if (!LIVE)`): a phone-sized page, by touch
// alone, walks from the start room into the castle street, hits the street
// guard until he rages, then touches nothing, and its own character is
// knocked at least 20 px within a second: people fight back
// (docs/plan/step-18.md, signal 5; docs/mechanisms/npc-response.md, "Who fights").
//
// Every number is read from what the page drew (`window.irreverents.drawn`),
// never from server state.
//
// DRAFT: every limit below is a first pass with room to spare (rage needs
// hits the guard sees, and he goes to call before he comes back: measured
// 11.6 s from rage to his first blow, so the fact allows 30 s).
import path from 'node:path';
import { me, phone, pointOn, settle, tap } from '../lib/e2e-touch.ts';
import type { Kit, Phone } from '../lib/e2e-touch.ts';

/* eslint-disable @typescript-eslint/no-explicit-any */
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

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

const GUARD = 'street-guard';
const guardX = (ph: Phone): Promise<number | null> =>
  ph.page.evaluate((id: string) => (window as any).irreverents.drawn.entities.find((e: any) => e.id === id)?.x ?? null, GUARD);
/**
 * The most the guard's drawn x moves within any 150 ms, over `ms`: a blow,
 * not his walk (people walk at 40 px a second, 6 px in 150 ms).
 */
const guardJump = (ph: Phone, ms: number): Promise<number> =>
  ph.page.evaluate(
    ([id, dur]: [string, number]) =>
      new Promise<number>((resolve) => {
        const t0 = performance.now();
        const pts: { t: number; x: number }[] = [];
        let most = 0;
        const tick = (): void => {
          const t = performance.now() - t0;
          const g = (window as any).irreverents.drawn.entities.find((e: any) => e.id === id);
          if (g) {
            pts.push({ t, x: g.x });
            while (pts.length && pts[0]!.t < t - 150) pts.shift();
            for (const p of pts) most = Math.max(most, Math.abs(g.x - p.x));
          }
          if (t > dur) return resolve(most);
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }),
    [GUARD, ms],
  );

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

export async function fightFacts(kit: Kit & { tag: string }): Promise<void> {
  const { fact } = kit;
  const url = `${kit.base}/?room=${kit.tag}-fight-${Math.random().toString(36).slice(2, 10)}`;
  const ph = await phone(kit, url, 'fight');
  try {
    const kind = (await me(ph))?.kind as string;
    const inStreet = await walkInto(ph, 1, 'castle-street');

    // Steer at the guard and tap attack until his drawn x has jumped 10 px or more three times (at most 8 taps).
    const jumps: number[] = [];
    let taps = 0;
    // First get past him, between him and the courtyard door: from his right, a punch sends him back up the
    // street, not out through that door (measured: a grappler's punch from his left carried him into the courtyard).
    if (inStreet) await passGuard(ph);
    while (inStreet && taps < 8 && jumps.filter((j) => j >= 10).length < 3) {
      // Hold the stick toward him until the page draws the two bodies touching, then tap attack at once:
      // he walks his beat, and standing still first lets him walk out of reach.
      const close = await closeIn(ph);
      const watch = guardJump(ph, 700);
      await tap(ph, 'attack');
      taps++;
      jumps.push(Math.round(await watch));
    }

    // Its own last move must not count: wait until the page draws it standing still.
    await settle(ph);
    // Now touch nothing, and watch the page's own character for 30 s: did it move 20 px or more within any 1 s?
    const seen = (await ph.page.evaluate(
      ([id, dur]: [string, number]) =>
        new Promise<any>((resolve) => {
          const t0 = performance.now();
          const pts: { t: number; x: number }[] = [];
          let best = { d: 0, at: -1 };
          const words = new Set<string>();
          let gMin = Infinity;
          let gMax = -Infinity;
          const tick = (): void => {
            const d = (window as any).irreverents.drawn;
            const t = performance.now() - t0;
            pts.push({ t, x: d.me.x });
            while (pts.length && pts[0]!.t < t - 1000) pts.shift();
            for (const p of pts) {
              const moved = Math.abs(d.me.x - p.x);
              if (moved > best.d) best = { d: moved, at: Math.round(t) };
            }
            for (const w of d.words ?? []) words.add(w);
            const g = d.entities.find((e: any) => e.id === id);
            if (g) {
              gMin = Math.min(gMin, g.x);
              gMax = Math.max(gMax, g.x);
            }
            if (best.d >= 20 || t > dur) return resolve({ best: Math.round(best.d), at: best.at, end: Math.round(t), x: Math.round(d.me.x), room: d.room, gMin: Math.round(gMin), gMax: Math.round(gMax), words: [...words].join(' / ') });
            requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }),
      [GUARD, 30000],
    )) as { best: number; at: number; end: number; x: number; room: string; gMin: number; gMax: number; words: string };
    await ph.page.screenshot({ path: path.join(kit.out, `${kit.tag === 'check' ? 'live-' : ''}fight-back.png`) });
    fact(
      'fight-back',
      inStreet && seen.best >= 20,
      `by touch, a phone's ${kind} walked into the castle street (${inStreet}), tapped attack ${taps} time(s) at the street guard (the most his drawn x moved within 150 ms after each tap: ${jumps.join(', ') || 'never'} px), then touched nothing: ` +
        `in ${(seen.end / 1000).toFixed(1)} s its own character moved at most ${seen.best} px within 1 s (${seen.best >= 20 ? `at ${(seen.at / 1000).toFixed(1)} s` : 'expected 20 px or more'}); it ended at x ${seen.x} in ${seen.room}; the guard was drawn between x ${seen.gMin} and ${seen.gMax}; words drawn meanwhile: ${seen.words || 'none'}`,
    );
  } finally {
    await ph.ctx.close();
  }
}
