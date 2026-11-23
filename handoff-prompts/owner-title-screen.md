# The owner's title screen, from the Drive, on the start screen

Brief for one builder. Written 2026-11-24 00:05 UTC by the orchestrator
(`session_017WiGzJzo6aZqH4kYxxJsiV`). **The owner's words, first-hand to the
orchestrator, ~00:00 UTC:**

> Title screen asset added to the drive

Read `docs/mechanisms/design-library-sync.md`, `docs/mechanisms/art-pipeline.md`
("Approved Drive assets first", "Ground rules"), `docs/mechanisms/asset-coverage.md`
and the start screen's mechanism file (find it in `docs/mechanisms/README.md`;
Step 17 built the start screen: `docs/plan/step-17.md`) first.

**Reports:** `send_message` to the session on the Orchestrator line of
`docs/questions-for-the-owner.md`, when you have found the asset (its Drive
path, size, what it shows) and after each push. Notes: `docs/plan/step-17.md`,
a section "Title screen".

## The task

1. **Find it.** `python3 -I tools/drive_sync.py --check` lists what changed on
   the Drive (it took more than 4 minutes for the orchestrator at 00:02 UTC and
   was cut off: give it time, in the background). Then run it without
   `--check`, commit the mirrored files with a message naming the asset, push
   (documents and library files only: no redeploy). If the sync cannot see
   the new file (a folder the crawl does not reach), say so at once with what
   you tried.
2. **Read what the owner approved** in the doc beside the asset, if there is
   one (its label, its intended size, any note). The library's labels are
   literal: use it as it is labelled. If it is marked a proposal or a draft,
   use it anyway (D-096: in use is not canon) and mark the wiring `DRAFT:`.
3. **Put it on the start screen**, as data under `content/` (art is data: with
   the file gone the old screen comes back). Re-author it from the source as
   the pipeline says (native 320×180 grid, nearest-neighbour, hard alpha;
   never redraw it by hand, never blur it). The start screen's buttons, the
   code field and the saved-games list must stay legible and tappable over it
   on a phone upright and sideways (44 px targets, clear of the notch and home
   bar: the existing `start-*` e2e facts and the phone layouts in
   `npm run e2e` hold that; keep them green). If the picture's own lettering
   carries the game's title, do not also draw the old text title.
4. **Show it.** Screenshots at the e2e's phone sizes (upright 390×664,
   sideways 667×375 and 844×340) and desktop, committed under
   `docs/plan/step-17-shots/title/`, and look at each yourself before you push:
   say what you see, including anything cropped.
5. Update `docs/mechanisms/asset-coverage.md`'s row for the start screen, and
   if the Drive's missing-assets list names a title screen, tell Vision Partner
   (the session on the Vision Partner line of `docs/questions-for-the-owner.md`)
   by message that it has arrived.

## Decided

- The whole picture is seen on a sideways phone; upright, choose the crop or
  letterbox that keeps the title readable (`DRAFT:`, `docs/decisions-log.md`).
- No new font, no animation, no sound unless the asset brings them.

## Paths

Owns: the start screen's client files and its content file, `content/` art
for the title, `docs/design-library/**` through the sync tool only. Must not
touch: `src/sim/**`, `src/server/**`, other steps' files.

## Done

`npm run build`, `npm run check`, `npm run e2e` green (the reconnect facts
`h1`/`h2`, `cantina-row` and the friend-throw facts fail some runs on `main`
and are being fixed under `handoff-prompts/step-5-e2e-flakes.md`: re-run and
report, never loosen); pushed; live (`npm run check:deployed`,
`npm run check:live`); the screenshots committed; one line for the owner
saying where they will see it.
