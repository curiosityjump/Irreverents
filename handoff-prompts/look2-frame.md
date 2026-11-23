# Brief: the look, round 2, lane "frame": the game fills the phone, sky above, ground below, light and depth

Written 2026-11-23 by the orchestrator, which runs Step 8 itself
(`docs/plan/step-8.md`, "The look" and "Round 2 (2026-11-23)").
The reviewer deletes it after review.

**Landed so far** (2026-11-23 15:40 UTC; held by builder
`session_017WiGzGaGuR297NUCFSpVDU`): push 1, 2d34418; push 2, 06180df. Check
`git log --oneline origin/main --grep 'round 2, frame lane'` before building.

## 1. The task, and the measure

Code lane for the page and the world's drawing. Held sideways, make the
game fill the phone with see-through controls over it and frame it about
320×180, with the camera keeping the floor and the player clear of the
controls. Paint sky above and ground below a room that is shorter than
the view, instead of slabs of wall. Draw the contract's round-2 additions
for ground, backdrops and decoration: `deep`, `regions`, `outside`, a
layer's `pin` and `front`, a decor item's `blend` (glow).

It moves no numbered row of `docs/plan.md`'s table (M3 counts build
gates). The look is read from screenshots of the real game at iPhone size
beside the owner's references, by a fresh reviewer each round and finally
by the owner (`docs/plan/step-8.md`, "Feedback signal for the look").

## 2. What is already measured and decided (do not redo it)

- **The owner, 2026-11-23 ~11:11 UTC, first-hand, with an iPhone
  screenshot of the game held upright as a thin strip at the top of a
  near-black page:** *"It all looks looks like absolute blocky shit.
  Compare to kirby and the amazing mirror and don't stop working on it
  until it looks similar to that. There are assets provided and you have
  the ability to get more."* And ~11:30 UTC: *"It should play well in
  portrait too, not just landscape. Looks awful in both right now"*.
  And (`CLAUDE.md`) **iPhone first**: every action works by touch through
  a few context-sensitive controls.
- **The bar**, under
  `docs/design-library/03-visual-direction-and-assets/current-pixel-art-explorations/`:
  `pixel-aesthetic-reference-approved-direction.png`, the two
  `s00-01-gameplay-references-use-now-revise-later/*-phone-320x180-preview.png`,
  and P01's `p01-ruins-starter-kit-playable-prototype/p01-complete/preview/gameplay_320x180.png`
  and `gameplay_4x.png` (`manifest.json` `nativeGameplayView` 320×180):
  no side panels anywhere; sky to the top edge; a band of ground under the
  feet in about the bottom 20%; heroes about 42 px of 180 (23% of the
  height; ours are 10–19%).
- **Similar to, never copied from**: the likeness is in the craft, on
  original designs.
- **The contract is `docs/mechanisms/art-pipeline.md`, read it in full,
  including "Round 2 additions"**: the fields you validate and draw are
  defined there; follow their names and shapes exactly, because the
  ground and props lanes are writing them right now from the same text.
  Round 1 landed world at 82fe89b and shell at ac6509b; their notes are
  `docs/mechanisms/rendering-world.md` and `phone-shell-look.md`.
- **Decided: sideways, controls over the picture on every touch iPhone**
  (`docs/decisions-log.md`, 2026-11-23, "Held sideways, the game fills
  the phone"). It replaces a `DRAFT:` of ours, not the owner's rule: the
  owner's library says only *"UI should not cover secret entrances or
  enemies"* (doc 33, quoted in `docs/plan/step-5.md`, "Controls never
  hide the game"), and that rule is kept by the camera clearance below and
  a check that proves it.
- **What the round-2 review measured** (three independent reviewers;
  screenshots not in the repository, so here in words):
  - *Sideways the game is a box between two navy bars.* Playwright's
    `iPhone 14 landscape` (750×340 CSS): the picture spans x 255–1245 of
    1500 device px (66%); the left bar holds only two arrows and is about
    75% empty. At 844×390 with the notch insets and at 667×375 the
    overlay is chosen instead, at scale 4 instead of 3: every sprite a
    third bigger. Cause: `src/client/shell.ts`, the sideways branch,
    `if (sBars >= sOver)` (a tie goes to the bars) with
    `SIDEWAYS = { wMin: 288, wMax: 400, hMin: VIEW_H (180), hMax: 225 }`;
    `UPRIGHT = { wMax: 264, wMin: 192, hMax: 256 }`. **Calculated, not
    seen on a phone:** a real iPhone 14 in Safari with
    `viewport-fit=cover` is about 844×340 CSS with insets 47/47/0/21 at
    DPR 3; both modes come out at 5×, the tie picks bars, 296×204 game px,
    a picture 493 pt wide on 844: 58%.
  - *The camera shows more world than the bar.* Sideways views 329×225 at
    DPR 2 and 296×204 at DPR 3: 13–14 tiles tall against the bar's 11.25.
    Drawn heights from frame 0: grappler 39, infiltrator 20, flyer 25,
    king 40, guard 38, shopkeeper 29, villain 35. The infiltrator works
    out at about 33 pt, 5 mm, on an iPhone 14.
  - *Half the outdoor picture is wall outside the room.* Rows with no sky:
    courtyard upright 55–56%, sideways 48–50% (flat brick above and
    below); castle street rows nearly all beige plaster: upright 30–31%,
    sideways 20–22%, with notch 8%. Causes: `roomOrigin` in
    `src/client/draw/room.ts` centres a room shorter than the view
    (`Math.floor((view - roomSize) / 2)`); past the room's edge the
    renderer continues the nearest ground (`rendering-world.md`, "Past
    the edge"); `courtyard` (30×9, 144 px) and `castle-street` (48×12,
    192 px) have a solid row 0 and a solid bottom row. Upright the view is
    capped at 256 tall. Refuted: the far and mid layers do show upright;
    the fill crowds them.
  - *Overlay controls sit on the floor line.* At 667×375 in the castle
    street the grab button covers the villain's feet and two barrels and
    the left arrows cover an arched doorway and the red curtain; in the
    throne room the hand and attack buttons cover the knight statue and
    the curtain exit; the right-hand cluster climbs to about 60% of the
    height, the switch button floats over rooftops. `shell.ts`'s overlay
    branch already says `DRAFT ... To reconsider: the camera keeping the
    player clear of them`. The plates paint a pale fill over the scene.
    Measured by `scripts/e2e/phone.ts`: the see-through layout paints
    2.62% (667×375) and 0.90% (736×414) of the view; `PAINT_LIMIT` is 3%.
  - *No depth and no light* (the ground and props lanes are drawing the
    pictures): nothing is ever drawn in front of the action, and
    `src/client/draw/` has no glow or light code.
- **The check you change, `c2`** (`scripts/e2e.ts`, at the phone page,
  750×340): today it requires `lay.covering.length === 0`, no control over
  the play field. `FULL_VIEW_PHONES` in `scripts/e2e/phone.ts` lists 667×375
  @2 and 736×414 @3, with the see-through test (every action and the stick
  on screen, clear of notch and home bar, ≥ 44 px, two fingers run and
  jump, paint ≤ 3% and ≥ 0.1%).
- **Step 2's sight range**: `npcSightRange` is 112 px
  (`content/tuning.json`); a view narrower than about 224 lets a guard see
  you from off screen. Upright is 234 wide at 390 pt @3 today.
- **The team** (paths each lane alone may touch) is the table in
  `docs/mechanisms/art-pipeline.md`, "Who is building round 2". The actors
  lane draws bodies, effects, text and hide folds; you draw the room,
  backdrops, decor and the page.
- **How to see a room at iPhone size:** `npm run dev`; Playwright Chromium
  (`NODE_PATH=/opt/node-tools/node_modules`, `chromium.launch()` with no
  options); devices `iPhone 14` (upright), `iPhone 14 landscape`
  (750×340), 844×390 and 844×340 with
  `Emulation.setSafeAreaInsetsOverride` left 47, right 47, bottom 21,
  and 667×375; open `/?room=<a made-up name>` (a private world), wait for
  `window.irreverents.drawn.status === 'online'`, then on
  `d.world.entities.find(e => e.player === d.player)` set `room`,
  `x = tx*16 + (16 - box.w)/2`, `y = (ty+1)*16 - box.h`. Spots:
  throne-room (9, 14), castle-street (16, 10) and (37, 10), courtyard
  (14, 7), hall-gallery (8, 10), undercroft (24, 12) and (8, 4),
  graybox-hall (5, 9).

## 3. What to build

**Push 1, first and early (the art lanes are waiting on it):** the
validators in `src/content/kinds/{atlases,backdrops,decor}.ts` for
`autotile.deep`, `autotile.regions`, `outside`, a layer's `pin` and
`front`, an item's `blend`, exactly as the contract defines them, and the
renderer reading each one with today's picture as the fallback. Prove each
with a throwaway content file (watched to pass, and a malformed one
watched to fail), then remove it.

**Push 2, the rest:**

1. **Sideways layout.** On a touch screen held sideways, use bars only
   when they give a strictly bigger scale (`sBars > sOver`); frame the view
   at about 320×180 or tighter (`DRAFT:` start from
   `SIDEWAYS = { wMin: 280, wMax: 450, hMin: 160, hMax: 180 }`: an 844×340
   view at DPR 3 and a 750×340 one both come out at 6×, 375×170, 2.0 pt
   per game px instead of 1.67). Upright: no narrower than today.
2. **Camera clearance.** In the overlay the shell publishes a bottom
   reserve (the height of the pad and the low controls, in game px) on
   `view`; `roomOrigin` keeps the room's floor at least that far above the
   view's bottom, showing ground below it (the cached room picture has 12
   tiles of margin), and gives all spare height to the sky when the room
   is shorter than the view; the camera keeps the player's own character
   above the reserve. Compact the overlay so no control sits above about
   35% of the view's height (the switch as a small top-corner chip, or two
   low rows), clear of the alert pips.
3. **Past the room's edge**, by `outside`: `"sky"` paints nothing above
   the room (sky and layers show); `"deep"` paints below it from
   `autotile.deep`; `"fill"` as today. `INTENT:` the autotile index still
   treats everything past the edge as solid.
4. **Regions** in `autotile.ts`: a tile inside a region's rectangle draws
   from that region's block and lists.
5. **Layers:** `pin: "room"` measures `y`/`offsetY` from the room's
   on-screen edge; `front: true` layers draw after effects and before
   `front` decor (`render.ts`).
6. **Glow:** decor items with `blend: "lighter"` draw with
   `globalCompositeOperation = 'lighter'` in their own layer, then reset.
7. **Checks** (decided above; a design change, not a loosening): add
   `{ 750×340 @3 }` and `{ 844×340 @3, insets 47/47/0/21 }` to
   `FULL_VIEW_PHONES`; change `c2` from "no control over the play field" to
   the same see-through test the full-view phones pass; and add a new
   fact: in the overlay, no control's rectangle overlaps the player's own
   drawn box standing at the throne-room and castle-street spots above,
   **with a control**: the bottom reserve forced to 0 must make it fail
   (watch it fail, then restore).

## 4. Traps

- **`PlayerView.drawn` must keep recording exactly what it records**
  (`scripts/e2e.ts` reads it); values such as `scale` change legitimately
  with the new view, fields do not.
- **`INTENT:` "looks solid" is what keeps a secret looking like wall**:
  never change the autotile index, only what is painted past the edge or
  inside a region. Read `docs/deliberate-designs.md` before calling
  anything here a bug.
- **Collision never depends on the picture**: `roomOrigin` and the view
  are drawing only; the simulation (`src/sim/`) is untouched.
- **A changed camera moves where things are on screen**: e2e touch facts
  that aim at the screen may need re-aiming. Re-aim; never loosen a
  threshold. If a fact you do not own fails, tell its step's lead
  (`docs/plan/step-<n>.md`, "Who runs it") rather than editing it.
- **Two other steps are building beside you right now**
  (`handoff-prompts/step-11-a-brawl.md`, `step-12-a-outpost.md`): each adds
  one import and one call to `src/client/render.ts` (`draw/cantina.ts`,
  `draw/outpost.ts`), Step 12 adds a block to `scripts/e2e.ts`, and they
  add rooms (`cantina`, `outpost`) and a door in `castle-street` and an
  entry in `courtyard`. Those lines and files are theirs: rebase over them,
  keep their calls in the draw order, and never resolve a conflict by
  dropping them. A new room with no art file falls back to plain shapes;
  that is expected.
- **Never weaken, skip or edit a scripted check or its control** beyond
  the `c2` change decided above.
- **Many people push to `main` at once, and a push is the deploy.** Two
  pushes; `git pull --rebase origin main` and build, check and e2e before
  each. A conflict outside your paths: take theirs and re-apply yours.
- **Shared documents are not yours to edit**: `docs/mechanisms/README.md`,
  `docs/mechanisms/art-pipeline.md`, `docs/architecture.md`,
  `docs/decisions-log.md`, `docs/for-the-lead.md`, `docs/plan/` (including
  `step-5.md`, whose "Controls never hide the game" line the orchestrator
  updates when you land), `docs/understanding-the-project.md`. Notes go in
  **`docs/mechanisms/phone-shell-look.md`** (layout, checks) and
  **`rendering-world.md`** (room, backdrops, decor), under "What exists",
  "Deviations from the contract", "Decisions", "Flags for the lead", "Not
  verified".
- **There is always a way out**: nothing you add holds a player; the mute
  and any dismissible hint stay reachable.
- **"The code looks right" is not a verification.** Screenshot every room
  at every size above, before and after, and look at them.

## 5. Out of scope

- Bodies, effects, speech, rage tint and hiding (actors lane); any
  picture (art lanes); the room files, including the outdoor rooms' solid
  roof row (Step 3's; not this round); the simulation, network and
  tuning.
- `docs/vision.md`.

## 6. Decided, and open

Decided: everything in section 2 and the contract. Open: nothing a
session should ask the owner. Decide from their words and the bar, mark
it `DRAFT:`, write it under "Decisions" in your notes, keep going.

## 7. How it gets verified, and done

`npm run build`, `npm run check`, `npm run e2e` green after the final
`git pull --rebase origin main`, the new fact watched to fail under its
control. After each push, wait for the deploy, run `npm run
check:deployed` and `npm run check:live`; fix forward or revert at once if
live breaks, and say which.

**Done:** sections 3.1–3.7, pushed and live; your own before (today's live
game) and after screenshots of all six rooms at iPhone size, upright
(390×664, Playwright's `iPhone 14`) and sideways (750×340, 844×390 and 844×340 with insets,
667×375), looked at, kept in `e2e-out/` (git-ignored), and described in
your notes (share of the picture that is the room, sky and ground; scale);
notes updated. SOP phase 6 rows: a changed mechanism (your notes files),
decisions made without asking (notes). Leave this brief; the reviewer deletes it.

## 8. Where questions go

A blocking question goes to the orchestrator: the session on the
**Orchestrator:** line in the header of `docs/questions-for-the-owner.md`,
read after `git pull` when you send, with `send_message`; carry on with
everything else. Nothing goes to the owner. Flags go in your notes. When
the lane is pushed and live, send the orchestrator one message,
**"look2 lane frame done at <commit>"**, plus at most three lines on what
is weakest; your final message says no more than that.
