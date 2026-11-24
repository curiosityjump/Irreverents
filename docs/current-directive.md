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
- **Last full re-run: by orchestrator `session_017WiGzHhT2apmWHT61rQ65G` at the code of 327d9e9 (02:35 UTC): build, check, gates 6 of 6 and e2e all green, diffs not read.** It covers the sword (69c12b4), the shield of Step 21 push 3 (cf3e6b3) and the reconnect fix (327d9e9). Live since and not yet re-run: the chase (88a048d), hearts push 2 (774d888: three falls and a hero is out, five for the grappler and brawler; nothing drawn), the camp's breakables (586cfcf).
- **Known faults:** the page that does not come back after a long outage (`h1`/`h2`): cause found at 23:10 UTC (the client kills a connection attempt the browser is still holding), fix not pushed at 02:00 UTC; `cantina-row`, the friend-throw facts, the `start-*` facts and the check `step20-machine` fail some runs on `main` (`handoff-prompts/step-5-e2e-flakes.md`). Powers do not replace (a hero holding one walks through a second orb): given to the weapons builder. The wings stand on the depot's main way and move to [38, 18] (Step 22). The town's on-screen pips (push 2) fail live under delay 4 of 4.

## Sessions

*(03:20 UTC, orchestrator `session_017WiGzHhT2apmWHT61rQ65G`; all report to the session on the Orchestrator line of `docs/questions-for-the-owner.md`. Every spawn: model `claude-opus-5-5`, `blob_limit_kb: 150`.)*
**Running:** hearts `session_017WiGzG7mhviEaxroo5GvBv` (`handoff-prompts/hearts.md`; push 2 live at 774d888: three falls and a hero is out, five for the grappler and brawler, nothing drawn; push 3 the game over, then drawing); **Step 22's lead** `session_017WiGzFrf7N7ZgaqUyjs4Sz` with builder `session_017WiGzJb4az7buiHeYEH77B` (`step-22-stage.md`; push 3a live at d529a1b: the far end clears the stage, up to three stars; then the depot's waves from the sides); **alarms in the camp** `session_017WiGzHgbh9PtsdzXnTDvqz` (started 03:09 UTC on `owner-enemies-chase-alarms.md`'s "Landed so far": switch the both-sides rows on in the Bandit Camp, seven scenarios to re-time, three with the hearts builder); **the wagon's check** `session_017WiGzJ2rqEpKFJmGDriwjQ` (`step-20-machine-check-fails.md`, from 03:07 UTC; about 200k of context then); **buttons** `session_017WiGzJ23ionY6B1PB5Nmme` (`owner-better-buttons.md`); **vehicles B** `session_017WiGzGehKBFBBGaoRu2awP` (`loop-vehicles-b.md` push 2 in its gate; about 320k of context: a fresh builder for push 3); **the town's tiers** `session_017WiGzHTLU6WYfsfoEFK4si` (`loop-town-tiers.md` push 2 in its gate; about 400k: a fresh builder after it, who also takes the town's rows from the sides). Vision Partner `session_017WiGzGHxdLq71CDUoQZz9Z`.
**Finished, to review by re-running, then delete the brief and archive:** props `session_017WiGzHr5CCwAod6mkVF139` (`props-asks-2.md` all done: 7635af0, 586cfcf, afea13a, df67f5d, de9c98a hearts' pictures; nothing draws the guard vehicles); beaten `session_017WiGzEhbdYJQcUhtD2bSLL` (Part 2 of `owner-knocked-out-flies-off.md`: 322232e, 7b30a89); the chase `session_017WiGzF31gfYgeWNMA7rnEL` (stopped at its context limit; cbcf273, 88a048d, 8ac4812); weapons `session_017WiGzF7puSFWh2BBeii8WZ` (`weapons-pick-up-and-swing.md`: 69c12b4, 8b2fee3, fae2b34 the hammer and spear; it stops there: a fresh builder for the power-replace fix, a held weapon going back at game over, swords multiplying from a returned carrier, the rest of the twelve). Idle: Step 5's lead `session_017WiGzJfkNbzJfpRVPhWoeK`. Past orchestrators only forward; never archive them.
**Backstops:** the orchestrator's check-in `trig_01GgAtjuqW57vfuQPwGVWJcv` (03:45 UTC, re-armed every 30 minutes); Step 22's lead holds its own.
**A fault under investigation (03:15 UTC):** `npm run e2e`'s `plates-stone` (the second page's infiltrator no longer gets down to the stone plate under the castle) passed at 327d9e9 and failed at 5e9e6cb and at 8b2fee3; a subagent of the orchestrator is finding the commit. The 8b2fee3 run was spoiled by the orchestrator merging in its tree mid-run: no full green run exists past 327d9e9.

## Owed next

*(In order, 02:20 UTC.)*
1. Whatever the owner says first; tell him in plain words as each of his reports goes live (hearts on screen, game over, enemies beaten for good, the chase, alarms from the sides, the wagon reachable, the victory screen, weapons).
2. Review by re-running everything since fba6980; delete `loop-risk.md` once cf3e6b3 is in a green run (hearts supersedes it); each finished brief; archive each finished builder at once.
3. **Briefs owed:** guard vehicles as machines (Step 20's kind: later, stronger rows of the town's alarm, hijackable; after the wagon is reachable); Step 5's leftovers (the grab's lift predicted, `interpDelayMs` 66; `handoff-prompts/step-5-hit-lands-at-once.md`); the depot's hoard seen from the yard and a slam rule for heavies (Step 16's close); an `armoured-guard` sprite (cast lane); a phone fact that takes the wings by touch; the stun-lock case (the skirmisher 7.6 s without control in the camp, Step 18 slice B); the Hall's lasting store for the shared world; the rest of the twelve weapons as data once Step 23's four work.
3a. **Faults found by the flakes builder, not briefed** (`docs/plan/step-5.md`, "Builder notes > Flakes", f0389d8): a tap on a walking cantina regular misses 19 of 40 (standing 0 of 40; the server tests the tap where it has the regular, the page draws it about 100 ms behind; Step 11); a thrown friend's own page flies them through a heavy crate 3 of 60 (its local world holds only itself), and 2 of 60 grabs never took (cause not found).
3b. **From the town-tiers and vehicles builders' flags (03:40 UTC), not briefed:** a guard standing just inside a street door locks it: a hero walking back in is pushed into the door and carried out again, 20 s and more in 4 runs, until the alert cools (bodies pushing apart at walk doors; reads as a broken door on a phone; `docs/plan/step-4.md`, "Push 2, re-land"). After ringing the bell himself a guard who sees a blow may go back to the bell instead of whistling: left as it is, a design call. The wagon's barrier that the server steps over is `handoff-prompts/step-20-machine-check-fails.md`, being fixed.
4. **Step paperwork:** Steps 9, 13, 14, 19, 7 and 3 each stay open on one small leftover (their status lines say which); close each as it is done (`docs/plan/README.md`, "Closing a step"). `docs/vision-gaps.md`'s status column was refreshed at 4db8f89 and is behind again (hearts, the stage, weapons, the chase): refresh when the stage's victory screen lands. Old briefs never reviewed and still in `handoff-prompts/`: `look3-*.md` (five), `step-17-*.md` (two), `step-5-switch-gap.md`, `step-4-slice-2-alarm.md`, `step-5-hit-lands-at-once.md`: review by re-running and by looking, then delete.
5. Capacity: the weekly limit read `allowed_warning` all tenure (resets 2026-11-30 about 13:00 UTC); ten to fourteen sessions ran at once without the five-hour limit tripping. The owner has not answered "full speed" or "throttle".
6. Carried from before, untouched: shop interiors from P08; the camp's way out under a 10% lower `jumpSpeed`; `docs/mechanisms/cantina.md` l.155; Railway stops reading `railway.json` before 2026-12-01 (`docs/mechanisms/deploy.md`); branch `claude/gallant-keller-1gpm2y` to be deleted (a permission check refused it; the owner has not answered); the Drive changelog entry.

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
