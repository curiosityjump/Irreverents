# Heroes lane: the party's stand-in sprites

**Reference.** The heroes lane's notes file for Step 8's look work
(`handoff-prompts/look-heroes.md`, contract `docs/mechanisms/art-pipeline.md`).
Written 2026-11-23 by worker session `session_017WiGzG9CHj4TLduQEvdA6K`,
relaunched from the brief after the first heroes agent died with the
previous orchestrator's machine.

## What exists

- `make.py` (`python3 -I tools/art/heroes/make.py`) draws
  `assets/sprites/heroes/{grappler,infiltrator,flyer,hero}.png` and writes
  `content/sprites/<same>.json`. Deterministic: the same bytes on every run
  (checked by md5 across runs).
- `pix.py`: the little rasteriser. A figure is ellipses and capsules with
  depths and palette ramps. A frame is drawn in passes: label masks back to
  front, a clean-up of one-pixel spurs, inner lines where a front part
  begins, cel shading from a top-left light (4 tones per ramp), hand-placed
  pixels (eyes, mouths, blush, lenses), then a 1 px ink outline.
- `make.py` holds one table of poses (`POSES`) for every hero, scaled per
  body (`k`), and four "dressers" that give each hero its silhouette idea:
  - **grappler**: a broad slate bruiser with a barrel chest, huge tan
    fists, an orange spiky crest and an orange scarf trailing behind.
    Cell 56×44, so the punch and the throw fit inside the cell.
  - **infiltrator**: a tiny green imp with two long leaf ears swept back,
    goggles up on its brow, and a long orange scarf whose two ends stream
    behind it.
  - **flyer**: a round blue bird-kid whose arms are white wings, with a
    three-feather gold crest and a small beak. Its wings rest up and back,
    open in the air and beat in `flap`.
  - **hero** (the plain one): a big head, a brown mop of hair, a red tunic,
    a gold belt.
- Every sheet: 8 columns, one state per row, with the contract's frame
  numbers: idle 4 (breathes, blinks on the 4th), run 6 (contact, down, up
  ×2 with bob and arm swing), jump, fall, air, attack 4 (wind-up, strike,
  follow-through, recover), grab 2, carry 2, carryRun 6, throw 3 (heave,
  release, follow-through), hurt 2, down 2 (lying on its back, eyes shut),
  held 2 (flailing), hide 1 (crouched, peeking), talk 2, flap 2. `fpsBy`:
  run and carryRun 12, attack 16, throw and grab 12, flap 10, hurt 8.
- `preview.py` writes 4× contact sheets with the collision box outlined, a
  strip per hero, a silhouette sheet and a 320×180 mock scene to
  `preview/` (git-ignored). `selfcheck.py` checks the files: images exist,
  frames fit and are not empty, every required state, alpha only 0/255,
  the box fits the cell, idle feet on the box's bottom row and centred on
  it.

### Round 2 (2026-11-23, `handoff-prompts/look2-heroes.md`)

Brief by the orchestrator `session_017WiGzGp8auJceLEAAh9Aqx`; drawn by the
round-2 heroes brief-worker (its session is in the commit trailer).

- `grappler.py`: the grappler's own puppet (make.py routes to it). A navy
  slate bruiser (`NAVY`, the blue ramp's darks greyed toward ink) with the
  head raised and pushed forward of the shoulders, a tan muzzle about half
  the head, a 2 px brow, 2x3 eyes with a light pixel, a mouth that changes
  by state (gritted idle, open shout in attack, throw and carry), a
  swept-back orange crest of four spikes, a 4 px orange scarf, green
  shorts, a brown backpack hump and big tan fists. Head plus muzzle is
  19 of 42 drawn rows. `carry`, `carryRun` and `throw[0]` turn him to face
  us with both fists above his head at one hands point, `CARRY_AT`
  (28, 2), arms passing behind the head so the face stays clear (an
  `INTENT:` in the code). `down` is hand-drawn flat on his back, eyes shut.
- `infiltrator.py`: the infiltrator's own puppet. Upright, 23-24 px tall
  over its 10x12 box, head about 60%, a 9 px tan face, 2x3 eyes with a
  light pixel, two broad leaf ears raised up and back in a V with a light
  vein, goggles on the brow, one orange scarf streamer. Hand-drawn `down`
  (eyes shut), a low crouched `hide`; `held` and `air` keep the face.
- Flyer: its eyes moved 1 px back so both are clear of the outline (they
  were 2x4 already; the front one merged into the outline).
- `make.py` writes `carryAt` into `content/sprites/grappler.json` only once
  `src/content/kinds/sprites.ts` knows the field (the actors lane's
  validator); until then the file is as before.
- `selfcheck.py` adds: the main fill colour of each party hero may not be a
  top-5 colour of any atlas or backdrop image; the grappler's body may use
  none of the castle, stone or night ramps; every infiltrator frame stays
  inside its overhang (12 px up, 6 px each side).
- `preview.py` adds `lineup.png` / `lineup-1x.png`: the party and the cast
  on the castle lilac, the street and the undercroft dark.

### Round 3 (2026-11-23, `handoff-prompts/look3-heroes.md`)

**The party is now the owner's canon three (doc 36, the P03 sheet)**; the
round 1 and 2 puppets below are history for the plain `hero` only.

- `p03.py` imports a canon pose: it cuts the figure out of
  `pixel-heroes-action-sprite-sheet.png` as one connected piece (the "!!",
  swirls and sweat marks are separate pieces and drop out; the punch burst,
  the rock, the chest and the coin are cut by rectangle; the blue slash by
  colour), drops the ground shadow, area-averages it down to native size
  with the line work kept apart from the fills (a pixel is `ink` when 40% of
  what it covers is the source's dark lines, `INK_AT`; the fills are averaged
  without the lines, so they stay clean), flattens noise with a mode filter
  (`SMOOTH`), snaps every pixel to the master palette (the faces use two in-between
  shades of the cream and gold hues), hardens alpha to 0/255, despeckles,
  and re-inks a 1 px `ink` outline. Same bytes every run.
- `canon.py` builds the three sheets from the 13 canon columns (0 idle,
  1-2 walk, 3 crouch, 4 jump, 5 ready, 6 alert, 7 strike, 8 brace, 9 lift,
  10 hurt, 11 dizzy-down, 12 cheer) with small native edits: a 1 px bob, a
  breath, a blink, the lift's arms over walking legs, a 1 px lean. Cells
  48x48 for all three, feet on row 45, the box's bottom edge on row 46 and
  centred on x 24; each pose is placed by its head, with one per-hero nudge
  so the idle feet are on the box's middle. Heights: grappler 31, flyer 26,
  infiltrator 23 (`HEIGHT`). `make.py` runs it after drawing the plain hero.
- State map: idle = idle, breath, idle, blink; run = walk A, A up, ready up,
  walk B, B up, ready up (the flyer: A/B only); air = jump, jump stretched;
  attack = brace, strike, strike +1 px, ready; grab = crouch, lift;
  carry = lift, lift breathing; carryRun = the lift's top over the walk's
  legs; throw = lift, lift leaning back, strike, strike +1; hurt = hurt,
  hurt leaning back; down = dizzy-down; held = jump (knees tucked), crouch;
  hide = crouch; talk = idle, cheer; flap = jump, walk A up (the flyer's
  wings beat between them). A `tumble` row (the crouch, turned a quarter at
  a time) is drawn and written to the content file only once the actors
  lane's validator knows the field, as are `carryAtBy` points.
- `carryAt` is (24, top of the fists + 2): the load sits centred over the
  head, as the canon's rock does, 2 px into the fists.
- `shots.mjs` (copied from the ground lane's) plays three pages in one
  private world and shoots page A, the grappler, upright 390x664 and
  sideways 844x390 with insets 47/47/21: the three together in four rooms,
  a punch, carrying a friend and a crate, a throw filmstrip. `shotsheet.py`
  crops them, with every canon crop beside its frame, into
  `docs/plan/step-8-shots/round3/heroes/`.
- `selfcheck.py` now checks every colour of each party sheet against the
  wall ramps (it read the round-2 grappler's `NAVY`).

## Deviations from the contract

- **Grappler cell 56×44**, not 32×32 or 48×48. The contract allows a larger
  cell "when the body needs more". A full-reach punch and the overhead
  heave need the width, and the head crest needs the height. Anchor
  (19, 14).
- **`talk` and `flap` are drawn for all four heroes.** The brief asks for
  `flap` on every hero. On the three without wings it is an arm-flail, and
  only the flyer has the `flap` verb.

## Decisions

- **2026-11-23 (round 3): every pose is cut from the P03 sheet itself, not
  from the 48 px partial extraction.** The extraction is the same sheet's
  first six columns at 0.39x with soft edges; cutting all 13 columns from
  the sheet puts every frame through one downscale, so the same person comes
  out of every column. The extraction stays the reference the QA compares
  with. To undo: point `p03.source` at the extraction's files for columns
  0-5. `DRAFT:`
- **2026-11-23 (round 3): the three heroes keep different heights** (31, 26,
  23 px), not the canon's one size; see `docs/decisions-log.md`. `DRAFT:`

- **2026-11-23: the grappler and the infiltrator follow the owner's shared
  heroes v2 concept** (`docs/art-reference/heroes-v2-chatgpt-concept.png`,
  marked "the look to build to"). A player sees a slate-and-orange bruiser
  and a green long-eared imp with goggles and an orange scarf, not the
  orange wrestler and the purple-headband ninja I first drew. Why: the
  owner shared this as the heroes they liked. The brief also says to stay
  in each hero's colour family, so the grappler keeps orange as its
  accent and the infiltrator stays green. The concept is redrawn natively
  at 1× from parts, not traced. To undo: edit `grappler_spec` and
  `infiltrator_spec` in `make.py`, then re-run it. `DRAFT:`
- **2026-11-23: the flyer is a bird-kid with wing-arms**, and the plain
  hero is a mop-haired kid in a red tunic. Why: the brief's hints were
  wings that rise and fall, and the hero's salmon family. To undo: edit
  that hero's spec. `DRAFT:`

- **2026-11-23 (round 2): the grappler turns to face the player while he
  holds something over his head.** A player sees him hoist a crate or a
  friend with both fists, face to camera, as in the concept's lifting pose;
  side-on, the raised front arm would hide his face. To undo: in
  `grappler.py`, give `carry`/`carryRun`/`throw[0]` `front=False` and side
  `hands`. `DRAFT:`
- **2026-11-23 (round 2): the grappler's body is a navy slate, not the
  castle lilac.** Why: in the castle he vanished into the walls. To undo:
  the `NAVY` ramp in `grappler.py` (the selfcheck refuses wall colours).
  `DRAFT:`

## Flags for the lead

- (Round 3) **The grappler's cap dome is blue, not gold/brown.** Doc 36's
  words say "warm brown/gold cap"; its image, which it says controls, has a
  slate-blue dome under a wide gold goggle band. We follow the image, in the
  master palette's brighter blue, so it is not the walls' navy; at 1x the
  gold band and goggles carry most of the cap.
- (Round 3) **The carry is the canon's own lift pose (column 9), seen
  three-quarter, not side-on as the brief asked.** The canon has no side-on
  carry; drawing one would be a new design. The legs walk under it in
  `carryRun`. Where the rock was cut away the cap's top is flat; the load
  sits there.
- (Round 3) The infiltrator's and flyer's `carry`, `grab` and `throw` use
  the canon's cheer (arms up), since their column 9 is a chest and a coin.
- (Round 3) Faces act only where the canon does: squint in strike, brace
  and hurt, cheerful in cheer, the dizzy-down; the blink is a native edit.
  Wide eyes in `jump` are the canon's own dots.

- (Round 2) Until the actors lane draws a carried body at `carryAt`, today's
  renderer puts it on the box top (cell row 14), i.e. between the raised
  fists and partly behind them. It reads as held, but low.
- (Round 2) The villain (priority 4 of the round-2 brief) was not reached.
- (Round 2) The plain `hero`'s main fill `#b97a40` is a top-5 colour of
  `assets/tiles/town.png`; it is not in the party, so the new colour rule
  skips it.

- `npm run check` on `main` without the foundation commit rejects `fpsBy`
  (`src/content/kinds/sprites.ts` knows only id, image, cell, anchor, fps
  and frames). These files are meant to land with or after the foundation
  commit.
- `down` is drawn by turning the upright figure a quarter-turn onto its
  back. It reads on the grappler and the hero. On the tiny infiltrator it
  is a small blob. A hand-drawn `down` would read better.
- The grappler's attack reaches about 12 px past its box. The renderer's
  `fx-slash` is placed from the box, so the slash and the fist may not
  line up. Worth a look by the actors lane.

## Not verified

- (Round 2) Before/after screenshots (live vs local, iPhone 14 upright,
  844x390 with insets, 667x375; throne room with all three, a crate hoisted,
  the castle street) were looked at and kept in `preview/` (git-ignored),
  taken by a Playwright script in the worker's scratchpad, not in the repo.
- (Round 2) The graybox hall carry: shot in the throne room instead (the
  start room has a crate on its floor).

- On a real iPhone: checked only in Chromium with Playwright's iPhone 14
  sizes, upright and sideways.
- `held`, `hide`, `talk`, `grab` and `throw` in live play: seen only in the
  previews. A sideways screenshot of the real game showed idle and run
  facing both ways, with feet on the floor.
- Whether the look is good enough: that is the owner's call, made by
  playing.
