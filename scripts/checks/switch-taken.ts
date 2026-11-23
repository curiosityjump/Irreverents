// The switch gap, the server's half (docs/mechanisms/party-and-switching.md,
// "Two players, one member"), without a browser: two pages that report the
// same party member at the same moment (two switch presses in the same
// instant on two phones) end with exactly one of them playing it, and the
// other is put back by a `become` effect; a page that comes back after its
// character was removed keeps its member unless a friend took it meanwhile.
// Run by `npm run check`.
//
// Control (watched to fail): with the `refuseTaken(...)` call in adopt
// (src/server/game.ts) removed, both pages keep the member.
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import WebSocket from 'ws';
import type { Content } from '../../src/content/types.ts';
import { playerEntityId } from '../../src/net/protocol.ts';
import { attachGame } from '../../src/server/game.ts';
import type { Entity } from '../../src/sim/types.ts';
import { findEntity } from '../../src/sim/world.ts';
import type { ScriptCheck } from '../lib/script-checks.ts';

/* eslint-disable @typescript-eslint/no-explicit-any */
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

const check: ScriptCheck = {
  id: 'switch-taken',
  gate: null,
  proves: 'two pages reporting the same party member at the same moment: exactly one keeps it, the other keeps the member it had and is sent `become` back to it; a page rejoining after its character was removed, reporting a member a friend now plays, is seated on a free one (and told so); a page rejoining while its character exists keeps its member',
  async run(content: Content): Promise<string[]> {
    const failures: string[] = [];
    const server = http.createServer();
    const game = attachGame(server, { content, commit: 'check', startedAt: new Date().toISOString() });
    await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));
    const port = (server.address() as AddressInfo).port;
    const socks: WebSocket[] = [];
    const members = content.party.members;

    /** A raw page: joins and keeps its welcome's entity and every `fx` it is sent. */
    const page = async (player: string, world: string, fresh: boolean, kind = members[0]!): Promise<{ ws: WebSocket; e: Entity; fx: any[] }> => {
      const ws = new WebSocket(`ws://127.0.0.1:${port}/ws`);
      socks.push(ws);
      const fx: any[] = [];
      let e: Entity | null = null;
      ws.on('message', (d) => {
        const m = JSON.parse(d.toString());
        if (m.t === 'welcome') e = m.e;
        if (m.t === 'fx') fx.push(m);
      });
      await new Promise<void>((done) => ws.on('open', () => done()));
      const mine = { id: '', kind, room: content.game.startRoom, x: 40, y: 40, vx: 0, vy: 0, facing: 1, onGround: false, player, c: {} };
      ws.send(JSON.stringify({ t: 'join', player, world, e: mine, fresh }));
      await sleep(150);
      if (!e) throw new Error(`${player} was never welcomed`);
      return { ws, e, fx };
    };
    const report = (ws: WebSocket, e: Entity): void => ws.send(JSON.stringify({ t: 'me', e, i: { x: 0, y: 0, held: [] }, is: [], ct: 0 }));
    const kindIn = (world: string, player: string): string | undefined => {
      const gw = game.worlds.get(world);
      return gw ? findEntity(gw.world, playerEntityId(player))?.kind : undefined;
    };

    try {
      if (members.length < 3) return [`the party has ${members.length} members; this check needs 3`];
      // ---- the same instant ----
      const W = `check-switch-${process.pid}`;
      const a = await page('sw-a', W, true);
      const b = await page('sw-b', W, true);
      const free = members.find((m) => m !== a.e.kind && m !== b.e.kind)!;
      if (a.e.kind === b.e.kind) failures.push(`two fresh pages were seated on the same member (${a.e.kind})`);
      // Both reports leave in the same moment, before the server steps.
      report(a.ws, { ...a.e, kind: free });
      report(b.ws, { ...b.e, kind: free });
      await sleep(200);
      const ka = kindIn(W, 'sw-a');
      const kb = kindIn(W, 'sw-b');
      const holders = [ka, kb].filter((k) => k === free).length;
      if (holders !== 1) failures.push(`both pages reported the ${free} at once: ${holders} of them play it now (a: ${ka}, b: ${kb}); want exactly 1`);
      const loser = ka === free ? { p: b, had: b.e.kind, now: kb } : { p: a, had: a.e.kind, now: ka };
      if (holders === 1) {
        if (loser.now !== loser.had) failures.push(`the page refused the ${free} plays the ${loser.now}, not the ${loser.had} it had`);
        const back = loser.p.fx.find((m) => m.effect?.kind === 'become');
        if (!back || back.effect.to !== loser.had || back.e?.kind !== loser.had) failures.push(`the refused page was not sent \`become\` back to the ${loser.had} (sent ${JSON.stringify(loser.p.fx.map((m) => m.effect))})`);
      }

      // ---- coming back ----
      const R = `${W}-rejoin`;
      const c = await page('sw-c', R, true);
      // c comes back on a new socket while its character still exists: it keeps its member.
      const c2 = await page('sw-c', R, false, c.e.kind);
      if (kindIn(R, 'sw-c') !== c.e.kind || c2.fx.length !== 0) failures.push(`a page rejoining while its character exists did not keep the ${c.e.kind} (plays ${kindIn(R, 'sw-c')}, sent ${c2.fx.length} effects)`);
      // d's character is gone (removed, as staleSeconds would); e takes d's member meanwhile; d comes back reporting it.
      const d = await page('sw-d', R, true);
      const gw = game.worlds.get(R)!;
      gw.world.entities = gw.world.entities.filter((x) => x.id !== playerEntityId('sw-d'));
      gw.players.delete('sw-d');
      const e = await page('sw-e', R, true);
      if (e.e.kind !== d.e.kind) failures.push(`setup: the page joining after d left was seated on the ${e.e.kind}, not d's ${d.e.kind}`);
      const d2 = await page('sw-d', R, false, d.e.kind);
      const kd = kindIn(R, 'sw-d');
      if (kd === d.e.kind) failures.push(`a page rejoining with the ${d.e.kind}, which a friend took meanwhile, kept it`);
      else if (!d2.fx.some((m) => m.effect?.kind === 'become' && m.effect.to === kd)) failures.push(`a page rejoining with a taken member was seated on the ${kd} but not told so with \`become\``);
    } finally {
      for (const s of socks) s.close();
      game.close();
      await new Promise<void>((done) => server.close(() => done()));
    }
    return failures;
  },
};
export default check;
