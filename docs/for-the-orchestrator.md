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


- 2026-11-23 18:39 UTC, Step 16 lead, to route (orchestrator session_017WiGzHhke4tkAThPgw6EXs wrote this down, not yet acted on): (1) Step 10 has no lead: carry into its file or its next brief the beat "courtyard doorway (cols 17-19) -> quarry-road, crossed by touch (e2e fact quarry-road-cross), meet the road's fighters and the toll". (2) Deferred, not built: the hidden way home from the quarry through the undercroft vault (its door in Step 3's `undercroft.json`, agreed earlier). Step 16's slices 1-3 are live at 36d838d (the depot: a zero-alarm robbery over the roof with the flyer; getting caught opens a fight or an escape); slice 4 (`handoff-prompts/step-16-d-depot-routes.md`: an on-foot quiet route and an escape by pit and cave) is building.

### Handoff, orchestrator `session_017WiGzHhke4tkAThPgw6EXs`, 2026-11-23 19:15 UTC

Picked up 15:50 UTC; handing off at about 795k tokens of context (the card's threshold, raised
today by the owner's "Just keep going i can't be babysitting handoffs all the time"), to a
successor this session starts itself. **Everything in flight is in `docs/current-directive.md`'s
"Status", "Sessions" and "Owed next" (rewritten 19:15 UTC). Read "Owed next" 1a first: the owner's
verdict after playing is that none of the fun loops are playable, and the re-plan from it is the
top priority.**

- **In flight inside this old session** (its results cannot be read from your container): the
  core-loops re-plan workflow. Its last stage commits `docs/plan/core-loops.md`, the step files
  and `handoff-prompts/loop-*.md` to `main` itself and clears the outbox entry; when it reports,
  this session forwards one message to you. Nothing else of this session's is unlanded.
- **Rules changed today, all in the repo:** approved Drive assets first
  (`docs/mechanisms/art-pipeline.md`); a healthy game on an older commit is a queued deploy, wait,
  don't revert (`docs/verifying-and-finishing.md`); review agents stop servers by PID, never
  `pkill` (`docs/mechanisms/orchestrator-workflows.md`); orchestrators run to about 800k and
  start their own successors (the card); the weekly usage limit is at warning until 2026-11-30
  about 13:00 UTC ("Rules in force now").
- **Spawns inherit the caller's model.** The owner switched this session to Fable at ~17:45 UTC,
  so you are probably on Fable: pass `model: "claude-opus-5-5"` for builders.
- **No triggers of this session are left armed.** Arm your own.
- **The Google Drive connector** was available here (create and read; no Docs editing). The
  missing-assets list is Vision Partner's to keep current now.
- **Waiting on the owner (nothing blocks):** the changelog entry; "full speed" or "throttle";
  deleting the stale branch.

