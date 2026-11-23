# Rendering the world: backdrops, ground, parts, decoration

**Reference.** Open it before touching `src/client/render.ts`,
`src/client/draw/room.ts`, `room-parts.ts`, `alert.ts`, `backdrop.ts`,
`autotile.ts` or `decor.ts`. The contract these follow is
`docs/mechanisms/art-pipeline.md`; this file is the world lane's notes on
how it was built (Step 8, the look, round 1), for the orchestrator to fold
into the shared documents.

## What exists

- **The view is a variable.** `view` in `src/client/render.ts` (`{ w, h }`,
  320×180 by default); `render()` reads `view.w` / `view.h` for every size
  it uses, and the camera (`roomOrigin`) follows the player within the
  room's edges at any size. The shell lane sets it for an upright phone.
- **Draw order** (`render()`): sky and backdrop layers → back wall → `far`
  decor → ground with its `top`/`under` pieces (those three from one cached
  picture) → enter doorways → working parts → bells → `back` decor →
  bodies (actors lane) → away marks → `front` decor → impact dust and shake
  → the doorway arrow (`draw/door-hint.ts`, own character only) → moods and barks → ring bars and alert pips → the king's speech → Hall
  of Legends. `PlayerView.drawn` is untouched.
- **"Looks solid"** (`solidLook` in `draw/room-parts.ts`): one set per room
  and part state, built from the room file plus false walls, unbroken
  wall-look breakables and hidden walk doors, continued past the room's
  edges. The ground, the back wall and the graybox path all read it, so a
  false wall and a hidden door are drawn by the same code as the wall
  around them. It replaced the old "paint the secret as wall, then paint
  out the lit edge below it" step, with the same pixels.
- **Ground** (`draw/autotile.ts`): the contract's 4×4 block (`N·1 + E·2 +
  S·4 + W·8`), inner-corner overlays on index-15 tiles, hash-chosen `fill`,
  `top` and `under` pieces (`[-1, -1]` draws nothing), one-way runs
  (`left`/`mid`/`right`/`single`). An atlas without `autotile` uses its
  `cells` as before, but for false walls and hidden doors too.
- **The room's cached picture** (`draw/room.ts`): back wall, far decor and
  ground drawn once into an offscreen canvas with 12 tiles of margin on
  every side, so a room smaller than the view, or an upright view, shows
  ground past the edge and never a void. Rebuilt only when a wall breaks or
  an image arrives (and every half second while a far-decor image is still
  missing). Each frame copies the visible part with one `drawImage`.
- **Backdrops** (`draw/backdrop.ts`): the sky as up to 8 flat bands fixed
  to the screen, then each layer with parallax, sideways wrap, top/bottom
  pinning and optional `parallaxY`.
- **Decoration** (`draw/decor.ts`): items by tile, bottom-left anchored,
  `flip` mirrored, culled to the view; `blend: "lighter"` drawn with
  `globalCompositeOperation = 'lighter'` in its own layer, then reset.
- **Round 2 fields** (the contract's "Round 2 additions"; validated in
  `src/content/kinds/{atlases,backdrops,decor}.ts`, each absent → the old
  picture): `autotile.deep` (≥ 2 cells; `content/backdrops`' `outside.below:
  "deep"` without it fails the check), `autotile.regions` (a rectangle in
  room tiles, which must lie inside the room, with its own 4×4 `origin`
  and optional `fill`/`top`/`under`; `regionAt` picks the first that holds
  a tile), `outside` (`above: fill|sky`, `below: fill|deep`), a layer's
  `pin: screen|room` and `front`, a decor item's `blend`. Proven with a
  throwaway courtyard set (passes; each field malformed is refused) and
  one render, then removed.
- **Past the room's edge, by `outside`** (`drawGround`, `buildCache`):
  `sky` paints neither ground nor back wall above row 0 (nor a `top` piece
  there); `deep` paints the solid tiles below the last row from
  `autotile.deep` by hash, with no top/under pieces; `fill` as before.
  `INTENT:` the autotile index is worked out from `solidLook` exactly as
  before; only the picture changes.
- **Layers**: `pin: "room"` measures `y`/`offsetY` from the room's
  on-screen top or bottom edge; `front: true` layers are skipped in the
  backdrop pass and drawn by `drawFrontLayers` after bodies, effects and
  away marks, before `front` decor (`render()`).
- **The camera up and down** (`roomOrigin`, round 2): it may look past the
  room's bottom edge by `view.reserve` (the shell's bottom reserve, 0
  unless controls sit over the view), so the floor stays that far above
  the view's bottom with ground below it; a room shorter than the view
  sits at the bottom and all spare height goes above it, to the sky (it
  was centred); the player's own feet are kept above the reserve.
  Measured at 750×340 (375×170, reserve 29): in every room the floor line
  is 29 px (17%) above the bottom and the room fills the rest (83%);
  before (296×204, centred) the courtyard was 15% fill above, 71% room,
  15% fill below. Upright (234×252, reserve 0) courtyard 43% above the
  room, 57% room, nothing below (before 21/57/21); castle street 24/76/0
  (before 12/76/12). Whether "above" is sky or wall is the ground lane's
  `outside.above` per room.
- **Looks** for doors (`door-enter-<w>x<h>`), parts (`part:<room>:<part>`
  with `:down`/`:open`/`:broken`, then `plate-up`/`plate-down`,
  `gate-closed`/`gate-open`, `crack-1`/`crack-2`, `rubble`,
  `window-<w>x<h>`/`window-broken-<w>x<h>`, `hide-<w>x<h>`), the bell
  (`bell`, `bell-ringing` strip, `bell-broken`) and the alert
  (`alert-pip`, `alert-pip-off`). Each falls back to its old plain shape.
- **No art files → exactly as before.** Measured: the old and new
  renderers drew byte-identical frames for all eleven rooms (test rooms
  included) at three camera positions each, plus broken window, broken
  vault wall, pressed plate, open gate and cracked wall (36 cases).

## Deviations from the contract

- **Past the edge, a tile looks like the nearest tile inside the room**,
  not "always solid". For every tile *of* the room this gives the
  contract's answer (an edge tile that looks solid continues solid, so
  indexes and corners are the same); past the edge it keeps an outdoor
  sky open and an open walk door open as a corridor, where "all solid"
  would roof over a short outdoor room in an upright view and wall up
  every edge door. Hidden walk doors look solid, so they continue solid.
- **A backdrop layer pins to the room's edge when the room is shorter
  than the view** (`y: "bottom"` → the lower of the screen's bottom and
  the room's bottom on screen; `"top"` likewise). At 320×180 with a room
  at least as tall as the view this is exactly the contract. Without it,
  hills placed to stand on the floor line hide behind the ground in an
  upright view.
- **`parallaxY` is measured from where the camera rests against that
  layer's edge** (top-pinned from the room's top, bottom-pinned from its
  bottom), so a layer sits at its `offsetY` when the camera is against
  that edge. The contract says only "does the same for the camera's
  height".
- **`front` decoration is drawn before the impact pass**, not after the
  effects: `drawImpact` shakes the finished picture, and grass that
  stayed still while the world shook would show. Impact dust therefore
  draws over front decoration.
- **The bell's ring bar** stays a code-drawn mark (no look id names it),
  drawn with the marks, not with the bell.
- **Sky with fewer than 8 colours** is spread over 8 bands of even mixes
  between neighbouring colours; 8 or more are used as the bands.
- **Alert pips**: at level 0 nothing is drawn (as before); at 1–3, that
  many `alert-pip` followed by `alert-pip-off` up to three (only when
  `alert-pip-off` exists), 10×10, 12 px apart from (5, 5).
- **Generic looks are bottom-centred** on the part's or door's rectangle
  (identical to "over the rectangle" when the sizes match).
- **Looks are asked for through `drawLookIn`** (`draw/room-parts.ts`): the
  first of several ids that exists, bottom-centred on the part's or door's
  rectangle, through the foundation lane's `look` / `drawLookFrame` /
  `frameAt` (`draw/looks.ts`).

- **Round 2: `deep` paints only where the room's bottom edge continues
  solid** (past the edge a tile looks like the nearest tile inside), not
  every tile below the edge: an open column at the bottom (a way down)
  stays open.
- **Round 2: a room-pinned layer ignores `parallaxY`**: it moves up and
  down with the room.
- **Round 2: a `far` glow** is drawn into the room's cached picture, so
  where nothing lies under it (outdoors, no back wall) it is laid over the
  sky rather than added to it.
- **Round 2: a region's own `fill` needs one cell**, not four (a strip of
  roof may want one).

## Decisions

### 2026-11-23 · A room shorter than the view sits at the bottom, with the sky above it
- **Decided by:** look round 2, frame lane, Step 8 (the brief, from your bar)
- **Instead of asking:** "Centre a short room in a tall view, or stand it on the bottom?"
- **Why this way:** your bar: "sky to the top edge; a band of ground under the feet in about the bottom 20%". Centred, half the outdoor picture was wall above and below the room.
- **To change it:** `lowest` in `roomOrigin`, `src/client/draw/room.ts` (back to centred: `Math.floor((viewH - roomH) / 2)` when the room is shorter).
- **Where:** `DRAFT:` at `roomOrigin`.

### 2026-11-23 · Past the edge of a room, the ground carries on as the room's own edge does
- **Decided by:** look lane "world", Step 8
- **Instead of asking:** "the contract says everything outside a room looks solid; should a short outdoor room in an upright phone get a roof of earth above its sky, and edge doors a wall drawn across them?"
- **Why this way:** the owner: "It should play well in portrait too"; and no void, no roof: the sky stays sky and a doorway stays a way through.
- **To change it:** `solidLook` in `src/client/draw/room-parts.ts`, the `at` function (one line).
- **Where:** `DRAFT:` at `solidLook`.

### 2026-11-23 · Far scenery stands on the floor line in an upright phone too
- **Decided by:** look lane "world", Step 8
- **Instead of asking:** "a room shorter than an upright screen floats in its middle; do the hills stay at the screen's bottom, behind the ground, or come up to the room's floor?"
- **Why this way:** the owner's bar, Kirby and the Amazing Mirror: scenery is seen above the ground, not hidden by it.
- **To change it:** `topEdge` / `bottomEdge` in `drawBackdrop`, `src/client/draw/backdrop.ts`.
- **Where:** `DRAFT:` in `drawBackdrop`.

### 2026-11-23 · Foreground grass shakes with the world on a hard hit
- **Decided by:** look lane "world", Step 8
- **Instead of asking:** "front decoration after the effects (the contract's order), or shaking with everything else?"
- **Why this way:** "the OHHHHH of spectacular physical impact": the whole picture jolts together.
- **To change it:** move one line in `render()`, `src/client/render.ts`.
- **Where:** `DRAFT:` in `render()`.

## Flags for the lead

- **The shell lane owns the canvas size.** `main.ts` still sets
  `canvas.width = VIEW_W`; the shell must set `canvas.width/height` to
  `view.w/h` when it changes `view`, or the frame is clipped.
- **`drawImpact` shakes with `g.drawImage(g.canvas, …)`**: it moves
  whatever the canvas holds, so it needs the canvas to be the view's size
  (it is today). Actors lane's file.
- **`drawNpcs` draws the shop's counter and goods** after the bodies (a
  thing a hero uses, not a mark): with art, the counter should be with the
  working parts, behind bodies. Actors lane's file.
- **Room layouts:** `courtyard` has a solid roof row, so it reads as a
  covered yard, not open sky; `castle-street` likewise. A layout question
  for whoever owns the rooms, not a renderer one.

- **Outdoor rooms still show their solid row 0 as ground above the sky**
  until the ground lane sets `outside.above: "sky"` and a region for the
  roof row (and `outside.below: "deep"` for the beige under the castle
  street, `e2e-out/look2-frame/after-side750x340-castle-street-16x10.png`).
- **Screenshots** before (live, 2d34418's parent) and after, every room
  at 390×664, 750×340, 844×390, 844×340 with insets and 667×375, are in
  `e2e-out/look2-frame/` (git-ignored).

## Not verified

- Frame rate on a real iPhone. The per-frame cost is one cached
  `drawImage` for the ground plus a few dozen small ones; not measured on
  a device.
- No tiles or props art was on `main` when this was pushed: every art path
  was proven only with throwaway test art (numbered cells), through a
  harness and through the real page at 390×844 and 844×390 as content
  files that passed `npm run check`. Matching the tiles lane's reference
  renderer (`tools/art/tiles/preview.py`) once it lands is the open check.
