# Step 3: make the way-out check cheap again

Brief for one cold builder. Written 2026-11-23 16:45 UTC by the orchestrator
(`session_017WiGzHhke4tkAThPgw6EXs`), which holds Step 3 for this fix.
Read `docs/mechanisms/rooms-and-doors.md` (the way-out check, its `INTENT:`s)
and `src/sim/check-rooms.ts` before changing anything.

**Reports:** `send_message` to the session on the Orchestrator line of
`docs/questions-for-the-owner.md`, after each push, with the commit and the
before/after timings. Notes file: `docs/plan/step-3.md`, a new last entry
under its handoff notes.

**At most two pushes, each standing alone. Nothing half-working on `main`.**

## The task, and what it moves

Since the quarry's six rooms were joined (Step 16, 78c4959), the way-out check
dominates every build and check. Measured by the Step 16 lead in a cloud
container: **`checkRooms` alone 97 s**; `npm run build` 38 s at 7500b81 → **93 s**
at 1e35d37; `npm run check` 77 s → **224 s**. All of it is the six quarry rooms
(84×20, 80×16, 20×30, 64×20, 40×20, 30×14 tiles) × three party members. It is
paid by every `npm run build` (so every Railway deploy, roughly a minute of
extra downtime per code push), every dev rebuild, `scripts/trace.ts`,
`npm run gates`, and several times over in `npm run check`
(`scripts/lib/room-controls.ts:66` runs `checkRooms` again per control).

Where it runs: `loadContent()` (`scripts/lib/content-files.ts:37-47`) →
`checkContentAgainstSim` → `src/sim/check-content.ts:94` → `checkRooms`
(`src/sim/check-rooms.ts:13`) → `checkWaysOut`. Callers of `loadContent`:
`scripts/build.ts:17`, `scripts/check.ts:35`, `scripts/gates.ts:10`,
`scripts/trace.ts:14`.

It moves no M-row. It is for every session's speed, the owner's deploys and,
above all, the next levels: Step 16 has more rooms coming, and the cost grows
with every screen.

**Targets (`DRAFT:`):** `npm run build` back under 45 s and `npm run check`
under 120 s in this container, with every room still checked.

## What to do (in this order; stop when the targets are met)

1. **Profile first** (`node --cpu-prof` on a script that calls `checkRooms`
   on the loaded content): where the 97 s goes per room and per member. Write
   the numbers in your notes.
2. **Make the algorithm cheaper without weakening it.** Likely wins to test, by
   measuring: not re-simulating start states already reached (a visited set
   keyed by the quantised state the check already uses); stopping a member's
   search as soon as every door/exit it must reach is reached; sharing work
   across members whose bodies are the same size. Every room that passes today
   must pass, and every control that fails today must still fail.
3. **Run it where it's needed, not on every load.** `npm run check` keeps the
   full check (it is the pre-push gate, `docs/verifying-and-finishing.md`).
   `npm run build`, dev rebuilds, trace and gates may skip the way-out half of
   `checkRooms` (the part checks stay), through an explicit option to
   `loadContent`, never by default. `INTENT:` at the option: the build is not
   the gate; `npm run check` is, and nothing is pushed without it.
4. Optional, only if 2 and 3 don't reach the targets: a git-ignored cache of
   the way-out result keyed by a hash of every room file, the party, those
   members' tuning sections and the source of `src/sim/**`, used by `npm run
   check` only.

## Decided

- "There is always a way out" (`CLAUDE.md`, design principles): the way-out
  check is how the project proves it. It stays in `npm run check`, it checks
  every room, and its controls stay.
- Don't shrink or change any room (the quarry's 12.4 screens are Step 16's
  measure); don't change any body's numbers.

## Traps

- `INTENT:`s in `src/sim/check-rooms.ts` (around lines 166 and 197) say why
  some parts are read pessimistically and why a room without doors counts as
  standalone. Keep both behaviours.
- `room-controls.ts` passes its own `systems` to `checkRooms`: a speed-up must
  keep working with a control's systems, or the controls stop proving anything.
- Railway builds in a fresh container, so a cache never helps a deploy: only
  step 2 or step 3 shortens the deploy.
- Other builders are pushing to `main` all the time (Steps 2, 11, 12, 16, 17):
  `git pull --rebase` right before each push.

## Out of scope

Any room's layout; the e2e (Step 16's touch crossing of the road is its own);
the scenarios' content.

## Done

`npm run build`, `npm run check` and `npm run e2e` green; before/after timings
in the commit message for `npm run build`, `npm run check` and `checkRooms`
alone; a control watched to fail after your change (break one quarry room's
only exit in a scratch copy and see the way-out check refuse it); pushed to
`main`; `npm run check:deployed` current; `docs/mechanisms/rooms-and-doors.md`
updated where it describes when the check runs.
