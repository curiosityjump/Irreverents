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
    if (!isRecord(raw) || !isRecord(raw.rooms) || !Array.isArray(raw.expect) || raw.expect.length === 0 || !raw.expect.every((x) => typeof x === 'string')) {
      problems.push(`${file}: must be { "expect": [text every matching problem line contains, ...], "rooms": { "<room id>": <a room file> } }`);
      continue;
    }
    // The real content plus this control's rooms; `game` may be replaced the same way.
    const files = { ...base };
    for (const [id, room] of Object.entries(raw.rooms)) files[`rooms/${id}.json`] = room;
    if (raw.game !== undefined) files['game.json'] = raw.game;
    const assembled = assembleContent(files);
    const found = assembled.problems.length ? assembled.problems : checkContentAgainstSim(assembled.content);
    const lines = found.map(formatProblem);
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
