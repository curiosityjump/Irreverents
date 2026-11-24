// node scripts/way-out-audit.ts [hero ...]
// The way-out audit (brief owner-stuck-in-the-quarry, push 2): for every room
// with doors and every roster hero (or the heroes named), prints each patch
// of standing places from which that hero can never reach a door of the
// room, or never get back to the start room, one line per (room, hero,
// tile). A measuring tool over the check `npm run check` already runs
// (src/sim/check-rooms.ts, "The way-out check": the real step(), each
// hero's own jump and tuning, one-way platforms passable upward only;
// docs/mechanisms/rooms-and-doors.md): it plays the heroes one at a time
// so each line names its hero, and says how long each took. Exits non-zero
// when anything is printed.
import { generateRegistries } from './lib/registries.ts';

generateRegistries();
const { loadContent } = await import('./lib/content-files.ts');
const { checkRooms, wayOutCharacters } = await import('../src/sim/check-rooms.ts');
const { systems } = await import('../src/sim/registry.ts');
const { formatProblem } = await import('../src/content/reader.ts');

const loaded = loadContent();
for (const p of loaded.problems) console.log(formatProblem(p));
if (loaded.problems.length) process.exit(1);
const all = wayOutCharacters(loaded.content).map((k) => k.id);
const heroes = process.argv.slice(2).length ? process.argv.slice(2) : all;
let traps = 0;
for (const hero of heroes) {
  if (!all.includes(hero)) {
    console.log(`no roster hero "${hero}" (heroes: ${all.join(', ')})`);
    process.exit(1);
  }
  const t0 = Date.now();
  // Played for this hero alone: the party and the roster narrowed to it.
  const content = { ...loaded.content, party: { ...loaded.content.party, members: [hero] }, roster: { ...loaded.content.roster, characters: [hero], start: [hero] } };
  const problems = checkRooms(content, systems).filter((p) => p.file.startsWith('content/rooms/'));
  for (const p of problems) console.log(`${p.file.replace('content/rooms/', '').replace('.json', '')}  ${hero}  ${p.where}  ${p.message}`);
  traps += problems.length;
  console.log(`# ${hero}: ${problems.length} trap(s), ${((Date.now() - t0) / 1000).toFixed(1)} s`);
}
process.exit(traps ? 1 : 0);
