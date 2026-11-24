// Shots of the castle street's top alarm row walking in (the armoured guard in the middle), at iPhone sizes:
// 844x390 sideways (insets 47/47/21), 750x340 sideways and 390x664 upright.
//
//   npm run build && node tools/art/cast/shots-armoured.ts <tag> [out dir]
//
// Writes <out dir>/<tag>-<w>x<h>.png (default tools/art/cast/preview/shots/, git-ignored; the brief's shots are
// in docs/plan/step-8-shots/armoured-guard/). Stages the row in a game of its own without playing to it
// (scripts/e2e/armoured-look.ts, startStage: the sim's own completeCall, so the street's dispatch brings the
// row from the sides as in play). "before" shots: put back the old sprite file, build, run with tag before.
//
// DRAFT: a lane tool for judging the look (handoff-prompts/armoured-guard-look.md), not a scripted check.
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { createRequire } from 'node:module';
import { enterStreet, rowInView, startStage } from '../../../scripts/e2e/armoured-look.ts';

/* eslint-disable @typescript-eslint/no-explicit-any */
const { chromium } = createRequire(import.meta.url)('playwright');
const here = path.dirname(url.fileURLToPath(import.meta.url));
const tag = process.argv[2] ?? 'after';
const out = path.resolve(process.argv[3] ?? path.join(here, 'preview', 'shots'));
fs.mkdirSync(out, { recursive: true });

const PHONES = [
  { w: 844, h: 390, inset: true },
  { w: 750, h: 340, inset: true },
  { w: 390, h: 664, inset: false },
];

const stage = await startStage();
const browser = await chromium.launch();
try {
  for (const ph of PHONES) {
    const ctx = await browser.newContext({ viewport: { width: ph.w, height: ph.h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const page = await ctx.newPage();
    if (ph.inset) {
      const cdp = await ctx.newCDPSession(page);
      await cdp.send('Emulation.setSafeAreaInsetsOverride', { insets: { left: 47, right: 47, bottom: 21, top: 0 } }).catch(() => {});
    }
    const name = `shots-ag-${tag}-${ph.w}x${ph.h}-${Math.random().toString(36).slice(2, 8)}`;
    await enterStreet(page, stage.base, name);
    if (!(await stage.raiseTopRow(name))) console.log(`${ph.w}x${ph.h}: the alert was not raised`);
    if (!(await rowInView(page, 8000))) console.log(`${ph.w}x${ph.h}: the row was not all in view after 8 s; shot anyway`);
    const drawn = await page.evaluate(() => (window as any).irreverents.drawn.entities.filter((e: any) => String(e.id).includes(':help')).map((e: any) => `${e.kind}@${Math.round(e.x)}`));
    const file = path.join(out, `${tag}-${ph.w}x${ph.h}.png`);
    await page.screenshot({ path: file });
    console.log('wrote', file, drawn.join(' '));
    await ctx.close();
  }
} finally {
  await browser.close();
  stage.close();
  process.exit(0);
}
