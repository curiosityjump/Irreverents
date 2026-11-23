// Screenshots of the three heroes in the real game at iPhone size, upright and sideways.
//
//   NODE_PATH=/opt/node-tools/node_modules node tools/art/heroes/shots.mjs <base url> <tag>
//
// Three pages join one private world (the grappler, then two friends); page A is the
// phone that is shot, upright (390x664) and sideways (844x390, insets 47/47/21).
// Writes tools/art/heroes/preview/shots/<tag>-<scene>-<up|side>.png (git-ignored).
// Copied from tools/art/tiles/shots.mjs (the way to place a player). DRAFT: a lane
// tool for judging the look, not a scripted check.
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
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const SPOTS = [['castle-street', 14, 10], ['throne-room', 11, 14], ['cantina', 12, 9], ['undercroft', 17, 4]];
const PHONES = [
  { name: 'up', opts: { ...devices['iPhone 14'], viewport: { width: 390, height: 664 } } },
  { name: 'side', opts: { ...devices['iPhone 14 landscape'], viewport: { width: 844, height: 390 } }, inset: true },
];

async function open(browser, opts, room, inset) {
  const ctx = await browser.newContext(opts);
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  if (inset) await cdp.send('Emulation.setSafeAreaInsetsOverride', { insets: { left: 47, right: 47, bottom: 21, top: 0 } }).catch(() => {});
  await page.goto(`${base}/?room=${room}`);
  await page.waitForFunction(() => window.irreverents && window.irreverents.drawn.status === 'online', null, { timeout: 30000 });
  return { ctx, page, cdp };
}
const me = (ph) => ph.page.evaluate(() => window.irreverents.drawn.me);
async function put(ph, room, px, ty, facing = 1) {
  await ph.page.evaluate(([room, px, ty, facing]) => {
    const d = window.irreverents;
    const e = d.world.entities.find((x) => x.player === d.player);
    const box = d.content.characters[e.kind].box;
    e.room = room; e.x = px; e.y = (ty > 100 ? ty : (ty + 1) * 16) - box.h; e.vx = 0; e.vy = 0; e.facing = facing;
  }, [room, px, ty, facing]);
}
async function tap(ph, action, ms = 120) {
  const r = await ph.page.evaluate((a) => {
    const el = document.querySelector(`[data-action="${a}"]`);
    if (!el) return null;
    const b = el.getBoundingClientRect();
    return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
  }, action);
  if (!r) return false;
  await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...r, id: 2 }] });
  await sleep(ms);
  await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  return true;
}
const shot = (ph, name, phone) => ph.page.screenshot({ path: path.join(out, `${tag}-${name}-${phone}.png`) });

const browser = await chromium.launch();
for (const phone of PHONES) {
  const room = `heroes-${tag}-${phone.name}-${Math.random().toString(36).slice(2, 7)}`;
  const A = await open(browser, phone.opts, room, phone.inset);
  // A plays the grappler
  for (let i = 0; i < 4 && (await me(A)).kind !== 'grappler'; i++) { await tap(A, 'switch'); await sleep(400); }
  const B = await open(browser, { ...devices['iPhone 14 landscape'] }, room, false);
  const C = await open(browser, { ...devices['iPhone 14 landscape'] }, room, false);
  console.log(phone.name, (await me(A)).kind, (await me(B)).kind, (await me(C)).kind);
  // standing together
  for (const [r, tx, ty] of SPOTS) {
    await put(A, r, tx * 16, ty, 1);
    await put(B, r, tx * 16 + 26, ty, -1);
    await put(C, r, tx * 16 - 24, ty, 1);
    await sleep(1200);
    await shot(A, `together-${r}`, phone.name);
  }
  // a punch, in the castle street
  const [r0, tx0, ty0] = SPOTS[0];
  await put(B, r0, tx0 * 16 + 90, ty0, -1);
  await put(C, r0, tx0 * 16 - 90, ty0, 1);
  await put(A, r0, tx0 * 16, ty0, 1);
  await sleep(800);
  await tap(A, 'attack', 40);
  await sleep(50);
  await shot(A, 'punch', phone.name);
  await sleep(700);
  // carry a friend, then throw: a filmstrip
  await put(B, r0, tx0 * 16 + 20, ty0, -1);
  await put(A, r0, tx0 * 16, ty0, 1);
  await sleep(700);
  await tap(A, 'grab');
  await sleep(500);
  await shot(A, 'carry-friend', phone.name);
  await tap(A, 'attack', 40);
  for (let i = 0; i < 6; i++) { await shot(A, `throw-${i}`, phone.name); await sleep(40); }
  await sleep(2500);
  // carry a crate: the throne room's crates
  await put(A, 'throne-room', 11 * 16, 14, 1);
  await sleep(1000);
  const crate = await A.page.evaluate(() => {
    const d = window.irreverents;
    const c = d.drawn.entities.find((e) => e.kind === 'crate');
    return c ? { x: c.x, foot: c.y + d.content.characters[c.kind].box.h } : null;
  });
  if (crate) {
    await put(B, 'throne-room', crate.x + 80, 14, -1);
    await put(A, 'throne-room', crate.x - 20, crate.foot, 1);
    await sleep(900);
    await tap(A, 'grab');
    await sleep(500);
    await shot(A, 'carry-crate', phone.name);
  } else console.log('no crate in the throne room');
  for (const p of [A, B, C]) await p.ctx.close();
}
await browser.close();
console.log('shots written to', out);
