# The owner, playing: alarms do nothing he can see, nobody chases, nobody can be beaten for good

Brief for one builder. Written 2026-11-24 00:55 UTC by the orchestrator
(`session_017WiGzJzo6aZqH4kYxxJsiV`). **The owner's words, first-hand to the
orchestrator, ~00:50 UTC, playing the live game on a phone** (live was at
44a5153, started 00:05 UTC: the camp's waves, the town's whistle rows, the
throw-out rule switched on and power knock-loose were all in it):

> Alarms don't seem to do anything yet. Enemies can't be fully defeated, neither can heros, and enemies don't give chase if you are not right in front of them.

Four reports. Two have owners already, and your job there is evidence only:
"enemies can't be fully defeated" is Part 2 of
`handoff-prompts/owner-knocked-out-flies-off.md` (builder
`session_017WiGzJC6UCvT2PtVr2dn8v`); "neither can heroes" is Step 21
(`handoff-prompts/loop-risk.md`, builder `session_017WiGzJWYyVWtYnjFXHko1S`:
its rule IS live, thrown out after 2 knock-downs in a minute in the castle
street and 4 in the Bandit Camp, only with a bad guy in reach, and only in
those two places: the quarry has no defeat file). **The other two are yours:
alarms, and the chase.**

Read `docs/mechanisms/outposts.md`, `docs/mechanisms/npc-response.md` (or what
`docs/mechanisms/README.md` names for calls, alerts and sight),
`docs/mechanisms/heists.md` (sight bands are drawn as exactly `canSee`'s
box), `docs/plan/step-7.md` and `docs/plan/step-4.md` builder notes,
`docs/deliberate-designs.md` (every person walks slower than the slowest hero
runs, deliberately: a hero can always get away) first.

**Reports:** `send_message` to the session on the Orchestrator line of
`docs/questions-for-the-owner.md`: **first the audit table (step 1), within
the hour, before any fix**; then after each push. Notes: a new section
"Alarms and the chase, as played" in `docs/plan/step-4.md`.

## The task

1. **Play it as he did and write down what a player sees** (a phone-sized
   page, by touch, against a real server with delay added; screenshots or
   frame strips kept for each row). In every place with bad guys or guards:
   the castle street, the Bandit Camp, each quarry room and the depot. For
   each, a row: (a) stand in a bad guy's sight band and do nothing: who
   reacts, after how long, what is drawn and heard; (b) how far away, and at
   what heights, he first comes for you, and how far he follows before giving
   up (in tiles; behind him; above and below him; through a door); (c) trip
   each alarm there (the horn, the bell, the whistle): is the call seen
   (a gauge, a bark, a sound), does it finish, does anything arrive, where
   does it arrive, does it reach you, how long after; (d) let them beat you:
   how many falls, are you thrown out, where to; (e) beat one of them: what
   happens to him. Mark each cell: works and reads; works but a player cannot
   tell; does nothing. This table is the answer to "the owner should never be
   the one who finds an omission": send it before fixing anything.
2. **Alarms that are seen to do something.** From the table, for every alarm
   that "works but a player cannot tell" or "does nothing", make it read on a
   phone: the call is unmistakable while it runs (the town's whistle gauge and
   pips are another builder's, `handoff-prompts/loop-town-tiers.md`,
   `session_017WiGzHTLU6WYfsfoEFK4si`: do not duplicate them; tell it what
   your table found), what it summons arrives where the player is and is
   announced (the shared banner queue, `src/client/draw/banner.ts`), and a
   wave that arrives comes for the player. Known already: the depot's waves
   walk west and drop through the floor gap at columns 51-52 and stay there
   (`docs/plan/step-7.md`): that one belongs to Step 22's lead
   (`session_017WiGzFrf7N7ZgaqUyjs4Sz`, who owns the quarry's rooms): send it
   your rows for the quarry and do not edit the quarry.
3. **The chase.** Bad guys and provoked guards who have seen a hero come for
   him and keep after him: across the room, up and down the ledges a walking
   body can take, and (already built for town guards, two per door) through a
   door, until he is out of sight for a data time; one who loses him searches
   the last place he saw him before going back to his post. Today, by the
   owner's report, they act only when a hero is right in front of them. Find
   by measurement which it is: the sight box is too small or only forward
   (`canSee`), they see but do not move (`outpost-fight.ts`, `npc-act`
   behaviours), they move but give up at once, or they cannot path (no bad guy
   jumps, deliberately: read why before changing it). Fix the rule the
   evidence convicts; numbers are data per kind, `DRAFT:`, logged.
   **Keep:** every person slower than the slowest hero (a hero can always get
   away; say the measured margin after your change, for each roster hero);
   scripted states, never AI (fixed states, explicit transitions: seen →
   chasing → searching → returning); the on-screen cap; sight bands drawn
   exactly as `canSee` (if the box changes, the band changes with it); no
   reinforcements without a finished call (D-063): chasing is the ones who saw
   you, not help.
4. **Other steps' scenarios.** Changing who notices and follows will move
   pinned ticks in `step4-*`, `step7-*`, `step12-*`, `step16-*`, `step18-*`,
   `step19-*` (clean jobs depend on not being seen), `step21-*`. Count the reds
   before pushing and send me the list with your proposal (as the risk builder
   did); re-time only with the owner of each (the quarry's are Step 22's
   lead's).

## Decided

- Evidence first: the table, then one small push per cause, each with a
  scenario and its control and a phone e2e fact (by touch: seen from across
  the room, he comes; out of sight, he gives up and goes back).
- "Getting caught opens play": a chase must be escapable and worth escaping.

## Paths

Owns: the perception and chase rule (`canSee`'s box and the files that turn
sight into movement for bad guys and provoked guards: name them to me before
editing: `outpost-fight.ts` was Step 12's, closed; `alert-*` is the town-tiers
builder's), content fields for the new numbers, your scenarios, one e2e file.
Must not touch: the quarry's rooms and scenarios (Step 22), `defeat-*`
(Step 21), `machine-*` and the camp's room file (vehicles), the HUD plate.

## Done

`npm run build`, `npm run check`, `npm run e2e` green (the reconnect facts
`h1`/`h2`, `cantina-row` and the friend-throw facts fail some runs on `main`
and are being fixed elsewhere: re-run and report, never loosen); pushed; live
(`npm run check:deployed`, `npm run check:live`); the table updated to what a
player sees after; one line for the owner in plain words.

## Added 2026-11-24 01:10 UTC: what an alarm does, in the owner's words

**The owner, first-hand to the orchestrator, ~01:05 UTC, still playing:**

> Alarms should spawn more enemies of increasing strength that come in from the sides

This is now what "alarms that are seen to do something" (task 2) means, and
it comes before the chase (task 3) once your audit table is sent:

- **A finished alarm brings more enemies.** Every alarm in the game: the
  camp's and depot's horn, the town's bell and whistle. (Still only a
  finished call: D-063 is the owner's, and stopping the caller still stops
  it.) Today: the camp's horn walks rows in by its one entry
  (`outpost-wave.ts`, `content/outposts/`), the town's whistle walks rows in
  by both street doors (`alert-dispatch.ts`, `content/dispatch/`), the bell
  sends one guard, the depot's wave falls through the floor.
- **From the sides.** They come in from both sides of where the player is,
  left and right, so a player in the middle of a room sees them arrive at
  both edges of the screen and is caught between them: not from one door at
  the far end of a long room, and not appearing in view. `DRAFT:` your
  reading to measure and log: each row splits between the nearest way in on
  the player's left and on their right (a door, the room's edge, a marked
  entry point: add entry points as data per room where a room has one way
  in); where a room truly has one side, say so and choose with the room's
  owner. A hero must still be able to get out with both sides coming (the
  town-tiers builder measured that for the street; measure it again for
  each place you change, each roster hero, solo).
- **Of increasing strength.** Each finished alarm in a place brings a
  stronger row than the last: more of them, then tougher kinds (light
  fighters, then heavies, then the brute; guards, then the armoured guard,
  which has no sprite yet and ships on `guard`), as data rows per place; the
  last row repeats (doc 24: never an arbitrary maximum wave count) under the
  on-screen cap. The player can read which row is coming (the camp's bar,
  the town's pips: the town-tiers builder draws those; give the camp and the
  depot the same language, agreeing with it by message).
- **Announced.** A banner and a sound per row through the shared queue, so
  nobody wonders whether the alarm did anything.

Files: `outpost-wave.ts` and `content/outposts/` were the waves slice's
(finished, builders archived): they are yours now. `alert-dispatch.ts` and
`content/dispatch/` are the town-tiers builder's
(`session_017WiGzHTLU6WYfsfoEFK4si`): agree the "from the sides" rule with it
by message and let it make the town's edit, or take the file by agreement.
The depot and the quarry's rooms are Step 22's lead's
(`session_017WiGzFrf7N7ZgaqUyjs4Sz`): give it the rule and the data shape;
it places the entry points and rows there. The vehicles B builder
(`session_017WiGzEvHsdz7Z8fr6XuECe`) holds the camp's room file and wants a
wagon in a later row: agree with it before changing the camp's rows.
Scenarios with a control each: a finished call brings a row at both sides of
the hero; the second call's row is stronger than the first's; a stopped call
brings nobody; every roster hero gets out, solo, with the last row in.
