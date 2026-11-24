# Step 4 — People who react

**Reference.** Plan step; its status line is in docs/plan.md.

## 2026-11-23 19:40 UTC, the owner's verdict after playing: the town's tiers (waits)

**Owner, 2026-11-23 ~18:30 UTC, to Vision Partner, first-hand, after playing
on a phone** (`docs/vision.md`, "The measure"):
> Remember the original intentions for the game and make sure things align with it. I want to play it as I described it.
> There are no heists or stealth yet, no puzzles, no hidden places to explore, no characters to unlock, no escalating combats or chases, no power/item stealing,  no vehicle hijacking, no risk. Virtually everything described in the vision docs that would make the game genuinely fun to play is yet to be seen at all

The re-plan from these words is `docs/plan/core-loops.md`. This step's part is
the second half of its **playable 5, "escalating combat and chases"**
(section 5, "Part 2, waits: the town"): a guard who sees you fight on blows a
whistle under a gauge (a real, interruptible call, or it breaks D-063); a
finished whistle lights the next pip and the next row of a dispatch table
walks in by both street doors; the pips follow you from room to room; an
armoured guard from the approved P08 enemy atlas. Doc 27's whistle and doc
26's wanted ladder are PROPOSED: `DRAFT:`. **No brief yet: it waits** for a
free builder; Step 18 slice A, which it sits beside, is on `main` and
reviewed. New files `content/dispatch/**`, `src/sim/systems/alert-dispatch.ts`,
`alert-whistle.ts`, `scenarios/step4-tier-*.json`. Its sight is drawn by Step
19 (`handoff-prompts/loop-heist.md`), which edits one export in
`src/sim/npc/sight.ts` and the Use selection in `npc-interact.ts`.

## Why

**Owner (Drive, doc 11, D-048, D-063, D-073), via `docs/vision.md`:**
> NPCs GENERALLY have exactly THREE high-level psychological modes: (1) BUSINESS AS USUAL, (2) CONFUSION / DISTRESS, (3) ABSOLUTE BLINDING VIOLENT RAGE. …
> BOTH good-guy social counteroffense and bad-guy outpost reinforcements require an ACTUAL COMPLETED CALL FOR HELP …
> GOOD-GUY MODE 3 … is NOT instantly reversible by performing a normal action

**Owner (Drive, doc 11, D-055):**
> NO NPCS WILL HAVE AI. … Their three emotional modes and role-appropriate reactions are implemented through ordinary scripted game states, explicit event/role mappings, triggered animations and fixed response behaviors.

**Owner (Drive, doc 11, D-019):**
> Failure of stealth opens satisfying battles, last stands and narrow escapes, NOT an automatic-reload punishment loop.

The library's third and fourth build gates (doc 24): C, "shopkeeper +
villain demonstration supports normal robbery as comfortable conflict,
polite villain transaction as distress, persistent violation as rage, and
quick reset"; D, "same location supports a zero-alarm intrusion AND a
catastrophe that becomes enjoyable combat/pursuit with a credible escape."

## Goal

In the castle street stand a shopkeeper, a guard and a villain, each
happily playing their part. When the heroes break the script, people are
first confused and upset, and if it goes on, furious. Help only comes if
someone who saw it actually reaches a place to call from and finishes
calling. So the players can lift something valuable unseen and walk out,
or get caught and have a brawl and a getaway that is more fun than the
plan was.

## What's decided

- **Scripted, never AI.** Roles, the three modes, and "what does this
  role make of that action here" are data tables and fixed state rules.
  Call it NPC response logic in code and docs.
- **Exactly three modes;** counters and timers behind them are
  implementation, not extra modes (doc 24, "Mode logic").
- **A person's mood and the area's alert are two separate things**
  (D-065; doc 24, "No omniscient response"): mood 1/2/3 per person; alert
  0..N per area, lifted off 0 only by a completed call, and more help
  always needs another completed call (D-063, D-075). No witness, no
  call. Calming a person does not withdraw a call already made (D-066).
- **Help is not psychic** (D-065: "Escalation is not omniscient").
  Responders go to the place that was reported, search from there, and
  chase only a hero they then see. They never home in on the players.
- **Who may call** (D-064, D-070, D-071): a good guy only from mood 2 or
  3, never from business as usual; a villain from business as usual too,
  whenever he recognises a hero as a threat, at his own side's signaler.
  Either way nothing comes until the call is completed, and it can be
  stopped (D-066): knock out the caller, break the bell, get there
  first. Someone who finds a knocked-out person may become distressed and
  try to call (D-064).
- **Calming down has two halves, both confirmed, both written for good
  guys.** From distress (mood 2): visible expected behaviour calms a
  person at once, "Yup! Just as expected!" (D-042, D-072); this is build
  gate C's "quick reset", it stays, and the owner calls its speed "core
  to the game's comedy and strategy". From rage (mood 3): no normal
  action in view works (D-073).
- **An alert cools only by hiding and waiting** (D-068, D-074, D-076).
  Break contact with every pursuer, stay unseen, and attack nothing (not
  even in self-defence), break nothing, do nothing unexpected; after long
  enough the alert falls, and once it is below the violent level ordinary
  behaviour reassures again. Being seen again, or any incident, restarts
  the wait. Going through a door does not cool it, and pursuers may
  follow (D-077; Step 3 builds doors that carry anyone). The surest
  escape is a spot pursuers cannot easily reach (D-076): Step 3 owns
  hiding places, ask it for one. How long is open: pick, `DRAFT:`.
  Whether hitting back during a pursuit raises the alert number or only
  blocks cooling is open too (doc 27): pick one, `DRAFT:`.
- **Gate C's "polite villain transaction" is played by the scripted
  villain** (a fixed routine, D-055). A hero buying a potion is business
  as usual; a villain politely buying one "is horrifying to the
  shopkeeper, more so than a conventional villainous robbery. The world
  evaluates WHO is acting and WHAT their expected role dictates" (D-050).
- **Where older library text disagrees with a later owner correction, the
  later one is in force.** The library itself labels these as overriding:
  rage is not undone by one normal action (D-073, over doc 24 "Mode
  logic": "Both distress and rage can rapidly reset…"); pursuit is not
  escaped by acting normal in view (D-067); a villain may call from
  business as usual (D-070). Build the newer rule and mark the site
  `INTENT:` with its D-number (Q-005 only asks the owner to tidy the
  stale lines in Drive). Keep `DRAFT:` for what the library leaves open:
  timer lengths, the alert scale, how many levels.
- **Getting caught opens play.** No fail screen, no reload, no forced
  restart of the room. An alarm starts something.
- **Very little dialogue** (D-057): a bark is a few words or a symbol over
  a head, not a conversation.
- **Bounded crowds:** cap how many people are active at once (doc 24).
- **People are placed by data this step owns**, separate from room
  geometry (Step 3). Until Step 3's castle street exists, use a scratch
  room of your own; move the people over when it lands.

## How to cut it (a suggestion, not a rule)

This is the most rule-dense step and the likeliest to slip. Build the
rules against small test rooms of your own first, driven by made-up
events, so nothing waits on Step 2's hits or Step 3's map; then place
the people in the real street. If the night runs short, ship fewer
*kinds* of people (shopkeeper, guard, a call bell) rather than a person
with the wrong number of moods: **never ship someone with fewer or more
than the three.** Reinforcement waves and the villain's outpost horn are
the first things to leave for later.

## What's open (the lead's to measure and decide)

- The rule tables themselves. Read, in `docs/design-library/02-gameplay-systems/`:
  `23-the-three-npc-modes-role-consistent-behavior-distress-rage.md`,
  `26-witnesses-reporting-and-wanted-levels.md`,
  `27-persistent-wanted-pursuits-and-three-sided-battles.md`,
  `07-stealth-heists-npc-reactions-and-pursuit.md`, and
  `22-narrative-dissonance-provocation-and-instant-reassurance.md`; then
  the register for D-041–D-051 and D-059–D-077.
- What "seen" is (a cone, a distance, a wall in between), and what hiding
  is, at the simplest level that makes sneaking a real choice.

## Feedback signal

Scenario scripts in `npm run check`, each with a control watched to fail,
named `step4-*.json` and tagged with their gate: signals 1, 1b and 2 are
gate C; 3, 4 and 5 are gate D. **One tagged scenario passing is not a
gate:** a gate counts for this step only when `npm run gates` lists a
scenario for each of its signals. Write that list under Measure.
1. The villain robs the shopkeeper: the shopkeeper stays in business as
   usual (this is the expected story), and does not call.
1b. The same villain comes back and politely buys a potion: the
   shopkeeper goes to confusion and distress (D-050). The villain then
   robs him properly: the shopkeeper calms at once and goes back to
   happily opposing him. Control: a hero buying the same potion leaves
   him in business as usual.
2. A hero does the unexpected to the shopkeeper: confusion and distress,
   and one expected act calms him at once (D-072). The hero persists
   instead: rage, which the same expected act does *not* calm (D-073);
   only getting away, staying unseen and causing no incident does.
3. A witness in mood 2 or 3 walks to the call point and completes the
   call: the area alert rises and help arrives at the reported place, not
   at wherever the heroes have gone. Control: the same scene with the
   witness knocked out before finishing and nobody there to find them:
   alert stays 0, nobody comes.
4. Zero-alarm: a scripted route takes the valuable and leaves with the
   alert at 0 and no call completed.
5. Catastrophe: the same room, seen; a call completes; help arrives. The
   players get away, hide, and do nothing; after the wait the alert
   falls and they can come back. Controls: walking through a door alone
   does not cool it; hitting a pursuer during the wait restarts it.
6. `npm run gates` reports gates C and D as passing.

## Stopping condition

The six signals pass on `main` and live, and "how to add a role, a person
or a rule" is in `docs/architecture.md`. **Budget:** closed by about 09:15
UTC, 2026-11-23.

## Owns

NPC response logic, roles and rule data, who is placed where, seeing and
hiding, calling for help, the area alert; exact paths as
`docs/architecture.md` assigns them.


**Every body is Step 2's, player or not** (added 2026-11-23 04:35 UTC,
from the plan review): how it runs, is hit, held, thrown and knocked
out, and the events that say so. Step 4 never moves a body itself: its
systems decide what a person wants and hand that body the same input a
player's device would (walk left, attack), and its rules read Step 2's
events. The two leads write the event names into `docs/architecture.md`
(hit, grabbed, thrown, impact, knocked out, recovered; each says who did
it to whom) before the code that depends on them. Step 4's made-up test
events use exactly those names, so swapping in the real ones is a
deletion.

**Four files are shared between steps** (`docs/architecture.md`, "Files
two steps must both touch"): `src/sim/types.ts`,
`src/sim/systems/physics.ts`, `src/client/render.ts` (Step 1 is in it
until its Gate 2 lands) and `content/tuning.json`. In those: additive
edits only, keep each one small, `git pull --rebase` right before
pushing, and re-run `npm run check` after the rebase. That table of
owned paths was written by Step 1 before any other lead existed; if it
is wrong for your step, fix it there and tell the orchestrator.

## Taste, for the owner in the morning

Whether the three moods read at a glance on a phone; whether being caught
is fun; whether the shopkeeper being pleased to be robbed is funny.

## Measure

*(Lead `session_017WiGzG4WzuJfHAu3XWoUhc`, 2026-11-23 04:33 UTC, at `b3a419e`.)*

- **Baseline:** `npm run check` green with 3 scenarios, none about
  people; `npm run gates` 0 of 6. No NPC code or data exists.
- **Read for the rule tables:** library docs 23, 26, 27 and 07 in full,
  the register's D-041–D-077, doc 24's gates, mode logic and "no
  omniscient response". **Not read:** doc 22 (the earliest of the five;
  23, 26 and 27 each carry later owner corrections that override it).
- **Nothing outside a player's own verbs can act yet.** Systems cannot
  read events, the `verbs` system skips non-players, scenarios drive
  players only. So slice 1 adds a readable `ctx.events`, its own
  `interact` reader and scripted routines, and waits on nobody.
- **State must ride on entities.** Step 1's server replicates entities
  generically; a new `World` field might not travel. All of this step's
  state is `entity.c.*`, the area alert included.
- **Seams** (messages sent to both leads 04:30 UTC): Step 2 emits `hit`,
  `grabbed`, `thrown`; this step maps event types to deeds in data.
  Step 2 creates `content/placements/` and `populateRoom` (its push 1)
  and hands the kind over; this step extends it with `npc`, `routine`
  and bodiless `things`. A person's body is an ordinary character kind;
  this step writes `entity.c.input` (an `Input`) and Step 2's rule
  in `systems/verbs.ts` lets such a non-player use its verbs
  (`docs/architecture.md`, "Bodies"). Out
  cold is Step 2's `c.flattened`. Pursuers walk and never jump, so any
  ledge is a refuge without a special object. Following through a door
  waits for Step 3's door.

**Decided by the lead** (each `DRAFT:` at its site; the first three and
the alert ones are in `docs/decisions-log.md`):

- *Seen* = same room, in front of the person, within about 7 tiles
  across, no solid tile on the line between. The target of a deed always
  perceives it.
- Rage cools to distress, not straight to calm: after the cooldown an
  expected act is what finishes the job (D-074's last sentence).
- The villain's routine in the street is the library's own vignette (rob,
  leave, come back and buy politely, then rob properly), looping, as a
  placeholder (D-096; doc 23 labels it an example).
- The alert scale is 0 to 3, one level per completed call; it falls one
  level per stretch of hiding (about 20 s), and 1 or more is "the violent
  level".
- Hitting back during a chase restarts the wait and does not raise the
  number: only a completed call raises it (doc 27 leaves this open).
- A report names the heroes as a party; every hero is wanted together
  (D-065 wants witnesses to identify the attacker; with one shared party
  tonight there is one thing to identify).
- Missing goods are not noticed by themselves tonight; a person has to
  see the taking.

**The cut:** slice 1, people with three moods (gate C, signals 1, 1b,
2); slice 2, the bell, the call, the alert, responders and hiding (gate
D, signals 3, 4, 5), started when slice 1's foundation is on `main`;
slice 3, into the real street and live, following through doors, the
guard's whistle. The villain's own horn and reinforcement waves are left
for later, as the step suggests.

## Briefs

- **Slice 1, shipped and reviewed** (worker `session_017WiGzFBg5B72dx48zdiZh9`,
  `a501061` + `15cea88`, 04:46 and 04:53 UTC; brief deleted). People
  with three moods, seeing, the rule tables, routines, `interact`, mood
  marks. **Gate C's scenarios, by signal:** 1 `step4-villain-robs`; 1b
  `step4-villain-buys-politely`, `step4-hero-buys`; 2
  `step4-hero-fluke-reassured`, `step4-hero-persists-rage`,
  `step4-rage-needs-unseen`; also `step4-unseen-take`,
  `step4-hero-hits-shopkeeper` (a real Step 2 hit). Lead's review, full
  depth on the rules: build, check (53 ok) and gates re-run on a fresh
  pull; two controls of my own (villain `buy` made expected fails 1b;
  sight made to ignore walls fails `step4-hero-persists-rage`); the test
  room loaded at phone size (844×390) with no page error. **Not
  verified by me:** the mood marks on screen (the worker looked at them
  at desktop size; my own scripted run did not provoke a mood), touch,
  two phones. Carried to slice 3's rung 5. The durable record is
  `docs/mechanisms/npc-response.md`.
- `handoff-prompts/step-4-slice-2-alarm.md`: the bell, the call, the
  alert, responders, hiding and cooling; gate D. Worker
  `session_017WiGzHFR7FTJpj44ENRzvm`, launched 04:47 UTC,
  after slice 1's part 1 landed at `a501061` (04:46) and the lead
  re-ran it: build and check green; control: the villain's polite
  purchase made "expected" fails `step4-villain-buys-politely`. Not
  re-verified by the lead: sight through walls, anything on screen.
- **Slice 3 (cut down), shipped and reviewed** (worker
  `session_017WiGzFdtAuDTrQyWoR9cD6`, `a873218`, 08:57 UTC; brief
  deleted). A shopkeeper with a counter and three goods, the villain's
  loop (about 53 s a round) and a pacing guard are in `castle-street`,
  one door east of where players start; `step4-street-people`. Lead's
  review, 09:00 UTC, on a fresh pull and **on the live address at
  `a873218`**: build and check green (68 ok). Two separate browser
  players in one private live world: one walked from the throne room to
  the goods and pressed Use once; **the other player's screen** showed
  the goods gone and the shopkeeper's "W-what?!" (screenshots read
  back). So take-by-Use works between two players on live. This
  **contradicts the worker's flag** ("Use does nothing on the real
  page"): its nine tries were on a local build, most likely from before
  Step 1's fix (`2a7fd98`). **Not verified by me:** Use by a finger
  (I pressed the key; the worker saw the touch control on screen), a
  purchase calming him across two players, the `!` mark and rage on the
  live page, a real iPhone.
- **Not built:** treating a body with `c.roomHide` as unseen (one line
  in `src/sim/npc/sight.ts`; the component is on `main` since cb297c0,
  no hiding place is placed in the street yet); following through
  doors; the street's gate D scenarios. All wait with slice 2.

## Open with the owner

- Q-005 (stale rules in the library; the newer rule is being built). Not
  blocking: it does not hold this step open.

## Handoff notes

*(Newest last.)*

- **Lead `session_017WiGzG4WzuJfHAu3XWoUhc`, 04:40 UTC.** Claimed,
  measured, decided (above), slice 1's worker running, slice 2's brief
  written and held. Seams agreed by message with the Step 2 lead (his
  briefs carry them) and with the Step 3 lead (the street is `castle-street`, first
  push due about 05:30; open edges carry any entity, stick-up doorways
  need a field he will write into `docs/architecture.md`; refuges are
  ledges and nooks, no hide-inside object in his slice A). Next: when the
  worker says "slice 1 part 1 at <commit>", re-run it (build, check, one
  control of my own), then launch slice 2; review each slice by
  re-running; write slice 3 once the street is on `main`. Gate C needs a
  scenario per signal 1, 1b, 2; gate D per signal 3, 4, 5: read the
  gate lines by scenario name.
- **Lead, 04:53 UTC. For slice 3, from the Step 3 lead:** `castle-street`
  and `throne-room` are on `main` (9a4f6a8; `docs/mechanisms/rooms-and-doors.md`,
  and `docs/architecture.md`, "Rooms and doors: what other steps read").
  The street is 46 tiles of flat floor with no ground-level wall; out of
  sight means building 2's upper room (columns 25-32) and the jump-only
  awnings and roofs. A walk opening carries any body; a doorway needs
  `askForDoor(entity)` or a fresh stick-up in `c.input`; `changed-room`
  is the event; `doorToward()` gives a pursuer its door. His slice B adds
  hiding places: a body with `c.roomHide` is to be treated as unseen.
  Not yet read or re-run by me.
- **Lead, 04:55 UTC. Slice 1's flags, routed** (its eight entries in
  `docs/for-the-lead.md`; I first misread the file as emptied by another
  lead, which was wrong, see `docs/process-observations.md`): `interact` has no checked touch control,
  and the server must run `npc-interact` with each player's held actions
  (both sent to the Step 1 lead; **live until someone presses Use on a
  phone-sized page**); the blow that knocks someone out was not
  perceived by them (decided: it is; sent to slice 2's worker); who
  calls is decided by mood, not by `deed.witnesses` (slice 2); the
  test-shop scenarios pin ticks (in the mechanism doc's traps); two
  near-duplicate facts, `event` with `where` (Step 2's) and
  `event-where` (ours): fold into one when either is next touched.
- **Lead, 08:35 UTC. HELD by the orchestrator.** Every session was
  stopped by the account's usage limit at about 04:58 UTC. Slice 2's
  worker (`session_017WiGzHFR7FTJpj44ENRzvm`) stopped ten minutes in,
  while writing placeholder scenarios: nothing of it is on `main`, its
  container is disconnected, and it was **not** relaunched or messaged
  (the orchestrator's instruction; the allowance until 13:20 UTC goes to
  what makes the game playable on a phone). Its plan, from its last
  message, for whoever redoes it: new systems `npc-call` (55),
  `alert-respond` (56), `alert-cool` (620) that overlay `c.input` after
  `npc-act`; drawing in a new `src/client/draw/alert.ts`; its only edits
  to slice 1's files are `rageMayCool()` and an optional `call` field
  and a `bell` look on things. **When released, the order is slice 3
  first, then slice 2** (the orchestrator, 08:30 UTC). Slice 3's brief
  assumes slice 2's responders exist: before launching it first, cut it
  to the placements, the villain's loop, hiding places and the
  phone-sized look, and move following through doors and the street's
  gate D scenarios to after slice 2. From other leads while stopped:
  Step 1's Gate 2 brief (dcfa465) requires the Use control on the phone
  page and the server passing each player's held actions to `step()`;
  Step 6 creates `content/placements/throne-room.json` (plain bodies, no
  `npc`) and will ask before adding a `king` role to `content/npcs/` and
  `content/rules/`.
- **Lead, 08:47 UTC. Released for slice 3 only** by the new orchestrator
  (`session_017WiGzJeh7Tuov59d8XYmru`; report there). Measured at
  `2f634bd`: the live start room is still `graybox-hall`, and
  `castle-street` is reachable only through `throne-room`, so nobody
  playing can get to the street yet. The brief
  (`handoff-prompts/step-4-slice-3-street.md`, rewritten 08:45) is cut
  to: the people and the villain's loop in `castle-street`; a stand-in
  shopkeeper in `graybox-hall` if the start room has not moved (`DRAFT:`,
  appended to Step 2's placements file); the first phone-sized look with
  touch; `c.roomHide` unseen only if it has landed. Following through
  doors and the street's gate D scenarios wait for slice 2, still held.
  Worker due done or stopped by 10:00 UTC.
- **Lead, 09:01 UTC.** Slice 3 is live and reviewed (see Briefs).
  Slice 2 (`handoff-prompts/step-4-slice-2-alarm.md`: the bell, the
  call, the alert, responders, hiding; gate D) is **still held by the
  orchestrator** and has no worker; gate D has no scenario from this
  step. Slice 3's flags, routed: the stale-`dist` trap is in
  `docs/verifying-and-finishing.md`; `scripts/trace.ts` crashes in a
  room that has `things` (it reads the box of kind `~thing`; `scripts/`
  is not this step's: sent to the orchestrator); Step 3's hiding place
  under building 1's overhang will share columns 10-17 with the shop
  (every column is `DRAFT:`; moving the shop needs `step4-street-people`
  re-traced). For the morning: the villain's first robbery is about 5 s
  after the world starts, his polite purchase at about 19 s and every
  53 s after; a hit knocks the shopkeeper out (Step 2's default
  toughness).
- **Lead, 09:05 UTC. Slice 2 released** by the orchestrator: one fresh
  worker from the existing brief (its new first section orders four
  small pushes: bell/call/alert/guard responding with a bell in the
  street; following through doors; hiding unseen; the rest), hard stop
  10:15 UTC with whatever is green. `scripts/trace.ts`'s one-line fix is
  folded into push 1 (the orchestrator gave it to this step).
- **Lead, 09:36 UTC. Slice 2 push 1 reviewed** (`513dbf5`, worker
  `session_017WiGzEUPtEnYYKos3LUoLn`, second run). A bell, the call,
  the area alert, the placed guard responding, cooling; `street-bell`
  at column 24 of `castle-street`; `scripts/trace.ts` mended. **Gate
  D's scenarios, by signal:** 3 `step4-call-brings-help`,
  `step4-call-stopped-no-help` (bell broken; the knocked-out-caller
  version is not written); 4 `step4-zero-alarm`; 5
  `step4-catastrophe-and-escape`, `step4-incident-restarts-wait`; and
  `step4-rage-without-a-call` (the one-raise rule). Review: fresh pull,
  build and check green (82 ok), gates C and D listed by name; the
  alert has one raising line (`src/sim/npc/alert.ts`); my control
  (responders steering at any hero in the room instead of one they see)
  fails three of the six. **On the live address** (1219e77, two
  separate browser players, private world): one took goods in view; on
  the other player's screen the shopkeeper showed "?", walked to the
  bell, and ten seconds later an alert mark was at the top of the
  screen and the guard, red with "!", had come down the street to the
  bell. **Not verified by me:** hiding until the alert clears on the
  live page, touch, a real iPhone. Still to come from the worker before
  its 10:15 stop: following through doors, hiding unseen.
- **Lead, 09:48 UTC. Slice 2 push 2 reviewed** (`ade2616`): a chasing
  guard follows a hero he saw leave through a door (system
  `alert-follow`, order 605), never one he did not see leave; a door
  alone never changes the alert; the guard goes home through the doors
  when the alert is over. The worker also found and fixed a real bug on
  rebase (a searching guard pacing into a walk door was carried back
  and forth for ever). Gate D now lists 9 scenarios: the 6 of push 1
  plus `step4-guard-follows-seen`, `step4-leaves-unseen-guard-stays`,
  `step4-door-and-back-alert-unchanged` (the step's door control).
  Review: fresh pull, build and check green (91 ok), `npm run gates`
  5 of 6, `check:deployed` ok; my control (a guard follows anyone who
  leaves, seen or not) fails `step4-leaves-unseen-guard-stays`. Not
  looked at on the live page.
- **Lead, 09:48 UTC. STOPPED for the night** on the orchestrator's
  word (the account is near its weekly limit): the worker was told not
  to start push 3. **What is left of Step 4, for a fresh lead:**
  (1) hiding places count as unseen: one line in `src/sim/npc/sight.ts`
  (a body with `entity.c.roomHide` is not seen; Step 3 has placed hide
  parts in `castle-street` and `throne-room`), a scenario, a control;
  (2) the step's own signal-3 control, the caller knocked out before
  finishing (Step 2's `attack` is on `main`), and its partner rule:
  the blow that knocks someone out is perceived by them, and someone
  who finds a knocked-out person may call (rule 7 in the slice 2
  brief); (3) a real iPhone check of Use, the marks and the alarm.
  Gates C and D are passing with a scenario for every signal except
  (2). The slice 2 brief stays in `handoff-prompts/` until (1) and (2)
  are done; its first section says what is left.
- **Lead, 10:00 UTC. Slice 2 push 3 reviewed** (`f164e0c`): a hero
  standing still in one of Step 3's hiding places (`c.roomHide`) is not
  seen (`src/sim/npc/sight.ts`); `step4-hiding-is-unseen` and its
  partner; gate D lists 11 scenarios. Review: fresh pull, build and
  check green (93 ok), gates 5 of 6; my control (the hiding line
  removed) fails the hiding scenario. Not looked at on the live page.
  The worker (`session_017WiGzEUPtEnYYKos3LUoLn`) had not seen the stop
  and was starting push 4; I interrupted it at 09:54. **So of the list
  above, (1) is done; (2), the knocked-out pieces and the
  `step4-caller-knocked-out` control, and (3), a real iPhone, are what
  is left.** Any uncommitted push-4 work in the worker's container is
  not on `main` and should be redone from the brief, not recovered.
- **Lead, 10:03 UTC. Slice 2's flags, routed here** (its section in
  `docs/for-the-lead.md` is removed; the mechanism doc carries the
  shapes). **For whoever briefs next, and for the taste list:**
  - Being caught in the street is a red guard standing over you: the
    guard's body has no `attack` verb, so nothing lands. The alarm does
    not clear while he can see you. Giving him Step 2's `attack` is one
    word in `content/characters/guard.json` plus its numbers; not done,
    because how hard a guard hits is the owner's to feel first.
  - A hero runs 2.4 times as fast as a guard walks and sight is 7
    tiles, so a guard only sees you leave by a door that is close.
    Leaving by a far door is nearly always unseen.
  - A guard who watches a hero step into a hiding place stops seeing
    them the moment they stand still, walks to the spot and searches
    around it. Nothing remembers "I saw you go in there". Funny or
    broken is the owner's call.
  - Only someone upset **by a hero** goes to the bell (the villain's
    polite purchase does not send the shopkeeper there every minute);
    a caller rings again only after seeing something more; the alarm's
    wait is held by anyone conscious seeing a hero, the villain too.
  - A guard who followed into another room still answers to the alarm
    of the room he was placed in.
  - Seven scenarios are pinned to `content/placements/castle-street.json`'s
    routines and columns: moving a person or a timing there means
    re-tracing them.
  - `call-stopped { why: "knocked-out" }` is emitted but no scenario
    covers it (part of what is left).
  - Hiding **is** playable: `castle-street` and `throne-room` each have
    a hiding place (`grep -l '"hide"' content/rooms/*.json`, 10:03 UTC;
    the worker's note that none was reachable predates Step 3's push).
    Not tried by anyone on the page.
- **2026-11-23, Step 2 feel:** `step4-hero-hits-shopkeeper`'s hit window widened for Step 2's attack wind-up (hit and deed 100–115, mood 2 from 116; granted by the Step 2 lead), 252e5ce.

## Builder notes (the town's tiers, `loop-town-tiers.md`)

Builder `session_017WiGzFxZZnM2VcdqhXnrNu`. Push 1 (the sim), 2026-11-23.

- **Controls watched to fail** (each restored and re-run green):
  `-whistle-brings-row`: the dispatch file removed (no guard whistle, alert
  stays 1). `-whistle-stopped`: the second hit removed (the whistle
  completes). `-no-whistle-unprovoked`: the "something more" rule removed
  (he whistles three times on sight). `-both-doors`: the file's doors cut to
  the west one. `-cap-holds`: `npcDispatchCapOn` 0 (11 people). 
  `-cools-and-leaves`: the walk-out off (8 people remain).
  `-away-at-the-most-*`: the arrivals given a body with runSpeed 140 (a
  control character, the placed guard unchanged): all five fail, **but on
  the tick-pinned facts** (the leaving tick, the row's tick). With fast
  arrivals the brawler is still being hit and the alert never cools; the
  infiltrator (and others) still get away, because the way out there is
  height and doors (the throne room's platforms; nobody follows who did not
  see them leave), not only speed. So the claim these check is "a way out
  exists at the cap", not "speed is the way out".
- **The probe the brief asked for before choosing the cap:** done at cap 8
  for all five roster heroes, solo, between rows from both doors (the
  scenarios). None stuck.
- **Not re-timed:** no `step4-*` scenario changed. No `step3-`, `step11-`,
  `step12-`, `step14-`, `step18-`, `step19-` scenario went red.
- **Outside my paths, one word each:** `scripts/lib/room-controls.ts` leaves
  `dispatch/` out of the room controls' content (as it does `outposts/`),
  or every room control refuses on "no room castle-street". A new fact
  `src/scenarios/facts/people.ts` (self-registering; arrivals' ids cannot
  be named ahead in a scenario).
- **Cost:** `npm run check` went from about 1 m 30 s to 2 m 15 s; the five
  per-hero scenarios run 8,000–10,700 ticks each.
- **Seen, not mine, left as they are** (`docs/deliberate-designs.md` read;
  could be design): a raging shopkeeper charges east and hits the villain,
  then rings the bell again because her offenders still include the hero
  (skirmisher run: alert 1 → 2 at 7135 with the hero long gone); the villain
  knocked through the east door stays in the courtyard; guards searching
  press against a hidden hero's body in the awning curtain without seeing
  him (they cannot); arrivals hit each other (friendly fire stays).
- **Not verified:** anything on a page (push 2 draws the gauge and pips);
  `check:live` exercises nothing of this push.

Push 2 (the page), 2026-11-23:
- **Controls watched to fail:** `-pips-cross-a-door` and `scripts/checks/step4-tiers.ts`: `world.alerts` never written (the shown alert 0; A's page shows the street at 1). `-raging-guard-whistles`: the raging-guard branch off (no whistle). The e2e fact `tiers`: its control is the level read before the gauge (one pip fewer); not run with code broken.
- **Found by tracing the phone:** in the usual fight the guard rings the bell himself and is never a responder, so push 1's whistle never came; widened (decisions-log, "Step 4: pips"). A grappler's later blows flatten a worn guard, and a flattening blow is never perceived (slice 1), so those give him no new cause; lighter hits do.
- **Screenshots:** `docs/plan/step-4-shots/tiers-*-750x340.png` (the e2e phone, iPhone 14 sideways): pips under the plate in the street and in the throne room. **Not taken:** 390×664 upright, a frame with the gauge up, a row arriving at each door.
- **Flag (not mine to change):** the level banner draws over the king's speech box in the throne room (banner.ts and the speech drawer, other slices').
- `npm run e2e`'s `tiers` takes about 70 s (a 45 s wait while the guard goes to ring).

Push 2, outcome (2026-11-23 ~23:55 UTC): pushed at b441908, live, then **reverted at
0457923**: the new `check:live` fact `tiers` failed on live (alert drawn at 1 after
14.7 s, then 12 taps and the gauge never drawn; every other live fact passed, game
healthy). Locally the same fact passed three times in a row (e2e). Not yet diagnosed;
leading guesses, unmeasured: on live the grappler's taps flatten the worn guard (a
flattening blow is never perceived, so no new cause), or the drawn guard is smoothed
and late so `closeIn` taps miss. The push's code is good to re-land as it stands
(scenarios, the real-server check and local e2e green); what it needs is a `tiers`
fact that holds over live latency, e.g. a phone character that does not flatten him
(the skirmisher), or `closeIn` waiting for the guard to stand. Push 3 (the armoured
guard) not started. The builder stopped here at its context budget.
- **The armoured guard's sprite (for push 3):** the art cut-outs builder will not cut `armoured-guard`: sprites belong to the cast lane, so it has asked the orchestrator to brief a cast builder (source: P08 chibi-enemy-animation row 4). Until that sprite exists, push 3 ships on the `guard` sprite, as the brief planned.

Push 2, re-land (builder `session_017WiGzHTLU6WYfsfoEFK4si`, 2026-11-24):
- **How it was decided, game or check.** `tiers` replayed against a local server in-process (so its world could be read every 15 ms), the phone's socket routed with delay. Live's round trip measured 105 ms, but its input queue lands a swing ~300 ms after the page shows it (`network.md`), so 300 ms in, 60 ms out, 40 ms jitter. b441908's fact at that setting: **2 of 4 failed** in live's shape (alert 1 in 12–14 s, 12 tries, no gauge); at 150 ms each way 1 of 1 and at 0 ms 2 of 2 passed (why local and the first builder's runs were green). The server's world at the failing moments: the phone's swings missed (the page draws its own hero early and the guard late: 17 px short; overlapping, it faced away; a flying guard is drawn ~50 px behind), and the fight drifted to the courtyard door. **In 17 blows the guard perceived on duty, 13 brought his whistle within 10 s**; of the other 4, 1 sent him out of the street with the same blow and 3 found him not yet raging (D-044's first fluke). So mostly the fact; one part the game's.
- **The game's part, fixed:** a blow that sends the guard who rang the bell out of the street left him in the courtyard until the alert cooled (5 runs of ~40). Now he walks back (`alert-whistle.ts`, decisions-log "Step 4: whistle (the re-land)"). Check `scripts/checks/step4-out-and-back.ts`; control (the branch off): he stays in the courtyard, fails.
- **The fact's part, fixed without loosening it** (same claims, same numbers): after fight-back's moves it meets the guard as a friend would, standing still, turned to him, west of the middle (`meet()`, its `INTENT:`), and walks back in by the right door. Runs at 300/60/40: 6 of 6 with both fixes (earlier fact versions without the game fix: 3/3, 4/6, 5/6). Control: b441908's fact, 2 of 4 failed (above).
- **`-away-at-the-most-*` controls, what each proves now** (not re-run): the control (arrivals' `runSpeed` 140) fails all five, but on the tick-pinned facts (the leaving tick, the row's tick), so it proves the inputs are pinned to this world, not that speed is the way out. What the five scenarios themselves prove: at the cap, each hero has a way out (west door, jumping); for the infiltrator and others that way is height and doors, not speed.
- **Seen, not mine** (flagged in `docs/for-the-orchestrator.md`): a guard standing just inside the courtyard door pushes an arriving hero back out (seen 4 times); after the bell, a perceived blow can send the guard back to the bell rather than whistling (seen once, k4).
- **Flakes seen in `npm run e2e`, not mine:** across 7 full runs on this code, a different unrelated set failed in 4 (`h1` the 75 s reconnect; `cantina-row`, the tapped brawler overlapping another hero; `cantina-in`, B short of the doorway; `plates-stone*`, `plates-pocket`, `weapon-held` together once), and each passed in another run on the same commit; 2 runs fully green. `tiers` passed in all 7.
- **Re-timed:** `step4-tier-raging-guard-whistles` expect[5], the alert-2 window from tick 3155 to 3157: after rebasing onto 7b30a89 (sight, beaten, weapons) the whistle completes one tick later (3156); the claim is unchanged.
- **Not verified:** `check:live` before the push (it runs on the push); 390×664 upright shots; a real iPhone.

## Alarms and the chase, as played (`owner-enemies-chase-alarms.md`)

Builder `session_017WiGzF31gfYgeWNMA7rnEL`, 2026-11-24, at `11b020a`. **The
audit, before any fix.** Taken two ways: a phone-sized page (iPhone 14
sideways, by touch, a local server, 80 ms added each way on the socket;
screenshots in the builder's scratchpad, the camp's strip every 0.8 s) for
what is drawn, and the sim (probe scripts driving `step()` in the real
rooms with placements) for the numbers. The phone view is about 24 tiles
across, so 7 tiles of sight is under a third of the screen.

Marks: **W** works and reads; **T** works but a player cannot tell; **N**
does nothing.

| Place | (a) stand in a band, do nothing | (b) how far he comes / follows | (c) the alarm | (d) beaten | (e) beat one |
|---|---|---|---|---|---|
| Castle street | W: nobody of the good side acts on a hero standing (by design: only a deed upsets them); the band is drawn | W for guards on duty (search, chase, through doors, two per door: scenarios `step4-*`, `step12-guard-follows-into-camp`) | Bell: bar over it while rung, `call-windup` sound, pips top-left, whistle gauge (town-tiers builder's): W. Rows walk in at the street's doors with **no banner**: T. On the phone 4 punches at the shopkeeper raised no call (he left the drawn list): doubt, not chased here | W: thrown into the courtyard (Step 21) | Step 21 / fly-off builder's |
| Bandit Camp | W: lookout turns and goes to the horn in 0.3-0.4 s; fighters in front come in 0.4 s | **N past him**: only 7 tiles, only forward (`canSee`). Run away in front: he follows while you are within 7 tiles, then stands where he last saw you **and stays there** (13-16 tiles from his post, never goes back). Jump over him: he moves **0 tiles** after you, never turns | Horn: shaking horn and a thin bar over the post, **no sound, no banner**: T. Finishes in 3 s; the wave appears at column 41, **off screen** (the view is ~24 tiles), walks ~7 s before it is seen, reaches a hero at column 12 about 9 s after the call: works, T | W: thrown out to the courtyard after ~21 hits, ~38 s standing still | Step 21 / fly-off builder's |
| Quarry road | toll-watcher faces right only, 0.4 s if in front | as the camp: within 7 tiles in front; **behind: never** (every quarry routine is `face left/right, wait 5`: one way for ever). Followed 6 tiles, then stood | none | **N**: no defeat file (Step 21's) | as above |
| Quarry ridge | fighters face left only; brute too | as the road; followed 16 tiles, then stood there | none | N (no defeat file) | as above |
| Quarry pit | heavy faces right, fighter left | as the road; followed 19 tiles, then stood there | none | N | as above |
| Quarry tower | both face left | as the road | none | N | as above |
| Depot | lookout turns every 3-4 s; heavy guard and patrols see in front | as the road; the heavy followed 7 tiles | Horn as the camp (T), finishes in 3 s; **the wave drops through the gap at columns 51-52 and stays in the pocket, never reaches you**: N (Step 22's lead's; not edited) | N (no defeat file) | as above |

**What convicts the chase** (brief step 3, measured): not "they see but do
not move" (they move at once) and not pathing (they walk off ledges; they
never jump, by design). It is **sight forward only and no memory past the
last spot**: a hero who gets behind (a jump over, a walk past) is never seen
again, and `outpost-fight` stands the fighter at the last place seen facing
the old way, then hands him back to a routine that faces one way for ever.
Second: 7 tiles is under a third of a phone screen, so "seen" reads as
"right in front of him".

**After the fixes** (same ways of measuring):

- **Alarms (push at `cbcf273`):** the camp's and the depot's horn are heard
  (the bell's wind-up while blown, the alarm when it finishes) and announced
  in their room: "The horn sounds!", then "Here they come!" as the wave walks
  in; a street row walking in: "The guard is here!". Camp (c) is now **W**.
  The depot's wave still drops into the pocket (Step 22's lead's, told).
- **The chase (push 2):** a fighter, heavy or brute who loses a hero walks
  to where he last saw them, on 3 tiles the way they were going, turns about
  for 4 s, then walks back to his post. Jumped over: he now turns and
  follows 11-19 tiles (was 0) and goes back. A step he cannot climb stops
  him in under a second and he searches there. Camp, quarry (b): from **N**
  past him to **W**. Sight is unchanged (7 tiles, forward): seeing farther
  per kind is built (`sight` in `content/npcs/`) but set on nobody, because
  it turns fifteen scenarios red, the quiet routes among them (the
  orchestrator decides).
- **The way out, measured margin after:** unchanged speeds. Fighter 48,
  lookout 56, heavy 36, brute 28 px/s; heroes run brawler 76, grappler 84,
  flyer 92, skirmisher 120, infiltrator 128. Against the fastest person (the
  lookout): brawler +20, grappler +28, flyer +36, skirmisher +64,
  infiltrator +72 px/s; against a fighter add 8. `chase-jump-over-turns`:
  the brawler is over four tiles ahead of a turned fighter after 3 s.

## Carried here by the orchestrator, 2026-11-24 (from the Step 16 lead's phone walk to the depot at b0a7d5e)

- A sight mark or a bark before a call, so a player sees they were spotted before the horn. Step 19's heist slice draws sight bands; check on a phone whether that covers it before briefing anything.

**Push 3 (the owner's ~01:05 rule): the engine, switched on only in a
check room.** `entries` / `entryAway` / `announce` in `content/outposts/`
(see `docs/mechanisms/outposts.md`, "From the sides"). Measured switching it
on in the Bandit Camp (entries `[[6,7],[24,10],[30,10],[36,10],[41,10]]`,
`entryAway` 12, rows 4 `[fighter, fighter, heavy]` and 5 `[heavy, brute]`,
announce per row): waves reach a hero at column 12 in ~5 s instead of ~9 s,
and seven scenarios go red with real behaviour changes, not tick shifts:
step7-caller-tries-again, step7-last-stand-camp, step7-same-again-hangs-nothing,
step12-walk-out-ends-it, step21-camp-thrown-out, step21-heart-lost-to-a-bandit,
step21-throw-is-no-escape (e.g. the post no longer broken by 600, the
lookout knocked out by the hero's own swings as the first wave reaches him
from the east before his second call, so no second call). The camp's switch
is left for a builder with the room to re-time those with their owners
(Step 21's hearts builder is reshaping its camp scenarios now); the vehicles
B builder wants a wagon in a later camp row. `check step20-machine` failed
twice and passed on re-runs at this push (the flake noted at bbb9702).
- **Outcome, 2026-11-24 ~03:40 UTC:** pushed at 7f148ea; `check:live` failed in **phase 1** (fight-back's moves, unchanged from b441908): 12 taps, the alert never drawn above 0 in 60 s. Reverted at 88b7824. My earlier probe of live with the old code had the same shape (12 taps, 2 landed), so phase 1 was flaky on live all along (b441908's live run passed it). Fixed: phase 1 strikes only once the page draws the guard standing still (he waits 4 s at each end of his beat), from just east of him (`atRest()`, its `INTENT:`). Measured: local replay 6 of 6 from 50 to 400 ms; **against live itself**, with this page's `game.js` swapped in by a Playwright route, phase 1 raised the alert in 2–3 taps in 3 of 3 runs (the rest of the fact needs push 2's server). Also: the fact's "guards after" is now the most drawn in the street over the 2.5 s (one replay run's hero was knocked into the courtyard and counted 0 there; same claim).
- **Landed at a9b2db8 (2026-11-24 04:42 UTC):** `check:live` green, `tiers` included (3 taps to alert 1, the gauge drawn, pips 1 → 3, 6 guards drawn, 3 pips in the throne room); `/debug/errors` holds only the check's own deliberate three. Push 3 (the armoured guard) not started: this builder stopped at its context budget.
- **For the fresh builder (push 3, and the street's rows from the sides):** nothing to re-apply: push 2 (01e7994, 7f148ea and the phase-1 fix) is on `main` and live since a9b2db8. The orchestrator's stop message (04:18 UTC) reached this session only after that push. The chase/alarms builder (`session_017WiGzF31gfYgeWNMA7rnEL`, 03:08 UTC) hands the street's part of the owner's "alarms should spawn more enemies of increasing strength that come in from the sides" to this lane: rows nearer the player's screen edges rather than the two street doors, the bell bringing a row too, and per-row words (mirror the outposts' `announce`, `entries`, `entryAway` from 8ac4812, `docs/mechanisms/outposts.md`, "From the sides") in `content/dispatch/` and `alert-dispatch.ts`. The client already shows "The guard is here!" on `dispatch-arrived` (`src/client/draw/alarm-banner.ts`). The props builder cut the guard vehicles (`guard-vehicles` look group, df67f5d), suggested as a later row.


**Push 4: switched on in the Bandit Camp** (builder
`session_017WiGzHgbh9PtsdzXnTDvqz`, on main at 4d97807). The data above, as
measured. Nine camp scenarios went red (the seven above, plus
step21-heart-out-next-member and -two-players, new since); after the rebase
onto hearts push 3, step21-heart-game-over too. Each re-timed keeping its
claim, each control watched to fail:

| Scenario | What moved | Control |
|---|---|---|
| step7-caller-tries-again | the hero backs west 400 ticks (was 300) after the knock-out, out of the wave's melee, so the lookout gets up and calls again (1472) | tryAgain false: fails 2 |
| step7-last-stand-camp (gate E) | the flyer strikes west and east by turns from tick 900 (rows come from both sides); flaps out over the heavy; legend at 2750: waves 3, came 5, felled 6, 41 s | walk out at 400: no legend |
| step7-same-again-hangs-nothing | second visit strikes both ways and flaps out at 3290 | hallRelativeOn 0: fails 1 |
| step12-walk-out-ends-it | the hero stands 2 tiles nearer the post; the second call is camp-fighter-1's at 922; walk out during it (1096) | outpostZoneEndOn 0: fails 4 |
| step21-heart-lost-to-a-bandit, -heart-out-next-member, -heart-out-two-players, -heart-game-over | same inputs; the fall is at 1206 (the first wave's fighter), not 1009: every tick from 1009 on +197 | (the hearts builder's, unchanged) |
| step21-throw-is-no-escape | thrown out at 2202 (was 2089) | hall-detect thrown test removed: fails 1 |
| step21-camp-thrown-out | the grappler steps 3 tiles east at 600 and breaks the post at 671; falls 1091/1591/2002/2416, the fourth with camp-fighter-1 in reach; the first wave's fighter has walked off by the throw, so "the camp keeps its state" is camp-fighter-1 still inside | on false: fails 8; downs 1: fails 8 |

**Found and fixed (the orchestrator's go):** a party wiped out in the camp
after two rows hung a "narrow escape" legend (`hall-detect.ts` counted only
`thrown-out` as not leaving on your own feet). Now a `game-over` that tick
hangs none either (`wiped`, its `INTENT:`). step21-heart-game-over caught it
once two rows came before the fall; its second control (the `wiped` test
removed) hangs the legend at the game over.

**Not measured: "every hero gets out with the last row in".** A probe drove
each roster hero tick by tick (walk in, wait for the row, run for the door,
jumping bodies and the step): only the flyer got out, but the same probe with
the old single far-east entry also failed for the others (they are drawn into
fights while waiting), so it does not tell the layouts apart. What it did
show: the west entry `[6,7]` stands on the step beside the camp's only door,
so the brute (row 5) can come in between a hero and the way out. Being thrown
out after four falls still always ends with the hero outside. Owed: a fair
escape scenario per hero, and the owner's or the room owner's word on
keeping a way in at the door's side.

**The camp's east half** (columns 44-87, Step 20) has no entries: a hero there
gets every row from the west. `[58,10]` and `[70,10]` measured: turns
step23-thrown-out-leaves-it red; left for the weapons builder.

### Third builder (`session_017WiGzFCmKRjkeGNrUSbDvu`), 2026-11-24

**Push 1, rows from the sides** (the owner's "come in from the sides"): `entries`, `entryAway`, `announce` in `content/dispatch/` (the outposts' rule copied into `alert-dispatch.ts`; `outpost-wave.ts` is the waves slice's, so not shared, logged as a later tidy). Nothing shared with the camp builder changed; `alarm-banner.ts` (the chase/alarms builder's) gains three lines to read a dispatch file's `announce`.
- **Re-timed, claims kept:** `-whistle-brings-row` (where the east arrival is at 3000/3100; facts now count arrivals only), `-both-doors` (now "both sides": one at column 1, one at 26; control: only the entries east of the shop, fails 3 facts), `-cap-holds` (the hero steps east or west before each swing, or the west row shoves them out of the street and no call completes; the alert-3 window is 3340–6600; control: the cap off, 13 rows, 10 people, fails), the five `-away-at-the-most-*` (each hero's run west re-scripted and the leave tick re-pinned: brawler 3644 → 3720, flyer 3610 → 3684, grappler 3526, infiltrator 3479, skirmisher 3605 → 3483; ticks +1000 except the skirmisher, since arrivals by column 26 walk out by the far door; the skirmisher's "street at cap" is 7 in the street plus 1 who followed out).
- **Changed in the game, measured:** arrivals who followed a hero into another room now count against the cap (`cap-holds` reached 9 without it: one walked back in). A second arrival at the same entry stands a tile nearer the place reported.
- **The way out at the cap, probed** (`run west, jumping` for each hero, solo): all five get out by the west door past the west arrivals and are not hit after; the flyer needs 15 s of running (it is knocked into the throne room and must go on to the undercroft), the others 5–7.5 s. Running back into the cellar doorway was worse (the brawler was hit 11 more times).

**Push 2, the guard who locks a door: measured, not built.** In the sim (`step()` driven directly, the real street with placements), at alert 2 with the hero in the courtyard, the street guard planted just inside the courtyard door (x 728 and 734; raging with the hero his offender, or a responder in `chase` or `search`) 20 ticks before the hero walks back in holding west: **all five heroes get in** (the brawler takes one blow at the door and walks on; nobody is carried back out). Also not reproduced after an escape east at alert 3 and walking straight back (waits of 0.5–10 s). So the lock needs a hero who *stops* in the door mouth, as the `tiers` fact's `meet()` does: the guard's blow then throws them back through the walk door, which is the doors' design (D-077: doors carry any body, throws included). Not fixed on a hunch: the fix candidates (a walk door not carrying back a body it just delivered, in `room-doors.ts`; or people not swinging at someone in a door mouth, in `behaviours.ts`) are both outside this lane's paths and change designed behaviour. Flagged to the orchestrator.

**Outcome of push 1, 2026-11-24 ~06:35 UTC: live at 31d5ba4, `check:live` failed on `tiers`, reverted at 9e50cd8.** The line: phase 1 fine (2 taps, alert 1 at 13.7 s); then 12 tries and the gauge never drawn, yet the alert was drawn at 2 (the whistle completed while the fact was not watching: during `backIn`/`meet`); then **1 guard drawn in the street** over 2.5 s (local e2e, three runs on this code: 3). Every other live fact passed; live healthy. Not diagnosed. Measured: arrivals carried out of the street within 10 s of walking in, over all `step4-tier-*` scenarios, 4 of 46 with the doors and 5 of 46 with the side entries, so "the door-side entries push arrivals out" is not it. Leading guess, unmeasured: side arrivals reach the hero in a few seconds instead of half a minute, and over 12 tries of the phone fighting they are beaten and removed (`beaten-gone`), so the street is back to one guard when the fact counts. If so, the game is right and the fact needs a count taken when the row walks in (e.g. `drawn` guards at the `level-up` moment, or a `dispatch-arrived` count), not after the fight. How to settle it: the delayed-socket replay the second builder used (`step-4.md`, "Push 2, re-land"), reading the server's world after the row walks in. **The whole of 31d5ba4 is good to re-apply** (`git revert 9e50cd8`) once the fact holds: check green, e2e green on three bases.

**Push 3 (the armoured guard), built and not pushed:** `content/characters/armoured-guard.json` (verbs move, attack, body), `content/npcs/armoured-guard.json`, an `armoured-guard` tuning set (runSpeed 32, weight 80, toughness 180, a slower, harder swing), a stand-in sprite file on the guard's own sheet, and the middle of the top row. With push 1's code all `step4-*`/castle scenarios stay green except `-cap-holds`, where a third row walks in at 8389 (the alert falls and climbs back to 3): not yet looked at. Saved as `docs/plan/step-4-push3-armoured-guard.patch` (made on top of 31d5ba4: re-apply push 1 first, then `git apply`; it holds the validated barks and art note).

### Fourth builder (`session_017WiGzHqA8GMgCCLsfWzdzm`), 2026-11-24: task 1 measured, nothing pushed in code

**Method.** `docs/plan/step-4-replay-tiers.ts.txt` (rename to `.ts` to run; usage in its head): an in-process server serving `dist/public`, the phone's socket routed with 300 ms in, 60 out, 40 jitter (order kept), the server's world read every 15 ms (each guard's entering, leaving, being gone; call, alert and dispatch events, with the hero's room and x). "Rows" = `origin/main` 958df0e with `git revert 9e50cd8` in a scratch worktree (docs conflicts taken as main's).

**Measured.**
- **The old fact under delay: 10 of 10 passed** (5 on main, 5 with the rows), plus 1 earlier smoke run on main that failed (12 tries, gauge never seen, the hero ended in the cantina). Live's shape (the row counted at 1 guard) **did not reproduce**. In 9 of the 10 passes the gauge the fact saw was a *later* whistle: pips and guards were already up when it first drew the gauge.
- **The third builder's guess (rows beaten before the count) is not borne out locally:** in the clean first run of each, the row's first arrival was first beaten 15 s (main) and 23 s (rows) after walking in, far outside the fact's 2.5 s count.
- **The game's part, found: with delay, the page never draws the gauge of the guard's first whistle.** In all 6 delayed runs with the rows (and the main runs' logs agree) the street guard's first whistle runs ticks ~2338–2488 (call-started → call-completed, alert 1 → 2, row 1 walks in) with the hero in the street, and the page's recorded frames hold no gauge for it. **The same replay with no delay draws it (2 of 2: gauge at 1 pip, 2 pips 2.4 s later, row counted 1 → 3).** Later whistles (responders, alert 2→3) are drawn under delay. So on live a player does not see the first whistle they are meant to stop, which is live's "12 tries and the gauge never drawn". Not diagnosed. What differs: that whistler is the raging guard who rang the bell himself (no `c.respond`); the page draws bodies through `src/net/predict.ts` (a struck body is lent to the page's own prediction) and `smooth.ts`; neither is this lane's.
- **The new fact** (`docs/plan/step-4-tiers-fact-recorded.patch`, on `scripts/e2e/tiers.ts`): the page records what it draws from the first frame; each gauge drawn is judged from the record (a pip within 8 s, the row's own banner in the street, guards drawn in the 1.5 s from that banner more than just before the gauge). Same claims. **3 of 5 with the rows under delay**: the 2 failures are the missing first gauge (the first gauge the page drew came at 3 pips, where no pip can follow). Not pushed: it would turn `check:live` red on the game's part, and loosening it to pass a pip with no gauge drawn would hide exactly that.

**Next, as I read it:** the first whistle's gauge on a delayed page (client/net, not this lane's paths), with this harness as the failing control (delay 300/60: gauge missing; 0: drawn). Then the patch, then task 2. Tasks 2–4 not started.

**Correction (same builder, ~08:40 UTC): there is no missing gauge.** Logging the server's own `c.whistle.progress` for every body (the harness, delay 300/60/40, rows): the street guard's call at ticks ~2340–2489 is **the bell, not a whistle** (his progress never leaves 0; `call-completed` at x 366, by the bell at column 24). Under delay the raging guard, struck again, goes back to the bell and rings it a second time (the second builder saw this once, "Push 2, re-land"), and that completed call raises 1 → 2 and brings the row; the page draws the bell's bar (not in `drawn.alert`). Every whistle that did start in that run was drawn by the page within 9 ticks of starting on the server (help0:1 4596 → 4605, help1:0 4791 → 4800). Without delay the same call is a whistle. So the game calls correctly both ways (D-063: a completed call by bell or whistle); what the delay changes is which call. The recorded fact's 2 failures are runs where both rises (1 → 2, 2 → 3) were bells (the guard's, the shopkeeper's), so the first gauge came at 3 pips. The open question is the fact's, not the drawing's: whether `tiers` should count a completed call by the bell too (`drawn` has no record of the bell's bar yet), or steer phase 2 so the guard has the hero in sight when he is struck (a raging guard whistles only with his offender in sight, `alert-whistle.ts`).

**For whoever comes next (the orchestrator's line):** under delay a raging guard struck out of his sight returns to the bell instead of whistling, by design (`alert-whistle.ts`: he whistles only with his offender in sight), and that is what read as "gauge never drawn".

**Steering tried, (b), not pushed (~09:30 UTC):** `docs/plan/step-4-tiers-fact-steered.patch` (whole file against `main`; it contains the recorded fact): `meet()` also waits for the guard's drawn sight band (`drawn.sight.bands[].facing`) to face the hero, and a try whose meet fails is not tapped. Under 300/60/40: **4 of 5 on main, 2 of 5 with the rows** (both sets run at once, two browsers, which may have disturbed timing). Failures: 2 rows runs drew no gauge in 12 tries; 1 main and 1 rows run first drew a gauge at 3 pips (the 1→2 and 2→3 rises were bells again, so something other than the guard's own facing at the strike still decides). Not looked into: whether the guard stays raging-with-offender long enough to whistle, and what the shopkeeper's bell does to this. The harness (`step-4-replay-tiers.ts.txt`) now also logs the server's `c.whistle` on/off per body (`SRV whistle`), which is how bell and whistle are told apart. Tasks 2-4 not started; live unchanged.

### Fifth builder (`session_017WiGzFsP2hhQR5q7wSEpiB`), 2026-11-24: task 1, the fact counts a call by bell or whistle

**Built.** `drawn.alert.bell` (additive, `src/client/draw/alert.ts`: a ringing bell's bar in the room, 0..1, or null, beside `whistle`), and the fourth builder's recorded fact (`step-4-tiers-fact-recorded.patch`, applied) taking the fuller of the two as "a call filling", noting which. Same claims otherwise: a pip within 8 s of the call first drawn, the row's banner, more guards drawn in the 1.5 s from it than just before the call, the pips carried into the throne room.

**Measured** (the replay harness `step-4-replay-tiers.ts.txt`, 300/60/40 delay, runs one at a time; "rows" = `main` + `git revert 9e50cd8`):
- New fact: **5 of 5 on `main`, 5 of 5 with the rows.** All 10 were answered by the first call after the alert reached 1, and that call was **the bell** (1 → 2 pips, the bar first drawn at 39–44 s, guards drawn 1 → 3), with 1 tap after phase 1.
- Old fact (control): 3 of 3 on `main`; **1 of 3 with the rows** (one run 8 more taps, then the whistle of the 2 → 3 rise, and the walk out failed; one 320 s run failed).
- The new fact with the bell ignored (control, `bell = 0` in the record): 3 of 3 with the rows still passed, but only by tapping on 2–3 more times until a whistle came (once the 2 → 3 rise). So that is not a red control; what it shows is that the bell's record is what the new fact's 10 passes counted. A red control for the drawn record itself was not found (with the bell dropped, the fact falls back to the fourth builder's 3 of 5).
- Not run: `main` with the bell ignored (stopped for time).

## Camp entries (`handoff-prompts/camp-entries.md`)

Builder `session_017WiGzGkuNQcsBDa2oWh23s`, 2026-11-24.

- **Push 1 (0949f2c): every hero can walk back out.** Found while measuring the door: the brawler's jump peaks at 47.5 px and the entry step's east face is 48, so with nobody in the camp it got in (the one-way tile at (4,9)) but never out, and since ef08490 the camp no longer throws a hero out. On the orchestrator's go, a one-way tile at (8,9) mirrors it (`INTENT:`, `docs/deliberate-designs.md`); `camp-entries-every-hero-walks-out`. The 44 camp scenarios were green with it, and none was re-timed.
- **Push 2: the door kept clear** (`doorClear`, `docs/mechanisms/outposts.md`, "From the sides"; decisions-log "The camp's door is kept clear"). Measured with a sim probe: a hero placed at column 8, 12, 16 or 20 when each of the five rows walks in, then running blind for the door (west, jumping on a beat, Use at the doorway), 15 s. With the old rule 94 of 100 got out; the 6 that did not all started at columns 8-16 with a heavy or the brute walking in at column 6.5, on the step. With `doorClear` 2, 98 of 100 got out, in the quiet camp and the real one. The 2 left start at 16 and 20 (outside the 12 tiles, so both sides by design) and meet a heavy at the step. **Weakest:** a hero 13-16 tiles in who turns and runs still meets the west half at the step. The probe's hero never fights back, so this is a floor, not a player. Moving the entry would not help: any west entry stands between a hero east of it and the door.
- **Re-timed:** `step7-last-stand-camp` (gate E). The flyer stands at column 13.6, inside the door zone, so its rows all come from the east and it felled only 4 (a last stand needs 5). Now it strikes east only and walks out 3 s later (2700). The legend at 2930 reads waves 4, came 8, felled 5, 44 s. The fourth row is the wagon's, so this is the first real-camp scenario that reaches the fourth call (Step 20's note said none did). Control: walk out at 400, and nothing is hung.
- **Landed:** push 1 at 0949f2c, push 2 at 4f56b7a (check:live ok after each).
- **Push 3 (the east half) not built: this builder stopped at its context budget.** Measured (sim, a flyer standing still at column 50, 60 or 70 in the quiet camp, rows 0-2): from today's entries no row ever hits it east of column 47. The fence (47), the stalls (55-56, 64-65) and the barricade (75) cut the east half into pockets the camp's people cannot climb. With extra entries [58,10],[70,10] or [48,10],[72,10], both sides arrive at the screen's edges and stand behind a stall; a hit lands only when the hero is in the arrival's own pocket.
- **The orchestrator's ruling (09:2x UTC), for the next builder:** keep entries off screen (never a row popping in 3 tiles away), and a wave's bandit blocked by a breakable piece between him and the hero he is coming for breaks it, a short wind-up then the piece's own broken stage. It's an optional flag on the outpost (additive, off for the depot and the test rooms), through the breakables' existing path. A piece he cannot break stops him and stays cover. `breakPartAt()` in `src/sim/room-parts.ts` already takes any breaker, so `room-breakable.ts` needs no change.
- **Drafted, not run:** `docs/plan/step-4-break-through.ts.txt` (rename to `src/sim/systems/outpost-break-through.ts`). Order 60. Field `breakThrough: { time, upTo }` on the outpost: a new optional field in `src/content/kinds/outposts.ts`, read and validated like `doorClear`, and `breaking?: number` on `c.outpostWave` in `src/sim/outpost/state.ts`. Suggested camp values: time 0.5 s, upTo 200 (the fence 200 and the stalls 150 break; the barricade 300 holds: the wagon's job). Watch `outpost-fight`'s `stuck` (a chaser stalled 45 ticks gives up): the wind-up must be shorter.
- **Entries, measured on paper** (the "nearest at least entryAway, else the farthest" rule): adding `[50,10],[62,10],[74,10],[84,7]` keeps both sides 12 or more tiles off for a hero at columns 44-71. A hero inside the cache (74-83, behind the barricade) would get the step's [84,7] at 2-10 tiles, in view. Either drop [84,7] (then a hero at 65-71 gets [74,10] at 3-9 tiles) or add an optional rule: a side with no entry at least `entryAway` off sends nobody (its half comes from the other side). That rule would also change the west for a hero at columns 15-18, so count reds. `step23-thrown-out-leaves-it` went red the last time east entries were tried (before ef08490 re-pointed it).
- **Still owed from the brief:** item 3, the phone screenshot of a row walking in at both screen edges with its banner, and the e2e fact.
