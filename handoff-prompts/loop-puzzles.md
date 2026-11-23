# Core loop 8, puzzles: the stone plate under the castle, and the gate proof Step 3 owes (Step 3, a new slice)

**From the orchestrator (`session_017WiGzJzo6aZqH4kYxxJsiV`, 2026-11-23 22:12 UTC):** you hold `content/rooms/undercroft.json` for this brief; nobody else edits it (Step 16 is closed, its deferred way home is not briefed). The hidden-places slice is finished (push 3 at b3c1cb1; its builder has stopped), so the `town-7` append to `content/completion/castle-town.json` is yours to make: read `docs/plan/step-14.md`, "Builder notes", for how its checks count pieces.

Brief for one cold builder. Written 2026-11-23 22:02 UTC from
`docs/plan/core-loops.md`, section "8 · Puzzles" (read it, "The principle" and
the "Names the slices share" table first). The step is `docs/plan/step-3.md`:
read its top section, "What's decided", "Handoff notes" (the owed list and the
last note). Read `docs/mechanisms/rooms-and-doors.md` whole (working parts,
the way-out check and its limits, the controls), `docs/mechanisms/levels.md`
("Places"), `docs/mechanisms/powers.md`, `docs/mechanisms/network.md`
("Traps") and `docs/mechanisms/scenarios.md` before writing anything.

**Reports:** `send_message` to the session on the Orchestrator line of
`docs/questions-for-the-owner.md`, after each push, with the commit. Notes:
`docs/plan/step-3.md`, under a heading "Builder notes" that you add at its end
(the file has none yet).

**Small pushes, each standing alone, green and live. Push 1 is the sim rule
and its scenarios in the scratch room, before any real room changes.** If you
pass about 300k tokens after push 3, report and stop: the orchestrator
re-briefs the rest.

## The task, and why

The owner, 2026-11-23 ~18:30 UTC, first-hand, after playing on a phone
(`docs/vision.md`, "The measure"):

> Remember the original intentions for the game and make sure things align with it. I want to play it as I described it.
> There are no heists or stealth yet, no puzzles, no hidden places to explore, no characters to unlock, no escalating combats or chases, no power/item stealing,  no vehicle hijacking, no risk. Virtually everything described in the vision docs that would make the game genuinely fun to play is yet to be seen at all

**What the player gets.** Under the castle, a few steps from where the cellar
arch brings you in, a wide stone plate is set in the floor and a portcullis
stands shut over a glinting piece. Step on the plate: it sinks part of the
way and stops. A friend steps on too: it sinks further, and if one of you is
the grappler it goes right down and the portcullis lifts. Nothing says so;
the plate itself shows how far it has gone, so "heavier" is the thought the
room hands you. Alone, the answers are things you already know are heavy: the
big crate in the throne room, the king himself thrown down through the
stained-glass window, or (later) anything the boost lets a small hero lift.
*Found by:* the plate and the bars are on the walk in from the cellar arch;
the piece glints behind them. *Pay-off:* one more of the town's pieces, and a
hidden place found. *Risk:* a wrong try costs only the walk.

**The measure:** this moves no row of `docs/plan.md`'s table (gates are 6 of
6). It answers "no puzzles" in the owner's verdict, and it pays Step 3's
oldest debt: nobody has seen the courtyard gate open for two players on two
real pages (`docs/plan/step-3.md`, handoff item 1).

The library (doc 11, DECIDED): **D-006** "reward creative, consistent
applications rather than rigid prescribed tricks"; **D-014** co-op-favoured
discoveries may exist; **D-015** "Do not impose a hard no-solo rule for such
challenges; neither must every challenge have an explicitly designed solo
solution"; **D-038** a thing's sanctioned purpose is "not a mechanical
restriction" (a throne or a king is a weight); **D-053** the rule of cool.
Direction: doc 04 "Puzzle design ethos" ("weight, momentum ... mechanisms that
must remain active"; "Do not covertly disable player-discovered solutions");
doc 06 "No arbitrary solo prohibition" and its prototype condition ("a
designed co-op strategy and at least one plausible but unadvertised solo
workaround. The test is not whether every player finds it, but whether the
rules remain honest"); G-04, G-15 (doc 12). **PROPOSED, not decided:** doc
25's kit ("plate+weight", "exploit an enemy's mass"). So the plate, its
number, its place and the pocket are all `DRAFT:`.

## Measured for you (read at a01c44c; nothing was run)

- **A plate today** is down while any one body rests on it:
  `src/sim/systems/room-plate.ts:38-47`. It reads no weight and takes no
  params (its `parts` declaration, `:31-33`, has no `check`). It skips a held
  body (`:39`, `heldBy(e) !== null`); the carrier presses. Its `INTENT:`
  (`:21-23`): any body counts, nothing counts players. State is
  `partState(...).down`; events `plate-down`, `plate-up`.
- **A gate** opens while all its `plates` are down, stays open `stayOpen`
  seconds after one lifts (default `gateStayOpenTime`, 6), and never shuts on
  a body in its tiles (`src/sim/systems/room-gate.ts:57-77`, `INTENT:` at
  `:22-23`). It is `blocks: true` (`:38`).
- **Weights** (`content/tuning.json`): grappler 60 (`:144`), infiltrator 26
  (`:172`), flyer 30 (`:202`), brawler 70 (`:286`), skirmisher 28 (`:316`),
  crate 20 (`:216`), crate-heavy 120 (`:220`), king 110 (`:233`), throne 400
  (`:268`). **The plan's sums hold:** grappler + infiltrator 86, grappler +
  flyer 90, infiltrator + flyer 56. **The plan did not count:** the brawler
  and the skirmisher (in `content/roster.json`; the brawler is in `start`):
  brawler alone 70, brawler + any light hero 96 to 100, skirmisher + flyer 58,
  grappler + skirmisher 88. **And a light crate now lies in the undercroft**
  (`content/placements/undercroft.json`, `undercroft-crate`, tile [24, 12],
  put there by Step 14 after the plan was written): grappler + that crate is
  exactly 80, brawler + it 90, both light heroes + it 76, a flyer + three
  light crates 90 (two more are in the throne room).
- **Read a body's weight with `bodyNumbers(content, e).weight`**
  (`src/sim/body-state.ts:106`), never the tuning set: it is one of the
  powers overlay's read sites (`docs/mechanisms/powers.md`).
- **Who lifts what:** a body is picked up when its weight is at most the
  lifter's `liftStrength` (`src/sim/verbs/grab.ts:66`): grappler and brawler
  150, the three light heroes 60. So only the grappler or brawler lifts the
  heavy crate or the king; the boost gives anyone 420
  (`content/powers/boost.json`).
- **A carried body does not go through a door with its carrier:** a hold is
  dropped when carrier and carried are in different rooms
  (`src/sim/systems/carry-hold.ts:27`). A thrown body does go through a walk
  door, speed kept (`room-doors.ts:165-173`). So the heavy crate reaches the
  undercroft thrown, not carried.
- **Where the weights are:** `throne-crate-2` (crate-heavy) at [10, 14] and
  the king at [5, 13] in `content/placements/throne-room.json`; the hidden
  walk door `behind-the-throne` is column 0, rows 9-13, behind a false wall
  (columns 1-2), with the window above it (column 2, rows 9-11). A king thrown
  from a jump arrives at 230 px/s and breaks it
  (`step6-king-through-the-window`); a standing throw hits the throne.
  Unmeasured: whether the heavy crate (26000 / 120 is 217 px/s at most) gets
  through either opening by a real throw. **Measure it first.**
- **The undercroft** (`content/rooms/undercroft.json`, 34 × 14 tiles): floor
  is row 13; the passage's flat floor run is columns 5-32 on row 12. On it
  already: spawn 3 (column 6), spawn 4 (column 29), the cellar doorway
  (column 27, rows 11-12), the crate (column 24), a one-way step (row 11,
  columns 22-24). The east opening is column 33, rows 8-12. Solid mass more
  than one tile thick: the ceiling (rows 0-2 over columns 11-33; row 3 too
  over columns 11-15) and the west block (columns 0-4, rows 2-9) above the
  vault (columns 1-3, rows 10-12). Pieces already here: `town-4` [2, 12],
  `town-5` [9, 4] (`content/completion/castle-town.json`).
- **The courtyard gate has its piece:** `town-3` at [27, 7], behind the gate
  at column 25 (`content/completion/castle-town.json`; 8abe028). Six town
  pieces in all; `town-7` is the next free id.
- **The check that says "always a way out" cannot see behind a gate:** a
  `blocks: true` part is wall for the whole check, and only places joined to a
  spawn or a door through open tiles are played
  (`docs/mechanisms/rooms-and-doors.md`, "Limits"). A pocket shut behind a
  portcullis is invisible to it. It plays the three members of
  `content/party.json` only.
- **Part state reaches a phone:** `World.rooms` is the server's, sent in every
  snapshot and copied by key (`docs/mechanisms/network.md`). A new field in
  `partState` needs no network code. A page steps only its own character
  between snapshots, so a plate a friend stands on may pop up for a moment
  locally (Step 3 handoff item 5; never seen, never checked).
- **Drawing:** `src/client/draw/room-parts.ts:135-138` draws a plate from
  `part:<room>:<part>` (with `:down`), else `plate-up` / `plate-down`
  (`content/looks/parts.json:23-24`), else a drawn box. A portcullis exists:
  `door-barred`, `door-barred-raised`, 32×32 (`content/looks/treasure.json:14-15`).
- **Stand-ins still in `step3-*`** (25 scenarios): `step3-plates-one-and-a-weight`
  drops its crate from tile [22, 4]; nothing throws it.
- **`docs/deliberate-designs.md` has no entry for the street, the roofs, the
  window or the plates.** Their `INTENT:`s are at the sites: each room file's
  `"//"`, `room-plate.ts`, `room-gate.ts`, `rooms-and-doors.md`.

## What to build (`DRAFT:` throughout; decisions-log entry "Step 3: the stone plate")

1. **Push 1, a plate can need weight.** In `room-plate.ts`, in the `plate`
   kind's own declaration: an optional param (say `needs`, a number, with a
   `check`). Absent, the plate is exactly today's. Present, the plate is down
   while the summed weight of the bodies resting on it is at least `needs`;
   `partState` also gains how much is on it (say `load`), so a page can draw
   it. Rule on a carried body: add its weight to its carrier's (a hero holding
   the king over a plate that reads 60 is a lie to the player); the existing
   skip stays for the held body itself. **Pick `needs` from the table above
   and say which side of it each row falls**: the plan says "about 80", and at
   exactly 80 a grappler holding the crate three steps away opens it. The
   builder measures and picks, `DRAFT:`, logged. Nothing reads a player, a
   character id or a headcount. All in `test-parts` (or a scratch room of your
   own); no real room changes.
2. **Push 2, the pocket, shown before it is built.** Decide the pocket's
   tiles, the plate's (wide: at least two bodies side by side, clear of the
   spawns and the doorway) and the portcullis's. Rows appended at the bottom,
   or columns inserted just inside the east wall, shift no existing
   coordinate; a row at the top or a column at the west shifts every piece,
   placement, area and scenario in the room. **Before adding any part:** land
   the tiles alone, and put in your notes the room's rows, `npm run check`
   green with all 25 `step3-*`, every `step14-find-*` and the way-out check,
   and the `step6-*` window scenarios. Tell the orchestrator you hold
   `content/rooms/undercroft.json` (one builder at a time; Step 16's deferred
   way home wants it too).
3. **Push 3, the stone plate and the portcullis in the undercroft.** A `plate`
   with `needs`, a `gate` naming it, a hidden `area` for the pocket (it joins
   the town's places, D-079), and one appended piece, `town-7`, behind the
   bars (agree the one-line append to `content/completion/castle-town.json`
   with the hidden-places builder on the Sessions line of
   `docs/current-directive.md`, or the orchestrator if it has finished).
   **The pocket has a way out that any body can take with the portcullis
   shut**, marked `INTENT:` (as the secret chamber's floor hole is), proven by
   a scenario for each party member, because the check cannot see it. Getting
   in by that way, if someone manages it, must keep working.
4. **Push 4, how far it has sunk, on a phone.** The plate drawn lower in
   proportion to `load` / `needs` (moving the existing look down by pixels
   needs no new art), right down when it is down; the portcullis from
   `door-barred` / `door-barred-raised`. For a stone-plate look or anything
   missing, message the core-loop art builder,
   `session_017WiGzEN1QbSnHzXNqV4XSt`. `INTENT:` nothing points: no arrow, no
   number, no text.
5. **Push 5, the two-page proof Step 3 owes.** In `npm run e2e`, both real
   pages (one phone-sized, by touch): each stands on a courtyard plate, the
   gate is drawn open on both, the plate under the friend never reads up on
   either page while they stand there, both walk through. Then the stone
   plate the same way (the pages' two heroes: read which they are; if they
   are the two light ones, 56 leaves it shut, and that is the control).

**The boost** (the third solo way): write `step3-weight-boost` now, with a
scenario player holding `"power": "boost"` (supported since 64bd1fe). A player
cannot hold the boost yet: `content/powers/boost.json` has `"carriers": []`
and only Step 9's push 1 is on `main`. Do not wait for it and do not edit
`content/powers/`; when Step 9's carrier push lands, say in your notes whether
the played route works.

## Signal

- Scenarios `step3-weight-*`, each with a control watched to fail, never
  reading how many play: one hero alone, each of grappler and brawler (part
  sunk, shut); grappler + infiltrator (open); grappler + flyer (open);
  infiltrator + flyer (shut); two bodies nobody plays of the same weights as
  an opening pair (open: it is weight, not players); the heavy crate by a real
  throw from the throne room, alone (open, and it stays open with the hero
  off the plate); the king through the window, then carried to the plate;
  the boost; the pocket's way out with the portcullis shut (control: the way
  sealed). A plate with no `needs` behaves as before (the 25 `step3-*` stay
  green, unedited).
- A new fact file for a part's state (`src/scenarios/facts/`, self-registering)
  if `event-where` on `plate-down` is not enough to read `load`.
- A room control in `controls/rooms/` for a `needs` that is not a number.
- `npm run e2e`: the facts of push 5, plus the phone page's drawn record
  showing the stone plate part-sunk under one hero (control: read before
  stepping on).
- Screenshots at 844×390 and 390×664 under `docs/plan/step-3-shots/`: the
  plate part-sunk, down, the portcullis up.

## Traps

- **A green way-out check proves nothing about the pocket** (above). Two
  friends who both run in are shut in six seconds later unless the pocket has
  its own exit.
- **Never delete or loosen an `INTENT:`**: any body presses a plate; a gate
  waits for a body in it; the chamber's hole and the thrown-up way in; hidden
  doors drawn as wall; nothing points at a secret.
- **The courtyard's plates must not change**: no `needs` there. Its `"//"`
  keeps columns 1-13 clear for Step 7 and column 15 for the cellar doorway.
- **`content/decor/undercroft.json` is placed by `tools/art/props/make.py`
  from the room's tiles.** If changed tiles leave it stale, ask the art
  builder; do not hand-edit it.
- **A new hidden area raises the town's total places**, so the town's pie can
  drop a quarter for a game in progress. Additive and expected; say so in
  your notes. `scripts/e2e/levels.ts:149` computes the town's quarters from
  the page, not a fixed number.
- **Old kept games** hold part state without `load`: read it with a default
  (`docs/mechanisms/saves.md`).
- **Thin jump margins:** the camp's way out and the awning hop break if
  `jumpSpeed` is tuned down (`docs/plan/step-3.md`, last note). Build no step
  in the pocket over two tiles (Step 3's own rule, from jumps measured at 47
  to 52 px at 04:43 UTC; re-measure if you rely on it).
- **`npm run e2e` today:** facts `h1`, `h2` and the friend-grab facts
  (`t-grab-friend`, `t-throw-friend`, `s-break-free`) fail some runs on
  `main` and are under investigation (`handoff-prompts/step-5-e2e-flakes.md`).
  Re-run, report which failed and how often, never loosen a check.
- `git pull --rebase` before each push; `main` is the deploy. Stop test
  servers by PID. If live is healthy on an older commit, wait, don't revert.

## Paths

**Yours:** `src/sim/systems/room-plate.ts`; `content/rooms/undercroft.json`
(once the orchestrator says so) and `content/rooms/test-parts.json`; the
plate's lines in `src/client/draw/room-parts.ts`; new `scenarios/step3-weight-*`,
a new fact file, a control, new facts in `scripts/e2e/`; `docs/plan/step-3.md`
notes; `docs/mechanisms/rooms-and-doors.md`. **By agreement, one line:**
`content/completion/castle-town.json` (`town-7`).
**Not yours:** `room-gate.ts` beyond an agreed additive param; every other
room file (`content/rooms/outpost.json` is nobody's until vehicles;
`handoff-prompts/loop-vehicles-*.md` is another builder's); `content/placements/**`;
`content/powers/**`; `content/tuning.json` weights (retuning a hero to fit the
plate is the wrong end); `src/sim/check-rooms.ts`'s model; `src/server/**`.

## Out of scope

The cellar doorway's move to the courtyard; the camera; the other stand-in
scenarios; the camp's jump margin; a lever, a timed lift or any second new
kind of part; sounds; what the town's set builds.

## Decided, and open

Decided by the owner: the D-numbers above; iPhone first; always a way out.
`DRAFT:`, yours to log: the number the plate needs and which pairs that lets
through; that carried weight counts; where the plate, bars and pocket are;
the pocket's exit; how sinking is drawn. Nothing waits on the owner. For the
owner to judge by playing, not asked: whether the plate makes you think
"heavier" without being told, and whether the king as a counterweight is as
funny as it sounds.

## Done

Each push: `npm run build`, `npm run check`, `npm run e2e` green (flakes above
re-run and reported); pushed to `main`; `npm run check:deployed`,
`npm run check:live`; `/debug/errors` read. `docs/mechanisms/rooms-and-doors.md`
updated (the plate's params, the pocket, the check's blind spot);
decisions-log entries; `docs/plan/core-loops.md` section 8 updated to what
landed; Step 3's handoff item 1 struck where push 5 proves it. A blocking
question goes to the orchestrator by message and to `docs/questions-inbox.md`;
a flag to `docs/for-the-orchestrator.md`. Final message: done or blocked, the
commit.
