# Brief: the look, round 2, lane "actors": the punch lands, the words are pixels, the hoist, the rage and the hiding read

**Scratch.** Delete this file when the lane has shipped. Written
2026-11-23 by the orchestrator `session_017WiGzGp8auJceLEAAh9Aqx`, who
leads Step 8 (`docs/plan/step-8.md`, "The look" and "Round 2
(2026-11-23)").

## 1. The task, and the measure

Code lane for bodies and what is drawn on them. Make a hit read as a hit
(the right swing for each hero, a big star at the point of impact, the
wind-up drawn); draw every in-world word with the game's pixel font and
lift the king's ribbon off his crown; draw a carried body in its
carrier's hands; stop washing enraged people pink; make a hidden body
look hidden.

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
  in both right now"*. The owner's standard starts with *the "OHHHHH" of
  spectacular physical impact* and *the satisfaction of a zero-alarm
  infiltration* (`CLAUDE.md`).
- **The bar**, under
  `docs/design-library/03-visual-direction-and-assets/current-pixel-art-explorations/`:
  `pixel-aesthetic-reference-approved-direction.png` ("Start a Fight": a
  starburst as big as a character, gold with a dark outline; "NPC
  Reactions": a red face and an anger mark with the costume unchanged;
  "UI / Systems": crisp outlined bitmap lettering), the two
  `s00-01-gameplay-references-use-now-revise-later/*-phone-320x180-preview.png`,
  P01's `p01-ruins-starter-kit-playable-prototype/p01-complete/preview/`,
  and the owner's liked concept `docs/art-reference/heroes-v2-chatgpt-concept.png`
  (4th pose: a fist with a big yellow burst; 5th: both hands under the
  boulder, overhead).
- **Similar to, never copied from**: the likeness is in the craft, on
  original designs.
- **The contract is `docs/mechanisms/art-pipeline.md`, read it in full,
  including "Round 2 additions"**: `carryAt` (you validate it, in
  `src/content/kinds/sprites.ts`), `fx-hit` at 32×32,
  `fx-swing-<character id>`, `font-dark`/`font-light` (95-frame strips,
  ASCII 32–126, cell 6×10, advance 6), `hide-front-<w>x<h>`. Round 1
  landed this lane at f92a447; its notes are
  `docs/mechanisms/rendering-actors.md`.
- **Step 2 now stamps what you used to guess** (252e5ce, Step 2's feel
  push; `docs/mechanisms/combat-and-impact.md`): `c.attack.phase` and
  `.left` (wind-up / strike / recovery), `c.lastHit`, `c.landing`,
  `c.airborne`, `c.grab.at`, `c.lastThrow`, `c.flap.at`, `c.stunned`. And
  `c.attack.swung` is now the **strike's** tick, so today the wind-up
  draws as standing still (Step 2's lead's flag, `docs/plan/step-2.md`,
  14:20 UTC). The hit freeze ("beat") is now in the simulation, 2 to 8
  frames by impact speed: do not add a second, render-only freeze.
- **What the round-2 review measured** (three independent reviewers;
  screenshots not in the repository, so here in words):
  - *Hits do not look like hits.* A punch gives a pale thin crescent
    (`fx-slash`, a sword swipe drawn over the grappler's fist) then cream
    dust puffs 8–16 px across; across six sampled frames of a punch on a
    dummy, a dummy launched into a dummy and a thrown crate's impact, no
    hit star was visible at all. One reviewer saw the arc across the
    forearm, another on the fist: either way it is a blade arc on a punch.
    Sizes today: `fx-slash` 24×24, `fx-hit` 16×16, `fx-dust` 16×16; the
    props lane is making `fx-hit` 32×32 and `fx-dust` 24×24.
  - *Speech is a smeared system font.* `g.font = 'bold 8px monospace'` then
    `fillText` at game resolution: `src/client/draw/npcs.ts` lines 20 and
    39, `audience.ts` line 28, `hall.ts` line 21 (`FONT`), and
    `edgedText`/`bubble()` in `fx.ts` (pale letters with an ink halo on a
    white bubble). Grey fringes on every letter; "SEIZE THEM!!" and
    "W-what?!" come out as mush; on an iPhone `monospace` is Courier.
  - *The king's ribbon sits on his crown* sideways, with the notch and
    upright: its bottom edge cuts off the crown's points, and the throne's
    top. The crown stands 8 px above the king's box. The ribbon is a wide
    dark box with no tail.
  - *Carrying does not read.* The carried crate, guard or friend sits on
    the grappler's head, half behind his crest; `entities.ts` draws bodies
    in `world.entities` order, so a held body is never drawn after its
    carrier. (The heroes lane is redrawing `carry` with both fists
    overhead and writing `carryAt`.)
  - *Enraged people turn into pink ghosts.* `RAGE_TINT = { color: '#c8324a',
    amount: 0.45 }` (`entities.ts` line 133, applied at line 73) washes
    the whole body, on top of the cast's own mood-3 frames, which already
    have red faces: the guard's silver helmet and blue tabard turn mauve,
    and the drawn brows and levelled spear are lost. Every person has
    mood-3 frames (`content/sprites/{king,guard,shopkeeper,villain}.json`:
    `idle`, `run`, `talk`). Mood 2 reads fine.
  - *Hiding looks like standing.* In the castle street's awning curtain
    the hidden infiltrator is drawn whole and at full value in front of
    the curtain: hide parts draw before bodies, and `sprites.ts` picks the
    `hide` frame from `c.roomHide` with nothing else.
- **The team** (paths each lane alone may touch) is the table in
  `docs/mechanisms/art-pipeline.md`, "Who is building round 2". The frame
  lane draws the room, backdrops, decor and the page, and changes the view
  size and camera; props draws your effects, font and folds; heroes draws
  the new carry frames.
- **How to see it at iPhone size:** `npm run dev`; Playwright Chromium
  (`NODE_PATH=/opt/node-tools/node_modules`, `chromium.launch()` with no
  options), devices `iPhone 14` (upright) and `iPhone 14 landscape` at
  844×390 with `Emulation.setSafeAreaInsetsOverride` left 47, right 47,
  bottom 21; open `/?room=<a made-up name>` (a private world), wait for
  `window.irreverents.drawn.status === 'online'`, then on
  `d.world.entities.find(e => e.player === d.player)` set `room`,
  `x = tx*16 + (16 - box.w)/2`, `y = (ty+1)*16 - box.h`. Spots:
  graybox-hall (5, 9) (dummies and a crate), throne-room (9, 14) (the
  king's ribbon), castle-street (16, 10) (the shopkeeper, the guard, the
  curtain).

## 3. What to build

**Push 1, first and early (the heroes lane waits on it):** the validator
for `carryAt` in `src/content/kinds/sprites.ts`, exactly as the contract
defines it, proven with a throwaway file watched to pass and a malformed
one watched to fail, plus everything below that reads a look's size
instead of a hard-coded 16 or 24.

**Push 2, the rest:**

1. **Hits.** Play the attack strip from `c.attack.phase` so the wind-up
   draws; use `fx-swing-<kind>` when that look exists, else `fx-slash`;
   draw the swing and `fx-hit` centred on where the strike lands (the
   attack's reach in front of the box), not the box edge; hold the star
   through the simulation's beat and scale it by impact (`c.lastHit`); a
   2-frame white flash on the struck body for strong hits. Read the other
   stamped states (`c.landing`, `c.airborne`, `c.grab.at`, `c.lastThrow`,
   `c.flap.at`, `c.stunned`) in `stateOf()` in place of the page's own
   timing, where they exist.
2. **Text.** One `drawText` in `fx.ts` that copies glyphs from `font-dark`
   or `font-light` onto whole pixels, word-wrapped by the 6 px advance;
   used by barks (dark letters on paper, no halo), the king's ribbon
   (light letters with their shadow on dark), `hall.ts` and `audience.ts`.
   When the look is missing, fall back to today's `fillText`.
3. **The ribbon.** Its bottom edge at least 4 px above the top of the
   king's drawn picture (box top minus the crown's 8 px, minus 4), with a
   tail pointing at him; where there is no headroom, beside him; never
   over him.
4. **Carry.** Draw a held body after its carrier, its bottom-centre at
   the carrier's `carryAt` (mirrored with facing); without `carryAt`,
   today's placement.
5. **Rage.** Apply `RAGE_TINT` only to a body whose sprite file has no
   `moods["3"]`; at most a 4-tick red flash when mood 3 begins. The drawn
   face, brows and spear carry the anger.
6. **Hiding.** After a body whose `roomHide` is a part, draw
   `hide-front-<w>x<h>` for that part's size over it; when that look is
   missing, draw the hidden body one ramp step darker. No marker of any
   kind.

## 4. Traps

- **`PlayerView.drawn` must keep recording exactly what it records**: the
  scripted checks read it.
- **No scripted check proves the moods differ on screen** (measured:
  `grep -i mood scripts/e2e.ts scripts/e2e/` finds nothing; round 1's
  flag). So removing the pink wash is judged by your screenshots: an
  enraged guard must still be told from a calm one at phone size by his
  red face, brows and the mood-3 mark. If not, write it under "Flags for
  the lead" (a cast drawing problem), do not bring the wash back.
- **Nothing points** (`INTENT:`; `docs/plan/step-3.md`, "Unadvertised";
  `docs/deliberate-designs.md`): a hidden body gets no outline, icon or
  sparkle; the fold or the darker body is all.
- **A player's own page never has `c.carrying`** (the grab runs on the
  server; round-1 flag): keep the current workaround of finding the body
  held by this one.
- **`hall.ts` is drawn for Step 7's Hall of Legends**: change only how its
  words are drawn; its `INTENT:` (a card shown while standing at a
  pedestal) stays.
- **Never weaken, skip or edit a scripted check or its control.**
- **Many people push to `main` at once, and a push is the deploy.** Two
  pushes; `git pull --rebase origin main` and build, check and e2e before
  each. A conflict outside your paths: take theirs and re-apply yours.
- **Shared documents are not yours to edit**: `docs/mechanisms/README.md`,
  `docs/mechanisms/art-pipeline.md`, `docs/architecture.md`,
  `docs/decisions-log.md`, `docs/for-the-lead.md`, `docs/plan/`,
  `docs/understanding-the-project.md`. Notes go in
  **`docs/mechanisms/rendering-actors.md`** under "What exists",
  "Deviations from the contract", "Decisions", "Flags for the lead", "Not
  verified".
- **Until the props and heroes lanes push, their looks and `carryAt` are
  missing**: prove each path with throwaway numbered test art (as round 1
  did), then remove it, and check again with the real art once it lands.
- **"The code looks right" is not a verification.** Screenshot a punch
  frame by frame, the ribbon, a carry, a rage and a hide, and look.

## 5. Out of scope

- Any picture (art lanes); the room, backdrops, decor, the view size, the
  camera and the controls (frame lane); the simulation, the network and
  tuning numbers; how hard anything hits.
- `docs/vision.md`.

## 6. Decided, and open

Decided: everything in section 2 and the contract. Open: nothing a
session should ask the owner. Decide from their words and the bar, mark
it `DRAFT:`, write it under "Decisions" in your notes, keep going.

## 7. How it gets verified, and done

`npm run build`, `npm run check`, `npm run e2e` green after the final
`git pull --rebase origin main`. After each push, wait for the deploy, run
`npm run check:deployed` and `npm run check:live`; fix forward or revert
at once if live breaks, and say which.

**Done:** sections 3.1–3.6, pushed and live; your own before (today's live
game) and after screenshots at iPhone size, upright (390×664, Playwright's `iPhone 14`) and sideways
(844×390 with insets), of a punch (wind-up, strike, impact), the throne
room's ribbon, a carried crate and a carried friend, an enraged guard and
the hidden infiltrator, looked at, kept in `e2e-out/` (git-ignored) and
described in your notes. SOP phase 6 rows: a changed mechanism (your notes
file), decisions made without asking (notes). Do not delete this brief.

## 8. Where questions go

A blocking question goes to the orchestrator, session
`session_017WiGzGp8auJceLEAAh9Aqx` (the address in the header of
`docs/questions-for-the-owner.md`), with `send_message`; carry on with
everything else. Nothing goes to the owner. Flags go in your notes. When
the lane is pushed and live, send the orchestrator one message,
**"look2 lane actors done at <commit>"**, plus at most three lines on what
is weakest; your final message says no more than that.
