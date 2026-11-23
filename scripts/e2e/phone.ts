// Facts about how the page sits on iPhones, called from scripts/e2e.ts
// (Step 5). Each opens its own page in a private world of its own.
//
// Not in scripts/checks/: every file there is loaded by `npm run check` as
// a ScriptCheck, and these need a browser.
import path from 'node:path';

/* eslint-disable @typescript-eslint/no-explicit-any */
type Page = any;
type Fact = (id: string, ok: boolean, text: string) => void;

export interface PhoneRun {
  browser: any;
  devices: any;
  /** The address with no query, e.g. http://127.0.0.1:4000 */
  base: string;
  /** Where screenshots go. */
  out: string;
  /** Prefix for world names and screenshot names ('e2e' or 'check'). */
  tag: string;
  fact: Fact;
  errors: string[];
}

/**
 * iPhones held sideways: the view fills the screen and the controls sit
 * over it, see-through (docs/decisions-log.md, 2026-11-23, "Held sideways,
 * the game fills the phone"); the camera keeps the floor and the player
 * clear of them (fact i-clear). `insets`: a notched phone's safe area,
 * set through the browser so `env()` sees it (CSS px).
 */
const FULL_VIEW_PHONES: { name: string; width: number; height: number; dpr: number; insets?: { left: number; right: number; bottom: number } }[] = [
  { name: 'iPhone SE 2/3, 6/7/8', width: 667, height: 375, dpr: 2 },
  { name: 'iPhone 6/7/8 Plus', width: 736, height: 414, dpr: 3 },
  { name: 'iPhone 14 (Playwright, no notch)', width: 750, height: 340, dpr: 3 },
  { name: 'iPhone 14 in Safari, notch and home bar', width: 844, height: 340, dpr: 3, insets: { left: 47, right: 47, bottom: 21 } },
];
/** An iPhone 14 held sideways: notch side, far side, home bar (CSS px). Headless Chromium reports 0, so the script sets them. */
const INSET = { left: 47, right: 47, bottom: 21 };
/**
 * The most of the view the controls may paint over, as a share of the view,
 * when they sit on it. Measured 2026-11-23 with paintedShare below: the
 * first layout (five 76 px discs and a boxed pad) painted 14.76% at
 * 667x375 and 9.71% at 736x414 and fails this fact; the see-through one
 * paints 0.89% and 0.41% as labels, 2.62% and 0.90% with the delivered
 * pictures (36 and 32 CSS px). DRAFT: pinned at 3%, which leaves room for
 * small art and none for a disc.
 */
const PAINT_LIMIT = 0.03;
/** Less than this and the controls are not really shown at all. */
const PAINT_FLOOR = 0.001;

/** The see-through rule on paint: at most PAINT_LIMIT of the view, and enough to be seen when over it. */
export const paintOk = (painted: number, overView: boolean): boolean => painted <= PAINT_LIMIT && (!overView || painted >= PAINT_FLOOR);
export const PAINT = { limit: PAINT_LIMIT, floor: PAINT_FLOOR };

/**
 * Where the clearance fact stands the player: the brief's spots, plus two
 * where the camera stops at a room's edge and so the player is drawn over a
 * corner, where the controls are. [room, tile x, tile y the feet are in].
 */
const CLEAR_SPOTS: [string, number, number][] = [
  ['throne-room', 9, 14],
  ['throne-room', 17, 14],
  ['castle-street', 16, 10],
  ['castle-street', 37, 10],
  ['castle-street', 2, 10],
  ['castle-street', 45, 10],
];

/** Stands the page's own character at each spot and lists the controls whose rectangle overlaps its drawn box. */
async function overlapsAtSpots(page: Page): Promise<string[]> {
  const hits: string[] = [];
  for (const [room, tx, ty] of CLEAR_SPOTS) {
    const r = await page.evaluate(
      async ([room, tx, ty]: [string, number, number]) => {
        const d = (window as any).irreverents;
        const e = d.world.entities.find((x: any) => x.player === d.player);
        const box = d.content.characters[e.kind].box;
        e.room = room;
        e.x = tx * 16 + (16 - box.w) / 2;
        e.y = (ty + 1) * 16 - box.h;
        e.vx = 0;
        e.vy = 0;
        const f0 = d.drawn.frame;
        await new Promise<void>((res) => {
          const t = (): void => (d.drawn.frame > f0 + 3 && d.drawn.room === room ? res() : void requestAnimationFrame(t));
          requestAnimationFrame(t);
        });
        const me = d.drawn.me;
        const c = document.getElementById('game') as HTMLCanvasElement;
        const cr = c.getBoundingClientRect();
        const k = cr.width / c.width;
        // drawn.me's px/py are room pixels; the camera is the room pixel at the view's top-left.
        const sx = me.px - d.drawn.camera.x;
        const sy = me.py - d.drawn.camera.y;
        const b = { left: cr.left + sx * k, top: cr.top + sy * k, right: cr.left + (sx + box.w) * k, bottom: cr.top + (sy + box.h) * k };
        const over = [...document.querySelectorAll('[data-stick], [data-action]')].filter((el) => {
          const q = el.getBoundingClientRect();
          return q.left < b.right && q.right > b.left && q.top < b.bottom && q.bottom > b.top;
        });
        return over.map((el) => (el as HTMLElement).dataset.action ?? 'stick');
      },
      [room, tx, ty],
    );
    for (const a of r) hits.push(`${a} over the player at ${room} (${tx}, ${ty})`);
  }
  return hits;
}

/**
 * Fact i-clear: with the controls over the view, none of them covers the
 * player's own character standing on the floor at the spots above (the
 * camera's bottom reserve, draw/room.ts `roomOrigin`). Control: with the
 * reserve forced to 0 the same spots must show an overlap, or the fact
 * proves nothing.
 */
async function clearanceFact(page: Page, fact: Fact, out: string, tag: string): Promise<void> {
  const reserve = await page.evaluate(() => (window as any).irreverents.view.reserve as number);
  const real = await overlapsAtSpots(page);
  await page.screenshot({ path: path.join(out, `${tag === 'check' ? 'live-' : ''}phone-clear.png`) });
  await page.evaluate(() => ((window as any).irreverents.view.reserve = 0));
  const control = await overlapsAtSpots(page);
  await page.screenshot({ path: path.join(out, `${tag === 'check' ? 'live-' : ''}phone-clear-control.png`) });
  await page.evaluate(() => window.dispatchEvent(new Event('resize')));
  fact('i-clear', reserve > 0 && real.length === 0 && control.length > 0,
    `with the controls over the view (750x340), the camera keeps the player's own character clear of them: bottom reserve ${reserve} game px; overlaps at ${CLEAR_SPOTS.length} spots: ${real.join('; ') || 'none'}; control (reserve forced to 0): ${control.join('; ') || 'NO overlap, so the fact proves nothing'}`);
}

const rand = (): string => Math.random().toString(36).slice(2, 10);
const online = (page: Page): Promise<unknown> =>
  page.waitForFunction(() => (window as any).irreverents?.drawn.status === 'online' && (window as any).irreverents.drawn.me, null, { timeout: 10000 });

/** Where the view and every control sit, which controls a finger at their centre would not reach, and the insets the page read. */
export const read = (page: Page): Promise<any> =>
  page.evaluate(() => {
    const r = (el: Element): any => {
      const b = el.getBoundingClientRect();
      return { left: b.left, top: b.top, right: b.right, bottom: b.bottom };
    };
    const view = r(document.getElementById('game')!);
    const els = [...document.querySelectorAll('[data-stick], [data-action]')] as HTMLElement[];
    const controls = els.map((el) => {
      const b = r(el);
      const at = document.elementFromPoint((b.left + b.right) / 2, (b.top + b.bottom) / 2);
      return { ...b, action: el.dataset.action ?? 'stick', reachable: !!at && (at === el || el.contains(at)) };
    });
    const pad = getComputedStyle(document.getElementById('safe')!);
    return {
      view,
      controls,
      actions: Object.keys((window as any).irreverents.content.actions),
      shown: (window as any).irreverents.drawn.touchControls as boolean,
      scale: (window as any).irreverents.drawn.scale as number,
      inset: { left: parseFloat(pad.paddingLeft) || 0, right: parseFloat(pad.paddingRight) || 0, bottom: parseFloat(pad.paddingBottom) || 0 },
      vw: innerWidth,
      vh: innerHeight,
    };
  });

export const problemsOf = (lay: any): string[] => {
  const p: string[] = [];
  const have = lay.controls.map((c: any) => c.action);
  if (!lay.shown) p.push('the touch controls are hidden');
  for (const a of [...lay.actions, 'stick']) if (!have.includes(a)) p.push(`no control for ${a}`);
  for (const c of lay.controls) {
    const w = c.right - c.left;
    const h = c.bottom - c.top;
    if (w < 44 || h < 44) p.push(`${c.action} is ${Math.round(w)}x${Math.round(h)} to touch (44 needed)`);
    if (c.left < 0 || c.top < 0 || c.right > lay.vw || c.bottom > lay.vh) p.push(`${c.action} is off screen`);
    if (c.left < lay.inset.left || c.right > lay.vw - lay.inset.right || c.bottom > lay.vh - lay.inset.bottom) p.push(`${c.action} is under a safe-area inset`);
    if (!c.reachable) p.push(`${c.action} is under something else at its centre`);
  }
  return p;
};

/**
 * The share of the view the controls paint over: the view's box
 * photographed with the controls and without them, the game itself hidden
 * both times so nothing else differs, and the two compared pixel by pixel.
 */
export async function paintedShare(page: Page, view: any): Promise<number> {
  const clip = { x: view.left, y: view.top, width: view.right - view.left, height: view.bottom - view.top };
  const style = await page.addStyleTag({ content: '#game, #status, #hint { visibility: hidden !important; }' });
  const withControls = (await page.screenshot({ clip })).toString('base64');
  const hide = await page.addStyleTag({ content: '#touch { visibility: hidden !important; }' });
  const without = (await page.screenshot({ clip })).toString('base64');
  await hide.evaluate((el: Element) => el.remove());
  await style.evaluate((el: Element) => el.remove());
  return page.evaluate(async ([a, b]: string[]) => {
    const pixels = async (b64: string): Promise<ImageData> => {
      const bitmap = await createImageBitmap(await (await fetch(`data:image/png;base64,${b64}`)).blob());
      const c = document.createElement('canvas');
      c.width = bitmap.width;
      c.height = bitmap.height;
      const g = c.getContext('2d')!;
      g.drawImage(bitmap, 0, 0);
      return g.getImageData(0, 0, c.width, c.height);
    };
    const [p, q] = [await pixels(a!), await pixels(b!)];
    let differ = 0;
    for (let i = 0; i < p.data.length; i += 4) {
      if (p.data[i] !== q.data[i] || p.data[i + 1] !== q.data[i + 1] || p.data[i + 2] !== q.data[i + 2]) differ++;
    }
    return differ / (p.data.length / 4);
  }, [withControls, without]);
}

export async function phoneFacts(run: PhoneRun): Promise<void> {
  const { browser, devices, base, out, tag, fact, errors } = run;
  for (const phone of FULL_VIEW_PHONES) {
    const id = `i-${phone.width}x${phone.height}`;
    const ctx = await browser.newContext({
      userAgent: devices['iPhone 14 landscape'].userAgent,
      viewport: { width: phone.width, height: phone.height },
      deviceScaleFactor: phone.dpr,
      hasTouch: true,
      isMobile: true,
    });
    try {
      const page = await ctx.newPage();
      page.on('pageerror', (e: Error) => errors.push(`${id}: ${e.message}`));
      if (phone.insets) {
        const cdp = await ctx.newCDPSession(page);
        await cdp.send('Emulation.setSafeAreaInsetsOverride', { insets: { top: 0, ...phone.insets } });
      }
      await page.goto(`${base}/?room=${tag}-phone-${rand()}`);
      await online(page);
      const lay = await read(page);
      const painted = await paintedShare(page, lay.view);
      await page.screenshot({ path: path.join(out, `${tag === 'check' ? 'live-' : ''}phone-${phone.width}x${phone.height}.png`) });

      // The same phone with a notch and a home bar: nothing may sit under them.
      await page.evaluate((i: typeof INSET) => {
        document.getElementById('safe')!.style.padding = `0 ${i.right}px ${i.bottom}px ${i.left}px`;
        window.dispatchEvent(new Event('resize'));
      }, INSET);
      const inset = await read(page);

      // A touch on a control must still do its job: run and jump with two fingers.
      await page.evaluate(() => {
        document.getElementById('safe')!.style.padding = '';
        window.dispatchEvent(new Event('resize'));
      });
      const now = await read(page);
      const centre = (c: any, fx = 0.5): { x: number; y: number } => ({ x: Math.round(c.left + (c.right - c.left) * fx), y: Math.round((c.top + c.bottom) / 2) });
      const stick = now.controls.find((c: any) => c.action === 'stick');
      const jump = now.controls.find((c: any) => c.action === 'jump');
      let played = false;
      if (stick && jump) {
        const cdp = await ctx.newCDPSession(page);
        const me0 = await page.evaluate(() => (window as any).irreverents.drawn.me);
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...centre(stick, 0.75), id: 1 }, { ...centre(jump), id: 2 }] });
        try {
          await page.waitForFunction(
            ([x0, y0]: number[]) => {
              const me = (window as any).irreverents.drawn.me;
              return me.x > x0! + 3 && me.y < y0! - 3;
            },
            [me0.x, me0.y],
            { polling: 'raf', timeout: 1500 },
          );
          played = true;
        } catch {
          played = false;
        }
        await page.screenshot({ path: path.join(out, `${tag === 'check' ? 'live-' : ''}phone-${phone.width}x${phone.height}-pressed.png`) });
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      }

      const problems = [...problemsOf(lay), ...problemsOf(inset).map((p) => `with a notch and home bar: ${p}`)];
      const overView = lay.controls.some((c: any) => c.left < lay.view.right && c.right > lay.view.left && c.top < lay.view.bottom && c.bottom > lay.view.top);
      const sizes = lay.controls.map((c: any) => `${c.action} ${Math.round(c.right - c.left)}x${Math.round(c.bottom - c.top)}`).join(', ');
      if (phone.width === 750 && phone.height === 340) await clearanceFact(page, fact, out, tag);
      fact(id, problems.length === 0 && played && paintOk(painted, overView),
        `${phone.name} sideways (${lay.vw}x${lay.vh} @${phone.dpr}x, game pixels ${lay.scale}x): every action and the stick has a control, on screen, clear of a notch and home bar, 44 px or more to touch (${sizes}): ${problems.join('; ') || 'yes'}; two fingers ran and jumped: ${played}; the controls paint over ${(painted * 100).toFixed(2)}% of the view (limit ${PAINT_LIMIT * 100}%, and at least ${PAINT_FLOOR * 100}% so they can be seen)`);
    } finally {
      await ctx.close();
    }
  }
}
