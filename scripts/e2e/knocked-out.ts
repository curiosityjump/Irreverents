// Step 5, the owner playing on the live game: "When an enemy gets knocked out, they collapse, then
// randomly fly off the screen. Very weird" (docs/plan/step-5.md, "Knocked-out enemies fly off").
// Called from scripts/e2e.ts. Two phone-sized pages, by touch only, walk into the castle street: the
// hitter (150 ms added each way on its socket) hits the villain until it has him knocked out (`out`),
// then touches nothing for 10 s; the watcher (a friend, no delay) only looks. The watcher always draws
// the server's blow (the owner's case: nobody predicts a hit for a friend's screen, and the hitter's
// own page draws the server's blow whenever it declines to predict one, docs/mechanisms/network.md,
// "Predicted hits"). Every number is read from what each page drew
// (`window.irreverents.drawn`: each body's place, the state it was drawn in, `state`, and whether the
// page has it knocked out, `out`).
//
// What was wrong: the blow that knocks a body out also launches it (src/sim/verbs/attack.ts, wear
// and launch on one hit), and the page drew a knocked-out body lying `down` from the blow, so the
// knockback (about 200 px at the launch cap, the same as any blow) read as a collapsed body sliding
// off the screen. Now it is drawn taking the blow and flying, and lies down where the flight ends
// (`lyingOut` in src/client/draw/sprites.ts).
//
// Control: the pre-change rule (`lyingOut` returning `!!e.c.flattened`, as `stateOf` tested before;
// npm run build): `ko-still-watcher` fails (measured twice: 65 px drawn lying on the watcher's page, 8 px with the change; the hitter's page
// predicted the blow both times, which drew the flight upright before as well, and passes either way).
// DRAFT: the limits. After the flight a person's last skid is drawn lying (combat-rest ends a
// person's flight below `footingSpeed`, 200 px/s, and a flattened body slides on at
// `groundFriction`, 500 px/s²: at most 40 px), so 48 px is allowed.
import path from 'node:path';
import { pointOn, settle, tap } from '../lib/e2e-touch.ts';
import type { Kit, Phone } from '../lib/e2e-touch.ts';

/* eslint-disable @typescript-eslint/no-explicit-any */
const DELAY_MS = 150;
const TARGET = 'street-villain';
const DOWN_TRAVEL_MAX = 48;
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

async function delayedPhone(kit: Kit, url: string, name: string, delayMs: number): Promise<Phone> {
  const ctx = await kit.browser.newContext({ ...kit.devices['iPhone 14 landscape'] });
  const page = await ctx.newPage();
  page.on('pageerror', (e: Error) => kit.errors.push(`${name}: ${e.message}`));
  if (delayMs > 0) {
    await page.routeWebSocket(/\/ws$/, (ws: any) => {
      const upstream = ws.connectToServer();
      ws.onMessage((m: string) => setTimeout(() => { try { upstream.send(m); } catch { /* closed */ } }, delayMs));
      upstream.onMessage((m: string) => setTimeout(() => { try { ws.send(m); } catch { /* closed */ } }, delayMs));
    });
  }
  const cdp = await ctx.newCDPSession(page);
  await page.goto(url);
  await page.waitForFunction(() => (window as any).irreverents?.drawn.status === 'online' && (window as any).irreverents.drawn.me, null, { timeout: 10000 });
  const id = (await page.evaluate(() => (window as any).irreverents.player)) as string;
  return { name, ctx, page, cdp, id };
}

/** Holds the stick one way until the page draws its character in `goal`. */
async function walkInto(ph: Phone, dir: number, goal: string, ms = 20000): Promise<boolean> {
  const p = await pointOn(ph, '[data-stick]', dir > 0 ? 0.9 : 0.1);
  if (!p) return false;
  await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...p, id: 1 }] });
  let ok = true;
  try {
    await ph.page.waitForFunction((g: string) => (window as any).irreverents.drawn.room === g, goal, { polling: 'raf', timeout: ms });
  } catch {
    ok = false;
  }
  await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await settle(ph);
  return ok;
}

/** Holds the stick toward the target until the page draws the two within 4 px, or 4 s pass. */
async function closeIn(ph: Phone): Promise<void> {
  const [mx, gx] = (await ph.page.evaluate((id: string) => {
    const d = (window as any).irreverents.drawn;
    return [d.me.x, d.entities.find((e: any) => e.id === id)?.x ?? NaN];
  }, TARGET)) as [number, number];
  if (Number.isNaN(gx)) return;
  const dir = mx < gx ? 1 : -1;
  const p = await pointOn(ph, '[data-stick]', dir > 0 ? 0.75 : 0.25);
  if (!p) return;
  await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...p, id: 1 }] });
  try {
    await ph.page.waitForFunction(
      ([id, d]: [string, number]) => {
        const irr = (window as any).irreverents;
        const g = irr.drawn.entities.find((e: any) => e.id === id);
        const m = irr.drawn.me;
        if (!g) return true;
        const box = (k: string): any => irr.content.characters[k].box;
        return (d > 0 ? g.x - (m.x + box(m.kind).w) : m.x - (g.x + box(g.kind).w)) <= 4;
      },
      [TARGET, dir],
      { polling: 'raf', timeout: 4000 },
    );
  } catch {
    // the fact reports what was drawn
  }
  await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}

/** Starts recording, every frame, the target's drawn place, state and `out` on a page. */
const record = (ph: Phone): Promise<void> =>
  ph.page.evaluate((id: string) => {
    const w = window as any;
    w.__ko = [] as any[];
    const tick = (): void => {
      const d = w.irreverents.drawn;
      const g = d.entities.find((e: any) => e.id === id);
      w.__ko.push({ t: performance.now(), x: g?.x ?? null, y: g?.y ?? null, state: g?.state ?? null, out: !!g?.out, room: d.room });
      if (!w.__koStop) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, TARGET);

type Rec = { t: number; x: number | null; y: number | null; state: string | null; out: boolean; room: string };

/** From the blow to the end: how far he was drawn travelling in all, how far across, and how far while drawn lying out cold. */
function measure(rec: Rec[]): { ko: boolean; travel: number; far: number; downTravel: number; lastDown: number | null } {
  const first = rec.findIndex((r) => r.out);
  if (first < 0) return { ko: false, travel: 0, far: 0, downTravel: 0, lastDown: null };
  // Where the blow found him: on the hitter's page the blow's beat and flight (drawn hurt or tumble,
  // the page's own prediction) can come before the server's word that he is out, so from the last
  // frame before that run of hurt, tumble or down frames.
  let at = Math.max(1, first);
  while (at > 1 && ['hurt', 'tumble', 'down'].includes(rec[at - 1]!.state ?? '')) at--;
  const start = rec[at - 1]!;
  let travel = 0;
  let downTravel = 0;
  let far = 0;
  let lastDown: number | null = null;
  for (let i = at; i < rec.length; i++) {
    const a = rec[i - 1]!;
    const b = rec[i]!;
    if (a.x === null || b.x === null || a.y === null || b.y === null || a.room !== b.room) continue;
    const step = Math.hypot(b.x - a.x, b.y - a.y);
    travel += step;
    if (a.out && b.out && a.state === 'down' && b.state === 'down') downTravel += step;
    if (b.out && b.state === 'down') lastDown = b.x;
    if (start.x !== null) far = Math.max(far, Math.abs(b.x - start.x));
  }
  if (process.env.KO_TRACE) for (const r of rec.slice(Math.max(0, first - 40), first + 80)) console.log(`${(r.t - rec[first]!.t).toFixed(0)} ${r.x?.toFixed(0)},${r.y?.toFixed(0)} ${r.state}${r.out ? ' OUT' : ''}`);
  return { ko: true, travel, far, downTravel, lastDown };
}

export async function knockedOutFacts(kit: Kit): Promise<void> {
  const { fact } = kit;
  const url = `${kit.base}/?room=e2e-ko-${Math.random().toString(36).slice(2, 10)}`;
  const A = await delayedPhone(kit, url, 'ko hitter', DELAY_MS);
  const B = await delayedPhone(kit, url, 'ko watcher', 0);
  try {
    const inStreet = (await walkInto(A, 1, 'castle-street')) && (await walkInto(B, 1, 'castle-street'));
    await record(A);
    await record(B);
    const drawnOut = (): Promise<boolean> => A.page.evaluate(() => (window as any).__ko.some((r: any) => r.out));
    let taps = 0;
    while (inStreet && taps < 30 && !(await drawnOut())) {
      await closeIn(A);
      await tap(A, 'attack');
      taps++;
      await sleep(300);
    }
    // Touch nothing for 10 s from the first frame he was knocked out (or now).
    await sleep(10000);
    const stop = (ph: Phone): Promise<Rec[]> =>
      ph.page.evaluate(() => {
        (window as any).__koStop = true;
        return (window as any).__ko;
      });
    const recA = await stop(A);
    const recB = await stop(B);
    await B.page.screenshot({ path: path.join(kit.out, 'ko-after.png') });
    const a = measure(recA);
    const b = measure(recB);
    fact(
      'ko-0',
      inStreet && a.ko && b.ko,
      `two phone pages walked into the castle street by touch (${inStreet}); the hitter (${DELAY_MS} ms added each way) tapped attack ${taps} time(s) at the villain: knocked out on the hitter's page ${a.ko}, on the watcher's ${b.ko}`,
    );
    for (const [who, m] of [['hitter', a], ['watcher', b]] as const) {
      if (!m.ko) continue;
      fact(
        `ko-still-${who}`,
        m.downTravel <= DOWN_TRAVEL_MAX && m.far >= 40,
        `on the ${who}'s page, from the blow to 10 s after, the villain was drawn travelling ${m.travel.toFixed(0)} px in all (at most ${m.far.toFixed(0)} px across from where the blow found him: knocked back, expected 40 or more), ` +
          `of which ${m.downTravel.toFixed(0)} px while drawn lying out cold (at most ${DOWN_TRAVEL_MAX}: he flies as hit, then lies where he lands); last drawn lying at x ${m.lastDown?.toFixed(0) ?? '?'}`,
      );
    }
  } finally {
    await A.ctx.close();
    await B.ctx.close();
  }
}
