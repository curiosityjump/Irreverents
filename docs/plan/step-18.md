# Step 18 — Enemies and provoked good guys fight

**Reference.** Plan step; its status line is in docs/plan.md.

## Why

**The owner, 2026-11-23 ~16:05 UTC, first-hand to the orchestrator**
(`docs/vision.md:205-206`, under "NPC response: three modes, signals, pursuit"):
> Enemies or provoked good guys need to be able to fight too.

**The owner, ~16:20 UTC** (`docs/vision.md:212-213`):
> Of course they need to be able to fight. If you didn't get that, you need to read the documents again.

It is not a new rule. The library already decides it, and the game is missing it:

- `docs/design-library/04-decisions-and-prototyping/11-decision-register-boundaries-and-open-questions.md:207`
  > D-046 At sufficiently extreme ongoing deviation, even ordinary noncombatant inhabitants (SHOPKEEPERS, bystanders) and PET CATS / similar harmless creatures may join the overwhelming physical resistance in an effort to stop the heroes. The convergence of the whole community is a distinctive last-stand/spectacle mechanic; these characters need not become powerful fighters.
- same file, `:303`
  > D-075 The reporting requirement still stands: an isolated good-guy NPC can reach mode 3 and fight locally, but scaling reinforcements from guards or town require an ACTUAL successful call/report; rage alone is not a broadcast.
- same file, `:261`
  > D-060 … Fighting villains in the expected hero-versus-villain manner is Business As Usual for them, not a narrative-dissonance trigger.
- same file, `:63`
  > D-019 Failure of stealth opens satisfying battles, last stands and narrow escapes, NOT an automatic-reload punishment loop.
- same file, `:65`
  > D-020 Spectacular IMPACT is a top priority: suplexes, launches, heavy collision, knockback into walls/other enemies, and roadblock crashes.
- same file, `:241`
  > D-055 NO NPCS WILL HAVE AI. This includes shopkeepers, villains, guards, champions, pets and crowds.
- `docs/design-library/02-gameplay-systems/23-the-three-npc-modes-role-consistent-behavior-distress-rage.md:65`
  > External actions: abandon ordinary routines, scream, charge, strike, throw objects, join enormous crowds, collide with more powerful heroes, give up tactical caution.
- same file, `:69`
  > Ordinary noncombatants should remain mechanically ordinary and often hopeless against very strong heroes; the spectacular danger emerges from mass, unpredictable swarming, the presence of real guards and machines, chain collisions and frantic escalation.
- same file, `:45`
  > Game implication: business as usual does NOT mean no attack behavior; combat can be a scripted, normal routine for two opposing NPC archetypes.
- `docs/design-library/02-gameplay-systems/27-persistent-wanted-pursuits-and-three-sided-battles.md:51`
  > 2+ — ACTIVE PURSUIT: players are identified or detected; guards attack and try to continue signaling.
- `docs/design-library/02-gameplay-systems/08-combat-impact-destruction-and-vehicles.md:29`
  > Recovery: enemy regains footing, staggers, falls, counterattacks, loses armor or is defeated; player can pursue another interaction.
- `docs/design-library/02-gameplay-systems/24-feasible-game-architecture-making-irreverents-playable.md:79` (a design proposal, not a decision)
  > Ordinary residents have limited fighting skill; guards/champions retain stronger combat toolsets.

## Goal

Provoked good guys and enemies hit heroes, again and again, with Step 2's
real attack and its full knockback. A guard or shopkeeper in rage, and a
guard chasing after a completed call, swings at a hero in reach for as
long as the hero is in sight, not once per approach. The villain hits back
once a hero has hit, grabbed or thrown him. Camp and quarry enemies keep
fighting as Step 12 built them. A hero who is beaten is flattened for
3 s and gets up where they lie: the fight or the escape carries on, and
there is always a way out (people never jump, and walk slower than every
hero runs).

## The signal (re-runnable)

1. `scenarios/step18-rage-keeps-swinging.json` (test-street, the inputs of
   `step4-rage-without-a-call`): the raging shopkeeper hits the hero at
   least 4 times (measured 10). **Control:** `held: ['attack']` back in
   `charge()` gives 1 (measured).
2. `scenarios/step18-guard-swings-again.json` (test-street, the inputs of
   `step4-standing-in-view-is-seen`): the chasing guard hits the hero at
   least 6 times in 2600 ticks (measured 15). **Control:** the held input
   back in alert-respond's chase gives 3 (measured).
3. `scenarios/step18-jump-over-is-a-way-out.json` (test-street, the
   player a grappler: the graybox `hero` the `step4-*` scenarios play
   lists no `attack`, so it cannot make the guard rage): a hero cornered
   by a raging guard jumps over him and runs; the guard lands no hit after
   the jump (measured at 1234ec6 by a probe that put the grappler beside
   the guard: 1 hit, then none, 546 px apart at tick 2400). **Control:**
   the hero holds into the wall instead and is hit again (measured 18 hits
   and 3 flattenings in about 1250 ticks).
   **And against two (measured once by probe, written in the builder
   notes; not a scenario):** a solo hero between `ts-guard` and
   `ts-shopkeeper`, both raging, one either side, jumps over one and runs:
   neither lands a hit from 90 ticks after the jump, and the hero ends at
   least 200 px from both. The Goal's "always a way out" is otherwise
   proven against one person only, and D-046 and doc 23:69 expect a
   crowd. A hero who cannot get away stops push 1: being stuck may not be
   (`CLAUDE.md`, "There is always a way out"), and it is the measurement
   slice B waits on.
4. `scenarios/step18-villain-hits-back.json` (test-shop, the player an
   infiltrator: the graybox `hero` lists no `attack`): one hero swing at
   `villain-1` draws at least one villain hit on the hero within 15 s
   (measured by a probe that put the infiltrator beside him: hero's hit at
   tick 5, villain's at 431; a scenario walks there first, so its ticks
   come from the trace). **Control 1:** no swing gives 0 villain hits in
   1800 ticks (measured). **Control 2:** `fights: "on-sight"` turns 7 more
   scenarios red (measured at 1234ec6 on top of push 1, 12 red in all):
   `step4-villain-robs`, `step4-villain-buys-politely`,
   `step4-street-people`, `step4-unseen-take`,
   `step4-door-and-back-alert-unchanged`, `step4-leaves-unseen-guard-stays`
   and `step12-unseen-not-followed-to-camp`.
5. `npm run e2e`, fact `fight-back` (`scripts/e2e/fight.ts`): a phone-sized
   page, by touch only, walks into the castle street, hits the street guard
   until he rages, stands still, and its own character is knocked at least
   20 px in under a second. The same fact passes in `npm run check:live`.
   **Control:** a local build with both `guard.json` and `shopkeeper.json`
   back to `["move"]`, and their seven attack numbers taken out of
   `content/tuning.json`, reports it false. The numbers must go too: the
   build refuses a number no verb reads (`src/sim/check-content.ts:57-60`,
   run by `scripts/build.ts:17-22`). With both reverted no person in the
   street can swing, whoever reaches the hero. (The shopkeeper stands at
   column 11, over 400 px from the guard's beat at columns 37–42, and
   `npcSightRange` is 112, so she is not expected to see the fight; the
   control does not rest on that.)
6. Every other scenario still passes, five of them re-timed (below), and
   `npm run gates` prints the same count before and after.

## Stopping condition

Signals 1–6 pass on `main` and live. Then the step closes. What the owner
says after playing it reopens it or extends it (slice B below is written
only then, or on a measurement that shows a hero stuck: signal 3's
two-person probe is that measurement, taken in push 1).

## What's decided

- The owner's words above, and the library passages quoted under "Why".
- **Who fights whom.** Against a hero, a good person fights only in
  mood 3, and only an offender in sight (Step 4's `charge`). A guard on
  duty after a completed call fights the hero it sees (alert-respond's
  chase). An enemy fights heroes as business as usual, and its mood stays
  1 (D-060; Step 12's `outpost-fight`). Rage alone summons no one: an
  isolated raging person fights where they are, and reinforcements come
  only from a completed call (D-075, D-063). A raging good person still
  goes to call once no offender is in sight
  (`src/sim/systems/npc-call.ts:85-87`, unchanged; the castle street
  measurement below shows it).
- **A good person fighting a villain who acts like a villain, in mood 1,
  is the design too** (D-049; doc 23:41; `INTENT:` at
  `src/sim/systems/npc-witness.ts:72-74`; `docs/mechanisms/npc-response.md`,
  "a shopkeeper being robbed by the villain is in mood 1 and happily
  fights back"). Slice A does not build that blow (slice D below), and
  nothing in Step 18 may say a good person fights only in mood 3.
- **The first odd deed only reaches distress** (D-044). Rage needs
  dissonance `npcRageAt` 3, so a guard rages only after two hits he sees.
  Measured: in the castle street a grappler landed 3 hits, the second of
  them unseen.
- **Fighting back keeps the heat up** (D-067, D-074). Step 18 changes no
  alert or mood rule.
- **No NPC AI** (D-055, D-062): fixed states, event and role mappings, the
  verbs a player has.
- **Getting caught is never a reload** (D-019); avoid a hard game-over
  (S-007, a strong direction).
- **Impact over numbers** (D-020): a person's blow is Step 2's attack, with
  knockback and wear at full share. The friend rule is player on player only
  (`src/sim/verbs/attack.ts:139`).
- **Guards get Step 2's real attack verb, with no clash-only blow; Step 18
  re-times the `step4-*` scenarios a real hit turns red**: the orchestrator,
  16:16 UTC, `handoff-prompts/step-12-b-chase-and-clash.md:36-42`.
- **Cantina regulars stay outside** the ordinary NPC rules (D-086). They
  already fight in `cantina-regulars.ts` and have no `c.npc`.
- **Enemies are one system**, Step 12's `outpost-fight`. Step 16's kinds are
  data on top of it (`docs/plan/step-16.md:186`). Step 18 builds no
  parallel fight system for them.

## `DRAFT:` choices (decisions-log, 2026-11-23 "Step 18")

Each is built so that the other answer is a small change.

- **Swinging again is a pulse, not a new verb rule.** `charge()` and the
  chase press attack fresh every other tick, as `outpost-fight.ts:65`
  does, because Step 2's attack starts a swing only on a fresh press
  (`attack.ts:65-72`). It is one expression at each of two sites; Step 2's
  verb is unchanged.
- **The guard hits like a camp fighter, with a slower wind-up.** Strength
  9000, reach 12, attackTime 0.8, wear 20, wind-up **0.4 s**, strike 0.067,
  recovery 0.2 (doc 24:79: guards keep stronger toolsets).
- **The shopkeeper is an ordinary fighter** (D-046, doc 23:69). Strength
  4000, reach 10, attackTime 1.0, wear 8, wind-up **0.5 s**, strike 0.067,
  recovery 0.3. That launches an infiltrator at about 154 px/s and a grappler
  at about 67 px/s. It takes about 10 hits to flatten an infiltrator.
- **Why the wind-ups are longer than the camp fighter's 0.25 s.** A blow
  should be seen coming on a phone. The server decides a person's hit
  against the hero's reported position. Before a dodge reaches the server,
  four delays add up: a snapshot at 20/s, 100 ms interpolation
  (`content/net.json`), about 55 ms each way (110 ms round trip, Step 1),
  and a person's reaction of about 250 ms. Together that is about 0.5 s.
  Undoing it is one number per person.
- **The villain fights only once a hero has hit, grabbed or thrown him.**
  He then fights that hero for 15 s, and each new deed restarts the 15 s.
  This is a new optional field on the NPC kind, `"fights": "when-struck"`
  (the default is `"on-sight"`, so nothing else changes), read by one
  filter in `outpost-fight`. A new recorder system, `fight-struck`, keeps
  the list of who struck him. This keeps gate C's rob and buy-politely loop.
  Changing it to `"on-sight"` is one word; at 1234ec6, on top of push 1,
  that turns 7 more scenarios red (12 in all; 9 with the villain alone at
  dc854fb). Recognising a threat is OPEN
  (D-062, D-070).
- **A body knocked into the villain is not a strike.** Only a hero's own
  `hit`, `grabbed` or `thrown` on him counts. A guard a hero throws into
  him lands its full impact (D-020) but names no hero in the `impact`
  event; the thrower is only on the flight
  (`src/sim/systems/impact-bodies.ts:55`). `npc-witness` does not count a
  collision as a deed either. The other answer, reading the thrower from
  the flight that struck him, is a change inside `fight-struck` (it would
  need to run after `impact-bodies`).
- **The villain gets the guard's numbers and a melee swing.** His orb cast
  is ranged and waits for a projectile verb, which would be Step 2's.
- **The horn-blower does not fight.** Its job is the horn
  (`content/characters/outpost-lookout.json:2`, D-066). Measured: listing
  attack on it turns 4 `step12-*` scenarios red.
- **The king does not fight.** He is Step 6's.
- **No person grabs, holds or throws a hero.** In the library, grab and
  seize are hero verbs only.
- **Friendly fire stays.** A person's swing hits every body in reach,
  whatever its side (`attack.ts:129-133`; doc 27:81, chain collisions doc
  23:69). Measured: the test street's guard flattened its shopkeeper twice,
  and a raging shopkeeper hit the villain 13 times.
- **A beaten hero loses nothing new.** They are flattened for 3 s, cannot be
  hit or grabbed while down (`attack.ts:130`, `grab.ts:62`), then get up where they lie
  with their wear cleared. People keep swinging over a flattened hero; the
  swings miss. There are no lives, no respawn and nothing is taken. This
  is not a reading of D-081, which says damage can knock an acquired power
  loose and lose carried items (its thresholds OPEN): the game has no
  powers or inventory yet, so there is nothing to lose. The step that adds
  powers decides the loss.
- **The way out is speed and jumping.** People walk at 40–56 px/s (the
  lookout is the quickest, 56); the slowest hero, the brawler, runs at 76. No person lists `jump`. Signal 3
  proves it against one person and its two-person probe against two. It
  is marked where it could be "tidied" away: an `INTENT:` at `charge()`,
  an `INTENT` note in the `"//"` of the people's tuning sets in
  `content/tuning.json` (the shopkeeper's says `DRAFT (Step 4): people
  walk; they do not run or jump.`, which invites a change that would
  remove the way out), and an entry in `docs/deliberate-designs.md`,
  "Decisions made on the owner's behalf" (the owner may overrule). A
  person who runs or jumps needs a way out of its own first.
- **Re-timed scenarios keep their claims.** Only ticks, positions and the
  hero's inputs move, "stands over them" becomes "hits them", and each
  change is logged with the trace line of the blow that caused it.

## Open (for the owner, by playing; nothing waits on them)

- Does a guard's blow feel right? Is a shopkeeper's swat a funny nuisance,
  and dangerous only in a crowd?
- Can you see a guard's swing coming on your phone in time to jump it?
- When a guard corners you he hits you about once a second until you jump
  over him. Is that a fun last stand, or does it feel stuck?
- When people beat you flat, should anything more happen than lying there
  for 3 seconds, such as being thrown out of the room? (Losing a copied
  power or what you carry is already the library's rule for damage, D-081,
  with its thresholds open; neither exists in the game yet.)
- Should the villain start a fight as soon as he sees you, or only after you
  hit him?
- Should guards and shopkeepers grab and throw you?
- Should the king swing his sceptre when he is enraged, and should the
  horn-blower fight once its horn is broken?
- When a guard's swing flattens the shopkeeper by mistake, should anyone
  care?

## Next, after slice A (orchestrator, 17:30 UTC)

- **Heavies topple to a big throw, not to eight punches.** The Step 16 lead
  measured (50c584d): a slam wears only speed × `impactWear`, so a
  grappler's throw of the `heavy-fighter` (about 217 px/s) wears 17 against
  one punch's 34. Throws can never beat punches on heavies, though doc 08
  wants heavy enemies to "barely shift from small strikes" but topple to a
  big throw or crash. Fix as data the heavy kinds opt into: a slam rule by
  weight, or a slam over some speed that flattens outright. It is a slice
  of its own after A, with D-020 ("Spectacular IMPACT is a top priority")
  as its why.
- **Step 12's push 3 landed without the guard's attack** (the Step 12 lead,
  17:12 UTC): guard.json still lists no attack on main. When guards and
  camp meet, only the camp swings until push 1 here. `clash-cool` was
  dropped (`alert-cool` already holds the wait at 0 while anyone of the
  area sees a hero).

## Owns

New files, Step 18's:

- `src/sim/systems/fight-*.ts` (`fight-struck`, order 101)
- `scenarios/step18-*.json`
- `scripts/e2e/fight.ts`
- a "Who fights" section in `docs/mechanisms/npc-response.md`
- an entry and a table row in `docs/deliberate-designs.md` ("Decisions
  made on the owner's behalf"): people never jump and walk slower than
  every hero runs, the way out

Agreed small edits in other steps' paths, each additive or a single
expression:

- **Step 4** (unclaimed; the orchestrator agreed these edits for it at
  16:16 UTC):
  - one expression at `src/sim/npc/behaviours.ts:108` and one at
    `src/sim/systems/alert-respond.ts:146`;
  - an optional `fights` field in `src/content/kinds/npcs.ts`;
  - `"fights"` in `content/npcs/villain.json`;
  - re-times of `step4-guard-follows-seen` and
    `step4-standing-in-view-is-seen` (both gate D),
    `step4-hero-persists-rage` (gate C) and `step4-street-call`.
- **Step 2** (closed 2026-11-23 17:30 UTC, b63daee; the orchestrator
  agrees these edits in its paths):
  - `"attack"` in the verbs of `content/characters/guard.json`,
    `shopkeeper.json` and `villain.json`;
  - the seven attack numbers in `content/tuning.json` `characters.guard`,
    `.shopkeeper` and `.villain`, and in each of the three sets a `"//"`
    note marking the way out `INTENT` (the shopkeeper's keeps its Step 4
    words and gains the note);
  - `world.npcStruckMemory`.
- **Step 12** (lead `session_017WiGzJTXQVCWQYDDmC2UiY`; slice B builder
  `session_017WiGzFLgKMowRCLNbRRYiE`, whose push 3 has a hard stop at
  18:00 UTC):
  - one filter in `src/sim/systems/outpost-fight.ts` near line 36, and
    the one sentence of its `DRAFT:` at lines 14-15 ("Step 4's villain and
    guard bodies do not list attack"), which stops being true;
  - a re-time of `step12-guard-follows-into-camp`;
  - `guard.json`'s attack line, which slice B's push 3 also needs. Push 3
    cannot land it first: its brief forbids pushing a `step4-*` scenario
    red or re-timing one
    (`handoff-prompts/step-12-b-chase-and-clash.md:36-42`), and the
    guard's attack alone, with the held input, turns
    `step4-guard-follows-seen`, `-standing-in-view-is-seen` and
    `-street-call` red (measured at dc854fb), and its own
    `step12-guard-follows-into-camp` too. So Step 18's push 1 writes it,
    and sends Step 12's builder and lead the guard's numbers before it
    pushes, so push 3's clash scenario is timed on them. If push 3 has
    landed it anyway, push 1 keeps their numbers.
- **Step 1/5's scripts:** one call line in `scripts/e2e.ts`, as Steps 12
  and 16 added theirs.
- **`docs/architecture.md`:** a Step 18 row in "Which paths each plan step
  owns".

Steps that are not edited, but whose rules Step 18 must respect:

- **Step 16** (lead `session_017WiGzHt9iJy3caBLkT1Ef4`; builder
  `session_017WiGzFnkhyrpJqJ6xa9vTr`, on slice 2, the quarry enemies).
  Its heavy-fighter and brute inherit `fights` with the default
  `"on-sight"`, so they behave as briefed. Every `step16-*` scenario must
  stay green.
- **Step 11** (lead `session_017WiGzFy3MD6ecvM7QMvQGd`). Its chase lock
  (slice B push 3, not on `main` at 005fde8) reads `c.respond.phase ===
  'chase' && c.respond.sight`, so only the held input changes there. But
  its scenario is to be built from Step 4's chase and follow scenarios
  (`handoff-prompts/step-11-b-hub.md:136-140`), the ones a guard's real
  hit re-times (`step4-guard-follows-seen`: 2 hits on the hero).
  Whichever lands second times that scenario on real hits: if it is on
  `main` first, Step 18 re-times it like its `step4-*` ones and tells
  Step 11's lead. Its regulars are not touched.
- **Step 17** (builder `session_017WiGzGw7XaQ6tZNddFaa8s`). Saved games
  keep each person's `c.struck`, but the players' entities are removed, so
  `fight-struck` drops ids it cannot find.
- **Step 8** (held by the orchestrator). It draws the swings: see slice C
  below.

## Briefs

- **Slice A**, signals 1–6 in two pushes:
  `handoff-prompts/step-18-a-people-fight.md` (drafted 2026-11-23 ~17:05
  UTC at 1251555 for the orchestrator). Push 1 makes provoked good guys
  swing again. Push 2 makes the villain hit back.
- **Slice B (not briefed; written only on the owner's word after playing,
  or on a measurement of a hero who cannot get away)**: no stun-lock in a
  corner or a crowd. It would add:
  - at most 2 people mid-swing at one hero, with the rest holding off a
    little way back, counted per hero so a solo hero meets the same
    pressure as each friend;
  - no swing at a flattened or flying hero, and fighters stepping back
    while the hero is down;
  - about 1 s after a hero gets up during which no person starts a swing
    at them.

  Inside `fight-*`, with tuning numbers. Measured today: cornered, a guard
  hits every 0.8 s; jumping over him ends it. If signal 3's two-person
  probe shows a hero stuck, the cap is 1, not 2.
- **Slice D (not briefed; decided, not open): the shopkeeper's broom at a
  robbing villain.** The library answers it (D-049: shopkeepers are
  comfortable opposing a villain who acts like a villain and "outwardly
  resist"; doc 23:41: "may also courageously swing his broom at a villain
  stealing goods"), and the code reads it as the design (`INTENT:` at
  `src/sim/systems/npc-witness.ts:72-74`). Today she emits `opposed` and
  barks. It is not Step 12's `content/hostility.json`, which leaves the
  street villain out (`handoff-prompts/step-12-b-chase-and-clash.md:82-85`;
  the Step 12 lead's side-plus-role keying, 29f6686). It would turn
  `opposed` into a few swings in mood 1, inside `fight-*`, and must keep
  gate C's rob scenarios green. The orchestrator places it.
- **Slice C (Step 8's paths, not Step 18's to build, and in none of round
  3's lanes)**: people's swings drawn, with the tell readable at phone
  size. Round 3's five lanes (a3c09ab) leave it out, and the actors lane
  hands it back ("Note for Step 18 (not your work): guards and enemies
  will need the same hit drawing when they swing",
  `handoff-prompts/look3-actors.md:246-248`). The orchestrator, which
  holds Step 8, briefs it once slice A's push 1 is live.
  - Hold the wind-up frame for the whole wind-up, and show a "!" over the
    head while it lasts (read `c.attack.phase`).
  - The newly synced P07 sheets (0372804, the owner's "More assets
    available") show a swing for most of the people who now fight:
    - `p07-…/colorful-chibi-npc-sprite-sheet.png`: two townsfolk with a
      frying-pan swing and a broom swing (the shopkeeper has no attack
      frame today), the spear guard's thrust, the shield knight's bash,
      the king's sceptre swing and the cat's pounce;
    - `p07-…/chibi-enemy-animation-sprite-sheet.png`: the hooded grunt's
      dagger slash (for `outpost-fighter`), the horn-blower, the armoured
      brute's club slam (for Step 16's brute), a crossbow, a wolf's lunge
      and a caster's orb.

    P03's villain and town sheets have more. The guard and villain sprites
    already have 4 attack frames each.

## Measure

2026-11-23 ~17:00 UTC, at 1251555, in scratch copies with a
scenarios-only runner (content load plus every scenario: 1 min 48 s):

- **Baseline:** 158 of 158 pass.
- **With push 1** (the pulse; guard and shopkeeper attack with the numbers
  above): 153 of 158. The five red ones are the four `step4-*` scenarios
  listed under Owns and `step12-guard-follows-into-camp`.
- **With pushes 1 and 2:** the same 153 and the same five red. No other
  scenario went red, including every `step12-*` and `step16-*` one.
- **Re-measured at 1234ec6** (~17:15 UTC; `main` is 005fde8, documents
  only since), with the six `step11-*` scenarios Step 11's swap added
  (49a5e53): baseline 164 of 164; with push 1, 159 of 164, the same five
  red; with pushes 1 and 2, the same. Each control on its own site:
  `charge()` held gives 1 hit in `step4-rage-without-a-call`, the chase
  held gives 3 in `step4-standing-in-view-is-seen`. The way-out probe
  (a grappler in the test street): standing, 18 hits and 3 flattenings
  from tick 1145; jumping over, 1 hit, then none, 546 px apart at 2400.
- **Pulse against held**, hero hits by the person:

  | Scenario | Pulse | Held |
  |---|---|---|
  | `step4-standing-in-view-is-seen` | 15 | 3 |
  | `step4-rage-without-a-call` | 10 | 1 |
  | `step4-rage-needs-unseen` | 15 | 2 |
  | `step4-street-call` | 7 | 7 |

- **Castle street, a grappler against `street-guard`:**
  - rage after 3 landed hits (tick 270);
  - the guard goes to call (started 345, completed 494);
  - first blow at 967, 11.6 s after rage, knocking the grappler 36 px in
    under a second.

## Builder notes

### Slice A, push 1 (builder `session_017WiGzHwmFZe9AdG3KMHsa4`, 2026-11-23 ~18:00 UTC)

- **Measured on push 1:** 193 of 193 after rebasing on f230c2b (the brief's five plus Step 11's new `step11-chase-blink`
  re-timed, three new); `npm run gates` 5 of 6 before and after. The new
  scenarios: shopkeeper hits 10 (control, held input in `charge()`: 1),
  guard hits 15 (control, held input in the chase: 3).
- **Not in the brief: the toll keeper.** Step 16's `toll-keeper` body
  shared the shopkeeper's tuning set and lists no `attack` (by design: a
  keeper who swings punched the hero before they could pay). With the
  shopkeeper's seven attack numbers in that set, the content check fails
  "no verb of character toll-keeper reads this number". Fixed as data: a
  new set `characters.toll-keeper` with the same walking numbers, and
  `"tuning": "toll-keeper"` in `content/characters/toll-keeper.json`
  (Step 16's file; its `"//"` updated to match). All 60 `step16-*` stay
  green. Step 16's lead is told.
- **The way-out scenario's geometry and control differ from the brief.**
  A cornered hero could not be set up in the test street with a grappler:
  punched from the guard's left, he is slammed into the right wall and
  flattened before he rages (flattened sees nothing), at gaps of 30, 220
  and 300 ticks between punches. So the scenario punches from his right;
  the fight drifts left to the shop, he rages on the second punch (tick
  420), hits the hero once (728), and the hero runs at him, jumps over
  (750) and climbs the ledge at the left. No hit after; at tick 2400 the
  hero is at x 25.8 on the ledge, the guard at 229.2 (203 px). **The
  brief's control ("holds into the right wall") does not fail here**:
  in the open street the hero outruns him to the wall and he loses sight
  (1 hit in all). The control used is the hero **standing still** after
  the first blow: 20 hits and 2 flattenings, and the guard's blows carry
  the hero across the street into the right wall (18 hits after tick
  840). That is the cornered case, reached by staying.
- **The way out against two (probe, `scripts/.probe-two.ts`, not
  committed):** solo grappler in the test street. Punched `ts-guard`
  (rage at 415; the shopkeeper saw it, mood 2) and then `ts-shopkeeper`
  (rage at 619), the hero standing between them at tick 600 (shopkeeper
  x 121, hero 139, guard 167). Hits on the hero: one, by `ts-shopkeeper`
  at 654. The guard was knocked away by the hero's own punch at 619 (it
  struck both). The hero jumped over the guard at 825 and ran right to
  the wall. **No hit by either from 915 to the end.** At tick 2400: hero
  x 674.6, guard 406.8 (268 px), shopkeeper 328.5 (346 px): **passes.**
  Run on to 3000, the guard has cooled, stood down and walked back to his
  post at 487 (187 px, mood 1, no hit). Jumping over the shopkeeper
  instead and up the ledge: no hit after the jump either, but at 3000 she
  is back at her counter 141 px from the hero on the ledge. Neither is a
  hero who cannot get away: no one can reach the ledge, and nobody swung
  again. Only one blow landed while the hero stood between the two, so
  this probe does not measure two people swinging at once (slice B's
  question).
- **e2e `fight-back`:** a guard punched from his left is carried out
  through the courtyard door (measured), so the page first walks past
  him and punches from his right. "His drawn x jumps 10 px" counts a move
  of 10 px within 150 ms (his walk is 6 px in 150 ms; a jump over 700 ms
  counted his walk). Local runs: three jumps in 5–7 taps, the hero
  knocked 20 px within 1 s 2.9 s after settling. **Control** (guard and
  shopkeeper back to `["move"]`, their numbers out, rebuilt): false, 0 px
  in 30 s, the guard's barks only "Hey! What?!".
- **`step4-guard-follows-seen`'s words:** the hero now reaches the
  cellar doorway with the guard about 35 px behind, not the 60 its
  `proves` says (the blow knocked the hero nearer). The claim (he follows
  through, and only having seen) holds; the number in the sentence is
  left as it was.
- **Open for the owner by playing** (no change made): a shopkeeper hit
  twice is easy to rage, and her blows are small; the guard goes to the
  bell before he swings if hit from behind, so a first fight in the
  street takes about 12 s to come back at you.
- **`step11-chase-blink` re-timed** (it landed at f230c2b while push 1
  was built; red only because the guard now hits, trace in
  `docs/decisions-log.md`). The Step 11 lead
  (`session_017WiGzFy3MD6ecvM7QMvQGd`) was inactive when messaged: **for
  the orchestrator to pass on.** Its control (`chaseHold` 0) still fails.
- **Flag from Step 12's slice B builder (18:01 UTC), not acted on:** with
  the guard's 0.4 s wind-up against a camp fighter's 0.25 s, in an even
  meeting in Step 12's clash the fighter strikes first and cuts the
  guard's wind-up off, so a guard may never win a clash. The 0.4 s is the
  brief's (seen coming on a phone); a quicker guard wind-up, or a
  clash-only number, is the orchestrator's call. `step12-guards-and-camp-clash`
  stays green with these numbers.

### Slice A, push 2 (same builder)

- **Measured:** 194 of 194 scenarios pass. `step18-villain-hits-back`:
  the infiltrator waits until `villain-1` is back resting after his first
  robbery (the hero's walk starts at 420), steps to his right (15 px),
  turns and swings at 453: the hit lands at 455 on the villain only (not
  the guard beside him); the villain hits back at 512 (57 ticks later).
- **Control 1:** no swing: 0 villain hits on the hero in 1800 ticks.
- **Control 2:** `"fights": "on-sight"` turns 14 red, the brief's 7
  among them (`step4-villain-robs`, `-villain-buys-politely`,
  `-street-people`, `-unseen-take`, `-door-and-back-alert-unchanged`,
  `-leaves-unseen-guard-stays`, `step12-unseen-not-followed-to-camp`);
  the other seven are `step4-guard-follows-seen`, `-hero-persists-rage`,
  `-street-call`, `step12-guard-follows-into-camp`, Step 11's
  `step11-chase-locks-door` and `-door-no-chase` (which landed since),
  and `step18-villain-hits-back` itself.
- **Friendly fire seen:** the villain's swing at the hero also moved
  `guard-1` (from his post at x 184 to 78 by tick 900, in the probe). Left as it is (`DRAFT:`, the
  step's list).
- **`fight-back` made robust for live (after push 1).** On live (push 1
  deployed) the first version failed: taps missed the smoothed, late
  drawn guard, and walk/smoothing moves of 14–22 px were counted as
  blows, so it stopped after 5 taps before he raged. Now a blow is 30 px
  or more in 300 ms (his walk is 12), tapping stops at four blows or once
  his rage bark ("SEIZE THEM!!") is drawn (at most 12 taps), and the 1 s
  window restarts on a room change. Measured: live 3 of 3 (rage, then
  his blow 4.5–11.4 s later); locally the server's effect to the page is
  `push vx 150, vy -82.5` from `street-guard`. **Control** (guard and
  shopkeeper back to `["move"]`, numbers out, rebuilt, fresh server):
  false, no effect at all in 30 s; also false with the villain's swing
  removed too.
- **A wrong turn worth knowing:** for half an hour my scratch driver's
  controls "passed", because a server from an earlier crashed run was
  still listening on its port and served the old build. Start a check's
  server on a port nothing holds (or stop it by pid) before trusting a
  control.
- **Pushed and live:** push 1 1458d57 + 06085fa; push 2 c1b5b54; the
  fight-back fix 608ccef. `check:live` on aad28c3 (contains all): ok,
  `fight-back` true (7 taps, rage, his blow 11.4 s later).
- **Not mine, seen in the gate:** two full local `npm run e2e` runs on
  push 2 failed one Step 11 cantina fact each, a different one each time
  (`cantina-swap` + `cantina-switch`, then `cantina-row`: a tap that
  missed). Run on their own, all cantina facts pass both with Step 18's
  commits and on 18f7c48 without them; Step 18 changes nothing in the
  cantina. Looks like a timing flake under load: for the orchestrator.
- **Not re-run after the last rebases:** the full local e2e on the final
  tree (only client start-screen/shell code and Step 16 content came in
  after the last full run; build, check, 201 scenarios and fight-back
  re-run green).
