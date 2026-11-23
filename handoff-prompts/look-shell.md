# Brief: the look, lane "shell" — the page around the game, upright and sideways

**Scratch.** Delete this file when the lane has shipped. Written
2026-11-23 by the orchestrator `session_017WiGzHX8g2sXimNRnqp2oZ`, who is acting as Step 8's lead
(`docs/plan/step-8.md`, "The look, from 2026-11-23 11:11 UTC").

## 1. The task, and the measure

Make the page itself feel like a game on an iPhone held either way. The owner: "It should play well in portrait too, not just landscape. Looks awful in both right now". Upright, the game picture must be big and the controls a comfortable game pad; sideways, the picture fills the screen; nowhere a dead black page.

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
- Read off the owner's screenshot (iPhone, upright, 390×844 points; re-measure it yourself with Playwright at that size before changing anything): the game picture is about 320×180 points at the very top, narrower than the screen (one game pixel on three device pixels); under it a line of browser-default text, "Better sideways. If turning does nothing, switch off rotation lock.", with a round close button; then roughly 240 points of near-black nothing; then seven controls in the bottom 210 points (left and right at the bottom left; jump, grab and attack in a loose cluster on the right; "Use" as a bare word with no picture; one more round button above them), each about 44 points across.
- Read `docs/plan/step-5.md`, the mechanism docs for the shell and touch layout (grep `docs/mechanisms` for "shell" and "touch"), `src/client/shell.ts` and `touch.ts` in full with every `INTENT:` (the canvas is sized in device pixels so each game pixel covers a whole number of them: keep that), and `scripts/e2e.ts` for what the scripted checks measure about layout (nothing important under a touch control; both holds).
- **The renderer's view becomes a variable.** In `src/client/render.ts` add, directly under the `VIEW_H` line, exactly this line: `export const view = { w: VIEW_W, h: VIEW_H };`. The world lane owns that file, adds the identical line and makes all drawing read `view.w` / `view.h`. You set `view.w` and `view.h` on layout. Until the world lane's change is on `main`, make the least change you need in your own clone to test, and when your rebase conflicts in `render.ts` take theirs.
- Every action file in `content/actions/` gets a button; a picture comes from the action file's optional `icon` (`docs/architecture.md`, "touch control"). The props lane is drawing the "Use" button's picture and wiring its `icon`.

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
  `docs/mechanisms/phone-shell-look.md`**, under the headings "What exists", "Deviations from the
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
- **Upright is a first-class way to play** (the owner's words above). The line telling players it is "Better sideways" contradicts that: check whether it carries an `INTENT:` quoting the owner; if it does not, remove the advice (keep a way to dismiss anything you show); if it does, leave it and flag it.
- **There is always a way out.** Every state keeps its exit; every exit you add is marked `INTENT:`.
- **Safe areas:** the notch and the home bar, on both holds.
- **`main.ts` is shared with the sound lane by six marked lines** ("// audio hook (Step 8)"). Yours is the file; keep their lines when they arrive.

## 4. Out of scope

- Anything outside your lane's paths in the table above, however wrong it
  looks: write it under "Flags for the lead" in your notes file.
- The simulation (`src/sim/`), the network layer, the rooms' layouts,
  collision boxes and tuning numbers. Collision never depends on art.
- `docs/vision.md` (a brief never needs it).
- Everything in `src/client/draw/`; the content kinds; all art (the "Use" picture is the props lane's); sound.

## 5. Decided, and open

Decided: everything in the contract and in section 2. The owner judges
the result by looking; nothing waits on them. Open: nothing a
session should ask the owner. If you would stop to ask, decide from their
words above, mark it `DRAFT:`, write it under "Decisions" in your notes
file, and keep going.

## 6. How it gets verified

Playwright emulating an iPhone both ways (390×844 and 844×390, deviceScaleFactor 3, touch): screenshot each, look, measure the picture's size on screen in points and each control's size, and play: run, jump, attack, grab and throw, switch hero, use a door, by touch, on both holds. `npm run e2e` green.

Then the pre-push gate in `docs/verifying-and-finishing.md`: `npm run
build`, `npm run check`, `npm run e2e`, all green, after the final
`git pull --rebase origin main`. After your push, wait for the deploy and
run `npm run check:deployed` and `npm run check:live`; if live is broken
by your push, fix forward at once or revert, and say which.

## 7. Done

Upright: the view is narrower and taller than sideways (about 14 to 15 tiles wide and at least square, taller where the screen allows), at a whole-number scale, so the picture fills the top half of the screen edge to edge and characters are large; `view.w` / `view.h` and the canvas follow the hold and re-layout on rotation and resize. Controls in the lower part, at least 56 points each, arranged as a game pad: left and right under the left thumb, the action buttons in an arc under the right thumb, pixel-crisp at whole-number scale; a missing icon still shows the word. Sideways: the picture fills the screen and the controls overlay its lower corners, semi-transparent. No dead black: a dark, quiet, deliberate surround in the contract's night ramp, a thin pale frame round the picture, any text in a small tidy type that is not a browser default. Pushed, live, notes file written.

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
message, "look lane shell done at <commit>", plus at most three lines on
what is weakest; your final message says no more than that.
