# A hero found in a hidden cave, who lifts the stone nobody else can, and a hidden pocket under the castle only she opens (Step 13)

**For the next builder, from the orchestrator, 23:20 UTC, BEFORE push 3; these two were asked of the first builder at 21:18 and its report does not say they were done (check `docs/plan/step-13.md`, "Hidden recruit: builder notes", and the scenarios, before redoing them):**
1. **A phone can free her.** The first builder: "a Use hold by touch at the cage didn't free her on the page in one try" (so no shot exists of her freed, in the cantina or on the party plate). By touch on a phone-sized page at 150 ms each way, 10 holds at her cage in `quarry-cave`: how many free her, and when one does not, why (the hold released early, the Use arbiter giving the button to something else at that spot, the cage's reach, her call's bubble over the button, the hold's progress not drawn). The first recruit's cage in the Bandit Camp is the control: does a touch hold free the skirmisher 10 of 10? Fix what is found; an e2e fact (freed by a touch hold, then on the plate and in the cantina) with a control; shots of the banner, her on the plate, her in the cantina, her lifting the forest's boulder, at 844x390 and 390x664.
2. **A new game does not show her early.** A scenario with a control: in a NEW game's world, as the server starts one, she is not a cantina regular and not on the party plate before she is freed, and is both after (the 11 cantina and hearts scenarios were seeded with the five heroes at ce3f8bf, which would hide this).
Then push 3. If 1 or 2 shows a fault a player would hit, that fix is the push, ahead of push 3.

Brief for one builder, three pushes, most visible first, each live and
standing alone. Written 2026-11-24 by the orchestrator
(`session_017WiGzHY5UZsWTLCH8cLm8M`), from a read of `main` at 706849a
(nothing was run). Read first: `docs/plan/step-13.md` (all of it, and its
last section, "A hidden recruit, and a secret only they open"),
`docs/mechanisms/recruits.md` (all), `docs/mechanisms/rooms-and-doors.md`
("Behind the throne", "The stone plate's pocket", the room file),
`docs/mechanisms/levels.md` (pieces), `docs/mechanisms/scenarios.md`,
`docs/verifying-and-finishing.md` ("The pre-push gate"). Library files you
need, by path and nothing else (never search or sync the mirror):
`docs/design-library/03-visual-direction-and-assets/current-pixel-art-explorations/p04-cantina-props-vehicles-hall-visual-source-sheets/cantina-npc-sprite-sheet.png`
(the art; git fetches it when a command opens it).

**Landed so far:** push 1 (the hauler in the cave) at ce3f8bf; push 2 (the stone only she lifts) at 09708bd, both live with check:live ok. The stone lies on the stair's lowest step [22,10], not the hall floor (decisions-log; on the floor it broke two step3 scenarios). **The orchestrator's two asks and push 3 (`step13-free-while-caught`) done by a second builder, 2026-11-25** (commit below in the log; notes: the step file's last bullet). Not measured either: the forest boulder punched onto its plate. Notes: `docs/plan/step-13.md`, "Hidden recruit: builder notes".

**Reports:** `send_message` to the session on the Orchestrator line of
`docs/questions-for-the-owner.md`, after each push, with the commit and
shot paths. **Notes:** `docs/plan/step-13.md`, a "Hidden recruit" section
under the builder notes, newest last. A blocking question goes to the
orchestrator by message and to `docs/questions-inbox.md`; a finding that is
not a question goes in the notes.

## The task, and the measure

The owner, 2026-11-23 ~18:30 UTC, first-hand, after playing on a phone
(`docs/current-directive.md:133`, `docs/vision.md:137`): "... no hidden
places to explore, no characters to unlock ...". Library: D-007 (a roster
discovered in the world, permanently expanding), D-005 (secrets available
long after first visit; re-visitability is core), D-010 (a limited party).
`docs/vision-gaps.md` row 12's close: "one recruit hidden in a secret, and a
secret only they open". Today one hero is found, the skirmisher, caged in
plain view in the Bandit Camp. This adds **a sixth hero, hidden** (found
only by getting into the Iron Quarry's hidden cave), whose difference is
**strength: she lifts and throws what nobody else can**, and **one secret
only she opens** in an earlier place (a stone nobody else can lift, in the
castle's undercroft, carried up a stair onto a plate that opens a hidden
pocket with a new piece). Then it builds the scenario Step 13 names and
never built, `step13-free-while-caught`. Moves no row of `docs/plan.md`'s
table (M3 stays 6 of 6); it closes gap 12's stated close. Whether it is fun
is the owner's to judge by playing; nobody has tried it on a real iPhone.

## Decided (by the orchestrator; `DRAFT:`, one `docs/decisions-log.md` entry per push)

- **Who: a strong mover, id `hauler`** (the function; the library's own
  Layer A type, "strong movers", doc 05). Shown name is data and `DRAFT:`
  ("Graybox Hauler", as the others are "Graybox …"). **Her difference is
  one number: `liftStrength` 500**, above every hero (grappler and brawler
  150, the others 60; `content/tuning.json:172, :205, :240`) and above the
  Brawn power's 420 (`content/powers/boost.json:6`), which is the most
  anything lifts today. Pure data: a character file, a tuning section, a
  roster line, a cantina pattern, a recruit file, a sprite. No `src/` edit.
- **Her art: the barkeep, row 1 of P04's cantina NPC sheet** (the sheet's
  manifest: "Barkeep, patron, brawler, bard"; row 2 is already the
  skirmisher, row 3 the brawler: `docs/mechanisms/asset-coverage.md:99-100`).
  `docs/plan/step-13.md:133` says a second recruit "needs a sixth hero from
  the approved P04 cantina sheet": this is it. Cells read by eye off the
  1448 by 1086 sheet (confirm with `tools/art/cast/compare.py`): idle about
  (68,95)-(228,272), talking (283,100)-(470,272), cheering (497,55)-(690,272),
  worried (735,80)-(885,272), charging (900,75)-(1145,272), knocked out
  (1160,175)-(1385,272). Cut by one new `hauler()` in
  `tools/art/cast/cut3.py`, copying `skirmisher()` (`:172`) and its list
  entry in `make.py`; the walk slides as the skirmisher's does.
- **Where she is hidden: caged in the Iron Quarry's cave** (`quarry-cave`,
  a hidden room), a recruit file only: no quarry room or placement file is
  touched. The cave is its own room, so her cage and her call are drawn only
  inside it (`src/client/draw/recruits.ts:55, :120` skip other rooms): nothing
  drawn points at the secret (`docs/mechanisms/art-pipeline.md`). A cage in a
  pocket of a big room (the forest's) would put her call at the screen's edge
  from the trail above it, which is why not there.
- **The only-she secret: the undercroft.** A new body, **`stone-heavy`**
  (weight 480, cannot be knocked out), lies on the undercroft's hall floor; a
  new plate **`heavy-plate`** (`needs` 480) sits on the top step of the
  hall's stair; it holds a new floor hatch **`heavy-hatch`** over a new
  hidden pocket **`heavy-pocket`** holding a new piece, **`town-8`** (Step
  14's set, appended as `town-7` was). She carries the stone up the stair
  and leaves it on the plate. The stone sits a floor below the plate on
  purpose: see "Measured", the nudge.
- **"Only she", measured and honest:** no other hero alone, with the Brawn
  power, carrying any one thing, opens it (the heaviest such: the brawler
  70 holding the throne 400 is 470). **A pile opens it too** (a Brawn holder
  carrying the throne, 400, up the stair, then the king, 110: 510). That is
  the plate's own rule (`INTENT:` at `src/sim/systems/room-plate.ts:31-34`,
  "reads only weight, never who") and the library's (doc 05, "Character
  roles versus puzzle access": "Other challenges permit creative
  substitutes, particularly via acquired powers or co-op"). Keep it; log
  it; never special-case the hauler.
- **Her strength pays at once in the next place over, for free:** the
  forest's boulder (300, `content/tuning.json:437`) holds the stone slab over
  `forest-4`, and until now only Brawn lifted it. She lifts it with no
  forest file touched. Doc 05's test: "after recruiting one new character,
  the player should remember at least two earlier places that suddenly seem
  worth revisiting": the forest's slab and the undercroft's stone.
- **Solo, by touch, with the buttons there are:** whoever is played frees
  her by holding **Use** at the cage, as today; **Use** again at the open
  cage within 5 s swaps her in on that player's slot ("Swap in"), or she goes
  to the cantina, where a tap on her and a tap on a party face swaps her in
  (`docs/mechanisms/cantina.md`); **Switch** then cycles to her.
  **Grab** lifts the stone; **Jump** climbs the stair carrying it; **Hit with
  the stick up** throws it nearly straight up, so it comes down where she
  stands (`src/sim/body-state.ts:236-241`). No new button.
- **`step13-free-while-caught`** is a scenario of the camp as it is: no camp
  file changes.

## Measured (so you need not)

**The roster and its checks.** `content/roster.json`: `characters` lists
the five, `start` the four (no skirmisher). Append `hauler` to
`characters` only. The recruit kind refuses a character outside the roster,
one in `start`, or one held by two files
(`src/content/kinds/recruits.ts:73-77`), and a cage tile that is solid or
not on solid floor (`:86-89`). The cantina reads one pattern per roster
character (`src/content/kinds/cantina.ts:8, :153-158`; patterns at
`content/cantina/cantina.json:12-34`). `content/hearts.json` and
`content/grips.json` fall back to `default` for a kind they do not list.
The party plate's face falls back to a square of the character's `color`
(`src/client/draw/hud.ts:179-183`); a cut face is `hud-face-hauler` via
`tools/art/props/make.py:229` (optional, push 1 if cheap).

**The trap in the roster: absent means everyone.** `World.roster` absent
means every roster character (`docs/mechanisms/recruits.md`, push 1). So
every scenario that does not seed `"world": { "roster": [...] }` and every
`?room=` world gets a sixth hero: one more regular in the cantina. 27
scenarios are set in the cantina, 7 seed a roster; `scripts/checks/step11-cantina.ts:116-121`
computes its expected regulars from the roster (it follows);
`scripts/e2e/cantina.ts` taps regulars. Count reds before touching
anything; a red cantina scenario is seeded with the five (`"world":
{ "roster": [the five] }`, additive) and named in the commit; more than
five reds: stop and report.

**Weights today over 150** (every `weight` in `content/tuning.json`):
`signal-post` 1000, `throne` 400 (`:308`), `forest-boulder` 300 (`:437`),
`ram-wagon` 200 (`:415`). Nothing lies between 420 and 500, so the stone
is the only thing she alone lifts. Brawn already lifts the throne, the
boulder and the wagon: a hauler throwing the bandits' wagon is not new
(measure once that a machine with a driver behaves; don't fix).

**Grab and throw.** Grab lifts a body whose weight is at most
`liftStrength` (`src/sim/verbs/grab.ts:68`), and says `grab-refused`
`too-heavy` otherwise (heard as a sound only:
`src/client/audio/moments.ts:139`). A throw's speed is `throwStrength /
weight`, capped at `world.maxLaunchSpeed` 520 (`body-state.ts:231`); with
the stick up it goes 20% forward, 100% up. At a `DRAFT:` `throwStrength`
60000 the stone (480) goes up at 125 px/s and 25 sideways: under gravity
900 it rises 8.7 px and lands 0.28 s later about 7 px from where it left
(plus 0.6 px of slide at `groundFriction` 500): it stays on a two-tile
plate thrown from its middle. Jumping is not changed by carrying
(`verbs/jump.ts`, `systems/physics.ts` read no carry state). **A carried
body is dropped when its carrier changes room** (`src/sim/systems/carry-hold.ts:8, :27`;
`content/placements/undercroft.json:2`, "a door lets go of" a carried
body): so the stone must start in the plate's own room. That is why it
lies in the undercroft, not on the street.

**The nudge (why the stone lies a floor below the plate).** A punch
launches by `attackStrength / weight` (`src/sim/verbs/attack.ts:145`), up
by `attackLift` 0.55. Brawn's 30000 on 480 is 62.5 px/s: about 4.7 px in
the air and 3.9 px of slide, about 8.6 px a punch; the grappler's 14000
about 3 px. Fifteen Brawn punches move it two tiles along a floor. A punch
up gives 62.5 px/s up, 2 px of rise; reaching a one-way step two tiles up
needs about 240 px/s. So on the same floor as its plate, a patient puncher
would push the stone on; a floor below, nothing but lifting gets it up.
**The same arithmetic says the forest's boulder can be punched onto its
plate** (the grappler's 14000 on 300 is 46.7 px/s, about 5 px a punch;
`slab-boulder` at column 74, the plate at 77-78,
`content/placements/forest-trail.json:23-24`): not run by anyone. Measure it
once (a scenario, kept or not) and write the result in the notes; do not
change the forest.

**The cave** (`content/rooms/quarry-cave.json`, 30 by 14, rows from `:21`;
`hidden` true). Floor: row 12 is open for columns 6-28 over solid row 13
(`:33`: `######....H.1..............2.P`); columns 1-5 are a step a tile
higher (`quarry-4` lies on it at [3,11]). The hide `cave-dark` at column 10
(not a Use entry: `src/sim/use/` has bell, door, free, get-in, suplex,
thing, weapon). Spawns in reading order: 0 at column 12, 1 at column 27.
In from the pit at the east wall (column 29, rows 10-12, walk door
`to-pit`). No bad guys in the cave. **The cage: tile [7, 12], `w` 2**
(columns 7-8; row 13 under them solid; clear of the hide and the step).
`look` `cage-shut`, `openLook` `cage-open` (P04's barred gate, as the
camp's); `hold` 2.2 (no watcher here, so the number is the camp's for
sameness, `DRAFT:`); a short `call`, `DRAFT:`. File
`content/recruits/cave-captive.json` (the id is permanent once pushed: the
entity `recruit:cave-captive` is a contract kept games hold).
**How the cave is reached today:** the quarry pit's west wall is a hidden
walk door, painted as wall (`content/rooms/quarry-pit.json:51, :88`:
`to-cave`, column 0, rows 16-18): walk west along the pit's floor through
it. The pit is reached by a missed jump on the ridge (the chasm, the
pocket's drop) or the ridge's doorway (`docs/mechanisms/rooms-and-doors.md`,
the quarry map). Pit spawns in reading order: 0 at column 3, 1 at 16, 2 at
36. Placed by `populateRoom` (`src/sim/world.ts:110`) whether or not the
room has a placements file.

**The quarry is a stage** (`content/stages/iron-quarry.json`): beaten in it,
it is put back as it began; "what you found for good (the level's pieces, a
power source, a recruit) stays found" (`docs/deliberate-designs.md:94`).
Measure once, in a scenario: beaten in the quarry with the cave's cage still
shut, after the stage starts over there is exactly one `recruit:cave-captive`
and it is shut; freed, none comes back.

**The undercroft** (`content/rooms/undercroft.json`, 34 by 17; row r is at
line 32+r). The east is a tall hall, rows 3-12 open from column 18 to 32,
floor row 12 over solid row 13 (`:44`: `#...B.3..........SSSS......c.4...T`).
Its stair is one-way steps two tiles apart, each two columns west of the
last: row 11 columns 22-24, row 9 columns 20-22, row 7 columns 18-20 (`:39`,
`:41`, `:43`); the row 7 step leads on, two tiles up, to the upper passage
(row 4) and the secret crawl. Under the hall floor rows 13-15 are solid
from column 16 or 18 to 33 (`:45-47`); row 16 is the last row, solid. In
the hall: the stone plate `stone-plate` (columns 17-20, row 12, `needs`
83) and its grate (row 13, columns 14-15) over `plate-pocket` (rows 14-15,
columns 9-17); the cellar-up doorway (enter, column 27, rows 11-12); spawn
3 at column 29 (reading order: 0 [8,4], 1 [17,4], 2 [6,12], 3 [29,12]);
the walk door to the throne room `to-throne-room` (column 33, rows 8-12).
Placed (`content/placements/undercroft.json`): `undercroft-crate` (crate,
20) at [24,12], and Step 24's thrower `undercroft-thrower` at [21,8], on
the row-9 step, facing west, never walking.

**Where each goes (a measured first layout; `DRAFT:`, yours to adjust, the
way-out check is the judge):**
- **The stone** `undercroft-stone` (kind `stone-heavy`) at **[25,12]**:
  box 24 by 22 (as the boulder's), columns 25-26, between the crate (24)
  and the cellar-up doorway (27), on the hall floor, under the stair.
- **The plate** `heavy-plate` (`needs` 480) on the **top step**: plate
  tiles row 6, columns 18-19 (the open tiles over the row 7 one-way; no
  rule needs solid floor under a plate: `room-plate.ts:58-62` reads where
  bodies rest on the ground, one-way included). The thrower on the step below lobs west
  over the stone plate: she climbs past him under fire, or knocks him off
  first.
- **The hatch** `heavy-hatch`, a `gate` in the hall floor, row 13, columns
  **30-31**, `plates: ["heavy-plate"]` (as `grate`, `:82-87`), clear of the
  stone (25-26) and the doorway (27).
- **The pocket** `heavy-pocket` (hidden area): carve rows 14-15, columns
  23-31 (solid today; row 16 stays its floor; columns 18-22 stay rock
  between it and `plate-pocket`). `town-8` at [27,15] (`content/completion/castle-town.json`,
  appended after `town-7` at `:57`, a look not yet used in the set).
  **`INTENT:` its way out any body takes with the hatch shut**, copied from
  `plate-pocket`'s (`docs/mechanisms/rooms-and-doors.md`, "The stone plate's
  pocket"): one-way tiles at columns 23-24 in row 14 (a ledge) and row 13
  (the hall floor), climbed by two jumps on the spot; from above they are
  floor. Mark it in the room's `"//"`, and in `docs/deliberate-designs.md`
  only if you add a rule that looks odd.
- **What the substitutes measure** (for the controls): Brawn lifts the
  stone? no (420 < 480); the brawler holding the throne on the plate: 470,
  shut; the stone alone on the plate: 480, open; the hauler holding it on
  the plate: 544, open.
- **Nudged east** fifteen-odd Brawn punches, the stone reaches the walk door
  at column 33 and crosses into the throne room behind the false wall. Not
  lost: she throws it back west through. Measure once; leave it.

**Pieces count.** Adding `town-8` changes the castle town's set: two
scenarios seed a complete set and will go red until each lists `town-8`
too: `scenarios/step14-all-found-opens-cantina.json` and
`scenarios/step14-set-builds.json` (both list `town-7`; Step 3's puzzles
slice made the same one-word edit for it). The new hidden area changes the
town's pie denominator: count reds in `step14-*` and `scripts/e2e/levels.ts`
/ `glints.ts` before re-timing anything.

**Scenarios that see the stone:** 27 are set in the undercroft (`grep -l
'"room": *"undercroft"' scenarios/*.json`); those with `"placements":
true` now have a 480 body at [25,12]. Bodies on foot pass through it; a
thrown body meets it (the heavy crate through the window,
`step3-weight-heavy-crate-thrown`). Count reds first.

**`step13-free-while-caught`** (`docs/plan/step-13.md:105-113`, measured
then): with a call completed, the wave's fighter stood at the camp's entry
(column 41) facing west, seeing x 554-666 on the floor; every way down from
the ledge lands in his sight, and his blows break any hold. Since then the
camp's rows come from both sides (`handoff-prompts/camp-entries.md`) and
the suplex exists (Step 25): re-measure where the first wave stands. The
cage takes any holder, alarm or not (`src/sim/use/free.ts`). The scenario:
caught (a call completed), the hero deals with the fighter who comes (a
grab and throw, or a suplex) and holds Use 2.2 s at the cage while the
alert is still up: `recruited`. Control: the same without dealing with
him: the hold breaks, no `recruited`.

## Do, each its own push, each live

**Push 1, the hauler in the cave.** `content/characters/hauler.json`
(verbs as the brawler's: move, jump, switch, body, attack, grab, suplex;
box `DRAFT:` 16 by 24), a `hauler` section in `content/tuning.json` with
every key the grappler's has (`DRAFT:` near the grappler's, with
`liftStrength` 500, `throwStrength` 60000, `jumpSpeed` 315 so the quarry's
two-tile steps and the stair are hers), `content/roster.json` (append to
`characters`), a cantina pattern row, a hearts row if you want other than
3, the recruit file, the sprite (`content/sprites/hauler.json`,
`assets/sprites/cast/hauler.png` from `cut3.py`). Scenarios, each control
watched failing and named in the commit:
`step13-hauler-freed-in-the-cave` (a start-list world, a hero from pit spawn
0 walks west into the cave and holds Use at the cage: `recruited`
`character` hauler, `added` true, then Use swaps her in on the spot;
control: the hold let go early, nobody recruited),
`step13-hauler-lifts-the-boulder` (in `forest-trail` with placements:
`step15-later-boost`'s presses with the hauler and no power: the slab opens,
`forest-4` found; control: her `liftStrength` 150, Grab refused, the
slab shut),
`step13-hauler-cave-put-back` (the stage measurement above). One e2e file
of your own, `scripts/e2e/hidden-recruit.ts`, its one call line in
`scripts/e2e.ts` (only that line: pull and rebase before pushing, and say
so), a phone-sized page in a private world, by touch: walk from the start
to the quarry pit (copy `scripts/e2e/quarry.ts`'s walkers), and fact
`hidden-recruit-not-shown` (in the pit, `drawn.recruits` lists no cage and
no call), `hidden-recruit-cave` (walked west through the pit's wall, the
page is in `quarry-cave` and draws the cage shut with the hauler). Control
`E2E_TOUCH_BREAK` as the other files use it, or stop short of the wall. The
hold by touch is optional (`scripts/e2e/rescue.ts` left it to the
scenarios). Shots at 844x390 and 390x664 into
`docs/plan/step-13-shots/hidden-*`: the pit's wall, the cage in the cave,
the banner, her in the cantina, her holding the boulder.

**Push 2, the stone only she lifts.** `content/characters/stone-heavy.json`
(verbs `body`; box 24 by 22), its tuning (weight 480, toughness 0), a
sprite `content/sprites/stone-heavy.json` (`DRAFT:` pointing at the
boulder's image `sprites/cast/forest-boulder.png`, or a grey block cut from
an approved stone: your call, logged), the placement in
`content/placements/undercroft.json` (one line; the file is shared with
`ranged-enemy-2.md`: pull and rebase, add your line after theirs), the room
edit above (new legend letters, `heavy-plate`, `heavy-hatch`, the area
`heavy-pocket`; no existing id renamed or moved), `town-8`, the two
`step14-*` seeds. Scenarios: `step13-stone-only-she` (the hauler from
spawn 3 lifts the stone, climbs the stair, throws it up on the top step:
`plate-down` `heavy-plate`, the hatch opens, she drops into the pocket,
`town-8` found, and gets out by the one-way way with the hatch shut;
control: her `liftStrength` 470, refused, the hatch shut),
`step13-stone-brawn-cannot` (the grappler holding Brawn: Grab is refused,
the hatch shut; control: Brawn's lift raised to 500 in the scenario,
lifted), `step13-stone-throne-near-miss` (the brawler holding the throne
on the plate, 470: shut; control: plus a crate, 490: open, which is the
logged pile), and the way-out check playing `heavy-pocket` for every party
member (watch it fail with the one-way tiles made solid). One e2e fact by
touch, in the same file: `hidden-recruit-stone` (down the cellar doorway by
Use, as `scripts/e2e/glints.ts:98-117` does: the page draws the stone and
the plate on the step; a Grab beside it by the start hero leaves the page
not carrying it). Shots: the stone in the hall, her climbing with it, the
hatch open, the pocket.

**Push 3, `step13-free-while-caught`.** The scenario and its control (see
"Measured"), in the real camp with placements and a start-list roster. No
game change unless the scenario shows a fault; then stop and report before
changing anything.

## Yours and not yours

Yours: `content/characters/hauler.json`, `content/characters/stone-heavy.json`,
two tuning sections in `content/tuning.json` (additive), one line in
`content/roster.json`, one pattern in `content/cantina/cantina.json`, a row
each in `content/hearts.json` and `content/grips.json` if wanted,
`content/recruits/cave-captive.json`, `content/sprites/hauler.json`,
`content/sprites/stone-heavy.json`, their images, one function and list
entry in `tools/art/cast/cut3.py` and `make.py` (check `git log -3 --
tools/art/cast` first; tell the orchestrator if another builder is in
there), the face line in `tools/art/props/make.py` (optional),
`content/rooms/undercroft.json` (tiles, legend, parts, areas, its `"//"`),
your line in `content/placements/undercroft.json`, `town-8` in
`content/completion/castle-town.json`, the one-word seeds in the two
`step14-*` scenarios and any cantina scenario seeded per "Measured",
`scenarios/step13-*`, `scripts/e2e/hidden-recruit.ts` and its one line in
`scripts/e2e.ts`, your shots and notes.

Not yours, each another builder's tonight: the courtyard
(`content/rooms/courtyard.json`, `content/placements/courtyard.json`:
`guard-vehicle-courtyard.md`, `ranged-enemy-2.md`); the undercroft's
thrower and its line (`ranged-enemy-2.md`); a room's `backdrop` field
(`biome-backgrounds.md`: if it edits `undercroft.json`, rebase onto it);
the Bandit Camp's files (`content/outposts/outpost.json`,
`content/placements/outpost*.json`, `outpost-wave.ts`: `camp-entries.md`);
`src/client/draw/hud.ts` (`plate-clear-of-bodies.md`); the suplex
(`suplex.md`); `scripts/e2e/**` fixes and every other line of
`scripts/e2e.ts` (`e2e-intermittent-reds.md`); `src/net/**`; the camera.
Read only: every quarry and forest room, placement and stage file (the
recruit file names the cave; nothing there changes), `src/sim/**`.

Out of scope, however tempting: carrying a body through a door (a door
lets go of it today; if you find you need it, name the primitive in the
notes and stop); a "too heavy" sign on screen (today a sound); moving the
forest boulder or retuning Brawn; a new game starting with fewer heroes;
the cellar doorway's move to the courtyard; a second cage anywhere.

Traps: spawn numbers are read in reading order, not by digit (above). A
body nobody plays keeps sliding on landing: throw the stone up, not
forward. Every e2e run rewrites shots under `docs/plan/` until
`handoff-prompts/e2e-shots-only-when-asked.md` lands: `git checkout --
docs/plan/step-2*-shots` (yours excepted) before you commit, and run the
builder card's skip-worktree check. A red in another step's scenario goes
to its owner by message, with the list in your report first. Stop at about
300k tokens wherever you are, with "Landed so far" above filled in.

## Decided vs. open

Decided: above. Open, yours, `DRAFT:` with a decisions-log entry: her
numbers, box and shown name; the call's words; the stone's look; the exact
tiles of the plate, hatch and pocket if the first layout fails the way-out
check. For the owner, by playing (written in the step file; nothing waits
on them): is a strong hero who lifts what nobody can the right second find;
is the cave the right place to find her; is the pile of throne and king an
acceptable other way in, or should the stone be hers alone.

## Done

Each push: `npm run build`, `npm run check` green (every scenario; the new
ones green with their controls watched failing, named in the commit), `npm
run gates` 6 of 6; your e2e facts green by touch on a phone-sized page;
shots at 844x390 and 390x664; one full `npm run e2e` green. The suite has an
intermittent red in about half of today's full runs: `hearts-game-over`,
`start-link-back`, `plates-friend-held`, `door-use`, `outpost-break`,
`start-continue-gone` and `quarry-depot-in` have each gone red once and
pass alone: if one of those is red once and not yours, re-run it alone and
say so. Rebase once before the push; do not re-run the full e2e after every
rebase. Pushed to `main`, then `npm run check:deployed` and `npm run
check:live` ok. On a deploy that seems stuck with `/healthz` healthy on an
older commit: never revert; wait up to fifteen minutes pushing nothing,
re-running `check:deployed`. Then `docs/mechanisms/recruits.md` gets a
"The hidden recruit" section (and its index line in
`docs/mechanisms/README.md` if a mechanism is new), the undercroft's pocket
a paragraph in `docs/mechanisms/rooms-and-doors.md`, and
`docs/vision-gaps.md` is the orchestrator's to refresh. Say in the last
report that nobody has tried it on a real iPhone.
