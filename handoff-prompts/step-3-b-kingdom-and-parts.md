# Brief: Step 3, slice B — the rest of the kingdom: three more rooms, the plate gate, walls that hide things, the secret

Written by the Step 3 lead (`session_017WiGzGUAnvQfWco5vTcMX4`),
2026-11-23 04:55 UTC, from slice A's first push (`9a4f6a8`), which the
lead re-ran: build, check and gates green at `3e23a69`, and
`step3-guard-follows` watched to fail with doors made to skip
non-players. The step: `docs/plan/step-3.md` (read "What's decided",
"Feedback signal" and "Measure"; they bind you). **Budget: done by
07:30 UTC.**

**Read first, before any code:** `docs/mechanisms/rooms-and-doors.md`.
It is the format and the rules you build on, written an hour ago by
slice A's worker; this brief does not repeat it.

## 1 · The task, and the measure it moves

Two rooms exist (`throne-room`, `castle-street`) joined by one opening.
Make it the five-room kingdom with its two ways nothing points at, its
one honest co-op gate and its one secret, all as room data plus one
small system file per kind of working part.

**Measure:** `docs/plan.md` M3, gate B. `npm run gates` already prints
"B: passing" on 4 scenarios, which cover signals 1, 3b and 4 only. Gate
B is true when its line also lists a scenario for each of signals 2, 3
and 5 (`docs/plan/step-3.md`, "Feedback signal"). That is this slice.

**Push in this order; each push leaves `main` working:**

1. **The five kinds of part** with their scenarios in a scratch room of
   your own (`content/rooms/test-parts.json`, no doors, so it is
   standalone and exempt from the map rules), and the hiding component's
   name in `docs/architecture.md` (Step 4 is waiting for it).
2. **The three rooms and the new doors**, the routes, the secret, and
   the scenarios in the real rooms.

## 2 · Slice A is still running, in the same step

Its second push (due by about 06:45 UTC) adds: the way-out validator
(a new check that every place a body can get into has a way out, run
for each party member), door drawing in `src/client/draw/room.ts`, and
`content/game.json` → `throne-room`. What that means for you:

- **Your rooms must pass its validator when it lands.** Rebase often;
  when it is on `main`, run `npm run check` and fix your rooms, not the
  validator. If you think the validator is wrong about a room, write
  the case to `docs/for-the-lead.md` and message the lead.
- **It will treat a part's tiles as solid if the kind says the part can
  block** (the lead has asked for this: the pessimistic reading, a gate
  counted as shut, an unbroken wall as a wall). So declare, in each
  kind's `parts` entry, whether it blocks, in whatever field slice A
  settles (pull and read `src/sim/check-rooms.ts` and the `PartRule`
  type before you start; if the field is not there yet, add an optional
  `blocks?: boolean` to `PartRule` yourself, additively, and tell the
  lead so A uses yours).
- **Files that are slice A's this hour: do not edit** `src/sim/check-rooms.ts`
  beyond what the previous bullet allows, `src/client/draw/room.ts`,
  `content/game.json`, `controls/rooms/**` (add new control files; do not
  change existing ones). `src/content/kinds/rooms.ts` is shared between
  you: additive, small, pull right before.
- **In `throne-room.json` and `castle-street.json`, change wall tiles
  only.** Slice A's six scenarios and Step 4's people are pinned to
  tile positions there. Do not move, add or remove a floor, platform,
  spawn or existing door; you may turn `#` tiles into door, part or
  empty tiles. Run every `step3-*` and `step4-*` scenario after.

## 3 · The map (decided; `DRAFT:` layouts, permanent ids)

```
 throne-room ── castle-street ── courtyard ──[plate gate]── hall-gallery
      │               └── over the roofs (hidden) ───────────┘ (balcony)
      └── behind the throne (hidden) ── undercroft ── cellar door in the courtyard
```

Room ids: `undercroft`, `courtyard`, `hall-gallery`. Door ids are yours;
they are permanent once pushed. Walk doors pair on opposite edges and
equal size (the format's rule), which fixes most of the geometry:

| Connection | Kind | Hidden | Where |
|---|---|---|---|
| street ⇄ courtyard | walk | no | street's east edge at floor level ⇄ courtyard's west edge |
| courtyard ⇄ gallery | walk | no | courtyard's east edge, **beyond the plate gate** ⇄ gallery's west edge, ground floor |
| throne room ⇄ undercroft | walk | **yes** | throne room's west edge, behind a **false wall** in the 3-thick wall behind the dais ⇄ undercroft's east edge |
| street roofs ⇄ gallery balcony | walk | **yes** | street's east edge at roof height (rows 1–2) ⇄ gallery's west edge, high up |
| undercroft ⇄ courtyard | enter | no | a doorway in the undercroft ⇄ a plain cellar doorway in the courtyard, **on the street side of the gate** |

What each room is for (leave the space; other steps fill it):

- **`courtyard`** (about 30×12): from the west door, a flat run of at
  least 12 tiles (Step 7's machine needs a run-up to "a designated
  breakable roadblock"), the cellar doorway, then the two plates and the
  gate, then the east door. The two plates are at least 5 tiles apart,
  so one body cannot press both, and both are on the west side of the
  gate.
- **`hall-gallery`** (about 24×14): a ground floor with at least three
  flat stretches of 3 tiles for pedestals (Step 7), a balcony where the
  roof route arrives, and **a way from the floor up to the balcony that
  every party member can climb** (steps of 2 tiles or less). That is
  the gallery's way out when the gate is shut: over the roofs. Without
  it the validator will rightly refuse the room.
- **`undercroft`** (about 34×14, mark the room `hidden`): from the
  east door (behind the throne) a low passage west, the doorway up to
  the courtyard, a **breakable wall** sealing a side vault (a hidden
  area), and **the secret**: a crawl exactly one tile high and at least
  4 tiles long into a small chamber (a hidden area). The chamber has a
  **second way out any body can take**: a drop back into the passage
  that is too high to come back up (see Traps: the flyer flaps 5
  tiles).
- **The roofs** (in `castle-street`): from the east balcony or building
  2's roof, a ledge "just in reach" up to the hidden door in the east
  wall. Reachable by every party member from the ground (steps of 2
  tiles or less from the existing awnings and roofs; if the existing
  geometry does not allow it, add one-way platforms in empty air only,
  which moves nobody's pinned tiles).

**Measured, for the layouts** (Step 2, on `main`): jump heights about
52 px (grappler; read each box in `content/characters/`),
51 px (infiltrator, box 10×12), 47 px (flyer from the ground; three
flaps reach a ledge 5 tiles up). A 3-tile step is cleared by two of
them with 3–4 px to spare and not by the flyer without a flap: **no
path anyone needs has a step over 2 tiles.** Only the infiltrator fits
a one-tile gap.

## 4 · The five kinds of part (one system file each: `src/sim/systems/room-<kind>.ts`)

Read "Working parts" in the mechanism doc: a kind declares itself in its
system's `parts`, remembers things with `partState`, changes collision
with `setTile`. Parts are placed in the room's own file. **Never test
which character a body is, and never count players** (D-006, D-015):
read a body's size, speed, place.

- **`plate`**: a floor plate. Pressed while any body, played or not, is
  resting on it (on the ground, its feet over the plate's tiles). A
  crate counts exactly like a hero. Emits an event when it goes down and
  when it comes up.
- **`gate`**: solid while shut. `params.plates` lists the plates that
  hold it; it opens while **all** are pressed and stays open
  `params.stayOpen` seconds after (`DRAFT:` default 6: long enough for
  two friends to step off their plates and walk through together). It
  never shuts on a body standing in it: it waits. `INTENT:` there is
  always a way out. Emits opened and closed.
- **`breakable`**: a wall that is solid until something hits it hard:
  any body about to run into it sideways at or above
  `params.breakSpeed` (`DRAFT:` default 200 px/s: a running hero at 96
  does not, a thrown crate or a thrown friend does). Then its tiles are
  open for good and it emits an event. Physics zeroes speed on contact
  (`physics.ts`), so look *before* physics moves the body (an order
  below 500), and let the body carry on through. Also export one small
  function another system can call to break the part covering a given
  tile (Step 2's attack and Step 7's machine will want it; their code
  does not exist yet, do not wait for it). Drawn as wall with a crack:
  the library's own word is a "suspicious cracked wall".
- **`false-wall`**: drawn exactly as wall, never solid. No behaviour
  beyond being drawn; the route behind the throne. `DRAFT:` whether it
  should look or sound any different is the owner's to say after
  playing; tonight it is identical to the wall around it.
- **`hide`**: a place to hide (a curtain, a barrel: graybox). A body
  standing still inside its tiles is marked on its own component
  (`entity.c.roomHide = { in: "<part id>" }`, cleared the tick it moves
  out or acts). **That is all this step does**: what being hidden does
  to being seen is Step 4's, which reads the component. Put the name
  and meaning in `docs/architecture.md` under "Rooms and doors: what
  other steps read" in your first push, and place one in the street (in
  empty tiles under building 1's overhang) and one in the throne room.

**Drawing:** a new file `src/client/draw/room-parts.ts` (not
`draw/room.ts`), called from `src/client/render.ts` in one added line
(shared file: pull first). It needs the world to know a gate is open
or a wall broken. Graybox. **No arrow, no glow, no text, nothing that
points.**

**Tuning:** a number a player would feel that belongs to a kind in
general goes in `content/tuning.json` `world`, declared by its system
with a range (`docs/mechanisms/content-validation.md`); a number that
belongs to one placed part is its `params`. Shared file: add at the
end of `world`, pull first.

## 5 · The scenarios (named `step3-*.json`, tagged `"gate": "B"` where marked; each with a control you watched fail, named in the commit)

Signal 2 (B):
- `step3-behind-the-throne`: from a throne-room spawn a player walks
  west through the false wall and is in the undercroft, then reaches
  the courtyard by the cellar doorway without ever being in
  `castle-street` (an `in-room` fact per leg, and an event fact that no
  `changed-room` to `castle-street` happened). Control: the false
  wall's tiles made solid (`tiles` in the scenario, or the part
  removed) and the same inputs fail.
- `step3-over-the-roofs`: a player climbs from the street floor to the
  roofs and arrives on the gallery balcony without being in
  `courtyard`. Control: the hidden door's tiles solid.
- The check already refuses a hidden door with a sign
  (`controls/rooms/`, slice A). Add one control of your own: a room
  whose hidden connection is an `enter` doorway.

Signal 3 (B):
- `step3-secret-by-size`: the infiltrator crawls into the chamber by
  running. Two more with **the same inputs** and the grappler, then the
  flyer: stopped at the mouth (the pattern of Step 2's
  `step2-body-*-stopped-by-gap`; read those first).
- `step3-secret-not-by-flight`: the flyer, flapping at the drop, does
  not reach the chamber.
- `step3-secret-another-way`: a body that is not the infiltrator gets
  into the chamber some other way and **that must work** (the check
  that nobody closed a way round). Tonight a stand-in: a grappler-sized
  scenario entity given a starting upward speed at the foot of the drop
  (a throw from a friend), landing in the chamber. Scenario entities
  take `vx`/`vy` once Step 2's hit worker lands them; if they are not on
  `main` when you get here, add the two optional fields yourself,
  additively, in `src/scenarios/run.ts` and `types.ts`, and say so.
  Name in `docs/for-the-lead.md` every scenario still on a stand-in.
- `step3-secret-way-out`: any body in the chamber leaves by the drop.

Signal 5 (B):
- `step3-plates-two-players`: two players, one on each plate; the gate
  opens; both walk through before it shuts and are in `hall-gallery`.
- `step3-plates-one-and-a-weight`: one player and a `crate-heavy`
  (Step 2's, an ordinary entity, on `main`) resting on the other plate;
  the gate opens and stays open while the player walks through.
  Stand-in for the throw: the crate is given a sideways speed and comes
  to rest on the plate (or is simply placed on it if `vx` is not there
  yet).
- `step3-plates-one-alone`: one player, no weight, stands on each plate
  in turn: the gate never opens (the control for the two above), and
  the player can still leave the courtyard.

Parts, in `test-parts` (not gate-tagged):
- `step3-wall-breaks`: a body at 96 px/s stops at the wall; one at or
  above the break speed goes through and the tiles stay open.
- `step3-gate-waits`: the gate does not shut on a body standing in it.
- `step3-hide-marks`: standing still in a hiding place sets the
  component; walking out clears it.

Use `node scripts/trace.ts <id>` for ticks and positions.

## 6 · Traps

- **`src/sim/party.ts` `boxInSolid` (Step 2's) reads the room file's
  cells, not `tileAt(world, …)`**, so switching to a bigger body inside
  a shut gate's tiles would be allowed. Not yours to edit: the gate
  never shuts on a body, which covers the gate; write the remaining gap
  to `docs/for-the-lead.md` only if you can show a scenario that ends
  with a body inside a solid tile.
- **A switch only offers party members nobody else is playing**, so
  someone who crawls in as the infiltrator and switches away may not be
  able to crawl back: hence the chamber's drop. No place in any room
  may be leavable by one member only.
- **Doors move bodies directly, not through Step 1's `move` effect**
  (slice A's reasoned call; the lead is settling it with Step 1's
  lead). Do not change `room-doors.ts`. Your parts never move a body at
  all, so effects do not concern you; if a part ever must move a
  player (it should not), that is `emitEffect` (`docs/architecture.md`,
  "Effects on a player").
- **Determinism**: iterate entities and parts in a fixed order; state
  only in `World` (`partState`, `setTile`).
- **System order**: physics is 500, doors 600. `breakable` must see the
  speed before physics zeroes it; `plate` and `gate` want positions
  after physics. Say the order and why in each file.
- **Registry directories hold one default export per file**; helpers
  go beside them (`src/sim/`), as `room-state.ts` does.
- **Four shared files** (`src/sim/types.ts`, `physics.ts`,
  `src/client/render.ts`, `content/tuning.json`) and five other
  workers pushing: additive, small, `git pull --rebase` before every
  push, `npm run check` again after it.
- **A push to `main` that touches `src/` or `content/` is live in
  under a minute**, with a short gap that resets the world. Build and
  check by exit code first. From slice A's second push on, the game
  starts in the throne room: never push a throne room that fails.

## 7 · Out of scope

The camera (Step 1's until it lands, then the lead briefs it); the
way-out validator and door drawing (slice A); who stands where, guards,
what hiding does to being seen (Step 4); attack, grab, throw, the
characters, crates (Step 2); the machine and the roadblock, pedestals
and exhibits (Step 7): leave the space, place nothing; the explored
percentage; tile art; anything in `docs/design-library/` or `tools/`.

## 8 · Decided, and open

**Decided:** `docs/plan/step-3.md` "What's decided"; the map and table
above; the five part kinds and their rules. **Open, yours:** every
layout, door id, field and parameter name. A choice a player would
notice that you would otherwise have asked the owner about gets a
`DRAFT:` at its site and an entry in `docs/decisions-log.md` (the gate's
stay-open time and the break speed already need one each). Nothing here
needs the owner tonight.

## 9 · How it gets verified

- Rung 2: `npm run build`, `npm run check`, `npm run gates` by exit
  code; gate B's line lists the scenarios marked (B) above alongside
  slice A's four; A and C unchanged from what `main` shows when you
  pull.
- Rung 3: every scenario with its control; each new content rule with a
  file in `controls/rooms/`.
- Rung 4: `step3-plates-two-players`.
- Rung 5: the real page (`npm run dev`) in the pre-installed headless
  Chromium at a phone landscape size (844×390), keyboard: screenshots of
  each of the five rooms, the gate shut and open, the cracked wall
  before and after. Look at them: is anything pointing at a hidden
  route? If the camera has not landed and a room is wider than the
  screen, say which rooms you could not see whole. No real iPhone was
  tried: say so.
- After each push: `git ls-remote --heads origin main` shows your
  commit; `npm run check:deployed` after two minutes.

## 10 · Definition of done

- Both pushes on `main`, green.
- `docs/mechanisms/rooms-and-doors.md` edited in place: the five kinds
  (what each does, its params, its events, its order), "No kind exists
  yet" made true again, the map. `docs/architecture.md`: the part
  kinds' events and the hiding component under Step 3's section.
  `docs/mechanisms/scenarios.md` if the scenario format grew.
- Decisions logged; `DRAFT:` and `INTENT:` at their sites.
- Delete `content/rooms/test-parts.json`? **No**: scenarios use it; ids
  are contracts.
- Do **not** edit `docs/plan.md`, `docs/plan/step-3.md` or either
  brief; the lead does that at review.

## 11 · Where your questions go

A question you cannot finish without: message the lead,
`session_017WiGzGUAnvQfWco5vTcMX4`, and carry on with what does not
depend on it. Only-the-owner questions: decide, `DRAFT:`, log. Flags and
findings: `docs/for-the-lead.md`. Message the lead one line with the
commit when each push lands and when you are done or stuck; that line is
your final message.

## 12 · Added 04:56 UTC, from the Step 6 lead (the king's speech): a window in the throne room

The library (doc 03): the king "occupies a throne against a
stained-glass window; players wonder if they can suplex him through
it". Doc 24 gives the throne room "one or two spectacular breaches".
So, in your second push:

- `breakable` takes an optional `params.look` (`"wall"` by default,
  `"window"`), which only changes how it is drawn (graybox: a paler
  pane with a frame). Same rule as any breakable: a thrown body breaks
  it, a walking hero does not.
- Place one `breakable` with `"look": "window"` in `throne-room`, in
  the west wall above the dais, **above** the false wall's tiles (wall
  tiles only, section 2's rule holds). Step 6 is placing a king at
  about column 5 on the dais, a throne and crates, through
  `content/placements/throne-room.json` (theirs): do not change the
  dais.
- **A body thrown through it must land somewhere with a way back**,
  never a pocket. The lead's suggestion, yours to change: the wall is
  3 tiles thick, so the window is its inner face and behind it is the
  top of the same space the false wall leads into; the body drops into
  the hidden passage and through to the undercroft. A spectacular
  breach that also gives the secret away to whoever does it is the
  game working. If the geometry will not allow that, a second hidden
  walk door higher on the west edge with its pair on the undercroft's
  east edge.
- One scenario, `step3-through-the-window` (not gate-tagged): a body
  thrown from the dais at the window breaks it and ends in the
  undercroft; the same body walking at it does not break it. Message
  the lead the event's name and fields as soon as `breakable` is on
  `main` (Step 6's court reacts to it).
