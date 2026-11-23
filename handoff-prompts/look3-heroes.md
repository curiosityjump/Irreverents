# Brief: the look, round 3, lane "heroes": the three canon heroes, re-authored from the owner's P03 sheet

**Landed so far: nothing** (2026-11-23 17:10 UTC: round 2's heroes builder declined this brief at 317k tokens, so it moves to a fresh builder). Its tips: `tools/art/heroes/{grappler,infiltrator}.py` are dedicated `pix.Figure` puppets, easy to replace whole; `selfcheck.py` holds the wall-colour and overhang rules; `preview.py` writes the line-up; its Playwright phone-screenshot recipe is in `tools/art/heroes/README.md`, "Not verified" (touch-tap `[data-action=grab]` for the carry; the keyboard grab doesn't fire on a phone page). **And the owner's rule since 4ed30c3** (`docs/mechanisms/art-pipeline.md`, "Approved Drive assets first"): re-author from the approved Drive sources (doc 36, the P03 sheet, the partial 18-pose extraction), never redraw from words.


Written 2026-11-23 by the orchestrator, which runs Step 8 itself
(`docs/plan/step-8.md`, "The look" and "Round 3 (2026-11-23)"). The
reviewer deletes it after review.

## 1. The task, and the measure

Art lane. Replace all three playable heroes (grappler, infiltrator,
flyer) with native sprites re-authored from the owner-locked P03 canon
sheet: every state the game draws, the same three people in every frame.
It moves no numbered row of `docs/plan.md`'s table (M3 counts build
gates); the look is read from screenshots at iPhone size beside the bar,
by a fresh reviewer each round and finally by the owner.

## 2. What is decided (do not redo it)

- **The owner, ~11:11 UTC:** *"It all looks looks like absolute blocky
  shit. Compare to kirby and the amazing mirror and don't stop working on
  it until it looks similar to that. There are assets provided and you
  have the ability to get more."* ~11:30: *"It should play well in
  portrait too, not just landscape."* ~16:05, re-sharing the P03 sheet:
  *"We already have the playable characters. Remember these."*
- **Canon (controls over everything else, including `heroes-v2` and round
  2's notes):** `docs/design-library/03-visual-direction-and-assets/36-canon-playable-character-designs-preserve-these-three.md`
  (read it all) and its image
  `.../current-pixel-art-explorations/p03-core-heroes-npcs-terrain-and-vfx-visual-source-sheets/pixel-heroes-action-sprite-sheet.png`.
  One family of round, toy-like chibis about two heads tall, big tan
  faces, dot or oval eyes, heavy dark outline, 3–4 tone shading:
  - **top row = grappler:** gold/brown cap, bright blue round goggles, red scarf;
  - **middle row = infiltrator:** leaf-green pointed soft hood, red-magenta scarf, brown satchel and boots;
  - **bottom row = flyer:** pink aviator cap, turquoise goggles, small white wings, yellow scarf.
  Doc 36 names as off-style a red/orange-haired or bulky grappler, a
  spiky-haired infiltrator and a blue/blonde flyer: exactly what is in
  the game now. Similar in craft to Kirby and the Amazing Mirror, never
  copied: no sprite, tile or screen of any game is traced.
- **What the review saw** (screenshots are not in the repository): the
  game's grappler is a navy brawler with an orange spiky crest and a
  backpack, drawn 32×42 in a 56×44 cell (anchor 19,14) over an 18×30
  box, 12 px over his box; the infiltrator is green spiky hair, 20×24
  drawn; the flyer is a light-blue bird with a yellow crest, 21×25. So
  the grappler is about 1.75× his friends, taller than the king and the
  castle street's doorway arches (about 29 px), and his navy sinks into
  the undercroft's and the castle's navy and lilac walls. All four lenses
  judged the rooms close to the bar, which makes the heroes the least
  on-model thing on screen.
- **Sources, in this order:**
  1. `docs/design-library/03-visual-direction-and-assets/p03-canon-hero-extraction-partial/canon-hero-18-poses-partial-v01/`:
     `{grappler,infiltrator,flyer}_00..05.png`, 48×48 RGBA, pivot (24,46)
     (`manifest.json`), the first six columns of the canon sheet,
     separated. Measured: bounding boxes about 37×41, 88–100 alpha
     levels (soft, uneven edges). Its README: *"partial, NOT a completed
     animation deliverable"*. QA picture: `../canon-hero-18-poses-qa-preview.png`.
  2. P01's native strips, already clean (hard alpha, 48 px cells, figure
     about 35 px tall): `.../p01-ruins-starter-kit-playable-prototype/p01-complete/sprites/heroes/scout_7states_48px.png`
     (= the canon top row; recolour its cap to P03's gold/brown) and
     `rogue_7states_48px.png` (= the canon middle row), plus the single
     poses beside them (idle, walk_a, walk_b, crouch, dash, jump, attack).
     Round 2 set them aside as "not our party"; doc 36 overrides that.
  3. The canon sheet itself for the columns the extraction left out
     (strike, rock-lift, hurt, dizzy-down, cheer): crop each by hand.
  4. P07's UI atlas (`.../p07-first-playable-npc-enemies-mechanisms-terrain-hud-source/irreverents-pixel-ui-atlas.png`)
     shows the same three as icons: a check on faces, not a frame source.
- **Heights (`DRAFT:`, the merge of the lenses):** grappler 30–32 px, at
  most 2–3 px over his 18×30 box; flyer about 26 px with wings over 14×20;
  infiltrator 22–24 px over 10×12 (the most the round-2 overhang rule
  allows: 12 px above, 6 px each side). The boxes are the simulation's
  truth and the infiltrator is tiny by a logged decision
  (`docs/decisions-log.md`, 2026-11-23, "fit through a tiny gap"). The
  canon draws all three the same size; one equal height would need the
  boxes or the overhang rule changed, so it is **not** taken: append it to
  `docs/decisions-log.md` as the alternative (what, why, how to undo),
  citing doc 36. Keep each hero's canon proportions (head about 55–60%
  of the height, face at least 10 px wide on the grappler and flyer) at
  its own height; redraw at native size, do not just resample.
- **The contract:** `docs/mechanisms/art-pipeline.md`, all of it
  (palette, the sprite file, overhang, `carryAt`). Round 3 adds two
  optional fields (`docs/plan/step-8.md`, "Contract additions, round 3"),
  validated by the actors lane's first push: a `tumble` state, and
  `carryAtBy` (per-state carry points for `carry`, `carryRun`, `throw`).
  Write them only once `git log origin/main --grep 'round 3, actors'`
  shows that push; until then `npm run check` rejects them.

## 3. What to build

Re-author all three. No new designs.

1. **One import tool** beside `make.py`: `tools/art/heroes/p03.py` (or
   similar) that clean-crops each source pose, hardens the alpha (0 or
   255), quantises to the master palette (an in-between shade is
   allowed, a new hue is not), re-inks a 1–2 px dark outline in `ink`,
   and shades in 3–4 tones. Same bytes every run.
2. **Every state the frame map has today** (keep every key so no code
   changes): `idle`, `run`, `air`, `jump`, `fall`, `attack`, `grab`,
   `carry`, `carryRun`, `throw`, `hurt`, `down`, `held`, `hide`, `talk`,
   `flap`. Map the canon's columns onto them (idle, walk, crouch/sneak →
   `hide` for the infiltrator, jump, alert, strike → `attack`, rock-lift
   → `carry`, hurt, dizzy-down → `down`, cheer → `talk`), and draw what
   the canon lacks to match it: a 6-frame `run` and `carryRun`; `throw`
   as a one-shot (2–3 frames winding back with the hands behind the head,
   one release frame, a held follow-through); `grab` as a one-shot (crouch,
   hands under, heave); `hurt` leaning away from the way he faces (hit
   from the front), with a squint; `down` flattened with dizzy eyes, never
   the standing figure rotated; `held` curled and kicking; the flyer's
   `flap` with the wings beating.
3. **Carry, the signature move.** `carry` and `carryRun` drawn from the
   side, facing the way he moves, the same character as every other
   frame (today's front-facing figure with a face in a box between two
   fists reads as someone else). Set `carryAt` on the top of the fists so
   the load's bottom sits 1–2 px into the hands (the load is drawn after
   the carrier: keep the lower part of the fists visible under it). Once
   the actors lane's first push lands: `carryAtBy` for the throw's
   wind-back and release, and 4 `tumble` frames (a spin) for each hero.
4. **Cells and anchors:** one foot baseline and pivot convention for all
   three (48×48 cells are allowed). `fpsBy` so `run` reads at 12.
5. **Faces act:** oval eyes that change (effort in `grab`, wide in `jump`,
   squint in `hurt`), never a fixed dot.

## 4. Traps

- **Identity is fixed.** If a frame drifts (a different cap, hair showing,
  a bigger body), throw it away and go back to the canon crop. Review
  each new frame beside its canon crop at the same display size, as doc
  36 requires.
- **The overhang rule is the contract.** Measure each frame's drawn box
  against the character's box with a script, not by eye; the infiltrator
  may not pass 12 px above her box or 6 px past a side.
- **Shape before colour:** the grappler is still the broadest of the three
  (on his 18-wide box), the infiltrator the smallest, the flyer the one
  with wings. Do not lean on colour alone at 1×.
- **The grappler on navy and lilac walls:** his gold cap, red scarf and
  tan face must read against the undercroft and the castle halls; check
  those two rooms.
- **`hero.json` and the `hero` sheet** are the old generic hero: leave them.
- **Shared documents are not yours**, except appending your decisions to
  the end of `docs/decisions-log.md`. Notes go in `tools/art/heroes/README.md`
  ("What exists", "Decisions", "Flags for the lead").
- **Many people push to `main` at once and a push is the deploy.** `git
  pull --rebase origin main` before each push; a conflict outside your
  paths: take theirs.
- **"The code looks right" is not a verification.** Look at every frame.

## 5. Paths

**Yours alone:** `tools/art/heroes/`, `assets/sprites/heroes/`,
`content/sprites/{grappler,infiltrator,flyer,hero}.json`,
`docs/plan/step-8-shots/round3/heroes/`.
**Not yours:** `content/characters/` (the boxes), every `src/` file, the
other lanes' paths (`docs/plan/step-8.md`, "Round 3", lane table), and
Step 17's `src/client/main.ts`, `start.ts`, `shell.ts`, `index.html`.

## 6. Decided, and open

Decided: section 2. Open: nothing for the owner. Where you would ask,
decide from doc 36 and the canon image, mark it `DRAFT:`, write it down,
keep going. Note for Step 18 (not your work): the strike rows double as
fight poses.

## 7. Done

- `npm run build`, `npm run check` and `npm run e2e` green after the last
  `git pull --rebase origin main`; e2e run **twice**, because the throw
  and carry facts (`t-throw-friend`, `s-throw-friend`) read the frames you
  change. Never weaken or skip a fact.
- Pushed to `main` (at most three pushes; the first can be the three
  heroes without `tumble`/`carryAtBy`), live: `npm run check:deployed`
  and `npm run check:live` after each.
- Committed under `docs/plan/step-8-shots/round3/heroes/` (keep the set
  under 10 MB; canvas crops at 2× are fine): every new frame beside its
  canon crop at the same display size; before (today's live game) and
  after at iPhone size upright (390×664) and sideways (844×390 with
  insets 47/47/21): the three heroes standing together, a punch, a carry
  of a crate and of a friend, a throw filmstrip. How to place a player:
  `tools/art/tiles/shots.mjs` (copy it into your tools folder). Good
  spots: castle-street (14, 10), throne-room (11, 14), cantina (12, 9),
  undercroft (17, 4).
- `send_message` to the session on the **Orchestrator:** line of
  `docs/questions-for-the-owner.md` (read it after `git pull`):
  **"look3 lane heroes done at <commit>"**, plus at most three lines on
  what is weakest. Blocking questions go there too.
