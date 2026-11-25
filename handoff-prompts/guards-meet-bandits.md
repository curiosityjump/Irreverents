# Lead the watch into the bad guys: the guards and the villain come to blows while you slip away (Step 4)

Brief for one builder, two pushes and a third if budget remains. Written
2026-11-24 by the orchestrator (`session_017WiGzHY5UZsWTLCH8cLm8M`), from a
read of `main` at ed7d97c (nothing was run). Read first:
`docs/mechanisms/npc-response.md` ("Who fights", "Following through a
door", "The dispatch"), `docs/mechanisms/outposts.md` ("Chase and clash"),
`docs/plan/step-4.md` ("Guards meet bandits in a real room", at its end).

**Landed so far:** push 1 at d9fc807 and push 2 at 086d74e, live together at 955d496 (2026-11-25 02:27 UTC; check:deployed and check:live ok). Push 3 (the courtyard gate) not started: the builder stopped at its token budget; a fresh builder takes it from "Push 3" below. Notes: `docs/plan/step-4.md`, "Guards meet bandits, push 1" and "push 2".

**Reports:** `send_message` to the session on the Orchestrator line of
`docs/questions-for-the-owner.md`, after each push, with shot paths.
**Notes:** `docs/plan/step-4.md`, a "Guards meet bandits" section at its
end, newest last. A blocking question goes to the orchestrator by message
and to `docs/questions-inbox.md`; a finding that is not a question goes in
the notes.

## The task, and the measure

The owner, 2026-11-23 ~18:30 UTC, first-hand, after playing on a phone
(`docs/current-directive.md:135`): "... no escalating combats or chases
...". Library D-069 (doc 11, line 293): "Guards can chase into physically
interconnected other game levels, where they may engage the bad guys
already present. Resulting three-sided battles arise through scripted
faction-hostility and shared collision/combat rules, not bespoke story
scripts." `docs/vision-gaps.md` row 9's last open part: "guards and bandits
fight only in a test room".

Wanted: in a real room a player visits, a hero with the watch on their tail
leads a guard into a bad guy, the two come to blows with each other, visibly,
and the hero walks on (or joins in). Moves no row of `docs/plan.md`'s table
(M3 stays 6 of 6); it closes gap 9's last part. Whether it is fun is the
owner's to judge by playing; nobody has tried it on a real iPhone.

## Decided (by the orchestrator; `DRAFT:`, one `docs/decisions-log.md` entry per push)

- **Where: the castle street first, with the shop-robbing villain** (the
  most-played room, and the classic chase runs straight past him; see
  "Measured"), then, with budget, **the courtyard's bandit behind the
  opened gate.** Not the Bandit Camp's doorway and not a new bandit west of
  the courtyard gate (measured below why each fails).
- **What is missing is a rule, not only placement and proof: "answer a
  blow".** A person whose body lists `attack`, struck by a person of a set
  they answer (data), takes that striker as their foe for a short memory,
  **ahead of a hero in sight**, turns to face him (he felt the blow; no
  sight needed for the one who just hit him), walks at him and swings, as
  `clash-fight` already does. Each new blow between them renews it. When it
  runs out, or the striker is out cold or gone from the room, everything is
  as today (a hero in sight comes first again). Scripted: one event (Step
  2's `hit`), one table, one fixed reaction. Call it NPC response logic.
- **The table is data**: an optional, additive `answers` list in
  `content/hostility.json`, the same `{ "a": set, "b": set }` shape as
  `pairs`, either way round. First entry: `{ "a": { "side": "good" }, "b":
  { "side": "bad" } }`, so a guard answers the villain or a bandit, the
  villain or a bandit answers a guard, and the shopkeeper answers the
  villain (D-049: "shopkeepers feel comfortable opposing a villain who acts
  like a villain"). Same side never answers: friendly fire stays (a guard's
  swing that clips the shopkeeper starts nothing). Left out, `answers` is
  empty: today's behaviour. Name `answers` and the memory (`npcAnswerMemory`
  in `content/tuning.json` `world`, `DRAFT:` 3 s) are yours to change.
- **On-sight hostility is unchanged:** the villain stays out of `pairs`
  (`notRoles: ["villain"]`, `content/hostility.json:4`), so the watch never
  attacks him for robbing the shop (gate C's rob loop, D-049). Only a blow
  starts it: the hero stands in or beside him while a guard swings, and
  Step 2's attack hits every body in reach.
- **Moods and alerts are untouched** (D-060, the `INTENT:` at
  `src/sim/systems/clash-fight.ts:13-15`): a blow between people is no deed,
  nobody calls because of it, nobody new walks in. So the on-screen cap
  holds by construction; `step4-tier-cap-holds` must stay green.

## Measured (so you need not)

**What happens today, per candidate:**

- **The rule that stops all of them**, `src/sim/systems/clash-fight.ts:34`:
  `if (world.entities.some((h) => h.player !== null && canSee(content, e,
  h))) continue;` ("DRAFT: a hero in sight comes first", `:16`). A guard
  chasing a hero he sees never turns on a bandit, even one hitting him; a
  bandit who sees the hero goes for the hero. And nobody answers a blow
  from a person: `src/sim/systems/fight-struck.ts:40` skips every hit whose
  `player` is null (Step 18's file, the villain's `when-struck`: heroes
  only). Even `step12-guards-and-camp-clash` (`test-clash`) has the hero in
  another room (`test-fight`), and asserts only the fighter hitting the
  guard (1 to 99 hits), never the guard hitting back.
- **What a blow leaves on its target:** `o.c.lastHit = { tick, by }`
  (`src/sim/verbs/attack.ts:138`, typed at `:29`), set for every body a
  swing hits, player or not, and the `hit` event `{ by, target, player }`
  (`:139`). Weapons' hits (`weapon-move.ts:60`, `weapon-burst.ts:71`) emit
  `hit` but set no `lastHit`. Reading `lastHit` in `clash-fight` needs no
  edit to Step 18's `fight-struck.ts` or Step 2's verb.
- **(b) The castle street** (`content/rooms/castle-street.json`, 48
  columns, floor row 10; `content/placements/castle-street.json`): the
  villain at column 21 (`:11`), robbing at 17 and back (`:13-18`): standing
  at 21 for 37 s of each ~53 s loop (waits 10 and 27). The shop at 11-16,
  the bell at 24 (`:37`), the guard's beat 37-42 (`:22-25`), the rows'
  entries `[1,18,22,26,30,36,44,46]` on row 10
  (`content/dispatch/castle-street.json`). The classic chase
  (`scenarios/step12-guard-follows-into-camp.json`: take goods at tick
  1500, the call, the guard comes and hits, then the hero walks east at
  stick 0.42 from tick 2800 and reaches the courtyard door at 3543) walks
  the hero from the shop past columns 17-21 with the guard swinging at him.
  Today the villain is never fought there: not in `pairs`, and struck by a
  guard he does not answer (above). **Missing: the rule only.**
- **(a) The courtyard** (`content/rooms/courtyard.json`, 30 columns):
  the gate is column 25, rows 4-7 (`:44-47`), solid while shut, held open
  only while bodies press both plates (columns 16 and 22, six tiles apart,
  `:2`). The bandit `courtyard-fighter-1` stands at [27, 7], routine
  `face: right` only (`content/placements/courtyard.json:6`, its `INTENT:`
  at `:2`: a look west would reach the east plate and he would fight the
  plates' puzzle). Step 24's push 4 builder ran the draft chase and found
  "the street guard stops west of the shut gate and never meets him east
  of it" (`docs/plan/step-24.md:600-601`). A second bandit west of the gate
  sees a plate from any column 14-24 (sight 112 px, `content/tuning.json:7`)
  and the push 3 builder's one at [24, 7] turned the plates e2e red once
  (`docs/plan/step-24.md:531-552`); at columns 1-13 he would meet every
  hero coming in from the street and stand on the trike's run. So the
  courtyard works only with the gate held open (two bodies on the plates:
  two friends, a friend and a crate, or two crates for a hero alone; the
  roadblock's crates stand at 11-13). East of the gate the floor is three
  tiles (26-28) before the gallery's walk door (29): blows there carry
  bodies into the gallery (Step 24's note: "his blows knock them east out
  into the gallery"). **Missing: the rule, and proof (no placement).**
- **(c) The Bandit Camp's doorway** (`content/rooms/outpost.json`): a
  guard who saw the hero go in follows (`step12-guard-follows-into-camp`,
  `in-room outpost` at 5400) and comes out at column 2, in a pocket
  (columns 1-4, floor row 10) under a three-tile solid step (columns 5-7,
  rows 8-10). People never jump (the `INTENT:` in
  `docs/mechanisms/npc-response.md`, "The way out"); the one-way tiles at
  (4, 9) and (8, 9) are "no stair for them" (`outpost.json:2`). So he stays
  in the pocket, the step blocks his line of sight, and the camp's people
  cannot climb back west either. They never meet. Fixing that is room
  geometry at the camp's only door (`doorClear` 2, `sendNoneNearer` 8 in
  `content/outposts/outpost.json`): **out of scope.**
- **Other rooms a chase reaches, checked and rejected:** the quarry road
  and the forest trail (the followers are stuck at the doorway's floor,
  the bandits up ledges); the forest road (no bad guys, and it is the
  forest stage's entrance and its quiet clear's start, `step15-unseen-clear`);
  the undercroft (its thrower faces west, on a ledge; `hidden-recruit.md`'s
  room).

**The numbers that decide the street's meeting:** guard and villain alike
`runSpeed` 40, `attackStrength` 9000, `attackReach` 12, every 0.8 s,
wind-up 0.4 s, wear 20; the armoured guard 32, 11000, wind-up 0.5, weight
80 (`content/tuning.json`, `characters`); boxes 14 by 28 (the armoured
guard 16). A swing's band runs from the attacker's middle to 12 px past his
front (`attack.ts:129-132`), so the villain is clipped only within about a
tile and a half of the guard's front: the hero must stand in or right
beside him. `npcChargeReach` 14 (`content/tuning.json:15`). People knocked
out by people get up: only a player's knock-out defeats a bad guy
(`src/sim/systems/beaten-mark.ts:18-21`), so the villain is never removed
by the watch.

**Doors and one-tile ways near the brawl** (there is always a way out):
the cantina's enter doorway is column 20 (rows 9-10, between the villain's
17 and 21: one tile wide); the cellar doorway 7, the street doorway 28,
the walk doors at 0 (throne room) and 47 (courtyard). Bodies pass through
standing bodies (`impact-bodies`), so nobody is walled in by bodies; what a
brawl can do is keep knocking a hero who stands in it. The way-out check
(`npm run check`, `wayOutCharacters` in `src/sim/check-rooms.ts`, every
roster hero) plays empty rooms only, so it does not cover this: your
scenario does.

## Do, each its own push, each live

**Push 1, the watch and the villain come to blows in the street.** The
`answers` list (kind `src/content/kinds/hostility.ts`: `read.only` at `:41`
gains `answers`; an `answered(h, a, b)` beside `hostile()` at `:31`), the
tuning number, and in `clash-fight.ts` the answer first: before the
hero-first line (`:34`), a person whose `c.lastHit` is within the memory,
by a person in the same room, not out cold, whom they answer, takes that
one as foe (turn to him, walk, swing on the existing pulse), and skips the
hero test. Keep its other skips (`:32-33`: cannot act, no `attack`,
calling or going to call). `INTENT:` at the site and a line in
`docs/deliberate-designs.md` ("a person answers a blow ahead of a hero").
Scenarios, each control watched failing:

- `step4-clash-street-guard-and-villain`: the street with placements, the
  default hero: provoke the guard (take goods and let the call complete as
  `step12-guard-follows-into-camp` does, or hit him till he rages as
  `step18-*` do), walk to the villain at 21 and stand in him; facts: a
  `hit` by `street-guard` on `street-villain`, then by `street-villain` on
  `street-guard`, at least two each way (a brawl, not a clip); the hero
  walks west out of the street and no `hit` targets `p:a` after he leaves
  their reach. Control: `answers` emptied (no villain-on-guard hit).
- `step4-clash-answer-ahead-of-hero`: `test-clash` with a hero standing in
  sight of both: the fighter's blow lands on the guard and the guard hits
  the fighter back while the hero stands there. Control: `answers` emptied
  (the guard never hits the fighter).
- `step4-clash-same-side-no-answer`: a guard's swing at a hero clips the
  shopkeeper; no `hit` by `street-shopkeeper` on the guard. Control: a pair
  `{ "role": "guard" }` / `{ "role": "shopkeeper" }` added to `answers`.
- `step4-clash-way-out-brawler`: the slowest hero (runs 76, jumps 47.5 px)
  standing in the brawl walks out west to the throne room, and a second
  run pushes up into the cantina doorway (column 20) during it, both
  inside 10 s. Control: no walk, and he is hit again.

Then run every scenario and count reds before re-timing anything. Expect
`step12-guard-follows-into-camp` red (its walk passes the villain while
the guard swings; it is the chase this push makes into a brawl): re-time
it keeping its claim (the guard follows through both doors), e.g. the hero
runs past the villain, and name it. **Stop and report before re-timing if**
a gate C or D scenario goes red (`step4-villain-robs`,
`-villain-buys-politely`, `-catastrophe-and-escape`, `-zero-alarm`, ...:
`grep -l '"gate": *"[CD]"' scenarios/*.json`, 19 files), or more than five
of the 38 street scenarios with placements go red with a real behaviour
change. Step 4's own scenarios are yours to re-time; any other step's red
goes to its owner by message, with the list in your report first.

**Push 2, seen by touch on a phone.** A new `scripts/e2e/clash.ts`, fact
`clash-street`, copying `scripts/e2e/fight.ts`'s walk and provoking
(Step 18's; read every number from `window.irreverents.drawn`, never
server state): a phone-sized page by touch provokes the street guard,
leads him to the villain, and the fact passes when the page draws the
guard's and the villain's x each jump (knocked) at least twice within a
few seconds of each other while the hero's drawn x is at least four tiles
away and moving away. Control `E2E_TOUCH_BREAK=attack` (or `answers`
emptied in a scratch build): red. Its one call line in `scripts/e2e.ts`
(inside `if (!LIVE)`: not in `check:live`'s list until it has been green
ten runs; the e2e-reds brief owns fixes there, so add only your line, pull
and rebase before you push, and say so in your report). Shots at 844x390
and 390x664 of the brawl with the hero walking off, into
`docs/plan/step-4-shots/clash-street-*` (set the viewport before the shot,
as `shots()` in `scripts/e2e/ranged.ts` does; the e2e phone is 750x340).

**Push 3, only if budget remains: the courtyard's bandit behind the
opened gate.** Proof only, no placement: `step4-clash-courtyard-gate`, the
street chase into the courtyard (the inputs of
`docs/plan/step-24-courtyard-draft/step24-courtyard-guard-meets-bandit.json`
as a start), two `crate` scenario entities with `"room": "courtyard"` on
tiles [16, 7] and [22, 7] (the gate open from tick 0), `"placedRooms":
["courtyard"]`; the hero goes east through the gate past
`courtyard-fighter-1`'s back and out by the gallery door; the guard meets
him and they trade blows (two hits each way). Control: no crates (the
gate shut, no meeting). Note where each of them ends up (a body knocked
through column 29 is carried into the gallery: D-077, not a fault, note
it). Leave the draft folder in place (Step 24's, for its reviewer).

## Yours and not yours

Yours: `content/hostility.json` (the additive `answers`),
`src/content/kinds/hostility.ts` (additive), `src/sim/systems/clash-fight.ts`,
one `world` number in `content/tuning.json` (additive; shared file: pull
and rebase right before), `scenarios/step4-clash-*.json`, the re-times
named above, `scripts/e2e/clash.ts` and its one line in `scripts/e2e.ts`,
`docs/plan/step-4-shots/clash-*`, your notes, the decisions-log entries,
the `docs/deliberate-designs.md` line, and afterwards
`docs/mechanisms/npc-response.md` ("Who fights") and
`docs/mechanisms/outposts.md` ("Chase and clash").

Not yours, each another builder's tonight: `content/placements/courtyard.json`
and `content/dispatch/castle-street.json` (`guard-vehicle-courtyard.md`;
its push 3 puts a guard on a trike in the street's top row: a ram is
`machine-crash`, not `hit`, and a seated driver never fights, so your rule
does not touch it; if a later push makes a ram a `hit`, say so in the
notes, change nothing); the undercroft and the quarry cave
(`hidden-recruit.md`); `scripts/e2e/camp-row.ts`, the camp's horn rule and
any e2e fix (`e2e-intermittent-reds.md`); `src/client/draw/hud.ts`,
`aim-edge.ts` and backdrops (`phone-legibility-pass.md`). Step 18's
`fight-struck.ts` and `outpost-fight.ts`, Step 2's `attack.ts`: read, do
not edit. Every room file (no tile, door or part change) and every
placements file.

Out of scope, however tempting: the watch attacking the villain on sight
(it breaks gate C's rob loop; the villain stays in `notRoles`); guards who
climb or jump into the camp; a bandit placed west of the courtyard gate;
moods or calls from a brawl (D-060); bandits following through doors (the
camp's `INTENT:`, D-061); the camp row's shot and its 2-in-100 door case.

Traps: every e2e run rewrites shots under `docs/plan/`: `git checkout --
docs/plan/step-2*-shots` (yours excepted) before you commit. Answering
must not stack past the cap or summon anyone: if a brawl ever emits
`call-started`, it is a bug in your change. A guard answering instead of
walking to a door (`c.respond.door`) misses that chase: that is the slip
away, wanted; a follower who never resumes once the memory runs out is a
bug. Stop at about 300k tokens wherever you are, with "Landed so far"
above filled in.

## Decided vs. open

Decided: above. Open, yours, `DRAFT:` with a decisions-log entry: the
field's name, the memory's length, the turn-to-the-striker reach, the
scenarios' inputs. For the owner, by playing (already in the step file):
whether the watch and the villain brawling is funny or a chore; whether
the shopkeeper should join in; whether guards should ever fight the
villain on sight. Nothing waits on him.

## Done

Each push: `npm run build`; `npm run check` green (it plays the way-out
check for every roster hero: it must stay green), every scenario, controls
watched failing and named in the commit; `npm run gates` 6 of 6. Your own
e2e facts green twice by touch on a phone-sized page; then **rebase once
and push without waiting on a full e2e** (the orchestrator's clean-worktree
run covers the suite; `row-both-sides` and `suplex-again` are known
intermittent reds). After the push: `/debug/errors` and `/healthz` first,
then `npm run check:deployed` and `npm run check:live` ok. On a deploy that
seems stuck with `/healthz` healthy on an older commit: **never revert**;
wait up to fifteen minutes pushing nothing, re-running `check:deployed`.
Push 2 also: the shots at 844x390 and 390x664 of the brawl, paths in your
report. Then `docs/mechanisms/npc-response.md` and `outposts.md` get the
answering rule; `docs/vision-gaps.md` is the orchestrator's to refresh.
