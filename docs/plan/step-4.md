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

*(Lead `session_017WiGzG4WzuJfHAu3XWoUhc`, 2026-11-23 04:45 UTC, at `b3a419e`.)*

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
- **Seams** (messages sent to both leads 04:35 UTC): Step 2 emits `hit`,
  `grabbed`, `thrown`; this step maps event types to deeds in data.
  Step 2 took `content/placements/` for crates and dummies, so **people
  are placed in `content/people/<room id>.json`** and spawned by a
  system of this step. Pursuers walk and never jump, so any ledge is a
  refuge without a special object. Following through a door waits for
  Step 3's door.

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

- `handoff-prompts/step-4-slice-1-moods.md` (written 04:45 UTC).

## Open with the owner

- Q-005 (stale rules in the library; the newer rule is being built). Not
  blocking: it does not hold this step open.

## Handoff notes
