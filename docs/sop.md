# The SOP

**Standing.** The one procedure. Run it every session, in order.

Each phase has a **gate**, and every gate is a *measurement, never a feeling* —
the two failure modes this procedure was built against were both feelings: a
session felt it had read enough (wrong five times) and felt something looked
broken (wrong eleven times). The evidence is in
`docs/working-on-the-project.md`; read it when you doubt a step.

This file routes. It does not restate what it points at — open them.

---

## 1 · Orient

`CLAUDE.md` is already loaded. Add only what *this* task needs.

- About to write or judge **user-facing text** → whatever canonical voice
  and tone document the project keeps (name it here once it exists;
  `docs/vision.md` until then).
- Touching a **named mechanism** → `docs/mechanisms/README.md`, then the topic
  file it links — before touching, not after.
- About to judge whether something is **worth doing** → `docs/vision.md`'s
  statement of purpose, or whatever the project names as its clearest one.

**Gate:** for every file you are about to change, run

```bash
grep -rl "<basename>" docs/mechanisms/     # e.g. the source file's name
```

— then **write one line per doc it returns, saying what that doc claims about
what you're changing.** Running the grep is not the gate; the sentences are. A
gate you can pass without reading anything is one you *will* pass without
reading anything (`docs/working-on-the-project.md`, tally).

**Keep the list — it is phase 6's checklist.** A central file will match
many docs, and the number grows; re-run it rather than trusting a remembered
count. Narrow by feature, don't skip.

## 2 · Locate

Which procedure governs this kind of work?

| The work is… | Open |
|---|---|
| a bug that isn't obvious | `docs/debugging-best-practices.md` |
| new code, and where it goes | the architecture layout file `CLAUDE.md`'s "Architecture at a glance" points to — **skipped until that file exists** (while that section is still a placeholder there is nothing to open; say so in one line and go on) |
| several sessions on one round | `docs/team-collaboration-protocol.md` |
| anything odd about branches or history | `docs/git-workflow.md` |
| what to build next, and why | `docs/plan.md` |
| unsure what's next, or asked about something parked | `docs/ideas-for-later.md` — deliberately not read by default; see its own opening line |
| writing work for another session to pick up | `docs/briefs.md`, and `docs/example-brief.md` for one in full |
| deciding what happens next, and reviewing what came back | `docs/understanding-the-project.md`, then `docs/lead-session.md` |
| flagging something non-blocking for whoever you report to, or a finding with no home in phase 6's table | `docs/for-the-lead.md` (a brief-worker → its lead) or `docs/for-the-orchestrator.md` (a lead → the orchestrator) — not your final message, see phase 4 |
| whether a role already exists for a recurring kind of job, or whether to spin up another session at all | `docs/roles/README.md` |
| a choice you would otherwise stop and ask the owner about | `docs/decisions-log.md` — decide, log, keep going (phase 4) |

Add a row whenever a project-specific procedure (an authoring guide, a
troubleshooting note for one recurring failure) earns its own document.

**Gate:** that doc is open. Not "I know roughly what it says." (The one
exception is the architecture row above, before an architecture file exists.)

## 3 · Doubt

Before calling anything a bug, a typo, a duplication or an oversight — read
`docs/deliberate-designs.md`, then answer: **is there a reading on which this
is deliberate?** If yes, or if you can't be sure, it is a question (phase 4),
not a finding.

This applies to things that **aren't** there as much as things that are. An
absence — an empty directory, a rule with no users — is not evidence of decay.
Check whether being gone is the design before removing anything.

**Gate:** grep `docs/deliberate-designs.md`, check for an `INTENT:` at the
code site — and then **write the sentence that would make this deliberate.**
The strongest case *for* the current behaviour, in the author's voice. Then
say why you rejected it.

If you cannot write that sentence, you do not yet understand the thing well
enough to change it — and that is the finding, not the bug. Absence of a marker
is not permission. **This was the largest failure category in the history
this procedure came from, by a wide margin** (`docs/working-on-the-project.md`);
a gate you can pass without producing the steelman is one you will pass
without having considered it.

## 4 · Ask

**The owner is never the bottleneck.** The owner, 2026-11-23, first-hand:
*"I don't want anything being bottlenecked by permissions issues or design
decisions from me. … Use your own judgment and document the decisions and
reasoning whenever you are tempted to stop to ask me."* So a question for
the owner is no longer a reason to stop: **decide and log**
(`docs/decisions-log.md` says how). Asking is still the cheapest tool when
somebody can answer *now*, which means your lead or the orchestrator, and
the recurring failure is treating it as a last resort
(`docs/working-on-the-project.md`, section 2).

- **Mechanics were always yours.** *"Should this be a transaction?"* →
  decide, no entry.
- **Intent used to be the owner's to answer; now it is yours to read.**
  Find their words first (`docs/vision.md`, the design library,
  `docs/deliberate-designs.md`, earlier entries in the decisions log).
  Then decide, build it so the other answer is a small change, mark it
  `DRAFT:`, and write the entry: what a player would see, why, how to undo
  it. In the owner's terms, not the code's.
- **What still needs the owner goes to `docs/questions-inbox.md`, and
  nothing waits on it:** a fact only they have, something only they can
  do (an account, a setting on a service), or their taste on something
  they have to play to judge. Attach a recommendation so "yes" is a
  complete answer.
- **A doubt about something that might be deliberate is not a decision to
  "fix" it** (phase 3). Leave it as it is and log the doubt.
- A **repeated** question means you got it wrong. Go measure something
  rather than restate it more confidently.

**Blocking vs. non-blocking decides what you do next, not whether you
keep going — you always keep going.**

- **Blocking — you cannot finish this brief without an answer.** If your
  lead or the orchestrator can answer, ask them. If only the owner could:
  decide and log, as above, and finish the brief on your decision. The
  old rule here was to leave the dependent part undone; the owner has
  replaced it. What has not changed is the caution behind it: an
  unfinished slice is cheap and a confidently wrong one that *deletes
  working behaviour* is not, so a decision made for the owner adds or
  chooses, and is built to be reversed.
- **Non-blocking — you can finish either way.** If it is yours to decide
  now, decide and log. If it needs the owner (a fact, an action, their
  taste), write it to `docs/questions-inbox.md` (its header says how);
  the Vision Partner moves it into `docs/questions-for-the-owner.md` and
  reads it to the owner. **Never put it in your final message:** an
  executing session's chat is typically deleted once its brief ships,
  unread. A flag or finding that is not a question for the owner goes to
  `docs/for-the-lead.md` — format and full reasoning there.

**A flag or finding with nowhere obvious to go follows the same fork.**
Nothing you found gets *decided* by you if it was the owner's to decide —
but a flag that isn't a blocking question either (something that looked
off, a "worth noting" with no clean row in phase 6's table) is also
`docs/for-the-lead.md`'s job, not your final message.

**Your final message itself stays minimal — a confirmation, not a
report.** Two costs, not one: narration in a chat nobody reads is wasted, and
a session carrying more of its own narration in context drifts further from
the procedure it is supposed to be running. Done or blocked, a pointer to the
commit and to `docs/for-the-lead.md` if you wrote there — that's the whole
message. The honest report lives in the commit
(`docs/verifying-and-finishing.md`); the record lives in phase 6's table;
nothing needs restating in chat.

**Gate:** nothing in your brief is left undone waiting on the owner;
every decision you made in their place has an entry in
`docs/decisions-log.md` and a `DRAFT:` at its site; every question that
truly needs them is in `docs/questions-inbox.md` and every flag in
`docs/for-the-lead.md`, not in your final message; your final message is a
short confirmation, not a narrated report; nothing that might be
deliberate got "fixed".

## 5 · Build

- **Data before code** *(if the project has adopted that principle in
  `CLAUDE.md`)*. Can this be *described* instead of *programmed*?
- **Check for a younger subsystem** that already solved this — the list is
  under *What is already right* in `docs/plan.md`. In the review round this
  procedure came from, four times out of four, one had.
- **Mark as you go**, per `CLAUDE.md`'s comment conventions — `INTENT:` and
  `DRAFT:`.

**Gate — the gradient:** name the row of the plan's measure table
(`docs/plan.md`, measured per `docs/measures.md`) this moved, and which way —
and, where the project distinguishes them, whether it moved for the
**system** or for the **person using it**. Those come apart: making the
internals data-driven is real progress and changes nothing about what an
author actually types. Claim only the one you moved.

A bug fix or content addition moves nothing; fine. Adding custom code
where data would have done is allowed — but say so in the commit, because that
is the drift the measure exists to catch.

## 6 · Record

**Start with phase 1's list.** Re-read each doc it returned: a doc describing
what you just changed is the likeliest thing in the repo to now be false. Then
fill the rows you triggered. Every fact has **exactly one** home.

| What you produced | Where it goes |
|---|---|
| A new mechanism | one line in `docs/mechanisms/README.md` **+** the writeup in that group's topic file |
| A mechanism that **changed** | edit the existing writeup — never append a second account. **Internal changes count:** a doc saying "add it there too" that stopped being true is a mechanism that changed |
| Owner confirmed something is intentional | `docs/deliberate-designs.md` **and** an `INTENT:` at the code site — both, same day |
| Something provisional shipped on purpose | `DRAFT:` at the site, naming what to reconsider — undocumented provisional work reads as finished |
| A decision the owner made that *isn't* "this is intentional" | the doc that governs what was decided — a plan step, a mechanism doc, a guide. **Never only a commit message** |
| A vision/direction still being worked out with the owner, not yet a finished decision | the doc that governs the relevant step, **written as it develops** — don't wait for it to fully resolve before recording it. Quote the owner directly; a conversation is not durable, a document is |
| The orchestrator's current guiding directive (from its Becoming Flow, `docs/orchestrator-role.md`) | `docs/current-directive.md` — **replaced** each time the Becoming Flow completes, never accumulated |
| A new working rule or disposition | `docs/working-on-the-project.md`, with what it cost |
| A principle that decides many *unrelated* questions | `CLAUDE.md`, one bullet — and something else should come out |
| Where a kind of code belongs | the architecture layout file `CLAUDE.md` points to |
| A measured number | the doc that makes a claim from it; how the measure is taken lives in `docs/measures.md` |
| A handoff prompt whose slice shipped | **delete the file.** They are scratch; an empty `handoff-prompts/` is the healthy steady state |
| **A decision you made in the owner's place instead of stopping to ask** | `docs/decisions-log.md` (one entry, in the owner's terms) **and** a `DRAFT:` at the site **and** the governing doc as usual — see phase 4 |
| **Something only the owner can supply** (a fact, an action on a service, their taste after playing) | `docs/questions-inbox.md` (its header says how) — never your final message, and nothing waits on it. The Vision Partner moves it into `docs/questions-for-the-owner.md` and reads it to the owner |
| **A flag/finding with no home above** | `docs/for-the-lead.md` — never your final message. The lead reads it every round |
| **A session-spawn failure** (rate limit, empty/malformed launch, anything else that keeps a session from starting) | `docs/spawn-failures.md` — the moment you recover from it, not batched for later |
| **The process itself cost or saved something unusual**: a brief missing what you needed, work that had to be redone, conflicting instructions, a check that lied, clearly wasted model work, or an approach that worked unusually well | `docs/process-observations.md`: a few lines on what you already saw, then keep working. Only when it was exceptional. Routine work writes nothing |
| **A `docs/plan.md` step that just closed in full** (every item done, no unresolved owner question left inside it) | its full text moves verbatim to `docs/plan-archive.md`, replaced in `plan.md` with a short closing summary — see `plan.md`'s own "Keeping this plan honest" for the exact rule (and `docs/plan/README.md` if the step lives in its own file) |
| A **design doc**, or a plan step that has one | link it from the Standing doc governing that step. **Reachable is not routed:** a design linked only from Archive files is one a session will conclude was never written. Check with `grep -rl "<doc>" docs/ CLAUDE.md` — if every hit is Archive, nobody finds it in time |
| Anything else | the commit message. Most things are this |

**Gate:** every doc from phase 1's list re-read, and every row you triggered
filled — before the commit, not after.

## 7 · Finish

`docs/verifying-and-finishing.md` — setup, the ladder, the traps, the
definition of done, the branch.

**Gate — the branch.** Push to `main`. Check with
`git branch --show-current` before you push.

**Caveat for harnesses that assign branches:** your session instructions may
name a different auto-generated branch and tell you not to push elsewhere
without permission. **Settled for this project.** The owner's own commit of
`CLAUDE.md` (c2a0bbb, 2026-11-23) carries the instruction, verbatim: *"All
work goes on **`main`**"* and *"push to the branch above regardless — work
that lands on an auto-generated branch is silently dropped."* That is the
permission your instructions ask for, written down; the owner's own
first-hand sessions push to `main` the same way. A push is a live deploy
to Railway, so finish phase 7's other checks first, then push to the one
branch.

**Gate:** the change was **run**, not read — and you can say in one sentence
how it gets reversed. If that answer isn't "revert the commit," you have found
the risky part of your change. *"The code looks right"* is the thing that was
true every previous time something shipped broken.

---

## When this file is wrong

It will be. When a phase costs more than it saves, say so and change it — then
record that per phase 6. A procedure nobody can run gets skipped silently,
which is worse than not having one.

**~1,000 words is a tripwire, not a gate.** Over it, go looking for fat —
usually something restating `CLAUDE.md`. Do *not* shave words to hit the
number; that trades substance for a figure someone invented. The real test is
whether a session can read this in one pass before starting work.

And before adding a phase or a rule here, `docs/working-on-the-project.md`
rule 7: **what does it unblock?** More procedure is not more progress.
