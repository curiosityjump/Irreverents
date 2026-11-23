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

