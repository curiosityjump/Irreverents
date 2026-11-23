# Brief: the look, round 2, lane "heroes": a grappler and an infiltrator you can read at phone size

**Scratch.** Delete this file when the lane has shipped. Written
2026-11-23 by the orchestrator `session_017WiGzGp8auJceLEAAh9Aqx`, who
leads Step 8 (`docs/plan/step-8.md`, "The look" and "Round 2
(2026-11-23)").

## 1. The task, and the measure

Redraw the **grappler** and the **infiltrator** so that, at real phone
size in the running game, each has a face you can read, a silhouette you
can name, and a colour that stands off the room behind it; make carrying
read as a two-handed hoist. Then, if time is left, the **villain**.

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
  in both right now"*.
- **The bar** (look at each with the Read tool before drawing and again
  when judging): under
  `docs/design-library/03-visual-direction-and-assets/current-pixel-art-explorations/`,
  `pixel-aesthetic-reference-approved-direction.png` (the owner's chosen
  direction; its roster: every figure's head is at least half its
  height), the two `s00-01-gameplay-references-use-now-revise-later/*-phone-320x180-preview.png`,
  and the P01 kit's `p01-ruins-starter-kit-playable-prototype/p01-complete/preview/review_board.png`
  (its scout and rogue: about 36 px tall, head about 60% of the figure, a
  face 14–16 px wide, eyes 3–4 px tall with a light pixel). **And above
  all the owner's liked concept `docs/art-reference/heroes-v2-chatgpt-concept.png`**:
  top row the grappler (navy-slate body, a tan muzzle about half the
  head, a heavy brow, big eyes, an open shouting mouth, swept-back orange
  crest, orange scarf, green shorts, a brown backpack, both hands under
  the boulder when lifting); bottom row the infiltrator (upright,
  big-headed, leaf ears up and back, goggles on the brow, an orange scarf
  streamer).
- **Similar to, never copied from.** No character, sprite, tile or screen
  of Kirby's or any other game's is copied, traced or imitated as a
  likeness; the P01 heroes are not our party either. The likeness is in
  the craft (palette, outlines, shading, roundness, readable silhouettes,
  lively animation), on the concept's original designs.
- **The contract is `docs/mechanisms/art-pipeline.md`, read it in full,
  including "Round 2 additions".** Round 1 landed nine lanes on `main`
  (heroes at 59de45d); your sheets, tools and notes
  (`tools/art/heroes/README.md`) are the starting point.
- **The hero set is decided** (`docs/decisions-log.md`, 2026-11-23, "The
  heroes you liked stay"): keep main's set and costumes; redraw the
  grappler and the infiltrator with the proportions of the alternative
  set on branch `origin/claude/gallant-keller-1gpm2y` (commit c7c9555,
  files `tools/art/heroes/{rig,grappler,infiltrator,palette,build}.py`
  and `assets/sprites/heroes/*.png`). Read them with
  `git show c7c9555:<path>`, or `git archive c7c9555 tools/art/heroes assets/sprites/heroes | tar -x -C <scratch dir>`.
  **Never check that branch out in your clone.** Take its face build
  (an 8×6 tan muzzle, 2×4 eyes, round masses, head-heavy) and its flat
  `down` poses; not its characters (its orange barrel in a red cone hat
  and its purple-headband infiltrator are not the concept).
- **What the round-2 review measured** (three independent reviewers;
  their screenshots are not in the repository, so here in words):
  - *The grappler is painted in the start room's own wall colours.* Frame
    0 of `assets/sprites/heroes/grappler.png`: after the outline
    `#2b2140` (150 px), the commonest colours are `#8179b8` (104 px),
    `#3f3a66` (78), `#aaa3d8` (60): the castle ramp. `#8179b8` is also the
    commonest colour of `assets/tiles/castle.png` (2,452 px; then
    `#6b64a0`, `#3f3a66`, `#4b4577`, `#938cc6`) and 16–23% of the
    throne-room, graybox-hall and hall-gallery screens. Sideways in the
    throne room his torso merges into the bricks behind him; in a jump in
    the graybox hall his body disappears and only crest, fists and feet
    read: "a lumpy grey block with fists".
  - *His face is about 5×5 px*, his head 6 of his 39 drawn pixels under a
    9 px crest, with no neck: in a silhouette sheet he is a rectangle
    with fists. The king (12 px face), the guard and the shopkeeper all
    have bigger faces than the hero the player controls. His upright
    gold-orange crest reads as a **crown**: in the throne room there are
    two crowns in one frame.
  - *The infiltrator is a 20-px green smear.* Its idle cell's drawn
    box is 21×20 px (measured, `(2, 12, 23, 32)` in a 32×32 cell) and
    lies horizontal in idle, run, carry and hide, leaf ears and scarf
    streaming flat behind; 34% of its pixels are outline; its face is a
    3–4 px patch with 1-px eyes. In a three-player shot in the throne
    room and a two-player upright shot it vanishes next to a crate; held
    and thrown it is a speck; its `down` is the upright figure turned a
    quarter turn and reads as a lump.
  - *Carrying does not read as a hoist.* The carried crate, guard or
    friend sits on the grappler's head, half behind his crest, while his
    fists are spread wide in a "hooray" V touching nothing; with a guard
    held, one arm points forward and the guard looks like he is standing
    on the grappler's head. The concept's 5th pose is the model.
  - *The villain*, second priority: idle 35 px tall against the guard's
    38 and the king's 40, the same 14×28 box as the guard; dressed in the
    undercroft's night ramp (`#343066` alone is 17% of the undercroft
    screen); a face about 5 px wide boxed in by dark hair and collar. On
    the pale street he reads as a dark silhouette; in a dark room he will
    vanish.
- **Bodies** (`content/characters/`, the box is the truth and never
  changes): grappler 18×30 (main draws it in a 56×44 cell), infiltrator
  10×12, flyer 14×20, hero 12×26, villain 14×28.
- **The team** (paths each lane alone may touch) is the table in
  `docs/mechanisms/art-pipeline.md`, "Who is building round 2". Ground,
  props, frame and actors run at the same time as you.
- **How to see your heroes in the running game at iPhone size** (what the
  reviewers did): `npm run dev`; Playwright Chromium
  (`NODE_PATH=/opt/node-tools/node_modules`, `chromium.launch()` with no
  options) with the device `iPhone 14` (upright) and `iPhone 14
  landscape` at 844×390 with the safe-area insets set by
  `Emulation.setSafeAreaInsetsOverride` to left 47, right 47, bottom 21,
  plus 667×375; open `/?room=<a made-up name>` (a private world), wait
  for `window.irreverents.drawn.status === 'online'`, then move your own
  character by setting, on
  `d.world.entities.find(e => e.player === d.player)`, `room`,
  `x = tx*16 + (16 - box.w)/2`, `y = (ty+1)*16 - box.h`. Spots that were
  used: throne-room (9, 14), castle-street (16, 10), graybox-hall (5, 9),
  undercroft (24, 12). Switching hero is the switch button.
- **Tools on hand:** Node 22, Python 3 with Pillow 12 (`python3 -I`),
  Chromium with Playwright. No image generator.

## 3. What to draw

In priority order; ship the first two even if the rest is not reached.

1. **Grappler** (`grappler_spec` in `tools/art/heroes/make.py`, `pix.py`):
   - Body in a darker, bluer slate, like the concept's: none of its fill
     colours may be among the top five colours of `assets/tiles/castle.png`,
     `cellar.png`, `grass-ruins.png` or `town.png`, nor in the castle,
     stone or night ramps. Suggested start: the blue ramp's darks
     (`#263a8c`, `#3c62d0`) greyed toward ink with in-between shades (the
     contract allows those; no new hue), `#5c92f5` only as a rim on the
     lit edge. The ground lane is also calming the castle back wall; do
     not rely on it.
   - Head raised about 3 px and pushed forward of the shoulders, with a
     visible neck dip; head plus muzzle at least 45% of his drawn height.
     A tan muzzle 10–14 px wide, a 2-px dark brow, eyes 2×3 each with a
     light pixel, a mouth that changes by state (gritted in idle, open
     shout in attack and throw).
   - Crest in the orange ramp (`#b0481a` `#e8742a` `#ffa048`) as
     swept-back spikes, never an upright crown.
   - The orange scarf as a 3–4 px band; keep the green shorts and the big
     tan fists; add the concept's brown backpack for the silhouette.
   - `carry` and `carryRun`: both fists together above the head at one
     fixed "hands" point, crest flattened under the load; write that
     point as `carryAt` in `content/sprites/grappler.json` (contract,
     "Round 2 additions"; the actors lane draws the held body there).
     `throw` starts from the same point.
   - `down` hand-drawn: flat on his back, eyes shut, not a rotated idle.
2. **Infiltrator** (`infiltrator_spec`): upright, about 22 px tall (20–24)
   over the unchanged 10×12 box (the contract's new overhang allows up to
   12 px above it and 6 px past each side). Head about 60% of its height,
   a face 8–10 px wide, eyes 2×3 with a light pixel; leaf ears raised up
   and back in a clear V above the head (not flat behind it); goggles
   pushed up on the brow; the scarf one 2–3 px streamer. A hand-drawn flat
   `down` with eyes shut. A `hide` frame crouched low, as the actors lane
   will draw the curtain's front fold over it. `held` and the thrown
   `air` must still show a face.
3. **Flyer**: bigger eyes (2×3 with a light pixel) and nothing else. The
   plain `hero` is not in `content/party.json`: leave it.
4. **Villain**, only once 1 and 2 are pushed (`tools/art/cast/people.py`):
   44–48 px tall with a tall hat or collar overhanging the top of his box
   (the king's crown already overhangs by 8); cape in the purple ramp
   (`#4a2a7a` to `#a070e8`) with red lining and gold trim, a flared,
   theatrical silhouette unlike the guard's post-and-spear; a pale face at
   least 8 px wide with bright eyes, the curled moustache and the white
   gloves kept. A 48×64 cell if needed. Same for the people's `held`
   frames if time allows: legs kicking above the hands.

Run all states, all frames: the contract's state list and the 4/6/4
motion rules still hold.

## 4. Traps

- **Many people push to `main` at once, and a push is the deploy.** Work
  on `main` in your own clone. Push at most twice: every push that touches
  the game restarts the live world for about a minute and the owner may be
  in it. Before pushing: `git pull --rebase origin main`, then build,
  check and e2e again. A conflict in a file outside your paths is
  somebody else's push: never resolve it by editing their file; take
  theirs and re-apply yours.
- **`carryAt` is a new field.** `npm run check` rejects it until the
  actors lane's validator is on `main` (their first push). Until then keep
  drawing; check your files with your own `selfcheck.py`; before your
  push, pull and run the real check. If the field is still rejected, push
  everything else without it (that is your first push), re-pull every
  three minutes for up to thirty, then tell the orchestrator.
- **Shared documents are not yours to edit**: `docs/mechanisms/README.md`,
  `docs/mechanisms/art-pipeline.md`, `docs/architecture.md`,
  `docs/decisions-log.md`, `docs/for-the-lead.md`, `docs/plan/`,
  `docs/understanding-the-project.md`. Everything SOP phase 6 would put
  there goes into **`tools/art/heroes/README.md`** (and
  `tools/art/cast/README.md` for the villain), under "What exists",
  "Deviations from the contract", "Decisions" (the decisions log's
  format, in the owner's terms), "Flags for the lead" and "Not verified".
- **The box is the truth.** Feet on the box's bottom edge, centred on it;
  the picture never draws inside-out of the box. Collision never depends
  on art.
- **Add a selfcheck rule** that fails when a hero's main fill colour is
  among the top five colours of any atlas or backdrop image, so the
  grappler cannot drift back into a wall's colours.
- **Nothing points** (`INTENT:`, `docs/deliberate-designs.md`): no
  sparkle or mark of yours may sit where it could seem to mark a secret.
- **Never weaken, skip or edit a scripted check or its control** to get
  green. If the look breaks a check, fix the look.
- **How to draw.** Deterministic programs (fixed seeds, no clock; the same
  bytes every run), at 1×, whole pixels, the contract's palette. Masks,
  then an outline pass, then shading, then hand-placed pixels for eyes,
  mouths, highlights. Blur, anti-aliasing, gradients inside sprites and
  sub-pixel smears are failures. Previews upscale with NEAREST only.
- **"The code looks right" is not a look.** Open your PNGs (4× previews)
  beside the concept with the Read tool and judge with your eyes, at least
  three separate times, improving after each; then in the running game at
  phone size, on the castle lilac and on the street.
- **Previews are not shipped:** `tools/art/heroes/preview/` is
  git-ignored; a reviewer re-runs `preview.py`.

## 5. Out of scope

- Anything outside your paths, however wrong it looks: write it under
  "Flags for the lead". In particular the effects (props lane), the
  ground and walls (ground lane), where a held body is drawn and how
  rage, hiding and text are drawn (actors lane), the page layout (frame
  lane).
- The simulation, rooms, collision boxes and tuning numbers.
- `docs/vision.md` (a brief never needs it).

## 6. Decided, and open

Decided: everything in section 2 and the contract. Open: nothing a
session should ask the owner. If you would stop to ask, decide from the
owner's words and the concept, mark it `DRAFT:`, write it under
"Decisions" in your notes file, and keep going.

## 7. How it gets verified, and done

`preview.py` writes 4× contact sheets with state labels, animation strips,
a silhouette sheet (all heroes filled black), and a line-up of every hero
and person on the castle lilac, on the street and on the undercroft dark,
at 1× and 4×. Then the running game, locally, at the three phone sizes in
section 2: the throne room with all three heroes, the graybox hall
carrying a crate, the castle street.

Then the pre-push gate in `docs/verifying-and-finishing.md`: `npm run
build`, `npm run check`, `npm run e2e`, all green, after the final
`git pull --rebase origin main`. After the push, wait for the deploy, run
`npm run check:deployed` and `npm run check:live`; if live is broken by
your push, fix forward at once or revert, and say which.

**Done:** the grappler and the infiltrator redrawn as above, pushed and
live; your own before (today's live game) and after screenshots at
iPhone size, upright (390×664, Playwright's `iPhone 14`) and sideways (844×390 with insets),
looked at and kept in `tools/art/heroes/preview/`; the notes file
updated. SOP phase 6 rows this triggers: decisions made without asking
(your notes file, "Decisions"). Do not delete this brief; the
orchestrator does once the lane is reviewed.

## 8. Where questions go

A blocking question goes to the orchestrator, session
`session_017WiGzGp8auJceLEAAh9Aqx` (the address in the header of
`docs/questions-for-the-owner.md`), directly with `send_message` on the
claude-code-remote tools; carry on with everything that does not depend
on the answer. Nothing goes to the owner. Flags go in your notes file,
not your final message. When the lane is pushed and live, send the
orchestrator one message, **"look2 lane heroes done at <commit>"**, plus
at most three lines on what is weakest; your final message says no more
than that.
