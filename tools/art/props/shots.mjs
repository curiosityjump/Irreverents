// Screenshots for the props lane in the real game at iPhone size: a punch on a dummy in the graybox
// hall (several frames), the throne room and the undercroft; upright and sideways (with insets).
//
//   NODE_PATH=/opt/node-tools/node_modules node tools/art/props/shots.mjs <base url> <tag>
//
// Writes tools/art/props/preview/shots/ (git-ignored). DRAFT: a lane tool for judging the look.
// Round 3: `node tools/art/props/shots.mjs <base url> <tag> round3` takes only the round-3 scenes (the cantina,
// the camp with its horn sounding, quarry-depot by a hiding place, quarry-cave, the courtyard's arches), as
// canvas crops; the brief's copies go to docs/plan/step-8-shots/round3/props/.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const require = createRequire(path.join(process.env.NODE_PATH || '/opt/node-tools/node_modules', 'x.js'));
const { chromium, devices } = require('playwright');
const here = path.dirname(url.fileURLToPath(import.meta.url));
const base = process.argv[2] || 'http://localhost:3000';
const tag = process.argv[3] || 'after';
const out = path.join(here, 'preview', 'shots');
fs.mkdirSync(out, { recursive: true });

const PHONES = [
  { name: 'up', opts: { ...devices['iPhone 14'] } },
  { name: 'side', opts: { ...devices['iPhone 14 landscape'] }, inset: true },
];

async function place(page, room, tx, ty) {
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
}

const ROUND3 = [
  ['cantina', 'cantina', 12, 9],
  ['camp', 'outpost', 24, 10, 'sound'],
  ['quarry-depot', 'quarry-depot', 3, 13],
  ['quarry-cave', 'quarry-cave', 12, 12],
  ['courtyard', 'courtyard', 14, 7],
  ['street-bell', 'castle-street', 21, 10],
  ['courtyard-gate', 'courtyard', 21, 7],
];

async function sound(page) {
  // the horn sounding, for the picture only: this page's copy of the post is told it is calling (the server's
  // next snapshot puts it back), then the frame is taken at once
  await page.evaluate(() => {
    const d = window.irreverents;
    const loop = () => {
      for (const e of d.world.entities) if (e.id === 'camp-horn-post') e.c.signaler = { ...(e.c.signaler || {}), sounding: 40, of: 90 };
      d.__soundLoop = requestAnimationFrame(loop);
    };
    loop();
  });
  await page.waitForTimeout(150);
}

if (process.argv[4] === 'round3') {
  const browser = await chromium.launch();
  for (const phone of PHONES) {
    const ctx = await browser.newContext(phone.opts);
    const page = await ctx.newPage();
    if (phone.inset) {
      const cdp = await ctx.newCDPSession(page);
      await cdp.send('Emulation.setSafeAreaInsetsOverride', { insets: { left: 47, right: 47, bottom: 21, top: 0 } }).catch(() => {});
    }
    await page.goto(`${base}/?room=props3-${tag}-${Math.random().toString(36).slice(2, 8)}`);
    await page.waitForFunction(() => window.irreverents && window.irreverents.drawn.status === 'online', null, { timeout: 30000 });
    for (const [name, room, tx, ty, extra] of ROUND3) {
      await place(page, room, tx, ty);
      if (extra === 'sound') await sound(page);
      await page.screenshot({ path: path.join(out, `${tag}-${name}-${phone.name}.png`) });
    }
    await ctx.close();
  }
  await browser.close();
  console.log('round 3 shots written to', out);
  process.exit(0);
}

const browser = await chromium.launch();
for (const phone of PHONES) {
  const ctx = await browser.newContext(phone.opts);
  const page = await ctx.newPage();
  if (phone.inset) {
    const cdp = await ctx.newCDPSession(page);
    await cdp.send('Emulation.setSafeAreaInsetsOverride', { insets: { left: 47, right: 47, bottom: 21, top: 0 } }).catch(() => {});
  }
  await page.goto(`${base}/?room=props-${tag}-${Math.random().toString(36).slice(2, 8)}`);
  await page.waitForFunction(() => window.irreverents && window.irreverents.drawn.status === 'online', null, { timeout: 30000 });
  await place(page, 'throne-room', 9, 14);
  await page.screenshot({ path: path.join(out, `${tag}-throne-room-${phone.name}.png`) });
  await place(page, 'undercroft', 24, 12);
  await page.screenshot({ path: path.join(out, `${tag}-undercroft-${phone.name}.png`) });
  await place(page, 'castle-street', 37, 10);
  await page.screenshot({ path: path.join(out, `${tag}-castle-street-${phone.name}.png`) });
  await place(page, 'graybox-hall', 9, 9);
  // face right, then punch, and take frames as it plays
  await page.keyboard.down('ArrowRight');
  await page.waitForTimeout(60);
  await page.keyboard.up('ArrowRight');
  await page.waitForTimeout(300);
  await page.keyboard.down('KeyX');
  for (let i = 0; i < 6; i++) {
    await page.screenshot({ path: path.join(out, `${tag}-punch-${i}-${phone.name}.png`) });
    if (i === 0) await page.keyboard.up('KeyX');
  }
  await ctx.close();
}
await browser.close();
console.log('shots written to', out);
