# Brief: the look, round 3, lane "cast": no person is a rectangle, and the town's people join the heroes' family

Written 2026-11-23 by the orchestrator, which runs Step 8 itself
(`docs/plan/step-8.md`, "The look" and "Round 3 (2026-11-23)"). The
reviewer deletes it after review.

## 1. The task, and the measure

Art lane. Draw the five kinds that are still flat colour boxes, then
re-author the town's four people (guard, king, shopkeeper, villain) in
the canon heroes' round, big-faced family, all from the owner's P03, P04,
P07 and P08 source sheets. It moves no numbered row of `docs/plan.md`'s
table (M3 counts build gates); the look is read from screenshots at
iPhone size beside the bar, by a fresh reviewer each round and finally by
the owner.

## 2. What is decided (do not redo it)

- **The owner, ~11:11 UTC**, with an iPhone screenshot where every
  character was a flat rectangle: *"It all looks looks like absolute
  blocky shit. Compare to kirby and the amazing mirror and don't stop
  working on it until it looks similar to that. There are assets
  provided and you have the ability to get more."* ~11:30: *"It should
  play well in portrait too."* `docs/plan/step-8.md` names plain
  rectangles anywhere a player looks as a failure of this step.
- **The bar:** `docs/design-library/03-visual-direction-and-assets/current-pixel-art-explorations/pixel-aesthetic-reference-approved-direction.png`
  ("NPC Reactions": a red face and an anger mark, the costume unchanged)
  and the two 320×180 previews in `s00-01-gameplay-references-use-now-revise-later/`.
  The heroes are owner-locked to P03's three rows (doc 36,
  `36-canon-playable-character-designs-preserve-these-three.md`); the
  heroes lane is re-authoring them now, so the cast must sit beside round
  toy chibis: head 55–60% of the height, warm tan faces, heavy outline,
  3–4 tone shading. Similar in craft, never copied from any game.
- **What the review saw** (screenshots are not in the repository):
  - **Rectangles.** `content/sprites/` has 13 files and none for
    `brawler` (pink `#ff8fab` 18×28 box), `skirmisher` (yellow `#ffd60a`
    12×18), `outpost-fighter` (14×28), `outpost-lookout` (12×26) or
    `signal-post` (10×32). `src/client/draw/entities.ts:108-121` draws
    each as its `color` box with a one-pixel eye. In the cantina a pink
    box stands beside the hero at spawn and the brawl's star lands on a
    rectangle; at the Bandit Camp the hero stands among orange, brown and
    maroon blocks and a tan post.
  - **The town cast is another family.** The guard, king, shopkeeper and
    villain are tall and thin: heads 35–40% of their height, faces 5–7 px
    under a helmet, hair or hat, thin outlines, stick limbs. Their moods
    do differ (round 2's gap 13 is closed: raised arms and a `?` at mood
    2, a red face under a red `!` at mood 3), but on a small face; the
    mood-3 `!` merges with the guard's red plume. Knocked down is the
    standing figure turned 90° (`tools/art/cast/people.py`, `F.rot90` at
    :141 and :277): a stiff plank with the spear across it. Moods 2 and 3
    in every sprite file hold only `idle`, `run`, `talk`, so an enraged
    guard who attacks, is hurt, flies or is held draws calm frames. The
    king reads well (crown, beard).
- **Sources** (all under `docs/design-library/03-visual-direction-and-assets/current-pixel-art-explorations/`;
  1448×1086 AI-illustrated source plates with uneven alpha, irregular
  cells, antialiased borders: never import raw):
  - `p04-cantina-props-vehicles-hall-visual-source-sheets/cantina-npc-sprite-sheet.png`:
    a bald strongman (idle, walk, guard, punch, angry, KO) → **brawler**;
    a feathered-hat patron or the bard → **skirmisher** (small, for 12×18).
  - `p03-core-heroes-npcs-terrain-and-vfx-visual-source-sheets/pixel-villain-sprite-sheet.png`:
    hooded grunt with a dagger swing → **outpost-fighter**; a grunt
    variant with a horn or spyglass → **outpost-lookout**; the horn post
    (idle, alert, sounding, broken) → the **signal-post** body; a horned
    brute with a hammer → Step 16's **brute**; the purple horned-hood
    villain (see the villain below).
  - `p03-.../retro-town-npc-sprite-sheet.png`: the guard, the king, the
    headscarf townswoman → **shopkeeper**; worried faces with a sweat
    drop, angry with red steam, a flattened `xx` KO with a swirl.
  - More of the same family, synced at 0372804:
    `p07-first-playable-npc-enemies-mechanisms-terrain-hud-source/colorful-chibi-npc-sprite-sheet.png`,
    `p07-.../chibi-enemy-animation-sprite-sheet.png`,
    `p08-additional-townsfolk-enemies-building-blocks-biomes-source/vibrant-chibi-townsfolk-sprite-atlas.png`,
    `p08-.../chibi-enemy-animation-sprite-atlas.png` (bandits, signalers,
    heavy armoured → Step 16's **heavy-fighter**).
  - `p05-hud-powers-cantina-brawl-and-secrets-visual-source-sheets/p05-brawl-hit-ko-respawn-source.png`:
    KO and dizzy poses.
  The asset desk's own rule: *"Do not re-generate generic inferior art if
  a strong source here already matches the need."*
- **The villain (`DRAFT:`):** keep him at least as tall as round 2 made
  him (about 44 px; round-2 gap 15, closed) and keep the top-hat
  silhouette that closed it; lend him P03's cape, colours and glowing
  eyes. The P03 horned hood is the alternative: append it to
  `docs/decisions-log.md` as a swap in `villain()` in `people.py`. Doc 36
  does not lock the villain.
- **The contract:** `docs/mechanisms/art-pipeline.md`, all of it. Round 3
  adds an optional `tumble` state (`docs/plan/step-8.md`, "Contract
  additions, round 3"), validated by the actors lane's first push: write
  it only once `git log origin/main --grep 'round 3, actors'` shows it.

## 3. What to build

For every kind: clean-crop from the source, threshold the alpha to 0 or
255, map to the master palette, re-ink a 1 px `ink` outline, normalise
to the cast's cells (48×48 is allowed) and a foot anchor, and test at
320×180. Body plan: head at least half the height, face at least 10–12 px
wide.

1. **First push, the five rectangles** (the owner's literal complaint):
   `brawler`, `skirmisher`, `outpost-fighter`, `outpost-lookout`,
   `signal-post`. Each person: `idle`, `run`, `air`, `attack` (the
   brawler's punch, the grunt's dagger thrust), `hurt`, `down`, `held`,
   `talk`, and mood-2 and mood-3 lists for each of those. The brawler and
   the skirmisher can now be **played** (Step 11's swap, 49a5e53; their
   verbs include `grab`), so give them `grab`, `carry`, `carryRun`,
   `throw` too, and `carryAt`. The signal post: the post's body only
   (`idle`); the props lane draws the horn over it as the looks
   `signaler`, `signaler-sounding`, `signaler-broken`, which
   `src/client/draw/outpost.ts:44-46` draws bottom-centred on the post
   over 2×3 tiles. Line the two up with that lane (the horn hangs on your
   post's peg).
2. **Then the town's four, re-authored** from P03 (and P07/P08): guard,
   king, shopkeeper, villain. Map the sheets' faces onto the mood lists:
   mood 2 worried (sweat drop, open mouth); mood 3 angry brows, with
   space left above the head for the props lane's rage mark clear of
   plumes and hats; `hurt` a squint and a recoil leaning away from the
   hit; `down` a squashed flat body with `xx` eyes and a swirl, never a
   rotation; ringing the bell, a bigger swing. **Mood-3 frames for
   `attack`, `hurt`, `air` and `held` too.** Keep the guard's spear
   thrust and swing rows: guards now have the real attack verb (Step 12
   slice B, 1512e1f). Do not bring back the rage wash.
3. **Step 16's `heavy-fighter` and `brute`** (P08 heavy armoured; P03
   horned brute with the hammer), same contract, once their
   `content/characters/*.json` are on `main` (Step 16 slice 2,
   `handoff-prompts/step-16-b-quarry-enemies.md`). Until then, keep the
   sheets in your tool's output and do not wire them: the check rejects a
   sprite file whose name is not a character.
4. **Once the actors lane's first push lands:** `tumble` frames (a spin,
   4 frames) for every person, and `held` curled and kicking.
5. Add every new id to your notes, for the orchestrator to fold into the
   contract's cast list.

## 4. Traps

- **Sprites attach as data**: `content/sprites/<character id>.json`, drawn
  by kind id. Nothing in `content/characters/` changes (box, colour,
  name, verbs are other steps').
- **The box is the truth.** The picture may overhang by a few pixels
  (hats, a crown, a spear), never be smaller than the box. Measure with a
  script.
- **The moods must differ at phone size.** The actors lane is adding the
  first scripted check that crops the same guard at moods 1, 2 and 3; it
  will fail if two moods look alike. Read it before your last push.
- **`PlayerView.drawn` and every e2e fact stay as they are.** Never weaken
  a fact.
- **Shared documents are not yours**, except appending your decisions to
  the end of `docs/decisions-log.md`. Notes go in `tools/art/cast/README.md`
  ("What exists", "Decisions", "Flags for the lead").
- **Many people push to `main` at once and a push is the deploy.** `git
  pull --rebase origin main` before each push.
- **"The code looks right" is not a verification.** Look at every frame.

## 5. Paths

**Yours alone:** `tools/art/cast/`, `assets/sprites/cast/`,
`content/sprites/{king,guard,shopkeeper,villain,crate,crate-heavy,dummy,dummy-heavy,throne,brawler,skirmisher,outpost-fighter,outpost-lookout,signal-post,heavy-fighter,brute}.json`,
`docs/plan/step-8-shots/round3/cast/`.
**Not yours:** the heroes' sprite files, `content/looks/` (props),
`content/characters/`, `content/npcs/`, `content/outposts/`,
`content/rooms/`, every `src/` file (`outpost.ts` and `cantina.ts` are
Steps 12 and 11's), Step 17's files.

## 6. Decided, and open

Decided: section 2. Open: nothing for the owner. Where you would ask,
decide from the sources and the bar, mark it `DRAFT:`, write it down,
keep going. Note for Step 18 (not your work): the punch, thrust and
hammer rows are its fight poses.

## 7. Done

- `npm run build`, `npm run check`, `npm run e2e` green after the last
  `git pull --rebase origin main`. Never weaken or skip a fact.
- Pushed to `main` (at most three pushes; the five rectangles first),
  live: `npm run check:deployed` and `npm run check:live` after each.
- Committed under `docs/plan/step-8-shots/round3/cast/` (under 10 MB;
  canvas crops at 2× are fine): each new sprite beside its source crop at
  the same display size; before (today's live game) and after at iPhone
  size upright (390×664) and sideways (844×390 with insets 47/47/21): the
  cantina's regulars at cantina (12, 9), the Bandit Camp at outpost
  (24, 10) with the horn sounding, the guard at moods 1, 2, 3 and knocked
  down at castle-street (14, 10), the king at throne-room (11, 14). How to
  place a player: `tools/art/tiles/shots.mjs`.
- `send_message` to the session on the **Orchestrator:** line of
  `docs/questions-for-the-owner.md`: **"look3 lane cast done at
  <commit>"**, plus at most three lines on what is weakest.
