# The two-page check's walk to the cellar doorway misses under load (a check fault, not the game)

Brief for one builder, a small one. Written 2026-11-24 04:05 UTC by the
orchestrator (`session_017WiGzHhT2apmWHT61rQ65G`) from a subagent's trace.
**Reports:** `send_message` to the session on the Orchestrator line of
`docs/questions-for-the-owner.md`. **Notes:** `docs/plan/step-5.md`, "Builder
notes > Flakes".

## The task, and the measure

`npm run e2e`'s `plates-stone`, `plates-stone-held` and `plates-pocket` fail
together some runs. Moves no row of the plan's table; it makes the pre-push
gate trustworthy.

## Measured (by the orchestrator and its subagent, 2026-11-24)

- Full `npm run e2e`: all three failed at 5e9e6cb and at 8b2fee3 on the
  orchestrator's machine while it was busy; a full run at 5e9e6cb in a clean
  worktree passed. The buttons builder saw 2 of 7 full runs fail, 8 of 8 pass
  alone.
- Plates facts alone (a runner that starts `dist/server.cjs` and calls
  `plateFacts`): 0 of 5 fail at 327d9e9, 0 of 5 at 5e9e6cb, 0 of 8 at 0de4ec5;
  in 2 of those 8 page B missed the doorway on try 1 ("did not go down ... at
  x 124") and got down on try 2.
- The mechanism: `down()` at `scripts/e2e/plates.ts:120` calls
  `standAt(ph, doorX, 1)`, `doorX` 115 for the infiltrator (10 wide).
  `standAt` steers west to x <= 118 and B coasts to 112-114; then its 60 ms
  "face east" touch (`scripts/lib/e2e-touch.ts:169-175`) moves B 8-12 px, to
  120-122 on a quiet machine and 124-129 under load. The cellar doorway is
  the single column 7 (x 112-128, `content/rooms/castle-street.json` row 9);
  once x >= 123 B's middle is in column 8, the hide curtain, and Use hides
  instead of going down. The retry loop at `plates.ts:119-132` repeats the
  same walk, so under load all three tries miss.
- No commit in 327d9e9..5e9e6cb touches this path. A player standing in the
  doorway goes down as designed.

## Do

Let `standAt` skip the nudge when `face` is 0 (guard the touch block at
`e2e-touch.ts:170` with `if (face !== 0)`), and call `standAt(ph, doorX, 0)`
in `down()`. `scripts/e2e/glints.ts:77` uses `standAt(..., 1)` before its
cellar Use: measure its margin and change it the same way if it is as thin.
Not verified by anyone: the fix itself, and why a 60 ms touch travels 8-12 px
(if that is the game overshooting a short stick touch on a phone, say so in
your report: it would be a finding for Step 5, not yours to fix here).

## Paths, traps, scope

Yours: `scripts/e2e/plates.ts`, `scripts/e2e/glints.ts`,
`scripts/lib/e2e-touch.ts`. Every other caller of `standAt` must behave
exactly as before (count them, `grep -n "standAt(" scripts -r`, and say the
number). Change nothing in `src/` or `content/`. Never run two e2e at once.

## Verify

The plates facts 10 of 10 with four busy loops loading the machine, a control
(the old call) missing at least one try under the same load, one full
`npm run e2e` green, pushed to `main` (scripts only: no redeploy).
Decided vs. open: nothing open.
