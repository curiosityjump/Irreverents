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
