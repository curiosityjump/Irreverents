# For the orchestrator

**Standing.** Run per `docs/sop.md`. Written by leads (and anything an
auditor finds, and an outgoing orchestrator's handoff entry), read and
cleared by the orchestrator. Empty between check-ins — apart from the
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

## Entries

*(Empty. Append below.)*

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

### Step 7 lead, 2026-11-23 04:55 UTC: `CLAUDE.md` will say something false once the Hall is wired in

`CLAUDE.md`, "Architecture at a glance", says "**State** is the `World` object only. Nothing is persisted". The store (`src/server/store.ts`, 7d101dd) exists and nothing opens it yet, so the line is still true. It becomes false when Step 7's slice 2 wires it into the server (after Step 1's Gate 2). Suggested wording then: "Nothing is persisted except small records in the store (`docs/architecture.md`, 'Lasting records')". Yours to edit; I will say when the wiring lands.

### Live state for the backup orchestrator `session_017WiGzGp8auJceLEAAh9Aqx`, from orchestrator `session_017WiGzHX8g2sXimNRnqp2oZ`, 2026-11-23 11:50 UTC (not a handoff: I am running)

**You are on standby.** The owner started you to take over if I hit a
usage limit. Until then make no commits, spawn nothing, re-point nobody
and push nothing: two orchestrators acting at once is the collision this
system warns about. Read, stay small, answer the owner.

**How to tell I have stopped:** `get_session` on `session_017WiGzHX8g2sXimNRnqp2oZ` shows a usage or
rate limit stop, or the owner tells you. A quiet stretch is not a stop:
lanes run for an hour. Before taking over, send me one message; if I
answer, I am alive.

**If you take over, this is what is in flight** (all of it is in the
repo; nothing depends on my memory):
- **Step 8, the look, round 1** (`docs/plan/step-8.md`, "The look"; the
  contract `docs/mechanisms/art-pipeline.md`). Nine lanes, one brief each,
  `handoff-prompts/look-<lane>.md`. Seven are worker sessions (cast, tiles,
  props, world, actors, shell, sound), tagged `irreverents`, children of
  my session; each pushes itself to `main` and reports to me. Two
  (foundation, heroes) are agents on my machine, which dies with me: if
  `src/client/draw/looks.ts` is not on `main`, launch
  `work handoff-prompts/look-foundation.md`; if
  `content/sprites/grappler.json` is not, launch
  `work handoff-prompts/look-heroes.md` (canonical spawn call,
  `docs/lead-session.md`). Re-point the seven sessions to yourself.
- **After the lanes land:** read every lane's notes file (named in its
  brief) and file each item where it belongs; index the new mechanism
  docs; delete the briefs. Then round 2: take screenshots of the real
  game at iPhone size, upright and sideways, in every map room; put them
  beside the owner's references; have a fresh reviewer list the largest
  gaps; brief fixes; repeat until a reviewer finds none it would call
  large. The owner: "don't stop working on it until it looks similar to
  that", and "It should play well in portrait too".
- **Game feel is next** (the owner to Vision Partner: "looks, sounds, and
  feels as good as kirby and the amazing mirror"): Step 2 is to be
  reopened for it; see `docs/plan.md` for whether I got that far.
- **If sessions stopped on the usage limit,** it resets about 13:00 UTC:
  wake each with one message a couple of minutes after.
- Waiting on the owner (none blocks): the ledger's Open list and the two
  older inbox entries. Past orchestrators and I only forward once handed
  off; never archive us.

### Pickup, orchestrator `session_017WiGzGp8auJceLEAAh9Aqx`, 2026-11-23 12:05 UTC (from the backup role)

The previous orchestrator `session_017WiGzHX8g2sXimNRnqp2oZ` (Fable) stopped at 11:58 UTC:
its last turn ended "You've hit your monthly spend limit · your Fable limit resets 1pm
(UTC)", `rate_limit_info` rejected. That is the stop the entry above names, so this
session took over under that entry's in-flight list. The previous orchestrator only
forwards from now on; never archive it.

- **Step 8 lanes on Fable** (cast, tiles, props, world, actors, sound) stopped or are
  stopping on the same limit; shell finished (ac6509b), actors pushed 8934a58. They are
  woken, one message each, a couple of minutes after the 13:00 UTC reset, to continue
  their own briefs and report here. Nobody else relaunches those lanes.
- **Foundation and heroes** died with the previous orchestrator's machine (no
  `src/client/draw/looks.ts` or `content/sprites/grappler.json` on `main` at 12:01 UTC):
  relaunched now as worker sessions on Opus from their briefs.
- **Step 2 (feel)**: lead `session_017WiGzGN9egot3JUvSMBBA9` (Opus) and its two workers
  continue; re-pointed here. Opus's five-hour allowance reads `allowed_warning`, resetting
  13:20 UTC, so nothing else is opened before then.


### Handoff, orchestrator `session_017WiGzGp8auJceLEAAh9Aqx`, 2026-11-23 15:15 UTC

Picked up at 12:01 UTC as the owner's backup when the Fable orchestrator stopped on its usage
limit (entry above). Handing off at about 510k tokens of context, by the owner's principle
"I want as much as possible to go into actually building the game" (`docs/vision.md`): a fresh
orchestrator costs far less per turn. **Everything in flight is in `docs/current-directive.md`'s
"Status", "Sessions" and "Owed next" (rewritten 15:10 UTC); read those first.**

- **Running:** Step 8 round 2, three reused workers, one per lane pair (ground landed ec49eb5 and
  heroes' first push da8424a). Leads for Step 11 (cantina), Step 12 (outpost) and Step 16 (first
  real level, claimed ace2816). Step 2's lead is idle, holding two small items for after round 2.
  All of them report to the orchestrator in the ledger header. Their parent is this session, so
  until you re-point them (pickup step 2), their messages land here and are forwarded to you unchanged.
- **Armed into this session:** heartbeat `trig_01ADJduhWYtaLBcYBtcyJdiK` at 15:20 UTC. Delete it at
  pickup; arm your own.
- **Re-runnable tools:** `docs/mechanisms/orchestrator-workflows.md` keeps, verbatim, the look-review
  script (round 3 = round 2 re-run once round 2's lanes land) and the vision-gap audit.
- **Waiting on the owner:** nothing blocks. Vision Partner's hourly Drive check needs a permission
  rule for `create_trigger` (it asked the owner). Until then the orchestrator runs
  `python3 -I tools/drive_sync.py` at check-ins.
- **Watch:** the account's five-hour limit (resets 18:20 UTC). About ten sessions at once hit it at
  12:36. Seven are running now.
