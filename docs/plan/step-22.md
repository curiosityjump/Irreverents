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

## Builder notes
