// Step 9 (docs/mechanisms/powers.md), beyond the scenarios: a power over the
// real network layer. A real server on a free port and two headless players
// running the page's own network client (src/net/client.ts), as
// scripts/checks/step11-cantina.ts does. Run by `npm run check`.
//
// Why it exists: a page simulates its own character from its own `c` and
// never gets the server's `c` for it (docs/mechanisms/network.md, "Traps"),
// and the orb is only in the server's world. So a scenario (one world) passes
// where a phone would fail; this check is the phone's view.
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import WebSocket from 'ws';
import type { Content } from '../../src/content/types.ts';
import { createNetClient } from '../../src/net/client.ts';
import type { NetClient } from '../../src/net/client.ts';
import { playerEntityId } from '../../src/net/protocol.ts';
import { attachGame } from '../../src/server/game.ts';
import { popOrb } from '../../src/sim/power-orbs.ts';
import { systems } from '../../src/sim/registry.ts';
import type { Entity, StepContext, System } from '../../src/sim/types.ts';
import type { ScriptCheck } from '../lib/script-checks.ts';

const POWER = 'boost';

const check: ScriptCheck = {
  id: 'step9-powers',
  gate: null,
  proves:
    "a power over the real network: an orb popped in the server's world at player a's feet is taken by a, after which a's own page holds the power (so its own verbs use it) and b's page sees it on a; control: the server writing the power onto b's copy without the effect leaves b's own page without it",
  async run(content: Content): Promise<string[]> {
    const failures: string[] = [];
    const power = content.powers?.[POWER];
    if (!power) return [`there is no power "${POWER}" (content/powers/) to check`];
    const server = http.createServer();
    const game = attachGame(server, { content, commit: 'check', startedAt: new Date().toISOString() });
    await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));
    const port = (server.address() as AddressInfo).port;
    const worldName = `check-powers-${process.pid}`;

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
    const still = { x: 0, y: 0, held: [] };
    const frames = setInterval(() => {
      a.update(still);
      b.update(still);
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
    const aId = playerEntityId('a');
    const bId = playerEntityId('b');
    const held = (e: Entity | undefined): string => e?.c.power?.id ?? 'none';
    /** A throwaway system: does `act` once, in the server's world only (a page's own world holds one player). */
    const once = (id: string, act: (ctx: StepContext) => void): System => {
      let armed = true;
      return {
        id,
        order: 905,
        run(ctx) {
          if (!armed || ctx.world.entities.filter((e) => e.player !== null).length < 2) return;
          armed = false;
          act(ctx);
        },
      };
    };

    try {
      if (!(await until('both players join', () => a.status() === 'online' && b.status() === 'online' && !!game.worlds.get(worldName)?.world.entities.find((e) => e.id === bId), () => `a ${a.status()}, b ${b.status()}`))) return failures;
      const gw = game.worlds.get(worldName)!;
      await sleep(300);

      // 1. An orb pops at a's feet in the server's world; a takes it there (systems/power-take.ts).
      const pop = once('throwaway-pop-orb', (ctx) => {
        const at = ctx.world.entities.find((e) => e.id === aId)!;
        const orb = popOrb(ctx, power, at, null);
        if (orb) {
          // Ready to take at once, sitting on a's feet.
          orb.c.orb!.until = 0;
          orb.vx = 0;
          orb.vy = 0;
        }
      });
      systems.push(pop);
      try {
        await until("the server's world has a holding the power", () => held(gw.world.entities.find((e) => e.id === aId)) === POWER, () => `server's a holds ${held(gw.world.entities.find((e) => e.id === aId))}`);
        await until("a's own page holds the power (its own world, where its verbs run)", () => held(a.me()) === POWER, () => `a's page holds ${held(a.me())}`);
        await until("b's page sees the power on a", () => held(b.others().find((e) => e.id === aId)) === POWER, () => `b's page sees a holding ${held(b.others().find((e) => e.id === aId))}`);
        await until('no orb is left on either page', () => !a.others().some((e) => e.c.orb) && !b.others().some((e) => e.c.orb), () => 'an orb is still drawn');
      } finally {
        systems.splice(systems.indexOf(pop), 1);
      }
      // The holder's own world uses it: its numbers are the boost's (src/sim/powers.ts).
      {
        const { numbersOf } = await import('../../src/sim/powers.ts');
        const lift = numbersOf(content, a.me()).liftStrength ?? 0;
        if (lift < (power.atLeast.liftStrength ?? 0)) failures.push(`a's own page lifts ${lift} with the power, expected at least ${power.atLeast.liftStrength}`);
      }

      // 2. Control: the server writes the power onto b's copy directly, no effect.
      // The server's own copy (and so a's view of b) has it; b's own page never does.
      const direct = once('throwaway-direct-power', (ctx) => {
        const e = ctx.world.entities.find((x) => x.id === bId)!;
        e.c.power = { id: POWER };
      });
      systems.push(direct);
      try {
        await until("control: a's page sees the power written onto b", () => held(a.others().find((e) => e.id === bId)) === POWER, () => `a's page sees b holding ${held(a.others().find((e) => e.id === bId))}`);
        await sleep(1000);
        if (held(b.me()) !== 'none') failures.push(`control: with no effect sent, b's own page holds ${held(b.me())}, expected none (the check could not tell the effect from a copy of c)`);
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
