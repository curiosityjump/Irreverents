# The design library's mirror: list the big files nobody loads instead of copying them in

Brief for one builder. Written 2026-11-24 04:00 UTC by the orchestrator
(`session_017WiGzHhT2apmWHT61rQ65G`). Read `docs/mechanisms/asset-requests.md`
and `tools/drive_sync.py` (its `SKIP_DOWNLOAD` list and the `INTENT:` beside
it) first.

**Reports:** `send_message` to the session on the Orchestrator line of
`docs/questions-for-the-owner.md`. **Notes:** `docs/mechanisms/asset-requests.md`.

## The task, and the measure

Moves no row of `docs/plan.md`'s table; it makes every session start and
every deploy lighter. **Decided by the owner's standing words** (answers
outbox Q-016, 0da21cd; `docs/vision.md`, "Principles that decide most
questions"): "Do whatever gets us the game I want as soon and efficiently as
possible" and "the team has full license to do that". Nothing is deleted from
the owner's Drive. Big files the game does not load are listed by name in the
mirror's index, not copied into the repository.

## Measured

- The full Drive sync at 8cb79ac mirrored 348 new files; the previous
  orchestrator measured `docs/design-library` at 334 MB and `.git` at 214 MB,
  with raw music stems as `.wav` and 15 files over 3 MB.
- At 6c16b3e `git ls-files docs/design-library` lists 847 files: 538 `.png`,
  86 `.md`, 50 `.wav`, 50 `.ogg`, 48 `.json`, 28 `.txt`, 16 `.webp`, 8 `.jpg`.
- `tools/drive_sync.py:33` is `SKIP_DOWNLOAD = ["Superseded Style
  Explorations"]`; a skipped entry is recorded as "not downloaded
  (superseded)" (line 104).
- Sizes per file are not measured here: your clone, like mine, leaves files
  over 150 KB on the server (`docs/git-workflow.md`, "Files git hides").
  Measure with `git ls-tree -r -l origin/main -- docs/design-library`.

## Do

1. List every mirrored file over 1 MB with its size, and for each say whether
   anything in `content/`, `src/`, `tools/`, `scripts/` or `public/` reads it
   (grep the path and the file name; the art tools under `tools/art/` read
   source plates by path: those stay).
2. Extend `SKIP_DOWNLOAD` (or add a size-and-kind rule beside it, with its own
   `INTENT:` quoting the owner's words above) so that raw `.wav` stems and
   source packs nothing reads are listed, not downloaded. The index must
   still name each one, with its Drive id, so a session can fetch one when it
   needs it; say how in `docs/mechanisms/asset-requests.md`.
3. `git rm` the mirrored copies that the new rule skips. Then run the sync
   once and show it re-adds none of them and changes nothing else.
4. Report the mirror's size before and after (`git ls-tree -r -l`, summed).

## Traps

- **A file the game or a cutting tool reads must stay.** One wrong `git rm`
  breaks a build or a re-cut. `npm run build` and `npm run check` must be
  green after, and `python3 -I tools/drive_sync.py` must run clean.
- The `.ogg` files may be what the game plays, cut from the `.wav` stems:
  check before touching either.
- History keeps the old blobs: `.git` will not shrink for existing clones.
  Do not rewrite history. New sessions clone at depth 50, so it fades.
- The library is the owner's, mirrored read-only: change no file's content,
  rename nothing, and leave every `.md` design document mirrored.

## Out of scope

The Drive itself; the art already cut into `public/`; any other tool.

## Decided vs. open

Decided: above. Open: nothing for the owner. If under 20 MB would be saved,
stop after step 1 and report instead.

## Verify

Build and check green; the sync run clean and idempotent; pushed to `main`
(a push that touches only documents and the library does not redeploy:
`docs/mechanisms/deploy.md`; if yours does, `npm run check:deployed`).
