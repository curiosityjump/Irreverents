// Step 19 push 4 (docs/mechanisms/heists.md, "A prize in your hands"): over
// a real server and two connections, a prize, the cargo, the banked prize
// and the clean getaway reach each connection's own world. Player a is put
// by the camp's strongbox the moment nobody of the camp would see a body
// there, presses Use, and is put in the courtyard; player b stands in
// another room all along. Both pages' own worlds then hold a's cargo, then
// the banked prize, and both get `clean-getaway` in their events.
// Control (run here too): the same with a put there while fighter 2 faces
// the strongbox: banked, and no clean-getaway on either page.
// Run by `npm run check`.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import WebSocket from 'ws';
import type { Content } from '../../src/content/types.ts';
import { createNetClient } from '../../src/net/client.ts';
import type { NetClient } from '../../src/net/client.ts';
import { canSee } from '../../src/sim/npc/sight.ts';
import type { Entity, Input, SimEvent, World } from '../../src/sim/types.ts';
import { bootServer, sleep, until } from '../lib/save-harness.ts';
import type { Booted } from '../lib/save-harness.ts';
import type { ScriptCheck } from '../lib/script-checks.ts';

interface Pad {
  c: NetClient;
  input: Input;
  events: SimEvent[];
  leave(): void;
}

/** A headless page whose held actions can be set, keeping every server event it is sent. */
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
  const frames = setInterval(() => {
    c.update(pad.input);
    const l = c.latest();
    if (l !== last) {
      last = l;
      pad.events.push(...l.events);
    }
  }, 1000 / 60);
  // Snapshots can land between frames: look more often than the frames do.
  const look = setInterval(() => {
    const l = c.latest();
    if (l !== last) {
      last = l;
      pad.events.push(...l.events);
    }
  }, 4);
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
  // On the floor: the camp's and the courtyard's floor is the last row but one.
  me.y = (r.h - 1) * r.tile - box.h;
  me.vx = 0;
  me.vy = 0;
}

async function job(content: Content, server: Booted, name: string, seen: boolean, failures: string[]): Promise<void> {
  const tag = seen ? 'control (seen)' : 'clean';
  const a = join(content, server.port, 'a', name);
  const b = join(content, server.port, 'b', name);
  try {
    if (!(await until(failures, `${tag}: a and b join`, () => a.c.status() === 'online' && b.c.status() === 'online' && !!server.game.worlds.get(name), () => `${a.c.status()} ${b.c.status()}`))) return;
    const w: World = server.game.worlds.get(name)!.world;
    const box = content.placements.outpost?.things?.find((t) => t.id === 'camp-strongbox');
    if (!box) return void failures.push('no camp-strongbox in content/placements/outpost.json');
    const T = content.rooms.outpost!.tile;
    const mid = (box.tile[0] + 0.5) * T;
    // a goes into the camp somewhere nobody sees (on the ledge), so the room is populated and the job begins.
    const me = a.c.me();
    put(content, me, 'outpost', 4 * T);
    me.y = 6 * T - content.characters[me.kind]!.box.h;
    await until(failures, `${tag}: the camp's strongbox is in the server's world`, () => w.entities.some((e) => e.id === 'camp-strongbox'), () => 'not yet');
    // Wait for the moment: fighter 2 just turned to face the strongbox (seen) or away from it (clean).
    const probeSeen = (): boolean => {
      const probe: Entity = { ...me, room: 'outpost', x: mid - content.characters[me.kind]!.box.w / 2, y: (content.rooms.outpost!.h - 1) * T - content.characters[me.kind]!.box.h, c: {} };
      return ['camp-lookout', 'camp-fighter-1', 'camp-fighter-2'].some((id) => {
        const p = w.entities.find((e) => e.id === id);
        return p !== undefined && canSee(content, p, probe);
      });
    };
    const f2 = (): number => w.entities.find((e) => e.id === 'camp-fighter-2')?.facing ?? 0;
    const want = seen ? 1 : -1;
    if (!(await until(failures, `${tag}: fighter 2 turns ${seen ? 'to' : 'away from'} the strongbox`, () => f2() === -want, () => `facing ${f2()}`, 12000))) return;
    if (!(await until(failures, `${tag}: fighter 2 turns ${seen ? 'to' : 'away from'} the strongbox`, () => f2() === want && probeSeen() === seen, () => `facing ${f2()}, seen ${probeSeen()}`, 12000))) return;
    put(content, me, 'outpost', mid);
    await sleep(150);
    a.input = { x: 0, y: 0, held: ['interact'] };
    await sleep(120);
    a.input = { x: 0, y: 0, held: [] };
    const aid = me.id;
    const carried = await until(failures, `${tag}: the server's world has a carrying the strongbox`, () => w.cargo?.[aid] === 'camp-strongbox', () => JSON.stringify(w.cargo ?? null));
    if (carried) {
      await until(failures, `${tag}: a's own world holds a's cargo`, () => a.c.world.cargo?.[aid] === 'camp-strongbox', () => JSON.stringify(a.c.world.cargo ?? null));
      await until(failures, `${tag}: b's own world holds a's cargo`, () => b.c.world.cargo?.[aid] === 'camp-strongbox', () => JSON.stringify(b.c.world.cargo ?? null));
    }
    put(content, me, 'courtyard', 3 * T);
    await until(failures, `${tag}: the server's world banks the strongbox`, () => (w.banked ?? []).includes('camp-strongbox'), () => JSON.stringify(w.banked ?? null));
    await until(failures, `${tag}: a's own world has it banked`, () => (a.c.world.banked ?? []).includes('camp-strongbox') && a.c.world.cargo?.[aid] === undefined, () => JSON.stringify([a.c.world.banked, a.c.world.cargo]));
    await until(failures, `${tag}: b's own world has it banked`, () => (b.c.world.banked ?? []).includes('camp-strongbox'), () => JSON.stringify(b.c.world.banked ?? null));
    await sleep(300);
    const clean = (p: Pad): number => p.events.filter((e) => e.type === 'clean-getaway').length;
    const banked = (p: Pad): number => p.events.filter((e) => e.type === 'prize-banked').length;
    if (banked(a) < 1 || banked(b) < 1) failures.push(`${tag}: prize-banked reached a ${banked(a)} time(s) and b ${banked(b)} time(s), expected at least once each`);
    if (seen && (clean(a) > 0 || clean(b) > 0)) failures.push(`${tag}: a seen job sent clean-getaway (a ${clean(a)}, b ${clean(b)})`);
    if (!seen && (clean(a) < 1 || clean(b) < 1)) failures.push(`${tag}: clean-getaway reached a ${clean(a)} time(s) and b ${clean(b)} time(s), expected at least once each`);
  } finally {
    a.leave();
    b.leave();
    await sleep(250);
  }
}

const check: ScriptCheck = {
  id: 'step19-heist',
  gate: 'E',
  proves:
    "over a real server and two connections, a hero takes the camp's strongbox unseen and walks out: the cargo, then the banked prize, reach both connections' own worlds (the other player stands in another room), and both get clean-getaway; the control, the same with fighter 2 facing the strongbox, banks it with no clean-getaway on either",
  async run(content: Content): Promise<string[]> {
    const failures: string[] = [];
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'irreverents-step19-'));
    let server: Booted | null = null;
    try {
      server = await bootServer(content, dir);
      await job(content, server, `step19-clean-${process.pid}`, false, failures);
      await job(content, server, `step19-seen-${process.pid}`, true, failures);
    } finally {
      await server?.stop();
      fs.rmSync(dir, { recursive: true, force: true });
    }
    return failures;
  },
};
export default check;
