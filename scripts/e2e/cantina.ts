// Step 11's facts inside `npm run e2e` (one call line in scripts/e2e.ts),
// signal 8: two phone-sized pages, by touch only, walk from the start room
// into the castle street and up through its doorway into the cantina. On
// one: a tap on a wandering hero outside the party opens the party row
// (`drawn.cantina.row`); a tap elsewhere closes it with nothing changed; a
// tap on a member nobody plays swaps the newcomer in, and the switch button
// then reaches the newcomer. Then a swing at a regular starts a brawl, and
// both pages draw the counter with the same numbers.
// docs/mechanisms/cantina.md. Every fact is read from what a page drew.
//
// DRAFT: every limit below is a first pass with room to spare.
import path from 'node:path';
import { me, phone, pointOn, settle, standAt, tap } from '../lib/e2e-touch.ts';
import type { Kit, Phone } from '../lib/e2e-touch.ts';

/* eslint-disable @typescript-eslint/no-explicit-any */
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

const room = (ph: Phone): Promise<string> => ph.page.evaluate(() => (window as any).irreverents.drawn.room);
const cantina = (ph: Phone): Promise<any> => ph.page.evaluate(() => (window as any).irreverents.drawn.cantina);
const party = (ph: Phone): Promise<string[]> => ph.page.evaluate(() => (window as any).irreverents.world.party ?? (window as any).irreverents.content.party.members);

/** Holds the stick one way until the page draws its character in `goal` (or the time runs out). */
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

/** A thumb slides up off the pad for a moment (the stick pushed up: the way through an enter doorway). */
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

/** One finger down on the game view at page point (x, y) and up again: a tap that is not on a control. */
async function touchAt(ph: Phone, x: number, y: number): Promise<void> {
  await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: Math.round(x), y: Math.round(y), id: 5 }] });
  await sleep(60);
  await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}

/** Where on the page a drawn body's middle is, or null when it is not drawn. */
const onScreen = (ph: Phone, id: string): Promise<{ x: number; y: number } | null> =>
  ph.page.evaluate((i: string) => {
    const irr = (window as any).irreverents;
    const d = irr.drawn;
    const e = d.entities.find((x: any) => x.id === i);
    const cv = document.getElementById('game') as HTMLCanvasElement;
    const r = cv.getBoundingClientRect();
    if (!e) return null;
    const box = irr.content.characters[e.kind].box;
    const s = r.width / cv.width;
    const x = r.left + (e.x - d.camera.x + box.w / 2) * s;
    const y = r.top + (e.y - d.camera.y + box.h / 2) * s;
    return x > r.left && x < r.right && y > r.top && y < r.bottom ? { x, y } : null;
  }, id);

/** By touch: start room -> castle street -> up through the cantina's doorway. True once the page draws it in the cantina. */
async function intoCantina(ph: Phone): Promise<boolean> {
  if (!(await walkInto(ph, 1, 'castle-street'))) return false;
  const at = await ph.page.evaluate(() => {
    const irr = (window as any).irreverents;
    const c = irr.content;
    const door = c.rooms['castle-street'].doors.find((d: any) => d.id === 'to-cantina');
    return { x: (door.tx + door.w / 2) * c.rooms['castle-street'].tile - c.characters[irr.drawn.me.kind].box.w / 2 };
  });
  // The push up starts on the pad, which also steers for a moment: retries aim a little either side.
  const nudge = [-4, -10, 2, -16];
  for (let i = 0; i < nudge.length && (await room(ph)) !== 'cantina'; i++) {
    await standAt(ph, at.x + nudge[i]!, 1);
    await pushUp(ph);
    try {
      await ph.page.waitForFunction(() => (window as any).irreverents.drawn.room === 'cantina', null, { polling: 'raf', timeout: 3000 });
    } catch {
      // tried again below
    }
  }
  return (await room(ph)) === 'cantina';
}

/** The regular to tap: a roster character outside the page's party, drawn on screen now. */
async function outsider(ph: Phone): Promise<{ id: string; kind: string; at: { x: number; y: number } } | null> {
  const members = await party(ph);
  const roster = (await ph.page.evaluate(() => (window as any).irreverents.content.roster.characters)) as string[];
  for (const kind of roster.filter((k) => !members.includes(k))) {
    const at = await onScreen(ph, `cantina:${kind}`);
    if (at) return { id: `cantina:${kind}`, kind, at };
  }
  return null;
}

export async function cantinaFacts(kit: Kit): Promise<void> {
  const { fact } = kit;
  const url = `${kit.base}/?room=e2e-cantina-${Math.random().toString(36).slice(2, 10)}`;
  const A = await phone(kit, url, 'cantina-a');
  const B = await phone(kit, url, 'cantina-b');
  try {
    const [inA, inB] = [await intoCantina(A), await intoCantina(B)];
    const where = async (ph: Phone): Promise<string> => {
      const m = await me(ph);
      return `${await room(ph)} x ${Math.round(m?.x ?? -1)}`;
    };
    fact('cantina-in', inA && inB, `by touch alone, two phones walked from the start room into the castle street and up through its doorway into the cantina (a ${inA}, at ${await where(A)}; b ${inB}, at ${await where(B)})`);
    if (!inA || !inB) return;
    await sleep(800);

    // 1. Tap a regular outside the party: the row. 2. Tap elsewhere: closed, nothing changed.
    const before = await party(A);
    let r = await outsider(A);
    if (r) await touchAt(A, r.at.x, r.at.y);
    let row: any = null;
    try {
      await A.page.waitForFunction(() => (window as any).irreverents.drawn.cantina?.row, null, { polling: 'raf', timeout: 2000 });
      row = (await cantina(A)).row;
    } catch {
      // reported below
    }
    await A.page.screenshot({ path: path.join(kit.out, 'e2e-cantina-row.png') });
    fact('cantina-row', row !== null && row.length === before.length, `a tap on a wandering hero outside the party (${r?.kind ?? 'none on screen'}) opened the party row: ${row ? row.map((c: any) => c.kind).join(', ') : 'nothing drawn'} (expected the party, ${before.join(', ')})`);
    const empty = await A.page.evaluate(() => {
      const r = (document.getElementById('game') as HTMLCanvasElement).getBoundingClientRect();
      return { x: r.left + r.width * 0.12, y: r.top + r.height * 0.55 };
    });
    await touchAt(A, empty.x, empty.y);
    let closed = false;
    try {
      await A.page.waitForFunction(() => !(window as any).irreverents.drawn.cantina?.row, null, { polling: 'raf', timeout: 2000 });
      closed = true;
    } catch {
      // reported below
    }
    const after = await party(A);
    fact('cantina-row-closes', closed && after.join() === before.join(), `a tap elsewhere with the row open closed it (${closed}) and changed nothing (party ${after.join(', ')})`);

    // 3. Open it again and tap a member nobody plays: the party changes, on both pages; the switch reaches the newcomer.
    const mine = (await me(A)).kind as string;
    const theirs = (await me(B)).kind as string;
    r = await outsider(A);
    if (r) await touchAt(A, r.at.x, r.at.y);
    let slot: any = null;
    try {
      await A.page.waitForFunction(() => (window as any).irreverents.drawn.cantina?.row, null, { polling: 'raf', timeout: 2000 });
      slot = (await cantina(A)).row.find((c: any) => c.kind !== mine && c.kind !== theirs && !c.taken) ?? null;
    } catch {
      // reported below
    }
    if (slot) await touchAt(A, slot.x + slot.w / 2, slot.y + slot.h / 2);
    const want = before.map((m, i) => (slot && i === slot.slot ? r!.kind : m));
    let swapped = false;
    try {
      await A.page.waitForFunction((w: string) => ((window as any).irreverents.world.party ?? []).join() === w, want.join(), { polling: 'raf', timeout: 3000 });
      await B.page.waitForFunction((w: string) => ((window as any).irreverents.world.party ?? []).join() === w, want.join(), { polling: 'raf', timeout: 3000 });
      swapped = true;
    } catch {
      // reported below
    }
    fact('cantina-swap', swapped, `a tap on ${slot ? `${slot.kind}'s chip (nobody plays it)` : 'no free chip'} put ${r?.kind ?? '?'} in the party on both pages: a ${(await party(A)).join(', ')}, b ${(await party(B)).join(', ')} (expected ${want.join(', ')})`);
    const seen: string[] = [mine];
    for (let i = 0; i < want.length && seen[seen.length - 1] !== r?.kind; i++) {
      await tap(A, 'switch');
      await sleep(250);
      seen.push((await me(A)).kind);
    }
    fact('cantina-switch', seen[seen.length - 1] === r?.kind, `then the switch button reached the newcomer: a was ${seen.join(' -> ')} (expected to reach ${r?.kind})`);

    // 4. A swing at a regular: a brawl, and both pages draw the counter with the same numbers.
    let counterA: any = null;
    for (let i = 0; i < 12 && !counterA; i++) {
      const box = await A.page.evaluate(() => {
        const irr = (window as any).irreverents;
        const d = irr.drawn;
        const meW = irr.content.characters[d.me.kind].box.w;
        const regs = d.entities.filter((e: any) => e.player === null && String(e.id).startsWith('cantina:'));
        regs.sort((p: any, q: any) => Math.abs(p.x - d.me.x) - Math.abs(q.x - d.me.x));
        const t = regs[0];
        return t ? { x: t.x, w: irr.content.characters[t.kind].box.w, meW, meX: d.me.x } : null;
      });
      if (!box) break;
      const left = box.meX < box.x;
      await standAt(A, left ? box.x - box.meW - 2 : box.x + box.w + 2, left ? 1 : -1);
      await tap(A, 'attack');
      await sleep(400);
      counterA = (await cantina(A))?.counter ?? null;
    }
    let same = false;
    let a: any = null;
    let b: any = null;
    for (let i = 0; i < 20 && !same; i++) {
      a = (await cantina(A))?.counter ?? null;
      b = (await cantina(B))?.counter ?? null;
      same = a !== null && b !== null && a.length === 2 && JSON.stringify(a) === JSON.stringify(b);
      if (!same) await sleep(150);
    }
    await B.page.screenshot({ path: path.join(kit.out, 'e2e-cantina-brawl.png') });
    fact('cantina-counter', counterA !== null && same, `a swing at a regular started a brawl (${counterA !== null}); both pages draw the counter with the same numbers: a ${JSON.stringify(a)}, b ${JSON.stringify(b)}`);
  } finally {
    await A.ctx.close();
    await B.ctx.close();
  }
}
