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
- ~~**Nothing tells the others a player's page went away.**~~ Closed by
  slice A part 4: the character is drawn dimmed with three dots while
  its page is gone or silent, then removed after `staleSeconds` (15) as
  before (`docs/mechanisms/network.md`, "A page that went away").
- Nothing here has been on a real iPhone.

## Measure

Lead `session_017WiGzJfkNbzJfpRVPhWoeK`, 09:00 UTC, `main` at b889437,
local server, headless Chromium with touch. Whether the controls cover
the view, by landscape size: 568×320 no; **667×375 (SE 2/3, 6/7/8) yes,
the stick and all five buttons**; **736×414 (Plus) yes, all**; 750×340
no; 844×390 no; 932×430 no. `npm run e2e` is green meanwhile: it looks
only at 750×340 and upright 390×664. No error reporting exists; the
button art is in the library mirror, not in `assets/`.

- **Hit lands at once, builder (`session_017WiGzGPRoCXeC3TG8HFyxh`),
  2026-11-23 (brief `handoff-prompts/step-5-hit-lands-at-once.md`), push 1:**
  - Built: `src/net/predict.ts` (`docs/mechanisms/network.md`, "Predicted
    hits"). Measured with 150 ms added each way: the star went from 716 ms
    to 103–136 ms after the press, and the crate's first movement from
    833 ms to 251–283 ms. Both pages draw it at rest 0.0 px apart. The e2e
    ran three times green after the last code change (two of them after the
    throw guard), and the control `E2E_NO_PREDICT=1` fails `hit-star` and
    `hit-moves`.
  - The brief's movement target "wind-up + the beat + 50" is read as the
    beat **as held**: `combat-clock` lets a beat of N ticks go on tick N+1,
    on the server as here. With N it would be 283 ms, which is exactly where
    the page lands.
  - The first version left out `impact-bodies`. The crate then slid 90 px
    past where the server's stopped against another crate, and jumped back
    at the hand-back. Bodies around the lent one are now in its scratch
    world, and its path matched the server's to the pixel in every run seen.
  - `t-throw-friend` failed once (A's page drew B 23 px), on the run before
    the throw guard. The page predicts a plain swing on a throw press
    because it never learns it carries. B was held, so B could not have been
    lent; the failure matches the known flake. After the guard it passed
    twice. The cause of the flake is not found.
  - `src/client/main.ts`: one additive field, `drawn.impacts`, and a
    variable for the drawn bodies (the switch-gap builder's file). In
    `src/client/draw/entities.ts`, one line: the actors lane's cosmetic
    `predictHits` (851eda9) runs only when `predictHitMs` is 0. That was
    asked by the orchestrator, because it could star a body the server never
    hit, and agreed with the actors lane by message.
  - Not done: throws and the grab's lift (item 3), `interpDelayMs` 66
    (item 4). Not verified: the ease back when the server disagrees, and a
    brawl hit on a friend.
  - **Reverted once.** Push 1 (057668b) failed `check:live`'s `fight-back`
    and was reverted (7908aa8). I reproduced it locally behind a proxy
    adding 60 ms each way: 3 hits were predicted and the server landed 2.
    The guard, walking away behind the hero, was drawn in reach about
    100 ms in the past but was out of reach on the server. He was drawn
    knocked 250 px and eased back, the check counted that as a blow and
    stopped tapping before he raged. Proven the cause: the same run with
    `predictHitMs` 0 passed. The fix is a second reach test at where the
    server will have the body (`smoother.ahead`). Before the fix, 3 of 3 runs
    had one false hit. After it, `fight-back` passed 3 of 3 at 60 ms and once
    each at 150 ms and 25 ms, and every predicted hit was confirmed
    (`net.hits`). The look-ahead's extra snapshot wait was set from those
    runs (`DRAFT:`).
  - **Reverted a second time.** d2c6e73 still failed `fight-back` on live,
    and was reverted at b530aa1. Baseline `check:live` on the revert: 2 of 2
    ok. Diagnosed against the live server itself, with this tree's
    `game.js` swapped in through a Playwright route (a scratch runner, not
    kept). The server ran the page's swing about 18 ticks (300 ms) after the
    page did: the input queue adds to the trip, which may be worth Step 1's
    look. Fix: a hit is predicted only if it also reaches the body at twice
    the look-ahead. After that, against live: 3 of 3 ok, with 6 hits
    predicted and all 6 confirmed.
  - **Push 2, throws:** a throw press while the hero is drawn carrying runs
    `throwCarried` on copies, and the thrown body is lent
    (`docs/mechanisms/network.md`, "Predicted hits"). New e2e fact
    `throw-leaves`: from the press, the crate is drawn leaving the hands
    after 17–18 ms; with the control it is 566 ms and the fact fails. The
    first control run threw the crate through a walk door, so it left
    without ever being drawn moving: the fact now throws toward the longer
    floor and counts leaving the room as leaving the hands. Not done: the
    grab's lift.
  - Seen in the gate, not mine: one full e2e failed `h1` (the server-down
    fact; the page was not back within 10 s), the flake Step 16's notes
    already owe a look. The next run was green.
  - Seen in the gate, not mine: one of two full e2e runs failed Step 17's
    `start-link-back`, which ended on the link screen instead of the start
    screen. Nothing it touches changed here.

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
  iPhone.
- **Slice A part 4 reviewed and the slice closed** (lead, 09:50 UTC, at
  e01e5d6, live): build, check and the full e2e green here, fact `away`
  included (away after 106 ms, back after 317 ms, removed after 14.9 s);
  the worker's control (server never marks anyone away) not re-run by
  me. Brief deleted, worker archived.

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

- **From the Step 5 lead (`session_017WiGzJfkNbzJfpRVPhWoeK`), 09:50 UTC,
  slice A closed; the step stays open for after the owner has played.**
  - **First thing in the morning:** `curl -s
    https://irreverents-production.up.railway.app/debug/errors`. It is
    in memory: **a code push empties it**, so read it before pushing.
    Lines marked `scripted-check-…` are `check:live`'s own; anything
    else is a real page.
  - New e2e facts live in `scripts/e2e/` (`phone.ts`, `errors.ts`,
    `away.ts`), not `scripts/checks/`: `npm run check` loads every file
    there as a browserless check.
  - The quiet look (picture or faint label, no disc) is on every
    layout, not only over the view. Over the view the pictures paint
    2.62% of it at 667×375 against a 3% pin (`i-667x375`): bigger
    pictures need the pin raised on purpose.
  - A character is also drawn away after 2.5 s of silence on an open
    socket (a locked phone), so a desktop player who switches tabs
    looks away too. The away veil dims a little of what stands beside
    the body. Both `DRAFT:`.
  - "Switch" wears the `special` picture and "Use" is a word; each is
    one `icon` line in its action file when art exists (an asset need
    for Vision Partner once the owner has seen the controls).
  - Still to build, in the order I would take them: the menu with
    "I'm stuck"; edge arrows for a friend off-screen; the camera
    keeping your character clear of the corner controls on 16:9
    phones (Step 3's file); name and party member across a reload; two
    tabs on one device; the lag test (signal 4); home-screen install.
  - Only a real iPhone can show: Safari's bars and the real insets,
    thumbs on 60 px targets, whether the pictures stay crisp, whether
    Safari fires the events the error report listens for, how soon a
    locked phone goes silent.

- **From the Step 2 lead, 2026-11-23 14:20 UTC (network layer, beside the
  switch gap):** a player's own page has no `c.carrying` for its own
  character (the grab runs on the server), so a throw press makes the page
  predict a swing, now with Step 2's attack wind-up, on the thrower's own
  screen (252e5ce; `docs/mechanisms/rendering-actors.md`, "Flags for the
  lead").

- **Doorways by Use, builder (`session_017WiGzJujVWWDboh12zWhNR`),
  2026-11-23 (brief `handoff-prompts/step-5-doors-by-use.md`):**
  - Measured: no thing is within `npcInteractReach` (20 px) + 8 of any
    enter doorway in any placements file (street counter col 12, goods
    13-15, street bell 24; test-shop and test-street things; the
    cantina bell is 160 px from its doorway, reach 18). The only body
    that near a doorway is the street villain NPC (8 px from
    `to-cantina`), which is not a usable thing. So "the door wins"
    changes no press today; no scenario proves that branch, since none
    can without placing a thing in a doorway.
  - The brief's "castle street's throne-room doorway": the street's
    throne-room connection is a walk door; the new scenario
    `step3-enter-doorway-by-use` mirrors `step3-enter-doorway` (the
    street's building doorway, `street-doorway` ↔ `upper-doorway`), with
    Use in place of the stick. Control: with the Use clause removed from
    `asking`, it fails (no `changed-room` at 330); restored, it passes.
  - Use still buys at a counter: `step4-hero-buys` (and the rest of
    step4-*) unchanged and green.
  - `npc-interact` (order 60) tests the doorway at the tick's start
    position, `room-doors` (600) after physics: a body moving fast
    across a doorway edge on the press tick could lose that press or
    both buy and go through. `DRAFT:`, judged not worth a shape change.
  - The doorway arrow is drawn after the impact shake, so it does not
    shake; fine for now.

- **Orchestrator `session_017WiGzHhke4tkAThPgw6EXs`, 17:58 UTC: doorways by Use (095775b) reviewed** by re-running build, check and e2e at 904c3e9 on a quiet machine (261 ok, e2e ok, its `step3-enter-doorway-by-use` and the touch fact among them) and by its phone-size shots (the Use button reads GO IN, an arrow over the hero). Brief deleted. Owed by the same builder in `handoff-prompts/step-5-switch-gap.md`: the e2e must stop writing its shots into `docs/`.

- **The switch gap, builder (`session_017WiGzJujVWWDboh12zWhNR`),
  2026-11-23 (brief `handoff-prompts/step-5-switch-gap.md`):**
  - Chose the smaller hook: a `taken` list on the World (the page's
    local world only), written by the net client from each snapshot and
    counted by `memberTaken`, not the friends' entities in the local
    world. Nothing local can move or hit a friend; both callers
    (`switch`, the cantina swap) get it through `memberTaken` unchanged.
  - Server: `refuseTaken` in `adopt`, the one written exception to the
    page owning `kind`; it sends `become` and leaves the fourth friend's
    duplicate seat alone (only a *change* of kind, or a rejoin with no
    character left, is checked).
  - The doorway e2e's screenshots now go to `e2e-out/doors/`; the
    committed pair in `docs/plan/step-5-shots/doors/` is unchanged.
  - Not verified: a real refusal racing on two real phones (the server
    check does it on raw sockets); what a player sees in the moment a
    refused switch is put back (a flash of the other hero, about one
    round trip).
  - Flaky, not this change: the friend grab/throw e2e facts
    (`t-grab-friend`, `s-break-free`, `t-throw-friend`, `s-throw-friend`,
    `s-after`) failed in 3 of 14 local runs today: once before any
    switch-gap code existed, twice with it (each time a run alone after
    was green; the base without it, d5e9596, was green once). In a failed
    run the friend moves 5-30 px instead of about 100: the throw does not
    happen, rather than falling short. Worth a look by whoever owns
    `scripts/lib/e2e-touch.ts` and the throw (851eda9 changed it).

## Builder notes

### Buttons (brief `handoff-prompts/owner-better-buttons.md`)

Builder `session_017WiGzJ23ionY6B1PB5Nmme`, 2026-11-24. The owner asked:
"Can we get better player buttons? Do we need new assets for those or do we
have them already somewhere unused?" **Answer: mostly we had them, unused.**
P07's UI atlas has a matching family (round lilac plates with a dark rim,
a d-pad, arrow keys) that nobody had cut; three of seven controls have a
glyph there, the rest have none.

**Every control the phone shows, before this brief** (all 48×24 strips, normal then pressed):

| Control | Drawn from (before) | Approved, unused source? (what I saw) | Now |
|---|---|---|---|
| Stick left / right | U08 `left.png`, `right.png` (grey-green octagon, blue arrow) | **Yes**: P07 d-pad left/right keys (24,918)-(104,1002), (180,918)-(260,1002); also P07 arrow keys (956..1138, 915..1008) | P07 d-pad keys |
| Jump | U08 `jump.png` (chevron) | **Yes**: P07 round button, winged boot, centre (352,965) r 80 | P07 boot button |
| Hit (attack) | U08 `attack.png` (orange burst) | **Yes**: P07 round button, sword, centre (510,963) | P07 sword button |
| Grab | U08 `grab.png` (purple hand) | **Plate yes, glyph no**: no hand anywhere in P07, P05 or the A00 comps | P07 plate (re-authored, below) + U08's hand |
| Use | `assets/ui/use.png` (props lane's DRAFT hand on the U08 plate; MA-01) | **Plate yes, glyph no** (MA-01 stands) | P07 plate + the same DRAFT hand; its words unchanged |
| Switch | U08 `special.png` (gold sparkle) | **Partly**: P07 round star button (666,963) reads "special", as today; P05's swap arrows (353,284,431,344) and party-swap glyph (584,24,768,145) are the only swap pictures and read as a gold blob at 24 px | P07 star button |
| Pressed looks | U08's own pressed halves | **No**: P07 shows no pressed state | derived: plate darkened to 70% and sunk 1 px, glyph kept (DRAFT) |
| "Would do nothing" (dimmed) | none | **No** source; it is a style | CSS: picture at 40%, 70% grey (DRAFT) |
| Stick-up chevron, "Go in" arch, the words | CSS | P07 up-arrow key (770,919,855,1004) exists (asset-coverage `ui:use-go-in`); not this brief's | unchanged |

Looked at myself: P07 `irreverents-pixel-ui-atlas.png` (whole), P05
`p05-ui-hero-party-hud-source.png` and `p05-d-…-preferred-sheet.png`
(whole), A00-01 and A00-03 (no touch controls in either; A00-02/04/05/06
not opened). **The clean plate** has no single source (every P07 round
button has a glyph): it is re-authored from the three, per pixel the mean
of the samples no glyph covers. The cutter is `tools/art/touch/cut.py`
(deterministic); `tools/art/touch/shots.mjs` takes the contact sheet.

**Missing (sent to Vision Partner for the Drive's list):** a grab/throw
glyph in P07's style; the Use glyph (MA-01, already listed); a swap/switch
glyph that reads at 24 px; pressed and disabled frames for the round
plates and the d-pad.

**Contact sheet** (`step-5-shots/buttons/`): `upright-390x664.png`,
`sideways-667x375.png`, `sideways-844x340.png` (each (a) today, (b) P07
with arrow-key stick, (c) P07 with d-pad stick; Jump held down in all), and
`cuts-a-today-b-keys-c-dpad.png` (the strips at 4×, swap arrows last).
**What reads, by my own look:** upright (64 pt buttons) everything reads,
both sticks. Sideways over the view (34 pt pictures): d-pad triangles,
boot, sword and both hands read; the star is the smallest glyph and reads
as a star, not as "switch" (it never did); the arrow keys' shafts thin to
a pixel and read less well than the triangles. The P05 swap arrows do not
read at any size here. **Chose (c).** No glyph fails at 44 px, so no
layout number changed.

**Measured** (1 run each, local server, Chromium emulation): `npm run e2e`
all 91 ok; paint over the view 667×375 2.54% (was 2.79%), 736×414 1.65%,
844×340 1.96%, 750×340 1.74% (limit 3%). A real touch on Jump shows the
pressed half on touchstart and the normal half on release; with
`assets/ui/touch/p07/` refused (404), every control falls back to today's
picture (the control run); at the start spot Use is dimmed and nothing
else is. **Not verified:** on a real iPhone; Switch's dimming with a full
party (rule mirrors `verbs/switch.ts`, not driven).


### Knocked-out enemies fly off (brief `handoff-prompts/owner-knocked-out-flies-off.md`)

Builder `session_017WiGzJC6UCvT2PtVr2dn8v`, 2026-11-24, at a324575.

**The cause.** The blow that knocks a body out also launches it (`verbs/attack.ts`: `launch`, then
`wear` reaches toughness, on the same hit), as any blow does. The page drew a flattened body `down`
before anything else (`stateOf`, `src/client/draw/sprites.ts`), so the blow's beat and whole
flight were drawn lying flat: a collapse, then a body sliding off the screen with nothing seen to
push it. **Shown:** a phone page (150 ms each way) in the castle street knocking out the villain
(not predicted, so the server's blow): drawn lying beside the hero for the beat, then 209 px
leftwards lying down, out of the 375 px view; the server's copy matches frame for frame, so it is
the drawing, not the smoothing. **Fixed** in the client only (`lyingOut`): hurt and tumbling until
the flight is over, then down where it lands. Fact `ko-still-*` (`scripts/e2e/knocked-out.ts`);
its control (the old rule) fails on the watcher's page, 65 px drawn lying against 8 px.

**The table** (the simulation, `src/sim` stepped directly, a grappler or a flyer mashing attack beside
each placed enemy; distance the body moved while flattened; every one lay out its 3 s and got up
where it lay, then walked its routine; none was removed):

| Room | Enemy | Grappler | Flyer |
|---|---|---|---|
| quarry road | toll keeper / watcher (fighter) / heavy | 8 / 50 / 12 px | 22 / 19 / 5 px |
| outpost | lookout / fighter 1 / fighter 2 | 93 / 220 / 56 px | 39 / 119 / 23 px |
| quarry depot | lookout / fighter 1 / fighter 2 / guard (heavy) | 97 / 71 / 43 / 15 px | 32 / 12 / 30 / 19 px |
| castle street | shopkeeper / villain / guard | 219 / 250 / 48 px | 121 / 176 / 32 px |

In the browser (phone, 150 ms each way): the street guard and the villain, drawn against the
server's copy every frame: the drawn body follows the server's within the smoothing delay, no stray
movement, none after getting up. The guard punched from his left flies through the courtyard door
(already noted in `scripts/e2e/fight.ts`).

**Not measured** (no browser run): a wave's arrivals, a dispatch row's guards, a cantina regular.
Doubts, logged not fixed: in a cantina brawl a body knocked flat is put on the next pad at once
(`cantina-out.ts`, D-085), which a remote page draws as a glide at `remoteMaxSpeed` across the room,
not a jump; a removed wave member (`outpost-leave.ts`) vanishes where it stands (ids are never
reused: `<outpost>:w<n>:<i>`). The KO slide itself (up to about 270 px: 520 px/s at the cap,
500 px/s² friction) is the same as any blow's knockback; shortening it is one simulation rule, left
for the owner after playing (`docs/decisions-log.md`, 2026-11-24).

### Flakes (brief `handoff-prompts/step-5-e2e-flakes.md`)

**Measured** by the builder `session_017WiGzJujVWWDboh12zWhNR`,
2026-11-23 21:34-22:44 UTC: 10 serial `npm run e2e` runs at `main` 54ce74b
on a quiet machine (the container restarted at 21:33; nothing else running,
4 cores, 1-minute load 0.8-2.1 during the runs, which is the run itself).
Each run reports 87 facts. **4 runs of 10 had at least one failure.**
`npm run e2e` cannot run one part (its only switch is `--live`), so the
"`h1`/`h2` and friend-grab alone" rates were not taken.

| Fact | Failures of 10 | Run | The failing line |
|---|---|---|---|
| `cantina-row` | 2 | 5, 10 | "a tap on a wandering hero outside the party (brawler) opened the party row: nothing drawn" |
| `cantina-swap`, `cantina-switch` | 1 | 8 | "a tap on no free chip put brawler in the party …" (the row did not open again within 2 s, so no chip was found; switch then never reached the brawler) |
| `t-throw-friend` | 1 | 5 | "A's page drew B NOT fly: 19 px from where it was, 29 px of it inside a quarter second" (the fact wants 40 px in a quarter second; a good throw is about 100) |
| `h1`, `h2` | 1 | 9 | h1: "the desktop page said "Reconnecting…" (and still at the end), its player could still move: true; it did NOT come back within 10 s of the server returning"; h2 (the next restart): "reloaded 0 time(s) … did NOT pick up the new build and is reconnecting" |
| `t-grab-friend`, `s-break-free`, `level-*`, `start-*` | 0 | | |

**Evidence so far, and the next step for each** (not yet a verdict; no
fault fixed):

- **`h1`/`h2` (run 9): the strongest lead, and likely real.** The server did
  come back (`startServer` waits for its "listening" line, else the run
  throws), the page raised no error (`errors` ok in that run) and its frame
  loop kept running (later facts passed), yet it stayed "Reconnecting…" for
  at least 10 s and then through a second restart (13+ s more). With
  `reconnectMaxMs` 4000 and `silenceMs` 3000 (`content/net.json`) the page
  should try at least every ~4 s. So either the page stopped *trying*, or its
  attempts were not getting through (Chromium delays repeated failed WebSocket
  connections to one host; the page makes ~19 failed attempts in 75 s down).
  Next: record, in the check only (an init script wrapping `WebSocket` on
  page A), each socket's create/open/close/error times, print them in h1's
  text on failure, and probe `/healthz` from node at that moment. That tells
  "no attempts" (the client's loop: fix in `src/net/client.ts`) from
  "attempts that never open" (the browser: then a real iPhone matters, and
  the fix may be in how the page retries).
- **`cantina-row` / `cantina-swap` (3 runs): same symptom, a tap on a
  wandering regular opens nothing.** Lead to test: the page draws others a
  little behind the server (the smoother), regulars walk, and a tap counts
  within `pick.reach` 8 px (`content/cantina/*.json`) of where the *server*
  has the regular. A walking regular can be more than 8 px from where it is
  drawn, which would be a real fault (a friend tapping a moving regular
  misses), not a check fault. Next: log in the check the regular's drawn x,
  its speed and the server's x at the tap.
- **`t-throw-friend` (1 run):** B moved 19-29 px, not 0, so something moved B
  but not a full throw. The earlier notes (above) saw 5-30 px. Next: log B's
  path on both pages, the events the server emitted at the throw, and the
  bodies between B and the wall.
