# Brief: the look, round 3, lane "actors": the punch lands when you throw it, the throw is one motion, nothing gives a hider away

Written 2026-11-23 by the orchestrator, which runs Step 8 itself
(`docs/plan/step-8.md`, "The look" and "Round 3 (2026-11-23)"). The
reviewer deletes it after review.

## 1. The task, and the measure

The one code lane this round. Make a hit read on the hitter's own screen
when it happens; make grab, carry and throw one continuous motion; stop
the player-mark from pointing at a hidden player; put every overlay of a
carried body where the body is drawn; fix three small drawing bugs; draw
the new HUD and effect looks; add the first scripted check that the three
moods differ; and, once Step 17's edit to `shell.ts` is on `main`, the
phone frame's leftovers. It moves no numbered row of `docs/plan.md`'s
table; the look is read from screenshots and filmstrips at iPhone size,
by a fresh reviewer each round and finally by the owner.

## 2. What is decided (do not redo it)

- **The owner, ~11:11 UTC:** *"It all looks looks like absolute blocky
  shit. Compare to kirby and the amazing mirror and don't stop working on
  it until it looks similar to that."* ~11:30: *"It should play well in
  portrait too."* The owner's standard (`CLAUDE.md`): *the "OHHHHH" of
  spectacular physical impact* and *the satisfaction of a zero-alarm
  infiltration*.
- **The bar:** `docs/design-library/03-visual-direction-and-assets/current-pixel-art-explorations/pixel-aesthetic-reference-approved-direction.png`;
  its "Start a Fight" panel reads because the two bodies stand side by
  side with the star between them.
- **What the review measured** (filmstrips of every drawn frame against
  the live server; not in the repository):
  - **The punch lands late on the hitter's page** (gap 4, size 5). The
    grappler's burst plays 155–320 ms after the press while the target
    stands untouched; nothing from about 353 to 520 ms; the star, dust and
    the target's launch at about 555 ms. A front punch showed no star
    within 393 ms. Cause, documented: a page's local world holds only its
    own character, so *"a hit cannot be shown before the server says so"*
    (`docs/mechanisms/network.md`, "Known limits"); add `interpDelayMs`
    100 and 20 Hz snapshots (`content/net.json`). At contact the
    grappler's art, drawn in front, hides the body he hits: in the villain
    hit only the top hat shows; the enraged guard's charge vanishes
    behind him, leaving the red `!`.
  - **Grab, carry and throw stutter** (gap 5, size 4). For 0.44 s after a
    throw press the load stays overhead while the grappler flips every
    1–4 frames between the front carry pose, the side throw pose and the
    side punch pose (the crate on his head or at face height), then the
    load leaves with no release frame while he is already idle. On the
    thrown friend's own page the camera moves at 344 ms while her body
    stays drawn on the grappler's head until about 444 ms, then jumps
    about 70 px into mid-flight; she flies and lands upright. On a grab
    he stands still about 0.4 s, then the crate pops overhead with no
    bend or heave. The carried load hangs 2–4 px above the fists.
  - **Proven code causes** (the round-2 code review of your files):
    - *Gap 13:* the page's copy never has `c.carrying`, so
      `src/sim/verbs/attack.ts:74` does not throw locally; it starts a
      6-tick wind-up. `stateOf` returns `'attack'` for `phase ===
      'windup'` (`src/client/draw/sprites.ts:197`) before the
      `m.carrying` branch (`:200`); `drawSprite` sets no `hold` for
      `attack` (`:372`), so `entities.ts:137` draws the load at its
      smoothed simulation spot, 12 px lower, on his head; and if the
      server's release arrives before the local strike, `m.swingThrew`
      goes false (`sprites.ts:118-124`) and `entities.ts:254` draws the
      punch burst after the throw.
    - *Gap 14:* a carried body is drawn 12 px above its simulation spot
      (box top − 14 + `carryAt.y` 2), but the carrier's player-mark
      (`entities.ts:159-162`, `oy + over.y`), the king's ribbon
      (`audience.ts:36-45`), a guard's bark and mood mark
      (`npcs.ts:95-112`) and a friend's away dots (`away.ts:26-35`) all
      place from `e.y`: the mark lands on the carried crate, the ribbon
      cuts a carried king's crown. `alert.ts` follows the same pattern.
      `docs/mechanisms/rendering-actors.md:232` still says `carryAt` was
      not on `main`; it has been since d426771.
    - *Gap 15:* `hall.ts:145` builds `` `${kindName} · ${ordinal(rank)} of N` ``
      and `:127`/`:130` append `…`; `drawText` maps anything outside ASCII
      32–126 to `?` (`fx.ts:112-115`), so every Hall card reads
      "big throw ? 1st of 1".
    - *Gap 16:* `audience.ts:47-59`: with no room above (y < 3) and
      neither side fitting, the right side is chosen and x clamped to
      `W - w - 3`, back over the king. A 28-letter row is 173 px wide, so
      sideways at W 320 this happens for his box x between 116 and 184,
      where the camera puts a carrier.
  - **The hidden player's mark** (gap 9, size 3): the fold now covers the
    body, but the green player-mark is drawn on the middle of the
    curtain, on the hider's page and on every friend's. `entities.ts:78-81`
    pushes every body with `c.net` into the heads pass whatever
    `c.roomHide` says, and the heads pass (`:153-163`) draws after every
    body and fold, against the `INTENT:` at `HIDDEN_TINT` (`:173`):
    *"no outline, icon or sparkle: nothing points"*. NPCs are not
    affected (`src/sim/npc/sight.ts:38` reads only `c.roomHide`).
  - **Overlays read as debug boxes** (gap 11): the alert's three flat
    circles, a bare red bar over a guard ringing the bell (`alert.ts`),
    and a bark from a speaker past the screen edge clamped to the edge
    with its tail on whoever stands there (the off-screen shopkeeper's
    "W-what?!" sat on the villain).
  - **No scripted mood check** (gap 8): `grep -ril mood scripts/` finds
    only `scripts/{lib,checks}/art-images.ts` (frame validation), though
    `docs/mechanisms/art-pipeline.md`, "Checks", says e2e proves it. The
    moods do differ by eye today.
  - **Phone frame leftovers** (gap 12, size 2): at 667×375 the canvas is
    333×180 at 2×, leaving 7.5 pt navy bands top and bottom; on a notched
    iPhone in Safari (844 pt, insets 47/47) the picture stops at the
    insets, 750 of 844 pt (computed from `shell.ts`, not captured); in the
    undercroft, with the player upstairs, the low controls sit on the
    lower floor's lantern and torches (the camera keeps only the floor
    under the player clear); the "Plays either way up" dismissal lives
    only in `hint.dataset` (`shell.ts:268`, `:279`), so it returns on
    every load. `docs/deliberate-designs.md` has no entry for it.
- **Contract additions, round 3** (`docs/plan/step-8.md`): a sprite state
  `tumble` (falls back to `held` → `hurt` → `air`; with no `tumble`
  frames, turn the `hurt` frame in 90° steps) and `carryAtBy` (`{ state:
  { x, y } }` for `carry`, `carryRun`, `throw`; else `carryAt`). And new
  look ids the props lane is drawing: `hide-1x1`, `hide-front-1x1`,
  `fx-speed`, `fx-dizzy`, `fx-clang`, `hud-face-<character id>`,
  `hud-plate`, `hud-ko`, `hud-fall`, `bell-gauge`, `bark-edge`, and the
  redrawn `alert-pip`/`alert-pip-off`, `mood-2`/`mood-3`. Draw each when
  present and fall back to today's drawing when not.

## 3. What to build

**Push 1, early (the art lanes wait on it):** the validators for `tumble`
and `carryAtBy` in `src/content/kinds/sprites.ts`, each proven with a
throwaway file watched to pass and a malformed one watched to fail (then
removed); and the small fixes: gap 13 (a wind-up while carrying is not an
attack, e.g. `phase === 'windup' && !m.carrying`; set `swingThrew` when a
wind-up starts while carrying), gap 15 (map `·` and `…` to ASCII inside
`drawText`), gap 16 (when neither side fits, keep the ribbon above at
y = 3, one row or running off the top; never clamp x across his box),
gap 9 (other pages draw no mark for a body with `c.roomHide`; the hider's
own page draws it dimmed to about 35%, `DRAFT:`).

**Push 2:**

1. **The hit lands when you throw it** (gap 4). Cosmetic prediction on the
   acting page only; knockback stays the server's. On the strike tick of
   the page's own swing, if the strike box overlaps another body as
   drawn, draw `fx-hit` at the contact edge between the two boxes (the
   fist side) with dust and the shake, and switch that body to its white
   flash and hurt frame, nudged a few px along the push; blend to the
   server's position when its launch arrives; if the server's hit on that
   body arrives within about 0.5 s, draw no second star. All of it in
   `impact.ts`, `entities.ts`, `sprites.ts`, `fx.ts`, from what the page
   already draws: no `src/net` or `src/sim` change (`DRAFT:`; the other
   way, widening the page's local world in `src/net/client.ts` as
   `network.md` suggests, would change simulation truth: log it, don't
   take it). Draw order: a body in its beat, hurt or launched is drawn in
   front of whoever hit it for the beat's length.
2. **One motion for grab, carry, throw** (gap 5): the thrower's pose from
   one source for the whole throw; `throw` a one-shot that never loops
   and is never the attack strip; the load held at `carryAt`/`carryAtBy`
   from that same source until the server releases it, then eased to its
   flight position over 2–3 frames, not snapped. On the thrown player's
   own page, draw the body from the same position the camera follows as
   soon as it is airborne (if that needs `src/net`, stop and flag it).
   `tumble` for a launched or thrown body while it flies fast, with
   `fx-speed`; on landing a brief `down` with `fx-dizzy`. `grab` played
   locally on the press as a one-shot. Drop `grab` from the states that
   hold the load (`sprites.ts:372`), or record why not.
3. **Overlays where the body is drawn** (gap 14): record each held body's
   drawn offset in a module map (as `Drew.top` exists), expose it (e.g.
   `drawnOffset(e)`) and add it in the heads pass, `npcs.ts`,
   `audience.ts`, `away.ts` and `alert.ts`. Place mood marks from the
   drawn top of the sprite, clear of hats and plumes. Correct
   `rendering-actors.md:232`.
4. **HUD and effects drawn from the new looks** (gap 11): the alert pips
   fill and glow; a `bell-gauge` and `fx-clang` instead of the bare red
   bar; a speaker past the screen edge gets a `bark-edge` chip with an
   arrow toward them and their head cropped from their own sprite,
   instead of a bubble whose tail points at someone else.
5. **The mood check** (gap 8): a new `scripts/e2e/look.ts` (one import
   and one call in `scripts/e2e.ts`) with a fact that crops the same
   guard at moods 1, 2 and 3 and asserts each pair differs by more than
   N pixels, and its control (the same mood twice stays under N), plus a
   fact that a hidden body draws no mark on another page (an additive
   field in the page's record if you need one). The round-3 captures
   raised the castle street's guard to mood 2 with one punch he saw and
   to mood 3 with more.
6. **Multi-floor camera** (gap 12, `room.ts`): when a floor lies within a
   few tiles below the player, bias the camera so that floor clears the
   low controls too.

**Push 3, only once Step 17's `shell.ts` edit is on `main`** (gap 12):
sideways, let the picture run under the side insets (only the controls
and the HUD need the safe area; 844 pt at 6× is 422 game px, inside
`wMax` 450) and let the view height grow to `floor((H - insets) * dpr /
scale)`, as upright already does (about 187 rows at 375 pt); remember the
hint's dismissal per viewer in `localStorage` inside try/catch. If Step
17 has not landed by the end of push 2, report and stop; the orchestrator
re-briefs it.

## 4. Traps

- **`PlayerView.drawn` keeps every field it has** (the checks read it,
  including Step 2's `drawn.words` for `t-no-numbers`, 7500b81); add
  fields only.
- **Never freeze anything the simulation does not.** The beat is in the
  simulation and freezes only the struck bodies (`docs/mechanisms/combat-and-impact.md`);
  on the hitter's page the "beat" is the star and the hurt frame held
  until the server's launch arrives.
- **A page never has `c.carrying` for its own character** (network.md):
  keep finding the body held by this one.
- **"Nothing points"** (`INTENT:` at `HIDDEN_TINT`): no outline, icon or
  sparkle on a hidden body on anyone else's page.
- **`src/client/draw/cantina.ts` is Step 11's** (the brawl strip, flat
  squares, `edgedText` at :73) and `outpost.ts` Step 12's. Do not edit
  them. When the orchestrator says Step 11 slice B is reviewed, the
  strip may move to `hud-face`/`hud-plate`/`hud-ko`/`hud-fall` and
  `drawText`, inset clear of the sound button upright; until then, say
  in your report that it waits.
- **Step 17 is in `src/client/main.ts`, `start.ts`, `shell.ts`,
  `index.html` and `src/server/` now.** `shell.ts` only in push 3, small
  and additive, `git pull --rebase origin main` right before pushing;
  never `main.ts`. A start screen may change how a page joins a world:
  capture the way `scripts/e2e/` does after it lands.
- **`scripts/e2e.ts` and `scripts/e2e/phone.ts` have other steps' blocks**
  (Steps 11, 12, 16): add your lines, never move theirs.
- **Steps 4 and 7 have old briefs naming `alert.ts`, `npcs.ts`,
  `entities.ts`**; neither is running. If a worker for either appears,
  ask the orchestrator before touching those files.
- **Never weaken, skip or edit a scripted check or its control.** Run
  e2e **twice** before each push: `t-throw-friend` / `s-throw-friend`
  flaked once per lane in round 2 (not reproduced; they read
  `PlayerView.drawn`).
- **Shared documents are not yours.** Notes in
  `docs/mechanisms/rendering-actors.md` (and `phone-shell-look.md` for
  push 3): "What exists", "Deviations", "Decisions", "Flags for the
  lead", "Not verified".
- **"The code looks right" is not a verification.** A still cannot show
  a motion: prove it with filmstrips.

## 5. Paths

**Yours alone:** `src/client/draw/{sprites,entities,npcs,impact,away,audience,fx,hall,alert,room}.ts`,
`src/content/kinds/sprites.ts`, `scripts/e2e/look.ts` (new) and its one
import and call in `scripts/e2e.ts`, `docs/mechanisms/rendering-actors.md`,
`docs/plan/step-8-shots/round3/actors/`; in push 3 only,
`src/client/shell.ts`, `scripts/e2e/phone.ts`,
`docs/mechanisms/phone-shell-look.md`.
**Not yours:** every picture and content file (the four art lanes),
`src/client/draw/{cantina,outpost,backdrop,autotile,decor,room-parts}.ts`,
`src/client/render.ts`, `main.ts`, `start.ts`, `index.html`, `src/sim/`,
`src/net/`, `src/server/`, tuning numbers.

## 6. Decided, and open

Decided: section 2. Open: nothing for the owner. Where you would ask,
decide from the bar and the owner's words, mark it `DRAFT:`, write it
under "Decisions" in your notes, keep going. Note for Step 18 (not your
work): guards and enemies will need the same hit drawing when they swing.

## 7. Done

- `npm run build`, `npm run check`, `npm run e2e` (twice) green after
  the last `git pull --rebase origin main`.
- Pushed to `main`, live: `npm run check:deployed` and `npm run
  check:live` after each push; fix forward or revert at once if live
  breaks, and say which.
- Committed under `docs/plan/step-8-shots/round3/actors/` (under 10 MB;
  canvas crops at 2× are fine), before (today's live game) and after, at
  iPhone size upright (390×664) and sideways (844×390 with insets
  47/47/21), **against the live server**: a punch filmstrip (every
  second frame for 1 s from the press, the grappler on the villain at
  castle-street (14, 10)) with the star within 2 frames of the strike
  phase; a crate throw and a friend throw filmstrip on both pages (no
  frame in the punch pose while carrying, a visible release, no frame
  with the thrown body on the thrower's head after her camera moved); a
  grab filmstrip; a carried crate and a carried king (mark and ribbon
  clear of the load); the hidden infiltrator in the awning curtain on
  both pages; the alarm at 4 s; a Hall card.
- `send_message` to the session on the **Orchestrator:** line of
  `docs/questions-for-the-owner.md`: **"look3 lane actors done at
  <commit>"** (after each push too, with the commit), plus at most three
  lines on what is weakest.
