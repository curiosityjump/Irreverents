// node scripts/scenario-trace.ts <scenario-id> [every=30] [entity=p:a]
// A measuring tool (Step 22 push 5 part 2), not a check: replays one scenario
// and prints where one body is (room, tile column and row, on the ground or
// not) every N ticks, plus the run's room changes, so a scenario broken by a
// layout or placement change can be seen to go astray where it does.
import { generateRegistries } from './lib/registries.ts';

generateRegistries();
const { loadContent, loadScenarios } = await import('./lib/content-files.ts');
const { simulate } = await import('../src/scenarios/run.ts');
const [id, everyArg, who = 'p:a'] = process.argv.slice(2);
const every = Number(everyArg) || 30;
const loaded = loadContent();
const s = loadScenarios(loaded.content).scenarios.find((x) => x.id === id);
if (!s) throw new Error(`no scenario ${id}`);
const rec = simulate(s, loaded.content);
rec.history.forEach((w, t) => {
  const e = w.entities.find((x) => x.id === who);
  if (!e || t % every) return;
  console.log(`t ${t} ${e.room} col ${(e.x / 16).toFixed(1)} row ${(e.y / 16).toFixed(1)} ${e.onGround ? 'G' : 'A'}`);
});
for (const ev of rec.events) if (ev.type === 'changed-room' && (ev as { entity?: string }).entity === who) console.log(JSON.stringify(ev));
