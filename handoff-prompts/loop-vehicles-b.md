# Core loop 6, vehicle hijacking, builder B: the wagon in the Bandit Camp, two screens to plough through, and a second wagon sent at you (Step 20)

**Landed so far (2026-11-24 02:50 UTC)** by `session_017WiGzEvHsdz7Z8fr6XuECe`, which stopped at its context budget: **push 1 at 116c5d8** (the camp runs on east to column 87: fence, crate, two stalls, a timber barricade, the cache, a second high ledge as the quiet way) and **e367b03** (a half-height stair at (4,9) so every roster hero gets in; `step20-camp-every-hero-gets-in`). Builder A is finished and archived: the wagon drives, rams, is boarded and has its look (a2bee99, 3cc1ae1, d98c6b1; rider 560, accel 300, crashes 16), in `test-machine` only. **You do pushes 2 and 3. Push 2 is the first moment the owner can hijack anything: the wagon placed in the camp, reachable by a player, with the phone e2e fact.** Read `docs/plan/step-20.md`, "Builder notes" (both builders'), and `docs/mechanisms/machines.md` ("Getting a person's machine into a room") first. From B's last notes: nobody has driven the run with the camp's people in it at the new numbers; the barricade's `breakSpeed` 300 and its `//` note (which says 340) should move to about 540, wagon-only, if the run reaches it (measure); the probe trick for a wagon in the camp before placement is the player as `ram-wagon` with the scenario's `tiles` clearing the step (5-7, rows 8-10); the wave row's optional `rides` field (`src/content/kinds/outposts.ts`) was never built: it is yours for push 3. **Since this brief was written the owner has said** (`handoff-prompts/owner-enemies-chase-alarms.md`, builder `session_017WiGzF31gfYgeWNMA7rnEL`, who now owns `outpost-wave.ts` and the camp's rows): "Alarms should spawn more enemies of increasing strength that come in from the sides": the second wagon in a later row comes in from a side as part of that rule: agree the row's shape with that builder by message before push 3. Also tonight: hearts (`handoff-prompts/hearts.md`: a rider thrown from the wagon by a hard hit and floored by an enemy loses a heart like anyone), enemies staying beaten (`beaten-*`), the chase (`outpost-fight.ts`), weapons (Step 23): touch none of their files. Look asks (fence, stalls, barricade, `ride-wagon-empty`) are with the props builder `session_017WiGzHr5CCwAod6mkVF139`; the owner's guard vehicles (GV-01) are being cut and are not this brief's.

**Released by the orchestrator, 2026-11-23 23:20 UTC: `loop-waves.md` pushes 1 and 2 are on `main` (91b83a5, 745395d); the rescue is finished (a01c44c) and its builder archived. Builder A (`session_017WiGzGBREdxtzPBSo4mcca`) has push 1 on `main` (a2bee99) and is on push 2, the seat: your pushes 2 and 3 wait for it; push 1 does not. The waves slice's push 3 touches only the Hall's drawing, not the camp.**

Brief for one cold builder. Written 2026-11-23 by the orchestrator's drafting
agent, read at a01c44c; nothing was run. The step is `docs/plan/step-20.md`:
read all of it, and builder A's notes at its end. Read
`docs/plan/core-loops.md`: "The owner's verdict", "The principle", "Names the
slices share" (with "Files with one owner at a time") and section 6. Read
`handoff-prompts/loop-vehicles-a.md` (the machine you place), then
`docs/mechanisms/machines.md` (A writes it), `docs/mechanisms/outposts.md`,
`docs/mechanisms/rooms-and-doors.md`, `docs/mechanisms/heists.md`,
`docs/mechanisms/recruits.md`, `docs/mechanisms/rendering-world.md` and
`docs/mechanisms/scenarios.md` before writing anything.

**Do not start until all of this is on `main`** (check, do not assume):

1. The waves slice's camp work: `git log --oneline -- content/outposts/outpost.json`
   shows a "Step 7" push after a69ecf6, and `scenarios/step7-waves-reach-the-hero.json`
   and `scenarios/step7-last-stand-camp.json` exist (`loop-waves.md` pushes 1
   and 2; today neither does). Then message the waves builder (the builder on
   Step 7's status line in `docs/plan.md`) that the camp's three files are
   yours from now.
2. The rescue slice finished: its four pushes are on `main` (a1741fa,
   0a2e8fa, cc86083, a01c44c). Ask the orchestrator to confirm its builder has
   stopped; `handoff-prompts/loop-rescue.md` still exists today. **Never
   beside the rescue slice** (core-loops, "Never together").
3. For your push 2 onward: builder A's push 2 (`src/sim/use/get-in.ts` and
   `src/sim/systems/machine-seat.ts` exist). Your push 1 needs nothing of A's.

**Reports:** `send_message` to the session on the Orchestrator line of
`docs/questions-for-the-owner.md`, after each push, with the commit. Notes:
`docs/plan/step-20.md`, "Builder notes". **Small pushes, each standing alone
and fully checked.** If you pass about 300k tokens after push 2, report and
stop: the orchestrator re-briefs the rest.

**Landed so far (2026-11-24 03:50 UTC):** push 1 by the first B builder; push 2 at 3a8a30a by `session_017WiGzGehKBFBBGaoRu2awP`, which stopped at about 340k tokens: the ram wagon stands empty on the Bandit Camp's entry step (not column 10: heroes knocked west landed against it), GET IN, drive east into the cache, Jump out. `outpost-fight.ts` already skips a seated driver (a5fbd53). **Left, for a fresh builder: push 3, the wave's driven wagon** (the wave row's `rides` field is unbuilt; a driver pulled from the seat is an ordinary bad guy with hearts and the beaten-for-good rule). **Held until the alarms builder (`session_017WiGzHgbh9PtsdzXnTDvqz`) has switched the both-sides rows on in the camp** (`handoff-prompts/owner-enemies-chase-alarms.md`): it is re-timing the same camp scenarios and owns `content/outposts/` meanwhile. Notes: `docs/plan/step-20.md`, "Builder notes"; `docs/mechanisms/machines.md`, "In the Bandit Camp". The barrier a fast wagon's reports step over is `handoff-prompts/step-20-machine-check-fails.md`.

## The task, and why

The owner, 2026-11-23 ~18:30 UTC, first-hand, after playing on a phone
(`docs/vision.md`, "The measure"; `docs/plan/core-loops.md`, "The owner's
verdict"):

> Remember the original intentions for the game and make sure things align with it. I want to play it as I described it.
> There are no heists or stealth yet, no puzzles, no hidden places to explore, no characters to unlock, no escalating combats or chases, no power/item stealing,  no vehicle hijacking, no risk. Virtually everything described in the vision docs that would make the game genuinely fun to play is yet to be seen at all

**What a player gets.** *You see:* come down into the Bandit Camp and the
first big thing in view is an armoured wagon with its driver in it, facing
away. Pull him out with Grab; the Use button reads GET IN. Drive east: the
lookout and the fighters fly, the horn post snaps, a light barrier bursts,
market stalls scatter, then a timber barricade goes to pieces and you roll
into the camp's cache behind it, still moving. Jump and you are on your feet.
Stay for the waves and a later one brings a second wagon driven at you, slow
enough to walk away from: pull its driver and turn it on the wave (D-023).
*Found by:* nobody is told; the wagon and the button's word are the lesson,
and the barricade is in view at the end of the run. *Payoff:* the crash, and
the cache the loud way; a broken barricade stays broken in a kept game.
*Risk:* every bandit hears it; the wagon wears to a wreck; a heavy's blow
throws you out in the middle of them. Getting caught opens play: there is no
reload, and the ledge and the doorway are still the ways out.

**It moves no row of `docs/plan.md`'s table.** It is for "no vehicle
hijacking". The library: **D-017**, **D-020** ("roadblock crashes"),
**D-022**, **D-023**, **D-061** (you can always escape the zone), **D-019**;
doc 08 "Vehicles"; G-08 ("controls recover"), G-09 ("supported by mechanical
rules, not a pre-scripted mission flag"). **O-008, O-009 are OPEN** and doc
24's machine is PROPOSED: every choice below is a logged `DRAFT:`.

## Measured for you (read at a01c44c; nothing was run)

- **The room** (`content/rooms/outpost.json`): 44 columns by 12 rows of 16 px.
  The doorway is column 2, the spawn column 3, a step at columns 5-7 (rows
  8-10), a one-way ledge on row 6 over columns 9-38, the floor row 10, a
  solid east wall at column 43. Its comment says ids and the door id are
  permanent.
- **Who stands where:** lookout column 18, horn post 20, fighters 25 and 28,
  the strongbox 34 (`content/placements/outpost.json`); the cage columns
  32-33 (`content/recruits/camp-captive.json`); waves enter at [41, 10], at
  most 8 people (`content/outposts/outpost.json:7-8`). The waves slice may
  have changed the outpost file by the time you start: re-read it.
- **The first plan had three seconds of driving**: about 26 tiles in a room
  the wagon cannot leave (Step 20, "A real run"). The answer chosen here:
  **extend this room east** (`DRAFT:`; the other answer, a machine through
  walk doors, is not built).
- **A screen** is 320 game px wide off a touch screen and 280 to 450 on a
  phone held sideways (`docs/mechanisms/phone-shell-look.md`): 20 tiles, and
  17.5 to 28. "Two screens" is yours to measure on a 844×390 page.
- **A barrier needs no new rule.** A `breakable` part opens for good when a
  body arrives sideways at or above its `params.breakSpeed` (default 200,
  `content/tuning.json:50`), and the body carries on through with its speed
  (`src/sim/systems/room-breakable.ts`). A crate thrown at up to 520
  (`content/tuning.json:22`) breaks one too. `params.look` accepts only
  "wall" or "window" (`room-breakable.ts:40`).
- **What pins the camp today.** 15 scenarios run in `outpost`: 6 `step12-*`,
  6 `step13-*`, 3 `step19-*` (`grep -l '"outpost"' scenarios/*.json`), plus
  the waves slice's `step7-*`. Also `scripts/checks/step19-heist.ts`,
  `scripts/checks/step14-levels.ts`, and e2e `outpost.ts`, `rescue.ts`,
  `doors.ts`, `fight.ts`, `levels.ts`, `quarry.ts` name it. Count again
  before you start and list every one you re-time, and why.
- **Thin margins already there:** the cage hold leaves the grappler "about a
  quarter second to spare" against fighter 2's turn; the way out by the ledge
  breaks if `jumpSpeed` drops (`docs/plan/step-13.md`, "Builder notes";
  `docs/plan/step-3.md`, last note). A wagon or a stall in fighter 2's sight
  line, or under the ledge's ends, changes both.

## What to build (`DRAFT:` throughout; decisions-log entries "Step 20: the camp's run", "Step 20: the wave's wagon")

1. **Push 1, the run** (needs nothing of A's). Extend
   `content/rooms/outpost.json` east past column 43 by about two screens:
   in order, a light barrier, stalls and loose things to scatter, then a
   timber barricade, then the cache behind it. Barriers are `breakable`
   parts with their own `breakSpeed`: the light one opens to a thrown crate,
   the timber one only above what a hero can throw, so it is the wagon's.
   That window is narrow: above 520 (`maxLaunchSpeed`) and at or under the
   wagon's top speed, which `move`'s limit caps at 600
   (`src/sim/verbs/move.ts:17`); if A's numbers leave no room, decide the
   other way (anything thrown hard enough breaks it) and log it. The cache's contents are yours to
   choose from what exists (a second prize of `content/heists/camp.json`, or
   gold from `content/looks/treasure.json`); `DRAFT:`. **A quiet way to the
   cache exists** (the ledge, a gap, a drop: your design) so the loud way is
   a choice. **Nothing west of column 39 moves**: the cage, the strongbox,
   the post, the people. Re-time what the longer room changes, each with its
   reason. Ask the art builder `session_017WiGzEN1QbSnHzXNqV4XSt` by message
   for the barricade, its broken stage and a stall (Step 20: "from P04 and
   P07"), and add `look` values for them to `breakable`; no grey box ships
   as their look.
2. **Push 2, the wagon in the camp.** One entry in
   `content/placements/outpost.json` puts the wagon and its driver where a
   player coming over the step sees it first, facing east, in nobody's way
   on the quiet routes. Then the real-camp scenarios below, and the phone
   fact.
3. **Push 3, the wave's wagon.** A later row of the camp's waves brings a
   second wagon with a bandit driving (data in
   `content/outposts/outpost.json`, by the row shape A's notes give). It
   counts toward the bound as the waves slice counts people. `INTENT:` it is
   slower than the slowest hero while a bandit drives.

## Signal

- Scenarios in the real camp (`placements: true`), each control watched to
  fail: `step20-camp-hijack-and-crash` (the driver grabbed and thrown, in,
  east: people launched, the post broken, both barriers broken, the wagon
  still moving after the timber one and the stick still steering, out by
  Jump; control: the timber barrier's `breakSpeed` above top speed, it holds
  and nobody behind it is launched); `step20-camp-solo-infiltrator` (the
  lightest hero alone does the same); `step20-camp-quiet-way` (the cache
  reached with no call started and no barrier broken; control: by the floor,
  a call starts); `step20-camp-wave-wagon` (the slowest hero walks clear of
  the driven wagon, takes it and fells the wave with it; control: the driven
  speed raised, the hero is caught); `step20-camp-stays-broken` (a kept game
  saved and loaded: the barricade is open).
- Every `step12-*`, `step13-*`, `step19-*`, `step7-*` scenario green, none
  loosened: a re-time changes ticks, never what is expected.
- `scripts/checks/step20-camp.ts`, a real server and two connections: A
  drives through the barricade; B, standing in the camp, sees the wagon move
  and the barricade open, and gets the events.
- `npm run e2e`, `scripts/e2e/machine.ts`, a phone-sized page by touch, no
  fight to win: walk to the camp; the Use button reads GET IN beside the
  empty seat (control: read before the driver is out); in, the stick moves
  the wagon; Jump, and the hero stands beside it.
- Screenshots at 844×390 and 390×664 under `docs/plan/step-20-shots/`: the
  wagon from the step, the crash, the cache.

## Traps

- **Getting caught opens play.** A wreck in the cache must not trap anyone:
  walk the way back out on foot, by scenario, for each of the three party
  heroes. The doorway stays an enter doorway nobody of the camp
  asks for (`INTENT:`, D-061).
- **Step 12's `INTENT:`s stay** (seeing is not calling; a cap on bodies,
  none on waves), and whatever the waves slice added: read
  `docs/mechanisms/outposts.md` as it is on the day you start.
- **Never tag a `step20-*` scenario for gate E.**
- **The depot is Step 16's:** no wagon, no edit there.
- **e2e flakes on `main` today:** `h1`, `h2`, `t-grab-friend`,
  `s-break-free`, `t-throw-friend` fail some of the time and are under
  investigation (`handoff-prompts/step-5-e2e-flakes.md`). Re-run, report
  which failed and how often; never loosen a check.
- `git pull --rebase` before each push. Stop test servers by PID. If live is
  healthy on an older commit after a push, wait, don't revert.

## Yours, and not yours

**Yours:** `content/rooms/outpost.json`, `content/placements/outpost.json`,
`content/outposts/outpost.json` (once the waits above hold), re-times of
real-camp scenarios, `scenarios/step20-camp-*.json`,
`scripts/checks/step20-camp.ts`, `scripts/e2e/machine.ts` and its one call
line in `scripts/e2e.ts`, new `look` values for `breakable` (its check and
`src/client/draw/room-parts.ts`). Add these to the Step 20 row A proposed in
`docs/architecture.md`.

**Not yours:** A's files (ask A by message for any change to the machine's
rules or data shape); `content/recruits/**`; the strongbox's entry and
`content/heists/**` beyond one added prize; `src/sim/systems/outpost-*.ts`;
the courtyard (its columns 1-13 stay clear for a royal machine).

## Decided, and open

Decided by the owner: the D-numbers above. `DRAFT:`, yours to log: the room's
new length, what stands in the run, both break speeds, what the cache holds,
where the wagon stands, which wave brings the second one. Nothing waits on
the owner. For the owner to judge by playing, not asked: does ramming the
barricade earn the "OHH!"; is the run long enough to enjoy.

## Done

Each push: `npm run build`, `npm run check`, `npm run e2e` green; pushed to
`main`; `npm run check:deployed`, `npm run check:live`; `/debug/errors` read.
`docs/mechanisms/outposts.md` and `docs/mechanisms/machines.md` updated;
decisions-log entries; `docs/plan/core-loops.md` section 6 updated to what
landed; tell the orchestrator in plain words where the owner finds it. A
blocking question goes to the orchestrator by message and to
`docs/questions-inbox.md`; a flag to `docs/for-the-orchestrator.md`. Final
message: done or blocked, the commit.
