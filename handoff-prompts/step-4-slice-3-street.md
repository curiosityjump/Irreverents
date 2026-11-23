# Step 4, slice 3 (cut down): people a player can actually meet

Brief for one cold session. Rewritten 2026-11-23 08:45 UTC by the Step 4
lead (`session_017WiGzG4WzuJfHAu3XWoUhc`). The step is
`docs/plan/step-4.md`. Self-contained: you do not need the design library
or `docs/vision.md`.

**Read first:** `docs/mechanisms/npc-response.md` (slice 1: people with
three moods, seeing, the rule tables, routines, things to use, the mood
marks). Everything you need already works; **this slice is data, a look
at a phone-sized page, and at most one line of code.**

**Budget and manner (the orchestrator's, after tonight's usage-limit
stop):** be done or cleanly stopped by **10:00 UTC**. Small pushes, each
finished and green by itself; nothing half-working on `main`; if you are
running out of time, stop after the last green push and say where you
are. From 10:00 UTC `main` takes only finished, verified work.

## 1 · The task, and the measure row it moves

The shopkeeper, the guard and the villain exist only in `test-shop`,
which no player can reach. Put them where the owner and a friend will
be in the morning, so that they **see people react**.

**Measure row: none moves.** Gate C already passes and gate D is not in
this slice. Say so in the commit. What it is for: the first thing of
Step 4 a player can see.

When done (or stopped), message the lead (`send_message` to
`session_017WiGzG4WzuJfHAu3XWoUhc`): "slice 3 at <commit>", and what did
not make it.

## 2 · The derivation, already done (measured on `main` at `2f634bd`, 08:43 UTC)

- **Where players are.** `content/game.json` still says `"startRoom":
  "graybox-hall"` (one 20×11 screen). Its own note says it becomes
  `throne-room` once the page's camera can follow a character through
  rooms wider than a screen (Step 1 / Step 3; not yours, and not there
  yet). `castle-street` is joined to `throne-room` by its west door and
  to nothing else, so **today nobody playing can reach the street.**
- **The server fills every room** when a world is made
  (`src/server/game.ts`: `populateRoom` for each room), so people placed
  in any room exist on the live game without more code.
- **`content/placements/`** has `graybox-hall.json` (Step 2's crates and
  dummies), `test-shop.json` (ours) and `throne-room.json` (Step 6's
  king). There is no `castle-street.json`.
- **The street:** 48×12 tiles; floor row 11, flat from column 1 to 46;
  players arrive at columns 3 and 5 or through the west door (column 0).
  Building 1 is a solid block at columns 10–17, rows 5–6, over open
  street. An enter doorway stands at column 28. Sight is 7 tiles. Step
  3's worker is still adding to this room (an east opening, a hiding
  place under building 1's overhang); no existing tile moves.
- `npm run check` is green; `npm run gates` prints 4 of 6 (A, B, C, F).
- `entity.c.roomHide` (Step 3's hiding places) is **not** on `main` yet
  (`grep -rn roomHide src` returns nothing).

### Push 1: the street's people

Create `content/placements/castle-street.json`: the shopkeeper, his
counter and three goods; the guard, pacing and turning at a post **more
than 7 tiles from the shop**; the villain with his loop. Suggested: the
shop under building 1's overhang (columns 11–16), the guard around
columns 36–44, the villain resting near column 20–22. Keep columns 1–6
and the doorway at column 28 clear.

**The villain's loop** (`DRAFT:`, already in `docs/decisions-log.md`; do
not log it again): he robs the shop (the shopkeeper happily opposes
him), walks off, comes back and buys politely (the shopkeeper is
distressed), robs properly (relief), then rests. Pace it so someone
standing in the street sees one full round in about a minute. Give the
street its **own** routines: do not touch `test-shop`'s.

One scenario, `scenarios/step4-street-people.json`, `"placements":
true`, no gate tag: a hero walks in from the spawn; over one round of
the villain's loop the shopkeeper goes 1 → 2 → 1 and `opposed` happens;
then the hero takes goods in the shopkeeper's view (mood 2) and buys
(mood 1).

### Push 2: the same thing where players are tonight

At the end of push 1, read `content/game.json` again.

- If `startRoom` is **still `graybox-hall`**: add to
  `content/placements/graybox-hall.json` (Step 2's file: **append
  entries only**, change none of theirs) a shopkeeper with a counter and
  two goods, placed clear of the two spawn tiles and of Step 2's crates
  and dummies, and, only if there is room for his walk, the villain with
  a short version of the loop. `DRAFT:` a stand-in until the kingdom is
  the start; add one entry to `docs/decisions-log.md` ("a shopkeeper has
  set up in the grey test hall so there is someone to meet"; to change
  it: delete the entries). One scenario, `step4-hall-shopkeeper`: take
  in view → mood 2, buy → mood 1.
- If it has become `throne-room` or `castle-street`: skip push 2 and say
  so.

### Push 3, only if `c.roomHide` has landed and there is time

One line in `src/sim/npc/sight.ts`: a body with `entity.c.roomHide` is
not seen (tolerate the component not being declared). A scenario and a
control. Otherwise leave it and say so in `docs/for-the-lead.md`.

## 3 · Traps

- **Other steps' scenarios run in these rooms**, some with
  `"placements": true` (`step2-hit-room-placements` in `graybox-hall`;
  Step 3's `step3-*` in the street and throne room). Run `npm run check`
  straight after adding a placements file. If one of theirs fails, move
  your people; do not edit their scenario or their entries; if moving
  does not fix it, drop that room and tell the lead.
- **Bodies pass through each other** but a person standing on a spawn
  tile or in a doorway is in a player's face: keep clear.
- **A hit knocks a person out** (Step 2's default toughness) and Step
  2's dummies and crates can be thrown at them. That is the game
  working; do not armour anyone.
- **Scenario ticks in `test-shop` are pinned.** Do not change the three
  people's walk numbers, the `hero` tuning set or `test-shop`'s
  routines.
- **Step 3's worker is editing `castle-street.json` and Step 1's the
  page and server.** You edit neither. Rebase before every push and
  re-run `npm run build && npm run check`.
- **A push that touches `content/` or `src/` deploys:** about a minute
  of downtime and a reset of the live world, while other steps are also
  pushing. Three pushes at most.
- **"Use" on a second player's phone may misfire** until Step 1's next
  push (a quick tap between two network updates can be missed, and
  state the server writes on a player may not survive that player's
  next update). If you see it, it is not yours to fix: write what you
  saw in `docs/for-the-lead.md`.

## 4 · Out of scope

- Calling for help, the bell, the area alert, responders, following
  through doors, gate D: slice 2, held.
- `content/game.json`, every room file, `src/client/**`, `src/server/**`,
  Step 2's verbs and numbers, Step 6's king.
- New moods, rules, behaviours or marks. If a rule looks wrong in the
  street, tell the lead; do not change it.

## 5 · Decided, and open

**Decided:** who goes where, roughly; the villain's loop; the stand-in
shopkeeper in the test hall if the start room has not moved.

**Open, yours to decide without asking** (decide, `DRAFT:`; log only
what a player would see and is not already logged): exact columns, the
routines' timings, whether the villain fits in the test hall.

## 6 · How it gets verified

- `npm run build && npm run check`, by exit code, after the final
  rebase of each push.
- **A failing control for each new scenario**, watched once and named
  in the commit: for example remove the villain's `buy` row from the
  expectation table in your working copy and see `step4-street-people`
  name the broken fact; restore.
- **Rung 5, at phone size, which nobody has done for this step:** build
  and start the server locally; Playwright, an iPhone-sized landscape
  page (844×390, touch on). For the room players start in: touch the
  on-screen controls to walk to the goods and touch **Use** to take
  one, then to buy; screenshot at rest, in mood 2, after the purchase.
  **Look at the images** and say in the commit what you saw, whether
  the `?` / `!` marks and the barks are readable at that size, and
  whether a Use control was on screen and worked by touch. For the
  street (unreachable by play): make it the start room **in your
  working copy only**, screenshot one round of the villain's loop,
  revert before committing. `npm run e2e` exists now; run it before
  each push since you add things the page draws.
- After each push: `npm run check:deployed` exits 0, and
  `npm run check:live` still passes.

## 7 · Definition of done

- Push 1 and push 2 (or its skip) on `main`, green, deployed, live
  checks passing; scenarios with their controls watched; the phone-sized
  look done and described.
- SOP phase 6: a short section in `docs/mechanisms/npc-response.md`
  (where the people are now, the stand-in and when to remove it);
  `DRAFT:` notes in the placements files; the decisions-log entry for
  the stand-in.
- Do not delete this brief or edit `docs/plan/step-4.md`.

## 8 · Where your questions go

- **Blocking:** `send_message` to the lead,
  `session_017WiGzG4WzuJfHAu3XWoUhc`, and keep working on what does not
  depend on the answer. If only the owner could answer: decide,
  `DRAFT:`, log, continue.
- **A flag or finding:** append to the end of `docs/for-the-lead.md`
  under your own `###` heading; never touch anyone else's entries.
- **Something only the owner can supply:** `docs/questions-inbox.md`.
- **Your final message:** done or stopped, the commit, nothing more.
