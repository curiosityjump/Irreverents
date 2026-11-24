// Step 5, brief camera-looks-at-what-matters, inside `npm run e2e` (one call
// line in scripts/e2e.ts; docs/mechanisms/rendering-world.md, "The camera
// leans up"). Two phone pages held sideways (844x390) in a private world, by
// touch only: they open the courtyard's gate as scripts/e2e/ranged.ts does,
// and page A walks on into the Hall gallery and along its floor to column 14,
// below and in front of the thrower on the balcony. INTENT: column 14, not
// 15: at 750x340 a hero a few px further east stands beside the grab button
// once the view slides left, and the camera then (rightly) keeps him clear of
// it rather than lean, leaving the thrower partly under the plate
// (docs/plan/step-5.md, "Camera", weakest).
// Fact `camera-aim-in-picture`: on the last frame page A draws his aim before
// his shot leaves, the page draws him whole inside the picture and at most a
// quarter of him under the party plate, the top of his arc and where it comes
// down inside the picture, and A's own hero whole inside it with no touch
// control over him; and the camera never jumped more than LEAP_MAX px in one
// frame on the way (easing, never snapping).
// Control, watched to fail: E2E_CAMERA_OLD=1 sets
// `window.irreverents.cameraLean.off` on page A, the camera as before (it
// keeps the floor: the thrower is off the top of the picture).
// Wanted, not required (printed): standing behind him (column 5, no aim),
// the stick held up leans the camera up (`drawn.lean.why` "look").
// Shots: docs/plan/step-5-shots/camera/after/ with E2E_SHOTS=1 (else e2e-out/kept/), sideways at 844x390 and
// 750x340, and upright 390x664.
// DRAFT: every wait and bound is a first pass with room to spare.
import fs from 'node:fs';
import path from 'node:path';
import { phone, pointOn, settle, standAt } from '../lib/e2e-touch.ts';
import type { Kit, Phone } from '../lib/e2e-touch.ts';
import { walkInto } from './outpost.ts';

/* eslint-disable @typescript-eslint/no-explicit-any */
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
const OLD = process.env.E2E_CAMERA_OLD === '1';
const THROWER = 'gallery-thrower-1';
/** DRAFT: the most the camera may move in one frame, px (its whole lean here is about 40). */
const LEAP_MAX = 12;

const xOn = (ph: Phone, tx: number): Promise<number> =>
  ph.page.evaluate((c: number) => {
    const irr = (window as any).irreverents;
    return (c + 0.5) * 16 - irr.content.characters[irr.drawn.me.kind].box.w / 2;
  }, tx);

interface Seen {
  ok: boolean;
  text: string;
  leap: number;
  frames: number;
}

/** Every frame until his shot leaves (or `ms`): the picture on the last frame drawing his aim, and the camera's largest one-frame move. */
const watch = (ph: Phone, ms: number): Promise<Seen> =>
  ph.page.evaluate(
    ([id, dur]: [string, number]) =>
      new Promise<Seen>((resolve) => {
        const irr = (window as any).irreverents;
        const t0 = performance.now();
        let leap = 0;
        let frames = 0;
        let prev: { x: number; y: number } | null = null;
        let lastAim: any = null;
        const before = new Set<string>((irr.drawn.weapons.loose as any[]).filter((l) => l.weapon === 'thrown-shot').map((l) => l.id));
        const look = (): any => {
          const d = irr.drawn;
          const cam = d.camera;
          const W = irr.view.w;
          const H = irr.view.h;
          const a = (d.ranged?.aims ?? []).find((x: any) => x.id === id);
          const t = (d.entities as any[]).find((e) => e.id === id);
          if (!a || !t) return null;
          const tb = irr.content.characters[t.kind].box;
          const mb = irr.content.characters[d.me.kind].box;
          const him = { x: t.px - cam.x, y: t.py - cam.y, w: tb.w, h: tb.h };
          const me = { x: d.me.px - cam.x, y: d.me.py - cam.y, w: mb.w, h: mb.h };
          const plate = d.hud?.box ?? { x: 0, y: 0, w: 0, h: 0 };
          const ow = Math.max(0, Math.min(him.x + him.w, plate.x + plate.w) - Math.max(him.x, plate.x));
          const oh = Math.max(0, Math.min(him.y + him.h, plate.y + plate.h) - Math.max(him.y, plate.y));
          const canvas = document.getElementById('game')!.getBoundingClientRect();
          const sx = W / canvas.width;
          const sy = H / canvas.height;
          let overMe = 0;
          for (const el of document.querySelectorAll<HTMLElement>('[data-stick], [data-action]')) {
            const b = el.getBoundingClientRect();
            if (b.width <= 0) continue;
            const c = { x: (b.left - canvas.left) * sx, y: (b.top - canvas.top) * sy, w: b.width * sx, h: b.height * sy };
            const w = Math.max(0, Math.min(me.x + me.w, c.x + c.w) - Math.max(me.x, c.x));
            const h = Math.max(0, Math.min(me.y + me.h, c.y + c.h) - Math.max(me.y, c.y));
            overMe = Math.max(overMe, w * h);
          }
          return {
            W,
            H,
            cam,
            him,
            me,
            under: (ow * oh) / (him.w * him.h),
            arcTop: a.top - cam.y,
            end: { x: a.x - cam.x, y: a.y - cam.y },
            overMe,
            lean: d.lean,
          };
        };
        const tick = (): void => {
          const d = irr.drawn;
          frames++;
          if (prev && d.room === 'hall-gallery') leap = Math.max(leap, Math.abs(d.camera.x - prev.x), Math.abs(d.camera.y - prev.y));
          prev = { x: d.camera.x, y: d.camera.y };
          const now = look();
          if (now) lastAim = now;
          const loose = (d.weapons.loose as any[]).some((x) => x.weapon === 'thrown-shot' && !before.has(x.id));
          if ((loose && lastAim) || performance.now() - t0 > dur) {
            const s = lastAim;
            if (!s) return resolve({ ok: false, text: 'no aim drawn', leap, frames });
            const inside = (b: any): boolean => b.x >= 0 && b.y >= 0 && b.x + b.w <= s.W && b.y + b.h <= s.H;
            const ok = inside(s.him) && s.under <= 0.25 && s.arcTop >= 0 && s.end.x >= 0 && s.end.x <= s.W && s.end.y >= 0 && s.end.y <= s.H && inside(s.me) && s.overMe === 0;
            const r = (v: number): number => Math.round(v);
            const text = `picture ${s.W}x${s.H}, camera at ${r(s.cam.x)}, ${r(s.cam.y)} (lean ${JSON.stringify(s.lean)}): the thrower drawn at ${r(s.him.x)}, ${r(s.him.y)} (${s.him.w}x${s.him.h}, ${Math.round(s.under * 100)}% under the plate), his arc's top at y ${r(s.arcTop)}, where it comes down at ${r(s.end.x)}, ${r(s.end.y)}; A's hero at ${r(s.me.x)}, ${r(s.me.y)} (${s.me.w}x${s.me.h}; ${r(s.overMe)} px² under a control)`;
            return resolve({ ok, text, leap, frames });
          }
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }),
    [THROWER, ms] as [string, number],
  );

async function shot(ph: Phone, dir: string, w: number, h: number): Promise<void> {
  await ph.page.setViewportSize({ width: w, height: h });
  await sleep(300);
  try {
    await ph.page.waitForFunction((id: string) => ((window as any).irreverents.drawn.ranged?.aims ?? []).some((a: any) => a.id === id), THROWER, { polling: 'raf', timeout: 6000 });
    await sleep(350);
  } catch {
    // shot anyway
  }
  await ph.page.screenshot({ path: path.join(dir, `aim-${w}x${h}.png`) });
}

export async function cameraFacts(kit: Kit & { shots: string }): Promise<void> {
  const { fact } = kit;
  const url = `${kit.base}/?room=e2e-camera-${Math.random().toString(36).slice(2, 10)}`;
  const A = await phone(kit, url, 'camera A');
  const B = await phone(kit, url, 'camera B');
  try {
    if (OLD) await A.page.evaluate(() => ((window as any).irreverents.cameraLean.off = true));
    await sleep(600);
    const there = (await walkInto(A, 1, 'castle-street')) && (await walkInto(A, 1, 'courtyard')) && (await walkInto(B, 1, 'castle-street')) && (await walkInto(B, 1, 'courtyard'));
    await standAt(A, await xOn(A, 16), 1);
    await standAt(B, await xOn(B, 22), -1);
    try {
      await A.page.waitForFunction(() => (window as any).irreverents.drawn.parts.find((q: any) => q.part === 'plate-gate')?.on === true, null, { polling: 'raf', timeout: 4000 });
    } catch {
      // reported below
    }
    // The camera's largest one-frame move in the gallery, from the frame after A arrives (a new room is a cut, not a move).
    await A.page.evaluate(() => {
      const irr = (window as any).irreverents;
      const t: any = (irr.leapWatch = { max: 0, frames: 0 });
      let prev: any = null;
      const tick = (): void => {
        const d = irr.drawn;
        if (prev && prev.room === 'hall-gallery' && d.room === 'hall-gallery') {
          t.max = Math.max(t.max, Math.abs(d.camera.x - prev.x), Math.abs(d.camera.y - prev.y));
          t.frames++;
        }
        prev = { room: d.room, x: d.camera.x, y: d.camera.y };
        if (!t.stop) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    const inGallery = there && (await walkInto(A, 1, 'hall-gallery', 12000));
    if (inGallery) await standAt(A, await xOn(A, 14), 1);
    // His next whole aim: wait for one to end first if he is mid-aim, so the watch sees it from its start.
    try {
      await A.page.waitForFunction((id: string) => !((window as any).irreverents.drawn.ranged?.aims ?? []).some((a: any) => a.id === id), THROWER, { polling: 'raf', timeout: 4000 });
    } catch {
      // watched anyway
    }
    const w = inGallery ? await watch(A, 9000) : { ok: false, text: 'not in the gallery', leap: 0, frames: 0 };
    const leapWatch = await A.page.evaluate(() => {
      const t = (window as any).irreverents.leapWatch;
      t.stop = true;
      return { max: t.max as number, frames: t.frames as number };
    });
    w.leap = Math.max(w.leap, leapWatch.max);
    w.frames = leapWatch.frames;
    fact(
      'camera-aim-in-picture',
      inGallery && w.ok && w.leap <= LEAP_MAX,
      `page A held sideways walked by touch into the Hall gallery (${inGallery}) to column 14${OLD ? ' (CONTROL: the camera as before)' : ''}; on the last frame drawing the thrower's aim: ${w.text}; the camera's largest one-frame move ${w.leap} px (at most ${LEAP_MAX}) over ${w.frames} frames in the gallery`,
    );
    if (OLD || !inGallery) return;
    const dir = path.join(kit.shots, 'after');
    fs.mkdirSync(dir, { recursive: true });
    for (const [vw, vh] of [
      [844, 390],
      [750, 340],
      [390, 664],
    ] as const)
      await shot(A, dir, vw, vh);
    await A.page.setViewportSize({ width: 844, height: 390 });
    await sleep(300);
    // Wanted, not required: behind him (no aim), the stick held up looks up.
    await standAt(A, await xOn(A, 5), -1);
    await sleep(2800); // past aimHold, so a lean left from his aims has eased off
    const rest = await A.page.evaluate(() => ({ ...(window as any).irreverents.drawn.lean }));
    const p = await pointOn(A, '[data-stick]', 0.5);
    let up: any = null;
    if (p) {
      const top = await A.page.evaluate(() => document.querySelector('[data-stick]')!.getBoundingClientRect().top);
      await A.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...p, id: 1 }] });
      await A.cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: p.x, y: Math.max(0, top - 30), id: 1 }] });
      await sleep(900);
      up = await A.page.evaluate(() => ({ ...(window as any).irreverents.drawn.lean }));
      await A.page.screenshot({ path: path.join(dir, 'look-up-844x390.png') });
      await A.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await settle(A);
    }
    console.log(`      (camera) behind him, at rest ${JSON.stringify(rest)}; the stick held up ${JSON.stringify(up)} (not a fact)`);
  } finally {
    await A.ctx.close();
    await B.ctx.close();
  }
}
