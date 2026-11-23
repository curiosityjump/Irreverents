# The cast's pictures: king, guard, shopkeeper, villain, crates, dummies, throne, the cantina's regulars, the Bandit Camp

**Reference.** Open before redrawing or replacing anything under
`assets/sprites/cast/` or the nine `content/sprites/` files named below.

`DRAFT:` the notes file of Step 8's look lane "cast"
(`handoff-prompts/look-cast.md`), written 2026-11-23. The contract is
`docs/mechanisms/art-pipeline.md`; the orchestrator moves the items below
to their homes.

## What exists

- **Nine sheets, drawn by a program**, each wired in by
  `content/sprites/<id>.json`: `king`, `guard`, `shopkeeper`, `villain`,
  `crate`, `crate-heavy`, `dummy`, `dummy-heavy`, `throne`. Delete a
  content file and that body is a plain rectangle again.
- **Run** `python3 -I tools/art/cast/make.py`: rewrites the nine PNGs and
  the nine content files, the same bytes every run (no clock, no random
  numbers). It stops with a message if any frame would not fit its cell.
- **Look** `python3 -I tools/art/cast/preview.py`: writes 4× pictures to
  `tools/art/cast/preview/` (git-ignored): `sheet-<id>.png` (every state,
  labelled, with the collision box drawn on the first frame),
  `moods.png` (the three moods of each person, idle over run), and
  `scene.png` (a 320×180 mock throne room).
- **Check** `python3 -I tools/art/cast/selfcheck.py`: the lane's own
  check of the nine files (image there, frames inside it, required
  states, the box on the cell's bottom and centred, alpha 0 or 255). `npm
  run check` now covers most of it; this one also knows which states the
  brief asked for.
- **How it is drawn** (`px.py`): a picture is an ordered list of parts,
  each a set of whole pixels with a colour ramp. Leaning, rotating and
  squashing happen to the parts first; shading (light from the top-left)
  and the 1 px ink outline are computed last, so a figure lying on its
  back is still lit from above. `people.py` holds the four people (a
  builder each, and one shared table of poses with each person's own
  touches on top); `things.py` holds the five things.
- **Who they are, as drawn:**
  - **King**: a red pear of robe with an ermine hem and collar, a white
    beard and moustache, a round red nose, and a crown a size too big
    that tilts and lags behind what he does. He talks with a flapping
    mouth and a sweeping arm, eyes shut in self-regard. Knocked flat, the
    crown comes to rest on his belly.
  - **Guard**: a kettle helmet with a red crest, a blue tabard with a
    gold diamond, a spear taller than he is. Enraged, the spear comes
    level.
  - **Shopkeeper**: small and round, a teal smock under a pale apron,
    orange hair in a bun that bounces.
  - **Villain**: a purple cape with a high collar and red lining,
    swept-back dark hair, a curled moustache and pointed beard, white
    gloves. He preens at ease and throws an arm up when he talks.
  - **Crate** wood with a brace; **heavy crate** iron-bound planks;
    **dummy** a sack on a post with stitched-cross eyes and straw;
    **heavy dummy** a quilted barrel with a painted target and a scowl;
    **throne** gilded, red cushion, padded back.
- **States.** People: `idle` (8), `run` (6), `air` (2, also named `jump`
  and `fall`), `hurt` (3, ending on a flail because a body in flight is
  drawn as hurt and holds the last frame), `down` (2), `held` (4), `talk`
  (8), and for the guard and the villain `attack` (4). Moods `"2"` and
  `"3"` each have `idle`, `run` and `talk`. Things: `idle`, `run` (the
  same frame), `air`, `hurt`; the dummies also `down`.
- **Cells.** 48×48 for the four people, the heavy dummy and the throne;
  32×32 for both crates and the dummy.

### Round 2: the villain (2026-11-23, `handoff-prompts/look2-heroes.md` 3.4)

Redrawn by the round-2 heroes brief-worker at the orchestrator's request.
44 px tall in idle (his box is 14x28): a tall purple top hat with a red
band overhangs the box's top by 16 px; a high red collar edged in gold
flares up beside his head; a purple cape with a red lining and a gold hem
flares wide behind him (a theatrical triangle, unlike the guard's post and
spear); a plum coat and boots. His face is pale, 11 px wide and clear of
hair (a slick of hair behind the ear only), with arched brows, the curled
moustache and the white gloves kept. No colour of the night ramp, so he
does not sink into the undercroft.

### Round 3: cut from the art desk's source sheets (2026-11-23, `handoff-prompts/look3-cast.md`)

- **Five more sheets, cut from the plates, not drawn**: `brawler`,
  `skirmisher`, `outpost-fighter`, `outpost-lookout`, `signal-post`
  (before round 3 each was its `color` box). `make.py` writes them after
  the nine above; `source.py` does the cut (crop, alpha >= 128, the
  plates' purple ground shadow and floating effects dropped, a colour
  vote down to the scale with ink voting a little louder, every colour
  snapped to the master palette, the silhouette re-inked); `cut3.py`
  holds which plate rectangles each person is made of and how each
  state's frames are made from them (lift, breathe, lean, red face,
  sweat drop). `compare.py <dir>` puts each sprite beside its source.
  `shots.mjs` takes the iPhone-size shots (`docs/plan/step-8-shots/round3/cast/`).
- **Who, from where:**
  - `brawler`: P04 cantina sheet row 3, the bald strongman (crossed arms,
    two walk poses, fists-up with a sweat drop, the punch, the yell, KO).
    Drawn about 34 px tall at scale 0.175; cell 56x48; `carryAt` (28, 13).
  - `skirmisher`: P04 row 2, the feathered-hat patron with the beer
    (idle, cheer, side-eye, punch, knocked flying, KO with swirl). About
    27 px tall at 0.15; cell 56x48; `carryAt` (28, 22).
  - `outpost-fighter`: P07 enemy sheet row 1, the red-hooded bandit with
    the dagger (12 poses incl. slash, hurt, dizzy, KO). Scale 0.32, about
    30 px; cell 56x48.
  - `outpost-lookout`: P07 enemy row 2, the purple-hooded signaller with
    the feather and the horn. Scale 0.285, about 30 px; cell 56x48. Its
    `attack` is raising and blowing the horn (it has no attack verb; the
    state is there if one is ever given).
  - `signal-post`: P03 villain sheet row 4, the horn post with both horns
    erased: the red lamp, the cap, the pole, the castle banner, the stone
    base. 33 px tall over its 10x32 box, cell 32x48; `idle` (= `run`,
    `air`) only. **The horn's peg** (for the props lane's `signaler`
    looks): the cap's underside, about 10 px below the box's top, either
    side of the pole.
- **States** for the four people: `idle` 4, `run` 6, `air` 2 (`jump`,
  `fall`), `attack` 4, `hurt` 3, `down` 2, `held` 4, `talk` 2, `grab` 1,
  `carry` 2, `carryRun` 4, `throw` 3 (the fighter and lookout have no
  grab/carry/throw: they cannot grab). Moods `"2"` and `"3"` each have
  `idle`, `run`, `air`, `attack`, `hurt`, `held`, `talk`, and `down`
  naming the normal knocked-out frames. Mood 2 idle/talk use the plate's
  own worried pose where it has one (the brawler's fists-up with the
  plate's own sweat drop, the patron's side-eye, the bandits' alert
  pose); the other mood-2 states are the normal frames with a sweat drop
  added beside the head. Mood 3 is a red face: the skin in the head's
  band recoloured to the red ramp (the costume unchanged), on the yell
  or ready pose for idle.

New ids for the contract's cast list: `brawler`, `skirmisher`,
`outpost-fighter`, `outpost-lookout`, `signal-post` (sprite files and
`assets/sprites/cast/<id>.png`).

## Deviations from the contract

- **The shopkeeper's cell is 48×48**, though its body would fit 32×32:
  its raised arms and leaning-in frames did not.
- **The king's crown stands about 8 px above his collision box** (the
  contract says "a few pixels"). The brief asks for a too-big crown; the
  box is unchanged and stays the truth.
- **The guard's spear overhangs the box** by up to 9 px above and, when
  levelled, about 13 px ahead. It is picture only: it hits nothing.
- **`run` for things names the idle frame** rather than drawing a second
  one (a crate sliding looks like a crate).
- **Skin has a fourth, in-between tone** (cream toward white) for
  highlights, and straw and sacking are made from the wood, gold and
  cream ramps: in-between shades, no new hue.
- **Lit-side outlines are plain ink**, not a dark shade of the fill, so
  the cast reads against both the lilac interior and the outdoor street.
- No `carry`, `throw`, `grab`, `hide` or `flap` for the round-1 people:
  the renderer's fallbacks cover them. (Round 3's playable brawler and
  skirmisher have `grab`, `carry`, `carryRun`, `throw` and `carryAt`.)
- **Round 3's people are wider than their boxes**: the chibi plates are
  as wide as tall, so the brawler is about 30 px over an 18 px box and the
  patron about 24 over 12; a punch reaches about 14 px past the box. The
  skirmisher's feathered hat stands about 9 px above its 18 px box. Height
  and feet follow the box; the box stays the truth.

## Decisions

### 2026-11-23 · What the king, guard, shopkeeper and villain look like
- **Decided by:** Step 8 look lane "cast"
- **Instead of asking:** "what should each of these people look like?"
- **Why this way:** the brief's words (the king pompous and round with a too-big crown and a robe; the guard upright with helmet and spear; the shopkeeper small and aproned; the villain tall, caped and theatrical in purples), drawn as original round figures in the contract's palette. Each differs by shape first: a pear, a post with a pole, a small ball, a tall triangle of cape.
- **To change it:** edit that person's builder in `tools/art/cast/people.py` and re-run `make.py`; or point `content/sprites/<id>.json` at a delivered sheet.
- **Where:** `tools/art/cast/people.py`.

### 2026-11-23 · How the three moods are told apart
- **Decided by:** Step 8 look lane "cast"
- **Instead of asking:** "how should a player see that someone is unsettled or enraged?"
- **Why this way:** at ease a person breathes and blinks. Unsettled, their eyes go wide and dart back and forth, their hands come up, they lean back, and a sweat drop slides down beside the head. Enraged, the face goes red, the brows come down, the teeth show, they lean in and stamp, and the guard levels his spear. Each is visible in the silhouette and the colour, not only in the face.
- **To change it:** the `idle2`, `run2`, `talk2`, `idle3`, `run3`, `talk3` pose lists in `anims()` in `tools/art/cast/people.py`.
- **Where:** `tools/art/cast/people.py`.

### 2026-11-23 · A flattened king's crown lands on his belly
- **Decided by:** Step 8 look lane "cast"
- **Instead of asking:** "where does the crown go when the king is knocked down?"
- **Why this way:** he lies on his back, as long as his cell is wide, so the crown has nowhere to roll; resting on the belly is the funnier picture and stays inside the cell.
- **To change it:** the `hatoff` branch at the end of `king()` in `tools/art/cast/people.py`.
- **Where:** `tools/art/cast/people.py`.

- **2026-11-23 (round 2): the villain wears a tall top hat and flares a
  purple cape.** A player sees a tall, theatrical showman in purple, red and
  gold, the tallest person in a room. Why: the round-2 review found him
  shorter than the guard and lost in dark rooms; the brief asks for 44-48 px
  with a tall hat or collar. To undo: `villain()` in `people.py`. `DRAFT:`

## Flags for the lead

- (Round 3) **No walk poses on the patron's plate**, so the skirmisher's
  run is its idle and side-eye poses leaned forward and bobbing: it
  slides more than it steps. The brawler and the two bandits walk with
  the plates' own walk poses.
- (Round 3) The props lane's `signaler` (76791bf) hangs its horn on the
  post's cap; seen lined up in the Bandit Camp at 844x390. The sounding
  horn over the post is not yet seen in a shot.
- (Round 3) `tumble` and the curled, kicking `held` wait for the actors
  lane's validator (`git log origin/main --grep 'round 3, actors'`, empty
  at this push); `held` is the hurt pose wiggling.
- (Round 3) Step 16's `heavy-fighter` and `brute` are not on `main`
  (`content/characters/` has neither), so they are not cut yet.

- (Round 2) The villain's `held` frames were not redrawn with legs kicking
  above the hands (the brief's "if time allows").

- **The king's speech ribbon covers his crown** in the throne room,
  sideways view (seen in a local screenshot at 844×390): the ribbon sits
  just above his collision box and the crown stands 8 px above it. The
  ribbon's place is the actors lane's (`src/client/draw/audience.ts`);
  raising it by about 10 px would clear the crown.
- **The actors lane also tints an enraged person's sprite red.** The cast
  already has red-faced mood-3 frames, so the two stack; it still reads,
  but one of them may be enough.
- **`.gitignore` does not ignore `__pycache__`.** `make.py` turns
  bytecode writing off for itself; `preview.py` and `selfcheck.py`
  import nothing of the lane's and leave none.
- **The villain is the weakest of the four**: dark hair and dark clothes
  close together, so his face is small; and at 28 px he is no taller than
  the guard (the collision boxes are the same height).
- **The dummies read as soft toys more than training dummies** at 1×;
  a helmet or a wooden shield on the heavy one would help.

## Not verified

- On a real iPhone: only Chromium at 844×390, sideways.
- Upright (portrait) view: not looked at with the cast in it.
- `down`, `held`, `hurt`, `talk` for people and `air`/`hurt` for things
  in the running game: seen in the contact sheets only. In the game the
  king talking and idle, the guard and villain idle, both crates and the
  throne were seen standing on the floor, centred on their boxes.
- Moods 2 and 3 in the running game (nobody was provoked); seen in
  `moods.png` and the mock scene.
- The dummies in the running game (they stand in rooms not visited).
