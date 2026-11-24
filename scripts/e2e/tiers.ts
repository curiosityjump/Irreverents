// Step 4, the town's tiers (docs/mechanisms/npc-response.md, "The town's
// tiers"), inside `npm run e2e` and `npm run check:live` (one call line in
// scripts/e2e.ts): a phone-sized page, by touch alone, starts from
// fight-back's moves (walk into the castle street, punch the guard until he
// rages), waits while he rings the bell, punches him once more when he is
// back, then touches nothing: the page draws a call for help filling (his
// whistle's gauge, or the bell's bar when he goes back to ring it),
// then one more pip, the row's banner and, as it shows, more guards in the
// street than just before the gauge; and, after walking out by the west
// door, the same pip count in the throne room. The page records what it
// draws from the first frame (record(), judge()), so a whistle answered
// while the fact was walking still counts, and the row is counted where it
// arrives, not after the fight it starts.
//
// Every number is read from what the page drew (`window.irreverents.drawn`,
// its `alert` record), never from server state. The helpers below are copies
// of scripts/e2e/fight.ts's (Step 18's file, not exported there).
//
// DRAFT: every wait is a first pass with room to spare.
import path from 'node:path';
import { me, phone, pointOn, settle, standAt, tap } from '../lib/e2e-touch.ts';
import type { Kit, Phone } from '../lib/e2e-touch.ts';

/* eslint-disable @typescript-eslint/no-explicit-any */
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
const GUARD = 'street-guard';
/** meet() swings once the drawn gap is this or less (the grappler reaches 12 px past its front). */
const MEET_REACH = 8;
/** Farther than this (px, edge to edge) and meet() first walks to him: he sees 7 tiles (112 px). */
const APPROACH = 60;
/** meet() fights him west of this (px): a flattening blow flies about 300 px, and the courtyard door is at 752. */
const LURE_TO = 400;
/** meet() never stands the hero west of this (px): clear of the west door and the spawns (columns 0-5). */
const STAND_WEST = 120;

/** Holds the stick one way until the page draws its character in `goal` (copied from scripts/e2e/outpost.ts, Step 12's). */
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

/** Walks right until the page draws its character past the guard (40 px beyond his left edge), short of the courtyard door. */
async function passGuard(ph: Phone): Promise<void> {
  const p = await pointOn(ph, '[data-stick]', 0.75);
  if (!p) return;
  await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...p, id: 1 }] });
  try {
    await ph.page.waitForFunction(
      (id: string) => {
        const d = (window as any).irreverents.drawn;
        const g = d.entities.find((e: any) => e.id === id);
        return d.me.x >= 712 || (g !== undefined && d.me.x >= g.x + 40);
      },
      GUARD,
      { polling: 'raf', timeout: 8000 },
    );
  } catch {
    // the fact reports where it stood
  }
  await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await settle(ph);
}

/** Holds the stick toward the guard until the page draws the two touching (within 4 px), or 4 s pass. */
async function closeIn(ph: Phone): Promise<boolean> {
  const [mx, gx, gw, w] = (await ph.page.evaluate((id: string) => {
    const irr = (window as any).irreverents;
    const g = irr.drawn.entities.find((e: any) => e.id === id);
    const box = (k: string): any => irr.content.characters[k].box;
    return [irr.drawn.me.x, g?.x ?? NaN, g ? box(g.kind).w : 0, box(irr.drawn.me.kind).w];
  }, GUARD)) as [number, number, number, number];
  if (Number.isNaN(gx)) return false;
  const dir = mx < gx ? 1 : -1;
  const p = await pointOn(ph, '[data-stick]', dir > 0 ? 0.75 : 0.25);
  if (!p) return false;
  await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...p, id: 1 }] });
  let ok = true;
  try {
    await ph.page.waitForFunction(
      ([id, d, myW, gW]: [string, number, number, number]) => {
        const irr = (window as any).irreverents;
        const g = irr.drawn.entities.find((e: any) => e.id === id);
        const m = irr.drawn.me;
        if (!g) return true;
        const gap = d > 0 ? g.x - (m.x + myW) : m.x - (g.x + gW);
        return gap <= 4;
      },
      [GUARD, dir, w, gw],
      { polling: 'raf', timeout: 4000 },
    );
  } catch {
    ok = false;
  }
  await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  return ok;
}

/** A touch of the stick (60 ms): the character turns that way and barely moves. */
async function nudge(ph: Phone, dir: number): Promise<void> {
  const p = await pointOn(ph, '[data-stick]', dir > 0 ? 0.75 : 0.25);
  if (!p) return;
  await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...p, id: 1 }] });
  await sleep(60);
  await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}

type Near = { mx: number; mw: number; face: number; gx: number; gw: number };
const near = (ph: Phone): Promise<Near | null> =>
  ph.page.evaluate((id: string) => {
    const irr = (window as any).irreverents;
    const g = irr.drawn.entities.find((e: any) => e.id === id);
    const m = irr.drawn.me;
    const mine = irr.world?.entities.find((e: any) => e.player === irr.player);
    const box = (k: string): any => irr.content.characters[k].box;
    return g && m && mine ? { mx: m.x, mw: box(m.kind).w, face: mine.facing, gx: g.x, gw: box(g.kind).w } : null;
  }, GUARD) as Promise<Near | null>;

/**
 * After the alert is up, as a friend would: draws the guard west of the
 * street's middle if he is east of it (stands a step west of him, inside his
 * sight, and lets him come), stands a step west of him, turned toward him,
 * and returns true once the page draws him within reach in front and not
 * flying (he is after the hero, so he comes to it), stepping up to him if he
 * stands off; false after 6 s without that. The caller then swings.
 *
 * INTENT: measured against a local server with 300 ms added to the page's
 * input and 60 ms to what it is sent (live's round trip is about 105 ms; its
 * input queue lands a swing about 300 ms after the page shows it). Phase 1's
 * walk-the-drawn-bodies-together, which this fact used here at first, failed
 * 2 of 4 runs, like live's run of b441908: the page draws its own hero early
 * and the guard late, so the swing came 17 px short, or (the two
 * overlapping) faced away; a flying guard is drawn ~50 px behind; the fight
 * drifted to the courtyard door, where a landed blow put him out of the
 * street (the game's part, fixed in alert-whistle.ts) and his blows put the
 * hero out. With this and that fix: 6 of 6 (docs/plan/step-4.md, "Builder
 * notes"). Every blow he perceived on duty brought his whistle.
 */
async function meet(ph: Phone): Promise<boolean> {
  let w = await near(ph);
  if (!w) {
    try {
      await ph.page.waitForFunction((id: string) => (window as any).irreverents.drawn.entities.some((e: any) => e.id === id), GUARD, { timeout: 8000 });
    } catch {
      return false;
    }
    w = await near(ph);
    if (!w) return false;
  }
  // East of LURE_TO, draw him west first: stand a step west of him, inside his sight, and let him come
  // (he walks 40 px a second); again, up to 10 s.
  const t1 = Date.now();
  while (w.gx > LURE_TO && Date.now() - t1 < 10000) {
    await standAt(ph, Math.max(STAND_WEST, w.gx - w.mw - 60), 1);
    await sleep(600);
    const again = await near(ph);
    if (!again) break;
    w = again;
  }
  // West of him, so a blow sends him east, and from west of LURE_TO even a flattening one (about 300 px)
  // leaves him short of the courtyard door.
  if (w.mx + w.mw > w.gx || w.gx - (w.mx + w.mw) > APPROACH) await standAt(ph, Math.max(STAND_WEST, w.gx - w.mw - 30), 1);
  const t0 = Date.now();
  let last: number | null = null;
  let still = 0;
  while (Date.now() - t0 < 6000) {
    w = await near(ph);
    if (!w) {
      last = null;
      await sleep(100);
      continue;
    }
    const dir = w.gx + w.gw / 2 > w.mx + w.mw / 2 ? 1 : -1;
    const gap = dir > 0 ? w.gx - (w.mx + w.mw) : w.mx - (w.gx + w.gw);
    // Still or walking (under 3 px between looks 50 ms apart), not flying from a blow.
    const moved = last === null ? Infinity : Math.abs(w.gx - last);
    last = w.gx;
    if (w.face !== dir) {
      await nudge(ph, dir);
      last = null;
      continue;
    }
    if (moved < 3 && gap <= MEET_REACH) return true;
    // He stands off (as he does by a wall): step up to him. He is still, so where the page draws him is where he is.
    still = moved < 0.5 ? still + 1 : 0;
    if (still >= 6) {
      await closeIn(ph);
      last = null;
      still = 0;
      continue;
    }
    await sleep(50);
  }
  return false;
}

/**
 * Phase 1 (fight-back's moves): the guard paces his beat and waits 4 s at
 * each end of it. Returns true once the page draws him standing still with
 * the phone's character just east of him, turned toward him (walking there
 * once he is still: a blow then sends him west, toward his bell, as
 * fight-back's do); false after 8 s.
 *
 * INTENT: walking the drawn bodies together and swinging at a pacing guard
 * (fight-back's closeIn, which this phase used) failed on live twice: in
 * one run 12 taps landed 2 blows and the alert never rose in 60 s (7f148ea,
 * reverted; and the same with the code before it). Over live's delay the
 * page draws him late, so a swing at a walking guard lands where he was. A
 * still guard is drawn where he is.
 */
async function atRest(ph: Phone): Promise<boolean> {
  const t0 = Date.now();
  let last: number | null = null;
  let still = 0;
  while (Date.now() - t0 < 8000) {
    const w = await near(ph);
    if (!w) {
      last = null;
      still = 0;
      await sleep(100);
      continue;
    }
    still = last !== null && Math.abs(w.gx - last) < 0.5 ? still + 1 : 0;
    last = w.gx;
    if (still >= 6) {
      const gap = w.mx - (w.gx + w.gw);
      if (gap < 0 || gap > MEET_REACH) {
        await standAt(ph, w.gx + w.gw + 3, -1);
        last = null;
        still = 0;
        continue;
      }
      if (w.face !== -1) {
        await nudge(ph, -1);
        last = null;
        still = 0;
        continue;
      }
      return true;
    }
    await sleep(50);
  }
  return false;
}

/** Back into the street if a blow carried the phone's character out: east from the throne room, west from the courtyard. */
async function backIn(ph: Phone): Promise<void> {
  const room = (await look(ph)).room;
  if (room !== 'castle-street') await walkInto(ph, room === 'throne-room' ? 1 : -1, 'castle-street', 10000);
}

/**
 * From the first frame on, the page records what it draws whenever that changes: the room, the pips, the
 * call for help being drawn (the whistle's gauge or the bell's bar, the fuller; its progress, 0 when none; and
 * which), the guards drawn, and each alarm banner queued (the row's own banner, `drawn.alarms`,
 * draw/alarm-banner.ts). Read back by `judge()`.
 *
 * INTENT (the orchestrator's decision, docs/decisions-log.md, the tiers fact; DRAFT): either call counts. What a
 * player needs is to see a guard's call for help filling, then the row arrive (D-063: a completed call, by bell or
 * whistle). Under live's delay the raging guard, struck out of his sight, often goes back to ring the bell rather
 * than whistle (alert-whistle.ts; docs/plan/step-4.md, "Fourth builder", "Correction"): that is the game's rule,
 * left as it is, and a fact that waited only for the whistle read it as "gauge never drawn".
 *
 * INTENT: the fact reads the whole run, not windows. Replayed against a local server with live's delay
 * (300 ms in, 60 out, 40 jitter; docs/plan/step-4.md, "Fourth builder"), the old windowed fact missed the
 * whistle in most runs: it completed while the fact was inside meet() or backIn(), so the gauge was "never
 * drawn" though the page drew it, and the fact went on fighting; and it counted guards 2.5 s after a long
 * fight, when the rows from the sides had reached the hero and been beaten and removed (live's run of
 * 31d5ba4: 1 guard). So the row is counted where it arrives: in the frames after its banner.
 */
const record = (ph: Phone): Promise<void> =>
  ph.page.evaluate(() => {
    const w = window as any;
    if (w.__tiers) return;
    const t0 = performance.now();
    const rec = { t0, frames: [] as [number, string, number, number, number, string][], banners: [] as [number, string, string][] };
    w.__tiers = rec;
    let prev = '';
    let alarms: unknown = null;
    const frame = (): void => {
      const d = w.irreverents.drawn;
      const t = Math.round(performance.now() - t0);
      const whistle = d.alert?.whistle ?? 0;
      const bell = d.alert?.bell ?? 0;
      const by = whistle > 0 ? 'whistle' : bell > 0 ? 'bell' : '';
      const f: [number, string, number, number, number, string] = [t, d.room, d.alert?.level ?? 0, Math.max(whistle, bell), d.entities.filter((e: any) => e.kind === 'guard').length, by];
      const k = f.slice(1).join('|');
      if (k !== prev) rec.frames.push(f);
      prev = k;
      if (d.alarms !== alarms) {
        if (alarms !== null && d.alarms.length > 0) rec.banners.push([t, d.room, d.alarms[d.alarms.length - 1]]);
        alarms = d.alarms;
      }
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  });

const STREET = 'castle-street';
/** A call is answered (the pip) within this of its gauge first drawn (ms): the whistle's 2 s or the bell's 2.5 s, with room for live's delay. */
const UP_WITHIN = 8000;
/** The row's banner comes with the pip (the same tick on the server); allowed this late after it (ms). */
const BANNER_WITHIN = 2500;
/** The row is counted over this long from its banner (ms). */
const ROW_WINDOW = 1500;

type Episode = { at: number; by: string; from: number; to: number; upMs: number | null; banner: string | null; before: number; row: number; ok: boolean };
/**
 * Each gauge the page drew in the street, from the moment it first showed: the pips then (`from`), the
 * guards drawn in the street just before it (`before`), the first frame within UP_WITHIN drawing at least one
 * pip more (`to`, `upMs`), the first alarm banner in the street from the gauge to BANNER_WITHIN after that
 * pip, and the most guards drawn in the street over ROW_WINDOW from that banner (`row`). `ok`: all of them,
 * and the row more than before. `pending`: a gauge drawn under UP_WITHIN ago with no pip yet (a tap now could
 * stop it, D-066).
 */
const judge = async (ph: Phone): Promise<{ episodes: Episode[]; pending: boolean; now: number }> => {
  const [rec, t] = (await ph.page.evaluate(() => {
    const r = (window as any).__tiers;
    return [r, Math.round(performance.now() - r.t0)];
  })) as [any, number];
  const frames = rec.frames as [number, string, number, number, number, string][];
  const banners = rec.banners as [number, string, string][];
  const episodes: Episode[] = [];
  let pending = false;
  let before = 0;
  for (let i = 0; i < frames.length; i++) {
    const [at, room, level, whistle, guards, by] = frames[i]!;
    const was = i > 0 ? frames[i - 1]![3] : 0;
    if (room === STREET && !(whistle > 0)) before = guards;
    if (room !== STREET || !(whistle > 0) || was > 0 || level < 1) continue;
    const up = frames.find((f) => f[0] > at && f[0] <= at + UP_WITHIN && f[2] >= level + 1);
    const upMs = up ? up[0] - at : null;
    const b = up ? banners.find((x) => x[1] === STREET && x[0] >= at && x[0] <= up[0] + BANNER_WITHIN) : undefined;
    let row = 0;
    // Every frame drawn in that window: those recorded in it, and the one already showing when it opened.
    if (b) frames.forEach((f, j) => {
      const until = frames[j + 1]?.[0] ?? t;
      if (f[1] === STREET && f[0] <= b[0] + ROW_WINDOW && until > b[0]) row = Math.max(row, f[4]);
    });
    if (!up && t - at < UP_WITHIN) pending = true;
    episodes.push({ at, by, from: level, to: up ? up[2] : level, upMs, banner: b ? b[2] : null, before, row, ok: !!up && !!b && row > before });
  }
  return { episodes, pending, now: t };
};

type Seen = { level: number; whistle: number | null; guards: number; room: string };
const look = (ph: Phone): Promise<Seen> =>
  ph.page.evaluate(() => {
    const d = (window as any).irreverents.drawn;
    return { level: d.alert?.level ?? 0, whistle: d.alert?.whistle ?? null, guards: d.entities.filter((e: any) => e.kind === 'guard').length, room: d.room };
  });

export async function tierFacts(kit: Kit & { tag: string }): Promise<void> {
  const { fact } = kit;
  const url = `${kit.base}/?room=${kit.tag}-tiers-${Math.random().toString(36).slice(2, 10)}`;
  const ph = await phone(kit, url, 'tiers');
  const notes: string[] = [];
  try {
    await record(ph);
    const kind = (await me(ph))?.kind as string;
    const inStreet = await walkInto(ph, 1, 'castle-street');
    if (inStreet) await passGuard(ph);
    // fight-back's moves: at him until his alert is up (he rages, rings the bell himself and comes back).
    let taps = 0;
    let before = await look(ph);
    const t0 = Date.now();
    while (inStreet && before.level < 1 && Date.now() - t0 < 60000) {
      await backIn(ph);
      if (taps < 12) {
        await atRest(ph);
        await tap(ph, 'attack');
        taps++;
      } else await sleep(500);
      before = await look(ph);
    }
    notes.push(`${taps} taps, the alert drawn at ${before.level} after ${((Date.now() - t0) / 1000).toFixed(1)} s`);
    // Once more at him, until a gauge the page draws is answered by a pip and the row walking in (judge(), from
    // the record). A tap while he blows, or while his gauge may yet be answered, would stop the very whistle we
    // wait for (D-066): each try waits that out first.
    let j = await judge(ph);
    const done = (): boolean => j.episodes.some((e) => e.ok);
    const settled = async (ms: number): Promise<void> => {
      const end = Date.now() + ms;
      for (;;) {
        j = await judge(ph);
        if (done() || (!j.pending && Date.now() >= end)) return;
        await sleep(100);
      }
    };
    let tries = 0;
    while (inStreet && before.level >= 1 && !done() && tries < 12) {
      // A blow can carry the phone's character out by either door: walk back in first.
      await backIn(ph);
      await settled(300);
      if (done()) break;
      await meet(ph);
      await settled(100);
      if (done()) break;
      await tap(ph, 'attack');
      tries++;
      await settled(6000);
    }
    // Touch nothing while the row's frames are drawn, then read the whole record.
    await sleep(ROW_WINDOW);
    j = await judge(ph);
    const ep = j.episodes.find((e) => e.ok) ?? j.episodes[j.episodes.length - 1] ?? null;
    await ph.page.screenshot({ path: path.join(kit.out, `${kit.tag === 'check' ? 'live-' : ''}tiers-street.png`) });
    const out = await walkInto(ph, -1, 'throne-room', 30000);
    const away = await look(ph);
    await ph.page.screenshot({ path: path.join(kit.out, `${kit.tag === 'check' ? 'live-' : ''}tiers-away.png`) });
    // More calls may follow the whistle's (another whistle, the shopkeeper's bell): what must hold is one pip more
    // than when the gauge showed, more guards drawn as the row's banner shows than just before the gauge, and pips
    // still drawn (not fewer than that) in the next room. Read before the gauge, the level is the control.
    const from = ep?.from ?? before.level;
    const ok = inStreet && !!ep?.ok && out && away.level >= from + 1;
    const said = ep
      ? `the ${ep.by === 'bell' ? "bell's bar" : "whistle's gauge"} first drawn at ${(ep.at / 1000).toFixed(1)} s with ${ep.from} pip(s); touching nothing, ${ep.upMs === null ? `no more pips within ${UP_WITHIN / 1000} s` : `${ep.to} pip(s) drawn ${(ep.upMs / 1000).toFixed(1)} s later`}, ` +
        `the row's banner ${ep.banner === null ? 'never drawn in the street' : `"${ep.banner}"`}; guards drawn in the street ${ep.before} just before the gauge and ${ep.row} as the row's banner showed`
      : 'the page never drew a call filling (gauge or bell bar) in the street';
    fact(
      'tiers',
      ok,
      `by touch, a phone's ${kind} in the castle street (${inStreet}): ${notes.join('; ')}; ${tries} more tap(s), ${j.episodes.length} call(s) drawn filling (${j.episodes.map((e) => e.by).join(', ')}); ${said}; ` +
        `out by the west door (${out}) the throne room draws ${away.level} pip(s) (expected ${from + 1} or more)`,
    );
  } finally {
    await ph.ctx.close();
  }
}
