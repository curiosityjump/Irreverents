# The owner's new biome backgrounds: bring them in and put them behind the places they fit


## Landed so far, and what is next (builder `session_017WiGzGQptGtgXJLtKXBbKC`, stopped at ~312k tokens, 2026-11-24 17:25 UTC)

Landed: 642b89a (BKG-02 mirrored), 137bcaa (panoramas behind nine rooms), 63addca (forest shots retaken),
a988b63 (the `-far` cuts: a 180-px fade on top, haze per panorama in `FAR` of
`tools/art/backgrounds/import_panoramas.py`; undercroft's cellar back). Notes, table, shots:
`docs/plan/step-8.md`, "Biome backgrounds" and the two looks after it.

**Third pass, the orchestrator's rulings (17:21 UTC), each `DRAFT:`, one `docs/decisions-log.md` entry:**
1. Bring the forest's haze back down (`FAR`, 0.45 now) until forest-road's blues, waterfall and red mushroom read as painted; keep forest-trail's painted mushroom plainly background by other means (shift the panorama, or a local treatment as data).
2. Make the REAL thing pop instead of fading the painting: the quarry's standable planks (short ones above all) get a dark underside/outline, a lighter top edge or their own colour, as data on the plank's look; and/or shift each panorama per room (an `offsetY` on its first layer is data already) so painted decks, ledges and pillar tops do not sit on the play rows beside a real platform (the quarry's left deck at chest height, the street's lime ledge over the arch, the courtyard's ruin ledge, the camp's pillar under the real beam). Smallest thing that passes; one consistent mechanism. Haze toward the sky was measured not to help at play height.
3. Say in one line whether the region banner reads "Castle Town" in forest-road and quarry-road in play. The builder's guess, not checked: an artefact of `tools/art/backgrounds/shots.mjs`, which moves the player by setting `room` directly instead of walking through a door, so no new place is entered.

Pass = a new player would not try to stand on the painted thing in planks-quarry-road-3, planks-quarry-depot-2, quarry-road-1 (both sizes), castle-street-1, courtyard-1, outpost-1; forest-road-1 no duller than its first `-after-` shot. Shots `*-after3-*` (`node tools/art/backgrounds/shots.mjs <url> after3 <dir> [rooms]`; `BKG_SPOTS` for the plank spots, listed in step-8.md). Traps met: a sparse clone hides the mirror's PNGs (the tool reads them from git); local `main` may be stale (check `git status` says on a branch); e2e takes ~20 min and its shots land under `docs/plan/`; the busy `main` makes decisions-log conflicts on every rebase (both sides are appends: keep both).
Brief for one builder. Written 2026-11-24 15:00 UTC by the outgoing
orchestrator (`session_017WiGzHhT2apmWHT61rQ65G`), at the owner's word.

**The owner, 2026-11-24 ~14:50 UTC, first-hand to that orchestrator:**
> Some new biome backgrounds getting added to the drive.
> You can make use of those while your successor is getting up to speed on other things

**Reports:** `send_message` to the session on the Orchestrator line of
`docs/questions-for-the-owner.md` (the successor orchestrator), after each
push, with shot paths. **Notes:** `docs/plan/step-8.md`, a "Biome
backgrounds" section. Read first: `docs/mechanisms/design-library-sync.md`,
`docs/mechanisms/asset-requests.md` ("Listed, not mirrored"),
`docs/mechanisms/art-pipeline.md` and `rendering-world.md` (backdrops and
parallax), `docs/plan/step-8.md` ("Look pass" and the looks after it).

## The task, and the measure

The look is first (`docs/plan/step-8.md`; `docs/vision-gaps.md` row 7). New
art from the owner is approved for immediate use (D-096). Moves no row of
the plan's table; the owner judges it by eye.

## Measured

- The mirror already holds one set, `docs/design-library/03-visual-direction-and-assets/bkg-01-runtime-biome-panoramas-1024x180/backgrounds/`
  (forest waterfall, ice cavern, iron quarry evening and more, 1024x180,
  `.png` and `.webp`); the forest uses its forest panorama.
- `python3 -I tools/drive_sync.py --check` did not finish in 300 s for the
  orchestrator at 14:55 UTC (the crawl is slow; cause not looked into). The
  owner said "getting added": the upload may still be going.
- Not measured: which of today's rooms have a backdrop and which draw a
  plain sky. `ls content/backdrops` and each room's backdrop field say.

## Do

1. **Sync** (`python3 -I tools/drive_sync.py`, given time: run it in the
   background and wait; if it cannot finish, say what it printed and fetch
   only the new folder by its Drive id as "Listed, not mirrored" shows).
   List what is new, by file, size and pixel size. Commit the mirror as its
   own documents-only push. If nothing new is there yet, check again in 20
   minutes, twice, then report.
2. **Table before art:** every room a player can reach, the backdrop it has
   now, and the new or existing panorama that fits it (the castle street,
   courtyard, undercroft, gallery, throne room, cantina, the Bandit Camp,
   the Iron Quarry's six rooms, the forest's two). Put it in your notes.
3. **Bring them in as backdrops** the way the existing ones are (content,
   not code; integer pixel scaling only, never blurred; parallax as
   `rendering-world.md` describes), one push per place or small group,
   each with a before and after phone-sized shot (844x390, 750x340,
   390x664) in `docs/plan/step-8-shots/backgrounds/`. Mark each choice
   `DRAFT:`; one `docs/decisions-log.md` entry for the lot, in the owner's
   terms, saying which background went where and that swapping one is one
   line.
4. A background that fits no place yet (an ice cavern, say) is listed in
   your notes for Step 15's lead and the next region, not forced in.

## Paths, traps, scope

Yours: `docs/design-library/` through the sync only (never hand-edit the
mirror), `content/backdrops/`, the backdrop field of a room or level file
(that one field only), `public/` or `assets/` where backdrops are built
from, `tools/art/` for a cut, your shots and notes. Not yours: any room's
tiles or placements; the HUD; the camera (`session_017WiGzG1qWbjnes8nG1FuzM`
is changing it tonight: a backdrop must still read with the view leaning
up); the forest and the quarry belong to leads
(`session_017WiGzHD8gtSGTegd3n8W4G`, `session_017WiGzF7NsB3KTwXkWUXE63`):
message each before changing its backdrop, and go ahead `DRAFT:` unless it
objects. Traps: a panorama 180 px tall behind a room taller than the view
shows its top or bottom edge when the camera leans: check tall rooms; e2e
facts that judge drawn pixels may move: run the full `npm run e2e` and
count reds before re-timing any; every e2e run rewrites shots under
`docs/plan/` (`git checkout -- docs/plan/step-2*-shots` before a commit)
and run the builder card's skip-worktree check. Files over 1 MB that
nothing loads stay listed, not mirrored. Stop at about 300k tokens with
notes.

## Decided vs. open

Decided: use them now (the owner's words above; D-096). Open, yours:
which goes where (`DRAFT:`). Nothing for the owner but the look.

## Verify

Build, check, full `npm run e2e`, pushed to `main`,
`npm run check:deployed`; the before and after shots in the repo. A
subagent of the orchestrator will look at them.
