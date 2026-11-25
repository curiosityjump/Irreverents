# The two-page test goes red about one full run in three, a different fact each time: measure which are the game's and which are the check's

**For the third builder (orchestrator `session_017WiGzJYBCYJ85Bj95B7ZLw`, 2026-11-25 08:55 UTC), in this order, each its own small push:** (1) **the lookout ruling**, decided `DRAFT:` and written below under "Landed so far" (c48aee0): a lookout is not felled by his own camp's fight; only a hero's own blow, throw or thrown thing fells him. (2) **`suplex-again`'s real fault**: in the throne room, Grab beside the king takes `throne-crate-1` instead of him (the fact prints it: the hero in state carry, the king in "talk", held: the crate); a player hits this. Decide which body Grab takes when a person and a prop are both in reach (`DRAFT:` a knocked or standing person before a prop; log it), with a scenario and a control. (3) **`clash-street`**: red in 2 of the orchestrator's last 3 full runs (the guard knocked with the hero 61 px off, wants 64), green on repeat; and a blind look found no fight visible in its two shots (`docs/plan/step-8.md`, last section): make the fact hold on what a player sees and re-shoot both sizes with guard and villain in frame. (4) only if budget remains: `beaten-gone` red once in four full runs (313 attack taps in 150 s, nobody defeated). The runs' table: `docs/plan/step-5.md`, last section. No slots: push when green unless a code commit landed on main in the previous 3 minutes; never two pushes within a minute. Report to the session on the Orchestrator line of `docs/questions-for-the-owner.md`.

**Landed so far:** push 1 at 414564f (builder `session_017WiGzH3PZgYkQHanedEq8e`,
stopped at its budget): `start-link-back` the game's, fixed (`start-title-late`);
`hearts-game-over` the check's half fixed, the game's half briefed
(`page-misses-what-happened.md`); doors and plates facts print where the
heroes stood. Owed: the grab, doors, plates and `row-both-sides` reds
(unknown; table in `docs/plan/step-5.md`, "The e2e's intermittent reds"),
runs under load, and the 8 closing full runs.
Pushes 2-4 at 8e2807d (second builder `session_017WiGzFFLrDf959S3iaSd8L`, stopped at its
budget; live in a154c88, check:deployed and check:live ok): `row-both-sides` the game's
(the camp's own blows broke its horn: `ownSpared`, `DRAFT:`) and the check's (a try starts
again when the lookout was felled or the hero flung off column 21), fixed;
`suplex-again` now prints where it stops (red in my full run at 67d83a8: the hero drawn
carrying something, not the king; Use offered nothing). Owed: `suplex-again` on its next
red (read what it says is held), the grab, doors and plates re-count (no red in 2 full runs
on a tip with 3314c47), runs under load, the 8 closing full runs; the orchestrator's ruling
on the lookout felled by his own camp's fight (now ruled, below). Notes:
`docs/plan/step-5.md`, the second builder's section.
**The orchestrator's ruling, 03:25 UTC (`DRAFT:`), for the next builder:** a lookout is not
felled by his own camp's fight: a body his own side knocked into him (a hero flung by a
bandit's blow included) does not knock him down or stop his call; only a hero's own blow,
throw or a thing a hero threw does ("Getting caught opens play": the alarm keeps climbing, not
quiet by the camp's own hand). Not built: it is not the horn's rule. A knock-out is wear
(`wear()` in `src/sim/body-state.ts`, called from `impact-bodies.ts` with `fa.by`, the one who
sent the striking body flying), not `outpost-signaler`; the doer is already there (`fa.by`),
so the likely shape is an optional per-outpost field read where wear knocks a caller out, or
where `outpost-call` stops a call on `knocked-out`. One push: a scenario with a control (the
first-row fighter flinging the hero into the lookout; the e2e's run 24 shape), a decisions-log
entry with how to undo it, the `DRAFT:` at the code site.

**For the second builder, from the orchestrator, 22:20 UTC. First, `row-both-sides` (the camp's second call), because it has now gone red in three of the last five full runs** (at 4881e33 mine; at 6755d3f a builder's; at 0e0d309 mine: "try 1: the horn post was broken before \"Two more!\"; try 2: the horn post was broken before \"Two more!\"; then ... no \"Two more!\" banner in 90 s"; green at 254efc8 and 3ddd9c2). Read `docs/plan/step-4.md`, "Camp entries, item 3" (its builder: the camp's own swings break the horn beside the fight about 1 run in 4; once in about 20 no second call came in 60 s with the horn whole, undiagnosed), `docs/mechanisms/outposts.md`, `docs/deliberate-designs.md` (grep horn, post, D-061). Two things, by evidence:
- **The camp's fighters breaking their own horn.** D-061 lets a PLAYER break the post to stop the calls. A bandit's own swing or a body he knocked into it ending the camp's alarm is, by the orchestrator's reading, not that design (`DRAFT:`, one `docs/decisions-log.md` entry, the other answer a one-line data change): the camp's own people's blows do not damage the camp's own signal post; a hero's blow, a thrown hero or thing, a ram and a suplex's splash still do. Measure first how often it happens in play (N runs of the fact, the tick and the doer of each break); then make it so as data on the post or the outpost if a field exists, else the smallest additive rule; scenarios both ways with controls. If `docs/deliberate-designs.md` says the camp breaking its own horn is intended, stop and tell the orchestrator.
- **The call that does not come with the horn whole.** Reproduce it (the fact alone, 40 runs, logging the lookout's state, sight of the hero, the alert's level and the dispatch's timers each second); say whether the lookout was felled, lost sight, or the dispatch stalled; fix what is the game's with a scenario, what is the fact's with its claim kept.
The dropped-events fix landed at 3314c47 (`docs/plan/step-5.md`, "A page misses what happened"): re-count the other unknown reds (the grab, doors, plates) only AFTER it, with 8 full runs on a quiet machine; several may be gone. `scripts/e2e/camp-row.ts` is yours.

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
