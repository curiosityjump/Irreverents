# Levels: where a place starts, and how much of it you have seen

**Reference.** Open before touching `content/levels/`,
`src/content/kinds/levels.ts`, `src/sim/levels.ts`,
`src/sim/systems/level-explore.ts`, `src/client/draw/levels.ts`, the
levels rows in the menu (`src/client/start.ts`), `scenarios/step14-*.json`
or `scripts/checks/step14-levels.ts`. Built by Step 14 slice A
(2026-11-23); the step is `docs/plan/step-14.md`.

## Why it exists

The owner, 2026-11-23 ~18:10 UTC, playing on a phone: *"Not finding clear
'level entries' with discovered indicators etc"*. The library: D-078 ("each
substantial playable level/region should have clear measures of
completion") and D-079 ("An EXPLORED % … player knows there's more to
discover without the game revealing WHICH route, room or secret is missing.
Hidden rooms should contribute to the percentage"). So a level is data, its
doorways in are drawn as entrances, and they show whether it is discovered
and how much of it, as a pie, never as a list or a count of places left.

## The level file (`content/levels/<id>.json`, all `DRAFT:`)

```json
{ "id": "iron-quarry", "name": "Iron Quarry",
  "rooms": ["quarry-road", "quarry-ridge", "..."],
  "entries": [{ "room": "courtyard", "door": "to-quarry" }],
  "look": "mine" }
```

- `name` is shown (sign, banner, menu); a name is data, never in an id.
- `rooms`: a room is in one level at most. A room in none (the test rooms)
  explores nothing.
- `entries`: doorways from a room outside the level whose far end is
  inside. Empty for where everyone starts (`castle-town`).
- `look`: the entrance art, a look `level-entry-<look>`: `arch`, `gem-door`,
  `mine`, `portal` (`LEVEL_LOOKS` in the kind file).
- The check refuses a room or entry door that does not exist, an entry
  from inside the level or leading elsewhere, a hidden entry door (an
  entrance is a sign, and nothing may point at a hidden door) and a room in
  two levels. Room controls with their own map leave `levels/` out
  (`scripts/lib/room-controls.ts`), as they do outposts.

Tonight: `castle-town` (throne room, street, courtyard, undercroft,
gallery: 13 places), `bandit-camp` (outpost, 1), `iron-quarry` (six
quarry rooms, 13), `cantina` (1).

## The record (`world.levels`)

`{ "<level id>": { "seen": ["quarry-road", "quarry-depot/strongroom", …] } }`,
oldest first, at the top of the `World`. A level with an entry is
discovered. **Places** are each room (`<room>`) and each of its `areas`
(`<room>/<area>`), hidden ones included, so the total is fixed from the
first tick (`levelPlaces`).

- **Written by** `systems/level-explore.ts` (order 610, after the doors):
  each tick, for each body someone plays, its room and any area its middle
  is in. `INTENT:` it reads where the body is, never `changed-room`: on the
  server the page owns its body's `room`, so no door event fires there.
  `INTENT:` a body nobody plays explores nothing.
- **Only grows**; nothing deletes (a page takes top-level fields by key,
  so a deleted one would linger there).
- **A page's own world** runs the same system for its own hero, adding
  only what the server adds a moment later; each snapshot replaces it by
  key (`docs/mechanisms/network.md`). `DRAFT:` so the page shows its own
  discovery a snapshot sooner.
- **Kept** with a kept game, as every top-level field is
  (`docs/mechanisms/saves.md`). `main` is not saved; a `?room=` world is
  forgotten; nothing is stored outside a world.

`levelProgress(world, content, id)` (`src/sim/levels.ts`) says
`discovered`, `seen`, `total` and `quarters`: the pie, seen ÷ total in
quarters rounded down, 4 only when every place is seen. One place in 13 is
still an empty pie; the name on the sign is what says "discovered".

## Drawn (`src/client/draw/levels.ts`, three lines in `render.ts`)

- **The entrance**: the look `level-entry-<look>` (32×32, cut by the props
  lane from P05's top row: `content/looks/levels.json`,
  `tools/art/props/drive.py`), standing on the doorway's floor, centred on
  it, after the doorway's own arch and before the working parts.
- **The sign**, after the working parts (a gate never covers it), behind
  the bodies: not discovered, the empty ring alone (`level-pie-0`) and no
  name; discovered, the name in the pixel font and the pie
  (`level-pie-<quarters>`) on a dark plate, 12 px above the art (clear of
  the Go-in arrow). `DRAFT:` a sign that would overlap another is lifted
  above it (the courtyard's quarry and camp doorways are five tiles apart).
  A level's pieces (`drawPieces`) sit on the name's line, between the name
  and the pie, when they are three or fewer (`INLINE_PIECES_W`; phone-HUD
  brief, `DRAFT:`: one grey piece alone on a second line read as an empty
  line); more keep their own row under the name.
- **The banner**: the first time this page sees the level its own hero is
  in become discovered, the name across the top for two seconds.
  `INTENT:` it takes no input and stops nothing.
- **The menu** (`setUpMenu`, `levels` option from `main.ts`): "Places
  found", a row per discovered level with its pie, read when it opens.
- **A stage's best** (Step 22 push 3, `docs/mechanisms/stages.md`, "Shown"):
  three stars under the sign's name, and on the menu row the stars and the
  best time (HTML, not the picture).
- `INTENT:` no digit anywhere (`t-no-numbers`), no list or count of what
  is missing (D-079). This is the one sign a door may carry; the check
  refuses a hidden door as an entry.
- `window.irreverents.drawn.levels`: `{ entrances: [{ level, room, door,
  look, discovered, name, quarters, pieces?, best? }], banner }`.

## Pieces (Step 14 slice B, `DRAFT:` throughout)

D-078: hidden pieces that build a thing nobody named while you collect
them. `content/completion/<level id>.json` (`src/content/kinds/completion.ts`):

```json
{ "id": "castle-town", "pieces": [
  { "id": "town-1", "room": "castle-street", "tile": [8, 7], "look": "item-gear" },
  { "id": "town-2", "from": { "thing": "street-goods-rare" } } ] }
```

- A piece is **placed** (`room`, `tile`, `look`: a cut `item-*` loose item)
  or comes **`from`** something: a once-only placed thing taken (its
  `takenBy`, read as state, so an old kept game is not locked out), or a
  prize the heist slice banks (`world.banked`, read with a default).
  `builds` (what the set makes) is free data until push 3. **Ids never say
  what anything is.** The check refuses a piece in a solid tile, outside
  its room, in a room outside the level, a `from` thing that is not a
  once-only thing of the level, a look that does not exist, and a piece id
  used twice. Whole-map room controls leave `completion/` out.
- **`world.found`** `{ "<level>": ["town-1", …] }`, top-level, only grows,
  kept with a kept game, the world's (a friend's find is yours). System
  `completion-find` (620): a body someone plays whose box overlaps a placed
  piece's tile finds it (`INTENT:` a crate or a guard finds nothing); a
  `from` piece when its thing is taken or its prize banked. Events
  `piece-found {level, piece, by, player}` and, on the last,
  `set-complete {level}`. It runs in a page's own world too, adding only
  what the server adds.
- **A hidden place found** (push 2): system `completion-places` (605, just
  before `level-explore`) emits `place-found {level, place, by, player}`
  the first time a played body's middle is in a hidden room or a hidden
  area that `world.levels` does not list yet; it keeps no state of its own,
  so a kept game never flashes a place twice. The page flashes the level's
  pie at the top for two seconds (read from the record, so a friend's find
  in another room flashes too) and plays the pack's secret chime (moment
  `secret-found`, `content/sounds/secret-found.json`, from the server's
  copy of `place-found` or `piece-found` only). `INTENT:` nothing is drawn
  in the room.
- **Drawn** (`src/client/draw/completion.ts`, two lines in `render.ts`): a
  glint at every unfound placed piece in the room (`fx-pickup-glow` under
  the item, a one-pixel bob, a sparkle once a second), behind the bodies;
  a pop (`fx-pickup-get`) where one is found; and, drawn last over
  everything, a strip at the top for two seconds: the flashing pie (a
  hidden place found) and/or a row of the level's pieces, grey with the
  found ones gold (the cut 12x12 `piece-grey`/`piece-gold`, plain shapes
  if missing). The same row is under the name on each discovered entrance
  sign (`drawLevelSigns`, `drawn.levels.entrances[].pieces`) and on each
  menu row (`.st-pieces`, `data-pieces="gold grey …"`). `INTENT:` a glint
  marks a piece, never a way, and no digit (`t-no-numbers`).
  `drawn.completion`: `{ glints, row, pops, place }`.
- **What a set builds** (push 3): `builds: { character, room, tile }` in
  the set's file. System `completion-build` (625): when the set is
  complete, a body of that character, id `built:<level>`, stands there
  (put back if ever missing), and `set-built {level, entity, room, x, y}`
  is emitted; from then on it is an ordinary body. `INTENT:` only in a
  world that holds placed bodies (a page's own world would make a local
  copy). The page: the level's pieces spiral in to the spot, then a burst
  (`drawn.completion.snaps`). Bodies `set-castle-town` (heavy: the
  grappler's; on the throne room's dais), `set-iron-quarry` (light; the
  quarry road's start), `set-bandit-camp` (light; the courtyard by the camp
  doorway, beside a plate); sheets by `tools/art/sets/make.py` from
  approved sheets. `INTENT:` never named in an id, a log or a note (D-078).
  Proof: `step14-set-builds` (the last piece over the awning: the body
  appears that tick on the dais floor; control: no placements, nothing
  built), `step14-set-thrown-through-window` (the grappler throws the
  town's through the stained-glass window into the undercroft; control: no
  throw). Shots `snap-sideways`, `built-*`.
- **The complete sets (D-089, D-090):** with every level's set complete
  (`everySetComplete`, `src/sim/completion.ts`), the cantina's door takes a
  chased hero; the chasers follow in (`docs/mechanisms/cantina.md`).
- **Tonight (push 1):** `town-1` just over the shop's awning on the first
  street screen (all three heroes take it with a held Jump from under the
  awning; the grappler's box reaches it on a small hop); `town-2` the shop's
  special good at column 16 (`look: "special"`, drawn with the cut
  `goods-special`). Two light crates on the street at 31 and 34.
- **Push 2:** the town's six: `town-3` behind the courtyard gate's bars
  [27, 7], `town-4` in the undercroft's vault [2, 12] (behind the cracked
  wall; a light crate, `undercroft-crate`, now lies in the passage at
  column 24, `content/placements/undercroft.json`), `town-5` in the secret
  chamber [9, 4], `town-6` on the gallery's balcony [7, 2]. The quarry's
  five (`content/completion/iron-quarry.json`): `quarry-1` the road's
  flyer ledge, `quarry-2` the ridge's crawl pocket at its far wall (a hop
  over the drop), `quarry-3` the pit's out-of-reach ledge (wings only),
  `quarry-4` the hidden cave's west step, `quarry-5` the depot's hoard
  once banked. The Bandit Camp's one, `camp-1`, is its strongbox once
  banked (`content/completion/bandit-camp.json`). Reached in scripted runs: `town-3` by
  `step3-plates-one-and-a-weight`, `town-5` by `step3-secret-by-size`,
  `town-6` by `step3-over-the-roofs`, `quarry-1` by
  `step16-secret-ledge-flyer` (their own scenarios, which do not assert
  it), and the four below.
- Proof: `step14-find-awning-{grappler,infiltrator,flyer}` (a crate sitting
  on the piece's tile from tick 0 finds nothing; control watched to fail:
  the played-body test removed), `step14-find-special-good` (an ordinary
  good taken first finds nothing; control: any taken thing counted);
  `scripts/checks/step14-found.ts` (two connections: one finds, the other's
  own world has it; kept across a rebuilt server; control: saving off);
  e2e `glint-seen`, `glint-found` (`scripts/e2e/glints.ts`, by touch, one
  held Jump; control `E2E_TOUCH_BREAK=jump`). Shots
  `docs/plan/step-14-shots/glint-*`, `found-*`.
  Push 2: `step14-find-vault` (`placements: true`: the grappler throws the
  undercroft's own crate from sixteen tiles back, the wall breaks, the
  crate comes to rest on the piece and finds nothing, the grappler takes
  it; control: no throw), `step14-place-found-once` (the undercroft on
  tick 0, the vault once though entered twice; control: the "already
  seen" test removed), `step14-find-pocket`, `step14-find-cave` (control:
  the hop / the jump left out); e2e `place-flash` (Use at the cellar
  doorway into the undercroft by touch; control `E2E_TOUCH_BREAK=interact`)
  and `pieces-menu`. Shots `place-*`, `menu-pieces-sideways`.

## Proof

- Scenarios (fact `level`, `src/scenarios/facts/level.ts`):
  `step14-quarry-discovered` (undiscovered with 13 places before; through
  `to-quarry` by Use, discovered with exactly the road),
  `step14-hidden-cave-counts` (the hidden cave in the total from tick 0,
  not seen until walked into), `step14-outside-every-level` (a hero in a
  room outside every level and a crate nobody plays in the quarry write
  nothing). Controls watched to fail (2026-11-23): hidden places left out
  of the total (7 places, not 13); the played-body test removed (the crate
  discovered the quarry).
- `scripts/checks/step14-levels.ts`: the four refusals with the real files
  passing, and a kept game on a real server: a hero put on the road, the
  server and the page record it, everyone leaves, a new server on the same
  store loads it, the server's world and the joining page's own world have
  it, a new code does not. Controls watched to fail: the room-in-two rule
  removed; saving off for the check's code.
- `npm run e2e`, facts `level-*` (`scripts/e2e/levels.ts`), a phone by
  touch: at the quarry's doorway the mine entrance, the empty ring and no
  name (`level-entrance`); in by Use (the banner says "Iron Quarry") and
  back, the name and the world's pie (`level-found`; one place of 13 is
  still the empty pie); into the camp and back, its full pie
  (`level-full`); the menu by touch lists the three levels found with
  their pies and Close shuts it (`level-menu`). Screenshots, sideways and
  upright: `docs/plan/step-14-shots/` (copied from a run's `e2e-out/levels/`).
