# Brief: Step 2 feel, the simulation side

Lead: `session_017WiGzGN9egot3JUvSMBBA9` (Step 2). Written 2026-11-23 11:42 UTC on `main` at d2459f0.
A sibling brief, `handoff-prompts/step-2-feel-dials.md`, runs at the same time (the `?tune` panel); it reads the tuning declarations you add, so **every new number must be declared by its reader with a range and a `what:`** (that is what gives it a slider).

## 1 · The task, and what it moves

The owner, after playing (2026-11-23 ~10:05 UTC): *"I want to be playing something that looks, sounds, and feels as good as kirby and the amazing mirror … by tomorrow."* Step 8 is doing looks and sound. **This brief is how it feels in the hands**: movement that answers the thumb, hits and throws with weight, three party members that feel different to move. Full goal and signals: `docs/plan/step-2.md`, section "Feel, from 2026-11-23" — read it first; this brief is the measured derivation under it.

Measure row: none moves (M3's gate A is already passing by script). It is for the owner's own judgement by playing, with the dials. Say so at SOP phase 5.

## 2 · The derivation (measured at d2459f0)

**Already there — keep, don't rebuild:**
- `src/sim/verbs/move.ts`: accel/decel toward a stick target (`runAccel`, `runDecel`, `airAccel`, `airDecel`, `runSpeed`). Time to top speed at current numbers: grappler 84/600 = 0.14 s (8.4 ticks); infiltrator 128/1500 = 5.1 ticks; flyer 92/800 = 6.9 ticks. Stop: grappler 84/900 = 5.6 ticks.
- `src/sim/verbs/jump.ts`: variable height (`jumpCutMultiplier` 0.45 on release while rising), coyote time 0.1 s (6 ticks), jump buffer 0.1 s (6 ticks). **No scenario proves any of the three** (`grep -l coyote scenarios/` is empty) — that is part of your work.
- Knockback (`launch` in `src/sim/body-state.ts`), held beat (`c.beat`), wall and ceiling bounce (`wallBounce` 0.35, `src/sim/systems/impact-walls.ts`), body-on-body shove (`src/sim/systems/impact-bodies.ts`, `shoveBounce` 0.8), wear and flattening. Read `docs/mechanisms/combat-and-impact.md` before touching any of it.

**Missing — this is the build:**
1. **Gravity is world-only.** `src/sim/systems/physics.ts:50`: `vy += gravity * DT`, capped at `maxFallSpeed` 360; `gravity` 900 is in `world`. No apex hang, no faster fall, no per-character weight in the air. Add, as per-character numbers declared by a verb (see trap 1): a multiplier for gravity near the top of a jump (when |vy| is under a declared threshold), a multiplier when falling, and a per-character fall cap. Defaults that reproduce today's arc exactly must be possible (all multipliers 1), so the other answer is a small change.
2. **Characters must feel different to move**, by stated margins in scenarios: the infiltrator quickest to top speed and lightest; the grappler heaviest (slowest to start/stop, falls hardest, biggest hit); the flyer floats (lowest fall gravity, slow fall cap) and flaps (`src/sim/verbs/flap.ts`). Pick margins, write them in the scenario names' facts, and put the numbers in `content/tuning.json`, each with a `DRAFT:` note.
3. **The attack lands on the press tick.** `src/sim/verbs/attack.ts`: on a fresh press it hits at once and sets `cooldown`; the only state is `swung` (a tick). Give it phases — wind-up, strike (the hit is tested during strike, once per target), recovery — each a declared per-character duration. The grappler's wind-up longest. A throw while carrying (`throwCarried`) stays immediate unless you find it reads badly; say which in the commit.
4. **The held beat is the same length for every hit.** `hitBeatTime` 0.05 s (attack.ts:72) and `beatTime` 0.085 s (impact-walls, impact-bodies) are fixed. Scale both with impact speed between a declared min and max (e.g. `beatMin`/`beatMax` against `maxLaunchSpeed`), additively: keep the old names readable or retire them per `CLAUDE.md` (never rename an id once deployed; a tuning key is one).
5. **A body landing on the floor does not bounce.** impact-walls bounces off walls and ceilings only (`vy` is not reversed on a floor impact). Add a floor bounce (a declared share, and a speed under which it stops) so a thrown body bounces rather than stopping dead.
6. **The renderer cannot tell some states.** Step 8's actors lane (`handoff-prompts/look-actors.md`, running now) is told not to change the simulation and to list what it could not tell under "Flags for the lead" in `docs/mechanisms/rendering-actors.md`. That file did not exist at d2459f0. Pull; if it exists, expose what it lists. Either way expose, additively on components: the attack phase and ticks left in it; the tick of the last landing and its fall speed; the tick of the last hit taken; whether a body is stunned (in a beat, flying from a hit, or flattened, as one readable fact). Write each in `docs/mechanisms/combat-and-impact.md`.

**Who simulates what** (`docs/mechanisms/network.md`, "Who owns which part"): the **page** simulates its own player's motion; the **server** runs hits, throws and impacts. So movement feel is felt with no network delay; attack phases run on both. Anything you add under `e.c` is the server's copy for a player — read that section before putting attack phase state there, and prove a two-page hit still lands (`npm run e2e`).

## 3 · Traps

1. **A per-character number must be declared by one of that character's verbs** (`src/sim/check-content.ts`; a system cannot declare one). So the gravity multipliers are declared by `move` or `jump` and read by physics from the character's tuning, with world fallbacks. `npm run check` names any undeclared, unread or out-of-range number.
2. **Speeds stay under 960 px/s** (physics looks one tile ahead). Every new speed gets a declared max under it.
3. **21 of the 85 scenarios in `scenarios/` mention a jump** (`grep -l jump scenarios/*.json | wc -l`), including Step 3's routes (the flyer's 5-tile ledge, rooftops, the secret) and Step 4's chases. Changing an arc can break them. Tune until they pass; **never edit another step's scenario to make it pass** — if a route is genuinely out of reach with better feel, stop and write it to `docs/for-the-lead.md`.
4. **`npm run e2e` plays by touch on two phone-sized pages** (Step 2's `t-*`/`s-*` facts, `scripts/lib/e2e-touch.ts`). Attack wind-up delays the hit; a fact that taps and immediately reads may need to wait. Adjust Step 2's own facts only, and say so.
5. **Step 8's lanes push to `main` all day.** `git pull --rebase` before every push, re-run `npm run check` and `npm run e2e` after the pull. Shared files (`src/sim/types.ts`, `src/sim/systems/physics.ts`, `content/tuning.json`, `src/client/render.ts`): additive edits only, small.
6. **Deterministic.** No `Math.random`, no wall clock in `src/sim/`.

## 4 · Out of scope

Anything in `src/client/draw/`, the camera, the touch layout (Step 8's). The `?tune` panel (the sibling brief). The switch gap, acquired powers, NPC behaviour. Rooms' layouts. Don't "tidy" `INTENT:` lines (`docs/deliberate-designs.md` first).

## 5 · Decided vs. open

Decided: feel before new systems; every number is data and `DRAFT:`; nothing copied from another game (its feel is the bar, the numbers are ours); bodies pass through each other unless flying; no damage numbers (D-020). The lead's earlier decisions: `docs/plan/step-2.md`, "Decided by the lead".
Open: nothing only the owner can answer. Whether it *feels* good is theirs, by playing, with the panel. Feel choices you make: decide, mark `DRAFT:`, one line each in `docs/decisions-log.md`.

## 6 · Verification

Rung: scenarios with controls watched to fail, then `npm run e2e`, then live. New scenarios named `step2-feel-*` (`docs/mechanisms/scenarios.md` for the shape), one per signal in the step file's "Feedback signal": press-to-near-top-speed and release-to-stop ticks within bounds, per character; tap jump measurably lower than held; jump granted N ticks after leaving a ledge and refused after; buffered jump before landing happens; apex hang (ticks with |vy| under the threshold longer than with multipliers at 1); held beat longer for a harder hit; thrown body bounces off the floor; the three differ by your stated margins; an attack's hit lands only after the wind-up. **For each, a control**: break the number or the line, see the scenario fail, restore. List each control and its failure in the commit message.
Before every code push: read `https://irreverents-production.up.railway.app/debug/errors` and `/healthz` (players). Step 8's rule applies to feel too (the orchestrator's): look and feel lanes push as they are ready even with players in the world, each fully checked. After the push, `npm run check:deployed` and `npm run check:live`.

## 7 · Done

All `step2-feel-*` scenarios and every existing scenario pass on `main` and live; `npm run e2e` green; `docs/mechanisms/combat-and-impact.md` updated (new numbers, phases, exposed states); `docs/decisions-log.md` lines; a short "what to try, and which number changes it" list appended to `docs/plan/step-2.md`'s "Taste, for the owner in the morning". Push in small green pieces (movement first, then attack phases, then beat and bounce, then exposed states). SOP phase 6 rows: mechanism doc, decisions log. Delete this brief in your last commit.

## 8 · Questions

Blocking: message the lead, `session_017WiGzGN9egot3JUvSMBBA9` (send_message), and also write it in `docs/questions-inbox.md`. Everything else — flags, worth-noting — goes to `docs/for-the-lead.md`, not your final message. When done or blocked, message the lead with the commit; your final message is one line.
