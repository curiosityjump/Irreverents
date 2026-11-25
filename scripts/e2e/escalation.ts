// The escalating guard response's phone facts and shots (brief
// handoff-prompts/escalating-guard-response.md, push 1). Local only: the street
// at levels 4 and 5 takes a ninety-second fight to reach, too long and too
// timing-bound to play by touch on every run, so the world is taken from the
// level's own scenario (step4-tier-level4-elite-row, -level5-keeps-coming) at
// the tick its row walks in, saved as a kept game into a fresh store, and a
// phone page joins that game (`?room=game-<CODE>`: no start screen) and walks
// east from the throne room into the street by touch. What it then DRAWS is
// what is counted: the pips (five slots, four or five lit) and the watch.
//
// DRAFT: a world taken from a scenario is the server's own simulation at that
// tick (the scenario harness runs the same step()); only the hero is left out,
// as every save does. The fact's control: E2E_ESCALATION_ROWS=3 saves the
// street with the table cut to three rows (the level never passes 3).
//
// Usage alone (shots): node scripts/e2e/escalation.ts [out-dir]
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { phone, settle } from '../lib/e2e-touch.ts';
import type { Kit } from '../lib/e2e-touch.ts';
import { generateRegistries, root } from '../lib/registries.ts';

/* eslint-disable @typescript-eslint/no-explicit-any */
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/** The two levels shown: the scenario, the tick a little after its row walks in, the game code it is saved under. */
const LEVELS: { level: number; scenario: string; tick: number; code: string; town?: boolean }[] = [
  { level: 4, scenario: 'step4-tier-level4-elite-row', tick: 4440, code: 'FRKW' },
  { level: 5, scenario: 'step4-tier-level5-keeps-coming', tick: 5140, code: 'FRKX' },
  // The escalating guard response, push 2 ("the pips crossing doors"): the courtyard at 5 (a report there), the street
  // at 4; a page in the street draws the town's 5, a level reached in a room it is not in. Control E2E_ESCALATION_TOWN=off
  // takes the courtyard out of the saved world.alerts: the page then draws the street's own 4.
  { level: 5, scenario: 'step4-tier-town-courtyard', tick: 6600, code: 'FRKY', town: true },
];

/** Saves each level's world into a new store directory on its own device (a tmpfs, as the server's volume rule asks). */
async function saveLevels(rows?: number): Promise<string> {
  generateRegistries();
  const { loadContent, loadScenarios } = await import('../lib/content-files.ts');
  const { simulate } = await import('../../src/scenarios/run.ts');
  const { openStore } = await import('../../src/server/store.ts');
  const { createSaves } = await import('../../src/server/saves.ts');
  const loaded = loadContent();
  const content = loaded.content as any;
  if (rows) content.dispatch['castle-street'].rows = content.dispatch['castle-street'].rows.slice(0, rows);
  const base = fs.existsSync('/dev/shm') ? '/dev/shm' : os.tmpdir();
  const dir = fs.mkdtempSync(path.join(base, 'irr-escalation-'));
  const saves = createSaves(openStore(dir), { content, commit: 'escalation-shots', problem: (m: string) => console.log('save problem:', m) });
  for (const l of LEVELS) {
    const s = loadScenarios(content).scenarios.find((x: any) => x.id === l.scenario)!;
    const rec = simulate(s, content);
    const world = structuredClone(rec.history[l.tick]) as any;
    if (l.town && process.env.E2E_ESCALATION_TOWN === 'off') delete world.alerts?.courtyard;
    saves.save(l.code, world);
  }
  return dir;
}

function freePort(): Promise<number> {
  return new Promise((resolve) => {
    const s = net.createServer();
    s.listen(0, () => {
      const port = (s.address() as net.AddressInfo).port;
      s.close(() => resolve(port));
    });
  });
}

/** What the page drew: the pips (`level`, of the area's most), and the watch in the street by kind. */
const looked = (page: any): Promise<{ room: string; level: number; guards: number; armoured: number; trike: number }> =>
  page.evaluate(() => {
    const d = (window as any).irreverents.drawn;
    const n = (k: string): number => d.entities.filter((e: any) => e.kind === k).length;
    return { room: d.room, level: d.alert?.level ?? 0, guards: n('guard'), armoured: n('armoured-guard'), trike: n('guard-trike') };
  });

/** Walks the page east (the stick held right) until it is in the street, or `ms` passes. */
async function intoStreet(ph: any, ms = 12000): Promise<boolean> {
  const stick = await ph.page.evaluate(() => {
    const el = document.querySelector('[data-stick]');
    if (!el) return null;
    const b = el.getBoundingClientRect();
    return { x: Math.round(b.left + b.width * 0.9), y: Math.round(b.top + b.height / 2) };
  });
  if (!stick) return false;
  await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...stick, id: 1 }] });
  const ok = await ph.page.waitForFunction(() => (window as any).irreverents.drawn.room === 'castle-street', null, { polling: 'raf', timeout: ms }).then(
    () => true,
    () => false,
  );
  // A few steps on into the street, so the edge of the view is past the door.
  await sleep(500);
  await ph.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  return ok;
}

export interface EscalationKit {
  browser: any;
  devices: any;
  out: string;
  fact: (name: string, ok: boolean, detail: string) => void;
  errors: string[];
  shots?: boolean;
}

/**
 * The facts: `escalation-level4` (in the street, the page draws 4 pips lit, at least one armoured guard and the
 * watch's trike), `escalation-level5` (5 pips lit, at least two armoured guards). Each starts its own local server
 * on a store holding the two saved levels.
 */
export async function escalationFacts(kit: EscalationKit): Promise<void> {
  const rows = Number(process.env.E2E_ESCALATION_ROWS) || undefined;
  const dir = await saveLevels(rows);
  const port = await freePort();
  const child = spawn(process.execPath, [path.join(root, 'dist/server.cjs')], { env: { ...process.env, PORT: String(port), RAILWAY_VOLUME_MOUNT_PATH: dir, RAILWAY_VOLUME_NAME: 'escalation-local' }, stdio: ['ignore', 'ignore', 'inherit'] });
  const base = `http://127.0.0.1:${port}`;
  try {
    for (let i = 0; i < 50; i++) {
      if (await fetch(`${base}/healthz`).then((r) => r.ok, () => false)) break;
      await sleep(100);
    }
    const health = await fetch(`${base}/healthz`).then((r) => r.json(), () => null);
    if (!health?.store?.lasting) kit.fact('escalation-store', false, `the local server's store does not last (${JSON.stringify(health?.store)}): the saved levels cannot load`);
    const k: Kit = { browser: kit.browser, devices: kit.devices, base, out: kit.out, fact: kit.fact, errors: kit.errors };
    for (const l of LEVELS) {
      const ph = await phone(k, `${base}/?room=game-${l.code}`, `escalation-${l.level}`);
      const inStreet = await intoStreet(ph);
      await settle(ph);
      // Over 2 s, the most of each the page draws (people walk in and out of view).
      const best = { level: 0, guards: 0, armoured: 0, trike: 0 };
      const t0 = Date.now();
      while (Date.now() - t0 < 2000) {
        const s = await looked(ph.page);
        if (s.room === 'castle-street') {
          best.level = Math.max(best.level, s.level);
          best.guards = Math.max(best.guards, s.guards);
          best.armoured = Math.max(best.armoured, s.armoured);
          best.trike = Math.max(best.trike, s.trike);
        }
        await sleep(100);
      }
      if (l.town) {
        kit.fact('escalation-town', inStreet && best.level === l.level, `in the street (${inStreet}), its own alert 4, with the courtyard at 5 by a report there, the page drew ${best.level} pip(s) lit (expected the town's ${l.level})`);
        await ph.ctx.close();
        continue;
      }
      if (kit.shots) {
        for (const s of [{ w: 844, h: 390 }, { w: 390, h: 664 }]) {
          await ph.page.setViewportSize({ width: s.w, height: s.h });
          await sleep(400);
          await ph.page.screenshot({ path: path.join(kit.out, `level${l.level}-${s.w}x${s.h}.png`) });
        }
      }
      const ok = inStreet && best.level === l.level && best.armoured >= (l.level === 4 ? 1 : 2) && (l.level !== 4 || best.trike >= 1);
      kit.fact(`escalation-level${l.level}`, ok, `in the street (${inStreet}) the page drew ${best.level} pip(s) lit (expected ${l.level}), ${best.guards} guard(s), ${best.armoured} armoured guard(s)${l.level === 4 ? ` and ${best.trike} trike(s) (expected 1 or more)` : ''}`);
      await ph.ctx.close();
    }
  } finally {
    // Stopped, the server saves the games it holds: let it finish before its store goes.
    const gone = new Promise((r) => child.once('exit', r));
    child.kill();
    await Promise.race([gone, sleep(5000)]);
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

// Alone: the shots, into docs/plan/step-4-shots/escalation/ unless another directory is given.
if (import.meta.url === `file://${process.argv[1]}`) {
  const { chromium, devices } = createRequire(import.meta.url)('playwright') as any;
  const out = path.resolve(process.argv[2] ?? path.join(root, 'docs/plan/step-4-shots/escalation'));
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  const errors: string[] = [];
  let bad = 0;
  await escalationFacts({
    browser,
    devices,
    out,
    errors,
    shots: true,
    fact: (name, ok, detail) => {
      if (!ok) bad++;
      console.log(ok ? 'ok  ' : 'FAIL', name, '-', detail);
    },
  });
  for (const e of errors) console.log('page error:', e);
  await browser.close();
  process.exit(bad || errors.length ? 1 : 0);
}
