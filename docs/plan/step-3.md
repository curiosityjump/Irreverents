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
  Each is a kind of object described in data and placed by data.
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
  phone already does.
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
- How a player learns where their friend went (an edge marker, a door
  that shows who is beyond it). Step 5 owns the on-screen part; agree it
  through `docs/architecture.md`.

## Feedback signal

1. `npm run check` validates every room: all reachable, doors resolve,
   spawn points stand on ground, no inescapable pocket (control: a room
   with a sealed pit fails the check).
2. Two scenario scripts each walk one unadvertised route from the throne
   room to somewhere the obvious doors don't lead as directly.
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
6. `npm run gates` reports gate B as passing.

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

## Briefs

## Open with the owner

## Handoff notes
