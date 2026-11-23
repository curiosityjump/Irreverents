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

| | Thing being measured | Today (2026-11-23 03:56 UTC) | Where it should get to |
|---|---|---|---|
| M1 | **Live:** the address serves what is on `main` | a deploy probe, commit 7b8dc09 (no game) | the game, at the tip of `main`, after every push |
| M2 | **Together:** two players on separate devices share one world at the live address | no | yes, proven by script (Step 1) |
| M3 | **Vision playable:** of the design library's six build gates A–F (doc 24), how many have a scripted player-view check passing | 0 of 6 | F and A by the owner's morning, then B, C, D, E |

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

**Every open step below carries one bolded status line, immediately
after its heading, read literally by a scanning lead:**

- `**Status: open, unclaimed.**` — real, decided, actionable work with no
  lead on it. The next lead started with no named element claims the
  *first* step (lowest number) carrying this exact line.
- `**Status: open, claimed by <session id>, <date>.**` — a lead is active
  on it. Skip it; don't start a second lead for the same step.
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

## Step 1 — A live room two people can play in together

**Status: open, claimed by session_017WiGzEwLs3ng2ZPpRZgctn, 2026-11-23.**

Full text: `docs/plan/step-1.md`

## Step 2 — Moving, hitting, grabbing and throwing

**Status: open, claimed by session_017WiGzGRnRoAeW5Ep5iSycV, 2026-11-23.** (Opened 2026-11-23 04:26 UTC: Step 1's Gate 1 is on `main` and verified; `docs/architecture.md` is the contract.)

Full text: `docs/plan/step-2.md`

## Step 3 — A small kingdom to explore

**Status: open, claimed by session_017WiGzGUAnvQfWco5vTcMX4, 2026-11-23.** (Opened 2026-11-23 04:26 UTC: Step 1's Gate 1 is on `main` and verified; `docs/architecture.md` is the contract.)

Full text: `docs/plan/step-3.md`

## Step 4 — People who react

**Status: open, claimed by session_017WiGzG4WzuJfHAu3XWoUhc, 2026-11-23.** (Opened 2026-11-23 04:26 UTC: Step 1's Gate 1 is on `main` and verified; `docs/architecture.md` is the contract.)

Full text: `docs/plan/step-4.md`

## Step 5 — Comfortable on an iPhone, easy to play together

**Status: open, unclaimed — queued behind Step 1.** (Opens when Step 1 closes.)

Full text: `docs/plan/step-5.md`

## Step 6 — The king who never stops talking

**Status: open, unclaimed — queued behind Step 3.** (Opens as soon as the throne room is on `main`, not at Step 3's close; its second half needs Step 4's rules.)

Full text: `docs/plan/step-6.md`

## Step 7 — A Hall that remembers, and a machine to steal

**Status: open, unclaimed — queued behind Step 4.** (And Step 3: it needs the gallery and the alert system.)

Full text: `docs/plan/step-7.md`

## Step 8 — What you see and hear

**Status: open, unclaimed — queued behind Step 1.** (Opens when Step 1 closes.)

Full text: `docs/plan/step-8.md`

## Step 9 — Powers you pick up, and can lose

**Status: open, unclaimed — queued behind Step 2.**

Full text: `docs/plan/step-9.md`

## Step 10 — The first ten minutes, played end to end

**Status: open, unclaimed — queued behind Step 1.** (Opens when Step 1's second gate lands: two players on the real page.)

Full text: `docs/plan/step-10.md`

