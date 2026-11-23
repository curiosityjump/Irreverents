# Step 3 — A small kingdom to explore

**Reference.** Plan step; its status line is in docs/plan.md.

## Why

**Owner (Drive, doc 11, D-003), via `docs/vision.md`:**
> World between and among level-regions is fully playable and secret-bearing, with interconnected exploration, not a static selector hub.

**Owner (Drive, doc 01):**
> The game should continually invite: "What if I tried THAT?" Discoveries reward curiosity.

The library's second build gate (doc 24, gate B): "hand-built 4–6 room map
is explorable, revisitable and supports two unadvertised routes."

## Goal

Five connected rooms to run around in together: a throne room, a castle
street, a hidden undercroft, a courtyard and a Hall gallery. Two routes
between them that nothing points at, and one secret that one kind of
character reaches by its own moves (a gap only the tiny one fits
through, or a ledge only the flyer gets to). Two players can wander into different rooms and find
each other again, each with their own view on their own screen.

## What's decided

- **The five rooms follow doc 24's miniature kingdom** ("How a
  ten-minute session becomes actually buildable": "A throne room", "An
  adjacent street", "A hidden tunnel or rooftop", "A small courtyard", "A
  Hall gallery"); "castle street" and "undercroft" are our names for the
  second and third. A proposal, used as the placeholder map (D-096). Room
  ids are contracts once deployed; names and layouts are `DRAFT:`. Leave
  room in each for what doc 24 puts there and later steps place: in the
  throne room "one palace secret and one or two spectacular breaches"
  (Step 6); in the street "a guarded target and simple pursuit" (Step 4);
  in the courtyard a run-up to "a designated breakable roadblock" and in
  the gallery pedestals (Step 7).
- **The secret is closed by the world, never by a name check** (D-006;
  doc 04: "Avoid doors which only work because the game checks for a
  rigid icon match"). The room data gives it a size, a height or a
  weight; the code never asks which character this is. If players get
  someone else in by throwing them, stacking something or using a power,
  that is the game working (doc 04: "Do not covertly disable
  player-discovered solutions just because a puzzle was intended for a
  specific ability").
- **A door carries anyone, not only players.** Moving between rooms is
  one mechanism that a player and a guard giving chase both use, and
  leaving a room never resets what was happening in it (an empty room
  may pause; it does not start over). The owner's rule: "a level
  transition never automatically resets pursuit, and guards may follow
  between regions" (D-077). Step 4 decides who follows; this step makes
  it possible. For a player, the door is one of the effects Step 1's
  netcode delivers (`docs/plan/step-1.md`, "The netcode must let the
  world move a player"): no network code here.
- **Rooms are data** (tiles, doors, spawn points, secrets), validated at
  load. Adding a sixth room is adding a file. Each room, and each hidden
  area in one, has its own id and says in the data whether it is hidden,
  so an explored percentage can be counted from data later (D-079:
  "Hidden rooms should contribute to the percentage"). Not built in this
  step.
- **Geometry here, people elsewhere.** Who and what stands in a room is a
  separate data file that Step 4 owns; this step owns the room itself.
- **The rooms' working parts are this step's too:** doors, a breakable
  wall that hides a route, pressure plates and the gate they open, a
  place to hide (the place; what hiding does to being seen is Step 4's).
  Each is described in the room's own file and run by this step's
  `room-*` systems; they are not `content/objects/**` (Step 2's
  throwables) and are not placed through `content/placements/**`
  (Step 4's people).
- **One honest co-op gate** (golden scenario G-04, doc 12: "Solo player is
  not hard-blocked by player count and may discover physical
  workaround"): a gate held open by two plates. Two players stand on
  them; one player can do it with something heavy thrown onto the other
  plate. Never a door that counts players (D-015).
- **There is always a way out**, checked by the validator, not by eye:
  every room reachable from every other, every door leads somewhere, no
  pit or pocket a character can enter and not leave.
- **Each player has their own camera** (`DRAFT:`; the camera is open,
  O-001). The direction is the owner's: "Players can separate
  geographically online where practical" (S-006), and they like friends
  "not being constantly tethered to one camera" (doc 06). Each phone
  draws its own view, so tonight each view follows its own character,
  into another room too. Whether a room is one fixed screen or scrolls
  is yours to pick, also `DRAFT:`. Doc 24 warns that fully independent
  cameras are "harder later features": keep it to the simple thing each
  phone already does. **Step 1's second-gate worker is writing the first
  follow camera right now** (due about 06:30 UTC). Do not write a second
  one. Until it lands, build the headless parts: rooms, doors, the
  validator. From the moment it lands the camera is yours, in
  `src/client/draw/room.ts`: what it does at a room's edges and when its
  player changes room.
- **"Unadvertised" means no arrow, no glow, no text.** A route is found by
  curiosity (a wall that sounds different, a ledge just in reach).
- **Tiles are drawn from data too:** graybox now, and a 16 px tile atlas
  drops in when the ordered art arrives (`docs/mechanisms/asset-requests.md`).
  The experimental kit in the library (E01) is labelled experimental and
  has known defects (Q-006's note); the S00-01 "grassy ruins" candidates
  are look references, not tile atlases.

## What's open (the lead's to measure and decide)

- The layouts. Read `docs/design-library/02-gameplay-systems/04-world-structure-secrets-and-revisiting.md`
  and doc 24's kingdom section; the level anthologies (docs 25 and 28)
  are proposals to borrow shapes from.
- How a player learns where their friend went. Step 5 draws it (an edge
  marker, a door that shows who is beyond it), and Step 5 has no lead
  until Step 1 closes: don't wait for one and don't draw it yourself.
  This step's half is the fact it will be drawn from: what each player's
  device knows about every other party member (which room they are in,
  and which door of the current room leads toward them). Write that into
  `docs/architecture.md` under your row; Step 5 builds on it.

## Feedback signal

1. `npm run check` validates every room: all reachable, doors resolve,
   spawn points stand on ground, no inescapable pocket (control: a room
   with a sealed pit fails the check).
2. Two scenarios each reach a room from the throne room through a
   connection the room data marks hidden (control: with that connection
   made solid, the scenario fails), and the validator refuses a hidden
   connection that carries a sign or marker.
3. The secret: the intended character reaches it by its own moves; each
   of the others, using only their own moves, does not (control). A
   second scenario gets another character in by being thrown or by
   standing on something, and that must *work*: it is the check that
   nobody closed a way round.
3b. A scripted actor that is not a player walks through a door and
   arrives in the next room, and the room it left is as it was when a
   player returns (control: a door that only moves players fails).
4. Two players: A walks to another room while B stays; each sees only
   their own room; B follows and they see each other again. Headless
   first (`npm run check`); the real-page version needs `npm run e2e`,
   which lands with Step 1's second gate (about 06:30 UTC).
5. The plate gate opens for two scripted players standing on the plates,
   and for one scripted player using a thrown weight (control: one player
   and no weight leaves it shut).
6. `npm run gates` reports gate B as passing, with a scenario for each
   of signals 1–5 on its line (scenarios named `step3-*.json`, tagged
   `"gate": "B"`; one tagged scenario passing is not gate B). Write the
   list under Measure.

Signals 3 and 5 need Step 2's character kinds, its throw and one heavy
throwable. Don't wait and don't make your own: build the secret and the
plates against a body's size, reach and weight with a stand-in body in
the scenario, then switch those scenarios to Step 2's real characters and
throw when they land. Ask Step 2's lead for the weight; say in your
handoff note which scenarios are still on the stand-in.

## Stopping condition

The six signals pass on `main` and live, and "how to add a room" is in
`docs/architecture.md`. **Budget:** closed by about 08:45 UTC, 2026-11-23.

## How to cut it (a suggestion, not a rule)

Land two rooms first (the throne room and the street) so Steps 4 and 6
have somewhere to put people, then the rest. If the night runs short:
three rooms with one hidden route and the plate gate is a shippable
kingdom; the Hall gallery can stay a plain room until Step 7.

## Owns

Room data, the room format, its loader and validator, moving between
rooms, the rooms' working parts (doors, plates and gates, breakable
walls, hiding places), the camera, drawing tiles; exact paths as `docs/architecture.md`
assigns them.


**Four files are shared between steps** (`docs/architecture.md`, "Files
two steps must both touch"): `src/sim/types.ts`,
`src/sim/systems/physics.ts`, `src/client/render.ts` (Step 1 is in it
until its Gate 2 lands) and `content/tuning.json`. In those: additive
edits only, keep each one small, `git pull --rebase` right before
pushing, and re-run `npm run check` after the rebase. That table of
owned paths was written by Step 1 before any other lead existed; if it
is wrong for your step, fix it there and tell the orchestrator.

## Taste, for the owner in the morning

Whether the rooms are interesting to move through; whether the hidden
routes feel like discoveries; the room names and shapes themselves.

## Measure

Taken by the lead, 2026-11-23 04:30 UTC, at `368e1b9`:

- `npm run check`: ok, 3 scenarios, all in `graybox-hall`. `npm run
  gates`: 0 of 6, gate B "no scenario yet".
- One room exists and nothing can leave it: outside a room's grid is
  solid (`src/sim/systems/physics.ts`, `cellAt`). The page always draws
  the start room (`src/client/main.ts:34`); no camera.
- The scenario runner spawns only players, all in one room: no scripted
  non-player body, no fact for "which room".
- The only character: box 12×26 px, jump rises 56.9 px (3.55 tiles) and
  crosses 68 px (4.3 tiles) on the flat (jumpSpeed 320, gravity 900,
  runSpeed 96). A one-tile (16 px) gap already keeps it out and lets in
  any body 16 px tall or less, with no code: the secret is geometry.

**The map, decided by the lead (`DRAFT:`, in `docs/decisions-log.md`):**

```
 throne-room ── castle-street ── courtyard ──[plate gate]── hall-gallery
      │               └── rooftops (unadvertised) ─────────────┘ (balcony)
      └── behind the throne (unadvertised) ── undercroft ── courtyard well
```

- Obvious way: throne room, street, courtyard, through the two-plate
  gate, gallery.
- Unadvertised route 1: a passage behind the throne (the library's own
  example, E-002 "secret behind throne") down to the undercroft, which
  comes up in the courtyard without crossing the street, where Step 4
  puts its guarded target: the quiet way round.
- Unadvertised route 2: the street's awnings and roofs to the gallery's
  balcony, past the plate gate.
- The secret: a one-tile-high crawl in the undercroft to a small hidden
  chamber; the tiny character fits by its size, nobody else does unless
  they find a way (Step 2 must keep the tiny one's box 16 px tall or
  less: asked).
- Two kinds of door: walk-through openings (edges and drops; they carry
  anything, a thrown crate or a guard) and doorways entered with
  stick-up. Rooms may be wider than a screen; each screen follows its
  own character.

## Briefs

- **Slice A** (`handoff-prompts/step-3-a-rooms-and-doors.md`): the room
  format, doors for anybody, the first two rooms, the camera, the
  way-out validator, the start room. Running from 04:35 UTC.
- **Slice B** (not yet written; from A's first push): the other three
  rooms, plates and the gate, the breakable and false walls, hiding
  places, both routes, the secret. Needs Step 2's characters and thrown
  objects for signals 3 and 5's solo half.

## Open with the owner

## Handoff notes
