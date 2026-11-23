# Step 18, slice A: enemies and provoked good guys fight

Brief for one cold builder. Drafted 2026-11-23 ~17:05 UTC for the
orchestrator (`session_017WiGzHhke4tkAThPgw6EXs`), measured at 1251555
and re-measured at 1234ec6 (`main` is 005fde8, documents only since).
The step is `docs/plan/step-18.md`; read its "Goal", "What's decided" and
"`DRAFT:` choices". You need neither `docs/vision.md` nor the design
library. Before writing code, read:

- `docs/mechanisms/npc-response.md` ("The mood machine", "What a person
  does");
- `docs/mechanisms/outposts.md` ("The systems, in order", "Chase and
  clash");
- `docs/mechanisms/combat-and-impact.md`;
- `docs/mechanisms/scenarios.md`.

**Reports:** `send_message` to the session on the Orchestrator line of
`docs/questions-for-the-owner.md`, after each push, with the commit. A
blocking question goes there at once, and into `docs/questions-inbox.md`.
**Notes file:** `docs/plan/step-18.md`, "Builder notes" at its end. Put
flags, doubts and skipped checks there, never only in a message.

**Two pushes, each standing alone and fully checked. Nothing half-working on
`main`** (a push to `main` is the deploy).

## The task, and what it moves

The owner: *"Enemies or provoked good guys need to be able to fight too."*
It moves no M-row directly. M1 and M2 must stay passing, and `npm run
gates` must print the same count before and after (read it before you
start). It closes the gap between the library's rule (D-046, D-075, doc
23:65, doc 27:51) and the game. Gates C and D get real blows (their
scenarios are among the re-times below).

### Push 1: provoked good guys swing, and keep swinging

1. **The pulse.** Change one expression at each of two sites. Replace the
   held `['attack']` with `world.tick % 2 === 0 ? ['attack'] : []` (in
   `charge()` it is `ctx.world.tick`), copying `outpost-fight.ts:65`:
   - `src/sim/npc/behaviours.ts:108`, in `charge()`;
   - `src/sim/systems/alert-respond.ts:146`, in the chase.

   At `charge()`, replace the `DRAFT:` at `behaviours.ts:93-94` with an
   `INTENT:` that does two things:
   - name the fresh-press rule (`src/sim/verbs/attack.ts:65-72`);
   - say "people never jump and walk slower than every hero runs: the way
     out".

   The D-065 `INTENT:` just above it (`behaviours.ts:90-92`) stays word
   for word. Change nothing else in either file. Step 11's chase lock reads
   `c.respond.phase` and `c.respond.sight`.
2. **Bodies.** Add `"attack"` to the `verbs` of
   `content/characters/guard.json` and `shopkeeper.json`. In
   `content/tuning.json`, add all seven attack numbers to each set. The
   content check fails "missing" without them (`src/sim/check-content.ts:24`).

   | Set | attackStrength | attackReach | attackTime | attackWear | attackWindup | attackStrikeTime | attackRecovery |
   |---|---|---|---|---|---|---|---|
   | `characters.guard` | 9000 | 12 | 0.8 | 20 | 0.4 | 0.067 | 0.2 |
   | `characters.shopkeeper` | 4000 | 10 | 1.0 | 8 | 0.5 | 0.067 | 0.3 |

   Both are `DRAFT:`, with the reason in the step's DRAFT list. Add no
   `weight` or `toughness`: these bodies don't list `body`, so the check
   fails "no verb reads this number".

   **Mark the way out where it could be undone.** The way out lives in
   these sets and bodies, not in `charge()`: no person lists `jump`, and
   every person's `runSpeed` is below the slowest hero's (the brawler's
   76). The shopkeeper set's `"//"` says `DRAFT (Step 4): people walk;
   they do not run or jump.`, and a `DRAFT:` invites a change. Keep those
   words and add: `INTENT (Step 18, there is always a way out): no jump,
   and slower than every hero runs; a person who runs or jumps needs
   another way out first.` Give the guard set the same `"//"` (the
   villain's in push 2). `"//"` is skipped by the tuning reader
   (`src/content/kinds/tuning.ts:39`), and it is additive beside Step 12's
   numbers.
3. **Re-time the five scenarios that go red only because a person now
   really hits.** Measured with exactly items 1 and 2:
   - `step4-guard-follows-seen` (gate D): the hero never reaches the cellar
     doorway at tick 2880, and the guard ends in mood 3 at x 158 (expected
     mood 1, x 580–690).
   - `step4-standing-in-view-is-seen` (gate D): `ts-guard` at x 203 at tick
     1000 (expected 335–360).
   - `step4-hero-persists-rage` (gate C): the hero is at x 255.28 at tick
     300 (expected 256–304); rage cools at 1165 (expected 1150). The
     shopkeeper hit the hero at tick 142.
   - `step4-street-call`: `street-guard` at x 192.39 at tick 3600 (expected
     200–250).
   - `step12-guard-follows-into-camp`: Step 12's scenario. The hero never
     reaches the courtyard door at tick 3905: the guard hit the hero 15
     times and flattened them 3 times. Send Step 12's lead
     (`session_017WiGzJTXQVCWQYDDmC2UiY`) your change and the trace line
     before you push. They own it.

   For each one:
   - keep the claim its `proves` makes, and change "stands over them" to
     "hits them";
   - move only ticks, positions and the hero's inputs, found with
     `node scripts/trace.ts <id>`;
   - log one `docs/decisions-log.md` line per scenario, naming the hit
     event that moved it.

   Step 4 is unclaimed, and the orchestrator assigned these re-times to
   Step 18 (`handoff-prompts/step-12-b-chase-and-clash.md:36-42`).
4. **New scenarios** (`scenarios/step18-*.json`, gate none). Watch each
   control fail once, and name the controls in the commit message.

   | Scenario | Scene | Expect | Measured | Control | Control measured |
   |---|---|---|---|---|---|
   | `step18-rage-keeps-swinging` | `test-street`, the inputs and placements of `step4-rage-without-a-call` | `event-where` `hit` `{by: ts-shopkeeper, target: p:a}` count `[4, 99]` in `[0, 1500]` (`event-where` refuses a fact without `between`, `src/scenarios/facts/event-where.ts:20-23`) | 10 | `charge()`'s held input back | 1 |
   | `step18-guard-swings-again` | `test-street`, the inputs of `step4-standing-in-view-is-seen` | `hit` `{by: ts-guard, target: p:a}` count `[6, 99]` in `[0, 2600]` | 15 | the chase's held input back | 3 |
   | `step18-jump-over-is-a-way-out` | `test-street`, the player a `grappler` (the graybox `hero` of the `step4-*` scenarios lists no `attack`, so it cannot make the guard rage) | after a raging `ts-guard`'s first hit, the hero runs at him, jumps over and runs on: `hit` by `ts-guard` on `p:a` count `[0, 0]` from 90 ticks after the jump to the end, and at the end two `position` facts, the hero's x and the guard's, with ranges at least 200 px apart (no fact compares two bodies) | 1 hit, then none; 546 px apart at tick 2400 | the hero holds into the right wall instead | 18 hits and 3 flattenings in about 1250 ticks |

   The way-out scenario's numbers come from a probe that put the grappler
   30 px left of `ts-guard` and steered by position each tick (re-run at
   1234ec6: the same numbers). A scenario starts at the room's spawn, so
   yours walks there first: write its fixed inputs from
   `node scripts/trace.ts`.

   **Then the way out against two, measured once by probe** (not a
   scenario; nobody has measured it). In `test-street`, with one hero
   only (solo, a grappler: the graybox `hero` cannot hit), make `ts-guard` and `ts-shopkeeper` both rage (hits they
   see), stand the hero between them, then jump over one and run. Record
   in the builder notes: every hit by either on `p:a` with its tick, the
   jump's tick, and the distance from each at the end. It passes when
   neither lands a hit from 90 ticks after the jump and the hero ends at
   least 200 px from both. **If the hero cannot get away, do not push 1.**
   Report it to the orchestrator with the trace: being stuck is not
   allowed (`CLAUDE.md`, "There is always a way out"), and it is the
   measurement slice B waits on. The Goal's "always a way out" is
   otherwise proven against one person only, while D-046 and doc 23:69
   expect a crowd.
5. **By touch, on a phone: `scripts/e2e/fight.ts`**, plus one call line in
   `scripts/e2e.ts`, beside `phoneFacts` (`scripts/e2e.ts:477`), outside
   `if (!LIVE)`.
   1. A phone-sized page (`phone()` in `scripts/lib/e2e-touch.ts`) opens a
      private world, `?room=${tag}-fight-<random>`, so it is `check-` on
      live as every scripted check there is (`src/client/main.ts:284-286`;
      `scripts/e2e/phone.ts:227` names its world the same way). `Kit` has
      no `tag`: take it as `phoneFacts` does. Its character is the
      grappler, the first party member (`content/party.json`).
   2. It walks right from the throne room into `castle-street`.
      `walkInto` is local to Step 12's `scripts/e2e/outpost.ts:20`: copy
      its few lines; don't edit their file.
   3. It steers at `street-guard` (tile 40; its routine walks columns
      37–42) and taps attack until it has seen the guard's drawn x jump at
      least 10 px three times. Stop at 8 taps.
   4. It then touches nothing.
   5. Fact `fight-back`: within 30 s, the page's own `drawn.me.x` moves at
      least 20 px within 1 s while nothing is touched.

   **Control, watched once:** a local build with both `guard.json` and
   `shopkeeper.json` back to `["move"]`, and their seven attack numbers
   taken out of `content/tuning.json`, gives false. Take the numbers out
   too, or the build refuses to start: a number no verb reads fails the
   content check (`src/sim/check-content.ts:57-60`, run by
   `scripts/build.ts:17-22`). With both reverted no person in the street
   can swing, whoever reaches the hero. (The shopkeeper stands at column
   11, over 400 px from the guard's beat, and `npcSightRange` is 112, so
   she is not expected to see the fight; the control does not rest on
   that.)
6. **Docs.**
   - `docs/mechanisms/npc-response.md`: a "Who fights" section (who, when,
     how, the pulse, the numbers, the way out), plus a fresh-press trap
     line. Write "against a hero, a good person fights only in mood 3",
     never "a good person fights only in mood 3": fighting a villain who
     acts like a villain inside mood 1 is the design (D-049; `INTENT:` at
     `src/sim/systems/npc-witness.ts:72-74`; the same file's line 22), only
     not built yet. And write that rage alone summons no one (D-075), not
     that a raging person "calls no one": a raging good person still goes
     to call once no offender is in sight (`npc-call.ts:85-87`).
   - In the same file, correct the two lines the pulse makes false:
     `charge` "hold `attack` there" (lines 170-171) and the responders'
     "holding `attack` in `npcChargeReach` if its body lists the verb (the
     guard's does not yet)" (lines 247-248). Left as they are, they tell
     the next session the held input is the design, and the pulse looks
     like a bug to "fix" back.
   - `docs/deliberate-designs.md`: an entry under "Decisions made on the
     owner's behalf" (marked "the owner may overrule"), plus its table row:
     *People can be outrun and jumped over* → there is always a way out:
     no person's body lists `jump`, and every person walks slower than the
     slowest hero runs; a person who runs or jumps needs another way out
     first. Sites: `charge()` in `src/sim/npc/behaviours.ts` and the
     people's `"//"` in `content/tuning.json`. Proven by
     `scenarios/step18-jump-over-is-a-way-out.json`.
   - `docs/mechanisms/combat-and-impact.md`: one line saying a person's
     blow lands at full share (the friend rule is player on player,
     `attack.ts:139`).
   - `docs/decisions-log.md`: entries for the pulse, the numbers and the
     wind-ups.
   - `docs/architecture.md`: a Step 18 row, from the step's "Owns".

### Push 2: the villain hits back once struck

1. **`src/content/kinds/npcs.ts`:** add an optional field `fights`, either
   `'on-sight' | 'when-struck'`, defaulting to `'on-sight'`. Add it to the
   `read.only` list at line 60, set it on `out` (lines 61-67) and
   `read.fail` on any other value. Every NPC kind without the field
   behaves exactly as now, which includes Step 16's heavy-fighter and
   brute.
2. **`src/sim/systems/fight-struck.ts`** (new), at order 101. Verbs run at
   100 and the next system runs at 200. Declare its component with
   `declare module '../types.ts'`, as `src/sim/verbs/attack.ts:5` does.
   Each tick it does three things:
   - For a `hit`, `grabbed` or `thrown` event with `player` set whose
     `target` has `c.npc` and no `player`, set `target.c.struck[by] = tick`.
   - Delete entries older than `world.npcStruckMemory`. That is `DRAFT:`
     15 s, declared in the system's own `tuning`, as `alert-respond.ts:83-85`
     declares `npcSearchRange`, and added to `content/tuning.json`'s
     `world`.
   - Delete entries naming an id `findEntity` cannot find: Step 17's saves
     remove players.

   State lives on the person only. Anything the server writes on a
   player's entity is undone by the puppet rule
   (`docs/mechanisms/network.md`).
3. **`src/sim/systems/outpost-fight.ts:36`** (Step 12's): add one filter.
   For a kind with `fights === 'when-struck'`, keep only heroes in its
   `c.struck`. Tell Step 12's lead in your report. It is additive, and
   `'on-sight'` keeps every camp and quarry enemy unchanged. The filter
   narrows `heroes` before the `canSee` loop and never replaces it: a
   struck villain still fights only a hero he sees (the D-065 `INTENT:`
   at `outpost-fight.ts:17-19`). Also correct the one sentence of the
   `DRAFT:` at `outpost-fight.ts:14-15` ("Step 4's villain and guard
   bodies do not list attack"), which this push makes false; leave the
   rest of that comment as it is.
4. **The villain's data.**
   - `content/npcs/villain.json` gets `"fights": "when-struck"`.
   - `content/characters/villain.json` lists `"attack"`.
   - `tuning.json` `characters.villain` gets the guard's seven numbers and
     the way-out `"//"` of push 1 (he walks at 40 and has no `jump`).
5. **`scenarios/step18-villain-hits-back.json`:** in `test-shop`, with the
   player an `infiltrator` (the graybox `hero` of the `step4-*` scenarios
   lists no `attack`), the hero walks to `villain-1` and swings once.
   Expect `hit` `{by: villain-1, target: p:a}` count `[1, 99]` between the
   hero's hit and 900 ticks later. Measured by a probe that put the
   infiltrator 15 px right of him, facing him: the hero hit at tick 5, and
   the villain hit back at 431 (426 ticks later). Yours walks there first,
   so take both ticks from `node scripts/trace.ts`.
   - **Control 1:** no swing gives 0 villain hits in 1800 ticks (measured).
   - **Control 2:** `"on-sight"` turns 7 more scenarios red (12 in all,
     measured at 1234ec6 on top of push 1): `step4-villain-robs`,
     `step4-villain-buys-politely`, `step4-street-people`,
     `step4-unseen-take`, `step4-door-and-back-alert-unchanged`,
     `step4-leaves-unseen-guard-stays` and
     `step12-unseen-not-followed-to-camp`.
6. **Docs.**
   - `outposts.md`: the `outpost-fight` row of "The systems, in order"
     (`docs/mechanisms/outposts.md:55`) names `fights`, and says a
     new fighting kind (Step 16's read this file) keeps the way out: no
     `jump`, and a `runSpeed` below the slowest hero's 76.
   - `npc-response.md`: "Who fights" gains the villain.
   - `docs/decisions-log.md`: entries.

## Measured for you (1251555, about 17:00 UTC)

- **Scenarios only:** 158 of 158 pass, and loading content plus every
  scenario takes 1 min 48 s. `npm run check` takes about 3.5 min: content
  loads in about 100 s since the quarry joined, and a Step 3 fix is briefed.
- **With push 1:** 153 of 158 pass; the five above are red.
- **With pushes 1 and 2:** the same 153 and the same five red. Nothing new
  goes red, including all of `step12-*` and `step16-*`.
- **Re-measured at 1234ec6** (about 17:15 UTC; `main` is 005fde8,
  documents only since): 164 of 164; with push 1, 159 of 164; with pushes
  1 and 2, the same 159 and the same five red. The six `step11-*`
  scenarios Step 11's swap added (49a5e53) stay green. Each control on its
  own site: `charge()` held gives 1 hit in `step4-rage-without-a-call`;
  the chase held gives 3 in `step4-standing-in-view-is-seen`.
- **Pulse against held**, person-on-hero hits:

  | Scenario | Pulse | Held |
  |---|---|---|
  | `step4-standing-in-view-is-seen` | 15 | 3 |
  | `step4-rage-without-a-call` | 10 | 1 |
  | `step4-rage-needs-unseen` | 15 (still passes) | 2 |
  | `step4-street-call` | 7 | 7 (the hero is knocked out of reach, so the walk back makes fresh presses anyway) |

- **Castle street, a grappler against `street-guard`** (this is the e2e's
  shape):
  - The hero's hits landed at ticks 34, 88 and 270. The second was not seen
    (dissonance stayed 2), so it took **3 hits** to reach rage, at 270.
  - The guard then **goes to call**, because the hero is behind him:
    started 345, completed 494.
  - His first blow on the hero came at **967 (11.6 s after rage)**: 36 px
    of knockback within 1 s, and 41–48 px in other runs.
  - Running west after that blow reaches the throne room with no further
    hit.
- **Friendly fire**, unchanged by this step: `ts-guard` flattened
  `ts-shopkeeper` at ticks 1305 and 2179, and `shopkeeper-1` hit
  `villain-1` 13 times.

## Traps

- **Saved games (Step 17) and component fields, until Step 17's hardening
  push A lands** (`handoff-prompts/step-17-saves-hardening.md`). A kept game
  saved by an older build is loaded with its components as they were. A new
  field on an existing component (say `c.npc.struckBy`) that a system reads
  without a default crashes the live server, `main` included, when such a
  game is opened. Read every new field with `?? default`, or put it in a new
  component. New top-level `world.*` fields are safe.
- **Step 12 update (17:12 UTC):** push 3 lands without the guard's attack.
  Write `guard.json`'s attack yourself as push 1 says, and send its numbers to
  Step 12's lead.

- **Holding attack never swings again** (`attack.ts:66`:
  `fresh = down && !a.held`). Don't "fix" Step 2's verb; the pulse is the
  fix.
- **Step 12 slice B push 3 is editing the same lines now.** Its builder is
  `session_017WiGzFLgKMowRCLNbRRYiE`, with a hard stop at 18:00 UTC. The
  push adds:
  - `content/hostility.json`;
  - `clash-fight` at order 59 and `clash-cool` at 621;
  - `guard.json` `["move","attack"]`, with the camp fighter's numbers
    (wind-up 0.25).

  Push 3 cannot land the guard's attack before you: its brief forbids
  pushing a `step4-*` scenario red or re-timing one
  (`handoff-prompts/step-12-b-chase-and-clash.md:36-42`), and the guard's
  attack alone, with the held input, turns `step4-guard-follows-seen`,
  `-standing-in-view-is-seen` and `-street-call` red (measured at
  dc854fb), and its own `step12-guard-follows-into-camp` too. So expect
  to write `guard.json`'s attack yourself, and send Step 12's builder and
  lead (`session_017WiGzJTXQVCWQYDDmC2UiY`) the guard's seven numbers
  before push 1, so their clash scenario is timed on them. Run `git pull
  --rebase` before each push. If `guard.json` already lists attack when
  you pull, keep every number they set (their clash scenario is timed on
  it), log the 0.4 s wind-up as not applied, and re-trace your re-times
  on their numbers.
- **Step 11's chase lock builds on the scenarios you re-time.** Its slice
  B push 3 (not on `main` at 005fde8) adds a scenario built from Step 4's
  chase and follow scenarios (`handoff-prompts/step-11-b-hub.md:136-140`),
  timed on a guard who never hits. If it is on `main` when you pull and
  goes red only because the guard now hits, re-time it as you re-time the
  `step4-*` ones, and send Step 11's lead
  (`session_017WiGzFy3MD6ecvM7QMvQGd`) the change and the trace line
  before you push.
- **Side `bad` plus `attack` means outpost-fight drives that person in any
  room, on sight** (`outpost-fight.ts:32-35`). The villain therefore gets
  `attack` only in the same push as `fights: "when-struck"`.
- **Never give the lookout attack.** Measured at dc854fb: it turns 4
  `step12-*` scenarios red, because outpost-fight pulls it off its horn.
- **A re-time can hide a regression.** Re-time only where the trace shows
  a person's `hit` moved the hero. Any other red scenario stops the push:
  report it.
- **Swings have no side filter** (`attack.ts:129-133`). Leave friendly
  fire as it is: it is a `DRAFT:` choice, not a bug.
- **Step 12's, 16's and 17's e2e calls sit inside `if (!LIVE)`**
  (`scripts/e2e.ts:363-373`), so they never run in `check:live`. Put yours
  outside that block, or the "on live" proof does not exist.
- **The e2e is timing on a real network.** Rage needs hits the guard sees,
  and he calls before he comes back. Give the fact 30 s, and print every
  number it saw.
- **The shopkeeper has no attack animation** (`content/sprites/shopkeeper.json`).
  She swings drawn idle. That is Step 8's to fix, not yours.

## Out of scope

- How many people may swing at one hero, a grace after getting up, and not
  swinging at a flattened hero: slice B, on the owner's word or on your
  two-person probe showing a hero stuck (then stop and report; don't build
  it yourself).
- People grabbing or throwing heroes, ranged attacks, and a projectile verb.
- The shopkeeper's broom against a robbing villain. It is decided, not
  open (D-049; doc 23:41; `INTENT:` at `src/sim/systems/npc-witness.ts:72-74`),
  and it is the step's slice D, not this slice. It is not Step 12's
  `hostility.json` either: that leaves the street villain out
  (`handoff-prompts/step-12-b-chase-and-clash.md:82-85`). Don't write
  anything that says a good person fights only in mood 3.
- The lookout, the king and the cantina regulars.
- `canSee`, the alert and mood rules, and Step 2's verbs and knockdown.
- Step 12's clash and Step 16's kinds.
- Sprites and sound (Step 8).

## Decided vs open

**Decided:** the step's "What's decided", and its `DRAFT:` list for
everything above. **Open** for the owner, by playing (don't ask; list it in
your notes if play-testing shows something):

- whether the blows feel right;
- whether a cornered hero feels stuck;
- whether the villain should fight on sight.

Nothing measurable is left open. If you find something, the brief was
wrong: say so.

## Done

Before each push, all of these are green:

- `npm run build`;
- `npm run check`;
- `npm run e2e`.

After each push:

- `npm run check:deployed` says live is current;
- `npm run check:live` passes, including `fight-back` after push 1.

Also required:

- every control watched failing once, named in the commit message;
- before push 1, the two-person way-out probe passing, its numbers in the
  builder notes;
- the decisions-log entries, the mechanism sections, the
  `docs/deliberate-designs.md` entry and the `docs/plan/step-18.md`
  builder notes.
