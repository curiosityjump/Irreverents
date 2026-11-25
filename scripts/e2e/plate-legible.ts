// Brief phone-legibility-pass, inside `npm run e2e` (one call line in
// scripts/e2e.ts; docs/mechanisms/rendering-world.md, "The party plate").
//
// Fact `plate-hearts-legible`: while the party plate is faded over a body,
// its full hearts keep their contrast against what is drawn round them.
// Measured on the game canvas: every full-heart pixel that touches a pixel
// the hearts did not draw is paired with that neighbour, and the WCAG
// contrast ratio of each pair is taken; the fact holds when the median is at
// least 3 on every frame read. INTENT: 3:1 is WCAG 2.1's floor for a
// non-text mark that must be seen (SC 1.4.11); a heart is exactly that, and
// a phone in daylight loses contrast, never gains it. Read in two places:
// the forest canopy upright (the page's own hero put under the plate, as
// scripts/e2e/plate-clear.ts does) and the Hall gallery sideways at 844x390
// (walked into by touch; the balcony thrower drawn under the plate while he
// aims).
// Control, watched to fail: E2E_LEGIBLE_OLD=1 sets
// `window.irreverents.plateFade.oldFade`: the fade as before this brief
// (backing 0.25, hearts at 0.6, no rim).
// Shots: `before2/` (the same moment with oldFade) and `after2/` in
// docs/plan/step-8-shots/plate/, `canopy` and `gallery-aim` at 390x664,
// 844x390 and 750x340, with E2E_SHOTS=1 (else e2e-out/kept/).
// DRAFT: every wait and bound is a first pass with room to spare.
import fs from 'node:fs';
import path from 'node:path';
import { phone, standAt } from '../lib/e2e-touch.ts';
import type { Kit, Phone } from '../lib/e2e-touch.ts';
import { walkInto } from './outpost.ts';

/* eslint-disable @typescript-eslint/no-explicit-any */
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
const OLD = process.env.E2E_LEGIBLE_OLD === '1';
const SIZES = [
  [390, 664],
  [844, 390],
  [750, 340],
] as const;
/** INTENT: WCAG 2.1 SC 1.4.11, non-text contrast (see the header). */
const MIN_CONTRAST = 3;

const setOld = (ph: Phone, old: boolean): Promise<void> =>
  ph.page.evaluate((o: boolean) => {
    const irr = (window as any).irreverents;
    irr.plateFade = { ...(irr.plateFade ?? {}), oldFade: o };
  }, old);

const xOn = (ph: Phone, tx: number, frac = 0.5): Promise<number> =>
  ph.page.evaluate(
    ([c, f]: number[]) => {
      const irr = (window as any).irreverents;
      return (c! + f!) * 16 - irr.content.characters[irr.drawn.me.kind].box.w / 2;
    },
    [tx, frac],
  );

/** The page's own hero put at a room's tile, page-side (as scripts/e2e/plate-clear.ts). */
const place = (ph: Phone, room: string, col: number, row: number): Promise<void> =>
  ph.page.evaluate(
    ([r, c, w]: [string, number, number]) => {
      const irr = (window as any).irreverents;
      const mine = irr.world.entities.find((e: any) => e.player === irr.player);
      const rm = irr.content.rooms[r];
      const box = irr.content.characters[mine.kind].box;
      mine.room = r;
      mine.x = c * rm.tile + (rm.tile - box.w) / 2;
      mine.y = (w + 1) * rm.tile - box.h;
      mine.vx = 0;
      mine.vy = 0;
    },
    [room, col, row] as [string, number, number],
  );

interface HeartRead {
  frames: number;
  /** The lowest per-frame median contrast, and the pairs behind it. */
  worst: number | null;
  pairs: number;
  under: string[];
}

/** For `ms`, on every frame the plate is faded (at least 0.9): the median contrast of its full hearts against their neighbours on the game canvas. */
const readHearts = (ph: Phone, ms: number): Promise<HeartRead> =>
  ph.page.evaluate(
    (dur: number) =>
      new Promise<HeartRead>((resolve) => {
        const irr = (window as any).irreverents;
        const t0 = performance.now();
        const r: HeartRead = { frames: 0, worst: null, pairs: 0, under: [] };
        const lin = (v: number): number => {
          const c = v / 255;
          return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        };
        const lum = (d: Uint8ClampedArray, i: number): number => 0.2126 * lin(d[i]!) + 0.7152 * lin(d[i + 1]!) + 0.0722 * lin(d[i + 2]!);
        const tick = (): void => {
          const hud = irr.drawn.hud;
          const L = hud?.layer;
          if (hud && L && hud.fade >= 0.9) {
            const lw = L.canvas.width;
            const lh = L.canvas.height;
            const lp = (L.canvas as HTMLCanvasElement).getContext('2d')!.getImageData(0, 0, lw, lh).data;
            const game = document.getElementById('game') as HTMLCanvasElement;
            const sp = game.getContext('2d')!.getImageData(L.x, L.y, lw, lh).data;
            const inRows = (px: number, py: number): boolean => (hud.heartRows as any[]).some((b) => px >= b.x && px < b.x + b.w && py >= b.y && py < b.y + b.h);
            const drawnAt = (i: number): boolean => lp[i * 4 + 3]! > 0;
            const full = (i: number): boolean => lp[i * 4 + 3]! >= 200 && lp[i * 4]! > 150 && lp[i * 4]! - lp[i * 4 + 1]! > 60;
            const ratios: number[] = [];
            for (let y = 1; y < lh - 1; y++)
              for (let x = 1; x < lw - 1; x++) {
                const i = y * lw + x;
                if (!full(i) || !inRows(L.x + x, L.y + y)) continue;
                for (const j of [i - 1, i + 1, i - lw, i + lw]) {
                  if (drawnAt(j)) continue;
                  const a = lum(sp, i * 4);
                  const b = lum(sp, j * 4);
                  ratios.push((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05));
                }
              }
            if (ratios.length > 0) {
              ratios.sort((p, q) => p - q);
              const med = ratios[Math.floor(ratios.length / 2)]!;
              r.frames++;
              r.pairs = ratios.length;
              if (r.worst === null || med < r.worst) r.worst = Math.round(med * 100) / 100;
              r.under = hud.under;
            }
          }
          if (performance.now() - t0 > dur) return resolve(r);
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }),
    ms,
  );

const heartsOk = (h: HeartRead): boolean => h.frames >= 10 && h.worst !== null && h.worst >= MIN_CONTRAST;
const heartsText = (h: HeartRead): string =>
  `${h.frames} faded frames read; the full hearts' median contrast against their neighbours at worst ${h.worst ?? '-'} (at least ${MIN_CONTRAST}), ${h.pairs} pairs; under the plate ${JSON.stringify(h.under)}`;

/** Until the page draws the plate faded at least `min` (or `ms`). */
const fadedBy = (ph: Phone, min: number, ms: number): Promise<boolean> =>
  ph.page
    .waitForFunction((m: number) => ((window as any).irreverents.drawn.hud?.fade ?? 0) >= m, min, { polling: 'raf', timeout: ms })
    .then(
      () => true,
      () => false,
    );

/** One shot at a size with the old fade to `before2/`, and as now to `after2/`. */
async function shotPair(ph: Phone, dir: string, name: string, w: number, h: number, when: () => Promise<void>): Promise<void> {
  await ph.page.setViewportSize({ width: w, height: h });
  await sleep(400);
  for (const which of ['before2', 'after2'] as const) {
    await setOld(ph, which === 'before2');
    await when();
    fs.mkdirSync(path.join(dir, which), { recursive: true });
    await ph.page.screenshot({ path: path.join(dir, which, `${name}-${w}x${h}.png`) });
  }
  await setOld(ph, OLD);
}

/** Until the page draws `id` aiming (or `ms`), then a beat. */
const aimStarts = (ph: Phone, id: string, ms: number): Promise<void> =>
  ph.page
    .waitForFunction((who: string) => ((window as any).irreverents.drawn.ranged?.aims ?? []).some((a: any) => a.id === who), id, { polling: 'raf', timeout: ms })
    .then(
      () => sleep(200),
      () => undefined,
    );

export async function plateLegibleFacts(kit: Kit & { shots: string }): Promise<void> {
  const { fact } = kit;
  const url = `${kit.base}/?room=e2e-legible-${Math.random().toString(36).slice(2, 10)}`;
  // Two idle pages first, so page C plays the third hero (whose plate, at 844x390 by column 14, lies over the balcony thrower, as in step-8-shots/plate/after/gallery-aim-844x390); measured, they stay at the spawn.
  const A = await phone(kit, url, 'legible A');
  const B = await phone(kit, url, 'legible B');
  const C = await phone(kit, url, 'legible C');
  const D = await phone(kit, url, 'legible D');
  try {
    await setOld(C, OLD);
    await setOld(D, OLD);
    await sleep(600);
    // ---- the gallery, sideways: the balcony thrower under the plate while he aims (as scripts/e2e/plate-clear.ts) ----
    await C.page.setViewportSize({ width: 844, height: 390 });
    const there = (await walkInto(C, 1, 'castle-street')) && (await walkInto(C, 1, 'courtyard')) && (await walkInto(D, 1, 'castle-street')) && (await walkInto(D, 1, 'courtyard'));
    await standAt(C, await xOn(C, 16), 1);
    await standAt(D, await xOn(D, 22), -1);
    await C.page
      .waitForFunction(() => (window as any).irreverents.drawn.parts.find((q: any) => q.part === 'plate-gate')?.on === true, null, { polling: 'raf', timeout: 4000 })
      .catch(() => undefined);
    const inGallery = there && (await walkInto(C, 1, 'hall-gallery', 12000));
    if (inGallery) await standAt(C, await xOn(C, 14), 1);
    const galleryFaded = inGallery && (await fadedBy(C, 0.9, 8000));
    console.log(`      (plate-legible) page C plays ${(await C.page.evaluate(() => (window as any).irreverents.drawn.me.kind))}`);
    const gallery = galleryFaded ? await readHearts(C, 4000) : null;
    const T = 'gallery-thrower-1';
    if (inGallery && !OLD) for (const [w, h] of SIZES) await shotPair(C, kit.shots, 'gallery-aim', w, h, () => aimStarts(C, T, 6000));

    // ---- the canopy, upright: the page's own hero under the plate ----
    await C.page.setViewportSize({ width: 390, height: 664 });
    await sleep(300);
    await place(C, 'forest-trail', 50, 2);
    const canopyFaded = await fadedBy(C, 0.95, 2000);
    const canopy = canopyFaded ? await readHearts(C, 2000) : null;
    if (!OLD)
      for (const [w, h] of SIZES)
        await shotPair(C, kit.shots, 'canopy', w, h, async () => {
          await place(C, 'forest-trail', 50, 2);
          await fadedBy(C, 0.95, 1500);
          await sleep(250);
        });
    fact(
      'plate-hearts-legible',
      gallery !== null && canopy !== null && heartsOk(gallery) && heartsOk(canopy),
      `${OLD ? '(CONTROL: the old fade) ' : ''}the Hall gallery at 844x390, page C walked in by touch (${inGallery}), the plate faded (${galleryFaded}): ${gallery ? heartsText(gallery) : '-'}; the canopy upright 390x664, the page's own hero placed under the plate (faded ${canopyFaded}): ${canopy ? heartsText(canopy) : '-'}`,
    );
  } finally {
    for (const ph of [A, B, C]) await ph.ctx.close().catch(() => undefined);
    await D.ctx.close().catch(() => undefined);
  }
}
