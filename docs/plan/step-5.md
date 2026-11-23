# Step 5 — Comfortable on an iPhone, easy to play together

**Reference.** Plan step; its status line is in docs/plan.md.

## Why

**Owner (Drive, doc 11, D-093):**
> IRREVERENTS IS PRIMARILY AN IPHONE BROWSER / WEBAPP GAME. … Mobile touch ergonomics, legible pixels and actual phone performance are top-level requirements.

**Owner, 2026-11-23, first-hand** (`docs/vision.md`, "The measure"):
> I want to be playing the game having fun with it with my brother in law tomorrow morning.

Step 1 proves two players can share a world. This step makes that
pleasant for two people holding iPhones who have never seen the game.

## Goal

Two people open the address on their iPhones, turn them sideways, and are
playing together within seconds: the game fills the screen, two thumbs
reach everything, each can tell the other is there and where, a dropped
connection or a locked phone mends itself, and nobody needed
instructions longer than a glance.

## What's decided

- **Touch reaches every action.** Every entry in the abstract action list
  has a touch control, checked by script, so a step that adds an action
  cannot leave phones behind.
- **Few, context-sensitive controls** (doc 33: "not a dozen tiny virtual
  buttons"); move with one thumb, act with the other; two fingers at once
  must work (run and jump).
- **Landscape first; an upright phone can still play.** Held upright,
  the page shows the same 320×180 view across the top with the controls
  below it (nothing covers the view), and one dismissible line about
  turning the phone and rotation lock. Never a screen that only says
  "turn your phone": with rotation lock on, that is a place a player
  cannot leave (`INTENT:` there is always a way out). Step 1 lands the
  bare version; this step makes both layouts comfortable. Orientation is
  open in the library; `DRAFT:`.
- **Controls never hide the game** (doc 33: "UI should not cover secret
  entrances or enemies"). Put them in the bars beside the 16:9 view where
  the phone is wider than the view (most iPhones held sideways); where
  the view fills the screen they are see-through, small in art and large
  in touch area, and the camera keeps the player's own character and what
  stands beside it clear of them. `DRAFT:`. The touch-button art is
  delivered (`docs/mechanisms/asset-requests.md`, U08-01).
- **The owner's cantina tap rule is a control anchor** for later (doc 33:
  tap a roaming character, then tap the party member to replace; attack
  is distinct from tap). Don't build the cantina; don't make a layout
  that rules it out.
- **Presence:** each player has a colour or mark; a friend off-screen or
  in another room is indicated at the screen edge; joining and leaving
  are visible.
- **It mends itself, and a reload is still you.** A lost socket, a slept
  tab or a network change ends with the player back in the world, same
  character, without a reload. A page reload (pull-to-refresh, Safari
  dropping the tab, the page's own reload after a deploy) ends with the
  same player too: Step 1 keeps a player id on the device; this step
  makes sure the name, the party member if it is still free, and the
  credit on Hall records carry over (doc 33: "A page refresh / device
  switch should not inadvertently wipe … Hall of Legends records"). While
  mending, the screen says so.
- **There is always a way out:** a small menu, reachable by touch, with at
  least "I'm stuck" (back to the room's entrance) and a way to leave.
  "I'm stuck" moves the body and nothing else: it clears no alarm, alert
  or pursuit, and pursuers keep their target (D-077: "a level transition
  never automatically resets pursuit"). Agree the hook with Step 4
  through `docs/architecture.md`. `INTENT:` on the exit, `DRAFT:` on
  where it puts you.
- **What goes wrong on a real iPhone reaches us.** Nobody here can run
  Safari, so the page reports its own errors (an uncaught error, a failed
  load, a socket that will not open) to the server, which keeps the last
  few hundred where a session can read them (for example `/debug/errors`).
  It is how the morning's first real-iPhone minute gets debugged without
  the owner describing a blank screen. No personal data: the error, the
  page's build, the screen size.
- **No accounts, no sign-in.** A name is optional and remembered on the
  device.
- **Home-screen install is allowed** (the library leaves it open): iPhone
  Safari has no full-screen button for a page, so a web-app manifest that
  lets the owner add it to the home screen and play without browser bars
  is worth its few lines. `DRAFT:`.

## What's open (the lead's to measure and decide)

- The layout itself: stick or pad, sizes, where the menu sits. Read
  `docs/design-library/02-gameplay-systems/33-iphone-browser-platform-and-github-to-railway-delivery.md`
  in full first. A touch-button art request is already on order through
  Vision Partner (`docs/mechanisms/asset-requests.md`, U08-01).
- How much on-screen help a first-time player needs; prefer showing the
  controls doing something over text.

## Feedback signal

1. `npm run check`: every action in the action list has a touch control
   (control: an action with none fails).
2. `npm run e2e`, iPhone-sized viewports (landscape at least 667×375,
   750×340 and 844×390, and one upright): no control sits under a
   safe-area inset or off-screen, none overlaps the game view where bars
   exist beside it, and the upright page can move and jump; run
   and jump at once by two touches. (Reading the screenshots back and
   comparing them is your rung 5 of `docs/verifying-and-finishing.md`,
   and the owner's taste; it is not this signal.)
3. After a full page reload the player has the same id, name and party
   member. And mending: the script cuts the socket, and separately hides and shows the
   page; each time the player is back in the world within ten seconds as
   the same character, with no reload.
4. With 150 ms of delay each way and a few dropped messages injected, two
   players still see each other move without teleporting across the room.
5. `npm run check:live` and gate F (landed by Step 1) stay green after
   every push of yours, and this step adds its own gate F scenario: a
   client whose connection is cut comes back as the same character
   (control: with rejoin switched off it fails).

## Stopping condition

The five signals pass on `main` and live, and the closing report lists
what only a real iPhone can show (below). **Budget:** closed by about
09:30 UTC, 2026-11-23.

## Owns

Everything the player touches and reads on screen that is not the world
itself: touch and keyboard input, the on-screen controls, presence,
joining and rejoining, the menu, the page shell; exact paths as
`docs/architecture.md` assigns them. Opens when Step 1 closes (Step 1
owns these files until then).

## Taste, for the owner in the morning

How the controls feel under real thumbs on a real iPhone, in Safari, which
nobody here can run; whether anything is too small to read; sound.

## Owed by Step 1

Left by the Step 1 Gate 2 worker (2026-11-23); each is `DRAFT:` at its
site.

- ~~**A 16:9 phone held sideways** has no bars beside the view, so the
  touch controls overlap the view's bottom corners.~~ Closed by slice A
  part 1 (2026-11-23): there the controls are see-through and hug the
  corners (`docs/mechanisms/network.md`, "The page shell"). The camera
  keeping the player clear of them is still not built.
- ~~**The delivered touch-button art** (U08-01) is not wired in.~~ Closed
  by slice A part 2: in use from `assets/ui/touch/`; `interact` has no
  picture and shows its label.
- **Two tabs on one device are one player** (the id is in
  `localStorage`); the newer tab takes the character and the older one
  keeps retrying.
- **Nothing tells the others a player's page went away**: the character
  stands still for `staleSeconds` (15) and then disappears.
- Nothing here has been on a real iPhone.

## Measure

Lead `session_017WiGzJfkNbzJfpRVPhWoeK`, 09:00 UTC, `main` at b889437,
local server, headless Chromium with touch. Whether the controls cover
the view, by landscape size: 568×320 no; **667×375 (SE 2/3, 6/7/8) yes,
the stick and all five buttons**; **736×414 (Plus) yes, all**; 750×340
no; 844×390 no; 932×430 no. `npm run e2e` is green meanwhile: it looks
only at 750×340 and upright 390×664. No error reporting exists; the
button art is in the library mirror, not in `assets/`.

## Briefs

- `handoff-prompts/step-5-a-phone-essentials.md` (running from 09:00
  UTC, stops building at 10:10): no control hides the view on a 16:9
  phone; the delivered button art; the page reports its own errors to
  `/debug/errors`; a friend whose page went away looks away. Everything
  else in this step waits until the owner has played.

- **Slice A parts 1 to 3 reviewed by re-running** (lead, 09:32 UTC, at
  3f3150d): `npm run build`, `npm run check` and the full `npm run e2e`
  green here; screenshots read at 667×375, 750×340 and upright (icons
  crisp, the crate and ledge that were hidden are visible, "Use" is a
  word); control watched: with the controls painted solid, facts
  i-667x375 and i-736x414 both fail; the live address answers
  `/debug/errors` (empty) and `/healthz` counts `errors`. Not verified:
  the error report's own control (the worker's), and anything on a real
  iPhone. Part 4 (a friend who went away) still with the worker.

## Open with the owner

## Handoff notes

- **From the Step 1 lead (`session_017WiGzEwLs3ng2ZPpRZgctn`), 08:53 UTC,
  for whoever claims this step.** I am not taking Step 5: this session's
  context is over half a million tokens, and every turn re-reads it out
  of a shared, tight allowance; a fresh lead is cheaper and reads better.
  What I know that the documents do not put in one place: the touch
  layer and the page shell are `src/client/shell.ts` and the files beside
  it, built from `content/actions/`; `npm run e2e` fact (c2) already
  asserts "no control covers the play field, none off screen, none under
  44 px" but **only at 750×340** (Playwright's `iPhone 14 landscape`),
  where there are bars beside the view. The overlap in "Owed by Step 1"
  shows on an exactly-16:9 phone (667×375, the iPhone SE/8 size, is the
  one to add to e2e and screenshot first) and probably on any phone where
  Safari's bars eat height. Fact (g) covers upright at 390×664. Read the
  three screenshots in `e2e-out/` before and after; that is the gate. A
  code push restarts the server for about a minute: look at `players` in
  `/healthz` first.
