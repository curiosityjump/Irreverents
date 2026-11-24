// Brief owner-stuck-in-the-quarry, push 1 (one call line in scripts/e2e.ts).
// The owner, 2026-11-24, from playing on his phone: "My little guy died and
// then i got stuck in the quarry ... The menu in the too left corner didn't
// seem to be working either". On a phone-sized page, by touch only:
// - menu-opens-<state>: a tap at the middle of #menu-btn opens the menu, and
//   the element under that point is the button, in the quarry while walking,
//   with STAGE CLEARED up, and after the page slept and woke (upright and
//   sideways). A server restart under the page was run by hand (the
//   builder's probe, docs/plan/step-3.md "The owner stuck in the quarry"),
//   not here: the full run's fact (h) already keeps a server down 75 s.
// - menu-way-back-quarry: the page's own hero stood deep in the quarry's depot
//   (a page owns its character's motion, as stage.ts's walkedClear does); the
//   menu offers "Back to the entrance"; a tap on it puts the page at the
//   stage's entrance (the road, by the door from the courtyard), and the
//   stick then moves the hero.
// - menu-way-back-cantina: from the courtyard, "Back to the cantina".
// - menu-reach-<size> (the orchestrator's look at 3dc7ef7: weak on dark
//   backdrops, the plate 4 px from it): the button is drawn opaque, the plate
//   starts at least 6 px right of it, and a tap 7 px outside it (right, below,
//   the corner) opens the menu. Control: the pre-change client (git stash)
//   measured the plate 4 px away and taps 7 px outside missed.
// Control: E2E_NO_WAY_BACK=1 takes the way-back row off the page, and both
// menu-way-back facts must fail (the hero stays where it was).
import { me, phone, pointOn, settle } from '../lib/e2e-touch.ts';
import type { Kit, Phone } from '../lib/e2e-touch.ts';

/* eslint-disable @typescript-eslint/no-explicit-any */
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/** A finger down and up at a point, as a tap. */
async function touchAt(ph: Phone, p: { x: number; y: number }): Promise<void> {
  await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...p, id: 1 }] });
  await sleep(60);
  await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await sleep(300);
}

/** Taps the menu button's middle: whether the button is what lies there, and whether the menu opened. */
async function openMenu(ph: Phone): Promise<{ under: boolean; open: boolean; rows: string[] }> {
  const c = (await ph.page.evaluate(() => {
    const b = document.getElementById('menu-btn')?.getBoundingClientRect();
    if (!b) return null;
    const x = b.left + b.width / 2;
    const y = b.top + b.height / 2;
    return { x: Math.round(x), y: Math.round(y), under: !!document.elementFromPoint(x, y)?.closest('#menu-btn') };
  })) as { x: number; y: number; under: boolean } | null;
  if (!c) return { under: false, open: false, rows: [] };
  await touchAt(ph, c);
  return (await ph.page.evaluate((under: boolean) => {
    const panel = document.getElementById('game-menu')!;
    return { under, open: !panel.hidden, rows: [...panel.querySelectorAll<HTMLElement>('[data-menu]')].map((b) => b.dataset.menu ?? '') };
  }, c.under)) as { under: boolean; open: boolean; rows: string[] };
}

const shut = (ph: Phone): Promise<void> => ph.page.evaluate(() => void (document.getElementById('game-menu')!.hidden = true));

/** Stands the page's own hero at a tile's floor in a room. */
const standIn = (ph: Phone, room: string, col: number, feetRow: number): Promise<boolean> =>
  ph.page.evaluate(
    ([r, c, f]: [string, number, number]) => {
      const irr = (window as any).irreverents;
      const mine = irr.world.entities.find((e: any) => e.player === irr.player);
      if (!mine) return false;
      const box = irr.content.characters[mine.kind].box;
      const tile = irr.content.rooms[r].tile;
      Object.assign(mine, { room: r, x: c * tile, y: f * tile - box.h, vx: 0, vy: 0 });
      return true;
    },
    [room, col, feetRow] as [string, number, number],
  );

/** Opens the menu and taps its way-back row (if the page shows it): the row's words and where the page is after. */
async function wayBack(ph: Phone): Promise<{ rows: string[]; tapped: boolean; room: string; x: number }> {
  const m = await openMenu(ph);
  if (process.env.E2E_NO_WAY_BACK === '1') await ph.page.addStyleTag({ content: '[data-menu="way-back"] { display: none !important; }' });
  const p = await pointOn(ph, '[data-menu="way-back"]');
  if (p) await touchAt(ph, p);
  else await shut(ph);
  await ph.page.waitForFunction(() => (window as any).irreverents.drawn.room !== undefined, null, { timeout: 2000 }).catch(() => undefined);
  await sleep(1200);
  await settle(ph);
  const at = (await ph.page.evaluate(() => ({ room: (window as any).irreverents.drawn.room, x: (window as any).irreverents.drawn.me?.x ?? -1 }))) as { room: string; x: number };
  return { rows: m.rows, tapped: !!p, ...at };
}

export async function menuWayBackFacts(kit: Kit): Promise<void> {
  const { fact } = kit;
  for (const size of [{ width: 390, height: 664 }, { width: 844, height: 390 }]) {
    const ph = await phone(kit, `${kit.base}/?room=e2e-menu-${Math.random().toString(36).slice(2, 8)}`, `menu ${size.width}`);
    try {
      await ph.page.setViewportSize(size);
      await sleep(500);
      const tag = `${size.width}x${size.height}`;
      const inQuarry = await standIn(ph, 'quarry-depot', 30, 14);
      await ph.page.waitForFunction(() => (window as any).irreverents.drawn.room === 'quarry-depot', null, { polling: 'raf', timeout: 4000 }).catch(() => undefined);
      await sleep(600);
      let m = await openMenu(ph);
      fact(`menu-opens-walking-${tag}`, inQuarry && m.under && m.open, `in the quarry's depot (${inQuarry}): the button is what lies under its middle (${m.under}); a tap opens the menu (${m.open}), rows ${m.rows.join(', ')}`);
      await shut(ph);
      await ph.page.evaluate(() => (window as any).irreverents.stage.show({ type: 'stage-cleared', tick: 1, stage: 'iron-quarry', ticks: 4512, defeated: 7, alarms: 2, tries: 1, unseen: false, hoard: true, stars: 2, best: true, player: (window as any).irreverents.player }));
      await sleep(500);
      m = await openMenu(ph);
      fact(`menu-opens-stage-cleared-${tag}`, m.under && m.open && !m.rows.includes('way-back'), `STAGE CLEARED up: the button is under its middle (${m.under}); a tap opens the menu (${m.open}); no way back over a card with its own way on (rows ${m.rows.join(', ')})`);
      await shut(ph);
      await ph.page.evaluate(() => (document.getElementById('stage-continue') as HTMLButtonElement).click());
      await ph.page.evaluate(() => {
        const set = (hidden: boolean): void => {
          Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden });
          Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => (hidden ? 'hidden' : 'visible') });
          document.dispatchEvent(new Event('visibilitychange'));
        };
        set(true);
        setTimeout(() => set(false), 2500);
      });
      await sleep(4500);
      m = await openMenu(ph);
      fact(`menu-opens-after-sleep-${tag}`, m.under && m.open, `after the page slept 2.5 s and woke: the button is under its middle (${m.under}); a tap opens the menu (${m.open})`);
      await shut(ph);
    } finally {
      await ph.ctx.close();
    }
  }

  for (const size of [{ width: 390, height: 664 }, { width: 844, height: 390 }, { width: 750, height: 340 }]) {
    const ph = await phone(kit, `${kit.base}/?room=e2e-reach-${Math.random().toString(36).slice(2, 8)}`, `menu reach ${size.width}`);
    try {
      await ph.page.setViewportSize(size);
      await standIn(ph, 'courtyard', 11, 8);
      await ph.page.waitForFunction(() => (window as any).irreverents.drawn.room === 'courtyard' && (window as any).irreverents.drawn.hud, null, { polling: 'raf', timeout: 4000 }).catch(() => undefined);
      await sleep(1200);
      const m = (await ph.page.evaluate(() => {
        const btn = document.getElementById('menu-btn')!;
        const b = btn.getBoundingClientRect();
        const cv = document.querySelector('canvas')!;
        const c = cv.getBoundingClientRect();
        const hud = (window as any).irreverents.drawn.hud;
        const plateLeft = hud ? c.left + (hud.box.x * c.width) / cv.width : -1;
        const bg = getComputedStyle(btn).backgroundColor;
        const alpha = /rgba\([^)]*,\s*([\d.]+)\)/.exec(bg)?.[1];
        return { gap: plateLeft - b.right, opaque: !alpha || Number(alpha) === 1, bg, pts: ([[b.right + 7, b.top + b.height / 2], [b.left + b.width / 2, b.bottom + 7], [b.right + 7, b.bottom + 7]] as [number, number][]).map(([x, y]) => ({ x: Math.round(x), y: Math.round(y) })) };
      })) as { gap: number; opaque: boolean; bg: string; pts: { x: number; y: number }[] };
      const opened: boolean[] = [];
      for (const p of m.pts) {
        await touchAt(ph, p);
        opened.push(await ph.page.evaluate(() => !document.getElementById('game-menu')!.hidden));
        await shut(ph);
      }
      const tag = `${size.width}x${size.height}`;
      fact(`menu-reach-${tag}`, m.opaque && m.gap >= 6 && opened.every(Boolean),
        `the button's fill ${m.bg} (opaque ${m.opaque}); the plate starts ${m.gap.toFixed(1)} px right of it (want 6 or more); a tap 7 px outside it right, below and at the corner opened the menu: ${opened.join(', ')}`);
      if (process.env.E2E_SHOTS === '1') await ph.page.screenshot({ path: `${kit.out}/menu-reach-${tag}.png`, clip: { x: 0, y: 0, width: 300, height: 110 } });
    } finally {
      await ph.ctx.close();
    }
  }

  // The way back from deep in the quarry, sideways (as the owner held it).
  {
    const ph = await phone(kit, `${kit.base}/?room=e2e-way-back-${Math.random().toString(36).slice(2, 8)}`, 'way back quarry');
    try {
      const c = (await ph.page.evaluate(() => {
        const irr = (window as any).irreverents;
        const road = irr.content.rooms['quarry-road'];
        const d = road.doors.find((x: any) => x.id === 'to-courtyard');
        return { tile: road.tile, entrance: [d.tx * road.tile, (d.tx + d.w + 3) * road.tile] };
      })) as { tile: number; entrance: [number, number] };
      await standIn(ph, 'quarry-depot', 30, 14);
      await ph.page.waitForFunction(() => (window as any).irreverents.drawn.room === 'quarry-depot', null, { polling: 'raf', timeout: 4000 }).catch(() => undefined);
      await sleep(800);
      const r = await wayBack(ph);
      const atEntrance = r.room === 'quarry-road' && r.x >= c.entrance[0] - c.tile && r.x <= c.entrance[1];
      let moved = 0;
      if (atEntrance) {
        const right = await pointOn(ph, '[data-stick]', 0.9);
        const x0 = r.x;
        if (right) {
          await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...right, id: 1 }] });
          await sleep(700);
          await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        }
        await settle(ph);
        moved = Math.abs(((await me(ph))?.x ?? x0) - x0);
      }
      fact('menu-way-back-quarry', r.rows.includes('way-back') && r.tapped && atEntrance && moved > 8,
        `stood in the quarry's depot, the menu by touch offers ${r.rows.join(', ')}; the way-back row tapped (${r.tapped}): the page is in ${r.room} at x ${Math.round(r.x)} (the entrance is x ${c.entrance[0]}-${c.entrance[1]}: ${atEntrance}), and the stick then moved the hero ${moved.toFixed(1)} px`);
    } finally {
      await ph.ctx.close();
    }
  }
  {
    const ph = await phone(kit, `${kit.base}/?room=e2e-way-back-${Math.random().toString(36).slice(2, 8)}`, 'way back cantina');
    try {
      await standIn(ph, 'courtyard', 11, 8);
      const there = await ph.page.waitForFunction(() => (window as any).irreverents.drawn.room === 'courtyard', null, { polling: 'raf', timeout: 4000 }).then(() => true, () => false);
      await sleep(800);
      const r = await wayBack(ph);
      fact('menu-way-back-cantina', there && r.rows.includes('way-back') && r.tapped && r.room === 'cantina',
        `stood in the courtyard (${there}), the menu by touch offers ${r.rows.join(', ')}; the way-back row tapped (${r.tapped}): the page is in ${r.room} (want cantina)`);
    } finally {
      await ph.ctx.close();
    }
  }
}
