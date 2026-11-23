# Process observations

**Standing.** An append-only record of the moments the development system
itself — roles, handoffs, briefs, docs, tooling — performed noticeably worse
or noticeably better than usual. Written by whoever notices, at the moment
it's already in front of them; never triaged away. Evidence for later process
improvement, not a to-do list.

---

## Why this file exists

The project has good *inboxes* and good *rules*, but without this file it has
no durable layer of evidence between them. `docs/for-the-lead.md` and
`docs/for-the-orchestrator.md` are cleared on triage (empty is healthy), so
what they held survives only in git history. `docs/working-on-the-project.md`
and the role charters hold the conclusions — and many rules there come from
one incident each. This file keeps what happened, so a pattern can be seen
across incidents before anyone turns it into a rule.

`docs/spawn-failures.md` works this way for one narrow kind of failure, and in
the project this system was derived from it proved the approach: an entry that
left a question open, instead of guessing, led a later cold session to the
root cause. **Spawn failures still go there, not here**, and anyone analysing
process reads both.

## When to write — and when not to

**Write only when something was exceptional.** Routine work that went fine
produces nothing here. This is not a retrospective, and no brief or round ends
by writing one. Write when, in the ordinary course of your work, you ran into
one of these:

| Tag | What you saw |
|---|---|
| `rediscovery` | Real effort spent finding or re-deriving something that already existed |
| `handoff-gap` | A brief, prime, or report was missing something the receiver needed |
| `ownership` | Unclear or overlapping ownership: two sessions or two elements on the same thing, or nobody on it |
| `conflict` | Two plans, briefs, or instructions disagreed |
| `rework` | Work that had to be redone and could have been avoided |
| `upstream` | A correction downstream whose cause was a process problem upstream |
| `confusion` | An instruction or procedure that misled someone, and it wasn't the first time |
| `tooling` | A check, tool, or verification step that was missing or gave a false result |
| `usage` | Model work that was clearly wasted: a runaway session, a duplicated run, a long context that didn't need to be |
| `success` | An approach that worked unusually well and might be reusable |

Use these tags. A new tag is fine when none fits, but prefer an existing one —
a log with forty one-off tags can't be counted.

**Most observations come from things you already have in hand:** a review that
caught a problem, a session-status result showing unusual usage or a failed
launch, a correction from the owner, a `docs/for-the-lead.md` flag you're
triaging. Record what you already saw. Do not go looking for more just to fill
in an entry. A field you don't know stays `unknown`.

**Not here:** blocking questions (to a person, `docs/sop.md` phase 4); flags
for the owner (the inboxes); spawn failures (`docs/spawn-failures.md`);
decisions or new rules (phase 6's table). If the same event also needs one of
those, do that as well. This file only adds evidence.

## Observation vs. interpretation

The first four fields are **what happened**, checkable by someone who wasn't
there. The last two are **what you think it means**, and they're optional. Say
whether a cause is *known* (demonstrated) or *suspected*. **One observation is
not a mandate.** A tactical fix in the moment is fine, and when you make one,
say so under Improvement. A permanent change to a charter, the SOP, or
`CLAUDE.md` should normally wait for recurring evidence here, unless the
problem clearly needs fixing now. `docs/orchestrator-role.md` says how that
decision gets made.

## Format

One entry per event. Append it and never edit it. Later readers add one
`**Disposition:**` line underneath, and change nothing else.

```markdown
### <date> · <tag> · <your role, and step/brief if any>

**Observed:** <what happened, plainly>
**Surfaced at:** <where in the process it became visible — spawn,
brief read, build, review, owner correction, triage…>
**Impact:** <what it cost or saved — rework, hours, owner time, relative usage;
"unknown" is fine>
**Evidence:** <commit, session id, file:line, quoted status — something
a later reader can re-check>
**Cause:** <known: … / suspected: … / unknown>
**Improvement:** <apparent / tactical fix applied: … / none apparent>
```

**About dollar figures from session tooling.** If your session tooling reports
a per-session usage figure in dollars (a `cost_usd` field, for example),
confirm with the owner what it means before treating it as money. In the
project this system was derived from, it was *not* money the owner paid — only
a relative usage indicator, useful for comparing sessions measured the same
way. Until the owner says otherwise, quote the field name (`cost_usd` 12.34),
never "$12", and never describe it as spend. Real money — an API key the live
product pays for — is a different thing; say which one you mean.

---

## Industrial Engineer readiness

`docs/industrial-engineer-role.md` ships with this system, but the role is
**not started** until enough *organic* evidence exists here for it to study.
The owner may not read this file, so the orchestrator tells them. **Status:
not yet announced.** (Log began 2026-11-23, with the first organic entry.)

**When to check:** only at a project transition the orchestrator is already
handling: a `docs/plan.md` step closing, or a lead's end-of-element report.
Never on a schedule of its own, and never from a session woken just to check.
Stop checking once announced. This section governs only the **first**
Industrial Engineer.

**Ready when all four hold:**
1. At least 10 entries under "Organic entries" at the bottom of this file.
   Anything above that heading (a backfill, or entries written while the log
   was being set up) doesn't count.
2. Those entries come from at least 3 distinct roles or process stages (the
   header's third field).
3. They carry at least 2 different tags, and aren't all one issue repeated.
4. At least one `docs/plan.md` step has closed since this log began (record
   that date in the status line above when the first organic entry lands).

```bash
awk '/^## Organic entries/{f=1;next} f&&/^### /' docs/process-observations.md  # criteria 1-3: count, roles, tags
git log --since=<date this log began> --oneline -- docs/plan-archive.md        # criterion 4: steps closed
```

**When all four hold,** tell the owner, word for word: *"We have enough organic
evidence to start the Industrial Engineer."* Then give only four lines: the
qualifying observation count, the roles or stages represented, the main tags,
and the number of plan steps closed since the log began. Change the status
line above to "announced <date>" in the same commit. **Do not start the role**
until the owner asks. After that first start, the orchestrator starts later
ones on the T1–T8 evidence triggers, telling the owner — the one rule lives
in `docs/orchestrator-role.md`, "Starting an Industrial Engineer".

---

## Entries

*Backfill, if anyone ever writes one, goes here — e.g. a bounded pass over
session history when this file is first adopted. Mark it as backfill, say it
is a sample and not an audit, and classify each rule's evidence as
**repeated**, **severe one-off**, **ordinary one-off**, or **unclear** without
judging the rule.*

An example of the shape (fake; delete when the first real entry lands):

```markdown
### 2026-01-01 · handoff-gap · brief-worker, Step 3 slice B

**Observed:** The lead amended the brief on the branch while the worker was
mid-build. The worker found the amendment only when its push was rejected as
non-fast-forward.
**Surfaced at:** push.
**Impact:** about a third more work than one pass would have taken.
**Evidence:** <amendment commit>, <rejected push>.
**Cause:** known: an edited brief doesn't reach a session already running it.
**Improvement:** none applied. Possibly: a lead that amends a brief in flight
also messages the worker.
```

---

## Organic entries

*Everything below this heading counts toward Industrial Engineer readiness
(see above). Keep appending at the end.*

### 2026-11-23 · tooling · orchestrator, first run

**Observed:** The orchestrator cleared `docs/answers-outbox.md` by rewriting
everything under "## Entries" in one edit, then rebased onto `main`. Vision
Partner had appended a new entry ("Asset requests through Drive") in the
meantime. The rebase reported success and the pushed file had no entries:
the new entry was cut without having been read, acted on or receipted.
**Surfaced at:** a later pull, when Vision Partner's commit message mentioned
an asset mechanism the orchestrator had not heard of (about five minutes).
**Impact:** small this time: the entry was recovered from `git show`, acted on
and receipted within minutes. It carried the owner's instruction "Make sure
the orchestrator knows it can request assets this way", so a miss would have
been an owner instruction silently dropped.
**Evidence:** outbox entry added in 312d81a; gone in ebe8c94 (orchestrator);
receipt added in 6759f99.
**Cause:** known: a whole-section rewrite merged against a concurrent append
resolves as "deleted" without a conflict.
**Improvement:** tactical fix applied: cut outbox entries one at a time, by
heading, after a pull, and after any rebase that touched the outbox re-read
`git diff ORIG_HEAD..HEAD -- docs/answers-outbox.md` before pushing. Not yet
written into a charter (one incident).


### 2026-11-23 · conflict · brief-worker, Step 4 slice 1 (`step-4-slice-1-moods.md`)

**Observed:** my brief named the seam with Step 2 `entity.c.drive` and told me to add the rule to `src/sim/systems/verbs.ts`; `docs/architecture.md` ("Bodies") and Step 2's brief, written minutes later, named it `entity.c.input` and gave that file to Step 2's worker. Step 2's version landed on main while I was building.
**Surfaced at:** brief read, phase 1 (reading the architecture doc the brief did not need me to open).
**Impact:** small: one message to the lead, and the name kept behind one helper so either answer was a one-line change. Had I followed the brief alone, two workers would have edited the same shared file with two names for one thing.
**Evidence:** brief at 876c71d (section 2, "The seams"); `docs/architecture.md` at 27b4d03; Step 2's `systems/verbs.ts` on main; my a501061 commit message.
**Cause:** suspected: two leads agreed a seam by message and each wrote it into their own brief from memory, a minute apart.
**Improvement:** tactical fix applied: took the shared doc over the brief and told the lead. Apparent: when two leads agree a name, one of them writes it in the shared doc and both briefs point at that line.

### 2026-11-23 · tooling · brief-worker, Step 4 slice 1

**Observed:** `npm run check:deployed` printed FAILED within seconds of a push instead of waiting its three minutes: in this container the script's wait did not take the time it says, so its "after the wait, revert first" advice arrived while the deploy was simply still under way. The clock (`date`) moved about a minute while the check ran its full wait several times.
**Surfaced at:** phase 7, after the push.
**Impact:** a few minutes; no revert was made. A session trusting the message would have reverted a healthy push (and the pending set also held another step's commit).
**Evidence:** 15cea88 pushed 04:52:59 by the commit clock; the check reported the live commit c05f6a5 "started 04:51:21" and FAILED at 04:53:20; a fresh clone of 15cea88 built and started locally.
**Cause:** unknown (timers in the container appear not to run in real time).
**Improvement:** tactical fix applied: polled `/healthz` and compared its `startedAt` and the commit times instead of trusting the script's own wait. Apparent: the script could print how long it actually waited, by the server's `startedAt` clock rather than its own timer.

### 2026-11-23 · A lead read an empty-looking inbox and blamed another lead for deleting entries that were still there (Step 4 lead, corrected 08:35 UTC)
I looked for my worker's flags in `docs/for-the-lead.md` by printing from the "## Entries" heading to "## Format", saw "(Empty. Append below.)", and concluded Step 7's cleanup (6fe5d2b) had removed them. It had not: entries are appended at the end of the file, after "## Format", and mine were at line 130 the whole time. I told the Step 7 lead and the orchestrator it had happened, and the orchestrator told every lead. The Step 7 lead checked the diff and was right. Cost: one wrong accusation and a wrong all-hands message. What would have prevented it: `grep -n '^### ' docs/for-the-lead.md` (enumerate, do not read a section), or `git show <commit> -- <file>` before saying what a commit did. The file's own layout invites it: a heading called "Entries" that says "Empty" above the real entries.

### 2026-11-23 · usage · orchestrator, first night

**Observed:** At about 04:58 UTC every Irreverents session (the orchestrator,
six leads, about ten workers, Vision Partner, and the orchestrator's own
drafting agents) was refused by the account's shared five-hour usage limit:
"You've hit your monthly spend limit · your 5-hour limit resets 8:20am (UTC)".
Nothing ran until the orchestrator's pre-armed wake at 08:26 UTC. The limit's
warning state was seen at 04:57, about a minute before the refusal.
**Surfaced at:** a lead's report (rate_limit_info "allowed_warning"), then the
orchestrator's own session reading "rejected"; three agents of two workflows
failed with the limit message.
**Impact:** about three hours and twenty-five minutes of a night whose
deadline was the owner's morning. Step 1's second gate (touch, two players on
the real page) was mid-flight and did not land, so at 08:27 the live game was
still the keyboard-only page.
**Evidence:** last commit before the stop f7b87fb (04:57:30); first after it is
the commit carrying this entry. The orchestrator's own session at 04:57:
683k of context, 135M cache-read tokens, `cost_usd` 140.4. Subagent tokens of
its five workflows: 1.44M, 1.11M, 1.10M, 0.99M and the first aborted one.
Fan-out at the stop: six leads opened within thirty minutes (04:25 to 04:53).
**Cause:** known: the window that began about 03:20 UTC was spent in roughly
one hour forty minutes. Suspected shares: the orchestrator's own turns (a
very large context re-read on every tool call), its workflows, and sixteen
build sessions at once. No session can read how much allowance is left; the
warning arrives too late to act on.
**Improvement:** tactical fix applied: after the reset, a fresh orchestrator
with a small context, no orchestrator workflows, four leads with one worker
each, and the rest held (`docs/for-the-orchestrator.md`, handoff entry of
08:35 UTC). Possibly: budget a window before fanning out (the previous
window's burn is the only yardstick), and hand an orchestrator off on context
size, not on a count of check-ins.

