# The current directive

**Standing.** Produced by `docs/orchestrator-role.md`'s Becoming Flow;
read by the orchestrator as part of every Initiating Question. **Replaced
each time the Becoming Flow completes, not accumulated** — the same
discipline `docs/vision.md` and `docs/plan.md` hold themselves to. If
this file is growing instead of being replaced, that's a finding, not a
feature.

---

## Why this file exists

The Becoming Flow's own step 3: *"Add this ultraprompt to the appropriate
documentation to designate it as the current guiding directive for all
orchestration. If a fresh orchestrator session spins up, it should see
this, and exactly what has been achieved and what is left, when it asks
the Initiating Question."*

`docs/vision.md` says where Irreverents is going and why.
`docs/plan.md` says the whole roadmap. Neither is meant to answer, in one
place, *"what is the current concrete thing we're all pointed at, right
now, and how far along is it"* — that's what this file is for, and it's
meant to be small enough that a fresh orchestrator reads the whole thing
without skimming.

## What goes here

- **The prioritized list of desired results** the Becoming Flow produced
  (its step 1), as approved or modified by the owner — not re-derived,
  the actual approved list.
- **The current ultraprompt itself** (step 2) — goal, feedback signal,
  stopping condition, and whatever else made it a real ultraprompt
  rather than a vague ask (environment, constraints, budget, escalation),
  quoted in full, not summarized. An ultraprompt with no
  independently-readable feedback signal isn't ready to go here.
- **The owner's own words**, where the directive came from them, quoted
  verbatim with who recorded them and when.
- **A short, current status** — what's been achieved against this
  directive so far and what's left, kept honest by re-checking reality
  (`docs/roles/README.md`'s auditor pattern) rather than trusted from the
  last time it was written. Each status line names the session that
  wrote it and the date; replace the old one rather than stacking them.

## What doesn't

- **The reasoning that produced the directive** — that's the
  Transcendence Flow's own record, wherever it landed per `docs/sop.md`
  phase 6 (`docs/vision.md` via Vision Partner if it was vision-level,
  `docs/plan.md` if it was plan-level).
- **A history of every past directive, kept in full.** When this file is
  replaced, one short line — what the old directive was chasing, and
  where it landed — is enough for "History" below. The detailed account
  belongs to git log and whichever plan/vision doc governs it.
- **Step-level detail.** Point at `docs/plan.md` steps by number; their
  own files (`docs/plan/README.md`) hold the rest.

## Approval states

The directive carries exactly one of these, on its own line under the
heading:

- `**Draft — awaiting the owner's approval.**` A first run's directive
  starts here (`docs/orchestrator-role.md`, "Your first run"). The
  question asking for approval is filed in `docs/questions-inbox.md`.
- `**Approved by the owner, <date>.**` With the quote or the receipt
  line that shows it.
- `**Partly approved.**` When the owner takes items one by one rather
  than as a package: list which are in, and keep the rest as separate
  questions. An item joins the directive only when the owner says yes to
  it.

## Current directive

**Draft — awaiting the owner's approval.** The owner gave the orchestrator
free rein over what to build first ("Orchestrator has free reign.",
2026-11-23, `docs/vision.md` "The measure"), so work runs on this list
tonight; they have not seen the list itself. The approval question is
filed in `docs/questions-inbox.md`.

**The owner's words this comes from** (recorded first-hand by Vision
Partner, 2026-11-23, in `docs/vision.md`):
> I want this game to be playable by the time I wake up in the morning. …
>
> Focus on getting things playable asap. I want as much of the vision in playable form as possible by the time i wake up tomorrow. I want to be playing the game having fun with it with my brother in law tomorrow morning.

**Desired results, in priority order** (each is a plan step; the order is
what to protect if the night runs short):
1. Two people on separate devices are in the same world at the live
   address, moving (Step 1).
2. It is comfortable to open on a phone and to play with a friend: touch
   controls, seeing who is there, getting back in after a dropped
   connection (Step 5).
3. Moving, hitting, grabbing and throwing things and each other feels
   good, and three kinds of character play differently (Step 2).
4. A small kingdom of connected rooms to explore, with hidden routes
   (Step 3).
5. The world reacts: people with three moods, witnesses, calls for help,
   sneaking past or glorious catastrophe (Step 4).
6. The king who never stops talking, and the freedom to ignore him
   (Step 6).
7. A Hall of Legends that remembers something the players really did, and
   a machine to steal and crash through a roadblock (Step 7).

**Goal.** By the owner's morning (they are on US Eastern time; working
deadline 11:00 UTC = 06:00 Eastern, 2026-11-23),
https://irreverents-production.up.railway.app is a game the owner and
their brother-in-law can open on their own iPhones and play together, with
as many of results 2–7 in it as were finished and verified, and nothing in
it half-working.

**Feedback signal.** `docs/measures.md`: M1 (`npm run check:deployed`: the
live address runs what `main` needs), M2 (`npm run check:live`: two scripted players share the
live world), M3 (`npm run gates`: build gates with a passing scripted
check). Each step's own file names its scenarios. None of these says
whether it is fun; that is the owner's, in the morning.

**Stopping condition.** The owner's morning. Before it, in order:
- **From 10:00 UTC, `main` only takes finished, verified work.** Anything
  not done by then is left out behind a `DRAFT:` note or reverted, not
  pushed half-working. A push is the deploy, and the owner may open the
  game at any moment after that.
- **By 10:30 UTC** the orchestrator re-measures M1–M3 on the live address
  and writes the morning report: what is playable, how to play it with a
  second person, what to try, and what is the owner's to judge.
- **From the morning report on, no code push while anyone is in the
  default world**, except a revert or a fix for something broken on live.
  Each code push is about a minute of Railway's "Application not found"
  and a fresh world (measured 04:22 UTC, since the owner's storage volume
  was attached). `/healthz` says how many players are in the default
  world, so look before pushing. Documents push freely: they do not
  redeploy (proven, `docs/mechanisms/deploy.md`).

**Constraints.** The owner's rules in `docs/vision.md` ("What it is not",
"Principles that decide most questions"); `CLAUDE.md`'s tie-breakers and
design principles, iPhone-first above all (D-093); the design library's
labels (a proposal used tonight is in use, not canon: D-096). Art comes
through Vision Partner (`docs/mechanisms/asset-requests.md`); nothing
waits for it. The usage limit is shared with the owner's other projects:
at most about four leads at once, each with one or two workers.

**Escalation.** None to the owner tonight: *"I don't want anything being
bottlenecked by permissions issues or design decisions from me. … Use your
own judgment and document the decisions and reasoning whenever you are
tempted to stop to ask me."* (the owner, 2026-11-23 ~04:11 UTC, to the
orchestrator). A session that would stop to ask decides from the owner's
own words, builds it so the other answer is a small change, marks it
`DRAFT:` and logs it in `docs/decisions-log.md`. Leads ask the
orchestrator when it can answer faster than they can decide. Only what
the owner alone can supply goes to `docs/questions-inbox.md`, and nothing
waits on it.

**Status (orchestrator session_017WiGzFWfLir1ATiSP7c5E5, 2026-11-23 04:12
UTC):** the deploy is proven (a push is live in under a minute). Step 1 is
claimed (lead session_017WiGzEwLs3ng2ZPpRZgctn) and its bare skeleton is
live: a real build, the server, `/healthz`, a WebSocket. No game on screen
yet. Steps 2–8 are written and queued; 2, 3 and 4 open at Step 1's first
gate, 5 and 8 when it closes, 6 and 7 behind the map and the people.
Results 2–7 above map to Steps 5, 2, 3, 4, 6, 7; Step 8 (the look and the
sound, as the ordered art arrives) runs alongside.

## History

*(One line per replaced directive: date, what it chased, where it
landed.)*
