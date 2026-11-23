// Reads content/ and scenarios/ from disk. The pure halves are
// src/content/assemble.ts and src/scenarios/run.ts.
// Import this only after generateRegistries() has run (it pulls in the
// generated registries); scripts do that with a dynamic import.
import fs from 'node:fs';
import path from 'node:path';
import { assembleContent } from '../../src/content/assemble.ts';
import type { Content, Problem } from '../../src/content/types.ts';
import { checkContentAgainstSim } from '../../src/sim/check-content.ts';
import { parseScenario } from '../../src/scenarios/run.ts';
import type { Scenario } from '../../src/scenarios/types.ts';
import { root } from './registries.ts';

function jsonFiles(dir: string): string[] {
  const out: string[] = [];
  const walk = (rel: string): void => {
    for (const entry of fs.readdirSync(path.join(dir, rel), { withFileTypes: true })) {
      const next = rel ? `${rel}/${entry.name}` : entry.name;
      if (entry.isDirectory()) walk(next);
      else if (entry.name.endsWith('.json')) out.push(next);
    }
  };
  if (fs.existsSync(dir)) walk('');
  return out.sort();
}

function readJson(file: string, label: string, problems: Problem[]): unknown {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    problems.push({ file: label, where: '(the whole file)', message: `is not valid JSON: ${(err as Error).message}` });
    return undefined;
  }
}

/** Loads and fully validates content/. Use the content only when problems is empty. */
export function loadContent(): { content: Content; problems: Problem[] } {
  const dir = path.join(root, 'content');
  const syntax: Problem[] = [];
  const files: Record<string, unknown> = {};
  for (const rel of jsonFiles(dir)) {
    const raw = readJson(path.join(dir, rel), `content/${rel}`, syntax);
    if (raw !== undefined) files[rel] = raw;
  }
  if (syntax.length) return { content: {} as Content, problems: syntax };
  const { content, problems } = assembleContent(files);
  if (problems.length === 0) problems.push(...checkContentAgainstSim(content));
  return { content, problems };
}

/** Loads and validates every scenarios/*.json against already-valid content. */
export function loadScenarios(content: Content): { scenarios: Scenario[]; problems: Problem[] } {
  const dir = path.join(root, 'scenarios');
  const problems: Problem[] = [];
  const scenarios: Scenario[] = [];
  for (const rel of jsonFiles(dir)) {
    const file = `scenarios/${rel}`;
    const raw = readJson(path.join(dir, rel), file, problems);
    if (raw === undefined) continue;
    const scenario = parseScenario(raw, file, rel.replace(/\.json$/, ''), content, problems);
    if (scenario) scenarios.push(scenario);
  }
  return { scenarios, problems };
}
