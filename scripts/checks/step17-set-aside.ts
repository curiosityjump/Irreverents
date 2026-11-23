// Step 17 hardening, item 1 (docs/mechanisms/saves.md, "A world that
// throws"): a save from an older build that makes a system throw must not
// take the server down. Run by `npm run check`.
//
// The "older build" is made the way the review reproduced it: a game is
// saved, then one NPC's state loses a field a later build added
// (`c.npc.offenders`), so the NPC systems throw on the first tick after
// loading it.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { Content } from '../../src/content/types.ts';
import { GAME_PREFIX } from '../../src/server/saves.ts';
import type { SaveRecord } from '../../src/server/saves.ts';
import { DEFAULT_WORLD } from '../../src/net/protocol.ts';
import { bootServer, joinAs, sleep, until } from '../lib/save-harness.ts';
import type { Booted } from '../lib/save-harness.ts';
import type { ScriptCheck } from '../lib/script-checks.ts';

const check: ScriptCheck = {
  id: 'step17-set-aside',
  gate: null,
  proves: "a saved game that throws when stepped (an older build's save missing a field) never takes the server down: its player is told and stops reconnecting, the throw is reported once, the save is left byte for byte as it was, joining it again is refused without a second report, and everyone's kingdom keeps running and takes new players",
  async run(content: Content): Promise<string[]> {
    const failures: string[] = [];
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'irreverents-step17-aside-'));
    const code = 'WXYZ';
    const name = GAME_PREFIX + code;
    const file = path.join(dir, 'irreverents', `save-${code.toLowerCase()}.json`);
    let one: Booted | null = null;
    let two: Booted | null = null;
    try {
      // 1. A real game, saved when its player leaves.
      one = await boot(content, dir);
      const w = joinAs(content, one.port, 'w', name);
      if (!(await until(failures, 'player w joins the game', () => w.c.status() === 'online', () => w.c.status()))) return failures;
      await sleep(300);
      w.leave();
      await until(failures, 'the game is saved and forgotten', () => !one!.game.worlds.has(name) && fs.existsSync(file), () => 'not yet');
      await one.stop();
      one = null;

      // 2. Made into an older build's save: one NPC without `offenders`.
      const saved = JSON.parse(fs.readFileSync(file, 'utf8')) as { records: SaveRecord[] };
      const npc = saved.records[0]?.world.entities.find((e) => (e.c as Record<string, unknown>).npc);
      if (!npc) return [...failures, 'the saved game has no NPC with c.npc to make old (content/placements/ places none?)'];
      delete ((npc.c as Record<string, unknown>).npc as Record<string, unknown>).offenders;
      fs.writeFileSync(file, JSON.stringify(saved));
      const before = fs.readFileSync(file, 'utf8');

      // 3. A new server: someone in main, then someone joins the old save.
      two = await boot(content, dir);
      const m = joinAs(content, two.port, 'm', DEFAULT_WORLD);
      if (!(await until(failures, 'player m joins main', () => m.c.status() === 'online', () => m.c.status()))) return failures;
      const g = joinAs(content, two.port, 'g', name);
      await until(failures, 'the player in the old save is told it is gone', () => g.gone() !== null, () => `g is ${g.c.status()}`, 4000);
      await sleep(500);
      if (g.c.status() === 'online') failures.push('the player in the set-aside game still says online');
      if (!g.c.isGone()) failures.push('the player in the set-aside game did not stop reconnecting');
      const said = two.problems.filter((p) => p.includes('set aside'));
      if (said.length !== 1) failures.push(`the throw should be reported once, but ${said.length} reports say "set aside": ${JSON.stringify(two.problems)}`);
      if (said.some((p) => p.includes(code))) failures.push(`the report names the game's code (no personal data in /debug/errors): ${said.join(' | ')}`);
      if (two.game.worlds.has(name)) failures.push('the set-aside game is still among the live worlds');
      if (fs.readFileSync(file, 'utf8') !== before) failures.push('the set-aside game was written over its save');

      // 4. main keeps running and takes a new player.
      const t0 = m.c.latest().tick;
      await sleep(500);
      if (m.c.status() !== 'online' || m.c.latest().tick <= t0) failures.push(`main stopped: m is ${m.c.status()}, server tick ${t0} then ${m.c.latest().tick}`);
      const n = joinAs(content, two.port, 'n', DEFAULT_WORLD);
      await until(failures, 'a new player joins main after the throw', () => n.c.status() === 'online', () => n.c.status());

      // 5. Joining the old save again is refused, with no second report and no write.
      const h = joinAs(content, two.port, 'h', name);
      await until(failures, 'a second player joining the set-aside game is told it is gone', () => h.gone() !== null, () => `h is ${h.c.status()}`);
      await sleep(300);
      const again = two.problems.filter((p) => p.includes('set aside')).length;
      if (again !== 1) failures.push(`joining the set-aside game again made ${again - 1} more report(s)`);
      if (fs.readFileSync(file, 'utf8') !== before) failures.push('joining the set-aside game again wrote over its save');
      two.game.saveAll();
      if (fs.readFileSync(file, 'utf8') !== before) failures.push('saving every game (as at a deploy) wrote over the set-aside save');
      for (const p of [m, n, g, h]) p.leave();
      await sleep(300);
    } catch (err) {
      failures.push(`the check itself crashed: ${(err as Error).stack ?? String(err)}`);
    } finally {
      if (one) await one.stop();
      if (two) await two.stop();
      fs.rmSync(dir, { recursive: true, force: true });
    }
    return failures;
  },
};
export default check;

const boot = (content: Content, dir: string): Promise<Booted> => bootServer(content, dir);
