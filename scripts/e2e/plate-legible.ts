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
// Fact `aim-arrow-clear` (brief item 2): in the same gallery, at 844x390 and
// 750x340, on every frame the balcony thrower aims at page C with part of
// him outside the picture, his arrow is drawn, red at its middle, inside the
// picture, and its box meets neither his picture (his box and 10 px round it,
// 26 on his throwing side: his held shot and its burst), nor the plate, nor the
// menu button. Control, watched to fail: E2E_ARROW_OLD=1 sets
// `plateFade.oldArrow`, the arrow as before (cream, beside his box).
// Shots: `arrow/before/` and `arrow/after/gallery-aim-*`.
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
const OLD_ARROW = process.env.E2E_ARROW_OLD === '1';
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
const setOldArrow = (ph: Phone, old: boolean): Promise<void> =>
  ph.page.evaluate((o: boolean) => {
    const irr = (window as any).irreverents;
    irr.plateFade = { ...(irr.plateFade ?? {}), oldArrow: o };
  }, old);

interface ArrowWatch {
  outFrames: number;
  marked: number;
  /** Frames whose arrow met his picture, the plate or the menu button, or left the picture; the first few. */
  bad: string[];
  badFrames: number;
  red: number;
}

/**
 * Every frame for `ms` while the thrower `id` is drawn aiming with part of him outside the picture: whether his arrow is
 * drawn, and whether its box meets his picture (his box, `REACH` px round it, from his sprite's top: his held shot and
 * its burst), the plate's box or the menu button's (the button's own rect, read from the page), or leaves the picture;
 * and on how many frames the arrow's middle pixel on the game canvas is red.
 */
const watchArrow = (ph: Phone, id: string, ms: number): Promise<ArrowWatch> =>
  ph.page.evaluate(
    ([who, dur]: [string, number]) =>
      new Promise<ArrowWatch>((resolve) => {
        const irr = (window as any).irreverents;
        const t0 = performance.now();
        const r: ArrowWatch = { outFrames: 0, marked: 0, bad: [], badFrames: 0, red: 0 };
        const meets = (a: any, b: any): boolean => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
        const game = document.getElementById('game') as HTMLCanvasElement;
        const tick = (): void => {
          const d = irr.drawn;
          const W = irr.view.w;
          const H = irr.view.h;
          const aiming = (d.ranged?.aims ?? []).some((a: any) => a.id === who);
          const e = (d.entities as any[]).find((q) => q.id === who);
          if (aiming && e && d.hud) {
            const b = irr.content.characters[e.kind].box;
            const x = e.px - d.camera.x;
            const y = e.py - d.camera.y;
            if (y < 0 || x < 0 || x + b.w > W) {
              r.outFrames++;
              const m = (d.hud.aimMarks ?? []).find((q: any) => q.id === who);
              if (m) {
                r.marked++;
                // His throwing side (toward page C's hero) reaches 26 px: his held shot and its burst.
                const REACH = 10;
                const toward = d.me && d.me.px > e.px ? 1 : -1;
                const lr = toward > 0 ? REACH : 26;
                const rr = toward > 0 ? 26 : REACH;
                const top = Math.min(y, e.top ?? y);
                const him = { x: x - lr, y: top - REACH, w: b.w + lr + rr, h: y + b.h - top + REACH };
                const cr = game.getBoundingClientRect();
                const sx = game.width / cr.width;
                const mb = document.getElementById('menu-btn')!.getBoundingClientRect();
                const menu = { x: (mb.left - cr.left) * sx, y: (mb.top - cr.top) * sx, w: mb.width * sx, h: mb.height * sx };
                const a = m.box;
                const why = [meets(a, him) ? 'him' : '', meets(a, d.hud.box) ? 'plate' : '', meets(a, menu) ? 'menu' : '', a.x < 0 || a.y < 0 || a.x + a.w > W || a.y + a.h > H ? 'outside' : ''].filter(Boolean);
                if (why.length) {
                  r.badFrames++;
                  if (r.bad.length < 3) r.bad.push(`${why.join('+')}: arrow ${JSON.stringify(a)} him ${JSON.stringify(him)} plate ${JSON.stringify(d.hud.box)} menu ${JSON.stringify(menu)}`);
                }
                const px = game.getContext('2d')!.getImageData(Math.round(a.x + a.w / 2), Math.round(a.y + a.h / 2), 1, 1).data;
                if (px[0]! > 180 && px[1]! < 150 && px[2]! < 160 && px[0]! - px[1]! > 60) r.red++;
              }
            }
          }
          if (performance.now() - t0 > dur) return resolve(r);
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }),
    [id, ms] as [string, number],
  );
const arrowOk = (w: ArrowWatch): boolean => w.outFrames >= 10 && w.marked >= w.outFrames - 2 && w.badFrames === 0 && w.red >= w.marked - 2;
const arrowText = (w: ArrowWatch): string =>
  `${w.outFrames} frames drew him aiming with part of him outside the picture; his arrow on ${w.marked} (all but 2 at most), red at its middle on ${w.red}; frames where it met his picture, the plate or the menu button, or left the picture: ${w.badFrames}${w.bad.length ? ` (${w.bad.join('; ')})` : ''}`;

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
const readHearts = (ph: Phone, ms: number, hold: [string, number, number] | null = null): Promise<HeartRead> =>
  ph.page.evaluate(
    ([dur, at]: [number, [string, number, number] | null]) =>
      new Promise<HeartRead>((resolve) => {
        const irr = (window as any).irreverents;
        // With `at`, the page's own hero is put back there every frame (the server's copy may pull a page-side placement away).
        const keep = (): void => {
          if (!at) return;
          const mine = irr.world.entities.find((e: any) => e.player === irr.player);
          const rm = irr.content.rooms[at[0]];
          const box = irr.content.characters[mine.kind].box;
          mine.room = at[0];
          mine.x = at[1] * rm.tile + (rm.tile - box.w) / 2;
          mine.y = (at[2] + 1) * rm.tile - box.h;
          mine.vx = 0;
          mine.vy = 0;
        };
        const t0 = performance.now();
        const r: HeartRead = { frames: 0, worst: null, pairs: 0, under: [] };
        const lin = (v: number): number => {
          const c = v / 255;
          return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        };
        const lum = (d: Uint8ClampedArray, i: number): number => 0.2126 * lin(d[i]!) + 0.7152 * lin(d[i + 1]!) + 0.0722 * lin(d[i + 2]!);
        const tick = (): void => {
          keep();
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
    [ms, hold] as [number, [string, number, number] | null],
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

/** Until the page draws an edge arrow for `id` (or `ms`): the shot is taken on that frame's heels, inside the aim. */
const arrowDrawn = (ph: Phone, id: string, ms: number): Promise<void> =>
  ph.page
    .waitForFunction((who: string) => ((window as any).irreverents.drawn.hud?.aimMarks ?? []).some((m: any) => m.id === who), id, { polling: 'raf', timeout: ms })
    .then(
      () => undefined,
      () => undefined,
    );

/** The arrow's shots: `arrow/before/` (the old arrow, same moment) and `arrow/after/`, named gallery-aim. */
async function arrowShots(ph: Phone, dir: string, w: number, h: number, when: () => Promise<void>): Promise<void> {
  await ph.page.setViewportSize({ width: w, height: h });
  await sleep(400);
  for (const which of ['before', 'after'] as const) {
    await setOldArrow(ph, which === 'before');
    await when();
    fs.mkdirSync(path.join(dir, 'arrow', which), { recursive: true });
    await ph.page.screenshot({ path: path.join(dir, 'arrow', which, `gallery-aim-${w}x${h}.png`) });
  }
  await setOldArrow(ph, OLD_ARROW);
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
    await setOld(B, OLD);
    await setOldArrow(C, OLD_ARROW);
    await sleep(600);
    // ---- the canopy, upright, first: idle page B's own hero under the plate, before anyone has been hit (read later, the heroes in the gallery and the courtyard had lost every full heart) ----
    await B.page.setViewportSize({ width: 390, height: 664 });
    await sleep(300);
    await place(B, 'forest-trail', 50, 2);
    const canopyFaded = await fadedBy(B, 0.95, 2000);
    const canopy = canopyFaded ? await readHearts(B, 2000, ['forest-trail', 50, 2]) : null;
    if (!OLD)
      for (const [w, h] of SIZES)
        await shotPair(B, kit.shots, 'canopy', w, h, async () => {
          await place(B, 'forest-trail', 50, 2);
          await fadedBy(B, 0.95, 1500);
          await sleep(250);
        });
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
    // The arrow (brief item 2), at both sideways sizes, from the same spot.
    const a844 = inGallery ? await watchArrow(C, T, 6000) : null;
    let a750: ArrowWatch | null = null;
    if (inGallery) {
      await C.page.setViewportSize({ width: 750, height: 340 });
      await sleep(400);
      a750 = await watchArrow(C, T, 6000);
      await C.page.setViewportSize({ width: 844, height: 390 });
      await sleep(400);
    }
    fact(
      'aim-arrow-clear',
      a844 !== null && a750 !== null && arrowOk(a844) && arrowOk(a750),
      `${OLD_ARROW ? '(CONTROL: the old arrow) ' : ''}page C by touch in the Hall gallery at column 14 (${inGallery}); over 6 s at 844x390: ${a844 ? arrowText(a844) : '-'}; over 6 s at 750x340: ${a750 ? arrowText(a750) : '-'}`,
    );
    if (inGallery && !OLD && !OLD_ARROW) for (const [w, h] of SIZES) await arrowShots(C, kit.shots, w, h, () => arrowDrawn(C, T, 15000));
    if (inGallery && !OLD && !OLD_ARROW) for (const [w, h] of SIZES) await shotPair(C, kit.shots, 'gallery-aim', w, h, () => aimStarts(C, T, 6000));

    fact(
      'plate-hearts-legible',
      gallery !== null && canopy !== null && heartsOk(gallery) && heartsOk(canopy),
      `${OLD ? '(CONTROL: the old fade) ' : ''}the Hall gallery at 844x390, page C walked in by touch (${inGallery}), the plate faded (${galleryFaded}): ${gallery ? heartsText(gallery) : '-'}; the canopy upright 390x664, page B's own hero placed under the plate (faded ${canopyFaded}): ${canopy ? heartsText(canopy) : '-'}`,
    );
  } finally {
    for (const ph of [A, B, C]) await ph.ctx.close().catch(() => undefined);
    await D.ctx.close().catch(() => undefined);
  }
}
