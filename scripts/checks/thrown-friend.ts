// Step 5, "Thrown friend" (docs/mechanisms/network.md, "A flying own
// character"): a real server and two headless players running the page's own
// network client. A throws B into the throne room's heavy crate while B's
// reports reach the server only 10 a second (bunched, as on a loaded phone),
// so the server alone would see B cross the crate between two reports and
// miss it. Run by `npm run check`.
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import WebSocket from 'ws';
import type { Content } from '../../src/content/types.ts';
import { createNetClient } from '../../src/net/client.ts';
import type { NetClient } from '../../src/net/client.ts';
import { playerEntityId } from '../../src/net/protocol.ts';
import { attachGame } from '../../src/server/game.ts';
import { heldBy } from '../../src/sim/effects.ts';
import type { Entity, Input } from '../../src/sim/types.ts';
import { removeEntity } from '../../src/sim/world.ts';
import type { ScriptCheck } from '../lib/script-checks.ts';

const check: ScriptCheck = {
  id: 'thrown-friend',
  gate: null,
  proves: "a friend thrown into a heavy crate bounces off it on their own page as on the thrower's, both pages draw them come to rest in the same place, and the crate is knocked on the server, even when the friend's reports reach the server only 10 a second",
  async run(content: Content): Promise<string[]> {
    const failures: string[] = [];
    if (content.game.startRoom !== 'throne-room' || !content.characters['crate-heavy']) return [];
    const server = http.createServer();
    const game = attachGame(server, { content, commit: 'check', startedAt: new Date().toISOString() });
    await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));
    const port = (server.address() as AddressInfo).port;
    const worldName = `check-thrown-${process.pid}`;
    const inputs: Record<string, Input> = {};
    /** Only every third report of b's reaches the server. */
    let thin = false;
    let reports = 0;
    const make = (player: string): NetClient => {
      inputs[player] = { x: 0, y: 0, held: [] };
      return createNetClient({
        content,
        player,
        world: worldName,
        now: () => performance.now(),
        connect(h) {
          const ws = new WebSocket(`ws://127.0.0.1:${port}/ws`);
          ws.on('open', () => h.open());
          ws.on('message', (d) => h.message(d.toString()));
          ws.on('close', () => h.close());
          ws.on('error', () => h.close());
          return {
            send: (t) => {
              if (player === 'b' && thin && t.startsWith('{"t":"me"') && reports++ % 3 !== 0) return;
              if (ws.readyState === ws.OPEN) ws.send(t);
            },
            close: () => ws.close(),
          };
        },
      });
    };
    const a = make('a');
    await new Promise((r) => setTimeout(r, 150));
    const b = make('b');
    // Each frame as a page's loop does it: step, then draw the others (what is drawn moves a lent body's hand-back on).
    const frames = setInterval(() => {
      a.update(inputs.a!);
      b.update(inputs.b!);
      a.others();
      b.others();
    }, 1000 / 60);
    const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
    const until = async (cond: () => boolean, ms: number): Promise<boolean> => {
      const end = performance.now() + ms;
      while (performance.now() < end) {
        if (cond()) return true;
        await sleep(10);
      }
      return false;
    };
    const aId = playerEntityId('a');
    const bId = playerEntityId('b');
    const n = (v: number | undefined): string => (v === undefined ? '?' : v.toFixed(0));
    try {
      if (!(await until(() => !!b.others().find((e) => e.id === aId) && !!a.others().find((e) => e.id === bId), 3000))) {
        failures.push('the two players never saw each other');
        return failures;
      }
      const gw = game.worlds.get(worldName)!;
      if (a.me().kind !== 'grappler') return [`player a should be seated as the grappler (who can lift a friend), but is the ${a.me().kind}`];
      const heavy = gw.world.entities.find((e) => e.kind === 'crate-heavy' && e.room === 'throne-room');
      if (!heavy) return ['the throne room has no heavy crate'];
      // Nothing else between B and the heavy crate.
      for (const e of [...gw.world.entities]) if (e.player === null && e.kind === 'crate') removeEntity(gw.world, e.id);
      const hw = content.characters['crate-heavy']!.box.w;
      const bBox = content.characters[b.me().kind]!.box;
      const aBox = content.characters.grappler!.box;
      const feet = heavy.y + content.characters['crate-heavy']!.box.h;
      // The pages own their characters' motion: put them where the throw starts.
      const place = (c: NetClient, x: number, h: number): void => {
        Object.assign(c.me(), { x, y: feet - h, vx: 0, vy: 0, facing: -1 });
      };
      // Near (the server, which flies B until B's page has the throw, meets the crate first) and far (B's page owns the flight by then).
      const x0 = heavy.x;
      for (const gap of [29, 90]) {
        // The crate back where the room has it, at rest (the first throw knocked it).
        const at = gw.world.entities.find((e) => e.id === heavy.id)!;
        Object.assign(at, { x: x0, vx: 0, vy: 0 });
        delete at.c.flying;
        await sleep(300);
        const heavyFrom = at.x;
        place(b, heavyFrom + hw + gap, bBox.h);
        place(a, heavyFrom + hw + gap + 6, aBox.h);
        await sleep(400);
        inputs.a = { x: 0, y: 0, held: ['grab'] };
        const held = await until(() => heldBy(gw.world.entities.find((e) => e.id === bId)!) === aId, 1500);
        inputs.a = { x: 0, y: 0, held: [] };
        if (!held) {
          failures.push(`a pressed Grab 6 px behind b, facing it, and the server never had b held (a at ${n(a.me().x)}, b at ${n(b.me().x)})`);
          return failures;
        }
        await sleep(400);
        const was = { met: b.stats.met, first: b.stats.metFirst, echoes: b.stats.echoes };
        thin = true;
        inputs.a = { x: 0, y: 0, held: ['attack'] };
        await sleep(120);
        inputs.a = { x: 0, y: 0, held: [] };
        // B's own page: furthest west it drew itself, and where it came to rest.
        let west = Infinity;
        const end = performance.now() + 2500;
        while (performance.now() < end) {
          if (!heldBy(b.me())) west = Math.min(west, b.me().x);
          await sleep(5);
        }
        thin = false;
        await sleep(1200);
        const onB = b.me();
        const onA = a.others().find((e) => e.id === bId) as Entity | undefined;
        const crate = gw.world.entities.find((e) => e.id === heavy.id)!;
        const right = heavyFrom + hw;
        const what = `b thrown west from ${gap} px east of the heavy crate (x ${n(heavyFrom)} to ${n(right)})`;
        if (west === Infinity) failures.push(`${what}: b's own page never drew b out of a's hands`);
        // A flying body meets another once they overlap, so it is drawn up to a tick's flight (about 10 px) inside it.
        else if (west < right - 12) failures.push(`${what}: b's own page drew b fly into it and on, west to x ${n(west)}: it should bounce off it`);
        else if (west > right + 2) failures.push(`${what}: b's own page drew b stop short of it, at x ${n(west)}: it should reach it`);
        if (!onA || Math.abs(onA.x - onB.x) > 4) failures.push(`${what}: afterwards b's own page has b at rest at x ${n(onB.x)} and a's page draws b at x ${n(onA?.x)}: they should agree within 4 px`);
        if (Math.abs(crate.x - heavyFrom) < 4) failures.push(`${what}: the crate was not knocked on the server (x ${n(heavyFrom)}, now ${n(crate.x)})`);
        console.log(`      (thrown-friend) ${what}: b's page drew b furthest west at ${n(west)}, at rest at ${n(onB.x)}; a's page at ${n(onA?.x)}; the crate is now at ${n(crate.x)}; b's page met ${b.stats.met - was.met} body itself, took ${b.stats.metFirst - was.first} meeting the server saw first, set aside ${b.stats.echoes - was.echoes} server push(es)`);
        await sleep(300);
      }
    } finally {
      clearInterval(frames);
      a.leave();
      b.leave();
      game.close?.();
      server.closeAllConnections();
      await new Promise<void>((r) => server.close(() => r()));
    }
    return failures;
  },
};
export default check;
