# Brief: the look, round 3, lane "props": a tavern, a camp, a quarry, the horn, and a HUD that is pixel art

Written 2026-11-23 by the orchestrator, which runs Step 8 itself
(`docs/plan/step-8.md`, "The look" and "Round 3 (2026-11-23)"). The
reviewer deletes it after review.

## 1. The task, and the measure

Art lane for decoration, working parts, effects and screen furniture.
Furnish the cantina, the Bandit Camp and the quarry; give the quarry's
1×1 hiding spots and the camp's horn a look; draw the effects a tumble,
a dizzy landing and a ringing bell need; redraw the HUD pieces as pixel
art; clean the mottled P01 imports. It moves no numbered row of
`docs/plan.md`'s table; the look is read from screenshots at iPhone size
beside the bar, by a fresh reviewer each round and finally by the owner.

## 2. What is decided (do not redo it)

- **The owner, ~11:11 UTC:** *"It all looks looks like absolute blocky
  shit. Compare to kirby and the amazing mirror and don't stop working on
  it until it looks similar to that. There are assets provided and you
  have the ability to get more."* ~11:30: *"It should play well in
  portrait too."*
- **The bar:** `docs/design-library/03-visual-direction-and-assets/current-pixel-art-explorations/pixel-aesthetic-reference-approved-direction.png`
  (its "UI / Systems" and "Escalating Attention" panels: GBA-style UI,
  outlined, shaded and iconographic, a hero face, framed counters) and
  the two 320×180 previews in `s00-01-gameplay-references-use-now-revise-later/`.
  Similar in craft, never copied.
- **What the review saw** (screenshots are not in the repository):
  - **The cantina** (gap 7): no bar counter, bottles, tables, stools,
    kegs, mugs, lamps or light, no stage at the fighting pads; one shelf,
    the bell post and a stone doorway. `content/decor/` has no
    `cantina.json`. (The ground lane gives it its own tavern theme.)
  - **The Bandit Camp** (gap 2): ab0b34b gave it the courtyard's grass and
    backdrop and nothing else; a camp drawn as the royal courtyard, with
    no tents, palisade or fire, reads as "the courtyard again". No
    `content/decor/outpost.json`.
  - **The quarry** (gap 2): six graybox rooms, walkable from the courtyard
    since 78c4959; its five hiding places are 1×1 parts (depot 3, cave 1,
    pit 1), and `content/looks/parts.json` has only `hide-1x2`,
    `hide-2x2` and their `hide-front-` folds, so they draw as maroon
    blocks. (The ground lane draws its ground and backdrops.)
  - **The horn post** (gap 3): a tan T with a red dash when it sounds.
    `src/client/draw/outpost.ts:28-46` (Step 12's file) already draws the
    looks `signaler`, `signaler-sounding`, `signaler-broken` when they
    exist, bottom-centred on the post over 2×3 tiles, `-sounding` animated
    by the call's ticks.
  - **Overlays read as debug boxes** (gap 11): the brawl's counter strip
    is flat salmon, sage and tan squares (`net.json`'s player colours)
    with "0 KO 0 FALL", nothing saying whose; the street alert is three
    flat circles (`alert-pip`, `alert-pip-off`), one with a red `!`; a
    guard ringing the bell gets a bare red bar over his head.
  - **Mottled imports** (gap 10): the P01 barrels and the courtyard's ruin
    arches came through `tools/art/props/import_p01.py` with their painted
    speckle, blotchy and lower in contrast than the clean art beside them.
  - **A tumble and a landing have no effect** (gap 5): a thrown friend
    flies upright and lands standing; P05 shows spin lines and dizzy stars.
  - **The mood-3 `!` merges with the guard's red plume** (gap 8).
- **Sources** (under `docs/design-library/03-visual-direction-and-assets/current-pixel-art-explorations/`;
  source plates with uneven alpha and irregular cells: isolate, harden
  alpha, map to the master palette, re-ink, test at 320×180):
  `p04-cantina-props-vehicles-hall-visual-source-sheets/cantina-tavern-hub-tileset.png`
  (bar counter, bottle and plate shelves, kegs, round tables, stools,
  lanterns, candle chandelier, banners, stage curtains),
  `p04-.../chibi-pixel-interactables-sprite-sheet.png` (plates, levers,
  bells, chests, gates), `p04-.../chibi-vehicle-and-mount-sprite-sheet.png`
  (an ore cart for a quarry hide);
  `p03-core-heroes-npcs-terrain-and-vfx-visual-source-sheets/pixel-villain-sprite-sheet.png`
  (the horn post: idle, alert, sounding, broken),
  `p03-.../pixel-art-vfx-and-pickup-atlas.png`,
  `p03-.../grassy-ruins-pixel-art-tileset-atlas.png` (rock piles, clean
  vine arches);
  `p05-hud-powers-cantina-brawl-and-secrets-visual-source-sheets/p05-ui-hero-party-hud-source.png`
  and `p05-brawl-hit-ko-respawn-source.png` (spin lines, dizzy stars, KO);
  `p07-first-playable-npc-enemies-mechanisms-terrain-hud-source/irreverents-pixel-ui-atlas.png`
  (HUD icons with the three locked heroes) and
  `p07-.../vibrant-platformer-interactables-sprite-sheet.png`;
  `p08-additional-townsfolk-enemies-building-blocks-biomes-source/colorful-retro-fantasy-tileset-atlas.png`
  (furniture). The asset desk's rule: *"Do not re-generate generic
  inferior art if a strong source here already matches the need."*
- **The contract:** `docs/mechanisms/art-pipeline.md`, all of it
  (decoration layers, `blend: "lighter"` glows with at most three alpha
  levels, the looks table, `hide-front-<w>x<h>`). Your notes so far:
  `tools/art/props/README.md`.
- **New look ids** (round 3, `DRAFT:`; the actors lane draws them when
  present and falls back when not, so either lane can land first):
  `hide-1x1`, `hide-front-1x1`; `signaler`, `signaler-sounding`,
  `signaler-broken`; `fx-speed` (speed lines behind a fast-flying body,
  a strip), `fx-dizzy` (stars circling a head, a strip), `fx-clang`
  (clang lines beside a ringing bell, a strip); `hud-face-<character id>`
  for the three heroes and the cantina's two playable regulars
  (`brawler`, `skirmisher`), about 12×12; `hud-plate` (a framed plate a
  face and a count sit in), `hud-ko`, `hud-fall` (icons);
  `alert-pip` and `alert-pip-off` redrawn as framed bell or eye icons
  that fill (keep the ids); `bell-gauge` (a small outlined gauge frame);
  `bark-edge` (a small chip with an arrow, for a speaker off the screen's
  edge).

## 3. What to build

**Push 1 (the rooms players walk into):**

1. `content/decor/cantina.json` on the back layer: a bar counter with
   bottle shelves (and a mirror) behind it, kegs, two round tables with
   stools, hanging lanterns or a candle chandelier with `lighter` glows,
   a red stage curtain or bunting marking the fighting pads.
2. `content/decor/outpost.json`: tents, palisade stakes, a campfire with
   a glow, a weapons rack. Keep ab0b34b's ground.
3. `hide-1x1` and `hide-front-1x1` (a rock pile or an ore cart), and
   `content/decor/quarry-*.json`: rock piles, timber props, a lantern with
   a glow in the cave and the pit, scaffold posts.
4. The horn: `signaler` (the horn hung on the post), `signaler-sounding`
   (raised to the sky, shaking, with sound lines), `signaler-broken` (a
   splintered top and the horn lying at the foot). The horn only: the
   cast lane draws the post's body as a sprite; line up with it.

**Push 2:**

5. `fx-speed`, `fx-dizzy`, `fx-clang`; `mood-2` and `mood-3` redrawn bold
   enough to read on any hat or plume (a sweat drop or `?`; a red anger
   mark), so a red plume cannot swallow them.
6. The HUD sheet (`assets/ui/hud.png`, looks in `content/looks/ui.json`):
   the faces, `hud-plate`, `hud-ko`, `hud-fall`, the alert pips,
   `bell-gauge`, `bark-edge`. Faces from P07's UI atlas: the canon heroes
   (doc 36: gold cap and blue goggles; green hood; pink aviator cap and
   white wings), never the drifted ones in the game today.
7. `import_p01.py`: cluster each piece to 3–4 tones per material plus the
   ink and run a majority filter to remove isolated speckle before
   re-inking. Raise the courtyard's arches to the near layer's ramp, or
   redraw them from P03 grassy-ruins' clean vine arches.

## 4. Traps

- **A glow sits on a light that is already there**, placed like every
  other decoration, never as a hint (the contract). Nothing points at a
  hiding place or a secret (`INTENT:`, `docs/deliberate-designs.md`).
- **Decoration never covers a person, a door, a working part or the
  fighting pads' floor line**: check with the room's parts and pads
  (`content/rooms/cantina.json`, read only).
- **Look ids are global** across `content/looks/*.json`: one group each.
- **"No number over a hit"** is a scripted check now (`t-no-numbers`,
  7500b81): every string drawn into the game picture is recorded. Your
  icons are pictures, not strings; do not bake digits into a look that is
  drawn over a fight.
- **Do not touch** `content/rooms/`, `content/outposts/`, `content/cantina/`,
  `src/client/draw/cantina.ts` (Step 11) or `outpost.ts` (Step 12), or
  any `src/` file. `assets/ui/touch/` (the touch controls) is not yours.
- **Shared documents are not yours**, except appending your decisions to
  the end of `docs/decisions-log.md`. Notes in `tools/art/props/README.md`.
- **Many people push to `main` at once and a push is the deploy.** `git
  pull --rebase origin main` before each push.
- **"The code looks right" is not a verification.** Look at every room.

## 5. Paths

**Yours alone:** `tools/art/props/`, `assets/props/`, `assets/decor/`,
`assets/fx/`, `assets/ui/` except `assets/ui/touch/`, `content/looks/`,
`content/decor/`, `docs/plan/step-8-shots/round3/props/`.
**Not yours:** `content/sprites/` (heroes, cast), `content/atlases/`,
`content/backdrops/` (ground), every `src/` file, Step 17's files.

## 6. Decided, and open

Decided: section 2. Open: nothing for the owner. Where you would ask,
decide from the bar and the sources, mark it `DRAFT:`, write it down,
keep going.

## 7. Done

- `npm run build`, `npm run check`, `npm run e2e` green after the last
  `git pull --rebase origin main`. Never weaken or skip a fact.
- Pushed to `main` (at most three pushes), live: `npm run
  check:deployed` and `npm run check:live` after each.
- Committed under `docs/plan/step-8-shots/round3/props/` (under 10 MB;
  canvas crops at 2× are fine): before (today's live game) and after at
  iPhone size upright (390×664) and sideways (844×390 with insets
  47/47/21) of the cantina at (12, 9), the camp at outpost (24, 10) with
  the horn sounding, quarry-depot (3, 13) with a hiding spot,
  quarry-cave (12, 12), the courtyard's arches (14, 7), and the HUD
  sheet at 4×. Extend `tools/art/props/shots.mjs` (yours).
- `send_message` to the session on the **Orchestrator:** line of
  `docs/questions-for-the-owner.md`: **"look3 lane props done at
  <commit>"**, plus at most three lines on what is weakest.
