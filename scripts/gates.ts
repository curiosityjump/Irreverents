// npm run gates: one line per build gate A-F of the design library
// (docs/measures.md, M3): passing, failing, or no scenario yet.
import { generateRegistries } from './lib/registries.ts';

generateRegistries();
const { loadContent, loadScenarios } = await import('./lib/content-files.ts');
const { formatProblem } = await import('../src/content/reader.ts');
const { GATES, runScenario } = await import('../src/scenarios/run.ts');

const loaded = loadContent();
const { scenarios, problems } = loaded.problems.length ? { scenarios: [], problems: [] } : loadScenarios(loaded.content);
const broken = [...loaded.problems, ...problems];
if (broken.length) {
  // INTENT: with broken data no gate can be judged, and saying "no scenario
  // yet" would hide that; so this is an error, not a count of zero.
  for (const p of broken) console.error(formatProblem(p));
  console.error('gates: cannot report, the content or scenario files are not valid (npm run check)');
  process.exit(2);
}

const { loadScriptChecks } = await import('./lib/script-checks.ts');
const scriptChecks = await loadScriptChecks();

let passing = 0;
let failing = 0;
for (const gate of GATES) {
  const mine = scenarios.filter((s) => s.gate === gate);
  const checks = scriptChecks.filter((c) => c.gate === gate);
  if (mine.length === 0 && checks.length === 0) {
    console.log(`${gate}: no scenario yet`);
    continue;
  }
  const failed: { id: string }[] = mine.map((s) => runScenario(s, loaded.content)).filter((r) => r.failures.length > 0);
  for (const c of checks) if ((await c.run(loaded.content)).length > 0) failed.push({ id: c.id });
  if (failed.length === 0) {
    passing++;
    console.log(`${gate}: passing (${mine.length + checks.length} scenario(s): ${[...mine, ...checks].map((s) => s.id).join(', ')})`);
  } else {
    failing++;
    console.log(`${gate}: failing (${failed.map((r) => r.id).join(', ')}; npm run check says why)`);
  }
}
console.log(`gates passing: ${passing} of ${GATES.length}`);
process.exit(failing ? 1 : 0);
