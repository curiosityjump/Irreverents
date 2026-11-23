// The game's sound, in a real page (headless Chromium, phone-sized, by
// touch) against the built server: silent before the first tap; after one
// tap the page reports its sound files loaded and at least one effect
// played (a jump, pressed on the touch control); and with every file under
// assets/audio/ refused, the game still runs and still moves. Also: every
// file a content/sounds/ entry names is in assets/, and every tune's rooms
// are rooms of the real map. docs/mechanisms/sound.md.
//
// Playwright is preinstalled here, not a dependency (scripts/e2e.ts says
// the same); without it this check fails and says so.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import net from 'node:net';
import path from 'node:path';
import { root } from '../lib/registries.ts';
import type { ScriptCheck } from '../lib/script-checks.ts';

/* eslint-disable @typescript-eslint/no-explicit-any */
function newestIn(dir: string): number {
  let newest = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true, recursive: true })) {
    if (entry.isFile() && !entry.name.endsWith('.gen.ts')) newest = Math.max(newest, fs.statSync(path.join(entry.parentPath, entry.name)).mtimeMs);
  }
  return newest;
}

const freePort = (): Promise<number> =>
  new Promise((resolve, reject) => {
    const s = net.createServer();
    s.once('error', reject);
    s.listen(0, '127.0.0.1', () => {
      const p = (s.address() as net.AddressInfo).port;
      s.close(() => resolve(p));
    });
  });

/** A real press: a finger down on the middle of `locator` for `ms`, then up (as scripts/lib/e2e-touch.ts presses). */
async function press(cdp: any, locator: any, ms: number): Promise<boolean> {
  if ((await locator.count()) === 0) return false;
  const box = await locator.first().boundingBox();
  if (!box) return false;
  const pt = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [pt] });
  await new Promise((r) => setTimeout(r, ms));
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  return true;
}

const check: ScriptCheck = {
  id: 'sound',
  gate: null,
  proves:
    'the page is silent until the first tap, then loads its sound files and plays a jump pressed on the touch control (control: the same page with no tap plays nothing); with every sound file refused the game still runs and moves; every file and room the sound data names exists',
  async run(content): Promise<string[]> {
    const failures: string[] = [];
    // The data against the real map and the real files.
    for (const s of Object.values(content.sounds)) {
      if (s.type === 'tune') {
        for (const room of s.rooms) if (!(room in content.rooms)) failures.push(`content/sounds/${s.id}.json: "${room}" is not a room in content/rooms/`);
      } else {
        for (const f of s.files) if (!fs.existsSync(path.join(root, 'assets', f))) failures.push(`content/sounds/${s.id}.json: assets/${f} does not exist (src/client/audio/prepare-pack.py copies the delivered pack)`);
      }
    }

    let chromium: any;
    try {
      ({ chromium } = createRequire(import.meta.url)('playwright'));
    } catch {
      return [...failures, 'Playwright is not installed here, so the page could not be played (it is preinstalled in the cloud sessions; see scripts/e2e.ts)'];
    }
    const file = path.join(root, 'dist/server.cjs');
    const sources = Math.max(newestIn(path.join(root, 'src')), newestIn(path.join(root, 'content')), newestIn(path.join(root, 'assets')));
    if (!fs.existsSync(file) || fs.statSync(file).mtimeMs < sources) {
      const { build } = await import('../build.ts');
      if (!(await build())) return [...failures, 'dist/ was missing or older than the sources, and npm run build failed'];
    }
    const port = await freePort();
    const child = spawn(process.execPath, [file], { env: { ...process.env, PORT: String(port) }, stdio: ['ignore', 'pipe', 'pipe'] });
    let output = '';
    child.stdout.on('data', (d: Buffer) => (output += d.toString()));
    child.stderr.on('data', (d: Buffer) => (output += d.toString()));
    let browser: any = null;
    const base = `http://127.0.0.1:${port}`;
    const sound = (page: any): Promise<any> => page.evaluate(() => (window as any).irreverents.sound);
    try {
      for (let i = 0; i < 100; i++) {
        try {
          if ((await fetch(`${base}/healthz`)).ok) break;
        } catch {
          await new Promise((r) => setTimeout(r, 50));
        }
      }
      browser = await chromium.launch({ args: ['--autoplay-policy=user-gesture-required'] });
      const phone = { viewport: { width: 844, height: 390 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true };
      const tag = `check-sound-${process.pid}`;
      const errors: string[] = [];

      // 1. With sound files: silent before a tap; one tap on jump starts sound and plays the jump.
      const ctx = await browser.newContext(phone);
      const page = await ctx.newPage();
      page.on('pageerror', (e: Error) => errors.push(e.message));
      await page.goto(`${base}/?room=${tag}-a`);
      await page.waitForFunction(() => (window as any).irreverents?.drawn.me && (window as any).irreverents.sound, null, { timeout: 10000 });
      await page.waitForTimeout(800);
      const before = await sound(page);
      // The control: a page nobody has touched has started nothing and played nothing.
      if (before.unlocked || before.played > 0) failures.push(`before any tap the page had already started sound (unlocked ${before.unlocked}, ${before.played} played)`);
      const cdp = await ctx.newCDPSession(page);
      const jump = page.locator('#actions button[data-action="jump"]');
      if (!(await press(cdp, jump, 150))) failures.push('there is no jump button on the touch layout to press');
      try {
        await page.waitForFunction(() => (window as any).irreverents.sound.loaded + (window as any).irreverents.sound.failed.length >= (window as any).irreverents.sound.files, null, { timeout: 8000 });
      } catch {
        // reported below
      }
      // The first press may come before the files are decoded; a second jump, once landed, must sound.
      await page.waitForTimeout(900);
      await press(cdp, jump, 150);
      await page.waitForTimeout(700);
      const after = await sound(page);
      if (!after.unlocked || after.state !== 'running') failures.push(`after one tap sound did not start (unlocked ${after.unlocked}, state "${after.state}")`);
      if (after.loaded !== after.files || after.failed.length) failures.push(`after one tap ${after.loaded} of ${after.files} sound files had loaded; failed: ${after.failed.join(', ') || 'none'}`);
      if (!after.log.some((l: any) => l.moment === 'jump' && l.mine)) failures.push(`the jump pressed on the touch control was not heard; played: ${after.log.map((l: any) => l.moment).join(', ') || 'nothing'}`);
      if (after.tune === '' && content.sounds && Object.values(content.sounds).some((s) => s.type === 'tune' && s.rooms.includes(content.game.startRoom))) failures.push(`the start room has a tune but none is playing`);
      else if (after.tune !== '' && after.notes === 0) failures.push(`tune ${after.tune} is playing but has started no notes`);
      // The way out: the sound button turns it off, and it stays off on the next page.
      await press(cdp, page.locator('#sound'), 60);
      await page.waitForTimeout(100);
      const muted = await sound(page);
      if (!muted.muted) failures.push('the sound button did not turn sound off');
      await page.reload();
      await page.waitForFunction(() => (window as any).irreverents?.sound, null, { timeout: 10000 });
      if (!(await sound(page)).muted) failures.push('turning sound off was not remembered after a reload');
      await ctx.close();

      // 2. Every sound file refused: the game runs and moves, silently.
      const ctx2 = await browser.newContext(phone);
      await ctx2.route('**/assets/audio/**', (r: any) => r.fulfill({ status: 404, body: 'gone' }));
      const page2 = await ctx2.newPage();
      page2.on('pageerror', (e: Error) => errors.push(e.message));
      await page2.goto(`${base}/?room=${tag}-b`);
      await page2.waitForFunction(() => (window as any).irreverents?.drawn.me, null, { timeout: 10000 });
      const start = await page2.evaluate(() => ({ x: (window as any).irreverents.drawn.me.x, frame: (window as any).irreverents.drawn.frame }));
      if (!(await press(await ctx2.newCDPSession(page2), page2.locator('#pad i.r'), 700))) failures.push('there is no right arrow on the touch layout to hold');
      await page2.waitForTimeout(400);
      const end = await page2.evaluate(() => ({ x: (window as any).irreverents.drawn.me.x, frame: (window as any).irreverents.drawn.frame }));
      const s2 = await sound(page2);
      if (end.frame - start.frame < 30) failures.push(`with the sound files refused the page stopped drawing (${end.frame - start.frame} frames in about 1 s)`);
      if (Math.abs(end.x - start.x) < 8) failures.push(`with the sound files refused the character did not move when held right (x ${start.x} -> ${end.x})`);
      if (s2.loaded !== 0 || s2.failed.length !== s2.files) failures.push(`with the sound files refused the page reported ${s2.loaded} loaded and ${s2.failed.length} of ${s2.files} failed`);
      await ctx2.close();
      if (errors.length) failures.push(`the page raised errors: ${errors.slice(0, 3).join(' | ')}`);
    } catch (err) {
      failures.push(`the check itself failed: ${(err as Error).message.split('\n')[0]}; the server printed: ${output.trim().slice(-300) || '(nothing)'}`);
    } finally {
      await browser?.close().catch(() => {});
      child.kill();
    }
    return failures;
  },
};
export default check;
