# Core loop 6, vehicle hijacking, builder A: the machine itself: pull the driver, get in, drive, ram, get thrown, jump out (Step 20)

**Landed so far (2026-11-24 00:00 UTC): pushes 1 and 2** by `session_017WiGzGBREdxtzPBSo4mcca`, which stopped at its context budget: a2bee99 (the wagon drives and rams, in `test-machine`) and 3cc1ae1 (the seat: Grab pulls the driver, Use reads "Get in", Jump or a heavy's blow or the wreck gets you out, your hero cannot be switched into while you ride, a bandit driver at 60). **You do push 3, the look** (`src/client/draw/machines.ts`, the rider's face on the plate, the art ask to `session_017WiGzEN1QbSnHzXNqV4XSt`), **and first two data changes builder B (`session_017WiGzEvHsdz7Z8fr6XuECe`) asked for and A agreed** (`docs/plan/step-20.md`, b848f92): `speed.rider` about 560 with `accel` about 300 (the camp post breaks at 450 and the wagon cannot stand nearer than 12 tiles, so at 340 it never snaps it), and `crashes` about 16 (B's run wrecks at the 8th crash, before the barricade). Measure both in B's real run with B before pinning; re-time the four `step20-*` scenarios and the one control they move; `DRAFT:`, logged. Also from A's notes: a wave row cannot put a wagon down yet (the smallest change is an optional `rides` field in `src/content/kinds/outposts.ts`: the waves slice is finished and its builder archived, so that additive edit is yours or B's: agree by message who makes it); getting out waits one round trip on a phone; "still the rider after a reconnect" was not exercised over the network. Read `docs/plan/step-20.md`, "Builder notes", and `docs/mechanisms/machines.md` first.

Brief for one cold builder. Written 2026-11-23 by the orchestrator's drafting
agent, read at a01c44c; nothing was run. The step is `docs/plan/step-20.md`:
read all of it. Read `docs/plan/core-loops.md`: "The owner's verdict", "The
principle", "Names the slices share" (with "How state reaches a phone") and
section 6. Read `docs/mechanisms/combat-and-impact.md`,
`docs/mechanisms/rooms-and-doors.md` ("The kinds of part", `breakable`),
`docs/mechanisms/party-and-switching.md`, `docs/mechanisms/heists.md` (the
Use arbiter), `docs/mechanisms/outposts.md`, `docs/mechanisms/network.md`,
`docs/mechanisms/saves.md` and `docs/mechanisms/scenarios.md` before writing
anything.

**Two builders, and why.** Step 20 says "Two builders" and does not say how
they split; this is the split. **You (A)** build the machine as engine and
data, proven in a new test room: new files only, so you start now, beside the
waves builder. **Builder B** (`handoff-prompts/loop-vehicles-b.md`) puts it in
the Bandit Camp, extends the camp, and owns the phone check; B starts when the
waves slice's camp edits and your push 2 are on `main`. **Nothing of yours is
reachable by a player until B's push 2.** Say so in each report.

**Reports:** `send_message` to the session on the Orchestrator line of
`docs/questions-for-the-owner.md`, after each push, with the commit. Notes:
`docs/plan/step-20.md`, "Builder notes" at its end (empty today).

**Small pushes, each standing alone and fully checked. Push 1 is the sim rule
and its scenarios; drawing comes after.** If you pass about 300k tokens after
push 2, report and stop: the orchestrator re-briefs the rest.

## The task, and why

The owner, 2026-11-23 ~18:30 UTC, first-hand, after playing on a phone
(`docs/vision.md`, "The measure"; `docs/plan/core-loops.md`, "The owner's
verdict"):

> Remember the original intentions for the game and make sure things align with it. I want to play it as I described it.
> There are no heists or stealth yet, no puzzles, no hidden places to explore, no characters to unlock, no escalating combats or chases, no power/item stealing,  no vehicle hijacking, no risk. Virtually everything described in the vision docs that would make the game genuinely fun to play is yet to be seen at all

**What a player gets** (with B's half). *You see:* past the camp's entrance, a
wheeled armoured wagon with its driver in it, facing away. Grab pulls him out
and you can throw him. Beside the empty seat the Use button reads GET IN. In
it, the stick drives: it builds speed past any hero's run, everyone in the
way flies by its weight, the horn post snaps, barriers burst, and it keeps
rolling, a little more battered each crash. Jump puts you on your feet beside
it at any moment. *Found by:* nobody is told: it is the biggest thing in view
with a person in it, and the button names the deed. *Payoff:* the crash
(D-020, G-08's "OHH!"), and the camp's cache the loud way. *Risk:* it is the
loudest thing you can do; crashes wear it to a wreck; a heavy's blow throws
you from the seat among the people you just ran over. Never a reload: thrown
or wrecked, you are on your feet in a world that kept its state.

**It moves no row of `docs/plan.md`'s table** (M3 is counted by gates A-F;
none is the machine). It is for "no vehicle hijacking".

The library (doc 11), decided: **D-017** "steal or hijack vehicles"; **D-020**
"Spectacular IMPACT is a top priority: suplexes, launches, heavy collision,
knockback into walls/other enemies, and roadblock crashes"; **D-022**
"Reckless, over-the-top, self-endangering destructive action is a major
toybox pleasure"; **D-023** "Hijacking the enemy machine sent to stop the
party and turning it on the pursuers is a signature desired situation";
**D-019** no reload loop; **D-055**, **D-062** no NPC AI; **D-093** iPhone
first. Direction, doc 08 "Vehicles": "speed, crunch, collision, debris,
knockback, breakable barricades, chains of crashes"; "bail out at the last
moment and escape on foot". G-08: "hit has buildup, impact and consequence:
debris, defenders launched, mass visible, controls recover"; pass: "player
says “OHH!” without relying on giant text damage numbers or cinematic
override". **Not decisions, so every such choice is a logged `DRAFT:`:**
**O-008** and **O-009** are OPEN ("How/when vehicle hijacking is possible,
which vehicles, steering and collision model in side view"); doc 24's "1
hijackable machine with a simple side-view movement/ram ability" is PROPOSED.

## Measured for you (read at a01c44c; nothing was run)

- **Nothing drives or rams today.** Only a *flying* body shoves another
  (`src/sim/systems/impact-bodies.ts:25-26`; its header: "Bodies that are not
  flying pass through each other"). A body running at any speed passes
  through people. The ram is a new rule.
- **A barrier already breaks to any fast body.** A `breakable` part opens for
  good when a body is about to run into it sideways at or above
  `params.breakSpeed`, default `wallBreakSpeed` 200 (`content/tuning.json:50`;
  `src/sim/systems/room-breakable.ts:55-58`), "and the body carries on through
  with its speed" (its header; `INTENT:` no health, D-020). So the barricade
  needs no new break rule, and "controls recover" is already how it behaves.
  `params.look` accepts only "wall" or "window" (`:40`).
- **The horn post** breaks on an `impact` event whose `other` is the post and
  whose `speed` is at least the outpost's `breakSpeed`, 300
  (`src/sim/systems/outpost-signaler.ts:29`; `content/outposts/outpost.json:12`).
  Your ram must emit `impact` in that shape, and the wagon's top speed must
  reach 300 for the post to snap.
- **Speeds** (`content/tuning.json`, `runSpeed`): the fastest hero is the
  infiltrator, 128 (`:159`); the slowest on the roster is the brawler, 76
  (`:273`; grappler 84 `:131`, flyer 92 `:187`, skirmisher 120 `:301`); a camp
  fighter runs at 48 (`:238`). `move` allows at most 600 and its `INTENT:` is
  that top speed stays under one tile a tick (`src/sim/verbs/move.ts:15-17`).
  So: driven by a hero, top speed above 300 and at most 600; driven by a
  bandit, below 76. **You measure and pick both, and the build-up time**,
  `DRAFT:`, logged.
- **The box.** `src/content/kinds/characters.ts:39-43` refuses a box over 32
  by 32 (`INTENT:` whole pixels, physics snaps to tile edges). The wagon's
  cells are 48 by 44 (`content/looks/rides.json`). **Stay inside 32 by 32**
  and draw the look bottom-centred over the box (`DRAFT:`); raising the limit
  is not in this brief.
- **Weights:** grappler 60, brawler 70, heavy-fighter 120, brute 140, the
  post 1000, a body with no weight 40 (`content/tuning.json:40`, and each
  character's set). The shove formula is in `impact-bodies.ts:48-56`. The
  wagon's weight is yours to pick so that a fighter flies and the grappler
  flies less; `DRAFT:`.
- **Who can pull the driver.** All five roster heroes list `grab`
  (`content/characters/*.json`). The smallest `liftStrength` is 60
  (infiltrator `:178`, flyer `:208`, skirmisher `:322`): the driver must weigh
  60 or less or a solo infiltrator is locked out.
- **`become`** (`src/sim/effects.ts:27`, applied `:68-73`) sets `kind`, `x`,
  `y` and stops the body. The page owns `kind` and its motion; the server
  owns its copy of `c` and steps it from the player's input
  (`src/server/game.ts:253-260`, an `INTENT:`). So a `drive` verb on the
  machine kind runs on the rider's own page with no lag, and a server system
  reads the same input for Jump.
- **Trap, measured: riding frees your hero.** `memberTaken` asks whether a
  played entity's `kind` is the member (`src/sim/party.ts:36`). A rider whose
  kind is the machine no longer holds their hero: a friend can switch into
  it, and the plate shows it free (`src/client/draw/hud.ts:88`, `:103`: the
  rider's face becomes a plain square). `become` does not carry the old kind.
- **A page is sent only its own room's entities and never its own `c`**
  (`src/server/game.ts:527`; core-loops, "How state reaches a phone").
- **Use:** an entry is one file in `src/sim/use/` (`src/sim/use.ts:30-41`).
  Orders today: door 0, thing 100, free 150, bell 200. The page asks the same
  list of its composed world (`src/client/use-prompt.ts:16-22`), so `find`
  must work from what a page is sent: the machine's entity, not server-only
  state. One row in `content/prompts.json`; no digits.
- **Art.** `ride-wagon-{idle,moving,crash,wrecked}`, 48 by 44, `moving` 2
  frames at 8 fps (`content/looks/rides.json`; `tools/art/props/README.md`,
  "Core loops"). Every cell has the same goggled rider baked in, and "no code
  draws a ride yet". No empty wagon exists: the Drive revision is requested
  (a42b7e6) and not delivered.

## What to build (`DRAFT:` throughout; decisions-log entries "Step 20: the machine", "Step 20: the ram", "Step 20: the seat")

1. **Push 1, drive and ram** (sim only). `content/machines/ram-wagon.json`
   and `src/content/kinds/machines.ts` (which character it is, its speeds
   driven by a hero and by a bandit, ram threshold, wear per crash, the hit
   that throws a rider: all data); a `ram-wagon` character (box inside 32 by
   32, verbs `drive`, `body`) with its tuning set; `src/sim/verbs/drive.ts`
   (the stick builds speed slowly and holds it; no jump, no switch);
   `src/sim/systems/machine-ram.ts`: a machine moving at or above its
   threshold that meets a body shoves it by weight with the same helpers a
   flying body uses (`strike`, `markImpact`, `wear`, the `impact` event), once
   per pass, and takes wear itself. Worn through, it is a wreck: it stops
   driving for good and stays where it is (`INTENT:` nothing resets). **One
   ram rule:** write it so Step 18's queued "heavies topple to a big throw"
   (`docs/plan/step-18.md:252`) can call the same function; build nothing of
   that slice. A new room `content/rooms/test-machine.json` (a long flat
   floor, a `breakable`, bodies of three weights, a post).
2. **Push 2, the seat.** `src/sim/machines.ts`, `src/sim/use/get-in.ts`
   (GET IN, beside a machine with nobody in it; order after the door, yours to
   place against 100 and 150), `src/sim/systems/machine-seat.ts`:
   - **The driver is a person.** A machine may be placed with a driver in it;
     a hero's ordinary Grab beside it takes the driver out into their hands
     (he can be thrown), leaving the seat empty. No new button.
   - **In:** Use beside the empty seat: the server emits `become` to the
     machine kind and the standing machine entity is gone while ridden.
     **Out:** a fresh Jump, at any moment and any speed: `become` the hero
     again beside it, the machine left standing or rolling. `INTENT:` there
     is always a way out; mark it.
   - **Your hero stays yours while you ride:** nobody can switch into it
     (the smallest additive read in `memberTaken`'s inputs), and you come out
     as the hero you went in as, after a reconnect too.
   - **A hard hit throws the rider:** a hit above the data's threshold puts
     the rider out and flying; a light one does not.
   - **A bandit drives by script:** `src/sim/systems/machine-driven.ts`, NPC
     response logic, fixed states: drive at a hero the driver saw, at the
     bandit-driven speed. `INTENT:` people can be outrun. Write in your
     notes exactly how a placements entry and an outpost wave row
     (`{ character, npc }`, `src/content/kinds/outposts.ts:39`) put a wagon
     with a driver in a room: builder B writes those rows.
   - **What a phone needs:** who rides what, and each machine's wear, as a
     top-level world field (you name it; add its row to core-loops' "Names
     the slices share" in the same push), plus events `machine-taken`,
     `machine-left`, `machine-wrecked`. Read every new field with a default
     (`docs/mechanisms/saves.md`).
3. **Push 3, the look.** `src/client/draw/machines.ts`, one line in
   `src/client/render.ts`. **Stand-in decision, `DRAFT:`, logged:** with a
   bandit in it, the cells as cut (the baked rider reads as the driver);
   `moving` while rolling, `crash` for a beat after a ram, `wrecked` when
   worn through. With a hero in it, the same cells with the player's own mark
   over it. **The empty seat:** message the art builder
   `session_017WiGzEN1QbSnHzXNqV4XSt` before this push for `ride-wagon-empty`
   (the idle cell with the rider painted out in-house, as it cleared the
   cage's bars); until that cut is on `main` draw `ride-wagon-idle` as it is
   with the Use mark over the seat, and write in your notes that an empty
   wagon shows a rider. The plate shows the rider's hero face, not a square.
   Dust and shake from `markImpact` as for any impact. Screenshots at 844×390
   and 390×664 under `docs/plan/step-20-shots/`.

## Signal

Scenarios in `test-machine`, each with a control watched to fail:
`step20-ram-launches-by-weight` (a fighter flies farther than a heavy;
control: under the threshold nobody moves); `step20-ram-snaps-the-post`
(control: top speed set under the post's `breakSpeed`, it stands);
`step20-barricade-breaks-and-rolls-on` (through, still moving, and the stick
still steers after: G-08; control: `breakSpeed` above top speed, it holds and
nobody behind is launched); `step20-wears-to-a-wreck`;
`step20-pull-driver-get-in` (each of grappler and infiltrator, alone);
`step20-jump-out-at-speed`; `step20-hit-throws-rider` (control: a light hit
does not); `step20-seat-keeps-hero` (a second player cannot switch into the
rider's hero); `step20-driven-is-outrun` (the brawler walks clear of a
bandit-driven wagon; control: the driven speed raised, he is caught).
`scripts/checks/step20-machine.ts`, a real server and **two connections**: A
gets in and drives, and A's reported positions are adopted unchanged (no
server correction while riding); B, in the room, sees the wagon move and the
`breakable` open; A leaves and rejoins and is still the rider or cleanly the
hero, never a wagon with no way out.

## Traps

- **Being stuck may not.** A wreck, a reconnect, a kept game loaded while
  someone rode, a machine kind with no `jump`: each must leave the player a
  hero who can walk. Prove the reconnect and the kept game.
- **Kept games keep every body that is not a player** (Step 17): a standing
  machine is saved; a ridden one is a player's body and is not. Say what a
  loaded game does with it.
- **No digits drawn** (`t-no-numbers` reads every string drawn in a fight):
  wear is shown by the cells, never a number (D-020).
- **Do not loosen `impact-bodies`' rule** that standing bodies pass through
  each other: only a machine at speed rams. It never moves a placed thing,
  the cage or its captive (kind `~thing`, no box: `src/sim/recruits.ts:55`),
  a carried body or a Hall pedestal.
- **e2e flakes on `main` today:** `h1`, `h2`, `t-grab-friend`,
  `s-break-free`, `t-throw-friend` fail some of the time and are under
  investigation (`handoff-prompts/step-5-e2e-flakes.md`). Re-run, report which
  failed and how often; never loosen a check.
- `git pull --rebase` before each push. Stop test servers by PID. If live is
  healthy on an older commit after a push, wait, don't revert.

## Yours, and not yours

**Yours** (propose this row for `docs/architecture.md`, "Which paths each
plan step owns", in push 1; Step 7's row still lists `content/machines/**` and
`machine-*`, tell the orchestrator): `content/machines/**`,
`src/content/kinds/machines.ts`, `src/sim/machines.ts`,
`src/sim/systems/machine-*.ts`, `src/sim/verbs/drive.ts`,
`src/sim/use/get-in.ts`, `src/client/draw/machines.ts`,
`content/rooms/test-machine.json`, the `ram-wagon` character and tuning set,
`scenarios/step20-*.json` not named `step20-camp-*`,
`scripts/checks/step20-*.ts`. Agreed small edits: one row in
`content/prompts.json`, one line in `src/client/render.ts`, the read in
`src/sim/party.ts`, the face in `src/client/draw/hud.ts`, additive fields in
`src/sim/types.ts`.

**Not yours:** everything of the camp (`content/rooms/outpost.json`,
`content/placements/outpost.json`, `content/outposts/outpost.json`,
`content/recruits/**`, `content/heists/**`) and every `step12-*`, `step13-*`,
`step19-*`, `step7-*` scenario; `scripts/e2e/**` (B's); the impact systems'
existing rules; `src/server/**` beyond what you agree by message with the
orchestrator; the courtyard's clear run (kept for a royal machine).

## Decided, and open

Decided by the owner: the D-numbers above; the stick drives, Grab pulls the
driver, Use gets in, Jump gets out, no new button (Step 20, "What's decided").
`DRAFT:`, yours to log: every speed, weight, threshold and wear number; the
box; that a wreck is for good; the stand-in looks; the field's name. Nothing
waits on the owner. For the owner to judge by playing, not asked: does
ramming a barricade earn the "OHH!"; which machine should come next.

## Done

Each push: `npm run build`, `npm run check`, `npm run e2e` green; pushed to
`main`; `npm run check:deployed`, `npm run check:live`; `/debug/errors` read.
A new `docs/mechanisms/machines.md` and its line in
`docs/mechanisms/README.md`; the architecture row; decisions-log entries;
`docs/plan/core-loops.md` section 6 and its names table updated to what
landed; notes in `docs/plan/step-20.md`. A blocking question goes to the
orchestrator by message and to `docs/questions-inbox.md`; a flag to
`docs/for-the-orchestrator.md`. Final message: done or blocked, the commit.
