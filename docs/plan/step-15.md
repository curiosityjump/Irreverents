# Step 15 — A second place, worth coming back to

**Reference.** Plan step; its status line is in docs/plan.md.

## 2026-11-23 19:40 UTC, the owner's verdict after playing: nothing here is briefed

**Owner, 2026-11-23 ~18:30 UTC, to Vision Partner, first-hand, after playing
on a phone** (`docs/vision.md`, "The measure"):
> Remember the original intentions for the game and make sure things align with it. I want to play it as I described it.
> There are no heists or stealth yet, no puzzles, no hidden places to explore, no characters to unlock, no escalating combats or chases, no power/item stealing,  no vehicle hijacking, no risk. Virtually everything described in the vision docs that would make the game genuinely fun to play is yet to be seen at all

The re-plan from these words is `docs/plan/core-loops.md`. It puts the eight
loops the owner names into the three places that exist (the castle town, the
Bandit Camp, the quarry's depot) before any new room, so **this step is not
briefed and waits** behind the eight first playables. When it opens, its
"one thing out of everyone's reach" should be reached by a power of Step 9 or
a hero of Step 13, as the quarry pit's ledge is.

## Why

**Owner (Drive, doc 11, D-003, D-005):**
> D-003 World between and among level-regions is fully playable and secret-bearing, with interconnected exploration, not a static selector hub.
>
> D-005 Deep secrets, side areas and discoveries available long after first visitation; re-visitability is core.

**Owner (Drive, doc 04, "Progression by increasing capability"):**
> Certain characters arrive well after a player has passed features where they'd have helped. This is desired rather than a progression flaw.

The library's golden scenario G-03 (doc 12): "early forest area with high
canopy, narrow route and stone barrier … revisiting feels like
rediscovery, not backtracking for an icon collectible."

## Goal

A road leads out of the castle town to a forest, a second place a few
rooms big. You walk there, and whoever is chasing you can follow. On the
first walk you see a gap too low, a canopy too high and a stone gate you
cannot keep open; each gives way to a different hero. One more thing
stays out of everyone's reach, waiting for a power or a hero you do not
have yet. Reaching the deepest spot opens a short way back.

## What's decided

- **Files only: the measure is "engine and content stay separate"**
  (`CLAUDE.md`). Rooms in Step 3's format, things through Step 4's
  placements, checks as scenarios; no commit of this step touches
  `src/`. If a room needs something the game cannot do, build without it
  and tell the lead who owns that part: a finding, never a quiet engine
  edit.
- **The place is a forest** (`DRAFT:` placeholder, D-096): doc 25's
  level 04, a proposal, cut down to a trail, "root tunnels", an "ancient
  stone door" and a "canopy". It is doc 04's own illustration and G-03's
  setup, and needs only tonight's moves and Step 3's parts. Its mentor,
  sage and creatures are left out (D-056, D-058): no new kind of person,
  no sign, arrow or text (D-057). Three to five rooms.
- **You walk there** (D-003): one road room joins a door in the kingdom
  to the forest. A chase can follow, and arriving cools nothing (D-077).
  Hiding places a pursuer cannot get to are rare between levels (D-077):
  `DRAFT:` at most one on the road, as its secret.
- **Three things are seen on the first walk, each closed by the world,
  never by a name check** (D-006): a gap one tile high; a canopy ledge
  above any plain jump; a stone gate open only while its plate is held,
  with only a heavy crate nearby to hold it. A way round by a throw, a
  stack or a friend is the game working (doc 04, "Puzzle design ethos").
  `DRAFT:` the trail itself is open to any one hero alone (D-015).
- **One more thing is beyond all three heroes' own moves** (`DRAFT:`),
  for G-03's "long after first arrival". All three are in the party
  from the first minute, so the three above open by switching hero;
  this one waits for a power (Step 9) or a found hero (Step 13), shut
  and in plain sight.
- **Every pocket has a way out any body can take** (always a way out,
  `CLAUDE.md`; `INTENT:` in the room file's note): a friend can be
  thrown in, and a player can switch hero inside. `DRAFT:` the deepest
  pocket's way out leads to the trail and stays open: G-03's
  "shortcut".
- **Ready for what comes next.** Ids are plain, start `forest-`, and
  never use a proposed name. Each room and hidden area has its own id
  and says whether it is hidden (D-079), for Step 14 to count and keep
  in Step 7's store; this step saves nothing. Rooms use only the kinds
  of tile the format has, so the grassy-ruins atlas on order is one
  `"atlas"` line per room, added by Step 8 (`docs/architecture.md`,
  "Where art plugs in"; S00-01 is a look reference, not an atlas:
  doc 14).

## How to cut it (a suggestion, not a rule)

Two slices at once, in separate files: **the trail** (road and forest
floor, all four things in view), which lands first, and **the insides**
(tunnels, canopy, deepest pocket).

**On `main` first** (all there at 04:55 UTC, 2026-11-23): Step 3's
rooms with doors and a room to take the door (`castle-street`); Step 2's
three heroes, crates and throw. **Still to come, not needed to start:**
Step 3's plates and gates (the gate, the short way) and its way-out
check (signal 1); `npm run e2e` (signal 6); Step 9 or Step 13 (half of
signal 4). Until then build geometry: the gap and the canopy need no
parts. A room with no doors stands alone in the check
(`docs/mechanisms/rooms-and-doors.md`): prove each room doorless, then
add every door in one push.

Drop first: what opens the later thing, then the short way, then the
insides as rooms of their own. Never cut: the road you walk, a way out
of every pocket, no name check, nothing under `src/`.

## What's open (the lead's to measure and decide)

- Read in full: `docs/design-library/02-gameplay-systems/04-world-structure-secrets-and-revisiting.md`;
  `docs/design-library/04-decisions-and-prototyping/25-playable-level-anthology-twelve-irreverent-adventures.md`;
  and, in `docs/design-library/05-world-and-game-expansion-proposals/`,
  `28-ten-more-gameplay-first-level-designs.md` and
  `15-world-atlas-the-kingdom-and-its-hidden-routes-proposed.md`. Docs
  25, 28 and 15 are proposals: borrow shapes, never names. The room
  format is `docs/mechanisms/rooms-and-doors.md`.
- Layouts and room count; which wall of which room takes the door (agree
  it with Step 3's lead, who may prefer to make that edit); what closes
  the later thing (see what Step 9's power or Step 13's hero can do in a
  room; if neither is on `main`, use height or distance); how many
  hiding places on the road a pursuer cannot get to, counted by Step 4's
  rules for moving and seeing. For each: pick the simplest, mark it
  `DRAFT:`, log it in `docs/decisions-log.md`.
- Whether Step 3's check accepts a room only one hero can enter. If it
  does not, make the insides hidden areas of the forest floor and tell
  Step 3's lead.

## Feedback signal

Scenarios in `npm run check`, named `step15-*.json`, each with a control
watched to fail; no gate tag.

1. Step 3's checks, unchanged, pass with the forest joined to the
   kingdom, for every party member once its way-out check is on `main`
   (control: with one end of the kingdom's door removed, it is
   refused).
2. Each hero, alone, walks from the kingdom's door to the trail's far
   end and back; a body that only walks crosses the road (control: a
   one-tile step stops it).
3. The gap, the canopy, the gate: the hero that fits gets in by its own
   moves; each of the others walks up to it and does not. One more
   scenario gets another hero in by a throw or a stack, and must pass.
4. The later thing: each hero, alone, fails to reach it. With Step 9 or
   13 on `main`, the power or the found hero reaches it; without, say so
   under Measure.
5. The biggest hero, started inside each pocket, gets out (control: the
   way out made solid). Once the deepest way out is used, a walking hero
   gets in from the trail; before, it cannot.
6. `npm run e2e`, phone-sized page, touch only: through the new door,
   along the road, into the forest; switch hero; enter the gap (control:
   the door removed).

## Stopping condition

Signals 1–6 pass on `main` and live (`npm run check:deployed` exits 0),
`npm run gates` shows gate B as it was, `docs/architecture.md` has an "I
need to add… a region" row, Step 10's lead has the walk to the forest as
a beat, and after `git fetch origin main` this prints 0 (no commit that
added the forest touched `src/`):

```
git log --format=%H origin/main -- 'content/rooms/forest-*' 'content/placements/forest-*' 'scenarios/step15-*' | xargs -r -n1 git show --format= --name-only | grep -c '^src/'
```

**Budget:** 100 minutes from claiming. If the 10:00 UTC cut-off in
`docs/current-directive.md` is nearer, land the road and forest floor
with signals 1–3 and list the rest in your handoff note. Unfinished
rooms are not joined to the kingdom.

## Owns

New files only; no new directory, kind file, system or draw file:
`content/rooms/forest-*.json` (Step 3's directory and format),
`content/placements/forest-*.json` (Step 4's), `scenarios/step15-*.json`
and one touch case where `npm run e2e` keeps its cases. It builds on
Step 2's heroes, crates and throw, Step 3's rooms, doors and parts and
Step 4's placements, and edits none of them, except one door in one
existing room file, agreed with Step 3's lead. The four shared files
(`src/sim/types.ts`, `src/sim/systems/physics.ts`,
`src/client/render.ts`, `content/tuning.json`) take only small additive
edits after `git pull --rebase`; this step should need none.

## Taste, for the owner in the morning

Whether the trail is fun to run; whether what you cannot reach makes you
want to come back; whether the road feels like a place; whether the deep
spot felt found, not pointed at; the forest as the choice. List these;
don't grade them.

## Measure

*(Lead `session_017WiGzHD8gtSGTegd3n8W4G`, 2026-11-24 ~09:15 UTC, at 1ae9c19; two read-only reads of the library and of the quarry's files.)*

**The draft against the library.** Every D-number it cites exists in doc 11 (`docs/design-library/04-decisions-and-prototyping/11-decision-register-boundaries-and-open-questions.md`) and the D-003, D-005 and doc 04 quotes are verbatim. Corrections, read these in place of the text above:
- D-006 (l.33) is about creative, consistent ability use. "Never a name check" is doc 04's "Puzzle design ethos" (`02-gameplay-systems/04-world-structure-secrets-and-revisiting.md:39`: "Avoid doors which only work because the game checks for a rigid icon match").
- D-015 (l.53) is about co-op challenges and does not say the trail is open to one hero alone; that stays `DRAFT:`, ours.
- D-057 (l.251) is about dialogue and allows "simple icons"; "no sign, arrow or text" is doc 04 "Player awareness and map" (l.51).
- The doc 04 quote is library prose, not an owner decision; doc 04:73 calls its forest "an illustration of revisitation value, not locked content".
- G-03 (doc 12 l.33-37) is quoted as Setup "…" Pass; its Experience line, dropped above, is "long after first arrival, newly recruited character unlocks a deep secret and a shortcut". It names a recruit, not a power; doc 04:19 allows either.
- D-079 is OWNER-FAVORED / STRONG DIRECTION, not CONFIRMED. The register uses the id D-096 three times (l.381, 393, 401); here it means l.381, default use.
- No CONFIRMED decision is contradicted.

**The place: a forest** (`DRAFT:`, `docs/decisions-log.md`, "Step 15: the second place is a forest"). The owner has named no place; the forest has unused owner art (BKG-01 `forest_waterfall`, P10 TRN-01 and TRN-10) and is doc 04's and G-03's own shape.

**A stage is data** (`docs/mechanisms/stages.md`): stage, level, defeat and completion files, no `src/` edit; quarry ids are hard-coded only in `scripts/stage-bot.ts` and `scripts/checks/step14-levels.ts`. The courtyard (30×9) has free floor at columns 6-13 of rows 6-7 for a three-wide enter door, the quarry's `qqq` beside it at 17-19. The later thing defaults to a boulder only the boost lifts (grappler 150, boost 420), pending a measure that a boost survives the walk. Full derivation: the brief.

## Briefs

- `handoff-prompts/step-15-forest.md` (09:20 UTC; builder `session_017WiGzJeF58oqWdt3WEH722`): four pushes, road and trail as a stage → the insides → the guarded spot and the clear → on the phone.

## Open with the owner

## Handoff notes

## Builder notes

*(Builder `session_017WiGzJeF58oqWdt3WEH722`, brief `handoff-prompts/step-15-forest.md`.)*

**Push 1 (road and trail joined, as a stage).** Rooms `forest-road` (48x12,
flat: `step15-road-walks-only`) and `forest-trail` (100x21: the start at the
bottom west, a climb of one-way boughs, the upper trail on row 9, the deep
level rows 15-18 back west to the deepest pocket). The insides are built in
this push too (they are pockets of the one room, not rooms of their own), so
the way-out check plays them now: the root tunnel, the canopy, the gate
chamber, the stone hollow and the deep pocket each get out by a body's own
moves. Level, stage (`end` the deepest pocket; star times are guesses until
push 3), defeat (`gameOver` at the road's doorway), atlas and backdrop files;
the trail's people (two light fighters, a heavy, the brute) and two crates.
Scenarios: `step15-joined`, `step15-each-hero-crosses-{grappler,infiltrator,flyer}`
(recorded by a scratch waypoint walker: courtyard → deepest pocket → courtyard),
`step15-road-walks-only`, `step15-stage-game-over`; controls in each `proves`.

Flags:
- **The lead's decisions-log entry "Step 15: the second place is a forest" is
  not in `docs/decisions-log.md`** (grep at 551684c and after): the brief
  cites it. Mine are the three entries of 2026-11-24 headed "The Bramble
  Forest…", "…short way back…", "…stand-in pictures…".
- **P10's TRN-01 / TRN-10 images are not in the mirror** (only
  `tag-index.csv`, `manifest.json`, the readme): no `tiles/forest.png` can be
  cut. The atlases reuse `tiles/quarry.png`, `DRAFT:`. The backdrop is BKG-01's
  `forest_waterfall` start preview (320x180), screen-pinned, not repeated;
  on a view wider than 320 the sky colour shows to its right.
- **The courtyard's note says columns 1-13 stay clear for Step 7's machine**;
  the brief puts the door at 8-10. A doorway is empty floor to collision, so I
  followed the brief and said so in the room's note; the camp builder and
  Step 22's lead were messaged the diff.
- The infiltrator walking east on the trail walks straight into the crawl (its
  box fits under the mound): the secret finds the small hero. The crossing
  scenario hops onto the mound.
- Full run of a crossing with the grappler is about 90 s of game time: the
  walker waits at each two-tile wall before jumping. A person is faster.

**Push 2 (the insides).** Spawns added inside the three under-floor
pockets and by the hatch (spawn order: 0 the trail by the mound, 1 by the
hatch, 2 tunnel, 3 chamber, 4 hollow, 5 the start, 6 the deep pocket). The
boulder (`content/characters/forest-boulder.json`, weight 300 in
`content/tuning.json`, placed `slab-boulder` at column 74). Pieces
`forest-1`..`forest-5` (`content/completion/bramble-forest.json`).
Scenarios, recorded with the scratch walker: `step15-gap-*`,
`step15-canopy-*`, `step15-hatch-*` and `step15-hatch-friend` (the other way
in), `step15-later-*` and `step15-later-boost`,
`step15-way-out-{tunnel,chamber,hollow}-grappler`, `step15-shortcut-shut`,
`step15-shortcut-opened`, `step15-boost-survives-the-walk` (the measure: a
held power does not fade; only a dropped orb does). Controls named in each
`proves`, watched to fail in one batch. The canopy has no way-out scenario:
it is a bough you walk off. The deep pocket's way out is the crossing
scenarios' climb back up the shaft.

Flags:
- The boulder is a grey box (`color`), no sprite: no new art tonight.
- `step14-all-found-opens-cantina` seeds every level's set complete; the forest's five pieces were added to its seed (as town-7 was), or it went red.
- "One by a throw or a stack": the one proven is a friend on the plate
  (`step15-hatch-friend`); a throw onto the canopy is not scripted.

**Push 2b (the forest's own tiles).** `assets/tiles/forest.png` drawn by
`tools/art/tiles/forest.py` (deterministic; same 128x256 layout as
`quarry.png`, so the atlases' cells are unchanged): grass cap and cobbled
earth cut from P10 TRN-01 (the prefab conversion's `ground_wide.png`), the
one-way ledges are TRN-10's long mushroom cap. Kept from `quarry.png`: inner
corners, tops, unders, the cave/cut-stone regions. TRN-10's crop is in the
repository but skip-worktree in a blob-limited clone: `forest.py` reads it
with `git show`. Measured density about 2.6 source px per art pixel, not
5.6. Shots: `docs/plan/step-15-shots/`.

### Handoff (builder `session_017WiGzJeF58oqWdt3WEH722`, stopped at its budget)

Live: push 1 (518e220), push 2 (841d4a8), and the forest tile sheet (this
commit). **Not built: push 3 and push 4.** What the next builder needs:
- **The walker:** `tools/scenario-bots/` (README there) records a scenario's
  inputs from waypoints in half a second; every `step15-*` was made with it.
  `scripts/stage-bot.ts` is untouched (no stage argument yet).
- **Push 3 plan, measured layout:** the upper trail (row 9 floor) has free
  floor at columns 86-93 (between the hollow's way-out patch 88-89 and the
  shaft 94-98: 90-93 solid floor) for the guarded spot: a lookout facing west
  at about column 91 with its horn at 92, `entries` on both sides (row 8:
  e.g. 44, 62, 80 west; 93 east; the deep level row 18 is another side).
  The thrower (`ranged-fighter`) on the root mound's top (tile [31, 6]) is a
  high spot in view of the trail. The spear's `sources` gets one forest entry
  (`content/weapons/spear.json`, e.g. trail start floor [6, 18]).
  `step15-cleared`: the stage end is the deep pocket box (15-24, 15-18):
  the crossing scenarios already reach [20, 19], so a stage-cleared fact on
  them is close to free. Star times (`good` 120, `best` 80) are guesses: the
  scripted crossings reach the end at 31.9 s (infiltrator), 43.5 s (flyer),
  46.1 s (grappler) from the courtyard, walking only, no enemies.
- **Push 4:** `scripts/e2e/forest.ts` not written. Shots wanted (brief,
  10:10): sideways 844x390 and 750x340, and upright, of the road, the trail
  and each of the three things; three are in `docs/plan/step-15-shots/`.
  `docs/architecture.md` "I need to add… a region" row and the Step 10 beat
  line in `docs/for-the-orchestrator.md` not written.
- `npm run e2e` was run at push 1 (ok, 126); not since (pushes 2 and 2b are
  content and art only).

Taste for the owner (not graded): whether the climb of mushroom boughs at
the start is fun or a chore; whether the visible deep pocket behind the
cracked wall pulls you in; whether the grey boulder says "come back with
something"; whether the trail is too long for a walker (about 45 s).

### Push 3 (second builder `session_017WiGzG4nNVPXPAo2ztGmx3`): the guarded spot and the clear

The guarded spot is the upper trail's east end (`content/outposts/forest-trail.json`): `trail-lookout` at column 91 (west 4 s, east 3 s), `trail-horn` at 92, entries 44, 60, 80 west and 95 east (`entryAway` 8, `bound` 10: six people are placed on the trail; `leaveCold` 5, `leaveIdle` 10 as the depot), rows 1, 2, then a fighter and a heavy. The thrower `trail-thrower` (a `ranged-fighter`) on the root mound's east end, [32, 6], looking west over the climb onto it; measured, he does not block the way over (the grappler walks over him). The spear's forest source `forest-trail-spear` at [6, 18], the trail's floor by the way in. `scripts/stage-bot.ts` is untouched: the clears were recorded with `tools/scenario-bots/walkbot.ts`, which gained `placedRooms`, `world` and `fight` (punch whoever is just ahead; standing, turn to one behind), and `tools/scenario-bots/run-some.ts` runs a few scenarios by id (a minute, against the check's seven).

Scenarios: `step15-cleared` (the grappler fighting: 47.0 s, 4 defeated, 0 alarms, 3 stars, kept as best), `step15-clear-best` (the infiltrator fighting, 29.5 s, one alarm, 3 stars by time), `step15-clear-slow` (the grappler walking, 56.1 s, one alarm, 2 stars), `step15-caught-fight` (seen climbing out of the hollow; the grappler punches the lookout into his horn and breaks it, then beats the wave's fighter), `step15-caught-both-sides` (the flyer seen and not fighting: wave 1's two people walk in one each side). Star times from those runs: good 52 s, best 40 s (decisions-log "The forest's star times"). Controls watched to fail: the end box moved to rows 1-2 (`step15-cleared`); best 25 s (`-clear-best`); good 60 / best 58 (`-clear-slow`); `entries` removed (both `caught` scenarios). `step15-stage-game-over` was re-recorded (same claims, later ticks): the thrower's lobs knocked the first recording's walk back before the fighters.

Flags:
- The flyer, walking or fighting by script, is knocked out on the trail (hero-out at about 42 s) and the grappler takes over: the trail's fighters are a lot for the lightest hero. Measured, not tuned.
- Every scripted clear is `unseen: false`: the lookout faces the only way on. The quiet ways (the flyer over the lookout's 40 px of sight; slipping past while he looks east) are not scripted.
- Stars: two stars is earned by any first-try clear (`stars.tries` 1, Step 22's rule), so "good" only splits two from one after a start-over.

Landed: 4323a15 (the first push of it, 13499e1, never went live: see `docs/process-observations.md`, 2026-11-24 12:45; reverted at b2f3e99, re-pushed unchanged, live at 12:44:54, `check:deployed` ok, `/debug/errors` empty).

### Handoff (second builder `session_017WiGzG4nNVPXPAo2ztGmx3`, stopped near its budget): push 4 not built

- **The e2e case is written, never run:** `tools/scenario-bots/forest-e2e-draft.ts` (its first lines say how to put it in place: move to `scripts/e2e/forest.ts`, one call line after `quarryFacts` in `scripts/e2e.ts`). Facts `forest-in` (control `E2E_FOREST_BREAK=door`: push up at column 14, no door there), `forest-road-cross`, `forest-switch` (Switch tapped until the infiltrator), `forest-climb` (jumps on the spot at column 11.5 to the trail's row 9), `forest-gap` (stick east, no jump, into the root tunnel). Not yet tried against push 3's people: the thrower on the mound at column 32 now lobs at the climb and at the walk to the crawl (it knocks a hero west; the stick keeps pushing east, so it should still get in, unmeasured). Its shots go to `e2e-out/forest/` at the page's size, 750x340 and 390x664.
- **Shots to commit** (`docs/plan/step-15-shots/`): `tools/scenario-bots/shots.mjs` stands the page's own hero at named spots; its "844x390" were 750x340 captures (`devices['iPhone 14 landscape']` is 750x340): give it a true `viewport: { width: 844, height: 390 }` size as well. Wanted: road, trail start, gap, canopy, hatch, the boulder, the guarded spot (column 86), each at 844x390, 750x340, 390x664; and the courtyard's two doors with the quarry's sign beside the forest's, and the start menu's two stage rows.
- **The lead's look defects (12:20 UTC brief block), untouched:** the earth under the grass is still the quarry's orange cobble (`tools/art/tiles/forest.py`: tint and vary it, `DRAFT:`); the backdrop's hard seam (the two 320-wide preview views side by side, `content/backdrops/forest-*.json`); the rectangular "hole" in the dirt is the pockets (crawl, tunnel, chamber, hollow, deep level) showing the sky backdrop through empty tiles. Measured options: backdrops' `wall` is whole-room (it would also cover the open-air trail), so the data way is a `content/decor/forest-trail.json` with `"layer": "far"` items cut from a dark earth cell over each pocket's rectangle (areas in the room's `areas`, plus the crawl row 8 columns 24-29, the shaft 96-98 rows 9-14, the deep level rows 15-18); if decor cannot be that large, that is a finding for the lead, not an engine edit.
- **Docs owed by push 4:** `docs/architecture.md` "I need to add… a region" row; a line for Step 10's lead (the walk to the forest as a beat) in `docs/for-the-orchestrator.md`.
- **The boulder's sprite:** not looked at (no mossy-stone cut chosen); still a grey box.
- `scripts/stage-bot.ts` untouched; nothing to tell Step 22.

### Handoff (third builder `session_017WiGzGVGmfNTRtDB8nX3Np`): push 4a live, push 4b below, push 5 not built (a finding)

- **Push 4a (5779ebc, live):** the forest's own earth (P10's cobbles two tones down to a loam with moss flecks, `tools/art/tiles/forest.py` `forest_earth`), the backdrop without its seam (`assets/backdrops/forest-glade.png`: the preview's first view beside its own mirror), and dark earth behind every pocket underground (`content/decor/forest-trail.json`, 489 `far` items written by `tools/art/tiles/forest_decor.py`; no engine edit). Decor could cover the pockets: no finding there.
- **Push 4b:** `scripts/e2e/forest.ts` in place, called after `quarryFacts` in `scripts/e2e.ts`. Its five facts (`forest-in`, `forest-road-cross`, `forest-switch`, `forest-climb`, `forest-gap`) passed on their own and twice inside the full `npm run e2e` (the second run 139 ok, 0 failed; the first had `cantina-in` red once, green twice alone and in the second full run: a flake, not the forest). Control `E2E_FOREST_BREAK=door` watched failing (`forest-in` false, the page stays in the courtyard). Shots at true 844x390, 750x340 and 390x664 in `docs/plan/step-15-shots/` (courtyard-doors, road, trail-start, trail-gap, root-tunnel, canopy, hatch, boulder, guarded-spot, deep-pocket); `tools/scenario-bots/shots.mjs` now takes true sizes. Not shot: the start menu's two stage rows (the menu lists only places a world has found; a fresh shot world has found neither by walking).
- **Push 5 not built, measured why (for the lead):** an unseen clear needs more than a way past the lookout. Every bad guy on the upper trail faces west for good (`content/placements/forest-trail.json`: fighters at 41 and 43, the heavy at 49, the brute at 62, each `face left, wait 5`; sight 112 px across, 40 px up or down, `content/tuning.json`), and the stage's only way to its end is east along that trail to the shaft (94-98). A guard on your own level who never turns cannot be passed unseen without something solid between you or more than 40 px of height (`src/sim/npc/sight.ts`). The quiet stretch that exists: the crawl and the root tunnel are out of every sight (the mound blocks the thrower); the tunnel's hatch up (36-37) comes out 5 tiles in front of the fighter at 41. Options, each a change to push 3's trail, for the lead to choose: (a) a line of one-way boughs at row 5 from the hatch east over the fighters, the heavy, the brute and the lookout to the shaft (16 px under the canopy's slab at 46-52, so only the infiltrator fits under it: the small one's high way), plus a 2-tile root stump at column 39 so the climb out of the hatch is hidden; this changes the trail's main walk, so the recorded crossings and clears (`mk_cross.py`, `step15-cleared`, the star times) need re-recording; (b) give the trail's guards a turn in their routine and add one bough or stump per guard; (c) accept that the forest is the fight stage and the quarry the stealth one. My lean: (a), recorded with a copy of `scripts/stage-quiet.ts` set to the forest's rooms (it is the quarry's, hard-coded).
- **Still owed:** the boulder is a grey box (no mossy-stone cut chosen); the cave back is night-blue loam, a first guess (taste); `docs/mechanisms/stages.md` already notes two stages.

- **Push 4c (the orchestrator's look at the shots, the lead's 14:40 UTC message):** the loam one step darker and cooler (`LOAM` in `tools/art/tiles/forest.py`); the boulder drawn as a mossy stone cut from P10 TRN-02's large round rock (`tools/art/tiles/forest_boulder.py`, `content/sprites/forest-boulder.json`); every shot retaken with the new earth. `deep-pocket` is now shot at column 27, outside the stage's end box (the old ones stood inside it and showed STAGE CLEARED). `canopy-390x664` is taken from the trail under the canopy (column 47): upright, the camera stops at the room's top and the party plate covers rows 0-2, so a hero on the canopy (rows 1-2) is always under the plate. That is the camera's and the HUD's question, not the forest's. The thin orange vertical lines (`trail-gap-750`, `root-tunnel-390`, `boulder-844`) are sight-band edges: the thrower's band ends 208 px west of him and the lookout's 112 px west of him, and those edges fall where the lines are.
- **Stopped after push 4c at about 250k tokens:** push 5 (the quiet way) is for the next builder, once the lead has picked an option from the push 5 finding above.

## Released to a lead, 2026-11-24 08:40 UTC (orchestrator `session_017WiGzHhT2apmWHT61rQ65G`)

Why now: `docs/vision-gaps.md` (refreshed at 9dbd705) ranks row 2 first: "one level is not a world: a second region". The eight core loops of the owner's ~18:30 verdict are all built and live, and the last two full re-runs with nothing red were at 6400b44 and f434f2e. So the heading above ("nothing here is briefed") no longer holds the step back.

For the lead, before any brief:
- **Check this file's D-numbers and its "What's decided" against the library** (the draft's independent review never ran). The library's labels are literal: the atlas regions and the ten level designs are proposals (docs 15, 25, 28); which place to build is yours to choose by default (D-096, `DRAFT:`, a `docs/decisions-log.md` entry in the owner's terms), from what the owner has named or drawn art for. Say in your first report which place and why.
- **Build it out of what exists**, not beside it: hearts and game over (Step 21), a stage that can be lost, cleared and rated (Step 22: the Iron Quarry is the model, and a second place should be a second stage on the menu), alarms whose rows come in from both sides (`content/outposts/` `entries`), bad guys beaten for good, the chase, weapons lying about (Step 23), a machine to hijack (Step 20; guard-vehicle sprites are cut as group `guard-vehicles`, df67f5d, and nothing draws them yet: a second region is where they belong), the thrower of Step 24 once its slice 1 lands, hidden pieces and an explored share (Step 14). A new region that needs engine changes is a sign a primitive is missing: say which.
- **Art:** nothing new is available tonight; use what is cut from the owner's approved plates (`docs/plan/step-8.md`), mark stand-ins `DRAFT:`, and send real needs to Vision Partner (`docs/mechanisms/asset-requests.md`). The look pass of 07:45 UTC (`docs/plan/step-8.md`, "Look pass") counts a grey-box room against you.
- **Who else is in the tree tonight:** the camp (`session_017WiGzGkuNQcsBDa2oWh23s`), the town and the page's drawing under delay (`session_017WiGzHqA8GMgCCLsfWzdzm`), the phone's HUD (`session_017WiGzHxAKbURW5YnQt6bDN`), the Hall gallery's thrower (`session_017WiGzEb3ESHBHGr3vhpB3k`), Step 22's lead (`session_017WiGzF7NsB3KTwXkWUXE63`). A new region's own rooms collide with none of them; its doorway into the kingdom is one shared edit: agree it by message.
- Spawns: model `claude-opus-5-5`, `blob_limit_kb: 150`, one builder at a time unless paths cannot overlap; a builder stops at about 300k tokens. Report to the session on the Orchestrator line of `docs/questions-for-the-owner.md`.

## Lead reviews by re-running

- **Push 1 (518e220), reviewed at 52812dd, 10:10 UTC, by the lead in a detached worktree (diffs not read beyond the courtyard and stage files):** `npm run build` 0, `npm run check` ok (6 `step15-*` scenarios ok, every other scenario ok), `npm run gates` 6 of 6 (B unchanged, 15 scenarios). Control re-watched: `content/defeat/forest.json` without `gameOver` makes `step15-stage-game-over` fail 4 of its claims (the game over lands in the cantina, nothing starts over); restored, it passes. The stopping-condition grep prints 0. e2e not re-run (the builder's run was green; the orchestrator's next full re-run covers it). Open from the builder's flags: the atlas reuses `tiles/quarry.png` because P10's forest rows are not in the mirror: a real ask for Vision Partner (`docs/mechanisms/asset-requests.md`), owed by push 4.
- **Push 2 (841d4a8), reviewed at 155913d, 11:25 UTC, by the lead in a detached worktree:** build 0, `npm run check` ok (all 26 `step15-*` files on disk ok, every other scenario ok, including the edited `step14-all-found-opens-cantina`), gates 6 of 6. Control re-watched: the boulder's weight set to 140 (under the grappler's 150) makes `step15-later-grappler` fail (he grabs it at tick 222); restored, all four `step15-later-*` pass. Noted, not a fault: push 2 edits another step's scenario (`step14-all-found-opens-cantina` gains the forest's five pieces in its seed, as town-7 was added), which is additive and keeps its claim. Still owed: the forest's own tiles (P10 pack, push 3), a throw or stack onto the canopy (only the friend way is scripted), and the boulder is a grey box (push 4 shots will show it).
- **Push 3 (4323a15; first pushed as 13499e1, reverted at b2f3e99 when live did not move for 8 minutes, re-pushed as the same tree), reviewed at c2a3172, 13:05 UTC, by the lead in a detached worktree:** build 0, `npm run check` ok (all 31 `step15-*` files on disk ok, every other scenario ok), gates 6 of 6. Control re-watched: `callers` emptied in `content/outposts/forest-trail.json` makes `step15-caught-both-sides` fail (no wave, nobody in the room); restored, both `step15-caught-*` pass. Live at 4323a15 per `/healthz`. Open, given to the third builder (`session_017WiGzGVGmfNTRtDB8nX3Np`): push 4 (the look defects, the phone case, the shots, the docs) and a quiet way past the lookout (no scripted clear is unseen today).
- **Push 4a (5779ebc, live 13:30 UTC), re-run by the lead at 7d1d395:** build 0, check ok (31 `step15-*` ok), gates 6 of 6. Art and decor data only (`assets/tiles/forest.png`, `assets/backdrops/forest-glade.png`, `content/decor/forest-trail.json`); no control applies. Its look is judged from push 4b's shots.

## Look at the forest's shots, from the orchestrator (session_017WiGzHY5UZsWTLCH8cLm8M, 2026-11-24 ~14:45 UTC)

By a subagent reading 13 of the 30 shots in `docs/plan/step-15-shots/` at phone size; not by playing. For the lead to weigh, not re-measured:

- **Holds:** no seam behind; dark earth behind every pocket; the road, the trail's start and the courtyard's doors are clean at all three sizes; the banner reads.
- **"Dark loam": partly.** The ground still reads as a warm mid-brown cobble with a bright grass top, not dark.
- **`deep-pocket-844x390` and `-750x340` show only the STAGE CLEARED screen**, so that secret is not shown at either sideways size: retake them.
- **`canopy-390x664`: the hero on the canopy is behind the party plate**, only legs showing.
- **The boulder is a plain grey rectangle** (`boulder-390x664`).
- Seen and left alone, likely the watchers' sight bands (deliberate, Step 19): translucent orange boxes in `canopy-844` and `guarded-spot-844`; thin orange vertical lines in `trail-gap-750` and `root-tunnel-390`. Say in one line if they are something else.
- `trail-gap-750`: a hooded enemy sits under the star and sound buttons, top right.
- **Push 4b (d02ba1d), re-run by the lead at c4872c3, 14:55 UTC:** build 0, check ok (31 `step15-*` ok), gates 6 of 6. e2e not re-run by the lead (the builder's full run: 139 ok, 0 failed, with the `forest-in` door control watched failing; the orchestrator's next full re-run covers it). Shots looked at by the lead (trail-start-844x390, root-tunnel-844x390, guarded-spot-390x664): no quarry cobble, no seam, dark earth behind the pockets. The orchestrator's look (above) found four more: two deep-pocket shots, one canopy shot, an earth tone and the grey boulder, all briefed as push 4c. Push 5 is option (a) (`docs/decisions-log.md`, 14:50 UTC).
