# Core loop 5, part 2: the town escalates: a guard's whistle, pips that follow you, help by both street doors (Step 4, its "rest")

Brief for one cold builder. Written 2026-11-23 by the orchestrator's drafting
agent, read at f4a3cc9 (`docs/plan/core-loops.md`, section 5, "Part 2, waits:
the town"; read it and its "Names the slices share" table first). The step is
`docs/plan/step-4.md`: read its top section, "What's decided", "Decided by the
lead" (under "Measure") and the last five handoff notes. Read
`docs/mechanisms/npc-response.md` (all of it: "Calling for help, the alert and
getting away" is the machine you extend), `docs/mechanisms/rendering-world.md`
("Banners", "The party plate", "Alert pips"), `docs/mechanisms/network.md`
("Traps"), `docs/mechanisms/outposts.md`, `docs/mechanisms/saves.md` and
`docs/mechanisms/scenarios.md` before writing anything.

**Reports:** `send_message` to the session on the Orchestrator line of
`docs/questions-for-the-owner.md`, after each push, with the commit. Notes:
`docs/plan/step-4.md`, a new "Builder notes" section at its end (it has none
yet).

**Small pushes, most visible first, each standing alone and fully checked.
Push 1 is the sim rule and its scenarios.** If you pass about 300k tokens
after push 2, report and stop: the orchestrator re-briefs push 3.

## The task, and why

The owner, 2026-11-23 ~18:30 UTC, first-hand, after playing on a phone
(`docs/vision.md`, "The measure"; `docs/plan/core-loops.md`, "The owner's
verdict"):

> Remember the original intentions for the game and make sure things align with it. I want to play it as I described it.
> There are no heists or stealth yet, no puzzles, no hidden places to explore, no characters to unlock, no escalating combats or chases, no power/item stealing,  no vehicle hijacking, no risk. Virtually everything described in the vision docs that would make the game genuinely fun to play is yet to be seen at all

**What a player gets.** *You see:* fight a guard who is after you in the
castle street and he stops swinging, puts a whistle to his mouth and a gauge
fills over his head for two seconds. Knock him off his feet and the gauge
empties: nothing was sent. Let it fill and a second pip lights at the top of
the screen and more guards walk in by both ends of the street, to where he
saw you. Again, and a third pip and a tougher row. Leave by a door and the
pips are still there in the next room, with the two guards who saw you go.
*Found by:* nobody is told: the first guard you hit back at shows the gauge,
and the gauge filling is the lesson. *Payoff:* a street fight that grows into
a last stand or a run across three rooms; a whistle stopped at the last
moment. *Risk:* each finished whistle makes getting away harder, and the pips
only go out by hiding and waiting.

**It moves no row of `docs/plan.md`'s table** (M3 stays 5 of 6; gate D already
passes). It is for the owner's "no escalating combats or chases ... no risk",
in the town, two rooms from the camp the waves slice is fixing.

The library (doc 11), the owner's decisions: **D-063** only "AN ACTUAL
COMPLETED CALL FOR HELP" brings "SCALING REINFORCEMENTS"; **D-066** "Calls/
signalers are INTERCEPTABLE"; **D-065** "Escalation is not omniscient";
**D-067**, **D-068** pursuit is hard to reverse and cools only by full
disengagement; **D-069**, **D-077** guards may follow between regions and "a
level transition never automatically resets pursuit"; **D-019** failure of
stealth "opens satisfying battles, last stands and narrow escapes, NOT an
automatic-reload punishment loop"; **D-055**, **D-062** no NPC AI; **D-093**
iPhone first. Doc 07, "Resistance escalation": "each response wave should add
a new toy". **Not decisions, so `DRAFT:`:** doc 27's whistle is "a suggested
reconciliation, not a new owner-approved implementation"; doc 26's ladder is
"finite illustrative design" ("count not owner-approved") and leaves OPEN the
tier count, the icons and "cross-zone wanted carryover".

## Measured for you (read at f4a3cc9; nothing was run)

- **The street today:** one guard, `street-guard`, pacing columns 37-42; the
  bell at column 24; three people in all (`content/placements/castle-street.json`).
  The room is 48 by 12 tiles of 16 px; its floor-level walk doors are
  `to-throne-room` at column 0 and `to-courtyard` at column 47, rows 9-10; the
  two player spawns are columns 3 and 5 (`content/rooms/castle-street.json`).
- **The alert:** 0 to 3 (`MAX_ALERT`, `src/sim/npc/alert.ts:66`), one per room,
  on a bodiless entity `~alert:<room>`. One line raises it (`alert.ts:98`,
  inside `raiseAlert()`), and one site calls that (`npc-call.ts:129`); the
  `INTENT:` at `alert.ts:81-85` says so in words. At 3, `raiseAlert` restarts
  the wait and emits nothing (`alert.ts:95-96`). It cools one level per 20 s
  unseen with no incident (`npcAlertCoolTime`, `content/tuning.json:21`).
- **Nothing more comes at 2 or 3:** `alert-respond.ts:91-102` only re-sends the
  guards already in the room. The mechanism doc lists it under "Not built yet".
- **A guard on duty never calls:** `npc-call.ts:77` skips anyone with
  `c.respond` (its `DRAFT:` at `:76` names "a struck guard whistling" as not
  built). The rule to reuse is at `:83`: a person calls again only when
  `dissonance` is above what they last reported; `npc-witness.ts:48` adds to
  it for each odd deed they perceive.
- **The bell's call is 2.5 s** (`npcCallTime`, `tuning.json:17`); the
  whistle's two seconds is the plan's number, not the library's.
- **Stopping him:** the guard's set has no `toughness`, so it is the default
  100, weight 40 (`tuning.json:40-41`, `:84-98`). By arithmetic from
  `attackWear`, not traced: flattened from fresh in 3 hits by the grappler
  (34) or the brawler (40), 5 by the flyer (22), 6 by the infiltrator (18), 8
  by the skirmisher (14). Out cold lasts 3 s (`flattenTime`).
- **Getting away:** guards walk at 40 px/s and list no `jump`; the slowest
  hero, the brawler, runs at 76 (`tuning.json`, the `INTENT` notes in the
  people's sets). At most 2 guards follow a hero through one door
  (`chaseCrossCap`, `tuning.json:58`; `src/sim/systems/chase-cap.ts`, Step
  12's). A guard hits every 0.8 s after a 0.4 s wind-up.
- **Someone with no placement entry never goes home:** `alert-respond.ts:123`
  stands them down where they are. `removeEntity` exists (`src/sim/world.ts:29`;
  `cantina-regulars.ts:65` is its one use).
- **The pips do not follow you today:** `src/client/draw/alert.ts:104` reads
  the alert entity of the page's own room, and a page is sent only its own
  room's entities (`src/server/game.ts:525-528`). Walk out of the street and they
  vanish though the number has not changed. They are drawn from (5, 5) in the
  top-left (`alert.ts:21-22`, `:108-135`; looks `alert-pip`, `alert-pip-off`,
  `bell-gauge` at `content/looks/ui.json:15-17`), where the party plate now
  also is (`src/client/draw/hud.ts`). **Not measured: whether the two overlap.
  Look at a screenshot at 844×390 and 390×664 before drawing anything.**
- **What is on `main` from the waves slice: nothing yet** (f4a3cc9 only claims
  it; `git log --oneline -- src/sim/systems/outpost-wave.ts` ends at a69ecf6).
  Check again before each push. `outpost-wave.ts:38-49` is the pattern for
  walking a row in: deterministic ids, `spawnBody`, a hand-made `c.npc`.
- **Checks that exist:** 21 `scenarios/step4-*.json`; 29 scenario files name
  `castle-street`; `scripts/e2e/fight.ts` (`fight-back`) has a phone punch the
  street guard by touch until he swings back.
- **No armoured guard is cut** (`content/sprites/` has `guard.json` only);
  `docs/mechanisms/asset-coverage.md:114` names P08's enemy sheet, row 4, as
  an unused armoured figure.

## What to build (`DRAFT:` throughout; decisions-log entries "Step 4: whistle", "Step 4: dispatch", "Step 4: pips")

1. **Push 1, the whistle and the dispatch, in the sim.** New
   `src/sim/systems/alert-whistle.ts` and `alert-dispatch.ts`, a new content
   kind `content/dispatch/<area>.json` with `src/content/kinds/dispatch.ts`,
   new numbers in `content/tuning.json` (additive).
   - **Who, when:** a responder in the `chase` phase who has perceived a hero
     do something more since his last report (the rule at `npc-call.ts:83`,
     for someone on duty). He stands, stops swinging, and blows for the
     whistle time under a progress count on his own entity (so every phone in
     his room gets it, as `c.ringing` does for a bell). Fixed states, no
     choosing: call it NPC response logic.
   - **Stopping it (D-066):** knocked out, grabbed or carried, or knocked off
     his feet, and nothing is sent; `call-stopped` with a `why`. He tries
     again after a wait once he is up and still has cause (the waves slice's
     "stopping a caller buys time"; the camp's `callAgain` is 6 s). Which of
     those stop it, and the wait: you measure and pick, logged.
   - **Finishing it** is a completed call like any other: `call-started`,
     `call-completed` (a contract with Step 7's detector, `alert.ts:57-61`),
     the same raise. Keep one raising line and one calling site: move
     `npc-call.ts:120-134` into one helper in `src/sim/npc/alert.ts` that the
     bell and the whistle both use, and widen the `INTENT:` words to "a
     completed call, by bell or whistle" in the same push (and its line in
     `docs/deliberate-designs.md` if it has one).
   - **The dispatch table is data:** per area, the doors help comes by
     (`to-throne-room` and `to-courtyard` for the street), a cap on people in
     the room, and a row of people per alert level reached. `alert-dispatch`
     reads `alert-changed` going up and walks that level's row in, split
     between the doors, each given `c.npc` with `home` the area and
     `c.respond` heading to the reported place (D-065: never to the hero). A
     row waits while it would pass the cap. Level 1's row is empty in the
     street: the placed guard answers, as today.
   - **The whistle is on only in an area that has a dispatch file,** so
     `test-street`, `test-shop` and the camp behave as they do now.
   - **When the alert is over, arrivals leave** by a door and are removed;
     placed guards go home as today.
   - **You pick, measure and log:** the whistle time (start at 2 s), the rows,
     the cap (the camp's is 8), what a finished whistle does at level 3 (the
     camp repeats its last row under its bound, `outpost-wave.ts:8-13`).
2. **Push 2, on the page.** The gauge over a whistling guard (the `bell-gauge`
   look; `src/client/draw/alert.ts:79-103` is the bell's). **The pips follow
   you:** a top-level world field (suggested `world.alerts`, level by area;
   add it to `core-loops.md`'s table in the same push), written by the
   server's world only when it changes, never deleted; the page draws the
   highest. Only the display travels: a guard in another room who has seen
   nothing still knows nothing (D-065). The pips sit clear of the party plate
   (`drawnHud()?.box`); a new pip queues one banner (`queueBanner`, key
   `alert:<level>`, words from the dispatch file, no digits).
   `drawn.alert` (`{ level, whistle }`) for the checks: one additive line in
   `src/client/main.ts` beside `:304-305`.
   - **A whistle away from home:** a follower who blows in the next room
     raises his home area's alert; where that row walks in is yours to pick
     and log (suggested: the door toward home, `doorToward()`).
3. **Push 3, a new toy and the phone.** A second guard kind for the last row
   (data only: a body, a tuning set slower and tougher than the guard's, an
   NPC kind of role `guard`; its id plain, its shown name data). Ask the
   core-loop art cut-outs builder (the Sessions line of
   `docs/current-directive.md`) for its sprite at the start of push 1; if it
   is not cut by push 3, the row ships with the `guard` sprite, logged. Then
   the phone fact and screenshots below.

**How it reaches a phone:** the whistle's progress and the arrivals are
entities of the room; the pips are a top-level world field, and the banner is
drawn from it changing; nothing new is on a player's own entity.

## Signal

- Scenarios `scenarios/step4-tier-*.json` in the real street
  (`placements: true`), each with a control watched to fail:
  `-whistle-brings-row` (alert 1, the hero hits on in the guard's view: one
  whistle completes, the alert is 2, the row's people are in the room and
  walk to the reported place; control: no dispatch file for the room, nobody
  comes); `-whistle-stopped` (the guard stopped mid-whistle: `call-stopped`,
  the alert still 1, no arrival; control: the hero stands back, it completes);
  `-no-whistle-unprovoked` (alert 1, the hero only stands in view: the guard
  swings, never whistles; D-063: seeing is not calling); `-both-doors` (a row
  of two or more: one by each door); `-cap-holds` (whistles allowed to finish
  for 90 s: people in the room never pass the cap; control: the cap off);
  `-pips-cross-a-door` (alert 2, the hero leaves by `to-courtyard`: the world
  field still says 2, and at most 2 guards cross; control: the field's write
  off); `-away-at-the-most` (alert 3, the room at its cap, **once per hero in
  `content/roster.json`, solo**: the hero gets out of the street, no blow
  lands after a tick you name, the alert cools to 0 and every arrival is
  gone; control: the arrivals' `runSpeed` above that hero's);
  `-cools-and-leaves` (arrivals removed at 0, `street-guard` back on his
  beat).
- `scripts/checks/step4-tiers.ts`, a real server and **two connections**: A
  reaches alert 2 in the street and walks to the courtyard: A's snapshots
  there still carry level 2 (A is never sent the street's alert entity); B, in
  the street, has the arrivals (control: the field's write off).
- `npm run e2e`, `scripts/e2e/tiers.ts` and its one call line in
  `scripts/e2e.ts`: the phone page, by touch, with no fight to win, starts
  from `fight-back`'s moves; the drawn record shows the whistle's gauge
  filling, then `drawn.alert.level` one higher and more guards in the room
  than before, then the same level after walking through a door (control:
  read before the whistle). Add it to `check:live` in a private world.
- Screenshots at 844×390 and 390×664: the gauge, three pips beside the plate,
  a row arriving at each door; under `docs/plan/step-4-shots/`.

## Traps

- **Seeing, a blow or rage never raises the alert** (D-063, D-075):
  `step4-rage-without-a-call` stays green untouched. A second line that
  raises, or a whistle that finishes instantly, is the bug.
- **A hero who cannot get away stops the push** (`CLAUDE.md`, "There is always
  a way out"). Before choosing the cap, probe a solo hero pinned between rows
  from both doors, for each hero. If one is stuck, lower the cap or the rows
  and report it: curing stun-lock inside the fight systems is Step 18's
  unbriefed slice B (`docs/plan/step-18.md`), not yours.
- **Do not spawn in a walk door or on the spawns:** a body standing in a walk
  door is carried out (`clearOfDoors`, `alert-respond.ts`), and columns 3 and
  5 are where players appear.
- **A page runs the sim too.** A top-level field written every tick by a
  page's own world overwrites the server's (`cantina-chase.ts:19-21`, its
  `INTENT:`). Write yours only where the alert entities are.
- **`step4-*` re-times are yours;** list each one you change and why, and
  keep its claim. If a `step3-`, `step11-`, `step12-`, `step14-`, `step18-`
  or `step19-` scenario goes red, stop and report: your change reached past
  the switch.
- **The pulse stays** (`alert-respond.ts:146`, Step 18): do not hold `attack`.
- **Guards who follow into the camp count against its bound of 8.** Do not
  raise `chaseCrossCap`.
- **Read new fields with a default:** a kept game holds worlds saved before
  them, and now arrivals too (`docs/mechanisms/saves.md`).
- **No digits in anything drawn** (`t-no-numbers`). Stop test servers by PID.
  If live is healthy on an older commit after a push, wait, don't revert.
  `git pull --rebase` before each push.

## Yours, and not yours

**Yours:** the new files named above; additive edits in Step 4's own
`src/sim/npc/alert.ts`, `npc-call.ts`, `alert-respond.ts`,
`src/client/draw/alert.ts`, `content/npcs/`, `content/characters/`,
`docs/mechanisms/npc-response.md`; additive lines in the shared
`content/tuning.json`, `src/sim/types.ts`, `src/client/render.ts`,
`src/client/main.ts`.

**Must not touch.** The waves slice's (`handoff-prompts/loop-waves.md`,
running now): `content/outposts/outpost.json`,
`src/sim/systems/outpost-call.ts`, `outpost-wave.ts`,
`src/sim/outpost/state.ts`, `src/content/kinds/outposts.ts`, anything
`hall-*`, `src/sim/hall/`, `content/hall/`, `src/client/draw/hall.ts`,
`step7-*` and `step12-*` scenarios. If its sent-to-where-seen or try-again
code is on `main` and fits, call it; if it needs a change to fit, message
that builder, never edit. The heist slice's `src/client/draw/banner.ts` and
`hud.ts` (call their exports) and `content/placements/outpost.json`.
`content/placements/castle-street.json` (the glints and heist slices'; your
people come from your own data). `chase-cap.ts`, `cantina-chase.ts`,
`fight-*.ts`, the impact systems, the depot.

**Out of scope:** the villain's own horn (D-070); finding a knocked-out
person; the camp's waves and the Hall; being thrown out (Step 21); guards in
other rooms reacting to the pips; the cantina's lock (D-088, built); new rooms.

## Decided, and open

Decided by the owner: the D-numbers above. `DRAFT:`, yours to log: that a
guard whistles at all and for how long, what stops it and when he tries
again, three pips, one level per call, the rows and the cap, both doors, that
arrivals leave, that the pips follow the party everywhere, the second guard
kind. Nothing waits on the owner. For the owner to judge by playing, not
asked: whether the street gets out of hand in a good way, and whether
getting away from three pips feels narrow rather than hopeless.

## Done

Each push: `npm run build`, `npm run check`, `npm run e2e` green; pushed to
`main`; `npm run check:deployed`, `npm run check:live`; `/debug/errors` read.
`docs/mechanisms/npc-response.md` updated ("Not built yet" shortened, the
whistle, the dispatch, the field); `docs/architecture.md`'s Step 4 path row
gains the new paths; decisions-log entries; `docs/plan/core-loops.md` section
5 updated to what landed. A blocking question goes to the orchestrator by
message and to `docs/questions-inbox.md`; a flag to
`docs/for-the-orchestrator.md`. Final message: done or blocked, the commit.
