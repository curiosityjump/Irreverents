// npm run build: everything npm start needs, into dist/.
//   dist/server.cjs      the server, bundled with its one dependency (ws)
//   dist/public/         the client: index.html and game.js
// The validated content is baked into both bundles as __CONTENT__, so the
// deploy reads nothing from content/ at run time.
import fs from 'node:fs';
import path from 'node:path';
import * as esbuild from 'esbuild';
import { generateRegistries, root } from './lib/registries.ts';

const dist = path.join(root, 'dist');

export async function build(): Promise<boolean> {
  generateRegistries();
  const { loadContent } = await import('./lib/content-files.ts');
  const { formatProblem } = await import('../src/content/reader.ts');
  const { content, problems } = loadContent();
  if (problems.length) {
    // INTENT: a build with broken content fails rather than shipping it; on
    // Railway a failed build leaves the previous deploy serving.
    for (const p of problems) console.error(formatProblem(p));
    console.error(`build: FAILED, ${problems.length} content problem(s)`);
    return false;
  }

  fs.rmSync(dist, { recursive: true, force: true });
  fs.mkdirSync(path.join(dist, 'public'), { recursive: true });
  const define = { __CONTENT__: JSON.stringify(content) };

  // INTENT: the server is bundled to one file so `npm start` needs nothing
  // from node_modules at run time (docs/plan/step-1.md, "npm start must not
  // need development-only packages").
  await esbuild.build({
    entryPoints: [path.join(root, 'src/server/main.ts')],
    outfile: path.join(dist, 'server.cjs'),
    bundle: true,
    platform: 'node',
    target: 'node22',
    format: 'cjs',
    define,
    // ws try-requires these optional native speedups; they are not installed.
    external: ['bufferutil', 'utf-8-validate'],
    logLevel: 'warning',
  });

  await esbuild.build({
    entryPoints: [path.join(root, 'src/client/main.ts')],
    outfile: path.join(dist, 'public/game.js'),
    bundle: true,
    platform: 'browser',
    // DRAFT: iOS 15 and later. Raise or lower once the owner's friends' phones are known.
    target: ['safari15', 'es2020'],
    format: 'iife',
    minify: true,
    sourcemap: true,
    define,
    logLevel: 'warning',
  });

  fs.copyFileSync(path.join(root, 'src/client/index.html'), path.join(dist, 'public/index.html'));
  // Art the game uses lives in assets/ (the design-library mirror is reference, never runtime).
  const assets = path.join(root, 'assets');
  if (fs.existsSync(assets)) fs.cpSync(assets, path.join(dist, 'public/assets'), { recursive: true });
  return true;
}

if (import.meta.main) {
  const ok = await build();
  if (ok) console.log('build: ok');
  process.exit(ok ? 0 : 1);
}
