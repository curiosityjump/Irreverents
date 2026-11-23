import kinds from './kinds/index.gen.ts';
import { makeReader } from './reader.ts';
import type { Content, Problem } from './types.ts';

/** INTENT: ids are contracts once deployed, so they are kept boring: lower-case words joined by dashes. */
export const ID_PATTERN = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

/**
 * Builds Content from raw files and reports every problem found.
 * `files` maps a path under content/ (e.g. "rooms/graybox-hall.json") to its
 * parsed JSON. Pure: reading the disk is scripts/lib/content-files.ts.
 */
export function assembleContent(files: Record<string, unknown>): { content: Content; problems: Problem[] } {
  const problems: Problem[] = [];
  const content: Record<string, unknown> = {};
  const claimed = new Set<string>();
  const paths = Object.keys(files).sort();

  for (const kind of kinds) {
    if ('file' in kind.source) {
      const rel = kind.source.file;
      claimed.add(rel);
      const file = `content/${rel}`;
      if (!(rel in files)) {
        problems.push({ file, where: '(the whole file)', message: 'this file is required and is missing' });
        continue;
      }
      content[kind.id] = kind.parse(files[rel], makeReader(file, problems));
    } else {
      const prefix = `${kind.source.dir}/`;
      const items: Record<string, unknown> = {};
      for (const rel of paths) {
        if (!rel.startsWith(prefix)) continue;
        claimed.add(rel);
        const file = `content/${rel}`;
        const stem = rel.slice(prefix.length).replace(/\.json$/, '');
        const read = makeReader(file, problems);
        if (!ID_PATTERN.test(stem)) {
          read.fail('(the file name)', `"${stem}" is not a valid id: use lower-case letters, digits and dashes, starting with a letter`);
        }
        const raw = files[rel];
        const parsed = kind.parse(raw, read);
        const id = (raw as { id?: unknown } | null)?.id;
        if (id !== stem) {
          read.fail('id', `must match the file name "${stem}", but is ${JSON.stringify(id)}`);
        }
        if (parsed !== null) items[stem] = parsed;
      }
      content[kind.id] = items;
    }
  }

  for (const rel of paths) {
    if (claimed.has(rel)) continue;
    problems.push({
      file: `content/${rel}`,
      where: '(the whole file)',
      message: `no content kind reads this file (kinds are files in src/content/kinds/: ${kinds.map((k) => k.id).join(', ')})`,
    });
  }

  // Cross-references only make sense once every file parsed on its own.
  if (problems.length === 0) {
    for (const kind of kinds) {
      kind.check?.(content as unknown as Content, (file, where, message) => problems.push({ file, where, message }));
    }
  }
  return { content: content as unknown as Content, problems };
}
