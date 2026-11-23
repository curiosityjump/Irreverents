# Design-library sync (Google Drive → `docs/design-library/`)

**Reference.** Open it before re-syncing the design library or changing
`tools/drive_sync.py`.

## What it is

The owner keeps the game's design in a shared Google Drive folder and edits it
there, often with other assistants (ChatGPT, Claude). The repository keeps a
read-only mirror in `docs/design-library/` so every session can read the
design without network access. Drive is the source; the mirror is never
hand-edited.

## How to re-sync

```
python3 -I tools/drive_sync.py --check   # what changed since the last sync; writes nothing
python3 -I tools/drive_sync.py           # update the mirror and manifest.json
```

Then read `docs/design-library/changelog.md` (the owner's Drive changelog,
newest first; the script prints its latest entry) to learn *why* things
changed, commit with a message naming the changed Drive docs, and, if a
change is vision-level, tell Vision Partner (`docs/questions-inbox.md`).

## How it works, and why

- **Crawl:** `drive.google.com/embeddedfolderview?id=<folder>` returns a plain
  HTML listing of a publicly shared folder without sign-in; the script recurses.
- **Docs:** fetched as `docs.google.com/document/d/<id>/mobilebasic` and
  converted with pandoc. The obvious route, `/export?format=md`, redirects to a
  per-request `doc-*-docstext.googleusercontent.com` host, and the cloud
  environment's allowlist takes exact hosts only, so it cannot be allowed.
  Google's `google.com/url?q=` link wrappers are unwrapped to their targets.
- **Files:** downloaded from `drive.usercontent.google.com/download?id=<id>`.
  ZIPs are unpacked into a folder of the same name rather than committed.
- **Change detection:** `manifest.json` stores each file's Drive id, Drive
  path, repo path and sha256 (for Docs, of the converted body, not the
  header). The listing's modified times are not full dates, so hashes, not
  times, decide what changed. Renames on Drive keep the id, so the old repo
  file is removed and the new one written.
- **Skipped on purpose:** anything under "Superseded Style Explorations"
  (`SKIP_DOWNLOAD`, marked `INTENT:`), per the library's own rule against
  bulk-importing discarded images.
- **Header:** every mirrored Doc opens with a one-paragraph "Reference —
  imported, do not edit here" line linking its Drive original.

## Needs

Network hosts `drive.google.com`, `docs.google.com` and
`drive.usercontent.google.com` (added to the "Curiosity Cloud" environment
on 2026-11-23), and `pandoc`. The folder must stay shared as "anyone with the link".
If the owner makes it private, the crawl returns nothing; the fix is
re-sharing it or a Drive connector, never hand-copying.
