# In the cantina, a tap on a walking regular misses about half the time (Step 11)

Brief for one builder, a small one. Written 2026-11-24 05:25 UTC by the
orchestrator (`session_017WiGzHhT2apmWHT61rQ65G`). You measured this
yourself: `docs/plan/step-5.md`, "Builder notes > Flakes", the paragraph
"`cantina-row` / `cantina-swap` / `cantina-switch`: a game fault". Read
`docs/mechanisms/cantina.md` and `docs/mechanisms/network.md` ("Traps")
first.

**Reports:** `send_message` to the session on the Orchestrator line of
`docs/questions-for-the-owner.md`. **Notes:** `docs/mechanisms/cantina.md`.

## The task, and the measure

The owner confirmed the cantina (D-083, D-084): "tap one, the party shows
across the screen, tap a member to swap". On a phone a friend taps a
wandering regular and nothing happens about half the time. Moves no row of
the plan's table; it makes a confirmed thing work by touch (D-093) and three
e2e facts trustworthy.

## Measured (yours, f0389d8; not re-measured)

Taps on a regular walking at 50 px/s or more missed 19 of 40; on a standing
regular 0 of 40. The page draws others about `interpDelayMs` (100 ms) plus a
snapshot's age behind the server; the server tests the tap
(`src/sim/systems/cantina-swap.ts`) where it has the regular when the tap
arrives, the box grown by `pick.reach` (8 px): 17 px either side for the
brawler at 76 px/s, about 220 ms of walking. `cantina-row` failed 5 of 25
full e2e runs.

## Do

Judge the tap where the tapper's page drew things. Decided (`DRAFT:`, a
`docs/decisions-log.md` entry): the page sends, with the tap, the id of the
regular under the finger as it drew them (a field added to `tap`,
additively: an old page that sends none is judged as today), and the server
accepts it when that regular is within a lag allowance of the tap (a tuning
number in content, not a constant; start from how far the fastest regular
walks in 300 ms and say what you chose). Not a wider `pick.reach`: it would
catch taps meant for a neighbour.

## Paths, traps, scope

Yours: `src/sim/systems/cantina-swap.ts`, the tap's shape where it is
declared and sent (`src/net/`, `src/client/` input for taps), cantina
content tuning, the cantina's e2e facts and scenarios. Shared shapes change
additively only (`docs/architecture.md`). The server must still refuse a
named regular who is nowhere near the tap (a control: a tap with a far
regular's id opens nothing). The simulation stays deterministic: the id is
an input, like any other. Out of scope: the thrown-friend faults; anything
else in the cantina; the brawl.

## Decided vs. open

Decided: above. Open: nothing for the owner.

## Verify

Your scratch experiment again: 40 taps on a walking regular, 0 to 2 misses,
and the old build as the control; a scenario for the far-id refusal with its
control; build, check and one full `npm run e2e` green; pushed to `main`,
`npm run check:deployed` and `npm run check:live` ok.
