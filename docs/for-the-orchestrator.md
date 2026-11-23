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

### Handoff, orchestrator session_017WiGzJeh7Tuov59d8XYmru, 2026-11-23 09:58 UTC, at the commit that adds this entry

**Why now:** my context is about 400k tokens after 90 minutes (each tool
reconnect re-adds the tool list), and the owner's morning is the natural
break. The next orchestrator is the owner's to start.

**Read first: the allowance.** `rate_limit_info` read `allowed_warning`,
type `seven_day_overage_included`, resetting about 13:00 UTC, at 09:40
UTC. Read it (`get_session`, no id) before starting anything. Until it
resets: one worker at a time, only for what the owner asks for or a fault
on live.

**Running:** nothing builds. Idle, large contexts, do not reuse for new
work (start fresh leads from the step files): Step 2 lead
`session_017WiGzGRnRoAeW5Ep5iSycV`, Step 4 lead
`session_017WiGzG4WzuJfHAu3XWoUhc`, Step 6 lead
`session_017WiGzH9B4usC2uz4woP8Sa`, Step 7 lead
`session_017WiGzF4QGboHBQtunwprhk` (never re-pointed to me; I owe it the
correction that it did NOT delete another step's entries, Step 4's lead
withdrew the claim). Step 5 lead `session_017WiGzJfkNbzJfpRVPhWoeK` is
fresh (my child) and holds Step 5 for after the owner has played. Steps 1
and 3 leads are archived. Vision Partner
`session_017WiGzHC3CvjTNZqCuxa8Ex` has the morning report's words. The
first orchestrator `session_017WiGzFWfLir1ATiSP7c5E5` only forwards;
never archive it.

**Armed check-ins:** none of mine. Vision Partner's hourly asset check
(`trig_01B6h7mKw47J36oxJaxWf2NU`) is its own.

**Live (measured 09:55 UTC):** ade2616, players 0, `/debug/errors` empty,
`npm run check:live` ok, `npm run gates` 5 of 6. Rule in force: no code
push while players is above 0; read `/debug/errors` before any code push
(a deploy empties it).

**Waiting on the owner (none blocks):** Q-005, Q-006, Q-008, Q-010 in the
ledger; two inbox entries (Railway "Watch Paths"; a friend holding the
hero you need). Above all: their reactions after playing.

**Owed next, in the order I would take it, after the owner has played:**
1. Whatever the owner says first.
2. Step 3 item (a): two phone-sized pages by touch through the kingdom
   (the two-plate gate, roofs, the secret, the window). Nobody has played
   it. This is most of Step 10's tour; consider doing them as one.
3. The switch gap: two players can become the same hero (the page decides
   the switch without seeing friends' heroes); the owner's rule is one
   person per hero. Fix is in the network layer (Step 5's lead knows it).
4. Step 4 slice 2 pushes 3 and 4 (hiding counts as unseen; knocking out
   the caller as the stealth answer), from the held brief.
5. Step 7: relaunch the detector, then the wiring slice (gate E).
   `CLAUDE.md`'s "Nothing is persisted" line changes then (entry above).
6. Step 6 slice B, Step 8 (the sound pack is in the repo; hero art v2,
   townspeople, tiles and music still in ChatGPT's queue), then 9, 11-15.

**In flight, not visible from the repo:** nothing.

### Step 4 lead, 2026-11-23 10:04 UTC: Step 4 stopped; one line of the handoff above is out of date
- "Owed next" item 4 says Step 4 slice 2 pushes 3 **and** 4. **Push 3
  is done and live** (`f164e0c`, reviewed: a hero standing still in a
  hiding place is not seen; the street and the throne room each have
  one). Only push 4 is left: the blow that knocks someone out being
  noticed by them, someone who finds a knocked-out person calling, and
  the step's `step4-caller-knocked-out` control. Then a real iPhone.
- Gate C and gate D each list a scenario for every one of their signals
  except that one control. Step 4 is **not closed**; its status line
  still names me. I am idle with nothing scheduled and no worker
  running; a fresh lead can take it from `docs/plan/step-4.md`
  ("Handoff notes", the last four entries) and the held brief.
- What a player can do in the castle street, and what to tell the
  owner about being caught: same file, entry of 10:03 UTC.
