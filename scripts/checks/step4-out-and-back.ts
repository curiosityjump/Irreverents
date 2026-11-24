// Step 4, the town's tiers (docs/mechanisms/npc-response.md, "The town's
// tiers"): a raging guard put out of the street comes back. A real server
// on a temporary store (scripts/lib/save-harness.ts), one connection; run by
// `npm run check`.
//
// The street's guard rang the bell himself (alert 1, raging, A's hero his
// offender) and a blow has sent him out by the courtyard door: he is put
// there in the server's world. With nobody who offended him in sight, he
// walks back into the street by the door toward home; there, seeing A's
// hero do something new, he whistles and the street's alert goes to 2.
// Measured on a phone script against a delayed server, before this rule: he
// stayed in the courtyard until the alert cooled (docs/plan/step-4.md,
// "Builder notes", the re-land). Control (watched to fail): the rule off in
// src/sim/systems/alert-whistle.ts, and he is still in the courtyard.
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
  id: 'step4-out-and-back',
  gate: null,
  proves:
    "a raging guard put out of his street while its alert is up comes back: over a real server, the street's guard (alert 1, raging, A's hero his offender) is put in the courtyard; seeing nobody who offended him, he walks back into the street by its door, and there, seeing A's hero do something new, he whistles and the alert goes to 2",
  async run(content: Content): Promise<string[]> {
    const failures: string[] = [];
    if (!content.dispatch?.[AREA]) return [`no content/dispatch/${AREA}.json`];
    const street = content.rooms[AREA]!;
    const yard = content.rooms.courtyard;
    if (!yard) return ['no courtyard room'];
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'irreverents-step4-back-'));
    const name = GAME_PREFIX + 'BACK';
    let server: Booted | null = null;
    try {
      server = await bootServer(content, dir);
      const a = joinAs(content, server.port, 'a', name);
      const online = await until(failures, 'a player joins the game', () => a.c.status() === 'online' && !!server!.game.worlds.get(name), () => a.c.status());
      if (online) {
        const w = server.game.worlds.get(name)!.world;
        // The page owns its body's place: A stands at column 40 of the street, by the guard's beat.
        const me = a.c.me();
        me.room = AREA;
        me.x = 40 * street.tile;
        me.y = 11 * street.tile - content.characters[me.kind]!.box.h;
        me.vx = 0;
        me.vy = 0;
        await until(failures, "A's hero is in the street on the server", () => findEntity(w, 'p:a')?.room === AREA, () => findEntity(w, 'p:a')?.room ?? 'none');
        await until(failures, 'the street has its guard', () => !!findEntity(w, 'street-guard')?.c.npc, () => 'no street-guard person in the server world');
        const guard = findEntity(w, 'street-guard');
        if (!guard?.c.npc) return failures;
        // Alert 1 (he rang the bell himself), raging, A his offender, all of it reported; then put in the courtyard.
        if (!findEntity(w, alertId(AREA))) addEntity(w, { id: alertId(AREA), kind: THING_KIND, player: null, room: AREA, x: 24 * street.tile, y: 160, vx: 0, vy: 0, facing: 1, onGround: true, c: { alert: { level: 1, quiet: 0 } } });
        (w.alerts ??= {})[AREA] = 1;
        delete guard.c.respond;
        guard.c.npc.mood = 3;
        guard.c.npc.dissonance = 4;
        guard.c.npc.offenders = ['p:a'];
        guard.c.whistle = { progress: 0, of: 1, wait: 0, reported: 4 };
        guard.room = 'courtyard';
        guard.x = 6 * yard.tile;
        // On the courtyard's floor by its street door (the door's foot is the floor there).
        const door = yard.doors.find((d) => d.to.room === AREA);
        if (!door) return [...failures, "the courtyard has no door to the street"];
        guard.y = (door.ty + door.h) * yard.tile - content.characters[guard.kind]!.box.h;
        guard.vx = 0;
        guard.vy = 0;
        guard.facing = 1;
        // The server's world may hold a fresh copy of him each tick: look him up every time.
        const g = (): typeof guard => findEntity(w, 'street-guard') ?? guard;
        const back = await until(failures, 'the guard walks back into the street', () => g().room === AREA, () => `he is in ${g().room} at x ${g().x.toFixed(0)}, alert ${w.alerts?.[AREA]}`, 10000);
        if (back) {
          // Back in the street, he sees A's hero do something new (as a blow in his view would add).
          g().c.npc!.dissonance = 6;
          await until(failures, "his whistle completes and the street's alert is 2", () => (w.alerts?.[AREA] ?? 0) === 2, () => `alert ${w.alerts?.[AREA]}, guard at x ${g().x.toFixed(0)} facing ${g().facing}, whistle ${JSON.stringify(g().c.whistle)}`, 10000);
        }
      }
      a.leave();
      await until(failures, 'the game is forgotten once its last player is gone', () => !server!.game.worlds.has(name), () => 'still there');
    } finally {
      await server?.stop();
      fs.rmSync(dir, { recursive: true, force: true });
    }
    return failures;
  },
};
export default check;
