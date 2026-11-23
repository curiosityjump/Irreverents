# Step 16, slice 3 push 3: two room edits, so the depot has a second quiet way and the planned escape

Brief for a fresh builder. Written 2026-11-23 18:45 UTC by the Step 16
lead (`session_017WiGzHt9iJy3caBLkT1Ef4`). The step is
`docs/plan/step-16.md` (read "What's decided" from "The guarded place"
on, and its Measure entries from 18:30 UTC). Read
`docs/mechanisms/rooms-and-doors.md` ("The room file", "The way-out
check") and `docs/mechanisms/outposts.md` before editing.

**Hard stop: 60 minutes after you start, with whatever is green. Nothing
half-working on `main`.** One push, or two if the first item is ready on
its own; `send_message` the lead with each commit.

## The task, and what it moves

The bad guys' depot (`content/rooms/quarry-depot.json`, Step 16's own
file) has one quiet robbery today: the flyer over the roof
(`step16-zero-alarm-roof`). The step asks for two, through different ways
in, and for a caught hero to be able to take the hoard and run for the
pit and the cave. Slice 3's builder measured why neither exists. Fix both
with room edits only. Signals 5 and 6(b). Moves no M-row; `npm run
gates` must still print 5 of 6.

## Measured for you (at 36d838d; `npm run check` green, 63 `step16-*` scenarios)

- **No quiet way across the yard on foot.** The lookout turns on the
  spot on the yard's one floor line (row 13), so one side of it is always
  in view; sight is 112 px across and 40 px (2.5 tiles) up and down. The
  stack `yard-stack` (column 20) is two tiles, inside that. Step 12's camp
  solves it with a one-way ledge five tiles over its lookout.
- **The cellar shaft is one-way.** The one-way ledge at row 15, columns
  42–44 fills the shaft; physics has no drop-through. So a hero who
  climbs from the cellar into the strongroom cannot go back down, and
  nothing inside the depot leads down to the cellar, the pit door
  (`to-pit`, column 0, rows 16–18) and the cave. `step16-caught-escape`
  therefore leaves by the tower door and does not take the hoard.
- **The heroes' reach:** jump peak about 3.2 tiles, flyer 7.75 with
  flaps; main-way steps at most 2 tiles, gaps at most 2 (`docs/plan/step-16.md`,
  Measure, 15:10 UTC).
- **Door carry** (measured in push 2): a patrol chasing a hero who leaves
  by `to-tower` walks to column 1 and stands; a body knocked into a door's
  tiles is carried through.

## What to build (`DRAFT:`; log each in `docs/decisions-log.md`)

1. **A ledge over the yard's west stretch**: one-way tiles at about rows
   8–9, columns 2–13, reached by hops the grappler makes from the tower
   door's side (steps at most 2 tiles, gaps at most 2), coming down east
   of the lookout's reach in sight. The flyer's roof route must still
   pass.
2. **A way down from the depot to the cellar**: e.g. a hole (two tiles
   wide, for the widest body) from the strongroom floor or the yard's far
   end into the cellar or `under-the-strongroom`, so a hero with the hoard
   can drop to the cellar and leave by `to-pit`. Keep the cellar's
   `cellar-wall` secret meaningful: the drop must not make the
   grappler's cellar way in trivial from outside (it comes from inside).
   The way-out check must stay green for every party member.
3. **Scenarios** (`step16-*`, each with a control watched to fail):
   - `step16-zero-alarm-ledge`: the grappler (or infiltrator) on foot over
     the ledge, takes the hoard, leaves unseen; no `outpost-call-started`,
     every depot person at mood 1. Control: the same route a beat earlier
     (or the ledge's tiles made empty by a `tiles` override) is seen and
     a call starts.
   - `step16-caught-escape-cave`: seen, a call completes, the hero takes
     the hoard, drops to the cellar, leaves by `to-pit`, reaches
     `quarry-cave`; no `outpost-wave` after the hero left the depot and
     no wave person outside it. Control: the drop's tiles made solid, and
     the hero does not reach the cellar.

## Traps

- **Every existing `step16-*` scenario must stay green unchanged**,
  above all `step16-across-*` and `step16-back-*` (they cross the yard)
  and the zero-alarm and caught ones. If a new tile breaks one, move the
  tile.
- **Spawns and the lookout's facing:** a recorded tick shows the world
  before that tick's step; nobody has `c.npc` at tick 0.
- **Nothing under `src/`.** Data, scenarios and docs only.
- Others push beside you (Steps 8, 12, 17, 18): `git pull --rebase` right
  before the push, `npm run check` after.

## Out of scope — leave alone

The depot's people and outpost file (keep them; retime a patrol only if a
new route needs it and log it); Step 12's systems; the undercroft way home
(deferred); the look.

## Verified when

`npm run check` green (say its time), `npm run gates` 5 of 6, `npm run
e2e` green, `npm run check:deployed` exits 0 after the push; read
`/debug/errors` live before it.

## Done, and where things go

Done: the edits and both scenarios on `main` and live. Update the depot
room's `//` and `docs/mechanisms/outposts.md`'s depot line; a handoff note
at the end of `docs/plan/step-16.md`. Blocking question: message the lead
at once. Flags: `docs/for-the-lead.md`. Final message: done or blocked,
the commit.
