// The layer rule, checked by reading import lines (docs/architecture.md, "Layers").
import fs from 'node:fs';
import path from 'node:path';
import { root } from './registries.ts';

/** For each layer: the layers its files may import from. */
const MAY_IMPORT: Record<string, string[]> = {
  'src/content': ['src/content'],
  'src/sim': ['src/sim', 'src/content'],
  'src/scenarios': ['src/scenarios', 'src/sim', 'src/content'],
  'src/client': ['src/client', 'src/sim', 'src/content'],
  'src/server': ['src/server', 'src/sim', 'src/content'],
};
/** Layers that must stay free of packages and Node built-ins (they run in the browser too). */
const PURE = ['src/content', 'src/sim', 'src/scenarios'];

function tsFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true, recursive: true })
    .filter((e) => e.isFile() && e.name.endsWith('.ts'))
    .map((e) => path.join(e.parentPath, e.name));
}

export function checkBoundaries(): string[] {
  const problems: string[] = [];
  for (const [layer, allowed] of Object.entries(MAY_IMPORT)) {
    for (const file of tsFiles(path.join(root, layer))) {
      const rel = path.relative(root, file);
      const text = fs.readFileSync(file, 'utf8');
      for (const m of text.matchAll(/(?:from\s+|import\s+|import\(\s*|declare\s+module\s+)['"]([^'"]+)['"]/g)) {
        const spec = m[1]!;
        if (!spec.startsWith('.')) {
          if (PURE.includes(layer)) problems.push(`${rel}: imports "${spec}", but ${layer}/ must stay plain TypeScript (no packages, no Node APIs): it runs in the browser too`);
          continue;
        }
        const target = path.relative(root, path.resolve(path.dirname(file), spec)).split(path.sep).join('/');
        if (!allowed.some((a) => target === a || target.startsWith(`${a}/`))) {
          problems.push(`${rel}: imports "${spec}" (${target}), but ${layer}/ may only import from ${allowed.join(', ')}`);
        }
      }
      // Comments may name these; code may not.
      const code = text.split('\n').filter((line) => !/^\s*(\/\/|\*|\/\*)/.test(line)).join('\n');
      if (PURE.includes(layer) && /\bMath\.random\b|\bDate\.now\b|\bnew Date\b|\bperformance\.now\b/.test(code)) {
        problems.push(`${rel}: uses a clock or Math.random, which would make the simulation differ between devices`);
      }
    }
  }
  return problems;
}
