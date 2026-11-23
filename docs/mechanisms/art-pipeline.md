# Art pipeline: how the game gets its look

**Reference.** Open it before drawing, wiring or replacing any picture, or
touching `tools/art/`, `content/sprites/`, `content/atlases/`,
`content/backdrops/`, `content/decor/`, `content/looks/` or
`src/client/draw/`.

`DRAFT:` written 2026-11-23 by the orchestrator as the contract for the
first round of Step 8's "look" work (`docs/plan/step-8.md`, "The look").
The shapes below are the contract between the people drawing and the
people rendering; change them additively and say so here.

## The bar

The owner, 2026-11-23, first-hand: *"It all looks looks like absolute
blocky shit. Compare to kirby and the amazing mirror and don't stop working
on it until it looks similar to that."* And to Vision Partner: *"something
that looks, sounds, and feels as good as kirby and the amazing mirror"*.

Look at these before drawing anything, and again when judging your own
work (all under
`docs/design-library/03-visual-direction-and-assets/current-pixel-art-explorations/`):

- `pixel-aesthetic-reference-approved-direction.png`: the owner's chosen
  direction: bright, round, friendly, readable.
- `s00-01-gameplay-references-use-now-revise-later/*-phone-320x180-preview.png`:
  the same direction **at the size the game is really drawn**. This is the
  bar a game screenshot is put beside.
- `quiet-pixel-art-environment-studies-reduced-visual-noise/`: how quiet a
  background must stay so platforms and characters read.
- Docs 13 and 14 in `../00-asset-production-plan-and-style-lock/`, and the
  owner's quality correction at the top of `docs/design-library/changelog.md`
  (the first delivered heroes were rejected as "crude near-identical
  geometric box figures with almost static frames").

**Similar to, never copied from.** No character, sprite, tile, screen or
palette of Kirby's or any other game's is copied, traced or imitated as a
likeness (the owner's art gate, doc 32; `docs/plan/step-8.md`). The
approved-direction image itself contains Kirby characters: they show the
*craft* wanted, they are not designs to reproduce. No pink puffball, no
Waddle-Dee-like, no masked-knight-like. What carries over is craft: a
limited bright palette, dark coloured outlines, 3–4 tone shading, round
masses, big readable silhouettes, squash and stretch, quiet backgrounds.

## Ground rules

- **320×180 internal view, 16 px tiles, nearest-neighbour.** Everything is
  drawn at 1× and scaled by the page. No anti-aliasing, no blur, no
  gradients inside sprites; alpha is 0 or 255 (one exception: soft ground
  shadows at a single alpha).
- **Art is data.** A picture is wired in by a file under `content/`; with
  the file gone the old plain shape comes back and nothing breaks.
  Collision never depends on art.
- **Every picture here is a stand-in** (`DRAFT:` in each content file's
  `"//"`, saying it was drawn by `tools/art/…`). A delivered sheet from the
  asset desk replaces it by changing the content file.
- **Pictures are made by programs** in `tools/art/<lane>/` (Python 3 +
  Pillow, deterministic: fixed seeds, no clock). `python3 -I
  tools/art/<lane>/make.py` rewrites that lane's PNGs under `assets/` and
  may write that lane's content JSON too. Each lane also has a
  `preview.py` that writes contact sheets and mock scenes (4× nearest) for
  a person to look at; previews are never put under `assets/`.
- **Sprites face right**; the renderer mirrors them.
- **Light comes from the top-left.** Highlights top-left, shade
  bottom-right.
- **Nothing points.** `INTENT:` no arrow, glow, sparkle, sign or
  decoration may mark a hidden door, a false wall, a secret, or the way
  to one (`docs/plan/step-3.md`, "Unadvertised";
  `docs/deliberate-designs.md`). A false wall and a hidden walk door are
  drawn exactly as the wall around them. Decoration is placed without
  knowledge of secrets: evenly, never as a hint.

## Master palette

Use these ramps (dark → light). An in-between shade is allowed when a
shape needs it; a new hue is not. Backgrounds use the lighter, greyer end;
characters and things a player can touch use the full range.

| Name | Ramp |
|---|---|
| ink (outlines) | `#2b2140`, soft `#4a3a5e` |
| sky | `#5fb4f0` `#8fd0fa` `#c4e9ff` `#eef9ff` |
| cloud | `#d6ecfb` `#ffffff` |
| far (hills, distant towers) | `#9fc7e8` `#b5d6ee` `#cfe6f6` |
| grass | `#1f7a3d` `#2fa84a` `#5fd35a` `#a8f070` |
| foliage | `#1c6b4a` `#2a9a5c` `#58c96a` `#9be37a` |
| earth | `#6b3f2a` `#94583a` `#c07a4a` `#e3a56b` |
| stone (outdoor, warm grey) | `#5b5670` `#807b96` `#a9a5bd` `#d2cfe0` |
| castle (indoor, lilac) | `#3f3a66` `#5c5690` `#8179b8` `#aaa3d8` |
| wood | `#5a3420` `#8a5230` `#b97a40` `#e0a860` |
| gold | `#a8651a` `#e09a1e` `#ffd23f` `#fff1a0` |
| red | `#8a1c3a` `#c8324a` `#f0596a` `#ff9aa0` |
| blue | `#263a8c` `#3c62d0` `#5c92f5` `#a0c8ff` |
| purple | `#4a2a7a` `#7444b8` `#a070e8` `#d0aaff` |
| teal | `#16607a` `#1e98a8` `#40d0c8` `#a0f0e0` |
| orange | `#b0481a` `#e8742a` `#ffa048` `#ffd090` |
| pink | `#b03a78` `#e860a0` `#ff98c0` `#ffd0e0` |
| cream / skin | `#c88a5a` `#f0c090` `#ffe2c0` |
| metal / white | `#6a7890` `#9aa8c0` `#d0dcec` `#ffffff` |
| night (undercroft, deep shade) | `#141228` `#221f44` `#343066` `#4c4890` |

## Characters and things: `content/sprites/<character id>.json`

Named after the character kind it draws (`content/characters/`). The
existing fields stay; the rest is additive and optional.

```json
{
  "//": "DRAFT: stand-in drawn by tools/art/heroes/make.py; a delivered sheet replaces it by editing this file.",
  "id": "grappler",
  "image": "sprites/heroes/grappler.png",
  "cell": { "w": 32, "h": 32 },
  "anchor": { "x": 7, "y": 2 },
  "fps": 8,
  "frames": {
    "idle": [0, 1, 2, 3], "run": [8, 9, 10, 11, 12, 13], "air": [16, 17],
    "jump": [16], "fall": [17], "attack": [24, 25, 26, 27], "grab": [32, 33],
    "carry": [40, 41], "carryRun": [48, 49, 50, 51, 52, 53], "throw": [56, 57, 58],
    "hurt": [64, 65], "down": [72, 73], "held": [80, 81], "hide": [88], "talk": [96, 97], "flap": [104, 105]
  },
  "fpsBy": { "run": 12, "attack": 16 },
  "moods": { "2": { "idle": [112, 113] }, "3": { "idle": [120, 121], "run": [128, 129, 130, 131] } }
}
```

- `idle`, `run`, `air` are required (as before). Every other state is
  optional; the renderer falls back: `jump`/`fall`/`flap` → `air`;
  `carryRun` → `carry` → `run`/`idle`; `throw` → `attack`; `down` → `hurt`
  → `idle`; `held` → `hurt` → `air`; `hide`/`talk`/`grab` → `idle`.
- `fpsBy` overrides `fps` for one state. `attack`, `grab`, `throw` and
  `hurt` play once from when they start and hold their last frame; the
  rest loop.
- `moods` (people only): frame lists that replace the normal ones while a
  person is in mood 2 (unsettled) or 3 (enraged). A state missing under a
  mood uses the normal one.
- Frames are numbered row by row from the sheet's top-left. Convention:
  one state per row, 8 columns.
- `anchor` is where the collision box's top-left sits inside a cell. The
  feet stand on the box's bottom edge and the body is centred on the box;
  the picture may overhang the box by a few pixels (hair, wings, a
  weapon), never the other way round: the box is the truth
  (`content/characters/<id>.json`, `box`).
- Cells are 32×32 unless the body needs more (the king, the throne, the
  heavy crate: 48×48 is fine).

**How a character is drawn (style lock for this round):**

- Round, chunky, big head and body, small hands and feet. A silhouette you
  can name at 1× from across a room. Each party member differs in shape
  first, colour second: the **grappler** is the biggest and broadest
  (18×30 box); the **infiltrator** is tiny (10×12 box) and quick; the
  **flyer** is light with wings (14×20 box).
- 1 px outline in `ink` (or a dark shade of the fill on the lit side).
  3–4 tones per colour, hue-shifted. Eyes are large and dark with one
  light pixel; a face reads at 1×.
- Real motion: idle breathes and blinks (4 frames); run has contact, pass
  and lift poses with a body bob (6); jump stretches, fall spreads, land
  squashes; attack has wind-up, strike and recovery (4); hurt recoils;
  down lies flat with eyes shut. Near-static frames are the thing the
  owner rejected.
- Original designs. Read the open request
  `docs/design-library/06-asset-collaboration-claude-chatgpt/01-requests-claude-to-chatgpt/req-c02-02-c02-03-revision-more-expressive-heroes-with-real-animation.md`
  and doc 13 for who these people are.

## Ground: `content/atlases/<room id>.json`

Named after the room it draws. Several rooms may name the same image.
The existing `cells` block stays required (it is the fallback); `autotile`
is additive and is what makes ground join up.

```json
{
  "//": "DRAFT: stand-in drawn by tools/art/tiles/make.py.",
  "id": "courtyard",
  "image": "tiles/grass-ruins.png",
  "tile": 16,
  "cells": { "solid": [3, 3], "solidTop": [0, 1], "oneway": [1, 5] },
  "autotile": {
    "origin": [0, 0],
    "innerCorners": { "nw": [4, 0], "ne": [5, 0], "sw": [4, 1], "se": [5, 1] },
    "fill": [[3, 3], [6, 0], [7, 0], [6, 1], [7, 1]],
    "top": [[4, 2], [5, 2], [6, 2], [7, 2]],
    "under": [[4, 3], [5, 3]],
    "oneway": { "left": [0, 5], "mid": [1, 5], "right": [2, 5], "single": [3, 5] }
  }
}
```

- **The 4×4 block at `origin`.** For a solid tile, `index = N·1 + E·2 +
  S·4 + W·8`, where a letter is 1 when the neighbour on that side *looks
  solid*; the tile drawn is the cell at column `origin[0] + index % 4`,
  row `origin[1] + floor(index / 4)`. So index 0 is a lone block, 15 is
  fully surrounded, 14 (E+S+W, nothing above) is a top surface, 11
  (N+E+W) an underside, and so on. All 16 must be drawn.
- **Looks solid** means: a solid tile of the room file, a false wall, an
  unbroken breakable wall (not a window), a hidden walk door's tiles, and
  everything outside the room's edge. (This is what keeps a secret
  looking like wall.)
- `innerCorners`: transparent overlays drawn on an index-15 tile whose
  diagonal neighbour (`nw`, `ne`, `sw`, `se`) is open, so inside corners
  are not square holes.
- `fill`: variants for index 15, chosen by a fixed hash of the tile's
  position, so large walls do not repeat. At least four.
- `top`: overhang pieces (grass tufts, moss, trim) drawn in the *empty*
  tile directly above a top surface, bottom-aligned, chosen by hash; a
  cell may be listed more than once to weight it and `[-1, -1]` means
  "nothing here". `under`: the same, hanging into the empty tile below an
  underside (roots, drips, shadow).
- `oneway`: a platform you can jump up through, by its place in a run:
  `left`, `mid`, `right`, or `single`.
- **How ground is drawn:** the walkable top edge is the clearest line on
  the screen: a bright lip (grass outdoors, a pale trim indoors) over a
  darker body. Insides are textured (bricks, clods, blocks) at lower
  contrast than edges. Every tile joins its neighbours without seams.
- **Themes for the rooms on the map:** `castle-street` a town street
  under the castle, outdoors, day; `courtyard` grass and old castle wall,
  outdoors; `throne-room` royal interior (the start room); `hall-gallery`
  a grand interior hall; `undercroft` a dark cellar; `graybox-hall` a
  plain interior. The `test-*` rooms are fixtures for scripted checks and
  get no art.

## Behind the ground: `content/backdrops/<room id>.json` (new kind)

```json
{
  "//": "DRAFT: stand-in drawn by tools/art/tiles/make.py.",
  "id": "courtyard",
  "sky": ["#5fb4f0", "#c4e9ff"],
  "layers": [
    { "image": "backdrops/sky-clouds.png", "parallax": 0.1, "y": "top", "offsetY": 8, "repeatX": true },
    { "image": "backdrops/far-hills.png", "parallax": 0.25, "y": "bottom", "offsetY": -20, "repeatX": true },
    { "image": "backdrops/castle-mid.png", "parallax": 0.5, "y": "bottom", "offsetY": 0, "repeatX": true }
  ],
  "wall": { "image": "tiles/castle.png", "tile": 16, "cells": [[0, 6], [1, 6], [2, 6], [3, 6]] }
}
```

- Drawn first, in order: `sky` (a top-to-bottom gradient in at most 8
  flat bands, fixed to the screen), then each layer, then `wall`.
- A layer's left edge sits at `-cameraX × parallax` (0 never moves, 1
  moves with the room), wrapped when `repeatX`. `y` pins its top or
  bottom edge to the screen's, shifted by `offsetY`; optional `parallaxY`
  (default 0) does the same for the camera's height. Layer images are
  320 px wide or a multiple, and tile sideways without a seam.
- `wall` (indoor rooms): a back wall drawn behind every tile of the room
  that does not look solid, from hash-chosen cells, moving with the room.
  It must be clearly dimmer and flatter than the ground in front of it.
- Layers get lighter, greyer and plainer with distance; none has a dark
  outline. A player must never mistake a backdrop for something to stand
  on.

## Decoration: `content/decor/<room id>.json` (new kind)

```json
{
  "//": "DRAFT: stand-in drawn and placed by tools/art/props/make.py.",
  "id": "castle-street",
  "items": [
    { "image": "decor/town.png", "src": [0, 0, 32, 48], "tx": 12, "ty": 9, "dx": 0, "dy": 0, "layer": "back", "flip": false }
  ]
}
```

- An item is the rectangle `src` (`[x, y, w, h]` in the image) drawn with
  its bottom-left corner on the bottom-left of tile (`tx`, `ty`), moved
  by (`dx`, `dy`) pixels.
- `layer`: `"far"` is drawn behind the ground (windows and banners on a
  back wall, a tree behind a ledge); `"back"` in front of the ground and
  behind every body (bushes, lamps, barrels, stalls, flowers); `"front"`
  in front of bodies (a blade of foreground grass: sparingly, low, and
  never where it could hide a person or a door).
- Decoration never collides, never looks like a platform or a door, and
  never marks anything (see "Nothing points").

## Everything else code used to draw: `content/looks/<group>.json` (new kind)

One file per group of pictures; each names an image and the looks cut
from it. Look ids are global: the same id in two groups fails the check.

```json
{
  "//": "DRAFT: stand-in drawn by tools/art/props/make.py.",
  "id": "parts",
  "image": "props/parts.png",
  "looks": {
    "plate-up": { "src": [0, 0, 16, 16] },
    "fx-dust": { "src": [0, 64, 16, 16], "frames": 5, "fps": 15 }
  }
}
```

- `frames` (default 1) is a strip running right from `src`; `fps` is how
  fast it plays.
- The renderer asks for a look by id; when the id is missing it draws
  what it drew before (the plain shape), so looks can arrive one at a
  time. The helper is `src/client/draw/looks.ts`.

**Look ids in use** (the renderer asks for exactly these; a size in an id
is in tiles, width × height):

| Id | What it is | Size and placement |
|---|---|---|
| `door-enter-<w>x<h>` | a doorway you enter by pressing up; an open dark arch in a frame | `w`×`h` tiles, drawn over the door's rectangle; sizes in use are found from `content/rooms/` |
| `plate-up`, `plate-down` | a floor plate, raised and pressed | 16×16, bottom of the tile |
| `gate-closed` | one tile of a closed gate; stacks upward | 16×16 |
| `gate-open` | the foot of a raised gate, under the lintel | 16×16, top tile only |
| `crack-1`, `crack-2` | crack overlay on a breakable wall (the wall itself is ground) | 16×16, transparent |
| `rubble` | what a broken wall leaves on the floor | 16×16, bottom tile |
| `window-<w>x<h>`, `window-broken-<w>x<h>` | a breakable window, whole and smashed | the part's tile rectangle |
| `hide-<w>x<h>` | a hiding place (a curtain) | the part's tile rectangle |
| `part:<room id>:<part id>`, `…:broken`, `…:down`, `…:open` | one particular part's own picture, used instead of the generic one when present (the throne room's stained-glass window) | the part's tile rectangle |
| `bell`, `bell-ringing`, `bell-broken` | the alarm bell on its post | 16×32, bottom-centre on the bell's tile; `bell-ringing` is a strip |
| `shop-counter`, `shop-goods` | the shop's counter and a thing on it | 16×16 and 8×8, bottom-centre |
| `alert-pip`, `alert-pip-off` | one mark of the area's alert level (top-left of the screen) | 10×10 |
| `mood-2`, `mood-3` | the mark over an unsettled / enraged person's head | 12×12, strip allowed |
| `bark` | a nine-slice speech bubble for a bark's text: 3×3 cells of 4×4 px, tail separate as `bark-tail` 6×4 | — |
| `ribbon` | nine-slice for the king's speech ribbon, 3×3 cells of 4×4 px | — |
| `away-dots` | three dots over a friend whose page went away | 12×6, strip allowed |
| `player-mark` | the marker over a player's head, drawn white so the renderer can tint it per player | 8×8 |
| `shadow-s`, `shadow-m`, `shadow-l` | ground shadows | 12×4, 18×5, 26×6 |
| `fx-slash` | the swing of an attack | 24×24 strip |
| `fx-hit` | the star at the point of impact | 16×16 strip |
| `fx-dust` | a dust puff | 16×16 strip |
| `fx-land` | landing dust | 24×8 strip |
| `ui-use` | the "Use" touch button, normal then pressed | 48×24 (two 24×24), like `assets/ui/touch/` |

Anything not in this table keeps its code-drawn look for now; add a row
when you give it a picture.

## Draw order

sky → backdrop layers → back wall → `far` decor → ground (autotile) and
its `top`/`under` pieces → doors and working parts → `back` decor →
shadows → things and bodies → effects → `front` decor → marks over heads,
speech → screen furniture (alert pips). The debug record of what was
drawn (`PlayerView.drawn`) is unchanged: scripted checks read it.

## Checks

- `npm run check` validates every art content file: the image exists,
  cells and `src` rectangles fit inside it, frame numbers exist, every
  file's `"//"` starts `DRAFT:` and says where the picture came from, and
  the names match a real room or character.
- `npm run e2e` still proves the three moods differ on screen and nothing
  important sits under a touch control.
- The look itself is judged from screenshots of the real game at iPhone
  size next to the references (`docs/plan/step-8.md`, "The look"), and
  finally by the owner.
