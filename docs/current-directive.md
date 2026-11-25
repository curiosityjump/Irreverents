# The current directive

**Standing.** Produced by `docs/orchestrator-role.md`'s Becoming Flow;
read by the orchestrator as part of every Initiating Question. **Replaced
each time the Becoming Flow completes, not accumulated** — the same
discipline `docs/vision.md` and `docs/plan.md` hold themselves to. If
this file is growing instead of being replaced, that's a finding, not a
feature.

---

## Status

*(Orchestrator `session_017WiGzHY5UZsWTLCH8cLm8M`, 2026-11-25 02:00 UTC, at its handoff, at about 730k tokens. Re-check with `git log --oneline 12fcbec..origin/main`.)*

- **The owner spoke four times this tenure, first-hand to the orchestrator, and each is acted on:** (1) 24th ~14:50: new biome backgrounds in the Drive: behind nine rooms after three passes (137bcaa, a988b63, 6755d3f; a fourth, small, held locally by the legibility builder). (2) ~19:30, from playing: "My little guy died and then i got stuck in the quarry. There are platforms you can jump up through, but not back down through, which can close paths. Not a bad thing l, just needs accounted for. The menu in the too left corner didn't seem to be working either": the menu offers "Back to the entrance" in a stage and "Back to the cantina" elsewhere (70b2361), the button is a solid dark square 8 px clear of the plate (9af30c4), `npm run check` plays a way-out check for every roster hero with and without powers (a1f6101, 9af30c4); no room trapped a hero in the quarry by its shape, so what held him is not found (Q-017, Q-018 with Vision Partner); never tried on a real iPhone. (3) 25th ~00:10: "I want the escalating guard response implemented now": push 1 (five levels in the castle street, a guard on the trike at 4, two armoured at 5 and on a timer, the stronger relieve the weaker) built and green at d8f7988 in its builder's container, being pushed as this is written; the other town rooms and the ending are NOT built (pushes 2 and 3 of `escalating-guard-response.md`, a fresh builder owed). (4) ~00:25: "Have everyone push whatever they can now then pause pushes. About to play and don't want interruption", then ~01:50: "Resume the work": see "Rules in force now". **A documents push by the orchestrator restarted the game under him at 00:57:50; he was told at once.**
- **Also live since 14:45 on the 24th:** the suplex (Step 25: carry a body, Use says SUPLEX; five pushes, reads as a throw over the head, head-first "nearly"; waits on the grappler's frames, requested); a guards' trike to steal in the courtyard with a roadblock (186b8da) and witnesses (c849f6f); a hidden recruit, the hauler, caged in the quarry's cave, and a stone under the castle only she lifts (ce3f8bf, 09708bd; a touch hold frees her 10 of 10 from the cage's middle); an armoured guard with his own look (3d4ff70); the town's rows from both sides (5fbcc15) and the camp's east half (3c370a7); a thrower in the undercroft (ca0ea22) and a bandit past the courtyard's gate (254efc8); the camera's second push (778ab9d); the plate fades over a body and keeps its hearts (1ef40fb, 711c341); dropped events fixed and a struck hero shows it on their own page (3314c47, a5a830b); the start screen no longer moves under a finger (414564f). Steps 22, 15 and 21 closed.
- **Full re-runs by this orchestrator, each in a clean detached worktree, diffs not read: twelve.** Five all green (c4872c3, 50e5121, 778ab9d, 254efc8, 3ddd9c2); seven with one red each: `plates-friend-held` (b36d325), `hearts-game-over` (cc2e80b; since fixed), `start-link-back` (b7ed6e9; since fixed), `row-both-sides` (4881e33, 0e0d309: the camp's own fighters break their own horn, 13 of 13 breaks in 40 sim fights: fix held locally by the reds builder), `suplex-again` (3f48c31, 347ff1d: red in every recent full run, green alone, so order-dependent: with the reds builder). Last: 347ff1d, build, check, gates 6 of 6, e2e 171 ok and that one red. Not re-run: 711c341 and everything pushed after the pause.
- **Looked at by subagents, never by the orchestrator's own eye, never by playing:** about twelve looks, each recorded in its step file (`docs/plan/step-8.md`, `-4`, `-5`, `-20`, `-24`, `-25`, `-3`). Not looked at yet: the trike's `courtyard-*-2-*`, the arrow's and `*-after4-*` shots, the escalation's shots, the hauler's freed shots, the struck hero's shots, the opened menu.
- **Known faults:** the camp's alarm goes quiet (above); `suplex-again`; the Hall balcony's thrower is a scrap at the top edge sideways (an arrow is held locally); the courtyard's bandit reads as idle and merges with a hero who meets him; the trike's stars trail behind it; a placed body has no starting facing; the pit's push-up doorway may be hard to see (for the owner's eye); the Hall's pedestals do not survive a server restart; `tools/drive_sync.py` mirrors large sources outside ZIPs.

## Sessions

*(14:45 UTC, by orchestrator `session_017WiGzHhT2apmWHT61rQ65G` at its handoff; amended 14:42 UTC by its successor `session_017WiGzHY5UZsWTLCH8cLm8M`, which holds the role now; all report to the session on the Orchestrator line of `docs/questions-for-the-owner.md`. Every spawn: model `claude-opus-5-5`, `blob_limit_kb: 150`.)*
**Running at 02:00 UTC on 2026-11-25 (6 builders, no lead; all spawned by orchestrator `session_017WiGzHY5UZsWTLCH8cLm8M`, model `claude-opus-5-5`). Each held work locally through the owner's pause and was given a push slot at 01:55; READ THE LOG to see who has pushed:** **the escalating guard response** `session_017WiGzJpUjDMF6E6joLnxqr` (`escalating-guard-response.md`: push 1 at d8f7988, opened first at 01:53; at its budget, stops after the push: **a fresh builder is owed for pushes 2 and 3**, spawn it on the same brief once its Landed so far is on main; never archive this session before d8f7988 is on main); **the camp's alarm and the e2e's reds 2** `session_017WiGzFFLrDf959S3iaSd8L` (`e2e-intermittent-reds.md`; slot 02:05-02:11: the camp's own blows spare its horn; then `suplex-again`, the camp's missing call, a re-count); **the hidden recruit 2** `session_017WiGzG1qWeHNiu66ZaDHnP` (`hidden-recruit.md`; slot 02:12-02:18: the e2e facts of her freed, the new-game scenario, push 3 `step13-free-while-caught`); **the trike 2** `session_017WiGzFDp4ULq8khkx23hXS` (`guard-vehicle-courtyard.md`; slot 02:19-02:25: push 2b, the look's five fixes, 309517a; then it stops; its push 3 moved to the escalating response); **the phone legibility pass** `session_017WiGzEjRmD6RYjXVXYenFX` (`phone-legibility-pass.md`; slot 02:26-02:32: the arrow, the backdrops' tops, the quarry road's deck); **guards meet bad guys** `session_017WiGzJr21AnZq1E9RENxL1` (`guards-meet-bandits.md`; pushes when green, at or after 02:33). Vision Partner `session_017WiGzH2sJsLQebAuQnEFzS` (third; Q-014, Q-015, Q-017, Q-018, Q-019 open for the owner; told at 00:59 to push nothing: **tell it pushes are open**).
**Unbriefed or waiting for a builder:** the e2e's unknown reds (`e2e-intermittent-reds.md` has its Landed so far: grab, doors, plates, the camp's second call; wait for the dropped-events fix first); a fourth small backgrounds pass (forest-trail's top, quarry-road's deck: `docs/plan/step-8.md`, "Third look"); the plate's fade too faint and the edge arrow too small (`docs/plan/step-8.md`, "Look at the plate's fade"); guards and bandits fight in a real room; the camp shot's right edge.
**Finished and archived since 14:45:** the owner stuck in the quarry 2 (9af30c4: the menu button, a faded power's way out; re-run and looked at, brief deleted; left for the owner's eye: the pit's push-up doorway, a real iPhone), a page misses what happened (3314c47, a5a830b; brief deleted, the second push not re-run yet), the suplex 3 (de887b9; Step 25 waits on the grappler's frames), the hidden recruit 1 (ce3f8bf, 09708bd), the owner stuck in the quarry 1 (70b2361, a1f6101, 89f1ff8), the e2e's reds 1 (414564f: the start screen no longer moves under a finger), the trike 1 (186b8da), the backgrounds 2 (6755d3f), the suplex 2 (29681b3), the plate (1ef40fb; re-run, brief deleted; its look found the fade too faint to read hearts and the arrow too small: `docs/plan/step-8.md`), the courtyard's bad guy (254efc8; re-run, `ranged-enemy-2.md` deleted; left: a placement's starting facing, guards meeting him), the armoured guard's look (3d4ff70; not re-run, not looked at), the camera 2 (778ab9d; its brief deleted), the camp's rows 3 (46cc3e8; left: the 2-in-100 door case, a second call that once did not come, the shot's right edge), the suplex 1 (9079d4c, 70e7311, 706849a), the camp's rows 2 (the east half, 3c370a7), the town 5 (5fbcc15, 178e243), the e2e's shots (87bde1d, re-run and its brief deleted), the thrown friend (f032a4b, 6a7e935; re-run, its brief deleted), the thrower 2 (ca0ea22, ce0d56c; the courtyard's bad guy handed to `session_017WiGzJuWboLaxkDAsBMpaS` on the same brief, east of the gate), the backgrounds' first builder (137bcaa, a988b63; the third pass with `session_017WiGzEnVpAqVM456FxYDyg` on the same brief), Step 22's lead and builders (closed 52856fc), Step 15's lead and four builders (closed c23c3fc), the second Vision Partner.
**Archived this tenure (26):** beaten, buttons, the chase, the alarms, weapons 1-3, vehicles B, the wave's wagon, props, the town 2-4, the checks builder, hearts 1-2, the phone's display 1-3, the thrower 1, the camp's rows 1, the camera 1, Step 22's first lead. Idle: Step 5's lead `session_017WiGzJfkNbzJfpRVPhWoeK`. Past orchestrators only forward; never archive them.
**Backstops:** the orchestrator's 30-minute check-in (`send_later`, "Irreverents orchestrator check-in", re-armed each time).
**Messages cross:** answers arrived 20 minutes late, twice. A builder that says it waits on you gets the answer again, `priority: now`.
**Reviews run in a detached worktree in your scratchpad** (`git worktree add --detach <scratchpad>/rv origin/main`; `npm ci`, build, check, gates, e2e; `git checkout -- .` after, since e2e rewrites shots), never in the main tree, never two e2e at once, never two `git fetch` at once. **A look brief is reviewed by looking, never by its builder's report:** a subagent (`model: opus`) reads the before and after shots against the claims, fetching blobs with `git show origin/main:<path>` into its own scratch folder (most shots are over 150 KB and not checked out). **A builder stops at 250-300k tokens;** each brief then gets a "Landed so far" line and a fresh spawn (twenty times this tenure).

## Owed next

*(In order, 02:00 UTC on 2026-11-25, by orchestrator `session_017WiGzHY5UZsWTLCH8cLm8M` at its handoff.)*
1. Whatever the owner says first. Tell him, in plain words, each thing as it goes live. He has just played (00:35 to 01:50 UTC) and has not yet said what he found: ask Vision Partner nothing; act on what he says.
2. **Let the held pushes land, one at a time** ("Sessions": slots 01:53 to 02:33; a builder that missed its slot pushes after 02:40). As each lands: tell the owner; archive a builder that says it stops; **a fresh builder on `escalating-guard-response.md` for pushes 2 and 3 (the other castle-town rooms; the ending) the moment d8f7988 and its Landed so far are on main: the owner asked for this by name.**
3. **The documents-redeploy test:** 12fcbec, a documents-only push at 01:52:42 with nobody playing: read "Rules in force now" for its result, recorded there by the handoff commit; if documents now redeploy, tell the owner the fix is Railway's "Watch Paths" setting (his, a minute; `docs/mechanisms/deploy.md`), and batch documents until then.
4. **Review:** a full re-run at the tip once the slots are through (re-add the review worktree in your own scratchpad); a subagent looks at the escalation's shots (`docs/plan/step-4-shots/escalation/`), the trike's `courtyard-*-2-*`, the arrow's (`docs/plan/step-8-shots/plate/arrow/`), `*-after4-*`, the hauler's freed shots, the struck hero's (`docs/plan/step-5-shots/struck/`); delete each finished brief only after its re-run.
5. **From `docs/vision-gaps.md` (status column last refreshed at 50e5121, 17:00 UTC on the 24th: refresh it; rows 6, 9, 12, 15 moved a lot since):** running: row 9 (the escalating response; guards meet bad guys), 12 (the hidden recruit), 15 (the trike), 7 (legibility, backgrounds). Unbriefed: row 13, the throne room's cast (Step 6 unclaimed); row 11, a crowd; row 3, the cantina's shortcut doors; row 1's rest (the throne room, the quarry cave, the cantina have nobody bad); the rest of the twelve weapons (Step 23, open, unclaimed).
6. **Looks owed a fix, unbriefed:** the courtyard's bandit reads as idle and merges with a hero who meets him; the trike's impact stars trail behind it and a doorway arrow shows while riding; the camp shot's right edge and the captive's bubble over arriving bandits; the suplex's flop after the bounce and the splashed crates' first star (`docs/plan/step-25.md`, when the grappler's frames arrive); the undercroft's flat cellar backdrop; the opened menu never shot sideways.
7. **Faults found, not briefed:** the Hall's pedestals do not survive a server restart; Step 1's input queue adds 150-200 ms; the stun-lock case (Step 18 slice B); a placed body has no starting facing; a narrow body past a thin wall and grabs drawn late under heavy delay (`docs/plan/step-5.md`, "Thrown friend"); `tools/drive_sync.py` mirrors large sources outside ZIPs; `check:live` runs no stage fact and reaches only alarm level 2; `struck-own` was red once in 16 alone (cause not kept); a body blocking a one-tile way is not audited.
8. **Step paperwork:** Steps 9, 13, 14, 19, 7, 3, 20, 24, 25 and 4 are open with work or leftovers named in their files; Step 23 open, unclaimed. Old briefs never reviewed and still in `handoff-prompts/`: `look3-*.md` (five), `step-17-*.md` (two), `step-5-switch-gap.md`, `step-4-slice-2-alarm.md`, `step-5-hit-lands-at-once.md`, `step-5-e2e-flakes.md`, `owner-enemies-chase-alarms.md`, `camp-entries.md` (done at 46cc3e8, its leftovers in step-4.md), `suplex.md` (done; Step 25 waits on art), `biome-backgrounds.md` (its fourth pass is in the legibility brief).
9. **Process:** messages to builders arrived up to 44 minutes late (a builder mid-turn reads them at its next turn): for anything urgent use `priority: now` and check it was acted on; a builder that rebases onto a busy main and re-runs the full e2e each time never pushes: the ruling that worked, four times, is "rebase once, your own facts twice, push; the orchestrator's clean-worktree run covers the suite"; never delete a brief before its push is re-run (done twice by mistake this tenure).
10. Capacity: the weekly limit read `allowed_warning` all tenure (resets 2026-11-30 about 13:00 UTC); eight to nine sessions ran at once without the five-hour limit showing. The owner has not answered "full speed" or "throttle".
11. Carried, untouched: shop interiors from P08; `docs/mechanisms/cantina.md` l.155; branch `claude/gallant-keller-1gpm2y` to be deleted (a permission check refused it); the Drive changelog entry; eight biome panoramas with no room yet.

## Rules in force now

- **Pushes are OPEN again from about 02:00 UTC on 2026-11-25** (the owner, first-hand: "Resume the work"). Builders are let through one at a time, a few minutes apart, so their deploys do not replace each other. The two entries below are the record of the pause.
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
