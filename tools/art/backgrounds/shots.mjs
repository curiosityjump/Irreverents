// Phone-sized shots of every reachable room's backdrop, for the biome-backgrounds brief
// (handoff-prompts/biome-backgrounds.md; notes in docs/plan/step-8.md, "Biome backgrounds").
//
//   node tools/art/backgrounds/shots.mjs <base url> <tag> <out dir> [room,room,...]
//   BKG_SPOTS='[["quarry-road",58,6]]' node tools/art/backgrounds/shots.mjs ...   (other spots)
//
// Writes <out>/<room>-<n>-<tag>-<w>x<h>.png: the whole page (HUD and controls included) at
// 390x664 upright, 844x390 and 750x340 sideways, with a player put at each spot below and the
// camera left to settle. The way to place a player is tools/art/tiles/shots.mjs's.
// DRAFT: a tool for looking, not a check; nothing here asserts.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const here = path.dirname(url.fileURLToPath(import.meta.url));
const require = createRequire(path.join(here, '..', '..', '..', 'node_modules', 'x.js'));
const { chromium } = require('playwright');
const base = process.argv[2] || 'http://localhost:3000';
const tag = process.argv[3] || 'after';
const out = process.argv[4] || path.join(here, 'shots');
const only = process.argv[5] ? process.argv[5].split(',') : null;
fs.mkdirSync(out, { recursive: true });

// [room, feet tile x, feet tile y]: a floor near each end of the room, plus the quarry's high spots.
const SPOTS = process.env.BKG_SPOTS ? JSON.parse(process.env.BKG_SPOTS) : [
  ['castle-street', 5, 10], ['castle-street', 42, 10], ['courtyard', 3, 7], ['courtyard', 26, 7],
  ['undercroft', 6, 12], ['undercroft', 29, 12], ['hall-gallery', 2, 10], ['hall-gallery', 21, 10],
  ['throne-room', 2, 13], ['throne-room', 17, 14], ['cantina', 3, 9], ['cantina', 22, 9],
  ['outpost', 10, 10], ['outpost', 77, 10], ['forest-road', 5, 9], ['forest-road', 42, 9],
  ['forest-trail', 12, 8], ['forest-trail', 88, 18], ['quarry-road', 10, 16], ['quarry-road', 73, 10],
  ['quarry-ridge', 9, 7], ['quarry-ridge', 70, 9], ['quarry-cave', 3, 11], ['quarry-cave', 26, 12],
  ['quarry-depot', 7, 18], ['quarry-depot', 56, 13], ['quarry-pit', 4, 18], ['quarry-pit', 35, 18],
  ['quarry-tower', 2, 28], ['quarry-tower', 16, 4],
];
const PHONE = { isMobile: true, hasTouch: true, deviceScaleFactor: 2, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' };
const SIZES = [
  { viewport: { width: 390, height: 664 } },
  { viewport: { width: 844, height: 390 }, insets: { left: 47, right: 47, bottom: 21, top: 0 } },
  { viewport: { width: 750, height: 340 }, insets: { left: 44, right: 44, bottom: 21, top: 0 } },
];

const browser = await chromium.launch();
for (const s of SIZES) {
  const ctx = await browser.newContext({ ...PHONE, viewport: s.viewport });
  const page = await ctx.newPage();
  if (s.insets) {
    const cdp = await ctx.newCDPSession(page);
    await cdp.send('Emulation.setSafeAreaInsetsOverride', { insets: s.insets }).catch(() => {});
  }
  await page.goto(`${base}/?room=bkg-${tag}-${Math.random().toString(36).slice(2, 8)}`);
  await page.waitForFunction(() => window.irreverents && window.irreverents.drawn && window.irreverents.drawn.status === 'online', null, { timeout: 30000 });
  const seen = {};
  for (const [room, tx, ty] of SPOTS) {
    if (only && !only.includes(room)) continue;
    seen[room] = (seen[room] || 0) + 1;
    await page.evaluate(([room, tx, ty]) => {
      const d = window.irreverents;
      const me = d.world.entities.find((e) => e.player === d.player);
      const box = d.content.characters[me.kind].box;
      me.room = room;
      me.x = tx * 16 + (16 - box.w) / 2;
      me.y = (ty + 1) * 16 - box.h;
      me.vx = 0; me.vy = 0;
    }, [room, tx, ty]);
    await page.waitForTimeout(1200);
    const name = `${room}-${seen[room]}-${tag}-${s.viewport.width}x${s.viewport.height}.png`;
    await page.screenshot({ path: path.join(out, name) });
  }
  await ctx.close();
}
await browser.close();
console.log('shots written to', out);
