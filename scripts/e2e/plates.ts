// Step 3's two-page proof, inside `npm run e2e` (one call line in
// scripts/e2e.ts; handoff-prompts/loop-puzzles.md, push 5): two
// phone-sized pages in one world, by touch only.
//
// The courtyard: each page stands on one of the two plates; both pages draw
// the gate open, and neither page ever draws the plate under the *other*
// player up while they stand on it (Step 3's handoff item 5: a page steps
// only its own character between snapshots); then both walk through the
// gate (plates-courtyard, plates-friend-held, plates-gate-through).
//
// The stone plate under the castle (needs 83): the first page's hero (the
// party's first member, the grappler, 60) alone on it: drawn part-sunk and
// the grate shut, on that page (plates-part-sunk: the control, read before
// the second steps on). Then the second (the infiltrator, 26: 86 in all):
// both pages draw it right down and the grate open, the plate never drawn
// up under the friend, and both drop through the grate into the pocket
// (plates-stone, plates-stone-held, plates-pocket).
//
// Control: E2E_PLATES_ALONE=1 keeps the second page off both plates: the
// gate and the grate must then read shut, and the "open" facts fail.
// Read from `window.irreverents.drawn.parts` (src/client/draw/room-parts.ts).
// Shots (sideways and upright) to e2e-out/plates/; the committed ones in
// docs/plan/step-3-shots/ were copied from a run.
// DRAFT: every wait is a first pass with room to spare.
import fs from 'node:fs';
import path from 'node:path';
import { me, phone, pointOn, settle, standAt, steer, tap } from '../lib/e2e-touch.ts';
import type { Kit, Phone } from '../lib/e2e-touch.ts';

/* eslint-disable @typescript-eslint/no-explicit-any */
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
const ALONE = process.env.E2E_PLATES_ALONE === '1';

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

/** The x that puts the page's own character's middle on column `tx` (+ `frac` of a tile). */
const xOn = (ph: Phone, tx: number, frac = 0.5): Promise<number> =>
  ph.page.evaluate(
    ([c, f]: number[]) => {
      const irr = (window as any).irreverents;
      return (c! + f!) * 16 - irr.content.characters[irr.drawn.me.kind].box.w / 2;
    },
    [tx, frac],
  );

type Part = { room: string; part: string; kind: string; on: boolean; sink: number | null };
const parts = (ph: Phone): Promise<Part[]> => ph.page.evaluate(() => (window as any).irreverents.drawn.parts);
const partOf = async (ph: Phone, id: string): Promise<Part | null> => (await parts(ph)).find((p) => p.part === id) ?? null;

/** Every frame for `ms`: how many frames drew the part `id` off (not down / not open), and how many drew it at all. */
const watchOff = (ph: Phone, id: string, ms: number): Promise<{ frames: number; off: number; sinks: number[] }> =>
  ph.page.evaluate(
    ([pid, dur]: [string, number]) =>
      new Promise<{ frames: number; off: number; sinks: number[] }>((resolve) => {
        const t0 = performance.now();
        let frames = 0;
        let off = 0;
        const sinks = new Set<number>();
        const tick = (): void => {
          const p = (window as any).irreverents.drawn.parts.find((q: any) => q.part === pid);
          if (p) {
            frames++;
            if (!p.on) off++;
            if (p.sink !== null) sinks.add(p.sink);
          }
          if (performance.now() - t0 > dur) return resolve({ frames, off, sinks: [...sinks] });
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }),
    [id, ms],
  );

/** Waits (by frames) until the page draws part `id` with `on`, or the time runs out. */
async function until(ph: Phone, id: string, on: boolean, ms = 3000): Promise<boolean> {
  try {
    await ph.page.waitForFunction(([pid, o]: [string, boolean]) => (window as any).irreverents.drawn.parts.find((q: any) => q.part === pid)?.on === o, [id, on], { polling: 'raf', timeout: ms });
    return true;
  } catch {
    return false;
  }
}

async function shots(ph: Phone, dir: string, name: string): Promise<void> {
  fs.mkdirSync(dir, { recursive: true });
  await ph.page.screenshot({ path: path.join(dir, `${name}-sideways.png`) });
  await ph.page.setViewportSize({ width: 390, height: 664 });
  await sleep(300);
  await ph.page.screenshot({ path: path.join(dir, `${name}-upright.png`) });
  await ph.page.setViewportSize({ width: 844, height: 390 });
  await sleep(300);
}

/** Into the undercroft from wherever in the town: to the street, then Use at the cellar doorway. */
async function down(ph: Phone): Promise<boolean> {
  const at = await ph.page.evaluate(() => (window as any).irreverents.drawn.room);
  if (at !== 'castle-street' && !(await walkInto(ph, -1, 'castle-street'))) return false;
  const doorX = await ph.page.evaluate(() => {
    const irr = (window as any).irreverents;
    const c = irr.content;
    const d = c.rooms['castle-street'].doors.find((q: any) => q.id === 'cellar-doorway');
    return d.tx * 16 + (d.w * 16 - c.characters[irr.drawn.me.kind].box.w) / 2;
  });
  // DRAFT: up to three tries: the street has a guard and a villain who may shove a hero off the
  // doorway while it walks there (seen once in four runs, page B, after the rebase onto 49b9d07).
  for (let i = 0; i < 3; i++) {
    // Face 0: no last nudge of the stick, which carried the hero 8-12 px on, off the one-column doorway (column 7) onto the hide curtain.
    await standAt(ph, doorX, 0);
    if (!(await tap(ph, 'interact'))) return false;
    try {
      await ph.page.waitForFunction(() => (window as any).irreverents.drawn.room === 'undercroft', null, { polling: 'raf', timeout: 4000 });
      await settle(ph);
      return true;
    } catch {
      const m = await me(ph);
      const room = await ph.page.evaluate(() => (window as any).irreverents.drawn.room);
      console.log(`      (plates) ${ph.name}: Use at the cellar doorway (x ${Math.round(doorX)}) did not go down, try ${i + 1}: at x ${Math.round(m?.x)} y ${Math.round(m?.y)} in ${room}`);
      if (room !== 'castle-street') return false;
    }
  }
  return false;
}

export async function plateFacts(kit: Kit & { shots: string }): Promise<void> {
  const { fact } = kit;
  const url = `${kit.base}/?room=e2e-plates-${Math.random().toString(36).slice(2, 10)}`;
  const A = await phone(kit, url, 'plates A');
  const B = await phone(kit, url, 'plates B');
  try {
    await sleep(600);
    const kinds = [(await me(A)).kind, (await me(B)).kind];

    // ---- the courtyard: one page on each plate ----
    const there = (await walkInto(A, 1, 'castle-street')) && (await walkInto(A, 1, 'courtyard')) && (await walkInto(B, 1, 'castle-street')) && (await walkInto(B, 1, 'courtyard'));
    await standAt(A, await xOn(A, 16), 1);
    if (!ALONE) await standAt(B, await xOn(B, 22), -1);
    else await standAt(B, await xOn(B, 12), 1);
    const openA = await until(A, 'plate-gate', true);
    const openB = await until(B, 'plate-gate', true);
    // While both stand there: every frame, on each page, the plate under the *other* player.
    const [heldA, heldB, gateA, gateB] = await Promise.all([watchOff(A, 'plate-east', 1500), watchOff(B, 'plate-west', 1500), watchOff(A, 'plate-gate', 1500), watchOff(B, 'plate-gate', 1500)]);
    fact('plates-courtyard', there && openA && openB && gateA.off === 0 && gateB.off === 0, `two phone pages (${kinds.join(', ')}) walked by touch to the courtyard (${there}), one on each plate${ALONE ? ' (CONTROL: the second kept off)' : ''}: the gate drawn open on page A (${openA}, shut in ${gateA.off} of ${gateA.frames} frames after) and on page B (${openB}, shut in ${gateB.off} of ${gateB.frames})`);
    fact('plates-friend-held', heldA.frames > 30 && heldB.frames > 30 && heldA.off === 0 && heldB.off === 0, `over 1.5 s, the plate under the friend drawn up on page A in ${heldA.off} of ${heldA.frames} frames, on page B in ${heldB.off} of ${heldB.frames} (expected none)`);
    await shots(B, kit.shots, 'courtyard-gate-open');
    // Both walk through, east past the gate (column 25).
    await Promise.all([steer(A, 1, 26.5 * 16, 6000), steer(B, 1, 26.5 * 16, 6000)]);
    await Promise.all([settle(A), settle(B)]);
    const [mA, mB] = [await me(A), await me(B)];
    const roomOf = (ph: Phone): Promise<string> => ph.page.evaluate(() => (window as any).irreverents.drawn.room);
    const [rA, rB] = [await roomOf(A), await roomOf(B)];
    fact('plates-gate-through', rA === 'courtyard' && rB === 'courtyard' && mA.x > 26 * 16 && mB.x > 26 * 16, `both walked east through the gate: page A's hero at x ${Math.round(mA.x)} in ${rA}, page B's at x ${Math.round(mB.x)} in ${rB} (past ${26 * 16})`);

    // ---- the stone plate under the castle ----
    // Both back west through the open gate together (it waits 6 s after the plates lift) before it shuts.
    await Promise.all([walkInto(A, -1, 'castle-street'), walkInto(B, -1, 'castle-street')]);
    const underA = await down(A);
    const plateX = await xOn(A, 17, 0.6);
    await standAt(A, plateX, -1);
    await sleep(400);
    const one = await partOf(A, 'stone-plate');
    const grate1 = await partOf(A, 'grate');
    await shots(A, kit.shots, 'stone-plate-part-sunk');
    fact('plates-part-sunk', underA && one !== null && !one.on && one.sink !== null && one.sink > 0 && one.sink < 4 && grate1 !== null && !grate1.on, `page A (${kinds[0]}) went down into the undercroft (${underA}) and stands alone on the stone plate: drawn ${JSON.stringify(one)} (expected part-sunk: not down, sunk 1 to 3 px) and the grate ${JSON.stringify(grate1)} (expected shut)`);

    const underB = await down(B);
    if (!ALONE) await standAt(B, await xOn(B, 19, 0.5), -1);
    else await standAt(B, await xOn(B, 24), -1);
    const stoneA = await until(A, 'stone-plate', true);
    const stoneB = await until(B, 'stone-plate', true);
    const grateA = await until(A, 'grate', true);
    const grateB = await until(B, 'grate', true);
    const [sA, sB] = await Promise.all([watchOff(A, 'stone-plate', 1500), watchOff(B, 'stone-plate', 1500)]);
    fact('plates-stone', underB && stoneA && stoneB && grateA && grateB, `page B (${kinds[1]}) came down (${underB}) and stepped on beside page A${ALONE ? ' (CONTROL: kept off)' : ''}: the stone plate drawn right down on A (${stoneA}) and B (${stoneB}), the grate open on A (${grateA}) and B (${grateB})`);
    fact('plates-stone-held', sA.frames > 30 && sB.frames > 30 && sA.off === 0 && sB.off === 0 && sA.sinks.every((s) => s === 4) && sB.sinks.every((s) => s === 4), `over 1.5 s with both on it, the stone plate drawn up on page A in ${sA.off} of ${sA.frames} frames (sinks ${sA.sinks}), on page B in ${sB.off} of ${sB.frames} (sinks ${sB.sinks}) (expected none, sunk 4)`);
    await shots(B, kit.shots, 'stone-plate-down');

    // Both drop through the grate (columns 14-15, row 13) into the pocket.
    await Promise.all([steer(A, -1, await xOn(A, 14, 0.9), 4000), steer(B, -1, await xOn(B, 14, 0.9), 4000)]);
    await sleep(900);
    await Promise.all([settle(A), settle(B)]);
    const [pA, pB] = [await me(A), await me(B)];
    await shots(A, kit.shots, 'pocket');
    fact('plates-pocket', (await roomOf(A)) === 'undercroft' && (await roomOf(B)) === 'undercroft' && pA.y >= 14 * 16 && pB.y >= 14 * 16, `both walked west off the plate and dropped through the grate: page A's hero at y ${Math.round(pA.y)}, page B's at y ${Math.round(pB.y)} (the pocket is below ${14 * 16})`);
  } finally {
    await A.ctx.close();
    await B.ctx.close();
  }
}
