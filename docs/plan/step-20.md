# Step 20 — A machine to steal, and things to crash it through

**Reference.** Plan step; its status line is in docs/plan.md.

## Why

**Owner, 2026-11-23 ~18:30 UTC, to Vision Partner, first-hand, after playing
on a phone** (`docs/vision.md`, "The measure"):
> Remember the original intentions for the game and make sure things align with it. I want to play it as I described it.
> There are no heists or stealth yet, no puzzles, no hidden places to explore, no characters to unlock, no escalating combats or chases, no power/item stealing,  no vehicle hijacking, no risk. Virtually everything described in the vision docs that would make the game genuinely fun to play is yet to be seen at all

**Owner (Drive, doc 11, D-017, D-020, D-023):**
> D-017 Players can initiate fights with normal inhabitants, steal or hijack vehicles, provoke guards and escalate attention.
>
> D-023 Hijacking the enemy machine sent to stop the party and turning it on the pursuers is a signature desired situation.

Split from Step 7, whose own text allows the machine to become its own step
("ship the Hall and leave the machine as its own step"). From
`docs/plan/core-loops.md`, section 6.

## Goal

In the Bandit Camp a wheeled armoured wagon stands with its driver in it.
Pull him out, get in, and drive: it builds speed past a hero's run, everything
in the way flies by its weight, the horn post snaps, and it bursts through a
light barrier, stalls and then a timber barricade into the camp's cache, and
keeps rolling, wearing as it goes. Jump gets you out at any moment. Later
waves bring a second wagon driven at you, slower than any hero, to be taken
and turned on the wave.

## The signal (re-runnable)

- Scenarios `step20-*` in the real camp: hijack and crash (the driver grabbed
  and thrown, in, east: people launched, the barricade broken above the ram's
  threshold, debris, out by Jump; control: the threshold set above top speed,
  the barricade holds and nobody is launched); a hard hit throws the rider
  (control: a light one does not); the quiet way to the cache still works
  with no call; a wave's wagon is slower than the slowest hero, who walks
  clear, takes it and fells the wave (control: the driven cap raised, the hero
  is caught); the wagon keeps rolling after the barricade (G-08: "controls
  recover").
- A real-server check with two connections: the rider's own page drives with
  no steering lag (it simulates the machine itself); the other connection
  sees the wagon move and the barricade break.
- `npm run e2e`, a phone-sized page by touch: Use reads GET IN beside the
  empty seat; in, the stick moves the wagon; Jump, and the hero stands beside
  it.

## Stopping condition

The signal passes on `main` and live.

## What's decided

- The owner's D-numbers above and D-022. Impact over numbers (D-020: roadblock
  crashes).
- Doc 08, "Vehicles": "satisfyingly violent in motion while remaining readable
  in 2D"; "bail out at the last moment". G-08's pass line includes "controls
  recover".
- O-008 and O-009 (which vehicles, steering, collision, when hijacking is
  possible) are OPEN: every such choice is a logged `DRAFT:`.
- iPhone first: the stick drives, Grab pulls the driver, Use gets in, Jump
  gets out. No new button.
- `INTENT:`s that stay: people can be outrun (a bandit-driven wagon is slower
  than the slowest hero); there is always a way out (Jump, the ledge, the
  doorway); nothing resets (a broken barricade stays broken).

## To settle before its brief (from the plan's checks)

- **A real run.** As first planned the wagon had about 26 tiles in a room it
  could not leave: three seconds of driving. Extend the camp east by two
  screens of things to plough through (stalls, a lighter barrier, then the
  timber one), or let a machine pass walk doors and use a long flat way. The
  wagon keeps rolling after a crash; it does not stop for good.
- **The box.** `src/content/kinds/characters.ts` refuses a box over 32 by 32
  with an `INTENT:` (whole pixels, smaller than a sprite cell; physics snaps
  to tile edges). Stay inside it, or raise it with a physics check and say so.
- **No steering lag.** A rider steering a server-simulated machine would wait
  300 to 450 ms on a phone (the hit-prediction brief's measure). Seat the
  rider with the `become` effect: the rider's own page becomes the machine
  kind and simulates it with one new `drive` verb; the ram runs on the server
  from reported positions and emits `impact`, so the horn post's rule
  (`outpost-signaler.ts`) and the breakables answer; Jump becomes the hero
  again beside it.
- **One ram rule.** Step 18's queued slice ("heavies topple to a big throw or
  crash") is a slam rule by weight in the impact systems: build both on one
  rule, or brief this after that slice.
- **It rewrites the camp.** The room, placements and outpost files, and so
  every tick-pinned real-camp scenario of Steps 12, 13, 7 and 21. Two
  builders; never beside the rescue slice (Step 13), whose cage it builds
  around without moving.
- No grey box ships as its look: the wagon is cut (`content/looks/rides.json`,
  68b2e1d) with the sheet's rider baked in; an empty-vehicle revision of the
  P04 sheet is requested (a42b7e6). The barricade and its break stages come
  from P04 and P07.

## Open (for the owner, by playing; nothing waits on them)

- Does ramming the barricade earn the "OHH!"?
- Which machine next: a royal one in the courtyard's clear run, sent by the
  town's alert?

## Owns

New files: `content/machines/**`, `src/content/kinds/machines.ts`,
`src/sim/machines.ts`, `src/sim/systems/machine-*.ts`,
`src/sim/verbs/drive.ts`, `src/sim/use/get-in.ts`,
`src/client/draw/machines.ts`, `scenarios/step20-*.json`,
`scripts/checks/step20-*.ts`, `scripts/e2e/machine.ts`. Owned edits (Step 12
is closed): `content/rooms/outpost.json`, `content/placements/outpost.json`,
`content/outposts/outpost.json` and re-times of real-camp scenarios, once the
heist, rescue and waves slices have landed theirs. Agreed small edits: a
barricade look for breakable parts, one row in `content/prompts.json`, lines
in `src/client/render.ts`. The courtyard's clear run is left for a royal
machine.

## Briefs

- `guard-vehicle-courtyard.md`: 186b8da, c849f6f, 8f5827d (push 2b; its push 3 moved to the escalating response); `guard-machine-get-in`, `-drive`, `-out` green. Reviewed by orchestrator `session_017WiGzJYBCYJ85Bj95B7ZLw`, 2026-11-25 04:35 UTC, by a full re-run in a clean worktree at 8f5827d (build, check, gates 6 of 6 green; e2e 181 ok, one red, `suplex-again`, not this brief's) and one blind look (`docs/plan/step-8.md`, last section); diff not read. Brief deleted. Left by the look: the rider hides the trike, no witness reaction drawn, the doorway arrow on the hero's face, impact stars behind the trike.

None yet. **Waits** for a free slot after `handoff-prompts/loop-heist.md`
push 1 (the Use list) and `handoff-prompts/loop-waves.md` push 1 (waves that
arrive). The orchestrator writes its brief from this file and
`docs/plan/core-loops.md`, section 6.

## Builder notes

**Builder A, push 1 (drive and ram, sim only).** Landed: the `ram-wagon`
character, `content/machines/ram-wagon.json`, the `drive` verb, the ram
rule (`ram()` in `src/sim/machines.ts`) and `machine-ram`, `World.machines`,
the check room `test-machine` with a test outpost (no callers) for the post.
Nothing is reachable by a player until builder B's push 2. Notes:
- A flying body that meets the wagon still shoves it (impact-bodies' rule;
  the wagon is a body of weight 200): a heavy launched into a rolling wagon
  can knock it flying, and while flying it neither drives nor rams. Left as
  the impact rules make it.
- The test room's barrier puts its part state in every world (as every
  room's parts do): the `together` check's snapshot grew 2376 to 2477 bytes.
- Not verified: anything on a page (push 1 has no drawing and no seat).
- Push 1's e2e runs (no client, server or network code changed): 3 runs,
  1 green, 1 failed `h1`, 1 failed `h1` and `h2` (the known flakes,
  `handoff-prompts/step-5-e2e-flakes.md`). build, check, check:deployed and
  check:live green at a2bee99.

**Builder A, push 2 (the seat).** Landed: `c.seat`, `machine-seat`,
`machine-driven`, the Use entry `get-in` (order 120, "Get in"), the
`memberTaken` read, `World.machines` rider fields, events `machine-taken`,
`machine-left`, and `scripts/checks/step20-machine.ts`. Notes:
- **How B puts a driven wagon in a room:** `docs/mechanisms/machines.md`,
  "Getting a person's machine into a room". Placements: the machine and its
  driver on the same tile; the driver's routine `face` is the way it stands.
  A wave row cannot put one down yet: the smallest change is an optional
  `rides` on a wave person in `src/content/kinds/outposts.ts` (the waves
  slice's file; not changed here).
- Getting out waits one round trip on a phone: the seat is the server's,
  and the page learns by `become`.
- In the reconnect leg of `step20-machine`, the rider who left with `bye`
  was removed from the world, so they came back as the hero with the wagon
  standing (the check accepts either way). The "still the rider" branch
  was not exercised over the network.
- Riders' wall crashes and barrier bursts are also counted on the rider's
  own page (its world runs `machine-ram`); the snapshot overwrites them.
- Not verified: anything on a page's screen (push 3 draws).
- **Open asks from builder B (23:21, 23:29 UTC), for whoever takes push 3:**
  the camp's post now breaks at 450 and the wagon can stand no nearer than
  column 8, so B asks for `speed.rider` about 560-600 with `accel` about
  300 (a westbound run then snaps the post; the timber barricade can sit at
  about 540, wagon only), and `crashes` about 16 (B's run from the doorway
  wrecks at the 8th crash, before the barricade). Builder A agrees with
  both (all are `DRAFT:` data in `content/machines/ram-wagon.json`), but
  stopped at the context budget: the change re-times
  `step20-ram-snaps-the-post`, `-barricade-breaks-and-rolls-on`,
  `-wears-to-a-wreck` (it counts 8), `-jump-out-at-speed` and the post
  control (`speed.rider` 290 becomes any number under 450 closing speed).
**Builder B, push 1 (the camp's run).** The Bandit Camp runs on east to
column 87 (`docs/mechanisms/outposts.md`, "Step 20: the camp's run"). No
wagon is placed yet (push 2, after A's seat). Notes:
- **A's numbers vs. the run** (asked A by message, A's call): the camp's
  post breaks at impact 450 and the wagon meets it at about 280 (it cannot
  stand west of the step, 12 tiles from the post), so the post never snaps
  to the wagon; and with `crashes` 8 a wagon driven through the real camp
  (lookout, post, fighter 1 twice, fighter 2, crate, two stalls) is a wreck
  at stall 2, before the barricade (probe: step's tiles cleared, the
  player as the wagon). `step20-camp-run-breaks-through` therefore runs
  without the camp's people.
- **A flung body bounces back into the wagon** and knocks it flying (A's
  noted interaction): it then slides to a stop. Three crates stopped it
  short of the barricade; one does not.
- **The waves' entry (41) is mid-room now**, under the second ledge: a
  wave appears there from nowhere. Left as it is (their timings pin it).
- **The captive's call bubble** (rescue slice) covers the cache chest on
  an upright phone (`step-20-shots/run-cache-390x664.png`). Not changed.
- **Two prizes, one hand:** `world.cargo` holds one prize per hero; taking
  the cache while carrying the strongbox overwrites it (the strongbox then
  counts as banked, quietly). Not changed.
- The decor (`content/decor/outpost.json`, place.py) covers only columns
  0-43, and the timber pieces are code-drawn planks: both asked of the art
  builder `session_017WiGzEN1QbSnHzXNqV4XSt` (look ids `stall-2x2`,
  `fence-1x2`, `barricade-1x4` and `-broken-`).
- e2e, three runs: h1+h2, h1, h1 (the known flakes; the third on main after the rebase onto ebfd824).
- Screenshots: `docs/plan/step-20-shots/run-*.png` (the page's own hero
  moved east by the debug world: a look, not a route).


**Builder A, push 3 (the look, and B's two asks)** (`session_017WiGzK3BxWQHTRLZHSmnYK`). Landed:
`src/client/draw/machines.ts` (asked first by `draw/entities.ts`; the
brief said one line in `render.ts`, but drawing the machine in the bodies'
own pass keeps shadows, the player's mark and `drawn` as for any body), an
optional `look` on a machine file, the rider's hero face on the plate
(`draw/hud.ts`), and `speed.rider` 560, `accel` 300, `crashes` 16. Notes:
- **B's numbers:** B's push 1 (the camp's run, 116c5d8) landed while this
  push was in its gate; its scenarios pass with them (`npm run check`), but
  the run with the camp's people in it was not driven here (asked B by
  message to run it and say). B's push left merge markers in this file;
  resolved here keeping every builder's notes.
- **Re-timed B's `step20-camp-run-breaks-through`** (B's file; the new
  numbers moved it, and `main` must stay green): the same events, earlier
  (barrier 128, crate 135, stall 1 142, stall 2 157 now burst by the wagon
  itself, barricade 176, the cache's step 192); control now `breakSpeed`
  600 on the barricade, watched to fail. Told B. The barricade's note in
  `content/rooms/outpost.json` still says the wagon runs at 340 (B's). Re-timed
  `step20-ram-snaps-the-post` (snaps at 116), `-barricade-breaks-and-rolls-on`
  (bursts at 150; the reverse now starts at 175, short of the east wall),
  `-wears-to-a-wreck` (there and back twice; the 16th crash, the east wall,
  at 984) and `-jump-out-at-speed`; every control watched to fail again
  (the barricade's control is now `breakSpeed` 600).
- **An empty wagon shows a rider:** `ride-wagon-empty` is asked of the art
  builder (`session_017WiGzEN1QbSnHzXNqV4XSt`); the code draws it as soon as
  the cut is in `content/looks/rides.json`.
- A person at the reins is not drawn (the cells' baked rider is him), so
  his sight band (`draw/sight.ts`) shows from an unseen body; his mood marks
  still draw over his box.
- The `rides` wave field: offered to B by message (default: B makes it,
  beside the camp's rows). Not changed here.
- Seen on a real page (a local server, one phone-sized page by keys, shots
  in `docs/plan/step-20-shots/`): the bandit in it, pulled out and thrown,
  GET IN, riding (plate shows the grappler), rolling, a ram (crash cell,
  stars), Jump out. **Not seen:** the wreck cell on a page (the scenario
  proves the wreck; the cell is chosen by the same `machineLook`); two
  pages at once (the `step20-machine` check covers two connections).
- The plate's face, with a failing control: the same page run on the
  pre-change `hud.ts` lists `ram-wagon` first while riding (a square); with
  it, `grappler`.
- Push 3's e2e: 2 runs, both failed on known flakes only
  (`handoff-prompts/step-5-e2e-flakes.md`): run 1 `t-throw-friend`,
  `s-throw-friend`, `s-after` (the same throw); run 2 `h1`. build and check
  green. Run 3, after rebasing onto 035498e: e2e green.

**Builder B, the camp's way in (the orchestrator's ask, 2026-11-24).** Over
the entry step, by 15 jump timings each: grappler, infiltrator, flyer,
skirmisher get in; the brawler stops at column 4. Fixed with a one-way tile
at (4,9) (decisions-log "The Bandit Camp's way in fits every hero"). Taking
a tile off the step instead turned ten camp scenarios red. Re-timed:
`step7-same-again-hangs-nothing` (the flyer's second walk-out: stick
released at 3074, not 3200; one more door tap at 3086; the exit tick 3078
to 3086, waves counted to 3085; control `hallRelativeOn` 0 still fails).

**Builder B, push 2 (the wagon in the camp).** `camp-wagon` stands empty on
the entry step (decisions-log "Step 20: the wagon in the camp stands empty";
`docs/mechanisms/machines.md`, "In the Bandit Camp"). Notes:
- **Not as briefed: no driver.** Seated at column 10 a camp fighter turned 9
  scenarios red (step7 ×5, step12 ×2, step21 ×2): he swings from the seat
  (hitting his own wagon, and starting chains where the camp flattens its
  own), turns the parked wagon on a hero in the lookout's view, and is one
  more person under bound 8. Empty at column 10, three still failed (heroes
  knocked west land against it). On the step: none. Asked the orchestrator
  (who makes the one `outpost-fight` line; whether to seat a driver now).
- **The barricade stays 300**, not the ~540 the last notes hoped: measured,
  a run from the step met it at 466-475 (every start time from 50 to 200
  ticks, stick held), and at 560 after weapons push 2 (8b2fee3) moved the
  camp's people: a wagon-only number would hang on them. Its note says so.
- **Re-timed twice for others' pushes** (the chase, 88a048d; weapons push 2,
  8b2fee3): my two run scenarios pin a chaotic run, so a change to the
  camp's people moves them. Windows are wide where it was cheap.
- **"Stays broken" is a scripted check, not a scenario**: scenarios cannot
  save and load; `step20-camp` does it on a real store.
- **Re-timed: none.** Every step7/12/13/19/21 camp scenario unchanged.
- Shots: `step-20-shots/camp-wagon-*.png` (from the doorway and GET IN, both
  sizes; through the barricade, sideways only; in the cache, both). Taken
  before `ride-wagon-empty` landed (afea13a), so the empty wagon there still
  shows the baked rider; on `main` it is drawn empty. The captive's bubble
  covers part of the sideways view.
- Not verified: two phones on screen at once in the camp (the check covers
  two connections, not two drawn pages).

### The check that fails some runs (brief `handoff-prompts/step-20-machine-check-fails.md`)

Builder `session_017WiGzJ2rqEpKFJmGDriwjQ`, 2026-11-24. **Rate before: 5 of
20** runs of `step20-machine` alone, quiet machine, `origin/main` at e8af461
(`node scripts/lib/run-check.ts '^step20-machine$' 20`, new: runs scripted
checks alone, `times` over; `docs/verifying-and-finishing.md`, rung 2). Every
failure had both problems: the barrier never heard broken, and 7-12 effects
to a.

**Cause: the game.** A scratch copy of the check, tracing the server's copy
of a every tick near the barrier (column 60, x 960-976): the server does not
step a page-moved body between reports, and the driven wagon's reports land
2-3 ticks apart (15-23 px at 440-480 px/s). `room-breakable` broke a wall only
when a body was *one tick* (vx·DT, ~7.7 px) from entering its column. Passing
runs had a report at 979.5 or 971.8 (inside the window); failing runs had
987.2 then 963.9: the window skipped, the server's barrier still standing, the
wagon past it. The effects were the wagon then ramming the standing wagon and
its driver at ~860 (`machine-ram`, `push`): a consequence of the missed
burst, not hearts and not a second fault. A friend driving on a phone would
see the barrier stand while their wagon went through it (and then be shoved).

**Fix** (`src/sim/systems/room-breakable.ts`, `INTENT:`): a body at
`breakSpeed` or faster found already overlapping the part's tiles breaks it
too. Physics never leaves a body inside a solid tile, so only a report (or a
teleport) puts one there; server-stepped bodies behave as before. **After: 0
of 20.** Control: the old file, the same check: failed again (1 of 12 in that
sample). `npm run check` green; `npm run e2e` (its machine facts) at the push.
The check itself was right and is unchanged.

**Builder B, push 3 (the wave's wagon)** (`session_017WiGzJfeRQoKZSky3npQv6`). Landed: the optional
`rides` field on a wave person (`src/content/kinds/outposts.ts`), a few lines in `outpost-wave.ts`
(agreed with the alarms builder by message, 05:25 UTC: yes to the field, the row and the banner; it then stopped, brief 6400b44), and the camp's fourth row
riding in at the reins of a ram wagon (decisions-log "Step 20: the wave's wagon";
`docs/mechanisms/machines.md`). There's a new check room, `test-wave-wagon` (room, placements,
outpost), and three scenarios: `step20-wave-wagon-outrun`, `-taken`, `-skips-a-standing-machine`.
- **Left for the next builder (brief 6400b44):** the west entry [6,7] beside the only door (a row arriving between a hero and the way out) and entries for the east half; not started here (context budget). Notes:
- **The wave's wagon is told the sighting.** `machine-driven` drives only at a hero
  the driver sees, and waves walk in 12 or more tiles off (`entryAway`), past the
  112 px sight range, so a wave wagon stood at its entry. It now gets `c.chase`,
  the same caller's sighting its people get (D-065).
- **No real-camp scenario reaches the fourth call.** Measured: a hero standing in
  the lookout's view is beaten, or the callers are, before the fourth call (the
  flyer's last stand stops at three calls; on a perch the scenario adds with `tiles`,
  row 9, columns 13-17, the camp's fighters still reach the brawler). A perch
  higher than that is out of the lookout's sight height. So the camp's row is proven
  only by the content check and by the same rule in `test-wave-wagon`. **Not
  verified: the fourth row in the camp, on a page.**
- **Row 2 was tried first and dropped:** it turned `step7-waves-reach-the-hero`
  (the row-2 fighter must hit the hero) and `step7-same-again-hangs-nothing` red.
- **Friendly fire:** a wave fighter on foot swinging at a hero above hits his
  own driver out of the seat (and the driver can fly into the hero). That's the
  camp's existing rule, not changed. In the test room the wagon comes alone for that reason.
- **The camp's west entry [6,7] is the step where `camp-wagon` stands.** A rider
  skips an entry with a standing machine within his machine's width (`rideEntry`
  in `outpost-wave.ts`, read from the world, not a listed tile, so the entry can
  move: the alarms builder's ask): the next on that side, else the other side.
  `step20-wave-wagon-skips-a-standing-machine` (control: the rule off, the wave's
  wagon lands on the parked one and crashes into it).
- **For tools:** `scripts/trace.ts`-style probes that pass a scenario to
  `simulate` directly skip the loader, so a `tiles` entry's `is` must be the
  number (`2` one-way, `1` solid), not the name; the name silently does nothing.
- Re-timed: none.
- **e2e at the push:** one full run, one failure: `hearts-game-over` (the
  phone in the camp ended with hearts left, the GAME OVER card never drawn).
  It was already red on `main` without this push (1573906, review at 9dbd705:
  "the last hero unbeaten"; the hearts brief owns it). The defeat facts alone,
  three runs on this commit: all green.

## Guard vehicle on the courtyard's run (opened 2026-11-24 by orchestrator session_017WiGzHY5UZsWTLCH8cLm8M)

**The owner, 2026-11-23 ~18:30 UTC, first-hand, after playing on a phone**
(`docs/current-directive.md:132`, `docs/vision.md:137`): "... no vehicle
hijacking ...". D-017, D-020 ("roadblock crashes"), D-023 ("hijacking the
enemy machine sent to stop the party"); `docs/vision-gaps.md` row 15, "What
would close it: One machine on the courtyard's flat run to board, drive and
crash".

**Goal.** On the castle courtyard's flat run (columns 1-13,
`content/rooms/courtyard.json:2`) the town guards' patrol trike stands
empty: get in, drive it east and crash it through the guards' roadblock,
launching the pieces and anyone standing at it, and jump out at any moment.
Taking it in a guard's view is the deed `take` and ramming a guard is
`hit`, so the watch reacts by its existing NPC response logic; with budget,
the town's top row brings a guard driving one at you, to be taken off him.

**Signal.** Scenarios `step20-courtyard-trike-through-the-roadblock`,
`-trike-solo-infiltrator`, `-trike-stalled-jump-out`,
`step20-courtyard-theft-seen`, `step20-courtyard-ram-a-guard` (push 3:
`step20-street-watch-trike-taken`, `-outrun`), each with a control watched
failing; the e2e facts `guard-machine-get-in`, `-drive`, `-out`
(`scripts/e2e/guard-machine.ts`, a phone-sized page by touch); shots at
844x390 and 390x664 in `step-20-shots/courtyard-*`.

**Stopping condition.** Pushes 1 and 2 of the brief live on `main`, the
signal green there and `npm run check:live` ok; push 3 only if one
builder's budget allows, else its measurements left in the notes.

**Decided** (orchestrator, `DRAFT:`): the trike (the only guard vehicle
whose painted width fits a box of at most 32), parked empty at [1, 7]; the
roadblock as `crate`/`crate-heavy` bodies at columns 11-13, not a solid
part (a wall there stops the 16 courtyard scenarios that walk through those
columns and the town's guards, who cannot jump); stealing maps
`machine-taken` to the existing deed `take`; no guard placed in the
courtyard (he would clash with Step 24's thrower on sight). **Open**
(builder's, logged): the trike's numbers, the names of the additive fields
(look per state; cells with nobody in them; head row; the doer on
`machine-crash`; `rides` on a dispatch person). For the owner, by playing:
does the crash earn the "OHH!"; should a guard ever patrol on it.

**Briefs:** `handoff-prompts/guard-vehicle-courtyard.md`.

### Guard vehicle, courtyard (builder `session_017WiGzExJuPKipKbx51rTeL`)

**Push 1 (the trike and the roadblock).** `docs/mechanisms/machines.md`, "On
the courtyard's run"; decisions-log "The town guards' patrol trike". Notes:
- **Re-timed: none.** The full `npm run check` was green with the trike and
  the three crates in the courtyard before any scenario of mine existed: no
  scenario that loads the courtyard's placements changed (re-run at column 5
  before the push).
- **Not as briefed: coast 400, not the wagon's 30.** With 30, the empty trike
  after a Jump rolled on through the gate (opened by crates landing on the
  plates) and out by the gallery's walk door, and the e2e's "beside it" failed.
  It still can, after a fast Jump with the gate open (an upright shot run).
- **Not as briefed: the trike at column 5, not 1.** At [1, 7] the full e2e's
  `door-go-in` went red: a hero coming in from the street stops beside it, and
  Use read GET IN where that fact wants nothing. Column 5 clears that spot and
  the forest's doorway by a few pixels (`get-in.ts`: 16 px across). The run to
  the roadblock is 72 px, so `accel` went 500 → 700 to ram all three crates.
- **The e2e's drive is 0.6 s**: held 1.2 s, the crates it flung opened the gate
  and the trike left by the gallery's door, so its x was read in another room.
- **Machines and doors:** a crate flung from the roadblock left by the
  gallery's walk door in one run (any body does). A rider driven into the
  street's walk door stays (a wall crash). Use and up in the forest's doorway
  while riding took nobody through, though Use reads GO IN there. Not tried:
  the quarry's and the camp's doorways.
- **An empty rolling trike rams at 50** (`driverRamSpeed`, read for any body
  nobody plays): after a Jump it can shove the hero who just left it (seen in
  the solo run, tick 104). The wagon's existing rule; left.
- **The rider is drawn standing on the saddle**, the hero's idle frame (no
  sitting frame exists); `riderAt` [26, 22] is a first guess from the cells.
- Shots (local server, by keys): `step-20-shots/courtyard-{parked,get-in,riding,roadblock-flying,out}-{sideways,upright}.png`.
- Not verified: two phones at once on the courtyard's run.


## Look at the courtyard trike's shots (orchestrator session_017WiGzHY5UZsWTLCH8cLm8M, 2026-11-24 ~21:00 UTC)

By a subagent reading the ten `docs/plan/step-20-shots/courtyard-*` shots blind at phone size, against 186b8da; not by playing. Its sentence: "The kid in goggles finds a little gold motorbike, hops on, rides it through a pile of crates with some explosions going off behind him, then gets off by a gate."

- **Parked:** a vehicle, clear of HUD and buttons, about the hero's width and two-thirds his height. It reads as a two-wheeled bike, and in the hero's own gold and orange with a red pennant: nothing says it is the guards'; against the gold-trimmed ruins it can pass for scenery.
- **Get in:** the hand button shows a GET IN pill, legible, small sideways.
- **Riding:** the hero reads as sitting (not odd). Nothing shows motion: no dust, lean or lines.
- **The crash does not read as a crash.** The stars and swooshes trail BEHIND the rider; the crates sit mostly upright with the rider overlapping them; no piece is in the air. "Crates nudged with sparkles in his wake."
- **Out:** the hero overlaps the bike (sideways) or hides it (upright); not plainly beside it.
- **Confusing:** while riding, the hand button reads "GO IN" with a lock (a door's prompt); a white arrow over the hero's head in `roadblock-flying-sideways`; no guard anywhere in the shots.

Sent to the second builder of `handoff-prompts/guard-vehicle-courtyard.md` as part of its push 2.

### Guard vehicle, courtyard, push 2 (builder `session_017WiGzFDp4ULq8khkx23hXS`)

**Push 2 (stealing it is seen).** decisions-log "Stealing the guards' trike is seen". Notes:
- **The scenarios run in a check room, not the courtyard:** a scenario's own
  `entities` are bodies with no `c.npc` (only a placement entry's `npc` makes a
  person, `npc-setup`), so "a guard standing in view" needed a placed guard.
  `test-trike` (new: `content/{rooms,placements}/test-trike.json`) holds the trike
  and one town guard. The ids keep the brief's names `step20-courtyard-*`.
- **Ramming a bandit now calms an enraged or distressed bandit who saw the rider
  offend** (expected `hit` on a bad person, D-051), as a punch does. No camp
  scenario changed; noted, not tested in play.
- **The rammed guard flies far:** at 350 px/s the trike threw him about 330 px
  east (to the far wall of the check room). His charge after is at a walk (40).
- Not tried: a guard following a hero into the courtyard and seeing the take there.

**Push 2b (the orchestrator's five look findings).** decisions-log "The guards' trike looks like the guards' and crashes like a crash"; shots `step-20-shots/courtyard-*-2-*` (local server, by touch, 844x390 and 390x664). Notes:
- **Why the crates looked nudged:** measured, each rammed crate is held for its beat while the trike drives on; then the light one runs into the heavy one, and the trike speeds back up to 420, past all three. `ramLift` 220 throws them up so they are seen in the air (the flying shots); they are still behind the trike within half a second. The stars stay where each crate was met, behind the rider. A held beat on the rider (the real hit-stop) is not done: the rider's page drives its own body, a net change.
- **Re-timed:** `step20-courtyard-trike-through-the-roadblock` and `-solo-infiltrator` read "on its feet" later (220, 230): the pieces now come down around the hero who jumped out.
- **Jump-out stands the hero still** (machine-seat): before, the hero kept the trike's speed, caught it up as it coasted and was rammed by it (the empty trike rams at 50). Every `step20-*` is green with it, the wagon's `jump-out-at-speed` included.
- **Still seen while riding:** a small white up-arrow over the forest's doorway (the doorway's own marker, not the Use button). Left.
- The rider hides most of the blue flag while riding; parked and out, it shows.
- **`ramLift` only at `ramSpeed` or faster** (after the rebase onto the escalation's push 1): its level-4 row puts a guard at the reins of the trike in the street, and his nudges of his own comrades at about 71 px/s lifted them, which slowed the fight and turned `step4-tier-cap-holds` and `-level5-keeps-coming` red. Green again with the threshold; the roadblock crash (at 200-315) is unchanged.
