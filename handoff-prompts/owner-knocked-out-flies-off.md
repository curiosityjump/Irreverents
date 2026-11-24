# The owner, playing: a knocked-out enemy collapses, then flies off the screen

**Landed so far (2026-11-24 02:10 UTC), by `session_017WiGzJC6UCvT2PtVr2dn8v`, which stops at its context limit once part 3 is live:** part 1 is live at a3a446c (a knocked-out body was drawn lying while it flew; client only). Part 3 is committed as b42ae42 and in its gate (`rest-out-of-false-wall.ts`: a body nobody plays that comes to rest in a false wall is moved to the nearest clear spot along its row; the king was being punched into the throne room's secret). **You do Part 2 only: bad guys can be defeated for good, townspeople stay knocked out.** Read `docs/plan/step-5.md`, "Knocked-out enemies fly off", for what the first builder measured about wear, flattening and knockback. Since Part 2 was written the owner has asked for three more things that touch it; build with them, not against them: **hearts for heroes** (`docs/plan/step-21.md`, "Hearts": a fall to an enemy costs a hero a heart; the risk builder `session_017WiGzJWYyVWtYnjFXHko1S` has it: the hero side is not yours); **the chase** (bad guys now go seen, chasing, searching, returning: `handoff-prompts/owner-enemies-chase-alarms.md`, builder `session_017WiGzF31gfYgeWNMA7rnEL`, in `outpost-fight.ts`: a defeated body must leave that state machine cleanly: agree by message); **the stage** (Step 22, `docs/plan/step-22.md`, lead `session_017WiGzFrf7N7ZgaqUyjs4Sz`: "enemies defeated" is one of its victory statistics and the stage starting over puts its people back: export what it needs, a count of defeats credited to a player and a way to restore a place's people, and tell it). Weapons are being built too (Step 23): a weapon's blow is still a blow; nothing of yours changes for it.

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

## Part 2, added 23:55 UTC: beaten enemies stay beaten

**The owner, first-hand to the orchestrator, ~23:52 UTC, still playing:**

> Also, i seem to be invincible as hero... and enemies collapse but never die

(The hero half is Step 21, `handoff-prompts/loop-risk.md`, building now: not
yours.) The enemy half is yours, after part 1's cause is found, as its own
push. Today a flattened body lies `flattenTime` and gets up fresh
(`docs/mechanisms/combat-and-impact.md`), every time, for ever: nothing a
player does to an enemy lasts.

**Decided by the orchestrator (`DRAFT:`; log it in `docs/decisions-log.md`
with how to undo it), from the owner's words and the library:**

- **Bad guys can be defeated.** Doc 08: "enemy regains footing, staggers,
  falls, counterattacks, loses armor or is defeated". A bad guy (the quarry's
  and camp's fighters, heavies, the brute, the lookout, a wave's arrivals; not
  the villain yet: he carries the power and loops his robbery, ask before
  touching him) who is worn out a set number of times, or by one hard enough
  slam (a throw into a wall or into another body: impact over numbers, D-020,
  so the big hit ends it sooner), does not get up: he lies a beat, then goes
  with the cut `fx-poof`, and is gone. The count and the slam speed are data
  per kind (the heavy takes more); 1 must be a legal count.
- **He does not come back while you are there.** A placed bad guy returns
  after a data time once no player is in the room (as the shop's goods do,
  `heist-restock.ts`): `DRAFT:`, so a place can be cleared and is not empty
  for ever. A wave's arrival never returns (the next wave is the camp's
  answer).
- **Townspeople and guards are knocked out, not defeated:** D-064 and doc 26
  build on an unconscious body lying there to be found. They stay down for a
  long data time (far longer than today's `flattenTime`) instead of popping
  up fresh; nobody poofs. Read `npc-witness.ts` and `npc-call.ts` first: a
  body staying down longer must not break "stop the caller and no help
  comes", and must not leave a room where a player cannot get what a
  standing shopkeeper gives (say what you find).
- **No number over anyone's head, no health bar.** How close a bad guy is to
  going shows on the body (the hurt pose, `fx-dizzy`, a stagger), `DRAFT:`.
- **Other steps' scenarios:** the waves', outpost's, quarry's, town tiers',
  Step 18's and Step 21's scenarios flatten people on pinned ticks. Count
  which go red before you push; if a default of "one more than any scenario
  needs" keeps them green, take it and say so; otherwise stop and tell me the
  list (as the risk builder did). The Hall's detector counts bodies felled by
  a credited player (`hall-detect.ts`): a defeat must still count once.
- Files: the rule lives in new `src/sim/systems/` files and new content
  fields with safe defaults; tell me by message before editing another
  builder's system.

Signal: scenarios with a control each (a fighter worn out the set number of
times stays down and is gone; one fewer and he gets up; a slam ends it
sooner; a shopkeeper knocked out is still lying there after the old
`flattenTime`; a cleared room is empty while you stay and restocked after you
have been gone the data time), and one phone e2e fact: by touch, a fighter is
beaten and is gone.

## Part 3, added 2026-11-24 00:08 UTC: the king stuck in the wall (do this with part 1)

**The owner, first-hand to the orchestrator, ~00:05 UTC, still playing:**

> The king keeps getting stuck in the wall too

"Too" may tie it to the fly-off: a body driven into solid tiles and then
pushed out by whatever un-sticks bodies would be a collapse followed by a
flight nobody caused. So add it to part 1's hunt as evidence, and reproduce it
on its own: in the throne room, by touch on a phone-sized page with delay
added, hit, grab, carry and throw the king at each wall, the throne, the
window, the corners and the doorway, and (he can be thrown down through the
stained-glass window into the undercroft: the puzzles slice added a pocket and
a floor grate there tonight, 6475497 and 4204f68) into the undercroft. Record
where his body's box is against the solid tiles every tick, on the server's
world and as drawn. Say exactly how he gets in (a throw's end, being set down
beside a wall, a slam, landing from the window, his own walk back to the
throne, a hero's predicted throw the server placed elsewhere) and whether any
other body (a guard, a fighter, a crate, a hero) can be put in a wall the same
way.

Fix the cause in the one rule the evidence convicts (tell me the file first):
no body may come to rest overlapping solid tiles, and one that is found there
is put in the nearest free place the same tick it is found, not launched. A
scenario per way in, each with its control, and an e2e fact by touch. If the
king must be able to return to his throne after being moved (read
`docs/mechanisms/` for the throne room and `docs/deliberate-designs.md`:
the king's endless speech is deliberate), say what he does today and leave
that as it is unless it is how he gets stuck.
