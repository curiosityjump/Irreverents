// Step 23 (docs/mechanisms/weapons.md), beyond the scenarios: a weapon over
// the real network layer. A real server on a free port and two headless
// players running the page's own network client (src/net/client.ts), as
// scripts/checks/step9-powers.ts does. Run by `npm run check`.
//
// Why it exists: a page simulates its own character from its own `c` and
// never gets the server's `c` for it (docs/mechanisms/network.md, "Traps"),
// and loose weapons are only in the server's world. A scenario (one world)
// passes where a phone would fail; this check is the phone's view.
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import WebSocket from 'ws';
import type { Content } from '../../src/content/types.ts';
import { createNetClient } from '../../src/net/client.ts';
import type { NetClient } from '../../src/net/client.ts';
import { playerEntityId } from '../../src/net/protocol.ts';
import { attachGame } from '../../src/server/game.ts';
import { launch, markImpact } from '../../src/sim/body-state.ts';
import { numbersOf } from '../../src/sim/powers.ts';
import { systems } from '../../src/sim/registry.ts';
import type { Entity, StepContext, System } from '../../src/sim/types.ts';
import { makeLoose } from '../../src/sim/weapons.ts';
import type { ScriptCheck } from '../lib/script-checks.ts';

const WEAPON = 'sword';

const check: ScriptCheck = {
  id: 'step23-weapons',
  gate: null,
  proves:
    "a weapon over the real network: a sword lying at player a's feet in the server's world, a's Use press picks it up, after which a's own page holds it (its own numbers have the sword's reach) and b's page sees it in a's hand; after b's hard blow on the server a's own page holds none, b's page sees none on a, and both pages draw the sword lying at one place; b's Use press there takes it and a sees it in b's hand; control: the server writing the sword onto b's copy without the effect leaves b's own page without it",
  async run(content: Content): Promise<string[]> {
    const failures: string[] = [];
    const weapon = content.weapons?.[WEAPON];
    if (!weapon) return [`there is no weapon "${WEAPON}" (content/weapons/) to check`];
    const server = http.createServer();
    const game = attachGame(server, { content, commit: 'check', startedAt: new Date().toISOString() });
    await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));
    const port = (server.address() as AddressInfo).port;
    const worldName = `check-weapons-${process.pid}`;

    const sockets = new Map<string, WebSocket>();
    const make = (player: string): NetClient =>
      createNetClient({
        content,
        player,
        world: worldName,
        now: () => performance.now(),
        connect(h) {
          const ws = new WebSocket(`ws://127.0.0.1:${port}/ws`);
          sockets.set(player, ws);
          ws.on('open', () => h.open());
          ws.on('message', (d) => h.message(d.toString()));
          ws.on('close', () => h.close());
          ws.on('error', () => h.close());
          return { send: (t) => ws.readyState === ws.OPEN && ws.send(t), close: () => ws.close() };
        },
      });
    const a = make('a');
    const b = make('b');
    const still = { x: 0, y: 0, held: [] as string[] };
    let inputA = still;
    let inputB = still;
    const frames = setInterval(() => {
      a.update(inputA);
      b.update(inputB);
    }, 1000 / 60);

    const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
    const until = async (what: string, cond: () => boolean, seen: () => string, ms = 3000): Promise<boolean> => {
      const end = performance.now() + ms;
      while (performance.now() < end) {
        if (cond()) return true;
        await sleep(10);
      }
      failures.push(`${what}: not within ${ms} ms (${seen()})`);
      return false;
    };
    const press = async (set: (i: typeof still) => void): Promise<void> => {
      set({ x: 0, y: 0, held: ['interact'] });
      await sleep(150);
      set(still);
      await sleep(100);
    };
    const aId = playerEntityId('a');
    const bId = playerEntityId('b');
    const held = (e: Entity | undefined): string => e?.c.weapon?.id ?? 'none';
    const lying = (list: Entity[]): Entity[] => list.filter((e) => e.c.loose?.weapon === WEAPON);
    /** A throwaway system: does `act` once, in the server's world only (a page's own world holds one player). */
    const once = (id: string, act: (ctx: StepContext) => void, order = 905): System => {
      let armed = true;
      return {
        id,
        order,
        run(ctx) {
          if (!armed || ctx.world.entities.filter((e) => e.player !== null).length < 2) return;
          armed = false;
          act(ctx);
        },
      };
    };
    /** Lays the sword still at a body's feet, free to pick up at once. */
    const layAt = (ctx: StepContext, who: string): void => {
      const at = ctx.world.entities.find((e) => e.id === who)!;
      const box = content.characters[at.kind]!.box;
      // Any sword already lying (a source's, the one knocked loose) goes, so the press can mean only this one.
      ctx.world.entities = ctx.world.entities.filter((e) => !e.c.loose);
      makeLoose(ctx, weapon, at.room, at.x + box.w / 2, at.y + box.h, { from: `check:${who}` });
    };

    try {
      if (!(await until('both players join', () => a.status() === 'online' && b.status() === 'online' && !!game.worlds.get(worldName)?.world.entities.find((e) => e.id === bId), () => `a ${a.status()}, b ${b.status()}`))) return failures;
      const gw = game.worlds.get(worldName)!;
      await sleep(300);
      const reachBare = numbersOf(content, a.me()).attackReach ?? 0;

      // 1. The sword lies at a's feet in the server's world; a's Use press picks it up there (systems/weapon-take.ts).
      const lay = once('throwaway-lay-sword-a', (ctx) => layAt(ctx, aId));
      systems.push(lay);
      try {
        await until("the server's world has the sword lying at a's feet", () => lying(gw.world.entities).some((e) => e.c.loose!.from === `check:${aId}`), () => `${lying(gw.world.entities).map((e) => `${e.room} ${e.x.toFixed(0)}`).join(', ')} lying; a in ${gw.world.entities.find((e) => e.id === aId)?.room}`);
      } finally {
        systems.splice(systems.indexOf(lay), 1);
      }
      await until("a's page draws the sword lying", () => lying(a.others()).length === 1, () => `a's page draws ${lying(a.others()).length}; others: ${a.others().map((e) => e.kind).join(',')}`);
      await press((i) => (inputA = i));
      await until("the server's world has a holding the sword", () => held(gw.world.entities.find((e) => e.id === aId)) === WEAPON, () => `server's a holds ${held(gw.world.entities.find((e) => e.id === aId))}`);
      await until("a's own page holds the sword (its own world, where its verbs run)", () => held(a.me()) === WEAPON, () => `a's page holds ${held(a.me())}`);
      await until("b's page sees the sword in a's hand", () => held(b.others().find((e) => e.id === aId)) === WEAPON, () => `b's page sees a holding ${held(b.others().find((e) => e.id === aId))}`);
      await until('no sword is drawn lying on either page', () => lying(a.others()).length === 0 && lying(b.others()).length === 0, () => 'a sword is still drawn lying');
      const reachHeld = numbersOf(content, a.me()).attackReach ?? 0;
      if (reachHeld !== reachBare + (weapon.hit.add.attackReach ?? 0)) failures.push(`a's own page reaches ${reachHeld} with the sword, ${reachBare} without: expected ${reachBare + (weapon.hit.add.attackReach ?? 0)}`);

      // 2. A hard blow on the server, as verbs/attack.ts lands one: b's hit sends a off at 300 px/s
      // (systems/weapon-loose.ts). It reaches a's page as a `push`, so only the `weapon` effect can take the sword off a's page.
      const knock = once('throwaway-hard-blow', (ctx) => {
        const e = ctx.world.entities.find((x) => x.id === aId)!;
        ctx.emit('hit', { by: bId, target: aId, player: 'b' });
        launch(ctx, e, 300, -120, bId, [bId]);
        markImpact(ctx, e, e.x, e.y, 300);
      }, 300); // before weapon-loose (543), which reads this tick's `hit`
      systems.splice(systems.findIndex((s) => s.order > knock.order), 0, knock);
      try {
        await until("the server's world has a holding nothing and the sword lying loose", () => held(gw.world.entities.find((e) => e.id === aId)) === 'none' && lying(gw.world.entities).length === 1, () => `server's a holds ${held(gw.world.entities.find((e) => e.id === aId))}, ${lying(gw.world.entities).length} lying`);
        await until("a's own page holds no weapon after the hard hit", () => held(a.me()) === 'none', () => `a's page holds ${held(a.me())}`);
        await until("b's page sees no weapon on a", () => held(b.others().find((e) => e.id === aId)) === 'none', () => `b's page sees a holding ${held(b.others().find((e) => e.id === aId))}`);
      } finally {
        systems.splice(systems.indexOf(knock), 1);
      }
      // Both pages draw it lying at one place once it has come to rest.
      await sleep(1500);
      const la = lying(a.others())[0];
      const lb = lying(b.others())[0];
      if (!la || !lb) failures.push(`after the blow the sword is drawn lying on a's page (${!!la}) and b's (${!!lb}), expected both`);
      else if (Math.abs(la.x - lb.x) > 2 || Math.abs(la.y - lb.y) > 2) failures.push(`a's page draws the sword lying at ${la.x.toFixed(1)},${la.y.toFixed(1)}, b's at ${lb.x.toFixed(1)},${lb.y.toFixed(1)}: expected one place`);

      // 3. b takes it: it is laid at b's feet (b's own page owns where b stands) and b presses Use.
      const layB = once('throwaway-lay-sword-b', (ctx) => layAt(ctx, bId));
      systems.push(layB);
      try {
        await until("the server's world has the sword lying at b's feet", () => lying(gw.world.entities).some((e) => e.c.loose!.from === `check:${bId}`), () => `${lying(gw.world.entities).length} lying`);
      } finally {
        systems.splice(systems.indexOf(layB), 1);
      }
      await sleep(200);
      await press((i) => (inputB = i));
      await until("b's own page holds the sword", () => held(b.me()) === WEAPON, () => `b's page holds ${held(b.me())}`);
      await until("a's page sees the sword in b's hand", () => held(a.others().find((e) => e.id === bId)) === WEAPON, () => `a's page sees b holding ${held(a.others().find((e) => e.id === bId))}`);

      // 4. Control: the server writes the sword onto a's copy directly, no effect.
      // The server's own copy (and so b's view of a) has it; a's own page never does.
      const direct = once('throwaway-direct-weapon', (ctx) => {
        const e = ctx.world.entities.find((x) => x.id === aId)!;
        e.c.weapon = { id: WEAPON, by: e.kind };
      });
      systems.push(direct);
      try {
        await until("control: b's page sees the sword written onto a", () => held(b.others().find((e) => e.id === aId)) === WEAPON, () => `b's page sees a holding ${held(b.others().find((e) => e.id === aId))}`);
        await sleep(1000);
        if (held(a.me()) !== 'none') failures.push(`control: with no effect sent, a's own page holds ${held(a.me())}, expected none (the check could not tell the effect from a copy of c)`);
      } finally {
        systems.splice(systems.indexOf(direct), 1);
      }

      a.leave();
      b.leave();
    } catch (err) {
      failures.push(`the check itself crashed: ${(err as Error).stack ?? String(err)}`);
    } finally {
      clearInterval(frames);
      for (const ws of sockets.values()) ws.terminate();
      game.close();
      server.closeAllConnections();
      await new Promise<void>((done) => server.close(() => done()));
    }
    return failures;
  },
};
export default check;
