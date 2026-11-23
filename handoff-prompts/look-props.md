# Brief: the look, lane "props" — props, decoration, effects and small interface pictures

**Scratch.** Delete this file when the lane has shipped. Written
2026-11-23 by the orchestrator `session_017WiGzHX8g2sXimNRnqp2oZ`, who is acting as Step 8's lead
(`docs/plan/step-8.md`, "The look, from 2026-11-23 11:11 UTC").

## 1. The task, and the measure

Draw every row of the contract's "Look ids in use" table and register it under its exact id in `content/looks/<group>.json`; draw decoration sheets and place them in the six map rooms as `content/decor/<room>.json`; draw the "Use" button.

It moves no numbered row of `docs/plan.md`'s table (M3 counts build
gates). The look is read from screenshots of the real game at iPhone size
beside the owner's references, and finally by the owner
(`docs/plan/step-8.md`, "Feedback signal for the look").

## 2. What is already measured and decided (do not redo it)

- **The owner's words, 2026-11-23 ~11:11 UTC, first-hand, with a screenshot
  of the live game on an iPhone held upright** (every character a flat
  rectangle, flat grey platforms, the game a thin strip at the top of a
  near-black page): *"It all looks looks like absolute blocky shit. Compare
  to kirby and the amazing mirror and don't stop working on it until it
  looks similar to that. There are assets provided and you have the
  ability to get more."* Then, ~11:30 UTC: *"It should play well in
  portrait too, not just landscape. Looks awful in both right now"*. And to
  Vision Partner: *"something that looks, sounds, and feels as good as
  kirby and the amazing mirror"*.
- **The contract is `docs/mechanisms/art-pipeline.md`. Read it first, in
  full.** It fixes the palette, the style, every data shape, every look id
  and the draw order. Eight other lanes are building the other sides of it
  from the same text right now, without talking to you: follow its names,
  shapes, sizes and ids exactly. Where it cannot work, deviate as little as
  possible and write the deviation in your notes file (below).
- **Similar to, never copied from.** Nothing of Kirby's or any other
  game's is copied, traced or imitated as a likeness; the owner's own art
  gate forbids it. The craft carries over, on original designs.
- **Why the art is drawn here:** the asset desk has delivered no accepted
  character and no town ground (`docs/decisions-log.md`, 2026-11-23, "The
  game's pictures are being drawn by us"). Everything drawn is a stand-in
  wired in as data.
- **The team, and the paths each lane alone may touch:**

  | Lane | Paths |
  |---|---|
  | foundation | `src/content/kinds/sprites.ts`, `atlases.ts` (extended), `backdrops.ts`, `decor.ts`, `looks.ts` (new), `src/client/draw/looks.ts`, the image validation under `scripts/` |
  | heroes | `tools/art/heroes/`, `assets/sprites/heroes/`, `content/sprites/{grappler,infiltrator,flyer,hero}.json` |
  | cast | `tools/art/cast/`, `assets/sprites/cast/`, `content/sprites/{king,guard,shopkeeper,villain,crate,crate-heavy,dummy,dummy-heavy,throne}.json` |
  | tiles | `tools/art/tiles/`, `assets/tiles/`, `assets/backdrops/`, `content/atlases/`, `content/backdrops/` |
  | props | `tools/art/props/`, `assets/props/`, `assets/decor/`, `assets/fx/`, `assets/ui/use.png`, `content/looks/`, `content/decor/`, and the `icon` line of `content/actions/interact.json` |
  | world | `src/client/render.ts`, `src/client/draw/room.ts`, `room-parts.ts`, `alert.ts`, new `backdrop.ts`, `autotile.ts`, `decor.ts` |
  | actors | `src/client/draw/sprites.ts`, `entities.ts`, `npcs.ts`, `impact.ts`, `away.ts`, `audience.ts`, new `fx.ts` |
  | shell | `src/client/shell.ts`, `touch.ts`, `keyboard.ts`, `main.ts`, `index.html`, page styles; one line in `render.ts` |
  | sound | `src/client/audio/`, `assets/audio/`, `src/content/kinds/sounds.ts`, `content/sounds/`, one check under `scripts/checks/`, six marked lines in `main.ts` |

  Foundation and heroes are being run by agents on the orchestrator's own
  machine; the other seven are sessions like you.
- **The map** (`content/rooms/`, 16 px tiles; the view is 320×180 = 20 ×
  11.25 tiles): `throne-room` 20×16 (where a player starts), `castle-street`
  48×12, `courtyard` 30×9, `hall-gallery` 24×12, `undercroft` 34×14,
  `graybox-hall` 20×11. The `test-*` rooms are fixtures for scripted
  checks: they keep their plain shapes and get no art.
- **Bodies** (`content/characters/`, collision boxes in pixels): grappler
  18×30, infiltrator 10×12, flyer 14×20 (the party, `content/party.json`),
  hero 12×26, king 20×30, guard 14×28, shopkeeper 12×24, villain 14×28,
  crate 14×14, crate-heavy 24×24, dummy 12×26, dummy-heavy 20×30, throne
  24×32.
- **Working parts in the rooms:** `castle-street` one hiding place, 3
  enter doorways, a hidden walk door; `courtyard` two plates and a gate;
  `throne-room` a false wall, a breakable window (the one the king is
  thrown through), a hiding place, a hidden walk door; `undercroft` a
  breakable wall and an enter doorway.
- **Tools on hand:** Node 22, Python 3 with Pillow 12 (`python3 -I`),
  Chromium with Playwright (`NODE_PATH=/opt/node-tools/node_modules`,
  `chromium.launch()` with no options). No image generator.
- Read the code each look replaces so sizes and placement match: `src/client/draw/room.ts` (doorways), `room-parts.ts` (plates, gates, breakables, windows, hiding places), `alert.ts` (bell, alert marks), `npcs.ts` (mood marks, barks, shop counter and goods), `audience.ts` (the king's ribbon), `away.ts`, `impact.ts`, `entities.ts` (the attack swing, the player dot).
- The sizes in use are not listed anywhere: write a script that reads `content/rooms/*.json` and lists every enter door's width × height and every part's kind, look and tile rectangle, and draw a `door-enter-<w>x<h>`, `window-<w>x<h>` and `hide-<w>x<h>` for each size that exists (map rooms and test rooms alike).
- The delivered touch buttons are in `assets/ui/touch/` (48×24 strips: normal, pressed): the "Use" button must match them.

## 3. Traps

- **Many people push to `main` at once, and a push is the deploy.** Work
  on `main` in your own clone. Push your lane **once**, when it is whole
  and green (twice at most): every push that touches the game restarts
  the live world for about a minute and the owner may be in it (accepted
  for this work, `docs/decisions-log.md`). Before pushing:
  `git pull --rebase origin main`, then build, check and e2e again. A
  conflict in a file outside your paths is somebody else's push arriving:
  never resolve it by editing their file; take theirs and re-apply yours.
- **Shared documents are not yours to edit**, because nine lanes appending
  to the same files collide: do not touch `docs/mechanisms/README.md`,
  `docs/mechanisms/art-pipeline.md`, `docs/architecture.md`,
  `docs/decisions-log.md`, `docs/for-the-lead.md`, `docs/plan/` or
  `docs/understanding-the-project.md`. Everything SOP phase 6 would have
  you write there goes instead into **your own notes file,
  `tools/art/props/README.md`**, under the headings "What exists", "Deviations from the
  contract", "Decisions" (in the decisions log's format, in the owner's
  terms), "Flags for the lead" and "Not verified". The orchestrator reads
  every lane's notes file and moves each item to its home.
- **"Nothing points."** `INTENT:` no arrow, glow, sparkle, sign,
  decoration or rhythm may mark a hidden door, a false wall, a secret or
  the way to one, and nothing may be conspicuously absent there either
  (`docs/plan/step-3.md`, "Unadvertised"; `docs/deliberate-designs.md`).
- **`PlayerView.drawn` must keep recording exactly what it records
  today**: the scripted checks read it (`scripts/e2e.ts`).
- **Never weaken, skip or edit a scripted check or its control** to get
  green. If the look breaks a check, fix the look.
- **The validators for the contract's new fields and folders arrive with
  the foundation lane's commit** (it is the commit that adds
  `src/client/draw/looks.ts`). Until `git pull` brings it, `npm run check`
  in your clone rejects new fields and new content folders. Do not strip
  fields from your JSON and do not write validators: keep drawing, and
  check your files with a small self-check of your own
  (`tools/art/props/selfcheck.py`: every image exists; every cell, `src`
  rectangle and frame number fits inside its image; required keys present;
  every `"//"` starts `DRAFT:`). Before you push, pull and run the real
  check. If you are otherwise finished and the foundation is still not on
  `main`, re-pull every three minutes for up to thirty, then tell the
  orchestrator.
- **How to draw.** Deterministic programs (fixed seeds, no clock; the same
  bytes every run), at 1×, whole pixels, the contract's palette. Build
  shapes from masks, then an outline pass, then a shading pass, then
  hand-place the pixels that make it read (eyes, mouths, highlights,
  cracks, tufts). Blur, anti-aliased edges, gradients inside sprites and
  sub-pixel smears are failures. Previews upscale with NEAREST only.
- **"The code looks right" is not a look.** Open your PNGs (4× previews)
  and the owner's references with the Read tool and judge with your eyes,
  at least three separate times, improving after each. The owner already
  rejected delivered heroes as "crude near-identical geometric box figures
  with almost static frames".
- **Previews are not shipped:** `tools/art/props/preview.py` writes them
  to `tools/art/props/preview/`, which is git-ignored; a reviewer
  re-runs the script.
- **Decoration and secrets.** Your placing program must not read the `hidden` flags to treat those places specially, and a regular rhythm (windows, banners) must either run straight across a secret's tiles or stay away from them. Cracks on breakable walls are subtle (the library's "suspicious cracked wall"), never a glowing hint.
- **Decoration and play.** It never looks like a platform or a doorway, never covers a doorway, a part, a spawn point or the bell, never hides a person; things stand on floors and hang on walls, never float. Prefer the `back` layer; `far` for things on a back wall; `front` almost never.

## 4. Out of scope

- Anything outside your lane's paths in the table above, however wrong it
  looks: write it under "Flags for the lead" in your notes file.
- The simulation (`src/sim/`), the network layer, the rooms' layouts,
  collision boxes and tuning numbers. Collision never depends on art.
- `docs/vision.md` (a brief never needs it).
- Ground tiles and backdrops (the tiles lane). Characters and bodies (heroes and cast lanes). The renderer (world and actors lanes): until theirs land, nothing draws your looks; that is expected.

## 5. Decided, and open

Decided: everything in the contract and in section 2. The owner judges
the result by looking; nothing waits on them. Open: nothing a
session should ask the owner. If you would stop to ask, decide from their
words above, mark it `DRAFT:`, write it under "Decisions" in your notes
file, and keep going.

## 6. How it gets verified

`preview.py` writes every look and decor sheet at 4× with a grid and id labels, the effect strips, and each room rendered at 320×180 (several camera positions, 4×) with plain grey ground from the room file plus your doors, parts and decor in place, to judge placement and density. Look beside the references. When the world and actors lanes' renderers are on `main`, pull, run the real game and check every look lands where the code-drawn shape was.

Then the pre-push gate in `docs/verifying-and-finishing.md`: `npm run
build`, `npm run check`, `npm run e2e`, all green, after the final
`git pull --rebase origin main`. After your push, wait for the deploy and
run `npm run check:deployed` and `npm run check:live`; if live is broken
by your push, fix forward at once or revert, and say which.

## 7. Done

Every id in the contract's table exists (groups `parts`, `people`, `fx`, `ui`, one image each), including: the throne room's stained-glass window as `part:throne-room:<its part id>` and `…:broken` (jagged shards left in the frame); curtains as hiding places; iron portcullis gates; stone plates clearly up or down; `fx-slash` (5 frames, a bright crescent), `fx-hit` (5, a starburst), `fx-dust` (5), `fx-land` (4); `mood-2` (a question mark in a soft yellow bubble), `mood-3` (a red anger burst); `bark` and `ribbon` nine-slices; `away-dots`; a white `player-mark`; three shadows; `ui-use` (a round stone button with an open hand, no letters) wired through the `icon` line of `content/actions/interact.json`. Decoration for the six rooms: town (lamps, barrels, a market stall with a striped awning, flower boxes, shuttered windows and painted doors on building fronts, picture signs, bunting), courtyard (bushes, flowers, a small tree, broken columns, ivy), throne room and hall (tall banners, columns, wall torches, a red carpet, portraits, armour), undercroft (barrels, cobwebs, chains, dim torches). Pushed, live, notes file written.

SOP phase 6 rows this triggers: a new mechanism or subsystem (your notes
file is its record; the orchestrator indexes it), decisions made without
asking (your notes file, "Decisions"). Do not delete this brief; the
orchestrator does once the lane is reviewed.

## 8. Where questions go

A blocking question goes to the orchestrator, session `session_017WiGzHX8g2sXimNRnqp2oZ`, directly
(`send_message` on the claude-code-remote tools), and you carry on with
everything that does not depend on the answer. Nothing goes to the owner.
Flags and non-blocking notes go in your notes file, not your final
message. When the lane is pushed and live, send the orchestrator one
message, "look lane props done at <commit>", plus at most three lines on
what is weakest; your final message says no more than that.
