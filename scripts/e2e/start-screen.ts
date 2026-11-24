// Step 17's facts (start-*), called from scripts/e2e.ts (local runs only:
// a game is saved on the server's volume, and a scripted check never leaves
// anything in the live one). Phone-sized pages, by touch only: the start
// screen, New game, a friend joining by the shared link, and the way back.
// docs/mechanisms/saves.md, "The start screen".
import path from 'node:path';

/* eslint-disable @typescript-eslint/no-explicit-any */
type Page = any;
type Fact = (id: string, ok: boolean, text: string) => void;

const online = (page: Page, ms = 10000): Promise<unknown> =>
  page.waitForFunction(() => (window as any).irreverents?.drawn.status === 'online' && (window as any).irreverents.drawn.me, null, { timeout: ms });
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
const safely = async <T>(p: Promise<T>): Promise<T | null> => {
  try {
    return await p;
  } catch {
    return null;
  }
};
/** Whether `page` draws the player `id` (someone else). */
const draws = (page: Page, id: string): Promise<boolean> =>
  page.evaluate((p: string) => (window as any).irreverents.drawn.entities.some((d: any) => d.player === p), id);
/** The rectangle of a selector, or null; for "on screen and big enough to tap". */
const box = (page: Page, sel: string): Promise<{ x: number; y: number; w: number; h: number } | null> =>
  page.evaluate((s: string) => {
    const e = document.querySelector(s);
    if (!e) return null;
    const r = e.getBoundingClientRect();
    return r.width > 0 && r.height > 0 ? { x: r.left, y: r.top, w: r.width, h: r.height } : null;
  }, sel);

export async function startFacts(run: { browser: any; devices: any; base: string; out: string; fact: Fact; errors: string[]; shots?: string }): Promise<void> {
  const { browser, devices, base, out, fact, errors } = run;
  const ctxA = await browser.newContext({ ...devices['iPhone 14'] });
  const ctxB = await browser.newContext({ ...devices['iPhone 14 landscape'] });
  try {
    const A = await ctxA.newPage();
    const B = await ctxB.newPage();
    A.on('pageerror', (e: Error) => errors.push(`start A: ${e.message}`));
    B.on('pageerror', (e: Error) => errors.push(`start B: ${e.message}`));

    // 1. The address alone shows the start screen, not play.
    await A.goto(`${base}/`);
    await safely(A.waitForSelector('#start [data-start="new"]', { timeout: 5000 }));
    // Let the pixel font arrive before the picture is taken.
    await safely(A.waitForFunction(() => document.querySelectorAll('#start .st-words canvas').length >= 4, null, { timeout: 3000 }));
    const shown = await A.evaluate(() => ({ start: (window as any).irreverents?.start?.shown, world: (window as any).irreverents?.worldName, status: (window as any).irreverents?.drawn.status }));
    const targets = await A.evaluate(() =>
      [...document.querySelectorAll('#start button, #start input')].map((e) => {
        const r = e.getBoundingClientRect();
        return { name: (e as HTMLElement).dataset.start ?? e.id, h: r.height, inView: r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth };
      }),
    );
    const fieldFont = await A.evaluate(() => parseFloat(getComputedStyle(document.getElementById('join-code')!).fontSize));
    const fieldBox = await box(A, '#join-code');
    await A.screenshot({ path: path.join(out, 'start-upright.png') });
    if (run.shots) await A.screenshot({ path: path.join(run.shots, 'start-screen-390x664.png') });
    const small = targets.filter((t: any) => t.h < 44 || !t.inView);
    fact('start-shown', shown.start === 'start' && shown.world === '' && shown.status === '' && small.length === 0 && fieldFont >= 16 && !!fieldBox && fieldBox.y < 664 / 2,
      `opening the address shows the start screen (${shown.start}), no world joined (${JSON.stringify(shown.world)}); ${targets.length} choices, all on screen and 44 px or taller${small.length ? ` EXCEPT ${small.map((t: any) => `${t.name} ${Math.round(t.h)} px${t.inView ? '' : ' off screen'}`).join(', ')}` : ''}; the code field's text is ${fieldFont} px (16 or more, or iPhone zooms) and its top is at ${fieldBox ? Math.round(fieldBox.y) : '?'} px, in the upper half (the keyboard covers the lower)`);

    // 2. An unknown code says so and stays on the screen.
    await A.tap('#join-code');
    await A.keyboard.type('zzzz');
    const typed = await A.evaluate(() => (document.getElementById('join-code') as HTMLInputElement).value);
    await A.tap('#start [data-start="join"]');
    await safely(A.waitForFunction(() => (window as any).irreverents.start.message !== '', null, { timeout: 3000 }));
    const said = await A.evaluate(() => ({ message: (window as any).irreverents.start.message, shown: (window as any).irreverents.start.shown, world: (window as any).irreverents.worldName }));
    fact('start-unknown', typed === 'ZZZZ' && said.message === 'No game ZZZZ' && said.shown === 'start' && said.world === '',
      `typing "zzzz" puts "${typed}" in the field; Join says "${said.message}" and stays on the ${said.shown} screen (world ${JSON.stringify(said.world)})`);

    // 3. New game, by a tap: in play, in a game of its own.
    await A.tap('#start [data-start="new"]');
    const inA = await safely(online(A));
    const a = await A.evaluate(() => ({ world: (window as any).irreverents.worldName, id: (window as any).irreverents.player, address: location.search, start: !!document.getElementById('start'), menu: !!document.getElementById('menu-btn') }));
    const code = /^game-([A-Z]{4})$/.exec(a.world)?.[1] ?? '';
    fact('start-new', !!inA && code !== '' && a.address === `?game=${code}` && !a.start && a.menu,
      `New game: ${inA ? 'in play' : 'NOT in play within 10 s'} in world ${a.world}; the address is now ${a.address}; the start screen is ${a.start ? 'STILL there' : 'gone'}; the menu button is ${a.menu ? 'there' : 'MISSING'}`);

    // 4. The menu shows the code; a friend opens the shared link and joins by one tap; each sees the other.
    await A.tap('#menu-btn');
    await sleep(150);
    const menuCode = await A.evaluate(() => document.querySelector('#game-menu [data-code]')?.getAttribute('data-code') ?? '');
    const shareBox = await box(A, '#game-menu [data-menu="share"]');
    await A.screenshot({ path: path.join(out, 'start-menu.png') });
    await A.tap('#game-menu [data-menu="close"]');
    await sleep(100);
    const closed = await A.evaluate(() => (document.getElementById('game-menu') as HTMLElement).hidden);
    // Sideways, with as many games to continue as it shows: every choice still
    // on screen, on Playwright's iPhone 14 sideways and on an iPhone SE
    // sideways at Safari's real height there (667 wide, about 330 high).
    const SE = await browser.newContext({ viewport: { width: 667, height: 330 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
    const sizes: string[] = [];
    const offSide: string[] = [];
    let choices = 0;
    for (const P of [B, await SE.newPage()]) {
      await P.goto(`${base}/`);
      await P.evaluate(() => localStorage.setItem('irreverents.games', JSON.stringify(['HJKR', 'MNPB', 'QWZX', 'TUVW'])));
      await P.reload();
      await safely(P.waitForSelector('#start [data-start="kingdom"]', { timeout: 5000 }));
      const side = await P.evaluate(() => ({
        size: `${innerWidth}x${innerHeight}`,
        all: [...document.querySelectorAll('#start button, #start input')].map((e) => {
          const r = e.getBoundingClientRect();
          return { name: (e as HTMLElement).dataset.start ?? e.id, ok: r.height >= 44 && r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth };
        }),
      }));
      sizes.push(side.size);
      choices = Math.max(choices, side.all.length);
      offSide.push(...side.all.filter((t: any) => !t.ok).map((t: any) => `${t.name} at ${side.size}`));
      if (side.all.length !== 7) offSide.push(`${side.all.length} choices at ${side.size}`);
      await P.screenshot({ path: path.join(out, `start-sideways-${side.size}.png`) });
    }
    await SE.close();
    fact('start-sideways', offSide.length === 0, `sideways at ${sizes.join(' and ')} (the page's own measure) with four games remembered, the start screen has ${choices} choices (3 to continue shown) and ${offSide.length ? `these are off screen or small: ${offSide.join(', ')}` : 'every one is on screen and 44 px or taller'}`);
    await B.goto(`${base}/?game=${code}`);
    await safely(B.waitForSelector('#start [data-start="join-link"]', { timeout: 5000 }));
    const link = await B.evaluate(() => ({ shown: (window as any).irreverents.start?.shown, world: (window as any).irreverents.worldName }));
    await B.screenshot({ path: path.join(out, 'start-link.png') });
    await B.tap('#start [data-start="join-link"]');
    const inB = await safely(online(B));
    const b = await B.evaluate(() => ({ world: (window as any).irreverents.worldName, id: (window as any).irreverents.player, sound: (window as any).irreverents.sound?.unlocked === true }));
    let both = false;
    for (let i = 0; i < 40 && !both; i++) {
      both = (await draws(A, b.id)) && (await draws(B, a.id));
      if (!both) await sleep(100);
    }
    await B.screenshot({ path: path.join(out, 'start-joined.png') });
    fact('start-join', menuCode === code && !!shareBox && closed && link.shown === 'link' && link.world === '' && !!inB && b.world === a.world && both && b.sound,
      `the menu shows code ${menuCode || 'NONE'} and ${shareBox ? 'a Share button' : 'NO Share button'}, and Close ${closed ? 'shuts it' : 'does NOT shut it'}; the link ?game=${code} shows the ${link.shown} screen without joining; its one tap: ${inB ? 'in play' : 'NOT in play'} in ${b.world}, sound ${b.sound ? 'unlocked' : 'NOT unlocked'} by that tap; each page draws the other: ${both}`);

    // 5. Back to the start screen, and the game is there to continue.
    await A.tap('#menu-btn');
    await sleep(150);
    await A.tap('#game-menu [data-menu="back"]');
    await safely(A.waitForSelector('#start [data-start="new"]', { timeout: 8000 }));
    const back = await A.evaluate(() => ({ shown: (window as any).irreverents?.start?.shown, world: (window as any).irreverents?.worldName, continues: (window as any).irreverents?.start?.continues ?? [], address: location.search }));
    let gone = false;
    for (let i = 0; i < 30 && !gone; i++) {
      gone = !(await draws(B, a.id));
      if (!gone) await sleep(100);
    }
    const cont = await box(A, `#start [data-start="continue-${code}"]`);
    await A.screenshot({ path: path.join(out, 'start-back.png') });
    fact('start-back', back.shown === 'start' && back.world === '' && back.address === '' && back.continues[0] === code && !!cont && gone,
      `Back to the start screen: the ${back.shown} screen, no world joined, address "${back.address}"; Continue lists [${back.continues.join(', ')}] (this game first: ${back.continues[0] === code}) with a button ${cont ? 'on screen' : 'MISSING'}; the friend's page stopped drawing them: ${gone}`);

    // 6. A ?room= page never sees the start screen, and has the way back.
    const C = await ctxB.newPage();
    C.on('pageerror', (e: Error) => errors.push(`start C: ${e.message}`));
    await C.goto(`${base}/?room=e2e-start-${Math.random().toString(36).slice(2, 10)}`);
    const inC = await safely(online(C));
    const c = await C.evaluate(() => ({ start: !!document.getElementById('start'), record: (window as any).irreverents.start, menu: !!document.getElementById('menu-btn') }));
    await C.tap('#menu-btn');
    await sleep(150);
    const roomMenu = await C.evaluate(() => [...document.querySelectorAll('#game-menu [data-menu]')].map((e) => (e as HTMLElement).dataset.menu));
    await C.screenshot({ path: path.join(out, 'start-room-menu.png') });
    fact('start-room', !!inC && !c.start && c.record === undefined && c.menu && roomMenu.join() === 'back,close',
      `a ?room= page: ${inC ? 'in play at once' : 'NOT in play'}, start screen ${c.start ? 'SHOWN' : 'never shown'}; its menu has [${roomMenu.join(', ')}] (only the way back, and Close)`);
    await C.close();

    // 7. The review of the start screen (hardening push D), one page each.
    const D = await (await browser.newContext({ ...devices['iPhone 14'] })).newPage();
    D.on('pageerror', (e: Error) => errors.push(`start D: ${e.message}`));
    const tapsTo = (sel: string): Promise<boolean> =>
      D.evaluate((s: string) => {
        const e = document.querySelector(s) as HTMLElement | null;
        if (!e) return false;
        const r = e.getBoundingClientRect();
        const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        return !!hit && (hit === e || e.contains(hit));
      }, sel);
    //    (10, 11) The owner's ?tune link: New game keeps the Tune button, after a reload too, and it never covers the menu.
    await D.goto(`${base}/?tune`);
    await safely(D.waitForSelector('#start [data-start="new"]', { timeout: 5000 }));
    await D.tap('#start [data-start="new"]');
    await safely(online(D));
    await safely(D.waitForSelector('#tune-open', { timeout: 3000 }));
    await sleep(1200);
    const t1 = { tune: !!(await D.$('#tune-open')), address: await D.evaluate(() => location.search), menu: await tapsTo('#menu-btn'), tuneTap: await tapsTo('#tune-open') };
    await D.reload();
    await safely(online(D));
    await safely(D.waitForSelector('#tune-open', { timeout: 3000 }));
    await sleep(1200);
    const t2 = { tune: !!(await D.$('#tune-open')), menu: await tapsTo('#menu-btn'), tuneTap: await tapsTo('#tune-open'), world: await D.evaluate(() => (window as any).irreverents.worldName) };
    await D.screenshot({ path: path.join(out, 'start-tune.png') });
    fact('start-tune', t1.tune && t2.tune && t1.menu && t1.tuneTap && t2.menu && t2.tuneTap && /^\?game=[A-Z]{4}&tune$/.test(t1.address) && /^game-/.test(t2.world),
      `/?tune then New game: Tune button ${t1.tune ? 'there' : 'MISSING'}, address ${t1.address}; after a reload ${t2.tune ? 'still there' : 'MISSING'} in ${t2.world}; a tap at the centre of each reaches it: menu ${t1.menu}/${t2.menu}, Tune ${t1.tuneTap}/${t2.tuneTap}`);
    //    (13) A tab that last played main, opening a shared link, then "Start screen": the start screen, not main.
    await D.goto(`${base}/`);
    await safely(D.waitForSelector('#start [data-start="kingdom"]', { timeout: 5000 }));
    await D.tap('#start [data-start="kingdom"]');
    await safely(online(D));
    const inMain = await D.evaluate(() => (window as any).irreverents.worldName);
    await D.goto(`${base}/?game=${code}`);
    await safely(D.waitForSelector('#start [data-start="to-start"]', { timeout: 5000 }));
    await D.tap('#start [data-start="to-start"]');
    await safely(D.waitForSelector('#start [data-start="new"]', { timeout: 5000 }));
    await sleep(300);
    const after = await D.evaluate(() => ({ shown: (window as any).irreverents.start?.shown, world: (window as any).irreverents.worldName }));
    fact('start-link-back', inMain === 'main' && after.shown === 'start' && after.world === '', `a tab that played ${inMain} opened a shared link and tapped Start screen: the ${after.shown ?? 'NO'} screen, world ${JSON.stringify(after.world)}`);
    //    (14) Pasting: a link, the share message, letters with a space. From a clean start screen, whatever the fact above found.
    await D.evaluate(() => sessionStorage.clear());
    await D.goto(`${base}/`);
    await safely(D.waitForSelector('#join-code', { timeout: 5000 }));
    const pasted: string[] = [];
    for (const text of [`${base}/?game=HJKR`, 'Join my game: MNPB', 'ab cd']) {
      await D.fill('#join-code', text);
      pasted.push(await D.evaluate(() => (document.getElementById('join-code') as HTMLInputElement).value));
    }
    fact('start-paste', pasted.join() === 'HJKR,MNPB,ABCD', `pasted a link, the share message and "ab cd": the field holds ${pasted.join(', ')} (expected HJKR, MNPB, ABCD)`);
    //    (15) Continue on a game whose save is gone: said, and dropped from the list.
    await D.evaluate(() => localStorage.setItem('irreverents.games', JSON.stringify(['ZZZZ'])));
    await D.reload();
    await safely(D.waitForSelector('#start [data-start="continue-ZZZZ"]', { timeout: 5000 }));
    await D.tap('#start [data-start="continue-ZZZZ"]');
    await safely(D.waitForFunction(() => (window as any).irreverents.start.message !== '', null, { timeout: 3000 }));
    const lost = await D.evaluate(() => ({ message: (window as any).irreverents.start.message, world: (window as any).irreverents.worldName, button: !!document.querySelector('#start [data-start="continue-ZZZZ"]'), kept: localStorage.getItem('irreverents.games') }));
    fact('start-continue-gone', lost.message === 'That game is gone' && lost.world === '' && !lost.button && lost.kept === '[]', `Continue on a game with no save: says "${lost.message}", world ${JSON.stringify(lost.world)}, its button ${lost.button ? 'STILL there' : 'gone'}, this phone's list now ${lost.kept}`);
    await D.context().close();

    //    (16) Step 5, the e2e's intermittent reds: the title picture arriving late moves no choice under a finger.
    //    It is held back 1.5 s (a slow connection); every frame, where each choice sits. A tap aimed 0.3 s after the
    //    screen showed must still land on the same choice once the picture is in. Before the fix every choice jumped
    //    99-128 px down when it arrived, and a tap on Start screen landed on Join (start-link-back, red at b7ed6e9).
    //    Control: the spacer set only once the picture has loaded (src/client/start.ts, titlePicture's layout).
    const late: string[] = [];
    for (const dev of ['iPhone 14', 'iPhone 14 landscape']) {
      for (const where of ['/', `/?game=${code}`]) {
        const ctxL = await browser.newContext({ ...devices[dev] });
        let held = 0;
        await ctxL.route(/title-screen\.png/, async (route: any) => {
          held++;
          await sleep(1500);
          await route.continue().catch(() => undefined);
        });
        await ctxL.addInitScript(() => {
          const log: { t: number; tops: Record<string, number> }[] = [];
          (window as any).__startTops = log;
          const t0 = performance.now();
          const tick = (): void => {
            const tops = Object.fromEntries([...document.querySelectorAll('#start [data-start]')].map((b) => [(b as HTMLElement).dataset.start, Math.round(b.getBoundingClientRect().top)]));
            if (Object.keys(tops).length > 0) log.push({ t: Math.round(performance.now() - t0), tops });
            if (performance.now() - t0 < 3500) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        });
        const L = await ctxL.newPage();
        L.on('pageerror', (e: Error) => errors.push(`start late: ${e.message}`));
        await L.goto(`${base}${where}`);
        await sleep(3800);
        const log = (await L.evaluate(() => (window as any).__startTops)) as { t: number; tops: Record<string, number> }[];
        const first = log[0]?.t ?? 0;
        const aim = log.find((e) => e.t >= first + 300);
        const end = log[log.length - 1];
        const moved = aim && end ? Object.keys(end.tops).filter((k) => aim.tops[k] !== end.tops[k]).map((k) => `${k} ${aim.tops[k]} to ${end.tops[k]}`) : ['nothing drawn'];
        late.push(`${dev.replace('iPhone 14', 'upright').replace('upright landscape', 'sideways')} ${where === '/' ? 'start' : 'link'}: ${held ? '' : 'picture NOT held, '}${moved.length ? `moved ${moved.join(', ')}` : 'still'}`);
        await ctxL.close();
      }
    }
    fact('start-title-late', late.every((l) => l.endsWith('still')), `the title picture held back 1.5 s: from 0.3 s after the screen showed to after it arrived, ${late.join('; ')} (expected every choice still)`);
  } finally {
    await ctxA.close();
    await ctxB.close();
  }
}
