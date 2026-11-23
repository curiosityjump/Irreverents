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
    // Sideways, with as many games to continue as it shows: every choice still on screen.
    await B.goto(`${base}/`);
    await B.evaluate(() => localStorage.setItem('irreverents.games', JSON.stringify(['HJKR', 'MNPB', 'QWZX', 'TUVW'])));
    await B.reload();
    await safely(B.waitForSelector('#start [data-start="kingdom"]', { timeout: 5000 }));
    const side = await B.evaluate(() =>
      [...document.querySelectorAll('#start button, #start input')].map((e) => {
        const r = e.getBoundingClientRect();
        return { name: (e as HTMLElement).dataset.start ?? e.id, ok: r.height >= 44 && r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth };
      }),
    );
    await B.screenshot({ path: path.join(out, 'start-sideways.png') });
    const offSide = side.filter((t: any) => !t.ok).map((t: any) => t.name);
    fact('start-sideways', side.length === 7 && offSide.length === 0, `sideways (844x390) with four games remembered, the start screen has ${side.length} choices (3 to continue shown) and ${offSide.length ? `these are off screen or small: ${offSide.join(', ')}` : 'every one is on screen and 44 px or taller'}`);
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
  } finally {
    await ctxA.close();
    await ctxB.close();
  }
}
