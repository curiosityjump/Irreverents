// Screenshots of the ground lane's spots in the real game at iPhone size, upright and sideways,
// with the share of the game picture's rows that are a single colour (round 3's measure).
//
//   node tools/art/tiles/shots.mjs <base url> <tag> [out dir] [room,room,...]
//
// Writes <out>/<tag>-<room>-<n>-<up|side>.png (the canvas only, cropped) and <out>/<tag>-rows.json.
// Default out: tools/art/tiles/preview/shots/ (git-ignored).
// The way to place a player is round 2's (handoff-prompts/look2-ground.md, section 2); the spots
// are round 3's (handoff-prompts/look3-ground.md, section 7).
// DRAFT: a lane tool for judging the look, not a scripted check.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const here = path.dirname(url.fileURLToPath(import.meta.url));
const require = createRequire(path.join(process.env.NODE_PATH || path.join(here, '..', '..', '..', 'node_modules'), 'x.js'));
const { chromium } = require('playwright');
const base = process.argv[2] || 'http://localhost:3000';
const tag = process.argv[3] || 'after';
const out = process.argv[4] || path.join(here, 'preview', 'shots');
const only = process.argv[5] ? process.argv[5].split(',') : null;
fs.mkdirSync(out, { recursive: true });

// [room, feet tile x, feet tile y]
const SPOTS = [
  ['quarry-road', 48, 10], ['quarry-ridge', 50, 7], ['quarry-cave', 12, 12], ['quarry-depot', 3, 13],
  ['quarry-depot', 4, 18], ['quarry-pit', 16, 18], ['quarry-tower', 3, 28], ['quarry-tower', 16, 4],
  ['cantina', 12, 9], ['courtyard', 14, 7], ['castle-street', 14, 10], ['hall-gallery', 13, 10],
  ['throne-room', 11, 14],
];
const PHONE = { isMobile: true, hasTouch: true, deviceScaleFactor: 2, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' };
const ORIENT = [
  { name: 'up', viewport: { width: 390, height: 664 } },
  { name: 'side', viewport: { width: 844, height: 390 }, insets: { left: 47, right: 47, bottom: 21, top: 0 } },
];

const rows = {};
const browser = await chromium.launch();
for (const o of ORIENT) {
  const ctx = await browser.newContext({ ...PHONE, viewport: o.viewport });
  const page = await ctx.newPage();
  if (o.insets) {
    const cdp = await ctx.newCDPSession(page);
    await cdp.send('Emulation.setSafeAreaInsetsOverride', { insets: o.insets }).catch(() => {});
  }
  await page.goto(`${base}/?room=look3-${tag}-${Math.random().toString(36).slice(2, 8)}`);
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
    await page.waitForTimeout(1000);
    // The share of the canvas's rows that are one colour, measured on the canvas itself.
    const m = await page.evaluate(() => {
      const c = document.querySelector('canvas');
      const g = c.getContext('2d');
      const d = g.getImageData(0, 0, c.width, c.height).data;
      let flat = 0;
      for (let y = 0; y < c.height; y++) {
        const r0 = y * c.width * 4;
        let same = true;
        for (let x = 1; x < c.width && same; x++) {
          const i = r0 + x * 4;
          if (d[i] !== d[r0] || d[i + 1] !== d[r0 + 1] || d[i + 2] !== d[r0 + 2]) same = false;
        }
        if (same) flat++;
      }
      return { flat, rows: c.height };
    });
    const name = `${tag}-${room}-${seen[room]}-${o.name}`;
    rows[name] = { ...m, share: Math.round((1000 * m.flat) / m.rows) / 10 };
    await page.locator('canvas').first().screenshot({ path: path.join(out, name + '.png') });
  }
  await ctx.close();
}
await browser.close();
fs.writeFileSync(path.join(out, `${tag}-rows.json`), JSON.stringify(rows, null, 1) + '\n');
for (const [k, v] of Object.entries(rows)) if (k.endsWith('-up')) console.log(k, `${v.flat}/${v.rows}`, `${v.share}%`);
console.log('shots written to', out);
