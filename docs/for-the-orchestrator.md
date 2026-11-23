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

- 2026-11-23 20:10 UTC, Step 16 lead, to route (written down by orchestrator session_017WiGzJzo6aZqH4kYxxJsiV, not yet acted on): from the phone walk to the depot (b0a7d5e): a sight mark or bark before a call (Step 4/12; `loop-heist.md` draws sight bands: check it covers this); the camera looking up in tall rooms so a ledge and roof show on a sideways phone (Step 5); a jump cue at the tower climb (Step 8).
- **For the owner's list (Step 14 slice B, glints builder, 2026-11-23):** the first piece glints just over the shop's awning in the street, where the room's `INTENT:` says nothing may point at the roofs' route. Read as not pointing (the awning is a low ledge by the shop, not on the route, which starts at building 2); logged in `docs/decisions-log.md`. The owner may disagree on playing: moving it is one line in `content/completion/castle-town.json`.
- **For Step 1 (network), from the Step 5 hit-prediction builder (session_017WiGzGPRoCXeC3TG8HFyxh), 2026-11-23:** on live, the server runs a page's swing about 18 ticks (300 ms) after the page ran it, with a round trip of about 108 ms. Measured by logging the server's copy of the hero's `c.attack` phase from snapshots: the page pressed at its tick ~679, and the server started the wind-up at server tick 697. The input queue the server works through (one reported input per tick, `is` in `me`) appears to add about 150–200 ms of lag to everything a player does to the world: hits, grabs, presses of plates. Worth measuring and trimming (drain a backlog faster, or drop stale held inputs). `src/net/predict.ts`'s look-ahead (`DRAFT:` in `src/net/client.ts`, at `smoother.ahead`) is tuned to today's lag and would want re-measuring after any change there.

### Step 16 closed, 2026-11-23 21:15 UTC (lead session_017WiGzHt9iJy3caBLkT1Ef4)

Closed and archived (`docs/plan.md` summary, `docs/plan-archive.md` "Step 16"); claim released; briefs deleted. Last review at eb57448 by re-running: `npm run check` green, 66 `step16-*` scenarios, gates 5 of 6, live current, no `src/` in any level commit. Owed by other steps, beside the three notes already recorded (sight mark before a call, camera up in tall rooms, a jump cue at the tower):
- **A slam rule (Step 2 or 18):** a throw or a crash should topple a heavy (doc 08); today a slam wears by speed only (a grappler's throw of `heavy-fighter`, about 217 px/s, is 17 wear against a punch's 34), so it drops to eight punches instead. Data the heavy kinds can opt into.
- **The hoard seen from the yard (Step 8):** `depot-hoard` at [45,13] is out of view until you are inside the strongroom, and moving it broke all three take routes; a glint, a window or a look that shows over the strongroom's front would do.
- **Step 10's beat** (carried to you at 18:45): courtyard doorway → `quarry-road` by touch, the road's fighters and the toll.
- Stale pointers to `docs/plan/step-16.md` remain in code comments (`scripts/e2e.ts:383`, `scripts/e2e/quarry.ts:4,186`) and in `docs/plan/step-18.md:153`: left, to avoid a code redeploy and another step's file; the archive has the text.

- 2026-11-23 21:52 UTC, orchestrator session_017WiGzJzo6aZqH4kYxxJsiV, a doubt, nothing changed: `npm run gates` reads 6 of 6 at f1cdff0 because eight `step19-*` heist scenarios are tagged gate E. `docs/plan/core-loops.md` section 5 says gate E was to pass with `step7-last-stand-camp` ("a real, unscripted event"). Check doc 24's wording of gate E against what Step 19 tagged before reporting M3 as 6 of 6 to the owner as a milestone; if E is the last stand, the tags move when the waves slice lands (ask the waves builder, `session_017WiGzHvGxLQnLUErw7teAo`).
### Rescue builder (Step 13), 2026-11-23

**Flag:** the e2e reconnect fact `h1` (scripts/e2e.ts: the server down 75 s, the desktop page "did NOT come back within 10 s of the server returning") failed in 5 of 7 full `npm run e2e` runs in this session, once on origin/main at c881c17 with none of Step 13's work in it, and passed on the other two (both at Step 13 push 1). Not Step 13's; not diagnosed. Step 13's own notes (the missing `step13-free-while-caught`, the cage moved off Step 19's strongbox): `docs/plan/step-13.md`, "Builder notes".
