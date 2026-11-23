// Step 7 push 2 (docs/mechanisms/hall-of-legends.md, "Recognising a
// legend"): over a real server and two connections in a kept game, player a
// earns a legend in the Bandit Camp (a theft nobody noticed: put by the
// camp's strongbox the moment nobody of the camp would see a body there,
// Use, then put in the courtyard, as scripts/checks/step19-heist.ts does);
// a's own events carry `hall-legend` (since push 3, with the record's picture) though a is never sent the pedestal
// (a page gets only its own room's entities); b, standing in the Hall
// gallery, has the pedestal entity in its own world. Then everyone leaves,
// the server is rebuilt from the same store, and the kept game has the
// pedestal exactly once. Control (run here too): a new game has none.
// Run by `npm run check`.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import WebSocket from 'ws';
import type { Content } from '../../src/content/types.ts';
import { createNetClient } from '../../src/net/client.ts';
import type { NetClient } from '../../src/net/client.ts';
import { hallOf } from '../../src/content/kinds/hall.ts';
import { GAME_PREFIX } from '../../src/server/saves.ts';
import { canSee } from '../../src/sim/npc/sight.ts';
import type { Entity, Input, SimEvent, World } from '../../src/sim/types.ts';
import { bootServer, joinAs, sleep, until } from '../lib/save-harness.ts';
import type { Booted } from '../lib/save-harness.ts';
import type { ScriptCheck } from '../lib/script-checks.ts';

interface Pad {
  c: NetClient;
  input: Input;
  events: SimEvent[];
  leave(): void;
}

/** A headless page whose held actions can be set, keeping every server event it is sent (as step19-heist.ts). */
function join(content: Content, port: number, id: string, world: string): Pad {
  let ws: WebSocket | null = null;
  const c = createNetClient({
    content,
    player: id,
    world,
    now: () => performance.now(),
    onGone: () => {},
    connect(h) {
      ws = new WebSocket(`ws://127.0.0.1:${port}/ws`);
      ws.on('open', () => h.open());
      ws.on('message', (d) => h.message(d.toString()));
      ws.on('close', () => h.close());
      ws.on('error', () => h.close());
      const s = ws;
      return { send: (t) => s.readyState === s.OPEN && s.send(t), close: () => s.close() };
    },
  });
  const pad: Pad = { c, input: { x: 0, y: 0, held: [] }, events: [], leave: () => {} };
  let last: unknown = null;
  const take = (): void => {
    const l = c.latest();
    if (l !== last) {
      last = l;
      pad.events.push(...l.events);
    }
  };
  const frames = setInterval(() => {
    c.update(pad.input);
    take();
  }, 1000 / 60);
  const look = setInterval(take, 4);
  pad.leave = () => {
    c.leave();
    clearInterval(frames);
    clearInterval(look);
    setTimeout(() => ws?.terminate(), 200);
  };
  return pad;
}

function put(content: Content, me: Entity, room: string, midX: number): void {
  const r = content.rooms[room]!;
  const box = content.characters[me.kind]!.box;
  me.room = room;
  me.x = midX - box.w / 2;
  me.y = (r.h - 1) * r.tile - box.h;
  me.vx = 0;
  me.vy = 0;
}

const pedestals = (w: World): Entity[] => w.entities.filter((e) => e.kind === 'pedestal');

const check: ScriptCheck = {
  id: 'step7-hall',
  gate: 'E',
  proves:
    "over a real server and two connections in a kept game: a's theft nobody noticed in the Bandit Camp hangs a legend; a (in the courtyard) gets hall-legend in its own events and is never sent the pedestal, b (in the Hall gallery) has the pedestal hall:1 in its own world; after everyone leaves and a new server loads the kept game from the same store, it has that pedestal exactly once, and a new game has none",
  async run(content: Content): Promise<string[]> {
    const failures: string[] = [];
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'irreverents-step7-hall-'));
    const name = GAME_PREFIX + 'HXMN';
    const gallery = hallOf(content)?.room ?? 'hall-gallery';
    let server: Booted | null = null;
    try {
      server = await bootServer(content, dir);
      const a = join(content, server.port, 'a', name);
      const b = join(content, server.port, 'b', name);
      try {
        if (!(await until(failures, 'a and b join the kept game', () => a.c.status() === 'online' && b.c.status() === 'online' && !!server!.game.worlds.get(name), () => `${a.c.status()} ${b.c.status()}`))) return failures;
        const w: World = server.game.worlds.get(name)!.world;
        put(content, b.c.me(), gallery, 3 * content.rooms[gallery]!.tile);
        const box = content.placements.outpost?.things?.find((t) => t.id === 'camp-strongbox');
        if (!box) return [...failures, 'no camp-strongbox in content/placements/outpost.json'];
        const T = content.rooms.outpost!.tile;
        const mid = (box.tile[0] + 0.5) * T;
        const me = a.c.me();
        // a goes into the camp on the ledge, out of everyone's sight, so the job begins.
        put(content, me, 'outpost', 4 * T);
        me.y = 6 * T - content.characters[me.kind]!.box.h;
        const probeSeen = (): boolean => {
          const probe: Entity = { ...me, room: 'outpost', x: mid - content.characters[me.kind]!.box.w / 2, y: (content.rooms.outpost!.h - 1) * T - content.characters[me.kind]!.box.h, c: {} };
          return ['camp-lookout', 'camp-fighter-1', 'camp-fighter-2'].some((id) => {
            const p = w.entities.find((e) => e.id === id);
            return p !== undefined && canSee(content, p, probe);
          });
        };
        const f2 = (): number => w.entities.find((e) => e.id === 'camp-fighter-2')?.facing ?? 0;
        if (!(await until(failures, 'fighter 2 turns to the strongbox', () => f2() === 1, () => `facing ${f2()}`, 12000))) return failures;
        if (!(await until(failures, 'fighter 2 turns away and nobody would see the strongbox', () => f2() === -1 && !probeSeen(), () => `facing ${f2()}`, 12000))) return failures;
        put(content, me, 'outpost', mid);
        await sleep(150);
        a.input = { x: 0, y: 0, held: ['interact'] };
        await sleep(120);
        a.input = { x: 0, y: 0, held: [] };
        await until(failures, "the server's world has a carrying the strongbox", () => w.cargo?.[me.id] === 'camp-strongbox', () => JSON.stringify(w.cargo ?? null));
        put(content, me, 'courtyard', 3 * T);
        const legend = (p: Pad): number => p.events.filter((e) => e.type === 'hall-legend').length;
        await until(failures, "the server's world hangs one pedestal in the gallery", () => pedestals(w).length === 1, () => `${pedestals(w).length}`, 3000);
        await until(failures, "a's own events carry hall-legend", () => legend(a) >= 1, () => `${legend(a)}`);
        // What each page draws: what the server sent it (others()) and its own character (world).
        const drawn = (p: Pad): Entity[] => [...p.c.others(), ...p.c.world.entities];
        await until(failures, 'b, in the gallery, is sent the pedestal', () => drawn(b).some((e) => e.id === 'hall:1' && e.room === gallery && !!e.c.hall?.record), () => drawn(b).map((e) => e.id).join(','));
        await sleep(300);
        // INTENT (src/server/game.ts): a page gets only its own room's entities, so a never gets the pedestal;
        // and a page hangs no legend in its own local world (hall-detect).
        if (drawn(a).some((e) => e.kind === 'pedestal')) failures.push(`a, in the courtyard, draws a pedestal: ${drawn(a).filter((e) => e.kind === 'pedestal').map((e) => e.id).join(', ')}`);
        const ev = a.events.find((e) => e.type === 'hall-legend') as (SimEvent & { kind?: string; who?: string[] }) | undefined;
        if (ev && (ev.kind !== 'clean-theft' || !(ev.who ?? []).includes('a'))) failures.push(`a's hall-legend is ${JSON.stringify(ev)}, expected a clean-theft naming a`);
        // Push 3: the event carries the record's picture, so the banner can show it wherever a page is; a's own body is in it, credited.
        const frame = (ev as { frame?: unknown } | undefined)?.frame;
        if (ev && !(Array.isArray(frame) && frame.some((b) => Array.isArray(b) && (Number(b[4]) & 1) === 1)))
          failures.push(`a's hall-legend carries no picture with a credited body: frame ${JSON.stringify(frame ?? null)}`);
      } finally {
        a.leave();
        b.leave();
      }
      await until(failures, 'the game is forgotten once its last player is gone', () => !server!.game.worlds.has(name), () => 'still there');
      await server.stop();

      server = await bootServer(content, dir);
      const c = joinAs(content, server.port, 'c', name);
      if (await until(failures, 'player c joins the saved game', () => c.c.status() === 'online' && !!server!.game.worlds.get(name), () => c.c.status())) {
        const kept = pedestals(server.game.worlds.get(name)!.world);
        if (kept.length !== 1 || kept[0]!.id !== 'hall:1' || kept[0]!.c.hall?.record.kind !== 'clean-theft') failures.push(`after the restart the kept game holds ${kept.length} pedestal(s) (${kept.map((e) => e.id).join(', ')}), expected exactly hall:1, a clean theft`);
      }
      c.leave();
      const d = joinAs(content, server.port, 'd', GAME_PREFIX + 'NEWQ');
      if (await until(failures, 'player d joins a new game', () => d.c.status() === 'online' && !!server!.game.worlds.get(GAME_PREFIX + 'NEWQ'), () => d.c.status())) {
        const n = pedestals(server.game.worlds.get(GAME_PREFIX + 'NEWQ')!.world).length;
        if (n !== 0) failures.push(`control: a new game holds ${n} pedestal(s), expected none`);
      }
      d.leave();
      await until(failures, 'both games are forgotten', () => server!.game.worlds.size === 0, () => [...server!.game.worlds.keys()].join(', '));
    } finally {
      await server?.stop();
      fs.rmSync(dir, { recursive: true, force: true });
    }
    return failures;
  },
};
export default check;
