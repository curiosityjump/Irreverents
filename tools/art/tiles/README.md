# Tiles lane: ground that joins up, and the depth behind it

**Reference.** The notes file of Step 8's look lane "tiles"
(`handoff-prompts/look-tiles.md`). Open it before touching `tools/art/tiles/`,
`assets/tiles/`, `assets/backdrops/`, `content/atlases/` or
`content/backdrops/`. The contract is `docs/mechanisms/art-pipeline.md`; this
file says what exists, how the contract's open points were read, and what was
decided. The orchestrator moves each item to its home.

`DRAFT:` every picture here is a stand-in drawn by a program.

## What exists

| File | What it is |
|---|---|
| `tools/art/tiles/make.py` | Draws everything and writes the twelve content files. `python3 -I tools/art/tiles/make.py`. Same bytes every run. |
| `tools/art/tiles/common.py` | The palette, the cell layout shared by all four tile images, the position hash, the sky bands. |
| `tools/art/tiles/preview.py` | The reference renderer. Reads the real room, atlas and backdrop files and writes `tools/art/tiles/preview/` (git-ignored): `sheet-*.png` (each tile image, 4×, grid), `seams-*.png` (every neighbour case, fills and one-way runs), `room-<id>-<n>.png` (320×180 views, 4×), `upright-<id>.png` (a 180×320 view, 2×), `layer-*.png` (each layer twice side by side, to see the wrap). |
| `tools/art/tiles/selfcheck.py` | The lane's own check: images exist, cells fit and are not empty, all 16 cases drawn, keys present, `"//"` starts `DRAFT:`, alpha 0 or 255, layers a multiple of 320 wide, two runs of `make.py` give the same bytes. |
| `assets/tiles/grass-ruins.png` | Old warm-grey stone blocks under a grass lip; grass tufts and a daisy on top, vines underneath; a wooden plank ledge. Room: `courtyard`. |
| `assets/tiles/town.png` | Cream plaster in a timber frame (posts on open sides, a beam along an open underside) under a course of rounded slates. Room: `castle-street`. |
| `assets/tiles/castle.png` | Lilac dressed blocks, a pale cream trim on every walkable top, a row of small teeth under every ledge, a thin pale ledge to jump through, four dim back-wall cells. Rooms: `throne-room`, `hall-gallery`, `graybox-hall`. |
| `assets/tiles/cellar.png` | Rough dark blocks with a worn pale-lilac lip, drips underneath, a dark wooden plank ledge, four near-black back-wall cells. Room: `undercroft`. |
| `assets/backdrops/sky-clouds.png` (320×72) | Flat-bottomed clouds. Both outdoor rooms. |
| `assets/backdrops/far-hills.png` (320×96) | Two ranges of round hills and a far castle in one tone. `courtyard`. |
| `assets/backdrops/far-castle.png` (320×128) | The castle over the town, pale. `castle-street`. |
| `assets/backdrops/castle-mid.png` (320×112) | A pale old wall with broken crenellations, two towers, open arches and round trees. `courtyard`. |
| `assets/backdrops/town-mid.png` (320×120) | A row of pale gabled houses. `castle-street`. |
| `assets/backdrops/castle-hall.png` (320×352) | Opaque: the dim back wall with tall round-headed windows, a shaft of pale light from each, and pillars. `throne-room`, `hall-gallery`. |
| `assets/backdrops/cellar-vault.png` (320×352) | Opaque: the near-black back wall with a row of vaults between squat piers. `undercroft`. |
| `content/atlases/<room>.json`, `content/backdrops/<room>.json` | Six of each, written by `make.py`. |

**Every tile image is 128×128 (8×8 cells of 16) with the same layout**, so a
room changes theme by changing `image` alone:

| Cells `[column, row]` | What |
|---|---|
| `[0..3, 0..3]` | the 4×4 block, `origin [0, 0]` |
| `[4,0] [5,0] [4,1] [5,1]` | inner corners `nw ne sw se` |
| `[3,3] [6,0] [7,0] [6,1] [7,1]` | the five fills (the block's own index 15 first) |
| `[4..7, 2]` | top pieces (bottom of the cell) |
| `[4,3] [5,3]` | under pieces (top of the cell) |
| `[0..3, 5]` | one-way `left mid right single` |
| `[0..3, 6]` | back-wall cells (indoor themes only) |

The fallback `cells` are `solid [3,3]`, `solidTop [2,3]` (index 14: lip on
top, joined both sides), `oneway [1,5]` (the middle piece).

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

### 2026-11-23 — The street's cobbles and its roofs are the same stone

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
- In the real game only the throne room and the street's east end were
  looked at. The courtyard, the gallery, the undercroft and graybox-hall
  were judged from the reference views only.
- An upright view of an outdoor room in the real game (see the flag above).
- No screenshot was put beside the owner's references by anyone but this
  lane.
