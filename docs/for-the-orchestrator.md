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

### Handoff, orchestrator session_017WiGzFWfLir1ATiSP7c5E5, 2026-11-23 08:35 UTC, at the commit that adds this entry

**Read this before anything else: there is one allowance and it has to last.**
Every session was stopped at about 04:58 UTC by the account's shared
five-hour usage limit and nothing ran until 08:26 UTC
(`docs/process-observations.md`, last entry). The window that opened at
08:20 UTC is the only allowance until 13:20 UTC: the month's extra-usage
limit is spent. The owner is on US Eastern time, asleep since about 04:40
UTC, and will wake inside this window. Nobody can read how much is left;
the warning comes about a minute before the stop. The last window was
emptied in about 100 minutes by: this orchestrator's own turns (683k of
context re-read on every tool call), five orchestrator workflows, and
sixteen build sessions at once. So, as the successor:
- **Stay small.** Run no workflows and no subagent fan-outs. Read what
  this entry names, not the whole repository. Hand off again on context
  size.
- **Four leads, one worker each, and hold the rest.** Resumed by me at
  08:30 UTC, in priority order: Step 1 (Gate 2), Step 3, Step 2, Step 6.
  Held: Step 4, Step 7. Open nothing new unless one of the four stops.
- **Aim to be quiet by about 11:00 UTC** with a verified build live and
  allowance left for the owner's morning (their talk with Vision Partner,
  a fix if the first real iPhone shows a fault).

**What is live and what is not (measured 08:27 UTC).** Live runs 4a13056,
up since 04:57:35, storage mounted. It is still the page from Step 1's
first gate: one character, keyboard only, no touch, no second player on
screen, starting in the grey test hall. **Step 1's second gate (Gate 2)
did not land** and is the whole morning: until it does, nothing built
tonight can be played on a phone. On `main` and passing `npm run check`
at 04:55 (53 scenarios): the simulation core; three heroes, one shared
party, switching; bodies nobody plays, crates and dummies; the first part
of hit, grab and throw with the effects contract; a throne room and a
castle street joined by doors that carry anyone; a shopkeeper, a guard
and a villain with three moods (in a test room only); the Hall's store
on the owner's volume and how a record looks on its pedestal. None of
this is visible on the live page except by keyboard in the test hall.

**Running (all are my children; re-point them to you, pickup step 2):**
- Step 1 lead `session_017WiGzEwLs3ng2ZPpRZgctn`; its Gate 2 worker is
  named in `docs/plan/step-1.md` (handoff notes) and briefed in
  `handoff-prompts/step-1-gate-2-together.md`. **First priority.** Told
  to land it in pieces: two players seeing each other move on the real
  page with touch first, then rejoin, then the rest.
- Step 3 lead `session_017WiGzGUAnvQfWco5vTcMX4`; slice A worker
  `session_017WiGzFewfghZxs2P5YqJss` (second push: start in the throne
  room, the way-out check, door drawing), slice B worker
  `session_017WiGzHCNJSCum98mk1tFku` (the other three rooms, plates and
  gate, breakable wall and the window for Step 6, hiding place, the
  secret). Told: slice A's second push first, one worker at a time.
- Step 2 lead `session_017WiGzGRnRoAeW5Ep5iSycV`; "the hit" worker
  `session_017WiGzHbbov1AymyWrXuvge`, "the body" worker
  `session_017WiGzEqGVmbgjJyorj73iV` (its work looked landed). Told: the
  hit only; no tuning panel or extras until Gate 2 is live.
- Step 6 lead `session_017WiGzH9B4usC2uz4woP8Sa`; slice A worker
  `session_017WiGzFDAdFWLNWSBgGNoEU` (the king, his speech, throwable and
  still talking). Told: land slice A, then hold.
- **Held** Step 4 lead `session_017WiGzG4WzuJfHAu3XWoUhc` (slice 1 done
  and reviewed; slice 2 worker `session_017WiGzHFR7FTJpj44ENRzvm` was
  mid-flight; slice 3, the people into the castle street, briefed and
  held). When you release it: **slice 3 first**, so the owner sees people.
- **Held** Step 7 lead `session_017WiGzF4QGboHBQtunwprhk` (store and
  pedestal landed and reviewed; detector worker
  `session_017WiGzJNvq96pjtVZnaRP9N` mid-flight; second worker
  `session_017WiGzFwud41UiryQTtHH52`).
- Vision Partner `session_017WiGzHC3CvjTNZqCuxa8Ex` (also the asset
  coordinator, with an hourly self-wake that will have failed during the
  stop). ChatGPT kept working: `python3 -I tools/drive_sync.py --check`
  shows what art and sound has landed since 04:22 UTC.
Each lead decides whether its stopped worker continues or is relaunched
fresh against the same pushed brief (`docs/spawn-failures.md`, "Docs carry
state, sessions don't").

**Armed check-ins:** none. I deleted my 09:50 and 10:30 UTC wakes; arm
your own. A check-in about every thirty minutes is enough.

**Next moves, in order, as each thing lands:**
1. When Gate 2's first piece is live: re-run it yourself (two headless
   browsers, one phone-sized by touch, against the live address in a
   private `?room=`), then write the first morning report (below).
2. The start room must become the throne room (Step 3 slice A's second
   push) and the server must fill a room with its people and things when
   a player enters (Step 1); without both, the king and the townspeople
   exist only in tests. Step 4's lead flagged this at 04:58.
3. "Use" (buy, take, ring the bell) has never been pressed on a
   phone-sized page; Step 1's Gate 2 brief carries it (dcfa465).
4. Steps 5 (phone comfort), 8 (art and sound) and 10 (the first ten
   minutes, played end to end) open when Step 1 closes. With the budget
   as it is, prefer giving Step 10's tour and Step 5's essentials to the
   lead that frees up first over spawning new leads; art that has
   arrived can be wired by one worker.
5. Steps 9, 11, 12, 14, 15 are written and queued (11, 12, 14, 15 are
   unreviewed drafts: their status lines say so). They are for after the
   essentials, probably after the owner has played.

**The morning report** (`docs/current-directive.md`, "Stopping
condition") is yours: by about 10:45 UTC, and again when what is playable
changes. Say plainly that the night lost three and a half hours to the
usage limit and what that cost. Tell the owner how two people start
(the address, phones sideways or upright, the buttons), what to try, what
is theirs to judge (each step file's taste list), what did not make it,
and that no real iPhone has been tried. Vision Partner should have the
same words: the owner talks to it first. After the report, no code push
while `/healthz` shows anyone in the default world (once Gate 2 adds the
count).

**Waiting on the owner (none blocks):** in the ledger
(`docs/questions-for-the-owner.md`): Q-005, Q-006, Q-008, Q-010 and
whatever Vision Partner has made of the two inbox entries (the Railway
"Watch Paths" setting; the build order). Four permissions I listed for
the owner at 04:12 UTC were never explicitly answered; they then said not
to be a bottleneck on permissions and to keep going
(`docs/decisions-log.md` records each assumption, the successor spawn
included).

**In flight, not visible from the repo:**
- I told all six leads the lean rule at 08:30 UTC and that a new
  orchestrator would message them. The ledger header still names me
  until you change it.
- Step 7's lead cleared `docs/for-the-lead.md`'s Entries and with them
  another step's unread entries (6fe5d2b; recovered by Step 4's lead). I
  told all leads: delete only your own step's entries.
- Two agents' work is thrown away: the draft of Step 13 and the reviews
  of Steps 11, 12, 14, 15 were stopped by the limit.
- The freeze times in `docs/current-directive.md` (10:00 and 10:30 UTC)
  were set before the stop. Its rule that matters now is the last one: no
  code push while anyone is playing. Update that file's status; it is
  yours.
- I will answer your questions and forward anything that reaches me, and
  do nothing else (`docs/orchestrator-role.md`, "After your own handoff
  commit, you are only a forwarder").

