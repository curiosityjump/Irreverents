// Screenshots of the six art rooms in the real game at iPhone size, upright and sideways.
//
//   NODE_PATH=/opt/node-tools/node_modules node tools/art/tiles/shots.mjs <base url> <tag>
//
// Writes tools/art/tiles/preview/shots/<tag>-<room>-<n>-<up|side|small>.png (git-ignored).
// The way to place a player is the brief's (handoff-prompts/look2-ground.md, section 2).
// DRAFT: a lane tool for judging the look, not a scripted check.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const require = createRequire(path.join(process.env.NODE_PATH || '/opt/node-tools/node_modules', 'x.js'));
const { chromium, devices } = require('playwright');
const here = path.dirname(url.fileURLToPath(import.meta.url));
const base = process.argv[2] || 'http://localhost:3000';
const tag = process.argv[3] || 'after';
const only = process.argv[4] ? process.argv[4].split(',') : null;
const out = path.join(here, 'preview', 'shots');
fs.mkdirSync(out, { recursive: true });

const SPOTS = [
  ['throne-room', 9, 14], ['castle-street', 16, 10], ['castle-street', 37, 10], ['courtyard', 14, 7],
  ['hall-gallery', 8, 10], ['undercroft', 24, 12], ['undercroft', 8, 4], ['graybox-hall', 5, 9],
];
const PHONES = [
  { name: 'up', opts: { ...devices['iPhone 14'] } },
  { name: 'side', opts: { ...devices['iPhone 14 landscape'] }, inset: true },
  { name: 'small', opts: { ...devices['iPhone 14 landscape'], viewport: { width: 667, height: 375 } } },
];

const browser = await chromium.launch();
for (const phone of PHONES) {
  const ctx = await browser.newContext(phone.opts);
  const page = await ctx.newPage();
  if (phone.inset) {
    const cdp = await ctx.newCDPSession(page);
    await cdp.send('Emulation.setSafeAreaInsetsOverride', { insets: { left: 47, right: 47, bottom: 21, top: 0 } }).catch(() => {});
  }
  await page.goto(`${base}/?room=look-${tag}-${Math.random().toString(36).slice(2, 8)}`);
  await page.waitForFunction(() => window.irreverents && window.irreverents.drawn.status === 'online', null, { timeout: 30000 });
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
    await page.waitForTimeout(900);
    await page.screenshot({ path: path.join(out, `${tag}-${room}-${seen[room]}-${phone.name}.png`) });
  }
  await ctx.close();
}
await browser.close();
console.log('shots written to', out);
