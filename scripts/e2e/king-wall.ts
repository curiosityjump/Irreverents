// Step 5, part 3, the owner playing on the live game: "The king keeps getting stuck in the wall too"
// (docs/plan/step-5.md, "Knocked-out enemies fly off"). Called from scripts/e2e.ts.
// A phone-sized page, by touch only, with 150 ms added each way on its socket, starts in the throne
// room, switches to the flyer, hops up onto the dais east of the king, as every hero arrives, and
// punches him west, stepping after him, until he stops moving. Every number is read from what the
// page drew (`window.irreverents.drawn`).
//
// What was wrong: the wall behind the throne is a false wall (columns 1-2, drawn as wall, never
// solid), so the blows walked the king into it, where he lay drawn inside the wall for good. Now a
// body nobody plays never comes to rest in one (src/sim/systems/rest-out-of-false-wall.ts).
// Control: without that system (move the file out, npm run build): `king-wall` fails (measured in the
// simulation with the same blows: his box's west edge at x 14 to 35, 1 to 2 tiles deep in the wall;
// on the page, by touch, he rests inside the wall, then goes on through the hidden door).
import path from 'node:path';
import { me, pointOn, settle, tap } from '../lib/e2e-touch.ts';
import type { Kit, Phone } from '../lib/e2e-touch.ts';

/* eslint-disable @typescript-eslint/no-explicit-any */
const DELAY_MS = 150;
const KING = 'king';
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

async function delayedPhone(kit: Kit, url: string, name: string): Promise<Phone> {
  const ctx = await kit.browser.newContext({ ...kit.devices['iPhone 14 landscape'] });
  const page = await ctx.newPage();
  page.on('pageerror', (e: Error) => kit.errors.push(`${name}: ${e.message}`));
  await page.routeWebSocket(/\/ws$/, (ws: any) => {
    const upstream = ws.connectToServer();
    ws.onMessage((m: string) => setTimeout(() => { try { upstream.send(m); } catch { /* closed */ } }, DELAY_MS));
    upstream.onMessage((m: string) => setTimeout(() => { try { ws.send(m); } catch { /* closed */ } }, DELAY_MS));
  });
  const cdp = await ctx.newCDPSession(page);
  await page.goto(url);
  await page.waitForFunction(() => (window as any).irreverents?.drawn.status === 'online' && (window as any).irreverents.drawn.me, null, { timeout: 10000 });
  const id = (await page.evaluate(() => (window as any).irreverents.player)) as string;
  return { name, ctx, page, cdp, id };
}

const king = (ph: Phone): Promise<{ x: number; y: number; w: number; room: string } | null> =>
  ph.page.evaluate((id: string) => {
    const irr = (window as any).irreverents;
    const k = irr.drawn.entities.find((e: any) => e.id === id);
    return k ? { x: k.x, y: k.y, w: irr.content.characters[k.kind].box.w, room: irr.drawn.room } : null;
  }, KING);

/** Holds the stick west (with jump held too, so the step up onto the dais is taken) until the page draws its hero's left edge at or west of `x`. */
async function westTo(ph: Phone, x: number, hop: boolean, ms = 4000): Promise<void> {
  const stick = await pointOn(ph, '[data-stick]', 0.25);
  const jump = await pointOn(ph, '[data-action="jump"]');
  if (!stick) return;
  const points = hop && jump ? [{ ...stick, id: 1 }, { ...jump, id: 2 }] : [{ ...stick, id: 1 }];
  await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: points });
  try {
    await ph.page.waitForFunction((gx: number) => (window as any).irreverents.drawn.me.x <= gx, x, { polling: 'raf', timeout: ms });
  } catch {
    // the fact reports where it stood
  }
  await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}

export async function kingWallFacts(kit: Kit): Promise<void> {
  const { fact } = kit;
  const url = `${kit.base}/?room=e2e-king-${Math.random().toString(36).slice(2, 10)}`;
  const ph = await delayedPhone(kit, url, 'king');
  try {
    // To the flyer (the party's third member; Switch cycles in order). Her blow moves the king most.
    for (let i = 0; i < 3 && (await me(ph)).kind !== 'flyer'; i++) {
      await tap(ph, 'switch');
      await sleep(400);
    }
    const kind = (await me(ph)).kind as string;
    const k0 = await king(ph);
    // Onto the dais, the hero's left edge 4 px inside the king's right edge: so the swing reaches him.
    if (k0) await westTo(ph, k0.x + k0.w - 4, true);
    await settle(ph);
    let taps = 0;
    let last = k0?.x ?? NaN;
    let still = 0;
    /** Where he was drawn at rest after each blow (null: no longer drawn in this room). */
    const rests: (number | null)[] = [];
    while (k0 && taps < 14 && still < 3) {
      const k = await king(ph);
      if (!k) break;
      if ((await me(ph)).x > k.x + k.w - 4) await westTo(ph, k.x + k.w - 4, false, 1500);
      await tap(ph, 'attack');
      taps++;
      // Long enough for the page to ease its own predicted blow back onto the server's place (docs/mechanisms/network.md, "Predicted hits").
      await sleep(1600);
      const now = (await king(ph))?.x ?? NaN;
      rests.push(Number.isNaN(now) ? null : Math.round(now));
      if (Number.isNaN(now)) break;
      still = Math.abs(now - last) < 1 ? still + 1 : 0;
      last = now;
    }
    await sleep(1500);
    const k1 = await king(ph);
    await ph.page.screenshot({ path: path.join(kit.out, 'king-wall.png') });
    // The false wall is columns 1-2 (x 16 to 48) at dais level (content/rooms/throne-room.json).
    const WALL_EDGE = 48;
    const moved = k0 && k1 ? k0.x - k1.x : 0;
    const inWall = rests.filter((x) => x !== null && x < WALL_EDGE - 0.5);
    fact(
      'king-wall',
      !!k0 && !!k1 && kind === 'flyer' && k1.room === 'throne-room' && moved >= 20 && k1.x >= WALL_EDGE - 0.5 && inWall.length === 0,
      `a phone page (${DELAY_MS} ms added each way), by touch, as the ${kind}, came up onto the dais east of the king and tapped attack ${taps} time(s), stepping after him: ` +
        `he was drawn from x ${k0?.x.toFixed(0) ?? '?'} to x ${k1?.x.toFixed(0) ?? '?'} (moved ${moved.toFixed(0)} px west, expected 20 or more), ` +
        `his west edge drawn after each blow at ${rests.map((x) => x ?? 'gone').join(', ')} (the false wall behind the throne ends at x ${WALL_EDGE}: ${inWall.length} rest(s) inside it, expected none; 'gone': no longer in the throne room), ` +
        `last at x ${k1?.x.toFixed(0) ?? '?'}${k1 ? '' : ' (not drawn: through the wall and the hidden door)'}`,
    );
  } finally {
    await ph.ctx.close();
  }
}
