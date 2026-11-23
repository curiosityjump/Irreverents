# Step 5, slice A: the phone essentials before the owner's morning

Written by the Step 5 lead (`session_017WiGzJfkNbzJfpRVPhWoeK`),
2026-11-23 09:00 UTC. Plan step: `docs/plan/step-5.md`.

**The clock is part of the task.** The owner wakes and plays with their
brother-in-law on two iPhones. **Stop building at 10:10 UTC** whatever is
left: each numbered part below is its own small, green push, in this
order, so stopping after any of them leaves `main` whole. A part not
finished by then is not pushed (discard it, or leave a note in
`docs/for-the-lead.md` saying how far it got). Check `date -u` before
starting each part.

## The task, and the measure

Make the live game sit properly on every iPhone size and tell us what
goes wrong on a real one. Moves no number in `docs/plan.md`'s table: M2
and gate F must stay green. It is what makes "two people open it on
their iPhones" true beyond the one phone size the script checks today.

## What I measured (09:00 UTC, `main` at b889437, local server, headless Chromium with touch)

Canvas box and controls at five iPhone landscape sizes (CSS px):

| Screen | Phones | View | Controls cover the view? | Button |
|---|---|---|---|---|
| 568×320 @2x | SE 1st gen | 320×180 at 124,70 | no | 50 px |
| 667×375 @2x | SE 2/3, 6/7/8 | 640×360 at 14,8 | **yes, the stick and all 5 buttons** | 76 px |
| 736×414 @3x | 6/7/8 Plus | 640×360 at 48,27 | **yes, the stick and all 5 buttons** | 76 px |
| 750×340 @3x | Playwright's "iPhone 14 landscape" | bars beside it | no (e2e fact c2) | 84 px |
| 844×390 @3x | 12/13/14 | 533×300 at 155,45 | no | 65 px |
| 932×430 @3x | Pro Max | 640×360 at 146,35 | no | 61 px |

At 667×375 the five 76 px circles and their borders hide roughly the
right third of the lower half of the room (a crate and a ledge sit under
"Jump" and "Use"); the stick hides the bottom-left corner. `npm run e2e`
passes today: fact (c2) only looks at 750×340, fact (g) at 390×664
upright. The cause is the `else if (lz.width < BAR_NEEDED - 2 * gap)`
branch in `src/client/shell.ts` (the `DRAFT:` there says so).

The delivered button art is in the repository but not in the game:
`docs/design-library/03-visual-direction-and-assets/current-pixel-art-explorations/u08-01-touch-controls-ready-for-prototype/`
(six 24×24 icons, normal and pressed: left, right, jump, attack,
grab/throw, special; `manifest.json` has the frames; read
`readme-for-claude.txt`). The game has five actions
(`content/actions/`: attack, grab, interact, jump, switch), so
`interact` ("Use") and `switch` have no icon of their own.
`scripts/build.ts` line 62 copies a top-level `assets/` folder to
`dist/public/assets` if it exists; it does not exist yet. The server
already serves `.png` (`src/server/main.ts` line 73).

The page reports nothing: there is no `window.onerror` handler and no
route but `/`, `/healthz` and `/ws` (`grep -n "debug\|onerror" -r src`
finds neither).

A player whose page goes away stands still for 15 s
(`content/net.json` `staleSeconds`; `src/server/game.ts` line 214 sets
`staleAt`) and then vanishes, with nothing shown to the other player.

## The parts, in order

### 1. No control hides the play field on a 16:9 phone

Decided in `docs/plan/step-5.md` ("Controls never hide the game"): where
the view fills the screen the controls are **see-through, small in art
and large in touch area**. So in the no-bars case: draw each control as
its icon only (part 2's art; until then a small faint glyph or label),
no filled disc, no big border; keep the touch target at least 44 px
(60 or more where it fits); pressed state still visible. Lay them out to
hide as little as possible: hug the bottom corners and the right edge.
You may also let the view give up one size step where that produces
usable bars; at 667×375 it does not (3x leaves 93 px bars, under
`BAR_NEEDED`), so see-through is the answer there. Mark it `DRAFT:`.

The camera keeping the player clear of the controls is **not** in this
slice (the camera is Step 3's, `src/client/draw/room.ts`).

Check: a new e2e fact at **667×375 @2x and 736×414 @3x**, touch on,
asserting every action and the stick is shown, on screen, not under a
safe-area inset, at least 44 px to touch, and that the *painted* part of
the controls covers less of the view than a number you measure and pin
(state the before number, which is today's layout, in the commit).
Control: with the old layout the fact fails. Save a screenshot of each
size in `e2e-out/` and **read them** (rung 5); attach nothing, say in
the commit what you saw.

### 2. The delivered button art

Copy the icons you use into `assets/ui/touch/` (new folder; Step 8 owns
`assets/**` and is not open yet, so this is yours tonight; plain file
names, no proposed names in ids). Draw them with
`image-rendering: pixelated` at a whole multiple of 24 px (2x = 48 px,
3x = 72 px), normal and pressed. Mapping, `DRAFT:` and logged in
`docs/decisions-log.md`: left/right on the stick; jump, attack, grab as
delivered; **"special" for `switch`**; `interact` keeps a text label
("Use") in the same quiet style until art exists. The mapping from an
action id to its icon is data, not a list in code: an optional field on
the action file (additive; `content/actions/**` is Step 2's, the field
is the only thing you add, and the content kind's validator must accept
it) or a small map beside the touch layer if the validator fights you
past ten minutes. An action with no icon must still get a button with
its label (`INTENT:` in `src/client/touch.ts`: every action has a touch
control, checked by script).

Check: e2e facts (c2), (g) and part 1's fact still pass; screenshots at
750×340, 667×375 and upright read back. If an image fails to load the
button must still show its label (control: rename one file locally and
look).

### 3. What goes wrong on a real iPhone reaches us

Nobody here can run Safari. The page reports its own trouble to the
server: an uncaught error, an unhandled rejection, a script or image
that failed to load, a socket that will not open after its retries.
Each report: the message and stack (trimmed), the page's build
(`<meta name="build">`), screen size and pixel ratio, upright or not,
the user-agent string, a time. **No player id, no name, no room, no
address.** The server keeps the last 200 in memory (not on the volume)
and serves them as JSON at `GET /debug/errors`. Rate-limit by plain
count (for example 20 per page load, bodies cut at 4 kB) so a loop
cannot flood it. `/healthz` keeps its three `INTENT:` field names;
adding an `errors` count beside them is allowed (additive).

Check: an e2e fact that throws an error inside the page and finds it at
`/debug/errors` with the build and screen size, and that the existing
"(errors) no page raised an error" fact still holds before that
(control: with the reporter not installed the fact fails). Add a line
to `docs/mechanisms/README.md` and a short writeup (or a section in
`docs/mechanisms/network.md`) saying where to read it.

### 4. A friend whose page went away looks away, not frozen

Only if it is before 09:50 UTC when you reach it. While a player is
stale (between the socket closing and `staleSeconds`), the other
player's screen draws that character visibly "away" (dimmed, or a small
mark; `DRAFT:`). The network layer copies the whole world, so a field
on the player's entity arrives by itself (`docs/mechanisms/network.md`;
read it before touching `src/server/game.ts`). Drawing bodies is
`src/client/draw/entities.ts`, Step 2's file: add the smallest possible
change there, or a new file in `src/client/draw/` with one line in
`render.ts`, which is the rule. Check: an e2e fact (close one page,
the other draws it away within 2 s, gone after `staleSeconds`; use a
short `staleSeconds` only if the script can set it without a content
edit, otherwise assert only the first half).

## Traps

- **A code push takes the live game down for about a minute and empties
  the world.** Before each push: `curl -s
  https://irreverents-production.up.railway.app/healthz` and look at
  `players`. If it is not 0, someone is playing: do not push; write to
  `docs/for-the-lead.md` and message me.
- **Others are pushing.** Step 2's worker is adding facts to
  `scripts/e2e.ts` right now. Put your facts in a new file in
  `scripts/checks/` with one call line in `e2e.ts`, and
  `git pull --rebase origin main` right before each push; re-run the
  gate if anything but documents came in.
- **Fact (h) keeps the server down for 75 s**: `E2E_DOWN_MS=3000 npm run
  e2e` while you work on other facts; the full run once before a push.
- **Playwright is preinstalled globally.** Never run `playwright
  install`; the npm scripts set `NODE_PATH`.
- **The canvas is sized in device pixels on purpose** (`INTENT:` in
  `shell.ts`); icons scale by whole multiples for the same reason.
  Blurry is a failure even when the fact passes: look.
- **Safe-area insets are 0 in headless Chromium.** `shell.ts` reads them
  from `#safe`'s padding; to test "not under an inset", set that
  element's padding from the script (for example 47 px left and right,
  21 px bottom, an iPhone 14 sideways) and re-run the layout, rather
  than assuming.
- **`pointerdown` on an `<img>`** starts a drag or a long-press menu on
  iPhone Safari. Use a background image or `pointer-events: none` on
  the image inside the button, `draggable="false"`.
- **The existing handlers that stop zoom, selection and pull-to-refresh
  are `INTENT:`**; do not loosen them to make something easier.

## Out of scope: you will notice these, leave them

- Two tabs on one device being one player; the name field; the menu and
  "I'm stuck"; presence arrows at the screen edge; home-screen install;
  delay and loss injection. All Step 5's, all after the owner has played.
- The upright hint's wording, the status pill, the line of help text.
- Sound, sprites for characters, the camera.
- Anything in `src/sim/**` and `content/**` except the one optional
  field in part 2 and, in part 4, one additive field on a player's
  entity.
- The soft 8 px text in speech boxes (Step 8's call).

## Decided, and open

Decided: everything under "What's decided" in `docs/plan/step-5.md`;
the mapping and the see-through choice above are mine, `DRAFT:`, and go
in `docs/decisions-log.md` with how to undo them (you write the entries
as you build). **Nothing is open for the owner.** If you would stop to
ask them, decide from their words in the step file, mark it `DRAFT:`,
log it, go on.

## Verified how

Each part: `npm run build && npm run check && npm run e2e` (rung 3 and
4), its own fact with a control watched to fail, and the screenshots
read back (rung 5). After each push: `npm run check:deployed`, then
`npm run check:live`. What only a real iPhone can show (Safari's bars,
the real insets, thumbs) is not verifiable here: say so in the commit.

## Done

Parts 1 to 3 pushed to `main`, each green and live, or the clock
stopped you and `main` is whole. SOP phase 6 rows this triggers: the
decisions log (the `DRAFT:` choices), `docs/mechanisms/` (the error
report), `docs/architecture.md` if you add the action field, and the
"Owed by Step 1" list in `docs/plan/step-5.md` (strike what you
closed). Leave this brief in place: the lead deletes it at review.

## Where questions and the report go

A blocking question: message the lead, session
`session_017WiGzJfkNbzJfpRVPhWoeK` (`send_message`), and carry on with
the next part meanwhile. Flags and notes: `docs/for-the-lead.md`. The
honest report is the commit messages. **When you finish or the clock
stops you, send one line to the lead's session** ("step-5-a done at
<commit>" or "stopped at <commit>, part N not pushed"); your final chat
message says no more than that.
