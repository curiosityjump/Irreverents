// Contact sheet for the touch buttons (brief owner-better-buttons): the phone's controls three ways at the
// e2e's phone sizes, over a real room. (a) today's U08 buttons (the P07 set refused), (b) the P07 family with
// the stick as P07's arrow keys, (c) the same with the stick as P07's d-pad keys. In each shot Jump is held
// down (its pressed look) and buttons a press would do nothing with are dimmed.
//
//   node tools/art/touch/shots.mjs <base url> <dir with b/ and c/ cuts> <out dir>
//
// DRAFT: a lane tool for judging the look; the server must be running the build being judged.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const require = createRequire(path.join(process.env.NODE_PATH || '/opt/node-tools/node_modules', 'x.js'));
const { chromium } = require('playwright');
const [base = 'http://localhost:3000', cuts, out] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });

const PHONES = [
  { name: 'upright-390x664', viewport: { width: 390, height: 664 }, dpr: 3 },
  { name: 'sideways-667x375', viewport: { width: 667, height: 375 }, dpr: 2 },
  { name: 'sideways-844x340', viewport: { width: 844, height: 340 }, dpr: 3, inset: { left: 47, right: 47, bottom: 21, top: 0 } },
];
const VARIANTS = ['a', 'b', 'c'];

const browser = await chromium.launch();
for (const phone of PHONES) {
  for (const v of VARIANTS) {
    const ctx = await browser.newContext({ viewport: phone.viewport, deviceScaleFactor: phone.dpr, isMobile: true, hasTouch: true });
    await ctx.route('**/assets/ui/touch/p07/*', (route) => {
      if (v === 'a') return route.fulfill({ status: 404, body: '' });
      const file = path.join(cuts, v, path.basename(new URL(route.request().url()).pathname));
      return route.fulfill({ status: 200, contentType: 'image/png', body: fs.readFileSync(file) });
    });
    const page = await ctx.newPage();
    if (phone.inset) {
      const cdp = await ctx.newCDPSession(page);
      await cdp.send('Emulation.setSafeAreaInsetsOverride', { insets: phone.inset }).catch(() => {});
    }
    await page.goto(`${base}/?room=buttons-${v}-${Math.random().toString(36).slice(2, 8)}`);
    await page.waitForFunction(() => window.irreverents && window.irreverents.drawn.status === 'online', null, { timeout: 30000 });
    await page.evaluate(() => {
      const d = window.irreverents;
      const me = d.world.entities.find((e) => e.player === d.player);
      const box = d.content.characters[me.kind].box;
      me.room = 'castle-street';
      me.x = 16 * 16 + (16 - box.w) / 2;
      me.y = 11 * 16 - box.h;
      me.vx = 0; me.vy = 0;
    });
    await page.waitForTimeout(1200);
    // Jump held: its pressed look (the class a real press sets; no input reaches the game).
    await page.evaluate(() => document.querySelector('#actions [data-action="jump"]').classList.add('on'));
    await page.waitForTimeout(100);
    await page.screenshot({ path: path.join(out, `${phone.name}-${v}.png`) });
    await ctx.close();
  }
}
await browser.close();
console.log('shots in', out);
