# Brief: the look, lane "tiles" — ground that joins up, and the depth behind it

**Scratch.** Delete this file when the lane has shipped. Written
2026-11-23 by the orchestrator `session_017WiGzHX8g2sXimNRnqp2oZ`, who is acting as Step 8's lead
(`docs/plan/step-8.md`, "The look, from 2026-11-23 11:11 UTC").

## 1. The task, and the measure

Make the world's ground and backgrounds: one tile image per theme with the contract's full autotile set, and backdrop layers per room, wired in as `content/atlases/<room>.json` and `content/backdrops/<room>.json` for the six map rooms.

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
- Read `content/rooms/*.json` (rows of letters plus a legend; `docs/mechanisms/rooms-and-doors.md` explains the format) and `src/client/draw/room.ts` and `room-parts.ts` (how tiles are drawn today, and what "looks solid" means for false walls, breakable walls and hidden doors).
- Until the world lane's renderer lands, the live game draws an atlas through its `cells` block only (`solid`, `solidTop`, `oneway`), so choose those three cells to look right on their own.
- The world lane implements the contract's autotile rule in the game from the same text. Your `preview.py` is the reference picture: write down in your notes file how you resolved every ambiguity in the contract, because the world lane is told to match your pictures.

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
  `tools/art/tiles/README.md`**, under the headings "What exists", "Deviations from the
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
  (`tools/art/tiles/selfcheck.py`: every image exists; every cell, `src`
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
- **Previews are not shipped:** `tools/art/tiles/preview.py` writes them
  to `tools/art/tiles/preview/`, which is git-ignored; a reviewer
  re-runs the script.
- **Seams and repetition.** Every one of the 16 neighbour cases must join every other without a seam; large walls must not show a checkerboard. Test fills and one-way pieces repeated 6×6.
- **Quiet backgrounds.** A layer a player could mistake for a platform is a failure. Layers get lighter, greyer and plainer with distance and carry no dark outlines.

## 4. Out of scope

- Anything outside your lane's paths in the table above, however wrong it
  looks: write it under "Flags for the lead" in your notes file.
- The simulation (`src/sim/`), the network layer, the rooms' layouts,
  collision boxes and tuning numbers. Collision never depends on art.
- `docs/vision.md` (a brief never needs it).
- Doors, plates, gates, windows, curtains, decoration and effects (the props lane). The renderer (the world lane).

## 5. Decided, and open

Decided: everything in the contract and in section 2. The owner judges
the result by looking; nothing waits on them. Open: nothing a
session should ask the owner. If you would stop to ask, decide from their
words above, mark it `DRAFT:`, write it under "Decisions" in your notes
file, and keep going.

## 6. How it gets verified

`preview.py` is a faithful little reference renderer: it reads a real room file, applies the contract's autotile rule (including "outside the room looks solid"), top and under pieces, one-way runs, the back wall and the backdrop layers at a given camera position, and writes 320×180 views (several camera positions per room, at 4×), each tile image at 4× with a grid, and the seam tests. Look at every room's views beside the S00-01 320×180 phone previews and the quiet environment studies. When the world lane's renderer is on `main`, pull, run the real game and compare its screenshots with your reference views room by room; differences go in your notes file.

Then the pre-push gate in `docs/verifying-and-finishing.md`: `npm run
build`, `npm run check`, `npm run e2e`, all green, after the final
`git pull --rebase origin main`. After your push, wait for the deploy and
run `npm run check:deployed` and `npm run check:live`; if live is broken
by your push, fix forward at once or revert, and say which.

## 7. Done

Tile images for four themes: (1) grass and old stone for `courtyard`; (2) a town street under the castle for `castle-street` (cobbled ground, plastered and timbered building blocks, tiled roofs as the walkable top of buildings); (3) royal castle interior for `throne-room`, `hall-gallery` and `graybox-hall` (pale trim on lilac stone blocks); (4) a dark cellar for `undercroft`. Each has the full 4×4 block, four inner-corner overlays, at least four fill variants, top pieces with `[-1,-1]` weights so the edge is not a fringe everywhere, under pieces, the four one-way pieces (a ledge that clearly reads as "you can jump up through this"), and back-wall cells for indoor themes. The walkable top edge is the clearest line on screen. Backdrops per room: outdoors a banded sky, clouds, a far layer and a mid layer; indoors the back wall plus one slow layer of tall windows with pale light, pillars or banners; every layer tiles sideways without a seam. Six atlas files and six backdrop files to the contract. Pushed, live, notes file written.

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
message, "look lane tiles done at <commit>", plus at most three lines on
what is weakest; your final message says no more than that.
