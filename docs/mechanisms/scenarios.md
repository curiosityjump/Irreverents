# The scenario harness

**Reference.** Open before writing a scenario, adding a kind of fact, or
touching `src/scenarios/` or `scripts/check.ts` / `scripts/gates.ts`.

## Why it exists

Nobody on the team can see or play the game; the scenarios are how a
session knows a mechanic behaves as written (`docs/plan/step-1.md`, "One
simulation core"). A scenario is data: a room, the players, timed inputs,
and the facts expected. `npm run check` runs every one headlessly through
the same `step()` the browser and server run. `npm run gates` reports the
build gates A–F (`docs/measures.md`, M3) from the scenarios' `gate` tags.

**Scripted checks.** The scenario layer is pure (no sockets), so a check
that needs a real server is a file in `scripts/checks/` default-exporting
a `ScriptCheck` (`scripts/lib/script-checks.ts`: `id`, `gate`, `proves`,
`run(content)` returning what failed). `npm run check` runs each after the
scenarios and `npm run gates` counts its `gate` tag like a scenario's. Add
a file, edit no list. The first is `together` (gate F,
`docs/mechanisms/network.md`).

## The format (`scenarios/<id>.json`)

```json
{
  "id": "jump-onto-platform",
  "gate": "A",
  "proves": "one sentence: what passing this proves",
  "room": "graybox-hall",
  "players": [{ "id": "a", "character": "hero", "spawn": 0 }],
  "inputs": [
    { "player": "a", "from": 0, "to": 54, "x": 1 },
    { "player": "a", "from": 41, "to": 65, "hold": ["jump"] }
  ],
  "ticks": 180,
  "expect": [{ "fact": "standing-on-tile", "player": "a", "at": 180, "tile": [8, 7] }]
}
```

- `id` must equal the file name. `gate` is optional: `A`–`F`.
- A player's `character` is optional: left out, the player gets the first
  party member nobody is playing, exactly as a new player does
  (`docs/mechanisms/party-and-switching.md`).
- `entities` is optional: bodies nobody plays (a crate, a dummy), each
  `{ "id": "dummy-1", "character": "<character kind id>", "tile": [col, row] }`,
  put in the room before tick 0 with their feet on the floor of that tile,
  centred. The entity's id in the world is the `id` given (players are
  `p:<player id>`, so an id may not start with `p:`). Optional `vx`, `vy`
  give it a starting speed (pixels per second, up to 900).
- `"placements": true` (optional, default off) also puts the room's own
  placements (`content/placements/<room id>.json`) in the world, through
  `populateRoom`; facts may then name those ids with `entity` too.
- An input span holds the stick (`x`, `y` from -1 to 1) and/or actions
  (`hold`, ids from `content/actions/`) from tick `from` up to but not
  including `to`. Overlapping spans merge.
- A player or an entity may carry `"room": "<room id>"` to start in
  another room than the scenario's (Step 3; a scenario's `placements`
  still means the scenario's own room). `tiles` is optional: `[{ "room",
  "tile": [col, row], "is": "solid" | "oneway" | "empty" }]` changes
  tiles before tick 0 the way a working part does while the game runs
  (`docs/mechanisms/rooms-and-doors.md`).
- An input span may name `"entity"` (one of the scenario's `entities`)
  instead of `"player"`: it is written to that body's `entity.c.input`,
  which is how a body that is not a player acts (`docs/architecture.md`,
  "Bodies"). Its kind must list the verbs for anything to happen.
- A player's span may carry a **`tap`** (Step 11, `Input.tap`, a tap on
  the game view): `{ "n": 1, "at": "<entity id>" }` taps that body's
  middle as it stands on each tick of the span (authoring sugar: a page
  sends room pixels), or `{ "n", "x", "y" }` room pixels, or
  `{ "n", "slot" }` the party row's chip. A new tap needs a new `n`.
- `"placedRooms": ["cantina"]` (optional, Step 11): more rooms whose own
  placements are put in the world too, as the server's world has every
  room's (the street's door reads the chase list the cantina's systems write).
- `"world": { "roster": [...] }` (optional, Step 13): top-level World
  fields set before tick 0, as the server's `makeWorld` starts a world
  with them (`roster` must name roster characters). Never `tick`,
  `entities` or `rooms`.
- A player may carry `"joins": <tick>`: put in the world at the start of
  that tick, as a friend arriving later (Step 11), instead of before tick 0.
- A player may carry `"power": "<power id>"` (Step 9): they hold that
  power from before tick 0, as if they had taken it (`docs/mechanisms/powers.md`).
- **Ticks:** 60 a second. "At tick N" means after N steps; tick 0 is the
  start. An event's tick is the step it happened in.
- Positions are measured at **the middle of the character's feet**, in
  pixels; tiles are `[column, row]` from 0 at the room's top-left.

## The facts (`src/scenarios/facts/`, one file each)

| `fact` | Says |
|---|---|
| `standing-on-tile` | at tick `at`, `player` is on the ground with tile `tile` under their feet |
| `position` | at tick `at`, `player`'s feet are within `x` and/or `y` `[min, max]` |
| `velocity` | at tick `at`, `player`'s `vx` and/or `vy` (pixels per second) are within `[min, max]` |
| `character` | at tick `at`, `player` is the character kind `is`, and/or a different kind from player `differentFrom` |
| `clear-of-solid` | on every tick within `between`, `player`'s whole box is outside every solid tile |
| `in-room` | at tick `at`, `player` (or `entity`) is in room `room` |
| `event` | event `event` happened (for `player`, if given) on a tick within `between`; optional `count: [min, max]`, and `[0, 0]` means "must not happen"; optional `where: { "target": "dummy-1" }` also requires those fields of the event to have exactly those values |
| `body-state` | at tick `at`, the body has every state in `is` and none in `not` (names of `entity.c` fields: `flying`, `held`, `carrying`, `beat`, `flattened`…), and its hidden wear is within `worn: [min, max]`; give at least one of the three |
| `mood` | at tick `at`, or on every tick of `between`, the person `npc` (placed by the room's placements file; the scenario needs `"placements": true`) is in mood `is` (1, 2 or 3) |
| `alert` | at tick `at`, or on every tick of `between`, the alert of the area `area` (a room id) is `is` (0 to 3); an area nobody has called from is at 0 |
| `event-where` | event `event` whose fields equal everything in `where` (compared whole: `"witnesses": []` means nobody) happened on a tick within `between`; optional `count` as for `event`. For events that name entity ids rather than one `player` or `entity` |
| `chased` | at tick `at`, or on every tick of `between`, the world's `chased` list is exactly `players` (player ids; empty allowed). Needs a cantina in the world (Step 11) |
| `cantina` | at tick `at`, or on every tick of `between`, about the cantina in `room` (the scenario must be there with `placements`): `regulars` exactly these roster characters have a regular, each in the room and inside the edge; `moved` (with `between`) each moved at least that many pixels sideways; `on` whether a brawl is on; `score` `{ "<player>": { "ko", "falls" } }` (Step 11); `party` the world's party in order; `row` with `player`: that player's open party row's character, or `null` for none (Step 11 slice B) |

Every fact that names a `player` accepts `"entity": "<id>"` instead (one
of the scenario's `entities`, or of the room's placements when
`placements` is true): the three body facts read that body, and
`event` matches the event's `entity` field. Give one or the other.

Add a fact by adding a file there that default-exports a `Fact`
(`validate` names what is wrong with how a scenario wrote it; `test`
returns what was true instead). It registers itself.

## Rules that are deliberate

- **Every scenario runs twice and the two runs must match byte for byte.**
  This is the determinism check for the whole simulation.
- **A scenario with an empty `expect` is refused**: it could not fail.
- **`npm run gates` exits 2 when content or a scenario file is invalid**
  rather than printing "no scenario yet", which would hide the breakage;
  it exits 1 when any gate is `failing`.
- **A new scenario needs a failing control** watched once
  (`docs/verifying-and-finishing.md`, rung 3): break what it checks, see
  `npm run check` name the broken fact, restore.

## Authoring

`node scripts/trace.ts <scenario id> [every N ticks]` prints each
body's room, feet, tile, speed and ground state as the scenario runs, and
every event. Write the inputs, give it one placeholder fact, trace it,
then write the real facts from what you see and judge to be right.
