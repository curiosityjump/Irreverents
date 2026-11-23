# Brief: the look, round 2, lane "ground": stone that looks like stone, ground under the floor, depth behind and in front

**Scratch.** Delete this file when the lane has shipped. Written
2026-11-23 by the orchestrator `session_017WiGzGp8auJceLEAAh9Aqx`, who
leads Step 8 (`docs/plan/step-8.md`, "The look" and "Round 2
(2026-11-23)").

## 1. The task, and the measure

Redraw the four tile sheets so walls, floors and ledges read as separate,
bevelled, lit blocks with a chunky walkable edge; give the outdoor rooms
real ground under the floor and open sky above; tell the castle street's
roofs from its street; re-value the backdrops so they have depth instead
of fog, and add a dark foreground strip; give the interiors light and
shadow.

It moves no numbered row of `docs/plan.md`'s table (M3 counts build
gates). The look is read from screenshots of the real game at iPhone size
beside the owner's references, by a fresh reviewer each round and finally
by the owner (`docs/plan/step-8.md`, "Feedback signal for the look").

## 2. What is already measured and decided (do not redo it)

- **The owner, 2026-11-23 ~11:11 UTC, first-hand, with an iPhone
  screenshot where every character was a flat rectangle and the platforms
  flat grey:** *"It all looks looks like absolute blocky shit. Compare to
  kirby and the amazing mirror and don't stop working on it until it
  looks similar to that. There are assets provided and you have the
  ability to get more."* And ~11:30 UTC: *"It should play well in
  portrait too, not just landscape. Looks awful in both right now"*.
- **The bar** (look at each with the Read tool before drawing and again
  when judging), under
  `docs/design-library/03-visual-direction-and-assets/current-pixel-art-explorations/`:
  `pixel-aesthetic-reference-approved-direction.png`, the two
  `s00-01-gameplay-references-use-now-revise-later/*-phone-320x180-preview.png`
  (sky to the top edge, distant blue-green ruins, every stone its own
  rounded block, a thick bright grass lip with drips and tufts, a wooden
  bridge with posts, dark foliage at the frame's edges), and the P01 kit
  `p01-ruins-starter-kit-playable-prototype/p01-complete/` (`preview/`,
  `sprites/terrain/`). **P01's `stone_wall.png`, `stone_grass_wall.png`
  and `grass_full.png` are exactly the block rendering your sheets lack;
  `wooden_bridge.png` and `floating_island.png` show a ledge with mass and
  a dark underside.** They are painted (2,095 to 2,856 colours each) and
  not on the 16 px grid (56×47, 58×54, 50×53), so they are the model you
  redraw to at 16 px in the master palette, never tiles you cut
  (`docs/decisions-log.md`, 2026-11-23, "From the art desk's ruins kit").
- **Similar to, never copied from.** No tile or screen of Kirby's or any
  other game's is copied or traced. The likeness is in the craft.
- **The contract is `docs/mechanisms/art-pipeline.md`, read it in full,
  including "Round 2 additions"** (new atlas fields `deep` and `regions`;
  new backdrop fields `outside`, a layer's `pin` and `front`). Round 1
  landed your lane at ebcf79e; your tools and notes
  (`tools/art/tiles/README.md`) are the starting point.
- **What the round-2 review measured** (three independent reviewers;
  their screenshots are not in the repository, so here in words):
  - *Walls and floors are flat two-tone wallpaper.* Every wall, floor and
    ceiling is one repeating flat brick: one fill colour, slightly darker
    mortar, no bevel, highlight, shade or ink edge. `castle.png` and
    `town.png` have 18 colours each, `cellar.png` 24, `grass-ruins.png`
    25. The courtyard's grass lip is a thin flat strip with a tiny
    zigzag; the bar's is a thick yellow-green lip with a highlight row,
    drips and tufts. The reviewer called this "the main reason the game
    still looks blocky".
  - *The street and the roofs are one grey course* (your own round-1
    decision, "The street's cobbles and its roofs are the same stone"):
    the street reads as a grey stripe, the roofs as flat grey slabs. Your
    note said a second material needs a contract change: it now exists
    (`autotile.regions`).
  - *Half the outdoor picture is fill outside the room.* Rows with no sky,
    measured on the screenshots: courtyard upright 55–56%, sideways
    48–50% (flat brick above the sky and below the grass). Rows almost all
    beige plaster: castle street upright 30–31%, sideways 20–22%; under
    the street's single cobble course is the plaster `(255, 226, 192)`,
    the town atlas's fill, so the street floats on house wall. The rooms:
    `courtyard` 30×9 and `castle-street` 48×12 both have a solid row 0
    and a solid bottom row (row 8, row 11). The frame lane is changing
    what is painted past the room's edges and where the room sits in the
    view; you supply the pictures and the data (below). Refuted by the
    review: the far and mid layers *do* show upright; the fill crowds
    them.
  - *Backdrops are fog.* Share of opaque pixels with luminance ≥ 215:
    `castle-mid.png` 71% (darkest pixel 184), `town-mid.png` 77% (darkest
    183), `far-hills.png` 0% but darkest 191 in 4 colours. The play plane
    floats on a bleached poster; nothing is ever in front of the action
    (the front decor layer holds only small grass blades).
  - *Interiors are one flat lilac with no light.* The back wall and the
    solid wall in front differ by one ramp step; torches have no glow;
    the floor is a cream line on more lilac. `castle-hall.png` has 11
    colours, `cellar-vault.png` 8; the undercroft is mostly flat
    near-black. The bar's castle (approved board, Castle and Heist
    panels): warm lantern pools, darker corners and recesses, a warm
    gold-tan floor stone, stained-glass light.
  - *Ledges are thin lines.* Castle one-way ledges are 2–3 px cream strips
    that read like UI underlines and are the same cream as the solid
    trim; undercroft and street ledges are 4 px brown sticks; upright,
    the castle street's east end is mostly sky crossed by brown
    hairlines.
  - *The grappler is painted in the castle wall's own colours*
    (`#8179b8` is both his main fill and `castle.png`'s commonest colour).
    The heroes lane is moving him off it; you calm the back wall so the
    actors stand off it.
- **The rooms** (`content/rooms/`, 16 px tiles): `throne-room` 20×16
  (where a player starts), `castle-street` 48×12 (buildings: a hollow
  house at columns 24–33, rows 3–7; a block at columns 10–17, rows 5–6;
  the street floor is row 11), `courtyard` 30×9, `hall-gallery` 24×12,
  `undercroft` 34×14, `graybox-hall` 20×11. `test-*` rooms get no art.
  Steps 11 and 12 are building now (`handoff-prompts/step-11-a-brawl.md`,
  `step-12-a-outpost.md`): they add a door to `castle-street`, an entry to
  `courtyard`, and two new rooms (`cantina`, `outpost`). Read the room
  files when you write regions, not this list; the new rooms are not this
  round's (a room with no art file draws plain shapes; flag it).
- **The view:** sideways about 320×180 (the frame lane is tightening it
  from up to 225 tall), upright up to 256 tall and 192–264 wide.
- **The team** (paths each lane alone may touch) is the table in
  `docs/mechanisms/art-pipeline.md`, "Who is building round 2". Heroes,
  props, frame and actors run at the same time as you. The props lane
  places glows on the torches and lanterns (decor), imports P01's arch,
  column, barrels and lantern post as decor, and draws the crack
  overlays; not you.
- **How to see a room in the running game at iPhone size:** `npm run
  dev`; Playwright Chromium (`NODE_PATH=/opt/node-tools/node_modules`,
  `chromium.launch()` with no options), device `iPhone 14` (upright) and
  `iPhone 14 landscape` at 844×390 with
  `Emulation.setSafeAreaInsetsOverride` left 47, right 47, bottom 21,
  plus 667×375; open `/?room=<a made-up name>` (a private world), wait
  for `window.irreverents.drawn.status === 'online'`, then on
  `d.world.entities.find(e => e.player === d.player)` set `room`,
  `x = tx*16 + (16 - box.w)/2`, `y = (ty+1)*16 - box.h`. Spots: throne-room
  (9, 14), castle-street (16, 10) and (37, 10), courtyard (14, 7),
  hall-gallery (8, 10), undercroft (24, 12) and (8, 4), graybox-hall
  (5, 9).
- **Tools on hand:** Node 22, Python 3 with Pillow 12 (`python3 -I`),
  Chromium with Playwright. No image generator.

## 3. What to draw and write

1. **Blocks.** Redraw the fill and edges of all four sheets as separate
   bevelled blocks: a 1 px dark mortar or ink line, a top-left highlight
   row, a bottom-right shade, 3–4 tones from the ramp, mixed block widths
   (8, 12, 16). At least six `fill` variants per sheet: plain, chipped,
   mossy (outdoors), a banner-hook or sconce stone (indoors). Keep any
   crack in a fill variant small and unlike the `crack-1`/`crack-2`
   overlays, so a breakable wall that is being hit still reads as the one
   cracking. An ink line on every exposed ground edge.
2. **Walkable edges.** Grass lip 5–6 px with a yellow-green highlight row
   and a dark drip underside; the castle cap a 4–5 px warm tan or gold
   stone with an ink line under it (the bar's castle floor), warmer than
   the ledges.
3. **Ledges** (the one-way row in every sheet): 7–8 px thick, ink outline,
   lit top, shaded underside, a one-row dark drip or shadow under. Castle:
   a stone shelf with corbel brackets at the end caps, a different value
   from the floor cap. Wood (cellar, town): planks with nail heads and
   diagonal brace end caps, as P01's `wooden_bridge`. **The standing
   surface stays at the tile's top edge** (collision is the tile; a
   thicker drawing grows downward).
4. **Ground under the floor** (`autotile.deep` in `grass-ruins.png` and
   `town.png`): packed earth or foundation stone, darker and plainer than
   the fill, stepping down in value with depth. For `courtyard` and
   `castle-street`, write `"outside": { "above": "sky", "below": "deep" }`
   in their backdrop files.
5. **Regions** (`autotile.regions`): in `castle-street`, the street floor
   (row 11) as rounded cobbles with a curb, the buildings' tops as a
   pitched red or blue tile roof, their walls plaster and timber as
   today; in both outdoor rooms, the top row (row 0, which the room files
   keep solid) as an eave or leaf canopy whose upper edge breaks up
   against the sky.
6. **Backdrops.** Far: `#9fc7e8`/`#b5d6ee` with clear silhouettes
   (towers, aqueduct arches, a tree line). Mid: one step more saturated,
   foliage-ramp trees, stone at `#a9a5bd`, and a darker base so the mid
   layer has a dark bottom edge against the ground. Measure after: under
   30% of opaque pixels at luminance ≥ 215 in each mid layer. Use `pin:
   "room"` on any layer that should stay behind the room in a view taller
   than the room.
7. **Foreground.** `assets/backdrops/front-foliage.png` (320 wide, seamless
   sideways, at most 24 px tall, dark-green bushes and hanging vines) as a
   `front: true` layer in both outdoor backdrops, pinned to the room's
   bottom so it sits in the ground below the floor line, never over the
   feet.
8. **Interiors.** Calm the castle back wall (`castle-hall.png` and the
   atlas wall cells): less saturated than the actors, at least one ramp
   step from the solid wall in value, darker toward the top and the
   corners in two or three flat bands; brighter window shafts. Undercroft
   (`cellar-vault.png`): visible vault ribs and a few lit niches to break
   the void.

## 4. Traps

- **New fields are rejected until the frame lane's validators are on
  `main`** (their first push). Keep drawing; check with your own
  `selfcheck.py`; before pushing, pull and run the real check. If still
  rejected, push the redrawn sheets without the new fields (your first
  push), re-pull every three minutes for up to thirty, then tell the
  orchestrator.
- **`INTENT:` everything past the room's edge "looks solid"** for the
  autotile index, and a false wall and a hidden walk door are drawn
  exactly as the wall around them. `outside` changes only what is painted
  past the edge. Nothing in your fill variants, regions or glows may
  differ at a secret (`docs/plan/step-3.md`, "Unadvertised";
  `docs/deliberate-designs.md`). Regions are rectangles you choose from
  the room's layout, never from where its secrets are.
- **A backdrop is never mistaken for something to stand on**; the front
  strip never covers a person, a door or a working part.
- **Many people push to `main` at once, and a push is the deploy.** Push at
  most twice; `git pull --rebase origin main` and build, check and e2e
  again before each. A conflict in a file outside your paths is somebody
  else's push: take theirs and re-apply yours.
- **Shared documents are not yours to edit**: `docs/mechanisms/README.md`,
  `docs/mechanisms/art-pipeline.md`, `docs/architecture.md`,
  `docs/decisions-log.md`, `docs/for-the-lead.md`, `docs/plan/`,
  `docs/understanding-the-project.md`. Notes go in
  **`tools/art/tiles/README.md`** under "What exists", "Deviations from
  the contract", "Decisions", "Flags for the lead", "Not verified".
- **Never weaken, skip or edit a scripted check or its control.**
- **How to draw.** Deterministic programs, 1×, whole pixels, the master
  palette; no blur, anti-aliasing or gradients; previews NEAREST only.
  Every tile joins its neighbours without seams: check a large wall and a
  long floor in the preview, not one tile.
- **"The code looks right" is not a look.** Open your previews and the
  bar side by side at least three separate times, improving after each,
  then the running game at phone size.

## 5. Out of scope

- The renderer (frame lane), the room files and their solid rows (Step
  3's; opening an outdoor room's roof row is not this round), decoration
  and glows (props lane), characters.
- `docs/vision.md`.

## 6. Decided, and open

Decided: everything in section 2 and the contract. Open: nothing a
session should ask the owner. Decide from their words and the bar, mark
it `DRAFT:`, write it under "Decisions" in your notes file, keep going.

## 7. How it gets verified, and done

`preview.py` writes each sheet at 4×, a 320×180 mock of each of the six
rooms at 4× beside the matching bar image, and the two outdoor rooms in a
234×256 upright view. Then the running game at the three phone sizes and
the eight spots in section 2. Then `npm run build`, `npm run check`,
`npm run e2e` green after the final `git pull --rebase origin main`;
after the push, `npm run check:deployed` and `npm run check:live`; fix
forward or revert at once if live breaks, and say which.

**Done:** all of section 3, pushed and live; your own before (today's live
game) and after screenshots of all six rooms at iPhone size, upright
(390×664, Playwright's `iPhone 14`) and sideways (844×390 with insets), looked at and kept in
`tools/art/tiles/preview/`; notes updated. SOP phase 6 rows: decisions
made without asking (notes file). Do not delete this brief.

## 8. Where questions go

A blocking question goes to the orchestrator, session
`session_017WiGzGp8auJceLEAAh9Aqx` (the address in the header of
`docs/questions-for-the-owner.md`), with `send_message`; carry on with
everything else. Nothing goes to the owner. Flags go in your notes file.
When the lane is pushed and live, send the orchestrator one message,
**"look2 lane ground done at <commit>"**, plus at most three lines on what
is weakest; your final message says no more than that.
