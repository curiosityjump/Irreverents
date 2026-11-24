// node scripts/run-some.ts <regex>: runs only the scenarios whose id matches (npm run check runs them all). Step 22.
import { generateRegistries } from './lib/registries.ts';

generateRegistries();
const { loadContent, loadScenarios } = await import('./lib/content-files.ts');
const { formatProblem } = await import('../src/content/reader.ts');
const { runScenario } = await import('../src/scenarios/run.ts');
const re = new RegExp(process.argv[2] ?? '.');
const loaded = loadContent();
for (const p of loaded.problems) console.log(formatProblem(p));
const { scenarios, problems } = loadScenarios(loaded.content);
for (const p of problems) console.log(formatProblem(p));
let bad = 0;
for (const s of scenarios.filter((s) => re.test(s.id))) {
  const r = runScenario(s, loaded.content);
  if (r.failures.length) { bad++; console.log('FAIL', s.id); for (const f of r.failures) console.log('   ', f); } else console.log('ok  ', s.id);
}
process.exit(bad ? 1 : 0);
