# The escalating guard response: the more the town reports you, the more and the stronger the watch that comes, wherever in the castle town you are

**Landed so far (2026-11-25 ~01:45 UTC), by `session_017WiGzJpUjDMF6E6joLnxqr`, which stopped at its budget:** push 1 built and committed as d8f7988 on that session's local main, NOT pushed (the owner was playing; the orchestrator paused all pushes). If d8f7988 is not on `origin/main`, the orchestrator holds it or push 1 must be rebuilt from its notes: `docs/plan/step-4.md`, "The escalating guard response". **The trike already takes a person at the reins:** a dispatch row person with `"rides": "guard-trike"` (`content/dispatch/castle-street.json`, row 4) is spawned standing on a trike spawned on his tile first (`<id>:ride`, in `alert-dispatch.ts`, copied from the camp's `outpost-wave.ts`); `machine-seat` (order 120, the same tick) seats any person with `c.npc` standing on a machine, and `machine-driven` drives it at the place reported (`c.chase`) then at a hero he sees, at `speed.driver`. At most one trike the area sent stands at a time (with one standing, he walks in); a seated driver is never stood down. **Push 2 LIVE at a4f9885 (2026-11-25 04:42 UTC), by `session_017WiGzEyaoW1jEkkGR6iQZ7`, which stopped at its budget:** one town-wide level (`town: "castle-town"` in all five dispatch files; `raiseAlert` goes to one above the town's highest), tables for the throne room, the courtyard, the Hall gallery and the undercroft, a follower reports the room he is in, `clearOf` 3, the stronger relieve the weaker across the town; scenarios `step4-tier-town-throne-room`, `-courtyard`, `-hall-gallery`, phone fact `escalation-town`; check:live green. **Not done in push 2:** a scenario that reports in the undercroft (four scripted tries failed, see the notes), shots of the rooms' rows. **Left: push 3 (the ending made legible: a banner as each pip drops, the bell ringing on at 5; the way-out scenarios at level 5 for every roster hero; the door ping-pong at the street's throne-room door)**; doubts for it are in the notes (`docs/plan/step-4.md`, "Push 2, the other town rooms").

Brief for one builder, three pushes, most visible first, each live and
standing alone. Written 2026-11-25 00:15 UTC by the orchestrator
(`session_017WiGzHY5UZsWTLCH8cLm8M`). **The owner asked for this by name
minutes ago: it goes ahead of everything else you might do.**

**The owner, 2026-11-25 ~00:10 UTC, first-hand to the orchestrator:**
> I want the escalating guard response implemented now

**And before it (quoted in `docs/current-directive.md` and
`docs/plan/step-4.md`):** 2026-11-23 ~18:30 UTC, after playing: "... no
escalating combats or chases ... no risk"; 2026-11-24 ~01:05 UTC:
"Alarms should spawn more enemies of increasing strength that come in
from the sides".

Read first: `docs/design-library/02-gameplay-systems/26-witnesses-reporting-and-wanted-levels.md`
(all 18 KB: its labels are literal: the rule "no signal, no escalating
reinforcements" and the ways the response ends are CONFIRMED; the 0-5
ladder is "an IMPLEMENTATION PROPOSAL, not a confirmed five-step
canonical level system", used here by default under D-096 and marked
`DRAFT:`); doc 07 (grep "each response wave should add a new toy");
`docs/vision.md` (grep D-059, D-063, D-069, D-073);
`docs/mechanisms/npc-response.md` (ALL of it: "Calling for help, the
alert and getting away", `alert-dispatch`, `alert-respond`, "The pips
follow you", "The castle street's table", the checks);
`content/dispatch/castle-street.json` and its `"//"`;
`docs/plan/step-4.md` (top, "What's decided", the fifth builder's notes:
what is live and how `cap-holds` was timed);
`docs/deliberate-designs.md` (grep "way out", doorClear, chase-cap,
jump: no person jumps and every person is slower than the slowest hero,
ON PURPOSE: escalation must not undo that); `docs/mechanisms/scenarios.md`.

**Reports:** `send_message` to the session on the Orchestrator line of
`docs/questions-for-the-owner.md`, after EACH push, in words the owner
could read (what a player now sees happen). **Notes:**
`docs/plan/step-4.md`, a section "The escalating guard response".

## The task, and the measure

`docs/vision-gaps.md` row 9. What is live today (measured from the
files, 00:10 UTC): ONE place has a response table,
`content/dispatch/castle-street.json`: three levels (level 1 the placed
guard answers the bell; level 2 two guards walk in, one each side; level
3 three, the middle one the armoured guard; each further completed call
at level 3 repeats the last row; at most 8 people in the street), with
pips under the party plate and a banner per level. `ls content/dispatch/`
shows no table for the throne room, the courtyard, the Hall gallery, the
undercroft or the cantina: trouble there escalates only by guards who
walk in through doors. So a player who is not in the street, or who is
past the third call, sees nothing new. The measure: in every castle-town
room a player can be reported in, each completed report raises a level a
player can read, and each level brings visibly more and a new kind, up
to an all-out response that keeps coming until the player gets away or
stops the signal. Moves no row of the plan's table; gate C and D's
scenarios must stay green.

## Decided (each `DRAFT:`; one `docs/decisions-log.md` entry; every number a first guess in the dispatch files)

1. **Five levels the player can read** (doc 26's proposal): pips 1 to 5
   and a banner each, in words, no digits. Never a level without a
   COMPLETED report (bell, whistle, a caller reaching a guard): CONFIRMED,
   and already how `raiseAlert` works; keep it.
2. **Each level adds a new toy, from what exists** (doc 07). Castle
   street as the model: 1 the placed guard answers; 2 two guards from
   both sides; 3 three with the armoured guard; **4 the elite row:** two
   armoured guards and, if `handoff-prompts/guard-vehicle-courtyard.md`'s
   trike has landed as a drivable kind (it has: 186b8da; its "push 3", a
   guard driving one at you, is now YOURS: the orchestrator has told
   that builder to leave it), a guard driving the trike in from a side,
   which a hero can take off him as the camp's wave wagon works
   (`step20-wave-wagon-taken`); **5 all-out:** the last row keeps
   coming on each completed call AND on a timer while any responder
   still sees a hero, under the cap, with the bell ringing on. If the
   trike as a responder is not small, ship levels 4 and 5 without it
   and say so.
3. **Everywhere in the castle town.** A response table for each room
   where a report can be completed or carried: the throne room (hit the
   king: who reports, and who comes: find out what happens today and
   say), the courtyard, the Hall gallery, the undercroft; the cantina
   only as its own rules allow (`docs/mechanisms/cantina.md`: the brawl
   raises nothing, by design: leave it). One town-wide level
   (`world.alerts` already carries it across doors): the row comes to
   the room the report names, from that room's own entries (its doors
   and edges, off-screen where the room is wide, `entryAway`), and
   responders follow through doors as today (two per door, `chase-cap`).
   Prefer ONE mechanism as data (a dispatch file per room, or one file
   with a section per room; "prefer data to code"); if `alert-dispatch`
   can only serve one area, name the missing primitive and add it
   additively.
4. **It ends as the library says, and a player can tell it is ending:**
   stop or break the signal; knock out everyone who could report again;
   get out of sight and stay out until it cools (the existing
   cool-down); distress calmed by behaving (mode 2 only). Pips drop one
   at a time with a banner; the responders walk out as today.
5. **There is always a way out** (`CLAUDE.md`): rows never arrive on top
   of a hero or seal the only door (`doorClear`, as the camp does); no
   person jumps; the on-screen cap holds (`step4-tier-cap-holds`: re-time
   it with its claim kept, never loosen it); `npm run check`'s way-out
   check for every roster hero stays green; solo can always leave by a
   door at level 5 (a scenario per roster hero, as
   `step4-tier-away-at-the-most-<hero>` does today).
6. NPCs are scripted, never AI: tables, timers and the existing
   states. Names shown are data and `DRAFT:`; ids are never renamed.

## Do

**Push 1 (most visible): levels 4 and 5 in the castle street**, with
their banners and pips, scenarios `step4-tier-level4-*` and `-level5-*`
with controls watched failing, the phone e2e fact extended to count the
new pips and the new arrivals, and shots at 844x390 and 390x664 of each
level's row arriving (`docs/plan/step-4-shots/escalation/`).
**Push 2: the other town rooms** (decision 3), a scenario per room
(a report completed there brings that room's row there; the level is
the town's), and the pips crossing doors in both directions.
**Push 3: the ending made legible** (decision 4) and anything decision
5's scenarios found.

## Yours and not yours

Yours: `content/dispatch/**`, `content/characters/` and `content/npcs/`
for a new responder kind as data, the alert systems under
`src/sim/systems/alert-*.ts`, `src/client/draw/alert.ts` (pips,
banners), `scenarios/step4-tier-*`, `scripts/checks/step4-*.ts`, a new
e2e file plus one call line in `scripts/e2e.ts`. Shared, touch only
your lines, pull and rebase before every push: `content/tuning.json`,
`content/placements/courtyard.json` (a bandit at column 27; a trike at
column 5 and a roadblock at 11-13: move nobody's). Not yours:
`content/hostility.json` and `src/sim/systems/clash-*.ts`
(`guards-meet-bandits.md`, running now: it makes a guard answer a bad
guy who hits him; expect the villain to draw guards off you in the
street and re-time around it, do not undo it), the camp's horn and
`scripts/e2e/camp-row.ts` (`e2e-intermittent-reds.md`),
`src/client/draw/hud.ts` and `aim-edge.ts` (`phone-legibility-pass.md`),
the trike's own look and its crash (`guard-vehicle-courtyard.md`, push
2b), the undercroft's stone and the quarry's cave (`hidden-recruit.md`).

## Done

Each push: build and check green (gates 6 of 6: gate C and D must not
move); your scenarios green and their controls red; your e2e facts
green twice; rebase once and push without waiting on a full e2e (the
orchestrator's clean-worktree run covers the suite; `row-both-sides` and
`suplex-again` are known intermittent reds); read `/debug/errors` and
`/healthz` first (if `players` is above 0 the owner may be playing: push
anyway, and say in your report that a restart landed on a player);
pushed to `main`, live (`npm run check:deployed`, `npm run check:live`,
whose `tiers` check must pass). A deploy that seems stuck with
`/healthz` healthy on an older commit: never revert, wait up to fifteen
minutes pushing nothing (`docs/verifying-and-finishing.md`, "The
pre-push gate"). Stop at about 300k tokens with "Landed so far" filled
in. Whether it feels like risk is the owner's to judge by playing;
nobody has tried it on a real iPhone: say so.
