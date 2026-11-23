# Saved games: a world that is kept, and a friend who joins it

**Reference.** Open before touching `src/server/saves.ts`, `makeWorld` or
the last-player leave in `src/server/game.ts`, the store lines and
`/game/<CODE>` in `src/server/main.ts`, or `scripts/checks/step17-saves.ts`.
Written by the Step 17 builder (2026-11-23). The step and its `DRAFT:`
choices: `docs/plan/step-17.md`.

## Why it is shaped this way

The owner: *"If I have a saved game, I should be able to load it and have a
friend join me in my saved game."* There are no accounts (friends, not
strangers), so a game is found by a short **code** anyone holding it can
use. A game is a world like any other on the server (`docs/mechanisms/network.md`,
"Worlds"); only its name says it is kept.

## The pieces

- **A game is the world `game-<CODE>`**, CODE four letters from
  `ABCDEFGHJKMNPQRSTUVWXYZ` (no I, L, O; `DRAFT:`, `GAME_LETTERS` in
  `saves.ts`). Any other world name (`main`, `?room=…`, `game-abc`) is not a
  game and behaves exactly as before. An unknown code is a new game.
- **The record.** One store collection per game, `save-<code in lower
  case>`, holding exactly one record (written with `replaceAll`):
  `{ version: 1, code, savedAt, commit, rooms, world }`. `world` is the
  `World` with every player's character taken out; `rooms` lists the
  content rooms the writing build had. `INTENT:` a contract once on the
  volume: add fields, never rename.
- **When it is saved:** every `SAVE_EVERY_MS` (30 s, `DRAFT:`) while anyone
  is in it (the server's tick loop), when its last player is removed (a
  `bye`, or `staleSeconds` after the socket went), and for every game being
  played when the process gets SIGTERM or SIGINT (a deploy stops the old
  server: `src/server/main.ts`). After the last-player save the world is
  forgotten in memory like any private world.
- **Loading** is in `makeWorld`, the one place a world is created: a game
  with a save is built from it; content's placements are added only in
  rooms the save never knew (a room a later build added). **What no longer
  fits is dropped, never refused** (`INTENT:`): a body whose room is gone,
  or whose kind is neither a character nor a bodiless `~` thing, and the
  state of a room that is gone. The drop is said once per load, as a
  `server` line in `GET /debug/errors` (no code in it: no personal data).
  A player character in an old record is never loaded.
- **Does it exist?** `GET /game/<CODE>` answers `{ code, valid, exists }`
  (the code upper-cased): `exists` is true while it is being played or when
  it has a save. For the start screen's "Join a friend".
- **`/healthz` `store`** is `store.status()`: whether records last, where,
  each open collection's size (so the codes of games opened since the
  start), and any problem.
- **The store itself** (`src/server/store.ts`, `docs/architecture.md`
  "Lasting records: the store"): on the Railway volume when
  `storage.mounted`, else in memory (a local `npm run dev` keeps games until
  it stops).

## What a save does not keep (`DRAFT:`, the owner decides by playing)

Where each player stood and what they carried (they come back in at the
start, as on any join); a world's `?tune` numbers; `main` (it is never
forgotten while the server runs, D-077, and is not saved). Old saves are
never deleted.

## Proof

`scripts/checks/step17-saves.ts`, in `npm run check` (about 2 s): a store
in a temporary directory; a game gets a room part's state and a moved body;
its player leaves; the save on disk has one record and no player; a new
server on the same directory: joining the game again has both, and only the
new player. Control in the same check: a second, new code has neither. A
record from an "older build" naming a gone room and a gone kind (and a
player) loads without them, said exactly once. Control watched to fail
(2026-11-23): `save` made to do nothing, the check named four failures (no
file, no "exists", the part state and the body's place gone).

## Traps

- **A deploy is a restart.** The new build loads what the old one wrote:
  test any change to the record or to content ids against an old record.
- `has(code)` opens the code's collection, so asking about a code adds it
  (size 0) to `/healthz`'s list until the server restarts.
- The tick loop keeps simulating a game while it has players, even all
  away; it is saved and forgotten only once the last is removed.
