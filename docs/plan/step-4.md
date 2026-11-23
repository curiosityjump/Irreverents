# Step 4 — People who react

**Reference.** Plan step; its status line is in docs/plan.md.

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
