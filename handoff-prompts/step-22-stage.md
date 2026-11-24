# Step 22: one stage to clear (the quarry): lose and start over, reach the end, STAGE CLEARED

Brief for one builder, reused for every push below. Written 2026-11-24 by
Step 22's lead (`session_017WiGzFrf7N7ZgaqUyjs4Sz`), measured at 11b020a.
**Read `docs/plan/step-22.md` in full first**: it holds the owner's words, the
decisions already made, the signal and what this step owns. This brief does
not repeat it. Then read `docs/mechanisms/outposts.md`,
`docs/mechanisms/combat-and-impact.md`, `docs/mechanisms/levels.md`,
`docs/mechanisms/saves.md`, `docs/mechanisms/scenarios.md`,
`docs/mechanisms/content-validation.md`, `docs/mechanisms/rendering-world.md`
("Banners"), `docs/mechanisms/network.md` ("Traps") and
`docs/deliberate-designs.md`.

**The design library: open only these files, by path; don't search or sync the
mirror.** P07's UI atlas
`docs/design-library/03-visual-direction-and-assets/current-pixel-art-explorations/p07-first-playable-npc-enemies-mechanisms-terrain-hud-source/irreverents-pixel-ui-atlas.png`
and its `readme-for-claude.txt`; P05's HUD sheet
`docs/design-library/03-visual-direction-and-assets/current-pixel-art-explorations/p05-hud-powers-cantina-brawl-and-secrets-visual-source-sheets/p05-ui-hero-party-hud-source.png`.
Push 4 only. A star is already cut: `hall-frame-star` (group `hall`,
`docs/mechanisms/asset-coverage.md` row `look:hall-picture`). Use it before
drawing one.

**Reports:** `send_message` to the lead, `session_017WiGzFrf7N7ZgaqUyjs4Sz`,
after each push, with the commit and one line on what a player can now do.
Notes and doubts go under "Builder notes" in `docs/plan/step-22.md`. A blocking
question goes to the lead in the moment. If nobody answers in about ten minutes,
decide it, mark it `DRAFT:`, log it in `docs/decisions-log.md`, and carry on.

**Small pushes, in this order. Each one stands alone, green and live.** The owner
is playing tonight, and push 1 is the thing he is missing most (his words at
~00:50 UTC: "Enemies can't be fully defeated, neither can heros"). If you pass
about 350k tokens, finish the push you are on, report, and stop.

## Measure table row

M3 (gates A-F) must stay at 6 of 6. M1 and M2 must hold. This step adds a
run with a start, a loss, an end and a result: what `docs/plan/step-22.md`
"Goal" names. It moves no row by itself. Say so at SOP phase 5.

## The derivation, already done (measured at 11b020a; file:line where useful)

**The quarry** (`content/levels/iron-quarry.json`). You come in from the
courtyard's door `to-quarry` and arrive at `quarry-road`'s door
`to-courtyard`, columns 2-4. Rooms are columns × rows; bad guys come from
`content/placements/<room>.json`:

| Room | Size | Bad guys placed |
|---|---|---|
| road | 84×20 | toll-keeper, outpost-fighter, heavy-fighter (+ thing `road-toll`) |
| ridge | 80×16 | 2 fighters, brute |
| tower | 20×30 | 2 fighters |
| depot | 64×20 | lookout [11,13], `depot-fighter-1`, `depot-fighter-2` [61,13], heavy `depot-guard` [34,13]; signal post `depot-horn-post`; thing `depot-hoard` |
| pit | 40×20 | heavy, fighter |
| cave | 30×14 | none (no placements file) |

That is 14 bad guys. The way through runs road → ridge → tower → depot (the
depot's west door is `to-tower`, column 0, rows 11-13). The ridge drops into
the pit (doors `chasm` and `pocket-drop`) and has stairs back up
(`pit-steps`). The pit's hidden `to-cave` leads to the cave, and the depot
cellar connects `to-pit` with `to-depot-cellar`.

**Waves** are in `content/outposts/quarry-depot.json`: the caller is
`depot-lookout` and the signaler `depot-horn-post`. A wave enters at [61,13],
bound 8, callTime 3, callAgain 6. Rows: 2 fighters, then 3, then 3 plus a
heavy, which repeats. The file has no `tryAgain` or `leaveIdle`; the camp's
`content/outposts/outpost.json` has both. **The bug** (`docs/plan/step-7.md:347-358`):
a wave walking west drops through the floor gap at columns 51-52 (row 14),
stands in the pocket (feet row 16, column 51) for ever, and counts against
the bound. A hero can only be reached at columns 53-60.
`step7-waves-reach-the-hero-depot` pins only that a wave leaves its entry.

**Losing (Step 21) exists. The quarry has none of it.**
- `content/defeat/castle-street.json`: downs 2, seizers `guard`, follow true.
- `content/defeat/outpost.json`: downs 4, seizers outpost-fighter and
  heavy-fighter, reach 24, window 60, beat 1, lands at courtyard door
  `to-outpost`, follow false.
- Choosing a file: `placeAt` (`src/sim/defeat.ts:42-50`) takes the first file
  by id that is `on`, lists the room, and (when `alertAbove` is set) has the
  alert above it.
- `canSeize` (`defeat.ts:53-62`), `defeat-seize.ts` (order 585: `fall` →
  `seized`; a played body's hit on the seizer → `seize-stopped`) and
  `defeat-throw.ts` (order 590). The throw is `returnPrize`, then a move to
  `landingSpot` (`defeat.ts:70-93`), then flattened, then `thrown-out`, plus
  `changed-room` when `follow` is set.
- `defeat-throw.ts:15`: **nothing of the place is reset.**
- The check `src/content/kinds/defeat.ts:127-129` requires the landing room to
  be one of the place's rooms or one door away from them. `quarry-road` is
  fine.
- Nothing in `src/client` handles `thrown-out` or shows a defeat file's
  `words` yet. That is Step 21's (builder `session_017WiGzJWYyVWtYnjFXHko1S`,
  `handoff-prompts/loop-risk.md`). Check the newest `main` before adding a
  banner, and don't write a second one.

**Nothing resets a place today.**
- `populateRoom` (`src/sim/world.ts:104-117`) only adds placed ids that are
  missing. It runs at world creation (`src/server/game.ts:172`), on save load
  (`src/server/saves.ts:215`) and in scenarios (`src/scenarios/run.ts:269`).
- `npc-setup` adds `c.npc` only when it is missing.
- D-077 (`src/sim/types.ts:76`): room state is never reset when a room
  empties. **The stage is the owner's named exception and applies only inside
  a stage** (`docs/plan/step-22.md`, "This is the owner's own exception").
  Leave D-077 as it is everywhere else.
- Room tile and part state is `world.rooms[room]` (`types.ts:73-78`,
  `room-state.ts`). A signal post's state is `c.signaler`
  (`src/sim/outpost/state.ts:84`). The Hall episode is `post.c.legend`. Wave
  ids are `<outpost>:w<n>`.
- Partial precedents: `heist-restock` (resets `takenBy`), `returnPrize`
  (`src/sim/heist.ts:75`) and `cantina-out` (clears body state,
  `cantina-out.ts:12,57`).

**Statistics have sources already.**
- Events are typed by `interface EventMap` merging next to whatever emits them
  (`src/sim/types.ts:118`).
- Knock-out: `flattened {target, by}` (`src/sim/body-state.ts:77-78`).
- Horn: `outpost-call-started`, `outpost-call-completed`, `outpost-wave`
  (`src/sim/outpost/state.ts:62-70`).
- Town alert: `call-completed` and `alert-changed`. No quarry room has a
  dispatch file, so `alert-changed` never fires there today.
- `hall-detect.ts:48-70` already credits knock-outs to players: a `flattened`
  with `by` set to a credited player's character, deduplicated by target.
  Copy its rule; don't import the Hall.
- "Beaten for good" has not landed: src has no defeated or gone state. It is
  Part 2 of `handoff-prompts/owner-knocked-out-flies-off.md` (builder
  `session_017WiGzJC6UCvT2PtVr2dn8v`). Until it lands, *enemies defeated* =
  distinct bad guys flattened by a credited player during the run. When it
  lands, switch to its event in a one-line change.

**Getting events to a page, and drawing them.**
- `step()` returns `SimEvent[]`. The server pushes them to `gw.events`
  (`src/server/game.ts:182-185`), sends them in each snap as `ev` (l.536),
  then clears them (l.540).
- The page reads `net.latest().events` in `watchHeistEvents`,
  `watchHallEvents` and `noteRecruits` (`src/client/main.ts:276-284`). Add a
  `watchStageEvents` the same way.
- Banners: `queueBanner({key, text, frames?, color?})`
  (`src/client/draw/banner.ts:39`). This is the only lettering the game has
  (no pixel font, MA-02).
- The one overlay with a button is the DOM menu `#game-menu`
  (`src/client/start.ts:438-523`, closed by Close or a backdrop tap). The
  Hall card (`src/client/draw/hall.ts:358-380`) is canvas with no button.

**Keeping the result.**
- A saved game (`src/server/saves.ts:33-59`) keeps the whole `World` minus
  the players, so a new additive `World` field (e.g. `world.stages`) is
  kept with no store change.
- `world.levels` is declared at `src/sim/systems/level-explore.ts:15`;
  `levelProgress` is in `src/sim/levels.ts:21-30`.
- The level's sign is `drawLevelEntrances` / `drawLevelSigns`
  (`src/client/draw/levels.ts:62,111`).
- The menu row: `main.ts:347-352` → `levels()` → `start.ts` `fillLevels`.

**A new content kind:** copy `src/content/kinds/defeat.ts` (an interface, a
`declare module` on `Content`, `source: {dir: 'stages'}`, `parse` with the
`read` helpers, and `check` for cross-references). Kinds, systems
(`src/sim/systems/`) and scenario facts (`src/scenarios/facts/`) all
self-register.

**Roster:** grappler, infiltrator, flyer, brawler and skirmisher
(`content/roster.json`). Every `step16-*` route scenario covers only the
flyer, the grappler and the infiltrator. The brawler (18×28) cannot clear the
camp's three-tile block (`docs/plan/step-21.md:214-221`). In the depot, the
cellar hole at column 23 does not fit the grappler (18 px).

**Scenarios at risk when placements move.** 66 `step16-*` files. 18 use
`placements: true`:

- present-{road, ridge, tower, depot, pit}
- mood-{brute, fighter, heavy}-hit
- toll-{paid, rage, walk-past}
- no-waves-on-the-road
- door-unseen
- caught-escape, caught-escape-cave, caught-fight
- zero-alarm-ledge (3000 ticks), zero-alarm-roof (1740 ticks)

Others that touch the quarry:

- step7-waves-reach-the-hero-depot
- step14-{quarry-discovered, find-cave, find-pocket, hidden-cave-counts, all-found-opens-cantina, outside-every-level}
- step9-{fades, hard-hit-knocks-loose, hard-hit-knocks-loose-control}

These are this step's to re-time. A zero-alarm route that stops passing is a
quiet way that broke: re-route the placement, not the scenario's claim.

## The pushes

**Push 1: you can lose in the quarry, and the depot's waves reach you.**
- Add `content/defeat/quarry.json`: rooms = all six quarry rooms, seizers =
  outpost-fighter, heavy-fighter, brute (`DRAFT:`; leave the toll-keeper
  out, he is a toll), downs 3 (`DRAFT:` between the street's 2 and the
  camp's 4), window 60, beat 1. It lands at `quarry-road` door
  `to-courtyard` with `follow: true`, words "Beaten. Back to the start of
  the quarry" / the prize line.
- Fix the depot gap so a called wave reaches a hero on the floor at columns
  53-60. Pick the fix by measuring (`step-7.md:347-358` lists three); a
  `leaveIdle`/`tryAgain` that sends idlers home is the outpost's data, not
  code.
- Scenarios `step22-beaten-to-entrance` (control: the file `on: false`, and
  the hero stays where he fell) and `step22-wave-reaches-hero` (the hero at
  column 56; a wave body comes within reach).
- If the Step 21 builder has no client banner for `thrown-out` on `main`
  when you start, message them; don't write one.

**Push 2: a stage, and starting over.**
- `content/stages/iron-quarry.json`: its level, its entrance (room and door),
  its end (room + a tile box at the depot's far east end, seen from the
  depot's west door), the star thresholds (placeholders until push 3
  measures them) and `on`.
- `stage-*` systems. Entering the stage's level starts a run
  (`world.stages[id]`: started tick, tries, counts, state). A `thrown-out`
  inside the stage counts a try.
- When no player is left inside any of the stage's rooms (solo: at once),
  the stage is restored. Every placed person goes back to their post: whole,
  not flattened, not seized, not angry, not carried. Wave bodies are removed.
  Each signal post's state and the episode are cleared. Each room's
  `world.rooms` state is put back to what it was at first population.
  Taken things are back.
- Restore from a snapshot taken when the stage's rooms are first populated
  (`INTENT:` the stage is the owner's exception to D-077, inside a stage
  only), never by re-reading files at run time, so a saved game restores
  the same way.
- Kept for good: the level's found pieces, a power source discovered, a
  recruit. Pieces live in `world.levels` and `completion`, so don't touch
  them.
- Scenarios:
  - `step22-restart-restores` (break a crate, flatten a fighter, start the
    horn, be thrown out: everything is as it began and tries = 1). Control:
    the stage `on: false`, and the crate stays broken.
  - `step22-friend-inside-no-restart`: two players, one thrown out, the
    other still in the ridge, and nothing is restored.

**Push 3: the end, the result, the stars.**
- Reaching the end emits one `stage-cleared {stage, ticks, defeated, alarms, tries, unseen, hoard, stars}` per run.
- *alarms* = completed horn calls.
- *unseen* = no bad guy of the stage became aware of a player during the run.
  Use the sight or mood event the outposts and NPC docs name, and log which.
- *hoard* = `depot-hoard` taken out.
- Stars are three thresholds per stage, measured by scripted runs (a slow
  clear, a good one, a best one). Write the three runs' numbers into the
  builder notes. `DRAFT:` 1 = finished; 2 = under the good time or at most
  1 try; 3 = 2's rule and (unseen or no alarm completed).
- The result is kept in `world.stages[id].best {stars, ticks}`. The level's
  sign and menu row show the best stars and time (an additive edit to
  `levels()` / `fillLevels` / `drawLevelSigns`).
- Scenarios:
  - `step22-cleared-stats`: the event's numbers equal what the script did.
  - `step22-stars-edges`: one tick either side of each threshold.
  - `step22-each-hero-{fights,sneaks}-{hero}`: all five heroes, alone, from
    the entrance to the end, one fighting and one sneaking. A hero who can't
    get through gets a way through: a placement, a ledge or a crate, never a
    notice. If that touches a `step16-*` claim, re-route it and say so.

**Push 4: the victory screen.**
- `src/client/draw/stage*.ts` and `watchStageEvents`. STAGE CLEARED, large.
- One to three stars, one at a time, each with a sound (an existing sound id
  from `content/sounds/`, `DRAFT:`).
- Then the statistics, each counting up: time to clear (m:ss), enemies
  defeated, alarms raised, tries, unseen (shown when true), the hoard (shown
  when carried out).
- A Continue button under the thumb, inside the phone's safe area. `INTENT:`
  there is always a way out: the screen holds nobody, and it does not stop
  the world.
- Each player dismisses their own screen: it is the page's state, not the
  world's.
- `scripts/e2e/stage.ts` on the phone page by touch:
  1. Walk in and be beaten: you are at the entrance, and the stick moves you.
  2. A scripted clear shows the screen, and the stars and statistics are
     drawn inside the safe area.
  3. Continue gives the stick back.
- Screenshots at the e2e's three phone sizes go under
  `docs/plan/step-22-shots/`, plus one each of the screen mid-count and the
  beaten moment.
- Two connections: both pages get the event, and one dismissing does not
  dismiss the other.

**Push 5: lots of enemies, and found without being told.**
- More bad guys of every kind with a sheet (outpost-fighter, heavy-fighter,
  brute, lookout), so each room asks something different. `DRAFT:` road 4,
  ridge 5, tower 4, depot 7 + waves, pit 3.
- A second caller: a lookout on the ridge with a signal post whose wave comes
  from the tower side. Keep the on-screen cap on bodies.
- The first screen of the road shows the first bad guy and the first signal
  post before either sees you.
- The entrance sign says it is a stage: the name plus the best stars once
  there is a best.
- Each quiet route still clears unseen. Re-run push 3's hero scripts, and
  re-measure the star thresholds if they moved.

## Traps

- **The restore and the network.** The page copies the whole world. A body
  teleported home must not interpolate across the room (see
  `docs/mechanisms/network.md` "Traps", "Effects: the world moving a player's
  character"; the throw already handles its hero). Look at it on the phone
  page.
- **Ids.** Wave bodies are `<outpost>:w<n>`. A restore that keeps the counter
  but deletes the bodies is fine, and reusing ids is not needed. Never rename
  a placed id (CLAUDE.md, "Don't rename or remove ids once deployed").
- **The restore must not run outside a stage.** Its control scenario (the
  stage `on: false`) is what proves it.
- **Timing scenarios.** The depot fix and push 5 move bodies, so count which
  `step16-*` and `step7-*` move before you push. Never weaken a claim to make
  it pass.
- **Two rules for one thing.** Defeat is Step 21's rule, beaten-for-good is
  Part 2's, and the chase is `owner-enemies-chase-alarms.md`'s (engine-wide;
  it will send the lead its quarry rows). Use them; don't write parallel ones.
  A change to `content/defeat/`'s kind or to the `defeat-*` systems is asked
  of Step 21's builder.

## Out of scope

The Bandit Camp, the castle street and the undercroft (builders are in each
tonight), and any chase or sight logic. Combat numbers over heads (D-020: the
result screen is the only place numbers appear). A pixel font. Accounts or
leaderboards. The camp as a second stage (one file later, not now).

## Decided vs. open

Decided: `docs/plan/step-22.md` "What's decided", and the `DRAFT:` numbers
above. Yours to decide, `DRAFT:` and logged: whether the clock stops while
the menu is open (`DRAFT:` it does not; the world doesn't pause), and what
a second player joining mid-run does (`DRAFT:` they join the run, and its
clock and counts are shared). Nothing here waits on the owner.

## How it gets verified

For each push: `npm run build`, `npm run check` (every scenario, each new
one with its control watched failing), `npm run gates` (6 of 6), then
`npm run e2e`. After pushing, `npm run check:deployed` and
`npm run check:live`. Read `/debug/errors` on the live address before each
code push (`docs/verifying-and-finishing.md`). Push 4 commits the
screenshots. The lead looks at them, and says so, before Step 22 closes.

## Definition of done

The five pushes are on `main` and live. Each `DRAFT:` is in
`docs/decisions-log.md`. `docs/mechanisms/stages.md` is written and indexed
in `docs/mechanisms/README.md`. `INTENT:` at the restore and at Continue,
each with its line in `docs/deliberate-designs.md`. Builder notes hold the
star-threshold runs and each hero's result. SOP phase 6's rows apply: a new
mechanism, a new content kind and new decisions.
