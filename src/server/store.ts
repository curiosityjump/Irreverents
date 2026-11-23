// Lasting records: the one place the server keeps anything across a restart.
// Named collections, each one small JSON file on the owner's storage volume;
// read at start, written safely, versioned. Where there is no volume the
// same collections live in memory and say so (`lasting: false`).
// Rules and how another step uses it: docs/architecture.md, "Lasting
// records: the store". Proof: `node scripts/check-store.ts`.
//
// Step 17 opened the store in src/server/main.ts (the `openStore` and
// /healthz lines below are pasted there) for saved games
// (src/server/saves.ts). Step 7 still adds the Hall lines, to that same
// `store`, in this order (DRAFT: names follow slice B's brief,
// `restoreHall` and the `hall-legend` event; check them against
// src/sim/hall/ when pasting):
//
//   import { openStore } from './store.ts';
//   import type { HallRecord } from '../sim/hall/record.ts';
//
//   // after `const storage = storageStatus();`
//   // INTENT: the directory is Railway's own mount path, and only when it is
//   // a real attached volume. Never a hard-coded "/data".
//   const store = openStore(storage.mounted ? storage.path : null);
//   const hallRecords = store.collection<HallRecord>('hall');
//
//   // where the world is created, before the first step:
//   restoreHall(world, content, hallRecords.all());
//
//   // where a tick's events are handled:
//   for (const e of events) if (e.type === 'hall-legend') hallRecords.add(e.record);
//
//   // in the /healthz body, a new field beside `storage` (additive):
//   store: store.status(),
//
import fs from 'node:fs';
import path from 'node:path';

/**
 * INTENT: the file's shape is a contract once written to the live volume:
 * `{ "version": 1, "collection": "<name>", "records": [...] }`, one file per
 * collection, `<dir>/irreverents/<name>.json`. Additive only, with the
 * version number: a reverted commit does not un-write a file, so a shape
 * that changed meaning would orphan the owner's records. A file with a
 * version newer than this is never read as if it were understood and never
 * overwritten; it is set aside. Top-level fields this code does not know
 * are kept when the file is rewritten.
 */
export const STORE_VERSION = 1;
/** The subdirectory of the volume everything lives in. INTENT: the mount's root is never listed or cleaned (it is root's, and may hold a lost+found). */
export const STORE_SUBDIR = 'irreverents';
/**
 * DRAFT: how many records a collection is expected to hold. Going past it
 * is reported, never enforced: `add` keeps every record, and only an
 * explicit `replaceAll` by the owner of the collection drops any.
 */
export const COLLECTION_CAP = 500;
const NAME = /^[a-z0-9-]{1,40}$/;
const MAX_PROBLEMS = 50;

export interface Collection<T> {
  /** False when this collection is in memory only (no volume, a refused name, or its file could not be made safe to write). */
  readonly lasting: boolean;
  /** Every record, oldest first. A copy of the list: changing it changes nothing. */
  all(): T[];
  /** Keep one more record. Never throws; a failed write is in `store.problems` and the record stays in memory. */
  add(record: T): void;
  /** Replace the whole list (the only way a record is ever dropped). Never throws. */
  replaceAll(records: T[]): void;
}

export interface Store {
  /** True when records outlast a restart: a directory was given and could be used. */
  readonly lasting: boolean;
  /** Where the files are, or null in memory. */
  readonly dir: string | null;
  /** Everything that went wrong, in plain words, oldest first (at most 50). For /healthz; each is also on console.error. */
  readonly problems: string[];
  /** A named collection: lower-case letters, digits and dashes. The same name gives the same collection. Never throws. */
  collection<T>(name: string): Collection<T>;
  /** A small summary for /healthz: lasting, where, the size of each open collection, the problems. */
  status(): { lasting: boolean; dir: string | null; collections: Record<string, number>; problems: string[] };
}

/**
 * Open the store. `dir` is the volume's mount path from the caller, or null
 * when there is no volume (everything is then kept in memory).
 *
 * INTENT: opening never throws and never loses data, and neither does
 * anything else here. With the volume attached, a server that fails to
 * start leaves the owner with no game at all, so a missing file is an empty
 * collection, an unreadable one is renamed aside and reported, and a failed
 * write is reported while the records stay in memory. Do not "tidy" a
 * try/catch here into a throw.
 */
export function openStore(dir: string | null): Store {
  const problems: string[] = [];
  const report = (message: string): void => {
    console.error(`store: ${message}`);
    if (problems.includes(message)) return;
    if (problems.length < MAX_PROBLEMS) problems.push(message);
  };

  let base: string | null = null;
  if (dir) {
    try {
      base = path.join(dir, STORE_SUBDIR);
      fs.mkdirSync(base, { recursive: true });
    } catch (err) {
      report(`could not use ${dir}; records are kept in memory only and will not outlast a restart (${reason(err)})`);
      base = null;
    }
  }

  const open = new Map<string, { collection: Collection<unknown>; size: () => number }>();

  function collection<T>(name: string): Collection<T> {
    const known = open.get(name);
    if (known) return known.collection as Collection<T>;

    let records: T[] = [];
    // Top-level fields of the file this code does not know, kept on rewrite.
    let extra: Record<string, unknown> = {};
    let file: string | null = null;
    let warnedCap = false;

    if (typeof name !== 'string' || !NAME.test(name)) {
      // Refused: the name would become a file name. Kept in memory so the caller still runs.
      report(`collection name ${JSON.stringify(name)} refused (lower-case letters, digits and dashes only); it is kept in memory only`);
    } else if (base) {
      file = path.join(base, `${name}.json`);
      const loaded = load<T>(file, name, report);
      if (loaded === 'unsafe') file = null;
      else if (loaded) ({ records, extra } = loaded);
    }

    function save(): void {
      if (records.length > COLLECTION_CAP && !warnedCap) {
        warnedCap = true;
        report(`collection "${name}" holds more than ${COLLECTION_CAP} records; nothing was dropped`);
      }
      if (!file) return;
      const tmp = `${file}.tmp`;
      try {
        const text = JSON.stringify({ ...extra, version: STORE_VERSION, collection: name, records });
        // INTENT: written beside the real file, flushed, then renamed over
        // it. A crash at any point leaves the old file whole; a stray .tmp
        // from a crash is simply overwritten by the next write.
        const fd = fs.openSync(tmp, 'w');
        try {
          fs.writeSync(fd, text);
          fs.fsyncSync(fd);
        } finally {
          fs.closeSync(fd);
        }
        fs.renameSync(tmp, file);
      } catch (err) {
        report(`could not write collection "${name}"; its records are in memory and will be lost at a restart unless a later write succeeds (${reason(err)})`);
      }
    }

    const made: Collection<T> = {
      lasting: file !== null,
      all: () => records.slice(),
      add(record) {
        records.push(record);
        save();
      },
      replaceAll(next) {
        records = Array.isArray(next) ? next.slice() : [];
        save();
      },
    };
    open.set(name, { collection: made as Collection<unknown>, size: () => records.length });
    return made;
  }

  return {
    lasting: base !== null,
    dir: base,
    problems,
    collection,
    status() {
      const collections: Record<string, number> = {};
      for (const [name, c] of open) collections[name] = c.size();
      return { lasting: base !== null, dir: base, collections, problems: problems.slice() };
    },
  };
}

/**
 * Read one collection's file. Null: no file, start empty. 'unsafe': the file
 * is there, cannot be read and could not be moved aside, so the collection
 * must not write over it.
 */
function load<T>(file: string, name: string, report: (message: string) => void): { records: T[]; extra: Record<string, unknown> } | null | 'unsafe' {
  let text: string;
  try {
    text = fs.readFileSync(file, 'utf8');
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return null;
    report(`could not read ${file}; collection "${name}" starts empty and is kept in memory only, so the file is not written over (${reason(err)})`);
    return 'unsafe';
  }
  let why: string;
  try {
    const data: unknown = JSON.parse(text);
    if (typeof data !== 'object' || data === null || Array.isArray(data)) why = 'it is not a store file';
    else {
      const { version, collection, records, ...extra } = data as Record<string, unknown>;
      if (typeof version !== 'number' || !Number.isInteger(version) || version < 1) why = 'it has no version number';
      else if (version > STORE_VERSION) why = `it is version ${version} and this server only knows version ${STORE_VERSION}`;
      else if (!Array.isArray(records)) why = 'it has no list of records';
      else if (collection !== name) why = `it says it is collection ${JSON.stringify(collection)}`;
      else return { records: records as T[], extra };
    }
  } catch (err) {
    why = `it does not parse (${reason(err)})`;
  }
  // INTENT: an unreadable file is set aside whole, never deleted and never
  // written over: a person can still recover the records from it.
  try {
    let n = 1;
    let aside = '';
    do aside = path.join(path.dirname(file), `${name}.unreadable-${n++}.json`);
    while (fs.existsSync(aside));
    fs.renameSync(file, aside);
    report(`${file} was not used because ${why}; it was kept as ${path.basename(aside)} and collection "${name}" starts empty`);
    return null;
  } catch (err) {
    report(`${file} was not used because ${why}, and could not be set aside; collection "${name}" starts empty and is kept in memory only (${reason(err)})`);
    return 'unsafe';
  }
}

function reason(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
