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

### 2026-11-23 · A brief that changes under a running worker reaches them only at their next rebase
Step 1 Gate 2 worker (`session_017WiGzGmZK2vRuZTfKA24QD`). The Gate 2 brief was amended at least five times in the twenty minutes after launch (effects with acknowledgement, upright play, the party seat, the built server in check). I built and proved a whole first version against the launch text, and found the changes only when a rebase conflicted. Cost: a second pass over the network protocol, the layout, e2e and the docs. What would have saved it: a one-line message to the worker each time its brief changes, or the worker re-reading its brief at every fetch (I do now).


### Orchestrator (2), 2026-11-23 09:42 UTC: the weekly limit warned, seen only by accident

**What happened:** `rate_limit_info` on two sessions read `allowed_warning`, type `seven_day_overage_included`, resetting about 13:00 UTC. I saw it only because `archive_session` echoes the session record; my check-ins had not read it, though `docs/current-directive.md` says to at each one. I had spawned a fresh Step 3 lead a minute before; I archived it unused, held Step 3, and moved Step 4's and Step 5's stops to 10:00 UTC.
**Suspected cause:** the check-in prompt I armed did not carry "read rate_limit_info"; the handoff entry named only the five-hour window.
**Disposition:** none yet (one incident). Tactical: my check-in prompt now carries it.

### Step 5 slice A, 2026-11-23 (lead session_017WiGzJfkNbzJfpRVPhWoeK)

- **A brief sent a worker to the wrong folder.** I told it to put new
  e2e facts in `scripts/checks/` because another brief said so; `npm
  run check` loads every file there as a browserless check. The worker
  caught it and used `scripts/e2e/`. I copied a path from a brief
  instead of opening the folder's loader: a brief's claims are claims.
- **Worked well:** four parts as four small pushes with a clock in the
  brief; three were live 24 minutes after launch, so an earlier stop
  from the orchestrator cost nothing.


### Orchestrator (4), 2026-11-23 13:27 UTC: a backup on another model covers a model limit, not the account limit

**What happened:** the owner started an Opus backup orchestrator (`session_017WiGzGp8auJceLEAAh9Aqx`) at 11:15 UTC because the Fable orchestrator's weekly allowance read `allowed_warning`. Fable stopped at 11:58 ("your Fable limit resets 1pm"); the backup took over at 12:01 and relaunched two lanes on Opus. Then, from about 12:36 to 13:20 UTC, the account-wide five-hour limit ("your 5-hour limit resets 1:20pm") stopped every session on every model, the backup included. Its 13:02 wake was delivered at 13:25, and the owner had to say "Resume all".
**Suspected cause:** about ten sessions running at once (nine look lanes plus a feel lead and its workers) on one account. Moving work to a second model spreads the per-model cap but not the shared five-hour one. Every Opus session read `allowed_warning` on the five-hour window from 12:02, and the backup opened two more sessions anyway.
**Disposition:** none yet (one incident). Tactical: at a five-hour `allowed_warning`, start nothing new. Arm every wake for after the latest reset any limit names, not for the first.
**Disposition:** 2026-11-23 ~15:25 UTC, acted on structurally at the owner's instruction ("Implement the structural changes you recommended for efficiency"): two layers by default, one reused builder per area, short role cards, orchestrators handing off at about 250k tokens, less paperwork, and spend per visible change (`docs/measures.md` M4) taken at each handoff (`docs/decisions-log.md`, "Two layers, reused builders, short role cards, small orchestrators, less paperwork"). Fewer sessions at once is the part that answers this entry.

- 2026-11-23 15:05 UTC, Step 12 lead: briefed a new doorway at courtyard column 9 after reading the room's rows but not its `//` comment, which reserves columns 1-13 for Step 7 ("place nothing there"). Caught by Step 16's verification before the worker pushed it. Before placing anything in a shared room, read the room file's own comment and `docs/mechanisms/rooms-and-doors.md`, not just the grid.

- 2026-11-24 10:15 UTC, orchestrator `session_017WiGzHhT2apmWHT61rQ65G`: sessions spawned with `blob_limit_kb: 150` carry git's skip-worktree flag on files the clone left on the server, and `git add -A` silently drops edits to them. `docs/decisions-log.md` was hit twice (vehicles builder B, ~03:40, when it was 212 KB; Step 15's lead, 09:58, when it was 78 KB, so being under 150 KB did not protect it: cause not found). Split the file at 6c16b3e; a check before every commit added to `docs/roles/builder-card.md` section 6 at this commit. Not done: finding why a 78 KB file is flagged, and a check for leads (`docs/lead-session.md`).

- 2026-11-24 12:45 UTC, Step 15's second builder `session_017WiGzG4nNVPXPAo2ztGmx3`: a green push (13499e1, content only under the watched `content/**`) never went live: `/healthz` stayed on the previous commit 8246fc5 for about eight minutes and `check:deployed` failed twice. Reverted per the gate (b2f3e99), and that revert went live in about 30 s; the same tree re-pushed (4323a15) went live in about two minutes. So a Railway deploy can be skipped with nothing wrong in the commit; the costs were two extra restarts of the live game and about 15 minutes. Also: `git commit --amend` right after a `git revert -q` that had not made a commit rewrote the push's own commit locally (caught before pushing). Read `git log -2` before an amend.
- 2026-11-24 13:03 UTC, Step 22's seventh builder `session_017WiGzJudo6Zjh95Uh99rkH`: the same thing again, about 20 minutes after Step 15's. A green push (f6a6ee8: one `content/rooms/` file plus scripts and documents) was not live after five minutes (`/healthz` stayed on 137f91b). Reverted (1ade6a2) and the same tree re-pushed (1dcc14c), which went live within about two minutes. Twice in an hour suggests the skip is Railway's and comes back, not a one-off. I also fell into the same `git revert -q` trap noted above (revert takes no `-q`; the `--amend` after it reworded the push's own commit as "Revert"). The rejected push caught it, because `main` had moved. A `git revert` flag check in the pre-push gate, or "never `--amend` a revert", would have saved it.

- 2026-11-25 02:00 UTC, orchestrator `session_017WiGzHY5UZsWTLCH8cLm8M`, at its handoff, its own slips: (1) pushed a documents commit while the owner played and the game restarted under him at 00:57:50 (during a pause push nothing; a documents-only test push at 01:52 with nobody playing did not restart it, so the cause is unmeasured: `docs/mechanisms/deploy.md`); (2) deleted two briefs before their pushes were re-run; (3) read a code commit as a brief edit for half an hour from its subject line (read `git show --stat`). Also: messages to builders mid-turn arrived up to 44 minutes late; `priority: now` for anything urgent.
- 2026-11-25 02:00 UTC, orchestrator `session_017WiGzJYBCYJ85Bj95B7ZLw`: commit 2ea42e3's message claims three edits but carried one; a script failed part-way and the commit ran anyway on the same line. The next commit carries the rest. Chain a commit with `&&` after the edit that feeds it.
