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
hand: a lead whose step closes claims the next open one, and the
orchestrator keeps more steps open and written than there are free leads.

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
waits for it. The usage limit is shared with the owner's other projects.
The owner was told "about five leads at once, each with one or two
workers" and then said not to stop; since 04:53 UTC six leads are
running, because the king's first half is small and says most about what
the game is. Hold there until a step closes: at each check-in read
`rate_limit_info` on a running session, and at any warning stop opening
steps and let workers finish what is in flight. If the limit is hit,
everything pauses until about 08:20 UTC and the orchestrator's 08:26 wake
relaunches what stopped.

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

**Status (orchestrator session_017WiGzGp8auJceLEAAh9Aqx, 2026-11-23 15:10 UTC, at its handoff):**
- **Live:** everything from the night, plus Step 8 round 1's look (all nine lanes: real sprites for
  heroes and cast, tiles, backdrops, props, the phone shell, sound), round 2's ground lane (ec49eb5)
  and frame push 1 (2d34418); Step 2's feel round (per-hero arcs, wind-up, impact-scaled freeze,
  floor bounce, the `?tune` panel; 06a07f4); the cantina room and its doorway, with the owner's bell
  ending the brawl (Step 11); the outpost's horn and waves in a test room (Step 12, 1bdd143).
- **Not yet:** round 2's frame (rest), actors, heroes and props lanes are building; no real level or
  enemies through the world yet (Step 16 just opened); nobody has played it end to end on two real
  iPhones; the tunes are unheard.
- **The gap list** is `docs/vision-gaps.md` (first audit 7454fd9; Step 16 added at 43556ba).

**The allowance.** **Owner, 2026-11-23 ~11:30 UTC, to the orchestrator,
first-hand:** "Ignore the usage limits. Use opus instead of fable if
needed. We have quite a bit left before we run out of opus. I just started
a backup orchestrator session running opus. He'll take over if you hit a
usage limit." So the earlier "one worker at a time" rule is gone. The
weekly allowance on the session's own model read `allowed_warning` at
11:32 UTC and resets about 13:00 UTC; work that can run on Opus does.
**Since 12:01 UTC the orchestrator is `session_017WiGzGp8auJceLEAAh9Aqx`** (the backup, on Opus; it took over when this tenure's Fable limit stopped it at 11:58 UTC; pickup entry at the end of `docs/for-the-orchestrator.md`).

**The look is first** (the owner, 11:11 UTC, `docs/plan/step-8.md`): Step
8 runs now and its lanes push as they are ready, even with players in the
world, each fully checked (`docs/decisions-log.md`). For anything else,
too, pushes and redeploys are free until the owner says they are playing
again: *"Don't worry. I'n not playing that shit right now. Redeploy all you
want"* (the owner to Vision Partner, first-hand, ~11:40 UTC; receipt in
`docs/answers-archive.md`). Read `/debug/errors` before any code push (a
deploy empties it). Game feel (movement, hits,
knockback) is second (`docs/answers-archive.md`, "second deadline"), ahead
of new systems.

**Sessions (15:10 UTC; all report to the orchestrator named in `docs/questions-for-the-owner.md`):**
Step 8 round 2 workers (the orchestrator leads Step 8 itself): frame then actors
`session_017WiGzGaGuR297NUCFSpVDU`, heroes `session_017WiGzFWVvNJrmXZ81rABuv`, ground then props
`session_017WiGzHanC1tecHKJbjuyCf`. Step 11 (cantina) lead `session_017WiGzFy3MD6ecvM7QMvQGd`;
Step 12 (outpost) lead `session_017WiGzJTXQVCWQYDDmC2UiY`; Step 16 (first real level) lead
`session_017WiGzHt9iJy3caBLkT1Ef4`, spawned 15:04; each lead runs one reused worker. Step 2's lead
`session_017WiGzGN9egot3JUvSMBBA9` is idle, holding (a) panel polish and (b) the no-numbers check, to
be rung after round 2 lands. Vision Partner `session_017WiGzHC3CvjTNZqCuxa8Ex`'s successor
`session_017WiGzGHxdLq71CDUoQZz9Z`; its hourly Drive check was refused by a permission check, so the
orchestrator runs `python3 -I tools/drive_sync.py` at check-ins. Step 5's lead
`session_017WiGzJfkNbzJfpRVPhWoeK` holds Step 5. Past orchestrators `session_017WiGzFWfLir1ATiSP7c5E5`,
`session_017WiGzJeh7Tuov59d8XYmru`, `session_017WiGzHX8g2sXimNRnqp2oZ` and
`session_017WiGzGp8auJceLEAAh9Aqx` only forward; never archive them.
**Capacity:** about ten sessions at once hit the account's five-hour limit at 12:36 UTC
(`docs/process-observations.md`); its window resets 18:20 UTC. At `allowed_warning`, start nothing new.

**Owner, 2026-11-23 ~14:30 UTC, to Vision Partner, first-hand, after being told what is live (five small rooms, a king, one guard, one shopkeeper, one villain; no enemies, no cantina, no outpost):**
> I haven't seen any levels being built, enemies, the cantina, etc. there is a bunch of stuff I haven't seen yet

*(Vision Partner's reading, not the owner's decision:)* the owner is
noticing breadth missing: more levels, enemies and the cantina, beside the
look. They didn't say to reorder.

**Breadth runs beside the look (orchestrator session_017WiGzGp8auJceLEAAh9Aqx, 14:25 UTC), in answer to
the owner's words above.** `DRAFT:` Step 8's look keeps going (round 2), and
two more leads start now, each running one worker at a time: **Step 11, the
cantina** (an endless brawl, the room where the party changes: enemies to
hit, and a new place) and **Step 12, the outpost and the chase** (hostile
guards who call for help, a new place, a chase through doors). More rooms in
the kingdom (Steps 3, 14 and 15) come after those two show up on the phone.
Why: the owner named exactly these, and the account's limit allows about two
more leads beside the look. At ten sessions at once it stopped everything at
12:36 UTC (`docs/process-observations.md`). To undo: release the two claims.
Q-010 was answered since: the order is the orchestrator's.

**Owed next, in order (15:10 UTC):**
1. Whatever the owner says first.
2. Step 8 round 2: review each lane as it reports (re-run build and check), delete its brief, note it
   in `docs/plan/step-8.md` "Briefs"; when all five land, round 3 = the same capture, review and
   synthesize as round 2 (its workflow is recorded in the handoff entry). When the frame lane lands,
   update `docs/plan/step-5.md`'s "Controls never hide the game". Route the P01 1–5 ratings in
   step-8.md's Round 2 to Vision Partner for the asset desk. Delete branch
   `claude/gallant-keller-1gpm2y` once the heroes lane lands.
3. Ring Step 2's lead to brief (a)+(b) once round 2's lanes have landed (Q-013 goes with it).
4. Refresh `docs/vision-gaps.md` whenever a step closes; open the next uncovered gap as capacity
   frees: Step 13 (a roster you grow by recruiting, gap 12, never drafted), the community swarm
   (gap 11), objects with surprising uses.
5. From before, still owed: Step 3 item (a), two phones by touch through the kingdom (most of Step
   10's tour); the switch gap (two players on one hero; Step 5's network layer; the thrower's
   predicted swing is noted in step-5.md); Step 4 slice 2 push 4; Step 7 (detector, then wiring,
   gate E; CLAUDE.md's "Nothing is persisted" line changes then); Step 6 slice B; Step 9.

## History

*(One line per replaced directive: date, what it chased, where it
landed.)*
