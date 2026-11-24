// Step 24, inside `npm run e2e` (one call line in scripts/e2e.ts;
// docs/mechanisms/ranged.md): two phone-sized pages in a private world, by
// touch only. They open the courtyard's gate as scripts/e2e/plates.ts does
// (one on each plate); page A walks on east into the Hall gallery and along
// its floor to column 15, in front of and below the thrower on the balcony.
// Fact `ranged-telegraph`: page A draws the thrower's aim (its arc,
// `window.irreverents.drawn.ranged`) at least `aim` − interpDelayMs − one
// snapshot (600 − 100 − 50 ms) before it draws his shot loose
// (`drawn.weapons.loose`, weapon thrown-shot): no shot leaves
// without being drawn held up with its arc for his aim (the INTENT at
// src/sim/systems/ranged-throw.ts and src/client/draw/ranged.ts). Wanted, not
// required (printed): page A, walked to a landed shot, reads "Pick up" on Use
// and a tap puts it in A's hand.
// Control, watched to fail: E2E_RANGED_BEHIND=1 keeps page A at column 7,
// behind him: no aim is drawn and `ranged-telegraph` fails.
// Shots, sideways and upright: the aim and its arc, the shot in the air, a
// hero struck, the shot in a hero's hand (when reached).
// DRAFT: every wait is a first pass with room to spare.
import fs from 'node:fs';
import path from 'node:path';
import { me, phone, pointOn, settle, standAt, steer, tap } from '../lib/e2e-touch.ts';
import type { Kit, Phone } from '../lib/e2e-touch.ts';

/* eslint-disable @typescript-eslint/no-explicit-any */
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
const BEHIND = process.env.E2E_RANGED_BEHIND === '1';
const THROWER = 'gallery-thrower-1';

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

/** The x that puts the page's own character's middle on column `tx`. */
const xOn = (ph: Phone, tx: number): Promise<number> =>
  ph.page.evaluate((c: number) => {
    const irr = (window as any).irreverents;
    return (c + 0.5) * 16 - irr.content.characters[irr.drawn.me.kind].box.w / 2;
  }, tx);

async function shots(ph: Phone, dir: string, name: string): Promise<void> {
  fs.mkdirSync(dir, { recursive: true });
  await ph.page.screenshot({ path: path.join(dir, `${name}-sideways.png`) });
  await ph.page.setViewportSize({ width: 390, height: 664 });
  await sleep(250);
  await ph.page.screenshot({ path: path.join(dir, `${name}-upright.png`) });
  await ph.page.setViewportSize({ width: 844, height: 390 });
  await sleep(250);
}

/**
 * Every frame for up to `ms`: the page time of the first frame drawing the
 * thrower's aim, and of the first frame drawing one of his shots loose after it.
 */
const watchThrow = (ph: Phone, ms: number): Promise<{ aim: number | null; loose: number | null; frames: number; end: { x: number; y: number } | null }> =>
  ph.page.evaluate(
    ([id, dur]: [string, number]) =>
      new Promise<{ aim: number | null; loose: number | null; frames: number; end: { x: number; y: number } | null }>((resolve) => {
        const t0 = performance.now();
        let aim: number | null = null;
        let loose: number | null = null;
        let frames = 0;
        let end: { x: number; y: number } | null = null;
        const before = new Set<string>(((window as any).irreverents.drawn.weapons.loose as any[]).filter((l) => l.weapon === 'thrown-shot').map((l) => l.id));
        const tick = (): void => {
          const d = (window as any).irreverents.drawn;
          frames++;
          const a = (d.ranged?.aims ?? []).find((x: any) => x.id === id);
          if (a && aim === null) {
            aim = performance.now();
            end = { x: a.x, y: a.y };
          }
          const l = (d.weapons.loose as any[]).find((x) => x.weapon === 'thrown-shot' && !before.has(x.id));
          if (l && loose === null) loose = performance.now();
          if (loose !== null || performance.now() - t0 > dur) return resolve({ aim: aim === null ? null : aim - t0, loose: loose === null ? null : loose - t0, frames, end });
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }),
    [THROWER, ms] as [string, number],
  );

export async function rangedFacts(kit: Kit & { shots: string }): Promise<void> {
  const { fact } = kit;
  const url = `${kit.base}/?room=e2e-ranged-${Math.random().toString(36).slice(2, 10)}`;
  const A = await phone(kit, url, 'ranged A');
  const B = await phone(kit, url, 'ranged B');
  try {
    await sleep(600);
    // The courtyard gate: one page on each plate (as plates.ts), then A on east into the gallery.
    const there = (await walkInto(A, 1, 'castle-street')) && (await walkInto(A, 1, 'courtyard')) && (await walkInto(B, 1, 'castle-street')) && (await walkInto(B, 1, 'courtyard'));
    await standAt(A, await xOn(A, 16), 1);
    await standAt(B, await xOn(B, 22), -1);
    try {
      await A.page.waitForFunction(() => (window as any).irreverents.drawn.parts.find((q: any) => q.part === 'plate-gate')?.on === true, null, { polling: 'raf', timeout: 4000 });
    } catch {
      // reported below
    }
    const inGallery = there && (await walkInto(A, 1, 'hall-gallery', 12000));
    const aimSec = await A.page.evaluate(() => (window as any).irreverents.content.npcs['ranged-fighter'].ranged.aim as number);
    // INTENT (the control): behind him (column 7) he never sees A; in front, column 15 is where his arc passes overhead.
    const watch = watchThrow(A, 9000);
    if (inGallery) await standAt(A, await xOn(A, BEHIND ? 7 : 15), 1);
    // The aim and its arc, drawn: the shot first.
    try {
      await A.page.waitForFunction((id: string) => ((window as any).irreverents.drawn.ranged?.aims ?? []).some((a: any) => a.id === id), THROWER, { polling: 'raf', timeout: BEHIND ? 3000 : 6000 });
      await shots(A, kit.shots, 'aim-and-arc');
    } catch {
      // no aim drawn: the fact below says so
    }
    const w = await watch;
    const lead = w.aim !== null && w.loose !== null ? w.loose - w.aim : null;
    // DRAFT (builder notes, docs/plan/step-24.md): the page draws a body it already has interpDelayMs in the
    // past (src/net/smooth.ts) but a brand-new entity, his loose shot, at its first sample; and each is seen
    // only on a snapshot. So the drawn lead is the aim less interpDelayMs, less up to one snapshot.
    const netCfg = await A.page.evaluate(() => (window as any).irreverents.content.net as { interpDelayMs: number; snapshotRate: number });
    const need = aimSec * 1000 - netCfg.interpDelayMs - 1000 / netCfg.snapshotRate;
    const m = await me(A);
    fact(
      'ranged-telegraph',
      inGallery && lead !== null && lead >= need,
      `page A walked by touch through the opened gate into the gallery (${inGallery}) and stood at x ${Math.round(m?.x ?? -1)}${BEHIND ? ' (CONTROL: behind him, column 7)' : ''}: the thrower's aim drawn at ${w.aim === null ? 'never' : `${Math.round(w.aim)} ms`}, his shot drawn loose at ${w.loose === null ? 'never' : `${Math.round(w.loose)} ms`} (${lead === null ? 'no lead' : `${Math.round(lead)} ms after the aim`}; needed at least ${need} ms), the arc ending at ${w.end ? `${Math.round(w.end.x)}, ${Math.round(w.end.y)}` : 'none'} over ${w.frames} frames`,
    );
    if (BEHIND || !inGallery) return;
    // The shot in the air.
    await sleep(250);
    await shots(A, kit.shots, 'shot-in-the-air');
    // A hero struck: east onto the floor past column 18, where the shots come down off the steps.
    await standAt(A, await xOn(A, 19), 1);
    const x0 = (await me(A)).x as number;
    try {
      await A.page.waitForFunction((x: number) => Math.abs((window as any).irreverents.drawn.me.x - x) > 12, x0, { polling: 'raf', timeout: 6000 });
      await sleep(120);
      await shots(A, kit.shots, 'hero-struck');
    } catch {
      console.log('      (ranged) page A was not drawn struck on the floor within 6 s (not a fact)');
    }
    await settle(A);
    // Wanted, not required: pick a landed shot up.
    const lying = await A.page.evaluate(() => ((window as any).irreverents.drawn.weapons.loose as any[]).filter((l) => l.weapon === 'thrown-shot').map((l) => l.x));
    let picked = false;
    let word = '';
    if (lying.length) {
      const bw = await A.page.evaluate(() => (window as any).irreverents.content.characters[(window as any).irreverents.drawn.me.kind].box.w as number);
      await standAt(A, lying[0] - bw / 2, -1);
      await sleep(250);
      word = await A.page.evaluate(() => document.querySelector<HTMLElement>('#actions [data-action="interact"]')?.dataset.state ?? '');
      if (word === 'pick-up') {
        await tap(A, 'interact');
        await sleep(400);
        picked = await A.page.evaluate((p: string) => ((window as any).irreverents.drawn.weapons.held as any[]).some((h) => h.weapon === 'thrown-shot' && h.id === `p:${p}`), A.id);
        if (picked) await shots(A, kit.shots, 'shot-in-hand');
      }
    }
    console.log(`      (ranged) wanted: ${lying.length} shot(s) lying; Use read "${word}" at the first; ${picked ? 'picked up and drawn in A\'s hand' : 'not picked up'}`);
  } finally {
    await A.ctx.close();
    await B.ctx.close();
  }
}
