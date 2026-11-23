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
- **Sideways** (touch): the biggest whole scale at which the view fills
  the screen's height (180–225 tall, 288–400 wide). Two modes, chosen by
  which gives the bigger scale (a tie goes to bars):
  - `bars`: the controls sit in bars at least 128 points wide (plus the
    notch) beside the view and nothing covers it. 750×340: 296×204 at 5×;
    844×390 without insets: 294×195 at 6×.
  - `over`: the view fills the screen between the notch insets and the
    controls sit over its lower corners, see-through (only a picture or
    faint word painted). 667×375: 333×187 at 4×; 844×390 with a notch on
    both sides and a home bar: 375×195 at 6×.
- **The game pad.** The left thumb has the stick (two halves; 140–148
  points wide upright). The right thumb has the actions in an arc of two
  rings round the bottom-right corner (`slots()`), nearest first in
  `ARC_ORDER` (jump, attack, grab, interact, switch; an action file not
  named there goes to the end of the arc, so a new action still gets a
  button with no code). In the narrow sideways bars the arc becomes two
  staggered columns. Buttons are 64 points upright, 56 in a bar, 60 (touch
  area) over the view. The pictures are drawn at a whole number of device
  pixels per art pixel; upright a picture fills its button.
- **The stick pushes up**: slide the thumb up off the pad and keep holding
  (down: off its bottom). Before this a touch player could never enter an
  `enter` doorway (that takes a fresh push up, `room-doors.ts`) or attack
  or throw upwards. A small chevron above the pad (not over the view) shows
  it and lights while pushed.
- **A button with no picture** (today: Use) is a round night-coloured plate
  with a pale rim and its word, except over the view, where only the faint
  word is painted (the paint limit in `scripts/e2e/phone.ts`).
- **The surround** is the art contract's night ramp: a dark gradient with a
  faint dot grid, a 1-point pale frame round the picture (outside it, never
  over a game pixel), and all text in a small rounded uppercase type
  (`ui-rounded`, SF Rounded on an iPhone) instead of the browser default.
  The "Connecting…" pill and the upright hint use it.
- **The upright line** now says "Plays either way up", left-aligned under
  the view, still dismissible (`INTENT:` a way out; fact g taps it away).

## Deviations from the contract

- **Sideways is not exactly 320×180.** `docs/mechanisms/art-pipeline.md`
  says "sideways 320×180". At a whole scale on a real phone that leaves
  black bands, so sideways is 288–400 wide and 180–225 tall (e.g. 296×204
  on a 750×340 page, 375×195 on a notched 844×390). Everything drawn must
  already hold up at variable sizes for upright; this only widens the
  range. Back to fixed: set `SIDEWAYS` in `shell.ts` to
  `{ wMin: 320, wMax: 320, hMin: 180, hMax: 180 }`.
- **Sideways controls overlay the corners only where bars would cost a
  step of scale.** The brief's "Done" says sideways controls overlay the
  picture's lower corners; scripted fact c2 (iPhone 14 landscape, 750×340)
  requires that no control covers the play field, and checks are not
  weakened. Where bars fit at the same scale they are used; a real
  notched iPhone sideways (both insets) gets the overlay.
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

## Flags for the lead

- **`docs/mechanisms/network.md`, "The page shell"** still says the canvas
  is 320×180 and describes the old upright layout; the facts are above.
- **`docs/plan/step-5.md`** says upright shows "the same 320×180 view …
  and one dismissible line about turning the phone"; both changed (the
  owner's later words).
- **The world lane** must handle a view taller than a room (upright 256
  vs `courtyard` 144, `graybox-hall` 176): `roomOrigin` centres the room
  and the rest is plain sky colour today.
- **No scripted check covers the stick's up push or a doorway by touch.**
  A fact in `scripts/lib/e2e-touch.ts` (enter the `undercroft` doorway by
  touch) would pin it; not added here (the check is not this lane's).
- **Upright on a tall phone** leaves ~130 points between the line under
  the view and the pad; a taller cap than 256 would fill it at the cost of
  showing past the tallest room.

## Not verified

- On a real iPhone: everything here was measured in Chromium emulating
  390×844, 390×664, 844×390, 750×340 and 667×375 at 2–3×, with the notch
  and home-bar insets set by hand. `ui-rounded` falls back to the system
  font in Chromium; the rounded face is only seen in Safari.
- Entering a doorway by touch end to end: verified only that the slide up
  sends `y: -1` to the server and lights the chevron.
- 60 frames a second on a phone: the layout runs only on resize, and the
  bigger canvas upright (234×256 vs 320×180) draws fewer pixels than
  sideways; not measured on hardware.
