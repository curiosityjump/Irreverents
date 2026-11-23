# The page around the game, upright and sideways (look lane "shell")

**Reference.** Open before touching `src/client/shell.ts`, `touch.ts`,
`index.html`'s styles, or how the view's size is chosen. Written
2026-11-23 by the shell lane of Step 8's look (brief
`handoff-prompts/look-shell.md`); the orchestrator folds these sections
into their homes.

## What exists

- **The view's size is a variable.** `view` in `src/client/render.ts`
  (`{ w, h }`, game pixels) is set by `src/client/shell.ts` on every
  layout (load, resize, rotation, the visual viewport changing); the
  canvas's own width and height follow it, and its smoothing is switched
  off again after each resize. Off a touch screen it stays 320×180.
- **Upright** (a touch screen taller than wide): the view runs edge to
  edge across the screen under the notch at the whole scale that makes it
  about 14–16 tiles wide (`UPRIGHT`: 192–264 game px), and as tall as the
  controls leave room for, at least square where possible, at most 256
  (the tallest room). On a 390×844 iPhone: 234×256 at 5×, 390×427 points.
  Measured before: 320×180 at 3×, 320×180 points, with ~500 points of
  empty black under it.
- **Sideways** (touch; look round 2, frame lane): the biggest whole scale
  at which the view fills the screen's height, framed like the owner's bar
  (`SIDEWAYS`: 280–450 wide, 160–180 tall). Two modes; **bars only when they
  give a strictly bigger scale** (a tie goes to the overlay):
  - `over` (every iPhone measured): the view fills the screen between the
    notch insets and the controls sit over it, see-through, low: the stick
    bottom-left, one row of four actions bottom-right (`LOW_ROW`, nearest
    the corner first in `ARC_ORDER`: jump, attack, grab, interact), and any
    action after those (today: switch) as a 52-point chip along the top
    edge, left of the sound button, clear of the alert pips. Touch areas are
    52 points; only the 24-px picture is painted. The shell publishes the
    **bottom reserve** (`view.reserve`, game px: from the top of the stick
    and the low row to the view's bottom; 29 at 750×340) and the camera
    keeps the room's floor and the player above it (`roomOrigin`,
    `docs/mechanisms/rendering-world.md`).
  - `bars`: the controls in bars beside the view, nothing over it. Reached
    only where bars win a whole step of scale; no iPhone size measured.
  Measured 2026-11-23 (Chromium emulation), before → after:

  | Page (CSS, DPR) | before | after |
  |---|---|---|
  | 750×340 @3 (Playwright iPhone 14 landscape) | bars, 296×204 at 5×, picture 493 of 750 pt (66%) | over, 375×170 at 6×, full width |
  | 844×340 @3, insets 47/47/0/21 (iPhone 14 in Safari) | bars, 296×204 at 5×, 493 of 844 pt (58%) | over, 375×170 at 6×, 750 pt between the insets |
  | 844×390 @3 | bars, 294×195 at 6× | over, 361×167 at 7× |
  | 667×375 @2 | over, 333×187 at 4× | over, 333×180 at 4× (7.5 pt bands above and below) |
  | 736×414 @3 | over, at 6× | over, at 7× |
  | 390×664 upright | 234×252 at 5× | unchanged |

  A body is 2.0 points per game pixel at 6× on a 3× phone (was 1.67): the
  grappler's 39 drawn pixels are 78 points tall.
- **The game pad.** The left thumb has the stick (two halves; 140–148
  points wide upright). The right thumb has the actions in an arc of two
  rings round the bottom-right corner (`slots()`), nearest first in
  `ARC_ORDER` (jump, attack, grab, interact, switch; an action file not
  named there goes to the end of the arc, so a new action still gets a
  button with no code). In the narrow sideways bars the arc becomes two
  staggered columns. Buttons are 64 points upright, 56 in a bar, 52 (touch
  area) over the view. The pictures are drawn at a whole number of device
  pixels per art pixel; upright a picture fills its button.
- **The stick pushes up**: slide the thumb up off the pad and keep holding
  (down: off its bottom). Before this a touch player could never enter an
  `enter` doorway (that takes a fresh push up, `room-doors.ts`; since
  "Doorways by Use" a tap of Use does it too, and the Use button reads
  "Go in" there: `showGoIn`, `.go-in`) or attack or throw upwards. A small chevron above the pad (not over the view) shows
  it and lights while pushed.
- **A button with no picture** (today: Use) is a round night-coloured plate
  with a pale rim and its word, except over the view, where only the faint
  word is painted (the paint limit in `scripts/e2e/phone.ts`).
- **The surround** is the art contract's night ramp: a dark gradient with a
  faint dot grid, a 1-point pale frame round the picture (outside it, never
  over a game pixel), and all text in a small rounded uppercase type
  (`ui-rounded`, SF Rounded on an iPhone) instead of the browser default.
  The "Connecting…" pill and the upright hint use it.
- **Checks** (`scripts/e2e/phone.ts`, `FULL_VIEW_PHONES`): 667×375 @2,
  736×414 @3, 750×340 @3 and 844×340 @3 with insets 47/47/0/21 each pass
  the see-through test (every action and the stick on screen, clear of
  notch and home bar, ≥ 44 points, reachable, two fingers run and jump,
  paint ≤ 3% and ≥ 0.1%; measured 2.79%, 1.74%, 2.07%, 2.07%). `c2`
  (`scripts/e2e.ts`) is the same test on the two-page run's phone. **`i-clear`**:
  at 750×340, standing at six spots (throne-room (9, 14), (17, 14);
  castle-street (16, 10), (37, 10), (2, 10), (45, 10)), no control's
  rectangle overlaps the player's own box; control: with `view.reserve`
  forced to 0, grab, the stick and attack overlap at three of them
  (watched to fail).
- **The upright line** now says "Plays either way up", left-aligned under
  the view, still dismissible (`INTENT:` a way out; fact g taps it away).

## Deviations from the contract

- **Sideways is not exactly 320×180**: 280–450 wide and 160–180 tall at
  a whole scale (375×170 on an iPhone 14, 333×180 on a 667×375 page); the
  contract's round 2 says "about 320×180 or tighter (height at most 180)".
- **Fact c2 changed by design** (round 2, decided in
  `docs/decisions-log.md` 2026-11-23, "Held sideways, the game fills the
  phone"): it used to require no control over the play field; it is now
  the see-through test the full-view phones pass. The owner's rule
  ("UI should not cover secret entrances or enemies", doc 33) is kept by
  the camera's bottom reserve and fact `i-clear`.
- **Upright height is capped at 256** (the tallest room), not "as tall as
  the screen allows", so a room never shows more than one band past it.
  On a tall phone this leaves a quiet gap between the line under the view
  and the pad.
- **`render.ts`**: besides the one `view` line, my clone changed the two
  uses in `render()` (the sky fill and `roomOrigin`) to read the view
  through a module alias, because the `view` parameter shadows the export.
  If the world lane's change was on `main` at my push, theirs was taken;
  see the commit.

## Decisions

### 2026-11-23 · Held upright, the game fills the top of the screen and the controls are a game pad below it
- **Decided by:** look lane "shell", Step 8
- **Instead of asking:** "How big should the picture be upright, and how should the buttons be arranged?"
- **Why this way:** you said "It should play well in portrait too, not just landscape. Looks awful in both right now". The picture now runs edge to edge, about 15 tiles wide and 16 tall, five times bigger per pixel than the old strip; arrows under the left thumb, the action buttons in an arc under the right, 64 points each.
- **To change it:** the sizes are the `UPRIGHT`, `MIN_BUTTON` and `ARC_ORDER` lines at the top of `src/client/shell.ts`.
- **Where:** `src/client/shell.ts`, `docs/mechanisms/phone-shell-look.md`.

### 2026-11-23 · Sideways, the picture fills the screen's height, slightly wider or narrower than before
- **Decided by:** look lane "shell", Step 8
- **Instead of asking:** "Keep exactly 320×180 sideways and accept black bands, or let the view's shape follow the phone?"
- **Why this way:** your words were "Looks awful in both"; the bands were most of what looked wrong. The view is now 288–400 pixels wide and 180–225 tall, whatever fills the screen at a whole scale.
- **To change it:** the `SIDEWAYS` line in `src/client/shell.ts`.
- **Where:** `src/client/shell.ts`.

### 2026-11-23 · The upright line no longer says it is better sideways
- **Decided by:** look lane "shell", Step 8
- **Instead of asking:** "Keep the 'Better sideways' advice?"
- **Why this way:** it carried no `INTENT:` quoting you, and you have since said portrait should play well. It now says "Plays either way up" and can still be dismissed (a scripted check requires one dismissible line).
- **To change it:** the `#hint` line in `src/client/index.html`.
- **Where:** `src/client/index.html`.

### 2026-11-23 · On a touch screen, sliding the thumb up off the arrows pushes up (to go through a doorway)
- **Decided by:** look lane "shell", Step 8
- **Instead of asking:** "How does someone on a phone go through a doorway?"
- **Why this way:** doorways need a push up and the touch arrows had none, so phone players could not use them at all. Sliding up is one thumb, no extra button ("a few context-sensitive controls"); a small chevron above the arrows shows it.
- **To change it:** the `y =` line in `aim()` in `src/client/touch.ts`.
- **Where:** `src/client/touch.ts`.

### 2026-11-23 · Sideways, the controls sit low over the picture and the camera lifts the floor above them
- **Decided by:** look round 2, frame lane, Step 8
- **Instead of asking:** "Where do five buttons go over a 340-point-tall picture without hiding the floor, the player or a doorway?"
- **Why this way:** your bar has a band of ground under the feet and nothing else at the bottom; the stick and four actions now sit in that band (about a sixth of the picture), the camera keeps the floor and the player above them, and the switch, used least, is a small chip at the top. Before, the right-hand buttons climbed to 60% of the height, over barrels, doors and the villain.
- **To change it:** `LOW_ROW` and `OVER_BUTTON` at the top of `src/client/shell.ts` (a bigger `LOW_ROW` puts switch in the row too; the reserve follows by itself).
- **Where:** `DRAFT:` at those lines; the reserve is `roomOrigin` in `src/client/draw/room.ts`.

### 2026-11-23 · Sideways, a tie between bars and the overlay goes to the overlay, framed at 180 tall or less
- **Decided by:** look round 2, frame lane, Step 8 (the orchestrator's brief, from your words and the decisions log)
- **Instead of asking:** "Keep the side bars when they cost nothing?"
- **Why this way:** "Compare to kirby and the amazing mirror": no side panels, sky to the top edge, bodies big. Every iPhone sideways is now edge to edge at 6× or 7×.
- **To change it:** `SIDEWAYS`, and `sBars > sOver` in `src/client/shell.ts`.
- **Where:** `DRAFT:` at `SIDEWAYS`.

## Flags for the lead

- **`docs/mechanisms/network.md`, "The page shell"** still says the canvas
  is 320×180 and describes the old upright layout; the facts are above.
- **`docs/plan/step-5.md`** says upright shows "the same 320×180 view …
  and one dismissible line about turning the phone"; both changed (the
  owner's later words).
- **A view taller than a room** (upright 252 vs `courtyard` 144): handled
  in round 2, the room stands on the view's bottom and the spare height
  goes above it (`roomOrigin`).
- **No scripted check covers the stick's up push or a doorway by touch.**
  A fact in `scripts/lib/e2e-touch.ts` (enter the `undercroft` doorway by
  touch) would pin it; not added here (the check is not this lane's).
- **Upright on a tall phone** leaves ~130 points between the line under
  the view and the pad; a taller cap than 256 would fill it at the cost of
  showing past the tallest room.

- **`t-throw-friend` failed once in four local e2e runs** this round (A's
  page drew B move 20 px, not fly) and passed on the rerun with no change:
  flaky, not from the layout (the desktop page, no touch). Step 11's or
  the actors' fact; not edited.
- **667×375 now has 7.5-point dark bands** above and below (333×180 at
  4× is 360 of 375 points), the price of "at most 180 tall"; a 187-tall
  view filled it before.
- **`docs/plan/step-5.md`, "Controls never hide the game"** now reads as
  "controls never hide the floor or the player": the orchestrator updates
  it (brief).
- **`window.irreverents.view`** is new on the debug object (read-only by
  convention); fact `i-clear`'s control writes `reserve` to 0 and a resize
  restores it.

## Not verified

- The round-2 numbers on a real iPhone: the 844×340 Safari case is
  emulated with `Emulation.setSafeAreaInsetsOverride`, as calculated in the
  brief, not seen on a device.
- On a real iPhone: everything here was measured in Chromium emulating
  390×844, 390×664, 844×390, 750×340 and 667×375 at 2–3×, with the notch
  and home-bar insets set by hand. `ui-rounded` falls back to the system
  font in Chromium; the rounded face is only seen in Safari.
- Entering a doorway by touch end to end: verified only that the slide up
  sends `y: -1` to the server and lights the chevron.
- 60 frames a second on a phone: the layout runs only on resize, and the
  bigger canvas upright (234×256 vs 320×180) draws fewer pixels than
  sideways; not measured on hardware.
