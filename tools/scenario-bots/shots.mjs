// Scratch: phone screenshots of forest spots. node shots.mjs <base> <outdir> [spots json]
import { createRequire } from 'node:module';
const { chromium, devices } = createRequire(import.meta.url)('playwright');
import fs from 'node:fs';
const [base, out, spotsArg] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const spots = spotsArg ? JSON.parse(spotsArg) : [
  { name: 'road', room: 'forest-road', col: 12, row: 9 },
  { name: 'trail-start', room: 'forest-trail', col: 6, row: 18 },
  { name: 'trail-gap', room: 'forest-trail', col: 21, row: 8 },
  { name: 'trail-canopy', room: 'forest-trail', col: 44, row: 8 },
  { name: 'trail-hatch', room: 'forest-trail', col: 60, row: 8 },
];
const browser = await chromium.launch();
const sizes = [
  { tag: '844x390', opt: { ...devices['iPhone 14 landscape'] } },
  { tag: '390x664', opt: { viewport: { width: 390, height: 664 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true } },
];
for (const s of sizes) {
  const ctx = await browser.newContext(s.opt);
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.error('pageerror', e.message));
  await page.goto(`${base}/?room=shots-${Math.random().toString(36).slice(2, 8)}`);
  // through the start screen if there is one
  await page.waitForTimeout(1500);
  for (const sel of ['#start-play', '[data-start=play]', '#st-play', 'button']) {
    const b = await page.$(sel);
    if (b && (await b.isVisible())) { await b.tap().catch(() => {}); break; }
  }
  await page.waitForFunction(() => window.irreverents?.drawn?.status === 'online' && window.irreverents.drawn.me, null, { timeout: 15000 });
  for (const sp of spots) {
    await page.evaluate((sp) => {
      const irr = window.irreverents;
      const mine = irr.world.entities.find((e) => e.player === irr.player);
      const room = irr.content.rooms[sp.room];
      const box = irr.content.characters[mine.kind].box;
      mine.room = sp.room;
      mine.x = sp.col * room.tile + (room.tile - box.w) / 2;
      mine.y = (sp.row + 1) * room.tile - box.h;
      mine.vx = 0; mine.vy = 0;
    }, sp);
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${out}/${sp.name}-${s.tag}.png` });
    console.log('shot', sp.name, s.tag, await page.evaluate(() => window.irreverents.drawn.room));
  }
  await ctx.close();
}
await browser.close();
