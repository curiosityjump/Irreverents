# Step 16: the depot, findable — see the danger before it sees you

Brief for a builder. Written 2026-11-23 20:10 UTC by the Step 16 lead
(`session_017WiGzHt9iJy3caBLkT1Ef4`). Read `docs/plan/step-16.md`'s
Measure entry of 19:35 UTC (what a phone shows in each room) and its last
handoff note, and `docs/mechanisms/outposts.md`.

**Hard stop: 75 minutes after you start. Nothing half-working on
`main`.** `send_message` the lead with each commit.

## Why

The owner, after playing (`docs/vision.md`, "The measure"): each core
loop "must be findable and recognisable without being told where it
is". The phone look at b0a7d5e found that **at the depot's door the
lookout is two tiles away facing you, and you are seen the instant you
arrive** (in one run the horn was already sounding). So a first-time
player never gets to choose a quiet way; the zero-alarm infiltration,
one of the owner's three standards for the game working, is only
reachable by script. And the hoard, the reason to be there, is out of
view until you are inside the strongroom. Both are Step 16's own data;
the lead decided re-timing the depot's scenarios is worth it.

## Measured for you (at b0a7d5e)

- **People** (`content/placements/quarry-depot.json`): `depot-lookout`
  at [6,13] (faces left 4 s, right 3 s), `depot-horn-post` at [9,13],
  `depot-fighter-1` walks 9↔4, `depot-fighter-2` walks 61↔54, `depot-guard`
  (heavy) at 34, walks in to 40 and back about every 14 s. Hoard
  `depot-hoard` at [45,13]. Outpost file `content/outposts/quarry-depot.json`.
- **Sight:** 112 px (7 tiles) across in front, 40 px (2.5 tiles) up and
  down. **The phone's sideways view is about 15 tiles wide, 7 tall**,
  centred on the hero.
- **The room** (`content/rooms/quarry-depot.json`, rows printed in its
  `//`): the hero enters at column 0, rows 11–13. The west ledge's first
  step is at row 12, columns 3–4, then row 10 columns 5–6 and 15–16,
  then row 8 columns 7–17. The stack (`yard-stack` hide) at column 20;
  the step at 24–25; the hole at 23; the strongroom 36–47 with its shelf
  at row 11 columns 40–41.
- **Scenarios that pin the depot** (all must end green, re-timed if
  needed, never weakened): `step16-zero-alarm-roof`,
  `step16-zero-alarm-ledge`, `step16-caught-fight`,
  `step16-caught-escape`, `step16-caught-escape-cave`,
  `step16-across-*`, `step16-back-*`, `step16-room-depot-*`, and the
  cellar secrets. Trace with `node scripts/trace.ts`; a per-tick
  `canSee` trace over `simulate()`'s history found every sight window
  last time.

## What to do (`DRAFT:`, logged in `docs/decisions-log.md`)

1. **Arrive unseen, with the danger in view.** Move the lookout and the
   horn east, so that a hero standing just inside the door is out of the
   lookout's 7 tiles of sight whichever way it faces, while the lookout
   and horn are inside the phone's view from the door or a few steps in
   (about 8–13 tiles east of the door). Move `depot-fighter-1`'s walk off
   the door's first 8 columns too. The ledge's first step must be in view
   from the door. A player who walks straight in along the floor should
   still be seen and called on: being careless is still caught.
2. **A hiding place near the door**, a `hide` part on the floor within
   a few tiles of it (room file and its `//`), so a player can stop,
   watch the patrol and pick a moment.
3. **The hoard visible before you commit.** Make it visible from where
   a player first looks at the strongroom: open a gap in the strongroom's
   front, or move the hoard west within the strongroom, as long as the
   zero-alarm ledge route still works (re-time it). It must stay inside
   the strongroom and behind the guard.
4. **Re-time every depot scenario** for the new places, each control
   still watched to fail. Add one: `step16-door-unseen`, a hero walking
   in and standing at the door for 5 s is never seen (control: the
   lookout moved back to [6,13], seen).
5. **Shots**, by `npm run e2e`'s quarry block (or a variant): the door
   view, and the strongroom front, at 844×390. Look at them and write one
   line each under "Measure" in `docs/plan/step-16.md`: is the danger
   visible, is a way over visible, is the hoard visible.

## Traps

- **`bound` and the eight-person cap** are unchanged; don't add people.
- **The way-out check** for any tile change; **nothing under `src/`**.
- The **wings pedestal** (Step 9, agreed for [38,18] under the
  strongroom, in Step 9's own file) may land beside you: if it is on
  `main`, run every `step16-*` with it present.
- `git pull --rebase` right before each push; Steps 8, 9, 17 and 18 push
  beside you.

## Out of scope

Sight marks, barks, camera, art (Steps 4/12, 5, 8). Other quarry rooms.

## Verified when

`npm run check` green (time it), `npm run gates` 5 of 6, `npm run e2e`
green, `npm run check:deployed` exits 0 after the push, `/debug/errors`
read live before it.

## Done

The changes live, the shots described, a handoff note at the end of
`docs/plan/step-16.md`. Blocking question: message the lead at once.
Final message: done or blocked, the commit.
