# Carry a body, tap Use, and suplex it into the floor behind you (Step 25)

**Landed so far:** nothing yet. (A builder stopping at its budget writes
its commits here, one line, before it stops.)

Brief for one builder, three pushes, most visible first. Written
2026-11-24 by the orchestrator (`session_017WiGzHY5UZsWTLCH8cLm8M`)
against `5d8d147`. Read first: `docs/plan/step-25.md` (all of it; its
"`DRAFT:` choices" are this brief's decisions), then
`docs/mechanisms/combat-and-impact.md`, `docs/mechanisms/heists.md`
(the Use arbiter, Step 19), `docs/mechanisms/network.md` lines 140-230
("A page does not get the server's `c`", "Predicted hits", "A throw"),
`docs/mechanisms/scenarios.md`, `docs/mechanisms/sound.md`.

**Reports:** `send_message` to the session on the Orchestrator line of
`docs/questions-for-the-owner.md`, after each push, with the commit and
shot paths. **Notes:** `docs/plan/step-25.md`, "Builder notes", newest
last. A blocking question: that message, and `docs/questions-inbox.md`.
A question for the owner that blocks nothing: `docs/questions-inbox.md`.
A flag: the notes. Your final message: done or blocked, the commit, and
nothing else.

## The task, and the measure

`docs/vision-gaps.md:11`, row 6: "Still missing: a suplex". The owner's
D-020, "Spectacular IMPACT is a top priority: suplexes, launches ..."
(`docs/vision.md:271`). Moves M3 by nothing (6 of 6 by `npm run gates` at c4872c3, gate A already
passing, `docs/plan.md:41`); it gives gate A its suplex scenarios and
the owner the move he named first. **Whether it feels like "OHHHHH" is
the owner's to judge by playing, never a script's:** your scenarios
prove it happens, not that it lands.

## Decided (do not relitigate; all `DRAFT:`, reversible)

From `docs/plan/step-25.md`, "`DRAFT:` choices": while a played hero
carries a body that can be knocked out (toughness above 0: people,
heroes, dummies, the king; never a crate), **Use** says **SUPLEX**, from
a new Use entry at order 300, after every existing one, so a doorway,
counter, captive, machine or bell still wins. A press heaves the body up
and over for `suplexTime`, then slams it head-first into the floor
behind the hero: a recorded impact at `suplexSpeed`, the held beat, wear
`suplexWear`, and everything within `suplexSplashReach` of the landing
knocked away by `suplexSplashStrength` over its weight. A new verb
`suplex` in all five roster heroes, the grappler's numbers biggest (the
table in the step file). A new event `suplexed` and one row mapping it
to the deed `hit`. Hit, stick-plus-Hit, and Grab while carrying do what
they do today. NPCs do not suplex.

## Measured (so you need not)

- **What a carrier's buttons do now.** Hit: an immediate throw, forward,
  stick up a lob, stick down a spike, stick sideways turns first
  (`src/sim/verbs/attack.ts:74-77`, `src/sim/body-state.ts:221-258`).
  Grab: sets down in front, whatever the stick (`src/sim/verbs/grab.ts:44-52`);
  with a weapon in hand Grab throws the weapon (`grab.ts:41`). Use while
  carrying: whatever the arbiter's first answer is (door 0, weapon 90 but
  never for a carrier, thing 100, get-in 120, free 150, bell 200;
  `grep -n "order:" src/sim/use/*.ts`), else nothing. So order 300 takes
  nothing away.
- **The floor never records a slam.** `impact-walls` measures a floor hit
  as `min(pvy + gravity·DT, maxFallSpeed)` (`src/sim/systems/impact-walls.ts:41`),
  and `maxFallSpeed` is 360 (`content/tuning.json:5`): under the slam
  sound's 420 (`content/sounds/slam.json:10`) and `beatenSlam`'s 400
  (`content/tuning.json:43`). A suplex built as "a spike thrown behind"
  plays `heavy-hit`, never `slam`, and defeats nobody. **The suplex
  records its own impact** (`markImpact`, `strike` with
  `beatTicks(world.beatTime, world.beatMaxTime, speed)`, the `impact`
  event with `other` null, `wear`), as `impact-walls.ts:70-74` does.
- **Order matters.** `step()` returns this tick's events only
  (`src/sim/step.ts:16`). `beaten-mark` (530) and `npc-witness` (600) read
  them. `carry-ride` (600) puts every carried body overhead each tick
  (`src/sim/systems/carry-ride.ts:20-21`). So: the slam itself (release,
  impact, wear, splash, `suplexed`) happens in the verb (verbs run at 100),
  or the defeat and the witness never see it; and a system that draws the
  body along the heave runs after 600, or `carry-ride` undoes it.
- **A page never knows its own hero carries.** "A page does not get the
  server's `c` for its own character" (`docs/mechanisms/network.md:153-157`).
  The Use button's word comes from `useHere` on the page's world
  (`src/client/use-prompt.ts`). An entry testing `e.c.carrying` passes
  every scenario and never says SUPLEX on a phone. Find the carried body
  the way drawing does: the body whose `c.effect.heldBy` is this hero
  (`carriedBy`, `src/client/draw/sprites.ts:125-129`; `heldBy`,
  `src/sim/effects.ts:45`). The page also runs the verb for its own hero;
  there its world holds no carried body, so it must do nothing, quietly.
- **The way out.** A held body that presses Jump breaks free, and a held
  player is let go after `holdPlayerTime` 2.5 s (`INTENT:` in
  `src/sim/systems/carry-hold.ts:34-44`; `docs/deliberate-designs.md`,
  the carrying entry; `content/tuning.json:50`). The heave is still a hold:
  both stay. A heave whose body is no longer held (broke free, let go, the
  carrier knocked flying) is lost, like a cut-off swing. Mark it `INTENT:`.
- **Friends.** `friendThrowWear` is 0 (`content/tuning.json:55`): use
  `friendly()` (`impact-walls.ts:7`) and `c.brawl`'s share, as
  `impact-walls.ts:74` does. A friend's own page owns its motion: move it
  only by effects (`release`, `move`, `push`; `docs/architecture.md`,
  "Effects on a player").
- **Why not the `hit` event.** Seven systems read it (`weapon-loose`,
  `power-drop`, `defeat-seize`, `heart-lose`, `cantina-brawl`,
  `outpost-signaler`, `fight-struck`); a suplex reaches them through
  `flattened`, `impact` and `defeated`. The witness row is data:
  `{ "event": "suplexed", "deed": "hit", "by": "by", "target": "target" }`
  in `content/rules/expectations.json` (read by `npc-witness.ts:30-32`).
- **Not predicted.** The page predicts a throw (`network.md:217-227`:
  17-18 ms drawn, 566 ms without) but will not predict the suplex: expect
  about a round trip before the heave shows on the presser's phone. Push 2
  draws the heave from the press, as the throw is drawn from the press
  (`sprites.ts`, `remember`, "the throw is drawn from the press"). Do not
  add a prediction: that is `src/net/`, not yours. Print the number.
- **The splash and the slam rule.** A splashed bad guy whose `impact`
  speed is 400 or more is defeated by `beaten-mark`'s existing rule. The
  grappler's 16000 sends a guard (weight 40) at 400. Trace it, choose
  deliberately whether a splash itself can finish someone, and say which.
- **Snapshots** come 20 a second (`content/net.json:4`): an 18-tick heave
  is about six of them on a friend's phone. Draw the heave from a stamp on
  the carrier (as `c.lastThrow`), not from received positions alone.

## Do

**Push 1, live: the move.** The verb (`src/sim/verbs/suplex.ts`, its
numbers declared in its `tuning`), the Use entry (`src/sim/use/suplex.ts`)
and its words row (`"suplex": { "suplex": "Suplex" }` in
`content/prompts.json`), the witness row, `"suplex"` in the five heroes'
`verbs` and their numbers in `content/tuning.json` (in each hero's set,
nothing reordered), at most one or two `src/sim/systems/suplex-*.ts`.
Scenarios 1-7 of the step file's signal, each control watched to fail.
`node scripts/trace.ts <id>` before you write a fact. Trace the starting
numbers and set them by what you see; write the final table in the notes.

**Push 2: how it looks and sounds on a phone.** The heave drawn: up and
over, the body turned head-down as it comes over, from the press, on the
carrier's page and a friend's; the slam's dust, shake and sound come from
the impact (check `slam` plays, `src/client/audio/index.ts:17`). Use the
frames there are (`carry`, `throw`, `held`, `tumble`) and a rotation or
flip; put suplex frames for the grappler on Vision Partner's missing list
(`docs/mechanisms/asset-requests.md`). The e2e fact by touch
(`scripts/e2e/suplex.ts`, one call line in `scripts/e2e.ts`; the step
file's signal, with its control). Shots at 844x390 and 390x664, before
(carrying, SUPLEX on the button) and after (mid-heave, the slam, the
splash), into `docs/plan/step-25-shots/`. Say in the report what you would
point at.

**Push 3, if budget remains: the chain.** A suplex into a crowd: the
splashed bodies carry on into the next body and the wall through the
existing `impact-bodies` and `impact-walls`, and a splashed bad guy into
a wall is a slam. One scenario in a test room (its own `entities`)
proving a chain of three, control watched to fail. Tune the splash, not
those systems.

## Paths, traps, scope

**Yours:** the step file's "Owns" list, exactly. **Not yours, read only:**
`src/sim/verbs/attack.ts`, `grab.ts`, `body-state.ts` (export nothing new
unless one additive line truly needs it; say so in the commit), the
`carry-*` and `impact-*` systems, `src/sim/use.ts`. **Not yours, another
builder's tonight:** `src/net/**`, the server's handling of a thrown
player body, and the throw and grab e2e facts and their runner
(`touchAndThrows` in `scripts/lib/e2e-touch.ts`), all the thrown-friend
builder's (`handoff-prompts/thrown-friend-through-a-crate.md`): if a
suplexed friend looks wrong across two phones, measure it, write it in
the notes, tell the orchestrator, and do not touch `src/net/`. The camera
(`src/client/camera.ts`, `content/camera.json`, the camera in
`src/client/render.ts`): one added line in `render.ts` at most, after
`git pull --rebase`. Step 24's thrower and weapons files; the forest
(Step 15); the Bandit Camp's outposts and placements; backdrops; the HUD
and touch layout (`src/client/touch.ts`, `shell.ts`, `index.html`); every
room and placement file.

**Out of scope, however tempting:** NPCs who suplex; suplexing through
the throne room's window or into a cracked wall (library examples, not
decisions); a suplex as a power you take (doc 05 calls the catalog open);
the weapon entry that offers "Pick up" to a carrier on a phone (its
`e.c.carrying` test, the trap above: note it, leave it); any change to
what Hit or Grab do while carrying.

**Traps beyond those measured:** every scenario runs twice and must match
byte for byte (no `Math.random`, no wall clock); `npm run check` refuses
a hero whose set misses a number its verbs declare; every e2e run
rewrites shots under `docs/plan/` until
`handoff-prompts/e2e-shots-only-when-asked.md` lands: `git checkout --
docs/plan/step-2*-shots` (yours excepted) before you commit, and run the
builder card's skip-worktree check. Stop at about 300k tokens: write the
"Landed so far" line at the top of this file and your notes first.

## Decided vs. open

Decided: above. Open, yours, `DRAFT:` with a line appended to
`docs/decisions-log.md`'s "Step 25: the suplex": the final numbers;
exactly where "behind" lands when a wall is there; whether the carrier
can move during the heave; whether a splash can finish a bad guy. For the
owner, already in the step file, by playing: who can suplex, the button,
one-go finishes, a friend hurt. Nothing waits on him.

## Verify, every push

The pre-push gate (`docs/verifying-and-finishing.md:90-115`): `npm run
build && npm run check`, plus the full `npm run e2e` (push 2 on, and any
push touching `src/client/`); `git fetch origin main && git rebase
origin/main`, the gate again if code came in; push to `main`; then
`npm run check:deployed` and `npm run check:live`. **A deploy that seems
stuck: never revert onto an older healthy commit;** if `/healthz` answers
with an older commit, wait, re-run `check:deployed` every two minutes for
up to fifteen and push nothing meanwhile (`docs/verifying-and-finishing.md:103-110`).
Revert only when the game is down or broken by your build (`:111-114`).
Done: build and check green, e2e green, pushed to `main`, live, the shots
in the repo, the mechanism section and index line written (SOP phase 6:
`docs/mechanisms/`, `docs/decisions-log.md`, an `INTENT:` at the heave's
way out).
