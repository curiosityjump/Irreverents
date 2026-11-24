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

## Released to a lead, 2026-11-24 08:40 UTC (orchestrator `session_017WiGzHhT2apmWHT61rQ65G`)

Why now: `docs/vision-gaps.md` (refreshed at 9dbd705) ranks row 2 first: "one level is not a world: a second region". The eight core loops of the owner's ~18:30 verdict are all built and live, and the last two full re-runs with nothing red were at 6400b44 and f434f2e. So the heading above ("nothing here is briefed") no longer holds the step back.

For the lead, before any brief:
- **Check this file's D-numbers and its "What's decided" against the library** (the draft's independent review never ran). The library's labels are literal: the atlas regions and the ten level designs are proposals (docs 15, 25, 28); which place to build is yours to choose by default (D-096, `DRAFT:`, a `docs/decisions-log.md` entry in the owner's terms), from what the owner has named or drawn art for. Say in your first report which place and why.
- **Build it out of what exists**, not beside it: hearts and game over (Step 21), a stage that can be lost, cleared and rated (Step 22: the Iron Quarry is the model, and a second place should be a second stage on the menu), alarms whose rows come in from both sides (`content/outposts/` `entries`), bad guys beaten for good, the chase, weapons lying about (Step 23), a machine to hijack (Step 20; guard-vehicle sprites are cut as group `guard-vehicles`, df67f5d, and nothing draws them yet: a second region is where they belong), the thrower of Step 24 once its slice 1 lands, hidden pieces and an explored share (Step 14). A new region that needs engine changes is a sign a primitive is missing: say which.
- **Art:** nothing new is available tonight; use what is cut from the owner's approved plates (`docs/plan/step-8.md`), mark stand-ins `DRAFT:`, and send real needs to Vision Partner (`docs/mechanisms/asset-requests.md`). The look pass of 07:45 UTC (`docs/plan/step-8.md`, "Look pass") counts a grey-box room against you.
- **Who else is in the tree tonight:** the camp (`session_017WiGzGkuNQcsBDa2oWh23s`), the town and the page's drawing under delay (`session_017WiGzHqA8GMgCCLsfWzdzm`), the phone's HUD (`session_017WiGzHxAKbURW5YnQt6bDN`), the Hall gallery's thrower (`session_017WiGzEb3ESHBHGr3vhpB3k`), Step 22's lead (`session_017WiGzF7NsB3KTwXkWUXE63`). A new region's own rooms collide with none of them; its doorway into the kingdom is one shared edit: agree it by message.
- Spawns: model `claude-opus-5-5`, `blob_limit_kb: 150`, one builder at a time unless paths cannot overlap; a builder stops at about 300k tokens. Report to the session on the Orchestrator line of `docs/questions-for-the-owner.md`.
