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

### Step 7 lead, 2026-11-23 04:55 UTC: `CLAUDE.md` will say something false once the Hall is wired in

`CLAUDE.md`, "Architecture at a glance", says "**State** is the `World` object only. Nothing is persisted". The store (`src/server/store.ts`, 7d101dd) exists and nothing opens it yet, so the line is still true. It becomes false when Step 7's slice 2 wires it into the server (after Step 1's Gate 2). Suggested wording then: "Nothing is persisted except small records in the store (`docs/architecture.md`, 'Lasting records')". Yours to edit; I will say when the wiring lands.

### Handoff, orchestrator `session_017WiGzGp8auJceLEAAh9Aqx`, 2026-11-23 15:15 UTC

Picked up at 12:01 UTC as the owner's backup when the Fable orchestrator stopped on its usage
limit (its 12:05 UTC pickup entry is in git history). Handing off at about 510k tokens of context, by the owner's principle
"I want as much as possible to go into actually building the game" (`docs/vision.md`): a fresh
orchestrator costs far less per turn. **Everything in flight is in `docs/current-directive.md`'s
"Status", "Sessions" and "Owed next" (rewritten 15:10 UTC); read those first, then
`git log --oneline 058772f..origin/main` for what landed after.** After this handoff
commit, at the owner's direction ("Implement the structural changes you recommended
for efficiency"), this session also committed c659b20 (the role cards, two layers,
reused builders) and the fixes from two cold-start checks of it ("Lean structure:
fixes from the cold-start and lost-rule checks").

- **Running:** Step 8 round 2, three reused workers, one per lane pair (ground landed ec49eb5 and
  heroes' first push da8424a). Leads for Step 11 (cantina), Step 12 (outpost) and Step 16 (first
  real level, claimed ace2816). Step 2's lead is idle, holding two small items for after round 2.
  All of them report to the orchestrator in the ledger header. Their parent is this session, so
  until you re-point them (the card's pickup step 3), their messages land here and are forwarded to you unchanged.
- **Armed into this session:** heartbeat `trig_01ADJduhWYtaLBcYBtcyJdiK` at 15:20 UTC. Delete it at
  pickup; arm your own.
- **Re-runnable tools:** `docs/mechanisms/orchestrator-workflows.md` keeps, verbatim, the look-review
  script (round 3 = round 2 re-run once round 2's lanes land) and the vision-gap audit.
- **Waiting on the owner:** nothing blocks. Vision Partner's hourly Drive check needs a permission
  rule for `create_trigger` (it asked the owner). Until then the orchestrator runs
  `python3 -I tools/drive_sync.py` at check-ins.
- **Watch:** the account's five-hour limit (resets 18:20 UTC). About ten sessions at once hit it at
  12:36. Seven are running now.

**Addendum, 15:50 UTC (same handoff; what reached the forwarder before a successor started):**
- Reviewed on main (build and check re-run, green): frame 06180df, props 992647b (it includes the
  looks.ts frame cap raised 64→128, `DRAFT:`, so the 95-frame pixel font is one strip, as the forwarder
  told the props builder), heroes d426771, and the villain ea28af4 (heroes builder, its brief's priority 4).
  Delete `handoff-prompts/look2-{frame,props,heroes}.md` and note them in step-8.md "Briefs".
- Still running: the actors lane (the frame builder's second brief). Round 3 of the look starts when it lands.
- Idle, both briefs done: the heroes builder `session_017WiGzFWVvNJrmXZ81rABuv` and the ground/props builder
  `session_017WiGzHanC1tecHKJbjuyCf`. Reuse them for round 3 or archive them. The frame lane's flag about
  `outside` was stale: the ground data already had it (ec49eb5), and it was checked on live.
- Step 16's lead started slice 1 (the quarry's six rooms and secrets), hard stop 16:45 UTC. It adds Step 3's
  agreed doorways: the courtyard `to-quarry` at columns 17–19, and the undercroft's hidden `to-quarry-cave`.
- Branch `claude/gallant-keller-1gpm2y` (the alternative heroes) can be deleted; round 2 kept main's set.
