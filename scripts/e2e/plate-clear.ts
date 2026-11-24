// Brief plate-clear-of-bodies, inside `npm run e2e` (one call line in
// scripts/e2e.ts; docs/mechanisms/rendering-world.md, "The party plate").
// The camera cannot go above a room's top, so three looks found a body at
// the top of a room hidden by the party plate or the picture's top edge.
//
// Fact `plate-fade-under` (the forest's canopy, upright 390x664): a phone
// page's own hero put on the canopy (rows 1-2 of the Bramble Trail, column
// 50) by a page-side placement, as tools/scenario-bots/shots.mjs takes its
// forest shots (INTENT: the canopy is reached only by the flyer's flight
// along the trail, minutes of touch; what is checked is the drawing, which
// is the page's own). The page draws the hero under the plate's rectangle;
// within 1 s the plate is faded (`drawn.hud.fade` at least 0.95, the hero in
// `drawn.hud.under`), its faces still drawn; put back on the trail's floor
// (row 8), the plate is solid again within 3 s.
// Fact `plate-aim-mark-gallery` (sideways 844x390, then 750x340): two pages
// open the courtyard's gate as scripts/e2e/camera.ts does and page A walks
// by touch into the Hall gallery to column 14. On every frame of the
// thrower's aim where part of him is outside the picture, the page draws an
// arrow for him at the picture's edge (`drawn.hud.aimMarks`), inside the
// picture and clear of the plate.
// Measured, not a fact (printed): pages A and B go down the
// cellar doorway, hold the stone plate (where the stair thrower aims, whole in
// the picture) and drop into the pocket (where he is cut by the top edge but never aims).
// Control, watched to fail: E2E_PLATE_OLD=1 sets
// `window.irreverents.plateFade.off` on every page: the plate as before (no
// fade, no arrow), and both facts fail.
// Shots: `before/` (the same moment with plateFade.off for one shot) and
// `after/`, at 390x664, 844x390 and 750x340, in docs/plan/step-8-shots/plate/
// with E2E_SHOTS=1 (else e2e-out/kept/).
// DRAFT: every wait and bound is a first pass with room to spare.
import fs from 'node:fs';
import path from 'node:path';
import { me, phone, settle, standAt, steer, tap } from '../lib/e2e-touch.ts';
import type { Kit, Phone } from '../lib/e2e-touch.ts';
import { walkInto } from './outpost.ts';

/* eslint-disable @typescript-eslint/no-explicit-any */
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
const OLD = process.env.E2E_PLATE_OLD === '1';
const SIZES = [
  [390, 664],
  [844, 390],
  [750, 340],
] as const;

const xOn = (ph: Phone, tx: number, frac = 0.5): Promise<number> =>
  ph.page.evaluate(
    ([c, f]: number[]) => {
      const irr = (window as any).irreverents;
      return (c! + f!) * 16 - irr.content.characters[irr.drawn.me.kind].box.w / 2;
    },
    [tx, frac],
  );

const setOld = (ph: Phone, off: boolean): Promise<void> =>
  ph.page.evaluate((o: boolean) => {
    (window as any).irreverents.plateFade = { off: o };
  }, off);

/** The page's own hero put at a room's tile (feet on the tile's bottom), page-side, as tools/scenario-bots/shots.mjs does. */
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

/** How much of a body the page drew under the plate and outside the picture this frame, px². */
const plateNow = (ph: Phone, id: string | null): Promise<any> =>
  ph.page.evaluate((who: string | null) => {
    const irr = (window as any).irreverents;
    const d = irr.drawn;
    const W = irr.view.w;
    const H = irr.view.h;
    const e = who ? (d.entities as any[]).find((q) => q.id === who) : d.me;
    if (!e || !d.hud) return { hud: d.hud ?? null };
    const b = irr.content.characters[e.kind].box;
    const x = e.px - d.camera.x;
    const y = e.py - d.camera.y;
    const p = d.hud.box;
    const ov = (a0: number, a1: number, b0: number, b1: number): number => Math.max(0, Math.min(a1, b1) - Math.max(a0, b0));
    const inside = ov(x, x + b.w, 0, W) * ov(y, y + b.h, 0, H);
    const under = ov(x, x + b.w, p.x, p.x + p.w) * ov(y, y + b.h, p.y, p.y + p.h);
    return { W, H, body: { x, y, w: b.w, h: b.h }, area: b.w * b.h, under, outside: b.w * b.h - inside, fade: d.hud.fade, underIds: d.hud.under, faces: d.hud.faces.length, marks: d.hud.aimMarks, box: p };
  }, id);

/** Waits, by frames, until the page's plate fade is at least `min` (or at most `max`); the time taken, or null. */
const fadeUntil = (ph: Phone, cmp: 'min' | 'max', v: number, ms: number): Promise<number | null> =>
  ph.page.evaluate(
    ([c, val, dur]: [string, number, number]) =>
      new Promise<number | null>((resolve) => {
        const t0 = performance.now();
        const tick = (): void => {
          const f = (window as any).irreverents.drawn.hud?.fade ?? 0;
          if (c === 'min' ? f >= val : f <= val) return resolve(Math.round(performance.now() - t0));
          if (performance.now() - t0 > dur) return resolve(null);
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }),
    [cmp, v, ms] as [string, number, number],
  );

interface AimWatch {
  aimFrames: number;
  outFrames: number;
  marked: number;
  bad: string[];
  most: { outside: number; seenH: number; h: number } | null;
}

/** Every frame for `ms`: frames the thrower `id` is drawn aiming, those with part of him outside the picture, how many of those drew his arrow, and any arrow outside the picture or over the plate. */
const watchAim = (ph: Phone, id: string, ms: number): Promise<AimWatch> =>
  ph.page.evaluate(
    ([who, dur]: [string, number]) =>
      new Promise<AimWatch>((resolve) => {
        const irr = (window as any).irreverents;
        const t0 = performance.now();
        const r: AimWatch = { aimFrames: 0, outFrames: 0, marked: 0, bad: [], most: null };
        const tick = (): void => {
          const d = irr.drawn;
          const W = irr.view.w;
          const H = irr.view.h;
          const aiming = (d.ranged?.aims ?? []).some((a: any) => a.id === who);
          const e = (d.entities as any[]).find((q) => q.id === who);
          if (aiming && e && d.hud) {
            r.aimFrames++;
            const b = irr.content.characters[e.kind].box;
            const x = e.px - d.camera.x;
            const y = e.py - d.camera.y;
            const out = y < 0 || x < 0 || x + b.w > W;
            const seenH = Math.max(0, Math.min(H, y + b.h) - Math.max(0, y));
            const outside = b.w * b.h - Math.max(0, Math.min(W, x + b.w) - Math.max(0, x)) * seenH;
            if (!r.most || outside > r.most.outside) r.most = { outside, seenH, h: b.h };
            if (out) {
              r.outFrames++;
              const m = (d.hud.aimMarks ?? []).find((q: any) => q.id === who);
              if (m) {
                r.marked++;
                const p = d.hud.box;
                const over = m.x + 6 >= p.x && m.x - 6 <= p.x + p.w && m.y + 6 >= p.y && m.y - 1 <= p.y + p.h;
                if (m.x < 0 || m.y < 0 || m.x > W || m.y > H || over) if (r.bad.length < 3) r.bad.push(JSON.stringify(m));
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

const aimOk = (w: AimWatch): boolean => w.outFrames >= 10 && w.marked >= w.outFrames - 2 && w.bad.length === 0;
const aimText = (w: AimWatch): string =>
  `${w.aimFrames} frames drew his aim; ${w.outFrames} of them with part of him outside the picture (at most ${w.most ? `${w.most.outside} of his ${w.most.h * 14} px², ${w.most.seenH} of his ${w.most.h} px height in the picture` : '?'}); his arrow drawn on ${w.marked} of those (all but 2 at most); arrows outside the picture or over the plate: ${w.bad.length ? w.bad.join(' ') : 'none'}`;

/** One shot at a size, with the plate as before (plateFade.off) to `before/` and as now to `after/`. */
async function shotPair(ph: Phone, dir: string, name: string, w: number, h: number, when?: () => Promise<void>): Promise<void> {
  await ph.page.setViewportSize({ width: w, height: h });
  await sleep(400);
  for (const which of ['before', 'after'] as const) {
    // The plate's state first, then the moment (an aim lasts 0.6 s: the shot inside it).
    await setOld(ph, which === 'before');
    if (when) await when();
    else await sleep(450);
    fs.mkdirSync(path.join(dir, which), { recursive: true });
    await ph.page.screenshot({ path: path.join(dir, which, `${name}-${w}x${h}.png`) });
  }
  await setOld(ph, OLD);
}

/** Until the page draws `id` aiming (or `ms`). */
const aimStarts = (ph: Phone, id: string, ms: number): Promise<void> =>
  ph.page
    .waitForFunction((who: string) => ((window as any).irreverents.drawn.ranged?.aims ?? []).some((a: any) => a.id === who), id, { polling: 'raf', timeout: ms })
    .then(
      () => sleep(200),
      () => undefined,
    );

/** Into the undercroft from the street: Use at the cellar doorway (as scripts/e2e/plates.ts's `down`). */
async function down(ph: Phone): Promise<boolean> {
  const doorX = await ph.page.evaluate(() => {
    const irr = (window as any).irreverents;
    const d = irr.content.rooms['castle-street'].doors.find((q: any) => q.id === 'cellar-doorway');
    return d.tx * 16 + (d.w * 16 - irr.content.characters[irr.drawn.me.kind].box.w) / 2;
  });
  for (let i = 0; i < 3; i++) {
    await standAt(ph, doorX, 0);
    if (!(await tap(ph, 'interact'))) return false;
    try {
      await ph.page.waitForFunction(() => (window as any).irreverents.drawn.room === 'undercroft', null, { polling: 'raf', timeout: 4000 });
      await settle(ph);
      return true;
    } catch {
      if ((await ph.page.evaluate(() => (window as any).irreverents.drawn.room)) !== 'castle-street') return false;
    }
  }
  return false;
}

export async function plateClearFacts(kit: Kit & { shots: string }): Promise<void> {
  const { fact } = kit;
  const url = `${kit.base}/?room=e2e-plate-${Math.random().toString(36).slice(2, 10)}`;
  const A = await phone(kit, url, 'plate A');
  const B = await phone(kit, url, 'plate B');
  const extra: Phone[] = [];
  try {
    await setOld(A, OLD);
    await setOld(B, OLD);
    await sleep(600);

    // ---- the undercroft, sideways: both pages down the cellar doorway, onto the stone plate (as scripts/e2e/plates.ts), and through the grate into the pocket under the stair thrower ----
    await A.page.setViewportSize({ width: 844, height: 390 });
    await B.page.setViewportSize({ width: 844, height: 390 });
    const under = (await walkInto(A, 1, 'castle-street')) && (await down(A)) && (await walkInto(B, 1, 'castle-street')) && (await down(B));
    if (under) {
      await standAt(A, await xOn(A, 17, 0.6), -1);
      await standAt(B, await xOn(B, 19, 0.5), -1);
      const by = await watchAim(A, 'undercroft-thrower', 5000);
      console.log(`      (plate-clear) measure: by the stone plate (page A, 844x390, column 17) the stair thrower aims: ${aimText(by)}`);
      await A.page
        .waitForFunction(() => (window as any).irreverents.drawn.parts.find((q: any) => q.part === 'grate')?.on === true, null, { polling: 'raf', timeout: 4000 })
        .catch(() => undefined);
      await Promise.all([steer(A, -1, await xOn(A, 14, 0.9), 4000), steer(B, -1, await xOn(B, 14, 0.9), 4000)]);
      await sleep(900);
      await Promise.all([settle(A), settle(B)]);
    }
    const inPocket = under && ((await me(A)).y as number) >= 14 * 16;
    const U = 'undercroft-thrower';
    // INTENT (measured, not a fact): in the pocket the stair thrower never aims (he cannot see down
    // into it), and the brief keeps the arrow for a body aiming at you, so nothing here changes:
    // printed for the record (docs/plan/step-8.md, "The plate clear of bodies").
    for (const [w, h] of [[844, 390], [750, 340]] as const) {
      if (!inPocket) break;
      await A.page.setViewportSize({ width: w, height: h });
      await sleep(400);
      const seen = await plateNow(A, U);
      const pw = await watchAim(A, U, 5000);
      console.log(`      (plate-clear) measure: the undercroft's pocket at ${w}x${h}: the stair thrower drawn at ${JSON.stringify(seen.body)}, ${seen.outside} of his ${seen.area} px² outside the picture, ${seen.under} under the plate; ${pw.aimFrames} frames of 5 s drew his aim`);
    }
    if (inPocket && !OLD) for (const [w, h] of SIZES) await shotPair(A, kit.shots, 'pocket-aim', w, h, () => aimStarts(A, U, 6000));
    await A.ctx.close();
    await B.ctx.close();
    // Fresh pages for the gallery (the first pages are down in the pocket).
    const C = await phone(kit, url, 'plate C');
    extra.push(C);
    const D = await phone(kit, url, 'plate D');
    extra.push(D);
    await setOld(C, OLD);
    await setOld(D, OLD);
    await sleep(600);
    // ---- the gallery, sideways: an arrow at the edge for the balcony thrower ----
    await C.page.setViewportSize({ width: 844, height: 390 });
    const there = (await walkInto(C, 1, 'castle-street')) && (await walkInto(C, 1, 'courtyard')) && (await walkInto(D, 1, 'castle-street')) && (await walkInto(D, 1, 'courtyard'));
    await standAt(C, await xOn(C, 16), 1);
    await standAt(D, await xOn(D, 22), -1);
    await C.page
      .waitForFunction(() => (window as any).irreverents.drawn.parts.find((q: any) => q.part === 'plate-gate')?.on === true, null, { polling: 'raf', timeout: 4000 })
      .catch(() => undefined);
    const inGallery = there && (await walkInto(C, 1, 'hall-gallery', 12000));
    if (inGallery) await standAt(C, await xOn(C, 14), 1);
    const T = 'gallery-thrower-1';
    const g844 = inGallery ? await watchAim(C, T, 6000) : null;
    let g750: AimWatch | null = null;
    if (inGallery) {
      await C.page.setViewportSize({ width: 750, height: 340 });
      await sleep(400);
      g750 = await watchAim(C, T, 6000);
    }
    fact(
      'plate-aim-mark-gallery',
      inGallery && g844 !== null && g750 !== null && aimOk(g844) && aimOk(g750),
      `page C walked by touch into the Hall gallery (${inGallery}) to column 14${OLD ? ' (CONTROL: the plate as before)' : ''}; over 6 s at 844x390: ${g844 ? aimText(g844) : '-'}; over 6 s at 750x340: ${g750 ? aimText(g750) : '-'}`,
    );
    if (inGallery && !OLD) for (const [w, h] of SIZES) await shotPair(C, kit.shots, 'gallery-aim', w, h, () => aimStarts(C, T, 6000));

    // ---- the canopy, upright: the plate fades over the page's own hero (last: the page-side placement leaves page C's own copy apart from the server's) ----
    await C.page.setViewportSize({ width: 390, height: 664 });
    await sleep(300);
    // From a solid plate: first on the trail's floor, nobody under it.
    await place(C, 'forest-trail', 12, 8);
    const solid = await fadeUntil(C, 'max', 0, 3000);
    await place(C, 'forest-trail', 50, 2);
    const faded = await fadeUntil(C, 'min', 0.95, 1000);
    const atTop = await plateNow(C, null);
    const mine = (await me(C)).id as string;
    if (!OLD)
      for (const [w, h] of SIZES)
        await shotPair(C, kit.shots, 'canopy', w, h, async () => {
          await place(C, 'forest-trail', 50, 2);
        });
    await C.page.setViewportSize({ width: 390, height: 664 });
    await place(C, 'forest-trail', 50, 2);
    await fadeUntil(C, 'min', 0.95, 1000);
    await place(C, 'forest-trail', 12, 8);
    const back = await fadeUntil(C, 'max', 0, 3000);
    const below = await plateNow(C, null);
    fact(
      'plate-fade-under',
      solid !== null && faded !== null && atTop.under > 0 && (atTop.underIds ?? []).includes(mine) && atTop.faces >= 1 && back !== null && below.under === 0,
      `upright 390x664, page C's own hero put on the forest canopy (column 50, row 2) from the trail's floor (plate solid first: ${solid !== null})${OLD ? ' (CONTROL: the plate as before)' : ''}: ${atTop.under} of its ${atTop.area} px² drawn under the plate (${JSON.stringify(atTop.box)}), ${atTop.outside} outside the picture; the plate faded to at least 0.95 ${faded === null ? 'NEVER within 1 s' : `after ${faded} ms`} (fade ${atTop.fade}, under ${JSON.stringify(atTop.underIds)}, ${atTop.faces} faces drawn); put back on the trail's floor (row 8, ${below.under} px² under it): solid again ${back === null ? 'NEVER within 3 s' : `after ${back} ms`}`,
    );

  } finally {
    await A.ctx.close().catch(() => undefined);
    await B.ctx.close().catch(() => undefined);
    for (const ph of extra) await ph.ctx.close().catch(() => undefined);
  }
}
