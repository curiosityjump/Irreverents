# The Bandit Camp's rows: never seal the door, reach the east half, and be seen arriving (Step 4 / Step 20)

Brief for one builder, three small pushes. Written 2026-11-24 07:35 UTC by
the orchestrator (`session_017WiGzHhT2apmWHT61rQ65G`). Read first:
`docs/plan/step-4.md`, "Push 3" and "Push 4" (the both-sides engine and its
switch-on in the camp); `docs/plan/step-20.md`, "Builder notes", push 3 (the
wave's wagon); `docs/mechanisms/outposts.md`.

**Reports:** `send_message` to the session on the Orchestrator line of
`docs/questions-for-the-owner.md`, after each push. **Notes:**
`docs/plan/step-4.md`, a "Camp entries" section.

**Landed so far (2026-11-24 10:30 UTC), by `session_017WiGzGkuNQcsBDa2oWh23s`, which stopped at its budget:** push 0, a find outside the brief: the brawler could not walk out of the camp; a one-way tile at (8,9), all five heroes in and out (0949f2c); push 1 of "Do", the door kept clear: `doorClear` on the outpost (4f56b7a; `step7-last-stand-camp` re-timed, waves 4, felled 5; measured gap: a hero 13-16 tiles in who turns for the door still meets the west half at the step, 2 of 100 in its probe). **Then, by `session_017WiGzJpgPTTMymzeBeX6qW`, which stopped at its budget:** "Do" item 2, the east half, live at 3c370a7 (entries 50/62/74, `sendNoneNearer` 8, `breakThrough` 0.5 s / 200 through `breakPartAt`; `camp-entries-east-break-through`; four scenarios re-timed; `check:live` ok). Item 3 and the 2-in-100 door case are left: notes in `docs/plan/step-4.md`, "Camp entries, next builder", last bullet. **You are a fresh builder. Read `docs/plan/step-4.md`, "Camp entries" (its handoff at e262190: the east half's measurements, the entry choices worked on paper with their one in-view case, and a drafted, unrun breaker system at `docs/plan/step-4-break-through.ts.txt`). What is left:**
- **"Do" item 2, changed by the orchestrator's ruling at 08:45 UTC (`DRAFT:`, one `docs/decisions-log.md` entry):** the east half (cols 44-87) is cut into pockets by pieces the camp's fighters cannot climb (47, 55-56, 64-65, 75). A row must not appear in plain view a few tiles from a hero ("come in from the sides"): keep the east entries off-screen, and make the row able to reach you: a wave's bandit blocked by a **breakable** piece between him and the hero he is coming for breaks it, a short wind-up then the piece's own broken stage, as an optional flag on the outpost (additive; off for the depot and the test rooms), through the breakables' existing break path. A piece that is not breakable still stops him and stays cover. If `room-breakable.ts` cannot take an NPC breaker without more than a small change, stop and say what it needs, and ship the off-screen entries alone.
- **"Do" item 3** as written: the phone screenshot of a row at both screen edges with its banner, and the e2e fact.
- If budget remains: the 2-in-100 case at the door.

## The task, and the measure

The owner, ~01:05 UTC on 2026-11-24, first-hand: "Alarms should spawn more
enemies of increasing strength that come in from the sides". It is live in
the Bandit Camp (4154e15; the fourth call brings a driven wagon, ff0d9ad).
Three leftovers, handed on twice by builders at their context budgets. Moves
no row of the plan's table; it finishes a thing the owner named.

## Measured (read at ff0d9ad, not run)

`content/outposts/outpost.json`: `entries` [[6,7],[24,10],[30,10],[36,10],[41,10]],
`entryAway` 12, five `announce` lines ("Here they come!", "Two more!", "Here
comes a heavy!", "Here comes a wagon!", "Here comes the brute!"). The camp
is 88 columns wide and has one door, at its west end; the entry [6,7] stands
beside it. The alarms builder reported: "the west entry [6,7] sits beside
the only door so the brute can come in between you and the way out"; and
that entries at [58,10] and [70,10] for the east half (cols 44-87) turned
`step23-thrown-out-leaves-it` red. That scenario has since been re-pointed
(ef08490: the camp no longer throws a hero out). No phone screenshot shows a
row arriving at both screen edges: only the horn's banner.

## Do, each its own push

1. **A hero at the door is never sealed in by an arriving row** (CLAUDE.md,
   "There is always a way out": waiting may be a cost, being stuck may not).
   Measure first: a scenario with a hero standing at the door when each of
   the five calls completes; where does the west half arrive, and can the
   hero still walk out? Then move the west entry, or hold that half back
   while a hero stands within `entryAway` of the door, whichever keeps "from
   both sides" true for a hero in the middle of the camp. Mark the choice
   `INTENT:` at the data and add the line to `docs/deliberate-designs.md`.
   A scenario and its control.
2. **Entries for the east half**, so a hero seen at column 60 gets a row on
   both sides of them, not two screens away. Count reds before re-timing
   anything; a red in another step's scenario goes to that step's builder by
   message (weapons: nobody running, yours with the claim kept; hearts:
   `session_017WiGzFDViUtdwKrLFTvhrd`), with the list in your report first.
3. **A phone screenshot** (sideways, phone-sized, by touch) of a row walking
   in at both screen edges with its banner up, into
   `docs/plan/step-4-shots/`, and an e2e fact that the page draws a
   newcomer on each side of the hero within a few seconds of the banner.

## Paths, traps, scope

Yours: `content/outposts/outpost.json`, `content/placements/outpost*.json`
if an entry needs a tile cleared, `scenarios/` for the camp (the `step7-*`,
`step12-*`, `sides-*`, `step20-camp-*` ones were re-timed at 4154e15 and
ff0d9ad: keep every claim, watch every control fail), `scripts/e2e/` camp
facts, `src/sim/systems/outpost-wave.ts` and `outpost-fight.ts` only if the
door rule cannot be data. `step7-last-stand-camp` and `step7-hall` carry
build gate E: `npm run gates` must read 6 of 6. `hearts-game-over` fails
some runs on `main` and is another builder's: not yours, but tell it if
your entries change where the last hero stands. The quarry and the town are
not yours. Stop at about 300k tokens wherever you are, with notes.

## Decided vs. open

Decided: rows from both sides; never sealed at the door. Open, yours,
`DRAFT:` with a `docs/decisions-log.md` entry: which of the two door rules.
Nothing for the owner.

## Verify

Build, check, gates 6 of 6, `npm run e2e`; pushed to `main`;
`npm run check:deployed` and `npm run check:live` ok after each push.
