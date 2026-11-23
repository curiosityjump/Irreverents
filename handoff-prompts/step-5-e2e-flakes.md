# The two-page checks that fail some of the time: find out whether the game or the check is wrong (Step 5)

Brief for one builder. Written 2026-11-23 21:35 UTC by the orchestrator
(`session_017WiGzJzo6aZqH4kYxxJsiV`). Read `docs/verifying-and-finishing.md`
(the ladder, "Traps"), `docs/mechanisms/network.md` ("Traps", "Predicted
hits") and `docs/plan/step-5.md`'s last handoff entries first.

**Reports:** `send_message` to the session on the Orchestrator line of
`docs/questions-for-the-owner.md`, after each finding and each push. Notes:
`docs/plan/step-5.md`, a "Flakes" section under "Builder notes".

**Landed so far (2026-11-23 22:46 UTC): task step 1, the measurement, at a98c7f6** by `session_017WiGzJujVWWDboh12zWhNR`, which stopped at its context limit. 10 runs at 54ce74b on a quiet machine, 4 with a failure: `cantina-row`/swap 3 (a tap on a wandering regular opened nothing), `h1`+`h2` 1 (the page stayed "Reconnecting…" through two server restarts although the server was up; no page error; likely real), `t-throw-friend` 1. The table, the failing lines and each fact's next step are in `docs/plan/step-5.md`, "Builder notes > Flakes": read that first. The harness cannot run one part. Others saw `h1` far more often under load (5 of 7 for the rescue builder; 2 of the orchestrator's last 6 runs). **You do task steps 2 to 5, `h1`/`h2` first.**

## Why

The owner confirmed for phones: "coming back after a sleep or a network
change" (`CLAUDE.md`, "It is for friends"). `npm run e2e` is the only check of
that, and of two players grabbing and throwing each other, and on 2026-11-23
several facts failed some of the time. A check that fails sometimes is either
a real fault a friend will hit on a phone, or a check nobody can trust: both
cost. Seven sessions pushed to `main` today and each called these "not mine".

## What was seen (none of it measured as a rate; that is your first job)

- **`h1`, `h2`** (the server is down 75 s under both pages, then returns; the
  page should come back): failed for the powers builder once on a rebased tree
  (64bd1fe), for the hit-prediction builder (also at 4022fd6, which has no
  prediction), for the heist builder under load, and the glints builder says
  `h1` fails on `origin/main` at a1741fa in a clean worktree ("page does not
  come back"). It passed in the orchestrator's runs at 9dd3561, 4022fd6,
  64bd1fe and f4a3cc9.
- **`t-grab-friend`, `s-break-free`, `t-throw-friend`**: `t-throw-friend` and
  `t-grab-friend` failed 3 runs in 14 earlier in the day ("no throw happened
  server-side"); at eb57448 the orchestrator saw `t-grab-friend` (neither page
  drew B lifted) and then `s-break-free` fail in one run of two. eb57448 holds
  hit prediction (299a4d6); 4754ec5 since predicts throws too. Whether
  prediction made this worse is not known.
- **`cantina-row`** (a tap on a regular opens the party row): failed once each
  for the orchestrator's first run at ab3ecb1 (probably), the Step 18 builder
  (twice in full runs, never alone) and the heist builder.
- **`level-full`, `level-menu`**, **`start-link-back`**, **`start-continue-gone`**:
  once each, under load.

## The task, in this order

1. **Measure.** On a quiet machine (nothing else running; say how you know),
   run `npm run e2e` at current `main` at least 10 times, keeping every log.
   A table in your notes: fact, failures of N, the failing line each time. Then
   the same for `h1`/`h2` and the friend-grab facts alone if the harness can
   run a part (if it cannot, say so; do not build that first).
2. **For each fact that failed, decide by evidence which it is:** the game
   (the server or page really did the wrong thing: read the server's world and
   `/debug/errors` at the moment of failure, add logging to the check, never to
   shipped code paths without removing it), or the check (a wait too short, a
   tap sent before the page was ready, two checks sharing a world, load). A
   control each time: show the failure appear and disappear with the one thing
   you changed.
3. **`h1`/`h2` first.** If a page really does not come back after 75 s down,
   that is a fault a friend hits when a phone sleeps: fix it in the client's
   reconnect, with the fact made to fail before and pass after, 20 runs of 20.
4. **The friend grab and throw second.** If prediction (299a4d6, 4754ec5) is
   in it, the fix is in `src/client` prediction only; the look-ahead numbers
   are `DRAFT:` and the hit-prediction builder's notes say how they were
   measured.
5. **A check that was wrong gets fixed as a check**, never loosened to pass:
   never raise a limit, skip a fact or add a retry to get green. If a fact
   cannot be made honest, say so and leave it failing.

## Decided

- One small push per fault, each with `npm run build`, `npm run check` and
  `npm run e2e` green three times running, live (`npm run check:deployed`,
  `npm run check:live`).
- A finding with no fix is still a result: write the rate and the evidence.

## Open (yours; `DRAFT:` and `docs/decisions-log.md` for any choice)

- Whether e2e should run its parts in separate worlds or serially.

## Paths

Owns: `scripts/e2e.ts`, `scripts/e2e/*.ts`, `scripts/lib/e2e-touch.ts` (other
builders append facts to these today: pull before every edit, change only the
lines of the facts above, and tell the fact's owner by message); the client's
reconnect code if `h1` is real. Must not touch: `src/sim/**`, `content/**`,
any other step's scenarios.

## Done

The table of rates before and after; each fault either fixed (with its
control) or written up as open with evidence; pushed; live.
