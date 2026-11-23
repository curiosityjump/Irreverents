# Step 7, slice A: a store that lasts, and a pedestal you can walk up to

Brief for one cold session. Written 2026-11-23 04:50 UTC by the Step 7
lead (`session_017WiGzF4QGboHBQtunwprhk`). The step is
`docs/plan/step-7.md`. Self-contained: you do not need the design library
or `docs/vision.md`. A second worker runs slice B
(`handoff-prompts/step-7-b-detector.md`: the simulation side) at the same
time. Two parts, in this order; the first is small and waits on nobody.

## 1 · The task, and the measure row it moves

**Part 1, the store.** One small general thing the server keeps lasting
records in: named collections, read at start, written safely, versioned.
The Hall is its first customer; unlocked heroes and what has been found
will use it later.

**Part 2, the pedestal.** How a Hall record looks in the room: a
pedestal with a small framed picture of the moment, and, when a player
stands at it, a card with the title, who was there and the numbers.

**Measure row: M3** (`docs/plan.md`), gate E, indirectly: gate E needs a
record that is seen on a pedestal and outlasts a restart. Nothing you
build is tagged for a gate.

When each part is on `main`, message the lead (`send_message` to
`session_017WiGzF4QGboHBQtunwprhk`): "store at <commit>", "pedestal at
<commit>".

## 2 · The derivation, already done

### Measured on `main` at 73e73d2 (04:46 UTC)

- The owner attached a Railway volume: live `/healthz` reported
  `storage: { mounted: true, writable: true, path: "/data", name:
  "irreverents-volume" }` at 04:24 UTC. `src/server/main.ts` lines
  30–60 already work that out (`storageStatus()`, with an `INTENT:`
  about what counts as mounted) and store nothing.
- **`src/server/main.ts` is being rewritten right now** by Step 1's
  Gate 2 worker (the real network layer; due about 06:30 UTC). You do
  not edit it. You add **one new file, `src/server/store.ts`**, that
  nothing imports yet. The lines that start it and connect it to the
  world are placed later, with Step 1's lead (section 4).
- There is no unit-test runner. `npm run check` (`scripts/check.ts`) is
  types, the layer rule, content validation and scenarios, all pure;
  the store is Node code. So its proof is a script of your own,
  `scripts/check-store.ts`, run directly (`node scripts/check-store.ts`,
  exit code). `scripts/check.ts` is Step 1's and busy: do not hook
  yours into it; say in `docs/for-the-lead.md` that the one-line hook
  is owed.
- Drawing: every layer is one file in `src/client/draw/`, called from
  `src/client/render.ts` in one line (`render()` there is 10 lines).
  `draw/entities.ts` line 8 skips an entity whose kind is not a
  character kind. The view is 320×180; a tile is 16.
- **The network sends every entity to every phone about 20 times a
  second**, so a record on a pedestal is deliberately tiny (at most 500
  bytes) and its picture is not pixels: it is a list of who stood
  where, which the page redraws.

### The store (`src/server/store.ts`)

`DRAFT:` shape, yours to refine:

```ts
openStore(dir: string | null): Store            // null = no volume: in memory
store.lasting: boolean                          // false when in memory
store.collection<T>(name): { all(): T[]; add(record: T): void; replaceAll(records: T[]): void }
```

- The directory comes from the caller, who reads
  `RAILWAY_VOLUME_MOUNT_PATH` **only when `storageStatus().mounted` is
  true**. Never a hard-coded `/data`. Files live in a subdirectory
  (`irreverents/`), one per collection: `{ "version": 1, "collection":
  "<name>", "records": [...] }`.
- **The file's shape is a contract once written to the live volume:**
  additive only, with the version number. `// INTENT:`.
- **Written safely:** write a temporary file beside it, flush, rename
  over the old one. A crash mid-write must leave the old file whole.
- **Opening never throws and never loses data.** A file that is
  missing means empty. A file that does not parse, or has a newer
  version than the code knows, is renamed aside
  (`<name>.unreadable-<n>.json`), reported, and the collection starts
  empty. A failed write is reported and the records stay in memory.
  With the volume attached, a server that fails to start leaves the
  owner with no game at all: nothing in this file may stop the boot.
- "Reported" = a list the caller can read (`store.problems`), for
  `/healthz` later; also `console.error`.
- A collection name is lower-case letters, digits and dashes; anything
  else is refused (it becomes a file name).
- No database, no dependency, synchronous `node:fs` is fine at this
  size. A cap per collection (say 500 records, oldest dropped from the
  file only by an explicit call, never silently) is yours to judge.

`scripts/check-store.ts`, against a temporary directory it makes and
removes: add then reopen gives the same records; in-memory mode says
`lasting: false` and writes no file; a corrupt file is set aside and
the open still succeeds; a newer version is set aside, not
overwritten; a kill between temporary write and rename (simulate:
leave a stray temporary file) loses nothing; a bad collection name is
refused. **Watch each check fail once** (break the code, see the
script name it, restore) and say which in the commit.

### The pedestal (`src/client/draw/hall.ts`, one line in `render.ts`)

The record, as slice B defines it (`src/sim/hall/record.ts`, pushed by
that worker within about fifteen minutes of starting; the lead will
message you its commit; **import the type, do not copy it**):

```ts
interface HallRecord {
  v: 1; n: number; kind: string; title: string; place: string; ticks: number;
  who: { player: string; character: string; name?: string }[];
  stats: Record<string, number>; score: number;
  frame: { room: string; bodies: [kind: string, x: number, y: number, facing: 1 | -1, flags: number][] };
  at?: string;
}
```

In the world it is an entity: id `hall:<n>`, kind `pedestal` (a real
character kind slice B adds, so `draw/entities.ts` already draws its
box and it can be hit and thrown like any body), `c.hall = { record }`.
`flags`: 1 = a credited player, 2 = knocked out. Shown names for kinds
and stat labels are in `content.hall` (slice B's content kind).

Draw, for each such entity in the room on screen:
- **On the pedestal, a small framed picture** (about 28×20 at 320×180):
  the frame's bodies as tiny blocks in their character colours, placed
  by their positions scaled into the frame, knocked-out ones lying
  flat, credited players marked. It moves with the pedestal's body.
  Legible on an iPhone: whole pixels, no text inside the frame.
- **A card when your own character stands within about a tile and a
  half of it:** the title, the kind's shown name, who was there (name
  if the record has one, else the character kind), two to four stats
  with their labels, and its standing among records of its kind ("2nd
  of 5" by score; `DRAFT:`). **No button: walking up shows it, walking
  away hides it.** `// INTENT:` iPhone first, and there is always a
  way out: the card never takes input and never covers the controls
  area (Step 5 owns controls; keep the card in the top half).
- **A new legend is announced by itself:** when a `hall:<n>` entity
  appears that was not in the world when this page joined, show its
  picture and title in a banner for about three seconds, wherever the
  player is. It takes no input and stops nothing. `DRAFT:`.
- Text at this size: whatever `src/client/` already uses for text when
  you get there (Step 1's worker is adding the page shell); if nothing
  exists, canvas `fillText` at a legible size and say so.

## 3 · Traps

- **Do not edit `src/server/main.ts`, `scripts/check.ts`,
  `package.json`.** They are Step 1's and in flight. If you believe you
  must, message the lead instead.
- **`src/client/` is also in flight** (Step 1 Gate 2 rewrites
  `main.ts`; it should leave `render.ts`'s shape alone). `git pull
  --rebase origin main` before touching `render.ts`; your edit there is
  one import and one call.
- **How the page knows "your own character"** changes with Gate 2.
  Read what `render()` is given when you get there; if it is not yet
  given the local player, draw the card for any player's character
  standing there, mark it `DRAFT:`, and flag it in
  `docs/for-the-lead.md`.
- **The store must work on Railway's volume as it is:** a mounted
  directory owned by root, possibly with a `lost+found` in it. Create
  your subdirectory; never list or clean the mount's root.
- **A push touching `src/`, `content/` or `scripts/` redeploys:** about
  a minute offline and a fresh live world. Push each part once,
  finished. `store.ts` is imported by nothing, so it cannot break the
  start; confirm with `npm run build && npm start` locally and
  `/healthz` answering, by pid, on a free port.
- The layer rule: `src/client` never imports `src/server`, and the
  reverse. Both may import `src/sim/hall/record.ts`.

## 4 · Out of scope

- **Wiring the store into the server** (open it at start, put stored
  records into the world, save on a `hall-legend` event, a `/healthz`
  field): the lead agrees it with Step 1's lead once Gate 2 is on
  `main`. Write the exact lines you would add as a comment block at the
  top of `store.ts`, so it is a paste.
- Detecting legends, the record's fields, `content/hall/`, the pedestal
  character kind, scenarios: slice B.
- The Hall room itself (Step 3), sprites and sound (Step 8), touch
  controls (Step 5), player names.
- A full-screen gallery, a replay, deleting or hiding a record.
- Accounts, per-player histories across worlds: not tonight.

## 5 · Decided, and open

**Decided:** records are kept on the owner's volume in a small
versioned file, in memory where there is none, and the Hall says so; the
picture is a redrawn scene, not pixels; the card needs no button. (In
`docs/decisions-log.md` by the lead already.)

**Open, yours to decide without asking** (`DRAFT:`; log in
`docs/decisions-log.md` anything a player would see): the look of the
frame, card and banner; the cap; the wording on the card, including the
short line shown when records are not lasting ("Not kept after a
restart" or better).

## 6 · How it gets verified

- Part 1: `node scripts/check-store.ts` exits 0, each check watched
  failing once; `npm run build && npm run check` still pass; the built
  server still starts.
- Part 2, rung 5 (`docs/verifying-and-finishing.md`): there is no Hall
  room or live record yet, so in your working copy only, put two
  hand-written pedestal entities into the start room's world, run the
  page, and **screenshot with Playwright at an iPhone size, sideways
  and upright** (Chromium is installed; `require('playwright')` works):
  the frame alone, the card with a character standing at it, the
  banner. Look at the images. Say in the commit what you saw and what
  you could not check. Remove the hand-written entities before
  committing (`git diff` shows no change outside your files and the
  one line in `render.ts`).
- Not verifiable by you: whether it looks good. The owner's.

## 7 · Definition of done

- Both parts pushed to `main` (verify with `git ls-remote --heads
  origin main`); `npm run check:deployed` exits 0 after each.
- SOP phase 6: `docs/architecture.md` gains "Lasting records: the
  store" (how another step keeps a collection, the rules above) and
  loses its "Nothing is persisted" claim only where it is now false
  (say the store exists and what uses it); the pedestal's drawing and
  the card go into `docs/mechanisms/hall-of-legends.md` (slice B
  creates it; add your section, or create it if you are first);
  `INTENT:` / `DRAFT:` at the sites; `docs/deliberate-designs.md` for
  "opening the store never stops the server" and "the card has no
  button".
- Do not delete this brief or edit `docs/plan/step-7.md`.

## 8 · Where your questions go

- **Blocking:** `send_message` to the lead,
  `session_017WiGzF4QGboHBQtunwprhk`, and keep working on what does not
  depend on the answer. If only the owner could answer: decide,
  `DRAFT:`, log, continue.
- **A flag or finding:** `docs/for-the-lead.md`.
- **Something only the owner can supply:** `docs/questions-inbox.md`.
- **Your final message:** done or blocked, the commit, nothing more.
