# Rooms, doors, areas and working parts

**Reference.** Open before adding or changing a room, a door or a kind of
working part, or touching `src/content/kinds/rooms.ts`,
`src/sim/systems/room-doors.ts`, `src/sim/room-state.ts`,
`src/sim/room-routes.ts`, `src/sim/room-parts.ts`, a `src/sim/systems/room-<kind>.ts`,
`src/client/draw/room-parts.ts`, `src/sim/check-rooms.ts`, the tile collision in
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

## The map tonight (`DRAFT:` layouts, permanent ids)

```
 undercroft ──[behind the throne]── throne-room ── castle-street ── courtyard ──[plate gate]── hall-gallery
 (hidden)                                │    │    └──────── over the roofs (hidden) ──────────┘ (balcony)
      └── cellar doorway ── up into the street's west end (DRAFT: meant for the courtyard, column 15)
                                              └── doorway, column 20 ── cantina (Step 11)
                                                      courtyard └── doorway, column 23 ── outpost (Step 12)
                                                      courtyard └── doorway, columns 17-19 ── the quarry (Step 16)

 quarry-road ── quarry-ridge ── quarry-tower (foot) ... (top) ── quarry-depot (yard)
                  │   │   └── shelf ──[hidden in the tower]── tower top
                  │   └── chasm and the pocket's drop (holes in the last row) ──▶ quarry-pit
                  └── doorway (columns 70-71) ── quarry-pit's doorway
 quarry-pit ── east ── quarry-depot (cellar) ;  quarry-pit ──[hidden in the pit]── quarry-cave
```

- **The quarry** (Step 16 slice 1, `DRAFT:` layouts, permanent ids; each
  room's `//` says what is where, `docs/plan/step-16.md` is the step).
  The courtyard's enter doorway `to-quarry` (columns 17-19, rows 6-7,
  between the plates) and the road's `to-courtyard` (columns 2-4). The
  main way, road, ridge, tower and depot, is 248 columns (about 12
  screens) and works for every hero alone: steps up and gaps at most two
  tiles, the tower climbed by one-way ledges two tiles apart
  (`step16-across-*`). A missed jump on the ridge falls into the pit
  (nothing kills); the pit's doorway comes back up. Hidden, by the
  rule above: the tower's top-west opening `onto-the-shelf` (the way back,
  `step16-back-*`) and the pit's west opening `to-cave`
  (`step16-hidden-cave-*`). The heroes' secrets: the flyer's ledge on the
  road, the infiltrator's crawl on the ridge, the grappler's rock and the
  depot cellar's cracked wall (`step16-secret-*`); the pit's ledge eleven
  tiles up is a "not yet" (`step16-not-yet-*`). `INTENT:` the ridge's
  crawl pocket has a hole into the pit, so anyone who lands there can
  leave; do not close it.

- **The outpost** (Step 12, `DRAFT:` layout): the courtyard's enter
  doorway `to-outpost` (ground row 7, column 23, beside the east plate) and the camp's
  `to-courtyard` (column 2), both enter doorways so no body of the camp
  is ever carried out (`docs/mechanisms/outposts.md`).

- **The cantina** (Step 11, `DRAFT:` layout): the street's enter doorway
  `to-cantina` (column 20, rows 9-10, between the two buildings) and the
  cantina's `to-street` (column 3, at the west end of its floor). Push up
  to go through either way. What happens inside is
  `docs/mechanisms/cantina.md`.

- **Behind the throne.** The throne room's west wall is three tiles
  thick. At dais level columns 1-2 are a `false-wall` part and column 0
  is the hidden walk door `behind-the-throne`, five tiles tall (rows
  9-13). Above the false wall the wall's inner face (column 2, rows
  9-11) is a `breakable` with `look: "window"`: a body thrown through it
  flies on through the tall hidden door and lands in the undercroft
  (`step3-through-the-window`), so the breach gives the secret away to
  whoever does it. A walker goes under the window, through the false
  wall (`step3-behind-the-throne`, gate B, signal 2).
- **Over the roofs.** In the street, building 2's doorway, balcony and
  step lead to a one-way ledge (row 3, columns 37-46) and the hidden
  walk door `over-the-roofs` in the east wall at rows 1-2, which comes
  out on the gallery's balcony (`step3-over-the-roofs`, gate B, signal
  2). The ledge has no gap: under the ceiling there are only two tiles
  of headroom, so nobody can jump up there.
- **The plate gate.** In the courtyard two plates six tiles apart
  (columns 16 and 22) hold the gate at column 25; beyond it is the
  opening to the gallery. Two players, or one and a weight, open it; one
  alone does not (`step3-plates-*`, gate B, signal 5). `INTENT:` the
  gallery's steps up to its balcony (one-way platforms, two tiles apart,
  each one column under the next, climbed by jumping on the spot) are its
  way out over the roofs when the gate is shut; the way-out check plays
  them for every party member. Columns 1-13 of the courtyard and the
  gallery's ground floor are left empty for Step 7.
- **A hidden walk door is painted as wall** on the side where it is
  marked `hidden` (`draw/room-parts.ts`): a gap in a room's edge is a
  sign. The far end of each hidden connection (the undercroft, the
  gallery balcony) is not marked hidden, so the way back shows as an
  opening there.
- **The secret** (signal 3, `step3-secret-*`, gate B) is in the
  undercroft: a crawl exactly one tile high and five long (row 4,
  columns 11-15) from a ledge into a chamber. Only a body at most a tile
  tall fits (tonight the infiltrator; the rule is the body's box, never
  its name). `INTENT:` the chamber has a second way out any body can
  take: a hole in its floor, two tiles wide for the widest body, dropping
  eight tiles to the passage. That is too far to come back up (the
  flyer's jump and three flaps reach about six and a half:
  `step3-secret-not-by-flight`), but a body thrown up the drop lands in
  the chamber, and that must keep working
  (`step3-secret-another-way`): do not close it, and do not let the
  chamber become leavable by one party member only (a player who crawls
  in and switches character must still get out).
- **The vault.** At the undercroft's west end a `breakable`
  (`vault-wall`, column 4) seals a small hidden area. The way-out check
  counts it as wall, so the vault is not a place it worries about; once
  broken it is open for good.
- **Hiding places** (`hide` parts): `door-curtain` in the throne room
  (column 18, by the east opening) and `awning-curtain` in the street
  (columns 8-9, under the west awning). Step 4 decides what hiding does.
- Not done: the cellar doorway still comes up in the street; it is
  meant for the courtyard (column 15, west of the gate).

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
  tall]`) with `hidden` yes/no; the room itself has `hidden` too. A
  level's completion pie counts them, hidden ones included (D-079,
  `docs/mechanisms/levels.md`).
- **`parts`.** A placed working part: `id`, a `kind` name, free `params`.
  The room file only places it; see "Working parts" below.
- **`hidden`** on a door marks a connection nothing may point at. The
  check refuses a hidden door that carries a sign. Tonight the only sign
  a door can have is an *enter* doorway's drawn arch, so a hidden door
  must be a *walk* door (a bare gap). When doors gain other markers, add
  them to that rule (`rooms.ts`, the `hidden` check), not beside it.

## The two kinds of door

`DRAFT:` both are the Step 3 lead's call in the owner's place
(`docs/decisions-log.md`); an enter doorway also answers the phone's one
context button, Use (decisions-log 2026-11-23 "Doorways by Use", on the
owner's "There is no stick to push up...").

| | `walk` | `enter` |
|---|---|---|
| Where | on the room's edge: first or last column, or first or last row (a hole in the floor is a walk door in the last row) | anywhere inside, standing on a floor |
| Used by | touching it: the middle of the body's box is in the door's tiles | being in it *and asking*: a fresh push of the stick up, **or a fresh press of Use** (`interact`), or `askForDoor(entity)` |
| Arriving | just inside the far room, clear of the far door's tiles, at the same place across the opening, **speed kept** | standing still in the pair's doorway |
| Why you do not bounce back | the two ends are on opposite edges, so you arrive moving away from the door | the stick (or Use) must be let go and pushed again |

- **The door wins the Use press.** On a tick a body stands in an enter
  doorway (`inEnterDoorway(content, e)` / `enterDoorwayAt`, exported from
  `room-doors.ts`), `npc-interact` and `cantina-brawl` ignore its Use
  press, so it never also buys, robs or rings a bell. Measured at
  build: no counter, goods or bell is within reach of any enter doorway
  (`docs/plan/step-5.md`, the "Doorways by Use" handoff note); a thing
  placed in a doorway would be unusable there. `DRAFT:`.
- **Shown.** While the page's own character stands in an enter doorway,
  the Use button reads "Go in" with a small door-and-arrow look
  (`showGoIn` in `src/client/touch.ts`, `data-state="go-in"`, CSS
  `.go-in` in `index.html`), and an up-arrow bobs over the doorway
  (`src/client/draw/door-hint.ts`; a `door-hint` look replaces the drawn
  arrow). Scenario `step3-enter-doorway-by-use`; e2e facts `door-go-in`,
  `door-use` (`scripts/e2e/doors.ts`, screenshots in
  `docs/plan/step-5-shots/doors/`).
- **Any body.** `INTENT:` the door system never tests for a player. A
  body asks for a doorway through its `Input`, whoever supplies it (a
  player's device, or `entity.c.input` for a body nobody plays).
- **A door that refuses** (Step 11, D-088): an *enter* doorway may carry
  `"refuse": "chased"` (only an enter one: a walk door would refuse every
  tick). It does not take a body on the world's `chased` list (players a
  good guard is chasing now; `systems/cantina-chase.ts` writes it in the
  server's world, a page takes it by key) and emits `door-refused
  {entity, player, room, door, why}` once per push, writing the body's
  `c.doorRefused` for the page to show a sign. Only the street's
  `to-cantina` has it; the cantina's own door out never does (`INTENT:`
  there is always a way out). `docs/mechanisms/cantina.md`.
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
each placed part. Parts live in the room's own file, never in
`content/objects/` or `content/placements/`. What the kinds share
(finding the placed parts of a kind in a fixed order, "is a body in this
part's tiles", breaking a breakable) is `src/sim/room-parts.ts`.

### The kinds of part (Step 3 slice B)

`INTENT:` no kind tests which character a body is, and none counts
players (D-006, D-015): they read a body's box, speed and place. Each
keeps its memory in `partState` and each draws itself
(`src/client/draw/room-parts.ts`). `test-parts` is their check room.

| Kind | What it does | `params` | Events | Order, and why |
|---|---|---|---|---|
| `plate` | A floor plate. Its tiles are the open tiles a body stands *in*, just above the floor. Down (`partState.down`) while any body, played or not, rests on the ground with its feet in them; a carried body does not count, its carrier does. | none | `plate-down`, `plate-up`: `{ room, part }` | 520: after physics (500), before gates |
| `gate` | Solid while shut (`blocks: true`). Opens while **all** its plates are down; stays open for the stay-open time after one comes up. `INTENT:` it never shuts on a body standing in it: it waits (there is always a way out). | `plates`: ids of plates in the same room (required); `stayOpen`: seconds (default `world.gateStayOpenTime`, `DRAFT:` 6) | `gate-opened`, `gate-closed`: `{ room, part }` | 530: after the plates |
| `breakable` | A wall, solid until a body is about to run into it sideways at or above the break speed; then its tiles are open for good and the body carries on through with its speed (`blocks: true`). No health: one hard arrival breaks it (D-020). Another system breaks one with `breakPartAt(ctx, roomId, tx, ty, by?)` (`src/sim/room-parts.ts`). | `breakSpeed`: px/s (default `world.wallBreakSpeed`, `DRAFT:` 200: a running hero at 96 does not, a thrown crate or friend does); `look`: `"wall"` (default; drawn as wall with a crack) or `"window"` (a paler pane in a frame), drawing only | `part-broken`: `{ room, part, by, player, speed, look }` (`by` the entity that broke it or null, `speed` 0 when a system broke it) | 460: physics zeroes a body's speed at a solid tile, so it looks at where the body is *about* to be, after `impact-before` (450) has slowed a flying body and before physics (500) |
| `false-wall` | Drawn exactly as the wall around it, never solid. No behaviour, no event. `DRAFT:` identical to wall tonight; whether it should look or sound different is the owner's after playing. | none | none | (does nothing) |
| `hide` | A place to hide. A body standing still on the ground with the middle of its box in its tiles, holding no action, carries `entity.c.roomHide = { in: "<part id>" }`; it is cleared the tick the body moves or acts. What it does to being seen is Step 4's: a hiding body is seen by nobody (`canSee()`, `docs/mechanisms/npc-response.md`, "Seeing"). | none | none | 550: after physics |

`DRAFT:` parts are drawn behind bodies, so a body inside a false wall
shows in front of it (`docs/decisions-log.md`).

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
kind, and the way-out check below.

**Standalone rooms.** A room with no doors is a test room (`graybox-hall`,
other steps' scratch rooms): it is exempt from the map rules, never keyed
on a name. The spawn and row rules still apply to it.

## The way-out check: "there is always a way out", measured

For every room that has doors, and **for every character a player can
be** (the members in `content/party.json`), `npm run check` and `npm run
build` refuse:

- **no way out**: a tile a body could stand on from which it can never
  reach a door of its room;
- **no way back**: a tile from which it can leave but never get back to
  the start room (a one-way drop into a dead end);
- a room with doors that cannot be reached from the start room at all;
- a start room with no doors while other rooms have them.

Each message names the room file, the tile and the character; neighbouring
tiles are reported once ("and 9 more tile(s) beside it").

**How it knows (`DRAFT:` the model).**

- *Where a body could be* is **over-estimated**: every tile a body could
  stand on that is joined to a spawn or a door through tiles that are not
  solid, whether or not anyone could walk there. Being thrown somewhere is
  the game working, so "nobody can reach that pit" is no defence.
- *What a body can do from there* is **under-estimated**, and nothing
  about it is hard-coded: from each such place the check **plays a fixed
  list of simple moves through the real `step()`**, starting from standing
  still, with the character's own verbs and tuning numbers: run left or
  right for 8 to 80 ticks, with no jump, a jump from the start, a jump
  after a short run-up, or jump tapped again and again (which is how a
  flyer flaps); jump on the spot; push the stick up (a doorway). When the
  body comes to rest, the place it rests is one move away. Retune a jump,
  resize a body or add a verb and the check follows without an edit.
- So a way out is never claimed that the simulation did not actually
  perform. A real way out that needs a cleverer move than the list has
  (a chain of precise mid-air turns, another player's help, a thrown
  crate) is reported as missing: the check errs toward "trapped".
- The start room is `content/game.json`'s `startRoom` (`mapStart`, if
  given, overrides it for the map checks only; unused since the game
  starts in the throne room).

**Limits.**

- A body at rest is snapped to the nearest standing place on its floor,
  at most a tile away: the one inexact step.
- Standing places are a body centred on a column (and, for a body wider
  than a tile, centred between two columns). A spot that only fits a body
  at some other offset is not seen.
- Every system runs during the check with one body alone in the world: a
  gate that needs two players is a wall to it. So a room behind such a
  gate needs another way in that one body can take, which is the owner's
  rule anyway (solo is never locked out by headcount).
- **A part that can block is a wall to the check.** A kind declared with
  `blocks: true` (a shut gate, an unbroken wall) has its tiles counted as
  solid for the whole check, whatever its system would do: pessimistic on
  purpose. Controls: `blocking-part-seals-the-way` and
  `open-part-is-accepted` (a control may declare control-only kinds with
  `controlKinds`). A kind without `blocks` behaves as its system makes it
  with one body alone in the world.

**How it is fast (Step 3, 2026-11-23).** Playing every move from every
standing place took 97 s once the quarry's six rooms joined (about 107,000
moves). The check now plays moves lazily and gets **the same answer**
(compared problem for problem against the old exhaustive check on the
real map, every control and three broken copies of the quarry road;
`docs/plan/step-3.md`, the last handoff note), in about 4 s, about 16,000
moves:

- *Way out and way back.* A place stops being played the moment one of
  its moves lands on a place already proved to reach a door and the start
  room (or goes through a door while it is in the start room). A place
  never proved so has had **every** move played, so "no way out" and "no
  way back" are only ever drawn from complete lists (`INTENT:` at the
  site). Places are played nearest-first to a door that leads toward the
  start room (rooms fewer doors from the start first), and each place's
  moves toward that door first, short runs before long ones; the order is
  only for speed.
- *Reachable from the start.* A search forward from the start spawns plays
  one move at a time from the reached place nearest a door into a room not
  reached yet, and stops when every room is reached; it says "can never
  get here" only after every reached place has had every move played.
- A move's result is remembered per place, so no move is played twice.
- The move list itself (`MOVES`) is unchanged; the two orders are checked
  at run time to hold exactly its moves.

It still runs in `npm run build` as well as `npm run check` (and so in
every deploy, dev rebuild, `npm run gates` and `scripts/trace.ts`), and
once more per overlay control in "room controls". The cost now grows with
how far places sit from a door, not with every place times every move; a
map whose places mostly cannot get out (a control) still pays the full
price, which is small for a control's few rooms.

- **A doorway at a wall's edge needs two tiles of height and a free tile beside it** for the way-out check to find it: a one-tile `enter` doorway on the wall column was refused as "no way out" (Step 12, the outpost's side, rows 9-10, column 2). A one-tile doorway on an open floor row (the courtyard's `o`, column 23) passes.

## The controls

`controls/rooms/<name>.json` holds broken rooms: `{ "expect": [text…],
"rooms": { "<id>": <room file> } }`. `npm run check` ("room controls")
lays each over the real content and requires the check to refuse it with
one problem line containing every `expect` text. A control with its own
`"game"` is a whole map of its own (the real rooms and placements, the
levels and the art files named after rooms, are left out), which is how the way-out controls work: `sealed-pit` (four
tiles deep, no door), `one-way-drop-no-way-back`,
`one-way-drop-into-a-loop` (a door is reachable, the start never again),
`room-not-reachable-from-start`, `start-room-has-no-doors`. A control
with `"accept": true` instead of `expect` must *pass*:
`pit-three-deep-is-accepted` is the sealed pit one tile shallower, and
pins that rule from the allowed side. A control that starts
passing, or fails for another reason, fails the check. They are never
files in `content/rooms/`. The same section checks `doorToward` against
the real map. Add a control whenever you add a rule.

The scenarios (`scenarios/step3-*.json`) each had a failing control
watched once; the commit that added them lists which.

## Drawing

`src/client/draw/room.ts` draws an *enter* doorway as a dark arch (or its
look, `door-enter-<w>x<h>`) and a *walk* door as nothing (it is the gap in
the wall). `INTENT:` no arrows, no glow, no text on any door. Every tile is
drawn by whether it *looks* solid (`solidLook` in
`src/client/draw/room-parts.ts`): the room file's solid tiles, false walls,
unbroken wall-look breakables and hidden walk doors' tiles. So a false
wall, a cracked wall and a hidden door are drawn by the very code that
draws the wall around them, with art or in graybox, and no lit edge or
autotile corner can outline a secret. Every working part then draws what
sits on that ground, from the world's run-time state, in
`src/client/draw/room-parts.ts` (called from `render.ts` after the
ground): a gate shut or drawn up, a crack or rubble, a plate up or down,
a window, a curtain. `INTENT:` nothing there points either. How the art
plugs in: `docs/mechanisms/rendering-world.md`.

## Limits, on purpose for now (`DRAFT:`)

- A walk door triggers on the middle of the body's box, so a body shows
  up to half its width into the edge opening before it changes room.
- On a keyboard the Up key is both "stick up" and jump (Step 1's keys),
  so entering a doorway with it also fires `jumped`; the arrival zeroes
  the speed, so nothing is seen. Touch has no such overlap.
- `doorToward` treats every door as usable from anywhere in its room.
