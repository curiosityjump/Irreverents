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

### Step 15's third builder, 2026-11-24 (for Step 10's lead)

**Flag:** the walk to the forest is a beat Step 10 can use. From the courtyard, the forest's doorway (columns 8-10 of the floor, left of the quarry's) leads up into `forest-road` and on to `forest-trail`, a second stage (`bramble-forest`) with its own hearts, game over at its entrance and stars. A phone does it by touch alone (`npm run e2e`, facts `forest-in`, `forest-road-cross`; `scripts/e2e/forest.ts`). Shots of the road, the trail and its three secrets at 844x390, 750x340 and 390x664 are in `docs/plan/step-15-shots/`.

### Handoff, orchestrator `session_017WiGzHY5UZsWTLCH8cLm8M`, 2026-11-25 02:00 UTC

Picked up 14:32 UTC on the 24th from `session_017WiGzHhT2apmWHT61rQ65G`; handing off at about 730k tokens (it rose faster than counted after a container restart at 00:40) to a successor this session starts itself. **Everything in flight is in `docs/current-directive.md`'s "Status", "Sessions", "Owed next" and "Rules in force now" (all rewritten at this handoff). Read "Rules in force now" first: the owner played from about 00:35 to 01:50 UTC with pushes paused, and pushes reopened at 01:52 in slots.**

**Running:** six builders, each with held work and a push slot, in "Sessions". The first, the escalating guard response `session_017WiGzJpUjDMF6E6joLnxqr`, holds d8f7988 only in its container until it pushes: do not archive it before that commit is on `main`; then spawn a fresh builder on the same brief for pushes 2 and 3 (the owner's ask by name).
**Armed check-ins:** this session's `send_later` "Irreverents orchestrator check-in" (the newest in `list_triggers`, bound to `session_017WiGzHY5UZsWTLCH8cLm8M`, due 02:07 UTC) may fire here once; it is only forwarded. Arm your own, every 30 minutes while six sessions run; never call `list_triggers` without need (it returns the whole account's, about 20k tokens) and never `list_events` with kind `result`.
**Waiting on the owner (nothing blocks):** Q-014, Q-015, Q-017, Q-018, Q-019 with Vision Partner; what he found playing tonight; "full speed" or "throttle"; Railway's "Watch Paths" if documents now redeploy.
**In flight, not visible from the repo:** no subagent, no workflow, no uncommitted file of this session's. Its review worktree and the looks' image copies were in its scratchpad: make your own. Vision Partner was told at 00:59 to push nothing: tell it pushes are open. The builders were told their slots by message at 01:55; a message can arrive late, so read the log before assuming a slot was kept.
**Slips of mine to know about:** I pushed a documents commit while the owner played and the game restarted under him (00:57:50): during a pause push NOTHING. I deleted two briefs before their pushes were re-run. I misread a code commit as a brief edit for half an hour (1ef40fb): read `git show --stat`, not the subject line.
**What worked:** a subagent looking at shots blind, given no caption, for every look push; drafting agents for briefs that need the code read (the suplex, the trike, the recruit, guards meet bad guys); slots for pushes after a pause; deciding a builder's question the same turn with the owner's words quoted and a `DRAFT:`.
