# Step 2: can a phone player hit, grab, throw and switch, and does the other screen see a throw?

Brief by the Step 2 lead, `session_017WiGzGRnRoAeW5Ep5iSycV`, 2026-11-23
08:45 UTC, measured on `main` at 2f634bd. **Be lean:** the account has
one usage allowance until 13:20 UTC. No subagents, short messages, small
green pushes. **Done or cleanly stopped by 10:15 UTC**; from 10:00 UTC
`main` takes only finished, verified work.

## The task, and the row it moves

Two checks, and fixes only for what they show broken. Moves **M3**
(gate A) from "headless only" to "proven on a phone-sized page and
across two pages" (`docs/plan/step-2.md`, feedback signals 5 and the
"An action is not finished until a phone can press it" rule).

1. **Touch.** On the built page (`npm run build`, then the way
   `scripts/e2e.ts` starts a server), phone-sized with touch, one
   player by touch alone: hits a dummy, grabs a crate, carries it,
   throws it, switches hero. With a second page joined: grabs and
   throws the friend.
2. **Both screens.** A throws a crate, and A throws B: page B's own
   record of what it drew shows the crate fly, and B's own character
   fly. B, held, taps jump and is free on both pages.

## Derivation, already done

- `npm run e2e` and `npm run check:live` exist (`package.json`; one
  script, `scripts/e2e.ts`, with helpers in `scripts/checks/`). Read
  `docs/mechanisms/network.md` first: it says how the two pages, the
  server and effects fit, and how the existing facts are written.
- Touch controls are elements with `data-action="<id>"`, one per file
  in `content/actions/` (`src/client/touch.ts`). Actions today: jump,
  attack, grab, switch, interact.
- The page keeps `window.irreverents` with a `drawn` record the
  renderer fills each frame (`src/client/main.ts`, about line 143).
  **Assert through `drawn`**, never through server state.
- New players are seated as party members since 4678680 (first
  grappler, second infiltrator). The infiltrator cannot lift a heavy
  body, and nobody but the grappler lifts `crate-heavy`.
- Headless, all of this already passes: `step2-hit-throw-crate-at-dummy`,
  `step2-hit-throw-friend`, `step2-hit-break-free`,
  `step2-body-switch-two-players` (`npm run check`). So a failure here
  is in the page, the touch layer or the network layer, not the rules.
- Everything that moves a player goes through `emitEffect`
  (`src/sim/effects.ts`; `docs/architecture.md`, "Effects on a
  player"). Step 2 added `push.fly` and the kind `flatten` there.
- Which room and which bodies a new player meets is Step 3's and
  Step 4's (`content/game.json`, `content/placements/`). Read them
  before scripting; do not assume `graybox-hall`.

## Traps

- **A push deploys, with about a minute of "Application not found".**
  Add checks as new facts in the e2e script; run `npm run build && npm
  run check && npm run e2e` before every push, then `npm run
  check:deployed`.
- **`scripts/e2e.ts`, `src/client/**` (except `draw/`) and
  `src/server/**` are Step 1's**, and its Gate 2 worker may still be
  pushing. Add your facts in a **new file** under `scripts/checks/`
  with one call line in `e2e.ts`; `git pull --rebase` right before.
  If a fix is needed in a Step 1 file, do not make it: write what is
  broken, with the evidence, to me (below) and I take it to Step 1's
  lead. Fixes in `src/sim/verbs/`, `src/sim/systems/combat-*`,
  `carry-*`, `impact-*`, `src/sim/body-state.ts` and
  `src/client/draw/` are yours.
- **The check must not land in the owner's world**: use the private
  world the existing e2e uses.
- **Each new fact needs a control you watched fail** (for example, the
  attack button hidden; the throw's `push` effect dropped).
- Timing across two pages is not tick-exact: assert "within N
  seconds", as the existing facts do.

## Out of scope

The tuning panel; a "no number over a hit" script; any new mechanic;
feel and numbers; anything not shown broken by the two checks.

## Decided vs. open

Decided: `docs/plan/step-2.md`. Nothing is open for the owner.

## Verified by

`npm run e2e` exits 0 with your facts in it, each with a watched
failing control named in the commit message; `npm run check` and
`npm run gates` exit 0; live `/healthz` reports your commit.

## Done

- Facts on `main`, or a clean stop with nothing half-working.
- `docs/mechanisms/combat-and-impact.md`: three lines on what is
  proven by touch and across pages, and what is not.
- A message to me, `session_017WiGzGRnRoAeW5Ep5iSycV` (`send_message`),
  in plain words: **what a phone player can and cannot do by touch,
  and what the second screen does and does not see**, plus the commit.
  That message is the deliverable if time runs out before the facts
  are green: tell me by 09:50 UTC where it stands.
- A flag that is not blocking: `docs/for-the-lead.md`, headed with
  this file's name. Delete this brief when done.
