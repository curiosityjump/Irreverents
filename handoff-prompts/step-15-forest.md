# Step 15: the Bramble Forest, a second stage you walk to

**Brief, written by Step 15's lead `session_017WiGzHD8gtSGTegd3n8W4G`, 2026-11-24 ~09:20 UTC.**
Report to that lead (by message, and flags in `docs/plan/step-15.md`, "Builder notes").
Blocking questions: message the lead, `priority: now`, and add them to `docs/questions-inbox.md`.
Push each push as soon as it is green. Stop at about 300k tokens with a handoff under "Builder notes".

## The task, and the row it moves

A second place in the kingdom: a forest you walk to from the courtyard, played
as a **second stage** exactly as the Iron Quarry is (hearts, game over at its
entrance, beaten bad guys stay gone, STAGE CLEARED with stars), with enemies
through it, secrets that each need a different hero, one thing out of everyone's
reach until you bring a power, and a short way back from its deepest spot.
It closes `docs/vision-gaps.md` row 2 ("more than one region") and starts row 7's
"a second biome". Measure rows: M1 and M2 stay green (a push is the deploy); M3
stays 6 of 6 (`npm run gates`, gate B unchanged). The step's own signals are in
`docs/plan/step-15.md`, "Feedback signal"; this brief maps them onto pushes.

## Decided (by the lead, `DRAFT:`, logged in `docs/decisions-log.md` "Step 15: the second place is a forest")

- **The place is a forest.** Id prefix `forest-`; level id `bramble-forest`,
  shown name "Bramble Forest" (data only: the name is a stand-in, never in an
  id). Its shapes come from library doc 04's forest illustration and G-03, cut
  down: a trail, root tunnels, a canopy, an ancient stone door. No mentor, sage,
  creature village, sign, arrow or speech (D-056, D-058; doc 04 "Player
  awareness and map").
- **You walk there** (D-003): a new **enter** door on the courtyard floor →
  room `forest-road` → `forest-trail` (and the rooms beyond). Not a menu.
  A chase follows through doors as anywhere else (D-077); at most one hiding
  place on the road (`DRAFT:`).
- **It is a stage.** One file each, copying the quarry's shape:
  `content/levels/bramble-forest.json` (entries: the courtyard's new door;
  `look: "arch"`), `content/stages/bramble-forest.json` (entrance
  `forest-road`/`to-courtyard`, end at the deepest pocket, stars set from
  scripted runs), `content/defeat/forest.json` (`on: false`, `gameOver` at the
  entrance: the quarry's choice, `DRAFT:` as there), `content/completion/bramble-forest.json`
  (pieces; optional set build). `docs/mechanisms/stages.md` says a second stage
  is data; if anything proves otherwise, that is a finding for the lead, not an
  engine edit.
- **Three things on the first walk, each closed by the world** (doc 04 "Puzzle
  design ethos": no door that checks a name):
  1. a gap one tile high: the infiltrator (12 px tall) crawls in;
  2. a canopy ledge above any plain jump: the flyer flaps up;
  3. a stone gate open only while its plate is held, with a heavy crate beside it
     that only the grappler lifts (Step 3's `gate` part and a plate; the quarry's
     `cellar-rock` is the precedent for a crate only the grappler moves).
  A way round by a throw, a stack or a friend is the game working, and one
  scenario proves one.
- **One more thing, out of all three heroes' reach** (G-03's "long after first
  arrival"). Default: a **boulder too heavy for the grappler** (he lifts 150;
  `content/powers/boost.json` lifts 420 and its note says the throne weighs 400)
  that blocks a hollow in plain sight; the **boost** power (carried by
  `street-villain`, knocked loose and grabbed) lifts it. **Measure first** that a
  boost taken on the street survives the walk to the forest (does it fade, and
  after how long; `docs/mechanisms/powers.md`). If it does not, pick the simplest
  of: the wings from the quarry depot reaching something above the flyer's own
  flaps, the hammer, or the skirmisher; mark it `DRAFT:`, log it. A new body
  needs a new `content/characters/forest-boulder.json`; a new weight is a small
  additive entry in `content/tuning.json` after `git pull --rebase`.
- **Every pocket has a way out any body can take** (`INTENT:` in the room
  note): the biggest hero, started inside, gets out. The deepest pocket's way out
  drops to the trail and stays open (G-03's shortcut; `DRAFT:`).
- **Enemies through it** (gap 1): light fighters and a heavy on the trail, a
  brute where the grappler's gate is, and **one ranged thrower**
  (`ranged-fighter`, Step 24, live at f434f2e in test rooms only) on a high spot.
  One small guarded spot with a lookout and a horn (`content/outposts/forest-*.json`,
  `entries` on both sides as `content/outposts/test-sides.json` does), so getting
  caught brings waves from the sides. A weapon lying about: add a `sources`
  entry for the spear or the hammer in `content/weapons/<it>.json` (one line in a
  shared file: `git pull --rebase` first).
- **Hidden parts are counted** (D-079): every room and hidden area has its own
  id and its `hidden` flag, so Step 14's pie counts them.
- **Art**: no new art tonight. Use, in this order: the forest panorama
  previews under
  `docs/design-library/03-visual-direction-and-assets/bkg-01-runtime-biome-panoramas-1024x180/bkg-01-complete-runtime-pack/previews/forest_waterfall_*`
  for a backdrop, the existing `assets/backdrops/tree-crowns.png` and
  `front-foliage.png`, and P10's TRN-01 (grass/dirt) and TRN-10 (mushroom hollows)
  rows (`.../current-pixel-art-explorations/p10-owner-selected-tagged-terrain-and-interactables/`,
  `tag-index.csv`) for a `tiles/forest.png` atlas, named per room in
  `content/atlases/forest-*.json`. Every cut is `DRAFT:`. Ask Vision Partner
  (`docs/mechanisms/asset-requests.md`) for the full 1024×180 panorama if the
  preview is too small; do not wait for it. A grey-box room counts against us
  (the 07:45 look pass, `docs/plan/step-8.md`).

## The derivation (measured 2026-11-24 at 1ae9c19)

- **A stage is data.** `content/stages/iron-quarry.json` keys: `id, on, level,
  entrance{room,door}, end{room,from,to}, stars{good,best}` (optional `tries`);
  allowed keys in `src/content/kinds/stages.ts`. The check refuses an unknown
  level and a room in two stages. A stage's rooms are its level's rooms.
  `quarry` appears in `src/` in comments only (7 places). Quarry ids are
  hard-coded in `scripts/stage-bot.ts:23-24,57,90` and `scripts/checks/step14-levels.ts`.
- **Game over** returns to `content/defeat/<place>.json` `gameOver`; without one
  it lands in the cantina (`content/hearts.json`).
- **The courtyard** (`content/rooms/courtyard.json`) is 30×9. West edge `W` →
  outpost, east edge `E` → street, `G` (column 25) → gallery, `qqq` (columns
  17-19, rows 6-7) → the quarry, an enter door. Spawns `1`,`2` at columns 3,5;
  `3` at 14. **Columns 7-12 of rows 6-7 are free floor**: put the forest's
  enter door there (three wide, like `qqq`). This is the one edit to an existing
  room; its last editor was the camp's alarms commit 4154e15. Before you push it,
  message the camp builder `session_017WiGzGkuNQcsBDa2oWh23s` and Step 22's lead
  `session_017WiGzF7NsB3KTwXkWUXE63` with the exact diff.
- **The way-out check** (`src/sim/check-rooms.ts`, in `npm run check` and
  `build`) plays real moves for grappler, infiltrator and flyer
  (`content/party.json`) and refuses a room with no way out or back. A room only
  one hero can enter: measure whether it accepts one; if not, make that inside a
  hidden area of a room everyone enters (and say so). Build each room doorless
  first (`docs/mechanisms/rooms-and-doors.md`), then join every door in one push.
  A doorway at a wall's edge needs two tiles of height and a free tile beside it.
- **Hero reach:** flyer flaps (the quarry road's `flyer-ledge`); infiltrator
  fits one-tile gaps (the ridge's `crawl-pocket`); grappler lifts 150 (the
  depot's `cellar-rock`). The skirmisher also flaps; the brawler has no unique
  reach. `content/roster.json` starts grappler, infiltrator, flyer, brawler.
- **Placements:** `content/placements/<room>.json` as
  `content/placements/quarry-ridge.json`. Enemy kinds in `content/npcs/`:
  `outpost-fighter`, `heavy-fighter`, `brute`, `outpost-lookout`,
  `ranged-fighter`, `bomb-thrower`.
- **Scenarios:** `docs/mechanisms/scenarios.md`; example
  `scenarios/step22-cleared-stats.json` (facts `event-where` on `stage-cleared`,
  `stage`, `in-room`). e2e cases are modules in `scripts/e2e/*.ts` called from
  `scripts/e2e.ts` (stage at about lines 434-435); copy `scripts/e2e/stage.ts`'s
  shape into a new `scripts/e2e/forest.ts`.

## Pushes, in order

1. **The road and the trail, joined, as a stage.** `forest-road`,
   `forest-trail` (the trail is open to any one hero alone, `DRAFT:`), the
   courtyard door, the level, stage, defeat and atlas/backdrop files, the trail's
   enemies. The gap, canopy and gate are **in view** (their insides may still be
   solid). Signals 1 and 2, `step15-joined` (control: one end of the courtyard
   door removed), `step15-each-hero-crosses-{grappler,infiltrator,flyer}` (to the
   trail's far end and back; control: a one-tile step), `step15-stage-game-over`
   (out of hearts in the forest → at the entrance, stage started over).
2. **The insides.** The root tunnel behind the gap, the canopy, the gate
   chamber, the later thing and the deepest pocket with its shortcut. Signals 3,
   4, 5: for each of the three, the right hero gets in and each other walks up
   and does not; one by a throw or a stack; each hero alone fails the later
   thing, the power (or your fallback) reaches it; the biggest hero gets out of
   each pocket (control: the way out made solid); the shortcut is shut from the
   trail before it is used and open after. Hidden areas and completion pieces.
3. **The guarded spot and the clear.** The lookout, horn and both-sides waves,
   the thrower, the weapon. `step15-cleared` (stage-cleared with stats), a
   caught-then-fight scenario, and three scripted clears (a slow, a good, a best)
   to set the star times. You may give `scripts/stage-bot.ts` an optional stage
   argument, additively, keeping every quarry default; tell Step 22's lead.
4. **On the phone.** `scripts/e2e/forest.ts`: phone-sized page, touch only,
   through the courtyard's new door, along the road, into the trail, switch
   hero, into the gap (control: the door removed). Phone screenshots of the
   road, the trail and each of the three things, committed under
   `docs/plan/step-15-shots/`. Add the "I need to add… a region" row to
   `docs/architecture.md`, and a line for Step 10's lead (the walk to the forest
   as a beat) in `docs/for-the-orchestrator.md`.

## Traps

- **A room in two stages is refused**, and a stage's rooms are its level's
  rooms: `forest-road` belongs to `bramble-forest`, never to the quarry.
- **Don't touch `src/`** (the step's stopping condition counts it to 0). If a
  room needs something the engine can't do, build without it and tell the lead.
- **`content/outposts/` is the camp builder's**: add your own new file only;
  never edit `outpost.json` or `quarry-depot.json`.
- **Never two `npm run e2e` at once** on this machine; the suite takes minutes.
- A weight, speed or tile count you write in a note must be one you measured.
- `docs/decisions-log.md` gets one entry per default you choose (format at the
  file's foot); the "Instead of asking" line is in the owner's words.

## Out of scope (leave alone, even if it looks wrong)

The quarry, the camp, the courtyard's other doors and spawns, the guard-vehicle
sprites (a later push of this step, briefed separately once this lands), the
stage-select rows in the start menu (they read the stage files; if the forest
does not appear there, that is a finding), Step 22's star times, anything in
`docs/deliberate-designs.md`.

## How it is verified

Each push: `npm run build`, `npm run check` (every scenario), `npm run gates`
(6 of 6), and `npm run e2e` for pushes 1 and 4 (and any push touching the
courtyard). Each new scenario has a control watched to fail once (say which in
the commit). Before any push: read `/debug/errors` and `/healthz` `players` on
the live address (`docs/verifying-and-finishing.md`, "The pre-push gate"); after,
`npm run check:deployed` exits 0. The stopping-condition grep in
`docs/plan/step-15.md` prints 0.

## Done

Pushes 1-4 live, `docs/plan/step-15.md` "Builder notes" has a handoff, every
default in `docs/decisions-log.md`, `docs/mechanisms/stages.md` notes there are
two stages, the shots committed. Taste (whether the trail is fun, whether the
boulder makes you want to come back) is the owner's: list it, don't grade it.
