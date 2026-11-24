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
  Holders: builders 1-6 archived at their limits; the seventh from 12:05 UTC (see the brief's top block).

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

### The depot push (d): measured, not shipped (builder `session_017WiGzJb4az7buiHeYEH77B`, stopped at ~320k tokens)

For the next builder, all measured on `main` at 6edd8be:
- **Entries that work.** In `content/outposts/quarry-depot.json`, after
  `"entry"`: `"entries": [[13, 13], [20, 13], [33, 13], [40, 13], [49, 13], [55, 13], [61, 13]], "entryAway": 6`
  and an `announce` row. Each stretch of the yard has entries, cut by the
  stack (14-17), the shaft (42-44) and the dip (51-52), so no wave has to
  cross a gap. **No entry on the west stretch's door side:** at [2, 13] a
  wave fighter walked out through the tower door; at [4, 13] one landed on
  top of a hero seen at column 5 (`entryFor` falls back to the farthest
  entry when none is `entryAway` off).
- **Scenario `step22-wave-reaches-hero` (draft).** `step7-waves-reach-the-hero-depot`'s
  flyer and its walk-in (inputs 0-3 and 181-201, x 1). Then she attacks
  every 24 ticks from 205 to 900, standing her ground against patrol 1.
  Result: wave 0 at tick 381 from column 13; both wave fighters near her by
  about 530 (x 105 and 123: widen the `people-at` x to about [54, 130]);
  her hits land on both at 520.
  Control watched failing: with `entries` removed there is no wave body
  near her and no hit.
- **The blocker: `step16-caught-fight`.** The first wave now reaches the
  grappler at about 551 and knocks patrol 1 out of her grip. The second
  call starts around 743, so the 761 throw into the mid-call lookout no
  longer happens. Every other `step7-`, `step16-`, `step22-`, `step9-`,
  `step14-`, `step5-` and `step19-` scenario passed with the entries. Tried
  and failed: throwing patrol 1 at the wave (520-540) and grabbing again
  (690-730) before the 761 throw. The claims need a real re-route, for
  example knocking the wave down first or another body to throw. Never
  weaken them: the scenario's premise (waves never reach you) is what the
  owner asked to change.
- **Not started:** the wings' move to [38, 18], with
  `step9-fades-then-source` re-routed (Step 9's notes). The kerb at
  [53, 13] looks unneeded with these entries, since no wave walks west
  across the dip unless the hero is seen in the far yard.
- **Item (b), unblocked (lead, 04:06 UTC):** Step 21's game over is on
  `main` (`gameOver` in `content/defeat/quarry.json`,
  `step21-heart-game-over-quarry`). `stage-run.ts` still listens only for
  `thrown-out`: also start the stage over on the quarry's `game-over` event
  (hearts back full), with a `step22-*` scenario and control; then tell the
  hearts builder (`session_017WiGzG7mhviEaxroo5GvBv`) so it can switch the
  quarry's throw off.
- **Then 3b:** the ten hero runs and the measured star times.
### The depot push (d), shipped (builder `session_017WiGzEsUx1mHyijtCDT1gt`)

- The previous builder's entries, as measured: `entries` on every stretch,
  `entryAway` 6, and an `announce` row (`DRAFT:` words). The kerb at
  [53, 13] is not placed.
- `step22-wave-reaches-hero` (the flyer at column 5, swinging every 24
  ticks): wave 0 at 381 from column 13, a wave body within x 40-150 at 560,
  her swing lands on `quarry-depot:w0:0`. Control watched failing (no
  `entries`: nobody near her, no hit).
- **`step16-caught-fight` re-routed, every claim and window kept:** holding
  patrol 1, the grappler hops onto the low ledge (columns 3-4, row 12) and
  up to the high one (columns 5-6, row 10). The wave can't reach her there
  (it mills about below and punches itself), and the lookout can't see her.
  At 715-750 she walks off the ledge's east end into its view; its second
  call starts at 756, and the throw at 761 knocks it out at 764 and breaks
  the post at 773. Walk-off ends from 746 to 755 all pass. The low ledge
  alone doesn't work: a wave fighter knocked into her there dropped the
  patrol into the tower door. Control re-run: without the throw the call is
  stopped only at 920, by the scuffle, and the post stands.
- `npm run check` green, gates 6 of 6.

### Item (b), the stage starts over on the game over (builder `session_017WiGzEsUx1mHyijtCDT1gt`)

- `stage-run.ts` also counts a `game-over` whose `room` is a stage room:
  every player it moved goes in `pending`, so the stage starts over on that
  tick. The thrown-out path is kept, so whichever of Step 21's two rules is
  on, the stage starts over.
- `step22-restart-on-game-over` uses `step21-heart-game-over-quarry`'s set-up,
  with the grappler at column 55. At spawn 2 (column 60) the hero stands
  inside the end box and clears the stage at tick 0. Game over at 567, then
  `stage-restarted` tries 1 on the same tick. Both controls were watched
  failing: the pre-change code, and the stage `on: false`.
- Flag, not edited: `step16-caught-escape`'s `proves` still says the first
  wave "walks in at the far east end". Since the depot push it comes in at
  column 13, but its claims all pass.

### Push 4: the victory screen (builder `session_017WiGzEsUx1mHyijtCDT1gt`)

- `src/client/draw/stage.ts`, plus additive edits to `main.ts`, `render.ts`,
  `index.html` (`#stage-continue`) and `audio/index.ts` (`cue`). The writeup
  is in `docs/mechanisms/stages.md`, "The victory screen".
- **Lead, please look at:** `step-22-shots/push4-stage-cleared-{upright-390x664,sideways-667x375,sideways-844x340}.png`
  and `push4-stage-mid-count-upright.png`.
- **Not verified, owed:**
  - The e2e shows the screen page-side (`irreverents.stage.show`, the same
    function the server's event reaches). Nothing walks the whole quarry to
    a real clear on a page. "Both pages get the event" rests on `game.ts`
    sending every event in every snapshot; it is not observed.
  - The e2e's step 1 ("walk in and be beaten: at the entrance, the stick
    moves you") is not written. No beaten-moment shot.
  - Playwright's phones report safe-area insets of 0, so "inside the safe
    area" is checked against the CSS env() rule, not against a real notch.
  - The star is `hall-frame-star` (a framed diamond, not a star): a real
    star is a missing-list item for Vision Partner.
  - Hearts left is not a statistic yet: `stage-cleared` has no such field.

### Handoff from the third builder (`session_017WiGzEsUx1mHyijtCDT1gt`), after push 4

- **Live:** the depot push (f1d1155), (b) (1b8b8d1) and push 4 (e530fa6).
  check:live is ok at e530fa6.
- **Next, by the brief's order:** (c), the wings to depot [38, 18] with
  `step9-fades-then-source` re-timed (no kerb needed now: no wave crosses
  the dip unless a hero is seen in the far yard). Then 3b, then push 5.
- **The lead's additions to 3b (06:04 UTC, after accepting push 4):**
  (1) the owed e2e step: walk into the quarry on the phone page, be
  beaten, end at the entrance with the stick moving the hero; (2) one
  walked clear on a page, so STAGE CLEARED comes from the real
  `stage-cleared` event, not `irreverents.stage.show`. Also, Step 23's
  weapons builder (`session_017WiGzGmHC7ngNDZecPb15v`) is adding a spear at
  quarry-road [8,16] and a bomb at [34,12], put back on a start-over:
  measure the star times after those land.
- **Tools that saved time:** `node scripts/run-some.ts <regex>` takes about
  1 min a run (it loads everything). To try inputs for an existing
  scenario, copy it to `scenarios/zz-try.json` with new inputs, then
  `node scripts/trace.ts zz-try 10` and grep the `event` lines. Delete it
  before `npm run check`. A Playwright script outside the repo needs
  `createRequire(import.meta.url)('playwright')`. The page's
  `irreverents.stage.show(ev)` puts the victory screen up for a look.
- **Trap:** `docs/decisions-log.md` is skip-worktree in this checkout, so
  `git add -A` silently skips it. Run
  `git update-index --no-skip-worktree docs/decisions-log.md` before you
  commit it.

### (c) The wings move (fourth builder, `session_017WiGzEWjmrpsPDvpwxZXir`)

- The source `depot-strongroom` is now at [38, 18], the floor of the hidden
  area under the strongroom. The id is kept. No kerb.
- **Measured: the shaft is no way in from above.** Walking west into it from
  the strongroom floor, the grappler lands on the shaft's one-way platform
  (row 15, columns 42-44) and is walled in at column 41. Physics has no
  drop-through, and the crawl (row 15) is one tile high, which no hero fits.
  So the only way in is the cellar's cracked wall.
- **Re-routed, every claim kept, windows moved:**
  - `step9-fades-then-source`: the walk is `step16-secret-cellar-wall-grappler`'s,
    from cellar spawn 3: grab the rock, throw it at the wall at 330 (it breaks
    at 340), walk east. Flight is taken at 447. A heavy standing on the
    pedestal (bodies pass through each other) hits her east at 471, and the
    orb comes to rest on the low ledge west of her. It fades at 770, and the
    pedestal is lit at 900.
  - Struck west, she was thrown back onto the orb by the rock and took it
    again.
  - `step9-second-power-replaces` (and its control) also walked to [46, 13],
    and both would have passed or failed for the wrong reason. They now take
    the same route. Flight is taken at 447 and the boost pops out. She walks
    on a step and is still flight at 530, then walks back west over the
    boost's orb at 575.
  - The control holds flight over the same walk: no take and no drop in
    0-600.
- **Sweep:** I ran every scenario, looking for `power-*` events of flight or
  `depot-strongroom`. Only those two take it.

### (e) The quarry's throw is off (fourth builder)

- `content/defeat/quarry.json` is `on: false`, as the camp's is. Its
  `gameOver` (the road doorway) is read anyway.
- **Re-routed onto hearts:** each scenario now seeds `world.heartsLost` (the
  grappler 3 left, the infiltrator and the flyer none), so three falls end
  the party.
  - `step22-beaten-to-entrance`: falls, seized and thrown-out become 3
    hearts lost, `game-over-coming` and `game-over` to the road (1299), plus
    no `thrown-out`. The end place and state are the same. Control: the
    quarry's `gameOver` taken out, and the hero is in the cantina.
  - `step22-restart-restores`: game over at 1621, restarted the same tick.
    The 1600/1622 claims are unchanged. Control: the stage `on: false`.
- **`step22-friend-inside-no-restart` could not keep "a in the road at
  1990".** A game over moves every player, so one player is never sent back
  alone. What it proves now: a's grappler loses its last heart (1561) while
  b's flyer still has hearts. There is no game over; a plays on as the next
  member in the depot (the flyer: the "first one again" rule, since b plays
  it). Nothing restarts. Control: b's flyer out too, and the game over moves
  both to the road and restarts the stage.
- **Doubt, logged and not acted on:** a plays the same hero as b there
  (heart-out's "first with hearts again"). That is Step 21's rule
  (`heart-out.ts`), not a bug of this step.

### 3b, part 1: the five heroes, each alone, and the star times (fourth builder)

- **`scripts/stage-bot.ts`**, a measuring tool, not a check. It is a simple
  scripted player that decides each tick from the world and writes its
  presses as a scenario's `inputs`. Usage:
  `node scripts/stage-bot.ts <hero> <fights|walks> [maxTicks] [out.json]`.
  Env `FIGHT_ON_THE_MOVE=1` makes it punch without stopping; `HOP=1 HOP_AT=<px>`
  makes it jump over a bad guy just ahead. A run takes about 20 s. The ten
  `step22-each-hero-*` say in their `//` which command made them.
- **The ten runs** (every placed bad guy, the stage's entrance, spawn 2 on
  the road; all clear on the first try as that hero, with no game over and
  no horn call completed; unseen false in all):

| hero | fights: clear s, knocked flat, defeated, hearts lost | sneaks: clear s, hearts lost |
|---|---|---|
| grappler | 54.0, 12, 3, 0 | 62.0, 2 |
| infiltrator | 38.6, 2, 0, 1 | 41.2, 2 |
| flyer | 51.6, 5, 1, 1 | 52.6, 1 |
| brawler | 58.0, 7, 5, 0 | 60.8, 1 |
| skirmisher | 40.5, 2, 0, 1 | 39.3, 0 |

- **Nobody needed a way made.** The bot's first failures were its own: it
  jumped off ledges into the depot's one-tile cellar hole at column 23, and
  walked into bad guys it could have hopped. Every hero fits the main way.
  The brawler's camp block does not apply here.
- **The star times:** best 45 s, good 60 s (were 600 and 300 placeholders).
  The three threshold runs: best = infiltrator fights 38.6 s, good = flyer
  fights 51.6 s, slow = grappler sneaks 62.0 s (2317, 3094 and 3723 ticks).
  The `step22-stars-edges-*` moved with them (started -1441/-1442 and
  -2341/-2342).
- **Measured after Step 23's spear and bomb landed** (5871f46): they lie on
  the road. The bot never presses grab, so no run uses them.
- **3b part 2, the two e2e steps** (`scripts/e2e/stage.ts`):
  - `stage-beaten-entrance`: by touch from the start room into the quarry
    road and up to column 39, standing there through three heroes' hearts
    (about two minutes). Then GAME OVER, the page at x 49 on the road, and
    the stick moved the hero 64 px. The shot is
    `step-22-shots/push4-beaten-moment-844x390.png`; I looked at it and the
    card is legible. **Not watched failing** (a control would take minutes;
    the scenario `step22-beaten-to-entrance` has one).
    **Not in the suite yet:** inside the full `npm run e2e` it failed. Only
    one hero ran out in its 4-minute wait and there was no card: the bad
    guys are slower to land falls when the machine is loaded. It runs only
    with `E2E_STAGE_BEATEN=1`. **Owed:** make it reliable. Two ways: wait
    on the card rather than a fixed loop, or seed the party's hearts
    low, which a page cannot do today.
  - `stage-cleared-walked`: the page's own hero is set in the depot six
    tiles west of the end, then walks east by the stick, and STAGE CLEARED
    comes from the server's event. Control watched failing: the stick held
    west, and no screen. **DRAFT:** only the depot's last stretch is
    walked on the page. The whole quarry is walked in the scenarios.

### Handoff from the fourth builder (`session_017WiGzEWjmrpsPDvpwxZXir`), after 3b

- **Live:** (c) at 9066ffe, (e) at d1ce641, 3b part 1 at cae9717. 3b
  part 2 (the two e2e steps) is in the push after cae9717.
- **Next, by the brief: push 5** (more enemies, a second caller on the
  ridge, the first screen showing a bad guy and a post, the entrance sign
  saying it is a stage).
  - Then re-record the ten `step22-each-hero-*` with
    `scripts/stage-bot.ts` (the command is in each scenario's `//`). A
    placement change will break them. That is expected: re-record, and keep
    the claims.
  - Then re-set the star times if the clears moved.
  - A hero the bot can't get through is first a bot rule to fix (see "3b,
    part 1"). Only if the hero truly can't get through, a way: a placement,
    a ledge or a crate.
- **Tools:**
  - `node scripts/stage-bot.ts <hero> fights|walks 9000 out.json` (about 20 s).
    To turn its output into a scenario, see the shape of any `step22-each-hero-*`.
  - The bot has a debug watch: `WATCH=<room> WX0=<px> WX1=<px>` prints every
    tick inside that x range.
  - To run one e2e fact module alone: a throwaway script that starts
    `dist/server.cjs` on a port, launches Playwright, and calls the exported
    function (`beatenAtTheEntrance`, `walkedClear`) with a kit
    `{browser, devices, base, fact, errors, out}`.
- **Traps:**
  - `docs/decisions-log.md` conflicts on every rebase (everyone appends):
    keep both sides.
  - `npm run e2e` rewrites shots of other steps; `git checkout` them before
    committing.

### Lead review, owed item (a) (6edd8be), re-run at 002607b

`npm run build` and `npm run check` are ok: all ten `step22-*` scenarios
pass, including `step22-beaten-stay-beaten-in-a-run` (its control was watched
failing by the builder). `npm run gates` is 6 of 6. **Now owed (b):** Step 21's
game over is on `main` (`step21-heart-game-over-quarry` passes, and
`gameOver` is set in `content/defeat/quarry.json`), but `stage-run.ts:101`
still restarts only on `thrown-out`. The stage must also start over on the
quarry's `game-over`; tell the hearts builder once it does.

### Lead review, depot push (d) (f1d1155)

- `npm run build` and `npm run check` are ok, including `step22-wave-reaches-hero` and the re-routed `step16-caught-fight`.
- Control, run by me with `entries`/`entryAway` taken out of `content/outposts/quarry-depot.json`: `step22-wave-reaches-hero` fails, as it should.
- `npm run gates` is 6 of 6.
- Left open:
  - `step16-caught-escape`'s description still says the first wave walks in at the far east end. Its checks pass; the wording is a fix for later.
  - No kerb.
  - The wings have not moved yet.

### Lead handoff (session_017WiGzFrf7N7ZgaqUyjs4Sz → its successor), 2026-11-24 ~05:05 UTC

Written for a cold successor lead. Everything below is on `main`; re-measure
before you quote it.

- **Live and reviewed by re-running:**
  - push 1, losing in the quarry (973968f)
  - push 2, the stage starts over (d6acfdb)
  - push 3a, the end, stats, stars and the result on the sign and menu (d529a1b)
  - owed item (a), beaten bad guys stay gone through a run (6edd8be)
  - the depot push, waves walk in on your stretch (f1d1155)

  Each review is above, with its control.
- **Builder now:** `session_017WiGzEsUx1mHyijtCDT1gt`, the third. The first two
  were archived at their token limits. Its order is at the top of
  `handoff-prompts/step-22-stage.md`:
  1. (b): restart on Step 21's `game-over`, which is on `main`. `stage-run.ts`
     still listens only for `thrown-out`.
  2. Push 4, the STAGE CLEARED screen. **Look at its phone screenshots
     yourself before calling it done.**
  3. (c): the wings move to depot [38, 18], and `step9-fades-then-source` may
     be re-timed.
  4. 3b: the five heroes, fighting and sneaking, and the real star times. If
     no route passes the toll-keeper unseen, leave him out of "unseen"
     (`DRAFT:`, my ruling).
  5. Push 5: more enemies, and found without being told.
- **Other builders this step touches:**
  - hearts and game over: `session_017WiGzG7mhviEaxroo5GvBv`. It keeps
    `content/defeat/quarry.json`'s throw on until Step 22 says it has moved to
    `game-over`.
  - beaten for good: `session_017WiGzEhbdYJQcUhtD2bSLL`.
  - chase and alarms: `session_017WiGzF31gfYgeWNMA7rnEL`.
- **Decisions made here** (logged in `docs/decisions-log.md` or above):
  - Push 2's own restore of people was kept; it later switched to
    `restorePeople`.
  - A run holds **all** of the stage's rooms, so nobody comes back mid-run;
    the beaten builder's scenario moved to the camp.
  - Push 4 was moved ahead of the wings and 3b.
- **Account:** the weekly limit reads `allowed_warning`. The orchestrator
  (`session_017WiGzHhT2apmWHT61rQ65G`) said the owner's priorities go ahead,
  one builder at a time.
- **Messages between sessions arrive up to ~20 min late.** Change direction by
  editing the brief's top block (the builder re-reads it), not by
  mid-push messages.

### Lead review, owed item (b) (1b8b8d1), re-run by the successor lead (session_017WiGzF7NsB3KTwXkWUXE63)

- `npm run build` and `npm run check` are ok, including `step22-restart-on-game-over` and every `step21-heart-*`.
- Control, run by me (`stage-run.ts` as it was before 1b8b8d1, scenario kept): `step22-restart-on-game-over` fails, as it should, with no `stage-restarted` event and tries 0.
- `npm run gates` is 6 of 6.
- Open: both the throw and the game over now start the stage over. The throw goes when the hearts builder switches it off by data, and three `step22-*` scenarios rely on it then.

### Lead review, push 4 (e530fa6), re-run by the successor lead

- `npm run build`, `npm run check` ok; `npm run gates` 6 of 6.
- `npm run e2e`: every `stage-*` fact ok. At all three phone sizes the panel and Continue are inside the view and reachable. `stage-held` is the control: with the screen up, the stick moves the hero 0 px; after Continue, 49.9 px. In `stage-two`, A dismissing does not dismiss B.
- Looked at all four shots myself:
  - STAGE CLEARED is large and legible, the statistics are aligned and Continue sits under the right thumb.
  - Sideways, the panel covers the middle of the screen and leaves the hearts plate visible.
  - **Doubt:** `hall-frame-star` reads as a framed tile, not a star (a `DRAFT:`, and a missing-list item for Vision Partner).
- **Still owed by this step's signal:** the e2e's "walk in, be beaten, be at the entrance with the stick moving the hero". Fold it into 3b, which walks the quarry anyway, together with one walked clear that raises the screen from the real event.

### Lead review, (c) the wings (9066ffe)

- `npm run build` is ok, and every `step9-*`, `step16-*` and `step22-*` scenario passes.
- Control, run by me: the wings' source put back at [46, 13]. `step9-fades-then-source` and `step9-second-power-replaces` both fail, so the re-routed walks really reach the new tile under the strongroom.
- Not seen: the pedestal on a phone at its new place. Push 5's found-without-being-told shots should include it.

### Lead review, (e) the quarry's throw off (d1ce641)

- `npm run build` is ok, and all 86 `step16-*`, `step21-*` and `step22-*` scenarios pass.
- Controls, run by me:
  - The stage set to `on: false`: `step22-restart-restores` and `step22-restart-on-game-over` fail.
  - The quarry's `gameOver` taken out: `step22-beaten-to-entrance` fails.
- **Accepted change of meaning:** `step22-friend-inside-no-restart` now proves that one player's hero running out, while a friend still has hearts, starts nothing over. Under the owner's hearts rule a game over moves the whole party, so the brief's old "a friend still inside" case no longer arises. The signal's line is read that way from now on.

### Lead review, 3b part 1 (cae9717)

- `npm run build` is ok, and all 22 `step22-*` scenarios pass.
- Control, run by me: the end box moved up out of reach (rows 1-2). All ten `step22-each-hero-*` fail.
- All five heroes clear alone, fighting and sneaking, and nobody needed a way made.
- **Ruling, for push 5: an unseen clear must exist.** No run is unseen today: the road's toll-keeper and fighters see the main way. The owner's standard is "the satisfaction of a zero-alarm infiltration", and the step says quiet routes are worth more.
  - Push 5's placements give at least one route that passes the whole quarry with no bad guy seeing a hero.
  - Leave the toll-keeper out of "unseen" if that is the only way (`DRAFT:`).
  - Prove it with a `step22-unseen-clear` scenario, whose `stage-cleared` has unseen true, plus a control.
  - Re-record the ten hero runs with `scripts/stage-bot.ts` if the placements move them.
- **Doubt, for the owner by playing:** the star times (best 45 s, good 60 s) come from a script, and a person on a phone will be slower. They stay `DRAFT:`, and they're one number each in the stage file.

### Lead review, 3b part 2 (2c52391)

- The full `npm run e2e`, re-run by me with `E2E_STAGE_BEATEN=1`: every `stage-*` fact ok, and no other fact failed.
  - `stage-cleared-walked`: STAGE CLEARED came from the server's event, with the page's show called 0 times.
  - `stage-beaten-entrance` passed **inside the full suite** this time. Two heroes ran out, the GAME OVER card was drawn, and the page was in quarry-road at x 4. So it is intermittent, not broken. Making it reliable and putting it back in the suite is in the fifth builder's order.
- Looked at `push4-beaten-moment-844x390.png`: GAME OVER is legible, and so are "Back to the start of Iron Quarry" and "Every heart back". The controls stay visible.

### Lead look, the phone HUD's stars (d2cb96c, the HUD builder's, agreed by message)

- Looked at the fresh `push4-stage-cleared-sideways-667x375.png`. The stars are now pixel stars: gold and filled when earned, empty with a pale edge when not.
- That settles push 4's doubt (the frame tile read as a chest). A real star sprite is still asked of Vision Partner, as a `DRAFT:` stand-in.

### Push 5, part 1: the quiet way, and an unseen clear (fifth builder, `session_017WiGzGTsScxtYSPbqs97N3`)

- **`step22-unseen-clear`:** the infiltrator clears in 2011 ticks (33.5 s) with `unseen` true, 3 stars, no punch, no heart lost, no call even started. Control, watched failing: the scaffold's row 8 emptied by a tiles override, and no clear (the toll's watcher beats it, five hearts lost).
- **The way** (`docs/decisions-log.md`, "The quarry has a quiet way"):
  - road: a one-way scaffold over the toll (rows 11, 9, 8; columns 31-62). The road heavy now looks up the road 2 s in every 7, and the hero waits on the scaffold (6 s) for that turn.
  - ridge: walk to the chasm and drop. The ridge's fighters (36, 40) don't reach column 28.
  - pit: `pit-fighter` moved from column 26 to 16, facing the heavy, both west of the landing.
  - depot: a one-tile step under the hole (row 17, column 23, hole foot widened), steps at columns 25-28, a plank to the roof (row 8, 29-35), and a gantry over the far yard (row 9, 48-60) that drops into the end.
- **Tool:** `scripts/stage-quiet.ts` plays `scripts/stage-routes/quiet-infiltrator.json` and finds the waits itself (about 30 s).
- **Kept:** every `step16-*`, `step7-*`, `step9-*`, `step14-*`, `step21-*` and `step22-*` passes. The first plank (row 8 from column 20) broke `step16-caught-escape-cave`, because the flyer's glide off the roof landed on it, and so did a two-wide cellar step (the flyer's head was in the cellar ceiling). The shapes above are the ones that keep it.
- **Re-recorded:** only `step22-each-hero-fights-skirmisher`, which stopped clearing (2445 ticks now). The other nine still clear with their old inputs.
- **Not yet:** more enemies, the second caller, the first screen, the entrance sign (push 5, part 2). Not looked at on a phone yet.

### Lead review, push 5 part 1, the quiet way (b749ec7)

- `npm run build` is ok, and all 132 `step7/9/14/16/21/22-*` scenarios pass.
- Control, run by me: `content/rooms/quarry-road.json` as it was before b749ec7, with no scaffold. `step22-unseen-clear` fails, with no unseen `stage-cleared`.
- The owner's zero-alarm infiltration now exists in the quarry: the infiltrator, unseen, 3 stars, the toll-keeper included in "unseen".
- No phone shot yet of the scaffold or the gantry. Part 2's shots should include them, with the first screen, the sign and the wings.

### Push 5, part 2a, and a handoff from the fifth builder (`session_017WiGzGTsScxtYSPbqs97N3`)

- **Live:** part 1, the quiet way (b749ec7). Part 2a is in the push after it: the quarry's sign shows three empty stars as soon as the level is named, so it says it is a stage before anyone clears it. Shots: `step-22-shots/push5-sign-stage-*.png` (I looked at both; legible).
- **Part 2 was built in a scratch tree and run, not shipped.** These are the measurements, so a fresh builder doesn't re-derive them:
  - **The road's caller** (the first screen's bad guy and signal). A lookout at [18,14] on the first ledge (looks east 3 s, west 4 s) with a post at [19,14] is in view from the doorway and too far to see the spawn. Outpost `quarry-road`: entries [[14,14],[26,14],[33,12],[41,12],[46,12]], entryAway 6, bound 6, waves F, FF, FH.
    - A high walk takes the quiet way over him: one-way row 13 at columns 13-14, then row 11 at columns 15-30, joining the scaffold's row-11 step. On it every hero is out of his band (dy 57 or more). Climb onto it while he looks east.
    - With him placed, all five `sneaks` runs complete his call at ticks 290-355: `stage-bot` walks the floor in his view. It needs a walks-mode rule: wait at column 10 or less until `road-lookout` faces east, then go up the ledge, the step and onto the high walk.
    - `step16-no-waves-on-the-road` starts at spawn 1 (column 48), so he never sees that hero.
  - **The ridge's caller:** a lookout at [52,7] (looks west 4 s, east 3 s), post [53,7]. Outpost `quarry-ridge`: entries [[49,7],[56,8],[64,9],[70,9],[77,9]], bound 9, waves FH, FFH, BF. **The blocker:** he sees the ridge's main way (columns 46-59), and nobody can pass a turning lookout on his own level: crossing his column is always in front of him. The ten `sneaks` claims ("no horn completed") then fail for every hero on the main way. Two ways out:
    - a way over him, like the road's high walk;
    - the lead changes what `sneaks` means.
    The quiet way is not affected: he can't see the chasm at 28.
  - **The depot:** any bad guy in the far yard moves four checks. I tried a brute at 58 facing west and a heavy at 49 facing east.
    - `step21-heart-game-over-quarry` (Step 21's): the first fall comes at 225, not 463.
    - `step22-restart-on-game-over`: 270, not 567.
    - `step22-cleared-stats`.
    - `step16-caught-escape`: 8 people where it expects 6, and the depot's bound of 8 then leaves room for only two wave bodies.
    West of the strongroom, every spot is on a Step 16 quiet way. Choose one: leave the depot at 4 placed and grow its waves (a brute row), or re-time those four and tell Step 21's owner about theirs.
  - **The pit:** a brute at [5,18] facing east hits the grappler in `step16-mood-heavy-hit`. Facing west at [6,18], toward the hidden cave's wall, it would be behind that walk. Not measured.
  - **The tower** (a heavy at [14,12] facing west, a fighter at [5,18] turning): nothing else broke. It wasn't measured on its own, since the ten runs failed on the road first.
- **Then:** re-record the ten runs (`stage-bot`, the commands in each scenario's `//`). Re-record `step22-unseen-clear` with `scripts/stage-quiet.ts`, adding the road's high-walk segments before "step row 11". Re-measure the star times (the unseen clear is now the fastest run, at 33.5 s). Commit phone shots of the first screen and of the wings' pedestal at depot [38,18].
- **Still owed:** the e2e `stage-beaten-entrance` made reliable inside the full suite (the brief's top block, item 2). Not started.
- **`check:live` after part 1 (b749ec7):** 20 ok and 1 FAIL, `tiers` (the castle street's whistle gauge under live delay). That is the town lane's known flaky fact, being fixed now (59fa3b0). Part 1 touches nothing of the street, so I did not revert.

### Lead review, push 5 part 2a, the sign's empty stars (ffc4585)

- `npm run check` ok, `npm run gates` 6 of 6, re-run by me.
- Looked at `push5-sign-stage-upright-390x664.png`: "Iron Quarry" with three empty stars under its pieces row, legible on the sign board.
- No control: a drawing with no check of its own. It is accepted on the shot.

### Push 5, part 2: the callers, more bad guys, the runs re-recorded (sixth builder, `session_017WiGzFCTDPbq1AGbnZ5Gqx`)

- **Placed** (`docs/decisions-log.md`, "The road and the ridge have callers"):
  - **road:** `road-lookout` [18,14] (east 3 s, west 4 s) and `road-horn-post` [19,14]; outpost `quarry-road` as the fifth builder measured. The high walk: one-way row 13 (13-14) and row 11 (15-30).
  - **ridge:** `ridge-lookout` [52,7] (west 4 s, east 3 s) and `ridge-horn-post` [53,7]; outpost `quarry-ridge` (waves FH, FFH, BF from the tower side, bound 9). **The way over him:** a one-way step at row 5 (41-43) and a walk at row 3 (44-62) to the shelf and the tower-top opening. Row 4 was tried first; a jump from the flat (row 7) lands on it and sent `step16-room-ridge-*` out through the shelf. The walk stops a tile short of the shelf. Even so, `step16-back-grappler`'s jump off the shelf lands on it and it reaches the road door about 40 ticks early. **Re-timed:** its walk west now ends at 1994 (was 2011); it passes at 1990-1998, and every claim is unchanged.
  - **tower:** `tower-heavy` [14,12] facing west and `tower-fighter-3` [5,18] turning every 3 s.
  - **depot:** 4 placed, as before; its second wave is now two fighters and a brute.
  - **pit:** the brute at [6,18] facing west broke `step16-mood-heavy-hit` (it fights the grappler), so I left it out, as ruled.
  - Bad guys now: road 4, ridge 4, tower 4, depot 4 + waves, pit 2.
- **The ten runs, re-recorded** (clear in ticks; all first try, no hero out, no game over):

| hero | fights | sneaks |
|---|---|---|
| grappler | 3248 | 3050 (main way, up the depot's ledge) |
| infiltrator | 2332 (now `HOP=1 HOP_AT=30`) | 2011, the quiet way, unseen |
| flyer | 3186 | 2262, the quiet way, unseen |
| brawler | 3518 (one call completed; fights may) | 3469 (main way) |
| skirmisher | 3049 | 1735, the quiet way, unseen |

- **What the bot learned** (`scripts/stage-bot.ts`, `STAIRS`):
  - Wait by the road door for its lookout to turn east, then climb the high walk (both modes).
  - Walking only: over the ridge's lookout; hop the tower top's two fighters; wait inside the depot door for its lookout to turn east, then climb the door steps onto the high ledge (`step16-zero-alarm-ledge`'s way).
  - The old sneak runs crossed the depot lookout's floor by luck of timing.
- **Small heroes sneak by the quiet way:** on the main way the tower top's fighters punch them through the depot door in front of its lookout, and a hero runs out of hearts.
  - They now run `scripts/stage-quiet.ts scripts/stage-routes/quiet-{infiltrator,skirmisher,flyer}.json`, and every claim is kept.
  - The flyer's route drops straight down the chasm (it floats into the ridge fighters' view otherwise) and flaps up the hole (the new `flap` segment option).
- **`step22-unseen-clear`** re-recorded: 2011 ticks, unseen, 3 stars. **Doubt, for the owner by playing:** the infiltrator's pass over the road heavy is a window of under 6 ticks (`waitStep` 1 found it). He sees the scaffold at exactly his 40 px band edge, whichever way he faces. A wider window would need the scaffold a pixel higher, or the heavy's sight shorter.
- **Star times:** best 45 s (kept), good 56 s (was 60). The `step22-stars-edges-{good,good-over,tries}` moved with them (started -2101/-2102).
  - The threshold runs: fastest 1735 ticks (skirmisher sneaks, 28.9 s), good 3186 (flyer fights, 53.1 s), slow 3518 (brawler fights, 58.6 s).
- **Shots** (`step-22-shots/push5-*`, all looked at, legible): the first screen sideways (the lookout, his horn and his sight band, the hero out of it), the road's and the ridge's high walks, and the wings' pedestal at depot [38,18] sideways and upright.
  - **Doubt:** upright (about 12 tiles wide) the road's lookout is not on the first screen, even three tiles in (`push5-first-steps-caller-upright-390x664.png`). To be, he would stand where his sight reaches the door. Sideways he is.
- **Controls, watched failing:**
  - The end box moved out of reach: all ten runs and the unseen clear fail.
  - The scaffold's row 8 emptied by a tiles override: no unseen clear.
  - The road's high walk (row 11) emptied: no unseen clear, because the road's lookout calls.
  - The ridge's way over (rows 3 and 5) emptied: the grappler's and the brawler's sneaks fail, with the ridge's calls completed.
- **Tool:** `scripts/scenario-trace.ts <id> [every]` prints where a scenario's body goes, tick by tick.
- **Live:** part 2 at 614f9ee (check:deployed ok; check:live 21 ok).
- **Item 2, `stage-beaten-entrance` made reliable: not done. Measured, for the next builder:**
  - The old stand hops to the road's toll flat (column 39), where only the watcher swings: too few falls for the party's 11 hearts. It also only walks back when knocked west of column 36. Knocked east, or up onto the scaffold, the hero waits for ever (defeat.ts's camp stand had the same stall and fixed it with a band and walk-backs).
  - **New risk since part 2:** its hop east (a jump every 0.7 s) can land on the road's high walk (rows 13 and 11) and carry the hero over the toll on the scaffold. That has not been run since part 2; the step is opt-in.
  - **Tried and reverted:** after walking into the road by touch, the page stood its own hero on the depot's west stretch (column 6, in the lookout's sight), with walk-backs. Run alone: 270 s, only one hero out, no card. A blow carried the hero over the stack to column 21, outside the walk-back rule.
  - **What would make it reliable:** seed the party's hearts low (`world.heartsLost`; a page cannot today, so it needs a server hook for check worlds, asked of Step 21's owner), or a stand with a band and walk-backs both ways, as in defeat.ts, among more swingers.

### Lead review, push 5 part 2, the callers and more enemies (614f9ee)

- `npm run build` is ok, and all 171 `step5/7/9/14/16/21/22/23-*` scenarios pass.
- Control, run by me: `content/rooms/quarry-ridge.json` as it was before 614f9ee, with no way over the ridge's caller.
  - `step22-each-hero-sneaks-brawler` and `-grappler` fail; they sneak the main way.
  - The flyer, the infiltrator and the skirmisher pass; they now take the quiet way, as the builder notes.
- Looked at the shots:
  - The first screen sideways shows the road's lookout with his horn on the ledge, the spear and the high walk, all seen from the doorway.
  - The wings' pedestal is in the hidden place under the strongroom, with a heavy patrolling above.
  - Upright, the first screen shows the spear but not the lookout (the builder's weak point 1). It is accepted: the lookout is a few steps on, and sideways is how the game is mostly played.
- **Owed, after the e2e item:** the infiltrator's unseen pass over the road heavy is a window of a few ticks. A person on a phone won't hit that. Widen it (the heavy's glance rhythm or the walk's height) until the window is at least about half a second, and re-record `step22-unseen-clear`.

### Item 1: the pass over the road heavy widened (seventh builder, `session_017WiGzJudo6Zjh95Uh99rkH`)

- **Measured first:** on row 8 the heavy (centre 936,162) sees the infiltrator at dy exactly -40, the edge of his band, for every dx from -112 to +112, whichever way he faces. The old pass crossed dx 0 on the tick he turned.
- **The ruling as written (all of row 8 up to row 7) breaks two heroes.** Row 7 under the flyer's ledge (row 5, columns 50-55) leaves 16 px of headroom. Run against every quarry scenario, only `step22-each-hero-sneaks-{skirmisher,flyer}` failed; the infiltrator, every `step16-*` (zero-alarm and caught-escape-cave included) and the joins at rows 9 and 11 were fine. A re-recorded skirmisher only got through by hopping onto the hidden flyer-ledge and over its pillar.
- **Built instead** (`DRAFT:`, told to the lead; decisions-log "The scaffold has a top plank over the road heavy"): row 8 stays, and a one-way top plank at row 7 (columns 56-62) sits east of the ledge, over the heavy. Up there every hero is out of his band (dy -56). The infiltrator waits at column 51, out of his reach, goes when he turns to look up the road, and hops onto the plank at 56.4 (`hopAt`, new in `scripts/stage-quiet.ts`).
- **The window, by a sweep** (`QSWEEP=8 node scripts/stage-quiet.ts scripts/stage-routes/quiet-infiltrator.json`): every wait from 312 to 395 passes, 84 ticks (1.4 s); before, under 6.
- **`step22-unseen-clear` re-recorded:** 1943 ticks (was 2011), unseen, 3 stars, no call started; its window is now 2004 ticks.
- **Controls, watched failing:** rows 8 and 7 emptied, and no clear (two hearts lost to the toll's watcher, the road's call started). Only the top plank emptied: it clears, but with `unseen` false.
- **Every other scenario passes on its old inputs**, the skirmisher's and the flyer's quiet sneaks too (they stay on row 8, out of his band at dy 43 and 44). Star times unchanged: the fastest run is still the skirmisher's 1735.
- **Shots:** `step-22-shots/push5-road-top-plank-{sideways-844x390,upright-390x664}.png`, looked at: the plank reads as a second timber plank above the walk, over the heavy and his band.
- **Doubt, not changed:** by arithmetic, not run: the flyer's ledge looks reachable today from the west end of row 8 by a skirmisher's jump (48 px up; it rose 56 in the traced run). Its room note says only flapping reaches it. That was already true before this change; logged, not fixed.

### Lead review, item 1, the road's top plank (f6a6ee8)

- `npm run build` is ok, and all 130 `step16/21/22/23-*` scenarios pass.
- Control, run by me (`quarry-road.json` without the top plank): `step22-unseen-clear` fails, with no unseen clear.
- The window, swept by me (`QSWEEP=8 node scripts/stage-quiet.ts scripts/stage-routes/quiet-infiltrator.json`): 84 of the waits pass, 312 to 395 in a row, about 1.4 s. The pass over the heavy is now one a person can make.
- Looked at `push5-road-top-plank-sideways-844x390.png`: the hero is on the top plank, over the heavy, under the flyer's ledge.
- The builder's change to my ruling, a plank at row 7 instead of moving all of row 8, is accepted. It is measured, and it keeps the small heroes' sneaks.

### Item 2: `stage-beaten-entrance` in the full e2e (seventh builder)

- **The hearts seed, test-only** (the lead's preferred way): `GameOptions.checkHooks` in `src/server/game.ts` (additive; set by `src/server/main.ts` from `IRREVERENTS_CHECK_HOOKS=1`, which only `scripts/e2e.ts`'s own server passes). A world named `e2e-hearts-low-…` then starts with the party's first member on one heart and the others out. On Railway the variable is never set, so the name is an ordinary private world, and `check:live` doesn't run the stage facts.
- **Measured first:** stood on the toll flat (column 41) with one heart, the hero was never hit in 4 minutes. The toll's watcher and keeper don't swing without a call; the old walk got its falls because it passed the road's lookout, who called. So the page now walks in by touch and stands its own hero in the lookout's sight (first ledge, column 23), and again whenever a blow carries it off. His waves do the beating. No more hop east, so it can't land on the high walk.
- **Runs:** alone, 4 of 4 green (35-63 s). The full `npm run e2e`: `e2e: ok`, this fact included. Out of opt-in (`E2E_STAGE_BEATEN` is gone).
- **Control, watched failing:** the same step against a server without the hook (11 hearts): one hero out in 4 minutes, no card.
- **Shot:** `push4-beaten-moment-844x390.png` re-taken by the run, looked at: the GAME OVER card, legible.
- **Measuring trap:** a page's `irreverents.world` holds only its own simulation's bodies, not the bad guys it draws (the snapshot had all seven road bodies; the page's world showed only `road-toll`). Look at the snapshot or a screenshot, not that list.
