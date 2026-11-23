// Screenshots of the cast in the real game at iPhone size, upright (390x664) and sideways (844x390, insets 47/47/21).
//
//   NODE_PATH=/opt/node-tools/node_modules node tools/art/cast/shots.mjs <base url> <tag> [room,room]
//
// Writes tools/art/cast/preview/shots/<tag>-<room>-<up|side>.png (git-ignored). Places the player the way
// tools/art/tiles/shots.mjs does. Moods cannot be forced from the page (setting a mood on the debug world does not
// reach the drawn frame; tried 2026-11-23), so moods are judged from preview.py's moods.png.
// DRAFT: a lane tool for judging the look, not a scripted check.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const require = createRequire(path.join(process.env.NODE_PATH || '/opt/node-tools/node_modules', 'x.js'));
const { chromium } = require('playwright');
const here = path.dirname(url.fileURLToPath(import.meta.url));
const base = process.argv[2] || 'http://localhost:3000';
const tag = process.argv[3] || 'after';
const only = process.argv[4] ? process.argv[4].split(',') : null;
const out = path.join(here, 'preview', 'shots');
fs.mkdirSync(out, { recursive: true });

const SPOTS = [['cantina', 12, 9], ['outpost', 24, 10], ['castle-street', 14, 10], ['castle-street', 36, 10], ['throne-room', 11, 14], ['quarry-pit', 7, 18], ['quarry-ridge', 72, 9]];
const PHONES = [
  { name: 'up', opts: { viewport: { width: 390, height: 664 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } },
  { name: 'side', opts: { viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, inset: true },
];

const browser = await chromium.launch();
for (const phone of PHONES) {
  const ctx = await browser.newContext(phone.opts);
  const page = await ctx.newPage();
  if (phone.inset) {
    const cdp = await ctx.newCDPSession(page);
    await cdp.send('Emulation.setSafeAreaInsetsOverride', { insets: { left: 47, right: 47, bottom: 21, top: 0 } }).catch(() => {});
  }
  await page.goto(`${base}/?room=cast-${tag}-${Math.random().toString(36).slice(2, 8)}`);
  await page.waitForFunction(() => window.irreverents && window.irreverents.drawn && window.irreverents.drawn.status === 'online', null, { timeout: 30000 });
  for (const [room, tx, ty] of SPOTS) {
    if (only && !only.includes(room)) continue;
    await page.evaluate(([room, tx, ty]) => {
      const d = window.irreverents;
      const me = d.world.entities.find((e) => e.player === d.player);
      const box = d.content.characters[me.kind].box;
      me.room = room;
      me.x = tx * 16 + (16 - box.w) / 2;
      me.y = (ty + 1) * 16 - box.h;
      me.vx = 0; me.vy = 0;
    }, [room, tx, ty]);
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(out, `${tag}-${room}${tx === 36 ? '-guard' : ''}-${phone.name}.png`) });
  }
  await ctx.close();
}
await browser.close();
