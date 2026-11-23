# Step 11, slice B: the cantina's look, the swap, the chase lock, the phone check

**Brief** (scratch; deleted when this slice ships). Written by the Step 11
lead, `session_017WiGzFy3MD6ecvM7QMvQGd`, 2026-11-23 ~16:15 UTC, against
`main` at 7b7b91d. Same worker as slice A: you know the cantina code;
`docs/mechanisms/cantina.md` is yours. Run `docs/sop.md` lightly (you have
the context). Plan step: `docs/plan/step-11.md`, signals 6 (second half),
7 and 8. **Pushes, in this order, each green:** (1) the look, (2) the
swap, (3) the chase lock, (4) the phone check and docs.

**Measure-table row:** none (no gate covers the cantina); it is what the
owner named as missing.

## 1 · The look (first push, small)

`tools/art/tiles/README.md:177-179` already says it: the cantina has no
art files, so it draws plain shapes. Add `'cantina': 'town'` (`DRAFT:`;
`castle` is the other candidate, pick what reads as a tavern) to
`ROOM_THEME` in `tools/art/tiles/make.py:44-51`, add `cantina` to the
fixed `ROOMS` list in `selfcheck.py:23` and the theme map in
`preview.py:236`, fix the "6 atlas files" message (`make.py:234`), run
`python3 -I tools/art/tiles/make.py`, and commit the new
`content/atlases/cantina.json` and `content/backdrops/cantina.json`. It
rewrites `assets/tiles/*.png` and `assets/backdrops/*.png` byte-for-byte
the same; **if `git diff --stat assets/` shows any change to an existing
image, stop and tell the lead** (Step 8's lanes are drawing). A room with
no specific branch gets the default backdrop (`make.py:198-200`); a
tavern-specific backdrop branch is welcome if it is small. Step 8 (the
orchestrator holds it) knows you are in this file. Screenshot the room.

## 2 · The swap: tap a regular, then the member to replace (D-084)

**Measured:**
- `Input` is `{x, y, held}` (`src/sim/types.ts:17-24`, additive only).
  The page builds it field by field in `src/client/main.ts:120-128`
  `readInput()`, and **the server copies it field by field and drops the
  rest** (`src/server/game.ts:57-61` `cleanInput`). A new field must be
  added in both places or it never reaches the server's `step()`.
- No handler on the game canvas. `#touch` lies over the view with
  `pointer-events: none` (`index.html:36-37,49`); only the pad and buttons
  take touches. Screen → room pixels: `(clientX - rect.left) *
  canvas.width / rect.width + camera.x` (same for y), with `camera` from
  `render()` (`render.ts:55,83`).
- The party is content only. `content.party.members` is read for play at
  `src/sim/party.ts:44` (`firstFreeMember`) and `src/sim/verbs/switch.ts:46`.
- **The page owns its character's `kind`** (network.md:66-69, 119-123); no
  effect changes it (`effects.ts:14-25`). The page takes the server's
  whole entity, `kind` included, when a non-push effect arrives
  (`net/client.ts:195-196` → `adopt`, :93-97).
- **Top-level `World` fields are copied into the page's world by key**
  every snapshot (`net/client.ts:181-182`). A page's own world has only its
  own character, so a system writing a top-level field must not run there
  (it would overwrite the server's value with an empty one each tick). The
  `~cantina` guard you already use is the way.
- `draw/cantina.ts` does not know the local player; `render()` has it as
  `pv.me` (`render.ts:51`).

**Build (`DRAFT:` all of it, logged):**
- `Input.tap?: { x: number; y: number; n: number }`: room pixels and a
  count that grows by one per tap, so a tap repeated across several
  ticks' inputs is acted on once. Optional; carried in `readInput` and
  `cleanInput` (validate numbers; drop it otherwise). A tap on the game
  view (a `pointerdown` on `#game` or the shell, **not** on the pad or a
  button: check those still work and that the window's `touchstart`
  un-hiding still fires) sets it. If the tap lands on the open row's chip
  (the page knows where it drew it), send `tap.slot` (the member index)
  instead of a room point.
- `World.party?: string[]`, the party as it stands in this world. Read
  `world.party ?? content.party.members` at the two play sites in
  `party.ts` and `switch.ts` (nothing else in Step 2's files; Step 2 is
  held by the orchestrator, told). Written only by the server world.
- In a `cantina-*` system (server world only): a player's fresh tap
  inside a regular's box (plus `DRAFT:` 8 px for a finger) opens that
  player's row with that regular, **only if the regular is not already in
  the party** and no brawl is on. State on `~cantina`
  (`pick[playerEntityId] = { kind, until }`). The row closes on: a tap
  elsewhere, any stick movement or button press, a brawl starting, or by
  itself after `DRAFT:` 6 s. A slot tap with the row open:
  - a member nobody plays → `world.party[slot] = kind`. The regular keeps
    wandering (it is still unplayed); the replaced one still wanders.
  - your own member → the party slot becomes `kind` **and you become it**,
    through a new additive effect `become { kind }` in
    `src/sim/effects.ts` (`applyEffect` sets `e.kind`; it is a non-push
    effect, so the page adopts the server's copy). Feet and middle stay
    put the way `switch.ts` does it; refuse if the new body would not fit
    (`boxInSolid`, `party.ts`), with `cantina-swap-refused {why: "no-fit"}`.
  - a member a friend plays → refused, nothing changes
    (`cantina-swap-refused {why: "taken"}`; `INTENT:` "avoid silently
    stealing a teammate's avatar", doc 06).
  Emit `cantina-swap {player, slot, from, to}`. Signal 7 in full.
- `draw/cantina.ts`: the row across the screen for the picking player
  only (pass `pv.me` in from `render.ts`: one argument, additive): three
  chips, the members in party order, each in its character's colour,
  plainly showing which one is a friend's (dimmed, `DRAFT:`). Sized for a
  thumb on a 375 px-tall phone view. No text needed beyond a short
  `DRAFT:` hint.
- `drawn` (`main.ts:162-176`): add `cantina?: { row: { kind, slot, x, y,
  w, h, taken }[] | null; counter: { player, ko, falls }[] | null }` in
  screen pixels, so the e2e can tap the row and read the counter. Step 5's
  file: additive only (its holder is told).

## 3 · The chase lock (D-088)

**Measured:** a guard is chasing player P exactly when its
`c.respond.phase === 'chase' && c.respond.sight === P.id`
(`alert-respond.ts:136-141`; `alert-follow.ts:32-35` keeps `sight` through
a door). Only `role === 'guard'` responds (`alert-respond.ts:10`). Side:
`npcKind(content, e)?.side` (`npc/state.ts:96-98`); guard is `good`.
Step 12's outpost fighters are `bad` and use `c.outpostFight`, never
`c.respond`, so they never lock the door: correct per D-088 ("good guys").
**The page moves its own character through doors** (`room-doors.ts:61-67`,
fires at :98-99), and a page's world has no guards. So:
- A `cantina-*` system (server world only) writes `world.chased?:
  string[]`: the player entity ids some `good` guard is chasing now. The
  page gets it by key.
- `room-doors.ts` (Step 3's, no lead; additive): a door may carry
  `"refuse": "chased"` (allow the key in `src/content/kinds/rooms.ts:193`);
  such a door does not fire for an entity in `world.chased`, and emits
  `door-refused {entity, player, door, why}` once per fresh push. Update
  the `INTENT:` at :49 so it stays true (doors still never test for a
  player; they test a list the world keeps). Put `"refuse": "chased"` on
  `to-cantina` only (the cantina's own door out is never locked:
  `INTENT:` there is always a way out).
- Feedback: a short `DRAFT:` sign at the doorway on that player's screen
  for a second (draw it in `draw/cantina.ts` from the event or a
  `c`-free field; your call). No text over a hit.
- Scenario: a guard chasing a player in the street (build it from Step 4's
  chase scenarios, e.g. the `step4-*chase*` / `step4-*follow*` ones: name
  the one you start from) → push up at `to-cantina`: refused; once the
  chase is over (alert back to 0): it opens. Control: the same push with
  no chase goes in. And a scenario showing a bad-side chaser does not lock.

## 4 · The phone check and docs

- A new `scripts/e2e/cantina.ts`, called from `scripts/e2e.ts` in one
  line, using `scripts/lib/e2e-touch.ts` (`phone()`, `pointOn`, `tap`) and
  CDP touch like `scripts/e2e/phone.ts:250-269`: on a phone-sized page,
  walk into the cantina; tap a regular not in the party (from `drawn`
  entities' `px - camera.x`), the row appears in `drawn.cantina.row`; tap
  a member nobody plays: the party changes and `switch` reaches the
  newcomer; tap elsewhere with the row open: closed, nothing changed;
  attack a regular: a brawl, and `drawn.cantina.counter` shows on each of
  two pages with the same numbers. **Signal 8.**
- `docs/mechanisms/cantina.md`: the swap, the lock, the new fields
  (`Input.tap`, `World.party`, `World.chased`, effect `become`, door
  `refuse`). `docs/architecture.md`: the shared contracts that grew, and
  Step 11's paths row (the agreed edits list). `docs/mechanisms/network.md`:
  `become`, and that `Input` now has `tap` (cleanInput).

## Traps

- **A field the server drops.** Without `cleanInput`, every scenario
  passes (one world) and the live game ignores every tap. The real-server
  check must send a tap through a real connection: extend
  `scripts/checks/step11-cantina.ts`.
- **A system writing a top-level field on the page.** Guard it on
  `~cantina`, as in slice A; prove with the real-server check that a page
  sees `world.chased` / `world.party` from the server.
- **The pad and buttons stop working** because something now catches
  touches above them. Run `npm run e2e` in full; the phone facts
  `scripts/e2e/phone.ts` must stay green.
- **A swap that changes another player's character.** Never. Only the
  tapping player's own entity may get `become`.
- **`firstFreeMember` with a changed party:** a new player joining after a
  swap gets `world.party`'s first free member. One scenario.
- **Determinism**, and the ids (`become`, `refuse`, `cantina-swap*`,
  `door-refused`) are contracts once pushed.

## Out of scope

Shortcut doors (D-087); guards following in (D-089, D-090); unlocking
characters; keeping a best brawl; the number of party slots; anything in
Step 4's people, Step 12's outpost, Step 8's sprites.

## Decided vs. open

**Decided** (owner, library): tap a regular, the party appears across the
screen, tap the one to replace (D-084); attack, not tap, starts a brawl
(doc 33); never take a friend's character (doc 06); chased by good guys,
every cantina entrance refuses; the chase over, it opens (D-088).
**Decided by the lead, `DRAFT:`** (log it): only a regular outside the
party opens the row; no swapping during a brawl; replacing your own member
makes you the newcomer; the row's closing rules; the lock means an active
chase by a good guard, not a raised alert.
**Yours, `DRAFT:`, logged:** sizes, timings, the row's look, the refusal
sign, the theme.

## Verification

`npm run build`, `npm run check` (every step's scenarios, your new ones
each with a control watched once), `npm run e2e` in full, the extended
real-server check, `npm run check:deployed` after the last push. Read
`/debug/errors` on live before each code push. Screenshots: the room's
look, the row open on a phone-sized page.

## Where things go

Blocking questions: `send_message` to the lead
(`session_017WiGzFy3MD6ecvM7QMvQGd`). Flags: `docs/for-the-lead.md` under
this file name. Tell the lead by message after each push lands. Final
message: done or blocked, the last commit.
