# For the orchestrator

**Standing.** Run per `docs/sop.md`. Written by leads, by builders the
orchestrator briefs directly (their flags, doubts and skipped checks when the
brief names no notes file; `docs/roles/builder-card.md`, section 7), by
auditors, and by an outgoing orchestrator's handoff entry; read at every
check-in and cleared by the orchestrator. Empty between check-ins — apart from the
latest handoff entry — is the healthy steady state; same convention as
`docs/for-the-lead.md`, one level up.

## Why this file exists

The identical reason `docs/for-the-lead.md` exists, one layer higher. A
lead reports to the orchestrator, not the owner directly — but the
orchestrator is not always a session the lead can reach live. A lead
spun up directly (`create_session`, where the environment has it) may
wake, do its work, and finish long before anyone reads its chat; a lead
the owner launched by hand (where it doesn't) has no channel upward at
all except the repo. Anything that exists only in a chat — a flag, a
"worth noting" — is gone once that session goes idle and nobody's
watching. This file is where it goes instead, so it survives to the
orchestrator whenever it next checks in.

## What goes here, and what doesn't

**Write here:** anything you'd otherwise put in a report to the
orchestrator that isn't itself the report — a flag, a finding with no
obvious permanent home yet, or a genuine process/drift finding (an
auditor firing belongs here too, not in a new file of its own). Without
session tools, a lead's whole report goes here too, since there is no
other way upward.

**Don't write here:**

- **A question for the owner**, blocking or not — it goes to
  `docs/questions-inbox.md` (its header says how).
- **A confirmed decision or a new mechanism** — those have permanent
  homes already (`docs/sop.md` phase 6's table, applied at whatever
  altitude the finding sits at).
- **A genuinely blocking question for the orchestrator** — reach it
  directly if it's live; if it isn't, do everything not dependent on the
  answer and leave the dependent part undone, same as any blocking
  question with nobody to ask (`docs/sop.md` phase 4).
- **Routine verification detail** — the commit message's job.

## Format

One entry per item, appended, never edited or deleted by whoever wrote it:

```markdown
### <lead/element name, or "auditor">, <date>

**Flag:** <what was noticed, in plain terms>

**Drift found:** <what was claimed vs. what was actually true, and how
it was checked — for an auditor firing, this is the normal case>
```

Use whichever fit; skip the rest.

**The handoff entry** (`docs/orchestrator-role.md`, "Handing off to a
fresh successor") is the one entry an orchestrator writes here, always
last, and the one the successor reads first:

```markdown
### Handoff, orchestrator <session id>, <date>, at <commit>

**Running:** <each lead/worker: session id, step, what it's doing>
**Armed check-ins:** <each trigger/send_later: id, when, into which session>
**Waiting on the owner:** <questions by title, and where they're filed>
**In flight, not visible from the repo:** <anything else a cold session needs>
```

The successor deletes it once its pickup is complete, after copying
anything still true into its own state.

---

## The orchestrator's obligation

**Read this file at the start of every check-in**, not only when a lead's
report says to. Triage each entry the way `docs/for-the-lead.md`'s own
obligation section describes, one level up: route what has an obvious
home, move a real question for the owner to `docs/questions-inbox.md`
with a recommendation attached, and don't leave anything sitting here
across more than one check-in unread. Read `docs/answers-outbox.md` too,
and act on each entry — flip a status line, route the work, or record
it — since Vision Partner never changes a plan status line itself.

**Before deleting an entry that is about the process rather than the
project** (a handoff gap, conflicting instructions, rework), append it to
`docs/process-observations.md`. This file gets cleared, and that one
keeps the evidence. Reading or writing such an entry is also one of the
checkpoints where "Starting an Industrial Engineer"
(`docs/orchestrator-role.md`) is checked.

**A drift entry is not the same as a flag — treat it as the more urgent
of the two.** A flag says "this might be worth a look." A drift entry
says "something claimed to be true wasn't" — the exact shape of failure
`docs/lead-session.md`'s "failure mode that is yours alone" section
exists to guard against, just caught by a mechanism instead of by luck.
Close it the way you'd close any finding — fix what's wrong, correct
whatever doc made the false claim, and only then delete the entry.

**A finding two leads both hit is yours to fix once,** centrally, and to
propagate to every running lead (`docs/orchestrator-role.md`, "What's
different from being a lead").

## Entries

*(empty at 2026-11-24 03:55 UTC. A rebase by a builder brought back entries cleared at fcdcb23; they are cleared again. If you resolve a conflict in this file, keep the remote side of everything that is not your own entry.)*
