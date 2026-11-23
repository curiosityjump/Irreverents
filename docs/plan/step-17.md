# Step 17 — A start screen, and saved games a friend can join

**Reference.** Plan step; its status line is in docs/plan.md.

## Why

**Owner, 2026-11-23 ~15:10 UTC, to Vision Partner, first-hand**
(`docs/vision.md`, "Frontiers" → "Start screen and saved games"):
> The game needs a start screen where players can start a new game, continue, join the same game, etc.
> If I hav ea saved game, i should be able to load it and have a friend join me in my saved game.

It settles part of the library's open O-004 (save ownership, drop-in/out):
a saved game is loaded by one player and friends join it.

## Goal

Opening the address on a phone shows a start screen. From it a player can
start a **new game**, **continue** a game this phone played before, **join a
friend's game** by its short code or shared link, or go to **everyone's
kingdom** (today's `main` world, unchanged). A game is kept on the server's
volume, so after a deploy or a restart, continuing it puts back what was done
to its world, and a friend can join it.

## The signal (re-runnable)

- `scripts/checks/step17-saves.ts`, in `npm run check`: a game's world is
  changed, every player leaves, the server is rebuilt on the same store
  directory, the game is continued: the change is still there. Control: a
  second, new code starts fresh.
- `npm run e2e`: a phone-sized page, by touch only, goes start screen → New
  game → in play; a second page joins with that page's code; both are in the
  same world.
- Live: `npm run check:live` and `npm run check:deployed` still pass;
  `/healthz` `storage.mounted` stays true (it was, 15:55 UTC).

## Stopping condition

The signal passes on `main` and live. Then the step closes; what the owner
says after playing it reopens or extends it.

## What's decided

- The owner's words above: new game, continue, join the same game, a friend
  joins my saved game.
- Saves live in the store (`src/server/store.ts`, on the Railway volume at
  `/data`, measured mounted and writable on live `/healthz`, 15:55 UTC). No
  accounts, no database (CLAUDE.md, "for friends, not strangers").
- `?room=<name>` keeps working exactly as today and skips the start screen:
  every scripted check uses it (`docs/mechanisms/network.md`, `INTENT:`
  scripted players never join the world people play in). Don't rename ids.
- `main` stays as it is (shared, never forgotten while the server runs,
  D-077), reachable from the start screen.
- iPhone first: every choice is a tap; typing a code uses the phone's own
  keyboard on a text field, never a hardware key.
- There is always a way out: from in play back to the start screen, and
  from every start-screen choice back to the start screen (`INTENT:`).

## `DRAFT:` choices, made so the other answer is small (decisions-log, 2026-11-23 "Step 17")

- A game is a world named by a **four-letter code** from letters that can't
  be misread (no I, O, L), shown to the player and shareable as a link
  `?game=<CODE>`. A shared link opens a one-tap "Join CODE" (the tap also
  unlocks sound).
- What a save keeps: the world's room state and every body that is not a
  player. Players come back in as they join today (at the start, their
  chosen hero). Reappearing where you left off is a later change.
- When it saves: every 30 s while anyone is in, and when the last player
  leaves. A save that no longer fits the content after a deploy (a room or
  kind gone) drops what doesn't fit, never refuses to load.
- Anyone with the code can continue or join a game (friends, no accounts).
- "Continue" lists the games this phone has played (kept in the phone's
  own storage, newest first); with none, it isn't shown.

## Open (for the owner, by playing; nothing waits on them)

- Should you come back exactly where you were standing, with what you
  carried?
- Should a friend be able to continue your game when you're not there?
- What else belongs on the start screen ("etc.")?

## Owns

New files: `src/client/start.ts` (the start screen), `src/server/saves.ts`
(saving and loading games), `scripts/checks/step17-*.ts`, `scenarios/step17-*.json`,
`scripts/e2e/start-screen.ts` if the e2e is split. Agreed small edits (Step 5
owns these paths and is holding; additive only): how `src/client/main.ts`
picks its world name, the page shell's menu (`src/client/shell.ts`: the code,
share, back to start), `src/server/game.ts`'s `makeWorld` and the last-player
leave, `src/server/main.ts` opening the store, `src/client/index.html`.

## Briefs

- `handoff-prompts/step-17-start-and-saves.md` (written 2026-11-23 16:00 UTC by orchestrator
  `session_017WiGzHhke4tkAThPgw6EXs`), held by builder `session_017WiGzGw7XaQ6tZNddFaa8s` (spawned 15:51 UTC).
- `handoff-prompts/step-17-saves-hardening.md` (17:25 UTC, pushes A-D from two independent reviews: 12 confirmed problems in push 1, 9 in push 2), same builder. **Push A (fdfa6b1, ab25e7a) reviewed 17:58 UTC**: build, check and e2e re-run at 904c3e9 (261 ok, e2e ok); live `/healthz` `store.lasting` true. Pushes 1 and 2 are reviewed as *working but not yet safe across builds*: B, D and C are owed.

## Builder notes

Step 17 builder `session_017WiGzGw7XaQ6tZNddFaa8s`, 2026-11-23.

- **Push 1 (saves, server).** `CLAUDE.md` "Architecture at a glance" says
  "Nothing is persisted": false from this push (saved games). Left for the
  orchestrator, as the brief says.
- Doubt: `/healthz` `store.collections` lists every game code opened since
  the start, so anyone reading `/healthz` can see live codes. The brief asked
  for `store.status()` there; friends, no accounts, so left as asked.
- Doubt: a game whose save knew a room keeps that room's bodies as saved,
  so a placement a later build adds to an *existing* room never appears in
  an existing save (only a wholly new room is filled). Small change in
  `saves.ts` `load` if the owner wants new things to show up in old games.
- Not verified on live: the SIGTERM save at a real Railway deploy (verified
  locally against `dist/server.cjs` with a tmpfs as the "volume": killed with
  a player in, the save was written at the kill).
- **Push 2 (start screen).** Not verified: a real iPhone or Safari (nobody
  here can run one): the text field's keyboard, `navigator.share`'s sheet,
  and the pixel font on a real screen. Headless iPhone 14 emulation only.
- Doubt: in `?tune` pages sideways the tune panel's open button can sit
  over the top-left menu button; the tune button is above it (z-index), so
  the menu is unreachable there until the panel is moved. Dev page only.
- `start-back.png` in `e2e-out/` can catch the plain-text fallback for a
  moment after the reload, before the font image loads; intended fallback.
- **Hardening push A** (`handoff-prompts/step-17-saves-hardening.md`).
  Not settled: Railway's time between SIGTERM and SIGKILL. railway.com and
  docs.railway.com do not resolve from the builder's container, so the
  draining key was not verified and nothing unverified went into
  `railway.json`; asked the orchestrator. The stop-save is measured on live
  after the push through `GET /game/<CODE>` `savedAt`.
- The set-aside report carries the throw's first stack line, a path inside
  the built server (`dist/server.cjs:<line>`): code, not personal data.
