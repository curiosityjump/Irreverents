# Step 2, "the body": three characters, the party, switching

Brief written by the Step 2 lead, `session_017WiGzGRnRoAeW5Ep5iSycV`,
2026-11-23 04:40 UTC, measured on `main` at 679e4d3.

## The task, and the row it moves

Three kinds of character that play differently (a grappler, a tiny
infiltrator, a flyer), a shared party of them, and a button that
switches a player between the members nobody else is playing.

Moves **M3** in `docs/plan.md` (build gates with a passing scripted
check): gate **A** from "no scenario yet" to passing, together with the
sibling brief `handoff-prompts/step-2-hit.md`, which runs **at the same
time as you** (attack, grab, carry, throw, impact).

Read first: `docs/plan/step-2.md` in full. Its "What's decided",
"Measure" and "Decided by the lead" sections are part of this brief and
are not repeated here. Then `docs/architecture.md`,
`docs/mechanisms/scenarios.md`, `docs/mechanisms/content-validation.md`.

## What you deliver, in this order

**Push 1, the characters as data, as fast as you can (aim: 15
minutes).** The sibling worker needs these files to exist.

1. `content/characters/grappler.json`, `infiltrator.json`,
   `flyer.json`, each with its own tuning set in `content/tuning.json`
   (`move` and `jump` numbers to start), a distinct colour, and a box:
   the infiltrator's must be at most 14 px tall so it fits a 16 px gap
   with room to spare; the grappler the biggest; all within the 32×32
   cell the validator enforces. `hero` stays exactly as it is.
2. `content/party.json` and `src/content/kinds/party.ts`: the list of
   member character ids (three tonight), cross-checked against
   `content.characters`.

**Then:**

3. A new player gets the first party member nobody is playing. Make
   `character` optional in `spawnPlayer` (`src/sim/world.ts`,
   additive: a caller that passes one still gets it) and, when it is
   left out, pick the first member of the party no player entity in
   the world is using; if all are in use, the first member again (a
   fourth friend is never turned away). Do not edit
   `content/game.json` or `src/content/kinds/game.ts` (Step 3's), and
   do not edit `src/client/main.ts` or `src/server/` (Step 1's): tell
   me when it lands and I will ask the Step 1 lead to stop passing a
   character.
4. Action `switch` (`content/actions/switch.json`; suggested keys
   `KeyQ`, `Tab` is taken by the browser so avoid it) and verb
   `switch`: a fresh press changes the player's entity to the next
   party member no other player is using, in place, feet kept at the
   same spot, with a `switched` event (entity, player, from, to). The
   entity's id does not change. If the new body would overlap a solid
   tile where it stands, try the next member; if none fits, refuse
   with a `switch-refused` event and change nothing. With one player,
   it cycles through all three.
5. The flyer's own move: flapping. Suggested: a verb `flap` listed
   only by the flyer: a fresh `jump` press in the air gives a weaker
   upward push, a limited number of times per time off the ground
   (numbers in its tuning set), with a `flapped` event. It must reach
   a ledge 5 tiles above the floor that the other two cannot.
6. The infiltrator's own move is its body: it runs through a
   one-tile-high gap the other two are stopped by. Give it its own
   feel in numbers too (quicker, a lower jump, as you judge), and the
   grappler a heavier one.
7. A room for the checks, `content/rooms/test-body.json`: a floor, a
   one-tile-high crawlspace with something on the far side, and a
   ledge 5 tiles above the floor with no stepping stones. Step 3's
   lead has been told rooms named `test-` are ours and are not part of
   the kingdom. Do not edit `graybox-hall.json`.
8. Drawing: `src/client/draw/entities.ts` already draws each kind's
   box and colour from data. Make the three tell apart at a glance at
   phone size if they do not already (colour and box are data; a small
   mark per kind in the draw file is fine, `DRAFT:`). No names over
   heads unless it costs nothing.

## The derivation, already done

Everything measured is in `docs/plan/step-2.md`, "Measure". What it
means for you:

- **A plain jump is 56.9 px, 3.56 tiles** (`jumpSpeed` 320, `gravity`
  900). Keep the grappler's and infiltrator's jumps under 5 tiles
  (80 px): `jumpSpeed`² / (2 × `gravity`) < 80, so `jumpSpeed` under
  379. The check below is what proves it, not this sum.
- **Coyote time and jump buffering already exist** in
  `src/sim/verbs/jump.ts` (0.1 s each for `hero`); copy the numbers
  into the three sets. The library is silent on them; they are
  `DRAFT:`.
- **A per-character number must be declared by one of that
  character's verbs** (`src/sim/check-content.ts`): a flap number in
  the flyer's set needs the `flap` verb to declare it, with a range;
  and a number in a set that no verb of that character declares fails
  the check. Every upward speed gets a declared max under 960 px/s
  (use 900, as `jumpSpeed` does): rising is not capped by physics.
- **`flap` and `jump` both read the `jump` action.** Verbs run in
  `(order, id)` order on each entity, `jump` at 20. `jump.ts` keeps
  whether the button was held last tick in `entity.c.jump.held` and
  updates it at the end of its own update, so a verb ordered **after**
  20 sees it already overwritten for this tick. Either order `flap`
  before `jump` (and make sure the ground jump still wins on the
  ground, and that a buffered jump on landing is not eaten), or keep
  your own "was held" in `entity.c.flap`. Trace it
  (`node scripts/trace.ts <scenario id>`): a flap must not fire on the
  same press as the take-off, and holding the button must not flap
  every tick.
- **Switching changes `entity.kind` and nothing else about identity.**
  Facts find a player by `entity.player`, so scenarios keep working
  across a switch. Boxes differ: physics measures from the top-left
  (`entity.x`, `entity.y`), so keep the feet and the middle fixed when
  the box changes (`x += (oldW - newW) / 2`, `y += oldH - newH`), then
  test the new box against solid tiles (`cellAt` in
  `src/sim/systems/physics.ts` is exported).
- **Per-verb memory of the old kind** (`entity.c.jump`, flap counts)
  must not carry a half-finished state into the new kind: a flyer who
  switches mid-air to the grappler keeps falling and cannot flap.
- **Determinism:** no `Math.random`, no clock. "The next unplayed
  member" is by party order.

## Traps

- **Unstuck is the point of the fit check.** The infiltrator switches
  inside the crawlspace: the taller bodies do not fit, so the switch
  is refused (or goes to one that fits) and the player is never left
  inside a wall. A scenario proves it. This is "there is always a way
  out": mark the refusal `// INTENT:` and add its line to
  `docs/deliberate-designs.md`.
- **Nobody is moved off their character.** With two players, a switch
  never lands on the member the other is playing, and never changes
  the other player's entity.
- **The sibling worker edits the same data files.** It adds `attack`,
  `grab` and a passive body verb to your three characters' `verbs`
  lists and strength, weight, throw and toughness numbers to their
  tuning sets. Write every list one item per line; never reformat a
  JSON file; `git pull --rebase` immediately before every edit to a
  file under `content/` and again before every push; on a conflict
  keep both sides' lines. You own size, colour, run, jump and flap;
  it owns the rest.
- **Held, carried or flying players.** The sibling worker adds a small
  helper outside the registry directories (suggested
  `src/sim/body-state.ts`) saying whether a player may act this tick,
  and makes `move.ts` and `jump.ts` use it. When it exists, `switch`
  and `flap` must use it too (a carried player does not flap away; a
  carried player may not switch, `DRAFT:`). If it is not there when
  you finish, say so in `docs/for-the-lead.md` rather than inventing a
  second one.
- **A push is the deploy, and it goes to the owner's game.** Every
  push must leave run and jump working. If the netcode from Step 1's
  Gate 2 has landed when you rebase, also run `npm run e2e` before
  pushing (`docs/verifying-and-finishing.md`, the pre-push gate).
- **Each player's own character is simulated on their own device once
  Gate 2 lands.** You write no network code. If a switch does not show
  on the other screen after Gate 2, that is a finding for me, not
  something to patch in `src/client` or `src/server`.
- **Keyboard keys already taken:** `jump` holds `Space`, `KeyZ`,
  `ArrowUp`, `KeyW`; the sibling worker is taking `KeyX`, `KeyJ`,
  `KeyC`, `KeyK`; arrows and WASD are the stick.

## Out of scope

- Attack, grab, carry, throw, weight, toughness, crates, dummies,
  placements, the scenario `entities` field: the sibling brief.
- The grappler's own move (lifting heavy things): the sibling brief
  proves it. You give the grappler its body and its feel.
- Swapping with a member a friend is playing; members nobody is
  playing standing in the world or following; a party screen; names
  and art for the three. The library leaves these open or unapproved
  (`docs/plan/step-2.md`).
- Acquired powers.
- `src/client/**` other than `draw/entities.ts`; `src/server/**`;
  `scripts/**`; `content/game.json`; `graybox-hall.json`; `hero` and
  Step 1's three scenarios, which must pass untouched.
- The touch layout: `content/actions/switch.json` is all the touch
  side needs from you.

## Decided vs. open

Decided: everything in `docs/plan/step-2.md`, "What's decided" and
"Decided by the lead". Do not reopen the ids, the party rules or what
only each character can do unless a measurement shows one cannot work;
then tell me.

Open, yours to pick, each marked `DRAFT:` at its site: every number
(sizes, speeds, jump heights, how many flaps and how strong), the
colours and marks, the order of the party. For any of these the owner
would see or feel, add an entry to `docs/decisions-log.md` in its
format (plain words, how to change it). Nothing here needs the owner
before you build.

## How it gets verified

Rung 3 of `docs/verifying-and-finishing.md`: scenarios in `npm run
check`, each with a control you watched fail, named in the commit
message. Tag each `"gate": "A"`. You will need a fact that says which
character a player is at a tick (a new file in `src/scenarios/facts/`,
for example `character`). Minimum set:

1. `body-infiltrator-fits-gap`: the infiltrator runs through the
   crawlspace in `test-body` and stands on the far side; with the same
   inputs, `body-grappler-stopped-by-gap` and
   `body-flyer-stopped-by-gap` end on the near side. Control: the
   infiltrator's box made 26 px tall.
2. `body-flyer-reaches-ledge`: the flyer stands on the 5-tile ledge;
   with the same inputs, `body-grappler-misses-ledge` and
   `body-infiltrator-misses-ledge` do not. Control: flaps set to 0.
3. `body-switch-solo`: one player presses `switch` three times and is
   each of the three in party order, back to the first, feet at the
   same place each time.
4. `body-switch-two-players`: A and B start as different members; A
   switches and becomes the one member neither was playing; B's
   entity is unchanged; a `switched` event for A that anyone can read.
   Control: the "nobody else is playing it" test removed.
5. `body-switch-refused-in-gap`: the infiltrator inside the crawlspace
   presses `switch`; it is still the infiltrator, with a
   `switch-refused` event. Control: the fit check removed (the
   character ends inside solid tiles, which a fact must catch).
6. `body-spawn-different-members`: two players spawned with no
   character named are two different members.
7. Looked at, on the built page (`npm run build && npm start`;
   headless Chromium is installed: `require('playwright')`, never
   `playwright install`): a screenshot at phone size with the three
   side by side, read by you. Say in the commit that you looked.

Also: `npm run build`, `npm run check` and `npm run gates` exit 0, and
after each code push `curl -s
https://irreverents-production.up.railway.app/healthz` reports your
commit (a deploy takes about a minute of "Application not found" first;
that is known).

## Definition of done

- The scenarios above pass on `main`, live `/healthz` reports your last
  code commit, and the live page still runs and jumps.
- `docs/architecture.md`: the "character kind" row brought up to date,
  a row for a party member, and the `switched` / `switch-refused` /
  `flapped` events with their fields.
- `docs/mechanisms/`: one writeup, `party-and-switching.md`, and its
  line in `docs/mechanisms/README.md`; `docs/mechanisms/scenarios.md`
  gains your new fact.
- `docs/deliberate-designs.md` and the `INTENT:` for the refused
  switch.
- `docs/decisions-log.md` entries as above.
- Budget: done by **06:45 UTC**. If you will not make it, tell me what
  is in the way by 06:15 and push what is green. If something must be
  cut, the flyer goes first (`docs/plan/step-2.md`); switching never.

## Where your questions go

- Blocking, or "push 1 is on main", or "spawnPlayer picks a member
  now", or "done at `<commit>`": send a message to my session,
  `session_017WiGzGRnRoAeW5Ep5iSycV` (`send_message`), in the moment.
  A question for the owner is decided by you from
  `docs/plan/step-2.md` and logged in `docs/decisions-log.md`; nothing
  waits for them.
- A flag or a "worth noting": `docs/for-the-lead.md`, headed with this
  file's name.
- Your final message: done or blocked, the commit, nothing else. The
  honest report (what you ran, each control, what you did not verify)
  is the commit message.
