// Step 8's look facts (look-*), called from scripts/e2e.ts (look round 3,
// lane "actors"; docs/mechanisms/rendering-actors.md, "Round 3").
//
// look-moods: the three moods are told apart on screen. In a real page,
//   the game's own drawing code (draw/entities.ts and draw/npcs.ts, bundled
//   here from src/ with esbuild) draws the same guard, at the same tick and
//   place, at moods 1, 2 and 3, with the page's own content and art; each
//   pair of crops must differ in more than MOOD_MIN pixels. Control: the same
//   mood drawn twice differs in fewer. DRAFT: why drawn and not caught live:
//   a guard raised in play paces, barks and chases, so two live crops differ
//   by his walk as much as by his mood, and the check would measure the walk.
// look-hidden-mark: two pages in one world; a friend standing in the street
//   has their mark on the other page; hidden in the awning curtain, the other
//   page draws no mark over them (and their own page a faint one), read from
//   each page's record (`drawn.entities[].hidden`, `.marked`). Its control is
//   the first half: the same friend, not hidden, marked.

import path from 'node:path';
import { root } from '../lib/registries.ts';

/* eslint-disable @typescript-eslint/no-explicit-any */
type Page = any;
type Fact = (id: string, ok: boolean, text: string) => void;
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/** DRAFT: fewer differing pixels than this and two moods read as one (a mood mark alone is about 40). */
const MOOD_MIN = 20;

const online = (page: Page): Promise<unknown> =>
  page.waitForFunction(() => (window as any).irreverents?.drawn.status === 'online' && (window as any).irreverents.drawn.me, null, { timeout: 10000 });

/** The page's own character moved by its own report (the page is the truth for it: docs/mechanisms/network.md). */
const put = (page: Page, room: string, x: number, y: number): Promise<void> =>
  page.evaluate(([r, px, py]: [string, number, number]) => {
    const d = (window as any).irreverents;
    const e = d.world.entities.find((q: any) => q.player === d.player);
    e.room = r;
    e.x = px;
    e.y = py;
    e.vx = 0;
    e.vy = 0;
  }, [room, x, y]);

async function becomes(page: Page, kind: string): Promise<boolean> {
  for (let i = 0; i < 6; i++) {
    const k = await page.evaluate(() => {
      const d = (window as any).irreverents;
      return d.world.entities.find((q: any) => q.player === d.player)?.kind;
    });
    if (k === kind) return true;
    await page.keyboard.down('KeyQ');
    await sleep(80);
    await page.keyboard.up('KeyQ');
    await sleep(400);
  }
  return false;
}

/** The page's record of another player: hidden, and the mark it drew (0 none). */
const recordOf = (page: Page, player: string): Promise<{ hidden: boolean; marked: number | null } | null> =>
  page.evaluate((p: string) => {
    const e = (window as any).irreverents.drawn.entities.find((d: any) => d.player === p);
    return e ? { hidden: !!e.hidden, marked: e.marked ?? null } : null;
  }, player);

async function until(page: Page, player: string, ok: (r: any) => boolean, ms: number): Promise<any> {
  const t0 = Date.now();
  let r: any = null;
  while (Date.now() - t0 < ms) {
    r = await recordOf(page, player);
    if (r && ok(r)) return r;
    await sleep(60);
  }
  return r;
}

/** The game's drawing code, bundled for the page: draws one guard at a mood into a canvas and returns its pixels. */
async function sampler(): Promise<string> {
  const esbuild = await import('esbuild');
  const entry = `
    import { drawEntities } from './src/client/draw/entities.ts';
    import { drawNpcs } from './src/client/draw/npcs.ts';
    import { sheetOf } from './src/client/draw/sprites.ts';
    import { look } from './src/client/draw/fx.ts';
    const W = 96, H = 96, ROOM = 'castle-street';
    const guard = (id, mood) => ({ id, kind: 'guard', room: ROOM, x: 40, y: 40, vx: 0, vy: 0, facing: 1, onGround: true, player: null,
      c: { npc: { kind: 'guard', mood, dissonance: 0 } } });
    window.__lookMood = {
      ready() {
        const d = window.irreverents;
        const g = guard('look-probe', 1);
        const c = document.createElement('canvas'); c.width = W; c.height = H;
        drawEntities(c.getContext('2d'), { ...d.world, tick: 600, entities: [g] }, d.content, ROOM, 0, 0);
        return !!sheetOf(d.content, g) && !!look('mood-2') && !!look('mood-3');
      },
      draw(id, mood, tick) {
        const d = window.irreverents;
        const c = document.createElement('canvas'); c.width = W; c.height = H;
        const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
        const world = { ...d.world, tick, entities: [guard(id, mood)] };
        drawEntities(g, world, d.content, ROOM, 0, 0);
        drawNpcs(g, world, d.content, ROOM, 0, 0);
        return Array.from(g.getImageData(0, 0, W, H).data);
      },
    };`;
  const r = await esbuild.build({ stdin: { contents: entry, resolveDir: root, loader: 'js' }, bundle: true, format: 'iife', write: false, platform: 'browser', logLevel: 'silent' });
  return r.outputFiles[0]!.text;
}

const differing = (a: number[], b: number[]): number => {
  let n = 0;
  for (let i = 0; i < a.length; i += 4) if (a[i] !== b[i] || a[i + 1] !== b[i + 1] || a[i + 2] !== b[i + 2] || a[i + 3] !== b[i + 3]) n++;
  return n;
};

export async function lookFacts(run: { browser: any; devices: any; base: string; out: string; fact: Fact; errors: string[] }): Promise<void> {
  const { browser, devices, base, out, fact, errors } = run;
  const url = `${base}/?room=e2e-look-${Math.random().toString(36).slice(2, 10)}`;
  const ctxA = await browser.newContext({ ...devices['iPhone 14 landscape'] });
  const ctxB = await browser.newContext({ ...devices['iPhone 14 landscape'] });
  try {
    const A = await ctxA.newPage();
    const B = await ctxB.newPage();
    A.on('pageerror', (e: Error) => errors.push(`look A: ${e.message}`));
    B.on('pageerror', (e: Error) => errors.push(`look B: ${e.message}`));
    await A.goto(url);
    await online(A);
    await B.goto(url);
    await online(B);

    // ---- look-moods ----
    await A.addScriptTag({ content: await sampler() });
    let ready = false;
    for (let i = 0; i < 50 && !ready; i++) {
      ready = await A.evaluate(() => (window as any).__lookMood.ready());
      if (!ready) await sleep(100);
    }
    const px = (id: string, mood: number): Promise<number[]> => A.evaluate(([i, m]: [string, number]) => (window as any).__lookMood.draw(i, m, 600), [id, mood]);
    const [m1, m1b, m2, m3] = [await px('look-g1', 1), await px('look-g1b', 1), await px('look-g2', 2), await px('look-g3', 3)];
    const d12 = differing(m1, m2);
    const d13 = differing(m1, m3);
    const d23 = differing(m2, m3);
    const same = differing(m1, m1b);
    fact('look-moods', ready && d12 > MOOD_MIN && d13 > MOOD_MIN && d23 > MOOD_MIN && same < MOOD_MIN,
      `the game's drawing draws the same guard at moods 1, 2, 3 ${ready ? '' : '(its art did NOT load) '}differing in ${d12} (1-2), ${d13} (1-3), ${d23} (2-3) pixels, each more than ${MOOD_MIN}; control: mood 1 twice differs in ${same}, fewer than ${MOOD_MIN}`);

    // ---- look-hidden-mark ----
    const idA = await A.evaluate(() => (window as any).irreverents.player);
    const idB = await B.evaluate(() => (window as any).irreverents.player);
    const kinds = (await becomes(B, 'infiltrator')) && (await becomes(A, 'grappler'));
    // The castle street: A near the west end, B first in the open street, then in the awning
    // curtain (columns 8-9, rows 9-10: content/rooms/castle-street.json).
    const T = 16;
    const boxB = await B.evaluate(() => (window as any).irreverents.content.characters.infiltrator.box);
    await put(A, 'castle-street', 3 * T, 11 * T - 30);
    await put(B, 'castle-street', 12 * T, 11 * T - boxB.h);
    const open = await until(A, idB, (r) => !r.hidden && (r.marked ?? 0) > 0, 4000);
    await put(B, 'castle-street', 8 * T + Math.round((2 * T - boxB.w) / 2), 11 * T - boxB.h);
    const hid = await until(A, idB, (r) => r.hidden && r.marked === 0, 4000);
    const own = await until(B, idB, (r) => r.hidden, 2000);
    await A.screenshot({ path: path.join(out, 'look-hidden-other.png') });
    await B.screenshot({ path: path.join(out, 'look-hidden-own.png') });
    fact('look-hidden-mark', kinds && !!open && !open.hidden && open.marked > 0 && !!hid && hid.hidden && hid.marked === 0 && !!own && own.hidden && own.marked > 0 && own.marked < 1,
      `${kinds ? '' : '(could not pick the characters) '}in the street, A's page drew B ${open?.hidden ? 'hidden' : 'not hidden'} with a mark of ${open?.marked ?? '?'}; in the awning curtain, A's page drew B ${hid?.hidden ? 'hidden' : 'NOT hidden'} with a mark of ${hid?.marked ?? '?'} (0 = none) and B's own page a mark of ${own?.marked ?? '?'} (faint: between 0 and 1); A is ${idA}`);
  } finally {
    await ctxA.close();
    await ctxB.close();
  }
}
