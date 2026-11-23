// The content layer: pure data shapes and their validators. No DOM, no Node
// APIs, and it never imports the simulation (docs/architecture.md, "Layers").

/** One thing wrong with a content or scenario file, located exactly. */
export interface Problem {
  /** Path from the repository root, e.g. content/rooms/graybox-hall.json */
  file: string;
  /** The field or reference inside the file, e.g. rows[3] */
  where: string;
  message: string;
}

/**
 * Everything loaded from content/, validated. Passed to the simulation's
 * step() and never changed while the game runs.
 *
 * INTENT: this interface is empty here on purpose. Each content kind adds
 * its own field from its own file in src/content/kinds/ (TypeScript
 * declaration merging), so a step adding a kind of content edits no file
 * another step is editing (docs/plan/step-1.md, "Built for several leads at
 * once").
 */
export interface Content {}

export interface NumberRule {
  min?: number;
  max?: number;
  integer?: boolean;
}

/** Reads fields out of raw JSON, recording a Problem for each thing wrong. */
export interface Reader {
  file: string;
  fail(where: string, message: string): void;
  object(value: unknown, where: string): Record<string, unknown> | null;
  /** Reports any field of `o` not in `fields` (catches typos). "//" is always allowed, for notes. */
  only(o: Record<string, unknown>, fields: string[], where: string): void;
  number(o: Record<string, unknown>, field: string, where: string, rule?: NumberRule): number;
  string(o: Record<string, unknown>, field: string, where: string): string;
  stringList(o: Record<string, unknown>, field: string, where: string): string[];
}

/**
 * One kind of content. A file in src/content/kinds/ default-exports one of
 * these and is picked up automatically (scripts/lib/registries.ts).
 */
export interface ContentKind {
  /** The field of Content this kind fills, e.g. "rooms". */
  id: string;
  /** One file (content/<file>) or a directory of files, one item per file (content/<dir>/<item id>.json). */
  source: { file: string } | { dir: string };
  /** Turns raw JSON into the validated shape. Return null when it cannot be used at all. */
  parse(raw: unknown, read: Reader): unknown;
  /** Cross-references to other kinds, run after everything has parsed. */
  check?(content: Content, fail: (file: string, where: string, message: string) => void): void;
}
