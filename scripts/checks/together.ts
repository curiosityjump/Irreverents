// Gate F, without a browser: a real server on a free port and two headless
// players running the same network client the page runs (src/net/client.ts).
// Run by `npm run check`, reported by `npm run gates`.
// The scenario layer is pure (no sockets), so this lives with the scripts.
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import WebSocket from 'ws';
import type { Content } from '../../src/content/types.ts';
import { createNetClient } from '../../src/net/client.ts';
import type { NetClient } from '../../src/net/client.ts';
import { playerEntityId } from '../../src/net/protocol.ts';
import { attachGame } from '../../src/server/game.ts';
import { emitEffect } from '../../src/sim/effects.ts';
import { systems } from '../../src/sim/registry.ts';
import type { Entity, Input, System } from '../../src/sim/types.ts';
import { addEntity, removeEntity } from '../../src/sim/world.ts';
import type { ScriptCheck } from '../lib/script-checks.ts';

const check: ScriptCheck = {
  id: 'together',
  gate: 'F',
  proves: 'two players on separate connections share one world over the real network layer: each sees the other move, a new kind of entity arrives with no network code, an effect from the simulation on the server reaches a player (acknowledged, and resent when the first copy is lost), a tap between two reports is seen once by the server, and a dropped player comes back as themselves',
  async run(content: Content): Promise<string[]> {
    const failures: string[] = [];
    const server = http.createServer();
    const game = attachGame(server, { content, commit: 'check', startedAt: new Date().toISOString() });
    await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));
    const port = (server.address() as AddressInfo).port;
    const worldName = `check-f-${process.pid}`;

    const sockets = new Map<string, WebSocket>();
    /** Effect messages to lose on the way to a player, to prove the resend. */
    const lose: Record<string, number> = { a: 0, b: 0 };
    const lost: Record<string, number> = { a: 0, b: 0 };
    /** Size of the newest snapshot message. */
    let snapBytes = 0;
    const inputs: Record<string, Input> = {};
    const make = (player: string): NetClient => {
      inputs[player] = { x: 0, y: 0, held: [] };
      return createNetClient({
        content,
        player,
        world: worldName,
        now: () => performance.now(),
        connect(h) {
          const ws = new WebSocket(`ws://127.0.0.1:${port}/ws`);
          sockets.set(player, ws);
          ws.on('open', () => h.open());
          ws.on('message', (d) => {
            const text = d.toString();
            if (text.startsWith('{"t":"snap"')) snapBytes = text.length;
            if (lose[player]! > 0 && text.startsWith('{"t":"fx"')) {
              lose[player]!--;
              lost[player]!++;
              return;
            }
            h.message(text);
          });
          ws.on('close', () => h.close());
          ws.on('error', () => h.close());
          return { send: (t) => ws.readyState === ws.OPEN && ws.send(t), close: () => ws.close() };
        },
      });
    };
    const a = make('a');
    const b = make('b');
    /** Set to make player a hold 'interact' for exactly one frame. */
    let tapOnce = false;
    const frames = setInterval(() => {
      if (tapOnce) {
        // Held until one tick has really been simulated with it, then let go.
        const before = a.world.tick;
        a.update({ x: 0, y: 0, held: ['interact'] });
        if (a.world.tick > before) tapOnce = false;
        b.update(inputs.b!);
        return;
      }
      a.update(inputs.a!);
      b.update(inputs.b!);
    }, 1000 / 60);

    const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
    /** Waits until `what` holds; records a failure (with `seen()`) if it does not within the time. */
    const until = async (what: string, cond: () => boolean, seen: () => string, ms = 3000): Promise<boolean> => {
      const end = performance.now() + ms;
      while (performance.now() < end) {
        if (cond()) return true;
        await sleep(10);
      }
      failures.push(`${what}: not within ${ms} ms (${seen()})`);
      return false;
    };
    const seenBy = (c: NetClient, id: string): Entity | undefined => c.others().find((e) => e.id === id);
    const pos = (e: Entity | undefined): string => (e ? `${e.x.toFixed(1)},${e.y.toFixed(1)}` : 'not there');
    const aId = playerEntityId('a');
    const bId = playerEntityId('b');

    try {
      // 1. Both in one world, each sees the other, on different spawn tiles.
      const joined = await until('each player sees the other', () => !!seenBy(a, bId) && !!seenBy(b, aId), () => `a sees b: ${pos(seenBy(a, bId))}; b sees a: ${pos(seenBy(b, aId))}`);
      if (joined && Math.abs(a.me().x - b.me().x) < 1) failures.push(`the two players were placed on the same spot (x ${a.me().x})`);
      if (joined && content.party.members.length > 1 && a.me().kind === b.me().kind) failures.push(`both players were seated as the same party member (${a.me().kind}) while another was free`);
      if (joined && a.me().c.net?.slot === b.me().c.net?.slot) failures.push('the two players were given the same slot (they would be drawn the same colour)');

      // 2. A runs right; B sees A where A is.
      const startX = a.me().x;
      inputs.a = { x: 1, y: 0, held: [] };
      await sleep(500);
      inputs.a = { x: 0, y: 0, held: [] };
      await sleep(150);
      if (a.me().x - startX < 20) failures.push(`player a did not run on their own device (moved ${(a.me().x - startX).toFixed(1)} px in half a second)`);
      await until('b sees a where a stopped', () => Math.abs((seenBy(b, aId)?.x ?? -999) - a.me().x) < 1, () => `a is at ${pos(a.me())}, b sees a at ${pos(seenBy(b, aId))}`, 1000);

      // 3. A kind of entity the network layer has never heard of arrives, and leaves.
      const gw = game.worlds.get(worldName);
      if (!gw) failures.push('the server has no such world');
      else {
        //    Its kind is not a character kind and it carries about 500 bytes of its own state.
        const without = snapBytes;
        const blob = 'x'.repeat(500);
        addEntity(gw.world, { id: 'x:throwaway', kind: 'throwaway-kind', player: null, room: content.game.startRoom, x: 123, y: 45, vx: 0, vy: 0, facing: 1, onGround: false, c: { throwaway: blob } as Entity['c'] });
        await until('a throwaway entity kind added on the server arrives at both players, state and all', () => seenBy(a, 'x:throwaway')?.kind === 'throwaway-kind' && (seenBy(b, 'x:throwaway')?.c as { throwaway?: string } | undefined)?.throwaway === blob, () => `a: ${pos(seenBy(a, 'x:throwaway'))}; b: ${pos(seenBy(b, 'x:throwaway'))}`);
        await sleep(200);
        if (seenBy(a, 'x:throwaway')?.y !== 45) failures.push(`an entity of an unknown kind should be left where it is, but a sees it at ${pos(seenBy(a, 'x:throwaway'))}`);
        console.log(`      (together) one snapshot of this world is ${without} bytes; ${snapBytes} bytes with an unknown-kind entity carrying 500 bytes of state`);
        removeEntity(gw.world, 'x:throwaway');
        await until('the removed entity disappears for both', () => !seenBy(a, 'x:throwaway') && !seenBy(b, 'x:throwaway'), () => 'still seen');

        //    World state that is not an entity (room state, or whatever a
        //    later step adds at the top level of World) arrives too.
        (gw.world as unknown as Record<string, unknown>).throwawayState = { gate: 'open' };
        await until('a new top-level field of the World set on the server arrives in both players\' own worlds', () => [a, b].every((c) => (c.world as unknown as { throwawayState?: { gate: string } }).throwawayState?.gate === 'open'), () => `a has ${JSON.stringify((a.world as unknown as Record<string, unknown>).throwawayState)}`);
        delete (gw.world as unknown as Record<string, unknown>).throwawayState;

        //    A tap shorter than a report: the server's copy of a system sees
        //    exactly one fresh press, and what it wrote on the player's
        //    entity survives the page's later reports.
        const taps: System = {
          id: 'throwaway-taps',
          order: 901,
          run(ctx) {
            if (ctx.world.entities.filter((e) => e.player !== null).length < 2) return;
            const e = ctx.world.entities.find((x) => x.id === aId);
            if (!e) return;
            const c = e.c as unknown as { throwawayTaps?: { held: boolean; count: number } };
            const state = (c.throwawayTaps ??= { held: false, count: 0 });
            const down = (ctx.inputs.a?.held ?? []).includes('interact');
            if (down && !state.held) state.count++;
            state.held = down;
          },
        };
        const tapsOn = (): { held: boolean; count: number } | undefined => (gw.world.entities.find((x) => x.id === aId)?.c as unknown as { throwawayTaps?: { held: boolean; count: number } } | undefined)?.throwawayTaps;
        systems.push(taps);
        try {
          await sleep(100);
          tapOnce = true;
          await sleep(500);
          if (tapsOn()?.count !== 1) failures.push(`player a tapped 'interact' for one tick between two reports: the server's system should have seen exactly 1 fresh press, but saw ${tapsOn()?.count ?? 'no state at all'}`);
        } finally {
          systems.splice(systems.indexOf(taps), 1);
        }

        // 4. Something the server simulates shoves player b, as an effect.
        //    The throwaway system below knows nothing about the network.
        //    The first copy sent to b is lost on the way.
        let armed = true;
        const shove: System = {
          id: 'throwaway-shove',
          order: 900,
          run(ctx) {
            // Only in the server's world: a page's own world has no other players.
            if (!armed || ctx.world.entities.filter((e) => e.player !== null).length < 2) return;
            const victim = ctx.world.entities.find((e) => e.id === bId);
            if (!victim) return;
            armed = false;
            emitEffect(ctx, victim, { kind: 'push', vx: 150, vy: -250 });
          },
        };
        const before = { x: b.me().x, y: b.me().y };
        const pb = gw.players.get('b')!;
        lose.b = 1;
        systems.push(shove);
        try {
          await until('a push by the server\'s simulation moves player b on b\'s own device', () => b.me().y < before.y - 10 && b.me().x > before.x + 5, () => `b was at ${before.x.toFixed(1)},${before.y.toFixed(1)}, is at ${pos(b.me())}, effects applied: ${b.stats.effects}, copies lost: ${lost.b}`, 2500);
          await until('a sees b pushed', () => (seenBy(a, bId)?.x ?? 0) > before.x + 5, () => `a sees b at ${pos(seenBy(a, bId))}`, 2000);
          await until('the server hears that b applied the effect', () => pb.pending.length === 0, () => `${pb.pending.length} effect(s) still unacknowledged`, 2000);
          if (lost.b !== 1) failures.push(`the first copy of the effect should have been lost on the way to b, but ${lost.b} were`);
          if (b.stats.effects !== 1) failures.push(`one push should be applied once, but b applied ${b.stats.effects}`);
          if (a.stats.effects !== 0) failures.push(`player a was not pushed, but applied ${a.stats.effects} effect(s)`);
          // b lands and its own device is in charge again: b runs, a sees it.
          await sleep(900);
          const landed = b.me().x;
          inputs.b = { x: 1, y: 0, held: [] };
          await sleep(300);
          inputs.b = { x: 0, y: 0, held: [] };
          await sleep(150);
          if (b.me().x - landed < 5) failures.push(`after the push, b could not run on their own device (moved ${(b.me().x - landed).toFixed(1)} px)`);
          await until('a sees b where b stopped after the push', () => Math.abs((seenBy(a, bId)?.x ?? -999) - b.me().x) < 1, () => `b is at ${pos(b.me())}, a sees b at ${pos(seenBy(a, bId))}`, 1000);
        } finally {
          systems.splice(systems.indexOf(shove), 1);
        }

        // 5. A's socket dies; A comes back as the same player, not a second one.
        const connectsBefore = a.stats.connects;
        sockets.get('a')!.terminate();
        await until('a reconnects by itself', () => a.stats.connects > connectsBefore && a.status() === 'online', () => `status ${a.status()}, connects ${a.stats.connects}`, 5000);
        const players = gw.world.entities.filter((e) => e.player !== null).length;
        if (players !== 2) failures.push(`after a reconnect the world holds ${players} player characters, expected 2`);
        inputs.a = { x: -1, y: 0, held: [] };
        await sleep(300);
        inputs.a = { x: 0, y: 0, held: [] };
        await sleep(150);
        await until('b sees a move after the reconnect', () => Math.abs((seenBy(b, aId)?.x ?? -999) - a.me().x) < 1, () => `a is at ${pos(a.me())}, b sees a at ${pos(seenBy(b, aId))}`, 1000);
      }

      // 6. Both leave; the world is forgotten.
      a.leave();
      b.leave();
      await until('the world is forgotten once its last player leaves', () => !game.worlds.has(worldName), () => `worlds: ${[...game.worlds.keys()].join(', ')}`);
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
