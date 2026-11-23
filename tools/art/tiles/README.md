# Tiles lane: ground that joins up, and the depth behind it

**Reference.** The notes file of Step 8's look lane "tiles"
(`handoff-prompts/look-tiles.md`). Open it before touching `tools/art/tiles/`,
`assets/tiles/`, `assets/backdrops/`, `content/atlases/` or
`content/backdrops/`. The contract is `docs/mechanisms/art-pipeline.md`; this
file says what exists, how the contract's open points were read, and what was
decided. The orchestrator moves each item to its home.

`DRAFT:` every picture here is a stand-in drawn by a program.

## What exists

Round 2 (2026-11-23, `handoff-prompts/look2-ground.md`) redrew everything; round 1's
drawing code is gone (git history, ebcf79e).

| File | What it is |
|---|---|
| `tools/art/tiles/make.py` | Builds the sheets and writes the twelve content files. `python3 -I tools/art/tiles/make.py`; `--no-round2-fields` leaves out `deep`, `regions`, `outside`, `pin`, `front` (for a check that does not know them). Same bytes every run. Holds the region rectangles (`ROOM_REGIONS`) and the fill weights. |
| `tools/art/tiles/tiles_draw.py` | The block engine: a bevelled block (ink/mortar joint, top highlight, left light, bottom-right shade, rounded corners, pits), a wall of them that joins every variant to every other, open-edge silhouettes with notches at joints, the plank ledge (post and brace end caps) and the stone shelf (corbel end caps). |
| `tools/art/tiles/themes.py` | The four themes (lips, fills and their marks, tops, unders, deep, back-wall cells) and the regions: leaf canopy, cobbled street with curb, red and blue tile roofs, the street's eave. |
| `tools/art/tiles/backdrops.py` | Clouds, far layers, mid layers, the front foliage strip, the two interior back walls. |
| `tools/art/tiles/common.py` | Palette, sheet layout, `region_cells`, the position hash, sky bands. |
| `tools/art/tiles/preview.py` | Reference renderer with round 2's rules (regions, deep, outside, pin, front). Writes `preview/`: `sheet-*`, `seams-*`, `room-*`, `beside-<room>.png` (a 320x180 mock next to the matching bar image), `upright-*` (234x256), `layer-*`. |
| `tools/art/tiles/selfcheck.py` | The lane's own check: as round 1, plus at least six different fills, deep and region cells drawn and inside the room, the mid-layer fog measure, determinism in whichever mode the files were written. |
| `tools/art/tiles/shots.mjs` | Screenshots of the eight spots in the real game at iPhone 14 upright, sideways (insets) and 667x375: `NODE_PATH=/opt/node-tools/node_modules node tools/art/tiles/shots.mjs <url> <tag>` -> `preview/shots/`. |
| `assets/tiles/grass-ruins.png` (128x192) | Warm-grey bevelled blocks, a 6-7 px grass lip with drips, tufts and a daisy, hanging vines, moss/chip/hairline fills, dark foundation `deep`, the leaf-canopy region. `courtyard`. |
| `assets/tiles/town.png` (128x384) | Plaster between timbers (braces, fallen plaster), board floor inside houses, packed-earth `deep`; regions: street (curb over rounded cobbles), red roof, blue roof (shingle courses, ridge, eave board), eave (ridge caps against the sky, now and then a chimney pot). `castle-street`. |
| `assets/tiles/castle.png` | Lilac bevelled blocks (sconce ring, banner hook, chip, hairline), a warm gold-tan floor cap with an ink line under it, dentils under ceilings, pale stone shelves with corbels, calm back-wall cells. `throne-room`, `hall-gallery`, `graybox-hall`. |
| `assets/tiles/cellar.png` | Night-blue blocks, a worn lilac flagstone lip, drips, dark plank ledges, back-wall cells. `undercroft`. |
| `assets/backdrops/far-hills.png` 320x112, `far-castle.png` 320x128 | Far blue silhouettes: ruined towers, an aqueduct, a blue-green tree line; the castle on its hill. |
| `assets/backdrops/castle-mid.png` 320x120, `town-mid.png` 320x124 | Mid layers: stone `#a9a5bd` wall with arches and foliage trees; houses with coloured roofs; each with a dark hedge/fence foot. Measured: 0% of opaque pixels at luminance >= 215 (darkest 87 and 70). |
| `assets/backdrops/front-foliage.png` 320x24 | Dark bushes, outlined, with gaps; a `front` layer pinned to the room's bottom, its top 8 px below the floor line. |
| `assets/backdrops/castle-hall.png`, `cellar-vault.png` 320x352 | Interiors: a darker, desaturated back wall in three flat bands (darkest at the top), stained-glass windows with two-band light shafts, muted pillars; the cellar's vaults with lit ribs and two candle niches per 320 px. |

**Sheet layout** (every image; extra rows only where used):

| Cells `[column, row]` | What |
|---|---|
| `[0..3, 0..3]` | the 4x4 block, `origin [0, 0]` |
| `[4,0] [5,0] [4,1] [5,1]` | inner corners `nw ne sw se` |
| `[3,3] [6,0] [7,0] [6,1] [7,1] [6,3] [7,3] [0,4] [1,4]` | nine fills (plain first; the atlas weights plain ones) |
| `[2..5, 4]` | `deep` (outdoor sheets) |
| `[4..7, 2]`, `[4,3] [5,3]` | top pieces, under pieces |
| `[0..3, 5]`, `[0..3, 6]` | one-way `left mid right single`; back-wall cells (indoor) |
| region i: `[0..3, 8+4i .. 11+4i]`, fills `[4..7, 8+4i]` `[4,11+4i] [5,11+4i]`, tops `[4..7, 9+4i]`, unders `[4..7, 10+4i]` | regions (`grass-ruins`: 0 canopy; `town`: 0 street, 1 red roof, 2 blue roof, 3 eave) |

## How the contract was read (the world lane matches these)

`preview.py` is the reference. Where the contract left a choice:

1. **The hash.** `tile_hash(tx, ty, salt)` in `common.py`, 32-bit integer
   maths: `n = tx·0x9E3779B1 + ty·0x85EBCA77 + salt·0xC2B2AE3D; n ^= n>>>15;
   n = imul(n, 0x2C1B3C6D); n ^= n>>>12; n = imul(n, 0x297A2D39); n ^=
   n>>>15`, all unsigned. A variant is `hash % list length`. Salt 0 picks
   the fill, 1 the top piece, 2 the under piece, 3 the back-wall cell. For a
   top or under piece `(tx, ty)` is the *solid* tile it belongs to, not the
   empty tile it is drawn in. (A first, weaker hash put the same variant
   four tiles in a row; any well-mixed hash looks as good, the pictures do
   not depend on this exact one.)
2. **Index 15 is drawn from `fill`**, never from the block's own cell
   directly (that cell is `fill[0]`). Inner corners go on top of whichever
   fill was picked.
3. **A top piece is drawn** in the tile above a looks-solid tile when that
   tile above is inside the room, does not look solid and is not a one-way.
   Doors and working parts do not stop it: they are drawn afterwards and
   cover it. An under piece is the mirror of that. One-way platforms get no
   top or under pieces.
4. **A one-way's place in a run**: a neighbour "continues the run" when it
   is a one-way *or looks solid*. So a ledge that meets a wall has no end
   cap on that side.
5. **Outside the room** is drawn as solid ground (fills), as far as the view
   reaches, with the same hash. That is what "everything outside the room's
   edge looks solid" gives, and it frames a room that is smaller than the
   view (the courtyard is 144 px tall).
6. **Sky**: eight equal flat bands, band `i` is the first colour mixed
   `i/7` of the way to the second.
7. **A layer's position**: left edge `round(-cameraX × parallax)`, wrapped
   by the image's width when `repeatX`; top edge `(0 or viewH − imageH) +
   offsetY − round(cameraY × parallaxY)`. `cameraX/Y` is how far the view's
   top-left is into the room (0 when the room is centred).
8. **The back wall's cell** for a tile is `cells[hash(tx, ty, 3) %
   length]`.

## Deviations from the contract

- **Round 2: "stepping down in value with depth"** (brief, `deep`) is not drawn: `deep` cells
  are chosen by hash, not by depth, so a darker cell deeper down would land at random. The deep
  cells are all one dark value instead; the front strip hides the joint with the floor row.
- **Round 2: empty `top`/`under` lists are `[[-1, -1]]`**: the check wants at least one cell.

- **Three indoor rooms have no `wall`** (`throne-room`, `hall-gallery`,
  `undercroft`). The contract's order is sky → layers → wall, and `wall`
  covers every open tile of the room, so an indoor layer would never be
  seen. In those rooms the one layer *is* the back wall (opaque, 320×352,
  windows or vaults painted into it), at `parallax 0.75`, `parallaxY 0.75`
  (the orchestrator's number: `far` decoration moves with the room and
  would visibly drift against a wall at half speed),
  and `sky` is the wall's own colour so an uncovered strip matches.
  `graybox-hall` keeps the contract's `wall`, with no layer. Back-wall
  cells are drawn in both indoor tile images, so a room goes back to a
  flat wall by adding `wall` to its backdrop file. Asked of the
  orchestrator 2026-11-23, who chose this and will fold it into the
  contract.
- **The contract's example `solidTop [0, 1]`** is index 4 (open on both
  sides); this lane uses index 14, `[2, 3]`.
- Nothing else. No shape, name or id differs.

## Decisions

### 2026-11-23 (round 2) — Regions: the street's materials, and where they are

**What a player sees:** in the castle street the floor is a curb and rounded cobbles; the hollow
house wears a red tile roof and the block by the stall a two-tile blue roof (it reads as the
stall's roof); the top row is the eave of the roofs over the street, its ridge caps against the
sky; buildings stay plaster and timber. In the courtyard the top row is a leaf canopy.
**Why:** the review's "street and roofs are one grey course"; `autotile.regions` now exists.
Rectangles come from the room's rows (`ROOM_REGIONS` in `make.py`), never from secrets.
**To undo:** delete a rectangle from `ROOM_REGIONS` and re-run `make.py`. `DRAFT:`.

### 2026-11-23 (round 2) — Walls join with one fixed crossing block

**What a player sees:** blocks 16x8 in running bond, the top course split differently from tile
to tile (16, 8+8, 10+6, 12+4, 6+10), so a big wall is not wallpaper.
**Why:** the bottom course's block crosses the tile edge and is the same in every fill, so every
fill joins every other; the brief asked for widths 8, 12, 16.
**To undo:** `C0` and `wall_fill` in `tiles_draw.py`. `DRAFT:`.

### 2026-11-23 (round 2) — Under the floor: foundation stone in the courtyard, packed earth in the street

**What a player sees:** below the courtyard's grass and stone, darker plainer foundation blocks;
below the street's cobbles, dark packed earth with a few stones; the dark bush strip in front.
**Why:** the brief's "packed earth or foundation stone"; two rooms, one of each, for variety.
**To undo:** `deep()` in `themes.py`. `DRAFT:`.

### 2026-11-23 (round 2) — Indoor ledges are cool pale stone, the floor cap warm gold

**What a player sees:** you stand on a warm gold-tan cap on every castle floor; the shelves you
jump through are pale lilac stone with corbels, so they never read as floor trim.
**Why:** the brief, and round 1's flag that both were cream. **To undo:** `Castle.lip`/`Castle.oneway`. `DRAFT:`.

### 2026-11-23 — The street's cobbles and its roofs are the same stone (superseded by round 2's regions)

**What a player sees:** in the castle street the ground is a band of
rounded grey stones with a bright top line, and the top of every building
is the same rounded grey stones (they read as slate roofs there); under a
roof a building is cream plaster with wooden posts and beams.
**Why:** the brief asks for cobbled ground, plastered and timbered
buildings and tiled roofs, but a room's ground has one set of pictures and
the picture is chosen only by which neighbours are solid: the street's
floor and the middle of a roof are the same case. One rounded-stone course
reads right in both places; red roof tiles would have paved the street red.
**To undo:** `DRAFT:` in `Town` in `make.py`. A different look for roofs
needs the room file to tell ground from building (a second material), which
is a contract change, not a drawing change.

### 2026-11-23 — Indoors the far wall drifts instead of standing still

**What a player sees:** in the throne room, the gallery and the undercroft
the wall behind everything, with its tall windows or vaults, moves a little
slower than the room as the view moves.
**Why:** see "Deviations". The other choice was a flat wall of repeated
blocks with nothing on it.
**To undo:** add `wall` to the room's backdrop file and drop the layer.

### 2026-11-23 — The courtyard's ground is old stone with grass on it

**What a player sees:** grey stone blocks with a bright grass edge wherever
you can walk, also on top of the walls; the ceiling and side walls are the
same stone.
**Why:** the owner's S00-01 references show grass on stone blocks, and the
room is "grass and old castle wall".
**To undo:** `Ruins` in `make.py`.

## Flags for the lead

- **Done (Step 12 slice B): `outpost` borrows `grass-ruins`** and the courtyard's backdrop (far
  hills, castle wall, front foliage), as `cantina` borrows `town` (Step 11 slice B).
- **Round 2: the canopy and eave rows repeat every 16 px.** A row-0 tile is index 11 (the room
  above "looks solid"), and only index 15 picks from fills, so their variety is in the one tile.
  More variety needs several regions along the row (cheap: one more 4x4 block each).
- **Round 2: past the room's sides the fill continues above row 0's line** only if the renderer
  paints it; with `outside.above: "sky"` the side columns stop at the room's top edge.
- **The hollow house's inside shows the sky** unless decoration covers it (the props lane's
  wooden wall does today).

- **Upright view.** Layers are pinned to the *screen's* top or bottom
  (the contract), and every `offsetY` here is set for the 320×180 view. In
  a taller view a room shorter than the view is centred, so `y: "bottom"`
  layers sit below the floor and are hidden behind the outside-the-room
  ground: an outdoor room upright shows sky and clouds only
  (`preview/upright-courtyard.png`). Suggestion: pin a layer to the room's
  own rectangle on screen when the room is smaller than the view.
- **The courtyard and the street have a solid row along the top** (the
  room files): outdoors it draws as a stone or timber ceiling. A layout
  matter, not this lane's.
- **Castle one-way ledges and the solid trim are both pale cream.** They
  differ by thickness (a ledge is 6 px with nothing under it). If players
  misread them, tint the ledge.
- **`far` decor on indoor rooms** (windows, banners) sits on a wall that
  drifts at three-quarter speed in three rooms; the backdrop's windows and
  pillars are broad and evenly spaced (one of each every 160 px) so
  decoration over them still looks placed.

## Compared with the real game

2026-11-23, at the world lane's renderer (82fe89b) with these files, built
and served locally at 667x375: the throne room (`e2e-out/phone-667x375.png`,
`e2e-out/upright.png`) and the east end of the castle street (walked there
by keyboard) match `preview/room-throne-room-0.png` and
`preview/room-castle-street-3.png`: same lips, edges, corbels, ledge ends,
backdrop placement, and the false wall and both hidden doors draw as plain
wall. The game's hash is its own (`src/client/draw/autotile.ts`), so which
fill or tuft lands on which tile differs from the preview; nothing looks
worse for it.

## Not verified

- Nothing here has been judged by the owner.
- Round 2: all six rooms were looked at in the real game (local build at the frame lane's
  2d34418) at iPhone 14 upright and sideways with insets, the eight spots of the brief
  (`preview/shots/before-*` from live, `after-*` local; git-ignored, re-run `shots.mjs`). The
  667x375 shots were taken, not studied.
- Which fill or tuft lands where differs between the preview and the game (different hash salts).
- The cellar's back wall and the castle's windows were not compared against the bar at 4x.
