// node scripts/trace.ts <scenario id> [every N ticks]
// Prints where each player is as a scenario runs, and every event: the
// tool for finding the numbers to write into a scenario's "expect".
import { generateRegistries } from './lib/registries.ts';

generateRegistries();
const { loadContent, loadScenarios } = await import('./lib/content-files.ts');
const { formatProblem } = await import('../src/content/reader.ts');
const { simulate } = await import('../src/scenarios/run.ts');
const { feet, round2 } = await import('../src/scenarios/fact-helpers.ts');

const id = process.argv[2];
const every = Number(process.argv[3]) || 10;
const loaded = loadContent();
const { scenarios, problems } = loaded.problems.length ? { scenarios: [], problems: loaded.problems } : loadScenarios(loaded.content);
for (const p of problems) console.error(formatProblem(p));
const scenario = scenarios.find((s) => s.id === id);
if (!scenario) {
  console.error(`usage: node scripts/trace.ts <scenario id> [every N ticks]; scenarios: ${scenarios.map((s) => s.id).join(', ')}`);
  process.exit(1);
}
const rec = simulate(scenario, loaded.content);
rec.history.forEach((world, tick) => {
  if (tick % every !== 0 && tick !== scenario.ticks) return;
  // A thing or an alert has no character box: only bodies are traced.
  const who = world.entities.filter((e) => e.kind in loaded.content.characters).map((e) => {
    const f = feet(rec, e);
    return `${e.player ?? e.id} in ${e.room}: feet ${round2(f.x)},${round2(f.y)} tile [${f.tx},${f.ty}] v ${round2(e.vx)},${round2(e.vy)} ${e.onGround ? 'ground' : 'air'}`;
  });
  console.log(`tick ${String(tick).padStart(4)}  ${who.join('  |  ')}`);
});
for (const e of rec.events) console.log(`event ${JSON.stringify(e)}`);
