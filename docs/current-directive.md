# The current directive

**Standing.** Produced by `docs/orchestrator-role.md`'s Becoming Flow;
read by the orchestrator as part of every Initiating Question. **Replaced
each time the Becoming Flow completes, not accumulated** — the same
discipline `docs/vision.md` and `docs/plan.md` hold themselves to. If
this file is growing instead of being replaced, that's a finding, not a
feature.

---

## Status

*(Orchestrator `session_017WiGzJYBCYJ85Bj95B7ZLw`, 2026-11-25 04:20 UTC, at about 340k tokens; picked up 02:00 from `session_017WiGzHY5UZsWTLCH8cLm8M` at 5a31b6f. Re-check with `git log --oneline 7dec29d..origin/main`.)*

- **Every push held through the owner's pause is live** (live commit 8f5827d at 04:17, nobody playing): the escalating guard response push 1 (e940b12: five levels in the castle street, a guard on the trike at 4, two armoured at 5 and on a timer, relief); guards meet bad guys pushes 1-2 (955d496); the phone legibility pass, four pushes (561c505); the hidden recruit 2 (ca27ab3: touch frees her 10 of 10, freeing mid-alarm); the camp's horn spared by its own side and two e2e fixes (8e2807d); the trike 2b (8f5827d; `ramLift` only at `ramSpeed` or faster). The owner was told each in plain words. **He has not spoken since "Resume the work" (~01:50) and has not said what he found playing.**
- **Amended 06:35: four full runs now, the table is in `docs/plan/step-5.md` (last section): the latest, at cf10923, 183 ok and no red on its repeat; `beaten-gone`, `clash-street`, `suplex-again` are intermittent. The escalating response is complete as briefed (push 3 live at 7929998, not re-run, not looked at); left by it: way-out scenarios at level 5 for the other heroes, the undercroft's report and the courtyard's trike row (all three want one primitive: a scenario field that starts an area's alert at a level, `src/scenarios/run.ts`), and the door ping-pong (a door grace in the fight or door systems). Its builder `ERchSa9` goes on to one small push: heroes drawn above a crowd.** Earlier text: Full re-runs by this orchestrator, clean detached worktree, diffs not read: two. At 561c505: build, check, gates 6 of 6 green; e2e 176 ok, one red `row-both-sides` (fixed after, by 371879d). At 8f5827d: build, check, gates green; e2e still running at 04:17 with 151 ok and one red so far, `suplex-again`, which now names its cause: **after Grab the hero holds `throne-crate-1`, not the king** (the crate beside him is taken first), so Use says nothing. Result file: this orchestrator's scratchpad `result2.txt`; read the notification.
- **One blind look, by a subagent, of all six pushes' shots: `docs/plan/step-8.md`, last section.** Short: crowd fights collapse into piles where the hero is lost (escalation levels 4-5, worst upright; four or five armoured-looking guards counted at level 5, not two; the trike cut off); the clash shots show no fight; the faded plate still reads badly sideways; mirror ghosts on the castle street's top upright, a translucent box in the quarry planks shots; the hauler's stand-in name "Graybox Hauler", a salmon square for her face, still drawn caged after joining; the trike hidden under its rider, no witness reaction drawn. Only the escalation's findings are with a builder.
- **Known faults, besides the look's:** the camp's lookout is felled by his own camp's fight so no second call comes (ruled `DRAFT:` like the horn: only a hero's doing fells him; not built: `handoff-prompts/e2e-intermittent-reds.md`, "Landed so far", c48aee0); `suplex-again` (above); `step20-camp` red once in a full check; `struck-own` red in 2 full runs; thrown weapons set `lastHit` so a bad thrower's shot makes a guard answer (untested); the Hall's pedestals do not survive a server restart; `tools/drive_sync.py` mirrors large sources outside ZIPs.
- **Two documents pushes within half a minute restart the live game** (twice now: 00:57:50 under the owner, 02:03:43 with nobody playing; `docs/mechanisms/deploy.md`, last section). One documents commit per push; none while anyone plays.

## Sessions

*(04:20 UTC on 2026-11-25, by orchestrator `session_017WiGzJYBCYJ85Bj95B7ZLw`. All report to the session on the Orchestrator line of `docs/questions-for-the-owner.md`. Every spawn: model `claude-opus-5-5`, `blob_limit_kb: 150`.)*
**Amended 07:35: NO builder is running.** Escalation 3 `ERchSa9` archived at 18bf07b: push 3 live (7929998); the level-5 count is as intended (at most 4 armoured); the draw-order change is NOT pushed (its fact had no working control; patch and notes in `docs/plan/step-4-patches/` and step-4.md). A second blind look is at the end of `docs/plan/step-4.md`. A fourth full re-run, at 18bf07b, started 07:22 in this orchestrator's scratchpad (`result4.txt`). The escalating response as the owner named it is complete as briefed; everything else is held for capacity. Earlier amendments follow. **Amended 04:55:** escalation 2 `EyaoW1` archived after push 2 (a4f9885: the alarm is the whole castle town's; Landed so far ba9939a; not re-run). **Running now:** the escalating guard response 3 `session_017WiGzERchSa9FuWR3KYcZL` (spawned 04:45: first the level-5 count, then push 3, the ending). `docs/vision-gaps.md`'s status column refreshed at ba9939a. Earlier text of this line: the escalating guard response 2 `session_017WiGzEyaoW1jEkkGR6iQZ7` (`escalating-guard-response.md`, pushes 2 and 3: the other castle-town rooms, the ending; spawned 02:07; push 2 committed locally at 03:41, re-timing scenarios after a rebase at 04:17; it was also sent the look's escalation findings and asked to report on the level-5 guard count). Vision Partner `session_017WiGzH2sJsLQebAuQnEFzS` (third; Q-014, Q-015, Q-017, Q-018, Q-019 open; told pushes are open).
**Archived this tenure (6):** escalation 1 `JpUjDM`, guards-meet-bandits `Jr21An`, legibility `EjRmD6`, hidden recruit 2 `G1qWeH`, camp/reds 2 `FFLrDf`, trike 2 `FDp4UL`. Idle: Step 5's lead `session_017WiGzJfkNbzJfpRVPhWoeK`. Past orchestrators only forward; never archive them.
**Held for capacity (the weekly limit is at warning; only the owner's named asks get a new builder until he says "full speed"):** guards meet bad guys push 3, the courtyard gate (`guards-meet-bandits.md` has Landed so far); the lookout ruling and the reds (`e2e-intermittent-reds.md`); every fault of the look in `docs/plan/step-8.md`; the predecessor's unbriefed list (a fourth backgrounds pass is done by the legibility pass; the camp shot's right edge).
**Backstop:** this orchestrator's `send_later` "Irreverents orchestrator check-in", every 30 minutes. A permission check refuses `delete_trigger`: tell the owner, do not route around it.
**How pushes go now:** no slots. A builder pushes when green unless a CODE commit landed on main in the previous 3 minutes; then it rebases once, re-checks, pushes. Slots made builders wait 30-45 minutes each on 2026-11-25.
**Reviews run in a detached worktree in your scratchpad** (`git worktree add --detach <scratchpad>/rv origin/main`; `npm ci`, build, check, gates, e2e, about 45 minutes in the background; `git checkout -- .` after), never in the main tree, never two e2e at once. **A look brief is reviewed by looking:** one subagent (`model: opus`) fetches shots with `git show origin/main:<path>` and describes each before reading its claim. **A builder stops at 250-300k tokens;** its brief then gets "Landed so far" and a fresh spawn.

## Owed next

*(In order, 04:20 UTC on 2026-11-25, by orchestrator `session_017WiGzJYBCYJ85Bj95B7ZLw`.)*
1. Whatever the owner says first. He has not said what he found playing (00:35 to 01:50 UTC), nor "full speed" or "throttle".
2. **The escalating response's pushes 2 and 3** as they land: tell the owner in plain words; re-run; a look at its new shots; a fresh builder on the same brief if this one reaches its budget before the ending (the owner asked for this by name).
3. **Read the second re-run's end** (8f5827d). Then delete, each only if its facts were green in that run: `phone-legibility-pass.md`, `guard-vehicle-courtyard.md`, `hidden-recruit.md`; one line each under its step file's "Briefs". `e2e-intermittent-reds.md`, `guards-meet-bandits.md` and `escalating-guard-response.md` stay (work left).
4. **When capacity allows, in this order** (`DRAFT:` the orchestrator's ranking, from the look and the vision's "OHHHHH" of impact needing to be seen): (a) crowd readability: the hero findable in a pile, both ways up; (b) the hauler's shown name, face and the cage drawn after she joins; (c) `suplex-again`'s real fault: Grab takes the crate beside the king; (d) the lookout ruling; (e) guards meet bad guys at the courtyard gate, and clash shots that show a fight; (f) the castle street's mirrored top upright and the quarry planks' translucent box; (g) the trike's stars, its arrow, a witness reaction drawn.
5. **`docs/vision-gaps.md`'s status column** was last refreshed at 50e5121 (17:00 UTC on the 24th); rows 6, 7, 9, 12, 15 moved since: refresh it. Unbriefed rows: 13 (the throne room's cast, Step 6 unclaimed), 11 (a crowd), 3 (the cantina's shortcut doors), 1's rest, the rest of the twelve weapons (Step 23).
6. **Faults found, not briefed (carried):** the Hall's pedestals and a server restart; Step 1's input queue adds 150-200 ms; the stun-lock case (Step 18 slice B); a placed body has no starting facing; a narrow body past a thin wall; `check:live` runs no stage fact and reaches only alarm level 2; a body blocking a one-tile way is not audited.
7. **Step paperwork (carried):** Steps 9, 13, 14, 19, 7, 3, 20, 24, 25 and 4 are open with leftovers named in their files; Step 23 open, unclaimed. Old briefs never reviewed, still in `handoff-prompts/`: `look3-*.md` (five), `step-17-*.md` (two), `step-5-switch-gap.md`, `step-4-slice-2-alarm.md`, `step-5-hit-lands-at-once.md`, `step-5-e2e-flakes.md`, `owner-enemies-chase-alarms.md`, `camp-entries.md`, `suplex.md`, `biome-backgrounds.md`.
8. Carried, untouched: shop interiors from P08; `docs/mechanisms/cantina.md` l.155; branch `claude/gallant-keller-1gpm2y` to be deleted (a permission check refused it); the Drive changelog entry; eight biome panoramas with no room yet.

## Rules in force now

- **Pushes are OPEN** since about 01:52 UTC on 2026-11-25 (the owner, first-hand: "Resume the work"). No slots ("Sessions", "How pushes go now"). Before any code push read `/debug/errors` and `/healthz`'s `players`. The three entries below are the record of the pause.
- **The documents-redeploy test, 01:52:42 to 01:58 UTC:** 12fcbec, a documents-only push (this file alone) with nobody playing, did NOT restart the game in 5.3 minutes (`startedAt` stayed 00:57:50). So documents do not always redeploy, and the 00:57:50 restart is unexplained: its two commits, 24 s apart, deleted `docs/plan/step-21.md`, moved 500 lines into `docs/plan-archive.md`, and edited `docs/plan.md` and `docs/questions-for-the-owner.md`. Unmeasured leads: a deleted file; two pushes within seconds; a large diff. **Rule until someone measures it: while the owner plays, push nothing at all; otherwise documents push as before, but never delete or move a file in a documents push while anyone is playing (`/healthz` `players`).** `docs/mechanisms/deploy.md` has not been updated with this.
- **ALL pushes stopped from 00:59 UTC on 2026-11-25, documents included, until the owner says he is done playing.** At 00:57:50 UTC the live game restarted on 24b5888 while he was playing: the only commits since the pause were documents (09a5d3b at 00:54:30, the orchestrator's, closing Step 21: `docs/plan.md`, `docs/plan-archive.md`, `docs/plan/step-21.md` deleted; 24b5888 at 00:54:54, Vision Partner's, `docs/questions-for-the-owner.md`), neither on `railway.json`'s `watchPatterns`. So a documents push CAN redeploy: `docs/mechanisms/deploy.md`'s trap (Railway may stop reading `watchPatterns` for existing services about 2026-12-01) may have begun early; not confirmed (the 00:23 documents push did not restart it; a brief-only commit was the live commit at 14:37 on the 24th). The owner was told at once that it was ours. **Owed when he is done:** one documents-only push with nobody playing, watching `/healthz`'s `startedAt`, to settle it; if every push now redeploys, the fix is the service's "Watch Paths" setting in Railway (the owner's, a minute), and until then documents are pushed in batches, never while he plays. This line was written locally at 01:25 and pushed only when pushes reopened.
- **Pushes: PAUSED from 00:32 UTC on 2026-11-25. The owner, ~00:25 UTC, first-hand to the orchestrator:** "Have everyone push whatever they can now then pause pushes. About to play and don't want interruption". No push that redeploys (anything outside `docs/` and `handoff-prompts/`: `src`, `content`, `scripts`, `tools`, package files) until the owner says he is done; builders keep building and committing locally and stack their pushes; documents push freely (they do not redeploy, `docs/mechanisms/deploy.md`). Every builder was told at 00:25 with `priority: now`; messages have arrived up to 44 minutes late today, so the orchestrator watches `origin/main` for a code push and `/healthz`'s `startedAt`, and tells the owner if one lands. **When he says he is done:** message each builder "pushes are open", one at a time a few minutes apart so their deploys do not replace each other. Before that rule: pushes were free (*"Don't worry. I'n not playing that shit right now. Redeploy all you want"*, the owner, 2026-11-23 ~11:40 UTC). Before any code push read `/debug/errors` (a deploy empties it) and `/healthz`'s `players`.
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
