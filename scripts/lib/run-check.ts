// node scripts/lib/run-check.ts <regex> [times]: runs only the scripted checks
// (scripts/checks/) whose id matches, `times` times over (default 1), and
// prints each failure and a tally. `npm run check` runs them all, once, after
// the scenarios; this changes nothing in it. Step 20 (the machine check that
// fails some runs): a rate needs many runs of one check, not of the whole gate.
import { generateRegistries } from './registries.ts';

generateRegistries();
const { loadContent } = await import('./content-files.ts');
const { loadScriptChecks } = await import('./script-checks.ts');
const re = new RegExp(process.argv[2] ?? '.');
const times = Math.max(1, Number(process.argv[3]) || 1);
const loaded = loadContent();
if (loaded.problems.length) {
  console.log('the content is not valid: run npm run check');
  process.exit(1);
}
const checks = (await loadScriptChecks()).filter((c) => re.test(c.id));
let bad = 0;
for (const c of checks) {
  let failed = 0;
  for (let i = 1; i <= times; i++) {
    const problems = await c.run(loaded.content);
    if (problems.length) {
      failed++;
      console.log(`FAIL  check ${c.id} (run ${i} of ${times}): ${problems.length} problem(s)`);
      for (const p of problems) console.log(`      ${p}`);
    } else if (times === 1) console.log(`ok    check ${c.id}`);
  }
  if (times > 1) console.log(`${failed ? 'FAIL' : 'ok  '}  check ${c.id}: failed ${failed} of ${times}`);
  if (failed) bad++;
}
if (checks.length === 0) console.log(`no scripted check matches ${re}`);
process.exit(bad || checks.length === 0 ? 1 : 0);
