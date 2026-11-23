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
