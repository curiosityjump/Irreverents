# The current directive

**Standing.** Produced by `docs/orchestrator-role.md`'s Becoming Flow;
read by the orchestrator as part of every Initiating Question. **Replaced
each time the Becoming Flow completes, not accumulated** — the same
discipline `docs/vision.md` and `docs/plan.md` hold themselves to. If
this file is growing instead of being replaced, that's a finding, not a
feature.

---

## Status

*(Orchestrator `session_017WiGzHhke4tkAThPgw6EXs`, 2026-11-23 19:15 UTC, at its handoff.
Re-check with `git log --oneline 9f36db3..origin/main`.)*

- **THE OWNER'S VERDICT AFTER PLAYING, ~18:30 UTC, orders everything** (`docs/vision.md` "The
  measure"): *"I want to play it as I described it. There are no heists or stealth yet, no
  puzzles, no hidden places to explore, no characters to unlock, no escalating combats or chases,
  no power/item stealing, no vehicle hijacking, no risk."* A re-plan workflow is writing
  `docs/plan/core-loops.md`, step files and `handoff-prompts/loop-*.md` briefs and commits them
  itself; its notice arrives at the old orchestrator, which forwards it.
- **Closed today:** Steps 2, 11, 12. Step 3's check is fast again and verified (a700081).
- **Live:** the owner's canon heroes, townspeople, enemies, props, effects, HUD faces, the tavern
  and quarry ground, all cut from the approved Drive sheets (Step 8 round 3, five lanes done);
  GO IN at doorways; two players can no longer be the same hero (18f7c48); the start screen and
  saved games, hardened in four pushes (A fdfa6b1, B baa651b, C d5e9596, D 6d737a6); provoked
  guards and shopkeepers swing (1458d57); the quarry with enemies, a toll and a guarded depot with
  a hoard (36d838d); a cosmetic predicted hit star (851eda9).
- **Building:** hit prediction, Step 14 slice A (level entrances), Step 18 push 2 (the villain
  hits back), Step 16 slice 4 (the depot's quiet route and escape).
- **The Drive's missing-assets list is filed** (35 items):
  https://docs.google.com/document/d/1d94gDFA54-xtJJsDMhvo6Y8YJizC_TbDRfMyLkRCtCQ/edit ; the map is
  `docs/mechanisms/asset-coverage.md`.
- `main` at 904c3e9 was re-run on a quiet machine (261 ok, e2e ok); nothing after it has been
  re-run by an orchestrator.

## Sessions

*(19:20 UTC, orchestrator `session_017WiGzJzo6aZqH4kYxxJsiV` at pickup; all report to the session on the Orchestrator line of `docs/questions-for-the-owner.md`.)*
Started 19:14 UTC: core-loop art cut-outs builder `session_017WiGzEN1QbSnHzXNqV4XSt` (`handoff-prompts/loop-art-cutouts.md`). Backstop `trig_011biZA4hCVneba273QGoi6c` (19:46 UTC, into the orchestrator: has the re-plan landed?).
Running: hit-prediction builder `session_017WiGzGPRoCXeC3TG8HFyxh`
(`handoff-prompts/step-5-hit-lands-at-once.md`); Step 14 slice A builder
`session_017WiGzFeeJgj8z2SUAFyu5J`; Step 18 builder `session_017WiGzHwmFZe9AdG3KMHsa4` (about 350k
tokens: its next slice wants a fresh builder); Step 16 lead `session_017WiGzHt9iJy3caBLkT1Ef4`
with one builder on slice 4. Idle: the switch-gap and doorways builder
`session_017WiGzJujVWWDboh12zWhNR` (done; reusable for client work if under 400k); Step 5's lead
`session_017WiGzJfkNbzJfpRVPhWoeK` (idle since the morning). Vision Partner
`session_017WiGzGHxdLq71CDUoQZz9Z` (keeps the Drive list from here). Archived today: every Step 8
builder of rounds 2 and 3, the Step 2, 11 and 12 leads and their builders, the Step 3 and Step 17
builders. Past orchestrators `session_017WiGzFWfLir1ATiSP7c5E5`,
`session_017WiGzJeh7Tuov59d8XYmru`, `session_017WiGzHX8g2sXimNRnqp2oZ`,
`session_017WiGzGp8auJceLEAAh9Aqx`, `session_017WiGzHhke4tkAThPgw6EXs` only forward; never archive
them.

## Owed next

*(In order, 19:15 UTC.)*
1. Whatever the owner says first.
1a. Brief the core-loop playables in `docs/plan/core-loops.md`'s order: spawn a builder per brief in `handoff-prompts/loop-*.md` (model `claude-opus-5-5`), claim each step.
1b. **The core loops** (the owner's verdict): when `docs/plan/core-loops.md` and
   `handoff-prompts/loop-*.md` are on `main` (the re-plan's own commit; if it has not landed by
   about 19:45 UTC, ask the previous orchestrator by message, then write the plan yourself from
   `docs/answers-outbox.md`'s entry and the library), spawn one builder per brief plus one for
   `handoff-prompts/loop-art-cutouts.md`, each with `model: "claude-opus-5-5"`, claim each step,
   and tell the owner in plain words what each first playable is and where to find it.
2. Review by re-running: Step 17's pushes B, C, D (then close Step 17); Step 18 pushes 1 and 2;
   the switch gap (18f7c48; delete its brief); Step 8 round 3's five lanes for green, then their
   looks against the approved sheets (delete each `handoff-prompts/look3-*.md`); hit prediction and
   Step 14 slice A as they report.
3. **The owner is waiting on two answers they have not given:** the Drive changelog entry for the
   missing-assets list (the connected account can only view the changelog; the entry text was
   given to them at 19:10 UTC), and "full speed" or "throttle" for the weekly usage limit.
4. An e2e fact failed once in two full runs at 19:20 UTC (not captured; the Step 18 builder saw the Step 11 cantina facts flake twice): fold into the flake investigation. The throw-a-friend flake (`t-throw-friend`, `t-grab-friend`: 3 runs in 14, "no throw happened
   server-side"): brief its own investigation.
5. Shop interiors from P08's building sheets (offered to the owner ~16:55 UTC, no objection).
6. The Bandit Camp traps heroes if `jumpSpeed` is tuned 10% lower (`docs/plan/step-3.md`, last
   note); Step 16 lead's two routing notes (`docs/for-the-orchestrator.md`); Step 18's later
   slices (heavies topple to a throw; fight art); `docs/mechanisms/cantina.md` l.155 still says
   the cantina's theme is 'town' (it is 'cantina' since ae6147e).
7. Before 2026-12-01: Railway stops reading `railway.json` (`docs/mechanisms/deploy.md`, Traps).
8. Branch `claude/gallant-keller-1gpm2y` is to be deleted; a permission check refused it and the
   owner has not answered.

## Rules in force now

- **Pushes:** free until the owner says they are playing again: *"Don't worry.
  I'n not playing that shit right now. Redeploy all you want"* (the owner to
  Vision Partner, first-hand, ~11:40 UTC; receipt in `docs/answers-archive.md`).
  Before any code push read `/debug/errors` (a deploy empties it) and
  `/healthz`'s `players`. Documents push freely: they do not redeploy
  (`docs/mechanisms/deploy.md`).
- **The weekly limit is at warning** (seen 18:21 UTC on every session: `rateLimitType` `seven_day`, `allowed_warning`, resets 2026-11-30 about 13:00 UTC). The owner was told and asked how hard to push; until they answer: the owner's named priorities go ahead, review workflows stay small, finished sessions are archived at once, and new builders are spawned with `model: "claude-opus-5-5"` (the orchestrator's own session was switched to Fable by the owner at ~17:45 UTC, and a spawn inherits the caller's model).
- **Capacity:** the account's five-hour limit is shared with the owner's other
  projects. With about fourteen Irreverents sessions working it reached
  `allowed_warning` at 18:02 UTC, eighteen minutes before its 18:20 reset
  (the last window started 13:20). At `allowed_warning` on any session's
  `external_metadata.rate_limit_info`, start nothing new and let in-flight
  work finish; after a reset, `get_session` each builder and send "carry on"
  to any the limit stopped.
- **Deploys:** bursts of code pushes replace each other's Railway builds; a
  healthy game on an older commit is a queued deploy, not a failure
  (`docs/verifying-and-finishing.md`, "The pre-push gate").

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

**Owner, 2026-11-23 ~18:30 UTC, to Vision Partner, first-hand, after playing the live game on a phone** (`docs/vision.md`, "The measure"):
> Remember the original intentions for the game and make sure things align with it. I want to play it as I described it.
> There are no heists or stealth yet, no puzzles, no hidden places to explore, no characters to unlock, no escalating combats or chases, no power/item stealing,  no vehicle hijacking, no risk. Virtually everything described in the vision docs that would make the game genuinely fun to play is yet to be seen at all

*(Added 2026-11-23 19:40 UTC by the core-loops re-plan.)* The order of work is now `docs/plan/core-loops.md`'s ranking.

**Owner, 2026-11-23 ~15:00 UTC, to Vision Partner, first-hand, answering Q-010 [is this the right build order?]:**
> Just build according to the vision in the way that gets it playable according to the vision as soon as possible.

*(Vision Partner's reading:)* the order below is the orchestrator's to
change freely; the measure is the vision playable soonest (see
`docs/vision.md` "Principles": build-first and find-the-gaps).

**Approved by the owner, 2026-11-23,** in the form quoted above (Q-010): the
order is the orchestrator's, and the measure is the vision playable soonest.
**How the order is kept honest (the owner, ~14:50 UTC: "You are capable of
looking at the game, looking at the vision, seeing the gaps, and closing
them"):** `docs/vision-gaps.md` is the ranked list of gaps between the live
game and the vision (first audit 7454fd9). The orchestrator refreshes its
status column whenever a plan step closes or a round lands, and opens steps
from its top rows. The owner should never be the one who finds an omission.

**The owner's words this comes from** (recorded first-hand by Vision
Partner, 2026-11-23, in `docs/vision.md`):
> I want this game to be playable by the time I wake up in the morning. …
>
> Focus on getting things playable asap. I want as much of the vision in playable form as possible by the time i wake up tomorrow. I want to be playing the game having fun with it with my brother in law tomorrow morning.

**Owner, 2026-11-23 ~04:38 UTC, to the orchestrator, first-hand, on going
to sleep:**
> Going to sleep now. Realize as much of the vision as possible. Don't stop until you have realized as much as you can.

So the list below does not end at seven, and nobody waits with time in
hand: a builder or lead whose work closes takes the next, and the
orchestrator keeps more steps written than there are free hands.

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
8. The whole first ten minutes, played end to end by two scripted
   players on the live game, so the pieces are known to fit (Step 10).
9. Then the rest of the confirmed vision, as far as the night reaches:
   the cantina and its endless brawl (Step 11), powers you pick up and
   can lose (Step 9), the villain's outpost and a chase that follows you
   through doors (Step 12), heroes you find and keep (Step 13), things
   to find and an explored percentage (Step 14), a second place worth
   coming back to (Step 15). Steps 11–15 are being written from the
   library now.

**Feedback signal.** `docs/measures.md`: M1 (`npm run check:deployed`: the
live address runs what `main` needs), M2 (`npm run check:live`: two scripted players share the
live world), M3 (`npm run gates`: build gates with a passing scripted
check). Each step's own file names its scenarios. None of these says
whether it is fun; that is the owner's, in the morning.

**Constraints.** The owner's rules in `docs/vision.md` ("What it is not",
"Principles that decide most questions"); `CLAUDE.md`'s tie-breakers and
design principles, iPhone-first above all (D-093); the design library's
labels (a proposal in use is not canon: D-096). Art comes through Vision
Partner (`docs/mechanisms/asset-requests.md`); nothing waits for it.
Pushes and capacity: "Rules in force now", above.

**Escalation.** None to the owner: *"I don't want anything being
bottlenecked by permissions issues or design decisions from me. … Use your
own judgment and document the decisions and reasoning whenever you are
tempted to stop to ask me."* (the owner, 2026-11-23 ~04:11 UTC, to the
orchestrator). A session that would stop to ask decides from the owner's
own words, builds it so the other answer is a small change, marks it
`DRAFT:` and logs it in `docs/decisions-log.md`. Leads ask the
orchestrator when it can answer faster than they can decide. Only what
the owner alone can supply goes to `docs/questions-inbox.md`, and nothing
waits on it.

**The look is first** (the owner, 11:11 UTC, `docs/plan/step-8.md`): Step
8 runs now and its lanes push as they are ready, each fully checked
(`docs/decisions-log.md`). Game feel (movement, hits, knockback) is second
(`docs/answers-archive.md`, "second deadline"), ahead of new systems.

**Owner, 2026-11-23 ~14:30 UTC, to Vision Partner, first-hand, after being told what is live (five small rooms, a king, one guard, one shopkeeper, one villain; no enemies, no cantina, no outpost):**
> I haven't seen any levels being built, enemies, the cantina, etc. there is a bunch of stuff I haven't seen yet

*(Vision Partner's reading, not the owner's decision:)* the owner is
noticing breadth missing: more levels, enemies and the cantina, beside the
look. They didn't say to reorder.

**Breadth runs beside the look (orchestrator session_017WiGzGp8auJceLEAAh9Aqx, 14:25 UTC), in answer to
the owner's words above.** `DRAFT:` Step 8's look keeps going (round 2), and
two more leads start now, each running one reused worker: **Step 11, the
cantina** (an endless brawl, the room where the party changes: enemies to
hit, and a new place) and **Step 12, the outpost and the chase** (hostile
guards who call for help, a new place, a chase through doors). More rooms in
the kingdom (Steps 3, 14 and 15) come after those two show up on the phone.
Why: the owner named exactly these, and the account's limit allows about two
more leads beside the look. At ten sessions at once it stopped everything at
12:36 UTC (`docs/process-observations.md`). To undo: release the two claims.
Q-010 was answered since: the order is the orchestrator's.

## History

*(One line per replaced directive: date, what it chased, where it
landed.)*

- 2026-11-23 03:23–11:00 UTC: "playable by the time I wake up": the live game
  playable by the owner and their brother-in-law on iPhones by 11:00 UTC, with
  `main` taking only finished work from 10:00 and no code push while anyone was
  in the default world after the morning report. Landed: Step 1 closed 08:55
  UTC (two players share the live world); the owner's ~11:40 "Redeploy all you
  want" ended the push rules, and Q-010 (~15:00) replaced the goal.
- 2026-11-23 ~11:30 UTC, the owner: *"Ignore the usage limits. Use opus instead
  of fable if needed. We have quite a bit left before we run out of opus. I just
  started a backup orchestrator session running opus. He'll take over if you hit
  a usage limit."* It ended the night's "one worker at a time" rule and moved
  work to Opus; the backup took over at 12:01 UTC. The `allowed_warning` rule
  under "Rules in force now" came after ten sessions at once stopped everything
  at 12:36 UTC.
