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

**From Step 2, measured 04:43 UTC (bind slice B's layouts):** jump
heights are about 52 px (grappler), 51 px (infiltrator), 47 px (flyer
from the ground, then it flaps; three flaps reach 5 tiles). So no path
anyone *needs* may have a step over 2 tiles. And a switch only offers
members nobody else plays: someone who crawls into the secret as the
infiltrator and switches away may be unable to crawl back. So **the
hidden chamber gets a second way out that any body can take** (a one-way
drop back into the undercroft), and no room may be leavable by one
member only.

## Briefs

- **Slice A** (`handoff-prompts/step-3-a-rooms-and-doors.md`, worker
  `session_017WiGzFewfghZxs2P5YqJss`). Push 1 landed 04:47 UTC
  (`9a4f6a8`) and was re-run by the lead at `3e23a69`: build, check and
  gates green; `step3-guard-follows` watched to fail with doors made to
  skip non-players. Two rooms, both kinds of door, `changed-room`,
  run-time tiles, `doorToward`, 7 broken-room controls. Not verified by
  the lead: the other eight controls the commit lists. Push 2 (the
  way-out validator, door drawing, start room) is running. Format and
  rules: `docs/mechanisms/rooms-and-doors.md`.
- **Slice B** (`handoff-prompts/step-3-b-kingdom-and-parts.md`,
  launched 04:52 UTC): plate, gate, breakable wall, false wall, hiding
  place; `undercroft`, `courtyard`, `hall-gallery`; both hidden routes;
  the secret. Signals 2, 3 and 5.
- **Not briefed yet:** the camera at room edges and on a room change
  (after Step 1's lands, about 06:30 UTC); switching the stand-in
  scenarios to Step 2's real throw.

**Gate B today:** `npm run gates` prints "passing" on 4 scenarios
(signals 1, 3b, 4). It is not gate B until signals 2, 3 and 5 are on
the line.

**Routed from slice A's flags (04:52 UTC):** doors change a body
directly and do not emit Step 1's `move` effect (a walk door keeps
speed; a `move` arrives standing still): put to Step 1's lead.
`boxInSolid` reads the room file, not run-time tiles: told Step 2's
lead. Up is both stick-up and jump on a keyboard, so a doorway also
fires `jumped`: told Step 1's lead. The street's out-of-sight stretch
for Step 4 is building 2's upper room: told Step 4's lead.

**After the usage-limit stop (lead, 08:33 UTC).** Both workers were
stopped at 04:57 UTC; nothing of Step 3 landed after `9a4f6a8`. Resumed
in the orchestrator's order, one worker at a time: slice A's worker
(same session, messaged) finishes the way-out validator and door
drawing; slice B's worker stopped five minutes in and is relaunched
fresh against the same brief once A's push lands. **The start room is
not switched yet:** there is no follow camera on `main`, and the throne
room is 256 px tall on a 180 px screen, so a player on its floor would
be drawn off the bottom. Asked Step 1's lead when its camera lands; if
not soon, slice A adds an optional focus point to `roomOrigin` (pure,
additive) and Step 1 passes the local player to it. If time runs short:
three rooms with one hidden route and the plate gate (this file, "How to
cut it").

**Slice A closed (lead, 08:40 UTC).** Push 2 landed at `96a8c38` and
was re-run by the lead: build, check (15 room controls) and gates green;
a walled-off stretch of the street is refused by name for the grappler
and the infiltrator. The way-out check plays each party member alone
through the real `step()`; a blocking part is a wall to it. Doorways are
drawn as arches. Not verified by the lead: the 15 controls one by one;
anything on a screen (the worker saw the doorway pair on a local build;
nobody has seen the throne room, an edge opening or a phone). **Still
open from slice A, the lead's to do when Step 1's camera is on `main`:**
set `startRoom` to `throne-room` and delete `mapStart` in
`content/game.json` (one line; `mapStart` only tells the map checks
where the kingdom is entered while the start is a standalone room),
then look at the page. Known: `drawRoom` draws the room file's tiles,
not run-time ones, so every part must draw itself (slice B is told).
Slice B relaunched fresh at 08:41 UTC with section 13 of its brief:
four small pushes, stop cleanly by 09:50 UTC.

**The game starts in the throne room (lead, 08:50 UTC).** Step 1's
follow camera landed at `4678680` (both axes, clamped to the room), so
the lead switched `startRoom` to `throne-room` and removed `mapStart`.
Run before pushing: build, check, `npm run e2e` (all facts ok), and the
built page at 844×390 in headless Chromium: the throne room is drawn
with its floor, the king and his speech; walking right goes through the
opening and the view scrolls along the street with its doorways. Not
tried: touch on that page, a real phone, the live address after the
push (`npm run check:deployed` is the next thing to run). The camera is
this step's from here; nothing about it is briefed yet.

**Slice B, push 1 reviewed (lead, 08:50 UTC).** `cb297c0`: plate, gate,
breakable (with `look`), false wall and hiding place, each one system
file, drawn, in the scratch room `test-parts` with six scenarios.
Re-run by the lead: check green; with the gate made to open on one
plate, `step3-gate-waits` and `step3-plates-open-gate` fail. Light pass
(a self-contained slice): the other four scenarios' controls and
anything on a screen were not re-run by the lead. Events relayed to the
Step 6 and Step 4 leads. None of the parts is placed in a kingdom room
yet. Worker `session_017WiGzGm447aaoT1b3PWamZ` is on push 2.

**Slice B, push 2 reviewed (lead, 09:02 UTC).** `5b7e319`: behind the
throne. A false wall in the west wall behind the dais leads through a
hidden opening to a small `undercroft`, whose doorway comes up in the
street at column 7 for now; above it, a window (part `window`, a
`breakable` with `look: window`) that a fast body breaks and falls
through into the same passage. Re-run by the lead: build and check
green; gate B's line now has 5 scenarios including
`step3-behind-the-throne` (signal 2, one of its two). Looked at the
built page at 844×390: the window is drawn in the wall above the dais;
the false wall reads as wall. **One small tell, not fixed:** the wall
tile under the false wall is drawn with the lighter "top edge" line, a
two-pixel ledge in an otherwise flat wall (`DRAFT:`; the owner may like
it as the hint, or want it gone). Not verified: walking through the
false wall on the page (the lead's walk stopped at the dais step);
a real grab-and-throw through the window (the scenario uses a crate
with a starting speed; whether Step 2's throw reaches the 200 px/s
break speed at window height is unmeasured); another player's plate
may flicker between server snapshots (the worker's flag, unseen).
Remaining: push 3 (courtyard, plate gate, gallery, roofs: signals 5 and
the second half of 2), push 4 (the secret: signal 3; `hide` parts
placed).

**Slice B, push 3 reviewed (lead, 09:20 UTC).** `2055ccb`: the
`courtyard` (two plates, a gate, the opening beyond), the `hall-gallery`
(floor, balcony, steps every member climbs) and the way over the roofs
(a hidden opening in the street's east wall at roof height onto the
gallery balcony, which is also the gallery's way out when the gate is
shut). Re-run by the lead: build and check green; `npm run gates` reads
4 of 6 and B's line has 9 scenarios, now covering signals 1, 2 (both
hidden ways), 3b, 4 and 5. On the built page at 844×390 the lead walked
from the throne room through the street into the courtyard: both
plates and the shut gate are drawn and the gate stops a lone player.
Step 6's lead measured the window with a real grab-and-throw: thrown
from a jump the king arrives at 230 px/s and breaks it
(`step6-king-through-the-window`); a standing throw hits the throne
first. **Gate B is still not true by this step's rule: signal 3 (the
secret) has no scenario.** Not verified by the lead: the gate open on
the page with two players; the roof route walked on the page; the
plates between two real devices (a plate another player stands on may
flicker between server snapshots: unseen); a phone. Stand-in still in
use: `step3-plates-one-and-a-weight` drops the crate on the plate, it
is not thrown. Costs: `npm run check` takes about 38 s now (the way-out
check grows with each room) and the build runs it. The cellar doorway
still comes up in the street, not the courtyard. Owed: push 4 (the
secret, signal 3; `hide` parts placed in the street and throne room;
the undercroft's vault), then the camera's edges, the stand-ins, and
"how to add a room" re-read in `docs/architecture.md`.

## Open with the owner

## Handoff notes
