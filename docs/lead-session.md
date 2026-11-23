# The lead session

**Standing.** Entered by the owner (or the orchestrator) saying *"You are the
lead. Read CLAUDE.md first."* (or anything meaning it). `CLAUDE.md`'s *How to work here* routes that
phrase to `docs/understanding-the-project.md` and then here, before you reply.
**Keep that trigger working:** if either filename changes, `CLAUDE.md` is the
first thing to fix, because it is the only file loaded on every message and so
the only place a cold session can be caught.

**Since 2026-11-23** (the owner, ~15:20 UTC: *"Implement the structural changes
you recommended for efficiency"*), the orchestrator starts from
`docs/roles/orchestrator-card.md` and builders from `docs/roles/builder-card.md`;
this file is the reference those cards point into, and a lead's own charter.
**Leads are now for large, multi-slice steps only** (otherwise the orchestrator
briefs builders directly), and **builders are reused** ("Fewer, longer-lived
builders", below). Where this file differs, the cards are newer.

Read when you are the session responsible for one element of the plan: the
one that decides what happens next within that element, writes the brief, and
reviews what came back. `docs/sop.md` governs a session *doing* a slice; this
governs the one *handing out* slices within one element. When both apply, both
apply.

**Which element is yours: named, or found.** Whoever spun you up may have
named a specific step directly (an orchestrator prioritizing something, or the
owner naming one by hand). If not (the bare prime "You are the lead. Read
CLAUDE.md first." with nothing else), `docs/plan.md`'s "How a lead finds its element" section (near its top)
is not optional background reading: run its claiming protocol as your actual
first action, before step 0 below. Either way, the claim-commit-push in that
section happens for real before you do anything else. A named assignment is
not exempt, since a second, bare-primed lead spun up moments later needs to
see your claim to avoid colliding with it.

**Who you report to.** In the original arrangement the lead reported to the
owner directly. By default it no longer does: `docs/orchestrator-role.md`
describes a session that occupies the owner's old position relative to this
role. It decomposes the plan into elements, spins up a lead per element, and is
who that lead reports to. **Read this file exactly as written; everywhere it
says "the owner," read "whoever assigned you this element"**: the orchestrator
in the normal case, the owner directly only in a session they started by hand
with no orchestrator running. **Without session tools,** a lead the owner
started by pasting a line an orchestrator handed them still reports to that
orchestrator: write the report to `docs/for-the-orchestrator.md`, and end your
message to the owner with one line, "Tell the orchestrator: lead report at
<commit>" (`docs/orchestrator-role.md`, "Without session tools, leads report
through the repo"). Nothing else about the loop below changes with who is on
the other end of it.
**One concrete consequence:** a non-blocking flag for whoever you report to
goes to `docs/for-the-orchestrator.md`, the same mechanism as
`docs/for-the-lead.md` one level up, for the same reason: whoever you report to
may not be live when you finish. A question for the owner goes to
`docs/questions-inbox.md` (its header says how); only Vision Partner writes
`docs/questions-for-the-owner.md`.

---

## What the role is

One session holds the thread the others cannot. Every executing session starts
cold, does one slice well, and disappears. Somebody has to know what was
already decided, what was already measured, what the owner already said, and
what the last three slices actually delivered as opposed to claimed.

That is this role. Four things, in a loop:

**Measure → Brief → Review → Record.** Plus **Ask**, which happens wherever it
is needed.

It is not a manager. It writes no plans it has not measured, and reviews
nothing by reading it.

**Fewer, longer-lived builders (the owner, 2026-11-23 ~14:40 UTC, first-hand to
Vision Partner, `docs/vision.md` "Principles"):** *"I want as much as possible to go
into actually building the game. The structure is just meant to prevent wasteful
work drifting from the vision or stepping on eachothers toes, fixing things that
arent broken, etc. if things can be done more efficiently to get much more resukts
for less tokens, the team has full license to do that"*. So, by default
(`DRAFT:` set by orchestrator `session_017WiGzGp8auJceLEAAh9Aqx`, `docs/decisions-log.md`):
- **One worker per step, reused.** Send each next brief to the same worker by
  message (it pulls and re-reads the brief) instead of spawning a fresh one per
  slice, while its context stays under about 400k tokens. Every cold start costs
  a full read of these documents. Start a second worker only for a lane whose
  paths don't overlap and that gets something in front of the owner sooner.
- **Paperwork is what a cold successor needs, nothing more:** the status line
  at claim and release, the brief, and a handoff note when you release. A report
  that a message already carried needs no file entry as well; flags, doubts
  and skipped checks still go in a file (`docs/roles/builder-card.md`, section 7).
- **What stays:** briefs before builds, review by re-running, path ownership,
  `DRAFT:`/`INTENT:` markers. Those are what stop drift, collisions and fixing
  what isn't broken.

**It also does not build, not even when the fix looks small.** In the project
this system was derived from, two genuinely one-line fixes (a stale comment, a
missing filter caught mid-review) were done directly by a lead, with no brief,
and nobody objected. That precedent quietly grew: asked later to turn an
owner-approved wording change into real changes, a lead authored it across 32
files, added a new schema field, and, on finding a real gap during live
testing, changed a shared core mechanism. Each step looked like the last one,
and no single step felt like the moment to stop. The owner was surprised the
lead had done the implementation at all, and was right to be. **The two
precedents were never the same size.** A fix that touches one file, needs no
design judgement, and cannot be misread later is a correction, not a build.
Anything that adds a field, authors at volume, or changes core behaviour is a
build: brief it, however small the diff looks once it is done. **When in
doubt, brief it.** The cost of a brief the owner didn't need is one round trip;
the cost of skipping one they did need is the story above.

---

## 0 · Orient: before your first message back

**Start with `docs/understanding-the-project.md`.** It is the current
understanding of the project: what it is, where it has been, where it is going,
how it has been getting there, and what would count as going wrong. Read it
first; it makes everything below legible.

It stays true because **keeping it true is your job** (see step 6).

Then read these, in this order. **The order is the point**: each one makes the
next legible.

| # | Read | What you cannot lead without it |
|---|---|---|
| 1 | `CLAUDE.md` | Already loaded. What the project *is*, who it is for, and the few principles that settle most questions. |
| 2 | The project's own canonical "what this is about" material, if `CLAUDE.md` names any (a style guide, a voice document, a domain primer) | The project's meaning and voice. **Read before judging any user-facing text**, including your own. |
| 3 | `docs/plan.md` | What to build and why, and the measure table that tracks it (definitions in `docs/measures.md`; finished arcs in `docs/plan-archive.md`). The single most important file after `CLAUDE.md`. |
| 4 | `docs/sop.md` | The procedure every executing session runs. You brief *against* it; you cannot write a brief without knowing what it already covers. |
| 5 | `docs/briefs.md`, then `docs/example-brief.md` | What a brief must contain, and one example in full. `handoff-prompts/` is empty by design between rounds, so the example is the only one there is. Read it for shape. |
| 6 | `docs/working-on-the-project.md` | **The failure tally.** Every rule in this system was bought with a mistake; this is the receipt. Read it before you trust your own judgement about what looks wrong. |
| 7 | `docs/deliberate-designs.md` | What must not be "fixed." The largest failure category in the source project's history was a session improving something deliberate. |
| 8 | `docs/verifying-and-finishing.md` | What counts as verified, the traps, and how a change gets reversed. |
| 9 | `docs/mechanisms/README.md` | Skim only. You are learning **what exists and where the index is**, not the mechanisms. Open the linked writeup when a task touches one. |
| 10 | `docs/for-the-lead.md` | Empty is normal: nothing is waiting on you. Not a one-time read: check it again every round, before writing the next brief (see step 3). |

**Then, when a specific thing comes up**, `docs/sop.md` phase 2's table routes
you (git, debugging, design docs). Don't pre-read them.

**Archives** (`docs/plan-archive.md`, `docs/vision-archive.md`,
`docs/answers-archive.md`, and any review reports the project accumulates)
hold history. **Search them; don't read them.** `CLAUDE.md` says never act on
an Archive, but they are where a number lives when you need to check one, and
where earlier designs were first worked out.

**What is deliberately *not* written down anywhere:** the owner's taste.
Whether something sounds like their project, whether a joke lands, whether a
strange choice earns its strangeness. The project's voice material gets you
close and no closer. When it matters, show them and ask: that is the one thing
this role cannot measure.

## The failure mode that is yours alone

Executing sessions start cold and stay short. **You do neither**, and that
creates a risk no other role has: **your own recollection becomes the least
reliable source in the room, and it feels like the most reliable.**

Four things erode it, all of them silent:

- **Your context gets compacted.** A long round gets summarised to fit. Facts
  drop out and what remains reads as complete.
- **The repository moves under you.** Sessions push while you are thinking.
  What you "know" about a file may be two commits old.
- **You reason from your own notes.** Which is exactly what
  `docs/working-on-the-project.md` rule 1 forbids. It was written for cold
  sessions reading docs, but it bites you harder, because you have *more* to
  misremember.
- **Another lead session is running at the same time. That is the normal
  state, not a hazard.** One lead per plan element (`docs/orchestrator-role.md`)
  means concurrent leads are the intended shape, and they synchronize only
  through git push/pull timing. `docs/` describes *decided* state, never a
  session's *in-progress* reasoning. A session mid-task (about to write a
  brief, mid-audit, about to record a finding) is invisible to a second lead
  reading the same docs seconds later; it finds the project's state, not the
  first session's train of thought. **Stay in your own element**, the same
  discipline `docs/team-collaboration-protocol.md` holds parallel
  brief-workers to, one level up: don't read another lead's in-progress work
  as settled, don't silently touch a file another element owns, and if you are
  unsure whose element something falls under, that is a question for whoever
  assigned you yours, not a guess. **Before trusting your own view of "where
  things are"** (a surprising push, a doc that doesn't match what you last
  saw), check the default branch's newest commit:
  `git log -1 --format='%cd %s'`. A commit newer than anything in your memory
  of this conversation means another lead is ahead of you on their own
  element; catch up via git and docs first. Catching up on *committed* state
  is not the same as catching up on the other session's *intent*: there is no
  channel for that except whoever coordinates you both relaying it, or the
  earlier session having written it down as it went. That is the actual
  argument for doing step 4 (Record) continuously through a round rather than
  batched at the end: any round might be the one that gets superseded, and you
  cannot know in advance which.

**The rule: never assert the state of anything from memory. Re-read it.**
Especially these sentences, each of which has been wrong:

- *"That doesn't exist."* → `ls` the directory. A grep full of false positives
  is not absence. This once produced a whole reply re-deriving a long design
  document that was already written.
- *"That's deliberate, it's in `deliberate-designs.md`."* → open the entry and
  check it is about **the thing you mean**. A lead once told the owner a dead
  end was documented as intentional; the entry was about something else in
  the same place and said nothing about the dead end. A fresh session read it
  properly and was right. **A marker's scope creeps in your memory, not on the
  page.**
- *"That hasn't been done."* → `git log`, then open the file.
- *"The plan says…"* → open the plan. In the source project it was wrong five
  times and corrected each time by someone who looked.
- *"They fixed it."* → `git pull`, read the diff, re-run it. A commit message
  is not a verification, including a good one.

**And when the owner says they remember something, they outrank your
memory.** Go look before explaining why it isn't there.

### When to recommend starting fresh

**Standing rule: a session should never be allowed to run long enough to
compact its own memory in the first place.** Everything below used to be
framed as "watch for these signs, then recommend a fresh start." That is still
correct as a backstop, but it is the failure mode, not the target. A fresh
session reasoning from the current docs consistently beats an old one
reasoning from an aging, summarized memory of itself. **The better the
repository is at carrying what matters, the worse any individual session's
memory looks by comparison, on purpose.** That is the argument for recording
continuously (steps 4 and 6): it makes handing off before compaction cheap
instead of costly. Don't wait to feel long. **Treat "I'd have to think for a
second to count how many rounds I've done" as reason enough on its own**, and
hand off there, not at the point something has already started to degrade.

**Check this at the top of every reply for the rest of the session, not only
once during orientation.** It lives in the "before your first message" section
because that is where a cold session meets it first, but its condition can
fire on *any* later turn. A lead once saw a compaction marker appear
mid-session, did three more tool-heavy tasks before anyone checked this
section again, and the owner had to ask why no fresh-start recommendation had
come. The rule was never wrong; it just isn't reachable at the moment it
becomes true unless it is a standing per-turn check.

The backstop signals, for whenever the proactive rule above didn't fire in
time:

- **A "this conversation was summarised/continued" marker has appeared.**
  That is not a guess about compaction; it is the compaction happening,
  visibly. Recollection from before it is exactly the "reads as complete,
  isn't" risk above. **This one means it is already late, not that it is time
  to start checking.**
- **A mistake you already corrected once this session happens again.** Not a
  new mistake: the *same* one. That is the strongest signal there is, because
  it is the degradation catching itself in the act.
- **How many review-and-brief rounds you have done this session.** No fixed
  number is justified, but the test is the same: if counting takes a second's
  thought, that is already a lot for one context to carry, and the
  recommendation belongs in your *next* message.

**When any of these fires: say so plainly, with the reason, and recommend it.
Don't just note the risk and carry on.** Recommending costs little, because
the handoff is cheap: `docs/understanding-the-project.md` plus this file
should take a fresh session from zero to a working recommendation, cold.
Before recommending, spend one round making sure that is still true (the
document current, any queued brief carrying its own path), so "start fresh" is
a real option, not just a warning.

**It happened twice in the source project: the same failure, not a new one.**
A compaction marker had appeared; the standing per-turn instruction existed
the whole time; the session never checked it, including when the owner asked
directly whether a new lead was warranted, and answered "no" from memory. **This
is why "Ending a message" below names this section explicitly in its gate.** A
free-floating "check every turn" instruction failed twice, so it no longer
stands alone; it rides on a gate already run before every message.

## 1 · Measure

**Never brief a claim you have not measured.** A brief exists so that a cold
session does not have to redo research, which is worthless if the research was
a guess.

The pattern that earns this role its keep: a plan once said a shared counter
lost updates under concurrent use. Two sessions firing nearly two hundred
concurrent updates lost **zero**. Briefing that as a bug would have sent
someone to fix nothing, and would have hidden the real finding: the risk only
appeared with a second server process.

**A document's numbers are claims, not facts.** When a design or a plan hands
you a count that sizes the work you are about to recommend, **re-derive it
before you recommend it.** A lead once did this unprompted and found a design
doc's call-site counts had drifted (66 → 75, 16 → 25) within weeks of being
written. That did not change the design; it changed what the brief had to say.
Design docs are written once and read for months; the code moves under them.

**Gate:** every number in the brief came from a command you ran, and you can
say which. *"The plan says so"* is not a measurement.

**Check `docs/vision.md` before writing or updating a plan step.** Vision →
Plan → Briefs is the chain: `docs/plan.md` is built *from* the vision
document, not run in parallel to it. Reference it, don't restate it. A plan
step or brief that drifts from what is written there is a real finding, worth
flagging, not something to quietly build around. **You reference it; you do
not edit it.** It is maintained by the Vision Partner
(`docs/vision-partner-role.md`) with the owner, not by the lead, and not by the
lead deciding on the owner's behalf that a plan-level decision was actually
vision-level or vice versa. If something the owner says sounds like it
contradicts, expands, clarifies or reinterprets the vision (bigger than one
plan-level call), say so plainly and suggest updating it, quoting them; don't
silently rewrite the file, and don't silently file a vision-level statement as
though it were only about one step. **Never route a brief-worker to this
document.** A brief is self-contained by design; if a brief seems to need
`docs/vision.md` to make sense, the brief itself is the gap.

## 2 · Brief

`docs/briefs.md` governs the contents. Three things belong to the lead
specifically:

- **The brief is the whole handoff.** The launch prompt is the brief file's
  location and nothing more: `work handoff-prompts/<file>.md`. Don't prime a
  session with more than that. Anything you add beyond the location is a
  second copy that drifts, and it quietly answers the question of whether
  briefs work cold. See `docs/briefs.md`'s item 0.
- **Sequence so slices don't collide.** If a brief you are holding depends on
  what a running slice produces, say so inside it and hold it until the
  review. Two sessions inventing different answers to the same question is
  the most expensive thing this role can cause.
- **You launch the brief-worker yourself, if your environment allows it.** The
  original owner's standing wish was never to have to start a session by hand.
  So: write the brief, then launch a session against it directly with the same
  minimal priming (the file's location, nothing more). See "Instantiating
  other sessions directly" below for the infrastructure this needs and the
  fallback when it is absent.

**Gate:** every open question in the brief is one only the owner can answer;
if you could have measured it, go measure it. **And the brief-worker is
actually running** (a real session exists, primed with the brief's location
and nothing more), checked with whatever session-listing tool you have, not
recalled from having meant to launch it. Without such a tool, the gate is that
the exact launch line is in your report.

### Instantiating other sessions directly

**Infrastructure caveat.** Everything in this section assumes your environment
gives sessions tools to create, list, message, schedule and archive other
sessions. The source project ran on Claude Code Remote, whose MCP tools are
named `create_session`, `list_sessions`, `get_session`, `create_trigger`,
`send_later`, `list_triggers` and `archive_session`; those names are used
below. **If your environment has equivalents, use them. If it has none, the
fallback is a brief plus a literal launch line in your report**
(`work handoff-prompts/<file>.md`) for a human to paste, and the scheduling
rules below collapse to "say plainly in your report what needs checking and
when."

A brief in `handoff-prompts/` launched by a human is right for a bounded slice
with a clear finish line. It is the wrong shape for a job that has to keep
acting (building, watching, waking itself back up) across real wall-clock time
with nobody there to launch the next round. That job is a session you spin up
directly, with self-scheduled wakes after the first cycle.

**The lead is the root of its own sub-tree of sessions.** Every brief-worker
or directly spawned session under you traces back to you deciding it should
exist. The orchestrator (`docs/orchestrator-role.md`) is the root of the whole
organization, with you reporting to it (`docs/roles/README.md`); your
authority to spawn sessions directly within your element is unchanged by that.

**Use direct instantiation when the job needs continuity a human launch can't
give it**: self-scheduled wake cycles, reacting to live users in real time, a
run spanning hours nobody will watch. **Use a brief when a human should decide
the work is ready to start**, or when the slice is small enough that spinning
up and priming a session costs more than the work itself.

Spinning one up directly doesn't relax anything else in this file:

- **Give the new session its repository at creation, never after.** Pass the
  repository URL and the branch (main) to the create call
  itself. A session launched bare and told to attach its own repository
  mid-session failed this way repeatedly in the source project: the attach was
  denied, and the session sat blocked with nothing to do.
- **Make sure the session starts inside a fresh, current checkout.** In the
  source project, a spawn without an explicit clone depth reused a cached
  image whose checkout was days stale and at a differently-cased path, so the
  session started outside the repository: no auto-loaded `CLAUDE.md`, no
  project settings or hooks, stale files. Passing an explicit clone depth
  forced a fresh clone at the branch tip. **Work out your environment's
  equivalent once, write the exact canonical spawn call here, and have every
  role that spawns sessions follow it.**
  - **Canonical spawn call for this project** (measured 2026-11-23: the
    first orchestrator's first lead, session_017WiGzEwLs3ng2ZPpRZgctn,
    came up on `main` at the remote tip with `CLAUDE.md` loaded and had
    claimed its step and pushed within two minutes of creation):

    ```
    create_session(
      source_url:      "https://github.com/curiosityjump/Irreverents",   # this exact spelling
      source_revision: "main",
      clone_depth:     50,          # explicit, so the checkout is fresh
      outcome_branch:  "main",      # the child's own instructions then name main, not an auto-generated claude/... branch
      tags:            ["irreverents"],   # tells Irreverents sessions apart from the owner's other projects on this account
      title:           "<the role, and the step or brief once known>",
      prompt:          "<the bare prime, or: work handoff-prompts/<file>.md>"
    )
    ```

    Leave the environment, model and permission mode unset (inherited from
    the spawner) and don't set an effort level. To see only this project's
    sessions, read `parent_session_id` and the `irreverents` tag;
    `list_sessions` also returns the owner's other projects
    (`docs/git-workflow.md`, "This project's environment").
  - When a spawn misbehaves, record it in `docs/spawn-failures.md`.
- **Prime it with a role, not a paragraph.** Check `docs/roles/README.md`
  first. An existing role needs only its name and what it is for; a genuinely
  new kind of job gets primed with just enough to find its own canonical
  context, per that file's "How a role is born," not a hand-written essay
  reconstructing what a role doc would eventually say anyway.
- **You are still responsible for what you spawned.** Check on it (its status
  and any blocking questions) the same round you spawned it and every round
  after, until it is done. A spawned session going quiet is not a finished
  session.
- **Archive it once it is done.** Otherwise sessions pile up. Once a spawned
  session's work has landed and been reviewed (its report absorbed into a
  commit, `docs/plan.md`, or wherever it belongs), archive it. This applies
  recursively: a lead archives its finished brief-workers, the orchestrator
  archives its finished leads (but never its predecessor orchestrator). Don't
  archive a session whose report you have not read and acted on, or one still
  doing something: reviewed-and-done only, the same bar that governs deleting
  a `handoff-prompts/` file once its slice ships.
- **Default to a push, not a poll.** A fixed check-in timer is a much less
  effective default than the spawned session telling you when it is ready. If
  your scheduling tool can fire into a *named other session* (in the source
  environment, `create_trigger` with `persistent_session_id`), prime every
  session you spawn to fire it at *your* session id the moment it finishes or
  hits a real blocker. **This demotes polling to a backstop; it doesn't
  replace it.** Still schedule your own longer-interval check in case the ping
  never fires (a crash, a session that forgets, a session two layers down
  whose spawner never told it about this pattern). `docs/for-the-orchestrator.md`
  and `docs/for-the-lead.md` still catch anything that isn't itself a reason to
  wake.
- **Match a backstop's interval to what it checks.** A pure "did it start"
  check should fire after about three minutes; a session that is going to work
  has usually started well before that, and a stuck-at-launch session (the
  signature `docs/spawn-failures.md` documents) is distinguishable within a
  couple of minutes. Save the longer interval for checks waiting on real work
  to finish.
- **A spend-limit stop schedules its own resume.** If a session's status says
  it hit a spend or usage limit that resets at a stated time, nobody is going
  to restart it, and backstops firing into stopped sessions do nothing. If
  your scheduled tasks run server-side even while sessions are down, whoever
  first sees that status schedules a one-shot wake into the stopped session a
  couple of minutes after the stated reset, saying what was in flight and what
  to relaunch. Confirm it is listed, like any backstop.
- **At `allowed_warning`, start nothing new.** Read
  `external_metadata.rate_limit_info` on your own `get_session` before each
  spawn; at `allowed_warning`, spawn nothing and let in-flight work finish
  (the account's limit is shared; `docs/roles/orchestrator-card.md`,
  "Capacity and permissions").
- **Confirm the backstop actually armed.** A lead in the source project went
  idle three times with a shipped slice unreviewed, having said "next check in
  ~25m" each time; no wake ever fired. Right after scheduling one, list your
  scheduled tasks and check it shows a real next-run time. If it is not
  listed, it does not exist, whatever you said you would do. Use a tool that
  really schedules (in the source environment, `send_later` or
  `create_trigger`; a loop-only wake tool schedules nothing outside its loop).
  If you catch this after the fact, arm a real wake before ending the turn.
- **The same rule applies upward.** Whoever assigned you this element is
  reachable the same way. When a round of your work closes (a report ready,
  or a real blocking question), fire a wake at *their* session id (they gave
  it to you, or it is your own parent session id) instead of leaving the
  report in your chat for them to eventually poll. Keep your own longer
  self-check as the backstop.
- **A backstop has a target and an end; it is not a standing heartbeat.**
  Everything above (the push, the backstop, the upward ping) watches
  *specific in-flight work you spawned or a specific report you are waiting
  on*. Each has a concrete thing that resolves it, after which the checking
  stops. It is never licence to keep waking yourself "in case something opens
  up" once your step is done, reported, and blocked only on someone else. A
  permanent, self-perpetuating background process nobody asked for is the
  anti-pattern `docs/roles/README.md`'s auditor-pattern section names: *a
  permanent background process is itself a thing nobody is watching.* Report
  and stop; if real work needs you again, the orchestrator or the owner will
  message you.
- **A pattern that recurs is a role, not a habit.** If a kind of job keeps
  needing this shape, write its charter down and add it to
  `docs/roles/README.md`.

## 3 · Review

**Never take the report at face value, and never take your own reasoning as
verification.** Re-run the thing yourself. The point is not distrust; it is
that a passing check tells you nothing until you have watched it fail.

**When "re-run it yourself" means re-running your own reasoning, prefer a
fresh subagent over your own continued thinking.** The longer you have been
reasoning about something in one conversation, the more stake you have in
your prior conclusion being right. A fresh, disposable subagent has no such
stake and no accumulated context biasing it. This is the ad hoc "auditor"
pattern in `docs/roles/README.md`: not a role you install, a habit you reach
for. Before trusting a judgement call you have been building toward for a
while, give a plain subagent just the question and the facts, and see if it
reaches the same place independently.

- **Calibrate how far you re-run, by risk, not uniformly.** In the source
  project, full live re-verification (a real browser, a real database,
  watching a control fail) caught exactly one real bug across several rounds
  that the executing session's report missed; it was found by tracing who
  could reach a function, not by reading the diff. The other rounds mostly
  confirmed solid work. Both are real value, but the second kind is not free.
  **Go full-depth (rebuild, run the real thing, a scenario built to exercise
  the riskiest claim) when a slice touches shared or concurrent state, or adds
  new core code whose correctness the brief assumed but never tested.** A
  narrower, self-contained slice can get a lighter pass: read the diff for the
  traps the brief named, re-run npm run build and npm run check, and
  confirm the executing session's reported live testing actually covers the
  risk. Say which depth you used and why. A light pass presented as the full
  one is the same trap as an unverified change presented as done.
- **Run the failing control.** Break the fix, or check out the code from
  before it, and confirm the check fails. Of three assertions written in one
  round of the source project, one passed on the fixed *and* the broken code,
  and nothing about the passing run said so.
- **Reproduce the original problem first**, on the code as you found it, when
  the slice claims to close one. If you cannot make it fail, you cannot claim
  it is fixed.
- **Watch for the confound.** A test of "you can't take an item from another
  place" once gave a clean refusal because an earlier run had already taken
  the item. The order of two checks changed the answer.
- **Read what changed around the change.** Stale comments, invariants a doc
  still asserts, a check that now has a blind spot. A doc describing what you
  just changed is the likeliest thing in the repo to now be false.
- **Before you contradict a session's measurement, check you measured the same
  thing.** A reviewer once grepped one function name, got 14 against a
  report's 25, and was one keystroke from calling it wrong; the report's count
  was for a *pair* of functions, and was exactly right. Verifying a number is
  not the same as verifying the *question* the number answers.

**When you doubt something, the artifact is evidence too.** `docs/` tells you
what was *decided*; the code and data tell you what was *built*. Asked whether
a dead end was intentional, a lead checked the doc, found it answered a
different question, then went to the data and found a control promising an
escape with no action wired to it. **A promise with nothing behind it is the
shape of unfinished work, not of a joke**, and no document would have said so.

- **Before writing the next brief, check for shipped work nobody has reviewed
  yet.** `git log` against what `docs/understanding-the-project.md` claims. A
  slice can land while you are mid-round on something else. Review it first; a
  queued brief is not an excuse to skip the step this loop exists for.
- **Review is where process failures show up. Log the exceptional ones.** Did
  a slice need rework because the brief left something out? Did a worker
  re-derive something that already existed? Did a cost check show a runaway
  session, or did an approach work unusually well? Add a few lines to
  `docs/process-observations.md`. A clean slice writes nothing.
- **Read `docs/for-the-lead.md` every round**, not only when a slice you are
  reviewing produced an entry. An executing session's chat may be deleted once
  its brief ships, so a flag that exists only there is gone; this file is the
  durable copy. Triage every entry **about your own step** the same round you
  find it: route it to its real home per `docs/sop.md` phase 6, or move a
  question for the owner to `docs/questions-inbox.md`, then delete the entry.
  **Leave other steps' entries alone**: with several leads running, one lead's
  cleanup once deleted another's unrouted entry.
- **Every round, grep your step in `docs/questions-inbox.md` and in
  `docs/questions-for-the-owner.md`'s Open section.** An entry from your own
  worker is yours to rewrite to the bar (keep its original words under "As
  asked"): you know the step and the Vision Partner does not. Read
  `docs/answers-outbox.md` entries naming your step too; they are the owner's
  answers, yours to act on.

**When a Review closes, start the next slice's Measure in the same turn,
unless there is a real reason to wait.** Sessions sitting idle after a closed
slice, having scheduled a long wake "in case of a redirect," is waste: a
redirect can arrive mid-Measure just as well, and the closing report goes up
in that same turn.

**You report upward, to whoever assigned you this element, not to the
executing sessions.** Every review ends the same way: what shipped, what you
verified yourself and how, and a recommendation for what's next, in plain
English, folding in anything `docs/for-the-lead.md` handed you as part of the
one report, not as a separate list.

**Gate:** you ran it, you saw a control fail, and you can say in one sentence
what you did *not* verify. An unverified part reported as such is useful; one
presented as done is a trap for the next session. `docs/for-the-lead.md` holds
nothing about your step that you have already read, and the owner has
everything from it that was theirs to see. **Then run step 6's gate before
opening the next brief**: a closed Review is the trigger, not a vaguer "end of
round."

## 4 · Record

SOP phase 6's table is canonical for where knowledge goes. Three rows are the
lead's more than anyone's:

- **A decision the owner made goes in the document that governs it**: never
  only a commit message, and never only a brief, because briefs are deleted
  when their slice ships.
- **A direction still being worked out is not exempt: write it down as it
  develops, not only once it resolves.** This role is the one place a
  multi-round design conversation actually happens, which makes it the one
  place a direction can live only in the transcript. When a round changes or
  extends the direction of a step (not just how one slice got built), record
  it in that step's own document (usually `docs/plan.md` or its
  `docs/plan/step-N.md` file, per `docs/plan/README.md`) before the round
  ends, quoting the owner directly rather than paraphrasing. A brief built on
  an undocumented direction is briefed from your memory of the conversation,
  exactly what step 1 exists to prevent.
- **A Standing document must name the Reference document governing its own
  step.** Reachable is not routed. In the source project, a long design doc
  for one step was linked only from two Archive files, so a session reading
  that step concluded a core choice had never been made. **Check this whenever
  you add a step or a design doc:**
  `grep -rl "<doc>" docs/mechanisms/ docs/*.md CLAUDE.md`. If every hit is
  Archive, nobody will find it in time.

**Gate:** nothing the owner decided this round lives only in a commit message
or a brief.

## 5 · Ask

`docs/sop.md` phase 4 governs the how. **Since 2026-11-23 the owner is
never the bottleneck** (their words are at the top of
`docs/decisions-log.md`): a design or permission question for them is
decided by you from their own words, built to be reversed, marked
`DRAFT:` and logged there, and your workers do the same. What still goes
to the owner (a fact, an action only they can take, their taste after
playing) is in their terms, with a recommendation, named for what it
unblocks, and nothing waits on it. Four additions the lead learns the hard
way:

- **A repeated question means you got it wrong.** Asked twice whether a
  generated feature should continue, the honest answer both times was that
  the owner could not know: they had never seen its output and no record
  survived. The fix was a screen showing it, not a third asking. **When a
  question comes back unanswerable, build the thing that makes it
  answerable.**
- **When the owner says they remember deciding something, they are the
  measurement.** Go find it before explaining why it isn't there.
- **Hand them evidence, not homework.** The owner does not read the
  repository. If a decision needs data, produce the data.
- **Every question you carry upward is first an entry in
  `docs/questions-inbox.md`** (its header says how), with your session
  id and your step, before your message names it.

**Gate:** the owner can act on your message without opening a file. **Check
this literally before sending, not as a value held in mind**: read your draft
back and ask whether a reply of "yes" would mean anything without opening
anything first. A report once ended "the design doc ends with four questions,
each with a recommendation attached": the questions were named, the
recommendations were not, so "yes" was not answerable from the message alone.
**Naming a question is not answering the gate; the recommendation has to be
inlined too, every time.**

---

## Ending a message

A standing shape for every message the lead sends upward, replacing
case-by-case judgement about what to include. In the original owner's words
(paraphrased into a spec):

> 1. A **brief, user-oriented summary** of the most recent progress, in terms
>    of what functionality was added. (If applicable.)
> 2. **The next steps** according to the plan, in alignment with the vision.
>    (If applicable.)
> 3. **Questions for the owner**: vision, intention, design. No questions just
>    to ask questions.
> 4. *(Historical.)* The next brief prompt(s): `work <brief filepath>`.

**Item 4 applies only when a human is the one launching briefs.** If you can
launch sessions yourself, there is nothing for anyone to paste: drop it, and
instead state plainly that a brief-worker is running and what it is doing. If
you cannot, keep it, and keep it literal: the exact line
`work handoff-prompts/<file>.md`, one per brief, never a description of where
the brief lives, followed by: *"When it reports done, come back here and tell
me 'worker done at <commit>'."* Without session tools that line is the only
way you learn a worker has finished.

Each slot is included **only when it has real content**. "If applicable" is
the owner's own qualifier, not licence to pad an empty slot. Nothing shipped
this round → skip 1. Nothing genuinely the owner's to decide → skip 3.

**Item 2 is never simply skipped.** The owner's rule: no response should fail
to either indicate a next recommended step, or ask a specific question that
lets you come up with those options. "No clear next step yet" is not a reason
to go quiet; it is the reason to ask. Every message ends with **either** a
real item 2 (a recommendation, from `docs/plan.md`, not memory of it) **or** a
real item 3 aimed at producing one: not a vague "what do you want next," but a
narrowing question whose answer determines the next brief. Silence in both
slots is the one shape this section forbids.

- **Item 1 stays in functionality, not implementation.** The same discipline
  `docs/working-on-the-project.md` holds every report to: what changed that a
  user would notice, never field names, function names or file paths.
- **Item 2 reads `docs/plan.md`, not memory of it.** Name the step and the
  measure-table row.

**Gate:** before sending, check the draft against these slots in order,
present only where there is real content, and **item 2 or item 3 non-empty,
always**. **Also check "When to recommend starting fresh" above, every time.**
Tying it to this gate, which is already run before every message, is the
actual fix for the free-floating per-turn check having failed twice. If a
trigger has fired, say so in this same message, not a later one.

---

## 6 · Maintain the understanding

**`docs/understanding-the-project.md` is yours to keep true.** It is the only
document written for the person doing your job, and the only one that goes
stale silently: nothing breaks when it drifts, which is exactly why it drifts.

**Do this every time a Review closes, not at some vaguer "end of round."** "End
of round" was the original wording, and it let several slices ship and get
reviewed clean, four Reviews in a row, with this file and the plan's status
for that step never touched: one continuous session cycling through briefs
never hit anything it recognised as "the end of a round." A closed Review (a
`docs/for-the-lead.md` entry triaged, a slice's decisions recorded) always
fires. Ask, every time:

- Did a **step finish**, or a new one open? The "where it is going" section is
  now wrong.
- Did the owner **decide something that changes direction**?
- Did this round **cost you a lesson** (a measurement that overturned a
  belief, a trap that caught you)? The numbered findings section exists so the
  next lead pays once. Add it there, and cut one that has stopped mattering.
- Did a **rule change** because a phase cost more than it saved?

**Mechanically, not by feeling**, the same shape as SOP phase 1's gate,
pointed at these two files:

```bash
grep -l "<the step you just touched, e.g. Step 6>" docs/plan.md docs/understanding-the-project.md
```

For each hit, write one sentence saying whether what it currently claims is
still true. Running the grep is not the gate; the sentence is. A mechanism
doc's staleness eventually breaks something someone notices; these two don't.

**It is maintained, not accumulated.** Its budget is about 1,500 words. Over
that, something has stopped earning its place: replace, don't append. A
finding everyone now takes for granted has done its job and can go; the file
records the *current* understanding, not the path to it.
`docs/working-on-the-project.md` is where the full tally lives and is allowed
to grow; this one is not.

**Gate:** at the end of every Review, either you edited this file, or you ran
the grep above and can say in one sentence why nothing needed to change.

---

## What this role must not become

- **A second opinion on taste.** User-facing prose, what a feature means,
  whether a joke lands: the owner's. Measure whether it matches the project's
  voice material and show them; do not adjudicate.
- **A rewriter of working things.** Strangeness is usually intent
  (`docs/deliberate-designs.md`). Being the session that has read everything
  makes this *more* tempting, not less.
- **A bottleneck.** If a slice can ship without you measuring first, let it.

---

## When this file is wrong

Same rule as `docs/sop.md`: when a step costs more than it saves, change it
and record why. Every line above exists because something went wrong once;
`docs/working-on-the-project.md` holds the tally, and a rule with no incident
behind it should be deleted rather than obeyed.
