# The current directive

**Standing.** Produced by `docs/orchestrator-role.md`'s Becoming Flow;
read by the orchestrator as part of every Initiating Question. **Replaced
each time the Becoming Flow completes, not accumulated** — the same
discipline `docs/vision.md` and `docs/plan.md` hold themselves to. If
this file is growing instead of being replaced, that's a finding, not a
feature.

---

## Status

*(Orchestrator `session_017WiGzHhT2apmWHT61rQ65G`, 2026-11-24 14:45 UTC, at its handoff, at about 740k tokens. Re-check with `git log --oneline 99a4212..origin/main`.)*

- **The owner has not spoken since about 02:00 UTC** (`docs/answers-outbox.md` carried one entry all tenure, Q-016, answered from his standing words). Everything he said the evening before is built and live, and he was told each in plain words as it landed: hearts that are lost, a hero out, GAME OVER back to the cantina (Step 21, done: 83c0d85 to ef08490; the phone fact fixed c4f3847); enemies beaten for good (322232e); enemies that chase (88a048d); alarms that bring stronger rows from both sides, in the Bandit Camp (4154e15, its door kept clear 4f56b7a, a driven wagon on the fourth call ff0d9ad) and the quarry's depot (f1d1155), not yet in the town; one stage to clear with a victory screen (Step 22: STAGE CLEARED with stars e530fa6, fully on hearts d1ce641, a quiet way b749ec7); weapons one at a time (Step 23's brief done: sword, hammer, spear, bomb, knocked loose, thrown, taken by bad guys, back at game over); one power at a time (acfa789); better buttons (1809a34) and a phone HUD made legible over three passes (closed at 36d070e).
- **Beyond his words, from `docs/vision-gaps.md`:** a second region, the Bramble Forest (Step 15, a lead's: pushes 1 to 4a live, 518e220 to 5779ebc); an enemy who fights from range (Step 24: the thrower on the Hall gallery's balcony 27490b6, reading as a bandit 8a3fafc); the camera leans to show what is aimed at you sideways (ad51322).
- **Two questions wait for him in `docs/questions-inbox.md`**, each with its default built: in a stage, does a game over send you to the stage's entrance (built) or the cantina; may a hero hold one weapon and one power together (built). **For his eye, by playing:** the upright title (its wordmark reads as a cut-out), whether a struck guard should always whistle (the check now takes bell or whistle; `docs/decisions-log.md`), the thrower in the Hall, nine buttons upright.
- **Full re-runs by orchestrator `session_017WiGzHY5UZsWTLCH8cLm8M`, each in a clean detached worktree, diffs not read:** at c4872c3 (15:00 UTC) all green, e2e 139 of 139; at b36d325 (16:00) build, check, gates 6 of 6 green and e2e 139 ok with one red, `plates-friend-held`; at cc2e80b (16:25) the same with one red, `hearts-game-over` (the plate fact green). So the town's rows from both sides (5fbcc15), the armoured guard (178e243), the camp's east half (3c370a7), the undercroft's thrower (ca0ea22) and Step 22's close are covered but for one intermittent red each run; the e2e's reds are briefed (`e2e-intermittent-reds.md`). At 50e5121 (17:05) all green: build, check, gates 6 of 6, e2e 140 of 140, covering Step 15's close (55fd676, c23c3fc) and the biome backgrounds (137bcaa); the tree left clean by a plain e2e (the shots switch, 87bde1d, holds). At b7ed6e9 (17:40): build, check, gates 6 of 6 green, e2e 139 ok and one red, `start-link-back` ("the none screen, world game-DEXG"); the thrown friend's fix (f032a4b, 6a7e935) is covered and its facts green. Five full runs today: two all green, three with one red each, three different facts. At 778ab9d (18:40) all green: build, check, gates 6 of 6, e2e 142 of 142, covering the camera's second push (778ab9d), the suplex's first push (9079d4c), the bolder shot (ce0d56c) and the backgrounds' second pass (a988b63). Six full runs today: three all green, three with one red each. Not re-run: the camp's row at both edges (46cc3e8). Before these, seven all-green full runs by the past orchestrator, the last at 36d070e.
- **Looked at by a subagent, never by the orchestrator, never by playing:** 25 of the night's shots (07:45), the HUD four times ("mostly yes", `docs/plan/step-8.md`), the camera, the thrower and the forest (12:25: the thrower poor, since changed; the forest partly, since changed). **Not looked at since they changed:** `docs/plan/step-24-shots/1b/`, the forest after 5779ebc, the camera's follow-up when it lands.
- **Known faults:** a thrown friend bounces off a crate on the thrower's phone and sails through it on their own, 3 of 60, and 2 of 60 grabs never take (briefed, running); the town's rows from both sides are reverted (9e50cd8) until the fifth town builder re-applies them; the camera bobs on every jump in a tall room and can leave the hero's feet on the bottom edge (follow-up running); the Hall's pedestals do not survive a server restart; `npm run e2e` rewrites shots under `docs/plan/` on every run (briefed, running). A body at a room's very top sits under the party plate: a hero on the forest's canopy upright, the Hall balcony's thrower sideways (two looks, 14:45 and 14:59; sent to the camera's builder, not measured). The camp's east-half rows (push 3) were pushed and reverted twice by their builder inside seven minutes and stand reverted at 6f5279f; deploys work (bf3724b was live at 15:01).

## Sessions

*(14:45 UTC, by orchestrator `session_017WiGzHhT2apmWHT61rQ65G` at its handoff; amended 14:42 UTC by its successor `session_017WiGzHY5UZsWTLCH8cLm8M`, which holds the role now; all report to the session on the Orchestrator line of `docs/questions-for-the-owner.md`. Every spawn: model `claude-opus-5-5`, `blob_limit_kb: 150`.)*
**Running at 18:45 UTC (6 builders, no lead; this paragraph's list is older, read it with these changes: the camera 2 done at 778ab9d and archived, its brief deleted; the camp's rows 3 done at 46cc3e8 and archived (the 2-in-100 door case and a second call that once did not come in 60 s are left, `docs/plan/step-4.md`, "Camp entries, item 3"); the backgrounds are with `session_017WiGzEnVpAqVM456FxYDyg`; the courtyard's bad guy with `session_017WiGzJuWboLaxkDAsBMpaS`; new: the plate `session_017WiGzGh8QFP6waReZYugKf`, `plate-clear-of-bodies.md`, from 18:17):** **the owner's biome backgrounds** `session_017WiGzGQptGtgXJLtKXBbKC` (`biome-backgrounds.md`; first push live at 137bcaa; a follow-up from the look at 16:50: no flat band above a panorama, painted ledges that do not read as platforms, the undercroft underground; review by looking); **the camp's rows 3** `session_017WiGzEXuUQmyxsJn5D4ZKf` (`camp-entries.md`: item 3, the phone shot and e2e fact of a row at both edges; then the 2-in-100 door case); **the camera 2** `session_017WiGzG1qWbjnes8nG1FuzM` (`camera-looks-at-what-matters.md`, from 12:24; also the body-under-the-plate cases; quiet since 15:00: ask it for one line); **the thrower 2** `session_017WiGzJR2qgU7SXbKtxZpYP` (`ranged-enemy-2.md`: the undercroft's thrower live at ca0ea22; push 3 the courtyard, with a bolder shot in flight); **the suplex** `session_017WiGzH2w2rWWN4dt3kpsDB` (`suplex.md`, Step 25, from 16:20); **the e2e's intermittent reds** `session_017WiGzH3PZgYkQHanedEq8e` (`e2e-intermittent-reds.md`, from 16:33; idle between its background baseline runs, which is expected); **the guards' machine** `session_017WiGzExJuPKipKbx51rTeL` (`guard-vehicle-courtyard.md`, Step 20, from 16:56: a trike to steal in the courtyard and a roadblock of crates). Vision Partner `session_017WiGzH2sJsLQebAuQnEFzS` (third; no hourly Drive check is armed, it looks when woken).
**Finished and archived since 14:45:** the camp's rows 2 (the east half, 3c370a7), the town 5 (5fbcc15, 178e243), the e2e's shots (87bde1d, re-run and its brief deleted), the thrown friend (f032a4b, 6a7e935; re-run, its brief deleted), the thrower 2 (ca0ea22, ce0d56c; the courtyard's bad guy handed to `session_017WiGzJuWboLaxkDAsBMpaS` on the same brief, east of the gate), the backgrounds' first builder (137bcaa, a988b63; the third pass with `session_017WiGzEnVpAqVM456FxYDyg` on the same brief), Step 22's lead and builders (closed 52856fc), Step 15's lead and four builders (closed c23c3fc), the second Vision Partner.
**Archived this tenure (26):** beaten, buttons, the chase, the alarms, weapons 1-3, vehicles B, the wave's wagon, props, the town 2-4, the checks builder, hearts 1-2, the phone's display 1-3, the thrower 1, the camp's rows 1, the camera 1, Step 22's first lead. Idle: Step 5's lead `session_017WiGzJfkNbzJfpRVPhWoeK`. Past orchestrators only forward; never archive them.
**Backstops:** the orchestrator's 30-minute check-in (`send_later`, "Irreverents orchestrator check-in", re-armed each time).
**Messages cross:** answers arrived 20 minutes late, twice. A builder that says it waits on you gets the answer again, `priority: now`.
**Reviews run in a detached worktree in your scratchpad** (`git worktree add --detach <scratchpad>/rv origin/main`; `npm ci`, build, check, gates, e2e; `git checkout -- .` after, since e2e rewrites shots), never in the main tree, never two e2e at once, never two `git fetch` at once. **A look brief is reviewed by looking, never by its builder's report:** a subagent (`model: opus`) reads the before and after shots against the claims, fetching blobs with `git show origin/main:<path>` into its own scratch folder (most shots are over 150 KB and not checked out). **A builder stops at 250-300k tokens;** each brief then gets a "Landed so far" line and a fresh spawn (twenty times this tenure).

## Owed next

*(In order, 17:15 UTC, by orchestrator `session_017WiGzHY5UZsWTLCH8cLm8M`.)*
1. Whatever the owner says first. Tell him, in plain words, each thing as it goes live.
2. **Review:** a full re-run covering the thrown friend's fix (f032a4b) and whatever lands next; then delete `thrown-friend-through-a-crate.md`. A subagent looks at the backgrounds' follow-up shots, the courtyard thrower's, the suplex's and the trike's when each lands. Delete each finished brief; archive each finished builder at once.
3. **From `docs/vision-gaps.md` (refreshed at 50e5121; order 1, 9, 15, 6, 7, 12, 13, 11, 3, 4):** running: row 1 (the thrower), 15 (the guards' machine), 6 (the suplex), 7 (the backgrounds). **Unbriefed, next:** row 9, guards and bandits fight in a real room (the rule exists, proven only in `test-clash`); then row 12, a recruit hidden in a secret with a secret only they open (Step 13); row 13, the throne room's cast (Step 6 unclaimed); row 11, a crowd; row 3, the cantina's shortcut doors.
4. **Looks owed a fix, unbriefed:** the armoured guard is drawn with the guard's sheet (his own from P08 row 4, the cast lane) and was never shot; the town's rows were never shot upright; the forest's long limb reads as an earth shelf; the start menu's stage rows with the forest were never shot; the Hall balcony's thrower hidden under the plate sideways and a hero under it on the forest's canopy upright (with the camera's builder, unconfirmed); the undercroft's thrower cropped at the screen's edge in his two pocket shots.
5. **Faults found, not briefed:** the Hall's pedestals do not survive a server restart; Step 1's input queue adds 150-200 ms (`docs/plan/step-5.md`, "Carried here"); the stun-lock case (Step 18 slice B); the depot's hoard seen from the yard (`docs/plan/step-8.md`, "Carried here"); the HUD's small leftovers (`docs/plan/step-8.md`, "Fourth look"); sight bands read as lamplight at phone size (Step 19's look); a placed body has no starting facing (the undercroft's thrower faces east for a fresh world's first tick; `docs/plan/step-24.md`); a narrow body past a thin wall and 2 of 30 grabs drawn late under heavy delay (`docs/plan/step-5.md`, "Thrown friend"); `tools/drive_sync.py` mirrors large sources outside ZIPs (33 MB came in with BKG-02); `check:live` runs no stage fact (`docs/decisions-log.md`).
6. **Step paperwork:** Step 21 (hearts) and Step 23 (weapons; left: the rest of the twelve as data, bad guys taking the hammer and sword) can close (`docs/plan/README.md`, "Closing a step"). Steps 9, 13, 14, 19, 7 and 3 each stay open on one small leftover. `docs/plan.md`'s M3 row reads 5 of 6; `npm run gates` gives 6 of 6. Old briefs never reviewed and still in `handoff-prompts/`: `look3-*.md` (five), `step-17-*.md` (two), `step-5-switch-gap.md`, `step-4-slice-2-alarm.md`, `step-5-hit-lands-at-once.md`, `step-5-e2e-flakes.md`, `owner-enemies-chase-alarms.md`: review by re-running and by looking, then delete.
7. **Process, not done:** a skip-worktree check for leads (`docs/lead-session.md`); move 2026-11-24's entries out of `docs/decisions-log.md` when it nears 150 KB (104 KB at 16:20); a brief that touches `scripts/**` redeploys (a brief said otherwise; `docs/mechanisms/deploy.md` is right).
8. Capacity: the weekly limit read `allowed_warning` all day (resets 2026-11-30 about 13:00 UTC); eight sessions ran at once without the five-hour limit showing. The owner has not answered "full speed" or "throttle".
9. Carried, untouched: shop interiors from P08; the camp's way out under a 10% lower `jumpSpeed`; `docs/mechanisms/cantina.md` l.155; Railway stops reading `railway.json` before 2026-12-01 (`docs/mechanisms/deploy.md`); branch `claude/gallant-keller-1gpm2y` to be deleted (a permission check refused it; the owner has not answered); the Drive changelog entry; eight biome panoramas with no room yet (`docs/plan/step-8.md`, "Biome backgrounds").

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
