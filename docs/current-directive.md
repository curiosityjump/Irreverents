# The current directive

**Standing.** Produced by `docs/orchestrator-role.md`'s Becoming Flow;
read by the orchestrator as part of every Initiating Question. **Replaced
each time the Becoming Flow completes, not accumulated** — the same
discipline `docs/vision.md` and `docs/plan.md` hold themselves to. If
this file is growing instead of being replaced, that's a finding, not a
feature.

---

## Status

*(Orchestrator `session_017WiGzHhke4tkAThPgw6EXs`, 2026-11-23 18:05 UTC. Re-check with
`git log --oneline 375babf..origin/main`.)*

- **Closed today:** Step 2 (feel, the tuning panel, no number over a hit), Step 11 (the cantina:
  brawl, bell, swap, chase lock), Step 12 (the Bandit Camp: horn, waves, guards following in,
  guards and bandits fighting). Step 3's way-out check is fast again (a700081: build 5 s, check
  35 s).
- **Live:** the owner's three canon heroes from the P03 sheet (1b2c1c6, 891894c); people cut from
  the Drive sheets for the five former rectangles (d80a79d); props, effects and the HUD sheet
  (040bc8f); GO IN at doorways by the Use button (095775b); the start screen and saved games
  (8a54ea4, 884bb80) with crash protection (fdfa6b1, ab25e7a); the quarry joined to the courtyard
  with three enemy kinds and a toll (78c4959, 50c584d).
- **Building:** Step 8 round 3 (five lanes, all re-authoring from approved Drive sheets); Step 17's
  hardening pushes B, D, C; Step 18 slice A (provoked good guys and the villain fight); the switch
  gap (two players as the same hero); Step 16 slice 3 (the depot).
- **The owner's standing rules from today** (`docs/vision.md`): everything uses approved Drive
  assets, with one routed Drive list for what has none; enemies and provoked good guys fight;
  doorways must work by touch; no handoff babysitting.
- `main` at 904c3e9 re-run on a quiet machine: 261 ok, e2e ok.

## Sessions

*(18:05 UTC; all report to the session on the Orchestrator line of `docs/questions-for-the-owner.md`.)*
Step 8 round 3 builders: heroes `session_017WiGzEv3ESfjNHm7u3Tk8v`, cast
`session_017WiGzFHN8SWsy5GnNkweMt`, ground `session_017WiGzHwFkUGGSmDqqnoSDY`, props
`session_017WiGzJxBqVvizcghgHk5NG`, actors `session_017WiGzFsVDWWZc7nVHbv82A`. Step 17 builder
`session_017WiGzGw7XaQ6tZNddFaa8s` (hardening B, D, C). Step 18 builder
`session_017WiGzHwmFZe9AdG3KMHsa4`. Switch-gap builder `session_017WiGzJujVWWDboh12zWhNR` (it also
did doorways by Use). Step 3 builder `session_017WiGzK3hTpzPypD5R9DVit` idle, waiting on the
differential test of its fix. Step 16 lead `session_017WiGzHt9iJy3caBLkT1Ef4` with one builder.
Step 5's lead `session_017WiGzJfkNbzJfpRVPhWoeK` holds Step 5 (idle since the morning). Vision
Partner `session_017WiGzGHxdLq71CDUoQZz9Z`; the orchestrator runs `python3 -I tools/drive_sync.py`
when the owner says there are new assets. Archived today: the round-2 builders, the Step 2 lead and
builder, the Step 11 and Step 12 leads. Past orchestrators `session_017WiGzFWfLir1ATiSP7c5E5`,
`session_017WiGzJeh7Tuov59d8XYmru`, `session_017WiGzHX8g2sXimNRnqp2oZ`,
`session_017WiGzGp8auJceLEAAh9Aqx` only forward; never archive them.

## Owed next

*(In order, 18:05 UTC.)*
1. Whatever the owner says first.
2. **The Drive's missing-assets list** (the owner, ~17:10 UTC): the coverage workflow's output is in
   the orchestrator's scratchpad (`coverage/missing-assets.html`, `asset-coverage.md`). Create the
   `REQ — MISSING-ASSETS — …` Google Doc in Drive folder 01 REQUESTS
   (`1m2vTlbSVoPJg5TwESbcWH4xoCcSOIKCp`), commit `docs/mechanisms/asset-coverage.md`, tell the art
   lanes and Vision Partner. **The changelog entry is not done:** the connected Google account can
   only view the changelog (`17R7aKkqDxQwRk-cmywQbvQ_CcEzz4UqHz37YYYRnADs`) and this chat has no
   Google Docs connector. The owner was asked to grant edit access and turn the connector on, or to
   paste the entry; no answer yet.
3. Step 8 round 3: review each lane's pushes by re-running (looks included), delete each
   `handoff-prompts/look3-*.md` when its lane is done; then round 4 = the same review script
   (`docs/mechanisms/orchestrator-workflows.md`), judging everything against the approved sheets.
4. Step 17: review pushes B, D, C (`handoff-prompts/step-17-saves-hardening.md`); close the step
   when its signal passes with saves safe across builds. Step 18: review slice A; then the heavy-slam
   slice and the fight art (`docs/plan/step-18.md`, "Next, after slice A"). The switch gap:
   review, then close `t-switch-free` as a fact.
5. Step 3's fix: land the differential test's verdict (workflow `wdr9dhnqf`), archive its builder,
   delete `handoff-prompts/step-3-fast-way-out-check.md`. Step 3 item (a) (two phones by touch
   through the kingdom) is still owed.
6. **The throw-a-friend flake** (`t-throw-friend`, `t-grab-friend`: about one e2e run in four; the
   actors builder saw "no throw happened server-side"): brief its own investigation.
7. Shop interiors: the street's shopfronts as real doors into small shops, from P08's building
   sheets (offered to the owner at ~16:55 UTC; no objection). A new step.
8. Before 2026-12-01: Railway stops reading `railway.json`; migrate to `.railway/railway.ts`
   (`docs/mechanisms/deploy.md`, Traps).
9. Branch `claude/gallant-keller-1gpm2y` is to be deleted; the delete was refused by a permission
   check, and the owner was asked at pickup (no answer).
10. Next uncovered gaps (`docs/vision-gaps.md`, refreshed decd5a2): Step 13 (a roster you grow by
    recruiting, never drafted), the community swarm, objects with surprising uses, Step 9 (powers),
    Step 7 (the Hall's detector and wiring; it opens the same store Step 17 opened), Step 6 slice B,
    Step 4 slice 2 push 4.

## Rules in force now

- **Pushes:** free until the owner says they are playing again: *"Don't worry.
  I'n not playing that shit right now. Redeploy all you want"* (the owner to
  Vision Partner, first-hand, ~11:40 UTC; receipt in `docs/answers-archive.md`).
  Before any code push read `/debug/errors` (a deploy empties it) and
  `/healthz`'s `players`. Documents push freely: they do not redeploy
  (`docs/mechanisms/deploy.md`).
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
