// Checks that need more than the pure scenario layer allows (a real server,
// sockets): one file each in scripts/checks/, default-exporting a
// ScriptCheck. `npm run check` runs them all after the scenarios;
// `npm run gates` counts the ones tagged with a build gate.
// Add a file, edit no list (docs/mechanisms/scenarios.md).
import fs from 'node:fs';
import path from 'node:path';
import type { Content } from '../../src/content/types.ts';
import { root } from './registries.ts';

export interface ScriptCheck {
  id: string;
  /** Which build gate (A-F) this is evidence for, or null. */
  gate: string | null;
  /** What it proves, in a sentence. */
  proves: string;
  /** Empty when it passed; otherwise what was true instead. */
  run(content: Content): Promise<string[]>;
}

export async function loadScriptChecks(): Promise<ScriptCheck[]> {
  const dir = path.join(root, 'scripts/checks');
  const out: ScriptCheck[] = [];
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.ts')).sort()) {
    out.push(((await import(path.join(dir, file))) as { default: ScriptCheck }).default);
  }
  return out;
}
