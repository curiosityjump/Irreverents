# Step 2, "the hit": attack, grab, carry, throw, impact

Brief written by the Step 2 lead, `session_017WiGzGRnRoAeW5Ep5iSycV`,
2026-11-23 04:40 UTC, measured on `main` at 679e4d3.

## The task, and the row it moves

Make hitting, grabbing, carrying and throwing exist in the simulation
and on screen: a player can hit a body, pick up a crate, a dummy or a
friend, carry it, throw it, and what is hit or thrown flies, slams into
walls and into other bodies, with a held beat, shake and dust, and no
number on screen.

Moves **M3** in `docs/plan.md` (build gates with a passing scripted
check): gate **A** from "no scenario yet" to passing, together with the
sibling brief `handoff-prompts/step-2-body.md`, which runs **at the same
time as you** (the three characters, the party, switching).

Read first: `docs/plan/step-2.md` in full. Its "What's decided",
"Measure" and "Decided by the lead" sections are part of this brief and
are not repeated here. Then `docs/architecture.md`,
`docs/mechanisms/scenarios.md`, `docs/mechanisms/content-validation.md`.

## What you deliver, in this order

**Push 1, the shared shapes, as fast as you can (aim: 20 minutes).**
Three other sessions are waiting on these exact names (told to the Step
1, 3 and 4 leads at 04:30 UTC). Additive only.

1. Scenario format: optional `"entities": [{ "id": "dummy-1",
   "character": "<character kind id>", "tile": [col, row] }]`. Each is
   an entity with `player: null`, id as given, feet on the floor of
   that tile, centred like `spawnPlayer` does it. Validate like the
   other fields (unknown character, tile outside the room, duplicate
   id, each naming the field). Facts that find a body accept
   `"entity": "<id>"` as an alternative to `"player"`: either extend
   the four existing facts additively or add new fact files; existing
   scenarios must stay valid untouched.
2. `content/placements/<room id>.json` and
   `src/content/kinds/placements.ts`: `{ "room": "<room id>", "place":
   [{ "id", "character", "tile": [col, row] }] }`, cross-checked (room
   exists, character exists, tile inside the room). Keep it minimal:
   Step 4 owns this kind after you and will add fields.
3. `populateRoom(world, content, roomId)` exported from
   `src/sim/world.ts`: adds that room's placements to the world, safe
   to call twice (skips ids already there), does nothing for a room
   with no placements file.
4. Character kinds `crate`, `crate-heavy`, `dummy`, `dummy-heavy` in
   `content/characters/`, and `content/placements/graybox-hall.json`
   putting a few of each in the live room, clear of the two spawn
   tiles. Call `populateRoom` from `src/client/main.ts` beside its
   `spawnPlayer` call **only if that one line is still there when you
   rebase** (Step 1's Gate 2 worker is rewriting that file; if it has
   changed shape, leave it and tell me, I have already asked the Step 1
   lead to call it).

Then tell me push 1 is on `main` (see "Where your questions go").

**Then the hit itself:**

5. Actions `attack` and `grab` (`content/actions/`), with keyboard
   keys that do not collide with `jump`'s (`Space`, `KeyZ`, `ArrowUp`,
   `KeyW`) or the arrow/WASD stick. Suggested: attack `KeyX`/`KeyJ`,
   grab `KeyC`/`KeyK`.
6. Attack: a short hit in front of the attacker. What it hits is
   launched by the attacker's strength against the body's weight.
7. Grab, carry, set down, throw (aimed by the stick: forward by
   default, up, down). A carried body rides with the carrier and takes
   no part in physics until let go. Too heavy for this character: the
   grab is refused with an event, nothing is picked up.
8. Flying bodies: a body launched by a hit or a throw is "flying" until
   it comes to rest. While flying, hitting a wall, floor or ceiling
   above a speed threshold records an impact; meeting another body
   shoves that body by weight and records an impact for each. Each
   impact holds the bodies involved still for a few ticks (the held
   beat), then they move on.
9. Hidden toughness, flattened, back after a wait
   (`docs/plan/step-2.md`, "Being beaten never ends the game").
10. Players on players: a friend's grab and throw move you and do not
    wear you down; a friend's attack neither wears you down nor
    launches you. Each is one number or switch in
    `content/tuning.json`. **A held player breaks free at once by
    pressing `jump`, and is let go by itself after a moment.** Mark
    that exit `// INTENT: there is always a way out` at its code site
    and add its line to `docs/deliberate-designs.md`.
11. Drawing: a new `src/client/draw/impact.ts` (shake and dust from
    recorded impacts) and its one line in `src/client/render.ts`; a
    carried body drawn where it is carried; a flattened body visibly
    down. No numbers, no health bars.
12. The grappler's strength: the `grappler` kind (the sibling brief
    creates the file; see "Working beside the other worker") lifts
    `crate-heavy` and `dummy-heavy`; `infiltrator` and `flyer` cannot.

## Names other steps are now building against (added 04:36 UTC)

Agreed by message with the Step 1, 3 and 4 leads; use these exactly.

- **Events: the table in `docs/architecture.md`, "Bodies: the events
  and state other steps read"**, is the contract (names and fields).
  Emit exactly those; add fields there, never rename. Step 4's worker
  adds a readable `StepContext.events` to `src/sim/types.ts` and
  `step.ts`; expect it when you rebase.
- **A body that is not a player can act (part of push 1).** Step 4
  never moves a body: it writes an `Input` to `entity.c.input` and the
  body's own verbs do the rest. So change `src/sim/systems/verbs.ts`
  (it is yours now: every body is Step 2's) to run verbs for every
  entity whose kind lists any, with the player's input for a player
  and `entity.c.input` (or nothing held) otherwise; declare
  `Components.input`. Your attack and grab must therefore work when a
  non-player does them, to a player included; who may hurt whom is by
  `player === null` or not, never by "is it an NPC kind".
- **Scenario files are named `step2-hit-*.json`** (the prefix rule
  changed at 5df1ef0), not `hit-*`.
- **Out cold is `entity.c.flattened`**, present on any entity (player
  or not) exactly while it is out, with at least `{ ticksLeft }`.
  Step 4 reads it. A flattened body stays in the world, lying where it
  fell.
- **Bodies you did not make.** Step 4 adds character kinds with
  `"verbs": []` and an empty tuning set (`shopkeeper`, `guard`,
  `villain`). Hitting, grabbing and throwing must work on them: where
  a kind has no weight or toughness number, your systems use a default
  (a world number), never skip the body or crash.
- **`populateRoom`** keeps that exact name and signature; Step 1's
  server and solo page will call it.
- **Scenarios with a room's placements:** an optional scenario field
  `"placements": true` makes the runner call `populateRoom` for the
  scenario's room (default off, so existing scenarios are unchanged).
  Step 3's worker will use it. Scenario `entities` items also take
  optional `"vx"`, `"vy"` starting speeds.
- **`content/actions/interact.json` is Step 4's**; leave the id alone.
- **Test rooms:** give `test-hit.json` no doors; Step 3's validator
  treats a doorless room as standalone.
- **Step 1 will publish "Effects on a player" in
  `docs/architecture.md`** (pushed with a velocity, held by a body,
  released, moved to a room and place). When it appears, emit those
  for players as well; until then, change the entity directly.

## Handed to you by the body slice (added 04:46 UTC)

The body worker finished at 75da7ee. Three things are now yours:

- `src/sim/verbs/switch.ts` and `flap.ts` ask only Step 1's `heldBy`.
  When your act-or-not helper exists, make both use it (a flattened
  or flying player cannot switch or flap), and add
  `step2-hit-held-cannot-switch`: a held player presses `switch` and
  `jump`: no switch, no flap, and the jump breaks free.
- A carrier who switches to a member too weak for what they carry:
  decide (suggested: the thing is set down at their feet, a
  `released` event), `DRAFT:`, with a scenario.
- Effects: read `docs/architecture.md`, "Effects on a player", and my
  message of 04:42 UTC. Every launch, hold, release and come-back goes
  through `emitEffect`.

## The derivation, already done

Everything measured is in `docs/plan/step-2.md`, "Measure". What it
means for you:

- **Bodies that are not players never run a verb**, so everything that
  happens *to* a body (being launched, flying, friction, impacts, being
  carried, toughness) is a **system** in `src/sim/systems/`, named
  `combat-*`, `impact-*` or `carry-*` (your paths). Attack and grab,
  which a player *does*, are verbs.
- **Nothing slows a non-player body**: a dummy knocked along the floor
  slides at constant speed for ever unless you add ground friction and
  air drag for bodies with no `move` verb.
- **`move` erases a knockback on a player**: `src/sim/verbs/move.ts`
  pulls `vx` to the stick's target at 1200 px/s² on the ground. A
  player who is flying, held or in a held beat must not be steered by
  `move` or `jump`. `src/sim/systems/verbs.ts` is not yours; the verbs
  are. Have `move.ts` and `jump.ts` return early for such a player,
  through one small helper that lives **outside** the four registry
  directories (for example `src/sim/body-state.ts`), and tell the
  sibling worker's verbs to use the same helper (it is told to look
  for it).
- **A wall stop is silent.** Detect wall, floor and ceiling impacts
  without editing `physics.ts`: one system before physics (order below
  500) remembers each flying body's velocity, one after (above 500)
  compares. `physics.ts` is shared with Step 3; if you find you truly
  need a change there, keep it additive, small, and say so in the
  commit.
- **Per-body numbers need a declaring verb.** `check-content.ts` fails
  any name in a character's tuning set that none of its verbs declares.
  Suggested, with no shared file edited: a passive verb (for example
  `src/sim/verbs/body.ts`) whose `update` does nothing and whose
  `tuning` declares `weight`, `toughness` and the like; every kind that
  has a body lists it, crates and dummies included, and your systems
  read the numbers from `content.tuning.characters[kind.tuning]`.
  World-wide numbers (thresholds, friction, beat length, the friend
  rules) are declared by your systems under `world`.
- **Every speed stays under 960 px/s** on each axis, enforced by the
  range you declare (use a max of 900, as `jumpSpeed` does). Rising
  speed is not capped by physics; yours must be.
- **State lives in the world.** Flying, held-by, carrying, beat ticks
  left, toughness, the last impact (where, how hard, how many ticks
  ago): all in `entity.c.<your system or verb id>`, declared by
  declaration merging from your own file. The network layer copies the
  world generically, so drawing must read shake and dust from that
  state, never from the events of `step()` (the page does not hand
  events to `render`).
- **Determinism:** no `Math.random`, no clock; iterate entities in
  world order. Every scenario runs twice and is compared.

## Traps

- **The held beat must not stop the whole world.** Two players share
  it; freeze only the bodies in the impact.
- **Carrier and carried, each side can vanish.** The carrier is
  flattened, switches character, leaves the game, or changes room
  while carrying; the carried body is flattened or leaves. Every one
  of those must end with the carried body released and free, never a
  body stuck to nothing. A carried player who breaks free must not be
  re-grabbed on the same tick by a held grab button (require a fresh
  press, as `jump.ts` does with `held`).
- **A chain of holds:** A carries B who carries a crate. Either allow
  it and make release work at every link, or refuse a grab by someone
  who is being carried. Pick one, `DRAFT:`, and test it.
- **A thrown body released inside a wall or another body.** Release at
  a place the body fits; if none, set it down at the carrier's feet.
- **An impact that fires every tick.** A body resting against a wall
  with leftover speed, or two bodies overlapping for several ticks,
  must record one impact, not thirty. And a body thrown by A must not
  "meet" A on the tick it leaves A's hands.
- **Player ids in events.** The `event` fact matches on a `player`
  field; put `entity` (and `player` when there is one) on every event
  you emit, as `landed` does, so scenarios can match either.
- **The other worker edits the same data files** (below). Do not
  reformat a JSON file; keep each list one item per line so two
  sessions' additions merge.
- **A push is the deploy, and it goes to the owner's game.** Every push
  must leave run and jump working. If the netcode from Step 1's Gate 2
  has landed when you rebase, also run `npm run e2e` before pushing
  (`docs/verifying-and-finishing.md`, the pre-push gate).
- **Players are simulated on their own device once Gate 2 lands**
  (`docs/plan/step-1.md`, "The netcode must let the world move a
  player"). You write no network code. Build so it works in one
  simulation (scenarios, and the solo page). If, after Gate 2 lands, a
  held or thrown player misbehaves across two devices, that is a
  finding for me, not something to patch in `src/client` or
  `src/server`.

## Working beside the other worker

`handoff-prompts/step-2-body.md` creates `content/characters/grappler.json`,
`infiltrator.json`, `flyer.json`, their tuning sets, `content/party.json`
and the `switch` and flyer verbs. Its first push should land about when
yours does.

- Until those three files exist, build and test against `hero` in
  scratch scenarios; do not add verbs to `hero` in anything you push
  (Step 1's scenarios read it; it stays as it is).
- Once they exist: add your verbs (`attack`, `grab`, your passive body
  verb) to their `verbs` lists and your numbers to their tuning sets,
  and nothing else in those files. `git pull --rebase` immediately
  before every edit to a file under `content/`, and again before every
  push; on a conflict keep both sides' lines.
- You own the numbers for strength, weight, throw and toughness of all
  kinds; the other worker owns size, colour, run, jump and flap.
- Scenario files: prefix `hit-`. Theirs: `body-`.

## Out of scope

- The touch layout and anything in `src/client/` other than
  `draw/entities.ts`, your new `draw/impact.ts`, one line in
  `render.ts`, and (conditionally) the one `populateRoom` line.
- `src/server/**`, `scripts/**`, `package.json`.
- Rooms: do not edit `graybox-hall.json`. If a check needs a different
  room, add `content/rooms/test-hit.json` (Step 3's lead has been told
  rooms named `test-` are ours).
- NPC behaviour: a dummy stands there. No moods, no seeing, no AI.
- Acquired powers, weapons, destruction of walls, vehicles.
- The existing run and jump numbers in `hero`, and Step 1's three
  scenarios: they must pass untouched.
- A tuning panel (`?tune`): a later brief.

## Decided vs. open

Decided: everything in `docs/plan/step-2.md`, "What's decided" and
"Decided by the lead". Do not reopen the button mapping, the ids, or
bodies passing through each other unless a measurement shows one cannot
work; then tell me.

Open, yours to pick, each marked `DRAFT:` at its site: every number;
the shape of the attack (reach, timing); the throw arcs; how friction
and bounce behave; how toughness wears and what "near where it fell"
means; chains of holds. For any of these that the owner would see or
feel, add an entry to `docs/decisions-log.md` in its format (plain
words, how to change it). Nothing here needs the owner before you
build.

## How it gets verified

Rung 3 of `docs/verifying-and-finishing.md`: scenarios in `npm run
check`, each with a control you watched fail, named in the commit
message. Tag each `"gate": "A"`. Minimum set:

1. `hit-throw-crate-at-dummy`: a thrown crate hits a dummy; both end
   the contact moving faster than a stated speed; an impact is
   recorded for each. Control: body-to-body impact switched off.
2. `hit-dummy-into-wall`: a dummy hit toward a wall records a wall
   impact and a held beat (the body's position is unchanged for the
   beat's ticks, then changes). Control: beat length 0.
3. `hit-dummy-into-dummy`: a dummy thrown or hit into a second sends
   the second flying, an impact for each. Control: as 1.
4. `hit-not-grab`: a player beside a grabbable dummy presses `attack`
   and the dummy is hit, not picked up; pressing `grab` picks it up.
5. `hit-throw-friend`: two players. A picks up B and throws B; B
   flies; B's toughness is unchanged. And a second scenario,
   `hit-break-free`: B, held, presses `jump` and is free the next
   tick; and held with no input, B is let go by itself. Control: the
   break-free removed.
6. `hit-friend-attack-harmless`: A attacks B; B is not launched.
7. `hit-grappler-lifts-heavy`: the grappler picks up `crate-heavy`;
   the same inputs as `infiltrator` and as `flyer` (two more
   scenarios) leave it on the floor with a refusal event.
8. `hit-flattened-returns`: a dummy worn to zero is flattened, absent
   from play for the wait, then back.
   (Read every `hit-…` name above as `step2-hit-…`.)
9. A screenshot of a fight on the built page (`npm run build && npm
   start`, headless Chromium is installed: `require('playwright')`,
   never `playwright install`), read by you: bodies, dust, no number
   anywhere. Say in the commit that you looked.

Also: `npm run build`, `npm run check` and `npm run gates` exit 0, and
after each code push `curl -s
https://irreverents-production.up.railway.app/healthz` reports your
commit (a deploy takes about a minute of "Application not found" first;
that is known).

## Definition of done

- The scenarios above pass on `main`, live `/healthz` reports your last
  code commit, and the live page still runs and jumps.
- `docs/architecture.md`: the "I need to add…" rows for **object** and
  **NPC** corrected to what you built (a body is a character kind;
  placements; `populateRoom`), a row for a throwable body, and the
  events and `entity.c` fields other steps may read, with their fields.
- `docs/mechanisms/`: one writeup, `combat-and-impact.md`, and its line
  in `docs/mechanisms/README.md`.
- `docs/mechanisms/scenarios.md`: the `entities` field and any new
  facts.
- `docs/deliberate-designs.md` and the `INTENT:` for the break-free.
- `docs/decisions-log.md` entries as above.
- `docs/plan.md`, "What is already right": a line if you made a
  pattern worth copying.
- Budget: done by **07:15 UTC**. If you will not make it, tell me what
  is in the way by 06:45 and push what is green; never cut attack or
  grab/throw; the first things to cut are 8, then 6.

## Where your questions go

- Blocking, or "push 1 is on main", or "done at `<commit>`": send a
  message to my session, `session_017WiGzGRnRoAeW5Ep5iSycV`
  (`send_message`), in the moment. A question for the owner is decided
  by you from `docs/plan/step-2.md` and logged in
  `docs/decisions-log.md`; nothing waits for them.
- A flag or a "worth noting": `docs/for-the-lead.md`, headed with this
  file's name.
- Your final message: done or blocked, the commit, nothing else. The
  honest report (what you ran, each control, what you did not verify)
  is the commit message.
