// npm run check:deployed (docs/measures.md, M1): is the live address
// running what is on main? Exit 0 when the running commit is the tip of
// origin/main, or when every commit since it changed only files that do not
// redeploy (documents). Non-zero otherwise.
// Optional argument: another base URL, e.g. http://localhost:3000
import { execFileSync } from 'node:child_process';
import { restartsTheGame } from './lib/deploy-paths.ts';
import { root } from './lib/registries.ts';

const base = (process.argv[2] ?? 'https://irreverents-production.up.railway.app').replace(/\/$/, '');
const git = (...args: string[]): string => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();

let health: { ok?: boolean; commit?: string; startedAt?: string };
try {
  const res = await fetch(`${base}/healthz`, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  health = (await res.json()) as typeof health;
} catch (err) {
  console.error(`check:deployed: FAILED, ${base}/healthz did not answer (${(err as Error).message})`);
  process.exit(1);
}

try {
  git('fetch', '-q', 'origin', 'main');
} catch (err) {
  console.error(`check:deployed: FAILED, could not fetch origin/main (${(err as Error).message.split('\n')[0]})`);
  process.exit(1);
}
const tip = git('rev-parse', 'origin/main');
const live = health.commit ?? 'unknown';
console.log(`main:    ${tip}`);
console.log(`running: ${live} (started ${health.startedAt ?? '?'})`);

if (live === tip) {
  console.log('check:deployed: ok, the live address runs the tip of main');
  process.exit(0);
}
let isAncestor = true;
try {
  git('merge-base', '--is-ancestor', live, tip);
} catch {
  isAncestor = false;
}
if (!isAncestor) {
  console.error('check:deployed: FAILED, the running commit is not on main (unknown commit, or history this clone lacks: try git fetch --unshallow)');
  process.exit(1);
}
const changed = git('diff', '--name-only', live, tip).split('\n').filter(Boolean);
const code = changed.filter(restartsTheGame);
if (code.length === 0) {
  console.log(`check:deployed: ok, main is ${git('rev-list', '--count', `${live}..${tip}`)} commit(s) ahead, all documents-only (${changed.length} file(s)), which do not redeploy`);
  process.exit(0);
}
console.error(`check:deployed: FAILED, main has changes that should be live and are not: ${code.slice(0, 8).join(', ')}${code.length > 8 ? `, and ${code.length - 8} more` : ''}`);
console.error('  (a push takes about a minute to go live; if it has been five, the build or the start failed on Railway: revert first, diagnose after)');
process.exit(1);
