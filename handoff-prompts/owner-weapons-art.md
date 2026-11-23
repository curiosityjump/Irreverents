# The owner's weapons assets, from the Drive: find them, cut them, say what they are

Brief for the art cut-outs builder (props lane). Written 2026-11-24 00:12 UTC
by the orchestrator (`session_017WiGzJzo6aZqH4kYxxJsiV`). **The owner's words,
first-hand to the orchestrator, ~00:10 UTC:**

> Weapons assets uploaded

Nothing else is known: not the file names, how many, or what they are for.
Read `docs/mechanisms/design-library-sync.md` and your own notes
(`tools/art/props/README.md`) first.

**Reports:** `send_message` to the session on the Orchestrator line of
`docs/questions-for-the-owner.md`: **first, as soon as you have looked at the
files** (before cutting anything): each file's Drive path, size, and a plain
list of what it shows (every weapon by row and column, with any label, state
or animation frames, held or loose, who is holding it, projectiles, effects);
then after each push.

## The task

1. **Find them.** `python3 -I tools/drive_sync.py` (the title-screen builder,
   `session_017WiGzH3PZe5UkjdEEaAN75`, ran a full sync at about 00:00 UTC:
   pull first, then run it again for what arrived since; the crawl takes
   minutes). Commit the mirrored files naming them; push. If a doc sits beside
   them, read it: the library's labels are literal.
2. **Look and report** (the list above). Open the images yourself; say what
   you see, not what the file name suggests.
3. **Cut them** as looks, the way you cut the core-loop groups: one group
   `weapons`, clear ids by what the thing is (never a proposed proper name in
   an id: a shown name is data), a loose-on-the-ground look and a held look
   where the sheet gives both, projectiles and effects as their own looks,
   each seen in a mock scene at 320×180 before pushing, mock scenes committed
   under `docs/plan/step-8-shots/round3/props/`. From the approved source
   only; list what the sheets do not cover (a weapon with no held pose, no
   swing frames) for the Drive's missing-assets list, and tell Vision Partner
   by message.
4. Update `docs/mechanisms/asset-coverage.md`.

Nothing in the game draws a weapon yet: no weapon exists as a thing to pick
up or steal. That is the orchestrator's next brief, written from your report
of what the sheets show: so the report in step 2 matters more than the cuts.

## Done

`npm run build`, `npm run check` green (e2e only if a look the game already
draws changed); pushed; live; your notes updated ("Weapons" section).
