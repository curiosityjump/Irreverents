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
| A stage | `content/stages/<id>.json` | `on`, `level` (its rooms are the stage's rooms; one stage per room), `entrance` (`room`, `door`: where a beaten hero lands, the same spot as the level's defeat file), `end` (`room`, `from`, `to`: a box of tiles; Step 22 push 3), `stars` (`good`, `best`, seconds; push 3). |
| Losing | `content/defeat/quarry.json` | Step 21's rule (`defeat.md`), landing at the stage's entrance. The stage writes no second rule. |
| The run | `world.stages[id]` | `state` (`idle`, `running`), `started` (tick), `tries` (start-overs), `pending` (players thrown out, waiting for the stage to empty). Small; sent to pages by key. |
| The home copy | `world.stageHome[id]` | The stage's placed bodies as a fresh world places them, taken the first tick the stage is seen and never re-read from files. Kept with a kept game; **left out of every snapshot** (`src/server/game.ts`): a page never restores. |

## The rule (`stage-run`, order 612, after the throw at 590)

1. A played hero inside a stage room with no run under way starts one
   (`stage-started`).
2. A `thrown-out` from a stage room is a try: the player goes in `pending`.
3. When every player still inside the stage is pending (solo: at once, as
   the thrown hero lands at the entrance, which is inside), `restoreStage`
   runs, `tries` goes up, the clock restarts (`stage-restarted`).

`restoreStage` (`src/sim/stage.ts`, `INTENT:`): every placed body of the
stage back from the home copy, `c` empty (npc-setup makes it a person again
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

## Checking it

`scenarios/step22-restart-restores.json` (control: the stage `on` false),
`step22-friend-inside-no-restart.json` (control: the friend outside the
stage), `step22-beaten-to-entrance.json` (the defeat file). The fact `tile`
(Step 22) reads a room's tile as the world has it.

## Not built yet

Push 3: the end, `stage-cleared` and its statistics, stars, the best kept and
shown on the sign. Push 4: the victory screen. Push 5: more enemies, the
waves from the sides. `beaten.ts`'s `restorePeople` (another builder's, not
on `main` at push 2) is to replace the people part of `restoreStage` when it
lands.
