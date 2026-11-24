# `npm run e2e` rewrites screenshots under `docs/plan/` on every run: make it write them only when asked

Brief for one builder, small, scripts only. Written 2026-11-24 13:25 UTC by
the orchestrator (`session_017WiGzHhT2apmWHT61rQ65G`).
**Reports:** `send_message` to the session on the Orchestrator line of
`docs/questions-for-the-owner.md`. **Notes:**
`docs/verifying-and-finishing.md`, "Traps".

## The task, and the measure

Moves no row of the plan's table; it removes a trap from every builder's
pre-push gate.

## Measured

- Every full `npm run e2e` leaves `docs/plan/step-22-shots/`,
  `step-23-shots/` and `step-24-shots/` files modified in the working tree
  (the orchestrator's runs all night; `git status --short` after a run at
  327d9e9 listed four `step-23-shots/*.png`, later six).
- Three builders restored them by hand and said so (hearts 1, the town's
  fifth, the HUD's third); the HUD's third pass committed 18 of them by
  `git add -A` at 36d070e and restored them at 0f63d6c.
- A screenshot's bytes differ run to run (timing), so the files always
  read as changed.

## Do

1. `grep -rn "screenshot\|\.png" scripts/e2e scripts/e2e.ts scripts/lib`
   and list every place a run writes under `docs/`; say the count.
2. Shots are written only when asked: an environment switch (say
   `E2E_SHOTS=1`, documented in `docs/verifying-and-finishing.md`) or the
   existing shot scripts (`scripts/hud-shots.ts` and the like). A plain
   `npm run e2e` writes nothing under `docs/`. A fact that needs a
   screenshot to judge something (not just to keep one) writes to a temp
   directory.
3. Prove: `npm run e2e && git status --short` prints nothing; with the
   switch on, the same shots are written as today.

## Paths, traps, scope

Yours: `scripts/e2e.ts`, `scripts/e2e/*.ts`, `scripts/lib/`,
`docs/verifying-and-finishing.md`, one line in `docs/roles/builder-card.md`
section 6 if a builder must know the switch. Change no fact's claim and no
`src/`. Other builders are editing files in `scripts/e2e/` tonight (the
camp's rows, the town, the thrown friend, the camera, the forest, the
quarry): keep each edit to the lines that write a file, rebase often, and
expect conflicts to be trivial. Scripts only: no redeploy.

## Decided vs. open

Decided: above. Nothing open.

## Verify

Build, check, one full `npm run e2e` with a clean `git status` after, one
with the switch on; pushed to `main`.
