# The owner, playing: a knocked-out enemy collapses, then flies off the screen

Brief for one builder. Written 2026-11-23 23:50 UTC by the orchestrator
(`session_017WiGzJzo6aZqH4kYxxJsiV`). **The owner's words, first-hand to the
orchestrator, ~23:47 UTC, while playing the live game:**

> When an enemy gets knocked out, they collapse, then randomly fly off the screen. Very weird

That is all that is known: not which enemy, which room, which hero, or
whether a friend was playing. The live game was at about 0457923 (the camp's
waves, the town's dispatch rows, power orbs, hit and throw prediction, the
legend detector had all landed that evening). Read
`docs/mechanisms/combat-and-impact.md`, `docs/mechanisms/network.md` ("Traps",
"Predicted hits"), `docs/mechanisms/outposts.md` and
`docs/verifying-and-finishing.md` first.

**Reports:** `send_message` to the session on the Orchestrator line of
`docs/questions-for-the-owner.md`: the moment you can reproduce it (what,
where, a screenshot sequence), and after each push. Notes:
`docs/plan/step-5.md`, a section "Knocked-out enemies fly off".

## The task

1. **Reproduce it as the owner would see it:** a phone-sized page, by touch,
   against a real server with delay added each way (the e2e harness can do
   both), knocking out each kind of enemy where a player meets them: the
   quarry road's fighters and heavy, the Bandit Camp's lookout and fighters
   and a wave's arrivals, the depot's people, the street's guard, shopkeeper
   and villain, a dispatch row's guards, a cantina regular. Record each
   body's drawn position every frame from the blow until 10 s after. Say for
   each: lies and gets up; or moves while down (how far, how fast, where to).
2. **Find the cause by evidence, not by reading alone.** Suspects, none
   measured, in the order I would try them:
   - **A removed body's id or drawn slot is reused or lerped.** Since 91b83a5
     a beaten wave's people leave (`src/sim/systems/outpost-leave.ts`:
     `removeEntity` when out cold `leaveCold` long, or stalled), and since
     e4eb3c9 a dispatch row's guards are removed (`alert-dispatch.ts`). If the
     page smooths a body between its last place and a new body's place (the
     entry, a door), or draws a removed body gliding to nowhere, that is a
     collapse followed by a flight off the screen.
   - **Hit and throw prediction** (299a4d6, 4754ec5): the hitter's page draws
     its own hit early; a predicted launch on a body the server has flattened
     (a flattened body takes no hit) would be drawn and then corrected, or
     not.
   - **`impact-bodies`**: a flying body or a thrown crate meeting a flattened
     one knocks it flying (`INTENT:` in `impact-before.ts` may make that
     deliberate: read `docs/deliberate-designs.md` and that file before
     calling it a fault). A wave arriving and walking over him is not a
     flying body: check it does not count as one.
   - **The cantina's ring-out rule** (`cantina-out.ts`) reaching bodies
     outside the cantina; **the power orb** popping from the villain
     (`power-carriers.ts`) being drawn as his body.
3. **Fix what a player sees.** A knocked-out enemy lies where it fell and gets
   up there, or, where a rule takes it away (a beaten wave leaving), it is
   seen to get up and walk off, or fades where it lies: never a slide or a
   flight nobody caused. If the cause is a deliberate rule that only looks
   wrong, do not delete the rule: make what it does readable (`DRAFT:`,
   `docs/decisions-log.md`) and say so in your report. A scenario or e2e fact
   that fails before and passes after, with its control.

## Decided

- The owner saw it, so it is real until shown otherwise: "could not
  reproduce" is a report with the table from step 1, not a close.
- One small push per cause; `npm run build`, `npm run check`, `npm run e2e`
  green (the reconnect facts `h1`/`h2`, `cantina-row` and the friend-throw
  facts fail some runs on `main` and are being fixed under
  `handoff-prompts/step-5-e2e-flakes.md`: re-run and report, never loosen);
  pushed; live (`npm run check:deployed`, `npm run check:live`).

## Paths

Owns: the client's drawing of bodies and its smoothing (`src/client/**` as
needed for this fault only), `scripts/e2e/` for the new fact. In `src/sim/**`
change only the one rule the evidence convicts, and tell me first by message
which file (other builders are in `outpost-*`, `alert-*`, `defeat-*`,
`machine-*`, `power-*`, `hall-*` tonight). Must not touch: content, other
steps' scenarios.

## Done

The table; the cause shown with a control; the fix live; one line for the
owner in plain words saying what they were seeing and what they will see now.
