# Content loading and validation

**Reference.** Open before adding a kind of content, changing a content
schema, or touching `src/content/`, `src/sim/check-content.ts` or
`scripts/lib/content-files.ts`.

## Why it exists

Content is data and the engine is code (`CLAUDE.md`, design principles).
Data written by hand, by several sessions at once, breaks in small ways:
a misspelt id, a ragged room row, a tuning number nobody reads. The
validator runs in `npm run check` and again in `npm run build`, and
**names the exact file and field**. A build with invalid content fails,
so broken content cannot deploy (Railway keeps serving the previous build).

## How it runs

1. `scripts/lib/content-files.ts` reads every `content/**/*.json`.
2. `src/content/assemble.ts` hands each file to the content kind that
   claims it (`src/content/kinds/*.ts`: one file such as `tuning.json`, or
   a directory with one item per file). A file no kind claims is an error.
   Then each kind's `check` verifies references to other kinds.
3. `src/sim/check-content.ts` checks content against the simulation: each
   verb a character lists exists; each tuning number a verb or system
   declares is present and in range; no tuning number is unread; each
   action a verb reads exists; no speed can cross a whole tile in one tick.
4. The build bakes the validated result into both bundles as `__CONTENT__`.

## Rules that are deliberate

- **An item's `id` must equal its file name**, and ids are lower-case
  words joined by dashes. Ids are contracts once deployed: never rename.
- **Unknown fields are errors**, to catch typos. `"//"` is allowed
  anywhere as a note.
- **Tuning numbers are declared by their reader** (a verb's or system's
  `tuning`, with a range and a plain description), not in a shared type,
  so a new verb brings its own numbers and nobody edits a common file.
- **An unread tuning number is an error**: a typo in a name would
  otherwise silently fall back to nothing.

## Adding a kind of content

Add `src/content/kinds/<kind>.ts` default-exporting a `ContentKind` and
extending the `Content` interface (copy `actions.ts` for a directory kind,
`game.json`'s `game.ts` for a single file). It registers itself; see
`docs/architecture.md`.
