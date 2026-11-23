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
- **Landscape, with a plain "turn your phone" screen in portrait.**
  Orientation is open in the library; this is `DRAFT:`.
- **The owner's cantina tap rule is a control anchor** for later (doc 33:
  tap a roaming character, then tap the party member to replace; attack
  is distinct from tap). Don't build the cantina; don't make a layout
  that rules it out.
- **Presence:** each player has a colour or mark; a friend off-screen or
  in another room is indicated at the screen edge; joining and leaving
  are visible.
- **It mends itself:** a lost socket, a slept tab, a network change all
  end with the player back in the world, same character, without a
  reload. While mending, the screen says so.
- **There is always a way out:** a small menu, reachable by touch, with at
  least "I'm stuck" (back to the room's entrance) and a way to leave.
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
2. `npm run e2e`, iPhone-sized landscape viewports (at least 667×375 and
   844×390): no control sits under a safe-area inset or off-screen; run
   and jump at once by two touches; screenshots read back by the lead and
   compared against each other (rung 5 of
   `docs/verifying-and-finishing.md`).
3. Mending: the script cuts the socket, and separately hides and shows the
   page; each time the player is back in the world within ten seconds as
   the same character, with no reload.
4. With 150 ms of delay each way and a few dropped messages injected, two
   players still see each other move without teleporting across the room.
5. `npm run check:live` passes and `npm run gates` reports gate F as
   passing.

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

## Measure

## Briefs

## Open with the owner

## Handoff notes
