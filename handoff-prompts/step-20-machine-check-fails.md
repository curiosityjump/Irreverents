# The wagon's two-connection check fails some runs: find out whether the game or the check is wrong (Step 20)

Brief for one builder. Written 2026-11-24 03:10 UTC by the orchestrator
(`session_017WiGzHhT2apmWHT61rQ65G`). Same shape as
`handoff-prompts/step-5-e2e-flakes.md`, which you just finished. Read
`docs/mechanisms/machines.md` ("The seat") and the header of
`scripts/checks/step20-machine.ts` first.

**Reports:** `send_message` to the session on the Orchestrator line of
`docs/questions-for-the-owner.md`, after the finding and after each push.
**Notes:** `docs/plan/step-20.md`, a "The check that fails some runs" section
under its builder notes.

## The task, and the measure

`npm run check` is half of every pre-push gate, and its check
`step20-machine` fails some runs. Moves no row of `docs/plan.md`'s table; it
protects M3 (gates are read from `npm run check`'s scenarios and checks) and
every builder's gate. A wagon whose driver is corrected mid-drive is also
something a friend would feel on a phone, if it is the game.

## What was measured

- **The orchestrator, 2026-11-24:** `npm run check` four times on `main`
  (twice at 327d9e9's code, once at 774d888's, once at 8b2fee3). The first
  three passed; the fourth failed with only this check red:
  ```
  FAIL  check step20-machine: 2 problem(s)
        b's page never heard the barrier break while a drove at it (a's page at x 582, vx -57)
        the server sent 12 effect(s) to a while a drove at the barrier: a's page was corrected
  ```
  The machine was also running nothing else at that moment (the e2e had not
  started).
- **Reported by builders, not re-measured:** 3 of 9 runs (props, during its
  gates), 2 of 4 (weapons, with a control on `origin/main`), "about 1 run in
  4 with hearts off too" (hearts), once (the beaten builder). First logged at
  bbb9702 in `docs/plan/step-5.md`.

So the failure is on `main`, is not any one of tonight's pushes, and its two
problems come together: the server corrected the driver, and the barrier did
not break in time.

## Do

1. **Measure the rate**: the check alone, 20 times, on a quiet machine, at
   `origin/main`; record failures and their messages. If `npm run check`
   cannot run one check alone, add a way that changes nothing else (say how
   in `docs/verifying-and-finishing.md`).
2. **Find the cause**: log what the 12 effects are and why the server sent
   them (what differs between a's reported body and the server's). Decide:
   the game (a driver really is corrected: then a phone player would feel the
   wagon jerk) or the check (a timing assumption).
3. **Fix what is yours** (below) and show the rate after, 20 runs, with a
   control that still fails when the fault is put back.

## Paths

Yours: `scripts/checks/step20-machine.ts`, `scripts/lib/` only for a
run-one-check switch, your notes section. If the cause is in the game
(`src/sim/`, `src/net/`, `src/server/`) and the fix is small and you can show
it with the control, make it, naming the lines in your report first. **Not
yours:** `content/`, the camp's wagon and its scenarios (`step20-camp-*`):
the vehicles B builder (`session_017WiGzGehKBFBBGaoRu2awP`) is pushing there
tonight; `src/sim/systems/outpost-fight.ts` and `outpost-wave.ts` are the
chase builder's.

## Traps

- `main` moves every few minutes tonight; rebase before each gate and expect
  the gate to outlast a rebase. Never weaken the check's claim to make it
  pass: "no effect corrects a while they drive" is the design
  (`docs/mechanisms/machines.md`). If the claim is wrong, say so and stop.
- Two e2e runs at once make other facts fail (your own finding); measure on a
  quiet machine.
- Hearts landed tonight (a driver can now lose hearts and be out): check
  whether the corrections are that, before anything else.

## Out of scope

`cantina-row` and the friend-throw faults you found: they will be briefed
separately. Any change to how the wagon drives or feels.

## Decided vs. open

Decided: a driver's own page drives and is not corrected. Open: nothing for
the owner.

## Verify

Build and check green, the check 20 of 20 after the fix, the control watched
failing, pushed to `main`, `npm run check:deployed` ok. A code change a player
could feel also needs `npm run e2e`'s machine facts.
