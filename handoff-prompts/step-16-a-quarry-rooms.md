# Step 16, slice 1: the quarry's rooms and their secrets

Brief for one cold session. Written 2026-11-23 15:15 UTC by the Step 16
lead (`session_017WiGzHt9iJy3caBLkT1Ef4`). The step is
`docs/plan/step-16.md`: read its "Goal" and "What's decided" (you do not
need the design library or `docs/vision.md`). Read
`docs/mechanisms/rooms-and-doors.md` in full before writing a room: it is
the format, the two kinds of door, the parts and the way-out check.

**Hard stop 16:45 UTC with whatever is green. Nothing half-working on
`main`** (a push to `main` is the deploy). Work in the three pushes below,
each standing alone; after each, `send_message` to the lead
(`session_017WiGzHt9iJy3caBLkT1Ef4`) with the commit. If the clock runs
out inside a push, drop that push and say where you stopped.

## The task, and what it moves

A doorway in the courtyard leads out of the kingdom, up a road and into a
quarry: six rooms, a dozen screens of ledges, drops, a tower, a pit and a
cave, with things hidden above and below the main way. This slice is the
**geography only: no enemies, no outpost, no hoard** (slices 2 and 3, other
briefs). The owner, 14:30 UTC: "I haven't seen any levels being built".
It moves no M-row (no gate A–F is this step's); it is the first real level
a player can run through. `npm run gates` must still print 5 of 6 after.

## Measured for you (at e673fa5)

- **`npm run check`: green, 77 s** (wall clock, this container). Step 3's
  handoff said the way-out check took about 38 s for five rooms. Measure
  `npm run check` again after each push and write both numbers in the
  commit message; if it passes 150 s, say so to the lead (it is Step 3's
  to speed up, not yours).
- **What the three heroes can do** (measured by simulating `test-body`
  with `simulate()` from `src/scenarios/run.ts`, as `scripts/trace.ts`
  does: one player, jump held from tick 10; for flaps, jump held 10–25
  then pressed at 32, 48, 64):

  | hero | box w×h px | jump peak (jump held) | in the air | run speed | running jump across, ≈ |
  |---|---|---|---|---|---|
  | grappler | 18×30 | 52.7 px, 3.29 tiles | 39 ticks | 84 px/s | 3.4 tiles |
  | infiltrator | 10×12 | 51.4 px, 3.21 tiles | 42 ticks | 128 px/s | 5.6 tiles |
  | flyer | 14×20 | 50.0 px, 3.12 tiles; **with 3 flaps 124 px, 7.75 tiles** | 53 / 121 ticks | 92 px/s | 5 tiles (much more flapping) |

  (The "across" column is run speed × air time, not simulated: measure the
  real ones you rely on with `node scripts/trace.ts`.) So the **main way**
  must work for the weakest: **steps up at most 2 tiles, gaps at most 2
  tiles** (`DRAFT:`; a 3-tile step is 48 px against a 50 px peak, too
  tight to promise). Step 2's `test-body` ledge 5 tiles up is out of reach
  without flaps.
- **One secret per hero, closed by the body, never by name** (D-006,
  `docs/plan/step-16.md`). What the numbers give you (`DRAFT:` your pick):
  - infiltrator: **size**, a crawl exactly one tile high (12 px fits, the
    flyer's 20 does not), like the undercroft's (row 4, columns 11–15);
  - flyer: **height**, a ledge 5–7 tiles up with nothing to climb
    (flaps reach 7.75 tiles; the others 3.3);
  - grappler: **weight**, `crate-heavy` (only the grappler can lift it:
    `step2-hit-*-cannot-lift-heavy`) placed so that it blocks a one-body
    gap; lifting it away opens the way. Or a `breakable` only a
    grappler's throw reaches `wallBreakSpeed` (200 px/s) against:
    **measure the throw speeds** of all three before choosing that one.
  - "Not yet": one thing in plain sight that no hero alone reaches: above
    the flyer's 7.75 tiles with nothing to stand on (at least 10 tiles up),
    for Step 9's power or Step 13's hero later. Mark the area `hidden:
    false` and note it in the room's `//`.
  - "Another way": at least one secret is also entered by a throw or a
    stack (two players, or a hero and a crate), and a scenario proves it.
- **Crates** are placed in Step 4's placements format
  (`content/placements/<room>.json`, `"id"` equal to the room; copy
  `content/placements/castle-street.json`). `npm run check` caps a room at
  8 people (`MAX_NPCS_PER_ROOM`); crates are not people.
- **A screen is 20 × 11.25 tiles**; the camera follows your character on
  both axes (`roomOrigin`, `src/client/draw/room.ts:26`), so rooms may be
  wider and taller than a screen. The widest room today is
  `castle-street`, 48 × 12.
- **The courtyard doorway** (agreed in the step file; the orchestrator is
  told): an `enter` doorway in `content/rooms/courtyard.json`, **columns
  17–19 of rows 6–7**, legend `q`, door id `to-quarry`. Today row 6 is
  `W........................G...E` and row 7
  `W..1.2........3.P...4.Q..G...E`: columns 17–19 are `.` in both, the
  floor (row 8) is solid under them. Columns 1–13 are kept for Step 7,
  column 15 for the undercroft's doorway, column 23 of row 7 for Step 12's
  `to-outpost` (it may land before you: `git pull --rebase` and keep both).
  Those three characters per row, the legend entry and the door entry are
  the only edits to the courtyard.
- **The hidden way home** (push 3, droppable): a hidden walk door in the
  undercroft's west wall, column 0, rows 10–12 (three tiles, the vault's
  height: today row 10 is `#...#…`, rows 11–12 `#...B…`; the vault is
  columns 1–3 behind the `vault-wall` breakable at column 4), door id
  `to-quarry-cave`. Its other end is the east edge of `quarry-cave`, the
  same size. `DRAFT:` hidden on the cave side (painted as wall there), not
  on the vault side. The way-out check counts the unbroken `vault-wall`
  as wall, so the vault must be reachable back to the start room through
  the cave. That door id and its legend entry are the only edits to the
  undercroft.
- **The way-out check** refuses a standing tile with no way out or no way
  back, for every party member (rooms-and-doors.md, "The way-out check").
  `controls/rooms/` shows what it rejects. A room with no doors is exempt
  from the map rules: that is how push 1 proves each room alone.

## What to build (all `DRAFT:` unless marked; log the choices in `docs/decisions-log.md`)

Owned paths (new files): `content/rooms/quarry-*.json`,
`content/placements/quarry-*.json`, `scenarios/step16-*.json`,
`scripts/e2e/quarry.ts` (plus one import and one call in
`scripts/e2e.ts`, additively), new facts in `src/scenarios/facts/` only
if one is missing. Ids: `quarry-` and plain words, never "iron" or any
library name; a room's `name` (shown) may say anything.

Six rooms, in doc 28's order (the step file's "Many screens" bullet):

1. `quarry-road`: up from the courtyard, its `enter` doorway back at the
   west end; climbing ledges and drops; about 4 screens wide.
2. `quarry-ridge`: crossing over drops; a missed jump falls through a walk
   door in the last row into `quarry-pit` (nothing kills, nothing
   reloads); about 4 screens wide.
3. `quarry-tower`: a climb, one screen wide and two or three tall, with a
   door off the top back onto the ridge or on to the depot.
4. `quarry-depot`: the guarded place's **shape** only (slice 3 adds its
   people and hoard): a yard across, a strongroom, and besides the front
   three ways in: **under** (a one-tile crawl), **over** (the roof, by
   flaps or a throw) and **through** (a `breakable` from the pit below).
   Hiding places (`hide` parts) along them. About 3 screens wide.
5. `quarry-pit`: below the ridge and the depot; the way back up, and its
   `breakable` wall into the cave. Doc 28: "The path from the lower pit
   can loop back to the ore depot".
6. `quarry-cave`: behind the pit's breakable wall; the level's refuge
   (slice 3 decides what that means); its east edge is the hidden way home
   (push 3).

**At least 12 screens (240 tiles) of floor along the main way** from the
courtyard doorway to the far side of the depot, with more off it. Doors
above and below the main way. Two routes nothing points at (no arrow, no
glow, no text); the three hero secrets, the "not yet" and the "another
way" above. Every room and hidden area has its `id` and `hidden` flag
(Step 14 counts them). A `//` in each room file says what is where, as
the courtyard's does.

## The three pushes

1. **The rooms alone, nothing joined.** All six rooms without doors
   (each standalone, so exempt from the map rules), their crates, and
   scenarios that walk each hero across each room in a test of its own.
   Nothing a player can reach yet.
2. **Joined.** Every door in one push, the courtyard doorway last in the
   same commit: signals 1–3 below, each with its control watched to fail.
   Then a touch block: `scripts/e2e/quarry.ts`, a phone-sized page by
   touch goes through the courtyard doorway and crosses `quarry-road`
   (signal 7, its first half; the enemy and depot parts are later
   slices). Find out how `scripts/e2e/phone.ts` puts a page somewhere
   before writing your own way; if the page cannot start in the courtyard,
   say so to the lead before adding anything to `src/`. `npm run e2e`
   locally; after the deploy `npm run check:deployed` and `npm run
   check:live`. Screenshots at 844×390 and 390×664 of each room into
   scratch space, described in your handoff note.
3. **The hidden way home** (drop it first if time is short): the
   undercroft door and its scenario.

## Scenarios (`step16-*`, no `gate` tag, one player unless said, each with a control watched to fail)

1. **Joined, with a way out.** Step 3's checks pass unchanged with the
   level joined. Control: a copy in `controls/rooms/` with one end of the
   courtyard doorway removed is refused (copy how the existing controls
   are written and listed).
2. **Across** (`step16-across-<hero>` × 3): each hero alone, from the
   courtyard doorway to the far side of the depot, and back by another
   way. Control: a scenario-time `tiles` override (rooms-and-doors.md,
   "Tiles that change") raising one main-way step to 4 tiles stops it.
   Count the main way's screens with a command and put the command and
   the number in the commit message and the step file's "Measure".
3. **Secrets.** Each hidden route is reached through a connection the
   data marks hidden (control: the same route with that door's tiles made
   solid fails). Each hero's secret is entered by that hero and not by the
   other two (the other two are the controls). One secret is entered by a
   throw or a stack. The "not yet" is reached by none of the three alone.
7. **On a phone**, as push 2 says.

A long walk is many ticks (240 tiles at the grappler's 84 px/s is about
2,700 ticks): trace before pinning, and pin the facts you need, not every
tile.

## Traps

- **Way out, every member.** A drop the infiltrator can climb back from
  may trap the grappler (two tiles tall, shortest run-up jump). The check
  will tell you; the fix is a ledge, never an exemption.
- **Walk doors keep speed.** A body arriving through a walk door keeps
  its velocity: a pit's arrival door is in the far room's ceiling, so
  leave room to land and do not put a second walk door under it.
- **Walk ends: opposite edges, same size**; an `enter` doorway needs
  floor under it; a hidden door must be a walk door with no sign.
- **Spawns** must have room for the largest body (grappler 18×30) and
  ground under them. Each room needs spawn tiles only if a scenario
  starts there.
- **Determinism:** no randomness or clock in anything you add.
- **Shared files:** you should touch none of `src/sim/types.ts`,
  `src/sim/systems/physics.ts`, `src/client/render.ts`,
  `content/tuning.json`. Nothing under `src/` in a commit that adds a
  room (the step's stopping condition counts it). Two other leads (Steps
  11, 12) and Step 8's look push beside you: `git pull --rebase` right
  before each push and `npm run check` after.

## Out of scope — leave alone

Enemies, the outpost, patrols and the hoard (slices 2–3); any new kind of
part, rails, carts, lifts or falling boulders (none exists); the look of
the rooms (Step 8: say in your handoff which rooms want an atlas line);
Step 3's check and its speed; any other room than the two named edits.
If something nearby looks wrong, read `docs/deliberate-designs.md`, then
note it in `docs/for-the-lead.md`.

## Decided vs. open

Decided: `docs/plan/step-16.md` "What's decided" and the defaults above.
Open, the owner's to judge by playing (do not ask; list them in your
handoff note): whether the run is fun, whether the secrets are findable
and satisfying, whether a quarry is the right place.

## Verified when

Rung: scenarios with watched controls, `npm run build`, `npm run check`,
`npm run e2e` (push 2); after each code push `npm run check:deployed`
exits 0; read `/debug/errors` on the live address before each push that
changes what the page runs (`docs/verifying-and-finishing.md`). Commit
messages carry what you ran, the check's time, and what you did not
verify.

## Done, and where things go

Done: pushes 1–3 on `main` and live, or the last green push and a note of
where you stopped. Phase 6 rows this triggers: the map in
`docs/mechanisms/rooms-and-doors.md` ("The map tonight": add the quarry,
nothing else in that file), a row "a level" in `docs/architecture.md`'s
"I need to add…", decisions in `docs/decisions-log.md`, a handoff note at
the end of `docs/plan/step-16.md` ("Handoff notes"). A blocking question:
message the lead (`session_017WiGzHt9iJy3caBLkT1Ef4`) at once. Anything
else: `docs/for-the-lead.md`; a question only the owner can answer:
`docs/questions-inbox.md`. Your final message: done or blocked, the
commit, and nothing else.
