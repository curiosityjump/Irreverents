// Step 20 push 2 (docs/mechanisms/machines.md, "The seat"): over a real
// server and two connections, a hero gets in the ram wagon and drives it.
// a's own page drives (its body becomes the wagon: the `become` effect) and
// the server takes a's reports as they come: no effect corrects a while
// they drive. b, in the same room, sees the standing wagon go, a's body
// move as the wagon, and the barrier break. Then a leaves and comes back:
// they are still the rider (and Jump gets them out as the hero they went in
// as) or cleanly the hero with the wagon standing; never a wagon with no
// way out. Last, a kept game saved while a rode loads with the wagon
// standing where it was left and nobody in it.
// Run by `npm run check`.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { Content } from '../../src/content/types.ts';
import { GAME_PREFIX } from '../../src/net/game-code.ts';
import type { Entity, Input, SimEvent, World } from '../../src/sim/types.ts';
import { bootServer, joinAs, sleep, until } from '../lib/save-harness.ts';
import type { Booted, Player } from '../lib/save-harness.ts';
import type { ScriptCheck } from '../lib/script-checks.ts';

const ROOM = 'test-machine';
const WAGON = 'tm-wagon-2';
const DRIVER = 'tm-driver-2';

interface Pad extends Player {
  input: Input;
  events: SimEvent[];
  stopLook(): void;
}

function pad(content: Content, port: number, id: string, world: string): Pad {
  const box = { input: { x: 0, y: 0, held: [] } as Input };
  const player = joinAs(content, port, id, world, () => box.input);
  const events: SimEvent[] = [];
  let last: unknown = null;
  const look = setInterval(() => {
    const l = player.c.latest();
    if (l !== last) {
      last = l;
      events.push(...l.events);
    }
  }, 4);
  return {
    ...player,
    get input(): Input {
      return box.input;
    },
    set input(v: Input) {
      box.input = v;
    },
    events,
    stopLook: () => clearInterval(look),
  };
}

/** Puts `me` on the room's floor with its middle at `midX` (a page owns its own body). */
function put(content: Content, me: Entity, midX: number): void {
  const r = content.rooms[ROOM]!;
  const box = content.characters[me.kind]!.box;
  me.room = ROOM;
  me.x = midX - box.w / 2;
  me.y = (r.h - 1) * r.tile - box.h;
  me.vx = 0;
  me.vy = 0;
}

/** Empties the wagon's seat on the server (the scenarios prove the pull: step20-pull-driver-get-in-*). */
function emptySeat(w: World): boolean {
  const wagon = w.entities.find((e) => e.id === WAGON);
  if (!wagon) return false;
  const i = w.entities.findIndex((e) => e.id === DRIVER);
  if (i >= 0) w.entities.splice(i, 1);
  wagon.c.seat = { driver: null };
  return true;
}

async function press(p: Pad, action: string, x = 0): Promise<void> {
  p.input = { x, y: 0, held: [action] };
  await sleep(120);
  p.input = { x, y: 0, held: [] };
}

async function getIn(content: Content, server: Booted, name: string, a: Pad, failures: string[], tag: string): Promise<World | null> {
  if (!(await until(failures, `${tag}: a joins`, () => a.c.status() === 'online' && !!server.game.worlds.get(name), () => a.c.status()))) return null;
  const w = server.game.worlds.get(name)!.world;
  if (!(await until(failures, `${tag}: the wagon ${WAGON} stands in the server's world`, () => emptySeat(w), () => 'not there'))) return null;
  const T = content.rooms[ROOM]!.tile;
  // Behind the wagon (its driver faced west; it stands facing west): just east of it.
  const wagon = w.entities.find((e) => e.id === WAGON)!;
  put(content, a.c.me(), wagon.x + content.characters[wagon.kind]!.box.w + T / 2);
  await sleep(200);
  await press(a, 'interact');
  if (!(await until(failures, `${tag}: a's own page is the wagon (the become effect arrived)`, () => a.c.me().kind === 'ram-wagon', () => a.c.me().kind))) return null;
  if (!(await until(failures, `${tag}: the server's world says a rides ${WAGON}`, () => w.machines?.[WAGON]?.rider === a.c.me().id, () => JSON.stringify(w.machines ?? null)))) return null;
  return w;
}

async function drive(content: Content, server: Booted, failures: string[]): Promise<void> {
  const name = `step20-drive-${process.pid}`;
  const a = pad(content, server.port, 'a', name);
  const b = pad(content, server.port, 'b', name);
  try {
    if (!(await until(failures, 'a and b join', () => a.c.status() === 'online' && b.c.status() === 'online', () => `${a.c.status()} ${b.c.status()}`))) return;
    const T = content.rooms[ROOM]!.tile;
    put(content, b.c.me(), 30 * T);
    const w = await getIn(content, server, name, a, failures, 'drive');
    if (!w) return;
    const hero = w.machines![WAGON]!.hero;
    const aid = a.c.me().id;
    await until(failures, "b's page no longer draws the standing wagon, and draws a as the wagon", () => !b.c.others().some((e) => e.id === WAGON) && b.c.others().some((e) => e.id === aid && e.kind === 'ram-wagon'), () => JSON.stringify(b.c.others().map((e) => [e.id, e.kind])));
    // Drive west, flat out, at the barrier (column 60).
    const fxBefore = a.events.filter((e) => e.type === 'effect' && e.entity === aid).length;
    a.input = { x: -1, y: 0, held: [] };
    const bStart = b.c.others().find((e) => e.id === aid)?.x ?? 0;
    let worst = 0;
    let samples = 0;
    let broke = false;
    const end = performance.now() + 4000;
    while (performance.now() < end) {
      await sleep(25);
      const page = a.c.me();
      const there = w.entities.find((e) => e.id === aid);
      if (there) {
        worst = Math.max(worst, Math.abs(there.x - page.x));
        samples++;
      }
      if (b.events.some((e) => e.type === 'part-broken' && e.part === 'barrier')) {
        broke = true;
        break;
      }
    }
    const fxDuring = a.events.filter((e) => e.type === 'effect' && e.entity === aid).length - fxBefore;
    a.input = { x: 1, y: 0, held: [] };
    if (!broke) failures.push(`b's page never heard the barrier break while a drove at it (a's page at x ${a.c.me().x.toFixed(0)}, vx ${a.c.me().vx.toFixed(0)})`);
    if (fxDuring !== 0) failures.push(`the server sent ${fxDuring} effect(s) to a while a drove at the barrier: a's page was corrected`);
    // INTENT of the check: the server's copy is the page's latest report (a few reports behind at most), never a body of its own.
    if (samples < 10 || worst > 60) failures.push(`while a drove, the server's copy of a was up to ${worst.toFixed(0)} px from a's own page (${samples} samples): expected the page's reports, within 60 px`);
    const bEnd = b.c.others().find((e) => e.id === aid)?.x ?? 0;
    if (bStart - bEnd < 150) failures.push(`b's page drew a's wagon move ${(bStart - bEnd).toFixed(0)} px west, expected at least 150`);
    await sleep(800);
    a.input = { x: 0, y: 0, held: [] };

    // a leaves and comes back.
    a.leave();
    a.stopLook();
    await sleep(600);
    const a2 = pad(content, server.port, 'a', name);
    try {
      if (!(await until(failures, 'a comes back', () => a2.c.status() === 'online', () => a2.c.status()))) return;
      await sleep(400);
      const riding = a2.c.me().kind === 'ram-wagon';
      if (riding) {
        await press(a2, 'jump');
        await until(failures, `back as the rider, Jump gets a out as the ${hero}`, () => a2.c.me().kind === hero, () => a2.c.me().kind);
      } else if (a2.c.me().kind !== hero && !content.party.members.includes(a2.c.me().kind)) failures.push(`a came back as ${a2.c.me().kind}: neither the rider nor a hero`);
      await until(failures, "after a is back on foot, the wagon stands in the server's world with nobody in it", () => w.entities.some((e) => e.id === WAGON) && w.machines?.[WAGON]?.rider === undefined, () => JSON.stringify(w.machines?.[WAGON] ?? null));
      await until(failures, "and b's page draws it standing again", () => b.c.others().some((e) => e.id === WAGON), () => 'not drawn');
      a2.input = { x: -1, y: 0, held: [] };
      const x0 = a2.c.me().x;
      await sleep(400);
      if (a2.c.me().kind === 'ram-wagon' || Math.abs(a2.c.me().x - x0) < 10) failures.push(`after coming back a cannot walk as a hero (kind ${a2.c.me().kind}, moved ${(a2.c.me().x - x0).toFixed(0)} px)`);
    } finally {
      a2.leave();
      a2.stopLook();
    }
  } finally {
    a.leave();
    b.leave();
    a.stopLook();
    b.stopLook();
    await sleep(250);
  }
}

async function kept(content: Content, dir: string, failures: string[]): Promise<void> {
  const name = GAME_PREFIX + 'WGNR';
  let one: Booted | null = await bootServer(content, dir);
  let two: Booted | null = null;
  try {
    const a = pad(content, one.port, 'a', name);
    const w = await getIn(content, one, name, a, failures, 'kept game');
    let at: number | undefined;
    if (w) {
      a.input = { x: -1, y: 0, held: [] };
      await sleep(600);
      a.input = { x: 0, y: 0, held: [] };
      await sleep(300);
      at = w.machines?.[WAGON]?.at?.x;
    }
    a.leave();
    a.stopLook();
    const o = one;
    await until(failures, 'kept game: forgotten in memory once a has left', () => !o.game.worlds.has(name), () => 'still there', 6000);
    await one.stop();
    one = null;
    if (!w) return;
    two = await bootServer(content, dir);
    const b = pad(content, two.port, 'b', name);
    try {
      const t = two;
      if (!(await until(failures, 'kept game: b joins it after the restart', () => b.c.status() === 'online' && !!t.game.worlds.get(name), () => b.c.status()))) return;
      const w2 = t.game.worlds.get(name)!.world;
      await until(failures, 'kept game: the wagon stands again with nobody in it', () => w2.entities.some((e) => e.id === WAGON) && w2.machines?.[WAGON]?.rider === undefined, () => JSON.stringify(w2.machines?.[WAGON] ?? null));
      const wagon = w2.entities.find((e) => e.id === WAGON);
      if (wagon && at !== undefined && Math.abs(wagon.x - at) > 40) failures.push(`kept game: the wagon stands at x ${wagon.x.toFixed(0)}, not where it was left (${at.toFixed(0)})`);
    } finally {
      b.leave();
      b.stopLook();
    }
  } finally {
    await one?.stop();
    await two?.stop();
  }
}

const check: ScriptCheck = {
  id: 'step20-machine',
  gate: null,
  proves:
    "over a real server and two connections, a hero gets in the ram wagon and drives it from their own page: no effect corrects them while they drive and the server's copy follows their reports; the other connection sees the standing wagon go, the rider move as the wagon and the barrier break; leaving and coming back, they are still the rider (Jump gets them out as the hero they went in as) or cleanly the hero, never a wagon with no way out; and a kept game saved while they rode loads with the wagon standing where it was left, nobody in it",
  async run(content: Content): Promise<string[]> {
    const failures: string[] = [];
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'irreverents-step20-'));
    let server: Booted | null = null;
    try {
      server = await bootServer(content, dir);
      await drive(content, server, failures);
      await server.stop();
      server = null;
      await kept(content, dir, failures);
    } finally {
      await server?.stop();
      fs.rmSync(dir, { recursive: true, force: true });
    }
    return failures;
  },
};
export default check;
