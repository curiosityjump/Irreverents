# The current directive

**Standing.** Produced by `docs/orchestrator-role.md`'s Becoming Flow;
read by the orchestrator as part of every Initiating Question. **Replaced
each time the Becoming Flow completes, not accumulated** — the same
discipline `docs/vision.md` and `docs/plan.md` hold themselves to. If
this file is growing instead of being replaced, that's a finding, not a
feature.

---

## Status

*(Orchestrator `session_017WiGzJzo6aZqH4kYxxJsiV`, 2026-11-24 02:20 UTC, at its handoff, at about 700k tokens. Re-check with `git log --oneline e5f27eb..origin/main`.)*

- **The owner played all evening and said a great deal, first-hand to the orchestrator; his words order everything.** In the order he said them (each is quoted in the step file or brief named):
  - ~23:47 "When an enemy gets knocked out, they collapse, then randomly fly off the screen" (fixed, live, a3a446c) and ~00:05 "The king keeps getting stuck in the wall too" (fixed, live, bb67ec7).
  - ~23:52 and ~00:50 "i seem to be invincible as hero... and enemies collapse but never die"; "Alarms don't seem to do anything yet. Enemies can't be fully defeated, neither can heros, and enemies don't give chase if you are not right in front of them."
  - ~01:05 "Alarms should spawn more enemies of increasing strength that come in from the sides" (`handoff-prompts/owner-enemies-chase-alarms.md`).
  - ~01:20 **"Heros should have hearts which can be lost. Once all heros in the party are out of hearts, that's a game over (back to cantina)"** (`docs/plan/step-21.md`, "Hearts"; `handoff-prompts/hearts.md`).
  - ~00:30 **"Let's get one level where there is a whole outpost you need to navigate though without dying. Lots of enemies, alarms, and real way to lose/die, which pushes you back to the entrance to start over. Needs a satisfying victory screen at the end. Stage cleared, with a star rating and some stats (time to clear, enemies defeated, etc)"** (Step 22, `docs/plan/step-22.md`, a lead's).
  - ~00:10 "Weapons assets uploaded" and ~01:50 "No inventory. Only one weapon at a time. Similar to kirby - cant have multiple powers at once" (Step 23, `docs/plan/step-23.md`).
  - ~00:00 "Title screen asset added to the drive" (live, 2781572); ~00:20 "Can we get better player buttons? ..." (`handoff-prompts/owner-better-buttons.md`); ~01:55 "Guard vehicle assets being uploaded now" (GV-01 mirrored at 93caafb; `handoff-prompts/props-asks-2.md`).
  - ~01:00, process: "Why the hell does every builder download the whole library. Just route them to what is relevant to them!" (done, 5a00fe2: `blob_limit_kb: 150` on every spawn; briefs name library files by path).
- **Three questions asked of him, unanswered, now filed in `docs/questions-inbox.md`; nothing waits** (each built on a `DRAFT:` default): in Step 22's stage does a game over send you to the stage's entrance (his words for the stage; the default built) or to the cantina (his words for hearts)? May a hero hold one weapon and one power together (the default) or one thing in all? Should raw audio stems and unused source packs in the library mirror be listed, not downloaded (334 MB; nothing deleted; `docs/for-the-orchestrator.md`)?
- **All eight core loops of his ~18:30 verdict are built.** Reviewed by the orchestrator's own re-runs (`docs/plan/core-loops.md`, "Reviews by re-running"; diffs not read): hidden places, heists, the caged skirmisher, waves and the Hall (gates 6 of 6 at 1d0cfee, gate E on a Hall capture), the puzzle, power stealing (five pushes), the wagon in its test room. Still building: the wagon reachable in the camp, hearts.
- **Last full re-run: by orchestrator `session_017WiGzHhT2apmWHT61rQ65G` at 96ed191 (10:00 UTC), clean worktree, diffs not read: all green. Build, `npm run check`, gates 6 of 6, `npm run e2e` 133 of 133.** It covers everything live to 96ed191: the thrower on the Hall gallery's balcony (27490b6), the quarry's quiet way and its sign's empty stars (b749ec7, ffc4585), the phone HUD's first round, the brawler's stair. Four all-green full runs this tenure: 6400b44, f434f2e, d2cb96c, 96ed191. Looked at by a subagent, not by the orchestrator: 25 of the night's shots (07:45) and the HUD's 26 before and after pairs (09:05); nobody has looked at the thrower, the quarry's quiet way or the forest.
- **Known faults:** the page that does not come back after a long outage (`h1`/`h2`): cause found at 23:10 UTC (the client kills a connection attempt the browser is still holding), fix not pushed at 02:00 UTC; `cantina-row`, the friend-throw facts, the `start-*` facts and the check `step20-machine` fail some runs on `main` (`handoff-prompts/step-5-e2e-flakes.md`). Powers do not replace (a hero holding one walks through a second orb): given to the weapons builder. The wings stand on the depot's main way and move to [38, 18] (Step 22). The town's on-screen pips (push 2) fail live under delay 4 of 4.

## Sessions

*(09:05 UTC, orchestrator `session_017WiGzHhT2apmWHT61rQ65G`, at about 560k tokens (hand off at 800k); all report to the session on the Orchestrator line of `docs/questions-for-the-owner.md`. Every spawn: model `claude-opus-5-5`, `blob_limit_kb: 150`.)*
**Running (4 builders, 2 leads):** **the camera** `session_017WiGzGHrgYYzH2iGQXcGaG` (`camera-looks-at-what-matters.md`, from 09:16: sideways, keep what is aimed at a hero in the picture; Step 24 slice 1, the thrower on the Hall gallery's balcony, landed at 27490b6 and its builder is archived); **the camp's rows** `session_017WiGzGkuNQcsBDa2oWh23s` (`camp-entries.md`; the brawler's stair out live at 0949f2c; the door rule `doorClear` built, in its gate; then off-screen east entries and a wave's bandit breaking a breakable stall or fence in his way: decided 08:45, `DRAFT:`); **the town 5** `session_017WiGzFsP2hhQR5q7wSEpiB` (`loop-town-tiers.md`, from 08:47: the `tiers` fact takes a call by bell or whistle, then `git revert 9e50cd8` to re-apply the rows, then the armoured guard patch); **the phone's display 2** `session_017WiGzJNmuKNGA2yndGCP34` (`phone-hud-legibility.md`, from 08:57: what the second look found left); **Step 22's lead** `session_017WiGzF7NsB3KTwXkWUXE63` (the quarry fully on hearts d1ce641; then 3b, five heroes); **Step 15's lead** `session_017WiGzHD8gtSGTegd3n8W4G` with builder `session_017WiGzJeF58oqWdt3WEH722` (`step-15-forest.md`: a forest as a second stage, four pushes; guard vehicles as machines a later push of that step). Vision Partner `session_017WiGzGHxdLq71CDUoQZz9Z`.
**Archived this tenure:** beaten, buttons, both chase and alarms builders, weapons 1-3, vehicles B and the wave's wagon, props, the town 2-4, the checks builder, hearts 1-2, the phone's display 1, Step 22's first lead. Idle: Step 5's lead `session_017WiGzJfkNbzJfpRVPhWoeK`. Past orchestrators only forward; never archive them.
**Backstops:** the orchestrator's check-in, re-armed every 30 minutes (`list_triggers`).
**Messages cross:** answers have arrived 20 minutes late. A builder that says it waits on you gets the answer again, `priority: now`.
**Reviews run in `scratchpad/rv`** (a detached worktree: `git checkout --detach origin/main`, `npm ci`, build, check, gates, e2e), never in the main tree, never two e2e at once, and never two `git fetch` at once (one locked the other at 07:30). **A look brief is reviewed by looking:** a subagent reads the before and after shots against the claims (twice tonight; both found what the builder had not).

## Owed next

*(In order, 07:00 UTC.)*
1. Whatever the owner says first. He has been told, in plain words, each thing as it went live (hearts, game over, enemies beaten for good, the chase, alarms from both sides in the camp and the depot, the wagon in the camp, STAGE CLEARED, weapons, the buttons, one power at a time). Two questions wait in `docs/questions-inbox.md` (game over inside the stage: entrance or cantina; one weapon plus one power), each with its default built.
2. Review by re-running each push since 9dbd705; delete each finished brief; archive each finished builder at once; a builder at 300-400k tokens gets a "Landed so far" line and a fresh one.
3. **From `docs/vision-gaps.md` (refreshed 9dbd705), order 2, 1, 9, 15, 6, 7, 12, 13, 11, 3, 4:** row 2, a second region (Step 15, queued, unbuilt: the next step to open, a lead's); row 1 is Step 24 (slice 2: enemies in the castle's empty rooms); row 9, the town's rows (the town 4) and a crowd (row 11, no step); row 15, the wave's wagon (running) then **guard vehicles as machines** (the sprites are cut, group `guard-vehicles`, df67f5d; unbriefed); row 6, a suplex (unbriefed).
4. **Faults found, not briefed:** a thrown friend's own page flies them through a heavy crate, 3 of 60, and 2 of 60 grabs never took (`docs/plan/step-5.md`, "Flakes"); a narrow body reported past a 16 px wall in one jump slips through (the wagon-barrier fix covers bodies a tile wide; `docs/plan/step-20.md`); the Hall's pedestals do not survive a server restart; Step 1's input queue adds 150-200 ms (`docs/plan/step-5.md`, "Carried here"); the stun-lock case (Step 18 slice B); a slam rule for heavies and the depot's hoard seen from the yard (`docs/plan/step-8.md`, "Carried here").
5. **Step paperwork:** Steps 9, 13, 14, 19, 7 and 3 each stay open on one small leftover; the status lines of Steps 21 and 23 in `docs/plan.md` name builders long archived (the step files' "Briefs" and this section are right): fix when either closes. Old briefs never reviewed and still in `handoff-prompts/`: `look3-*.md` (five), `step-17-*.md` (two), `step-5-switch-gap.md`, `step-4-slice-2-alarm.md`, `step-5-hit-lands-at-once.md`: review by re-running and by looking, then delete.
6. Nobody but builders has looked at a screenshot tonight: the title screen, the buttons, hearts on the plate, STAGE CLEARED, a row arriving at both edges, the bomb's burst. A look pass (a subagent reading the shots under `docs/plan/*-shots/` against the owner's words) is owed before telling him any of it looks right.
7. Capacity: the weekly limit read `allowed_warning` all tenure (resets 2026-11-30 about 13:00 UTC); five to eight sessions ran at once without the five-hour limit tripping. The owner has not answered "full speed" or "throttle".
8. Carried, untouched: shop interiors from P08; the camp's way out under a 10% lower `jumpSpeed`; `docs/mechanisms/cantina.md` l.155; Railway stops reading `railway.json` before 2026-12-01 (`docs/mechanisms/deploy.md`); branch `claude/gallant-keller-1gpm2y` to be deleted (a permission check refused it; the owner has not answered); the Drive changelog entry.

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
