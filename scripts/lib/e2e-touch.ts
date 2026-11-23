// Step 2's facts inside `npm run e2e` (one call line in scripts/e2e.ts): can a
// phone player hit, grab, carry, throw and switch by touch alone, and does the
// OTHER phone's screen show the throw?
//
// Two pages, both Playwright's iPhone 14 held sideways, both driven only by
// touches on the page's own controls ([data-stick], [data-action]), in a
// private world of their own. Every fact is read from what a page drew
// (`window.irreverents.drawn`), never from server state
// (docs/mechanisms/network.md; docs/mechanisms/combat-and-impact.md, "How it
// is checked").
//
// DRAFT: every distance and time limit below is a first pass, set from a few
// measured runs with room to spare; timing across two pages is not tick-exact.

/* eslint-disable @typescript-eslint/no-explicit-any */
type Page = any;

export interface Kit {
  browser: any;
  devices: any;
  /** The server's address, no path. */
  base: string;
  /** Where screenshots go. */
  out: string;
  fact: (id: string, ok: boolean, text: string) => void;
  errors: string[];
}
interface Phone {
  name: string;
  ctx: any;
  page: Page;
  cdp: any;
  /** This page's player id. */
  id: string;
}
interface Pt {
  t: number;
  x: number;
  y: number;
}
/** Which drawn thing: by entity id, or the character of a player. */
type Key = { id: string } | { player: string };

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
const n = (v: number | null | undefined): string => (v === null || v === undefined ? '?' : v.toFixed(0));

async function phone(kit: Kit, url: string, name: string): Promise<Phone> {
  const ctx = await kit.browser.newContext({ ...kit.devices['iPhone 14 landscape'] });
  const page = await ctx.newPage();
  page.on('pageerror', (e: Error) => kit.errors.push(`${name}: ${e.message}`));
  const cdp = await ctx.newCDPSession(page);
  await page.goto(url);
  await page.waitForFunction(() => (window as any).irreverents?.drawn.status === 'online' && (window as any).irreverents.drawn.me, null, { timeout: 10000 });
  const id = (await page.evaluate(() => (window as any).irreverents.player)) as string;
  return { name, ctx, page, cdp, id };
}

/** The middle of a control as the page lays it out (`fx`: how far across), or null when it is not there to touch. */
const pointOn = (ph: Phone, selector: string, fx = 0.5): Promise<{ x: number; y: number } | null> =>
  ph.page.evaluate(
    ([s, f]: [string, number]) => {
      const el = document.querySelector(s);
      if (!el) return null;
      const b = el.getBoundingClientRect();
      if (b.width < 1 || b.height < 1) return null;
      const x = Math.round(b.left + b.width * f);
      const y = Math.round(b.top + b.height / 2);
      // A finger only reaches the control if nothing lies over it.
      const top = document.elementFromPoint(x, y);
      return top && (top === el || el.contains(top)) ? { x, y } : null;
    },
    [selector, fx],
  );

/** One finger down on an action's button and up again. False when the button could not be touched. */
async function tap(ph: Phone, action: string, ms = 130): Promise<boolean> {
  // The control for every fact here: E2E_TOUCH_BREAK=<action> takes that
  // button off the page, as a broken layout would, and its facts must fail.
  if (process.env.E2E_TOUCH_BREAK === action) await ph.page.addStyleTag({ content: `[data-action="${action}"] { display: none !important; }` });
  const p = await pointOn(ph, `[data-action="${action}"]`);
  if (!p) return false;
  await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...p, id: 2 }] });
  await sleep(ms);
  await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  return true;
}

const me = (ph: Phone): Promise<any> => ph.page.evaluate(() => (window as any).irreverents.drawn.me);
const find = (ph: Phone, key: Key): Promise<any> =>
  ph.page.evaluate((k: any) => (window as any).irreverents.drawn.entities.find((d: any) => (k.id ? d.id === k.id : d.player === k.player)) ?? null, key);
/**
 * What stands on the page's own character's floor, as the page draws it:
 * the bodies nobody plays, with their widths, and how far the floor runs
 * left and right of the character before a wall or an opening.
 * The room is whatever the game starts players in (content/game.json and
 * content/placements/ are other steps'), so nothing here names one.
 */
const floor = (ph: Phone): Promise<{ bodies: { id: string; kind: string; x: number; w: number }[]; left: number; right: number; doorLeft: boolean; doorRight: boolean }> =>
  ph.page.evaluate(() => {
    const irr = (window as any).irreverents;
    const d = irr.drawn;
    const box = (k: string): any => irr.content.characters[k].box;
    const feet = d.me.y + box(d.me.kind).h;
    const bodies = d.entities
      .filter((e: any) => e.player === null && Math.abs(e.y + box(e.kind).h - feet) <= 2)
      .map((e: any) => ({ id: e.id, kind: e.kind, x: e.x, w: box(e.kind).w }));
    const room = irr.content.rooms[d.room];
    const t = room.tile;
    const row = Math.floor((feet - 1) / t);
    // Room.cells: 0 is empty, 1 solid (src/content/kinds/rooms.ts). Floor: an empty tile with a solid one under it.
    // A walk door carries anything that touches it into another room: the floor ends where one begins.
    const door = (c: number): boolean => room.doors.some((o: any) => c >= o.tx && c < o.tx + o.w && row >= o.ty && row < o.ty + o.h);
    const open = (c: number): boolean => c >= 0 && c < room.w && !door(c) && room.cells[row * room.w + c] === 0 && room.cells[(row + 1) * room.w + c] === 1;
    let c0 = Math.floor(d.me.x / t);
    let c1 = c0;
    while (open(c0 - 1)) c0--;
    while (open(c1 + 1)) c1++;
    return { bodies, left: c0 * t, right: (c1 + 1) * t, doorLeft: door(c0 - 1), doorRight: door(c1 + 1) };
  });
/** Waits until the page's own character is drawn in the same place for six frames. */
const settle = (ph: Phone): Promise<void> =>
  ph.page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        let lx = NaN;
        let ly = NaN;
        let still = 0;
        const t0 = performance.now();
        const tick = (): void => {
          const m = (window as any).irreverents.drawn.me;
          if (m && m.x === lx && m.y === ly) still++;
          else still = 0;
          lx = m?.x;
          ly = m?.y;
          if (still >= 6 || performance.now() - t0 > 3000) return resolve();
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }),
  );

/** A thumb on the stick, left (-1) or right (1), until the page draws its own character past `untilX`. */
async function steer(ph: Phone, dir: number, untilX: number, ms = 6000): Promise<void> {
  const p = await pointOn(ph, '[data-stick]', dir > 0 ? 0.75 : 0.25);
  if (!p) return;
  await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...p, id: 1 }] });
  try {
    await ph.page.waitForFunction(
      ([d, x]: number[]) => {
        const m = (window as any).irreverents.drawn.me;
        return d! > 0 ? m.x >= x! : m.x <= x!;
      },
      [dir, untilX],
      { polling: 'raf', timeout: ms },
    );
  } catch {
    // never got there: the caller's fact reports where it stands
  }
  await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}
/** Walks by the stick to within a few pixels of x, and ends facing `face` (1 right, -1 left). */
async function standAt(ph: Phone, goal: number, face = 1): Promise<void> {
  for (let i = 0; i < 5; i++) {
    const x = (await me(ph)).x as number;
    if (Math.abs(x - goal) <= 3) break;
    await steer(ph, x < goal ? 1 : -1, x < goal ? goal - 3 : goal + 3);
    await settle(ph);
  }
  // A touch of the stick: the character faces that way and barely moves.
  const p = await pointOn(ph, '[data-stick]', face > 0 ? 0.75 : 0.25);
  if (p) {
    await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...p, id: 1 }] });
    await sleep(60);
    await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  }
  await settle(ph);
}

/** Records where a page draws one thing, every frame, for `ms`. Start it, act, then await it. */
const track = (ph: Phone, key: Key, ms: number): Promise<Pt[]> =>
  ph.page.evaluate(
    ([k, dur]: [any, number]) =>
      new Promise<any[]>((resolve) => {
        const t0 = performance.now();
        const pts: any[] = [];
        const tick = (): void => {
          const e = (window as any).irreverents.drawn.entities.find((d: any) => (k.id ? d.id === k.id : d.player === k.player));
          const t = performance.now() - t0;
          if (e) pts.push({ t: Math.round(t), x: e.x, y: e.y });
          if (t > dur) return resolve(pts);
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }),
    [key, ms],
  );
/**
 * What a recording shows of a flight: how far sideways the thing got from
 * where it started, and the most it covered in any 250 ms (no character runs
 * faster than 128 px a second, so more than 32 px in 250 ms is not walking).
 */
function flight(pts: Pt[]): { far: number; burst: number; rose: number } {
  if (pts.length === 0) return { far: 0, burst: 0, rose: 0 };
  const p0 = pts[0]!;
  let far = 0;
  let burst = 0;
  let rose = 0;
  let j = 0;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i]!;
    far = Math.max(far, Math.abs(p.x - p0.x));
    rose = Math.max(rose, p0.y - p.y);
    while (p.t - pts[j]!.t > 250) j++;
    burst = Math.max(burst, Math.abs(p.x - pts[j]!.x));
  }
  return { far, burst, rose };
}
const FLEW = 40; // px in a quarter second: faster than anything runs
const flew = (pts: Pt[]): boolean => flight(pts).burst >= FLEW;
const said = (pts: Pt[]): string => {
  const f = flight(pts);
  return `${n(f.far)} px from where it was, ${n(f.burst)} px of it inside a quarter second`;
};

/** Waits until a page draws `top` riding above `under` (carried overhead), or not. Resolves to how long it took, or null. */
async function whenCarried(ph: Phone, top: Key, under: Key, carried: boolean, ms: number): Promise<number | null> {
  const t0 = Date.now();
  try {
    await ph.page.waitForFunction(
      ([a, b, want]: [any, any, boolean]) => {
        const es = (window as any).irreverents.drawn.entities;
        const pick = (k: any): any => es.find((d: any) => (k.id ? d.id === k.id : d.player === k.player));
        const t = pick(a);
        const u = pick(b);
        if (!t || !u) return false;
        const h = (window as any).irreverents.content.characters[t.kind].box.h;
        // Carried: its feet ON the carrier's head (carry-ride.ts puts it there every tick), and over the carrier.
        // Merely higher up does not count: a body that broke free may land on a platform above.
        const over = Math.abs(t.y + h - u.y) <= 3 && Math.abs(t.x - u.x) <= 24;
        return over === want;
      },
      [top, under, carried],
      { polling: 'raf', timeout: ms },
    );
    return Date.now() - t0;
  } catch {
    return null;
  }
}

export async function touchAndThrows(kit: Kit): Promise<void> {
  const { fact } = kit;
  const url = `${kit.base}/?room=e2e-touch-${Math.random().toString(36).slice(2, 10)}`;
  // A joins first, so the server seats it as the party's first member (the
  // grappler, who can lift anything here); B second (the infiltrator).
  const A = await phone(kit, url, 'touch A');
  const B = await phone(kit, url, 'touch B');
  try {
    await B.page.waitForFunction((p: string) => (window as any).irreverents.drawn.entities.some((d: any) => d.player === p), A.id, { timeout: 5000 }).catch(() => {});
    await A.page.waitForFunction((p: string) => (window as any).irreverents.drawn.entities.some((d: any) => d.player === p), B.id, { timeout: 5000 }).catch(() => {});
    const a0 = await me(A);
    const b0 = await me(B);
    const keyA: Key = { player: A.id };
    const keyB: Key = { player: B.id };
    const f0 = await floor(A);
    const near = (bodies: any[], kinds: string[], x: number): any => {
      for (const k of kinds) {
        const of = bodies.filter((o) => o.kind === k).sort((p, q) => Math.abs(p.x - x) - Math.abs(q.x - x));
        if (of[0]) return of[0];
      }
      return null;
    };
    const crate0 = near(f0.bodies, ['crate'], a0.x);
    const shown = async (ph: Phone): Promise<boolean> => (await ph.page.evaluate(() => (window as any).irreverents.drawn.touchControls)) === true;
    const ready = !!crate0 && a0.kind === 'grappler' && b0.kind === 'infiltrator' && (await shown(A)) && (await shown(B));
    fact('t0', ready,
      `two phone pages (touch only) share a private world: A is the ${a0.kind} at x ${n(a0.x)}, B the ${b0.kind} at x ${n(b0.x)}; in ${a0 && (await A.page.evaluate(() => (window as any).irreverents.drawn.room))}, whose floor runs from x ${n(f0.left)} to ${n(f0.right)}; A's page draws a crate on it at x ${n(crate0?.x)}; touch controls shown on both`);
    if (!ready) return;
    const crate: Key = { id: crate0.id };

    // B first walks to the left end of the floor, out of the way of the crate.
    await standAt(B, f0.left + 4, 1);

    // ---- touch: grab a crate, carry it, throw it; the other screen sees it fly ----
    await standAt(A, crate0.x - 10);
    const tappedGrab = await tap(A, 'grab');
    const up = await whenCarried(A, crate, keyA, true, 1500);
    const upB = await whenCarried(B, crate, keyA, true, 1500);
    fact('t-grab', tappedGrab && up !== null,
      `A taps Grab beside the crate: ${tappedGrab ? '' : 'the Grab button could not be touched; '}A's page ${up === null ? 'did NOT draw the crate lifted overhead (1.5 s)' : `drew the crate overhead ${up} ms later`}`);

    const carryFrom = (await me(A)).x as number;
    await steer(A, -1, carryFrom - 20);
    await settle(A);
    const carryTo = await me(A);
    const still = await whenCarried(A, crate, keyA, true, 500);
    const stillB = await whenCarried(B, crate, keyA, true, 1000);
    fact('t-carry', still !== null && carryFrom - carryTo.x >= 15,
      `A walks left by the stick with the crate: went from x ${n(carryFrom)} to ${n(carryTo.x)} and A's page ${still === null ? 'no longer draws the crate overhead' : 'still draws the crate overhead'}`);
    fact('s-carry', upB !== null && stillB !== null,
      `B's page ${upB === null ? 'did NOT draw the crate lifted over A' : 'drew the crate lifted over A'}${stillB === null ? ', and does NOT draw it over A after the walk' : ', and still over A after the walk'}`);

    await standAt(A, carryTo.x); // face right again
    const flyA = track(A, crate, 1500);
    const flyB = track(B, crate, 1500);
    const tappedHit = await tap(A, 'attack');
    const [crateA, crateB] = await Promise.all([flyA, flyB]);
    fact('t-throw', up !== null && tappedHit && flew(crateA),
      `A taps Hit while carrying: ${tappedHit ? '' : 'the Hit button could not be touched; '}A's page drew the crate ${flew(crateA) ? 'fly' : 'NOT fly'}: ${said(crateA)}`);
    fact('s-throw-crate', up !== null && flew(crateB), `B's page drew that crate ${flew(crateB) ? 'fly' : 'NOT fly'}: ${said(crateB)}`);

    // ---- touch: hit something (a dummy if the room has one, else a crate) ----
    await sleep(1200); // let what was thrown come to rest
    const f1 = await floor(A);
    const target = near(f1.bodies, ['dummy', 'crate', 'crate-heavy'], (await me(A)).x);
    let dumA: Pt[] = [];
    let dumB: Pt[] = [];
    let tappedHit2 = false;
    if (target) {
      // Knock it toward the side with more floor; stand so it is just past A's front edge, inside the hit's reach.
      const face = f1.right - target.x >= target.x - f1.left ? 1 : -1;
      await standAt(A, face > 0 ? target.x - 22 : target.x + target.w + 4, face);
      const hitA = track(A, { id: target.id }, 1200);
      const hitB = track(B, { id: target.id }, 1200);
      tappedHit2 = await tap(A, 'attack');
      [dumA, dumB] = await Promise.all([hitA, hitB]);
    }
    fact('t-hit', tappedHit2 && flight(dumA).far >= 8 && flight(dumB).far >= 8,
      target ? `A taps Hit facing a ${target.kind}: A's page drew it knocked ${n(flight(dumA).far)} px away (at least 8 expected), B's page ${n(flight(dumB).far)} px` : `nothing left on A's floor to hit`);

    // ---- touch: switch hero, and back ----
    const tappedSwitch = await tap(A, 'switch');
    let kindNow = a0.kind as string;
    try {
      kindNow = (await (await A.page.waitForFunction((k: string) => { const m = (window as any).irreverents.drawn.me; return m.kind !== k ? m.kind : false; }, a0.kind, { polling: 'raf', timeout: 1500 })).jsonValue()) as string;
    } catch {
      // unchanged
    }
    const seenByB = kindNow !== a0.kind && (await B.page.waitForFunction(([p, k]: string[]) => (window as any).irreverents.drawn.entities.find((d: any) => d.player === p)?.kind === k, [A.id, kindNow], { timeout: 1500 }).then(() => true, () => false));
    fact('t-switch', tappedSwitch && kindNow !== a0.kind && seenByB,
      `A taps Switch: ${tappedSwitch ? '' : 'the Switch button could not be touched; '}A's page drew its character as the ${kindNow}${kindNow === a0.kind ? ' (unchanged)' : ''}; B's page ${seenByB ? 'drew the same' : 'did NOT'}`);
    // "No member is played twice by a switch" (docs/mechanisms/party-and-switching.md).
    const bKind = (await me(B)).kind as string;
    // DRAFT: a known gap, printed on every run and not yet counted as a
    // failure: a page's own world holds only its own character, so its
    // switch cannot see which members others hold (docs/mechanisms/network.md,
    // "Known limits"; the place to widen is src/net/client.ts, Step 1's).
    // The day this prints "ok", make it a plain fact.
    if (kindNow !== bKind) fact('t-switch-free', true, `after that switch A is the ${kindNow} and B the ${bKind}: no member played twice (this was a known gap: make it a plain fact now)`);
    else console.log(`todo  (t-switch-free) KNOWN GAP, not counted: after that switch A is the ${kindNow} and B the ${bKind}, the SAME party member played twice`);
    for (let i = 0; i < 4 && (await me(A)).kind !== 'grappler'; i++) {
      await tap(A, 'switch');
      await sleep(400);
    }
    const backAs = (await me(A)).kind as string;

    // ---- two screens: A grabs B; B, held, taps Jump and is free on both pages ----
    const bx = (await me(B)).x as number;
    await standAt(A, bx + 6, -1);
    const tappedGrab2 = await tap(A, 'grab');
    const heldA = await whenCarried(A, keyB, keyA, true, 1500);
    const heldB = await whenCarried(B, keyB, keyA, true, 1500);
    fact('t-grab-friend', backAs === 'grappler' && tappedGrab2 && heldA !== null && heldB !== null,
      `A (the ${backAs} again) taps Grab beside B: A's page ${heldA === null ? 'did NOT draw B lifted overhead' : 'drew B lifted overhead'}; B's own page ${heldB === null ? 'did NOT draw its character lifted' : `drew its own character lifted over A ${heldB} ms later`}`);
    const jumpAt = Date.now();
    const tappedJump = await tap(B, 'jump');
    const freeB = await whenCarried(B, keyB, keyA, false, 1200);
    const freeA = await whenCarried(A, keyB, keyA, false, 1200);
    // Free means its own again: back on the floor and walking off by its own stick, on both pages.
    await settle(B);
    const landed = await me(B);
    await steer(B, 1, landed.x + 12, 2000);
    await settle(B);
    const walked = await me(B);
    const walkedOnA = await find(A, keyB);
    // INTENT: a held player is let go by itself after holdPlayerTime (2.5 s):
    // the limit here is well inside that, so this is the Jump tap's doing.
    fact('s-break-free', heldB !== null && tappedJump && freeB !== null && freeA !== null && Date.now() - jumpAt < 6000 && freeB <= 1200 && walked.x - landed.x >= 8 && !!walkedOnA && Math.abs(walkedOnA.x - walked.x) <= 6,
      `B, ${heldB === null ? 'NOT held' : 'held'}, taps Jump: B's own page drew it out of A's hands ${freeB === null ? 'never (1.2 s; a hold ends by itself only after 2.5 s)' : `${freeB} ms later`}, A's page ${freeA === null ? 'never' : 'too'}; B then walked by its own stick from x ${n(landed.x)} to ${n(walked.x)} (A's page draws it at ${n(walkedOnA?.x)})`);

    // ---- two screens: A grabs B and throws them; B's own screen sees itself fly ----
    // B walks to a clear stretch of floor and A throws it toward a wall,
    // never toward a door: a body thrown through a door is in another room,
    // and this page stops drawing it. A stands just behind B, so only B is
    // in reach of the grab, with clear floor ahead for the flight.
    const f2 = await floor(A);
    const dir = f2.doorRight && !f2.doorLeft ? -1 : 1;
    const wall = dir < 0 ? f2.left : f2.right;
    let spot = wall - dir * 100;
    let clear = -Infinity;
    for (let d = 70; d <= 140; d += 6) {
      const x = wall - dir * d;
      if (x < f2.left + 30 || x > f2.right - 40) continue;
      // From behind A to 50 px ahead of B.
      const [lo, hi] = dir > 0 ? [x - 8, x + 60] : [x - 50, x + 26];
      const gap = Math.min(999, ...f2.bodies.map((o) => (o.x + o.w < lo ? lo - (o.x + o.w) : o.x > hi ? o.x - hi : -1)));
      if (gap > clear) [spot, clear] = [x, gap];
    }
    await standAt(B, spot);
    await standAt(A, ((await me(B)).x as number) - dir * 6, dir);
    await tap(A, 'grab');
    const held2 = await whenCarried(B, keyB, keyA, true, 1500);
    const meFlyB = track(B, keyB, 1500);
    const meFlyA = track(A, keyB, 1500);
    await tap(A, 'attack');
    const [bOnB, bOnA] = await Promise.all([meFlyB, meFlyA]);
    fact('t-throw-friend', held2 !== null && flew(bOnA), `A grabs B again and taps Hit: A's page drew B ${flew(bOnA) ? 'fly' : 'NOT fly'}: ${said(bOnA)}`);
    fact('s-throw-friend', held2 !== null && flew(bOnB), `B's own page drew its own character ${flew(bOnB) ? 'fly' : 'NOT fly'}: ${said(bOnB)}`);

    // B is its own again afterwards: there is always a way out of a flight.
    await sleep(1500);
    await settle(B);
    const after = await me(B);
    await steer(B, -dir, after.x - dir * 12, 3000);
    const after2 = await me(B);
    fact('s-after', held2 !== null && Math.abs(after.x - after2.x) >= 8, `after the throw B walks by its own stick again: from x ${n(after.x)} to ${n(after2.x)}`);

    await A.page.screenshot({ path: `${kit.out}/touch-a.png` });
    await B.page.screenshot({ path: `${kit.out}/touch-b.png` });
  } finally {
    await A.ctx.close();
    await B.ctx.close();
  }
}
