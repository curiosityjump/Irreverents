# Doorways on a phone: the Use button takes you through, and the game shows it

Brief for one cold builder. Written 2026-11-23 17:00 UTC by the orchestrator
(`session_017WiGzHhke4tkAThPgw6EXs`). Read `docs/mechanisms/rooms-and-doors.md`
("The two kinds of door") and `src/client/touch.ts` before changing anything.

**Reports:** `send_message` to the session on the Orchestrator line of
`docs/questions-for-the-owner.md`, after the push, with the commit. Notes file:
`docs/plan/step-5.md`, a new last entry under its handoff notes.

**One push, fully checked. Urgent: the owner is playing.** A push to `main`
is the deploy.

## The task, and why

The owner, 2026-11-23 ~17:00 UTC, first-hand, told that an enter doorway is
used by pushing the stick up: **"There is no stick to push up..."**

Measured at 0372804:
- An `enter` doorway (every door that isn't on a room's edge: the throne room,
  the cantina, the undercroft cellar, the camp, the quarry road, the hidden
  ones) is used only by a fresh push of the stick up
  (`src/sim/systems/room-doors.ts:79-82`, `STICK_UP`; the comment at :91 says
  `DRAFT: a doorway is used with the stick, no new action button`).
- On touch, "up" exists only as a hidden gesture: slide the thumb up off the
  left/right pad and keep holding (`src/client/touch.ts:61-69`, `INTENT:`).
  Nothing on screen shows it. To a player, doorways do not work on a phone.
- `npm run e2e` passes only because the script knows the gesture
  (`scripts/e2e/outpost.ts:35`).
- The phone already has a context button: **Use** (`content/actions/interact.json`,
  label "Use", key E). Today it is read by `src/sim/systems/npc-interact.ts`
  (a shop counter, goods) and `src/sim/systems/cantina-brawl.ts` (the bell),
  and by `src/client/shell.ts`.

It moves M2's real meaning (two people can play it *on phones*) and D-093:
"Every action must work with touch on an iPhone browser, through a few
context-sensitive controls" (`CLAUDE.md`, iPhone first).

## What to build (`DRAFT:` throughout; decisions-log entry 2026-11-23 "Doorways by Use")

1. **Use goes through a doorway.** In `room-doors.ts`, a fresh press of
   `interact` while the body's middle is in an `enter` doorway counts as
   asking, exactly like a fresh push up (keep the stick and `askForDoor`
   working as they are). Any body, never a player test (`INTENT:` in that file).
2. **The door wins that press.** That same press must not also buy, rob or
   ring a bell: `npc-interact.ts` and `cantina-brawl.ts` skip a body that is
   standing in an enter doorway on that tick (one shared helper, e.g.
   `inEnterDoorway(content, e)` exported from `room-doors.ts`). Measure that
   no counter, shelf or bell sits within reach of a doorway today (list them
   in the notes); if one does, say so instead of guessing.
3. **The phone shows it.** While the player's own character stands in an
   enter doorway, the Use button shows that it goes in: a door/arrow look and
   the label "Go in" (the button keeps its `data-action="interact"`; additive
   only). And in the game picture, a small bobbing up-arrow over the doorway
   (a new `src/client/draw/door-hint.ts`, one line in `render.ts`; the pixel
   font or a tiny drawn arrow; no digits).
4. **The keyboard too:** E (Use) works the same, Up/W still works.

## Signal

- A new scenario `scenarios/step3-enter-doorway-by-use.json`: standing in the
  castle street's throne-room doorway, a press of `interact` carries the
  player to the throne room; holding it does not carry them back; a fresh
  press does. **Control watched to fail:** with step 1 reverted, it fails.
- A scenario that a Use press at the street's counter (not in a doorway) still
  buys, unchanged (an existing step4 one may already prove it: name it).
- `npm run e2e`: a new touch fact: a phone-sized page walks into the
  courtyard's camp doorway and **taps the Use button** (no slide gesture) and
  is in the camp; while standing in the doorway the Use button carries the
  "Go in" state (read from the DOM).
- Screenshot at iPhone size, sideways and upright, standing in a doorway:
  committed under `docs/plan/step-5-shots/doors/`.

## Traps

- Step 17's builder (`session_017WiGzGw7XaQ6tZNddFaa8s`) is editing
  `src/client/shell.ts` and `src/client/main.ts` for the start screen right
  now; Step 3's builder (`session_017WiGzK3hTpzPypD5R9DVit`) is in
  `src/sim/check-rooms.ts` (not your file). Keep every edit small and
  additive, and `git pull --rebase` right before you push.
- `npm run check` takes about 3.5 minutes until Step 3's fix lands: budget it.
- `step3-enter-doorway` and `step11-door-in-and-out` must stay green unchanged.
- Don't move or restyle the other controls (Step 5's "Controls never hide the
  game").

## Out of scope

Shop interiors (a later step); walk doors; any room layout.

## Done

`npm run build`, `npm run check`, `npm run e2e` green; pushed to `main`;
`npm run check:deployed` current, `npm run check:live` passing; the doc table
in `docs/mechanisms/rooms-and-doors.md` updated ("Used by" for `enter`: a
fresh push up, **or a fresh press of Use**); the `DRAFT:` comment at
`room-doors.ts:91` updated to say so.
