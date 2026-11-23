// Step 11 (docs/mechanisms/cantina.md), beyond the scenarios: the cantina
// over the real network layer. A real server on a free port and two headless
// players running the page's own network client (src/net/client.ts), as
// scripts/checks/together.ts does. Run by `npm run check`.
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import WebSocket from 'ws';
import type { Content } from '../../src/content/types.ts';
import { createNetClient } from '../../src/net/client.ts';
import type { NetClient } from '../../src/net/client.ts';
import { playerEntityId } from '../../src/net/protocol.ts';
import { attachGame } from '../../src/server/game.ts';
import { padSpot } from '../../src/sim/cantina.ts';
import { emitEffect } from '../../src/sim/effects.ts';
import { systems } from '../../src/sim/registry.ts';
import type { Entity, Input, StepContext, System, World } from '../../src/sim/types.ts';
import type { ScriptCheck } from '../lib/script-checks.ts';

const check: ScriptCheck = {
  id: 'step11-cantina',
  gate: null,
  proves: "the cantina over the real network: with two players on separate connections in it, the server's world has exactly one regular per roster character nobody plays and each page's own world has none; a player launched past the edge is put back on a pad by the server's move effect, acknowledged, and their own page then has them on the pad, no longer flying, and able to run",
  async run(content: Content): Promise<string[]> {
    const failures: string[] = [];
    const file = Object.values(content.cantina)[0];
    if (!file) return ['there is no cantina (content/cantina/) to check'];
    const server = http.createServer();
    const game = attachGame(server, { content, commit: 'check', startedAt: new Date().toISOString() });
    await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));
    const port = (server.address() as AddressInfo).port;
    const worldName = `check-cantina-${process.pid}`;

    const sockets = new Map<string, WebSocket>();
    const moves: Record<string, number> = { a: 0, b: 0 };
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
            if (text.startsWith('{"t":"fx"') && (JSON.parse(text) as { effect: { kind: string } }).effect.kind === 'move') moves[player]!++;
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
    const frames = setInterval(() => {
      a.update(inputs.a!);
      b.update(inputs.b!);
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
    const regulars = (w: World): Entity[] => w.entities.filter((e) => e.id.startsWith('cantina:') || e.id.startsWith('~cantina:'));
    const pos = (e: Entity | undefined): string => (e ? `${e.room} ${e.x.toFixed(1)},${e.y.toFixed(1)}` : 'not there');
    const aId = playerEntityId('a');
    const bId = playerEntityId('b');
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

      // 1. Both players are put in the cantina by the server (a door's `move`, on their pads).
      const inside = once('throwaway-into-cantina', (ctx) => {
        [aId, bId].forEach((id, i) => {
          const e = ctx.world.entities.find((x) => x.id === id)!;
          const at = padSpot(ctx.content, file, 1 - i, e.kind);
          emitEffect(ctx, e, { kind: 'move', room: file.room, x: at.x, y: at.y });
        });
      });
      systems.push(inside);
      try {
        await until('both pages have their player in the cantina', () => a.me().room === file.room && b.me().room === file.room, () => `a ${pos(a.me())}, b ${pos(b.me())}`);
      } finally {
        systems.splice(systems.indexOf(inside), 1);
      }
      await until('the server hears both moves acknowledged', () => [...gw.players.values()].every((p) => p.pending.length === 0), () => 'effects still pending');
      await sleep(1500);

      // 2. One regular per roster character nobody plays, on the server; none on either page.
      const played = new Set([a.me().kind, b.me().kind]);
      const want = content.roster.characters.filter((k) => !played.has(k)).sort();
      const have = gw.world.entities.filter((e) => e.player === null && e.id === `cantina:${e.kind}`);
      const kinds = have.map((e) => e.kind).sort();
      if (kinds.join() !== want.join()) failures.push(`the server's world has regulars [${kinds.join(', ')}], expected one each of [${want.join(', ')}] (the players are ${[...played].join(' and ')})`);
      if (have.some((e) => e.room !== file.room)) failures.push(`a regular is outside the cantina: ${have.filter((e) => e.room !== file.room).map((e) => `${e.id} in ${e.room}`).join(', ')}`);
      for (const [name, c] of [['a', a], ['b', b]] as const) {
        const own = regulars(c.world);
        if (own.length > 0) failures.push(`page ${name}'s own world grew cantina entities of its own: ${own.map((e) => e.id).join(', ')} (it must hold only its own character)`);
        if (c.world.entities.length !== 1) failures.push(`page ${name}'s own world holds ${c.world.entities.length} entities, expected only its own character`);
      }
      const seen = b.others().filter((e) => e.id.startsWith('cantina:')).map((e) => e.kind).sort();
      if (seen.join() !== want.join()) failures.push(`page b is shown regulars [${seen.join(', ')}], expected [${want.join(', ')}]`);

      // 3. b is launched west past the edge, by the server, as a hit would.
      const movesBefore = moves.b!;
      const pb = gw.players.get('b')!;
      const launch = once('throwaway-launch', (ctx) => {
        const e = ctx.world.entities.find((x) => x.id === bId)!;
        emitEffect(ctx, e, { kind: 'push', vx: -520, vy: -360, fly: { by: aId, met: [aId] } });
      });
      const startX = b.me().x;
      systems.push(launch);
      try {
        await until("b's own page has b flying west", () => b.me().x < startX - 20, () => `b was at ${startX.toFixed(1)}, is at ${pos(b.me())}`, 2000);
        await until("the server sends b a move effect, putting b back", () => moves.b! > movesBefore, () => `move effects to b: ${moves.b! - movesBefore}; server has b at ${pos(gw.world.entities.find((e) => e.id === bId))}`, 3000);
      } finally {
        systems.splice(systems.indexOf(launch), 1);
      }
      await until('the server hears b acknowledge it', () => pb.pending.length === 0, () => `${pb.pending.length} effect(s) still unacknowledged`, 2000);
      await sleep(300);
      const room = content.rooms[file.room]!;
      const box = content.characters[b.me().kind]!.box;
      const feetX = b.me().x + box.w / 2;
      const onPad = file.pads.some(([tx]) => Math.abs(feetX - (tx + 0.5) * room.tile) < 2);
      if (b.me().room !== file.room || !onPad) failures.push(`after the move b's page has b at ${pos(b.me())} (feet x ${feetX.toFixed(1)}), not on a pad (columns ${file.pads.map(([tx]) => tx).join(', ')})`);
      if (b.me().c.flying) failures.push("after the move b's page still has b flying");
      if (moves.b! - movesBefore !== 1) failures.push(`one launch should bring one move effect, but b was sent ${moves.b! - movesBefore}`);
      const landed = b.me().x;
      inputs.b = { x: 1, y: 0, held: [] };
      await sleep(300);
      inputs.b = { x: 0, y: 0, held: [] };
      await sleep(150);
      if (b.me().x - landed < 5) failures.push(`back on the pad, b could not run on their own device (moved ${(b.me().x - landed).toFixed(1)} px)`);
      await until('the server has b where b ran to', () => Math.abs((gw.world.entities.find((e) => e.id === bId)?.x ?? -999) - b.me().x) < 1, () => `b's page ${pos(b.me())}, server ${pos(gw.world.entities.find((e) => e.id === bId))}`, 1000);

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
