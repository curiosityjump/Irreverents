# Rooms, doors, areas and working parts

**Reference.** Open before adding or changing a room, a door or a kind of
working part, or touching `src/content/kinds/rooms.ts`,
`src/sim/systems/room-doors.ts`, `src/sim/room-state.ts`,
`src/sim/room-routes.ts`, `src/sim/check-rooms.ts`, the tile collision in
`src/sim/systems/physics.ts`, or `controls/rooms/`. Built by Step 3
slice A (2026-11-23); the plan step is `docs/plan/step-3.md`.

## Why it exists

The owner wants a world that is "fully playable and secret-bearing, with
interconnected exploration" (D-003), where "a level transition never
automatically resets pursuit, and guards may follow between regions"
(D-077), and where there is always a way out (`CLAUDE.md`, design
principles). So rooms are data, a door carries anything with a body, a
room keeps its state when it empties, and `npm run check` refuses a map
that could trap someone.

## The room file (`content/rooms/<id>.json`)

Everything but `id`, `name`, `tile`, `legend` and `rows` is optional, so
a room written before doors existed is still valid.

```json
{
  "id": "castle-street", "name": "Castle Street", "tile": 16,
  "hidden": false,
  "legend": {
    "#": "solid", "=": "oneway", ".": "empty", "1": "spawn",
    "W": { "door": "to-throne-room" },
    "G": { "part": "gate" }
  },
  "rows": ["####", "W.1G", "####"],
  "doors": [{ "id": "to-throne-room", "use": "walk", "hidden": false,
              "to": { "room": "throne-room", "door": "to-street" } }],
  "areas": [{ "id": "upper-room", "hidden": false, "at": [25, 4], "size": [8, 3] }],
  "parts": [{ "id": "gate", "kind": "gate", "params": { } }]
}
```

- **`rows` and `legend`.** One character per 16 px tile. A legend entry
  is `solid`, `oneway` (stand on it from above, pass through otherwise),
  `empty`, `spawn`, or an object placing a door's or a part's tiles. Door
  and part tiles are empty for collision in the room file.
- **A room may be larger than a screen** (20 × 11.25 tiles). `DRAFT:`
  rooms scroll and each screen follows its own character (the camera is
  Step 1's until its second gate lands, then this step's).
- **`doors`.** Each has an `id` unique in the room (a contract once
  deployed), a `use`, where it leads (`to.room`, `to.door`) and optional
  `hidden`. Its tiles are the legend letter's tiles and must be one
  filled rectangle. **Both ends are written**, each naming the other.
- **`areas`.** A named rectangle (`at` `[column, row]`, `size` `[wide,
  tall]`) with `hidden` yes/no; the room itself has `hidden` too. Nothing
  reads them yet: an explored percentage will count them (D-079).
- **`parts`.** A placed working part: `id`, a `kind` name, free `params`.
  The room file only places it; see "Working parts" below.
- **`hidden`** on a door marks a connection nothing may point at. The
  check refuses a hidden door that carries a sign. Tonight the only sign
  a door can have is an *enter* doorway's drawn arch, so a hidden door
  must be a *walk* door (a bare gap). When doors gain other markers, add
  them to that rule (`rooms.ts`, the `hidden` check), not beside it.

## The two kinds of door

`DRAFT:` both are the Step 3 lead's call in the owner's place
(`docs/decisions-log.md`): no door needs a button.

| | `walk` | `enter` |
|---|---|---|
| Where | on the room's edge: first or last column, or first or last row (a hole in the floor is a walk door in the last row) | anywhere inside, standing on a floor |
| Used by | touching it: the middle of the body's box is in the door's tiles | being in it *and asking*: a fresh push of the stick up, or `askForDoor(entity)` |
| Arriving | just inside the far room, clear of the far door's tiles, at the same place across the opening, **speed kept** | standing still in the pair's doorway |
| Why you do not bounce back | the two ends are on opposite edges, so you arrive moving away from the door | the stick must be let go and pushed again |

- **Any body.** `INTENT:` the door system never tests for a player. A
  body asks for a doorway through its `Input`, whoever supplies it (a
  player's device, or `entity.c.input` for a body nobody plays).
- **Order.** The system runs at 600, after physics (500): a door acts on
  where the body is at the end of the tick, and the next tick's physics
  settles it in the far room.
- **Nothing resets.** `INTENT:` the world holds every room's entities and
  state all the time. Do not add an "unload".
- **The event** is `changed-room` (`docs/architecture.md`, "Rooms and
  doors: what other steps read").
- **Drops.** A hole in a floor is a walk door on the `south` edge whose
  pair is on a `north` edge. Whether you can come back up is geometry:
  the arrival door is in the ceiling, and you return only if something
  can reach it.
- **The network.** No network code here, and the door does not emit one
  of Step 1's effects: each device simulates its own character with the
  same `step()`, so a player walking (or flung by a `push`) into a door
  goes through on their own device. If something ever must put a player
  through a door from outside their device, that is `move` then `push`
  (`docs/architecture.md`, "Effects on a player").

## Tiles that change while the game runs

Collision reads `tileAt(world, room, tx, ty)` (`src/sim/room-state.ts`):
a run-time override if one is set, else the room file's cell; outside the
grid is always solid. `setTile(world, room, tx, ty, code | null)` sets or
clears an override; the state is `World.rooms[roomId].tiles`, keyed by
cell index, so it is part of the deterministic world. This is how a
closed gate is solid and an open one is not. A scenario can set tiles
before tick 0 with `tiles` (`docs/mechanisms/scenarios.md`);
`step3-tile-made-solid` proves the hook.

## Working parts

A kind of part is **one system file**: `src/sim/systems/room-<kind>.ts`
declares `parts: { "<kind>": { what, check? } }` and drives its parts in
`run` (read them from `content.rooms[id].parts`; remember things with
`partState(world, roomId, partId)`; change tiles with `setTile`). This
follows how tuning numbers are declared by their reader: no shared list
to edit. `src/sim/check-rooms.ts` refuses a part whose kind no system
declares, listing the known kinds, and runs the kind's own `check` on
each placed part. No kind exists yet; slice B adds plates, gates and
walls. Parts live in the room's own file, never in `content/objects/` or
`content/placements/`.

## What `npm run check` refuses

In `src/content/kinds/rooms.ts` (content only):

- a door that covers no tile, or not one filled rectangle; a walk door
  not on an edge; a door naming a room or door that does not exist; two
  ends that disagree, or are used differently; walk ends that are not on
  opposite edges or not the same size;
- a walk door whose far side is walled up (a body would arrive inside a
  wall), measured for the largest body a player can be;
- an enter doorway with no floor under it; a hidden door with a sign;
- a spawn tile in mid-air, or with no room for the largest body a player
  can be (every party member in `content/party.json`).

In `src/sim/check-rooms.ts` (needs the simulation): a part of an unknown
kind.

**Standalone rooms.** A room with no doors is a test room (`graybox-hall`,
other steps' scratch rooms): it is exempt from the map rules, never keyed
on a name. The spawn and row rules still apply to it.

## The controls

`controls/rooms/<name>.json` holds broken rooms: `{ "expect": [text…],
"rooms": { "<id>": <room file> } }`. `npm run check` ("room controls")
lays each over the real content and requires the check to refuse it with
one problem line containing every `expect` text. A control that starts
passing, or fails for another reason, fails the check. They are never
files in `content/rooms/`. The same section checks `doorToward` against
the real map. Add a control whenever you add a rule.

The scenarios (`scenarios/step3-*.json`) each had a failing control
watched once; the commit that added them lists which.

## Limits, on purpose for now (`DRAFT:`)

- A walk door triggers on the middle of the body's box, so a body shows
  up to half its width into the edge opening before it changes room.
- On a keyboard the Up key is both "stick up" and jump (Step 1's keys),
  so entering a doorway with it also fires `jumped`; the arrival zeroes
  the speed, so nothing is seen. Touch has no such overlap.
- `doorToward` treats every door as usable from anywhere in its room.
