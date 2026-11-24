// The room checks' own controls (Step 3): broken rooms that npm run check
// must keep refusing, each for the stated reason, and a direct check of the
// route helper. They live in controls/rooms/, never in content/rooms/, and
// run on every check so a control cannot quietly stop failing.
// docs/mechanisms/rooms-and-doors.md, "The controls".
import fs from 'node:fs';
import path from 'node:path';
import { assembleContent } from '../../src/content/assemble.ts';
import { formatProblem, isRecord } from '../../src/content/reader.ts';
import type { Content } from '../../src/content/types.ts';
import { checkContentAgainstSim } from '../../src/sim/check-content.ts';
import { checkRooms } from '../../src/sim/check-rooms.ts';
import { systems } from '../../src/sim/registry.ts';
import { doorToward } from '../../src/sim/room-routes.ts';
import { root } from './registries.ts';

function contentFiles(): Record<string, unknown> {
  const dir = path.join(root, 'content');
  const files: Record<string, unknown> = {};
  for (const e of fs.readdirSync(dir, { withFileTypes: true, recursive: true })) {
    if (!e.isFile() || !e.name.endsWith('.json')) continue;
    const abs = path.join(e.parentPath, e.name);
    files[path.relative(dir, abs).split(path.sep).join('/')] = JSON.parse(fs.readFileSync(abs, 'utf8'));
  }
  return files;
}

/** Runs every control. Returns what is wrong (a control that passed the check, or failed for another reason) and how many ran. */
export function runRoomControls(content: Content): { problems: string[]; count: number } {
  const problems: string[] = [];
  const dir = path.join(root, 'controls/rooms');
  const names = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort() : [];
  const base = contentFiles();
  for (const name of names) {
    const file = `controls/rooms/${name}`;
    let raw: unknown;
    try {
      raw = JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'));
    } catch (err) {
      problems.push(`${file}: is not valid JSON: ${(err as Error).message}`);
      continue;
    }
    // "accept": true turns a control round: these rooms must pass. It pins the edge of a rule from the allowed side.
    const accept = isRecord(raw) && raw.accept === true;
    if (!isRecord(raw) || !isRecord(raw.rooms) || (!accept && (!Array.isArray(raw.expect) || raw.expect.length === 0 || !raw.expect.every((x) => typeof x === 'string')))) {
      problems.push(`${file}: must be { "expect": [text every matching problem line contains, ...], "rooms": { "<room id>": <a room file> }, optional "game": <a game.json, making the control a map of its own> }, or "accept": true in place of "expect"`);
      continue;
    }
    // The real content plus this control's rooms. A control that brings its
    // own `game` is a whole map of its own: the real rooms, what is
    // placed in them and the outposts in them (Step 12) and the levels made of them and their pieces (Step 14) and the heists in them (Step 19) and the captives in them (Step 13) and their dispatch tables (Step 4, the town's tiers) and their defeat files (Step 21) and the stages made of them (Step 22), are left out so only the control's rooms are judged.
    // The art named after real rooms goes too, and the powers and the weapons (a source names a real room): neither changes a room's
    // logic (collision never depends on art; docs/mechanisms/art-pipeline.md).
    const files = { ...base };
    if (raw.game !== undefined) {
      for (const rel of Object.keys(files)) if (/^(rooms|placements|outposts|dispatch|cantina|levels|completion|heists|atlases|backdrops|decor|looks|powers|recruits|hall|defeat|stages|weapons)\//.test(rel)) delete files[rel];
      files['game.json'] = raw.game;
      // Step 21, hearts: content/hearts.json's game over names a real room (the cantina); in a map of its own it is that map's start room.
      const hearts = files['hearts.json'];
      if (isRecord(hearts) && isRecord(raw.game) && typeof raw.game.startRoom === 'string') files['hearts.json'] = { ...hearts, gameOver: { room: raw.game.startRoom, beat: isRecord(hearts.gameOver) ? hearts.gameOver.beat : 1 } };
    }
    for (const [id, room] of Object.entries(raw.rooms)) files[`rooms/${id}.json`] = room;
    const assembled = assembleContent(files);
    // "controlKinds": part kinds that exist only for this control ({ "<kind>": { "blocks": true } }), as if a system declared them.
    let found = assembled.problems.length ? assembled.problems : checkContentAgainstSim(assembled.content);
    if (isRecord(raw.controlKinds) && assembled.problems.length === 0) {
      const parts: Record<string, { what: string; blocks?: boolean }> = {};
      for (const [kind, rule] of Object.entries(raw.controlKinds)) parts[kind] = { what: 'a control-only kind', blocks: isRecord(rule) && rule.blocks === true };
      found = checkRooms(assembled.content, [...systems, { id: 'room-control', order: 9999, parts, run() {} }]);
    }
    const lines = found.map(formatProblem);
    if (accept) {
      if (lines.length > 0) problems.push(`${file}: these rooms must be accepted, but the check refuses them: ${lines.slice(0, 3).join(' | ')}`);
      continue;
    }
    const expect = raw.expect as string[];
    if (lines.length === 0) problems.push(`${file}: the check accepted these rooms, but it must refuse them (${String(raw['//'] ?? 'no note')})`);
    else if (!lines.some((l) => expect.every((x) => l.includes(x)))) {
      problems.push(`${file}: refused, but not for the stated reason. Expected one line containing ${expect.map((x) => JSON.stringify(x)).join(' and ')}; got: ${lines.slice(0, 3).join(' | ')}`);
    }
  }

  // The route helper, on the real rooms (scenario-free: it reads only content).
  const route = (from: string, to: string): string | null => doorToward(content, from, to)?.id ?? null;
  const want: [string, string, string | null][] = [
    ['throne-room', 'castle-street', 'to-street'],
    ['castle-street', 'throne-room', 'to-throne-room'],
    ['throne-room', 'throne-room', null],
    ['throne-room', 'graybox-hall', null],
  ];
  for (const [from, to, door] of want) {
    if (content.rooms[from] && content.rooms[to] && route(from, to) !== door) {
      problems.push(`doorToward("${from}", "${to}") is ${JSON.stringify(route(from, to))}, expected ${JSON.stringify(door)} (src/sim/room-routes.ts)`);
    }
  }
  return { problems, count: names.length };
}
