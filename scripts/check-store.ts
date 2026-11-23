// node scripts/check-store.ts : the proof for src/server/store.ts (lasting
// records). Runs against a temporary directory it makes and removes. Prints
// one line per check; exit 1 if any failed. Not part of `npm run check` yet
// (docs/architecture.md, "Lasting records: the store").
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { COLLECTION_CAP, openStore, STORE_SUBDIR, STORE_VERSION } from '../src/server/store.ts';

type Rec = { n: number; title: string };
const failures: string[] = [];
let count = 0;

/** One named check in a fresh empty directory. A throw is a failure: nothing in the store may throw. */
function check(name: string, run: (dir: string) => string | null): void {
  count++;
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'irreverents-store-'));
  let problem: string | null;
  try {
    problem = run(dir);
  } catch (err) {
    problem = `threw: ${(err as Error).stack ?? err}`;
  } finally {
    fs.chmodSync(dir, 0o700);
    fs.rmSync(dir, { recursive: true, force: true });
  }
  if (problem) failures.push(name);
  console.log(`${problem ? 'FAIL' : 'ok  '}  ${name}${problem ? `\n      ${problem}` : ''}`);
}

const same = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b);
const fileOf = (dir: string, name: string): string => path.join(dir, STORE_SUBDIR, `${name}.json`);
const listing = (dir: string): string[] => (fs.existsSync(path.join(dir, STORE_SUBDIR)) ? fs.readdirSync(path.join(dir, STORE_SUBDIR)).sort() : []);
const A: Rec = { n: 1, title: 'first' };
const B: Rec = { n: 2, title: 'second' };

// The store reports to console.error by design; keep this script's output to its own lines.
console.error = () => {};

// Escape caught: records that do not come back after a restart (the whole point of the store).
check('add then reopen gives the same records', (dir) => {
  const first = openStore(dir);
  const c = first.collection<Rec>('hall');
  c.add(A);
  c.add(B);
  if (!first.lasting || !c.lasting) return 'a store given a directory says it is not lasting';
  const again = openStore(dir).collection<Rec>('hall').all();
  if (!same(again, [A, B])) return `reopened as ${JSON.stringify(again)}`;
  if (first.problems.length) return `problems reported: ${first.problems.join('; ')}`;
  return null;
});

// Escape caught: the file's shape drifting from the contract written on the live volume.
check('the file is { version, collection, records } in the subdirectory', (dir) => {
  openStore(dir).collection<Rec>('hall').add(A);
  const data = JSON.parse(fs.readFileSync(fileOf(dir, 'hall'), 'utf8'));
  if (!same(data, { version: STORE_VERSION, collection: 'hall', records: [A] })) return `file holds ${JSON.stringify(data)}`;
  if (!same(fs.readdirSync(dir), [STORE_SUBDIR])) return `the mount's root holds ${fs.readdirSync(dir)}`;
  if (!same(listing(dir), ['hall.json'])) return `left behind: ${listing(dir)}`;
  return null;
});

// Escape caught: a dropped record that nobody asked to drop.
check('replaceAll replaces, and is the only thing that drops a record', (dir) => {
  const c = openStore(dir).collection<Rec>('hall');
  const many = Array.from({ length: COLLECTION_CAP + 5 }, (_, i) => ({ n: i, title: 't' }));
  const store = openStore(dir);
  const d = store.collection<Rec>('big');
  for (const r of many) d.add(r);
  if (openStore(dir).collection<Rec>('big').all().length !== many.length) return 'records past the cap were dropped silently';
  if (!store.problems.some((p) => p.includes('more than'))) return 'going past the cap was not reported';
  c.add(A);
  c.add(B);
  c.replaceAll([B]);
  const again = openStore(dir).collection<Rec>('hall').all();
  return same(again, [B]) ? null : `reopened as ${JSON.stringify(again)}`;
});

// Escape caught: pretending records are kept where there is no volume.
check('in memory: lasting is false and no file is written', (dir) => {
  const store = openStore(null);
  const c = store.collection<Rec>('hall');
  c.add(A);
  if (store.lasting || c.lasting) return 'says it is lasting';
  if (!same(c.all(), [A])) return 'the record is not kept in memory';
  if (store.collection<Rec>('hall') !== c) return 'the same name gave a different collection';
  if (fs.readdirSync(dir).length) return `wrote ${fs.readdirSync(dir)}`;
  if (fs.existsSync(STORE_SUBDIR) || fs.existsSync('hall.json')) return 'wrote into the working directory';
  return null;
});

// Escape caught: one damaged file stopping the server from starting, or being destroyed.
check('a corrupt file is set aside and the open still succeeds', (dir) => {
  fs.mkdirSync(path.join(dir, STORE_SUBDIR));
  fs.writeFileSync(fileOf(dir, 'hall'), '{"version":1,"collection":"hall","records":[{"n":1');
  const store = openStore(dir);
  const c = store.collection<Rec>('hall');
  if (c.all().length) return 'records came out of a corrupt file';
  const aside = path.join(dir, STORE_SUBDIR, 'hall.unreadable-1.json');
  if (!fs.existsSync(aside)) return `not set aside; directory holds ${listing(dir)}`;
  if (!fs.readFileSync(aside, 'utf8').endsWith('[{"n":1')) return 'the file set aside is not the original';
  if (!store.problems.length) return 'nothing was reported';
  c.add(A);
  if (!same(openStore(dir).collection<Rec>('hall').all(), [A])) return 'the collection did not work afterwards';
  // A second corrupt file must not overwrite the first one set aside.
  fs.writeFileSync(fileOf(dir, 'hall'), 'not json');
  openStore(dir).collection<Rec>('hall');
  if (!same(listing(dir), ['hall.unreadable-1.json', 'hall.unreadable-2.json'])) return `after a second corrupt file: ${listing(dir)}`;
  return null;
});

// Escape caught: an older server (after a revert) wiping records a newer one wrote.
check('a newer version is set aside, not overwritten', (dir) => {
  fs.mkdirSync(path.join(dir, STORE_SUBDIR));
  const newer = JSON.stringify({ version: STORE_VERSION + 1, collection: 'hall', records: [A, B], shape: 'new' });
  fs.writeFileSync(fileOf(dir, 'hall'), newer);
  const store = openStore(dir);
  const c = store.collection<Rec>('hall');
  if (c.all().length) return 'read a version it does not know';
  c.add(B);
  const aside = path.join(dir, STORE_SUBDIR, 'hall.unreadable-1.json');
  if (!fs.existsSync(aside) || fs.readFileSync(aside, 'utf8') !== newer) return 'the newer file was not kept whole';
  if (!store.problems.some((p) => p.includes('version'))) return 'the version was not reported';
  return null;
});

// Escape caught: additive fields lost when an older server rewrites the file.
check('fields it does not know are kept on rewrite', (dir) => {
  fs.mkdirSync(path.join(dir, STORE_SUBDIR));
  fs.writeFileSync(fileOf(dir, 'hall'), JSON.stringify({ version: 1, collection: 'hall', records: [A], note: 'kept' }));
  openStore(dir).collection<Rec>('hall').add(B);
  const data = JSON.parse(fs.readFileSync(fileOf(dir, 'hall'), 'utf8'));
  return same(data, { note: 'kept', version: 1, collection: 'hall', records: [A, B] }) ? null : `file holds ${JSON.stringify(data)}`;
});

// Escape caught: a kill between the temporary write and the rename losing or corrupting records.
check('a stray temporary file from a kill loses nothing', (dir) => {
  openStore(dir).collection<Rec>('hall').add(A);
  fs.writeFileSync(`${fileOf(dir, 'hall')}.tmp`, '{"version":1,"collection":"hall","records":[{"n":1,"title":"first"},{"n":2,"ti');
  const store = openStore(dir);
  const c = store.collection<Rec>('hall');
  if (!same(c.all(), [A])) return `opened as ${JSON.stringify(c.all())}`;
  if (store.problems.length) return `problems reported: ${store.problems.join('; ')}`;
  c.add(B);
  if (!same(openStore(dir).collection<Rec>('hall').all(), [A, B])) return 'the next write did not land';
  if (!same(listing(dir), ['hall.json'])) return `left behind: ${listing(dir)}`;
  return null;
});

// Escape caught: a write that half-happens. The real file must only ever change by a rename.
check('a write never touches the real file except by rename', (dir) => {
  const c = openStore(dir).collection<Rec>('hall');
  c.add(A);
  const before = fs.statSync(fileOf(dir, 'hall')).ino;
  c.add(B);
  return fs.statSync(fileOf(dir, 'hall')).ino !== before ? null : 'the file was rewritten in place (same inode)';
});

// Escape caught: a name with a slash or dots becoming a path outside the store.
check('a bad collection name is refused', (dir) => {
  for (const bad of ['../escape', 'Hall', 'a/b', '', 'hall.json', 'a b', 'x'.repeat(41)]) {
    const store = openStore(dir);
    const c = store.collection<Rec>(bad);
    c.add(A);
    if (c.lasting) return `${JSON.stringify(bad)} was accepted`;
    if (!store.problems.some((p) => p.includes('refused'))) return `${JSON.stringify(bad)} was not reported`;
  }
  if (listing(dir).length) return `wrote ${listing(dir)}`;
  if (!same(fs.readdirSync(path.dirname(dir)).filter((f) => f.startsWith('escape')), [])) return 'wrote outside the store';
  return null;
});

// Escape caught: a volume that cannot be written stopping the boot, or a failed write losing the record in memory.
check('a failed write is reported and the records stay in memory', (dir) => {
  if (process.getuid?.() === 0) {
    // Root ignores permissions, so make the write fail another way: a directory where the temporary file goes.
    const store = openStore(dir);
    const c = store.collection<Rec>('hall');
    fs.mkdirSync(`${fileOf(dir, 'hall')}.tmp`);
    c.add(A);
    if (!same(c.all(), [A])) return 'the record was lost from memory';
    if (!store.problems.some((p) => p.includes('could not write'))) return 'the failed write was not reported';
    fs.rmdirSync(`${fileOf(dir, 'hall')}.tmp`);
    c.add(B);
    return same(openStore(dir).collection<Rec>('hall').all(), [A, B]) ? null : 'a later write did not save everything';
  }
  fs.mkdirSync(path.join(dir, STORE_SUBDIR));
  fs.chmodSync(path.join(dir, STORE_SUBDIR), 0o500);
  const store = openStore(dir);
  const c = store.collection<Rec>('hall');
  c.add(A);
  fs.chmodSync(path.join(dir, STORE_SUBDIR), 0o700);
  if (!same(c.all(), [A])) return 'the record was lost from memory';
  return store.problems.some((p) => p.includes('could not write')) ? null : 'the failed write was not reported';
});

// Escape caught: a mount path that cannot be used stopping the boot.
check('a directory that cannot be used falls back to memory', (dir) => {
  const blocked = path.join(dir, 'a-file');
  fs.writeFileSync(blocked, '');
  const store = openStore(blocked);
  const c = store.collection<Rec>('hall');
  c.add(A);
  if (store.lasting || c.lasting) return 'says it is lasting';
  if (!store.problems.length) return 'nothing was reported';
  return same(c.all(), [A]) ? null : 'the record is not kept in memory';
});

// Escape caught: tidying the volume's root, which is root's and may hold a lost+found.
check("the mount's own files are left alone", (dir) => {
  fs.mkdirSync(path.join(dir, 'lost+found'));
  fs.writeFileSync(path.join(dir, 'someone-elses.json'), 'x');
  openStore(dir).collection<Rec>('hall').add(A);
  return same(fs.readdirSync(dir).sort(), [STORE_SUBDIR, 'lost+found', 'someone-elses.json']) ? null : `the root holds ${fs.readdirSync(dir)}`;
});

console.log(failures.length ? `\ncheck-store: FAILED, ${failures.length} of ${count}: ${failures.join('; ')}` : `\ncheck-store: ${count} checks passed`);
process.exit(failures.length ? 1 : 0);
