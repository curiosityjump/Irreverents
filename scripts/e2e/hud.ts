// The phone HUD's sizes (brief phone-hud-legibility, 2026-11-24; docs/plan/step-8.md,
// "Phone HUD"), inside `npm run e2e` (one call line in scripts/e2e.ts): at each of three
// phone sizes, upright 390x664 and sideways 844x390 and 750x340, on a touch page, every
// control a thumb can press is at least 44 CSS px each way (D-093: a few context-sensitive
// controls, by touch): on the start screen, then in play (the stick, every action, the
// menu and sound buttons, the upright hint's dismiss).
// Control, watched to fail: on the build before this fact landed the
// sound button (32 px) and the hint's dismiss (28 px) fail it.
// DRAFT: 44 is Apple's least tap target; what counts as a control is the selector below.
import type { Kit } from '../lib/e2e-touch.ts';

/* eslint-disable @typescript-eslint/no-explicit-any */
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
export const HUD_SIZES = [
  { w: 390, h: 664 },
  { w: 844, h: 390 },
  { w: 750, h: 340 },
];
/** The least touch target, CSS px. */
export const MIN_TARGET = 44;

/** Every control a thumb can press now: its name and its box. */
export const targetsOf = (page: any): Promise<{ id: string; w: number; h: number }[]> =>
  page.evaluate(() => {
    const out: { id: string; w: number; h: number }[] = [];
    for (const el of document.querySelectorAll<HTMLElement>('button, input, [data-stick]')) {
      const s = getComputedStyle(el);
      const b = el.getBoundingClientRect();
      if (s.display === 'none' || s.visibility === 'hidden' || s.pointerEvents === 'none' || b.width === 0 || el.closest('[hidden]')) continue;
      if (b.right <= 0 || b.bottom <= 0 || b.left >= innerWidth || b.top >= innerHeight) continue;
      out.push({ id: el.dataset.action ?? (el.dataset.stick ? 'stick' : el.id || el.dataset.start || (el.textContent ?? '').trim().slice(0, 10)), w: Math.round(b.width * 10) / 10, h: Math.round(b.height * 10) / 10 });
    }
    return out;
  });

export async function hudFacts(kit: Kit): Promise<void> {
  const { fact } = kit;
  const ctx = await kit.browser.newContext({ ...kit.devices['iPhone 14 landscape'] });
  const page = await ctx.newPage();
  page.on('pageerror', (e: Error) => kit.errors.push(`hud: ${e.message}`));
  try {
    for (const where of ['start', 'play']) {
      if (where === 'start') {
        await page.goto(`${kit.base}/`);
        await page.waitForSelector('#start [data-start="new"]', { timeout: 8000 });
      } else {
        await page.goto(`${kit.base}/?room=e2e-hud-${Math.random().toString(36).slice(2, 10)}`);
        await page.waitForFunction(() => (window as any).irreverents?.drawn.status === 'online' && (window as any).irreverents.drawn.me, null, { timeout: 10000 });
      }
      for (const s of HUD_SIZES) {
        await page.setViewportSize({ width: s.w, height: s.h });
        await sleep(400);
        const all = await targetsOf(page);
        const small = all.filter((t) => t.w < MIN_TARGET || t.h < MIN_TARGET);
        fact(`hud-targets-${where}-${s.w}x${s.h}`, all.length > (where === 'play' ? 3 : 1) && small.length === 0, `${where === 'start' ? 'on the start screen' : 'in play'} at ${s.w}x${s.h}, every one of the ${all.length} controls is at least ${MIN_TARGET} px each way${small.length ? `; under it: ${small.map((t) => `${t.id} ${t.w}x${t.h}`).join(', ')}` : ''} (${all.map((t) => `${t.id} ${Math.round(t.w)}x${Math.round(t.h)}`).join(', ')})`);
      }
    }
  } finally {
    await ctx.close();
  }
}
