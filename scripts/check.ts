// npm run check: type-check, layer rule, content validation, every scenario.
// No browser, no network. Exit code 0 only when all of it passes.
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { generateRegistries, root } from './lib/registries.ts';

generateRegistries();
let failed = false;
const section = (name: string, problems: string[], okNote: string): void => {
  if (problems.length === 0) {
    console.log(`ok    ${name}: ${okNote}`);
    return;
  }
  failed = true;
  console.log(`FAIL  ${name}: ${problems.length} problem(s)`);
  for (const p of problems) console.log(`      ${p}`);
};

// 1. Types. tsconfig.pure.json re-checks the layers that must run anywhere
//    with no DOM and no Node types, so a Node or browser API there is an error.
for (const project of ['tsconfig.json', 'tsconfig.pure.json']) {
  const tsc = spawnSync(process.execPath, [path.join(root, 'node_modules/typescript/bin/tsc'), '--noEmit', '-p', project], { cwd: root, encoding: 'utf8' });
  const out = `${tsc.stdout ?? ''}${tsc.stderr ?? ''}`.trim();
  section(`types (${project})`, tsc.status === 0 ? [] : out.split('\n'), 'no errors');
}

const { checkBoundaries } = await import('./lib/boundaries.ts');
section('layers', checkBoundaries(), 'every import stays inside its layer');

const { loadContent, loadScenarios } = await import('./lib/content-files.ts');
const { formatProblem } = await import('../src/content/reader.ts');
const { runScenario } = await import('../src/scenarios/run.ts');

const loaded = loadContent();
section('content', loaded.problems.map(formatProblem), 'every file in content/ is valid');

if (loaded.problems.length === 0) {
  // Step 3: the room checks' own controls (broken rooms that must stay refused) and the route helper.
  const { runRoomControls } = await import('./lib/room-controls.ts');
  const controls = runRoomControls(loaded.content);
  section('room controls', controls.problems, `${controls.count} broken room file(s) in controls/rooms/ are each refused for the stated reason; the route helper agrees with the map`);
  const { scenarios, problems } = loadScenarios(loaded.content);
  section('scenario files', problems.map(formatProblem), `${scenarios.length} scenario file(s) are well-formed`);
  if (scenarios.length === 0 && problems.length === 0) section('scenarios', ['there are no scenarios in scenarios/: nothing was checked'], '');
  for (const s of scenarios) {
    const result = runScenario(s, loaded.content);
    section(`scenario ${s.id}`, result.failures, s.proves);
  }
} else {
  console.log('skip  scenarios: not run, because the content is not valid');
}

console.log(failed ? '\ncheck: FAILED' : '\ncheck: ok');
process.exit(failed ? 1 : 0);
