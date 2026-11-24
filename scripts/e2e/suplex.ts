// Step 25 push 2, the suplex by touch (docs/plan/step-25.md, "The signal";
// docs/mechanisms/combat-and-impact.md, "The suplex"): called from
// scripts/e2e.ts. One phone-sized page (iPhone 14 landscape), touch only, in
// a private world, with 150 ms added each way (as e2e/hit-lands.ts), seated
// as the grappler (the party's first member). It walks to the nearest body
// on its floor that can be knocked out and that it can lift, taps Grab, reads
// the Use button (`data-state` must be `suplex`), taps Use, and watches for
// the page to draw an impact on that body on the far side of the hero from
// the way it faces. Press-to-drawn is printed, not limited (the suplex is
// not predicted: about a round trip).
//
// Control: E2E_SUPLEX_SKIP=1 taps Grab again in place of Use (the body is
// set down in front), and `suplex-slam` must fail.
import fs from 'node:fs';
import path from 'node:path';
import { floor, me, pointOn, settle, standAt, tap } from '../lib/e2e-touch.ts';
import type { Kit, Phone } from '../lib/e2e-touch.ts';

/* eslint-disable @typescript-eslint/no-explicit-any */
const DELAY_MS = 150;
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
const n = (v: number | null | undefined): string => (v === null || v === undefined ? '?' : v.toFixed(0));
const useState = (ph: Phone): Promise<string> => ph.page.evaluate(() => document.querySelector<HTMLElement>('#actions [data-action="interact"]')?.dataset.state ?? '');

interface Seen {
  /** Ms from the presser's touch to: the first heave frame, the first head-down frame, the server's impact on the body; and the impact's middle against the hero's. */
  moved: number | null;
  slam: number | null;
  impact: number | null;
  dx: number | null;
  /** The presser's touch (absolute ms, one clock for both pages; the friend's is null until made relative). */
  pressed?: number | null;
}
interface Round {
  tapped: boolean;
  mine: Seen;
  friend: Seen;
  rec: any;
}

/**
 * In a page: the times (absolute ms) this page first drew the heave, the body head-down, and the
 * server's impact on it, and on the presser's page its next touch. Both pages run in one browser on
 * one machine, so the presser's touch is the friend's zero too (made relative in the test).
 */
function watchSuplex([target, dur, presser]: [string, number, boolean]): Promise<Seen> {
  return new Promise((resolve) => {
    const irr = (window as any).irreverents;
    const clock = (): number => performance.timeOrigin + performance.now();
    const before = new Set((irr.drawn.impacts as any[]).filter((i) => i.id === target).map((i) => i.tick));
    const heave0 = irr.drawn.suplex?.heaveTick ?? null;
    const out: Seen = { moved: null, slam: null, impact: null, dx: null };
    let pressed: number | null = null;
    const t0 = clock();
    if (presser) addEventListener('touchstart', () => { if (pressed === null) pressed = clock(); }, { capture: true, once: true });
    const tick = (): void => {
      const now = clock();
      const s = irr.drawn.suplex;
      if (s && s.heaveTick !== heave0) {
        if (out.moved === null && (s.phase === 'heave' || s.phase === 'catch') && s.angle > 0) out.moved = now;
        if (out.slam === null && s.phase === 'slam') out.slam = now;
      }
      if (out.impact === null) {
        const hit = (irr.drawn.impacts as any[]).find((i) => i.id === target && !before.has(i.tick) && i.age >= 0);
        if (hit) {
          out.impact = now;
          const d = irr.drawn;
          const b = d.entities.find((e: any) => e.id === target);
          const box = (k: string): any => irr.content.characters[k].box;
          const mid = (e: any): number => e.x + box(e.kind).w / 2;
          out.dx = b && d.me ? mid(b) - mid(d.me) : null;
        }
      }
      if ((out.impact !== null && out.slam !== null) || now - t0 > dur) {
        return resolve({ ...out, pressed });
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

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

/** The stick held one way with Jump tapped every half second, until the page's own feet are level with `feet` (as e2e/chase.ts's hopUntil). */
async function hopOnto(ph: Phone, dir: number, feet: number, ms = 8000): Promise<boolean> {
  const st = await pointOn(ph, '[data-stick]', dir > 0 ? 0.9 : 0.1);
  const jp = await pointOn(ph, '[data-action="jump"]');
  if (!st || !jp) return false;
  const level = (): Promise<boolean> => ph.page.evaluate((f: number) => {
    const irr = (window as any).irreverents;
    const m = irr.drawn.me;
    return Math.abs(m.y + irr.content.characters[m.kind].box.h - f) <= 1;
  }, feet);
  const end = Date.now() + ms;
  let ok = false;
  while (Date.now() < end) {
    if (await level()) {
      ok = true;
      break;
    }
    await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...st, id: 1 }, { ...jp, id: 2 }] });
    await sleep(220);
    await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...st, id: 1 }] });
    await sleep(220);
  }
  await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await settle(ph);
  return ok && (await level());
}

export async function suplexFacts(kit: Kit & { shots: string }): Promise<void> {
  const { fact } = kit;
  const skip = process.env.E2E_SUPLEX_SKIP === '1';
  const url = `${kit.base}/?room=e2e-suplex-${Math.random().toString(36).slice(2, 10)}`;
  const ph = await delayedPhone(kit, url, 'suplex');
  const fr = await delayedPhone(kit, url, 'suplex-friend');
  try {
    await sleep(1500);
    const info = (await ph.page.evaluate(() => {
      const irr = (window as any).irreverents;
      const c = irr.content;
      const num = (k: string): any => c.tuning.characters[c.characters[k].tuning] ?? {};
      const kind = irr.drawn.me.kind;
      const lift = num(kind).liftStrength ?? 0;
      const ok = Object.fromEntries(Object.keys(c.characters).map((k) => [k, (num(k).toughness ?? c.tuning.world.defaultToughness) > 0 && (num(k).weight ?? c.tuning.world.defaultWeight) <= lift]));
      return { kind, room: irr.drawn.room, ok, rtt: irr.net.rttMs };
    })) as any;
    // The friend's own hero walks to the room's far right first, out of the slam and the shots.
    const far = (await fr.page.evaluate(() => { const irr = (window as any).irreverents; const r = irr.content.rooms[irr.drawn.room]; return r.w * r.tile - 3 * r.tile; })) as number;
    await standAt(fr, far, -1);
    const a0 = await me(ph);
    // The nearest body in the room it can lift and knock out (the start room's king stands on his dais, a tile up: hop onto it).
    const pick = (await ph.page.evaluate((ok: Record<string, boolean>) => {
      const irr = (window as any).irreverents;
      const d = irr.drawn;
      const box = (k: string): any => irr.content.characters[k].box;
      return d.entities.filter((e: any) => e.player === null && ok[e.kind]).map((e: any) => ({ id: e.id, kind: e.kind, x: e.x, feet: e.y + box(e.kind).h }));
    }, info.ok)) as { id: string; kind: string; x: number; feet: number }[];
    const near = pick.sort((p, q) => Math.abs(p.x - a0.x) - Math.abs(q.x - a0.x))[0];
    const myFeet = (await ph.page.evaluate(() => { const irr = (window as any).irreverents; const m = irr.drawn.me; return m.y + irr.content.characters[m.kind].box.h; })) as number;
    const up = near && Math.abs(near.feet - myFeet) > 1 ? await hopOnto(ph, near.x < a0.x ? -1 : 1, near.feet) : true;
    const f = await floor(ph);
    const body = up && near ? f.bodies.find((b) => b.id === near.id) : undefined;
    fact('suplex-0', !!body, `a phone page, touch only, ${DELAY_MS} ms added each way (round trip ${n(info.rtt)} ms), seated as the ${info.kind} in ${info.room}: the nearest body it can lift and knock out is ${near ? `${near.kind} ${near.id} at x ${n(near.x)}` : 'none'}${near && near.feet !== myFeet ? `, a step up (reached: ${up})` : ''}`);
    if (!body) return;
    // Face it from the side with more floor behind (the slam lands behind the hero).
    const face0 = body.x - f.left >= f.right - (body.x + body.w) ? -1 : 1;
    const useWalk = process.env.E2E_SUPLEX_STAY !== '1';
    await standAt(ph, face0 > 0 ? body.x - 22 : body.x + body.w + 4, face0);
    await sleep(300);
    await tap(ph, 'grab');
    const carried = await ph.page
      .waitForFunction(([id, mine]: string[]) => {
        const d = (window as any).irreverents.drawn;
        const c = d.entities.find((e: any) => e.id === id);
        const m = d.entities.find((e: any) => e.id === mine);
        return !!c && !!m && c.y < m.y - 4;
      }, [body.id, a0.id], { timeout: 4000, polling: 'raf' })
      .then(() => true, () => false);
    await sleep(400);
    const word = await useState(ph);
    fact('suplex-button', carried && word === 'suplex', `carrying the ${body.kind} (${carried}), the Use button's state is "${word}" (expected suplex)`);

    // Push 4: carried off the dais onto the open floor (clear of the dais's edge and the king's speech), then
    // turned so the open floor is behind: the slam lands there.
    let face = face0;
    if (useWalk) {
      const mid = (await ph.page.evaluate(() => { const irr = (window as any).irreverents; const r = irr.content.rooms[irr.drawn.room]; return (r.w * r.tile) / 2; })) as number;
      const goal = body.x + (mid > body.x ? 150 : -150);
      await standAt(ph, goal, 0);
      const f1 = await floor(ph);
      const at = (await me(ph)).x as number;
      face = at - f1.left >= f1.right - at ? 1 : -1;
      await standAt(ph, at, face);
      await sleep(400);
    }
    fs.mkdirSync(kit.shots, { recursive: true });
    await ph.page.screenshot({ path: path.join(kit.shots, 'carrying-2-sideways.png') });

    // Push 4: two suplexes, the first shot sideways, the second upright (the king gets up first), each
    // watched on the presser's page and on a friend's page at the same delay.
    const round = async (view: 'sideways' | 'upright'): Promise<Round> => {
      const watchers = [ph, fr].map((p, i) => p.page.evaluate(watchSuplex, [body.id, 4000, i === 0] as [string, number, boolean]));
      await sleep(50);
      const tapped = await tap(ph, skip ? 'grab' : 'interact');
      // Shots by what the presser's page draws (window.irreverents.drawn.suplex), as it draws it.
      const shotAt = async (name: string, ok: (r: any) => boolean, ms = 2500): Promise<void> => {
        const end = Date.now() + ms;
        while (Date.now() < end) {
          const r = await ph.page.evaluate(() => (window as any).irreverents.drawn.suplex ?? null);
          if (r && ok(r)) break;
          await sleep(8);
        }
        await ph.page.screenshot({ path: path.join(kit.shots, `${name}-2-${view}.png`) });
      };
      await shotAt('heave', (r) => r.phase === 'heave' && r.p >= 0.3);
      await shotAt('overhead', (r) => r.phase === 'heave' && r.p >= 0.6);
      await shotAt('slam', (r) => r.phase === 'slam');
      await shotAt('after', (r) => r.phase === 'lie', 1500);
      const [a, b] = (await Promise.all(watchers)) as Seen[];
      const p0 = a!.pressed ?? null;
      const rel = (x: Seen): Seen => {
        const r = (v: number | null): number | null => (v === null || p0 === null ? null : v - p0);
        return { moved: r(x.moved), slam: r(x.slam), impact: r(x.impact), dx: x.dx };
      };
      const [mine, friend] = [rel(a!), rel(b!)];
      const rec = await ph.page.evaluate(() => (window as any).irreverents.drawn.suplex ?? null);
      return { tapped, mine, friend, rec };
    };
    const first = await round('sideways');
    const r = first.mine;
    const behind = r.dx !== null && Math.sign(r.dx) === -face;
    fact('suplex-slam', first.tapped && r.impact !== null && behind,
      `${skip ? 'CONTROL (Grab in place of Use): ' : ''}from the Use press the page drew an impact on the ${body.kind} after ${n(r.impact)} ms, its middle ${n(r.dx)} px from the hero's, facing ${face > 0 ? 'right' : 'left'} (expected behind)`);
    const rec = first.rec ?? {};
    fact('suplex-over', !!first.rec && rec.frames > 0 && rec.beside === 0 && r.slam !== null && rec.slamDx !== null && Math.sign(rec.slamDx) === -face,
      `${skip ? 'CONTROL: ' : ''}the presser's page drew ${n(rec.frames)} heave frames, ${n(rec.beside)} of them with the body's middle neither above the hero's head nor behind his back (expected 0); head-down at the floor ${r.slam === null ? 'never' : `from ${n(r.slam)} ms after the press`}, ${n(rec.slamDx)} px from the hero's middle (expected behind)`);
    const line = (who: string, x: Seen): string => `${who}: first movement ${n(x.moved)} ms, head-down at the floor ${n(x.slam)} ms, the server's impact drawn ${n(x.impact)} ms`;
    // Ruling 4: the body reaches the floor when the server's slam does: head-down within a few frames of the impact.
    const arrives = (x: Seen): boolean => x.slam !== null && x.impact !== null && Math.abs(x.slam - x.impact) <= 120;
    fact('suplex-felt', !skip && first.mine.moved !== null && first.mine.moved < 120 && arrives(first.mine) && arrives(first.friend),
      `${skip ? 'CONTROL: ' : ''}from the press, at ${DELAY_MS} ms each way (round trip ${n(info.rtt)} ms; drawn heave ${n(rec.length)} ticks, lag learned ${n(rec.lag)} ticks). ${line('presser', first.mine)}; ${line('friend', first.friend)} (expected: the presser moves at once; on both, head-down within 120 ms of the impact)`);
    if (skip) return;

    // The second: upright, once the king is up again (flattenTime), carried again from the side with more floor behind.
    await ph.page.setViewportSize({ width: 390, height: 664 });
    await ph.page.waitForFunction((id: string) => {
      const e = (window as any).irreverents.drawn.entities.find((d: any) => d.id === id);
      return !!e && !e.flattened && e.state !== 'down';
    }, body.id, { timeout: 8000 }).catch(() => undefined);
    await sleep(1200);
    const f2 = await floor(ph);
    const b2 = f2.bodies.find((b) => b.id === body.id);
    let second: Round | null = null;
    if (b2) {
      const face2 = b2.x - f2.left >= f2.right - (b2.x + b2.w) ? -1 : 1;
      await standAt(ph, face2 > 0 ? b2.x - 22 : b2.x + b2.w + 4, face2);
      await sleep(300);
      await tap(ph, 'grab');
      await sleep(900);
      await ph.page.screenshot({ path: path.join(kit.shots, 'carrying-2-upright.png') });
      if ((await useState(ph)) === 'suplex') second = await round('upright');
    }
    fact('suplex-again', !!second && second.mine.impact !== null,
      `a second suplex, upright: ${second ? `${line('presser', second.mine)}; ${line('friend', second.friend)} (lag learned ${n(second.rec?.lag)} ticks)` : 'not reached (the king did not come up, or the button did not say suplex)'}`);
  } finally {
    await ph.ctx.close();
    await fr.ctx.close();
  }
}
