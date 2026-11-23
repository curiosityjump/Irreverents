# Step 4, slice 3: the people move into the castle street, and pursuit follows through doors

Brief for one cold session. Written 2026-11-23 05:00 UTC by the Step 4
lead (`session_017WiGzG4WzuJfHAu3XWoUhc`). The step is
`docs/plan/step-4.md`. Self-contained: you do not need the design library
or `docs/vision.md`.

**Read first:** `docs/mechanisms/npc-response.md` (everything slices 1
and 2 built: moods, seeing, the rule tables, calling, the alert,
responders, cooling) and `docs/architecture.md`, "Rooms and doors: what
other steps read" and "Bodies: the events and state other steps read".

## 1 · The task, and the measure row it moves

So far the people live only in test rooms nobody playing the game can
reach. Put them where players are: a shopkeeper with a counter and
goods, a call bell, a guard and the villain in **`castle-street`**; make
a chasing guard **follow a hero through a door**; treat Step 3's hiding
places as unseen; and prove gate D's two signals **in the real street**.

**Measure row: M3** (`docs/plan.md`). Gate D already has scenarios from
slice 2; this adds the same location's (the gate's own words: "same
location supports a zero-alarm intrusion AND a catastrophe…") and the
step's last control. What changes for a player: the street has people in
it.

When done, message the lead (`send_message` to
`session_017WiGzG4WzuJfHAu3XWoUhc`): "slice 3 at <commit>".

## 2 · The derivation, already done

### The street (measured on `main` at `ef8cbf2`; re-measure before you rely on a column)

`content/rooms/castle-street.json`: 48 columns × 12 rows of 16 px tiles;
the floor is row 11, flat from column 1 to 46; players spawn at columns
3 and 5. Building 1 is a solid block at columns 10–17, rows 5–6, over
open street. Jump-only ledges: an awning at row 8, columns 7–9; a second
at row 8, columns 38–40; building 1's roof. Building 2 (columns 24–33)
has an upper room (rows 4–6) reached by an *enter* doorway at column 28
(rows 9–10 on the street, column 26 upstairs). The west edge (column 0,
rows 9–10) is a *walk* door to `throne-room`. There is **no wall across
the street at ground level**, so on the ground the only things that hide
a hero are distance (sight is 7 tiles), a turned back, height (40 px:
the row-8 awnings are **inside** it, the roofs are not), the upper room,
and Step 3's hiding places. Step 3's slice B is still adding to this
room (an east opening to `courtyard`, a hiding place under building 1's
overhang); its lead says no existing floor, platform or spawn tile will
move.

The live game still starts in `graybox-hall` (`content/game.json`, Step
3's file). The street becomes reachable when Step 3 changes that; you do
not.

### What to build

1. **`content/placements/castle-street.json`** (if Step 2 or Step 3 has
   created it meanwhile, add to it): the shopkeeper, his counter and
   three goods, a bell he can walk to, the guard at a post **more than a
   sight range from the shop** with a routine that paces and turns, a
   `help-arrives` entry if slice 2 built extra responders, and the
   villain. Suggested: the shop under building 1's overhang, the bell
   near column 20, the guard around columns 36–44. Keep the two spawn
   columns and the west door clear of anyone who would be in a new
   player's face.
2. **The villain's loop** (`DRAFT:`, already in
   `docs/decisions-log.md`): robs the shop (the shopkeeper happily
   opposes), leaves, comes back and buys politely (distress), robs
   properly (relief), then waits a good while. Pace it so that a player
   standing in the street sees one full round in about a minute.
3. **Following through a door (D-077, `INTENT:`):** "a level transition
   never automatically resets pursuit, and guards may follow between
   regions". A responder that is chasing and **sees** an offender go
   through a door (a `changed-room` event for someone it saw that tick or
   had in sight just before) heads for that door and goes through it:
   a walk door by walking into it, an enter doorway with
   `askForDoor(entity)`. On the far side it searches from the door. It
   does not follow a hero it did not see leave (D-065: not psychic).
   `doorToward()` in `src/sim/room-routes.ts` is there if you need it.
   A responder in another room is still that area's responder: when the
   alert reaches 0 it walks home, back through the door. `DRAFT:` an
   area is still the room the call was made in; the alert does not
   spread to the room the chase moves into.
4. **A door alone does not cool it** (the step's control): the cooling
   clock already needs every hero unseen for the whole wait, so leaving
   and coming straight back must find the alert unchanged.
5. **Hiding places:** a body with `entity.c.roomHide` (Step 3's slice B;
   the name is confirmed in `docs/architecture.md` when it lands) is
   unseen. One line in `src/sim/npc/sight.ts`, behind a check that
   tolerates the component not existing yet.

### The scenarios (`scenarios/step4-street-*.json`, tagged `"gate": "D"`, `"placements": true`)

- `step4-street-zero-alarm`: from the spawn, take a piece of goods
  behind the shopkeeper's back and walk out through the west door: alert
  0 throughout, no `call-started`.
- `step4-street-catastrophe-and-escape`: take it in view; the call
  completes; the guard comes; the hero gets up to a roof (not an
  awning), waits, the alert reaches 0, the guard is back at his post.
- `step4-street-guard-follows-through-door`: seen and chased, the hero
  leaves by the west door in the guard's sight; the guard arrives in
  `throne-room`.
- `step4-street-door-does-not-cool` (the control): the hero leaves by
  the door and returns at once; the alert is what it was.
- If `c.roomHide` is on `main`: `step4-street-hide`, a chased hero
  standing still in the hiding place is not seen by a guard walking
  past, and moving out of it in view is seen.

## 3 · Traps

- **Other steps' scenarios run in this room** (Step 3's routes, with and
  without `"placements": true`). People standing in the street must not
  break them: run `npm run check` after adding the placements file and
  before anything else; if one of theirs fails, move your people, do not
  edit their scenario, and tell the lead if moving does not fix it.
- **The row-8 awnings are within sight height.** A scenario that hides
  there will be seen; that is correct, not a bug to tune away.
- **The server populates rooms, not you.** Who calls `populateRoom` for
  a room a player walks into is Step 1's (its Gate 2 is landing about
  now). If people do not appear in a room entered through a door on the
  real page, do not add a spawner: tell the lead.
- **Scenario ticks in `test-shop` and slice 2's test room are pinned.**
  Do not change the people's walk numbers, the `hero` tuning set or
  those rooms' routines; give the street its own routines.
- **Step 3's worker is editing `castle-street.json` now.** You do not
  edit it. Rebase before every push and re-run your scenarios: a moved
  tile changes your ticks.
- **A push that touches `src/`, `content/` or `scripts/` deploys**, with
  about a minute of downtime and a reset of the live world. Push
  finished parts. **From 10:00 UTC `main` takes only finished, verified
  work.**
- Determinism, the registry directories take no helper files, world
  numbers are declared by their reader, unknown content fields are
  errors: as in `docs/architecture.md`.

## 4 · Out of scope

- `content/game.json` and every room file (Step 3's); the touch
  controls and the page (Step 1 / Step 5); how a hit feels (Step 2).
- The villain's own horn, a struck guard whistling for more, waves.
- People in the throne room (Step 6's) or any other room.
- The alert spreading between rooms; money; an inventory.
- Reworking slice 1's or slice 2's rules. If one is wrong in the street,
  tell the lead.

## 5 · Decided, and open

**Decided:** D-077 and D-065 as written above; the villain's loop; where
things roughly go.

**Open, yours to decide without asking** (decide, `DRAFT:`, and log in
`docs/decisions-log.md` anything a player would see): exact columns and
routines; how long a responder searches on the far side of a door; what
a guard does if the door it wants is one it cannot use.

## 6 · How it gets verified

- `npm run build && npm run check`, by exit code; `npm run gates` lists
  your scenarios under D.
- **A failing control watched for each scenario**, named in the commit:
  let a responder follow someone it did not see leave (the follow
  scenario's partner must then fail: write one where the hero leaves
  unseen and the guard stays); let the cooling clock ignore heroes in
  other rooms' sight; make sight ignore `c.roomHide`.
- **Rung 5, at phone size, which nobody has done for this step yet:**
  run the built server with `castle-street` as the start room in your
  working copy only; Playwright with an iPhone-sized landscape viewport
  (844×390); drive a hero to take goods in view and screenshot: the
  shopkeeper's `?` then `!`, the bell ringing, the alert marks, the
  guard coming. **Look at the images** and say in the commit what you
  saw and whether each mark is readable at that size. If Step 1's touch
  layer is on `main`, check that a **Use** control is on screen and that
  touching it next to the goods takes them; if it is not there, write
  that in `docs/for-the-lead.md` as a live item. Revert the start room.
- After the push: `npm run check:deployed` exits 0.

## 7 · Definition of done

- The scenarios pass with their controls watched; build and check green
  after the final rebase; pushed to `main`; deployed.
- SOP phase 6: `docs/mechanisms/npc-response.md` (following through
  doors, hiding places, the street's people); `docs/architecture.md` if
  how to add a person changed; `INTENT:` / `DRAFT:` at the sites;
  `docs/decisions-log.md` for player-visible choices.
- Do not delete this brief or edit `docs/plan/step-4.md`.

## 8 · Where your questions go

- **Blocking:** `send_message` to the lead,
  `session_017WiGzG4WzuJfHAu3XWoUhc`, and keep working on what does not
  depend on the answer. If only the owner could answer: decide,
  `DRAFT:`, log, continue.
- **A flag or finding:** `docs/for-the-lead.md`, under your own heading;
  never remove or reset anyone else's entries.
- **Something only the owner can supply:** `docs/questions-inbox.md`.
- **Your final message:** done or blocked, the commit, nothing more.
