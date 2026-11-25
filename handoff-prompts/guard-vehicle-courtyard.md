# The guards' machine on the courtyard's run: steal it, drive it, crash it through their roadblock (Step 20)

Brief for one builder, two pushes and a third if budget remains. Written
2026-11-24 by the orchestrator (`session_017WiGzHY5UZsWTLCH8cLm8M`), from a
read of `main` at e68b907 (nothing was run). Read first:
`docs/mechanisms/machines.md` (all of it), `docs/plan/step-20.md`
("Builder notes", and "Guard vehicle on the courtyard's run" at its end),
`docs/mechanisms/npc-response.md`, "Deeds" and "The castle street's table".

**Landed so far (2026-11-24 ~20:50 UTC), by `session_017WiGzExJuPKipKbx51rTeL`, which stopped at its budget:** push 1 at 186b8da (the trike, the roadblock, primitives 1-3, three scenarios, e2e `guard-machine-*`, shots `docs/plan/step-20-shots/courtyard-*`). Not as briefed: the trike stands at [5, 7], not [1, 7] (at 1 the e2e `door-go-in` went red), `accel` 700, `coast` 400; why in `docs/plan/step-20.md`, "Guard vehicle, courtyard". The courtyard's placements now also hold Step 24's bandit at column 27, past the gate: the trike can reach him when flung crates open the gate. **Left: push 2 (stealing it is seen) and push 3**; scenarios that use the trike should start at spawn 1 (column 5, standing on it).

**Landed so far (2026-11-25 ~01:10 UTC), by `session_017WiGzFDp4ULq8khkx23hXS`:** push 2 at c849f6f (live: getting in under a guard's eyes is `take`, ramming him is `hit`; check room `test-trike`; scenarios `step20-courtyard-theft-seen`, `-ram-a-guard`). Push 2b, the orchestrator's five look fixes (`ramLift`, `livery`, `outGap`, no door on Use while riding, dust and bob, a Jump-out stands still; shots `docs/plan/step-20-shots/courtyard-*-2-*`): the commit "Step 20, the guards' trike, push 2b", green (build, check, gates 6 of 6, e2e 172 ok), held unpushed under the owner's pause and pushed when pushes reopen. **Push 3 moved** (the orchestrator, 2026-11-25 00:09 UTC) to `handoff-prompts/escalating-guard-response.md`'s builder: nothing of it was built here. For a guard to drive the trike: the trike as a kind already takes a person at the reins (`speed.driver` 70, machine-seat seats a person standing on it, `crew` false draws him as himself); what is missing is primitive 5, `rides` on a dispatch person. **This brief is done.**

**Reports:** `send_message` to the session on the Orchestrator line of
`docs/questions-for-the-owner.md`, after each push, with shot paths.
**Notes:** `docs/plan/step-20.md`, a "Guard vehicle, courtyard" subsection
under "Guard vehicle on the courtyard's run", newest last. A blocking
question goes to the orchestrator by message and to
`docs/questions-inbox.md`; a finding that is not a question goes in the
notes.

## The task, and the measure

The owner, 2026-11-23 ~18:30 UTC, first-hand, after playing on a phone
(`docs/current-directive.md:132`, `docs/vision.md:137`): "... no vehicle
hijacking ...". Library: D-017 ("steal or hijack vehicles"), D-020
("roadblock crashes"), D-023 ("hijacking the enemy machine sent to stop
the party"). `docs/vision-gaps.md` row 15's close: "One machine on the
courtyard's flat run to board, drive and crash". Today the only machine is
the bandits' ram wagon in the Bandit Camp. This puts **the town guards'
machine** on the castle courtyard's run, with **their roadblock** to crash
it through; then makes stealing it a deed the watch reacts to; then, with
budget, has the watch drive one at you. Moves no row of `docs/plan.md`'s
table (M3 stays 6 of 6); it closes gap 15's stated close. Whether it is
fun is the owner's to judge by playing.

## Decided (by the orchestrator; `DRAFT:`, one `docs/decisions-log.md` entry per push)

- **Which machine: the patrol trike** (`guard-trike-*` looks). The art
  (`content/looks/guard-vehicles.json`, `assets/props/guard-vehicles.png`,
  320 by 184) cuts four guard vehicles, each **empty, no crew drawn**
  (`tools/art/props/loops.py:437-441`): trike, three 56 by 40 cells
  (parked, moving, damaged; painted about 42 by 33); wagon, four 72 by 48
  (closed, door-open, moving, damaged; painted about 60 by 41); roller,
  three 80 by 48; rotorcraft, three 64 by 48 (it flies: out). A machine's
  box is capped at 32 by 32 (`INTENT:` at `src/content/kinds/characters.ts:39-43`);
  the ram wagon draws a 48-wide cell over a 32-wide box. The trike's painted
  42 overhangs a 32 box by 5 px a side; the wagon's 60 would overhang by 14
  and visibly sink into whatever it meets before it touches. Do not raise
  the box cap.
- **It stands parked and empty, nobody at the reins**, for the reasons the
  camp's wagon does (`docs/plan/step-20.md`, builder B push 2) plus two of
  the courtyard's own (measured below): a guard at the reins drives at every
  hero he sees, and the courtyard is walked through by most of the game's
  scenarios and e2e pages; and a guard placed in the courtyard fights the
  thrower Step 24 is placing there on sight (`content/hostility.json:3`,
  guards against every bad-side person), with no hero present.
- **The roadblock is bodies, not a wall:** existing `crate-heavy` and
  `crate` bodies (weights 120 and 20, `content/tuning.json:237, :241`) placed
  in a row. Standing bodies pass through each other (`impact-bodies`), so
  nobody on foot is stopped by them, and the ram rule (`ram()` in
  `src/sim/machines.ts`) launches each by weight. A solid `breakable` part
  on the run (as the camp's barrier) was rejected by measurement: see
  "Measured". The other answer is a small change later: one part letter in
  the room's rows and a part entry, `look` `fence`/`barricade`.
- **Stealing is the deed `take`**, which already exists: `{ "actor": "hero",
  "deed": "take", "witnessSide": "good", "verdict": "odd", "weight": 1 }`
  in `content/rules/expectations.json`. One `events` row maps the
  existing event `machine-taken` (`src/sim/systems/machine-seat.ts:132`,
  `by` is the hero's entity id) to it. No new deed.
- **Names shown are data and `DRAFT:`** (the character's `name`, e.g.
  "Patrol Trike"); ids are the function (`guard-trike`) and never renamed.

## Measured (so you need not)

**The courtyard** (`content/rooms/courtyard.json`, 30 columns by 9 rows,
tile 16; floor row 8, standing row 7 at `:47`:
`W..1.2..fff...3.Pqqq4.Qo.G...E`). Column by column on row 7: 0 the walk
door to the street (rows 6-7); spawns at 3, 5, 14, 20 (spawn indexes 0-3);
8-10 the enter doorway to the forest (rows 6-7); 15 left free for the
undercroft's doorway (`:2`); 16 `plate-west`; 17-19 the enter doorway to
the quarry; 22 `plate-east`; 23 the enter doorway to the camp; 25 the gate
(rows 4-7, solid while shut); 29 the walk door to the gallery. `:2` keeps
columns 1-13 clear "for Step 7's machine and its roadblock; place nothing
there" and says "a doorway is empty floor to anything that rolls or walks
across it, so the run stays clear for a machine". There is no
`content/placements/courtyard.json` yet.

**Where each goes:**
- **The trike at tile [1, 7]**, box 32 wide, so columns 1-2 (x 16-48),
  facing east (an empty machine stands facing east, as `camp-wagon` does).
  The first thing in view coming in from the street, as the camp's wagon
  is from its doorway. A hero spawned at column 3 (spawn 0) stands beside
  it: Use reads GET IN within 16 px across and 24 up/down of its box
  (`src/sim/use/get-in.ts:6-7`).
- **The roadblock in columns 11-13**: `crate` at [11, 7], `crate-heavy` at
  [12, 7], `crate` at [13, 7]. East of the forest doorway (8-10), west of
  spawn 2 (14) and the undercroft's column (15). Nothing on 8-10, 14 or 15.
- **The run between them:** trike front x 48 to the first crate x 176,
  128 px. A standing start at `accel` a reaches sqrt(2·a·128): 277 px/s at
  the wagon's 300, 358 at 500. `ramSpeed` 160 is reached after 160²/(2a):
  43 px at 300, 26 at 500. The ram rule hands the mover back
  `ma / (ma + mb)` of its speed per body: at the wagon's weight 200, 62% past
  the heavy crate, 91% past each light one.
- **East of the roadblock**, what the trike and the flung crates meet:
  spawn 14, the plates at 16 and 22, the gate at 25 (a wall crash: one
  wear). **Any body presses a plate** (`INTENT:` at
  `src/sim/systems/room-plate.ts:31-34`), so a crate or the trike come to
  rest on `plate-west` holds it: that is the plates' own rule (one hero and
  a heavy thing open the gate), not a fault. Leave it.
- **Step 24's thrower** (`handoff-prompts/ranged-enemy-2.md`, push 3)
  stands "west of the gate, on the far side from the street, clear of
  columns 1-13 and of the forest doorway": somewhere in 14-24. He is in the
  trike's path past the roadblock, and that is wanted (it rams him; he
  throws at a rider). Your tiles (1-2, 11-13) and his do not overlap.

**Why not a wall:** of the 23 scenarios set in the courtyard (`grep -l
'"room": *"courtyard"' scenarios/*.json`), 11 start at spawn 0 (column 3)
and walk east through 11-13 (`step12-walk-out-ends-it`,
`step13-free-unseen`, `step16-back-*` ×3, `step19-camp-clean` and its
control, `step21-heart-out-two-players`, `step23-returned-carrier-unarmed`,
`step4-tier-pips-cross-a-door`, `step5-beaten-come-back`), and
`step15-each-hero-crosses-*` ×3, `step15-boost-survives-the-walk` and
`step15-joined` start at column 14 and walk west through it to the forest
doorway (the flyer: stick left ticks 0-54). Sixteen e2e files and five
real-server checks cross the courtyard (`grep -ln courtyard scripts/e2e/*.ts
scripts/checks/*.ts`). The town's guards cannot jump and follow a hero
through doors (D-069). A solid piece there stops all of them.

**Which scenarios load the courtyard's placements** (`"placements": true`):
the 8 of those 11 that are not `step16-back-*`. They will now have the
trike and three crates in the room. Bodies on foot pass through; a thrown
or knocked-flying body can hit a crate. Count reds before re-timing.

**The machine code is generic:** `grep -rn ram-wagon src/` finds nothing;
`drive`, `machine-ram`, `machine-seat`, `machine-driven`, `get-in` and the
plate's face all read the machine file of a body's kind (`machineOf`).
A second machine is a character (verbs `drive`, `body`; box at most 32 by
32), a tuning set, a machine file, and placements: data. The content check
allows one machine file per character and refuses `speed.driver` at or
above the slowest roster hero's run (the brawler, 76;
`src/content/kinds/machines.ts:111-118`).

**What is not data yet (the missing primitives; name them, don't special-case):**
1. **The look's cell names.** `src/client/draw/machines.ts:68` draws
   `<look>-<state>` (states `idle`, `moving`, `crash`, `wrecked`, `empty`)
   and falls back to `<look>-idle`; the content check refuses a stem with
   no `-idle` cell. The trike's cells are `guard-trike-parked`, `-moving`,
   `-damaged`. Hand-adding `guard-trike-idle` / `-wrecked` keys to
   `content/looks/guard-vehicles.json` is wiped by the next
   `tools/art/props/make.py` run (`:330` writes the file from its sheet).
   Add an optional, additive field to the machine file that names the look
   id per state (left out: `<look>-<state>` as now), read in
   `src/content/kinds/machines.ts` (`read.only` at `:74`) and
   `draw/machines.ts`, checked against `content/looks/`.
2. **Cells with nobody in them.** `seatedInDrawnMachine`
   (`draw/machines.ts:92`) hides a person at the reins of any machine that
   has a look, because the wagon's cells bake in a goggled rider; and a
   rider is drawn only as the machine's cells. With the empty GV-01 cells a
   hero riding the trike would be invisible (only the plate's face and the
   player mark would say who). An optional field saying the cells show
   nobody: then the seated person is drawn as himself, and a rider is drawn
   as the hero they went in as (`World.machines[id].hero`, where
   `rider === e.id`) at the seat, over the cells, by the same sprite
   drawing the bodies use. Left out: today's behaviour for the wagon.
3. **The head row** (`HEAD_ROW = 9`, `draw/machines.ts:84`) is the wagon
   cells' first painted row (marks and the plate pointer sit on it).
   Measure the trike's and make it per look or per machine.
4. (Push 2) **A ram is not a deed yet:** `machine-crash`
   (`src/sim/systems/machine-ram.ts:51, 57, 71`) carries `machine` (the
   machine's id, not the rider's entity) and `player`; an `events` row needs
   the doer's entity id. One additive field on the event (the moving body's
   entity id) and one `events` row (`machine-crash` → `hit`, target
   `target`) make ramming a guard the deed `hit`. Check the ordering rule:
   deed events must come before `npc-witness` (600); `machine-ram` is 525,
   `machine-seat` 120.
5. (Push 3) **A dispatch row cannot ride:** `src/content/kinds/dispatch.ts:98`
   reads only `character` and `npc` on a row person. The camp's waves have
   `rides` (`src/content/kinds/outposts.ts`; `rideEntry` in
   `src/sim/systems/outpost-wave.ts:72`).

**How boarding works today, by touch** (`docs/mechanisms/machines.md`, "The
seat"): beside an empty machine the Use button (`#actions
[data-action="interact"]`) reads **Get in** (`data-state="get-in"`); a tap
makes the hero's body the machine on their own page (`become`, no steering
lag); the stick drives; a tap of **Jump** puts the hero out beside it at any
moment (`INTENT:` at `machine-seat.ts:68`: never refused); Grab pulls a
driver out. A wreck puts its rider out. No new button.

**Things nobody has tried (measure; don't fix unless broken):** a rider
holding up in an enter doorway, or driving west into the street's walk
door at column 0, may carry the machine into the next room: `room-doors.ts`
has no machine rule. If it does, it is Step 20's existing behaviour for
every door: note it, and only stop it if something breaks (a machine lost,
a scenario red). Getting out waits one round trip on a phone (the seat is
the server's).

## Do, each its own push, each live

**Push 1, the trike and the roadblock.** Characters, tuning set, machine
file (`DRAFT:` numbers; a light, quick machine: e.g. `accel` 500,
`speed.rider` about 420, `speed.driver` under 76, `ramSpeed` 160,
`throwRider` 11000 so the armoured guard's blow throws you out and the
guard's 9000 does not), primitives 1-3, the placements above. Scenarios in
the real courtyard with placements, each control watched failing:
`step20-courtyard-trike-through-the-roadblock` (grappler from spawn 0: Get
in, east, all three crates launched, anyone stood at it launched, Jump
out standing; control: `ramSpeed` above any speed the run reaches, nothing
launched), `step20-courtyard-trike-solo-infiltrator` (the smallest hero,
alone, the same; control: no Jump press, still riding at the end),
`step20-courtyard-trike-stalled-jump-out` (driven into the shut gate, a
wall crash, then Jump puts the hero out; control: no Jump). One e2e fact
by touch on a phone-sized page, `guard-machine-get-in` (and `-drive`,
`-out`), a new `scripts/e2e/guard-machine.ts` in a private world, copying
`scripts/e2e/machine.ts` (walk street → courtyard, Use reads get-in at the
trike, tap, the stick moves it, the page draws the rider's hero over it,
Jump stands the hero beside it; control `E2E_TOUCH_BREAK=interact`), plus
its one call line in `scripts/e2e.ts` (a one-line addition; the e2e-reds brief owns fixes there, so add only your line, pull and rebase before you push, and say in your report that you did). Shots at 844x390 and 390x664 into
`docs/plan/step-20-shots/courtyard-*`: parked, Get in, riding (the hero
visible), the roadblock flying, out beside it. `INTENT:` at the exits
(Jump always; a stalled trike is left by Jump) in the placements' `"//"`
and `docs/deliberate-designs.md` if you add a rule that looks odd.

**Push 2, stealing it is seen.** The `events` row `machine-taken` → `take`
and primitive 4 with its `events` row. No guard is placed (see "Decided");
witnesses are the guards who follow a hero in. Scenarios with their own
`entities` (a guard standing in view of the trike):
`step20-courtyard-theft-seen` (Get in in his view: `mood-changed` cause
`odd:take`; control: the events row removed, no change),
`step20-courtyard-ram-a-guard` (the trike rams him: `odd:hit`; a second
odd deed enrages him, he chases, the rider outruns him; control: the new
event field left off). Check the camp: `take` has no row for a bad
witness, so the camp's wagon is unchanged; run every `step20-camp-*`.

**Push 3, only if budget remains: the watch drives one at you.** Primitive
5 (an optional `rides` on a dispatch person: the outposts' shape, its
`rideEntry` copied as `entryFor` already is) and the street's level-3 row's
first guard riding the trike (`content/dispatch/castle-street.json:6-10`).
This is in the street (the town's dispatch walks rows into the street; the
courtyard has no dispatch file). Traps: 8 street scenarios reach level 3
(`step4-tier-away-at-the-most-*` ×5, `-both-doors`, `-cap-holds`,
`-cools-and-leaves`), plus `scripts/e2e/tiers.ts` and
`scripts/checks/step4-tiers.ts`: count reds first; if more than three go
red, stop and report. Level 3's row repeats on every further call while it
fits under the cap of 8 (drivers count, machines do not): decide and log
what stops trikes piling up. Scenarios `step20-street-watch-trike-taken`
(pulled out, taken, turned on the row; control: no grab) and
`-outrun` (control: `speed.driver` raised with the content floor lifted).

## Yours and not yours

Yours: `content/machines/guard-trike.json`, `content/characters/guard-trike.json`,
one tuning set in `content/tuning.json` (additive), your entries in
`content/placements/courtyard.json`, one or two `events` rows in
`content/rules/expectations.json`, the additive fields in
`src/content/kinds/machines.ts`, `src/client/draw/machines.ts` (and one call
in `draw/entities.ts` if the rider's hero must be drawn from there), the
additive event field in `machine-ram.ts`, push 3's `src/content/kinds/dispatch.ts`,
`src/sim/systems/alert-dispatch.ts` and `content/dispatch/castle-street.json`
(Step 4's: tell the orchestrator before), `scenarios/step20-courtyard-*`,
`scenarios/step20-street-*`, `scripts/e2e/guard-machine.ts`, your shots and notes.

Not yours, each another builder's tonight: **the courtyard's placements
file is shared** with the thrower (`handoff-prompts/ranged-enemy-2.md`,
push 3): whoever lands first creates it, the other adds lines after `git
pull --rebase`; message that builder (id in `docs/plan/step-24.md`, builder
notes, or ask the orchestrator) before you push it. The camera
(`camera-looks-at-what-matters.md`: `src/client/render.ts`,
`src/client/camera.ts`); `src/net/**` (`thrown-friend-through-a-crate.md`);
the suplex (`suplex.md`); the camp's rows and `outpost-wave.ts`
(`camp-entries.md`); backdrops and the backdrop field of a room
(`biome-backgrounds.md`); `scripts/e2e/**` fixes and `scripts/e2e.ts`
(`e2e-intermittent-reds.md`; your new file is fine). **Leave
`content/rooms/courtyard.json` untouched** (no tile, part or note change:
the backdrops builder edits that file). Never edit `content/looks/guard-vehicles.json`
or run `tools/art/props/make.py`. The ram wagon's numbers and the camp.

Out of scope, however tempting: the prison wagon, roller or rotorcraft; a
guard at the reins in the courtyard; a solid roadblock; machines carried
through doors (note only); the camp's wagon's door behaviour.

Traps: every e2e run rewrites shots under `docs/plan/` until
`handoff-prompts/e2e-shots-only-when-asked.md` lands: `git checkout --
docs/plan/step-2*-shots` (yours excepted) before you commit. A red in
another step's scenario goes to its owner by message, with the list in
your report first. Stop at about 300k tokens wherever you are, with
"Landed so far" above filled in.

## Decided vs. open

Decided: above. Open, yours, `DRAFT:` with a decisions-log entry: the
trike's numbers; the new fields' names; what stops a repeating row piling
trikes (push 3). For the owner, by playing (already in the step file):
does crashing the roadblock earn the "OHH!"; should a guard ever patrol on
it. Nothing waits on them.

## Done

Each push: `npm run build`, `npm run check` (every scenario; controls
watched failing and named in the commit), `npm run gates` 6 of 6, full
`npm run e2e` green (a known intermittent red named as such, re-run),
pushed to `main`, then `npm run check:deployed` and `npm run check:live`
ok. On a deploy that seems stuck with `/healthz` healthy on an older
commit: never revert; wait fifteen minutes pushing nothing, re-running
`check:deployed`. Then `docs/mechanisms/machines.md` gets a "On the
courtyard's run" section (and push 2's deed rows in `npc-response.md`,
"Deeds"), and `docs/vision-gaps.md` is the orchestrator's to refresh.
