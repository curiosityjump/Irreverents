# Props lane: looks, effects, decoration and the "Use" button

**Reference.** Open it before touching `tools/art/props/`, `assets/props/`, `assets/fx/`, `assets/decor/`,
`assets/ui/use.png`, `content/looks/` or `content/decor/`. The contract is `docs/mechanisms/art-pipeline.md`.

`DRAFT:` every picture here is a stand-in drawn by a program (round 1 of Step 8's look, 2026-11-23). A delivered
sheet replaces one by editing its content file; nothing in the engine changes.

## What exists

Run from the repository root (Python 3 + Pillow, deterministic: two runs give the same bytes):

| Command | What it does |
|---|---|
| `python3 -I tools/art/props/make.py` | rewrites every PNG and content file listed below |
| `python3 -I tools/art/props/selfcheck.py` | this lane's own check (below); exits 1 on a problem |
| `python3 -I tools/art/props/preview.py` | contact sheets and each room with the decor in place, into `tools/art/props/preview/` (git-ignored) |
| `python3 -I tools/art/props/sizes.py` | lists every door's and part's kind, look and tile rectangle from `content/rooms/` |

| File | Role |
|---|---|
| `px.py` | the drawing kit: the contract's palette, hand-placed pixel art from text, outline and shading passes, a sheet packer |
| `looks_parts.py` | doorway, plates, gate, cracks, rubble, windows, curtains, bell, shop counter and goods |
| `looks_people.py` | mood marks, speech nine-slices, away dots, player mark, shadows, alert pips, the four effects, the Use button |
| `decor_draw.py` | the decoration pictures |
| `place.py` | where decoration goes in each of the six map rooms (rules, not coordinates read from secrets) |
| `sizes.py` | reads the rooms; `make.py` draws a `door-enter-`, `window-` and `hide-` look for every size that exists |

**Looks** (`content/looks/<group>.json`, one image each; 36 ids):

- `parts` → `assets/props/parts.png`: `door-enter-1x2`, `window-1x3`, `window-broken-1x3`,
  `part:throne-room:window` and `part:throne-room:window:broken` (the stained glass), `hide-1x2`, `hide-2x2`,
  `bell`, `bell-ringing` (4 frames), `bell-broken`, `plate-up`, `plate-down`, `gate-closed`, `gate-open`,
  `crack-1`, `crack-2`, `rubble`, `shop-counter`, `shop-goods`.
- `people` → `assets/props/people.png`: `mood-2` (2 frames), `mood-3` (2), `away-dots` (4), `bark`, `bark-tail`,
  `ribbon`, `alert-pip`, `alert-pip-off`, `player-mark`, `shadow-s`, `shadow-m`, `shadow-l`.
- `fx` → `assets/fx/fx.png`: `fx-slash` (5), `fx-hit` (5), `fx-dust` (5), `fx-land` (4).
- `ui` → `assets/ui/use.png`: `ui-use`; also the `icon` of `content/actions/interact.json`.

The sizes in use today (from `sizes.py`): enter doors 1×2; windows 1×3; hiding places 1×2 and 2×2. A new size
in a room file gets its look on the next `make.py`.

**Decoration** (`content/decor/<room>.json` for `castle-street`, `courtyard`, `throne-room`, `hall-gallery`,
`undercroft`, `graybox-hall`; sheets `assets/decor/town.png`, `courtyard.png`, `castle.png`, `undercroft.png`).
Far-layer things are greyed and have no dark outline; back-layer things have the full palette and an ink
outline. The `test-*` rooms get none.

**The self-check** proves: every image exists; every `src` and strip fits; required keys; `"//"` starts
`DRAFT:`; look ids unique; every id of the contract's table exists at the contract's size; alpha is 0 or 255
(shadows and the Use button excepted); back and front decoration overlaps no enter doorway, no part, no spawn
point and no bell; whatever stands has ground under it and whatever hangs has ground over it; nothing reaches
the room's rim.

### Round 2 (2026-11-23, `handoff-prompts/look2-props.md`)

| File | Role |
|---|---|
| `import_p01.py` | the one import of the art desk's P01 pieces: optional box-filter scale, hard alpha, every colour snapped to the nearest master-palette colour (no dither), light edge fringe stripped, outline re-applied (ink; a soft shade on far pieces, which are also greyed 35% toward `far`). Run alone it writes `preview/p01-<piece>.png`, before and after. |
| `round2.py` | `fx-hit` (32x32 x5, the imported star filled, cored and outlined, then shrinking and sparks), `fx-swing-grappler` (32x32 x3 punch burst), `fx-slash` (32x32 x5 from the imported slash), `fx-dust` (24x24 x5, outlined, shaded), the font strips, stepped-ring glows (three alpha levels), `hide-front-<w>x<h>` |
| `font.py` | the pixel font: 95 hand-drawn glyphs, 5 wide on a 6x10 cell, mixed case, descenders |
| `shots.mjs` | real-game screenshots: a punch on a dummy (6 frames), the throne room, the undercroft, the street; upright and sideways |

New looks: `fx-swing-grappler`, `hide-front-1x2`, `hide-front-2x2`; `font-dark`/`font-light` in `content/looks/font.json` + `assets/ui/font.png`. Resized: `fx-hit` 32, `fx-slash` 32, `fx-dust` 24. Cracks get a light edge beside the dark line. Decor: P01 barrels (street, undercroft, dimmed toward night there), P01 lantern posts (every other street lamp; undercroft lower floor every 10th column from 9), P01 ruin arch and broken column (courtyard, `far`); a `blend: "lighter"` glow on every torch in the five rooms that have them and on the undercroft's lantern posts.


### Round 3 (2026-11-23, `handoff-prompts/look3-props.md`)

| File | Role |
|---|---|
| `srcimport.py` | cuts a piece from an art-desk source plate (P03-P08): crop, hard alpha, largest blob, snap to the ramps given (by material), shrink by majority (a mode, never an average), remove lone speckle, re-ink the edge |
| `round3.py` | the cantina pieces (P04 tavern hub, P08 furniture), the camp (drawn: tents, palisade, fire, rack, flag, crate), the quarry (drawn: rock piles, scaffold; P04 lantern), `hide-1x1`/`hide-front-1x1`, the horn |
| `shots.mjs ... round3` | the brief's scenes, upright and sideways; copies at 1x of the device picture in `docs/plan/step-8-shots/round3/props/` |

New looks: `hide-1x1`, `hide-front-1x1` (rubble over a crevice; every one-tile hide is in the quarry); `signaler`,
`signaler-sounding` (3 frames, 12 fps), `signaler-broken` in `content/looks/outpost.json` + `assets/props/outpost.png`,
each 32x48: the horn only, drawn for a 10x32 post standing at x 11..20, y 16..47 of the look (hung on a peg at
y 21 on its right; raised above its top when sounding; a splintered top at y 12..16 and the horn at the foot when
broken). New decor: `cantina`, `outpost`, `quarry-{road,ridge,tower,depot,pit,cave}` (sheets `decor/tavern.png`,
`camp.png`, `quarry.png`); glows (`blend: "lighter"`) on the cantina's chandelier and lanterns, the camp's fire and
the cave's and pit's lanterns (`GLOW3` in `place.py`). Decisions: `docs/decisions-log.md`, 2026-11-23, "The
cantina, the Bandit Camp and the quarry are furnished" and "The courtyard's tree ... moved".

- **The courtyard's round-2 tree, grass, bush and gold flower stood on the quarry and camp doorways and a plate**
  (added after round 2): `selfcheck.py` caught it. Moved (decision above).
- **Not verified:** the horn *sounding* in the real game: the screenshot's attempt to set the post sounding on the
  page's copy of the world did not take (the next snapshot wins); `horn-looks-4x.png` shows the three looks. The
  cast lane's post sprite had not landed, so "the horn hangs on your post's peg" is lined up with the post's box
  (10x32), not its picture. The quarry rooms had no ground art yet. The cave's and pit's lanterns hang near the
  ceiling, above the brief's camera spots.

**Push 2 (round 3).** Looks: `fx-speed` (24x24 x3, white streaks trailing left of the centre: a body flying
right; mirror for left), `fx-dizzy` (24x12 x4, three stars on an orbit, centred over the head), `fx-clang`
(32x20 x3, lines either side of a 16 px clear middle where the bell is); `mood-2` (a white `?` in thick ink
and a blue sweat drop) and `mood-3` (a red anger mark of four corner strokes, rimmed white inside the ink, so
no red plume swallows it). The HUD sheet `assets/ui/hud.png` (looks in `content/looks/ui.json`, which now names
it; `ui-use` is cut from it and `assets/ui/use.png` is still written for `content/actions/interact.json`):
`hud-face-{grappler,infiltrator,flyer,brawler,skirmisher}` 12x12, hand-drawn in the canon colours (the P07
portraits shrunk to 12 px were mush); `hud-plate` 34x16 (navy, gold corner studs, ink edge: a face at x 2,
y 2 and a count to its right); `hud-ko` and `hud-fall` 10x10 pictures, no letters; `alert-pip`/`alert-pip-off`
10x10 framed bells (lit gold in red, dim grey in dark; moved here from `people`); `bell-gauge` 20x6 (an empty
dark well under a gold rim, for the renderer to fill); `bark-edge` 16x12 (a paper chip, its arrow on the right
edge; x 2..10 left plain for a cropped head). `import_p01.py` keeps at most three tones per material and
removes lone speckle (`clean()`, the barrels and lantern posts); the courtyard's arch and broken column are
re-cut from P03 grassy ruins' clean vine arch (`round3.ruin_arch`) with `srcimport.grab(key=..., grid=True)`
(that plate has an opaque pale ground and drawn cell lines). Sheets at 4x: `hud-sheet-4x.png`,
`fx-sheet-4x.png`, `moods-on-red-4x.png` in `docs/plan/step-8-shots/round3/props/`.
- **Not verified in the game:** every push-2 look but the arches and the cleaned barrels: the actors lane draws
  them (its brief, push 2) and had not landed. The sizes above are this lane's choice; the actors lane reads them
  from the look.
- **Process:** push 1 (76791bf) was reverted (2527611) after ten minutes not live; Railway was only slow (it then
  deployed a later commit), so the revert was premature and push 1 was re-applied with push 2.
- **Deploy (flag for the orchestrator):** 040bc8f (push 1 re-applied plus push 2) was not live 30 minutes after
  its push; `/healthz` answered healthy on 12aa2b8 throughout, and no other code push was queued behind or
  ahead of it. Not reverted (`docs/verifying-and-finishing.md`, "Do not revert"); `check:live` not yet run
  against it. If it never goes live, look at Railway's build log for 040bc8f: locally `npm run build`,
  `check` and `e2e` are green on it.

**Drive-first (the owner, ~17:10 UTC: "everything to utilized the approved assets in the drive").** `drive.py`
cuts the first-room looks from the approved plates: `bell`, `bell-ringing`, `bell-broken` (P04
chibi-pixel-interactables, bell posts row 3-4), `plate-up`/`plate-down` (P04 row 1), `gate-closed`/`gate-open`
(P04 row 1 gates), `door-enter-*` (P07 vibrant-platformer-interactables, the open arched door), `shop-counter`
(P04 tavern hub, counter panel), `shop-goods` (P04 tavern, bottle), `rubble` and `hide-1x1`/`hide-front-1x1`
(P07 vibrant, rock heap). Still drawn here, no approved source taken yet: windows and the stained glass,
curtain hides, cracks, the tents/palisade/rack/fire/flag, rock piles and scaffolds, the HUD faces and icons,
the moods, fx-speed/dizzy/clang. Crates are the cast lane's sprites.

**Drive-first, step 2.** `hud-face-*` (16x16 now: 12x12 lost the heroes' eyes) are each one's own head cut from
its sprite (the heroes lane's canon P03 cut; the cast lane's P04 regulars); `hud-plate` is 40x20 to hold one.
`fx-dizzy`, `fx-speed`, `hud-ko`, `hud-fall` from P05 brawl-hit-ko-respawn (dizzy stars on a swirl; the blue
swoosh; the red and the blue skull badges); `alert-pip`/`-off` from the P07 UI atlas's red "!" badge (off is
the same cut, dimmed). `srcimport.grab(key=...)` now keys out only ground connected to the crop's edge, so a
white inside a piece stays.

**Drive-first, step 3.** `fx-hit` and `fx-dust` from the P03 vfx atlas (the starburst; the dust puffs); the
camp's fire is P08 biome's brazier, its flag P07 platformer's star banner; the quarry's rock piles are P07
platformer's boulder heap at two sizes.

**No approved source found (for the Drive's missing-assets list):**
- `fx-clang`: P03's alert ray fans fill in solid at 32x20; drawn here.
- `mood-2`, `mood-3`: P03's "?" and "!" bubbles lose their glyph at 12x12; drawn here.
- `bell-gauge`, `bark-edge`, `hud-plate`: drawn here in the P07 UI atlas's frame style, not cut from it.
- the camp's tents, palisade, weapons rack and crates: no plate shows a tent, a wooden palisade or a weapons rack
  (crates are the cast lane's bodies; these are decoration).
- the quarry's scaffolds: no plate shows one.
- `window-1x3`, `window-broken-1x3`, the stained glass, curtain hides (`hide-1x2`, `hide-2x2`): P07 has arched and
  stained windows and P04 tavern curtains, but all about square: they would be stretched 2-3x into a 1x3 or 1x2
  part. A tall window and a tall curtain are wanted.
- cracks, `away-dots`, `bark`, `ribbon`, `player-mark`, shadows, `fx-land`, `fx-slash`, `fx-swing-grappler`:
  round 1-2 drawings or P01 cuts, not yet checked against the plates.

**Level entrances (Step 14 slice A, at the orchestrator's ask).** Group `levels` (`content/looks/levels.json`,
`assets/props/levels.png`): `level-entry-{arch,gem-door,portal,mine}` 32x32, cut from P05
secrets-doors-breakables' top row (the glowing arch, the gem door, the swirl portal, the mine mouth), drawn
bottom-centred over an entrance; `level-pie-0`..`4` 12x12 (none, a quarter, half, three quarters, full),
`DRAFT:` drawn in the P05 HUD rings' own colours because the plate's rings run off its bottom edge;
`level-sign` 16x16, P07 platformer's wooden signpost, no text.

## Core loops (`handoff-prompts/loop-art-cutouts.md`)

`loops.py` cuts the core loops' looks from the approved plates (one function per piece, its plate and box);
`loopshots.py` writes one 320x180 mock scene per group at 4x into `docs/plan/step-8-shots/round3/props/loops-<group>-4x.png`.

- **Rides** (group `rides`, `assets/props/rides.png`, P04 chibi-vehicle-and-mount sheet): `ride-{plane,cart,wagon,mount}-`
  `{idle,moving,crash,wrecked}`, every frame 48x44, `moving` 2 frames at 8 fps. Drawn bottom-centred; `INTENT:` frames
  are lined up by the rider's head, so dust or a flame on one side does not jolt the machine. `crash` is the plate's
  4th cell (hit for the machines, a horn charge for the mount); `wrecked` the 5th (the plastered X and smoke; the
  mount sits, spent). Scale 0.2 (the rider's head about a hero's).
- **Powers** (group `powers`, `assets/props/powers.png`, P05 rare-powers-pickups, registered as `powers` in
  `srcimport.SHEETS`): `pickup-{fire,ice,bolt,moon,wing,gear,bomb,star,swirl}` 20x20 (at 16 the glyph inside went to
  mush); `item-{gear,lens,pipe,crystal,spring,book,hook,ring,feather}` on an 18x16 cell, bottom-centred;
  `power-fixture-{crystal,orrery,tree,shrine,brazier,portal}` 32x32; `fx-pickup-glow` (24x16 x3, loops under a lying
  pickup: drawn first, the orb 3 px above the floor over it), `fx-pickup-get` (24x24 x3, once), `fx-power-lost` (24x24
  x3, once: the hit spark, the stars, the orb flying off on its swoosh), `fx-poof` (24x14 x3: the plate's poof, then
  smaller twice; the shrinking is this lane's, the plate has one cloud). Ids name what the plate paints, not a power's
  name in the game.
- **Treasure** (group `treasure`, `assets/props/treasure.png`): `chest-{closed,open,empty}` and
  `chest-iron-{closed,open,empty}` on a 24x26 cell (P07 vibrant row 1, scale 0.17, bottom-centred);
  `door-wood-shut`, `door-wood-open`, `door-barred`, `door-barred-raised` (P07 row 2) and `door-locked`, `door-bars`
  (P05 secrets row 1, no ivy) on 32x32, bottom-centred; `key` 14x12; `gold-coin` 12x12 x2 (plain, glinting);
  `gold-sack`; `gold-pile` (P04 tavern coin heap: P05's vault heap sits on the cave floor and does not cut clean);
  `gem` (P04 crystal), `gem-pedestal` (P07); `hoard` / `hoard-taken` 32x16 for Step 16's depot-hoard (the sack on the
  heap; a few coins left); `vault-cave` 64x30, the P05 cave whole (lantern, crystals, gold), a back-layer picture.
- **Hall of Legends** (group `hall`, `assets/props/hall.png`, P04 hall-of-legends atlas, registered as `hall`): 38
  pieces at scale 0.2, each trimmed to itself (`loops.HALL` lists id and box): `hall-plinth{,-tall,-star}`,
  `hall-niche{,-lit,-statue,-laurel}`, `hall-plaque{,-lines,-laurel,-wide}`, `hall-shield`,
  `hall-banner{,-tower,-laurel}`, `hall-drape`, `hall-lantern`, `hall-torch`, `hall-brazier{,-blue}`,
  `hall-door{,-double}`, `hall-window`, `hall-portal-{gold,blue}`, `hall-statue-{robed,knight,griffin}`,
  `hall-trophy`, `hall-tablet`, `hall-case-{sword,crown}`, `hall-shrine-banner`, `hall-bust`, `hall-column-broken`,
  `hall-urn`, `hall-frame{,-star}`. The plate's banner mauve needs the pink ramp (cloth pieces only: on stone, pink
  speckles). The wood doors lose their pale stone arch to the ground key. The walls, floors and arches are the ground
  lane's tiles, not these.
- **Asks from core-loop builders (item 5).** The glints builder (Step 14 slice B): `piece-grey`, `piece-gold` in
  group `levels` (P05 HUD bottom row; the plate cuts the pieces off below their side knobs, so the top is mirrored
  to close them) at 12x12, not the 8x8 asked: at 8 the knobs vanish; `goods-special` in group `treasure` (16x16, the
  Hall atlas's crown on a cushion in its case). Scene: `loops-asks-4x.png`.
  The heists builder (Step 19): `unseen` (14x12) and `seen-mark` (12x12) in group `ui` (`assets/ui/hud.png`, appended).
  P07's UI atlas has no closed eye: `unseen` is its stealth hood with two glowing eyes, cut off its slot; `seen-mark`
  is its yellow '!' bubble (alert-pip is the red one). Scene: `loops-heist-4x.png`.
- **No approved source:** an empty machine or an empty saddle: every cell has the same goggled rider baked in, so a
  hero cannot be drawn riding one without that rider showing (for the Drive's missing-assets list).
- **Not verified in the game:** no code draws a ride yet; seen in the mock scene only.
- **The depot's decor follows its room:** Step 16 slice 3 (5ae2ac0, 9dd3561) put ground under four far/back items in
  `content/decor/quarry-depot.json`; `selfcheck.py` failed on the stale file, so push 2 re-ran `make.py` and the four
  items are gone (the placing rules, not a choice).

## Deviations from the contract

- `ui-use`'s `src` is the whole 48×24 picture (normal then pressed), with no `frames`: that is how
  `assets/ui/touch/` strips are used by `touch.ts`, and the table's own size column. A reader wanting one half
  takes 24×24 from either end.
- The Use button keeps the delivered buttons' soft alpha (235, 202, 240, 140, 130) so it matches them exactly;
  the contract's "alpha is 0 or 255" is not met there on purpose.
- `bark-tail` is a look of its own in the `people` group (the table names it inside the `bark` row).
- In-between shades of palette colours are used for far-layer things (mixed towards `far`, `castle` or
  `night`), as the palette section allows. No new hue.

## Decisions

- **Round 2: no light shaft at the throne room's stained-glass window.** That window is the face of a
  secret way out, and the room file says "Do not thin the wall, decorate it or point at it"; a shaft
  would point at it. The back wall's own painted windows (ground lane) carry the shafts instead. The
  gallery has no window part at all. Undo: add a glow item in `throne_room()` in `place.py`.
- **Round 2: lantern posts outdoors have no glow.** Added light on a bright sky turns it white.
  Undo: the `castle-street` condition in `Room.glows()`.
- **Round 2: P01 scales.** Barrels 0.5 (18x20, 15x18: under a person's height), lantern post 0.75
  (29x49, three tiles), column 0.8, arch 1.0, star 0.94, slash 30/42. `PIECES` in `import_p01.py`.
- **Round 2: the hide fold is the curtain with its outer edge cleared** (2 px a side on a one-tile
  curtain, 4 on a wider one): the body behind shows only at the edges. Undo: `hide_front` in `round2.py`.

Each is `DRAFT:`, made without asking, and undone by deleting lines in `place.py` (or a function in
`decor_draw.py`) and running `make.py`.

- **The street's slabs are given house fronts.** What a player sees: pale plaster-and-timber walls behind the
  street under each building, a board wall inside the upper room, one shuttered window, one shut green door,
  a key sign by the real doorway, flags between the two buildings. Why: without them the buildings are grey
  slabs floating over a street and the doorway stands in mid-air; the brief asks for "shuttered windows and
  painted doors on building fronts". They are far-layer, so they may sit oddly on the tiles lane's backdrop
  once it lands. Undo: remove the `front-`, `interior-`, `window`, `door-painted`, `sign-key`, `bunting` lines.
- **One shut painted door, clearly not a doorway.** It is green planks with a knob and no dark opening, where
  a real doorway is a dark arch in stone. If players still try to enter it, remove it.
- **The shop gets a stall and a cloth.** A striped awning on posts round the shopkeeper and a striped cloth on
  the ground under the three goods (goods are drawn at floor level by the renderer).
- **The carpet stops at the throne.** It runs from the east door to the throne's left edge and not on to the
  wall behind, so it leads to the throne and nowhere else.
- **A broken window shows a dark opening** inside its frame (the old code-drawn look did the same), with the
  shards left standing.
- **Plates carry a colour as well as a height:** an orange stud when up, lit teal when down.
- **Courtyard columns 1 to 13 and the gallery's ground floor hold nothing standing**, because their room files
  reserve them for Step 7. The courtyard has two pale far-off ruins there, on the far layer only.
- **Armour is a greyed statue on a plinth on the far layer**, so it is not taken for a guard.
- **`shop-goods` is a corked teal flask**; `player-mark` is white with an ink edge (a multiply tint keeps the
  edge dark; a flat fill just gives a slightly larger marker).

## Nothing points: how the placing keeps to it

`INTENT:` (`docs/plan/step-3.md`, "Unadvertised"). `place.py` never reads a `hidden` flag and treats every
door's and every part's tiles alike. Repeating things follow one rule across the whole room (throne room: a
column every fourth column, a banner halfway between; undercroft: a torch every sixth column on two levels,
wherever two open cells fit, which includes the sealed vault). Barrels, cobwebs and chains in the undercroft
are a fixed hash over every cell that fits. The barrel hash's seed was changed once after looking at the
result, because the first seed happened to pile the most barrels in the vault; the seed in use gives it one.
Cracks are a thin dark line with no highlight.

## Flags for the lead

- **Round 2: the looks validator's strip cap was raised from 64 to 128 frames** in
  `src/content/kinds/looks.ts` (a `DRAFT:` there), on the orchestrator's word, so the font stays the
  one 95-frame strip the contract describes. `make.py --no-font` is kept for a check that refuses it.
- **Round 2: the punch burst and the big star are only seen once the actors lane's renderer reads
  `fx-swing-<id>` and sizes from the look**; at the time of this push the grappler still swings `fx-slash`.

- **Cracks are near-invisible on a very dark wall.** `crack-1/2` are ink on transparent; on the preview's
  night-coloured ground they barely show. Whether that is right depends on the undercroft tiles, which had not
  landed when this was pushed. If the vault wall cannot be found at all, lighten one edge of the crack.
- **Far-layer house fronts and columns were drawn against plain stand-in ground and no backdrop.** They need
  one look beside the tiles lane's work when it lands (colour clash, or a back wall that makes columns vanish).
- **The stall's awning sits just under building 1's overhang; the shopkeeper, counter and goods are drawn in
  front of it.** If the cast lane's shopkeeper is taller than 24 px plus hair, check the sign does not sit on
  their head (it hangs at the stall's right post, columns 14-15).
- **The throne room's back wall is busy** (4 columns, 8 banners, 4 torches, 2 portraits, 1 statue). It is
  orderly but may be more than "quiet"; dropping the upper row of blue banners is one line in `place.py`.
- `content/placements/` has no file for `courtyard`, `hall-gallery` or `undercroft`; if things are placed there
  later, re-run `selfcheck.py` (it reads placements for bells only) and look at the previews.
- This clone's local `main` was 19 commits ahead of and 50 behind `origin/main` when the session began (stale
  history from the container image). The work was done on a local branch cut from `origin/main` and pushed to
  `main`; the stale local `main` was left alone.

## Not verified

- Against real ground tiles, backdrops and the cast's sprites: none had landed. Verified against the world and
  actors lanes' renderers on plain ground: the throne room and the street were opened in the real game at
  844×390 and every look and decor item sat where the code-drawn shape was.
- The courtyard, gallery and undercroft were judged from `preview.py` only, not walked to in the real game.
- `window-1x3` (the plain window) and `hide-2x2` in the test rooms, `gate-open`, `plate-down`, `rubble`,
  `bell-ringing`, `bell-broken`, `mood-*`, `bark`, `away-dots`, the effects and `alert-pip` in motion: seen on
  contact sheets only.
- Upright (portrait) play: not looked at with this lane's art.
- How it looks on a real iPhone, and whether it is near the owner's bar: theirs to judge.

**Core-loops cut-outs reviewed** 2026-11-23 19:46 UTC by orchestrator session_017WiGzJzo6aZqH4kYxxJsiV: build, check and e2e green at 4022fd6 (holds 68b2e1d, 51c8cdb, 316e0a0, 749fe33); the mock scenes were not looked at. Brief `handoff-prompts/loop-art-cutouts.md` deleted; its builder session_017WiGzEN1QbSnHzXNqV4XSt stays open for look requests from core-loop builders.
