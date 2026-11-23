// Step 17 hardening, push B (docs/mechanisms/saves.md, "Later builds"): a
// saved game keeps working when the build that loads it is newer than the
// one that saved it. Saves and loads straight through src/server/saves.ts
// (no server, no sockets); the "later build" is the same content with
// changes a later push could make. Run by `npm run check`.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { Room } from '../../src/content/kinds/rooms.ts';
import type { Content } from '../../src/content/types.ts';
import { clone } from '../../src/net/protocol.ts';
import { createSaves, SAVE_VERSION } from '../../src/server/saves.ts';
import type { SaveRecord } from '../../src/server/saves.ts';
import { openStore } from '../../src/server/store.ts';
import { step } from '../../src/sim/step.ts';
import type { World } from '../../src/sim/types.ts';
import { createWorld, removeEntity, populateRoom } from '../../src/sim/world.ts';
import type { ScriptCheck } from '../lib/script-checks.ts';

/** The room `room` two columns wider on the right (the new columns copy the old last column), as a later build might edit it. */
function widened(room: Room): Room {
  const cells: number[] = [];
  for (let ty = 0; ty < room.h; ty++) {
    const row = room.cells.slice(ty * room.w, (ty + 1) * room.w);
    cells.push(...row, row[room.w - 1]!, row[room.w - 1]!);
  }
  return { ...room, w: room.w + 2, cells };
}

const check: ScriptCheck = {
  id: 'step17-later-builds',
  gate: null,
  proves: "a game saved by one build loads right in a later one: a placement the later build adds appears while one that left the world stays gone; a room widened since keeps each part's state with its solid tiles under the part, none stray; a top-level World field a later step adds survives a save and a load; and a record of a newer version than this build knows is neither loaded nor written over",
  async run(content: Content): Promise<string[]> {
    const failures: string[] = [];
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'irreverents-step17-later-'));
    const problems: string[] = [];
    try {
      // The game as the first build plays it: every room set up, a few ticks
      // stepped so every gate and breakable has laid its tiles.
      const world: World = createWorld();
      for (const id of Object.keys(content.rooms)) populateRoom(world, content, id);
      for (let i = 0; i < 3; i++) step(world, {}, content);
      // A placed body that left the world for good (none can today; a later step's could).
      const leaving = Object.values(content.placements ?? {}).flatMap((p) => p.place)[0]?.id;
      if (!leaving) return ['content/placements/ places nothing to remove'];
      removeEntity(world, leaving);
      // A top-level field a later step adds to World.
      (world as unknown as Record<string, unknown>).laterField = { kept: true };
      const roomsWithTiles = Object.entries(world.rooms ?? {}).filter(([, s]) => Object.keys(s.tiles).length > 0).map(([id]) => id);
      if (roomsWithTiles.length === 0) return ['no room has tile overrides after three ticks (no gate or breakable laid any): nothing to check item 4 with'];

      const first = createSaves(openStore(dir), { content, commit: 'first', problem: (m) => problems.push(m) });
      first.save('TRBK', world);

      // The later build: every room with overrides widened by two columns on
      // the right, and one new placement in a room that has placements.
      const later: Content = { ...content, rooms: { ...content.rooms }, placements: clone(content.placements) };
      for (const id of roomsWithTiles) later.rooms[id] = widened(content.rooms[id]!);
      const host = Object.keys(later.placements).find((r) => later.placements[r]!.place.some((p) => p.id !== leaving))!;
      const model = later.placements[host]!.place.find((p) => p.id !== leaving)!;
      later.placements[host]!.place.push({ ...clone(model), id: 'later:new-body', npc: undefined, routine: undefined });
      const second = createSaves(openStore(dir), { content: later, commit: 'later', problem: (m) => problems.push(m) });
      const loaded = second.load('TRBK');
      if (!loaded || 'newer' in loaded) return [...failures, `the save did not load in the later build (${JSON.stringify(loaded)}; ${problems.join(' | ')})`];
      const w = loaded.world;

      // 3. Placements.
      if (!w.entities.some((e) => e.id === 'later:new-body')) failures.push(`a placement the later build added (later:new-body in ${host}) is not in the loaded game`);
      if (w.entities.some((e) => e.id === leaving)) failures.push(`${leaving}, which had left the world before the save, came back on loading`);
      if (w.entities.filter((e) => e.id === model.id).length !== 1) failures.push(`${model.id} is in the loaded game ${w.entities.filter((e) => e.id === model.id).length} times`);

      // 4. Every override lies under a part of the widened room, at the cell it was at.
      for (const id of roomsWithTiles) {
        const room = later.rooms[id]!;
        const before = world.rooms![id]!;
        const after = w.rooms?.[id];
        const partCells = new Set(room.parts.flatMap((p) => p.tiles.map((t) => t.ty * room.w + t.tx)));
        const stray = Object.keys(after?.tiles ?? {}).map(Number).filter((i) => !partCells.has(i));
        if (stray.length > 0) failures.push(`${id} widened: ${stray.length} solid override(s) outside every part, at ${stray.slice(0, 4).map((i) => `(${i % room.w},${Math.floor(i / room.w)})`).join(' ')} (invisible walls)`);
        const want = Object.keys(before.tiles).map(Number).map((i) => (Math.floor(i / content.rooms[id]!.w) * room.w + (i % content.rooms[id]!.w))).sort((a, b) => a - b);
        const got = Object.keys(after?.tiles ?? {}).map(Number).sort((a, b) => a - b);
        if (want.join() !== got.join()) failures.push(`${id} widened: overrides at cells [${got.join(',')}], expected the same (x, y) as before: [${want.join(',')}]`);
        for (const p of room.parts) if (before.parts[p.id] && JSON.stringify(after?.parts[p.id]) !== JSON.stringify(before.parts[p.id])) failures.push(`${id} widened: part ${p.id}'s state was ${JSON.stringify(before.parts[p.id])}, loaded as ${JSON.stringify(after?.parts[p.id])}`);
      }
      if (!problems.some((m) => m.includes('changed since'))) failures.push(`loading into rooms changed since the save was not said (${JSON.stringify(problems)})`);

      // 5. Top-level fields.
      if (JSON.stringify((w as unknown as Record<string, unknown>).laterField) !== '{"kept":true}') failures.push(`a top-level World field (laterField) was lost on loading: ${JSON.stringify((w as unknown as Record<string, unknown>).laterField)}`);

      // 6. A newer version's record.
      const file = path.join(dir, 'irreverents', 'save-nwer.json');
      const newer: SaveRecord = { version: SAVE_VERSION + 1, code: 'NWER', savedAt: new Date().toISOString(), commit: 'future', rooms: [], world: clone(world) };
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, JSON.stringify({ version: 1, collection: 'save-nwer', records: [newer] }));
      const bytes = fs.readFileSync(file, 'utf8');
      const third = createSaves(openStore(dir), { content, commit: 'now', problem: (m) => problems.push(m) });
      const got = third.load('NWER');
      if (!got || !('newer' in got)) failures.push(`a record of version ${SAVE_VERSION + 1} was ${got ? 'loaded' : 'treated as no save'}; expected it refused as newer`);
      third.save('NWER', world);
      if (fs.readFileSync(file, 'utf8') !== bytes) failures.push(`a record of version ${SAVE_VERSION + 1} was written over`);
    } catch (err) {
      failures.push(`the check itself crashed: ${(err as Error).stack ?? String(err)}`);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
    return failures;
  },
};
export default check;
