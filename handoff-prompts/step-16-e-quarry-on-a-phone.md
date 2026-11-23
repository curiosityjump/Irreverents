# Step 16, last slice: the quarry seen and found on a phone

Brief for a fresh builder. Written 2026-11-23 19:25 UTC by the Step 16
lead (`session_017WiGzHt9iJy3caBLkT1Ef4`). The step is
`docs/plan/step-16.md` (read "Goal", "Feedback signal" 7, and the
"Measure" entries). Read `docs/mechanisms/rooms-and-doors.md`,
`docs/mechanisms/outposts.md` and `docs/mechanisms/rendering-world.md`
before starting.

**Hard stop: 75 minutes after you start, with whatever is green. Nothing
half-working on `main`.** `send_message` the lead with each commit.

## Why, in the owner's words

The owner, after playing, 2026-11-23 ~18:30 UTC (`docs/vision.md`, "The
measure"): *"There are no heists or stealth yet, no puzzles, no hidden
places to explore … no risk."* The framing there: *"Some of these exist in
code (a zero-alarm sneak, a hidden cellar, guards that chase), but the
owner, playing, did not find them, so for the measure they do not exist
yet. … Each must be findable and recognisable without being told where
it is."* The quarry and its depot are now live and pass 65 scenarios,
but nobody has looked at them on a phone screen. This slice does that and
fixes what it finds, in Step 16's own data.

## Measured for you (at 9dd3561; `npm run check` green, 65 `step16-*`, gates 5 of 6, live current)

- **The level**: courtyard `enter` doorway `to-quarry` (columns 17–19,
  rows 6–7; push the stick up) → `quarry-road` (84×20) → `quarry-ridge`
  (80×16) → `quarry-tower` (20×30) → `quarry-depot` (64×20), with
  `quarry-pit` (40×20) and `quarry-cave` (30×14) below. The rooms'
  `//` say what is where. Enemies: `outpost-fighter`, `heavy-fighter`,
  `brute`, and a `toll-keeper` with a toll counter on the road.
- **The depot**: lookout and horn (only the lookout calls), two patrols, a
  heavy guarding the strongroom, the hoard inside it (Use takes it).
  Quiet ways: the flyer over the roof (`step16-zero-alarm-roof`); the
  grappler over the west ledge and the strongroom shelf
  (`step16-zero-alarm-ledge`). Caught: a fight (`step16-caught-fight`)
  or an escape by the tower door (`step16-caught-escape`) or by the
  one-tile hole at column 23 to the cellar, the pit and the cave
  (`step16-caught-escape-cave`, flyer).
- **By touch today** (`scripts/e2e/quarry.ts`): a phone-sized page walks
  from the start room into the courtyard, up through the doorway, and
  across `quarry-road` into `quarry-ridge` (`quarry-in`,
  `quarry-road-cross`). Nothing puts a page further in. `?room=` names a
  private world, not a starting room.
- **Two flags from the last builder** (`docs/for-the-lead.md`, cleared
  into this brief): a fighter chasing a hero west of the yard's step can
  fall down the column-23 hole (no routine walks there); and
  `step16-caught-escape`'s `proves` text still says nothing leads to the
  cellar.

## What to do

1. **Get a phone-sized page into every quarry room**, by touch where it
   can be done (extend `walkInto`'s chain in `scripts/e2e/quarry.ts`:
   ridge, tower, depot). If a stretch can't be crossed by scripted touch
   in the time, find out whether the page offers any way to place its
   player for a look (read `src/client/main.ts` and `window.irreverents`);
   if none does, **do not add one** (that is Step 5's `src/client/`):
   say so to the lead and take the shots you can reach.
2. **Screenshots at 844×390 (and 390×664 where it helps)** of each room,
   and of the depot calm, while the lookout sounds the horn, and with a
   wave in. Keep them in `e2e-out/` (git-ignored). **Look at every one**
   and write under "Measure" in `docs/plan/step-16.md` what a first-time
   player would see, one line each.
3. **Findability, judged from the screenshots, fixed in Step 16's own
   data** (rooms, placements, the outpost file; `DRAFT:`, logged):
   - does the courtyard doorway read as a way in, and does the road
     invite you on?
   - is the hoard visible from the yard (or from where you first see the
     strongroom), so the depot reads as a place with something to take?
   - do the lookout and the horn read as danger before you're seen?
   - can you see a way over (the ledge, the roof) without an arrow?
     (D-004: secret routes get no arrow, glow or text; the quiet routes
     are not secrets, they are choices, so they may simply be visible.)
   - is any room confusing on a phone (where to go next)?

   Fix by moving placements, opening a sightline, or reshaping a tile run;
   every `step16-*` scenario must stay green (if one breaks, move the
   change, not the scenario). Anything that needs drawing (a sight cone,
   a glint, a sign) is not yours: list it for the lead, who passes it to
   Step 8 or Step 4/12.
4. **The two flags**: keep chasing fighters out of the column-23 hole (a
   placement or tile change; or, if a fighter falling into the cellar
   reads well, leave it, prove nobody gets stuck there with the way-out
   check, and log it); correct `step16-caught-escape`'s `proves` text.

## Traps

- **Every `step16-*` scenario and the way-out check stay green.**
- **Nothing under `src/`.** Scripts in `scripts/e2e/quarry.ts` are yours.
- **Determinism** in anything the scenarios run.
- Others push beside you: `git pull --rebase` right before each push.

## Out of scope — leave alone

Drawing and art (Step 8); sight marks and barks (Step 4, 12); the
undercroft way home and ranged enemies (deferred); Step 12's systems.

## Verified when

`npm run check` green (say its time), `npm run gates` 5 of 6, `npm run
e2e` green, `npm run check:deployed` exits 0 after each push; read
`/debug/errors` live before each.

## Done, and where things go

Done: the screenshots taken and described, the fixes live, the flags
closed. A handoff note at the end of `docs/plan/step-16.md` ending with
**what needs another step to be findable** (one line each, for the
orchestrator). Blocking question: message the lead at once. Final
message: done or blocked, the commit.
