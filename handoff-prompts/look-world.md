# Brief: the look, lane "world" — how the world is drawn

**Scratch.** Delete this file when the lane has shipped. Written
2026-11-23 by the orchestrator `session_017WiGzHX8g2sXimNRnqp2oZ`, who is acting as Step 8's lead
(`docs/plan/step-8.md`, "The look, from 2026-11-23 11:11 UTC").

## 1. The task, and the measure

Implement the contract's world side in the renderer: backdrops with parallax, ground that joins up (autotile), doors and working parts through looks, the bell and alert marks through looks, decoration layers, the contract's draw order, and a view whose size is no longer a constant.

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
- The foundation lane's commit (the one that adds `src/client/draw/looks.ts`) brings the content kinds for the contract and the `look` / `drawLook` / `drawNine` helpers you draw through. Start by reading and designing; pull every few minutes; code against its exported names once it is there. If it is not on `main` thirty minutes after you start, tell the orchestrator and keep going against the contract's shapes.
- Today's renderer: `src/client/render.ts` (45 lines; the frame is `VIEW_W` × `VIEW_H` = 320×180), `src/client/draw/room.ts` (`roomOrigin`, `drawRoom`, `drawDoors`), `room-parts.ts`, `alert.ts`. Read every `INTENT:` in them.
- **The view becomes a variable.** Add, directly under the `VIEW_H` line in `render.ts`, exactly this line: `export const view = { w: VIEW_W, h: VIEW_H };` and read `view.w` / `view.h` everywhere the frame size is used. The shell lane adds the identical line and sets `view.w` and `view.h` for an upright phone; rooms, backdrops and the camera must behave at any size from about 190×180 to 320×260.
- The tiles lane is writing a reference renderer in Python from the same contract (`tools/art/tiles/preview.py`) and is told to record how it resolved each ambiguity in `tools/art/tiles/README.md`. When it is on `main`, the game must match its pictures.

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
  `docs/mechanisms/rendering-world.md`**, under the headings "What exists", "Deviations from the
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
- **The real art is being drawn by other lanes and arrives on `main`
  while you work.** Pull every so often and test with it once it is there.
  Until then prove your code with small throwaway test art (coloured,
  numbered cells) that you never commit. Your code must be right from the
  contract alone, and with no art file present everything must look and
  behave exactly as before: the `test-*` rooms and the scripted checks
  rely on the plain shapes.
- **Phones.** Keep 60 frames a second on an iPhone: no per-frame
  allocation storms; cache what does not change in offscreen canvases.
  Nothing random: two screens must show the same thing (use ticks and
  position hashes).
- **"The code looks right" is not a look.** Drive the real page with
  Playwright at iPhone size (390×844 and 844×390, deviceScaleFactor 3,
  touch), open the screenshots with the Read tool and judge with your
  eyes.
- **A secret must stay a secret with real art.** "Looks solid" is the contract's definition. Build that set once (per frame or per change) from the room file plus the working parts' state (false walls, unbroken wall-look breakables, hidden walk doors, outside the room) and feed the same set to the ground and to the parts, so a false wall and a hidden door are indistinguishable from the wall around them at every edge and corner, including the top and under pieces. This is the rule `room-parts.ts` enforces today with flat colours; keep its `INTENT:` comments.
- **Parts stay drawn behind bodies** (`docs/decisions-log.md`), and **doors carry no arrow, glow or text**.
- **`render.ts` is shared with the shell lane by one line.** Yours is the file; theirs is that one line. If your rebase conflicts there, keep yours and make sure the `view` line is present once.
- The screen shake in `impact.ts` redraws the finished frame; keep it working whatever the order.

## 4. Out of scope

- Anything outside your lane's paths in the table above, however wrong it
  looks: write it under "Flags for the lead" in your notes file.
- The simulation (`src/sim/`), the network layer, the rooms' layouts,
  collision boxes and tuning numbers. Collision never depends on art.
- `docs/vision.md` (a brief never needs it).
- `sprites.ts`, `entities.ts`, `npcs.ts`, `impact.ts`, `away.ts`, `audience.ts` (the actors lane); `shell.ts`, `touch.ts`, `main.ts` (the shell lane); `looks.ts` and the content kinds (the foundation lane); all art.

## 5. Decided, and open

Decided: everything in the contract and in section 2. The owner judges
the result by looking; nothing waits on them. Open: nothing a
session should ask the owner. If you would stop to ask, decide from their
words above, mark it `DRAFT:`, write it under "Decisions" in your notes
file, and keep going.

## 6. How it gets verified

Generate a small throwaway atlas, backdrop, decor and looks set, render every map room at 320×180 and at an upright view through the real page with Playwright, and look: every one of the 16 cases lands where it should, corners are closed, one-way runs have ends, the throne room's false wall and the hidden doors cannot be told from wall, nothing floats, no black void beyond a room's edge. When the tiles and props lanes' art is on `main`, pull and repeat with the real art, comparing with the tiles lane's reference views.

Then the pre-push gate in `docs/verifying-and-finishing.md`: `npm run
build`, `npm run check`, `npm run e2e`, all green, after the final
`git pull --rebase origin main`. After your push, wait for the deploy and
run `npm run check:deployed` and `npm run check:live`; if live is broken
by your push, fix forward at once or revert, and say which.

## 7. Done

Backdrops (banded sky, layers with parallax, wrap and top/bottom pinning, the indoor back wall behind every tile that does not look solid); autotile exactly as the contract defines it (4×4 block, inner corners, hash-chosen fills, top and under pieces, one-way runs), with the ground continued beyond a room's edge so there is no void; doors and parts through looks (the per-part `part:<room>:<part>` id first, then the generic sized id, then today's plain shape); the bell and alert marks through looks; decoration `far`, `back`, `front` in the contract's order; marks over heads above front decoration; a room with no art files looks exactly as before. Pushed, live, notes file written (`docs/mechanisms/rendering-world.md`).

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
message, "look lane world done at <commit>", plus at most three lines on
what is weakest; your final message says no more than that.
