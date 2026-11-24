// The owner, 2026-11-24 ("Alarms should spawn more enemies of increasing
// strength that come in from the sides"), camp-entries brief item 3, inside
// `npm run e2e` (one call line in scripts/e2e.ts): a sideways phone, by touch
// only, walks into the Bandit Camp and over the entry step, on east into the
// lookout's view, and lets go of the stick. When the second row's banner is
// up ("Two more!", content/outposts/outpost.json `announce`; the first row is
// one fighter), the page must draw, within a few seconds, a newcomer of that
// row (entity id `<outpost>:w1:<i>`, src/sim/systems/outpost-wave.ts) on
// screen west of the hero and another on screen east of them.
// - row-both-sides: both seen on screen after the banner; the shot (iPhone 14
//   sideways, 750x340 CSS px, the banner up when a frame shows it) is
//   docs/plan/step-4-shots/camp-row-both-sides-750x340.png with
//   E2E_SHOTS=1, else e2e-out/kept/step-4-shots/ (scripts/e2e.ts, keptShots).
// The entries sit at least `entryAway` (12) tiles off and a sideways view is
// about 23 tiles (375 px) wide, so a newcomer walks in at the screen's edge a second or
// two after the banner, not at it (docs/plan/step-4.md, "Camp entries").
// DRAFT: every wait below is a first pass with room to spare.
import path from 'node:path';
import { me, phone, pointOn, settle, standAt } from '../lib/e2e-touch.ts';
import type { Kit, Phone } from '../lib/e2e-touch.ts';
import { pushUp, walkInto } from './outpost.ts';

/* eslint-disable @typescript-eslint/no-explicit-any */
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
const T = 16;
/** The second row's banner (content/outposts/outpost.json `announce`[1]): the first row is one fighter, so the second, two, is the first that can come from both sides. Its people are `<outpost>:w1:<i>`. */
const BANNER = 'Two more!';

/** The stick held one way with the jump button tapped every half second, until `done` or the time runs out (copied from chase.ts). */
async function hopUntil(ph: Phone, dir: number, done: () => Promise<boolean>, ms = 8000): Promise<boolean> {
  const st = await pointOn(ph, '[data-stick]', dir > 0 ? 0.9 : 0.1);
  const jp = await pointOn(ph, '[data-action="jump"]');
  if (!st || !jp) return false;
  const end = Date.now() + ms;
  let ok = false;
  let down = false;
  while (Date.now() < end) {
    if (await done()) {
      ok = true;
      break;
    }
    await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...st, id: 1 }, { ...jp, id: 2 }] });
    down = true;
    await sleep(220);
    await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...st, id: 1 }] });
    await sleep(220);
  }
  if (down) await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await settle(ph);
  return ok;
}

interface Seen {
  banner: string[];
  /** The banner up this frame, if any. */
  up: string;
  hero: number;
  /** The page drew the camp's horn post broken. */
  broken: boolean;
  left: string[];
  right: string[];
  /** Per newcomer on screen: tiles inside the nearer screen edge. */
  inset: Record<string, number>;
  view: [number, number];
}

/** What the page drew this frame: the alarm banners, the hero's middle, and the row's newcomers on screen either side of them. */
const look = (ph: Phone): Promise<Seen> =>
  ph.page.evaluate(() => {
    const irr = (window as any).irreverents;
    const d = irr.drawn;
    const w = (k: string): number => irr.content.characters[k]?.box.w ?? 16;
    const left0 = d.camera.x;
    const right0 = d.camera.x + irr.view.w;
    const mid = d.me ? d.me.x + w(d.me.kind) / 2 : NaN;
    const left: string[] = [];
    const right: string[] = [];
    const inset: Record<string, number> = {};
    for (const e of d.entities as any[]) {
      if (!/:w1:\d+$/.test(e.id)) continue;
      const c = e.x + w(e.kind) / 2;
      if (c < left0 || c > right0) continue;
      (c < mid ? left : right).push(e.id);
      inset[e.id] = Math.round((Math.min(c - left0, right0 - c) / 16) * 10) / 10;
    }
    return { banner: d.alarms ?? [], broken: (d.signalers ?? []).some((g: any) => g.state === 'broken'), up: d.banner?.text ?? '', hero: mid, left, right, inset, view: [left0, right0] as [number, number] };
  });

export async function campRowFacts(kit: Kit & { shots: string }): Promise<void> {
  // INTENT: the camp's own swings can break the horn post beside the fight (D-061: a broken post
  // calls no more), and then no second row comes at all. That is play, not what this fact reads, so
  // a try whose page draws the horn broken before the banner starts again in a fresh world (3 tries).
  const tries: string[] = [];
  for (let t = 1; t <= 3; t++) {
    const r = await attempt(kit, t === 3);
    if (r.broken && !r.ok && t < 3) {
      tries.push(`try ${t}: the horn post was broken before "${BANNER}"`);
      continue;
    }
    kit.fact('row-both-sides', r.ok, `${tries.length ? tries.join('; ') + '; then ' : ''}${r.text}`);
    return;
  }
}

async function attempt(kit: Kit & { shots: string }, last: boolean): Promise<{ ok: boolean; broken: boolean; text: string }> {
  const ph = await phone(kit, `${kit.base}/?room=e2e-row-${Math.random().toString(36).slice(2, 10)}`, 'row');
  try {
    const inCamp = (await walkInto(ph, 1, 'castle-street')) && (await walkInto(ph, 1, 'courtyard'));
    const doorX = await ph.page.evaluate(() => {
      const c = (window as any).irreverents.content;
      return c.rooms.courtyard.doors.find((d: any) => d.id === 'to-outpost').tx * c.rooms.courtyard.tile;
    });
    for (let i = 0; inCamp && i < 3 && (await ph.page.evaluate(() => (window as any).irreverents.drawn.room)) !== 'outpost'; i++) {
      const w = (await ph.page.evaluate(() => { const irr = (window as any).irreverents; return irr.content.characters[irr.drawn.me.kind].box.w; })) as number;
      await standAt(ph, doorX + (T - w) / 2 - 4, 1);
      await pushUp(ph);
      await sleep(1000);
    }
    // Over the step by the doorway (columns 5-7) and down the far side, then on east into the
    // lookout's view (column 18, facing west) as far as column 21, and the stick let go.
    await hopUntil(ph, 1, async () => (await me(ph)).x > 9 * T);
    await standAt(ph, 21 * T, 1);
    let seen: Seen = await look(ph);
    // INTENT: each newcomer is judged by the side of the hero it is FIRST drawn on screen, not where
    // it stands later: with one east entry (the control) the row's two flank the hero about 10 s on,
    // one having walked past him, and a fact reading the sides at any moment passed it.
    const first = new Map<string, 'west' | 'east'>();
    const firstInset = new Map<string, number>();
    let bothAt = 0;
    let bannerAt = 0;
    let restands = 0;
    let lastStand = Date.now();
    const shot = path.join(kit.shots, 'camp-row-both-sides-750x340.png');
    const sides = (): string[] => [...new Set(first.values())];
    const end = Date.now() + 90000;
    while (Date.now() < end) {
      seen = await look(ph);
      for (const id of [...seen.left, ...seen.right]) if (!first.has(id)) firstInset.set(id, seen.inset[id] ?? NaN);
      for (const id of seen.left) if (!first.has(id)) first.set(id, 'west');
      for (const id of seen.right) if (!first.has(id)) first.set(id, 'east');
      if (!bannerAt && seen.banner.includes(BANNER)) bannerAt = Date.now();
      if (bannerAt && sides().length === 2) {
        bothAt = Date.now();
        break;
      }
      if (bannerAt && Date.now() - bannerAt > 8000) break;
      if (!bannerAt && seen.broken && !last) break;
      // The first row's fighter can knock the hero far east (once to column 48, out of the lookout's
      // view): before the second call, the hero walks back to column 21, at most every 5 s.
      if (!bannerAt && Date.now() - lastStand > 5000 && Math.abs(seen.hero - 21.5 * T) > 4 * T) {
        await standAt(ph, 21 * T, 1);
        restands++;
        lastStand = Date.now();
      }
      await sleep(100);
    }
    const ok = bothAt > 0;
    // The shot: a frame with the row on both sides and its own banner up (it follows the horn's
    // banner on the queue, 2.5 s each), else the frame the fact was read from.
    let framed = false;
    for (let i = 0; ok && i < 50 && !framed; i++) {
      const f = await look(ph);
      if (f.up === BANNER && f.left.length > 0 && f.right.length > 0) {
        await ph.page.screenshot({ path: shot });
        framed = true;
      } else await sleep(100);
    }
    if (!framed) await ph.page.screenshot({ path: shot });
    const when = bannerAt ? `${(((bothAt || Date.now()) - bannerAt) / 1000).toFixed(1)} s after the banner` : `no "${BANNER}" banner in 90 s`;
    const firstSeen = [...first].map(([id, side]) => `${id} ${side}, ${firstInset.get(id)} tiles inside the edge`).join(', ');
    return {
      ok,
      broken: !bannerAt && seen.broken,
      text: `by touch, sideways, standing in the camp lookout's view: ${when}, the row was first drawn on screen [${firstSeen}] of the hero (expected one first seen west and one east within 8 s of the banner; shot with "${BANNER}" up: ${framed}; walked back to column 21 ${restands} time(s); horn drawn broken: ${seen.broken}; hero x ${Math.round(seen.hero)}, view ${Math.round(seen.view[0])}-${Math.round(seen.view[1])}; banners ${JSON.stringify(seen.banner)})`,
    };
  } finally {
    await ph.ctx.close();
  }
}
