// Step 13's hidden recruit inside `npm run e2e` (one call line in
// scripts/e2e.ts; brief handoff-prompts/hidden-recruit.md): a phone-sized
// page, by touch only, walks from the start room through the courtyard into
// the quarry, across the road onto the ridge, and walks off the ridge into
// its chasm, down into the pit. In the pit the page's own record of what it
// drew (`drawn.recruits`) never lists the cave's cage or its call: nothing
// drawn points at the secret (hidden-recruit-not-shown). Then west along the
// pit's floor through its painted west wall into the cave, where the page
// draws the cage shut with the hauler in it (hidden-recruit-cave). Then, in
// the same new game, a second phone walks into the cantina: while she is
// caged it never draws her there and neither page's party plate has her
// (hidden-recruit-not-early). The first phone, standing in the cage's middle,
// holds Use by touch: its page draws the cage open and the banner
// (hidden-recruit-freed); the second phone's cantina then draws her
// wandering (hidden-recruit-cantina); a tap of Use at the open cage swaps her
// in, and both plates list her (hidden-recruit-plate). Walkers copied in
// shape from scripts/e2e/quarry.ts (not imported: that file is another
// lane's).
//
// INTENT (orchestrator, 23:20 UTC: "a new game does not show her early"):
// these run in a new kept game made by a tap on the start screen's New game,
// not a `?room=` world, because a `?room=` world has no roster of its own
// (everyone, src/sim/roster.ts) and would show her in the cantina from the
// start. Where to stand: the cage's middle. The first builder held at its
// east edge (the body's middle 157 px, the cage's reach ends at 150,
// src/sim/use/free.ts) and the button never said FREE: that, not the touch,
// is why "a Use hold by touch didn't free her".
//
// Control: E2E_TOUCH_BREAK=jump takes the jump button off the page, as the
// other files' control does: the road and the ridge are hops, so the page
// never reaches the pit and every fact but not-early fails.
// E2E_TOUCH_BREAK=interact takes the Use button off: freed, cantina and
// plate fail.
//
// DRAFT: every limit below is a first pass with room to spare.
import fs from 'node:fs';
import path from 'node:path';
import { me, phone, pointOn, settle, standAt, tap } from '../lib/e2e-touch.ts';
import type { Kit, Phone } from '../lib/e2e-touch.ts';

/* eslint-disable @typescript-eslint/no-explicit-any */
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
const room = (ph: Phone): Promise<string> => ph.page.evaluate(() => (window as any).irreverents.drawn.room);

/** The shared control (scripts/lib/e2e-touch.ts, `tap`): E2E_TOUCH_BREAK=jump takes the jump button off the page. */
async function honourBreak(ph: Phone): Promise<void> {
  if (process.env.E2E_TOUCH_BREAK === 'jump') await ph.page.addStyleTag({ content: '[data-action="jump"] { display: none !important; }' });
}

/** Holds the stick one way until the page draws its character in `goal`; with `hop`, taps jump every `hop` ms meanwhile. As quarry.ts. */
async function walkInto(ph: Phone, dir: number, goal: string, ms = 20000, hop = 0): Promise<boolean> {
  if (hop) await honourBreak(ph);
  const p = await pointOn(ph, '[data-stick]', dir > 0 ? 0.9 : 0.1);
  if (!p) return false;
  await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...p, id: 1 }] });
  const end = Date.now() + ms;
  let ok = false;
  while (Date.now() < end) {
    if ((await room(ph)) === goal) {
      ok = true;
      break;
    }
    const jump = hop ? await pointOn(ph, '[data-action="jump"]') : null;
    if (jump) {
      await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...p, id: 1 }, { ...jump, id: 2 }] });
      await sleep(300);
      await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...p, id: 1 }] });
      await sleep(Math.max(0, hop - 300));
    } else await sleep(50);
  }
  await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await settle(ph);
  return ok;
}

/** Holds the stick east with jump tapped every 0.7 s until the page draws its character at or past `x` in this room. As quarry.ts. */
async function hopTo(ph: Phone, x: number, ms = 30000): Promise<boolean> {
  await honourBreak(ph);
  const p = await pointOn(ph, '[data-stick]', 0.9);
  const jump = await pointOn(ph, '[data-action="jump"]');
  if (!p || !jump) return false;
  const start = await room(ph);
  const end = Date.now() + ms;
  let ok = false;
  await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...p, id: 1 }] });
  while (Date.now() < end && (await room(ph)) === start) {
    if ((await me(ph)).x >= x) {
      ok = true;
      break;
    }
    await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...p, id: 1 }, { ...jump, id: 2 }] });
    await sleep(300);
    await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...p, id: 1 }] });
    await sleep(400);
  }
  await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await settle(ph);
  return ok;
}

/** A thumb slides up off the pad for a moment (the stick pushed up: the way through an enter doorway). As quarry.ts. */
async function pushUp(ph: Phone): Promise<void> {
  const r = await ph.page.evaluate(() => {
    const b = document.querySelector('[data-stick]')!.getBoundingClientRect();
    return { x: Math.round(b.left + b.width / 2), top: Math.round(b.top - 30), mid: Math.round(b.top + b.height / 2) };
  });
  await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: r.x, y: r.mid, id: 1 }] });
  await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: r.x, y: r.top, id: 1 }] });
  await sleep(80);
  await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await sleep(200);
}

/** The page held sideways (as it is) and then upright (390x664), for looking at. */
async function shots(ph: Phone, dir: string, name: string): Promise<void> {
  if (!dir) return;
  await ph.page.screenshot({ path: path.join(dir, `${name}-844x390.png`) });
  const was = ph.page.viewportSize();
  await ph.page.setViewportSize({ width: 390, height: 664 });
  await sleep(400);
  await ph.page.screenshot({ path: path.join(dir, `${name}-390x664.png`) });
  await ph.page.setViewportSize(was);
  await sleep(400);
}

/** A phone opening the address with no world named: the start screen; New game by a tap. As scripts/e2e/start-screen.ts. */
async function newGame(kit: Kit, name: string): Promise<{ ph: Phone; code: string } | null> {
  const ctx = await kit.browser.newContext({ ...kit.devices['iPhone 14 landscape'] });
  const page = await ctx.newPage();
  page.on('pageerror', (e: Error) => kit.errors.push(`${name}: ${e.message}`));
  const cdp = await ctx.newCDPSession(page);
  try {
    await page.goto(kit.base);
    await page.waitForSelector('#start [data-start="new"]', { timeout: 8000 });
    await page.tap('#start [data-start="new"]');
    await page.waitForFunction(() => (window as any).irreverents?.drawn.status === 'online' && (window as any).irreverents.drawn.me, null, { timeout: 10000 });
  } catch {
    await ctx.close();
    return null;
  }
  const { id, world } = (await page.evaluate(() => ({ id: (window as any).irreverents.player, world: (window as any).irreverents.worldName }))) as { id: string; world: string };
  const code = /^game-([A-Z]{4})$/.exec(world)?.[1] ?? '';
  return { ph: { name, ctx, page, cdp, id }, code };
}

/** A friend's phone opening the game's shared link and joining by one tap. As scripts/e2e/start-screen.ts. */
async function joinGame(kit: Kit, code: string, name: string): Promise<Phone | null> {
  const ctx = await kit.browser.newContext({ ...kit.devices['iPhone 14 landscape'] });
  const page = await ctx.newPage();
  page.on('pageerror', (e: Error) => kit.errors.push(`${name}: ${e.message}`));
  const cdp = await ctx.newCDPSession(page);
  try {
    await page.goto(`${kit.base}/?game=${code}`);
    await page.waitForSelector('#start [data-start="join-link"]', { timeout: 8000 });
    await page.tap('#start [data-start="join-link"]');
    await page.waitForFunction(() => (window as any).irreverents?.drawn.status === 'online' && (window as any).irreverents.drawn.me, null, { timeout: 10000 });
  } catch {
    await ctx.close();
    return null;
  }
  const id = (await page.evaluate(() => (window as any).irreverents.player)) as string;
  return { name, ctx, page, cdp, id };
}

/** By touch: the start room, the castle street, up through the cantina's doorway. As scripts/e2e/cantina.ts's intoCantina. */
async function intoCantina(ph: Phone): Promise<boolean> {
  if (!(await walkInto(ph, 1, 'castle-street'))) return false;
  const x = await ph.page.evaluate(() => {
    const irr = (window as any).irreverents;
    const c = irr.content;
    const door = c.rooms['castle-street'].doors.find((d: any) => d.id === 'to-cantina');
    return (door.tx + door.w / 2) * c.rooms['castle-street'].tile - c.characters[irr.drawn.me.kind].box.w / 2;
  });
  for (const nudge of [-4, -10, 2, -16]) {
    if ((await room(ph)) === 'cantina') break;
    await standAt(ph, x + nudge, 1);
    await pushUp(ph);
    try {
      await ph.page.waitForFunction(() => (window as any).irreverents.drawn.room === 'cantina', null, { polling: 'raf', timeout: 3000 });
    } catch {
      // tried again
    }
  }
  return (await room(ph)) === 'cantina';
}

/** The kinds on this page's party plate, as it last drew it. */
const plate = (ph: Phone): Promise<string[]> => ph.page.evaluate(() => ((window as any).irreverents.drawn.hud?.faces ?? []).map((f: any) => f.kind));

export async function hiddenRecruitFacts(kit: Kit & { shots?: string }): Promise<void> {
  const { fact } = kit;
  const dir = kit.shots ?? '';
  if (dir) fs.mkdirSync(dir, { recursive: true });
  const made = await newGame(kit, 'hidden-recruit');
  fact('hidden-recruit-new-game', !!made && made.code !== '', `a tap on the start screen's New game put a phone in a new kept game (${made ? `game ${made.code}` : 'NOT within 10 s'})`);
  if (!made) return;
  const { ph, code } = made;
  let friend: Phone | null = null;
  try {
    // Every frame drawn in the pit, recorded by the page itself: any cage or call of the cave's captive.
    await ph.page.evaluate(() => {
      const w = window as any;
      w.__hidden = { pitFrames: 0, pitCages: 0, pitCalls: 0 };
      const look = (): void => {
        const d = w.irreverents.drawn;
        if (d.room === 'quarry-pit') {
          w.__hidden.pitFrames++;
          if ((d.recruits?.cages ?? []).some((c: any) => c.id === 'cave-captive')) w.__hidden.pitCages++;
          if ((d.recruits?.calls ?? []).some((c: any) => c.id === 'cave-captive')) w.__hidden.pitCalls++;
        }
        requestAnimationFrame(look);
      };
      requestAnimationFrame(look);
    });
    const toStreet = await walkInto(ph, 1, 'castle-street');
    const toCourtyard = toStreet && (await walkInto(ph, 1, 'courtyard'));
    const c = await ph.page.evaluate(() => {
      const irr = (window as any).irreverents;
      const cy = irr.content.rooms.courtyard;
      const door = cy.doors.find((d: any) => d.id === 'to-quarry');
      return { doorX: door.tx * cy.tile, doorW: door.w * cy.tile, w: irr.content.characters[irr.drawn.me.kind].box.w };
    });
    if (toCourtyard) await standAt(ph, c.doorX + (c.doorW - c.w) / 2, 1);
    await pushUp(ph);
    let inside = false;
    try {
      await ph.page.waitForFunction(() => (window as any).irreverents.drawn.room === 'quarry-road', null, { polling: 'raf', timeout: 4000 });
      inside = true;
    } catch {
      // reported below
    }
    const toRidge = inside && (await walkInto(ph, 1, 'quarry-ridge', 45000, 700));
    // The ridge's chasm (columns 28-29) falls through a hole in its last row into the pit: hop up onto the step
    // before it, then walk east off its edge without jumping.
    const onStep = toRidge && (await hopTo(ph, 22 * 16));
    const inPit = onStep && (await walkInto(ph, 1, 'quarry-pit', 8000));
    if (inPit) {
      await sleep(1500);
      await shots(ph, dir, 'hidden-pit');
    }
    // West along the pit's floor (hopping over the pit's two) to its painted west wall, and through it.
    const inCave = inPit && (await walkInto(ph, -1, 'quarry-cave', 40000, 900));
    const pit = (await ph.page.evaluate(() => (window as any).__hidden)) as { pitFrames: number; pitCages: number; pitCalls: number };
    fact(
      'hidden-recruit-not-shown',
      inPit && pit.pitFrames > 60 && pit.pitCages === 0 && pit.pitCalls === 0,
      `by touch, a phone walked from the start to the quarry road (${inside}), the ridge (${toRidge}) and off its edge into the pit (${inPit}); of ${pit.pitFrames} frames drawn in the pit, ${pit.pitCages} drew the cave's cage and ${pit.pitCalls} its call (none should)`,
    );
    let seen: any = null;
    if (inCave) {
      try {
        const h = await ph.page.waitForFunction(
          () => ((window as any).irreverents.drawn.recruits?.cages ?? []).find((x: any) => x.id === 'cave-captive') ?? false,
          null,
          { polling: 'raf', timeout: 5000 },
        );
        seen = await h.jsonValue();
      } catch {
        seen = null;
      }
      // Walk to beside the cage (columns 7-8) for the look.
      const w = await ph.page.evaluate(() => (window as any).irreverents.content.characters[(window as any).irreverents.drawn.me.kind].box.w);
      await standAt(ph, 10 * 16 - w / 2, -1);
      await sleep(600);
      await shots(ph, dir, 'hidden-cage');
    }
    fact(
      'hidden-recruit-cave',
      inCave && !!seen && seen.open === false && seen.character === 'hauler',
      `by touch, the phone walked west through the pit's painted wall into the cave (${inCave}; now in ${await room(ph)}); its page drew the cave's cage ${seen ? `with the ${seen.character}, ${seen.open ? 'OPEN' : 'shut'}` : 'NOT AT ALL'}`,
    );

    // A friend joins the same game and walks into the cantina; their page records every frame drawn there.
    friend = await joinGame(kit, code, 'hidden-recruit-friend');
    const inCantina = !!friend && (await intoCantina(friend));
    if (friend) {
      await friend.page.evaluate(() => {
        const w = window as any;
        w.__cantina = { phase: 'caged', caged: 0, cagedHer: 0, cagedPlate: 0, freedHer: 0 };
        const look = (): void => {
          const d = w.irreverents.drawn;
          const r = w.__cantina;
          if (d.room === 'cantina') {
            const her = d.entities.some((e: any) => e.id === 'cantina:hauler');
            const onPlate = (d.hud?.faces ?? []).some((f: any) => f.kind === 'hauler');
            if (r.phase === 'caged') {
              r.caged++;
              if (her) r.cagedHer++;
              if (onPlate) r.cagedPlate++;
            } else if (her) r.freedHer++;
          }
          requestAnimationFrame(look);
        };
        requestAnimationFrame(look);
      });
      await sleep(2000);
    }
    const early = friend ? ((await friend.page.evaluate(() => (window as any).__cantina)) as { caged: number; cagedHer: number; cagedPlate: number }) : null;
    const plateA0 = await plate(ph);
    const rosterA = (await ph.page.evaluate(() => (window as any).irreverents.world.roster ?? null)) as string[] | null;
    fact(
      'hidden-recruit-not-early',
      inCantina && !!early && early.caged > 60 && early.cagedHer === 0 && early.cagedPlate === 0 && !plateA0.includes('hauler') && !!rosterA && !rosterA.includes('hauler'),
      `in the new game (roster ${JSON.stringify(rosterA)}), a friend's phone walked into the cantina (${inCantina}); of ${early?.caged ?? 0} frames drawn there while she is caged, ${early?.cagedHer ?? '?'} drew the hauler wandering and ${early?.cagedPlate ?? '?'} had her on the plate (none should); the first phone's plate: ${plateA0.join(', ')}`,
    );

    // Free her by touch: stand in the cage's middle, hold Use past the cage's 2.2 s.
    let freed = false;
    let state: string | null = null;
    let banner: string | null = null;
    let gauge = 0;
    if (inCave) {
      const w = await ph.page.evaluate(() => (window as any).irreverents.content.characters[(window as any).irreverents.drawn.me.kind].box.w);
      await standAt(ph, 8 * 16 - w / 2, -1);
      await sleep(300);
      if (process.env.E2E_TOUCH_BREAK === 'interact') await ph.page.addStyleTag({ content: '[data-action="interact"] { display: none !important; }' });
      state = await ph.page.evaluate(() => (document.querySelector('#actions [data-action="interact"]') as HTMLElement | null)?.dataset.state ?? null);
      await ph.page.evaluate(() => {
        const w = window as any;
        w.__free = { gauge: 0, banner: null };
        const look = (): void => {
          const d = w.irreverents.drawn;
          const c = (d.recruits?.cages ?? []).find((x: any) => x.id === 'cave-captive');
          if (c?.gauge) w.__free.gauge = Math.max(w.__free.gauge, c.gauge);
          if (d.banner && !w.__free.banner) w.__free.banner = d.banner.text;
          requestAnimationFrame(look);
        };
        requestAnimationFrame(look);
      });
      const use = await pointOn(ph, '[data-action="interact"]');
      if (use) {
        await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...use, id: 2 }] });
        try {
          await ph.page.waitForFunction(() => ((window as any).irreverents.drawn.recruits?.cages ?? []).some((x: any) => x.id === 'cave-captive' && x.open), null, { polling: 'raf', timeout: 4000 });
          freed = true;
        } catch {
          // reported below
        }
        await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      }
      await sleep(250);
      const f = (await ph.page.evaluate(() => (window as any).__free)) as { gauge: number; banner: string | null };
      gauge = f.gauge;
      banner = f.banner ?? ((await ph.page.evaluate(() => (window as any).irreverents.drawn.banner?.text ?? null)) as string | null);
      if (freed) await shots(ph, dir, 'hidden-freed');
    }
    fact(
      'hidden-recruit-freed',
      freed && state === 'free' && !!banner,
      `standing in the cage's middle the Use button said ${JSON.stringify(state)} (expected "free"); a touch held on it filled the hold to ${Math.round(gauge * 100)}% and the page drew the cage ${freed ? 'open' : 'STILL SHUT after 4 s'} with the banner ${JSON.stringify(banner)}`,
    );

    // The friend's cantina now draws her wandering (nobody plays her yet).
    let wandering = false;
    if (freed && friend) {
      await friend.page.evaluate(() => ((window as any).__cantina.phase = 'freed'));
      try {
        await friend.page.waitForFunction(() => (window as any).irreverents.drawn.entities.some((e: any) => e.id === 'cantina:hauler'), null, { polling: 'raf', timeout: 2500 });
        wandering = true;
      } catch {
        // reported below
      }
      // The look, before the swap takes her out of the cantina (inside the cage's 5 s offer).
      if (wandering) await shots(friend, dir, 'hidden-cantina');
    }
    fact('hidden-recruit-cantina', wandering, `once she was freed, the friend's page in the cantina ${wandering ? 'drew the hauler wandering there' : 'NEVER drew her there within 2.5 s'}`);

    // A tap of Use at the open cage (within its offer) swaps her in on the first phone's slot.
    let swapped = false;
    if (freed) {
      await tap(ph, 'interact');
      try {
        await ph.page.waitForFunction(() => (window as any).irreverents.drawn.me.kind === 'hauler', null, { polling: 'raf', timeout: 3000 });
        swapped = true;
      } catch {
        // reported below
      }
      await sleep(800);
    }
    const plateA = await plate(ph);
    const plateB = friend ? await plate(friend) : [];
    fact(
      'hidden-recruit-plate',
      swapped && plateA[0] === 'hauler' && plateB.includes('hauler'),
      `a tap of Use at the open cage ${swapped ? 'swapped the hauler in' : 'did NOT swap her in'}: the first phone's plate lists ${plateA.join(', ')} (her first: it plays her), the friend's ${plateB.join(', ') || 'nothing'}`,
    );
    if (swapped) await shots(ph, dir, 'hidden-plate');
  } finally {
    await ph.ctx.close().catch(() => {});
    await friend?.ctx.close().catch(() => {});
  }
}

/**
 * Push 2's fact (hidden-recruit-stone): down the castle street's cellar doorway by Use (as
 * scripts/e2e/glints.ts) into the undercroft, whose page draws the heavy stone on the stair's
 * lowest step and the heavy plate on its top step; the start hero hops onto that step beside the
 * stone and taps Grab, and the page never draws the stone lifted (too heavy for anyone but the
 * hauler). Control: E2E_TOUCH_BREAK=interact (never down the doorway) or =jump (never onto the step).
 */
export async function hiddenStoneFacts(kit: Kit & { shots?: string }): Promise<void> {
  const { fact } = kit;
  const dir = kit.shots ?? '';
  if (dir) fs.mkdirSync(dir, { recursive: true });
  const url = `${kit.base}/?room=e2e-stone-${Math.random().toString(36).slice(2, 10)}`;
  const ph = await phone(kit, url, 'hidden-stone');
  try {
    const toStreet = await walkInto(ph, 1, 'castle-street');
    const doorX = await ph.page.evaluate(() => {
      const irr = (window as any).irreverents;
      const c = irr.content;
      const d = c.rooms['castle-street'].doors.find((q: any) => q.id === 'cellar-doorway');
      return d.tx * 16 + (d.w * 16 - c.characters[irr.drawn.me.kind].box.w) / 2;
    });
    if (toStreet) await standAt(ph, doorX, 0);
    const used = toStreet && (await tap(ph, 'interact'));
    let down = false;
    try {
      await ph.page.waitForFunction(() => (window as any).irreverents.drawn.room === 'undercroft', null, { polling: 'raf', timeout: 4000 });
      down = true;
    } catch {
      // reported below
    }
    const look = async (): Promise<{ stone: any; plate: any; me: any; w: number; h: number }> =>
      ph.page.evaluate(() => {
        const irr = (window as any).irreverents;
        const d = irr.drawn;
        const stone = d.entities.find((e: any) => e.kind === 'stone-heavy') ?? null;
        const plate = (d.parts ?? []).find((p: any) => p.part === 'heavy-plate') ?? null;
        const box = irr.content.characters[d.me.kind].box;
        return { stone, plate, me: d.me, w: box.w, h: box.h };
      });
    let seen = down ? await look() : null;
    let onStep = false;
    let lifted = false;
    if (seen?.stone) {
      await sleep(500);
      await shots(ph, dir, 'hidden-stone-hall');
      // Onto the stair's lowest step (row 11, columns 22-24; its top at y 176) east of the stone: a running hop west.
      await standAt(ph, 26 * 16 + 4, -1);
      await honourBreak(ph);
      const p = await pointOn(ph, '[data-stick]', 0.1);
      const jump = await pointOn(ph, '[data-action="jump"]');
      if (p && jump) {
        await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...p, id: 1 }] });
        await sleep(60);
        await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...p, id: 1 }, { ...jump, id: 2 }] });
        await sleep(260);
        await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...p, id: 1 }] });
        await sleep(120);
        await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        await settle(ph);
      }
      seen = await look();
      onStep = Math.abs(seen.me.y + seen.h - 176) <= 1;
      if (onStep) {
        await standAt(ph, seen.stone.x + 24 + 2, -1);
        await sleep(200);
        await tap(ph, 'grab');
        const end = Date.now() + 1500;
        while (Date.now() < end) {
          const l = await look();
          if (l.stone && l.stone.y < l.me.y - 4) lifted = true;
          await sleep(50);
        }
        await shots(ph, dir, 'hidden-stone-refused');
      }
    }
    fact(
      'hidden-recruit-stone',
      down && !!seen?.stone && !!seen?.plate && onStep && !lifted,
      `by touch, down the cellar doorway by Use (${used ? 'tapped' : 'NOT tapped'}; in the undercroft: ${down}); the page draws the stone (${seen?.stone ? `at x ${Math.round(seen.stone.x)}` : 'NOT'}) and the heavy plate (${seen?.plate ? 'yes' : 'NO'}); the ${seen?.me?.kind ?? 'hero'} hopped onto the low step beside it (${onStep}) and tapped Grab: the stone ${lifted ? 'WAS drawn lifted' : 'stayed where it lay'}`,
    );
  } finally {
    await ph.ctx.close();
  }
}
