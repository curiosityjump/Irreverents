# Brief: the look, round 2, lane "props": hits you feel, letters that are pixels, light in the castle, the ruins kit brought in

Written 2026-11-23 by the orchestrator, which runs Step 8 itself
(`docs/plan/step-8.md`, "The look" and "Round 2 (2026-11-23)").
The reviewer deletes it after review.

**Landed so far** (2026-11-23 15:40 UTC; held by builder
`session_017WiGzHanC1tecHKJbjuyCf`): push 1, 70299ee; push 2, 992647b (the pixel font). Check
`git log --oneline origin/main --grep 'round 2, props lane'` before building.

## 1. The task, and the measure

Draw the effects that make a hit look like a hit; draw the game's own
pixel font; give every torch, lantern and window a glow; bring the chosen
pieces of the art desk's P01 Ruins Starter Kit in through one palette
import; draw the front fold of each hiding place.

It moves no numbered row of `docs/plan.md`'s table (M3 counts build
gates). The look is read from screenshots of the real game at iPhone size
beside the owner's references, by a fresh reviewer each round and finally
by the owner (`docs/plan/step-8.md`, "Feedback signal for the look").

## 2. What is already measured and decided (do not redo it)

- **The owner, 2026-11-23 ~11:11 UTC, first-hand, with an iPhone
  screenshot where every character was a flat rectangle:** *"It all looks
  looks like absolute blocky shit. Compare to kirby and the amazing mirror
  and don't stop working on it until it looks similar to that. There are
  assets provided and you have the ability to get more."* And ~11:30 UTC:
  *"It should play well in portrait too, not just landscape. Looks awful
  in both right now"*. The owner's standard for the game working starts
  with *the "OHHHHH" of spectacular physical impact* (`CLAUDE.md`).
- **The bar**, under
  `docs/design-library/03-visual-direction-and-assets/current-pixel-art-explorations/`:
  `pixel-aesthetic-reference-approved-direction.png` (its "Start a Fight"
  panel: a starburst as big as a character's head, gold with a dark
  outline; its "UI / Systems (GBA-style)" panel: crisp, outlined bitmap
  lettering), the two `s00-01-gameplay-references-use-now-revise-later/*-phone-320x180-preview.png`,
  the P01 kit `p01-ruins-starter-kit-playable-prototype/p01-complete/`
  (`README_FOR_CLAUDE.md`, `manifest.json`, `preview/review_board.png`,
  `sprites/`), and the owner's liked hero concept
  `docs/art-reference/heroes-v2-chatgpt-concept.png` (4th pose: a fist
  with a big yellow burst).
- **Similar to, never copied from.** Nothing of Kirby's or any other
  game's is copied or traced; designs stay original.
- **The contract is `docs/mechanisms/art-pipeline.md`, read it in full,
  including "Round 2 additions"** (`fx-hit` grows to 32×32;
  `fx-swing-<character id>`; `font-dark`/`font-light`;
  `hide-front-<w>x<h>`; a decor item's `blend: "lighter"` with up to three
  alpha levels). Round 1 landed your lane at a4040f4; your tools and
  notes (`tools/art/props/README.md`) are the starting point.
- **Which P01 pieces go in, decided** (`docs/decisions-log.md`,
  2026-11-23, "From the art desk's ruins kit"). Measured: every P01 piece
  is painted, with hard alpha (every visible pixel is alpha 255) but 363
  to 2,975 colours and a light fringe on its edges, so **nothing goes in
  raw**. One deterministic import, `tools/art/props/import_p01.py`,
  quantizes each chosen piece to the master palette without dithering,
  strips the light edge fringe, re-applies the ink outline, and writes it
  under `assets/fx/` or `assets/decor/`. Through it:
  | P01 file (size, colours) | Becomes |
  |---|---|
  | `sprites/vfx/impact_star.png` (32×25, 375) | the base of `fx-hit` |
  | `sprites/vfx/spark_slash.png` (42×28, 363) | the base of `fx-slash` (the infiltrator's and flyer's swing) |
  | `sprites/props/big_barrel.png` (37×40, 1,412), `small_barrel.png` (30×37, 945) | decor, `back`, in the undercroft and the castle street |
  | `sprites/props/lantern_post.png` (39×65, 1,593) | decor, `back`, in the castle street and the undercroft, each with a glow |
  | `sprites/props/ruin_arch.png` (88×55, 2,975), `broken_column.png` (35×57, 1,316) | decor in the courtyard, **`far` only**, with sky visible through the arch so it never reads as a door |
  Not used: `arrow_sign` ("Nothing points"), `wooden_ladder` (would look
  climbable), `red_banner` (ours is as good), `stone_pillar` (its flat
  top would look like a platform), `treasure_chest` (would look like
  something to open, and could seem to mark a secret), `wooden_crate`
  (the crate is a cast body), the terrain prefabs (the ground lane's
  model) and the heroes (not our party). You may scale a piece down
  before quantizing so it sits right against 16 px tiles and 30–40 px
  people; the output must still be hard-edged in the palette.
- **What the round-2 review measured** (three independent reviewers;
  screenshots not in the repository, so here in words):
  - *Hits do not look like hits.* A punch gives a pale thin crescent, then
    cream dust puffs 8–16 px across. `fx.json` today: `fx-slash` 24×24 ×5,
    `fx-hit` 16×16 ×5 (a twinkle with 1-px rays and no outline), `fx-dust`
    16×16 ×5, `fx-land` 24×8 ×4. Across six frames of a punch on a dummy
    and of a thrown crate's impact, no star was visible at all. The
    grappler punches with a fist but the game draws a sword-swipe
    crescent over it.
  - *Speech is a smeared system font.* Barks and the king's lines are
    `fillText` in `bold 8px monospace` on the 1× canvas, scaled up 3–6×:
    grey anti-aliased fringes; "SEIZE THEM!!" smears into blobs; on an
    iPhone `monospace` is Courier, thinner still. The lines are mixed case
    ("Our astronomers call it the Unlidding.").
  - *Interiors have no light*: torches are small flames with no glow, the
    tall windows barely show; the undercroft is a near-black void with
    tiny torches.
  - *Hiding looks like standing.* In the castle street's awning curtain
    (a 2×2-tile hiding place) the hidden infiltrator is drawn whole, at
    full value, in front of the curtain. Hiding places in use: `hide-1x2`
    (throne room) and `hide-2x2` (castle street).
  - *Decor today:* 208 items in six rooms, all `far` or `back`; none
    `front`. Not verified by the review: round 1's flag that the crack
    overlays vanish on dark walls; look for yourself.
- **The team** (paths each lane alone may touch) is the table in
  `docs/mechanisms/art-pipeline.md`, "Who is building round 2". The actors
  lane draws your effects, font and hide folds; the frame lane draws
  decor and its `blend`. Heroes, ground, frame and actors run at the same
  time as you.
- **How to see a room in the running game at iPhone size:** `npm run
  dev`; Playwright Chromium (`NODE_PATH=/opt/node-tools/node_modules`,
  `chromium.launch()` with no options), device `iPhone 14` (upright) and
  `iPhone 14 landscape` at 844×390 with
  `Emulation.setSafeAreaInsetsOverride` left 47, right 47, bottom 21;
  open `/?room=<a made-up name>` (a private world), wait for
  `window.irreverents.drawn.status === 'online'`, then on
  `d.world.entities.find(e => e.player === d.player)` set `room`,
  `x = tx*16 + (16 - box.w)/2`, `y = (ty+1)*16 - box.h`. Spots:
  graybox-hall (5, 9) (dummies and a crate to punch), throne-room
  (9, 14), castle-street (16, 10), undercroft (24, 12).
- **Tools on hand:** Node 22, Python 3 with Pillow 12 (`python3 -I`),
  Chromium with Playwright. No image generator.

## 3. What to draw

1. **Impact.** `fx-hit`: a 32×32 bold 8-point star, ink outline, white
   core, gold ramp, 4–5 frames (pops in oversized, holds, shrinks,
   scatters sparks), built from the imported `impact_star` and finished by
   hand-placed pixels. `fx-swing-grappler`: a chunky 3-frame punch burst
   at the fist (not a blade). `fx-slash`: from the imported
   `spark_slash`, for the others. `fx-dust`: 24×24, outlined, with a
   darker shade tone.
2. **Font.** An original pixel font as two looks in a new group file
   `content/looks/font.json` with image `assets/ui/font.png`: `font-dark`
   (ink letters, for barks on the paper bubble) and `font-light` (cream
   letters with a 1 px ink shadow, for the king's dark ribbon). Each a
   strip of 95 frames, ASCII 32–126 in order, cell 6×10, capitals on rows
   0–6, descenders to row 9, glyphs 5 px wide. Mixed case, punctuation,
   `!?'".,-…` legible at 1×.
3. **Glow.** Stepped-ring glows (at most three alpha levels, warm gold and
   orange) as decor items with `blend: "lighter"` on every torch and
   lantern already placed in `throne-room`, `hall-gallery`, `undercroft`,
   `graybox-hall` and on the new lantern posts; a cooler shaft at the
   throne room's and gallery's tall windows. Strong enough to read at
   phone size, never a flat wash.
4. **P01 decor** through `import_p01.py`, placed by `place.py` as in the
   table above.
5. **Hide folds.** `hide-front-1x2` and `hide-front-2x2`: the curtain's
   front fold, transparent elsewhere, so a body hidden behind it shows
   only at the edges.
6. **Cracks.** If `crack-1`/`crack-2` vanish on the dark walls, give them a
   light edge on a dark core.

## 4. Traps

- **`blend` is a new field** and `content/looks/font.json` a new group:
  `npm run check` rejects `blend` until the frame lane's validator is on
  `main` (their first push). Keep drawing; check with your own
  `selfcheck.py`; before pushing, pull and run the real check. If still
  rejected, push the rest (your first push), re-pull every three minutes
  for up to thirty, then tell the orchestrator.
- **Look ids are global**: the same id in two group files fails the check.
- **Nothing points** (`INTENT:`; `docs/plan/step-3.md`, "Unadvertised";
  `docs/deliberate-designs.md`): no glow, barrel, arch or column may mark
  a hidden door, a false wall, a secret or the way to one, and none may be
  conspicuously absent there. Glows go on lights that are already there;
  new decor is placed evenly, never as a hint. Decoration never looks like
  a platform or a door.
- **Effects change size.** The actors lane makes the renderer read every
  size from the look; until their push is on `main` a 32×32 `fx-hit` may
  draw off-centre. That is expected; do not shrink it back.
- **Many people push to `main` at once, and a push is the deploy.** Push at
  most twice; `git pull --rebase origin main` and build, check and e2e
  again before each. A conflict outside your paths: take theirs and
  re-apply yours.
- **Shared documents are not yours to edit**: `docs/mechanisms/README.md`,
  `docs/mechanisms/art-pipeline.md`, `docs/architecture.md`,
  `docs/decisions-log.md`, `docs/for-the-lead.md`, `docs/plan/`,
  `docs/understanding-the-project.md`, and the design library (read
  only). Notes go in **`tools/art/props/README.md`** under "What exists",
  "Deviations from the contract", "Decisions", "Flags for the lead", "Not
  verified"; include the 1–5 ratings of the P01 kit the review sent back
  (in `docs/plan/step-8.md`, "Round 2") if you disagree with any.
- **Never weaken, skip or edit a scripted check or its control.**
- **How to draw.** Deterministic (fixed seeds, no clock), 1×, whole
  pixels, the master palette; alpha 0 or 255 except glows (three levels);
  previews NEAREST only.
- **"The code looks right" is not a look.** Open your previews beside the
  bar at least three times, improving after each, then in the running
  game: punch a dummy in the graybox hall and screenshot the frames.

## 5. Out of scope

- How and where effects, text and folds are drawn (actors lane); how
  decor and glows are composited (frame lane); tiles and backdrops
  (ground lane); characters. `assets/ui/touch/` (the touch buttons).
- `docs/vision.md`.

## 6. Decided, and open

Decided: everything in section 2 and the contract. Open: nothing a
session should ask the owner. Decide from their words and the bar, mark
it `DRAFT:`, write it under "Decisions" in your notes file, keep going.

## 7. How it gets verified, and done

`preview.py` writes every look at 4× with its id, the effect strips frame
by frame, the font set as a pangram in both colours at 1× and 4×, each
room's decor over its ground at 320×180 ×4 with and without glows, and
the imported P01 pieces before and after the import side by side. Then the
running game at phone size. Then `npm run build`, `npm run check`,
`npm run e2e` green after the final `git pull --rebase origin main`; after
the push, `npm run check:deployed` and `npm run check:live`; fix forward or
revert at once if live breaks, and say which.

**Done:** all of section 3, pushed and live; your own before (today's live
game) and after screenshots at iPhone size, upright (390×664, Playwright's `iPhone 14`) and
sideways (844×390 with insets), of a punch in the graybox hall, the
throne room and the undercroft, looked at and kept in
`tools/art/props/preview/`; notes updated. SOP phase 6 rows: decisions
made without asking (notes file). Leave this brief; the reviewer deletes it.

## 8. Where questions go

A blocking question goes to the orchestrator: the session on the
**Orchestrator:** line in the header of `docs/questions-for-the-owner.md`,
read after `git pull` when you send, with `send_message`; carry on with
everything else. Nothing goes to the owner. Flags go in your notes file.
When the lane is pushed and live, send the orchestrator one message,
**"look2 lane props done at <commit>"**, plus at most three lines on what
is weakest; your final message says no more than that.
