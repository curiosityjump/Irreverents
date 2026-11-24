# Stages: one level as a run you can lose and start over

**Reference.** Open before touching `content/stages/`,
`src/content/kinds/stages.ts`, `src/sim/stage.ts`, the `stage-*` systems,
or the quarry's defeat file. Built by Step 22 (`docs/plan/step-22.md`).

## Why it exists

The owner, 2026-11-24 ~00:30 UTC: *"Let's get one level where there is a
whole outpost you need to navigate though without dying. Lots of enemies,
alarms, and real way to lose/die, which pushes you back to the entrance to
start over. Needs a satisfying victory screen at the end. Stage cleared, with
a star rating and some stats."* Everything else in the game is a place that
remembers (D-077); a stage is the one run with a start, a loss, an end and a
result. The engine knows stages, not the quarry: a second stage is one file.

## The pieces

| Piece | Where | What |
|---|---|---|
| A stage | `content/stages/<id>.json` | `on`, `level` (its rooms are the stage's rooms; one stage per room), `entrance` (`room`, `door`: where a beaten hero lands, the same spot as the level's defeat file), `end` (`room`, `from`, `to`: a box of tiles; Step 22 push 3), `stars` (`good`, `best`, seconds; optional `tries`, default 1; push 3). |
| Losing | `content/defeat/quarry.json` | Step 21's rules (`defeat.md`): the hearts' game over (`gameOver`), landing at the stage's entrance. Its throw is off since Step 22 (e) (`on: false`; the fields stay), so a single player is never sent back alone: a game over moves every player at once. The stage writes no second rule. |
| The run | `world.stages[id]` | `state` (`idle`, `running`, `cleared`), `started` (tick of this try), `tries` (start-overs), `pending` (players thrown out, waiting for the stage to empty), `counts` (this try's statistics: `defeated` ids, `alarms`, `seen`, `hoard`), `best` (`{stars, ticks}`, the best clear). Small; sent to pages by key. |
| The home copy | `world.stageHome[id]` | The stage's placed bodies as a fresh world places them, taken the first tick the stage is seen and never re-read from files. Kept with a kept game; **left out of every snapshot** (`src/server/game.ts`): a page never restores. |

## The rule (`stage-run`, order 612, after the throw at 590)

1. A played hero inside a stage room with no run under way starts one
   (`stage-started`).
2. A `thrown-out` from a stage room is a try: the player goes in `pending`.
   So is Step 21's `game-over` (hearts, order 588) when its `room` is a stage
   room (the quarry's `gameOver` is the stage's entrance): every player it
   moved goes in `pending`, so the stage starts over on that tick, hearts
   full (`step22-restart-on-game-over`; controls: the old code, and the
   stage `on: false`). A game over that lands outside (the cantina) starts
   nothing over. The `thrown-out` path is kept but dormant while the
   quarry's throw is off (Step 22 (e)); a stage whose place keeps its throw
   would still use it.
3. When every player still inside the stage is pending (solo: at once, as
   the thrown hero lands at the entrance, which is inside), `restoreStage`
   runs, `tries` goes up, the clock and counts restart (`stage-restarted`).
4. While a run is under way (push 3), its try's statistics gather on the
   shared world only (`world.taken` unset, like the Hall detector): a
   `defeated` (beaten for good, `src/sim/beaten.ts`) credited to a player, of
   a person in its rooms, adds to `defeated` (distinct ids); each
   `outpost-call-completed` of an outpost in its rooms, and each town
   `call-completed` whose area is one of them, is an alarm; `seen` turns true
   the first tick a bad guy (npc kind `side: "bad"`, placed or a wave's) in
   its rooms can see a played hero (`canSee`, `npc/sight.ts`: the test
   heist-cargo uses for a clean getaway and the band draws); a `prize-banked`
   of a heist in its rooms is the hoard.
5. A played hero (not pending) whose box overlaps the end box clears it, once
   per run (`stage-cleared {stage, player, ticks, defeated, alarms, tries,
   unseen, hoard, stars, best}`; a prize still in a hero's hands there counts
   as the hoard, since the end is inside the stage). `stageStars`: one for
   finishing; two for `ticks` at or under `good` seconds or at most
   `stars.tries` start-overs; three for two and (unseen, or no alarm, or at
   or under `best` seconds). `best` is kept when the stars are more, or the
   same and faster. The run is then `cleared` until nobody is inside, so
   standing in the end does not start a new run; a walk back in after that
   starts a fresh one over the stage as it was left (only being beaten puts
   it back).

While a run is `running`, the stage holds all its rooms (`holdReturns`,
`src/sim/beaten.ts`; the lead's ruling, `DRAFT:`): nobody beaten for good
there comes back by himself mid-run, even in a room nobody is in; cleared
or left, the hold is let go and beaten-return's 90 s applies as anywhere.

`restoreStage` (`src/sim/stage.ts`, `INTENT:`): first `restorePeople` for
each of its rooms (the beaten-for-good come back through their own rule);
then every other placed body of the stage back from the home copy, `c` empty (npc-setup makes it a person again
next tick: whole, at its post, mood 1, nothing seized or carried); wave
bodies (`<outpost>:w*`) and alerts (`~alert:<room>`) of its rooms removed;
its things removed so npc-setup puts them back untaken (a banked prize stays
banked) and their `world.cargo` entries dropped; `world.rooms[r]` deleted for
each of its rooms. Left alone: every played body, anything a player holds or
carries, stray bodies that are not placed ids, `world.levels`, completion,
power sources, the roster.

## Rules that are deliberate

- **Only in a stage, only on being beaten** (`INTENT:` at `restoreStage`;
  `docs/deliberate-designs.md`): the owner's exception to D-077 and D-019.
  `on: false` is the control that proves it never runs elsewhere.
- **A friend inside holds it** (`DRAFT:`): the stage starts over only when no
  unbeaten player is inside; a friend who walks out does not start it over.
- **No pause** (`DRAFT:`): the clock runs while a menu is open; a friend
  joining mid-run joins its clock and counts.
- **No teleport on a page:** a restore only runs with nobody but the beaten
  inside, and a page is sent only its own room's bodies, so nobody watches a
  body jump home; when a player walks back in, the page's smoother starts
  those bodies fresh.

## Shown

- **The level's sign** (`src/client/draw/levels.ts`, `drawLevelSigns`): once
  there is a best, a row of three `hall-frame-star` under the name and the
  pieces, the earned ones lit, the rest dim. No time: `INTENT:` no digit in
  the game picture (`t-no-numbers`). `drawn.levels.entrances[].best`.
- **The menu row** (`src/client/start.ts`, `.st-stars`, `data-stars`): the
  same stars and the best time as m:ss (`stageClock`), in HTML.

### The victory screen (push 4, `DRAFT:`)

`src/client/draw/stage.ts`, called from `main.ts` (`watchStageEvents`) and
`render.ts` (`drawStage`, last, over the GAME OVER card).
- A `stage-cleared` puts it up on a page whose own hero is in the stage's
  level or who cleared it (every snapshot carries every event,
  `src/server/game.ts`).
- On the game canvas, in the pixel font (`light`): the level's name,
  STAGE CLEARED at 2x when it fits, then three `hall-frame-star`. The
  earned ones light one at a time (frame 30, then every 50), each with the
  sound `secret-found` (`audio.cue`).
- Then the statistics count up in turn: time to clear (m:ss), enemies
  defeated, alarms raised, game overs (the run's `tries`); "Nobody saw
  you" when unseen; "The hoard, carried out" when it was.
- `INTENT:` the one place numbers are drawn in the game picture (D-020).
- **Continue** is the DOM button `#stage-continue` (`index.html`), bottom
  right inside the safe area, 136x56 or more. It is shown with the screen.
  While the screen is up, `readInput` sends nothing and `#touch` is hidden
  (`.stage-up`). A tap, click, Enter, Space or Escape dismisses this page's
  screen only.
- `INTENT:` there is always a way out, and the world never pauses.
- `drawn.stage` holds the lines as drawn, the stars lit, the plate's box
  and the view. `irreverents.stage.show(ev)` puts one up page-side, for the
  e2e and screenshots.
- Not shown: hearts left (the event has no such field yet).

## Checking it

`scenarios/step22-restart-restores.json` (control: the stage `on` false),
`step22-friend-inside-no-restart.json` (control: the friend outside the
stage), `step22-beaten-to-entrance.json` (the defeat file),
`step22-cleared-stats.json` (controls: one knock-out only is no defeat; the
end box moved away), `step22-beaten-stay-beaten-in-a-run.json` (the hold;
control: the stage `on` false), 
`step22-stars-edges-{good,good-over,best,best-over,tries}.json` (the same clear
with the run seeded through `world.stages` so its time lands one tick either
side of each threshold; each pair is the other's control: move `started` when
the thresholds are re-measured). The fact `tile` (Step 22) reads a room's tile
as the world has it; the fact `stage` (push 3) reads `world.stages[id]`'s
state, tries and best. `step22-restart-on-game-over.json` (item (b)). The
e2e's `stage-*` facts (`scripts/e2e/stage.ts`): the screen at three phone
sizes inside the view, Continue in the safe area and reachable, the stick
resting while it is up (`stage-held`, the control), Continue giving it
back, and two pages each dismissing their own. Shots in
`docs/plan/step-22-shots/push4-*`.

## Not built yet

The home copy still restores the people who were only knocked flat, moved
or angered; `restorePeople` covers only the gone. Push 3's hero runs (each roster hero from the entrance to the end, fighting
and sneaking) and the thresholds they measure. Push 5: more enemies, the
waves from the sides. `beaten.ts`'s `restorePeople` (another builder's, not
on `main` at push 2) now brings back the gone; the home copy keeps the rest.
