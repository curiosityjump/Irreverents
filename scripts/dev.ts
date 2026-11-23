// npm run dev: build, serve on PORT (default 3000), and rebuild + restart
// whenever src/ or content/ changes. DRAFT: no hot reload; refresh the page.
import { spawn } from 'node:child_process';
import type { ChildProcess } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { root } from './lib/registries.ts';

let server: ChildProcess | null = null;
let building = false;
let again = false;

function runBuild(): Promise<boolean> {
  // A fresh process each time, so edited build code and content are re-read.
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [path.join(root, 'scripts/build.ts')], { cwd: root, stdio: 'inherit' });
    child.on('exit', (code) => resolve(code === 0));
  });
}

async function rebuild(): Promise<void> {
  if (building) {
    again = true;
    return;
  }
  building = true;
  const ok = await runBuild();
  building = false;
  if (ok) {
    server?.kill();
    server = spawn(process.execPath, [path.join(root, 'dist/server.cjs')], { cwd: root, stdio: 'inherit' });
  } else {
    console.error('dev: build failed; still serving the last good build');
  }
  if (again) {
    again = false;
    void rebuild();
  }
}

let timer: NodeJS.Timeout | undefined;
for (const dir of ['src', 'content']) {
  fs.watch(path.join(root, dir), { recursive: true }, (_event, file) => {
    if (file && String(file).endsWith('.gen.ts')) return;
    clearTimeout(timer);
    timer = setTimeout(() => void rebuild(), 150);
  });
}
process.on('SIGINT', () => {
  server?.kill();
  process.exit(0);
});
process.on('SIGTERM', () => {
  server?.kill();
  process.exit(0);
});
void rebuild();
