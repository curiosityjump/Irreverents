# Irreverents — the plan

**Standing.** Run per `docs/sop.md`.

Aligning the codebase, documentation, policies and procedures with where
this project is going. Living document; not a review, not dated.

**Built from `docs/vision.md`.** Vision → Plan → Briefs: this file is the
concrete sequence of steps that moves the project toward what that
document says, not a parallel or competing account of direction. If the
two ever disagree, `docs/vision.md` wins; that is a finding for the lead
to flag, not something to quietly build around.

**Read first:** `docs/sop.md`, the procedure that governs every session.
This file says *what* to build; the SOP says *how* to work. It routes you
here at its phase 2.

**Empty?** The orchestrator writes the first version on its first run,
from `docs/vision.md` (`docs/orchestrator-role.md`, "Your first run"):
fill "The destination, and the measure", then "Where we are", then open
the first steps.

---

## The destination, and the measure

**Owner, 2026-11-22 (Drive, doc 00), via `docs/vision.md`:**
> A richly interconnected 2D side-scrolling, Amazing Mirror-inspired action-adventure about a shared party of radically curious, gleefully irreverent heroes whose favorite activity is disrupting a world that takes its stories and prophecies very seriously.

**Owner, 2026-11-23, first-hand, on how to read progress now** (`docs/vision.md`, "The measure"):
> Focus on getting things playable asap. I want as much of the vision in playable form as possible by the time i wake up tomorrow. I want to be playing the game having fun with it with my brother in law tomorrow morning.

So progress is read off the live game, in this order: is it up, can two
people play it together, and how much of the vision is in it. Each row is
re-measured by the command in `docs/measures.md`, never quoted from here.

| | Thing being measured | Today (2026-11-23 09:55 UTC, re-run by orchestrator session_017WiGzJeh7Tuov59d8XYmru) | Where it should get to |
|---|---|---|---|
| M1 | **Live:** the address serves what is on `main` | the game at 84c1b92 (re-read 10:38 UTC by session_017WiGzHX8g2sXimNRnqp2oZ); `main` ahead by documents only; nobody playing; error log empty | the game, at the tip of `main`, after every push |
| M2 | **Together:** two players on separate devices share one world at the live address | yes by script (`npm run check:live`: two pages, one phone-sized by touch, reconnect); no real iPhone tried | yes, proven by script (Step 1) |
| M3 | **Vision playable:** of the design library's six build gates A–F (doc 24), how many have a scripted player-view check passing | 6 of 6 (A-F; `npm run gates` at 347ff1d, 2026-11-25); none of it played on a real iPhone except by the owner | F and A by the owner's morning, then B, C, D, E |

**What the measure cannot say.** Whether a gate *feels* right ("joyful",
"OHH!") is the owner's to judge by playing. A passing script means the
thing exists and behaves as written, never that it is fun; no session
grades that (`docs/orchestrator-role.md`, on taste). The golden scenarios
(doc 12, G-01–G-16) are the owner's yardstick for the whole game later,
not a count to chase tonight.

## Where we are

| | Status (2026-11-23, first orchestrator's first run) |
|---|---|
| **Vision** | Written (`docs/vision.md`); the owner's full design is mirrored at `docs/design-library/` (38 documents: `git ls-files docs/design-library | grep -c '\.md$'`). |
| **Procedure** | `docs/sop.md` + `docs/briefs.md`; every doc declares its kind. First plan; no step closed yet. |
| **Deploy** | Railway serves `main` at https://irreverents-production.up.railway.app automatically; measured 37 s from push to live for the probe (Step 1, "Measure"). **A push to `main` is the deploy.** |
| **Codebase** | Re-measured 04:35 UTC at Step 1's first gate: one Node + TypeScript package; a shared simulation core with one graybox room and three scenarios passing (`npm run check`); the page draws the room and moves a character by keyboard; no touch, no second player on screen yet (Step 1's second gate). Layout: `docs/architecture.md`. No CI, no hooks. |
| **Storage** | A Railway volume the owner attached (04:24 UTC): `/healthz` reports it mounted and writable. Nothing is written to it yet (Step 7). |
| **Mechanisms indexed** | Count the lines under the `## Index` heading: `awk '/^## Index/{f=1} f&&/^- /' docs/mechanisms/README.md \| wc -l`. |

---

# How a lead finds its element

An orchestrator should be able to start a lead with nothing but "You are
the lead. Read CLAUDE.md first." (no step name, no brief), even several in quick succession, and
have each one land on a real, distinct, unclaimed piece of work. This
section is what makes that true; without it, "prime with a role name"
quietly becomes "prime with a role name plus whatever the orchestrator
has to restate by hand".

**The orchestrator may run a step directly with builders, no lead** (two
layers, the default since 2026-11-23, on the owner's "Implement the
structural changes you recommended for efficiency";
`docs/roles/orchestrator-card.md`). It claims the step with the
orchestrator form below and briefs builders itself; a lead is opened only
for a large step that needs sustained design judgement across many
slices. `DRAFT:`

**Every open step below carries one bolded status line, immediately
after its heading, read literally by a scanning lead:**

- `**Status: open, unclaimed.**` — real, decided, actionable work with no
  lead on it. The next lead started with no named element claims the
  *first* step (lowest number) carrying this exact line.
- `**Status: open, claimed by <session id>, <date>.**` — a lead is active
  on it. Skip it; don't start a second lead for the same step.
- `**Status: open, claimed by orchestrator <session id> (builders: <ids>), <date>.**`
  — the orchestrator runs it directly with the builders named. Skip it
  like any claim; the orchestrator updates the builder ids as they change.
- `**Status: open, unclaimed — blocked on the owner.**` — real work, but
  the next move is the owner's answer, not measurement or building (the
  step's own text names the question, and it has a `Q-NNN` in
  `docs/questions-for-the-owner.md`). A bare-primed lead skips it. When
  the owner answers, the orchestrator flips it to `open, unclaimed` or
  names it in a lead's prime.
- `**Status: open, unclaimed — queued behind Step N.**` — decided and
  actionable, but the owner has put Step N first. A bare-primed lead skips
  it; once Step N closes, the orchestrator flips it to `open, unclaimed`.
- `**Closed <date>** ...` followed by a short summary — not open work. The
  full text is in `docs/plan-archive.md` ("Keeping this plan honest",
  below).

A status line may carry a parenthetical after it (who released it, what
it waits on). Keep the bolded part exact: leads match it literally.
**A status line stays one line** (from 2026-11-23): the bolded part and at
most a short parenthetical. History (who released or reopened it, when,
why) belongs in the step file or git log, not here. `DRAFT:`

**Each step's text lives in its own file** (`docs/plan/README.md` has the
convention):
- **What stays here:** the `## Step N — title` heading, the status line,
  and one line: `Full text: docs/plan/step-N.md` (backticked).
- **What goes in the file:** everything else. Why, what's decided,
  measures, briefs, owner answers and handoff notes.
- If your project has a docs checker (a script that fails when a step's
  text is split between here and its file), run it; if not, the lead
  checks by eye when claiming.

**Claiming protocol, for a lead that just picked an unclaimed step (or
was handed one by name):**
1. Edit that step's status line to `**Status: open, claimed by <your own
   session id>, <today's date>.**`. Nothing else in the step changes. If
   you cannot learn your session id (no session tools), write
   `**Status: open, claimed by lead started <UTC timestamp>.**` instead,
   to the minute, so the claim still names one session.
2. Commit and push *immediately*, before any Measure or Brief work. This
   is the whole mechanism, not a formality.
3. **If the push is rejected** (a race: another lead claimed first), your
   claim commit is dead. Don't rebase it: both claims edit the same line,
   so the rebase stops on a conflict that is easy to resolve the wrong
   way. Run `git fetch origin main && git reset --hard origin/main` (your
   only local commit is the claim), re-read the status lines, and restart
   from 1 on the first step that still reads `Status: open, unclaimed.`
   Never overwrite another session's claim line.
4. If no step carries `Status: open, unclaimed.`, don't invent work or
   guess at a future step. Write to `docs/for-the-orchestrator.md` that
   the plan has no open, actionable element right now (a real, reportable
   state, not a failure), then report and stop, as
   `docs/lead-session.md` says in its "A backstop has a target and an
   end" bullet ("Report and stop; if real work needs you again, the
   orchestrator or the owner will message you").

**A local-only repository with no remote** runs one lead at a time:
there is no race to lose, so steps 2-3's push and rejected-push check
are skipped (commit locally instead). See `docs/git-workflow.md`,
"Local-only repository".

**Releasing a claim:** when a lead's work on a step pauses for good
(handed back, blocked on a real owner question with nothing left to
measure meanwhile, or the session retiring with no successor on the same
step), revert the status line to `**Status: open, unclaimed.**` (or
`— blocked on the owner.`) so the next lead can pick it up clean, rather
than leaving a stale claim pointing at a session that no longer exists.
Finishing a step in full follows the archival rule below instead.

**An orchestrator naming a specific step in the prime still works**
(`docs/orchestrator-role.md`, "Priming a lead"). Whichever way a lead
arrives at its step, the claim-commit-push in step 1 still happens, so a
named assignment and a concurrent bare spawn can never collide.

---

# What is already right

*(Empty at genesis.)* The subsystems, patterns and conventions in this
project that already solve their problem well, one line each, with a
pointer to the file or mechanism writeup. `docs/sop.md` phase 5 sends
every building session here first: before writing something new, check
whether a younger subsystem already solved it. In the project this system
was derived from, a review found that one had, four times out of four.
Add a line whenever a review names something as the model to copy;
remove it when it stops being true.

- **A state that stops a body acting is tested in one place**: `canAct`
  in `src/sim/body-state.ts`, applied by `src/sim/systems/verbs.ts`, so a
  new verb cannot forget it (`docs/mechanisms/combat-and-impact.md`).
- **A control for a scenario is one number in `content/tuning.json`**:
  switches such as `bodyImpactOn` make "watch it fail" a one-line edit.
- **The network layer copies the whole world, so new state needs no
  network code**: add a field or an entity kind and it arrives; move a
  player from outside with `emitEffect` (`docs/mechanisms/network.md`).
- **A check that reads what the page drew**: `scripts/e2e.ts` asserts on
  the renderer's own debug record, with relative facts, locally and
  against the live address; copy it for a new two-player fact.
- **Self-registering files instead of shared lists**: a verb, system,
  content kind or scenario fact is one new file, picked up by
  `scripts/lib/registries.ts` (`docs/architecture.md`).
- **Shared shapes extended from your own file**: `Content`, `Components`
  and `EventMap` grow by declaration merging; copy `src/sim/verbs/jump.ts`.
- **Numbers declared by their reader**: a verb or system lists the tuning
  numbers it reads, with ranges; the validator does the rest
  (`docs/mechanisms/content-validation.md`).
- **Scenarios as data, traced then pinned**: `node scripts/trace.ts`, then
  facts, then a watched failing control (`docs/mechanisms/scenarios.md`).
- **Validator messages that name the file and field**: copy
  `src/content/reader.ts`'s wording when adding a check.

---

# Keeping this plan honest

**Every edit makes this file smaller or sharper, never merely longer**
(`docs/working-on-the-project.md` has the evidence). Two failure modes,
both of which happened in the project this system was derived from:

- **Growth as a substitute for progress.** A plan once reached tens of
  thousands of words by accumulating honest findings, at which point
  nobody could hold it, including the session writing it. A finding that
  doesn't change what someone builds belongs in an evidence file or a
  commit message.
- **Altitude drift.** If the owner would fix it themselves in ten minutes,
  it is not a matter for this plan. The structural version of an
  observation is a different, much smaller thing: not *"this list is
  unbalanced"* but *"the rule for adding to this list is written down
  nowhere."*

**A step is archived, not merely closed, the same round its closing line
is written.** Move the step's full text (its `docs/plan/step-N.md`)
verbatim into `docs/plan-archive.md` under a matching `## Step N`
heading, delete the step file, and replace the pointer here with a short
closing summary: what shipped, in plain terms, plus one pointer to the
archive section and one to whichever reference or mechanism doc is the
step's durable technical record. **A step with an owner question that still blocks it is not
closed, no matter how much of it shipped.** A question marked `Blocking:
no` in `docs/questions-for-the-owner.md`, or a choice decided and logged
in `docs/decisions-log.md` under the owner's rule of 2026-11-23 (never
stall on the owner), does not hold a step open: the closing summary names
each `Q-NNN` and each logged decision, so the answer still has somewhere
to land. Trust the step's own content, not another step's summary of it,
before archiving anything. Closing a step also checks that no Open entry
naming the step is marked blocking.

**Exception: a step blocked on the owner may be archived while still
open** once its history outgrows what a lead can read. Move its full text
verbatim as above, and leave here its status line, a short summary, its
latest handoff note and **every unresolved owner question from anywhere
in the step**, each with its archive line. Build that list by tracing each
question to its answer, not from the latest handoff: handoffs drop
questions.

---

# Steps

**Since the owner's verdict after playing (2026-11-23 ~18:30 UTC) the order of work is `docs/plan/core-loops.md`'s ranking**, not the step numbers: Steps 14 (slice B), 19, 9, 13 and 7 are briefed; 20, 21, a Step 3 slice and Step 4's town tiers wait.

## Step 1 — A live room two people can play in together

**Closed 2026-11-23, 08:55 UTC.** The game is live and two people can
play it together on phones: everyone who opens the address is in one
shared world, each with a party character, touch controls for every
action sideways or upright, and a page that rejoins by itself after a
drop, a reload or a deploy. The project has its skeleton, one shared
simulation, content and scripted checks as data, and a deploy that
documents-only pushes no longer restart. Proven by script against the
live address (`npm run check:live`); **not tried on a real iPhone**, and
no hit, grab, throw or "Use" has been run between two devices. What it
left for Step 5 is in `docs/plan/step-5.md`, "Owed by Step 1". One
question for the owner came out of it and lives with the deploy
mechanism, not here (Railway's "Watch Paths" setting,
`docs/questions-inbox.md`). Full text: `docs/plan-archive.md`, "Step 1".
Durable record: `docs/architecture.md`, `docs/mechanisms/network.md`,
`docs/mechanisms/deploy.md`.

## Step 2 — Moving, hitting, grabbing and throwing

**Closed 2026-11-23, 17:30 UTC.** Three heroes play differently (the
grappler lifts what no one else can, the infiltrator fits a one-tile gap,
the flyer flaps to ledges), anyone can hit, grab, carry and throw anything
including a friend, and impact is physical: knockback, walls and bodies
that bounce and break, a hit freeze scaled to the impact, never a number on
screen (proven by `t-no-numbers` from the page's own record, 7500b81). The
feel round (per-hero arcs, wind-up, floor bounce) and the `?tune` panel are
live, the panel listing the most-felt numbers first (5f9e7a3). Gate A's
signals 1–6 pass by script, headless and by touch on two phone pages.
**Not tried on a real iPhone**; how it feels is the owner's ("as good as
kirby and the amazing mirror"), and a play report reopens it. Left
elsewhere: the switch gap and the thrower's predicted swing (Step 5),
the throw's drawing (Step 8 round 3, actors), the occasional
`t-throw-friend` flake (watched there). Full text: `docs/plan-archive.md`,
"Step 2". Durable record: `docs/mechanisms/combat-and-impact.md`,
`docs/mechanisms/party-and-switching.md`, `docs/mechanisms/tuning-panel.md`.

## Step 3 — A small kingdom to explore

**Status: open, unclaimed.** (The puzzles slice is live and reviewed, 2026-11-24 00:35 UTC at f7bb02f: a stone plate under the castle that needs weight, a grate over a hidden pocket and `town-7`, the plate drawn sinking, the two-page proof; brief deleted, builders archived. Left: the plate's and grate's looks (second props builder); item (a) of the step file's handoff note where still owed; the camp's way out depends on less than a 10% jump margin.)

Full text: `docs/plan/step-3.md`

## Step 4 — People who react

**Status: open, claimed by orchestrator session_017WiGzGgiMLCwNj9zptZqBz (builders: session_017WiGzHTLU6WYfsfoEFK4si), 2026-11-23.** (Reopened 2026-11-23 19:40 UTC by the core-loops re-plan: its next slice is the town's tiers, brief `handoff-prompts/loop-town-tiers.md`, `docs/plan/core-loops.md` section 5. A fresh lead starts from the step file's handoff notes.)

Full text: `docs/plan/step-4.md`

## Step 5 — Comfortable on an iPhone, easy to play together

**Status: open, claimed by session_017WiGzJfkNbzJfpRVPhWoeK, 2026-11-23.** (Opened 2026-11-23 09:00 UTC, Step 1 closed. Before the owner's morning only its "Owed by Step 1" essentials, one worker, small green pushes, done or cleanly stopped by about 10:15 UTC; the rest of Step 5 waits until the owner has played. Step 1's lead released it for a fresh lead; its handoff note ends the step file.)

Full text: `docs/plan/step-5.md`

## Step 6 — The king who never stops talking

**Status: open, unclaimed — queued behind Step 5.** (Released 2026-11-23 10:40 UTC by orchestrator session_017WiGzHX8g2sXimNRnqp2oZ: its first lead session_017WiGzH9B4usC2uz4woP8Sa is idle with a large context and is not to be reused; a fresh lead starts from the step file's handoff notes. Held, like Steps 3 and 8, for the usage allowance (resets about 13:00 UTC) and the owner's first play. Earlier: Opened 2026-11-23 04:54 UTC: the throne room is on `main` (9a4f6a8). First half first; its second half needs Step 4's rules.)

Full text: `docs/plan/step-6.md`

## Step 7 — A Hall that remembers, and a machine to steal

**Status: open, unclaimed.** (Slice B is live and reviewed, 2026-11-24 00:15 UTC at 1d0cfee: the camp's waves really come, the game notices a last stand and a clean heist and hangs a pedestal with a framed picture; gate E rests on `step7-last-stand-camp` and `step7-hall`; brief deleted, builders archived. Left: the Hall's lasting store for the shared world (pedestals do not survive a restart); the depot's waves fall into the pocket at columns 51-52; the `step19-*` checks' gate E tag. The machine is Step 20.)

Full text: `docs/plan/step-7.md`

## Step 8 — What you see and hear

**Status: open, claimed by orchestrator session_017WiGzGgiMLCwNj9zptZqBz (builders: heroes session_017WiGzEv3ESfjNHm7u3Tk8v, cast session_017WiGzFHN8SWsy5GnNkweMt, ground session_017WiGzHwFkUGGSmDqqnoSDY, props session_017WiGzJxBqVvizcghgHk5NG, actors session_017WiGzFsVDWWZc7nVHbv82A), 2026-11-23.** (Round 3's five lanes sent 17:06 UTC. Put first by the owner at 11:11 UTC; re-claimed 15:50 UTC at pickup.)

Full text: `docs/plan/step-8.md`

## Step 9 — Powers you pick up, and can lose

**Status: open, unclaimed.** (The first playable is live and reviewed, 2026-11-24 01:45 UTC at 082380b: a power is data; the street's villain carries the boost, knocked flat it pops out and a touch takes it; a hard hit knocks it loose; wings on a pedestal in the depot; found sources marked on the menu; brief deleted, builder archived. Left: the wings' pedestal moves to the depot's hidden area (Step 22's next depot push); a phone fact that takes wings by touch.)

Full text: `docs/plan/step-9.md`

## Step 10 — The first ten minutes, played end to end

**Status: open, unclaimed — queued behind Step 4.** (Step 1 closed 08:55 UTC; held by the orchestrator for the usage allowance until Step 2's touch check and Step 4's street people report.)

Full text: `docs/plan/step-10.md`

## Step 11 — The cantina: an endless brawl and the place you change your party

**Closed 2026-11-23, 18:05 UTC.** Off the castle street (column 20) is a cantina where every roster hero nobody is playing wanders, including two new roster-only ones; hit one and everyone in the room brawls, friends included; launched off the stage or knocked flat, anyone is back on a pad at once; a counter keeps each player's knock-outs and falls; the owner's bell (Use near it) or the last player leaving ends it, and it raises no alarm. Tap a wandering hero outside the party, then the member to replace in the row across the screen (never a friend's). Chased by a town guard, the street's doorway in refuses you; the cantina's way out never refuses. Proven by scenarios, a real-server check and the phone e2e (all re-run by the lead); **not tried on a real iPhone**; the no-fit self-swap is untested; the switch landing on a friend's member is Step 5's switch-gap brief; the cantina's own art is Step 8 round 3's. Lead: `session_017WiGzFy3MD6ecvM7QMvQGd`.

Full text: `docs/plan-archive.md`, "Step 11". Durable record: `docs/mechanisms/cantina.md`.

## Step 12 — The outpost and the chase

**Closed 2026-11-23, 18:05 UTC.** A bandit camp behind a doorway in the courtyard: a lookout who sees you runs to a horn, and every finished call brings a wave of fighters (never more than 8 people in the room); you can sneak past on a high ledge, stop the lookout mid-call, break the horn or walk out. Its fighters fight heroes in any room. Guards who saw you go in follow you into the camp, two at most, and guards and the camp's people fight each other on sight. Guards' own swing (and re-timing four scenarios) is Step 18's; the camp's sprites are Step 8's. No owner question open; decisions in `docs/decisions-log.md`. Full text: `docs/plan-archive.md`, "Step 12". Durable record: `docs/mechanisms/outposts.md`, `docs/architecture.md` ("How to add an outpost").

## Step 13 — Heroes you find and keep

**Status: open, claimed by orchestrator session_017WiGzGgiMLCwNj9zptZqBz (builders: session_017WiGzGffLu42yKrbPuQphJ), 2026-11-25.** (Was queued behind Step 7; claimed for `handoff-prompts/recruit-shown-right.md`.) (The first playable is live and reviewed, 2026-11-23 22:08 UTC at a01c44c: the skirmisher caged in the Bandit Camp, freed by holding Use, kept on the roster; brief deleted, builder archived. One signal is not built, `step13-free-while-caught`: freeing mid-alarm needs the waves slice's fighting first; then close.)

Full text: `docs/plan/step-13.md`

## Step 14 — Things to find, and knowing there is more

**Status: open, unclaimed.** (Slices A, level entrances, and B, hidden places, are live and reviewed, 2026-11-23 22:25 UTC at 343c4e3; briefs deleted, builders archived. The puzzles slice of Step 3 appends one piece, `town-7`. Later slices are in the step file; none is briefed.)

Full text: `docs/plan/step-14.md`

## Step 15 — A second place, worth coming back to

**Closed 2026-11-24, 16:40 UTC.** The kingdom has a second place: the Bramble Forest (`DRAFT:` name and place, the owner named none), walked to through a doorway on the courtyard floor, left of the quarry's, along a road and onto a forest trail, played as a second stage like the Iron Quarry (hearts, game over at its entrance, STAGE CLEARED with stars). It has its own look from the owner's art: loam and mossy ground from P10, the waterfall-forest panorama, mushroom-cap boughs, dark earth behind its pockets. Three secrets each take a different hero (a one-tile crawl into the root tunnel for the infiltrator, the canopy for the flyer, a held hatch for the grappler with the heavy crate, or a friend); a mossy boulder no hero can lift waits for the Brawn power, which lasts the walk; the deepest pocket opens a short way back. Fighters, a heavy, a brute, a thrower on the root mound and a lookout whose horn brings waves from both sides; a spear by the way in; and a quiet way over the guards under the canopy's long limb that only the infiltrator fits, cleared unseen in 32 s. 32 `step15-*` scenarios and a phone e2e case (`scripts/e2e/forest.ts`), every push re-run by the lead with a control watched failing; no `src/` edit. **Not tried on a real iPhone.** Left for others (`docs/for-the-orchestrator.md`): the guard vehicles as machines (vision-gaps row 15), the camera hiding a hero on the canopy under the party plate when upright, the start menu's two stage rows unshot, the limb reading as an earth shelf. Taste for the owner: whether the trail is fun to run, whether the boulder pulls you back, the forest as the choice. Lead: `session_017WiGzHD8gtSGTegd3n8W4G`.

Full text: `docs/plan-archive.md`, "Step 15". Durable record: `docs/mechanisms/stages.md`, `docs/architecture.md` ("region").

## Step 16 — A first real level: many screens, enemies all through it, and a guarded place to get into unseen

**Closed 2026-11-23, 21:15 UTC.** The kingdom has its first real level.
A doorway in the courtyard leads to a quarry of six rooms (road, ridge,
tower, depot, pit, cave) and 12.4 screens of main way that every hero
crosses alone and comes back by another way, with a secret per hero
(size, flaps, weight), a "not yet" out of everyone's reach, and a missed
jump that drops you to the pit, never a reload. Bad guys stand in every
room but the cave, and they are not alike: light fighters that fly, a
heavy one a punch barely moves, a brute only the grappler lifts, and a
toll on the road that upsets them if you politely pay it. In the middle
is the bad guys' depot: a lookout and a horn, patrols, a heavy at the
strongroom, a hoard. You arrive unseen with the danger in view, can take
the hoard and leave with no call started (the flyer over the roof, the
grappler over a ledge and a shelf), and if you are seen the horn brings
waves and you fight or run (the tower door, or a hole to the cellar, the
pit and the cave). A phone crosses road, ridge and tower into the depot
by touch. Not done, by the step's drop list: the ranged kind, the hidden
way home under the castle. Left for other steps (in
`docs/for-the-orchestrator.md`): a slam rule so a throw topples a heavy
(today eight punches do), a glint or window so the hoard shows from the
yard, a sight mark before a call, a camera that looks up in tall rooms,
a jump cue at the tower. No owner question is open; its decisions are in
`docs/decisions-log.md`. Full text: `docs/plan-archive.md`, "Step 16".
Mechanisms: `docs/mechanisms/rooms-and-doors.md` (the map) and
`docs/mechanisms/outposts.md` (the depot).

## Step 17 — A start screen, and saved games a friend can join

**Status: open, claimed by orchestrator session_017WiGzGgiMLCwNj9zptZqBz (builders: session_017WiGzGw7XaQ6tZNddFaa8s), 2026-11-23.** (Opened 2026-11-23 16:00 UTC from the owner's words of ~15:10 UTC, outbox entry at 4294051.)

Full text: `docs/plan/step-17.md`

## Step 18 — Enemies and provoked good guys fight

**Status: open, claimed by orchestrator session_017WiGzGgiMLCwNj9zptZqBz (builders: session_017WiGzHwmFZe9AdG3KMHsa4), 2026-11-23.** (Opened 17:35 UTC from the owner's words of ~16:05 and ~16:20 UTC; designed by a workflow from the library and the code, with two adversarial checks.)

Full text: `docs/plan/step-18.md`

## Step 19 — Stealth you can read, and a prize you carry out

**Status: open, unclaimed.** (The first playable is live and reviewed, 2026-11-23 21:50 UTC at f1cdff0: the Use button's words, sight bands, the camp's strongbox and the depot's hoard as cargo, "Nobody noticed", restock; brief deleted, builder archived. Left: `step19-camp-loud-no-horn` not built; Step 16's depot scenarios carry no clean-getaway expectation; its checks are tagged gate E, which the waves builder is to move to a Hall capture. A small closing brief, then close.)

Full text: `docs/plan/step-19.md`

## Step 20 — A machine to steal, and things to crash it through

**Status: open, claimed by orchestrator session_017WiGzGgiMLCwNj9zptZqBz (builders: B session_017WiGzGehKBFBBGaoRu2awP), 2026-11-23.** (Briefs `handoff-prompts/loop-vehicles-a.md`, the machine in a test room, done and reviewed at 082380b (three pushes, brief deleted, builders archived); `loop-vehicles-b.md`, the camp run, released and started 23:19 UTC.)

Full text: `docs/plan/step-20.md`

## Step 21 — What being beaten costs

**Closed 2026-11-25.** Every hero has hearts, drawn in a row under each face on the party plate (3 each, the grappler and the brawler 5): a bad guy or a provoked guard putting you on the floor costs one, with a pop and a sound; a friend, a fall, a wall or the cantina's brawl costs nothing. A hero with none is out, greyed on the plate, and you carry on as the next member who has hearts; with two players the party is shared. When the whole party is out it is GAME OVER: a short card one tap skips, then everyone is in the cantina (a stage's own entrance in a stage) with every heart back, a carried prize back on its stand and a held weapon back where it was found; walking into the cantina refills hearts too. The old thrown-out-of-the-doorway rule is off everywhere by data, its fields kept. `step21-heart-*` scenarios, four real-server checks and the phone e2e by touch (`hearts-drawn`, `hearts-one-lost`, `hearts-game-over`; its intermittent red was traced to two causes, both fixed, 414564f and 3314c47). **Not tried on a real iPhone.** Open, not blocking: Q-014 (where a game over in a stage sends you; built: the entrance). Logged: the heart counts and the rules in decisions-log "Step 21". Full text: `docs/plan-archive.md`, "Step 21"; record: `docs/mechanisms/defeat.md`.

## Step 22 — One stage to clear: an outpost you get through without dying, and a victory screen

**Closed 2026-11-24, ~15:55 UTC.** The Iron Quarry is a stage. You lose by the whole party running out of hearts; a game over puts you back at the entrance with every heart back, and the stage starts over: bad guys at their posts, alarms down, the clock at zero. Lookouts with horns on the road and the ridge call waves that walk in from the sides, each stronger, and every lookout has a way over him. All five heroes can get through alone, fighting or sneaking, and the infiltrator can clear it with nobody seeing (a 1.4 s window over the road's heavy). Reaching the depot's far end brings up STAGE CLEARED: stars lit one by one, then time, enemies defeated, alarms, game overs and the hoard, with Continue under the thumb. The best is kept on the sign and the menu. Open, not blocking: Q-014 (where a game over in the stage sends you; built: the entrance). Logged: the star times are from a script (best 45 s, good 56 s), the toll-keeper counts for "unseen", and `check:live` holds no stage fact (decisions-log "Step 22 closes"). Full text: `docs/plan-archive.md`, "Step 22"; record: `docs/mechanisms/stages.md`.

## Step 23 — Weapons: things you pick up, swing, throw, lose and steal

**Status: open, unclaimed.** (Its brief is done, builders archived: sword, hammer, spear and bomb, knocked loose, thrown, taken by bad guys, back at game over. Left: the rest of the twelve as data; bad guys taking the hammer and the sword (owed re-times); Q-015, not blocking.)

Full text: `docs/plan/step-23.md`

## Step 24 — An enemy who fights from range

**Status: open, claimed by orchestrator session_017WiGzGgiMLCwNj9zptZqBz (builders: named in the step file's "Briefs"), 2026-11-24.** (Opened 06:45 UTC from `docs/vision-gaps.md` row 1, the top gap nothing covered: no ranged kind, nobody hostile in the castle's rooms. Slice 1, `handoff-prompts/ranged-enemy.md`: one thrower as data on the Hall gallery's balcony, a telegraphed arc, his shot yours to throw back. Drafted by a subagent from the library and the code; nothing in it was run.)

Full text: `docs/plan/step-24.md`

## Step 25 — The suplex

**Status: open, claimed by orchestrator session_017WiGzGgiMLCwNj9zptZqBz (builders: named in the step file's "Briefs"), 2026-11-24.** (Opened 16:25 UTC from `docs/vision-gaps.md` row 6: no suplex. Carry a body, Use says SUPLEX; brief `handoff-prompts/suplex.md`.)

Full text: `docs/plan/step-25.md`
