// Step 14 slice A (docs/mechanisms/levels.md): levels are data the check
// refuses when they name what is not there, and a kept game keeps what has
// been discovered across everyone leaving and a rebuilt server. A real
// server on a temporary store (scripts/lib/save-harness.ts); run by
// `npm run check`.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { assembleContent } from '../../src/content/assemble.ts';
import { formatProblem } from '../../src/content/reader.ts';
import type { Content } from '../../src/content/types.ts';
import { GAME_PREFIX } from '../../src/server/saves.ts';
import { levelProgress } from '../../src/sim/levels.ts';
import { bootServer, joinAs, until } from '../lib/save-harness.ts';
import type { Booted } from '../lib/save-harness.ts';
import { root } from '../lib/registries.ts';
import type { ScriptCheck } from '../lib/script-checks.ts';

function contentFiles(): Record<string, unknown> {
  const dir = path.join(root, 'content');
  const files: Record<string, unknown> = {};
  for (const e of fs.readdirSync(dir, { withFileTypes: true, recursive: true })) {
    if (!e.isFile() || !e.name.endsWith('.json')) continue;
    const full = path.join(e.parentPath, e.name);
    files[path.relative(dir, full).split(path.sep).join('/')] = JSON.parse(fs.readFileSync(full, 'utf8'));
  }
  return files;
}

/** The content check's answer with level files laid over the real ones. */
function refusals(base: Record<string, unknown>, levels: Record<string, unknown>): string[] {
  const files = { ...base };
  for (const [id, lv] of Object.entries(levels)) files[`levels/${id}.json`] = lv;
  return assembleContent(files).problems.map(formatProblem);
}

const check: ScriptCheck = {
  id: 'step14-levels',
  gate: null,
  proves:
    "levels are data the check holds to the map (a level naming a room or an entry door that does not exist, an entry that does not lead in, or a room in two levels is refused; the real levels pass), and a kept game keeps its discovered levels: a hero goes into the quarry, everyone leaves, a new server on the same store loads the game and its world and the joining page's own world both say the quarry is discovered with the road seen, while a new game's does not",
  async run(content: Content): Promise<string[]> {
    const failures: string[] = [];

    // 1. The content rules, each with the real levels as the passing side.
    const base = contentFiles();
    const real = refusals(base, {}).filter((l) => l.includes('content/levels/'));
    if (real.length) failures.push(`the real levels are refused: ${real.join(' | ')}`);
    const quarry = base['levels/iron-quarry.json'] as Record<string, unknown>;
    const cases: [string, Record<string, unknown>, string][] = [
      ['a room that does not exist', { 'iron-quarry': { ...quarry, rooms: [...(quarry.rooms as string[]), 'no-such-room'] } }, 'no room "no-such-room"'],
      ['an entry door that does not exist', { 'iron-quarry': { ...quarry, entries: [{ room: 'courtyard', door: 'no-such-door' }] } }, 'has no door "no-such-door"'],
      ['an entry that leads elsewhere', { 'iron-quarry': { ...quarry, entries: [{ room: 'courtyard', door: 'to-outpost' }] } }, 'not one of this level\'s rooms'],
      ['a room in two levels', { 'second-quarry': { ...quarry, id: 'second-quarry', entries: [] } }, 'is already in level'],
    ];
    for (const [what, files, want] of cases) {
      const got = refusals(base, files);
      if (!got.some((l) => l.includes('content/levels/') && l.includes(want))) failures.push(`a level with ${what} is not refused for it (wanted a line with ${JSON.stringify(want)}; got ${got.slice(0, 3).join(' | ') || 'nothing'})`);
    }

    // 2. A kept game keeps its discovered levels.
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'irreverents-step14-'));
    const code = 'KVQR';
    const fresh = 'MVZW';
    const name = GAME_PREFIX + code;
    const road = content.rooms['quarry-road'];
    let server: Booted | null = null;
    try {
      if (!road) return [...failures, 'no room quarry-road'];
      server = await bootServer(content, dir);
      const a = joinAs(content, server.port, 'a', name);
      if (await until(failures, 'player a joins the game', () => a.c.status() === 'online' && !!server!.game.worlds.get(name), () => a.c.status())) {
        const w = server.game.worlds.get(name)!.world;
        if (levelProgress(w, content, 'iron-quarry').discovered) failures.push('the quarry is discovered before anyone has been in it');
        // The page owns its body's room (docs/mechanisms/network.md): put a's hero on the road's floor, as a door would.
        const me = a.c.me();
        const spawn = road.spawns[0]!;
        me.room = road.id;
        me.x = spawn.tx * road.tile;
        me.y = spawn.ty * road.tile + road.tile - (content.characters[me.kind]?.box.h ?? 16);
        me.vx = 0;
        me.vy = 0;
        await until(failures, "the server's world records the quarry as discovered", () => levelProgress(w, content, 'iron-quarry').discovered, () => JSON.stringify(w.levels ?? {}));
        await until(failures, "a's own page holds the server's record", () => levelProgress(a.c.world, content, 'iron-quarry').discovered, () => JSON.stringify(a.c.world.levels ?? {}));
      }
      a.leave();
      await until(failures, 'the game is forgotten once its last player is gone', () => !server!.game.worlds.has(name), () => 'still there');
      await server.stop();

      server = await bootServer(content, dir);
      const b = joinAs(content, server.port, 'b', name);
      if (await until(failures, 'player b joins the saved game', () => b.c.status() === 'online' && !!server!.game.worlds.get(name), () => b.c.status())) {
        const w = server.game.worlds.get(name)!.world;
        const p = levelProgress(w, content, 'iron-quarry');
        if (!p.discovered || !w.levels?.['iron-quarry']?.seen.includes('quarry-road')) failures.push(`after the restart the quarry's record is ${JSON.stringify(w.levels?.['iron-quarry'])}, expected discovered with quarry-road seen`);
        await until(failures, "b's own page holds the kept record", () => (b.c.world.levels?.['iron-quarry']?.seen ?? []).includes('quarry-road'), () => JSON.stringify(b.c.world.levels ?? {}));
      }
      b.leave();
      const c = joinAs(content, server.port, 'c', GAME_PREFIX + fresh);
      if (await until(failures, 'player c joins a new game', () => c.c.status() === 'online' && !!server!.game.worlds.get(GAME_PREFIX + fresh), () => c.c.status())) {
        const w = server.game.worlds.get(GAME_PREFIX + fresh)!.world;
        if (levelProgress(w, content, 'iron-quarry').discovered) failures.push(`a new game (${fresh}) has the other game's quarry discovered`);
      }
      c.leave();
      await until(failures, 'both games are forgotten', () => server!.game.worlds.size === 0, () => [...server!.game.worlds.keys()].join(', '));
    } finally {
      await server?.stop();
      fs.rmSync(dir, { recursive: true, force: true });
    }
    return failures;
  },
};
export default check;
