# Brief: the look, round 3, lane "ground": the quarry, the tavern, the sky held upright, and the flat masses

Written 2026-11-23 by the orchestrator, which runs Step 8 itself
(`docs/plan/step-8.md`, "The look" and "Round 3 (2026-11-23)"). The
reviewer deletes it after review.

## 1. The task, and the measure

Art lane for ground, walls and backdrops. Give the six quarry rooms
(walkable since 78c4959) a real look, give the cantina its own tavern
theme, fill the sky above short rooms held upright, and give the big
flat masses form. It moves no numbered row of `docs/plan.md`'s table;
the look is read from screenshots at iPhone size beside the bar, by a
fresh reviewer each round and finally by the owner. One number you can
take yourself: the share of the game picture's rows that are a single
colour (round 3 measured it; targets below).

## 2. What is decided (do not redo it)

- **The owner, ~11:11 UTC:** *"It all looks looks like absolute blocky
  shit. Compare to kirby and the amazing mirror and don't stop working on
  it until it looks similar to that. There are assets provided and you
  have the ability to get more."* ~11:30: *"It should play well in
  portrait too, not just landscape. Looks awful in both right now"*.
- **The bar:** `docs/design-library/03-visual-direction-and-assets/current-pixel-art-explorations/pixel-aesthetic-reference-approved-direction.png`
  and, at the game's own size, `s00-01-gameplay-references-use-now-revise-later/s00-01a-grass-ruins-upper-ledge-phone-320x180-preview.png`
  and `s00-01b-...`: textured ground with grass on top, 3–4 tones per
  block, moss drips, a sky with depth. Similar in craft, never copied.
- **What the review saw** (screenshots are not in the repository):
  - **The quarry is round 0** (gap 2, size 5). All six rooms (cave 30×14
    tiles, depot 64×20, pit 40×20, ridge 80×16, road 84×20, tower 20×30)
    are a navy void for sky, flat grey slabs, tan 3–4 px bars for one-way
    ledges (they read as underlines), maroon blocks for hiding spots; the
    hero is the only drawn thing. Upright, 944 of the cave's 1260 canvas
    rows are one colour; the tower is narrower than the screen, so navy
    margins show at both sides. `content/atlases/` and `content/backdrops/`
    hold no `quarry-*` file; `drawGraybox` (`src/client/draw/room.ts`)
    runs for a room with no atlas. 78c4959 opened the courtyard's
    `to-quarry` door to `quarry-road`, so a player walks from the
    best-looking room straight into this.
  - **The cantina reads as crates or a corridor** (gap 7, size 4). 365a40d
    gave it `'cantina': 'town'`: the floor block is the town's pale
    half-timber plaster with X and diagonal braces (reads as stacked
    crates); upright, the ceiling is the same block (about 30% of the
    picture). The back wall is flat purple brick with one shelf. 143
    colours in its native picture against 234–341 in other rooms with art.
  - **Upright, short rooms float in flat sky** (gap 6, size 4). The upright
    view is 252 game px tall; the courtyard is 144 px, the castle street,
    cantina and hall 192. `roomOrigin` puts the spare height above the
    room, and `drawSky` paints `sky` as 8 equal flat bands
    (`MAX_BANDS = 8`, `src/client/draw/backdrop.ts:12`): courtyard 41% of
    the picture's rows single-colour (459 of 1260 canvas rows), castle
    street 22%; sideways 4–6%. The room's top row then floats mid-sky:
    the courtyard's canopy, the street's full-width red eave. Round 2 drew
    that row as canopy and eave on purpose (`tools/art/tiles/README.md`,
    the "Regions" decision); keep it, and paint what it hangs from above
    it. The throne room and the undercroft fill the view (2% flat).
  - **Flat masses** (gap 10, size 3). Under the walk line (25–30% of the
    picture) the ground is one or two tones: the hall gallery's floor body
    is a field of `#8179b8` bricks (35% of the picture); the castle
    street's is a flat brown dirt band with blob bushes. No ink line under
    the walk edge, no moss, no darkening ramp. In the throne room (the
    start room) and the hall gallery the wall, pillars, ledges and the
    whole floor mass are one lilac brick (`assets/tiles/castle.png`, 20
    colours). The courtyard's mid towers are flat grey-lilac slabs; the
    street's far houses flat cream with blue squares.
- **Sources** (under `docs/design-library/03-visual-direction-and-assets/current-pixel-art-explorations/`;
  source plates, not atlases: isolate, harden alpha, map to the master
  palette, make true 16×16 cells and seam-test them):
  `p03-core-heroes-npcs-terrain-and-vfx-visual-source-sheets/grassy-ruins-pixel-art-tileset-atlas.png`
  (cave arch, rock piles, scaffold, bridge, ladders: close to a quarry kit),
  `castle-interior-tileset-atlas.png` (bevelled blocks, dark mortar, gold
  trim courses, shadow under shelves), `gba-town-street-tileset-atlas.png`
  (foundation stone, cellar grates);
  `p04-cantina-props-vehicles-hall-visual-source-sheets/cantina-tavern-hub-tileset.png`
  (plank walls and floors, wainscot, rafters);
  `p07-first-playable-npc-enemies-mechanisms-terrain-hud-source/pixel-art-platformer-tileset-atlas.png`
  and `p08-additional-townsfolk-enemies-building-blocks-biomes-source/chibi-pixel-biome-tileset-atlas.png`
  (synced at 0372804, not yet looked at by anyone).
- **The contract:** `docs/mechanisms/art-pipeline.md`, all of it,
  including round 2's `autotile.deep`, `autotile.regions`, `outside`, a
  layer's `pin: "room"` and `front`. Your notes so far:
  `tools/art/tiles/README.md`.

## 3. What to build (in this order; push after 1)

1. **Quarry, first pass, as ab0b34b did the camp:** a `ROOM_THEME` entry
   and atlas and backdrop for each quarry room. Ridge, road and depot:
   `grass-ruins` with sky, hills and front foliage (the depot's cellar,
   its lower floor around tile (4, 18), gets the cave look in the second
   pass, as a region of the
   quarry sheet: a region draws from the atlas's own image). Cave and pit:
   `cellar` with `outside.below: "deep"`. The tower: cellar or castle
   stone with a warm vault backdrop (an atlas paints 12 tiles of margin
   past each edge, `room.ts:30`, so its navy side margins go). One-way
   ledges: the braced plank shelves the undercroft and cantina already use.
2. **The cantina's own theme** (`'cantina': 'cantina'`), from P04's
   tavern tileset: a floor of long horizontal warm planks with a dark ink
   cap over a darker board or stone body (never timber framing); a back
   wall of wood wainscot to waist height under warm plaster or dark
   planks; rafters as the top row. Keep the door where it is.
3. **Flat masses:** every solid block a 4-step ramp (lit top-left bevel,
   mid, shade, 1 px dark mortar); a 1 px ink line under every walk edge;
   moss and vine drips off grass lips; `autotile.deep` falling off 2 value
   steps toward near-ink. Castle interiors: `outside.below: "deep"` with
   a darker foundation or flagstone that differs from the wall, a
   floor-face course (flagstone or a carpet-runner edge) under the gold
   trim, the wall ramp one step darker away from torches. Street: the
   dirt band becomes foundation stone with cellar grates. Mid layers:
   the courtyard's towers get a lit and a shade side; the street's far
   houses a hazed blue-cream plane.
4. **Upright sky, in data only:** a tall sky picture (a dithered
   multi-step gradient with rows of clouds, at least 256 px tall) as a
   screen-pinned top layer, so the 8 flat bands no longer show; a
   room-pinned layer above each short room's top row (`pin: "room"`,
   `y: "top"`, a negative `offsetY`): dense tree crowns over the
   courtyard canopy, upper storeys and a roofline over the street's eave,
   dark rafters or vaulted beams over the cantina and the hall gallery
   (never the floor tile). Far and mid layers pinned to the room. Target:
   courtyard upright under 10% single-colour rows (41% now), castle
   street under 8% (22%).
5. **Quarry, second pass:** an own `quarry` theme as a native 16 px
   autotile from P03 grassy-ruins (and P07/P08): orange-brown cobbled
   earth on a 3–4 tone ramp, a lime grass cap with a 1 px ink edge, a
   darker cave body, rubble and cut-stone faces, scaffold planks with
   posts, ladders; a backdrop with a pale cliff far layer, scaffolds and
   cranes in the middle layer, dust haze; a cave variant with a dark rock
   back wall. (The props lane draws the quarry's hiding spots, decor and
   lantern glows.)

## 4. Traps

- **`make.py`'s `ROOM_THEME` has two other steps' lines:** `cantina`
  (Step 11 slice B, 365a40d; its comment says the theme is one word) and
  `outpost` (Step 12 slice B, ab0b34b). Change `cantina` to your theme;
  leave `outpost`. Step 11's worker may still run `make.py`: tell the
  orchestrator in your report that the cantina's theme moved.
- **Everything past a room's edge still looks solid** to the autotile
  index and is solid to the simulation (`INTENT:` in the contract). Paint
  only; never hint at a secret.
- **A `front` layer only below the floor line or along the very top
  edge**, never over a person, a door or a working part.
- **Do not touch `content/rooms/`** (Step 16 owns `quarry-*.json` and
  `courtyard.json`), `content/outposts/` (Step 12), or `src/`. The
  alternative for gap 6 that needs code (cap the upright view at the
  room's height plus 2 tiles, in `src/client/shell.ts`) is not taken this
  round: `shell.ts` is Step 17's right now.
- **Shared documents are not yours**, except appending your decisions to
  the end of `docs/decisions-log.md`. Notes in `tools/art/tiles/README.md`.
- **Many people push to `main` at once and a push is the deploy.** `git
  pull --rebase origin main` before each push.
- **"The code looks right" is not a verification.** Look at every room.

## 5. Paths

**Yours alone:** `tools/art/tiles/`, `assets/tiles/`, `assets/backdrops/`,
`content/atlases/`, `content/backdrops/`,
`docs/plan/step-8-shots/round3/ground/`.
**Not yours:** `content/decor/`, `content/looks/`, `assets/decor/`
(props), `content/rooms/`, `content/outposts/`, every `src/` file,
Step 17's files.

## 6. Decided, and open

Decided: section 2. Open: nothing for the owner. Where you would ask,
decide from the bar and the sources, mark it `DRAFT:`, write it down,
keep going.

## 7. Done

- `npm run build`, `npm run check`, `npm run e2e` green after the last
  `git pull --rebase origin main`. Never weaken or skip a fact.
- Pushed to `main` (at most three pushes), live: `npm run
  check:deployed` and `npm run check:live` after each.
- Committed under `docs/plan/step-8-shots/round3/ground/` (under 10 MB;
  canvas crops at 2× are fine): before (today's live game) and after at
  iPhone size upright (390×664) and sideways (844×390 with insets
  47/47/21) of all six quarry rooms, the cantina, the courtyard, the
  castle street, the hall gallery and the throne room; with the
  single-colour row share of each upright shot. Spots (feet tile):
  quarry-road (48, 10), quarry-ridge (50, 7), quarry-cave (12, 12),
  quarry-depot (3, 13) and its cellar (4, 18), quarry-pit (16, 18),
  quarry-tower (3, 28) and its top (16, 4), cantina (12, 9), courtyard
  (14, 7), castle-street (14, 10), hall-gallery (13, 10), throne-room
  (11, 14). Extend `tools/art/tiles/shots.mjs` (yours).
- `send_message` to the session on the **Orchestrator:** line of
  `docs/questions-for-the-owner.md`: **"look3 lane ground done at
  <commit>"**, plus at most three lines on what is weakest.
