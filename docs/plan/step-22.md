# Step 22 — One stage to clear: an outpost you get through without dying, and a victory screen

**Reference.** Plan step; its status line is in docs/plan.md.

## Why

**Owner, 2026-11-24 ~00:30 UTC, first-hand to the orchestrator
(`session_017WiGzJzo6aZqH4kYxxJsiV`), after an evening playing the live game
on a phone:**

> Let's get one level where there is a whole outpost you need to navigate though without dying. Lots of enemies, alarms, and real way to lose/die, which pushes you back to the entrance to start over. Needs a satisfying victory screen at the end. Stage cleared, with a star rating and some stats (time to clear, enemies defeated, etc)

The same evening, playing (`docs/current-directive.md`, "Status"): *"i seem to
be invincible as hero... and enemies collapse but never die"*. Everything the
core loops built is a system in a place; nothing yet is a run with a start, a
way to lose, an end and a result. This is that, once, in one level.

**The owner, ~00:50 UTC, playing the live game (relayed by the orchestrator):**

> Alarms don't seem to do anything yet. Enemies can't be fully defeated, neither can heros, and enemies don't give chase if you are not right in front of them.

The quarry has no defeat file today (Step 21's rule is live only in the castle
street and the Bandit Camp), the depot's waves drop through the floor gap, and
nobody chases. The chase rule is being fixed engine-wide by
`handoff-prompts/owner-enemies-chase-alarms.md` (it sends this step its quarry
rows, and does not edit the quarry); enemies staying beaten is Part 2 of
`owner-knocked-out-flies-off.md`. **So the first push makes "you can lose here"
true in the quarry.**

**The owner, ~01:05 UTC, playing (relayed by the orchestrator):**

> Alarms should spawn more enemies of increasing strength that come in from the sides

In the stage, each finished alarm brings a row in at both sides of the player.
Each row is stronger than the last (more bodies, then tougher kinds), is
announced, stays under the cap, and the last row repeats. The rule and its data
shape are built engine-wide by `session_017WiGzF31gfYgeWNMA7rnEL`
(`handoff-prompts/owner-enemies-chase-alarms.md`). This step places the entry
points and rows in the quarry's rooms, and fixes the depot's floor-gap fall.
The data shape is agreed by message before either side writes it.

**The owner, ~01:20 UTC, playing (relayed by the orchestrator):**

> Heros should have hearts which can be lost. Once all heros in the party are out of hearts, that's a game over (back to cantina)

This is decided in `docs/plan/step-21.md`, "Hearts" (Step 21's builder builds
it). For this stage, dying means the party running out of hearts. Until the
owner answers the orchestrator's question, the stage sets its own game-over
place (`DRAFT:`): its entrance, hearts full, the stage started over. "Tries" on
the victory screen become game overs, and hearts left is a statistic and a star
condition. Push 1's defeat file (thrown to the road's entrance) still lands
tonight, so the quarry can be lost at all before hearts arrive.

## Goal

A player walks into one outpost level and knows it is a stage: where it
starts, that they can lose, and where it ends. Inside are a lot of enemies and
more than one way to raise an alarm; raise it and more come. Get beaten and
you are back at the entrance and the stage starts over. Reach the end and the
game stops to say so: STAGE CLEARED, a star rating, and what you did (time to
clear, enemies defeated, and more). Then you are back in the world with the
result kept and shown on the level's sign. Two friends can run it together;
one player can clear it alone; every button is a touch on a phone.

## What's decided (by the orchestrator, from the owner's words; each `DRAFT:` is logged in `docs/decisions-log.md` by whoever builds it)

- **The level is the quarry** (`content/levels/iron-quarry.json`: the road,
  the ridge, the tower, the pit, the cave and the depot, off the courtyard's
  doorway; Step 16, closed, `docs/plan-archive.md`): it is the one place that
  is already a whole level to get through (a main way of about 12 screens,
  bad guys in five rooms, a toll, a depot with a lookout, a horn, patrols and
  a hoard, quiet routes and escapes), and nobody is building in it tonight
  (the camp has three builders in it). `DRAFT:` the other answer is the
  Bandit Camp once the vehicles slice has lengthened it.
- **A stage is data** (a new content kind, e.g. `content/stages/<id>.json`):
  its level, its entrance (the room and door a beaten player returns to), its
  end (a place in the last room), what counts for each statistic, and the
  star thresholds. Adding a second stage later is one file. The engine knows
  stages, not the quarry.
- **Losing.** The owner asked for "real way to lose/die, which pushes you back
  to the entrance to start over". Step 21's rule (N knock-downs in a window
  with a bad guy in reach, then seized and thrown out; `content/defeat/`,
  `docs/plan/step-21.md`, its builder `session_017WiGzJWYyVWtYnjFXHko1S`) is
  the way to die: give the stage's rooms a defeat file, do not write a second
  rule. In a stage the throw lands at the stage's entrance, and **the stage
  starts over**: its people back at their posts and whole, its alarms down,
  its doors, breakables and prizes as they were, the run's clock and counts at
  zero, the count of tries one higher. `DRAFT:` with friends, a beaten player
  is back at the entrance at once, and the stage starts over only when no
  player is left inside it (solo: at once). What a player found for good (the
  level's pieces, a power source discovered, a recruit) stays found.
- **This is the owner's own exception to D-019** ("NOT an automatic-reload
  punishment loop") and to `CLAUDE.md`'s "getting caught opens play", for a
  stage he asked for by name: an alarm in the stage still opens a fight or an
  escape, and only being beaten restarts it. Outside a stage nothing changes.
  Vision Partner has his words; do not widen it to the rest of the world.
- **Lots of enemies, and alarms that matter.** More bad guys than Step 16
  placed, of every kind that has a sheet, placed so each of the level's rooms
  asks something different; more than one caller and more than one signal; a
  finished call brings a wave that reaches the player (today the depot's
  waves walk west and drop through the floor gap at columns 51-52 and stay
  there, `docs/plan/step-7.md` builder notes: fix it here). The on-screen cap
  on bodies stays. The quiet routes stay: clearing it unseen is a way to
  play, and worth more.
- **Enemies can be beaten for good within a run** ("enemies defeated" is one of
  the owner's statistics): that rule is being built now as Part 2 of
  `handoff-prompts/owner-knocked-out-flies-off.md` (builder
  `session_017WiGzJC6UCvT2PtVr2dn8v`). Use it; do not write another. Until it
  lands, count knock-outs by a credited player, as the Hall's detector does.
- **The end is a place you reach** at the far end of the depot, seen from a
  distance as the goal (`DRAFT:`; carrying the hoard out is a statistic and a
  star's worth, not the condition, so a player who fights through and one who
  sneaks through both finish).
- **The victory screen.** STAGE CLEARED, large; one to three stars, shown one
  at a time with a sound each; then the statistics, each counting up: time to
  clear, enemies defeated, alarms raised, tries, and whether nobody noticed;
  the hoard carried out if it was. A Continue button under the thumb (`INTENT:`
  there is always a way out: the screen never holds a player; with a friend
  each player dismisses their own). It is a screen for a result: combat keeps
  no numbers over anyone's head (D-020). Art from the approved sheets (P07's
  UI atlas, P05's HUD boards, P04's Hall atlas; `docs/mechanisms/asset-coverage.md`);
  a star with no source is a `DRAFT:` stand-in and a missing-list item (tell
  Vision Partner). The letters: the game has no pixel font yet (MA-02): use
  what the banner queue draws today.
- **Stars are data:** three thresholds per stage, measured from real runs of
  the level by script (a slow clear, a good one, a best one), never guessed.
  `DRAFT:` one star for finishing; two for under a time or with few tries;
  three for that and unseen or with no alarm finished.
- **The result is kept** with a kept game and shown on the level's entrance
  sign and menu row (Step 14 slice A drew those): best stars and best time.
- **Found without being told:** the entrance sign says it is a stage; the
  first room shows the first bad guy and the first signal before either sees
  you; the end is visible before it is reachable.
- **Solo is never locked out; every roster hero can finish.** Measure each of
  the five (the brawler cannot get past the camp's entry step today,
  `docs/plan/step-21.md` "Push 1": check the quarry for the same). A hero who
  cannot get through gets a way, not a notice.

## Open (the lead decides, `DRAFT:`, logged; nothing waits on the owner)

- How many bad guys per room, the wave rows, where the callers stand.
- The star thresholds and which statistics show.
- Whether the run's clock stops while the party plate or the menu is open.
- What a second player joining mid-run does to the counts.

## The signal (re-runnable)

- Scenarios `step22-*` in the real rooms, each with a control: beaten in the
  stage, the player is at its entrance and the stage is as it began (control:
  the stage file switched off, they are thrown out by Step 21's rule and the
  stage is as they left it); with a friend inside, the stage does not start
  over; the end reached raises one `stage-cleared` event whose statistics
  equal what the scenario did (time in ticks, enemies defeated, alarms,
  tries); the stars follow the thresholds at each edge; a wave called in the
  depot reaches the hero; each roster hero gets from the entrance to the end
  alone, by a script that fights and by one that sneaks.
- A real-server check with two connections: both pages get the event and
  their own screen; one dismissing it does not dismiss the other's; a kept
  game keeps the result across a server rebuilt on the same store.
- `npm run e2e`, a phone-sized page by touch: walk in, be beaten, be at the
  entrance with the stick moving the hero; a scripted clear shows STAGE
  CLEARED with its stars and statistics drawn inside the phone's safe area,
  and Continue returns the stick. Screenshots at the e2e's three phone sizes
  committed under `docs/plan/step-22-shots/`.
- `npm run gates` unchanged or better; `npm run check:live` holds the same
  phone fact in a private world.

## Stopping condition

The signal passes on `main` and live, and the lead has looked at the phone
screenshots of the whole run and the victory screen. Whether it is fun, hard
enough and satisfying is the owner's, by playing.

## Owns

`content/stages/**` and its kind; `src/sim/systems/stage-*.ts`;
`src/client/draw/stage*.ts`; `content/rooms/quarry-*.json`,
`content/levels/iron-quarry.json`, the quarry's outposts, decor and
scenarios (`step16-*` are this step's to re-time when its placements move:
count them first); `content/defeat/` files for the quarry's rooms (the kind
and the `defeat-*` systems are Step 21's: ask its builder for a change);
`scenarios/step22-*`; `scripts/e2e/stage.ts`. Shared files (`src/client/main.ts`,
the entrance sign and menu rows of Step 14, the store) by additive edits,
telling the owner named in `docs/architecture.md`. Must not touch: the Bandit
Camp, the castle street, the undercroft (builders are in each tonight).

## Briefs

- `handoff-prompts/step-22-stage.md` (lead, 2026-11-24): five pushes for one builder: lose in the quarry and the waves reach you; a stage and starting over; the end, the result and stars; the victory screen; more enemies and found-without-being-told.

## Builder notes

### 2026-11-24, Step 22 builder (`session_017WiGzHD6TvY2XxEG4B3rJU`), push 1: you can lose in the quarry

- **The depot's waves: measured, not shipped.** A wave walking west from
  column 61 drops through the dip (row 14, columns 51-52) and stands in the
  pocket for ever (traced, tick 600 on); a hero punched west on the far yard
  lands there too. Of Step 7's three fixes: filling or narrowing the gap takes
  away the strongroom's crawl (and a fighter is 14 px wide: a one-tile gap
  still drops it); moving the entry west drops waves into the shaft (columns
  42-44). A one-tile kerb at row 13, column 53 worked (every `step16-*` and
  `step7-*` unchanged; scenario and control kept in my scratch as
  `step22-wave-reaches-hero`), but Step 9's `step9-fades-then-source`
  (landed during this push) has its grappler walk west over the dip, and the
  hop over a kerb puts it past its 80-130 tick window; no earlier jump fixes
  it. So push 1 ships only `leaveCold` 5 / `leaveIdle` 10 (idle waves walk
  off and the bound frees), and the wave reaches the hero in push 5 with the
  chase builder's entries on both sides of the player. Asked of the Step 9
  builder whether it minds a re-timed jump if the kerb is still wanted then.
- **Being beaten in the quarry is uneven:** the road's heavy, the ridge's
  brute and the depot's far yard each knock a still hero off a ledge or into
  a dip out of reach after one fall, so the throw-out comes mostly where the
  floor is flat (the depot's yard sections, the tower). Push 5's placements
  should put seizers where the floor holds the fight.
- **No banner for `thrown-out` on the page yet:** Step 21's
  (`session_017WiGzJWYyVWtYnjFXHko1S`, asked by message). The throw itself
  is seen: the hero lands at the road's doorway.

### Lead review, push 1 (973968f), re-run at 082380b

`npm run build` ok; `npm run check` ok, with `step22-beaten-to-entrance` passing.
Its control, run by me (`content/defeat/quarry.json` set to `"on": false`),
fails with 6 problems. `npm run gates` is 6 of 6, and `npm run check:deployed`
says live is running it. I didn't run e2e (the builder's run had every quarry
fact ok; h1/h2 failed on reconnect, a flake it already knew of). Still open:
the depot's waves still never reach a hero, now owed in the next depot push,
together with the wings' move to [38, 18]. And no banner yet for being thrown
out; that is Step 21's.

### Push 2: a stage, and starting over

- `content/stages/iron-quarry.json`, kind `src/content/kinds/stages.ts`,
  `src/sim/stage.ts` (`restoreStage`), `src/sim/systems/stage-run.ts`; the
  home copy is left out of snapshots by one line in `src/server/game.ts`.
  `docs/mechanisms/stages.md`.
- **People are restored by my own home copy, not `beaten.ts`'s
  `restorePeople`:** it was not on `main` when push 2 was built (checked
  `origin/main` at push 1's landing). Switch when it lands; the brief's
  "don't write a second restore for people" is owed then.
- **Old kept games:** the home copy is built from the placements as a fresh
  world places them, the first tick a stage is seen, so a saved game made
  before push 2 also restores to the files' first state, not to whatever it
  held when push 2 arrived.
- **Not checked by a scenario:** a friend who walks out after the other was
  beaten (the start-over then happens as they leave); the network trap (a
  restore runs only with nobody but the beaten inside, so no page draws
  those bodies at that moment; push 4's e2e looks at it on the phone page).

### Handoff from the first builder (`session_017WiGzHD6TvY2XxEG4B3rJU`), for a cold successor

- **Push 2 landed (d6acfdb) before the lead's 01:34 UTC "don't start push 2"
  reached me** (messages arrived ~20 min late). It restores people with its
  own home copy (`src/sim/stage.ts`), which the brief says belongs to
  `beaten.ts`'s `restorePeople`. The lead decides whether to keep it until
  `restorePeople`/`holdReturns` land or to `git revert d6acfdb`; reverting is
  clean (new files, plus one line each in `src/server/game.ts` and
  `scripts/lib/room-controls.ts`).
- **Traps hit:** `docs/decisions-log.md` (and some screenshots) are
  skip-worktree in a `blob_limit_kb` checkout: not on disk at all
  (`docs/spawn-failures.md` has the command). It conflicts on every rebase
  because everyone appends to its end; keep both sides. Never write files into
  `src/` or `content/` while `npm run check` runs: its script checks rebuild
  from the working tree and fail on half-written work. `main` moves every few
  minutes: rebase right before pushing.
- **The kerb is approved:** Step 9's builder agreed (01:23 UTC) that
  `step9-fades-then-source` may be re-timed for the kerb at [53, 13]
  (grappler started further west), every claim kept; the wings' move to
  [38, 18] goes in the same depot push. The kerb's scenario is described in
  push 1's notes above (the grappler at column 55 striking west, the flyer
  seen at the door; control: kerb removed).
- **Tools:** `node scripts/run-some.ts <regex>` runs only matching scenarios
  (seconds, against `npm run check`'s ten minutes); `node scripts/trace.ts`
  traces one.

### Lead review, push 2 (d6acfdb), re-run at fba6980

`npm run build` and `npm run check` are ok: all three `step22-*` scenarios
pass. The control (`content/stages/iron-quarry.json` set to `"on": false`)
fails `step22-restart-restores` with 4 problems, as it should. `npm run gates`
is 6 of 6. **Kept, although it puts people back with its own copy of where
they started, `stageHome`**, which the brief ruled out. The push is live and
green, and it is the start-over the owner asked for. Reverting it would take
that away while `restorePeople` isn't on `main`. `DRAFT:` it is owed a switch
to `beaten.ts`'s `restorePeople` and `holdReturns` once they land, keeping
`stageHome` only for what `restorePeople` doesn't cover. A cold builder does
this, in the next push after they land. Not checked: a friend walking out
after the other is beaten, and how a restore looks on the page (push 4's e2e).

### Push 3a: the end, the result, the stars (builder `session_017WiGzJb4az7buiHeYEH77B`)

- **Split in two.** 3a (this): `stage-cleared` with its statistics, the
  stars, the best kept and shown. 3b (next): the ten hero runs
  (`step22-each-hero-{fights,sneaks}-{hero}`) and the three threshold runs;
  the star times stay at the push-2 placeholders (good 600 s, best 300 s)
  until 3b measures them, and `step22-stars-edges-*` move with them (their
  seeded `started`).
- **Statistics' sources, as logged:** defeated = distinct people of the
  stage flattened with `by` a played body (the Hall's rule); alarms =
  `outpost-call-completed` of its outposts + town `call-completed` in its
  rooms; unseen = no npc of `side: "bad"` in its rooms ever `canSee` a
  played hero (heist-cargo's test). **Doubt for 3b:** the road's toll-keeper
  is `side: "bad"` and stands on the main way; if every route is seen by
  him, unseen never happens in the quarry. Then either a route past him
  or leaving tolls out of "unseen" (a `DRAFT:` either way).
- **Not on the sign: the time.** `levels.md`'s `INTENT:` "no digit
  anywhere (`t-no-numbers`)" covers the game picture; the sign shows the
  best stars only and the menu row (HTML) the stars and m:ss. Logged.
- **Shots** (a seeded best, page-side, for the picture only):
  `step-22-shots/push3-sign-best-sideways.png`,
  `push3-menu-best-upright.png`. Upright, the courtyard's camera cuts the
  quarry's sign at the left edge: as before this push (the sign is as wide
  as its name).
- **Owed still:** (a) `restorePeople`/`holdReturns` and (b) the
  `game-over` event are not on `main` at 85cbd35; (c) the kerb and the
  wings' move are not done.
- **(a) done in the next push:** `defeated` (beaten for good) now counts,
  not knock-downs (cleared-stats re-scripted: three knock-outs at 208,
  568, 928, clear at 1259; star edges moved with it); `restoreStage` calls
  `restorePeople` first and keeps `stageHome` for the rest. **Not
  scenario-checked:** a gone bandit put back by a start-over (no script
  gets a hero beaten after a defeat for good yet; 3b's fight runs will).
  **The hold is held back:** `holdReturns` on the stage's rooms while a run
  is on breaks `step5-beaten-come-back` (the beaten builder's: its depot
  bandits come back 90 s after the hero walks into the tower, also a stage
  room). Settled the same hour: the beaten builder moved it to the camp
  (400d8ca) and the lead ruled "hold all the stage's rooms"; the hold and
  `step22-beaten-stay-beaten-in-a-run` (control watched failing: stage off,
  `defeated-back` at 6532) land in the same push.

### Lead review, push 3a (d529a1b), re-run at e5f6383+

- `npm run build` and `npm run check` are ok: all nine `step22-*` scenarios pass, including the cleared-stats run and five star edges.
- Control, run by me with the stage set to `"on": false`: `step22-cleared-stats` fails, as it should. No `stage-cleared` event, and the state is null.
- `npm run gates` is 6 of 6.
- Looked at both screenshots:
  - the sign shows the quarry's best stars, 2 of 3 lit, inside the sign board;
  - the menu row shows the stars and 1:15 on the upright phone.
- Open, and now the builder's to settle:
  - The star times are placeholders until push 3b's hero runs.
  - "Unseen" counts the toll-keeper. If no sneaking route can pass him unseen, leave him out (`DRAFT:`). An unseen clear has to be possible: it is the owner's "zero-alarm infiltration".
