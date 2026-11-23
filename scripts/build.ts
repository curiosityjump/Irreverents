// npm run build: everything npm start needs, into dist/.
//   dist/server.cjs      the server, bundled with its one dependency (ws)
//   dist/public/         the client page
import fs from 'node:fs';
import path from 'node:path';
import * as esbuild from 'esbuild';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');

export async function build(): Promise<void> {
  fs.rmSync(dist, { recursive: true, force: true });
  fs.mkdirSync(path.join(dist, 'public'), { recursive: true });

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
    // ws try-requires these optional native speedups; they are not installed.
    external: ['bufferutil', 'utf-8-validate'],
    logLevel: 'warning',
  });

  fs.copyFileSync(path.join(root, 'src/client/index.html'), path.join(dist, 'public/index.html'));
}

if (import.meta.main ?? process.argv[1] === import.meta.filename) {
  await build();
  console.log('build: ok');
}
