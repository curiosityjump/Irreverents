# Core loop 5, escalating combat: waves that really come, and a last stand the Hall remembers (Step 7, slice B)

**Landed so far (2026-11-23 23:20 UTC): pushes 1 and 2** by `session_017WiGzHvGxLQnLUErw7teAo`, which stopped at about 300k tokens: 91b83a5 (the camp's waves really come) and 745395d (the game notices: the legend detector, gate E on `step7-last-stand-camp` and `scripts/checks/step7-hall`; heist jobs hang pedestals too through the theft kind). **You do push 3:** the pedestal's picture drawn with real sprites in the P04 Hall frame (looks are cut: `tools/art/props/README.md`, "Core loops"; the art builder `session_017WiGzEN1QbSnHzXNqV4XSt` takes asks by message), plus iPhone-sized screenshots of the banner and the pedestal. Read `docs/plan/step-7.md`, "Builder notes", first. Weakest so far: the gate-E run fells exactly 5, which is the threshold; the picture fits only about 3 bodies in the 500-byte budget; the shared world's pedestals do not survive a restart until the store is wired (a later slice, not yours). The vehicles B builder is now working in the camp's files (`handoff-prompts/loop-vehicles-b.md`): do not edit the camp's room, outpost or scenarios.

Brief for one cold builder. Written 2026-11-23 19:40 UTC by the core-loops
re-plan (`docs/plan/core-loops.md`, section 5; read it and its "Names the
slices share" table first). The step is `docs/plan/step-7.md`: read "Why",
"What's decided", "Decided by the lead" and "Reviews". Read
`docs/mechanisms/outposts.md`, `docs/mechanisms/hall-of-legends.md`,
`docs/mechanisms/npc-response.md`, `docs/mechanisms/saves.md`,
`docs/mechanisms/network.md` ("Traps") and `docs/mechanisms/scenarios.md`
before writing anything.

**Reports:** `send_message` to the session on the Orchestrator line of
`docs/questions-for-the-owner.md`, after each push, with the commit. Notes:
`docs/plan/step-7.md`, "Builder notes" at its end.

**Small pushes, most visible first, each standing alone and fully checked.
Push 1 is the waves, before any detector.** If you pass about 300k tokens
after push 2, report and stop: the orchestrator re-briefs push 3.

## The task, and why

The owner, 2026-11-23 ~18:30 UTC, first-hand, after playing on a phone
(`docs/vision.md`, "The measure"): **"I want to play it as I described it.
There are no ... escalating combats or chases ... no risk. Virtually
everything described in the vision docs that would make the game genuinely fun
to play is yet to be seen at all"**

The Bandit Camp, two rooms from the start, was built to escalate and in the
real room it does not (measured below). This slice makes the waves arrive in
an ordinary fight, then lets the game notice a last stand by itself and hang
it in the Hall. **It moves M3** (`docs/plan.md`): build gate E, the one gate
not passing, from 5 of 6 to 6 of 6, with a real, unscripted event.

The library (doc 11): **D-021** crowds and escalating resistance can
overwhelm; **D-061** a signaler, a caller who must reach it, waves endlessly,
and four ways to stop it (destroy the signaler, interrupt the caller, clear
them, escape the zone); **D-063** only a completed call brings help; **D-065**
"Escalation is not omniscient"; **D-024, D-025, D-026** the Hall, its framed
moment and stats, everyone credited. Doc 07: "repeatable calls by surviving
enemies, each with a visible activation window"; "each response wave should
add a new toy". Doc 09: ceremonies "rare and earned"; doc 00: never "a preset
achievements checklist". Gate E (doc 24, PROPOSED, the project's measure):
"simple Hall captures a real highlight, without scripting the event itself."

## Measured for you

**By this plan's check, in a scratch copy at ab3ecb1** (throwaway scenarios
through `node scripts/trace.ts`; nothing run in the repository):

- **Real Bandit Camp, a grappler standing at column 15 in the lookout's view
  for 90 s:** 10 calls completed; waves 0 and 1 walked in (1 then 2
  fighters); every later wave waited for ever (3 placed + 3 arrived + a row
  of 3 is 9, over the bound of 8); the arrivals stood at the entry (column
  41, speed 0) for the remaining 75 s; **0 blows landed on anyone.**
- **Real depot:** 10 calls, exactly one wave of two, ever (4 placed + 2 + 3 is
  9), standing at column 61.
- **Among the camp's fighters (a grappler at column 22):** first flattened at
  12.3 s, six times in 60 s; in the same minute the bandits flattened each
  other seven times, the lookout included.

**Read at a0f402c:**

- **Why they wait:** `src/sim/systems/outpost-wave.ts:37` counts
  `peopleIn(...)`, every body with `c.npc`, out cold or not
  (`src/sim/outpost/state.ts:79-81`, an `INTENT:`), and nothing ever removes a
  body.
- **Why they stand:** a wave is spawned at the entry with no target
  (`outpost-wave.ts:43-47`), and `src/sim/systems/outpost-fight.ts:53-55`
  walks a fighter only at a hero it sees itself within 112 px (`INTENT:`
  D-065). The caller's sighting (`outpost-call.ts:77`) is stored nowhere.
- **Why ordinary play switches it off:** `content/outposts/outpost.json` lists
  one caller, `camp-lookout`; his toughness is 30 and the grappler's
  `attackWear` is 34, so one hit flattens him; and a caller stopped mid-call
  by a knock-out or a grab never calls again
  (`src/sim/systems/outpost-call.ts:55-60`, marked `DRAFT:`, "the library
  leaves it open"). The filling horn bar tells a player to stop him, so the
  natural first act ends waves for good in that game.
- **The camp's numbers:** `callTime` 3, `callAgain` 6, `bound` 8, waves of 1,
  2, 3 with the last row for ever, entry [41, 10]. New fields in an outpost
  file need adding to `read.only` at `src/content/kinds/outposts.ts:54`;
  callers must be placed people (`:103-105`).
- **The depot's yard is cut in three** by its stack (columns 14-17) and step
  (24-25); no person jumps; its waves enter at column 61. A wave there can
  reach a hero only east of the step.
- **The Hall on `main`:** the record's shape (`src/sim/hall/record.ts`), the
  pedestal's picture, card and banner (`src/client/draw/hall.ts`) and the
  store (`src/server/store.ts`, opened at `src/server/main.ts:68` for Step
  17's saves; no Hall collection is read or written). **Nothing makes a
  record.** `content/hall/`, `src/content/kinds/hall.ts` and a `pedestal`
  character kind do not exist. The detector never landed: its brief
  (`handoff-prompts/step-7-b-detector.md`, 04:50 UTC) and a 1,967-line working
  copy (`handoff-prompts/step-7-b-working-copy.patch`, reported 7 of 9, never
  re-run) predate today's events. **Read them for ideas; write against
  today's events.**
- **The banner cannot fire where the feat happens:** `draw/hall.ts:233`
  announces a pedestal entity new to the page, and a page is sent only the
  entities of its own room (`src/server/game.ts:527`). World events do reach
  every page (`snap.ev`, line 528).
- **The picture is coloured boxes:** `draw/hall.ts:62-103` is `fillRect` per
  body; the file's header says every look is a graybox stand-in. The frame
  and plinth looks exist now (`content/looks/hall.json`, 749fe33) and nothing
  draws them.
- **A kept game keeps every body that is not a player** (Step 17), so a
  pedestal entity is saved with its world.
- **Events you can read today:** `outpost-call-started`, `-completed`,
  `-stopped`, `outpost-wave`, `signaler-broken`
  (`src/sim/outpost/state.ts:44-52`); `flattened`, `recovered`, `hit`;
  `alert-changed`, `call-completed` (`src/sim/npc/alert.ts:58-61`); `deed`
  with `witnesses` (`src/sim/npc/state.ts:64`). The server sees no
  `changed-room` for a player: read rooms each tick.
- `npm run gates` counts scenarios tagged `"gate": "E"` (`scripts/gates.ts`).

## What to build (`DRAFT:` throughout; decisions-log entries "Step 7: waves" and "Step 7: legends")

1. **Push 1, the waves are real.** Agreed additive edits in closed Step 12's
   files (`outpost-call.ts`, `outpost-wave.ts`, `src/sim/outpost/state.ts`,
   `src/content/kinds/outposts.ts`).
   - **A wave goes to where its caller saw a hero.** The caller's sighting is
     kept with the call; each arriving fighter's `c.outpostFight` starts as
     that place. The lookout told them, so D-065 holds: no other read of a
     hero's position is added.
   - **Stopping a caller buys time, it does not end it.** In
     `content/outposts/outpost.json`, both placed fighters join `callers`; a
     caller stopped mid-call tries again after `callAgain` once he is up, by a
     data switch that leaves the depot and `test-outpost` as they are. One
     goes for the horn at a time; the others fight. Breaking the post stays
     the real stop (D-061).
   - **Growth fits under the bound.** Either size the rows to fit, or a new
     small system by which a wave fighter who has lain out cold, or stood
     with nobody to fight, for some seconds walks off. The bound on bodies
     stays (`INTENT:` bounded crowds), as does "no cap on waves".
   - **A new toy by the third wave:** a `heavy-fighter` in the camp's third
     row.
   - Measure, and write down, how long each hero lasts against it: a player
     should be able to reach the third wave.
2. **Push 2, the game notices.** `src/sim/systems/hall-detect.ts` with
   helpers under `src/sim/hall/`, `content/hall/` and
   `src/content/kinds/hall.ts` (kinds, thresholds, title templates; the field
   names `draw/hall.ts` reads are `kinds[id].name` and `stats[id].label`), a
   `pedestal` character kind, pedestal spots on the gallery's flat floor as
   data.
   - Two kinds now: **a last stand** (waves came, the players felled many,
     it ended with everyone down or gone) and **a narrow escape** (waves
     came, the players left on their own feet with a wave still standing).
     The third, **a theft nobody noticed**, is added as data and one event
     read when the heist slice's `clean-getaway` is on `main`; ship no kind
     that nothing can trigger.
   - **Count only bodies felled by a credited player.** Thresholds from your
     measurements, high enough that one wave hangs nothing.
   - **Relative:** the same feat again hangs nothing unless it beats the best
     of its kind in that place (S-001).
   - A record is a pedestal entity in `hall-gallery`; the world emits
     `hall-legend`. **The page announces from that event**, through
     `src/client/draw/banner.ts` if the heist slice has landed it (one edit
     near `draw/hall.ts:233`); someone standing in the gallery sees the
     pedestal itself.
   - **Kept:** in a kept game the pedestals live in the saved world; prove
     it. The world everyone shares loses them at a restart until the store is
     wired: that is a later slice with the `src/server` edits named. Say so
     plainly in your notes.
   - One scenario tagged `"gate": "E"`, from real inputs in the real camp.
3. **Push 3, the picture.** The framed moment redrawn with the real sprites
   (the record already stores each body's kind, place, facing and knocked-out
   flag), in a frame and on a pedestal cut from the approved P04
   Hall-of-Legends atlas, on the banner as well as the pedestal.

**How it reaches a phone:** wave state is on entities of the camp's room (as
today); `hall-legend` is a world event, so the banner fires wherever the
player is; a pedestal is an entity of the gallery; nothing new is on a
player's own entity.

## Signal

- Scenarios in real rooms (`placements: true`), each with a control watched
  to fail: `step7-waves-reach-the-hero` (the camp: a hero in the lookout's
  view; three waves arrive and come within reach of the hero; control: the
  send-to rule switched off, they stand at the entry);
  `step7-waves-reach-the-hero-depot` (the same in `quarry-depot`, the hero
  east of the step); `step7-caller-tries-again` (the lookout knocked flat
  mid-call; a call starts again; control: the retry off, none ever);
  `step7-post-ends-it` (the post broken: no wave after);
  `step7-last-stand-camp` (gate E: real inputs, waves, fighters felled by the
  player, the hero leaves or falls: exactly one record naming the player,
  with how many came and fell; control: one wave only, none);
  `step7-same-again-hangs-nothing`.
- `scripts/checks/step7-hall.ts`, a real server and **two connections**: A
  earns a legend in the camp and A's own events carry `hall-legend` (A is
  never sent the pedestal); B, standing in the gallery, has the pedestal
  entity; in a kept game it is there exactly once after everyone leaves and
  the server is rebuilt (control: saving off).
- `npm run gates` prints gate E passing, 6 of 6.
- `npm run e2e`, phone page by touch, no fight to win: walk into the camp and
  stand in the lookout's view; the page's drawn record shows the horn's bar
  fill and more people in the room afterwards than before (control: read
  before the call).
- Screenshots at 844×390 and 390×664: a wave arriving, the banner, a pedestal
  and its card; under `docs/plan/step-7-shots/`.

## Traps

- **The `INTENT:`s of Step 12 stay:** seeing is not calling (D-063); the only
  source of a wave's target is its caller's own sighting (D-065); a cap on
  bodies and none on waves; with no hero in the room the call ends and queued
  waves drop (D-061); nobody of the camp ever asks for a door.
- **`step12-*` (11) re-times are yours** (Step 12 is closed): list each one
  you change and why. **`step16-*` (65) are not:** if waves walking to the
  hero change one, stop and agree it with the Step 16 lead (the session
  claiming Step 16 in `docs/plan.md`), whose builder is in the quarry's files
  until about 20:40 UTC. Edit nothing of the depot's; ask that lead to give
  the depot callers who try again once your switch is on `main`.
- **The camp's files have one owner at a time:** `content/outposts/outpost.json`
  is yours; `content/placements/outpost.json` is the heist slice's (a
  strongbox near column 23); the rescue slice puts a cage near columns 33-34
  from its own data. Waves must not come to rest on either: check where they
  stand.
- **Approved Drive assets first** (4ed30c3): 38 Hall pieces are cut from P04's
  atlas (`content/looks/hall.json`, 749fe33): `hall-frame`, `hall-frame-star`,
  `hall-plinth`, `hall-plinth-tall`, `hall-plinth-star`, `hall-plaque` and
  more. For anything missing ask the core-loop art cut-outs builder (its
  session is on the Sessions line of `docs/current-directive.md`). No grey box
  ships as the Hall's look.
- **A pedestal entity is at most 500 bytes of JSON** (`record.ts`, an
  `INTENT:`): it goes to every phone in the gallery about 20 times a second.
- **Never tag a scenario with scripted events for gate E.**
- **No digits on the banner** (`t-no-numbers` reads every string drawn during
  a fight in the start room); the card in the gallery may show its stats.
- **Other builders nearby:** the heist slice owns `src/client/draw/banner.ts`
  and `hud.ts`; hit prediction is in `src/client/main.ts`; Step 18's later
  slice (heavies topple) will touch the impact systems. Yours: new files, the
  agreed edits named above, one line in `src/client/render.ts` if a layer is
  added. `git pull --rebase` before each push.
- **Read new fields with a default** (a caller saved before your field, a
  signaler with no sighting): a kept game holds old ones, and a missing field
  must not set a game aside (`docs/mechanisms/saves.md`).
- Stop test servers by PID. If live is healthy on an older commit after a
  push, wait, don't revert.

## Out of scope

Wiring the store for the shared world (the next slice, with the `src/server`
edits named); the town's whistle and dispatch (Step 4); the machine (Step 20);
being thrown out (Step 21); the depot's data; any new enemy kind.

## Decided, and open

Decided by the owner: the D-numbers above. `DRAFT:`, yours to log: who may
call and that they try again, how growth fits the bound, the heavy in the
third row, the thresholds for a legend, where pedestals stand, pedestals kept
in the saved world. Nothing waits on the owner. For the owner to judge by
playing, not asked: whether the camp gets out of hand in a good way, and
whether the game noticed the right moment.

## Done

Each push: `npm run build`, `npm run check`, `npm run e2e`, `npm run gates`
green; pushed; `check:deployed`, `check:live`; `/debug/errors` read.
`docs/mechanisms/outposts.md` and `docs/mechanisms/hall-of-legends.md`
updated; the M3 cell of `docs/plan.md`'s table re-measured (tell the
orchestrator, who edits it); decisions-log entries; `docs/plan/core-loops.md`
section 5 updated to what landed; `handoff-prompts/step-7-b-detector.md` and
its patch are the orchestrator's to delete when this ships. Final message:
done or blocked, the commit.
