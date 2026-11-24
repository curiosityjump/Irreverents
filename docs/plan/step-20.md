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
