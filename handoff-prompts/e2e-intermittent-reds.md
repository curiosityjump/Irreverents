# The two-page test goes red about one full run in three, a different fact each time: measure which are the game's and which are the check's

**Landed so far:** nothing yet. (A builder stopping at its budget writes
its commits here, one line, before it stops.)

Brief for one builder. Written 2026-11-24 16:30 UTC by the orchestrator
(`session_017WiGzHY5UZsWTLCH8cLm8M`). Read first:
`docs/verifying-and-finishing.md` (the ladder, its traps, "The pre-push
gate"), `docs/mechanisms/network.md` ("Traps"), `docs/plan/step-5.md`
("Carried here" and whatever the builder of
`handoff-prompts/step-5-e2e-flakes.md` left: read that old brief and its
notes for what was already measured and fixed; do not repeat it).

**Reports:** `send_message` to the session on the Orchestrator line of
`docs/questions-for-the-owner.md`, after each push. **Notes:**
`docs/plan/step-5.md`, a section "The e2e's intermittent reds".

## The task, and the measure

`npm run e2e` (about 140 facts, two real pages, one phone-sized by touch)
is every builder's last gate before a push and the orchestrator's review.
A red that is not real costs each of them a twenty-minute re-run, and a
red that IS real (a phone that never draws GAME OVER, two phones that
disagree about a plate) is a fault a friend would see. Today nobody knows
which is which. Moves no row of the plan's table; it makes M3's evidence
trustworthy and may find faults a player sees.

## Measured

Full runs by the orchestrator today, each in a clean detached worktree,
one e2e at a time on the machine:

- at c4872c3: 139 of 139.
- at b36d325: 139 ok, 1 FAIL: `plates-friend-held`: "over 1.5 s, the
  plate under the friend drawn up on page A in 91 of 91 frames, on page B
  in 0 of 91 (expected none)". The gate was drawn open on both pages just
  before (`plates-courtyard` ok) and both walked through after.
- at cc2e80b: 139 ok, 1 FAIL: `hearts-game-over`: "the GAME OVER card
  was drawn (false), the page is in the cantina (true) and its stick then
  moved the hero (true, from x 193)".

Seen by others, one run each, not measured: `hearts-game-over` and
`outpost-break` red in one full run at ad51322 (each 5 of 5 alone);
`hearts-game-over` and `start-link-back` ("a tab that played  opened a
shared link", `inMain` empty) red in one of a builder's five full runs at
af69443; `start-continue-gone` red once in a builder's full run at about
14:14 UTC. Step 22's lead got 140 of 140 at 52856fc.

The facts: `scripts/e2e/plates.ts:156`, `scripts/e2e/defeat.ts:150`,
`scripts/e2e/outpost.ts:145`, `scripts/e2e/start-screen.ts:203` and
`:221`.

## Do

1. **Count first.** Run the full `npm run e2e` at least 8 times on one
   commit, nothing else running on the machine, keeping each log. Report
   per fact: reds of N. Then each fact that went red, alone, 20 times
   (or as its script allows), and under load (a second CPU-heavy process
   beside it), to say whether it is load.
2. **For each red fact, decide by evidence which it is:** the check's (it
   samples too late, too briefly, or assumes an order the game does not
   promise) or the game's (the page really did not draw the card; the two
   pages really disagreed for 1.5 s). The frames or the page's own state
   at the moment of the red are the evidence; a guess is not. `plates-friend-held`
   on page A and a missing GAME OVER card are both things a friend on a
   phone could see: treat them as the game's until shown otherwise.
3. **Fix what is the check's** in `scripts/e2e/` with its claim kept (a
   re-timed fact must still fail under its control: watch the control
   fail). **What is the game's and small**, fix in place with a scenario
   or fact that fails before and passes after. **What is the game's and
   not small**, or lives in a path another running brief owns, write up
   in the notes with the evidence and stop there.
4. Finish with 8 more full runs and the same table.

## Yours and not yours

Yours: `scripts/e2e/**`, `scripts/e2e.ts`, and the smallest fix in
`src/client/**` or `src/sim/**` that a proven game fault needs. Not
yours while their briefs run (read each brief's paths): the camera
(`handoff-prompts/camera-looks-at-what-matters.md`), a thrown friend's
collision and its netcode (`thrown-friend-through-a-crate.md`), the
suplex (`suplex.md`), the Bandit Camp's rows (`camp-entries.md`), the
thrower (`ranged-enemy-2.md`), the forest (`step-15-forest.md`), the
backdrops (`biome-backgrounds.md`). Never skip, loosen or delete a fact
to get green; never raise a wait without saying what the game promises
about that time.

## Done

Build and check green, the full e2e green 8 times running or each
remaining red named with its count and its evidence, pushed to `main`,
live (`npm run check:deployed`; `scripts/**` is in the deploy's watch
paths, so this redeploys: run the full code-push gate, read
`/debug/errors` and `/healthz` first). On a deploy that seems stuck with
`/healthz` healthy on an older commit: do not revert; wait up to fifteen
minutes pushing nothing (`docs/verifying-and-finishing.md`, "The
pre-push gate"). Stop at about 300k tokens with the "Landed so far"
block filled in.
