# Brief: Step 3, slice A — connected rooms, doors, a camera, and a validator that proves there is always a way out

Written by the Step 3 lead (`session_017WiGzGUAnvQfWco5vTcMX4`),
2026-11-23 04:30 UTC. The step this serves: `docs/plan/step-3.md` (read
it; its "What's decided" binds you). **Budget: slice done by 06:45 UTC.**
A second slice (B: the remaining three rooms, plates and gates, the
breakable wall, the secret) is written from what you push first, so
**your first push matters more than your last** (section 1).

## 1 · The task, and the measure it moves

Today the game is one room nobody can leave. Make it several rooms a
player, and anything else with a body, can move between; give each
player's screen a camera that follows their own character; and make the
validator prove no room can trap anyone.

**Measure:** `docs/plan.md` M3, gate B, from "no scenario yet" to at
least one gate-B scenario passing (`npm run gates`). It reaches its full
meaning (five rooms, two unadvertised routes) in slice B; do not tag a
scenario `"gate": "B"` unless it really is evidence for "hand-built 4–6
room map is explorable, revisitable and supports two unadvertised
routes". In this slice only the two-room walk and the two-player
separation qualify.

**Two pushes, in this order:**

1. **First push, by about 05:30 UTC: the room format and doors, with the
   first two rooms.** The extended room format (below), the door
   mechanism, the rooms `throne-room` and `castle-street` joined by a
   door, their scenarios, and "how to add a room / a door" in
   `docs/architecture.md`. After it lands, other steps place people in
   those rooms and slice B builds on your format, so from that push on
   **the format only grows additively.**
2. **Second push: the camera, the tile drawing for the new things, the
   reachability validator, and the start room switched to the throne
   room.**

## 2 · What to build

### The room format (additive: `graybox-hall.json` must stay valid unchanged)

Extend `content/rooms/<id>.json` and `src/content/kinds/rooms.ts`. The
exact field names are yours (mechanics); what the format must be able to
say:

- **Doors.** A door is a set of tiles in a room, with an id unique in
  the room, the room and door it leads to, and how it is used. Both ends
  are written (each room names the other); the validator checks they
  agree. Two ways of use, both needed tonight:
  - **walk**: touching it carries you through. For openings at a room's
    edge and for drops (a hole in the floor that lands you at the top of
    the room below). No button: it works for a thrown crate or a guard.
  - **enter**: a doorway inside a room; you go through by pushing the
    stick up while standing in it (the Amazing Mirror door). `DRAFT:`
    stick-up is the control; no new action button.
- **Areas.** A named rectangle of tiles with its own id and a `hidden`
  yes/no, and the room itself carries `hidden` too (default no). Nothing
  reads these yet; an explored-percentage will count them later (D-079).
  Slice A only parses and validates them.
- **Placed working parts, generically.** Slice B adds plates, gates, a
  breakable wall, a false wall and hiding places. Make it possible for B
  to add a *kind of part* as one new file without editing yours: the
  room file places a part (a legend letter or a list entry: its own
  call) with a `part` kind name, an id and free parameters; your loader
  collects them per room as data (`id`, `kind`, the tiles it covers,
  its parameters) and reports an unknown kind by listing the known ones.
  Follow the self-registering pattern (`docs/plan.md`, "What is already
  right"; `docs/architecture.md`, "Self-registering files"). A part must
  be able to make its tiles solid or not *while the game runs* (a gate
  opens): see "tile collision" below.
- **A room may be larger than one screen** (the screen is 320×180 px =
  20×11.25 tiles of 16 px). `DRAFT:` rooms scroll; the camera follows.

### Moving between rooms: a system `src/sim/systems/room-doors.ts`

- **It moves any entity, not only players** (D-077: "a level transition
  never automatically resets pursuit, and guards may follow between
  regions"). The code must never test `entity.player` to decide whether
  a door works. For an *enter* door a non-player needs a way to say "I
  want through" without an `Input`: give it one small documented hook
  (for example a field in the entity's own component that any system can
  set), and write it up for Step 4.
- **Walking through keeps your speed and your place across the
  opening**, and you arrive clear of the far door, so you cannot bounce
  straight back. An *enter* door sets you standing in the far doorway;
  you must release the stick before it will take you again.
- **It emits one event** when anything changes room (who, player or
  null, from room and door, to room and door). Declare it beside the
  system (declaration merging, like `landed` in `physics.ts`). Step 5
  reads it to show where a friend went; Step 4 to chase.
- **Nothing in a room is reset when it empties.** The world holds every
  room's entities all the time; do not add any "unload".
- **No network code.** Each player's own character is simulated on
  their own phone, and the same `step()` runs there, so a player walking
  through a door needs nothing from you beyond the system. A player
  *thrown* through one by somebody else is carried by Step 1's
  server-to-player "effects" (`docs/plan/step-1.md`, "The netcode must
  let the world move a player"), whose names Step 1's worker is
  publishing in `docs/architecture.md` ("Effects on a player") tonight.
  If that section exists when you rebase, say in your system's comment
  which effect a door corresponds to. Do not wait for it.

### Tile collision (`src/sim/systems/physics.ts`: shared, see Traps)

- Today `cellAt()` treats everything outside a room's grid as solid
  (`physics.ts:20`, marked `DRAFT:` for you). Keep that: doors are
  tiles *inside* the grid, so nothing ever leaves the grid.
- Add the smallest hook that lets a part make tiles solid at run time
  (a closed gate, an unbroken wall), reading state from the `World`
  (everything a tick depends on must be in `World` or `Content`:
  determinism). Slice B uses it; in slice A prove it with a test-only
  path or leave it documented and exercised by one scenario of your
  choosing. Additive only: every existing scenario must pass unchanged.

### The first two rooms (`DRAFT:` layouts; the ids are permanent)

- **`throne-room`**: about one screen wide, taller than one screen
  (suggest 20×16). A dais with a throne-sized gap on it at the west end,
  a long floor for a crowd, a balcony or two on one-way platforms, and
  the door to the street at the east end. **Leave the west wall behind
  the dais at least 3 tiles thick and plain**: slice B hides a passage
  there (the library's own example, E-002: "secret behind throne").
  At least 4 spawn tiles.
- **`castle-street`**: wide (suggest 48×12). West door from the throne
  room, an east edge that slice B will join to the courtyard (leave the
  wall solid there now), buildings as blocks with awnings (one-way
  platforms) low enough that the first is reached from the ground, and
  roof tops above them: slice B turns the roofs into an unadvertised
  route. A stretch of at least 12 flat floor tiles for Step 4's guarded
  target and pursuit.
- Use one *walk* door at the edge between them. Also put one *enter*
  doorway pair somewhere useful (for example street level to a
  building's upper floor) so both kinds are proven tonight.
- **Do not delete or edit `graybox-hall`**: 3 scenarios use it
  (`scenarios/jump-onto-platform.json`, `run-and-stop.json`,
  `two-players-independent.json`) and ids are contracts.

### Scenarios need two additions (`src/scenarios/`: Step 1's files, see Traps)

Measured: `src/scenarios/run.ts` spawns only players, all in the
scenario's one `room`; there is no way to script a body that is not a
player, and no fact that says which room someone is in.

- **A fact `in-room`** (`src/scenarios/facts/in-room.ts`, your own new
  file): at tick `at`, `player` (or an entity id) is in room `room`.
- **Non-player actors**, additive and optional in the scenario format:
  a list of bodies (an id, a character kind, a room, a tile, an optional
  starting speed) put in the world with `player: null`. Measured: the
  `verbs` system skips non-players and `physics` applies no friction, so
  an actor given a sideways speed keeps it until a wall: enough to walk
  one through a door. **Check first whether Step 2 has already added
  this** (its worker is adding `populateRoom(world, content, roomId)` to
  `src/sim/world.ts` and `content/placements/`; `git log -- src/scenarios
  src/sim/world.ts` after a pull). If it has, use theirs; if not, add
  the smallest version and say so in `docs/mechanisms/scenarios.md`.
  Existing facts take `player`; let position-like facts also accept an
  entity id only if you need it, additively.
- Optionally a per-player starting room in `players[]` (additive,
  default the scenario's `room`).

### The scenarios (each with a control you watched fail)

Prefix every file `rooms-` (`docs/architecture.md`: "their own checks").

1. `rooms-walk-to-street`: a player walks from the throne room into the
   street and back; in each room at the right ticks, speed kept across
   the door. Control: break the door's target and see it fail.
2. `rooms-enter-doorway`: stick-up in a doorway carries the player to
   its pair; standing in it without stick-up does not.
3. `rooms-guard-follows`: a non-player actor crosses the same door and
   arrives in the next room (step file, signal 3b). Control: make the
   system skip non-players, watch it fail, restore.
4. `rooms-room-remembers`: something left in a room (an actor at rest,
   or the second player) is exactly where it was when the first player
   comes back after 10 seconds away.
5. `rooms-two-players-apart`: A walks to the street while B stays; an
   `in-room` fact for each; then B follows and both are in the street
   (step file, signal 4, headless half).

### The camera and drawing (`src/client/draw/room.ts`; second push)

- Each screen follows **its own player's character**, into whichever
  room it is in, clamped to the room's bounds; a room smaller than the
  screen is centred as now. `DRAFT:` (the camera is open in the library,
  O-001; the owner likes friends "not being constantly tethered to one
  camera"). Keep it simple: no shared camera, no zoom, no easing beyond
  what stops it jittering.
- Measured: `src/client/main.ts:34` passes `content.game.startRoom` as
  the room to draw, and `render.ts:17` calls `roomOrigin(room, VIEW_W,
  VIEW_H)`. **Both files are Step 1's and its worker is rewriting them
  right now** (Gate 2: network, a camera of its own, touch). So: build
  the camera as a pure function in `draw/room.ts` (room, the focus
  point, view size → origin; additive: keep `roomOrigin` working with
  its present arguments), unit-check it from a script or scenario-free
  test of your own, and make the **one-line** change in `render.ts` /
  `main.ts` only after `git pull --rebase`, fitting whatever Step 1 has
  put there. If their camera already follows the local player, extend
  theirs rather than adding a second. If the files are mid-change and
  your line would conflict, write the exact line they need to
  `docs/for-the-lead.md` and move on.
- Draw doors so a player can see an opening is an opening (a doorway is
  a dark arch; an edge opening is simply a gap), graybox. **No arrows,
  no glow, no text** on anything: slice B's hidden routes depend on
  the game never pointing.

### The validator: "there is always a way out", checked, not eyeballed

`npm run check` must fail, naming the file and the tile, when:

- a door names a room or door that does not exist, or the two ends
  disagree;
- a spawn tile is not standing on ground (empty tile with a solid or
  one-way tile directly below, and room for the body);
- a room cannot be reached from the start room through doors, or the
  start room cannot be reached back from it;
- **a place a character can get into has no way out**: from every tile
  a body can stand on that is reachable from any entrance (a spawn or a
  door's arrival point), some door must be reachable.

For the last two you need a model of where a body can go. Measured
numbers for the only character that exists (`content/tuning.json`,
`content/characters/hero.json`): box 12×26 px; jump speed 320, gravity
900, so a jump rises 320²/(2×900) = 56.9 px = 3.55 tiles and lasts
0.71 s, covering 96×0.71 = 68 px = 4.3 tiles on the flat. So the hero
clears a 3-tile step up and not a 4-tile one, and crosses a 4-tile gap
at best. **Compute these from the content, do not hard-code them**: the
numbers are the owner's to tune and Step 2 is adding characters. Build a
tile-graph search (stand, walk, fall, jump up N and across M) that
**under-estimates** ability (round jump height and reach *down*), so
"there is a way out" is never claimed falsely; mark the model `DRAFT:`.
Run it for **every character a player can be** (tonight
`content.game.playerCharacter`; Step 2 is adding a party: read what is
there when you rebase): a pit only a flyer escapes still traps the
others. A one-way *drop* door is legal as long as the room it lands in
has a way on.

Where it goes: a check that needs only content can live in the rooms
kind's `check`; one that needs the verbs' tuning numbers by name belongs
with `src/sim/check-content.ts` (which already reads `runSpeed` and
`jumpSpeed` by name). The layer rule decides (`docs/architecture.md`,
"Layers"); `check-content.ts` is Step 1's file, so prefer a new file of
your own that it calls in one line.

**Controls, all watched to fail and named in the commit:** a room with a
sealed pit (4 tiles deep, no door); a door to a room that does not
exist; a spawn in mid-air; a room joined by a one-way drop with no way
back to the start. Keep the broken rooms as fixtures the check runs
against on purpose (so the control stays alive), not as files in
`content/rooms/`.

### Switch the start to the throne room (second push, last)

`content/game.json` → `"startRoom": "throne-room"`. Before you do:
`git pull --rebase`, then `grep -rn "startRoom\|graybox-hall" src scripts
scenarios` and read every hit. Step 1's Gate 2 adds `npm run e2e` and
`npm run check:live` about 06:30 UTC and they may assert positions in
the starting room. If either would break, do not switch: write to
`docs/for-the-lead.md` what would break and leave the start as it is.

## 3 · Traps

- **Four files are shared between steps**: `src/sim/types.ts`,
  `src/sim/systems/physics.ts`, `src/client/render.ts`,
  `content/tuning.json`. Additive, small, `git pull --rebase` right
  before pushing, `npm run check` again after the rebase. Three other
  leads' workers are pushing tonight (Steps 1, 2, 4).
- **`src/scenarios/run.ts`, `src/scenarios/types.ts`, `scripts/**` and
  `src/client/**` outside `draw/` are Step 1's.** Your additions there
  are optional fields with defaults, nothing renamed. Say in the commit
  which contract grew and what was added (`docs/architecture.md`,
  "Changing a shared contract").
- **System order.** Verbs run at 100, physics at 500. A door system
  that runs before physics sees last tick's position; after it, this
  tick's. Pick one, say why in the file, and make sure a body is never
  inside a solid tile on arrival (place it, then let physics settle).
- **Determinism.** Every scenario runs twice and must match byte for
  byte. Iterate entities in the world's order; no `Map` iteration over
  insertion-dependent keys, no clock, no `Math.random`.
- **Do not put helper files in the four registry directories**
  (`src/content/kinds/`, `src/sim/verbs/`, `src/sim/systems/`,
  `src/scenarios/facts/`): every file there must default-export its
  one thing. Shared helpers go beside them, one level up.
- **The validator's `read.only` list** in `rooms.ts:51` refuses unknown
  fields: every field you add goes in it, and a typo in a room file
  should still be named exactly (copy `src/content/reader.ts`'s
  wording).
- **A push to `main` is live in under a minute** and the owner may open
  the game at any time. `npm run build && npm run check` by exit code
  before every push; never push a half-working room as the start room.
- **`npm run check` passing says nothing about the screen.** For the
  camera and door drawing, run the page (`npm run dev`), drive it in
  the pre-installed headless Chromium at a phone-sized landscape
  viewport, walk through a door, and look at the screenshots yourself.

## 4 · Out of scope (you will notice these; leave them)

- Plates, gates, the breakable wall, the false wall, hiding places, the
  three other rooms, the secret, the rooftop and undercroft routes:
  slice B. You build only the *means* to place a part.
- Characters, their boxes, movement feel, attack, grab, throw: Step 2.
- Who stands in a room (`content/placements/**`), guards, seeing,
  hiding's effect: Step 4. Touch controls, markers showing where a
  friend went: Step 5. Network: Step 1.
- Tile art and atlases (`docs/architecture.md`, "Where art plugs in"):
  graybox only; keep legend meanings the truth so an atlas drops in.
- The explored percentage: areas and `hidden` are parsed, never shown.
- Anything in `docs/design-library/` or `tools/`.

## 5 · Decided, and open

**Decided** (the owner's rules, or the lead's choices in their place,
logged in `docs/decisions-log.md`): everything in `docs/plan/step-3.md`
"What's decided"; the room ids `throne-room`, `castle-street` (and, for
slice B, `undercroft`, `courtyard`, `hall-gallery`); two kinds of door,
walk and enter; rooms scroll and each screen follows its own character;
the game starts in the throne room once this slice is verified.

**Open, yours to decide and log:** the layouts themselves and every
field name. Anything you decide that a player would see or feel, and
that you would otherwise have asked the owner about, gets a `DRAFT:` at
its site and an entry in `docs/decisions-log.md` (its header has the
format). Nothing here needs the owner tonight.

## 6 · How it gets verified

- Rung 2: `npm run build`, `npm run check`, `npm run gates` (gate B
  "passing", A and C–F unchanged from what `main` shows when you pull).
- Rung 3: every scenario above with its control watched to fail; the
  four validator controls. Use `node scripts/trace.ts <id>` to find
  ticks and positions.
- Rung 4: `rooms-two-players-apart`.
- Rung 5 (second push): the real page in headless Chromium, phone
  landscape (for example 844×390), keyboard input: walk from the throne
  room to the street; screenshots before, in the doorway and after;
  the camera scrolls along the street and stops at its ends. Look at
  them. Say in the commit that no real iPhone was tried.
- After each push: `git ls-remote --heads origin main` shows your
  commit, and `npm run check:deployed` (allow two minutes).

## 7 · Definition of done

- Both pushes on `main`, each with build and check green by exit code.
- `docs/architecture.md` updated in the *first* push: the room row of
  "I need to add…" (doors, areas, parts), a new row for "a kind of
  working part", the door event, the non-player door hook, and the
  sentence "Today everything outside a room's grid is solid" made true
  again.
- A mechanism writeup `docs/mechanisms/rooms-and-doors.md` (the format,
  the door rules, the validator's movement model and its limits, the
  controls) and its one line in `docs/mechanisms/README.md`;
  `docs/mechanisms/scenarios.md` edited for the new fact and actors.
  SOP phase 1's grep returns `docs/mechanisms/content-validation.md`
  for `rooms.ts`: re-read it and correct what you made false.
- Decisions logged; `DRAFT:` and `INTENT:` at their sites (`INTENT:` on
  "doors never test for a player" and on "nothing resets when a room
  empties", quoting D-077).
- Do **not** edit `docs/plan.md` or `docs/plan/step-3.md`, and do not
  delete this brief: the lead does both at review.

## 8 · Where your questions go

A question you cannot finish without: the lead can answer now. Send it
to session `session_017WiGzGUAnvQfWco5vTcMX4` and carry on with what
does not depend on it. Anything only the owner could answer: decide,
mark `DRAFT:`, log it in `docs/decisions-log.md`. Flags and findings
that are not questions: `docs/for-the-lead.md`. When each push lands,
and when you are done or stuck, send the lead one line with the commit.
Your final message is that one line.
