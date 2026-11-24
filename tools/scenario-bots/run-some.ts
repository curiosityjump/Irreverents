// Scratch (Step 15 push 3): run the scenarios whose ids match a regex, as npm run check does, without the rest.
// node tools/scenario-bots/run-some.ts '<regex>'   (loads content with its checks; tens of seconds)
const R = new URL('../..', import.meta.url).pathname.replace(/\/$/, '');
const { generateRegistries } = await import(R + '/scripts/lib/registries.ts');
generateRegistries();
const { loadContent, loadScenarios } = await import(R + '/scripts/lib/content-files.ts');
const { runScenario } = await import(R + '/src/scenarios/run.ts');
const loaded = loadContent();
if (loaded.problems.length) { console.log(JSON.stringify(loaded.problems, null, 1)); process.exit(1); }
const { scenarios, problems } = loadScenarios(loaded.content);
if (problems.length) console.log(JSON.stringify(problems, null, 1));
const re = new RegExp(process.argv[2] ?? '.');
let bad = 0;
for (const s of scenarios) {
  if (!re.test(s.id)) continue;
  const r = runScenario(s, loaded.content);
  console.log(`${r.failures.length ? 'FAIL' : 'ok  '} ${s.id}`);
  for (const f of r.failures) console.log('     ' + f);
  if (r.failures.length) bad++;
}
process.exit(bad ? 1 : 0);
