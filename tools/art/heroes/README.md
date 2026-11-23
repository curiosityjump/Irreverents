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

## Deviations from the contract

- **Grappler cell 56×44**, not 32×32 or 48×48. The contract allows a larger
  cell "when the body needs more". A full-reach punch and the overhead
  heave need the width, and the head crest needs the height. Anchor
  (19, 14).
- **`talk` and `flap` are drawn for all four heroes.** The brief asks for
  `flap` on every hero. On the three without wings it is an arm-flail, and
  only the flyer has the `flap` verb.

## Decisions

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

## Flags for the lead

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

- On a real iPhone: checked only in Chromium with Playwright's iPhone 14
  sizes, upright and sideways.
- `held`, `hide`, `talk`, `grab` and `throw` in live play: seen only in the
  previews. A sideways screenshot of the real game showed idle and run
  facing both ways, with feet on the floor.
- Whether the look is good enough: that is the owner's call, made by
  playing.
