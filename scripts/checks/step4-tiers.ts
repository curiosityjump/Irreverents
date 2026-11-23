// Step 4, the town's tiers (docs/mechanisms/npc-response.md, "The town's
// tiers"): the pips follow the party. A real server on a temporary store
// (scripts/lib/save-harness.ts), two connections; run by `npm run check`.
//
// The street's guard is put on duty in the server's world, chasing A's hero
// with something new seen (as if A had just hit him): what the sim does from
// there is its own. His whistle completes, the street's alert goes to 2 and
// level 2's row walks in. A then walks to the courtyard: A's own world is
// never sent the street's alert entity, yet still says 2 (world.alerts);
// B, in the street, has the arrivals.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { Content } from '../../src/content/types.ts';
import { GAME_PREFIX } from '../../src/server/saves.ts';
import { alertId } from '../../src/sim/npc/alert.ts';
import { THING_KIND } from '../../src/sim/npc/state.ts';
import { addEntity, findEntity } from '../../src/sim/world.ts';
import { bootServer, joinAs, until } from '../lib/save-harness.ts';
import type { Booted } from '../lib/save-harness.ts';
import type { ScriptCheck } from '../lib/script-checks.ts';

const AREA = 'castle-street';

const check: ScriptCheck = {
  id: 'step4-tiers',
  gate: null,
  proves:
    "the pips follow the party over a real server: the street's guard, on duty and chasing A's hero after seeing something new, whistles and the call completes (alert 2, level 2's row walks in); A walks into the courtyard, where its own world holds no street alert entity yet shows the street at 2 (world.alerts), while B, in the street, has the guards the row brought",
  async run(content: Content): Promise<string[]> {
    const failures: string[] = [];
    if (!content.dispatch?.[AREA]) return [`no content/dispatch/${AREA}.json`];
    const street = content.rooms[AREA]!;
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'irreverents-step4-tiers-'));
    const name = GAME_PREFIX + 'WHST';
    let server: Booted | null = null;
    try {
      server = await bootServer(content, dir);
      const a = joinAs(content, server.port, 'a', name);
      const b = joinAs(content, server.port, 'b', name);
      const online = await until(failures, 'two players join the game', () => a.c.status() === 'online' && b.c.status() === 'online' && !!server!.game.worlds.get(name), () => `${a.c.status()} / ${b.c.status()}`);
      if (online) {
        const w = server.game.worlds.get(name)!.world;
        // The page owns its body's place (docs/mechanisms/network.md): A stands in front of the guard, B far west.
        const place = (who: typeof a, room: string, x: number): void => {
          const me = who.c.me();
          const box = content.characters[me.kind]!.box;
          me.room = room;
          me.x = x;
          me.y = 11 * content.rooms[room]!.tile - box.h;
          me.vx = 0;
          me.vy = 0;
        };
        // The guard's beat is columns 37-42; A stands at column 34, in front of him once he faces west.
        const gx = 40 * street.tile;
        place(a, AREA, 34 * street.tile);
        place(b, AREA, 3 * street.tile);
        await until(failures, "A's hero is in the street on the server", () => findEntity(w, 'p:a')?.room === AREA, () => findEntity(w, 'p:a')?.room ?? 'none');
        await until(failures, 'the street has its guard', () => !!findEntity(w, 'street-guard')?.c.npc, () => 'no street-guard person in the server world');
        const guard = findEntity(w, 'street-guard');
        if (!guard?.c.npc) return failures;
        guard.x = gx;
        // Alert 1 (as the shopkeeper's bell would leave it) and the guard on duty, facing A, having seen something new.
        if (!findEntity(w, alertId(AREA))) addEntity(w, { id: alertId(AREA), kind: THING_KIND, player: null, room: AREA, x: 34 * street.tile, y: 160, vx: 0, vy: 0, facing: 1, onGround: true, c: { alert: { level: 1, quiet: 0 } } });
        (w.alerts ??= {})[AREA] = 1;
        guard.facing = -1;
        guard.c.respond = { phase: 'chase', x: 34 * street.tile, dir: -1, stall: 0 };
        guard.c.npc.mood = 3;
        guard.c.npc.dissonance = 2;
        guard.c.npc.offenders = ['p:a'];
        guard.c.whistle = { progress: 0, of: 1, wait: 0, reported: 0 };
        await until(failures, "the guard's whistle completes and the street's alert is 2 on the server", () => (w.alerts?.[AREA] ?? 0) === 2, () => `alert ${w.alerts?.[AREA]}, whistle ${JSON.stringify(guard.c.whistle)}`, 8000);
        await until(failures, "level 2's row is in the server's street", () => w.entities.some((e) => e.c.arrival && e.room === AREA), () => 'no arrival');
        place(a, 'courtyard', 12 * content.rooms.courtyard!.tile);
        await until(failures, "A's hero is in the courtyard on the server", () => findEntity(w, 'p:a')?.room === 'courtyard', () => findEntity(w, 'p:a')?.room ?? 'none');
        await until(failures, "A, in the courtyard, is sent none of the street's entities", () => !a.c.others().some((e) => e.room === AREA && e.player === null), () => `A still draws ${a.c.others().filter((e) => e.room === AREA && e.player === null).map((e) => e.id).join(', ')}`);
        await until(failures, "A's own world, in the courtyard, still shows the street's alert at 2", () => (a.c.world.alerts?.[AREA] ?? 0) === 2, () => `A's world.alerts is ${JSON.stringify(a.c.world.alerts ?? null)}`);
        await until(failures, "B, in the street, has the guards the row brought", () => b.c.others().some((e) => e.id.startsWith(`${AREA}:help`)), () => `B draws ${b.c.others().map((e) => e.id).join(', ')}`);
      }
      a.leave();
      b.leave();
      await until(failures, 'the game is forgotten once its last player is gone', () => !server!.game.worlds.has(name), () => 'still there');
    } finally {
      await server?.stop();
      fs.rmSync(dir, { recursive: true, force: true });
    }
    return failures;
  },
};
export default check;
