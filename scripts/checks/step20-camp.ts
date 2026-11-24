// Step 20 builder B push 2 (docs/mechanisms/outposts.md, "Step 20: the
// wagon in the camp"): the Bandit Camp's ram wagon over a real server and
// two connections, in a kept game. a gets in the wagon standing empty on the
// entry step and drives it east from their own page; b, standing in the
// camp's market, sees the standing wagon go, a's body move as the wagon, and
// hears the timber barricade break, which the server's world records. Then
// everyone leaves, the server is rebuilt on the same store, and the kept
// game loads with the barricade still open (INTENT, nothing resets: a broken
// barricade stays broken in a kept game).
// Run by `npm run check`.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { Content } from '../../src/content/types.ts';
import { GAME_PREFIX } from '../../src/net/game-code.ts';
import { partState } from '../../src/sim/room-state.ts';
import type { Entity, Input, SimEvent, World } from '../../src/sim/types.ts';
import { bootServer, joinAs, sleep, until } from '../lib/save-harness.ts';
import type { Booted, Player } from '../lib/save-harness.ts';
import type { ScriptCheck } from '../lib/script-checks.ts';

const ROOM = 'outpost';
const WAGON = 'camp-wagon';
const BARRICADE = 'camp-barricade';

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

/** Puts `me` (a page owns its own body) with its middle at `midX` and its feet at `feetY`, in the camp. */
function put(content: Content, me: Entity, midX: number, feetY: number): void {
  const box = content.characters[me.kind]!.box;
  me.room = ROOM;
  me.x = midX - box.w / 2;
  me.y = feetY - box.h;
  me.vx = 0;
  me.vy = 0;
}

function broken(w: World): boolean {
  return partState(w, ROOM, BARRICADE).broken === true;
}

async function run(content: Content, dir: string, failures: string[]): Promise<void> {
  const name = GAME_PREFIX + 'CAMP';
  const T = content.rooms[ROOM]!.tile;
  let one: Booted | null = await bootServer(content, dir);
  let two: Booted | null = null;
  try {
    const a = pad(content, one.port, 'a', name);
    const b = pad(content, one.port, 'b', name);
    let drove = false;
    try {
      const o = one;
      if (!(await until(failures, 'a and b join the kept game', () => a.c.status() === 'online' && b.c.status() === 'online' && !!o.game.worlds.get(name), () => `${a.c.status()} ${b.c.status()}`))) return;
      const w = o.game.worlds.get(name)!.world;
      if (!(await until(failures, `the wagon ${WAGON} stands in the camp, empty, in the server's world`, () => w.entities.some((e) => e.id === WAGON && e.room === ROOM && e.c.seat?.driver === null), () => JSON.stringify(w.entities.find((e) => e.id === WAGON)?.c.seat ?? 'not there')))) return;
      if (broken(w)) failures.push('the barricade is already broken before anyone drove at it');
      const wagon = w.entities.find((e) => e.id === WAGON)!;
      const wb = content.characters[wagon.kind]!.box;
      // b in the market, on the floor east of the second stall; a on the entry step, over the wagon.
      put(content, b.c.me(), 70 * T, (content.rooms[ROOM]!.h - 1) * T);
      put(content, a.c.me(), wagon.x + wb.w / 2, wagon.y + wb.h);
      await until(failures, "b's page draws the standing wagon", () => b.c.others().some((e) => e.id === WAGON), () => 'not drawn');
      await sleep(250);
      a.input = { x: 0, y: 0, held: ['interact'] };
      await sleep(120);
      a.input = { x: 0, y: 0, held: [] };
      if (!(await until(failures, "a's own page is the wagon (GET IN; the become effect arrived)", () => a.c.me().kind === 'ram-wagon', () => a.c.me().kind))) return;
      const aid = a.c.me().id;
      await until(failures, "b's page no longer draws the standing wagon, and draws a as the wagon", () => !b.c.others().some((e) => e.id === WAGON) && b.c.others().some((e) => e.id === aid && e.kind === 'ram-wagon'), () => JSON.stringify(b.c.others().map((e) => [e.id, e.kind])));
      const bStart = b.c.others().find((e) => e.id === aid)?.x ?? 0;
      a.input = { x: 1, y: 0, held: [] };
      drove = await until(failures, "b's page hears the timber barricade break while a drives east through the camp", () => b.events.some((e) => e.type === 'part-broken' && e.part === BARRICADE), () => `a's page at x ${a.c.me().x.toFixed(0)}, vx ${a.c.me().vx.toFixed(0)}`, 12000);
      a.input = { x: 0, y: 0, held: [] };
      const bEnd = b.c.others().find((e) => e.id === aid)?.x ?? 0;
      if (bEnd - bStart < 50 * T) failures.push(`b's page drew a's wagon move ${(bEnd - bStart).toFixed(0)} px east, expected the length of the camp (at least ${50 * T})`);
      if (drove && !broken(w)) failures.push("b heard the barricade break but the server's world does not record it broken");
      await sleep(300);
      a.input = { x: 0, y: 0, held: ['jump'] };
      await sleep(120);
      a.input = { x: 0, y: 0, held: [] };
      await until(failures, 'Jump gets a out of the wagon on foot', () => a.c.me().kind !== 'ram-wagon', () => a.c.me().kind);
    } finally {
      a.leave();
      b.leave();
      a.stopLook();
      b.stopLook();
    }
    const o = one;
    await until(failures, 'the kept game is forgotten in memory once everyone has left', () => !o.game.worlds.has(name), () => 'still there', 6000);
    await one.stop();
    one = null;
    if (!drove) return;
    two = await bootServer(content, dir);
    const c = pad(content, two.port, 'b', name);
    try {
      const t = two;
      if (!(await until(failures, 'b joins the kept game after the restart', () => c.c.status() === 'online' && !!t.game.worlds.get(name), () => c.c.status()))) return;
      const w2 = t.game.worlds.get(name)!.world;
      await sleep(300);
      if (!broken(w2)) failures.push('after the restart the kept game has the barricade standing again: a broken barricade must stay broken (INTENT, nothing resets)');
    } finally {
      c.leave();
      c.stopLook();
    }
  } finally {
    await one?.stop();
    await two?.stop();
  }
}

const check: ScriptCheck = {
  id: 'step20-camp',
  gate: null,
  proves:
    "the Bandit Camp's ram wagon over a real server and two connections, in a kept game: a gets in the wagon standing empty on the camp's entry step and drives it east from their own page; b, standing in the camp's market, sees the standing wagon go and a's body move as the wagon the length of the camp, and hears the timber barricade break, which the server's world records; Jump gets a out on foot; and once everyone has left and the server is rebuilt on the same store, the kept game loads with the barricade still broken",
  async run(content: Content): Promise<string[]> {
    const failures: string[] = [];
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'irreverents-step20-camp-'));
    try {
      await run(content, dir, failures);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
    return failures;
  },
};
export default check;
